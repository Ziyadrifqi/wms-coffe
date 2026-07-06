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
            // Ambil & lock semua row stok material ini di warehouse ini
            $stocks = Stock::where('material_id', $materialId)
                ->where('warehouse_id', $warehouseId)
                ->where('qty', '>', 0)
                ->orderByRaw('expiry_date IS NULL, expiry_date ASC') // FEFO
                ->lockForUpdate()
                ->get();

            // Jumlahkan di PHP, bukan di query
            $totalAvailable = $stocks->sum('qty');

            if ($totalAvailable < $qty) {
                throw new \RuntimeException("Stok tidak mencukupi. Tersedia: {$totalAvailable}, dibutuhkan: {$qty}");
            }

            $qtyBefore = $totalAvailable;
            $remaining = $qty;

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
                'qty' => -$qty,
                'qty_before' => $qtyBefore,
                'qty_after' => $qtyAfter,
                'created_by' => $userId,
                'notes' => $notes,
            ]);
        });
    }

    /**
     * Sesuaikan stok berdasarkan selisih hasil stock opname.
     * Bisa positif (stok fisik lebih banyak) atau negatif (stok fisik lebih sedikit).
     */
    public function adjustStock(
        string $materialId,
        string $warehouseId,
        float $difference, // qty_actual - qty_system, bisa + atau -
        string $referenceType,
        string $referenceId,
        string $userId,
        ?string $notes = null,
    ): StockMovement {
        return DB::transaction(function () use (
            $materialId,
            $warehouseId,
            $difference,
            $referenceType,
            $referenceId,
            $userId,
            $notes
        ) {
            $stocks = Stock::where('material_id', $materialId)
                ->where('warehouse_id', $warehouseId)
                ->lockForUpdate()
                ->get();

            $qtyBefore = $stocks->sum('qty');

            if ($difference == 0) {
                // Tidak ada perubahan, tetap catat movement untuk audit trail
                return StockMovement::create([
                    'material_id' => $materialId,
                    'warehouse_id' => $warehouseId,
                    'type' => 'adjustment',
                    'reference_type' => $referenceType,
                    'reference_id' => $referenceId,
                    'qty' => 0,
                    'qty_before' => $qtyBefore,
                    'qty_after' => $qtyBefore,
                    'created_by' => $userId,
                    'notes' => $notes,
                ]);
            }

            if ($difference > 0) {
                // Stok fisik lebih banyak -> tambahkan ke baris stok pertama (atau buat baru kalau belum ada)
                $stock = $stocks->first();

                if ($stock) {
                    $stock->increment('qty', $difference);
                } else {
                    Stock::create([
                        'material_id' => $materialId,
                        'warehouse_id' => $warehouseId,
                        'qty' => $difference,
                    ]);
                }
            } else {
                // Stok fisik lebih sedikit -> kurangi, mulai dari batch yang paling lama expired
                $remaining = abs($difference);

                $sortedStocks = $stocks->sortBy(function ($stock) {
                    return $stock->expiry_date ?? '9999-12-31';
                });

                foreach ($sortedStocks as $stock) {
                    if ($remaining <= 0) break;

                    $deduct = min($stock->qty, $remaining);
                    $stock->decrement('qty', $deduct);
                    $remaining -= $deduct;
                }
            }

            $qtyAfter = $qtyBefore + $difference;

            return StockMovement::create([
                'material_id' => $materialId,
                'warehouse_id' => $warehouseId,
                'type' => 'adjustment',
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'qty' => $difference,
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
