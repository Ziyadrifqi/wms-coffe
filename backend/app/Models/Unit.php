<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use HasUuid;

    protected $fillable = ['name', 'symbol'];

    public function materials()
    {
        return $this->hasMany(Material::class);
    }
}
