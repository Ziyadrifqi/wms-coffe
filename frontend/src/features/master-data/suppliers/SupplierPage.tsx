import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '../../../components/common/DataTable';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/common/Pagination';
import { supplierApi } from '../../../api/masterData.api';
import type { Supplier } from '../../../types/masterData';
import SupplierForm from './SupplierForm';

export default function SupplierPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', page, search],
    queryFn: () =>
      supplierApi.list({ page, search, per_page: 10 }).then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => supplierApi.delete(id),
    onSuccess: () => {
      toast.success('Supplier berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: () => toast.error('Gagal menghapus supplier'),
  });

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleDelete = (supplier: Supplier) => {
    if (confirm(`Hapus supplier "${supplier.name}"?`)) {
      deleteMutation.mutate(supplier.id);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['suppliers'] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Supplier</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} /> Tambah Supplier
        </button>
      </div>

      <input
        type="text"
        placeholder="Cari supplier..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="w-full max-w-sm mb-4 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <DataTable<Supplier>
        isLoading={isLoading}
        data={data?.data ?? []}
        columns={[
          { header: 'Kode', accessor: (row) => row.code },
          { header: 'Nama', accessor: (row) => row.name },
          { header: 'Telepon', accessor: (row) => row.phone ?? '-' },
          { header: 'Email', accessor: (row) => row.email ?? '-' },
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
        title={editingSupplier ? 'Edit Supplier' : 'Tambah Supplier'}
      >
        <SupplierForm supplier={editingSupplier} onSuccess={handleFormSuccess} />
      </Modal>
    </div>
  );
}