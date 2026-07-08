import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, FileText } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import { reportApi } from '../../api/report.api';
import { warehouseApi, materialApi } from '../../api/masterData.api';
import { downloadBlob } from '../../utils/downloadBlob';
import { getErrorMessage } from '../../utils/getErrorMessage';
import type { Warehouse, Material } from '../../types/masterData';
import type { StockMovementReportItem } from '../../types/report';

const typeLabels: Record<string, string> = {
  in: 'Masuk',
  out: 'Keluar',
  transfer: 'Transfer',
  adjustment: 'Penyesuaian',
};

export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const [warehouseId, setWarehouseId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [type, setType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filterParams = {
    warehouse_id: warehouseId || undefined,
    material_id: materialId || undefined,
    type: type || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  };

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses-all'],
    queryFn: () => warehouseApi.list({ per_page: 100 }).then((res) => res.data.data as Warehouse[]),
  });

  const { data: materials } = useQuery({
    queryKey: ['materials-all'],
    queryFn: () => materialApi.list({ per_page: 100 }).then((res) => res.data.data as Material[]),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['stock-movement-report', page, filterParams],
    queryFn: () =>
      reportApi.getStockMovements({ page, per_page: 15, ...filterParams }).then((res) => res.data),
  });

  const exportExcelMutation = useMutation({
    mutationFn: () => reportApi.exportExcel(filterParams),
    onSuccess: (res) => {
      downloadBlob(res.data as Blob, `stock-movement-${Date.now()}.xlsx`);
      toast.success('File Excel berhasil diunduh');
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Gagal mengunduh Excel')),
  });

  const exportPdfMutation = useMutation({
    mutationFn: () => reportApi.exportPdf(filterParams),
    onSuccess: (res) => {
      downloadBlob(res.data as Blob, `stock-movement-${Date.now()}.pdf`);
      toast.success('File PDF berhasil diunduh');
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Gagal mengunduh PDF')),
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Stock Movement</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportExcelMutation.mutate()}
            disabled={exportExcelMutation.isPending}
            className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            <Download size={16} /> {exportExcelMutation.isPending ? 'Mengunduh...' : 'Excel'}
          </button>
          <button
            onClick={() => exportPdfMutation.mutate()}
            disabled={exportPdfMutation.isPending}
            className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            <FileText size={16} /> {exportPdfMutation.isPending ? 'Mengunduh...' : 'PDF'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <select value={warehouseId} onChange={(e) => { setWarehouseId(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
          <option value="">Semua Gudang</option>
          {warehouses?.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>

        <select value={materialId} onChange={(e) => { setMaterialId(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
          <option value="">Semua Material</option>
          {materials?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>

        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
          <option value="">Semua Tipe</option>
          <option value="in">Masuk</option>
          <option value="out">Keluar</option>
          <option value="adjustment">Penyesuaian</option>
        </select>

        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
        <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
      </div>

      <DataTable<StockMovementReportItem>
        isLoading={isLoading}
        data={data?.data ?? []}
        columns={[
          { header: 'Tanggal', accessor: (row) => new Date(row.created_at).toLocaleString('id-ID') },
          { header: 'Material', accessor: (row) => row.material },
          { header: 'Gudang', accessor: (row) => row.warehouse },
          {
            header: 'Tipe',
            accessor: (row) => (
              <span className={row.type === 'in' ? 'text-green-600' : row.type === 'out' ? 'text-red-600' : 'text-yellow-600'}>
                {typeLabels[row.type]}
              </span>
            ),
          },
          { header: 'Qty', accessor: (row) => row.qty },
          { header: 'Dibuat Oleh', accessor: (row) => row.created_by },
        ]}
      />

      <Pagination
        currentPage={data?.meta?.current_page ?? 1}
        lastPage={data?.meta?.last_page ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}