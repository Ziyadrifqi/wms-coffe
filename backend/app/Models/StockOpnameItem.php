<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

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
