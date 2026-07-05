import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '../../../components/common/DataTable';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/common/Pagination';
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
    queryFn: () =>
      materialApi.list({ page, search, per_page: 10 }).then((res) => res.data),
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Material</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} /> Tambah Material
        </button>
      </div>

      <input
        type="text"
        placeholder="Cari material..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="w-full max-w-sm mb-4 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <DataTable<Material>
        isLoading={isLoading}
        data={data?.data ?? []}
        columns={[
          { header: 'SKU', accessor: (row) => row.sku },
          { header: 'Nama', accessor: (row) => row.name },
          { header: 'Kategori', accessor: (row) => row.category?.name ?? '-' },
          { header: 'Satuan', accessor: (row) => row.unit?.symbol ?? '-' },
          { header: 'Min. Stok', accessor: (row) => `${row.min_stock} ${row.unit?.symbol ?? ''}` },
          {
            header: 'Perishable',
            accessor: (row) => (row.is_perishable ? 'Ya' : 'Tidak'),
          },
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
        title={editingMaterial ? 'Edit Material' : 'Tambah Material'}
      >
        <MaterialForm material={editingMaterial} onSuccess={handleFormSuccess} />
      </Modal>
    </div>
  );
}