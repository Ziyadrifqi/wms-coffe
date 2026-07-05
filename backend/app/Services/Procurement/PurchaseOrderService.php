<?php

namespace App\Services\Procurement;

use App\Models\PurchaseOrder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurchaseOrderService
{
    public function create(array $data, string $userId): PurchaseOrder
    {
        return DB::transaction(function () use ($data, $userId) {
            $totalAmount = collect($data['items'])->sum(
                fn($item) => $item['qty_ordered'] * $item['unit_price']
            );

            $po = PurchaseOrder::create([
                'po_number' => $this->generatePoNumber(),
                'supplier_id' => $data['supplier_id'],
                'warehouse_id' => $data['warehouse_id'],
                'created_by' => $userId,
                'status' => 'draft',
                'order_date' => $data['order_date'],
                'expected_date' => $data['expected_date'] ?? null,
                'total_amount' => $totalAmount,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $po->items()->create([
                    'material_id' => $item['material_id'],
                    'qty_ordered' => $item['qty_ordered'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['qty_ordered'] * $item['unit_price'],
                ]);
            }

            return $po->load('items');
        });
    }

    public function update(PurchaseOrder $po, array $data): PurchaseOrder
    {
        if ($po->status !== 'draft') {
            throw new \RuntimeException('Hanya PO berstatus draft yang bisa diedit.');
        }

        return DB::transaction(function () use ($po, $data) {
            $totalAmount = collect($data['items'])->sum(
                fn($item) => $item['qty_ordered'] * $item['unit_price']
            );

            $po->update([
                'supplier_id' => $data['supplier_id'],
                'warehouse_id' => $data['warehouse_id'],
                'order_date' => $data['order_date'],
                'expected_date' => $data['expected_date'] ?? null,
                'total_amount' => $totalAmount,
                'notes' => $data['notes'] ?? null,
            ]);

            // Hapus item lama, buat ulang (simpel untuk edit draft)
            $po->items()->delete();

            foreach ($data['items'] as $item) {
                $po->items()->create([
                    'material_id' => $item['material_id'],
                    'qty_ordered' => $item['qty_ordered'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['qty_ordered'] * $item['unit_price'],
                ]);
            }

            return $po->load('items');
        });
    }

    public function submitForApproval(PurchaseOrder $po): PurchaseOrder
    {
        if ($po->status !== 'draft') {
            throw new \RuntimeException('Hanya PO berstatus draft yang bisa diajukan.');
        }

        $po->update(['status' => 'pending']);

        return $po;
    }

    public function approve(PurchaseOrder $po, string $approverId): PurchaseOrder
    {
        if ($po->status !== 'pending') {
            throw new \RuntimeException('Hanya PO berstatus pending yang bisa di-approve.');
        }

        $po->update([
            'status' => 'approved',
            'approved_by' => $approverId,
        ]);

        return $po;
    }

    public function reject(PurchaseOrder $po, string $approverId): PurchaseOrder
    {
        if ($po->status !== 'pending') {
            throw new \RuntimeException('Hanya PO berstatus pending yang bisa ditolak.');
        }

        $po->update([
            'status' => 'rejected',
            'approved_by' => $approverId,
        ]);

        return $po;
    }

    private function generatePoNumber(): string
    {
        $prefix = 'PO-' . date('Ym') . '-';
        $lastPo = PurchaseOrder::where('po_number', 'like', "{$prefix}%")
            ->orderBy('po_number', 'desc')
            ->first();

        $sequence = $lastPo
            ? ((int) Str::afterLast($lastPo->po_number, '-')) + 1
            : 1;

        return $prefix . str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }
}
