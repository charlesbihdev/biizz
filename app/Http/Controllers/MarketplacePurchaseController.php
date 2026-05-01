<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Buyer;
use App\Models\MarketplacePayment;
use App\Models\MarketplacePurchase;
use App\Models\Product;
use App\Notifications\MarketplacePurchaseNotification;
use App\Services\Payments\PaystackGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class MarketplacePurchaseController extends Controller
{
    /**
     * Initiate or complete a marketplace purchase.
     * Free products are granted immediately. Paid products redirect to Paystack.
     */
    public function store(Request $request, Business $business, Product $product): JsonResponse|RedirectResponse|HttpResponse
    {
        abort_unless($business->business_type === 'digital' && $business->is_active, 404);
        abort_unless($product->is_active && $product->business_id === $business->id, 404);

        /** @var Buyer|null $user */
        $user = Auth::guard('buyer')->user();

        if (! $user) {
            return to_route('marketplace.login');
        }

        // Prevent duplicate purchases
        $existing = MarketplacePurchase::where('buyer_id', $user->id)
            ->where('product_id', $product->id)
            ->whereIn('status', ['paid', 'free'])
            ->first();

        if ($existing) {
            return to_route('marketplace.library.index')
                ->with('info', 'You already own this product.');
        }

        $price = (float) $product->price;

        // Free product — skip payment
        if ($price <= 0) {
            $purchase = MarketplacePurchase::create([
                'business_id' => $business->id,
                'buyer_id' => $user->id,
                'product_id' => $product->id,
                'amount_paid' => 0,
                'status' => 'free',
                'paid_at' => now(),
            ]);

            $user->notify(new MarketplacePurchaseNotification($purchase->load('product.images')));

            return to_route('marketplace.library.index')
                ->with('success', 'Your product is now available in your library.');
        }

        // Paid product — clean up any stale pending record, create fresh one + payment record
        MarketplacePurchase::where('buyer_id', $user->id)
            ->where('product_id', $product->id)
            ->where('status', 'pending')
            ->delete();

        $reference = Str::random(24);

        $purchase = MarketplacePurchase::create([
            'business_id' => $business->id,
            'buyer_id' => $user->id,
            'product_id' => $product->id,
            'amount_paid' => $price,
            'payment_ref' => $reference,
            'status' => 'pending',
        ]);

        MarketplacePayment::create([
            'business_id' => $business->id,
            'marketplace_purchase_id' => $purchase->id,
            'gateway' => 'paystack',
            'reference' => $reference,
            'amount' => $price,
            'currency' => 'GHS',
            'status' => 'pending',
        ]);

        try {
            $gateway = new PaystackGateway((string) config('services.paystack.secret'));
            $callback = route('marketplace.purchase.callback');
            $result = $gateway->initializeForPurchase(
                email: $user->email,
                amountInPesewas: (int) ($price * 100),
                reference: $reference,
                callbackUrl: $callback,
                currency: 'GHS',
                metadata: ['product_id' => $product->id, 'buyer_id' => $user->id],
            );
        } catch (\Throwable $e) {
            Log::error('Marketplace payment initialization failed', [
                'product_id' => $product->id,
                'user_id' => $user->id,
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);

            return to_route('marketplace.product', ['business' => $business->slug, 'product' => $product->slug])
                ->with('error', 'Payment could not be started. Please try again.');
        }

        return Inertia::location($result->redirectUrl);
    }

    /**
     * Handle Paystack redirect back after the buyer completes (or cancels) payment.
     */
    public function callback(Request $request): RedirectResponse
    {
        $reference = $request->query('reference') ?? $request->query('trxref');

        if (! $reference) {
            return to_route('marketplace.index')->with('error', 'Invalid payment callback.');
        }

        ['status' => $status, 'purchase' => $purchase] = $this->confirmPaid($reference);

        if ($status === 'not_found') {
            return to_route('marketplace.index')->with('error', 'Purchase record not found.');
        }

        if ($status === 'already_paid') {
            return to_route('marketplace.library.index')
                ->with('info', 'You already own this product.');
        }

        if ($status === 'paid') {
            return to_route('marketplace.library.index')
                ->with('success', 'Payment confirmed! Your product is now in your library.');
        }

        $productRoute = [
            'business' => $purchase->product->business->slug,
            'product' => $purchase->product->slug,
        ];

        if ($status === 'error') {
            return to_route('marketplace.product', $productRoute)
                ->with('error', 'Payment verification failed. Please contact support.');
        }

        return to_route('marketplace.product', $productRoute)
            ->with('error', 'Payment was not successful. Please try again.');
    }

    /**
     * Server-to-server webhook from Paystack — HMAC verified, no session/redirect.
     */
    public function webhook(Request $request): HttpResponse
    {
        $secret = (string) config('services.paystack.secret');
        $signature = $request->header('x-paystack-signature');

        if (! $signature || ! hash_equals(hash_hmac('sha512', $request->getContent(), $secret), $signature)) {
            Log::warning('Marketplace webhook: invalid Paystack signature', ['ip' => $request->ip()]);

            return response()->json(['status' => 'invalid signature'], 400);
        }

        $reference = $request->input('data.reference');

        if (! $reference) {
            return response()->json(['status' => 'no reference'], 200);
        }

        $this->confirmPaid($reference);

        return response()->json(['status' => 'ok'], 200);
    }

    /**
     * Verify a marketplace payment and flip the purchase to paid.
     *
     * Two-layer idempotency:
     *  1. Cheap pre-check (no lock) — if already paid, return early without
     *     opening a transaction or calling Paystack. Handles webhook retries
     *     and the typical "browser arrives 2s after webhook" case.
     *  2. Locked re-check inside DB::transaction + lockForUpdate — catches the
     *     millisecond race where two callers both pass step 1.
     *
     * @return array{status: 'not_found'|'already_paid'|'paid'|'failed'|'error', purchase: ?MarketplacePurchase}
     */
    private function confirmPaid(string $reference): array
    {
        $cached = MarketplacePurchase::where('payment_ref', $reference)
            ->first(['id', 'status']);

        if ($cached && $cached->status === 'paid') {
            return ['status' => 'already_paid', 'purchase' => $cached];
        }

        return DB::transaction(function () use ($reference) {
            $purchase = MarketplacePurchase::with('product.business', 'payment', 'buyer')
                ->where('payment_ref', $reference)
                ->lockForUpdate()
                ->first();

            if (! $purchase) {
                return ['status' => 'not_found', 'purchase' => null];
            }

            if ($purchase->status === 'paid') {
                return ['status' => 'already_paid', 'purchase' => $purchase];
            }

            try {
                $gateway = new PaystackGateway((string) config('services.paystack.secret'));
                $result = $gateway->verify($reference, $purchase->product->business);
            } catch (\Throwable $e) {
                Log::error('Marketplace payment verification failed', [
                    'reference' => $reference,
                    'error' => $e->getMessage(),
                ]);

                return ['status' => 'error', 'purchase' => $purchase];
            }

            $expectedMinorUnit = (int) ($purchase->amount_paid * 100);

            if (! $result->successful || $result->amountInMinorUnit !== $expectedMinorUnit) {
                $purchase->payment?->update(['status' => 'failed', 'metadata' => $result->metadata]);

                return ['status' => 'failed', 'purchase' => $purchase];
            }

            $now = now();

            $purchase->update(['status' => 'paid', 'paid_at' => $now]);

            $purchase->payment?->update([
                'status' => 'success',
                'transaction_id' => $result->transactionId,
                'metadata' => $result->metadata,
                'paid_at' => $now,
            ]);

            $purchase->buyer->notify(new MarketplacePurchaseNotification($purchase->load('product.images')));

            return ['status' => 'paid', 'purchase' => $purchase];
        });
    }
}
