<?php

namespace App\Http\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'po_number' => $this->po_number,
            'supplier' => [
                'id' => $this->supplier?->id,
                'name' => $this->supplier?->name,
            ],
            'warehouse' => [
                'id' => $this->warehouse?->id,
                'name' => $this->warehouse?->name,
            ],
            'status' => $this->status,
            'order_date' => $this->order_date?->format('Y-m-d'),
            'expected_date' => $this->expected_date?->format('Y-m-d'),
            'total_amount' => $this->total_amount,
            'notes' => $this->notes,
            'created_by' => $this->creator?->name,
            'approved_by' => $this->approver?->name,
            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(fn($item) => [
                    'id' => $item->id,
                    'material' => [
                        'id' => $item->material?->id,
                        'name' => $item->material?->name,
                    ],
                    'qty_ordered' => $item->qty_ordered,
                    'qty_received' => $item->qty_received,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal,
                ]);
            }),
            'created_at' => $this->created_at,
        ];
    }
}
