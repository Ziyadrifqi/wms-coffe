<?php

namespace App\Exports;

use App\Models\StockMovement;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StockMovementExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    WithStyles,
    WithColumnFormatting,
    WithEvents,
    WithTitle,
    ShouldAutoSize
{
    private const TITLE_ROWS = 3;   // jumlah baris yang disisipkan di atas untuk judul & info filter
    private const HEADER_ROW = 4;   // posisi header SETELAH baris disisipkan
    private const FIRST_DATA_ROW = 5;

    private int $totalRows = 0;

    public function __construct(
        private Request $request
    ) {}

    public function collection()
    {
        $data = StockMovement::query()
            ->with(['material', 'warehouse', 'creator'])
            ->when($this->request->warehouse_id, fn($q) => $q->where('warehouse_id', $this->request->warehouse_id))
            ->when($this->request->material_ids, function ($q) {
                $materialIds = is_array($this->request->material_ids)
                    ? $this->request->material_ids
                    : explode(',', $this->request->material_ids);

                $q->whereIn('material_id', $materialIds);
            })
            ->when($this->request->type, fn($q) => $q->where('type', $this->request->type))
            ->when($this->request->date_from, fn($q) => $q->whereDate('created_at', '>=', $this->request->date_from))
            ->when($this->request->date_to, fn($q) => $q->whereDate('created_at', '<=', $this->request->date_to))
            ->orderBy('created_at', 'desc')
            ->get();

        $this->totalRows = $data->count();

        return $data;
    }

    public function headings(): array
    {
        return ['Tanggal', 'Material', 'Gudang', 'Tipe', 'Referensi', 'Qty', 'Qty Sebelum', 'Qty Sesudah', 'Catatan', 'Dibuat Oleh'];
    }

    public function map($movement): array
    {
        return [
            $movement->created_at->format('d/m/Y H:i'),
            $movement->material?->name,
            $movement->warehouse?->name,
            match ($movement->type) {
                'in' => 'Masuk',
                'out' => 'Keluar',
                'adjustment' => 'Penyesuaian',
                'transfer' => 'Transfer',
                default => ucfirst($movement->type),
            },
            str_replace('_', ' ', ucwords($movement->reference_type)),
            $movement->qty,
            $movement->qty_before,
            $movement->qty_after,
            $movement->notes,
            $movement->creator?->name,
        ];
    }

    public function title(): string
    {
        return 'Stock Movement';
    }

    public function columnFormats(): array
    {
        return [
            'F' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
            'G' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
            'H' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastColumn = 'J';

                $sheet->insertNewRowBefore(1, self::TITLE_ROWS);

                $lastDataRow = self::FIRST_DATA_ROW + $this->totalRows - 1;

                // ===== Judul Laporan =====
                $sheet->mergeCells("A1:{$lastColumn}1");
                $sheet->setCellValue('A1', 'LAPORAN STOCK MOVEMENT - WMS COFFEE');
                $sheet->getStyle('A1')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => '1E293B']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // ===== Info Filter =====
                $filterInfo = $this->buildFilterSummary();
                $sheet->mergeCells("A2:{$lastColumn}2");
                $sheet->setCellValue('A2', $filterInfo);
                $sheet->getStyle('A2')->applyFromArray([
                    'font' => ['italic' => true, 'size' => 9, 'color' => ['rgb' => '64748B']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // ===== Tanggal Cetak =====
                $sheet->mergeCells("A3:{$lastColumn}3");
                $sheet->setCellValue('A3', 'Dicetak pada: ' . now()->format('d F Y, H:i') . ' WIB');
                $sheet->getStyle('A3')->applyFromArray([
                    'font' => ['italic' => true, 'size' => 9, 'color' => ['rgb' => '94A3B8']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // ===== Style Header Tabel =====
                $sheet->getStyle("A" . self::HEADER_ROW . ":{$lastColumn}" . self::HEADER_ROW)->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '1E293B'],
                    ],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);

                if ($this->totalRows > 0) {
                    // ===== Border seluruh tabel =====
                    $sheet->getStyle("A" . self::HEADER_ROW . ":{$lastColumn}{$lastDataRow}")->applyFromArray([
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['rgb' => 'CBD5E1'],
                            ],
                        ],
                    ]);

                    // ===== Zebra stripe + warna kolom Tipe =====
                    for ($row = self::FIRST_DATA_ROW; $row <= $lastDataRow; $row++) {
                        if (($row - self::FIRST_DATA_ROW) % 2 === 1) {
                            $sheet->getStyle("A{$row}:{$lastColumn}{$row}")->applyFromArray([
                                'fill' => [
                                    'fillType' => Fill::FILL_SOLID,
                                    'startColor' => ['rgb' => 'F8FAFC'],
                                ],
                            ]);
                        }

                        $typeValue = $sheet->getCell("D{$row}")->getValue();
                        $color = match ($typeValue) {
                            'Masuk' => '16A34A',
                            'Keluar' => 'DC2626',
                            'Penyesuaian' => 'CA8A04',
                            default => '475569',
                        };
                        $sheet->getStyle("D{$row}")->applyFromArray([
                            'font' => ['bold' => true, 'color' => ['rgb' => $color]],
                        ]);
                    }

                    // ===== Auto filter dropdown =====
                    $sheet->setAutoFilter("A" . self::HEADER_ROW . ":{$lastColumn}{$lastDataRow}");

                    // ===== Ringkasan total =====
                    $summaryRow = $lastDataRow + 2;
                    $sheet->setCellValue("A{$summaryRow}", 'Total Transaksi:');
                    $sheet->setCellValue("B{$summaryRow}", $this->totalRows);
                    $sheet->getStyle("A{$summaryRow}:B{$summaryRow}")->applyFromArray([
                        'font' => ['bold' => true],
                    ]);
                }

                // ===== Freeze header =====
                $sheet->freezePane('A' . self::FIRST_DATA_ROW);

                // ===== Tinggi baris judul & header =====
                $sheet->getRowDimension(1)->setRowHeight(24);
                $sheet->getRowDimension(self::HEADER_ROW)->setRowHeight(22);
            },
        ];
    }

    private function buildFilterSummary(): string
    {
        $parts = [];

        if ($this->request->date_from || $this->request->date_to) {
            $from = $this->request->date_from ? date('d/m/Y', strtotime($this->request->date_from)) : '...';
            $to = $this->request->date_to ? date('d/m/Y', strtotime($this->request->date_to)) : '...';
            $parts[] = "Periode: {$from} - {$to}";
        }

        if ($this->request->type) {
            $typeLabel = match ($this->request->type) {
                'in' => 'Masuk',
                'out' => 'Keluar',
                'adjustment' => 'Penyesuaian',
                default => $this->request->type,
            };
            $parts[] = "Tipe: {$typeLabel}";
        }

        return count($parts) > 0 ? implode(' | ', $parts) : 'Semua Data (Tanpa Filter)';
    }
}
