<?php

use App\Models\Material;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->supplier = Supplier::factory()->create();
    $this->warehouse = Warehouse::factory()->create();
    $this->material = Material::factory()->create();

    $this->purchasing = User::factory()->create();
    $this->purchasing->assignRole('purchasing');

    $this->manager = User::factory()->create();
    $this->manager->assignRole('manager');

    $this->gudang = User::factory()->create();
    $this->gudang->assignRole('gudang');
});

it('purchasing bisa membuat purchase order', function () {
    $response = $this->actingAs($this->purchasing)
        ->postJson('/api/v1/procurement/purchase-orders', [
            'supplier_id' => $this->supplier->id,
            'warehouse_id' => $this->warehouse->id,
            'order_date' => now()->format('Y-m-d'),
            'items' => [
                ['material_id' => $this->material->id, 'qty_ordered' => 10, 'unit_price' => 5000],
            ],
        ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.status', 'draft');

    expect(PurchaseOrder::count())->toBe(1);
});

it('gudang TIDAK BISA membuat purchase order (permission ditolak)', function () {
    $response = $this->actingAs($this->gudang)
        ->postJson('/api/v1/procurement/purchase-orders', [
            'supplier_id' => $this->supplier->id,
            'warehouse_id' => $this->warehouse->id,
            'order_date' => now()->format('Y-m-d'),
            'items' => [
                ['material_id' => $this->material->id, 'qty_ordered' => 10, 'unit_price' => 5000],
            ],
        ]);

    $response->assertStatus(403);
});

it('purchasing bisa submit PO draft untuk approval', function () {
    $po = createDraftPurchaseOrder($this->purchasing, $this->supplier, $this->warehouse, $this->material);

    $response = $this->actingAs($this->purchasing)
        ->postJson("/api/v1/procurement/purchase-orders/{$po->id}/submit");

    $response->assertStatus(200)
        ->assertJsonPath('data.status', 'pending');
});

it('manager bisa approve PO yang berstatus pending', function () {
    $po = createDraftPurchaseOrder($this->purchasing, $this->supplier, $this->warehouse, $this->material);
    $po->update(['status' => 'pending']);

    $response = $this->actingAs($this->manager)
        ->postJson("/api/v1/procurement/purchase-orders/{$po->id}/approve");

    $response->assertStatus(200)
        ->assertJsonPath('data.status', 'approved');
});

it('purchasing TIDAK BISA approve PO (bukan wewenangnya)', function () {
    $po = createDraftPurchaseOrder($this->purchasing, $this->supplier, $this->warehouse, $this->material);
    $po->update(['status' => 'pending']);

    $response = $this->actingAs($this->purchasing)
        ->postJson("/api/v1/procurement/purchase-orders/{$po->id}/approve");

    $response->assertStatus(403);
});

it('gudang bisa membuat goods receipt setelah PO approved, dan stok otomatis bertambah', function () {
    $po = createDraftPurchaseOrder($this->purchasing, $this->supplier, $this->warehouse, $this->material);
    $po->update(['status' => 'approved']);
    $poItem = $po->items->first();

    $response = $this->actingAs($this->gudang)
        ->postJson('/api/v1/procurement/goods-receipts', [
            'purchase_order_id' => $po->id,
            'receipt_date' => now()->format('Y-m-d'),
            'items' => [
                [
                    'purchase_order_item_id' => $poItem->id,
                    'material_id' => $this->material->id,
                    'qty_received' => 10,
                ],
            ],
        ]);

    $response->assertStatus(201);

    $stock = App\Models\Stock::where('material_id', $this->material->id)
        ->where('warehouse_id', $this->warehouse->id)
        ->first();

    expect((float) $stock->qty)->toBe(10.0);

    expect($po->fresh()->status)->toBe('completed');
});

it('goods receipt gagal kalau PO belum approved', function () {
    $po = createDraftPurchaseOrder($this->purchasing, $this->supplier, $this->warehouse, $this->material);
    // status masih draft, belum approved
    $poItem = $po->items->first();

    $response = $this->actingAs($this->gudang)
        ->postJson('/api/v1/procurement/goods-receipts', [
            'purchase_order_id' => $po->id,
            'receipt_date' => now()->format('Y-m-d'),
            'items' => [
                [
                    'purchase_order_item_id' => $poItem->id,
                    'material_id' => $this->material->id,
                    'qty_received' => 10,
                ],
            ],
        ]);

    $response->assertStatus(422);
});

function createDraftPurchaseOrder($purchasing, $supplier, $warehouse, $material): PurchaseOrder
{
    $response = test()->actingAs($purchasing)
        ->postJson('/api/v1/procurement/purchase-orders', [
            'supplier_id' => $supplier->id,
            'warehouse_id' => $warehouse->id,
            'order_date' => now()->format('Y-m-d'),
            'items' => [
                ['material_id' => $material->id, 'qty_ordered' => 10, 'unit_price' => 5000],
            ],
        ]);

    return PurchaseOrder::find($response->json('data.id'));
}
