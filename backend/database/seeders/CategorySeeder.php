<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // Material (bahan baku)
            ['name' => 'Biji Kopi', 'type' => 'material'],
            ['name' => 'Susu & Krimer', 'type' => 'material'],
            ['name' => 'Sirup & Perasa', 'type' => 'material'],
            ['name' => 'Kemasan', 'type' => 'material'],
            ['name' => 'Bahan Tambahan', 'type' => 'material'],

            // Product (produk jadi/dijual)
            ['name' => 'Kopi', 'type' => 'product'],
            ['name' => 'Non-Kopi', 'type' => 'product'],
            ['name' => 'Makanan', 'type' => 'product'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['name' => $category['name'], 'type' => $category['type']],
                $category
            );
        }
    }
}
