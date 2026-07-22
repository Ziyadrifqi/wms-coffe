<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class UnitFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => 'Kilogram',
            'symbol' => $this->faker->unique()->lexify('???'),
        ];
    }
}
