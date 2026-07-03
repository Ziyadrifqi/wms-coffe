<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

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
