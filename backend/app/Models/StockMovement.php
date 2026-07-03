<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

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
