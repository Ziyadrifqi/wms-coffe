<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class StoreStockOpnameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('stock-opname.create');
    }

    public function rules(): array
    {
        return [
            'warehouse_id' => ['required', 'uuid', 'exists:warehouses,id'],
            'opname_date' => ['required', 'date'],
        ];
    }
}
