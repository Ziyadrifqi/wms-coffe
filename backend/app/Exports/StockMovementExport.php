<?php

namespace App\Exports;

use App\Models\StockMovement;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StockMovementExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    public function __construct(
        private Request $request
    ) {}

    public function collection()
    {
        return StockMovement::query()
            ->with(['material', 'warehouse', 'creator'])
            ->when($this->request->warehouse_id, fn($q) => $q->where('warehouse_id', $this->request->warehouse_id))
            ->when($this->request->material_id, fn($q) => $q->where('material_id', $this->request->material_id))
            ->when($this->request->type, fn($q) => $q->where('type', $this->request->type))
            ->when($this->request->date_from, fn($q) => $q->whereDate('created_at', '>=', $this->request->date_from))
            ->when($this->request->date_to, fn($q) => $q->whereDate('created_at', '<=', $this->request->date_to))
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return ['Tanggal', 'Material', 'Gudang', 'Tipe', 'Referensi', 'Qty', 'Qty Sebelum', 'Qty Sesudah', 'Catatan', 'Dibuat Oleh'];
    }

    public function map($movement): array
    {
        return [
            $movement->created_at->format('Y-m-d H:i:s'),
            $movement->material?->name,
            $movement->warehouse?->name,
            ucfirst($movement->type),
            str_replace('_', ' ', ucfirst($movement->reference_type)),
            $movement->qty,
            $movement->qty_before,
            $movement->qty_after,
            $movement->notes,
            $movement->creator?->name,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
