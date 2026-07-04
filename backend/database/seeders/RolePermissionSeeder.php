<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cache permission
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Master Data
            'master-data.view',
            'master-data.create',
            'master-data.edit',
            'master-data.delete',

            // Procurement
            'purchase-request.view',
            'purchase-request.create',
            'purchase-request.approve',
            'purchase-order.view',
            'purchase-order.create',
            'purchase-order.edit',
            'goods-receipt.view',
            'goods-receipt.create',

            // Inventory
            'stock.view',
            'stock.adjust',
            'stock-movement.view',
            'stock-opname.view',
            'stock-opname.create',
            'stock-opname.approve',

            // Production
            'production-request.view',
            'production-request.create',
            'production-request.approve',

            // Reports & Settings
            'report.view',
            'user.manage',
            'settings.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // ===== Role: Admin (akses penuh) =====
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->syncPermissions(Permission::all());

        // ===== Role: Manager (approval + report) =====
        $manager = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
        $manager->syncPermissions([
            'master-data.view',
            'purchase-request.view',
            'purchase-request.approve',
            'purchase-order.view',
            'goods-receipt.view',
            'stock.view',
            'stock-movement.view',
            'stock-opname.view',
            'stock-opname.approve',
            'production-request.view',
            'production-request.approve',
            'report.view',
        ]);

        // ===== Role: Purchasing =====
        $purchasing = Role::firstOrCreate(['name' => 'purchasing', 'guard_name' => 'web']);
        $purchasing->syncPermissions([
            'master-data.view',
            'purchase-request.view',
            'purchase-request.create',
            'purchase-order.view',
            'purchase-order.create',
            'purchase-order.edit',
            'report.view',
        ]);

        // ===== Role: Gudang (Warehouse Staff) =====
        $gudang = Role::firstOrCreate(['name' => 'gudang', 'guard_name' => 'web']);
        $gudang->syncPermissions([
            'master-data.view',
            'goods-receipt.view',
            'goods-receipt.create',
            'stock.view',
            'stock.adjust',
            'stock-movement.view',
            'stock-opname.view',
            'stock-opname.create',
            'production-request.view',
            'report.view',
        ]);

        // ===== Role: Produksi =====
        $produksi = Role::firstOrCreate(['name' => 'produksi', 'guard_name' => 'web']);
        $produksi->syncPermissions([
            'production-request.view',
            'production-request.create',
            'stock.view',
        ]);
    }
}
