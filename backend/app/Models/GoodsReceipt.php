<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class GoodsReceipt extends Model
{
    use HasUuid;

    protected $fillable = [
        'gr_number',
        'purchase_order_id',
        'warehouse_id',
        'received_by',
        'receipt_date',
        'status',
        'notes',
    ];

    protected $casts = ['receipt_date' => 'date'];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function items()
    {
        return $this->hasMany(GoodsReceiptItem::class);
    }
}
