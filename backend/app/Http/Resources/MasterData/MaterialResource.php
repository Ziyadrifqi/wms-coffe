<?php

namespace App\Http\Resources\MasterData;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'name' => $this->name,
            'category' => [
                'id' => $this->category?->id,
                'name' => $this->category?->name,
            ],
            'unit' => [
                'id' => $this->unit?->id,
                'name' => $this->unit?->name,
                'symbol' => $this->unit?->symbol,
            ],
            'min_stock' => $this->min_stock,
            'is_perishable' => $this->is_perishable,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
        ];
    }
}
