<?php

namespace App\Notifications;

use App\Models\MarketplacePurchase;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MarketplacePurchaseNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly MarketplacePurchase $purchase) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $product = $this->purchase->product;
        $isFree = $this->purchase->status === 'free';
        $libraryUrl = route('marketplace.library.index');
        $productName = $product?->name ?? 'Your product';
        $creator = $product?->business?->name ?? 'the creator';
        $amount = $isFree ? 'Free' : 'GHS '.number_format((float) $this->purchase->amount_paid, 2);

        return (new MailMessage)
            ->subject("You're in! {$productName} is in your library")
            ->greeting("Hi {$notifiable->name},")
            ->line("{$productName} by {$creator} is now in your library.")
            ->line("Amount paid: {$amount}")
            ->action('Go to My Library', $libraryUrl)
            ->line('You can download or read your product from your library at any time.');
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'purchase_id' => $this->purchase->id,
            'product_id' => $this->purchase->product_id,
            'status' => $this->purchase->status,
        ];
    }
}
