<?php

namespace App\Console\Commands;

use App\Enums\SubscriptionTier;
use App\Models\Business;
use App\Notifications\SubscriptionLapsedNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Daily sweep that downgrades expired paid subscriptions to Free.
 *
 * Universal across both lanes:
 *  - Manual subs (subscription_id IS NULL) lapse when
 *    current_period_end + lapse_grace_days has passed and the user did
 *    not renew via the manual checkout.
 *  - Card subs in past_due (subscription_id IS NOT NULL but status !=
 *    active) lapse when grace passes without recovery.
 *  - Cancel-at-period-end subs lapse the same way once grace ends.
 *
 * Healthy auto-renew card subs (status = active AND subscription_id NOT
 * NULL) are left alone: Paystack drives their renewal via charge.success.
 */
class ExpireSubscriptionsCommand extends Command
{
    protected $signature = 'subscription:expire';

    protected $description = 'Downgrade businesses whose paid subscription has lapsed past the grace window.';

    public function handle(): int
    {
        $graceDays = (int) config('biizz.subscription.lapse_grace_days', 3);
        $cutoff = Carbon::now()->subDays($graceDays);

        $businesses = Business::query()
            ->with('owner:id,name,email')
            ->where('subscription_tier', '!=', SubscriptionTier::Free->value)
            ->whereNotNull('current_period_end')
            ->where('current_period_end', '<', $cutoff)
            ->where(function ($q) {
                $q->whereNull('subscription_id')
                    ->orWhere('subscription_status', '!=', Business::SUBSCRIPTION_STATUS_ACTIVE);
            })
            ->get();

        if ($businesses->isEmpty()) {
            $this->info('No expired subscriptions.');

            return self::SUCCESS;
        }

        $count = 0;

        foreach ($businesses as $business) {
            $previousLabel = $business->subscription_tier->label();

            DB::transaction(function () use ($business): void {
                $business->setTier(
                    SubscriptionTier::Free,
                    null,
                    'Subscription period ended',
                );

                $business->update([
                    'subscription_status' => Business::SUBSCRIPTION_STATUS_INACTIVE,
                    'subscription_id' => null,
                    'paystack_email_token' => null,
                ]);
            });

            if ($business->owner) {
                $business->owner->notify(new SubscriptionLapsedNotification(
                    $business->fresh(),
                    $previousLabel,
                ));
            }

            $count++;
        }

        $this->info("Lapsed {$count} subscription(s) to Free.");

        return self::SUCCESS;
    }
}
