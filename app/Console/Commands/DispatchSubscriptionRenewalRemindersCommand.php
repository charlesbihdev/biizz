<?php

namespace App\Console\Commands;

use App\Enums\SubscriptionTier;
use App\Models\Business;
use App\Notifications\SubscriptionRenewalDueNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

/**
 * Daily emitter for "your manual plan ends soon" reminders. Filters down
 * to manual subscribers (no Paystack subscription) whose current period
 * ends inside the configured reminder window. Card subs are excluded:
 * Paystack auto-renews them and we have no story to tell.
 *
 * The window is inclusive on both ends, but the daily cadence keeps the
 * notification effectively once per period from the customer's view: they
 * receive one reminder when current_period_end first falls inside the
 * window, and any re-runs on subsequent days send again until they renew
 * (which moves current_period_end out of the window) or they lapse.
 */
class DispatchSubscriptionRenewalRemindersCommand extends Command
{
    protected $signature = 'subscription:remind';

    protected $description = 'Email manual subscribers whose period ends within the configured reminder window.';

    public function handle(): int
    {
        $days = (int) config('biizz.subscription.manual_renewal_reminder_days_before_end', 3);

        $now = Carbon::now();
        $until = $now->copy()->addDays($days);

        $businesses = Business::query()
            ->with('owner:id,name,email')
            ->where('subscription_tier', '!=', SubscriptionTier::Free->value)
            ->whereNull('subscription_id')
            ->where('subscription_status', Business::SUBSCRIPTION_STATUS_ACTIVE)
            ->whereNotNull('current_period_end')
            ->whereBetween('current_period_end', [$now, $until])
            ->get();

        if ($businesses->isEmpty()) {
            $this->info('No manual subscriptions due for a reminder.');

            return self::SUCCESS;
        }

        $sent = 0;

        foreach ($businesses as $business) {
            if (! $business->owner) {
                continue;
            }

            $business->owner->notify(new SubscriptionRenewalDueNotification($business));
            $sent++;
        }

        $this->info("Sent {$sent} renewal reminder(s).");

        return self::SUCCESS;
    }
}
