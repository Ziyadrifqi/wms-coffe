import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil } from 'lucide-react';
import DataTable from '../../../components/common/DataTable';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/common/Pagination';
import { userManagementApi } from '../../../api/user.api';
import type { ManagedUser } from '../../../types/user';
import UserForm from './UserForm';

export default function UserPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => userManagementApi.list({ page, search, per_page: 10 }).then((res) => res.data),
  });

  const handleEdit = (user: ManagedUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} /> Tambah User
        </button>
      </div>

      <input
        type="text"
        placeholder="Cari nama atau email..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="w-full max-w-sm mb-4 px-3 py-2 border border-gray-300 rounded-md text-sm"
      />

      <DataTable<ManagedUser>
        isLoading={isLoading}
        data={data?.data ?? []}
        columns={[
          { header: 'Nama', accessor: (row) => row.name },
          { header: 'Email', accessor: (row) => row.email },
          {
            header: 'Role',
            accessor: (row) => (
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium capitalize">{row.role}</span>
            ),
          },
          {
            header: 'Status',
            accessor: (row) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {row.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            ),
          },
          {
            header: 'Password',
            accessor: (row) =>
              row.must_change_password ? (
                <span className="text-xs text-yellow-600">Belum diganti</span>
              ) : (
                <span className="text-xs text-gray-400">Sudah diganti</span>
              ),
          },
          {
            header: 'Aksi',
            accessor: (row) => (
              <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800">
                <Pencil size={16} />
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? 'Edit User' : 'Tambah User'}>
        <UserForm user={editingUser} onSuccess={handleFormSuccess} />
      </Modal>
    </div>
  );
}