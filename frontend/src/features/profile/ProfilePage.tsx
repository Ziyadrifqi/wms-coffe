import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertCircle, User, Lock } from 'lucide-react';
import { changePassword, updateProfile } from '../../api/auth.api';
import { useAuthStore } from '../../stores/authStore';
import { getErrorMessage } from '../../utils/getErrorMessage';

const profileSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Format email tidak valid'),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Password saat ini wajib diisi'),
  new_password: z.string().min(8, 'Password baru minimal 8 karakter'),
  new_password_confirmation: z.string(),
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: 'Konfirmasi password tidak cocok',
  path: ['new_password_confirmation'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'account' | 'password'>('account');
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);

  // --- Form Info Akun ---
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
    },
  });

  const profileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => updateProfile(data),
    onSuccess: (res) => {
      toast.success('Profil berhasil diperbarui');
      if (token) {
        const updated = (res.data as { data: typeof user }).data;
        if (updated) setAuth(updated, token);
      }
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const onSubmitProfile = (data: ProfileFormData) => profileMutation.mutate(data);

  // --- Form Ganti Password ---
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordFormData) => changePassword(data),
    onSuccess: () => {
      toast.success('Password berhasil diperbarui');
      resetPasswordForm();
      if (user && token) {
        setAuth({ ...user, must_change_password: false }, token);
      }
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const onSubmitPassword = (data: PasswordFormData) => passwordMutation.mutate(data);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profil Saya</h1>

      {user?.must_change_password && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-md p-4 mb-6 flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          Anda masih menggunakan password sementara. Segera ganti di bagian "Ganti Password" di bawah.
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 max-w-2xl">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === 'account' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <User size={16} /> Info Akun
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === 'password' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lock size={16} /> Ganti Password
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'account' ? (
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  {...registerProfile('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  {...registerProfile('email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                {profileErrors.email && <p className="text-red-500 text-xs mt-1">{profileErrors.email.message}</p>}
              </div>

              <div className="text-xs text-gray-400">
                Role: <span className="capitalize font-medium text-gray-600">{user?.roles?.[0] ?? '-'}</span>
              </div>

              <button
                type="submit"
                disabled={profileMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {profileMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4 max-w-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                <input
                  type="password"
                  {...registerPassword('current_password')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                {passwordErrors.current_password && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.current_password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                <input
                  type="password"
                  {...registerPassword('new_password')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                {passwordErrors.new_password && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.new_password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  {...registerPassword('new_password_confirmation')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                {passwordErrors.new_password_confirmation && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.new_password_confirmation.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={passwordMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {passwordMutation.isPending ? 'Menyimpan...' : 'Simpan Password Baru'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}