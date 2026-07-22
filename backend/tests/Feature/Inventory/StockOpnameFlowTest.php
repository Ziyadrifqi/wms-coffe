<?php

use App\Models\Material;
use App\Models\Stock;
use App\Models\StockOpname;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Inventory\StockService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->warehouse = Warehouse::factory()->create();
    $this->material = Material::factory()->create();

    $this->gudang = User::factory()->create();
    $this->gudang->assignRole('gudang');

    $this->produksi = User::factory()->create();
    $this->produksi->assignRole('produksi');

    // Isi stok awal 50, supaya ada yang bisa dihitung waktu opname
    app(StockService::class)->addStock(
        materialId: $this->material->id,
        warehouseId: $this->warehouse->id,
        qty: 50,
        referenceType: 'goods_receipt',
        referenceId: (string) Str::uuid(),
        userId: $this->gudang->id,
    );
});

it('gudang bisa membuat sesi stock opname, item otomatis terisi dari stok saat ini', function () {
    $response = $this->actingAs($this->gudang)
        ->postJson('/api/v1/inventory/stock-opnames', [
            'warehouse_id' => $this->warehouse->id,
            'opname_date' => now()->format('Y-m-d'),
        ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.status', 'in_progress')
        ->assertJsonCount(1, 'data.items')
        ->assertJsonPath('data.items.0.qty_system', '50.00')
        ->assertJsonPath('data.items.0.qty_actual', '50.00')
        ->assertJsonPath('data.items.0.qty_difference', '0.00');

    expect(StockOpname::count())->toBe(1);
});

it('produksi TIDAK BISA membuat stock opname (bukan wewenangnya)', function () {
    $response = $this->actingAs($this->produksi)
        ->postJson('/api/v1/inventory/stock-opnames', [
            'warehouse_id' => $this->warehouse->id,
            'opname_date' => now()->format('Y-m-d'),
        ]);

    $response->assertStatus(403);
});

it('gudang bisa update qty_actual dan selisih terhitung otomatis', function () {
    $opname = createStockOpname($this->gudang, $this->warehouse);
    $item = $opname->items->first();

    $response = $this->actingAs($this->gudang)
        ->putJson("/api/v1/inventory/stock-opnames/{$opname->id}/items", [
            'items' => [
                ['id' => $item->id, 'qty_actual' => 45, 'notes' => 'Ada yang rusak'],
            ],
        ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.items.0.qty_actual', '45.00')
        ->assertJsonPath('data.items.0.qty_difference', '-5.00');
});

it('complete opname dengan selisih negatif akan mengurangi stok sungguhan', function () {
    $opname = createStockOpname($this->gudang, $this->warehouse);
    $item = $opname->items->first();

    $this->actingAs($this->gudang)
        ->putJson("/api/v1/inventory/stock-opnames/{$opname->id}/items", [
            'items' => [
                ['id' => $item->id, 'qty_actual' => 45],
            ],
        ]);

    $response = $this->actingAs($this->gudang)
        ->postJson("/api/v1/inventory/stock-opnames/{$opname->id}/complete");

    $response->assertStatus(200)
        ->assertJsonPath('data.status', 'completed');

    $stock = Stock::where('material_id', $this->material->id)
        ->where('warehouse_id', $this->warehouse->id)
        ->first();

    expect((float) $stock->qty)->toBe(45.0);

    $movement = App\Models\StockMovement::where('reference_type', 'stock_opname')->first();
    expect($movement)->not->toBeNull()
        ->and($movement->type)->toBe('adjustment')
        ->and((float) $movement->qty)->toBe(-5.0);
});

it('complete opname dengan selisih positif akan menambah stok sungguhan', function () {
    $opname = createStockOpname($this->gudang, $this->warehouse);
    $item = $opname->items->first();

    $this->actingAs($this->gudang)
        ->putJson("/api/v1/inventory/stock-opnames/{$opname->id}/items", [
            'items' => [
                ['id' => $item->id, 'qty_actual' => 55],
            ],
        ]);

    $this->actingAs($this->gudang)
        ->postJson("/api/v1/inventory/stock-opnames/{$opname->id}/complete");

    $stock = Stock::where('material_id', $this->material->id)
        ->where('warehouse_id', $this->warehouse->id)
        ->first();

    expect((float) $stock->qty)->toBe(55.0);
});

it('complete opname tanpa selisih TIDAK membuat stock movement baru', function () {
    $opname = createStockOpname($this->gudang, $this->warehouse);
    // qty_actual dibiarkan sama dengan qty_system (default), gak ada selisih

    $this->actingAs($this->gudang)
        ->postJson("/api/v1/inventory/stock-opnames/{$opname->id}/complete");

    $movementCount = App\Models\StockMovement::where('reference_type', 'stock_opname')->count();
    expect($movementCount)->toBe(0);
});

it('opname yang sudah completed tidak bisa di-complete lagi', function () {
    $opname = createStockOpname($this->gudang, $this->warehouse);

    $this->actingAs($this->gudang)
        ->postJson("/api/v1/inventory/stock-opnames/{$opname->id}/complete");

    $response = $this->actingAs($this->gudang)
        ->postJson("/api/v1/inventory/stock-opnames/{$opname->id}/complete");

    $response->assertStatus(422);
});

function createStockOpname($gudang, $warehouse): StockOpname
{
    $response = test()->actingAs($gudang)
        ->postJson('/api/v1/inventory/stock-opnames', [
            'warehouse_id' => $warehouse->id,
            'opname_date' => now()->format('Y-m-d'),
        ]);

    return StockOpname::with('items')->find($response->json('data.id'));
}
