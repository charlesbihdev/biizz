<?php

namespace Database\Factories;

use App\Enums\SubscriptionTier;
use App\Models\Business;
use App\Models\SubscriptionInvoice;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<SubscriptionInvoice>
 */
class SubscriptionInvoiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'tier' => SubscriptionTier::Pro,
            'gateway' => 'paystack',
            'reference' => Str::random(24),
            'provider_transaction_id' => null,
            'gateway_invoice_id' => null,
            'amount' => 69,
            'currency' => 'GHS',
            'status' => SubscriptionInvoice::STATUS_PENDING,
            'period_start' => null,
            'period_end' => null,
            'paid_at' => null,
            'metadata' => [],
        ];
    }

    public function paid(): static
    {
        return $this->state(fn (array $attrs) => [
            'status' => SubscriptionInvoice::STATUS_PAID,
            'paid_at' => now(),
            'period_start' => now(),
            'period_end' => now()->addMonth(),
            'provider_transaction_id' => 'txn_'.Str::upper(Str::random(12)),
        ]);
    }
}
