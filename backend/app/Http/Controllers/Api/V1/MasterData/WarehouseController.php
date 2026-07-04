<?php

namespace App\Http\Controllers\Api\V1\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreWarehouseRequest;
use App\Http\Requests\MasterData\UpdateWarehouseRequest;
use App\Http\Resources\MasterData\WarehouseResource;
use App\Models\Warehouse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index(Request $request)
    {
        $warehouses = Warehouse::query()
            ->when($request->search, fn($q) => $q->where('name', 'ilike', "%{$request->search}%"))
            ->orderBy('name')
            ->paginate($request->per_page ?? 15);

        return WarehouseResource::collection($warehouses);
    }

    public function store(StoreWarehouseRequest $request)
    {
        $warehouse = Warehouse::create($request->validated());

        return new WarehouseResource($warehouse);
    }

    public function show(Warehouse $warehouse)
    {
        return new WarehouseResource($warehouse);
    }

    public function update(UpdateWarehouseRequest $request, Warehouse $warehouse)
    {
        $warehouse->update($request->validated());

        return new WarehouseResource($warehouse);
    }

    public function destroy(Request $request, Warehouse $warehouse)
    {
        abort_unless($request->user()->can('master-data.delete'), 403);

        $warehouse->delete();

        return response()->json(['message' => 'Warehouse berhasil dihapus.']);
    }
}
