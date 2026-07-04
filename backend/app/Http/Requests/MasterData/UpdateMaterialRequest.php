<?php

namespace App\Http\Requests\MasterData;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('master-data.edit');
    }

    public function rules(): array
    {
        $materialId = $this->route('material')->id;

        return [
            'sku' => ['required', 'string', 'max:50', Rule::unique('materials', 'sku')->ignore($materialId)],
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'uuid', 'exists:categories,id'],
            'unit_id' => ['required', 'uuid', 'exists:units,id'],
            'min_stock' => ['nullable', 'numeric', 'min:0'],
            'is_perishable' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }
}
