<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $material_id
 * @property string $warehouse_id
 * @property string $type
 * @property string $reference_type
 * @property string|null $reference_id
 * @property numeric $qty
 * @property numeric $qty_before
 * @property numeric $qty_after
 * @property string $created_by
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon $created_at
 * @property-read \App\Models\User|null $creator
 * @property-read \App\Models\Material|null $material
 * @property-read \App\Models\Warehouse $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereMaterialId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereQty($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereQtyAfter($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereQtyBefore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereReferenceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereReferenceType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereWarehouseId($value)
 * @mixin \Eloquent
 */
class StockMovement extends Model
{
    use HasUuid;

    const UPDATED_AT = null; // immutable, tidak ada update

    protected $fillable = [
        'material_id',
        'warehouse_id',
        'type',
        'reference_type',
        'reference_id',
        'qty',
        'qty_before',
        'qty_after',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'qty' => 'decimal:2',
        'qty_before' => 'decimal:2',
        'qty_after' => 'decimal:2',
    ];

    public function material()
    {
        return $this->belongsTo(Material::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
