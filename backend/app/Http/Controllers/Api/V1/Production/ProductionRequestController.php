<?php

namespace App\Http\Controllers\Api\V1\Production;

use App\Http\Controllers\Controller;
use App\Http\Requests\Production\FulfillProductionRequestRequest;
use App\Http\Requests\Production\StoreProductionRequestRequest;
use App\Http\Resources\Production\ProductionRequestResource;
use App\Models\ProductionRequest;
use App\Services\Production\ProductionRequestService;
use Illuminate\Http\Request;

class ProductionRequestController extends Controller
{
    public function __construct(
        private ProductionRequestService $service
    ) {}

    public function index(Request $request)
    {
        $items = ProductionRequest::query()
            ->with(['warehouse', 'requester', 'approver'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return ProductionRequestResource::collection($items);
    }

    public function store(StoreProductionRequestRequest $request)
    {
        $item = $this->service->create($request->validated(), $request->user()->id);

        return new ProductionRequestResource($item);
    }

    public function show(ProductionRequest $productionRequest)
    {
        $productionRequest->load(['warehouse', 'requester', 'approver', 'items.material']);

        return new ProductionRequestResource($productionRequest);
    }

    public function approve(Request $request, ProductionRequest $productionRequest)
    {
        abort_unless($request->user()->can('production-request.approve'), 403);

        try {
            $item = $this->service->approve($productionRequest, $request->user()->id);

            return new ProductionRequestResource($item);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function reject(Request $request, ProductionRequest $productionRequest)
    {
        abort_unless($request->user()->can('production-request.approve'), 403);

        $item = $this->service->reject($productionRequest, $request->user()->id);

        return new ProductionRequestResource($item);
    }

    public function fulfill(FulfillProductionRequestRequest $request, ProductionRequest $productionRequest)
    {
        try {
            $item = $this->service->fulfill($productionRequest, $request->validated(), $request->user()->id);

            return new ProductionRequestResource($item);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
