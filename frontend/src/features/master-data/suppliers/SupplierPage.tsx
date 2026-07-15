import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '../../../components/common/DataTable';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/common/Pagination';
import Button from '../../../components/common/Button';
import PageHeader from '../../../components/common/PageHeader';
import { supplierApi } from '../../../api/masterData.api';
import { useAuthStore } from '../../../stores/authStore';
import type { Supplier } from '../../../types/masterData';
import SupplierForm from './SupplierForm';

export default function SupplierPage() {
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', page, search],
    queryFn: () => supplierApi.list({ page, search, per_page: 10 }).then((res) => res.data),
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

  const canEdit = hasPermission('master-data.edit');
  const canDelete = hasPermission('master-data.delete');
  const showActionColumn = canEdit || canDelete;

  return (
    <div>
      <PageHeader
        title="Supplier"
        actions={
          hasPermission('master-data.create') ? (
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Plus size={16} /> Tambah Supplier
            </Button>
          ) : undefined
        }
      />

      <input
        type="text"
        placeholder="Cari supplier..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full sm:max-w-sm mb-4 px-3.5 py-2.5 bg-cream border border-espresso/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/40"
      />

      <DataTable<Supplier>
        isLoading={isLoading}
        data={data?.data ?? []}
        columns={[
          { header: 'Kode', accessor: (row) => row.code },
          { header: 'Nama', accessor: (row) => row.name, className: 'font-sans' },
          { header: 'Telepon', accessor: (row) => row.phone ?? '-' },
          { header: 'Email', accessor: (row) => row.email ?? '-' },
          {
            header: 'Status',
            accessor: (row) => (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.is_active ? 'bg-moss-light text-moss' : 'bg-espresso/8 text-espresso/40'}`}>
                {row.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            ),
          },
          ...(showActionColumn ? [{
            header: 'Aksi',
            accessor: (row: Supplier) => (
              <div className="flex gap-3">
                {canEdit && (
                  <button onClick={() => handleEdit(row)} className="text-caramel hover:text-caramel-dark">
                    <Pencil size={16} />
                  </button>
                )}
                {canDelete && (
                  <button onClick={() => handleDelete(row)} className="text-clay/70 hover:text-clay">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ),
          }] : []),
        ]}
      />

      <Pagination
        currentPage={data?.meta?.current_page ?? 1}
        lastPage={data?.meta?.last_page ?? 1}
        onPageChange={setPage}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSupplier ? 'Edit Supplier' : 'Tambah Supplier'}>
        <SupplierForm supplier={editingSupplier} onSuccess={handleFormSuccess} />
      </Modal>
    </div>
  );
}