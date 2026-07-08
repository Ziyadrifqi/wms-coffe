<?php

namespace App\Http\Controllers\Api\V1\Report;

use App\Http\Controllers\Controller;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use App\Exports\StockMovementExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;

class StockMovementReportController extends Controller
{
    public function index(Request $request)
    {
        $movements = $this->buildQuery($request)->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => collect($movements->items())->map(fn($m) => $this->formatMovement($m))->values(),
            'meta' => [
                'current_page' => $movements->currentPage(),
                'last_page' => $movements->lastPage(),
                'total' => $movements->total(),
            ],
        ]);
    }

    private function buildQuery(Request $request)
    {
        return StockMovement::query()
            ->with(['material', 'warehouse', 'creator'])
            ->when($request->warehouse_id, fn($q) => $q->where('warehouse_id', $request->warehouse_id))
            ->when($request->material_ids, function ($q) use ($request) {
                $materialIds = is_array($request->material_ids)
                    ? $request->material_ids
                    : explode(',', $request->material_ids);

                $q->whereIn('material_id', $materialIds);
            })
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->date_from, fn($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->orderBy('created_at', 'desc');
    }

    private function formatMovement($movement): array
    {
        return [
            'id' => $movement->id,
            'material' => $movement->material?->name,
            'warehouse' => $movement->warehouse?->name,
            'type' => $movement->type,
            'reference_type' => $movement->reference_type,
            'qty' => (float) $movement->qty,
            'qty_before' => (float) $movement->qty_before,
            'qty_after' => (float) $movement->qty_after,
            'notes' => $movement->notes,
            'created_by' => $movement->creator?->name,
            'created_at' => $movement->created_at->format('Y-m-d H:i:s'),
        ];
    }
    public function exportExcel(Request $request)
    {
        return Excel::download(new StockMovementExport($request), 'stock-movement-' . now()->format('Ymd-His') . '.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $movements = $this->buildQuery($request)->get();

        $pdf = Pdf::loadView('exports.stock-movement-pdf', ['movements' => $movements])
            ->setPaper('a4', 'landscape');

        return $pdf->download('stock-movement-' . now()->format('Ymd-His') . '.pdf');
    }
}
