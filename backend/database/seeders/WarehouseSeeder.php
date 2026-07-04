<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class WarehouseSeeder extends Seeder
{
    public function run(): void
    {
        Warehouse::firstOrCreate(
            ['code' => 'WH-MAIN'],
            [
                'name' => 'Gudang Utama',
                'address' => 'Alamat gudang pusat',
                'is_active' => true,
            ]
        );
    }
}
