import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import { productionRequestApi } from '../../api/production.api';
import type { ProductionRequest } from '../../types/production';
import { useAuthStore } from '../../stores/authStore';

export default function ProductionRequestPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const { data, isLoading } = useQuery({
    queryKey: ['production-requests', page, status],
    queryFn: () => productionRequestApi.list({ page, status: status || undefined, per_page: 10 }).then((res) => res.data),
  });

  return (
    <div>
      <PageHeader
        title="Production Request"
        actions={
           hasPermission('master-data.create') ? (
          <Button onClick={() => navigate('/production/requests/new')} className="flex items-center gap-2">
            <Plus size={16} /> Buat Request
          </Button>
           ) : undefined
        }
      />

      <select
        value={status}
        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        className="mb-4 px-3.5 py-2.5 bg-cream border border-espresso/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/40"
      >
        <option value="">Semua Status</option>
        <option value="pending">Menunggu Approval</option>
        <option value="approved">Disetujui</option>
        <option value="rejected">Ditolak</option>
        <option value="fulfilled">Selesai</option>
      </select>

      <DataTable<ProductionRequest>
        isLoading={isLoading}
        data={data?.data ?? []}
        columns={[
          { header: 'No. Request', accessor: (row) => row.request_number },
          { header: 'Gudang', accessor: (row) => row.warehouse.name, className: 'font-sans' },
          { header: 'Tanggal', accessor: (row) => row.request_date },
          { header: 'Diminta oleh', accessor: (row) => row.requested_by, className: 'font-sans' },
          { header: 'Status', accessor: (row) => <StatusBadge status={row.status} /> },
          {
            header: 'Aksi',
            accessor: (row) => (
              <button onClick={() => navigate(`/production/requests/${row.id}`)} className="text-caramel hover:text-caramel-dark">
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