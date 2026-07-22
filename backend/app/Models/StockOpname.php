<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @property string $id
 * @property string $opname_number
 * @property string $warehouse_id
 * @property string $created_by
 * @property \Illuminate\Support\Carbon $opname_date
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $creator
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StockOpnameItem> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\Warehouse $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpname newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpname newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpname query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpname whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpname whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpname whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpname whereOpnameDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpname whereOpnameNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpname whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpname whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpname whereWarehouseId($value)
 * @mixin \Eloquent
 */
class StockOpname extends Model
{
    use HasUuid, HasFactory;

    protected $fillable = [
        'opname_number',
        'warehouse_id',
        'created_by',
        'opname_date',
        'status',
    ];

    protected $casts = ['opname_date' => 'date'];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(StockOpnameItem::class);
    }
}
