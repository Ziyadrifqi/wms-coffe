<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStockOpnameItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('stock-opname.create');
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'uuid', 'exists:stock_opname_items,id'],
            'items.*.qty_actual' => ['required', 'numeric', 'min:0'],
            'items.*.notes' => ['nullable', 'string'],
        ];
    }
}
