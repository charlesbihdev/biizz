<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Business>
 */
class BusinessFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'owner_id'       => User::factory(),
            'name'           => $name,
            'slug'           => Str::slug($name) . '-' . fake()->unique()->numberBetween(1, 9999),
            'theme_id'       => 'classic',
            'theme_settings' => [],
            'meta_pixel_id'  => null,
            'ai_enabled'     => false,
        ];
    }

    public function withAI(): static
    {
        return $this->state(['ai_enabled' => true]);
    }

    public function withTheme(string $themeId): static
    {
        return $this->state(['theme_id' => $themeId]);
    }
}
