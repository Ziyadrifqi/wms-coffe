<?php

namespace App\Services\Inventory;

use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class StockService
{
    /**
     * Tambah stok (stock in) — dipakai saat Goods Receipt.
     */
    public function addStock(
        string $materialId,
        string $warehouseId,
        float $qty,
        string $referenceType,
        string $referenceId,
        string $userId,
        ?string $warehouseLocationId = null,
        ?string $expiryDate = null,
        ?string $batchNumber = null,
        ?string $notes = null,
    ): StockMovement {
        return DB::transaction(function () use (
            $materialId,
            $warehouseId,
            $qty,
            $referenceType,
            $referenceId,
            $userId,
            $warehouseLocationId,
            $expiryDate,
            $batchNumber,
            $notes
        ) {
            // Lock row supaya aman dari race condition (dua goods receipt bersamaan)
            $stock = Stock::where('material_id', $materialId)
                ->where('warehouse_id', $warehouseId)
                ->where('warehouse_location_id', $warehouseLocationId)
                ->where('batch_number', $batchNumber)
                ->lockForUpdate()
                ->first();

            $qtyBefore = $stock?->qty ?? 0;

            if ($stock) {
                $stock->increment('qty', $qty);
            } else {
                $stock = Stock::create([
                    'material_id' => $materialId,
                    'warehouse_id' => $warehouseId,
                    'warehouse_location_id' => $warehouseLocationId,
                    'qty' => $qty,
                    'expiry_date' => $expiryDate,
                    'batch_number' => $batchNumber,
                ]);
            }

            $qtyAfter = $qtyBefore + $qty;

            return StockMovement::create([
                'material_id' => $materialId,
                'warehouse_id' => $warehouseId,
                'type' => 'in',
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'qty' => $qty,
                'qty_before' => $qtyBefore,
                'qty_after' => $qtyAfter,
                'created_by' => $userId,
                'notes' => $notes,
            ]);
        });
    }

    /**
     * Kurangi stok (stock out) — dipakai saat Production Request.
     * Melempar exception kalau stok tidak cukup.
     */
    public function removeStock(
        string $materialId,
        string $warehouseId,
        float $qty,
        string $referenceType,
        string $referenceId,
        string $userId,
        ?string $notes = null,
    ): StockMovement {
        return DB::transaction(function () use (
            $materialId,
            $warehouseId,
            $qty,
            $referenceType,
            $referenceId,
            $userId,
            $notes
        ) {
            $totalAvailable = Stock::where('material_id', $materialId)
                ->where('warehouse_id', $warehouseId)
                ->lockForUpdate()
                ->sum('qty');

            if ($totalAvailable < $qty) {
                throw new \RuntimeException("Stok tidak mencukupi. Tersedia: {$totalAvailable}, dibutuhkan: {$qty}");
            }

            $qtyBefore = $totalAvailable;
            $remaining = $qty;

            // Ambil stok dari batch yang paling lama expired dulu (FEFO: First Expired First Out)
            $stocks = Stock::where('material_id', $materialId)
                ->where('warehouse_id', $warehouseId)
                ->where('qty', '>', 0)
                ->orderByRaw('expiry_date IS NULL, expiry_date ASC')
                ->lockForUpdate()
                ->get();

            foreach ($stocks as $stock) {
                if ($remaining <= 0) break;

                $deduct = min($stock->qty, $remaining);
                $stock->decrement('qty', $deduct);
                $remaining -= $deduct;
            }

            $qtyAfter = $qtyBefore - $qty;

            return StockMovement::create([
                'material_id' => $materialId,
                'warehouse_id' => $warehouseId,
                'type' => 'out',
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'qty' => -$qty, // negatif untuk 'out'
                'qty_before' => $qtyBefore,
                'qty_after' => $qtyAfter,
                'created_by' => $userId,
                'notes' => $notes,
            ]);
        });
    }

    public function getTotalStock(string $materialId, ?string $warehouseId = null): float
    {
        return Stock::where('material_id', $materialId)
            ->when($warehouseId, fn($q) => $q->where('warehouse_id', $warehouseId))
            ->sum('qty');
    }
}
