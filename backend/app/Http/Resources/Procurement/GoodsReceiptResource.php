<?php

namespace App\Http\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoodsReceiptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'gr_number' => $this->gr_number,
            'purchase_order' => [
                'id' => $this->purchaseOrder?->id,
                'po_number' => $this->purchaseOrder?->po_number,
            ],
            'warehouse' => [
                'id' => $this->warehouse?->id,
                'name' => $this->warehouse?->name,
            ],
            'received_by' => $this->receiver?->name,
            'receipt_date' => $this->receipt_date?->format('Y-m-d'),
            'status' => $this->status,
            'notes' => $this->notes,
            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(fn($item) => [
                    'id' => $item->id,
                    'material' => [
                        'id' => $item->material?->id,
                        'name' => $item->material?->name,
                    ],
                    'qty_received' => $item->qty_received,
                    'expiry_date' => $item->expiry_date,
                    'batch_number' => $item->batch_number,
                ]);
            }),
            'created_at' => $this->created_at,
        ];
    }
}
