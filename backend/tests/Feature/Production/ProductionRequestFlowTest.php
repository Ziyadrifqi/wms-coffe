<?php

use App\Models\Material;
use App\Models\ProductionRequest;
use App\Models\Stock;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Inventory\StockService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->warehouse = Warehouse::factory()->create();
    $this->material = Material::factory()->create();

    $this->produksi = User::factory()->create();
    $this->produksi->assignRole('produksi');

    $this->manager = User::factory()->create();
    $this->manager->assignRole('manager');

    $this->gudang = User::factory()->create();
    $this->gudang->assignRole('gudang');
});

it('produksi bisa membuat production request', function () {
    $response = $this->actingAs($this->produksi)
        ->postJson('/api/v1/production/requests', [
            'warehouse_id' => $this->warehouse->id,
            'request_date' => now()->format('Y-m-d'),
            'items' => [
                ['material_id' => $this->material->id, 'qty_requested' => 5],
            ],
        ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.status', 'pending');

    expect(ProductionRequest::count())->toBe(1);
});

it('purchasing TIDAK BISA membuat production request (bukan wewenangnya)', function () {
    $purchasing = User::factory()->create();
    $purchasing->assignRole('purchasing');

    $response = $this->actingAs($purchasing)
        ->postJson('/api/v1/production/requests', [
            'warehouse_id' => $this->warehouse->id,
            'request_date' => now()->format('Y-m-d'),
            'items' => [
                ['material_id' => $this->material->id, 'qty_requested' => 5],
            ],
        ]);

    $response->assertStatus(403);
});

it('manager bisa approve production request kalau stok mencukupi', function () {
    // Isi stok dulu supaya cukup
    app(StockService::class)->addStock(
        materialId: $this->material->id,
        warehouseId: $this->warehouse->id,
        qty: 20,
        referenceType: 'goods_receipt',
        referenceId: (string) Str::uuid(),
        userId: $this->manager->id,
    );

    $request = createProductionRequest($this->produksi, $this->warehouse, $this->material, 5);

    $response = $this->actingAs($this->manager)
        ->postJson("/api/v1/production/requests/{$request->id}/approve");

    $response->assertStatus(200)
        ->assertJsonPath('data.status', 'approved');
});

it('manager TIDAK BISA approve production request kalau stok tidak mencukupi', function () {
    // Stok cuma 2, tapi diminta 5 -> harus ditolak
    app(StockService::class)->addStock(
        materialId: $this->material->id,
        warehouseId: $this->warehouse->id,
        qty: 2,
        referenceType: 'goods_receipt',
        referenceId: (string) Str::uuid(),
        userId: $this->manager->id,
    );

    $request = createProductionRequest($this->produksi, $this->warehouse, $this->material, 5);

    $response = $this->actingAs($this->manager)
        ->postJson("/api/v1/production/requests/{$request->id}/approve");

    $response->assertStatus(422);

    expect($request->fresh()->status)->toBe('pending'); // tetap pending, gak jadi approved
});

it('gudang bisa fulfill production request yang sudah approved, stok otomatis berkurang', function () {
    app(StockService::class)->addStock(
        materialId: $this->material->id,
        warehouseId: $this->warehouse->id,
        qty: 20,
        referenceType: 'goods_receipt',
        referenceId: (string) Str::uuid(),
        userId: $this->manager->id,
    );

    $request = createProductionRequest($this->produksi, $this->warehouse, $this->material, 5);
    $request->update(['status' => 'approved']);
    $item = $request->items->first();

    $response = $this->actingAs($this->gudang)
        ->postJson("/api/v1/production/requests/{$request->id}/fulfill", [
            'items' => [
                ['production_request_item_id' => $item->id, 'qty_fulfilled' => 5],
            ],
        ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.status', 'fulfilled');

    $stock = Stock::where('material_id', $this->material->id)
        ->where('warehouse_id', $this->warehouse->id)
        ->first();

    expect((float) $stock->qty)->toBe(15.0); // 20 - 5
});

it('fulfill gagal kalau request belum berstatus approved', function () {
    $request = createProductionRequest($this->produksi, $this->warehouse, $this->material, 5);
    // status masih pending, belum approved
    $item = $request->items->first();

    $response = $this->actingAs($this->gudang)
        ->postJson("/api/v1/production/requests/{$request->id}/fulfill", [
            'items' => [
                ['production_request_item_id' => $item->id, 'qty_fulfilled' => 5],
            ],
        ]);

    $response->assertStatus(422);
});

it('fulfill gagal kalau qty yang diminta melebihi sisa permintaan', function () {
    app(StockService::class)->addStock(
        materialId: $this->material->id,
        warehouseId: $this->warehouse->id,
        qty: 20,
        referenceType: 'goods_receipt',
        referenceId: (string) Str::uuid(),
        userId: $this->manager->id,
    );

    $request = createProductionRequest($this->produksi, $this->warehouse, $this->material, 5);
    $request->update(['status' => 'approved']);
    $item = $request->items->first();

    $response = $this->actingAs($this->gudang)
        ->postJson("/api/v1/production/requests/{$request->id}/fulfill", [
            'items' => [
                ['production_request_item_id' => $item->id, 'qty_fulfilled' => 100], // melebihi 5 yang diminta
            ],
        ]);

    $response->assertStatus(422);
});

function createProductionRequest($produksi, $warehouse, $material, $qty): ProductionRequest
{
    $response = test()->actingAs($produksi)
        ->postJson('/api/v1/production/requests', [
            'warehouse_id' => $warehouse->id,
            'request_date' => now()->format('Y-m-d'),
            'items' => [
                ['material_id' => $material->id, 'qty_requested' => $qty],
            ],
        ]);

    return ProductionRequest::find($response->json('data.id'));
}
