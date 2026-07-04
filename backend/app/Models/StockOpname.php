<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class StockOpname extends Model
{
    use HasUuid;

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
