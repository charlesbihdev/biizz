<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    public function definition(): array
    {
        $unitPrice = fake()->randomFloat(2, 5, 300);
        $quantity  = fake()->numberBetween(1, 5);

        return [
            'order_id'     => Order::factory(),
            'product_id'   => Product::factory(),
            'product_name' => fake()->words(3, true), // snapshot
            'unit_price'   => $unitPrice,             // snapshot
            'quantity'     => $quantity,
            'subtotal'     => round($unitPrice * $quantity, 2),
        ];
    }
}
