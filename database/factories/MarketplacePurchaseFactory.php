<?php

namespace Database\Factories;

use App\Models\Buyer;
use App\Models\MarketplacePurchase;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<MarketplacePurchase>
 */
class MarketplacePurchaseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'buyer_id' => Buyer::factory(),
            'product_id' => Product::factory(),
            'amount_paid' => fake()->randomFloat(2, 5, 500),
            'payment_ref' => 'mref_'.Str::upper(Str::random(10)),
            'status' => 'pending',
            'paid_at' => null,
        ];
    }

    public function configure(): static
    {
        return $this->afterMaking(function (MarketplacePurchase $purchase): void {
            $purchase->business_id ??= $purchase->product->business_id;
        });
    }

    public function paid(): static
    {
        return $this->state(fn () => [
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }
}
