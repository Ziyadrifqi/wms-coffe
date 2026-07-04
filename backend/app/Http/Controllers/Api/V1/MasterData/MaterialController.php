<?php

namespace App\Http\Controllers\Api\V1\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreMaterialRequest;
use App\Http\Requests\MasterData\UpdateMaterialRequest;
use App\Http\Resources\MasterData\MaterialResource;
use App\Models\Material;
use Illuminate\Http\Request;

class MaterialController extends Controller
{
    public function index(Request $request)
    {
        $materials = Material::query()
            ->with(['category', 'unit']) // eager loading, hindari N+1
            ->when($request->search, fn($q) => $q->where('name', 'ilike', "%{$request->search}%")
                ->orWhere('sku', 'ilike', "%{$request->search}%"))
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->when($request->has('is_active'), fn($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('name')
            ->paginate($request->per_page ?? 15);

        return MaterialResource::collection($materials);
    }

    public function store(StoreMaterialRequest $request)
    {
        $material = Material::create($request->validated());
        $material->load(['category', 'unit']);

        return new MaterialResource($material);
    }

    public function show(Material $material)
    {
        $material->load(['category', 'unit']);

        return new MaterialResource($material);
    }

    public function update(UpdateMaterialRequest $request, Material $material)
    {
        $material->update($request->validated());
        $material->load(['category', 'unit']);

        return new MaterialResource($material);
    }

    public function destroy(Request $request, Material $material)
    {
        abort_unless($request->user()->can('master-data.delete'), 403);

        $material->delete();

        return response()->json(['message' => 'Material berhasil dihapus.']);
    }
}
