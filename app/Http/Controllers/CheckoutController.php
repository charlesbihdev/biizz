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

        // ── Recalculate total from DB — never trust frontend prices ──
        $itemsInput = collect($validated['items']);
        $productIds = $itemsInput->pluck('id')->all();
        $products   = Product::whereIn('id', $productIds)
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
                'product_id'   => $product->id,
                'product_name' => $product->name,
                'unit_price'   => $product->price,
                'quantity'     => $quantity,
                'subtotal'     => $subtotal,
            ];
        }

        // ── Create order + payment in a transaction ──
        $reference = 'BIZ-' . strtoupper(Str::random(20));

        $order = DB::transaction(function () use ($business, $validated, $total, $orderItems, $reference): Order {
            // Find-or-create customer by email within this business
            $customer = Customer::withoutGlobalScopes()
                ->firstOrCreate(
                    ['business_id' => $business->id, 'email' => $validated['customer_email']],
                    ['name' => $validated['customer_name'], 'phone' => $validated['customer_phone']],
                );

            $order = Order::withoutGlobalScopes()->create([
                'business_id'      => $business->id,
                'customer_id'      => $customer->id,
                'customer_name'    => $validated['customer_name'],
                'customer_email'   => $validated['customer_email'],
                'customer_phone'   => $validated['customer_phone'],
                'total'            => $total,
                'currency'         => 'GHS',
                'status'           => OrderStatus::Pending,
                'payment_ref'      => $reference,
                'payment_provider' => $business->default_payment_provider,
                'source'           => 'storefront',
            ]);

            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            Payment::withoutGlobalScopes()->create([
                'business_id'  => $business->id,
                'order_id'     => $order->id,
                'customer_id'  => $customer->id,
                'gateway'      => $business->default_payment_provider,
                'reference'    => $reference,
                'amount'       => $total,
                'currency'     => 'GHS',
                'status'       => PaymentStatus::Pending,
            ]);

            return $order;
        });

        // ── Initialize payment with gateway ──
        $factory  = app(PaymentGatewayFactory::class);
        $gateway  = $factory->make($business);
        $callback = url("/s/{$business->slug}/checkout/callback");

        $result = $gateway->initialize($order, $business, $callback);

        // External redirect — Inertia::location() does a full page redirect
        return Inertia::location($result->redirectUrl);
    }

    /**
     * Handle provider redirect back after payment attempt.
     */
    public function callback(Request $request, Business $business): RedirectResponse
    {
        // Paystack sends ?reference=..., Junipay may use ?foreignID=...
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

        // Idempotent — already verified
        if ($payment->isSuccessful()) {
            return redirect("/s/{$business->slug}/checkout/success?ref={$reference}");
        }

        // Verify with gateway
        $factory = app(PaymentGatewayFactory::class);
        $gateway = $factory->make($business);

        try {
            $result = $gateway->verify($reference, $business);
        } catch (\Throwable $e) {
            Log::error('Payment verification failed', [
                'reference' => $reference,
                'error'     => $e->getMessage(),
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
     */
    public function webhook(Request $request, Business $business): HttpResponse
    {
        $factory = app(PaymentGatewayFactory::class);

        try {
            $gateway = $factory->make($business);
        } catch (\Throwable) {
            return response()->json(['status' => 'ignored'], 200);
        }

        // Verify webhook signature
        $secret = DB::table('businesses')
            ->where('id', $business->id)
            ->value($business->default_payment_provider === 'paystack' ? 'paystack_secret' : 'junipay_secret');

        $decryptedSecret = $secret ? Crypt::decryptString($secret) : '';

        if (! $gateway->verifyWebhookSignature($request, $decryptedSecret)) {
            Log::warning('Webhook signature verification failed', [
                'business_id' => $business->id,
                'ip'          => $request->ip(),
            ]);

            return response()->json(['status' => 'invalid signature'], 400);
        }

        // Extract reference from webhook payload
        $data      = $request->all();
        $reference = $data['data']['reference']     // Paystack
            ?? $data['foreignID']                    // Junipay
            ?? null;

        if (! $reference) {
            return response()->json(['status' => 'no reference'], 200);
        }

        $payment = Payment::withoutGlobalScopes()
            ->where('reference', $reference)
            ->where('business_id', $business->id)
            ->first();

        if (! $payment || $payment->isSuccessful()) {
            return response()->json(['status' => 'ok'], 200); // idempotent
        }

        try {
            $result = $gateway->verify($reference, $business);
            $this->processVerification($payment, $result);
        } catch (\Throwable $e) {
            Log::error('Webhook verification failed', [
                'reference' => $reference,
                'error'     => $e->getMessage(),
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
        $order     = null;

        if ($reference) {
            $order = Order::withoutGlobalScopes()
                ->where('payment_ref', $reference)
                ->where('business_id', $business->id)
                ->with('items')
                ->first();
        }

        $business->load(['pages' => fn($q) => $q->published()]);

        return Inertia::render('Storefront/CheckoutSuccess', [
            'business' => $business,
            'order'    => $order,
            'pages'    => $business->pages,
        ]);
    }

    // -------------------------------------------------------------------------
    // Private
    // -------------------------------------------------------------------------

    /**
     * Update payment and order records based on verification result.
     */
    private function processVerification(Payment $payment, \App\Services\Payments\VerificationResult $result): void
    {
        if ($result->successful) {
            // Amount verification — provider amount must match order total (in pesewas)
            $expectedMinor = (int) ($payment->amount * 100);

            if ($result->amountInMinorUnit !== $expectedMinor) {
                Log::warning('Payment amount mismatch', [
                    'reference' => $result->reference,
                    'expected'  => $expectedMinor,
                    'received'  => $result->amountInMinorUnit,
                ]);
                $payment->update([
                    'status'   => PaymentStatus::Failed,
                    'metadata' => $result->metadata,
                ]);

                return;
            }

            $now = now();

            $payment->update([
                'status'         => PaymentStatus::Success,
                'transaction_id' => $result->transactionId,
                'paid_at'        => $now,
                'metadata'       => $result->metadata,
            ]);

            // Update the order
            $payment->order()->update([
                'status'  => OrderStatus::Paid,
                'paid_at' => $now,
            ]);
        } else {
            $payment->update([
                'status'   => PaymentStatus::Failed,
                'metadata' => $result->metadata,
            ]);
        }
    }
}
