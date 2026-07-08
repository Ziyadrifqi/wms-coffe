import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { changePassword } from '../../api/auth.api';
import { useAuthStore } from '../../stores/authStore';
import { getErrorMessage } from '../../utils/getErrorMessage';

const schema = z.object({
  current_password: z.string().min(1, 'Password saat ini wajib diisi'),
  new_password: z.string().min(8, 'Password baru minimal 8 karakter'),
  new_password_confirmation: z.string(),
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: 'Konfirmasi password tidak cocok',
  path: ['new_password_confirmation'],
});

type FormData = z.infer<typeof schema>;

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) => changePassword(data),
    onSuccess: () => {
      toast.success('Password berhasil diperbarui');
      if (user && token) {
        setAuth({ ...user, must_change_password: false }, token);
      }
      navigate('/dashboard');
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ganti Password</h1>

      {user?.must_change_password && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-md p-4 mb-6">
          Anda menggunakan password sementara. Demi keamanan, harap segera ganti password Anda.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
          <input type="password" {...register('current_password')} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          {errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
          <input type="password" {...register('new_password')} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          {errors.new_password && <p className="text-red-500 text-xs mt-1">{errors.new_password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
          <input type="password" {...register('new_password_confirmation')} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          {errors.new_password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.new_password_confirmation.message}</p>}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Menyimpan...' : 'Simpan Password Baru'}
        </button>
      </form>
    </div>
  );
}