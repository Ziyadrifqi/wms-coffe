<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $warehouse_id
 * @property string $code
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Stock> $stock
 * @property-read int|null $stock_count
 * @property-read \App\Models\Warehouse $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WarehouseLocation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WarehouseLocation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WarehouseLocation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WarehouseLocation whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WarehouseLocation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WarehouseLocation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WarehouseLocation whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WarehouseLocation whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WarehouseLocation whereWarehouseId($value)
 * @mixin \Eloquent
 */
class WarehouseLocation extends Model
{
    use HasUuid;

    protected $fillable = ['warehouse_id', 'code', 'name'];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function stock()
    {
        return $this->hasMany(Stock::class);
    }
}
