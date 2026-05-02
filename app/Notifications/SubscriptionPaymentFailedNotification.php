<?php

namespace App\Notifications;

use App\Models\Business;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent once when Paystack reports a renewal charge failed and we flip the
 * business to past_due. The webhook guards re-sends by comparing the
 * previous status; this class assumes the status flip already happened.
 */
class SubscriptionPaymentFailedNotification extends Notification implements ShouldQueue
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
        $billingUrl = route('businesses.billing.show', ['business' => $this->business->slug]);

        return (new MailMessage)
            ->subject("We couldn't process your {$tierLabel} renewal")
            ->greeting("Hi {$notifiable->name},")
            ->line("Your {$tierLabel} renewal didn't go through. You haven't lost access yet.")
            ->line('Update your card or pay now to keep your plan running.')
            ->action('Restore my plan', $billingUrl)
            ->line('If you do nothing, your store will move back to Free at the end of your current period.');
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'business_id' => $this->business->id,
            'tier' => $this->business->subscription_tier->value,
        ];
    }
}
