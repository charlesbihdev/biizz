<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StartSubscriptionCheckoutRequest;
use App\Models\Business;
use App\Models\SubscriptionInvoice;
use App\Services\Payments\PaystackGateway;
use App\Services\Subscription\SubscriptionActivation;
use App\Services\Subscription\SubscriptionCancellation;
use App\Services\Subscription\SubscriptionCheckout;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use Throwable;

/**
 * The SaaS-standard "Billing" surface. Owns the upgrade/cancel/resume
 * orchestration; the heavy lifting lives in the App\Services\Subscription
 * services so each method here stays thin and testable.
 */
class BillingController extends Controller
{
    public function show(Business $business): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $invoices = $business->subscriptionInvoices()
            ->latest('created_at')
            ->limit(12)
            ->get([
                'id',
                'reference',
                'tier',
                'amount',
                'currency',
                'status',
                'paid_at',
                'period_start',
                'period_end',
                'created_at',
            ]);

        return Inertia::render('Admin/Billing/Index', [
            'business' => $business,
            'currency' => config('biizz.currency'),
            'invoices' => $invoices,
        ]);
    }

    public function checkout(
        StartSubscriptionCheckoutRequest $request,
        Business $business,
        SubscriptionCheckout $checkout,
    ): HttpResponse|RedirectResponse {
        try {
            $result = $checkout->start($business, $request->targetTier(), $request->user());
        } catch (Throwable $e) {
            Log::error('Subscription checkout init failed', [
                'business_id' => $business->id,
                'target' => $request->targetTier()->value,
                'error' => $e->getMessage(),
            ]);

            return to_route('businesses.billing.show', $business)
                ->with('error', "We couldn't start checkout. Please try again.");
        }

        return Inertia::location($result->redirectUrl);
    }

    public function callback(
        Business $business,
        Request $request,
        PaystackGateway $gateway,
        SubscriptionActivation $activation,
    ): RedirectResponse {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $reference = (string) $request->query('reference', '');

        if ($reference === '') {
            return to_route('businesses.billing.show', $business)
                ->with('error', 'Checkout cancelled.');
        }

        $invoice = SubscriptionInvoice::query()
            ->where('reference', $reference)
            ->where('business_id', $business->id)
            ->first();

        if (! $invoice) {
            return to_route('businesses.billing.show', $business)
                ->with('error', "We couldn't find that checkout. Please try again.");
        }

        if ($invoice->isPaid()) {
            return to_route('businesses.billing.show', $business)
                ->with('success', "You're now on {$invoice->tier->label()}.");
        }

        try {
            $verification = $gateway->verify($reference, $business);
        } catch (Throwable $e) {
            Log::error('Subscription verify failed', ['reference' => $reference, 'error' => $e->getMessage()]);

            return to_route('businesses.billing.show', $business)
                ->with('error', "We couldn't confirm your payment. We'll retry automatically — please check back shortly.");
        }

        if (! $verification->successful) {
            return to_route('businesses.billing.show', $business)
                ->with('error', 'Payment was not completed. You have not been charged.');
        }

        try {
            $activation->activate($reference, $verification);
        } catch (Throwable $e) {
            Log::error('Subscription activation failed', ['reference' => $reference, 'error' => $e->getMessage()]);

            return to_route('businesses.billing.show', $business)
                ->with('error', 'Payment received but activation hit an issue. Support is on it.');
        }

        return to_route('businesses.billing.show', $business)
            ->with('success', "Welcome to {$invoice->tier->label()}.");
    }

    public function cancel(Business $business, SubscriptionCancellation $cancellation): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        try {
            $cancellation->cancelAtPeriodEnd($business);
        } catch (DomainException $e) {
            return to_route('businesses.billing.show', $business)
                ->with('error', $e->getMessage());
        }

        $until = $business->fresh()->current_period_end?->toFormattedDayDateString();

        return to_route('businesses.billing.show', $business)
            ->with('success', $until
                ? "Cancelled. You keep your plan until {$until}, then move to Free."
                : 'Cancelled. You will move to Free at the end of your current period.');
    }

    public function resume(Business $business, SubscriptionCancellation $cancellation): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        try {
            $cancellation->resume($business);
        } catch (DomainException $e) {
            return to_route('businesses.billing.show', $business)
                ->with('error', $e->getMessage());
        }

        return to_route('businesses.billing.show', $business)
            ->with('success', 'Your plan will keep renewing.');
    }
}
