<?php

namespace App\Services\Subscription;

use App\Models\Business;
use App\Models\SubscriptionInvoice;
use App\Services\Payments\PaystackGateway;
use App\Services\Payments\VerificationResult;
use DomainException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Idempotent activator for a successful subscription charge. Mirrors the
 * locked-update pattern proven in PaymentVerificationService so callers
 * (the success-callback redirect, the webhook, the manual replay command)
 * cannot double-activate even when racing.
 *
 * Two modes:
 *  - auto (default): Paystack created a recurring subscription; we just
 *    record the charge and let `subscription.create` webhooks fill in the
 *    subscription_id later.
 *  - manual: no Paystack subscription exists. If the business has a
 *    leftover subscription_id from a previous card sub (pay-now-to-restore
 *    after past_due), we disable it on Paystack and clear the linkage so
 *    the customer is unambiguously a manual subscriber going forward.
 */
final class SubscriptionActivation
{
    public function __construct(
        private readonly PaystackGateway $gateway,
    ) {}

    public function activate(string $reference, VerificationResult $result): SubscriptionInvoice
    {
        return DB::transaction(function () use ($reference, $result): SubscriptionInvoice {
            /** @var SubscriptionInvoice $invoice */
            $invoice = SubscriptionInvoice::query()
                ->where('reference', $reference)
                ->lockForUpdate()
                ->firstOrFail();

            if ($invoice->isPaid()) {
                return $invoice;
            }

            $expectedMinor = (int) round((float) $invoice->amount * 100);
            if ($result->amountInMinorUnit !== $expectedMinor) {
                throw new DomainException(
                    "Amount mismatch for invoice {$reference}: expected {$expectedMinor}, got {$result->amountInMinorUnit}"
                );
            }

            /** @var Business $business */
            $business = $invoice->business()->lockForUpdate()->firstOrFail();

            $now = Carbon::now();

            // Renewal extends from the existing period_end so paying a
            // few days early doesn't burn those days. First-time
            // activation (no period_end yet) starts from now.
            $periodStart = $business->current_period_end !== null && $business->current_period_end->isFuture()
                ? $business->current_period_end
                : $now;
            $periodEnd = $periodStart->copy()->addMonth();

            $invoice->forceFill([
                'status' => SubscriptionInvoice::STATUS_PAID,
                'paid_at' => $now,
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
                'provider_transaction_id' => $result->transactionId !== '' ? $result->transactionId : $invoice->provider_transaction_id,
            ])->save();

            $isManual = ($invoice->metadata['mode'] ?? SubscriptionCheckout::MODE_AUTO) === SubscriptionCheckout::MODE_MANUAL;

            $business->setTier(
                $invoice->tier,
                null,
                "Paystack subscription charge {$reference}",
            );

            $update = [
                'subscription_status' => Business::SUBSCRIPTION_STATUS_ACTIVE,
                'current_period_end' => $periodEnd,
            ];

            if ($isManual) {
                $this->disableLegacySubscription($business);
                $update['subscription_id'] = null;
                $update['paystack_email_token'] = null;
            }

            $customerId = $result->metadata['customer']['customer_code']
                ?? $result->metadata['customer']['code']
                ?? null;
            if (is_string($customerId) && $customerId !== '' && $business->subscription_customer_id === null) {
                $update['subscription_customer_id'] = $customerId;
            }

            $business->update($update);

            return $invoice->refresh();
        });
    }

    /**
     * When a past_due card user pays via the manual lane to restore
     * access, Paystack still has the broken subscription on file. Disable
     * it so it never tries to retry on us. Failure is logged but not
     * fatal: our DB is the source of truth, and the subscription is
     * already broken on Paystack's side.
     */
    private function disableLegacySubscription(Business $business): void
    {
        $code = $business->subscription_id;
        $token = $business->paystack_email_token;

        if (! is_string($code) || $code === '' || ! is_string($token) || $token === '') {
            return;
        }

        try {
            $this->gateway->disableSubscription($code, $token);
        } catch (Throwable $e) {
            Log::warning('Failed to disable legacy Paystack subscription on manual restore', [
                'business_id' => $business->id,
                'subscription_id' => $code,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
