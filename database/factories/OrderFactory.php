<?php

namespace Database\Factories;

use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use App\Models\Business;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'customer_name' => fake()->name(),
            'customer_email' => fake()->safeEmail(),
            'customer_phone' => fake()->phoneNumber(),
            'total' => fake()->randomFloat(2, 10, 2000),
            'currency' => fake()->randomElement(['GHS', 'NGN', 'KES', 'ZAR']),
            'status' => OrderStatus::Pending,
            'payment_ref' => null,
            'payment_provider' => null,
            'source' => OrderSource::Storefront,
        ];
    }

    public function paid(): static
    {
        return $this->state([
            'status' => OrderStatus::Paid,
            'payment_ref' => 'ref_'.Str::random(20),
            'payment_provider' => 'paystack',
        ]);
    }

    public function fromWhatsapp(): static
    {
        return $this->state(['source' => OrderSource::Whatsapp]);
    }
}
