import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/common/Button';
import PageHeader from '../../../components/common/PageHeader';
import { purchaseOrderApi } from '../../../api/procurement.api';
import type { PurchaseOrder } from '../../../types/procurement';

export default function PurchaseOrderPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders', page, status],
    queryFn: () => purchaseOrderApi.list({ page, status: status || undefined, per_page: 10 }).then((res) => res.data),
  });

  return (
    <div>
      <PageHeader
        title="Purchase Order"
        actions={
          <Button onClick={() => navigate('/procurement/purchase-orders/new')} className="flex items-center gap-2">
            <Plus size={16} /> Buat PO
          </Button>
        }
      />

      <select
        value={status}
        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        className="mb-4 px-3.5 py-2.5 bg-cream border border-espresso/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/40"
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
          { header: 'Supplier', accessor: (row) => row.supplier.name, className: 'font-sans' },
          { header: 'Gudang', accessor: (row) => row.warehouse.name, className: 'font-sans' },
          { header: 'Tanggal', accessor: (row) => row.order_date },
          { header: 'Total', accessor: (row) => `Rp ${Number(row.total_amount).toLocaleString('id-ID')}` },
          { header: 'Status', accessor: (row) => <StatusBadge status={row.status} /> },
          {
            header: 'Aksi',
            accessor: (row) => (
              <button onClick={() => navigate(`/procurement/purchase-orders/${row.id}`)} className="text-caramel hover:text-caramel-dark">
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