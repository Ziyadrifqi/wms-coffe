<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    use HasUuid;

    protected $fillable = ['code', 'name', 'address', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function locations()
    {
        return $this->hasMany(WarehouseLocation::class);
    }

    public function stock()
    {
        return $this->hasMany(Stock::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }
}
