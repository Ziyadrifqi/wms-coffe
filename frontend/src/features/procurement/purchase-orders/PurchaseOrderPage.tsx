import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';
import StatusBadge from '../../../components/common/StatusBadge';
import { purchaseOrderApi } from '../../../api/procurement.api';
import type { PurchaseOrder } from '../../../types/procurement';

export default function PurchaseOrderPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders', page, status],
    queryFn: () =>
      purchaseOrderApi.list({ page, status: status || undefined, per_page: 10 }).then((res) => res.data),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Purchase Order</h1>
        <button
          onClick={() => navigate('/procurement/purchase-orders/new')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} /> Buat PO
        </button>
      </div>

      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setPage(1);
        }}
        className="mb-4 px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        <option value="">Semua Status</option>
        <option value="draft">Draft</option>
        <option value="pending">Menunggu Approval</option>
        <option value="approved">Disetujui</option>
        <option value="rejected">Ditolak</option>
        <option value="completed">Selesai</option>
      </select>

      <DataTable<PurchaseOrder>
        isLoading={isLoading}
        data={data?.data ?? []}
        columns={[
          { header: 'No. PO', accessor: (row) => row.po_number },
          { header: 'Supplier', accessor: (row) => row.supplier.name },
          { header: 'Gudang', accessor: (row) => row.warehouse.name },
          { header: 'Tanggal', accessor: (row) => row.order_date },
          {
            header: 'Total',
            accessor: (row) => `Rp ${Number(row.total_amount).toLocaleString('id-ID')}`,
          },
          { header: 'Status', accessor: (row) => <StatusBadge status={row.status} /> },
          {
            header: 'Aksi',
            accessor: (row) => (
              <button
                onClick={() => navigate(`/procurement/purchase-orders/${row.id}`)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Eye size={16} />
              </button>
            ),
          },
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