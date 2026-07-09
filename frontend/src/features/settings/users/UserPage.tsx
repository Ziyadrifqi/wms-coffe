import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil } from 'lucide-react';
import DataTable from '../../../components/common/DataTable';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/common/Pagination';
import Button from '../../../components/common/Button';
import PageHeader from '../../../components/common/PageHeader';
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
      <PageHeader
        title="Manajemen User"
        actions={
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus size={16} /> Tambah User
          </Button>
        }
      />

      <input
        type="text"
        placeholder="Cari nama atau email..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full sm:max-w-sm mb-4 px-3.5 py-2.5 bg-cream border border-espresso/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/40"
      />

      <DataTable<ManagedUser>
        isLoading={isLoading}
        data={data?.data ?? []}
        columns={[
          { header: 'Nama', accessor: (row) => row.name, className: 'font-sans' },
          { header: 'Email', accessor: (row) => row.email },
          {
            header: 'Role',
            accessor: (row) => (
              <span className="px-2.5 py-1 bg-caramel/10 text-caramel-dark rounded-full text-xs font-medium capitalize">
                {row.role}
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
            header: 'Password',
            accessor: (row) =>
              row.must_change_password ? (
                <span className="text-xs text-honey font-medium">Belum diganti</span>
              ) : (
                <span className="text-xs text-espresso/30">Sudah diganti</span>
              ),
          },
          {
            header: 'Aksi',
            accessor: (row) => (
              <button onClick={() => handleEdit(row)} className="text-caramel hover:text-caramel-dark">
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