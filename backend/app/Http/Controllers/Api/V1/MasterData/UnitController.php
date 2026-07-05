<?php

namespace App\Http\Controllers\Api\V1\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index(Request $request)
    {
        $units = Unit::query()
            ->orderBy('name')
            ->paginate($request->per_page ?? 100);

        return response()->json([
            'data' => $units->items(),
            'meta' => [
                'current_page' => $units->currentPage(),
                'last_page' => $units->lastPage(),
                'total' => $units->total(),
            ],
        ]);
    }
}
