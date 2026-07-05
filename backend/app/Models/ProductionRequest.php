<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $request_number
 * @property string $warehouse_id
 * @property string $requested_by
 * @property string|null $approved_by
 * @property string $status
 * @property \Illuminate\Support\Carbon $request_date
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $approver
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ProductionRequestItem> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\User|null $requester
 * @property-read \App\Models\Warehouse $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequest query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequest whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequest whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequest whereRequestDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequest whereRequestNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequest whereRequestedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequest whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequest whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductionRequest whereWarehouseId($value)
 * @mixin \Eloquent
 */
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
