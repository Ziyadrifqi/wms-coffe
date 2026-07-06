<?php

namespace App\Services\Inventory;

use App\Models\Material;
use App\Models\Stock;
use App\Models\StockOpname;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StockOpnameService
{
    public function __construct(
        private StockService $stockService
    ) {}

    /**
     * Buat sesi opname baru. Otomatis isi item dari semua material
     * yang punya stok di warehouse tsb (qty_system diambil dari kondisi saat ini).
     */
    public function create(array $data, string $userId): StockOpname
    {
        return DB::transaction(function () use ($data, $userId) {
            $opname = StockOpname::create([
                'opname_number' => $this->generateOpnameNumber(),
                'warehouse_id' => $data['warehouse_id'],
                'created_by' => $userId,
                'opname_date' => $data['opname_date'],
                'status' => 'in_progress',
            ]);

            // Ambil semua material yang punya stok (meski 0) di warehouse ini
            $materialIds = Stock::where('warehouse_id', $data['warehouse_id'])
                ->distinct()
                ->pluck('material_id');

            foreach ($materialIds as $materialId) {
                $qtySystem = $this->stockService->getTotalStock($materialId, $data['warehouse_id']);

                $opname->items()->create([
                    'material_id' => $materialId,
                    'qty_system' => $qtySystem,
                    'qty_actual' => $qtySystem, // default sama dulu, nanti diisi manual
                    'qty_difference' => 0,
                ]);
            }

            return $opname->load('items.material');
        });
    }

    /**
     * Update qty_actual untuk beberapa item sekaligus (input hasil hitung fisik).
     */
    public function updateItems(StockOpname $opname, array $items): StockOpname
    {
        if ($opname->status !== 'in_progress') {
            throw new \RuntimeException('Hanya opname berstatus in_progress yang bisa diupdate.');
        }

        return DB::transaction(function () use ($opname, $items) {
            foreach ($items as $itemData) {
                $item = $opname->items()->findOrFail($itemData['id']);

                $difference = $itemData['qty_actual'] - $item->qty_system;

                $item->update([
                    'qty_actual' => $itemData['qty_actual'],
                    'qty_difference' => $difference,
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }

            return $opname->load('items.material');
        });
    }

    /**
     * Selesaikan opname: terapkan semua selisih ke stok sungguhan + catat stock movement.
     */
    public function complete(StockOpname $opname, string $userId): StockOpname
    {
        if ($opname->status !== 'in_progress') {
            throw new \RuntimeException('Hanya opname berstatus in_progress yang bisa diselesaikan.');
        }

        return DB::transaction(function () use ($opname, $userId) {
            foreach ($opname->items as $item) {
                if ($item->qty_difference == 0) {
                    continue; // gak ada selisih, skip
                }

                $material = Material::find($item->material_id);

                $this->stockService->adjustStock(
                    materialId: $item->material_id,
                    warehouseId: $opname->warehouse_id,
                    difference: $item->qty_difference,
                    referenceType: 'stock_opname',
                    referenceId: $opname->id,
                    userId: $userId,
                    notes: "Stock Opname {$opname->opname_number} - {$material?->name}: selisih {$item->qty_difference}",
                );
            }

            $opname->update(['status' => 'completed']);

            return $opname->load('items.material');
        });
    }

    private function generateOpnameNumber(): string
    {
        $prefix = 'SO-' . date('Ym') . '-';
        $last = StockOpname::where('opname_number', 'like', "{$prefix}%")
            ->orderBy('opname_number', 'desc')
            ->first();

        $sequence = $last
            ? ((int) Str::afterLast($last->opname_number, '-')) + 1
            : 1;

        return $prefix . str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }
}
