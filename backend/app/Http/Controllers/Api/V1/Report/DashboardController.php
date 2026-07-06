<?php

namespace App\Http\Controllers\Api\V1\Report;

use App\Http\Controllers\Controller;
use App\Services\Report\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $service
    ) {}

    public function kpis(Request $request)
    {
        return response()->json(['data' => $this->service->getKpis($request->warehouse_id)]);
    }

    public function stockTrend(Request $request)
    {
        $days = (int) ($request->days ?? 14);

        return response()->json(['data' => $this->service->getStockTrend($days, $request->warehouse_id)]);
    }

    public function lowStock(Request $request)
    {
        return response()->json(['data' => $this->service->getLowStockMaterials($request->warehouse_id)]);
    }

    public function expiringStock(Request $request)
    {
        $days = (int) ($request->days ?? 7);

        return response()->json(['data' => $this->service->getExpiringStock($days, $request->warehouse_id)]);
    }

    public function recentActivity(Request $request)
    {
        $limit = (int) ($request->limit ?? 10);

        return response()->json(['data' => $this->service->getRecentActivity($limit, $request->warehouse_id)]);
    }
}
