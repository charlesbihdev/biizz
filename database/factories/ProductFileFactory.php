<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductFile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductFile>
 */
class ProductFileFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'url' => fake()->url(),
            'path' => 'product-files/'.fake()->unique()->uuid().'.pdf',
            'filename' => fake()->word().'.pdf',
            'file_size' => 1024 * 1024,
            'mime_type' => 'application/pdf',
        ];
    }
}
