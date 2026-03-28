<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Requests\Storefront\CheckoutRequest;
use App\Models\Business;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Services\Payments\PaymentGatewayFactory;
use App\Services\Payments\VerificationResult;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class CheckoutController extends Controller
{
    /**
     * Process the checkout: create order, initialize payment, redirect to provider.
     */
    public function store(CheckoutRequest $request, Business $business): HttpResponse
    {
        abort_unless($business->is_active, 404);
        abort_unless($business->default_payment_provider, 400, 'Payment is not configured for this store.');

        $validated = $request->validated();

        $itemsInput = collect($validated['items']);
        $productIds = $itemsInput->pluck('id')->all();
        $products = Product::whereIn('id', $productIds)
            ->where('business_id', $business->id)
            ->where('is_active', true)
            ->get()
            ->keyBy('id');

        abort_if($products->count() !== count($productIds), 422, 'Some products are no longer available.');

        $total = 0;
        $orderItems = [];

        foreach ($itemsInput as $item) {
            $product = $products->get($item['id']);
            $quantity = (int) $item['quantity'];
            $subtotal = (float) $product->price * $quantity;
            $total += $subtotal;

            $orderItems[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'unit_price' => $product->price,
                'quantity' => $quantity,
                'subtotal' => $subtotal,
            ];
        }

        $reference = Str::random(24);

        $orderId = $this->generateOrderId();

        $customerId = isset($validated['customer_id'])
            ? Customer::withoutGlobalScopes()
                ->where('id', $validated['customer_id'])
                ->where('business_id', $business->id)
                ->value('id')
            : null;

        $order = DB::transaction(function () use ($business, $validated, $total, $orderItems, $reference, $orderId, $customerId): Order {
            $order = Order::withoutGlobalScopes()->create([
                'business_id' => $business->id,
                'customer_id' => $customerId,
                'order_id' => $orderId,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'total' => $total,
                'currency' => 'GHS',
                'status' => OrderStatus::Pending,
                'payment_ref' => $reference,
                'payment_provider' => $business->default_payment_provider,
                'source' => 'storefront',
            ]);

            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            Payment::withoutGlobalScopes()->create([
                'business_id' => $business->id,
                'order_id' => $order->id,
                'customer_id' => $customerId,
                'gateway' => $business->default_payment_provider,
                'reference' => $reference,
                'amount' => $total,
                'currency' => 'GHS',
                'status' => PaymentStatus::Pending,
            ]);

            return $order;
        });

        $factory = app(PaymentGatewayFactory::class);
        $gateway = $factory->make($business);
        $callback = url("/s/{$business->slug}/checkout/callback");

        $result = $gateway->initialize($order, $business, $callback);

        return Inertia::location($result->redirectUrl);
    }

    /**
     * Handle provider redirect back after payment attempt.
     */
    public function callback(Request $request, Business $business): RedirectResponse
    {
        // Paystack: ?reference=... or ?trxref=...
        // Junipay:  ?foreignID=... (our merchant ref), optionally ?trans_id=...
        $reference = $request->query('reference')
            ?? $request->query('trxref')
            ?? $request->query('foreignID');

        if (! $reference) {
            return redirect("/s/{$business->slug}/checkout")->with('error', 'Invalid payment callback.');
        }

        $payment = Payment::withoutGlobalScopes()
            ->where('reference', $reference)
            ->where('business_id', $business->id)
            ->first();

        if (! $payment) {
            return redirect("/s/{$business->slug}/checkout")->with('error', 'Payment not found.');
        }

        if ($payment->isSuccessful()) {
            return redirect("/s/{$business->slug}/checkout/success?ref={$reference}");
        }

        $factory = app(PaymentGatewayFactory::class);
        $gateway = $factory->make($business);

        // Junipay callback may include their transaction id for status lookup
        $providerTxnId = $request->query('trans_id')
            ?? $request->query('transID');

        try {
            $result = $gateway->verify($reference, $business, $providerTxnId);
        } catch (\Throwable $e) {
            Log::error('Payment verification failed', [
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);

            return redirect("/s/{$business->slug}/checkout")->with('error', 'Payment verification failed. Please contact the store.');
        }

        $this->processVerification($payment, $result);

        if ($payment->isSuccessful()) {
            return redirect("/s/{$business->slug}/checkout/success?ref={$reference}");
        }

        return redirect("/s/{$business->slug}/checkout")->with('error', 'Payment was not successful. Please try again.');
    }

    /**
     * Webhook endpoint — server-to-server from payment provider.
     *
     * Paystack: HMAC-verified, reference in $data['data']['reference'].
     * Junipay:  Shape-validated (no HMAC), foreignID = our ref, trans_id = theirs.
     *           Real trust comes from the mandatory verify() call, not the webhook gate.
     */
    public function webhook(Request $request, Business $business): HttpResponse
    {
        $factory = app(PaymentGatewayFactory::class);

        try {
            $gateway = $factory->make($business);
        } catch (\Throwable) {
            return response()->json(['status' => 'ignored'], 200);
        }

        $secret = DB::table('businesses')
            ->where('id', $business->id)
            ->value($business->default_payment_provider === 'paystack' ? 'paystack_secret' : 'junipay_secret');

        $decryptedSecret = $secret ? Crypt::decryptString($secret) : '';

        if (! $gateway->verifyWebhookSignature($request, $decryptedSecret)) {
            Log::warning('Webhook signature verification failed', [
                'business_id' => $business->id,
                'ip' => $request->ip(),
            ]);

            return response()->json(['status' => 'invalid signature'], 400);
        }

        $data = $request->all();

        // Junipay sends foreignID (our ref) + trans_id (theirs) at top level.
        // Paystack nests reference inside data.data.reference.
        if ($business->default_payment_provider === 'junipay') {
            $reference = $data['foreignID'] ?? null;
            $providerTxnId = $data['trans_id'] ?? null;
        } else {
            $reference = $data['data']['reference'] ?? null;
            $providerTxnId = null;
        }

        if (! $reference) {
            return response()->json(['status' => 'no reference'], 200);
        }

        $payment = Payment::withoutGlobalScopes()
            ->where('reference', $reference)
            ->where('business_id', $business->id)
            ->first();

        if (! $payment || $payment->isSuccessful()) {
            return response()->json(['status' => 'ok'], 200);
        }

        try {
            $result = $gateway->verify($reference, $business, $providerTxnId);
            $this->processVerification($payment, $result);
        } catch (\Throwable $e) {
            Log::error('Webhook verification failed', [
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json(['status' => 'ok'], 200);
    }

    /**
     * Show the checkout success page.
     */
    public function success(Request $request, Business $business): Response
    {
        abort_unless($business->is_active, 404);

        $reference = $request->query('ref');
        $order = null;

        if ($reference) {
            $order = Order::withoutGlobalScopes()
                ->where('payment_ref', $reference)
                ->where('business_id', $business->id)
                ->with('items')
                ->first();
        }

        $business->load(['pages' => fn ($q) => $q->published()]);

        return Inertia::render('Storefront/CheckoutSuccess', [
            'business' => $business,
            'order' => $order,
            'pages' => $business->pages,
        ]);
    }

    // -------------------------------------------------------------------------
    // Private
    // -------------------------------------------------------------------------

    /**
     * Generate a unique, human-readable order code.
     */
    private function generateOrderId(): string
    {
        do {
            $orderId = strtoupper(Str::random(10));
        } while (Order::withoutGlobalScopes()->where('order_id', $orderId)->exists());

        return $orderId;
    }

    /**
     * Update payment and order records based on verification result.
     */
    private function processVerification(Payment $payment, VerificationResult $result): void
    {
        if ($result->successful) {
            $expectedMinor = (int) ($payment->amount * 100);

            if ($result->amountInMinorUnit !== $expectedMinor) {
                Log::warning('Payment amount mismatch', [
                    'reference' => $result->reference,
                    'expected' => $expectedMinor,
                    'received' => $result->amountInMinorUnit,
                ]);
                $payment->update([
                    'status' => PaymentStatus::Failed,
                    'metadata' => $result->metadata,
                ]);

                return;
            }

            $now = now();

            $payment->update([
                'status' => PaymentStatus::Success,
                'transaction_id' => $result->transactionId,
                'paid_at' => $now,
                'metadata' => $result->metadata,
            ]);

            $payment->order()->update([
                'status' => OrderStatus::Paid,
                'paid_at' => $now,
            ]);
        } else {
            $payment->update([
                'status' => PaymentStatus::Failed,
                'metadata' => $result->metadata,
            ]);
        }
    }
}
