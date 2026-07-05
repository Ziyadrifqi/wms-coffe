<?php

namespace App\Http\Resources\Production;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductionRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'request_number' => $this->request_number,
            'warehouse' => [
                'id' => $this->warehouse?->id,
                'name' => $this->warehouse?->name,
            ],
            'status' => $this->status,
            'request_date' => $this->request_date,
            'notes' => $this->notes,
            'requested_by' => $this->requester?->name,
            'approved_by' => $this->approver?->name,
            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(fn($item) => [
                    'id' => $item->id,
                    'material' => [
                        'id' => $item->material?->id,
                        'name' => $item->material?->name,
                    ],
                    'qty_requested' => $item->qty_requested,
                    'qty_fulfilled' => $item->qty_fulfilled,
                ]);
            }),
            'created_at' => $this->created_at,
        ];
    }
}
