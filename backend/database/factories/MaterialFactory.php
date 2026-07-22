<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

class MaterialFactory extends Factory
{
    public function definition(): array
    {
        return [
            'sku' => 'MAT-' . $this->faker->unique()->numberBetween(1000, 9999),
            'name' => $this->faker->words(2, true),
            'category_id' => Category::factory(),
            'unit_id' => Unit::factory(),
            'min_stock' => 10,
            'is_perishable' => false,
            'is_active' => true,
        ];
    }
}
