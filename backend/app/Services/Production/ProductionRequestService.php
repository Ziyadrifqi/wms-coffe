<?php

namespace App\Services\Production;

use App\Models\ProductionRequest;
use App\Services\Inventory\StockService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductionRequestService
{
    public function __construct(
        private StockService $stockService
    ) {}

    public function create(array $data, string $userId): ProductionRequest
    {
        return DB::transaction(function () use ($data, $userId) {
            $request = ProductionRequest::create([
                'request_number' => $this->generateRequestNumber(),
                'warehouse_id' => $data['warehouse_id'],
                'requested_by' => $userId,
                'status' => 'pending',
                'request_date' => $data['request_date'],
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $request->items()->create([
                    'material_id' => $item['material_id'],
                    'qty_requested' => $item['qty_requested'],
                ]);
            }

            return $request->load('items.material');
        });
    }

    public function approve(ProductionRequest $request, string $approverId): ProductionRequest
    {
        if ($request->status !== 'pending') {
            throw new \RuntimeException('Hanya request berstatus pending yang bisa di-approve.');
        }

        // Validasi ketersediaan stok sebelum approve
        foreach ($request->items as $item) {
            $available = $this->stockService->getTotalStock($item->material_id, $request->warehouse_id);

            if ($available < $item->qty_requested) {
                throw new \RuntimeException(
                    "Stok material '{$item->material->name}' tidak mencukupi. Tersedia: {$available}, diminta: {$item->qty_requested}."
                );
            }
        }

        $request->update([
            'status' => 'approved',
            'approved_by' => $approverId,
        ]);

        return $request;
    }

    public function reject(ProductionRequest $request, string $approverId): ProductionRequest
    {
        if ($request->status !== 'pending') {
            throw new \RuntimeException('Hanya request berstatus pending yang bisa ditolak.');
        }

        $request->update([
            'status' => 'rejected',
            'approved_by' => $approverId,
        ]);

        return $request;
    }

    /**
     * Gudang mengeluarkan bahan sesuai request yang sudah di-approve.
     * Ini yang trigger StockService::removeStock() + StockMovement.
     */
    public function fulfill(ProductionRequest $request, array $data, string $userId): ProductionRequest
    {
        if ($request->status !== 'approved') {
            throw new \RuntimeException('Hanya request berstatus approved yang bisa dipenuhi.');
        }

        return DB::transaction(function () use ($request, $data, $userId) {
            foreach ($data['items'] as $item) {
                $requestItem = $request->items->firstWhere('id', $item['production_request_item_id']);

                if (! $requestItem) {
                    throw new \RuntimeException('Item request tidak ditemukan.');
                }

                $remaining = $requestItem->qty_requested - $requestItem->qty_fulfilled;

                if ($item['qty_fulfilled'] > $remaining) {
                    throw new \RuntimeException(
                        "Qty yang dikeluarkan ({$item['qty_fulfilled']}) melebihi sisa permintaan ({$remaining})."
                    );
                }

                // Ini akan throw exception otomatis kalau stok gak cukup (sudah di-handle StockService)
                $this->stockService->removeStock(
                    materialId: $requestItem->material_id,
                    warehouseId: $request->warehouse_id,
                    qty: $item['qty_fulfilled'],
                    referenceType: 'production_request',
                    referenceId: $request->id,
                    userId: $userId,
                    notes: "Production Request {$request->request_number}",
                );

                $requestItem->increment('qty_fulfilled', $item['qty_fulfilled']);
            }

            $request->refresh();
            $allFulfilled = $request->items->every(fn($i) => $i->qty_fulfilled >= $i->qty_requested);

            if ($allFulfilled) {
                $request->update(['status' => 'fulfilled']);
            }

            return $request->load('items.material');
        });
    }

    private function generateRequestNumber(): string
    {
        $prefix = 'PRD-' . date('Ym') . '-';
        $last = ProductionRequest::where('request_number', 'like', "{$prefix}%")
            ->orderBy('request_number', 'desc')
            ->first();

        $sequence = $last
            ? ((int) Str::afterLast($last->request_number, '-')) + 1
            : 1;

        return $prefix . str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }
}
