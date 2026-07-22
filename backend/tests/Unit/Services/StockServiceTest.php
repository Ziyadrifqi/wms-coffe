<?php

use App\Models\Material;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Inventory\StockService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(StockService::class);
    $this->warehouse = Warehouse::factory()->create();
    $this->material = Material::factory()->create();
    $this->user = User::factory()->create();
});

it('menambah stok baru dan mencatat stock movement type in', function () {
    $movement = $this->service->addStock(
        materialId: $this->material->id,
        warehouseId: $this->warehouse->id,
        qty: 10,
        referenceType: 'goods_receipt',
        referenceId: (string) Str::uuid(),
        userId: $this->user->id,
    );

    expect($movement->type)->toBe('in')
        ->and((float) $movement->qty)->toBe(10.0)
        ->and((float) $movement->qty_before)->toBe(0.0)
        ->and((float) $movement->qty_after)->toBe(10.0);

    $totalStock = $this->service->getTotalStock($this->material->id, $this->warehouse->id);
    expect($totalStock)->toBe(10.0);
});

it('menambah stok yang sudah ada (increment, bukan bikin baris baru)', function () {
    $this->service->addStock(
        materialId: $this->material->id,
        warehouseId: $this->warehouse->id,
        qty: 10,
        referenceType: 'goods_receipt',
        referenceId: (string) Str::uuid(),
        userId: $this->user->id,
    );

    $this->service->addStock(
        materialId: $this->material->id,
        warehouseId: $this->warehouse->id,
        qty: 5,
        referenceType: 'goods_receipt',
        referenceId: (string) Str::uuid(),
        userId: $this->user->id,
    );

    $totalStock = $this->service->getTotalStock($this->material->id, $this->warehouse->id);
    expect($totalStock)->toBe(15.0);

    expect(App\Models\StockMovement::count())->toBe(2);
});

it('mengurangi stok dan mencatat movement type out', function () {
    $this->service->addStock(
        materialId: $this->material->id,
        warehouseId: $this->warehouse->id,
        qty: 20,
        referenceType: 'goods_receipt',
        referenceId: (string) Str::uuid(),
        userId: $this->user->id,
    );

    $movement = $this->service->removeStock(
        materialId: $this->material->id,
        warehouseId: $this->warehouse->id,
        qty: 8,
        referenceType: 'production_request',
        referenceId: (string) Str::uuid(),
        userId: $this->user->id,
    );

    expect($movement->type)->toBe('out')
        ->and((float) $movement->qty)->toBe(-8.0);

    $totalStock = $this->service->getTotalStock($this->material->id, $this->warehouse->id);
    expect($totalStock)->toBe(12.0);
});

it('melempar exception kalau stok tidak cukup untuk dikurangi', function () {
    $this->service->addStock(
        materialId: $this->material->id,
        warehouseId: $this->warehouse->id,
        qty: 5,
        referenceType: 'goods_receipt',
        referenceId: (string) Str::uuid(),
        userId: $this->user->id,
    );

    $this->service->removeStock(
        materialId: $this->material->id,
        warehouseId: $this->warehouse->id,
        qty: 100,
        referenceType: 'production_request',
        referenceId: (string) Str::uuid(),
        userId: $this->user->id,
    );
})->throws(RuntimeException::class, 'Stok tidak mencukupi');

it('mengambil stok dari batch yang paling dulu expired (FEFO)', function () {
    $stockLama = App\Models\Stock::create([
        'material_id' => $this->material->id,
        'warehouse_id' => $this->warehouse->id,
        'qty' => 10,
        'expiry_date' => now()->addDays(5),
        'batch_number' => 'BATCH-LAMA',
    ]);

    $stockBaru = App\Models\Stock::create([
        'material_id' => $this->material->id,
        'warehouse_id' => $this->warehouse->id,
        'qty' => 10,
        'expiry_date' => now()->addDays(30),
        'batch_number' => 'BATCH-BARU',
    ]);

    $this->service->removeStock(
        materialId: $this->material->id,
        warehouseId: $this->warehouse->id,
        qty: 10,
        referenceType: 'production_request',
        referenceId: (string) Str::uuid(),
        userId: $this->user->id,
    );

    expect((float) $stockLama->fresh()->qty)->toBe(0.0)
        ->and((float) $stockBaru->fresh()->qty)->toBe(10.0);
});

it('menyesuaikan stok dengan selisih positif (stock opname)', function () {
    $this->service->addStock(
        materialId: $this->material->id,
        warehouseId: $this->warehouse->id,
        qty: 45,
        referenceType: 'goods_receipt',
        referenceId: (string) Str::uuid(),
        userId: $this->user->id,
    );

    $movement = $this->service->adjustStock(
        materialId: $this->material->id,
        warehouseId: $this->warehouse->id,
        difference: 5,
        referenceType: 'stock_opname',
        referenceId: (string) Str::uuid(),
        userId: $this->user->id,
    );

    expect($movement->type)->toBe('adjustment')
        ->and((float) $movement->qty)->toBe(5.0);

    $totalStock = $this->service->getTotalStock($this->material->id, $this->warehouse->id);
    expect($totalStock)->toBe(50.0);
});

it('menyesuaikan stok dengan selisih negatif (stock opname)', function () {
    $this->service->addStock(
        materialId: $this->material->id,
        warehouseId: $this->warehouse->id,
        qty: 50,
        referenceType: 'goods_receipt',
        referenceId: (string) Str::uuid(),
        userId: $this->user->id,
    );

    $this->service->adjustStock(
        materialId: $this->material->id,
        warehouseId: $this->warehouse->id,
        difference: -5,
        referenceType: 'stock_opname',
        referenceId: (string) Str::uuid(),
        userId: $this->user->id,
    );

    $totalStock = $this->service->getTotalStock($this->material->id, $this->warehouse->id);
    expect($totalStock)->toBe(45.0);
});
