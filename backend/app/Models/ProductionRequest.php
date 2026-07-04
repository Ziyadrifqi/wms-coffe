<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ProductionRequest extends Model
{
    use HasUuid;

    protected $fillable = [
        'request_number',
        'warehouse_id',
        'requested_by',
        'approved_by',
        'status',
        'request_date',
        'notes',
    ];

    protected $casts = ['request_date' => 'date'];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function items()
    {
        return $this->hasMany(ProductionRequestItem::class);
    }
}
