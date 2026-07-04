<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@wmscoffee.test'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $admin->assignRole('admin');

        $manager = User::firstOrCreate(
            ['email' => 'manager@wmscoffee.test'],
            [
                'name' => 'Manager Toko',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $manager->assignRole('manager');

        $purchasing = User::firstOrCreate(
            ['email' => 'purchasing@wmscoffee.test'],
            [
                'name' => 'Staff Purchasing',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $purchasing->assignRole('purchasing');

        $gudang = User::firstOrCreate(
            ['email' => 'gudang@wmscoffee.test'],
            [
                'name' => 'Staff Gudang',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $gudang->assignRole('gudang');
    }
}
