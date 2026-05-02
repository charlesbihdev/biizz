<?php

namespace App\Notifications;

use App\Models\Business;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent by the daily DispatchSubscriptionRenewalRemindersCommand to manual
 * subscribers (no Paystack subscription) whose current period ends inside
 * the configured reminder window. The command is idempotent at the daily
 * cadence; this class assumes the schedule already filtered eligibility.
 */
class SubscriptionRenewalDueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Business $business) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $tierLabel = $this->business->subscription_tier->label();
        $endDate = $this->business->current_period_end?->toFormattedDayDateString() ?? 'soon';
        $billingUrl = route('businesses.billing.show', ['business' => $this->business->slug]);

        return (new MailMessage)
            ->subject("Your {$tierLabel} plan ends on {$endDate}")
            ->greeting("Hi {$notifiable->name},")
            ->line("Your {$tierLabel} plan for {$this->business->name} ends on {$endDate}.")
            ->line('Renew with momo, bank, or card to keep your features running for another month.')
            ->action('Renew now', $billingUrl)
            ->line("If you do nothing, your store moves back to Free on {$endDate}.");
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'business_id' => $this->business->id,
            'tier' => $this->business->subscription_tier->value,
            'period_end' => $this->business->current_period_end?->toIso8601String(),
        ];
    }
}
