<?php

namespace App\Http\Requests\Production;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductionRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('production-request.create');
    }

    public function rules(): array
    {
        return [
            'warehouse_id' => ['required', 'uuid', 'exists:warehouses,id'],
            'request_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.material_id' => ['required', 'uuid', 'exists:materials,id'],
            'items.*.qty_requested' => ['required', 'numeric', 'min:0.01'],
        ];
    }
}