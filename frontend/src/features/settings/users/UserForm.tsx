import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userManagementApi } from '../../../api/user.api';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import type { ManagedUser } from '../../../types/user';

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  role: z.string().min(1, 'Pilih role'),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  user: ManagedUser | null;
  onSuccess: () => void;
}

export default function UserForm({ user, onSuccess }: Props) {
  const isEdit = !!user;

  const { data: roles } = useQuery({
    queryKey: ['roles-all'],
    queryFn: () => userManagementApi.getRoles().then((res) => res.data.data),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      role: user?.role ?? '',
      is_active: user?.is_active ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => (isEdit ? userManagementApi.update(user!.id, data) : userManagementApi.create(data)),
    onSuccess: () => {
      toast.success(
        isEdit
          ? 'User berhasil diperbarui'
          : 'User berhasil dibuat, kredensial login telah dikirim ke email yang bersangkutan'
      );
      onSuccess();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!isEdit && (
        <div className="bg-blue-50 border border-blue-100 text-blue-700 text-xs rounded-md p-3">
          Password sementara akan otomatis dibuat sistem dan dikirim ke email user. User akan diminta mengganti password saat login pertama.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
        <input {...register('name')} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input {...register('email')} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select {...register('role')} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
          <option value="">Pilih role</option>
          {roles?.map((r) => (
            <option key={r} value={r} className="capitalize">{r}</option>
          ))}
        </select>
        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
      </div>

      {isEdit && (
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('is_active')} className="rounded" />
          <span className="text-sm text-gray-700">Aktif</span>
        </label>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  );
}