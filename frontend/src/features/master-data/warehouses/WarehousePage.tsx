import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '../../../components/common/DataTable';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/common/Pagination';
import { warehouseApi } from '../../../api/masterData.api';
import type { Warehouse } from '../../../types/masterData';
import WarehouseForm from './WarehouseForm';

export default function WarehousePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['warehouses', page, search],
    queryFn: () =>
      warehouseApi.list({ page, search, per_page: 10 }).then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => warehouseApi.delete(id),
    onSuccess: () => {
      toast.success('Warehouse berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: () => toast.error('Gagal menghapus warehouse'),
  });

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingWarehouse(null);
    setIsModalOpen(true);
  };

  const handleDelete = (warehouse: Warehouse) => {
    if (confirm(`Hapus warehouse "${warehouse.name}"?`)) {
      deleteMutation.mutate(warehouse.id);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['warehouses'] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Warehouse</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} /> Tambah Warehouse
        </button>
      </div>

      <input
        type="text"
        placeholder="Cari warehouse..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="w-full max-w-sm mb-4 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <DataTable<Warehouse>
        isLoading={isLoading}
        data={data?.data ?? []}
        columns={[
          { header: 'Kode', accessor: (row) => row.code },
          { header: 'Nama', accessor: (row) => row.name },
          { header: 'Alamat', accessor: (row) => row.address ?? '-' },
          {
            header: 'Status',
            accessor: (row) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  row.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {row.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            ),
          },
          {
            header: 'Aksi',
            accessor: (row) => (
              <div className="flex gap-2">
                <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(row)} className="text-red-600 hover:text-red-800">
                  <Trash2 size={16} />
                </button>
              </div>
            ),
          },
        ]}
      />

      <Pagination
        currentPage={data?.meta?.current_page ?? 1}
        lastPage={data?.meta?.last_page ?? 1}
        onPageChange={setPage}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWarehouse ? 'Edit Warehouse' : 'Tambah Warehouse'}
      >
        <WarehouseForm warehouse={editingWarehouse} onSuccess={handleFormSuccess} />
      </Modal>
    </div>
  );
}