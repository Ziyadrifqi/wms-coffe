<?php

namespace App\Http\Controllers\Api\V1\Procurement;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\StoreGoodsReceiptRequest;
use App\Http\Resources\Procurement\GoodsReceiptResource;
use App\Models\GoodsReceipt;
use App\Services\Procurement\GoodsReceiptService;
use Illuminate\Http\Request;

class GoodsReceiptController extends Controller
{
    public function __construct(
        private GoodsReceiptService $service
    ) {}

    public function index(Request $request)
    {
        $grs = GoodsReceipt::query()
            ->with(['purchaseOrder', 'warehouse', 'receiver'])
            ->when($request->purchase_order_id, fn($q) => $q->where('purchase_order_id', $request->purchase_order_id))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return GoodsReceiptResource::collection($grs);
    }

    public function store(StoreGoodsReceiptRequest $request)
    {
        try {
            $gr = $this->service->create($request->validated(), $request->user()->id);

            return new GoodsReceiptResource($gr);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(GoodsReceipt $goodsReceipt)
    {
        $goodsReceipt->load(['purchaseOrder', 'warehouse', 'receiver', 'items.material']);

        return new GoodsReceiptResource($goodsReceipt);
    }
}
