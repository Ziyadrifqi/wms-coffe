<?php

namespace App\Http\Controllers\Api\V1\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreStockOpnameRequest;
use App\Http\Requests\Inventory\UpdateStockOpnameItemRequest;
use App\Http\Resources\Inventory\StockOpnameResource;
use App\Models\StockOpname;
use App\Services\Inventory\StockOpnameService;
use Illuminate\Http\Request;

class StockOpnameController extends Controller
{
    public function __construct(
        private StockOpnameService $service
    ) {}

    public function index(Request $request)
    {
        $opnames = StockOpname::query()
            ->with(['warehouse', 'creator'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->warehouse_id, fn($q) => $q->where('warehouse_id', $request->warehouse_id))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return StockOpnameResource::collection($opnames);
    }

    public function store(StoreStockOpnameRequest $request)
    {
        $opname = $this->service->create($request->validated(), $request->user()->id);

        return new StockOpnameResource($opname);
    }

    public function show(StockOpname $stockOpname)
    {
        $stockOpname->load(['warehouse', 'creator', 'items.material']);

        return new StockOpnameResource($stockOpname);
    }

    public function updateItems(UpdateStockOpnameItemRequest $request, StockOpname $stockOpname)
    {
        try {
            $opname = $this->service->updateItems($stockOpname, $request->validated()['items']);

            return new StockOpnameResource($opname);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function complete(Request $request, StockOpname $stockOpname)
    {
        abort_unless($request->user()->can('stock-opname.create'), 403);

        try {
            $opname = $this->service->complete($stockOpname, $request->user()->id);

            return new StockOpnameResource($opname);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
