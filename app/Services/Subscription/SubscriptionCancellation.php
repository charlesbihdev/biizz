<?php

namespace App\Services\Subscription;

use App\Models\Business;
use App\Services\Payments\PaystackGateway;
use DomainException;

/**
 * Wraps Paystack's subscription disable/enable endpoints with our local
 * bookkeeping. "Cancel" means stop auto-renewal, not strip access — the
 * customer keeps their tier until current_period_end.
 */
final class SubscriptionCancellation
{
    public function __construct(
        private readonly PaystackGateway $gateway,
    ) {}

    public function cancelAtPeriodEnd(Business $business): void
    {
        if (! $business->subscription_id || ! $business->paystack_email_token) {
            throw new DomainException('No active Paystack subscription to cancel.');
        }

        $ok = $this->gateway->disableSubscription(
            $business->subscription_id,
            $business->paystack_email_token,
        );

        if (! $ok) {
            throw new DomainException('Paystack rejected the cancellation. Try again or contact support.');
        }

        $business->update([
            'subscription_status' => Business::SUBSCRIPTION_STATUS_CANCEL_AT_PERIOD_END,
        ]);
    }

    public function resume(Business $business): void
    {
        if (! $business->subscription_id || ! $business->paystack_email_token) {
            throw new DomainException('No subscription to resume.');
        }

        $ok = $this->gateway->enableSubscription(
            $business->subscription_id,
            $business->paystack_email_token,
        );

        if (! $ok) {
            throw new DomainException('Paystack rejected the resume request. Try again or contact support.');
        }

        $business->update([
            'subscription_status' => Business::SUBSCRIPTION_STATUS_ACTIVE,
        ]);
    }
}
