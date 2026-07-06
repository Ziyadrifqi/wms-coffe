<?php

namespace App\Services\Report;

use App\Models\Material;
use App\Models\ProductionRequest;
use App\Models\PurchaseOrder;
use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    private const CACHE_TTL = 300; // 5 menit
    private const CACHE_TAG = 'dashboard';

    public function getKpis(?string $warehouseId = null): array
    {
        $cacheKey = 'dashboard:kpis:' . ($warehouseId ?? 'all');

        return Cache::tags([self::CACHE_TAG])->remember($cacheKey, self::CACHE_TTL, function () use ($warehouseId) {
            $totalMaterials = Material::where('is_active', true)->count();

            $lowStockCount = $this->getLowStockMaterials($warehouseId)->count();

            $expiringCount = Stock::query()
                ->when($warehouseId, fn($q) => $q->where('warehouse_id', $warehouseId))
                ->where('expiry_date', '<=', now()->addDays(7))
                ->where('expiry_date', '>=', now())
                ->where('qty', '>', 0)
                ->count();

            $expiredCount = Stock::query()
                ->when($warehouseId, fn($q) => $q->where('warehouse_id', $warehouseId))
                ->where('expiry_date', '<', now())
                ->where('qty', '>', 0)
                ->count();

            $pendingPoCount = PurchaseOrder::query()
                ->where('status', 'pending')
                ->when($warehouseId, fn($q) => $q->where('warehouse_id', $warehouseId))
                ->count();

            $pendingProductionCount = ProductionRequest::query()
                ->where('status', 'pending')
                ->when($warehouseId, fn($q) => $q->where('warehouse_id', $warehouseId))
                ->count();

            return [
                'total_materials' => $totalMaterials,
                'low_stock_count' => $lowStockCount,
                'expiring_soon_count' => $expiringCount,
                'expired_count' => $expiredCount,
                'pending_po_count' => $pendingPoCount,
                'pending_production_count' => $pendingProductionCount,
            ];
        });
    }

    public function getStockTrend(int $days = 14, ?string $warehouseId = null): array
    {
        $cacheKey = "dashboard:stock-trend:{$days}:" . ($warehouseId ?? 'all');

        return Cache::tags([self::CACHE_TAG])->remember($cacheKey, self::CACHE_TTL, function () use ($days, $warehouseId) {
            $startDate = now()->subDays($days)->startOfDay();

            $movements = StockMovement::query()
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw("SUM(CASE WHEN type = 'in' THEN qty ELSE 0 END) as stock_in"),
                    DB::raw("SUM(CASE WHEN type = 'out' THEN ABS(qty) ELSE 0 END) as stock_out")
                )
                ->where('created_at', '>=', $startDate)
                ->when($warehouseId, fn($q) => $q->where('warehouse_id', $warehouseId))
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy('date')
                ->get();

            $result = [];
            for ($i = $days - 1; $i >= 0; $i--) {
                $date = now()->subDays($i)->format('Y-m-d');
                $found = $movements->firstWhere('date', $date);

                $result[] = [
                    'date' => $date,
                    'stock_in' => $found ? (float) $found->stock_in : 0,
                    'stock_out' => $found ? (float) $found->stock_out : 0,
                ];
            }

            return $result;
        });
    }

    public function getLowStockMaterials(?string $warehouseId = null)
    {
        $cacheKey = 'dashboard:low-stock-list:' . ($warehouseId ?? 'all');

        return Cache::tags([self::CACHE_TAG])->remember($cacheKey, self::CACHE_TTL, function () use ($warehouseId) {
            return Material::query()
                ->where('is_active', true)
                ->where('min_stock', '>', 0)
                ->get()
                ->map(function ($material) use ($warehouseId) {
                    $totalStock = Stock::where('material_id', $material->id)
                        ->when($warehouseId, fn($q) => $q->where('warehouse_id', $warehouseId))
                        ->sum('qty');

                    return [
                        'id' => $material->id,
                        'name' => $material->name,
                        'sku' => $material->sku,
                        'current_stock' => (float) $totalStock,
                        'min_stock' => (float) $material->min_stock,
                        'unit' => $material->unit?->symbol,
                    ];
                })
                ->filter(fn($item) => $item['current_stock'] < $item['min_stock'])
                ->values();
        });
    }

    public function getExpiringStock(int $days = 7, ?string $warehouseId = null)
    {
        $cacheKey = "dashboard:expiring:{$days}:" . ($warehouseId ?? 'all');

        return Cache::tags([self::CACHE_TAG])->remember($cacheKey, self::CACHE_TTL, function () use ($days, $warehouseId) {
            return Stock::query()
                ->with('material', 'warehouse')
                ->when($warehouseId, fn($q) => $q->where('warehouse_id', $warehouseId))
                ->where('qty', '>', 0)
                ->whereNotNull('expiry_date')
                ->where('expiry_date', '<=', now()->addDays($days))
                ->orderBy('expiry_date')
                ->get()
                ->map(fn($stock) => [
                    'material' => $stock->material?->name,
                    'warehouse' => $stock->warehouse?->name,
                    'qty' => (float) $stock->qty,
                    'batch_number' => $stock->batch_number,
                    'expiry_date' => $stock->expiry_date?->format('Y-m-d'),
                    'is_expired' => $stock->expiry_date?->isPast(),
                ]);
        });
    }

    public function getRecentActivity(int $limit = 10, ?string $warehouseId = null)
    {
        // Tidak di-cache karena harus selalu real-time
        return StockMovement::query()
            ->with(['material', 'warehouse', 'creator'])
            ->when($warehouseId, fn($q) => $q->where('warehouse_id', $warehouseId))
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($movement) => [
                'material' => $movement->material?->name,
                'warehouse' => $movement->warehouse?->name,
                'type' => $movement->type,
                'qty' => (float) $movement->qty,
                'created_by' => $movement->creator?->name,
                'created_at' => $movement->created_at,
            ]);
    }

    public static function clearCache(): void
    {
        Cache::tags([self::CACHE_TAG])->flush();
    }
}
