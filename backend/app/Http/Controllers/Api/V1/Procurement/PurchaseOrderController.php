<?php

namespace App\Http\Controllers\Api\V1\Procurement;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\StorePurchaseOrderRequest;
use App\Http\Requests\Procurement\UpdatePurchaseOrderRequest;
use App\Http\Resources\Procurement\PurchaseOrderResource;
use App\Models\PurchaseOrder;
use App\Services\Procurement\PurchaseOrderService;
use Illuminate\Http\Request;

class PurchaseOrderController extends Controller
{
    public function __construct(
        private PurchaseOrderService $service
    ) {}

    public function index(Request $request)
    {
        $pos = PurchaseOrder::query()
            ->with(['supplier', 'warehouse', 'creator', 'approver'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->supplier_id, fn($q) => $q->where('supplier_id', $request->supplier_id))
            ->when($request->search, fn($q) => $q->where('po_number', 'ilike', "%{$request->search}%"))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return PurchaseOrderResource::collection($pos);
    }

    public function store(StorePurchaseOrderRequest $request)
    {
        $po = $this->service->create($request->validated(), $request->user()->id);

        return new PurchaseOrderResource($po);
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load(['supplier', 'warehouse', 'creator', 'approver', 'items.material']);

        return new PurchaseOrderResource($purchaseOrder);
    }

    public function update(UpdatePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder)
    {
        $po = $this->service->update($purchaseOrder, $request->validated());

        return new PurchaseOrderResource($po);
    }

    public function submit(Request $request, PurchaseOrder $purchaseOrder)
    {
        abort_unless($request->user()->can('purchase-order.edit'), 403);

        $po = $this->service->submitForApproval($purchaseOrder);

        return new PurchaseOrderResource($po);
    }

    public function approve(Request $request, PurchaseOrder $purchaseOrder)
    {
        abort_unless($request->user()->can('purchase-request.approve'), 403);

        $po = $this->service->approve($purchaseOrder, $request->user()->id);

        return new PurchaseOrderResource($po);
    }

    public function reject(Request $request, PurchaseOrder $purchaseOrder)
    {
        abort_unless($request->user()->can('purchase-request.approve'), 403);

        $po = $this->service->reject($purchaseOrder, $request->user()->id);

        return new PurchaseOrderResource($po);
    }
}
