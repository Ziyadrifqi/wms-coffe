<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

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
