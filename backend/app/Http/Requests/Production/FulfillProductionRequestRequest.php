<?php

namespace App\Http\Requests\Production;

use Illuminate\Foundation\Http\FormRequest;

class FulfillProductionRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('production-request.view'); // gudang yang penuhi
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.production_request_item_id' => ['required', 'uuid', 'exists:production_request_items,id'],
            'items.*.qty_fulfilled' => ['required', 'numeric', 'min:0.01'],
        ];
    }
}
