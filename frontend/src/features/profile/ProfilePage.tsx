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
import { TextField, PasswordField } from '../../components/common/FormField';
import Button from '../../components/common/Button';

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

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
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
      if (user && token) setAuth({ ...user, must_change_password: false }, token);
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-espresso mb-6">Profil Saya</h1>

      {user?.must_change_password && (
        <div className="bg-honey-light border border-honey/20 text-honey text-sm rounded-lg p-4 mb-6 flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          Anda masih menggunakan password sementara. Segera ganti di bagian "Ganti Password" di bawah.
        </div>
      )}

      <div className="bg-cream rounded-2xl border border-espresso/8 max-w-2xl shadow-sm shadow-espresso/[0.02]">
        <div className="flex border-b border-espresso/8">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'account' ? 'border-caramel text-caramel-dark' : 'border-transparent text-espresso/40 hover:text-espresso/70'
            }`}
          >
            <User size={15} /> Info Akun
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'password' ? 'border-caramel text-caramel-dark' : 'border-transparent text-espresso/40 hover:text-espresso/70'
            }`}
          >
            <Lock size={15} /> Ganti Password
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'account' ? (
            <form onSubmit={handleSubmitProfile((data) => profileMutation.mutate(data))} className="space-y-4">
              <TextField label="Nama" {...registerProfile('name')} error={profileErrors.name?.message} />
              <TextField label="Email" {...registerProfile('email')} error={profileErrors.email?.message} />

              <div className="text-xs text-espresso/35">
                Role: <span className="capitalize font-medium text-espresso/60">{user?.roles?.[0] ?? '-'}</span>
              </div>

              <Button type="submit" disabled={profileMutation.isPending}>
                {profileMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmitPassword((data) => passwordMutation.mutate(data))} className="space-y-4 max-w-sm">
              <PasswordField
                label="Password Saat Ini"
                autoComplete="current-password"
                {...registerPassword('current_password')}
                error={passwordErrors.current_password?.message}
              />
              <PasswordField
                label="Password Baru"
                autoComplete="new-password"
                {...registerPassword('new_password')}
                error={passwordErrors.new_password?.message}
              />
              <PasswordField
                label="Konfirmasi Password Baru"
                autoComplete="new-password"
                {...registerPassword('new_password_confirmation')}
                error={passwordErrors.new_password_confirmation?.message}
              />

              <Button type="submit" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending ? 'Menyimpan...' : 'Simpan Password Baru'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}