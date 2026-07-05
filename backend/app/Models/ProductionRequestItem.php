<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $production_request_id
 * @property string $material_id
 * @property numeric $qty_requested
 * @property numeric $qty_fulfilled
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Material|null $material
 * @property-read \App\Models\ProductionRequest $productionRequest
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequestItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequestItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequestItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequestItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequestItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequestItem whereMaterialId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequestItem whereProductionRequestId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequestItem whereQtyFulfilled($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequestItem whereQtyRequested($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequestItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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
