<?php

namespace App\Http\Resources\Inventory;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockOpnameResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'opname_number' => $this->opname_number,
            'warehouse' => [
                'id' => $this->warehouse?->id,
                'name' => $this->warehouse?->name,
            ],
            'status' => $this->status,
            'opname_date' => $this->opname_date?->format('Y-m-d'),
            'created_by' => $this->creator?->name,
            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(fn($item) => [
                    'id' => $item->id,
                    'material' => [
                        'id' => $item->material?->id,
                        'name' => $item->material?->name,
                    ],
                    'qty_system' => $item->qty_system,
                    'qty_actual' => $item->qty_actual,
                    'qty_difference' => $item->qty_difference,
                    'notes' => $item->notes,
                ]);
            }),
            'created_at' => $this->created_at,
        ];
    }
}
