<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\MarketplacePayment;
use App\Models\MarketplacePurchase;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<MarketplacePayment>
 */
class MarketplacePaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'marketplace_purchase_id' => MarketplacePurchase::factory(),
            'gateway' => fake()->randomElement(['paystack', 'junipay']),
            'reference' => 'mpay_'.Str::upper(Str::random(10)),
            'transaction_id' => null,
            'amount' => fake()->randomFloat(2, 5, 500),
            'currency' => 'GHS',
            'status' => PaymentStatus::Pending,
            'paid_at' => null,
            'metadata' => [],
        ];
    }

    public function configure(): static
    {
        return $this->afterMaking(function (MarketplacePayment $payment): void {
            $payment->business_id ??= $payment->purchase->business_id;
        });
    }

    public function success(): static
    {
        return $this->state(fn () => [
            'status' => PaymentStatus::Success,
            'transaction_id' => 'txn_'.Str::upper(Str::random(12)),
            'paid_at' => now(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(['status' => PaymentStatus::Failed]);
    }
}
