<?php

namespace App\Services\Procurement;

use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Services\Inventory\StockService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GoodsReceiptService
{
    public function __construct(
        private StockService $stockService
    ) {}

    public function create(array $data, string $userId): GoodsReceipt
    {
        return DB::transaction(function () use ($data, $userId) {
            $po = PurchaseOrder::with('items')->findOrFail($data['purchase_order_id']);

            if (! in_array($po->status, ['approved', 'completed'])) {
                throw new \RuntimeException('Purchase Order harus berstatus approved sebelum bisa menerima barang.');
            }

            // Validasi qty yang diterima tidak melebihi sisa qty yang belum diterima
            foreach ($data['items'] as $item) {
                $poItem = $po->items->firstWhere('id', $item['purchase_order_item_id']);

                if (! $poItem) {
                    throw new \RuntimeException('Item PO tidak ditemukan.');
                }

                $remaining = $poItem->qty_ordered - $poItem->qty_received;

                if ($item['qty_received'] > $remaining) {
                    throw new \RuntimeException(
                        "Qty diterima ({$item['qty_received']}) melebihi sisa qty PO ({$remaining}) untuk material {$poItem->material_id}."
                    );
                }
            }

            $gr = GoodsReceipt::create([
                'gr_number' => $this->generateGrNumber(),
                'purchase_order_id' => $po->id,
                'warehouse_id' => $po->warehouse_id,
                'received_by' => $userId,
                'receipt_date' => $data['receipt_date'],
                'status' => 'confirmed',
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $gr->items()->create([
                    'purchase_order_item_id' => $item['purchase_order_item_id'],
                    'material_id' => $item['material_id'],
                    'qty_received' => $item['qty_received'],
                    'expiry_date' => $item['expiry_date'] ?? null,
                    'batch_number' => $item['batch_number'] ?? null,
                ]);

                // Update qty_received di PO item
                $poItem = $po->items->firstWhere('id', $item['purchase_order_item_id']);
                $poItem->increment('qty_received', $item['qty_received']);

                // Tambah stok — ini yang paling penting
                $this->stockService->addStock(
                    materialId: $item['material_id'],
                    warehouseId: $po->warehouse_id,
                    qty: $item['qty_received'],
                    referenceType: 'goods_receipt',
                    referenceId: $gr->id,
                    userId: $userId,
                    expiryDate: $item['expiry_date'] ?? null,
                    batchNumber: $item['batch_number'] ?? null,
                    notes: "Goods Receipt {$gr->gr_number}",
                );
            }

            // Cek apakah semua item PO sudah diterima penuh -> update status PO
            $po->refresh();
            $allReceived = $po->items->every(fn($i) => $i->qty_received >= $i->qty_ordered);

            if ($allReceived) {
                $po->update(['status' => 'completed']);
            }

            return $gr->load(['items', 'purchaseOrder', 'warehouse']);
        });
    }

    private function generateGrNumber(): string
    {
        $prefix = 'GR-' . date('Ym') . '-';
        $lastGr = GoodsReceipt::where('gr_number', 'like', "{$prefix}%")
            ->orderBy('gr_number', 'desc')
            ->first();

        $sequence = $lastGr
            ? ((int) Str::afterLast($lastGr->gr_number, '-')) + 1
            : 1;

        return $prefix . str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }
}
