import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '../../../components/common/DataTable';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/common/Pagination';
import Button from '../../../components/common/Button';
import PageHeader from '../../../components/common/PageHeader';
import { materialApi } from '../../../api/masterData.api';
import type { Material } from '../../../types/masterData';
import MaterialForm from './MaterialForm';

export default function MaterialPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['materials', page, search],
    queryFn: () => materialApi.list({ page, search, per_page: 10 }).then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => materialApi.delete(id),
    onSuccess: () => {
      toast.success('Material berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
    onError: () => toast.error('Gagal menghapus material'),
  });

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const handleDelete = (material: Material) => {
    if (confirm(`Hapus material "${material.name}"?`)) {
      deleteMutation.mutate(material.id);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['materials'] });
  };

  return (
    <div>
      <PageHeader
        title="Material"
        actions={
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus size={16} /> Tambah Material
          </Button>
        }
      />

      <input
        type="text"
        placeholder="Cari material..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full sm:max-w-sm mb-4 px-3.5 py-2.5 bg-cream border border-espresso/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/40"
      />

      <DataTable<Material>
        isLoading={isLoading}
        data={data?.data ?? []}
        columns={[
          { header: 'SKU', accessor: (row) => row.sku },
          { header: 'Nama', accessor: (row) => row.name, className: 'font-sans' },
          { header: 'Kategori', accessor: (row) => row.category?.name ?? '-', className: 'font-sans' },
          { header: 'Satuan', accessor: (row) => row.unit?.symbol ?? '-' },
          { header: 'Min. Stok', accessor: (row) => `${row.min_stock} ${row.unit?.symbol ?? ''}` },
          {
            header: 'Perishable',
            accessor: (row) => (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.is_perishable ? 'bg-honey-light text-honey' : 'bg-espresso/8 text-espresso/40'}`}>
                {row.is_perishable ? 'Ya' : 'Tidak'}
              </span>
            ),
          },
          {
            header: 'Status',
            accessor: (row) => (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.is_active ? 'bg-moss-light text-moss' : 'bg-espresso/8 text-espresso/40'}`}>
                {row.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            ),
          },
          {
            header: 'Aksi',
            accessor: (row) => (
              <div className="flex gap-3">
                <button onClick={() => handleEdit(row)} className="text-caramel hover:text-caramel-dark">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(row)} className="text-clay/70 hover:text-clay">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMaterial ? 'Edit Material' : 'Tambah Material'}>
        <MaterialForm material={editingMaterial} onSuccess={handleFormSuccess} />
      </Modal>
    </div>
  );
}