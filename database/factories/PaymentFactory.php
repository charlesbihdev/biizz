<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\Business;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'order_id' => Order::factory(),
            'customer_id' => null,
            'gateway' => fake()->randomElement(['paystack', 'junipay']),
            'reference' => 'pay_'.Str::upper(Str::random(10)),
            'transaction_id' => null,
            'amount' => fake()->randomFloat(2, 10, 2000),
            'currency' => 'GHS',
            'status' => PaymentStatus::Pending,
            'paid_at' => null,
            'metadata' => [],
        ];
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

    public function paystack(): static
    {
        return $this->state(['gateway' => 'paystack']);
    }

    public function junipay(): static
    {
        return $this->state(['gateway' => 'junipay']);
    }
}
