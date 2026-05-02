<?php

namespace App\Services\Subscription;

use App\Models\Business;
use App\Models\SubscriptionInvoice;
use App\Services\Payments\VerificationResult;
use DomainException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Idempotent activator for a successful subscription charge. Mirrors the
 * locked-update pattern proven in PaymentVerificationService so callers
 * (the success-callback redirect, the webhook, the manual replay command)
 * cannot double-activate even when racing.
 */
final class SubscriptionActivation
{
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

            $now = Carbon::now();
            $periodEnd = $now->copy()->addMonth();

            $invoice->forceFill([
                'status' => SubscriptionInvoice::STATUS_PAID,
                'paid_at' => $now,
                'period_start' => $now,
                'period_end' => $periodEnd,
                'provider_transaction_id' => $result->transactionId !== '' ? $result->transactionId : $invoice->provider_transaction_id,
            ])->save();

            /** @var Business $business */
            $business = $invoice->business()->lockForUpdate()->firstOrFail();

            $business->setTier(
                $invoice->tier,
                null,
                "Paystack subscription charge {$reference}",
            );

            $update = [
                'subscription_status' => Business::SUBSCRIPTION_STATUS_ACTIVE,
                'current_period_end' => $periodEnd,
            ];

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
}
