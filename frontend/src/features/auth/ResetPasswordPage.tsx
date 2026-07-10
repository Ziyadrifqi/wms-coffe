import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Coffee, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '../../api/auth.api';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { PasswordField } from '../../components/common/FormField';
import Button from '../../components/common/Button';

const schema = z.object({
  password: z.string().min(8, 'Password minimal 8 karakter'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Konfirmasi password tidak cocok',
  path: ['password_confirmation'],
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => resetPassword({ token, email, ...data }),
    onSuccess: () => setSuccess(true),
    onError: (err: unknown) => setError(getErrorMessage(err)),
  });

  const onSubmit = (data: FormData) => {
    setError('');
    mutation.mutate(data);
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f3ead9] paper-grain font-plex px-6">
        <div className="w-full max-w-[380px] text-center fade-up">
          <p className="text-[#6b6355] text-sm mb-6">Tautan reset kata sandi tidak valid atau sudah kedaluwarsa.</p>
          <div className="flex flex-col gap-3">
            <Link
              to="/forgot-password"
              className="font-plex-mono text-[12px] text-[#8a3324] hover:underline"
            >
              Minta tautan baru →
            </Link>
            <Link
              to="/login"
              className="font-plex-mono text-[12px] text-[#a89c85] hover:text-[#8a3324]"
            >
              ← kembali ke halaman masuk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-latte relative overflow-hidden px-4">
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-caramel/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full bg-roast/10 blur-3xl" />

      <div className="w-full max-w-sm bg-cream rounded-2xl shadow-xl shadow-espresso/5 border border-espresso/5 p-8 relative animate-page-in">
        {success ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-moss-light flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={22} className="text-moss" />
            </div>
            <h1 className="font-display text-xl font-medium text-espresso mb-2">Password Berhasil Direset</h1>
            <p className="text-espresso/50 text-sm mb-6">Silakan login dengan password baru Anda.</p>
            <Button onClick={() => navigate('/login')} fullWidth>
              Ke Halaman Login
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-roast flex items-center justify-center mb-4 shadow-md shadow-roast/30">
                <Coffee size={22} className="text-latte" strokeWidth={1.75} />
              </div>
              <h1 className="font-display text-xl font-medium text-espresso">Buat Password Baru</h1>
              <p className="text-espresso/50 text-sm mt-1">untuk {email}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-clay-light text-clay text-sm px-3 py-2.5 rounded-lg border border-clay/10">
                  {error}
                </div>
              )}

              <PasswordField
                label="Password Baru"
                autoComplete="new-password"
                {...register('password')}
                error={errors.password?.message}
              />
              <PasswordField
                label="Konfirmasi Password Baru"
                autoComplete="new-password"
                {...register('password_confirmation')}
                error={errors.password_confirmation?.message}
              />

              <Button type="submit" fullWidth disabled={mutation.isPending}>
                {mutation.isPending ? 'Menyimpan...' : 'Reset Password'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}