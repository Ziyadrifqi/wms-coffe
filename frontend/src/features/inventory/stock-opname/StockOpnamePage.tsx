import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';
import StatusBadge from '../../../components/common/StatusBadge';
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stock Opname</h1>
        <button
          onClick={() => navigate('/inventory/stock-opnames/new')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} /> Buat Opname
        </button>
      </div>

      <DataTable<StockOpname>
        isLoading={isLoading}
        data={data?.data ?? []}
        columns={[
          { header: 'No. Opname', accessor: (row) => row.opname_number },
          { header: 'Gudang', accessor: (row) => row.warehouse.name },
          { header: 'Tanggal', accessor: (row) => row.opname_date },
          { header: 'Dibuat oleh', accessor: (row) => row.created_by },
          { header: 'Status', accessor: (row) => <StatusBadge status={row.status} /> },
          {
            header: 'Aksi',
            accessor: (row) => (
              <button
                onClick={() => navigate(`/inventory/stock-opnames/${row.id}`)}
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