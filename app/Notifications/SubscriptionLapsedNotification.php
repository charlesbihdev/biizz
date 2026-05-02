<?php

namespace App\Notifications;

use App\Models\Business;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent by ExpireSubscriptionsCommand once a paid plan has fully lapsed and
 * the business has been moved to Free. Receives the previous tier label so
 * the email can reference what the customer just lost.
 */
class SubscriptionLapsedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Business $business,
        public readonly string $previousTierLabel,
    ) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $billingUrl = route('businesses.billing.show', ['business' => $this->business->slug]);

        return (new MailMessage)
            ->subject("Your {$this->previousTierLabel} plan ended")
            ->greeting("Hi {$notifiable->name},")
            ->line("Your {$this->previousTierLabel} plan for {$this->business->name} has ended and you're now on the Free plan.")
            ->line('Your store stays online and your data is intact. Re-subscribe any time to restore your features.')
            ->action('Re-subscribe', $billingUrl);
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'business_id' => $this->business->id,
            'previous_tier' => $this->previousTierLabel,
        ];
    }
}
