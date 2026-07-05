<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $material_id
 * @property string $warehouse_id
 * @property string|null $warehouse_location_id
 * @property numeric $qty
 * @property \Illuminate\Support\Carbon|null $expiry_date
 * @property string|null $batch_number
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\WarehouseLocation|null $location
 * @property-read \App\Models\Material|null $material
 * @property-read \App\Models\Warehouse $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereBatchNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereExpiryDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereMaterialId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereQty($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereWarehouseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereWarehouseLocationId($value)
 * @mixin \Eloquent
 */
class Stock extends Model
{
    use HasUuid;

    protected $table = 'stock';

    protected $fillable = [
        'material_id',
        'warehouse_id',
        'warehouse_location_id',
        'qty',
        'expiry_date',
        'batch_number',
    ];

    protected $casts = [
        'qty' => 'decimal:2',
        'expiry_date' => 'date',
    ];

    public function material()
    {
        return $this->belongsTo(Material::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function location()
    {
        return $this->belongsTo(WarehouseLocation::class, 'warehouse_location_id');
    }
}
