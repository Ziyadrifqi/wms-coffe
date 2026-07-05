<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $stock_opname_id
 * @property string $material_id
 * @property numeric $qty_system
 * @property numeric $qty_actual
 * @property numeric $qty_difference
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Material|null $material
 * @property-read \App\Models\StockOpname $stockOpname
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpnameItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpnameItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpnameItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpnameItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpnameItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpnameItem whereMaterialId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpnameItem whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpnameItem whereQtyActual($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpnameItem whereQtyDifference($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpnameItem whereQtySystem($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpnameItem whereStockOpnameId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockOpnameItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class StockOpnameItem extends Model
{
    use HasUuid;

    protected $fillable = [
        'stock_opname_id',
        'material_id',
        'qty_system',
        'qty_actual',
        'qty_difference',
        'notes',
    ];

    protected $casts = [
        'qty_system' => 'decimal:2',
        'qty_actual' => 'decimal:2',
        'qty_difference' => 'decimal:2',
    ];

    public function stockOpname()
    {
        return $this->belongsTo(StockOpname::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }
}
