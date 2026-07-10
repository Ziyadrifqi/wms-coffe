import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, FileText, RotateCcw } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import MultiSelectSearch from '../../components/common/MultiSelectSearch';
import PageHeader from '../../components/common/PageHeader';
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
  const [materialIds, setMaterialIds] = useState<string[]>([]);
  const [type, setType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filterParams = {
    warehouse_id: warehouseId || undefined,
    material_ids: materialIds.length > 0 ? materialIds : undefined,
    type: type || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  };

  const hasActiveFilter = !!(warehouseId || materialIds.length > 0 || type || dateFrom || dateTo);

  const handleResetFilter = () => {
    setWarehouseId('');
    setMaterialIds([]);
    setType('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses-all'],
    queryFn: () => warehouseApi.list({ per_page: 100 }).then((res) => res.data.data as Warehouse[]),
  });

  const { data: materials } = useQuery({
    queryKey: ['materials-all'],
    queryFn: () => materialApi.list({ per_page: 100 }).then((res) => res.data.data as Material[]),
  });

  const materialOptions = (materials ?? []).map((m) => ({ id: m.id, label: m.name }));

  const { data, isLoading } = useQuery({
    queryKey: ['stock-movement-report', page, filterParams],
    queryFn: () => reportApi.getStockMovements({ page, per_page: 15, ...filterParams }).then((res) => res.data),
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
      <PageHeader
        title="Laporan Stock Movement"
        actions={
          <>
            <button
              onClick={() => exportExcelMutation.mutate()}
              disabled={exportExcelMutation.isPending}
              className="flex items-center gap-2 border border-espresso/15 text-espresso px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-espresso/5 disabled:opacity-50 transition"
            >
              <Download size={16} /> {exportExcelMutation.isPending ? 'Mengunduh...' : 'Excel'}
            </button>
            <button
              onClick={() => exportPdfMutation.mutate()}
              disabled={exportPdfMutation.isPending}
              className="flex items-center gap-2 border border-espresso/15 text-espresso px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-espresso/5 disabled:opacity-50 transition"
            >
              <FileText size={16} /> {exportPdfMutation.isPending ? 'Mengunduh...' : 'PDF'}
            </button>
          </>
        }
      />

      <div className="bg-cream rounded-2xl border border-espresso/8 p-4 mb-4 shadow-sm shadow-espresso/[0.02]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select
            value={warehouseId}
            onChange={(e) => { setWarehouseId(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 bg-latte/50 border border-espresso/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/40"
          >
            <option value="">Semua Gudang</option>
            {warehouses?.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>

          <MultiSelectSearch
            options={materialOptions}
            selectedIds={materialIds}
            onChange={(ids) => { setMaterialIds(ids); setPage(1); }}
            placeholder="Semua Material"
          />

          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 bg-latte/50 border border-espresso/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/40"
          >
            <option value="">Semua Tipe</option>
            <option value="in">Masuk</option>
            <option value="out">Keluar</option>
            <option value="adjustment">Penyesuaian</option>
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 bg-latte/50 border border-espresso/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/40"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 bg-latte/50 border border-espresso/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/40"
          />
        </div>

        {hasActiveFilter && (
          <button
            onClick={handleResetFilter}
            className="flex items-center gap-1.5 text-xs text-espresso/40 hover:text-clay mt-3 transition"
          >
            <RotateCcw size={13} /> Reset semua filter
          </button>
        )}
      </div>

      <DataTable<StockMovementReportItem>
        isLoading={isLoading}
        data={data?.data ?? []}
        columns={[
          { header: 'Tanggal', accessor: (row) => new Date(row.created_at).toLocaleString('id-ID') },
          { header: 'Material', accessor: (row) => row.material, className: 'font-sans' },
          { header: 'Gudang', accessor: (row) => row.warehouse, className: 'font-sans' },
          {
            header: 'Tipe',
            accessor: (row) => (
              <span className={
                row.type === 'in' ? 'text-moss font-medium' :
                row.type === 'out' ? 'text-clay font-medium' :
                'text-honey font-medium'
              }>
                {typeLabels[row.type]}
              </span>
            ),
          },
          { header: 'Qty', accessor: (row) => row.qty },
          { header: 'Dibuat Oleh', accessor: (row) => row.created_by, className: 'font-sans' },
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