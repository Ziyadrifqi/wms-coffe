<?php

namespace App\Http\Requests\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class StoreGoodsReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('goods-receipt.create');
    }

    public function rules(): array
    {
        return [
            'purchase_order_id' => ['required', 'uuid', 'exists:purchase_orders,id'],
            'receipt_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.purchase_order_item_id' => ['required', 'uuid', 'exists:purchase_order_items,id'],
            'items.*.material_id' => ['required', 'uuid', 'exists:materials,id'],
            'items.*.qty_received' => ['required', 'numeric', 'min:0.01'],
            'items.*.expiry_date' => ['nullable', 'date'],
            'items.*.batch_number' => ['nullable', 'string', 'max:100'],
        ];
    }
}
