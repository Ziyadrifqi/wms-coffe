import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userManagementApi } from '../../../api/user.api';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { TextField, SelectField } from '../../../components/common/FormField';
import Button from '../../../components/common/Button';
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

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
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

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
      {!isEdit && (
        <div className="bg-caramel/8 border border-caramel/15 text-caramel-dark text-xs rounded-lg p-3">
          Password sementara akan otomatis dibuat sistem dan dikirim ke email user. User akan diminta mengganti password saat login pertama.
        </div>
      )}

      <TextField label="Nama" {...register('name')} error={errors.name?.message} />
      <TextField label="Email" {...register('email')} error={errors.email?.message} />

      <SelectField label="Role" {...register('role')} error={errors.role?.message}>
        <option value="">Pilih role</option>
        {roles?.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
      </SelectField>

      {isEdit && (
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('is_active')} className="rounded accent-caramel" />
          <span className="text-sm text-espresso/70">Aktif</span>
        </label>
      )}

      <Button type="submit" fullWidth disabled={mutation.isPending}>
        {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
      </Button>
    </form>
  );
}