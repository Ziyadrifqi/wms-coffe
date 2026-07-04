<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ProductionRequestItem extends Model
{
    use HasUuid;

    protected $fillable = [
        'production_request_id',
        'material_id',
        'qty_requested',
        'qty_fulfilled',
    ];

    protected $casts = [
        'qty_requested' => 'decimal:2',
        'qty_fulfilled' => 'decimal:2',
    ];

    public function productionRequest()
    {
        return $this->belongsTo(ProductionRequest::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }
}
