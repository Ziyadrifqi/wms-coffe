import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/common/Button';
import PageHeader from '../../../components/common/PageHeader';
import { stockOpnameApi } from '../../../api/inventory.api';
import type { StockOpname } from '../../../types/inventory';

export default function StockOpnamePage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['stock-opnames', page],
    queryFn: () => stockOpnameApi.list({ page, per_page: 10 }).then((res) => res.data),
  });

  return (
    <div>
      <PageHeader
        title="Stock Opname"
        actions={
          <Button onClick={() => navigate('/inventory/stock-opnames/new')} className="flex items-center gap-2">
            <Plus size={16} /> Buat Opname
          </Button>
        }
      />

      <DataTable<StockOpname>
        isLoading={isLoading}
        data={data?.data ?? []}
        columns={[
          { header: 'No. Opname', accessor: (row) => row.opname_number },
          { header: 'Gudang', accessor: (row) => row.warehouse.name, className: 'font-sans' },
          { header: 'Tanggal', accessor: (row) => row.opname_date },
          { header: 'Dibuat oleh', accessor: (row) => row.created_by, className: 'font-sans' },
          { header: 'Status', accessor: (row) => <StatusBadge status={row.status} /> },
          {
            header: 'Aksi',
            accessor: (row) => (
              <button onClick={() => navigate(`/inventory/stock-opnames/${row.id}`)} className="text-caramel hover:text-caramel-dark">
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