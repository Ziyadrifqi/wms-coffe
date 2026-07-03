<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Material extends Model
{
    use HasUuid, SoftDeletes;

    protected $fillable = [
        'sku',
        'name',
        'category_id',
        'unit_id',
        'min_stock',
        'is_perishable',
        'is_active',
    ];

    protected $casts = [
        'min_stock' => 'decimal:2',
        'is_perishable' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function stock()
    {
        return $this->hasMany(Stock::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    // total stok gabungan semua warehouse — accessor praktis
    public function getTotalStockAttribute()
    {
        return $this->stock()->sum('qty');
    }
}
