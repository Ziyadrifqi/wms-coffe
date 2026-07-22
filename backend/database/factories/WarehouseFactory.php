<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class WarehouseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => 'WH-' . $this->faker->unique()->numberBetween(100, 999),
            'name' => $this->faker->company() . ' Warehouse',
            'address' => $this->faker->address(),
            'is_active' => true,
        ];
    }
}
