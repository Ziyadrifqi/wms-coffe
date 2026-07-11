import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../../api/auth.api';
import { getErrorMessage } from '../../utils/getErrorMessage';

const schema = z.object({
  password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Konfirmasi kata sandi tidak cocok',
  path: ['password_confirmation'],
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) => resetPassword({ token, email, ...data }),
    onSuccess: () => setSuccess(true),
    onError: (err: unknown) => setApiError(getErrorMessage(err)),
  });

  const onSubmit = (data: FormData) => {
    setApiError('');
    mutation.mutate(data);
  };

  const sharedStyle = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
      .font-stamp { font-family: 'Oswald', sans-serif; }
      .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      .font-plex-mono { font-family: 'IBM Plex Mono', monospace; }
      .paper-grain {
        background-image: repeating-linear-gradient(
          0deg, rgba(60,42,26,0.025) 0px, rgba(60,42,26,0.025) 1px,
          transparent 1px, transparent 3px
        );
      }
      .stamp-mark {
        border: 2px solid currentColor;
        outline: 1px solid currentColor;
        outline-offset: 3px;
        transform: rotate(-1.5deg);
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .fade-up { animation: fadeUp 0.45s ease-out both; }
    `}</style>
  );

  if (!token || !email) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f3ead9] paper-grain font-plex px-6">
        {sharedStyle}
        <div className="w-full max-w-[380px] text-center fade-up">
          <p className="text-[#6b6355] text-sm mb-4">Tautan reset kata sandi tidak valid atau sudah kedaluwarsa.</p>
          <Link to="/forgot-password" className="font-plex-mono text-[12px] text-[#8a3324] hover:underline">
            Minta tautan baru →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-[#f3ead9]">
      {sharedStyle}

      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10 paper-grain relative font-plex">
        <div className="w-full max-w-[380px] fade-up">
          <div className="flex items-center gap-2.5 mb-10">
            <img
              src="/images/logo.svg"
              alt="WMS Coffee"
              className="h-8 w-8 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="font-stamp uppercase tracking-[0.2em] text-[#3d2b1e] text-sm">
              WMS Coffee
            </span>
          </div>

          {success ? (
            <div>
              <span className="font-plex-mono text-[11px] tracking-widest text-[#8a3324] uppercase">
                Berhasil
              </span>
              <h1 className="font-stamp text-[#2a2118] text-[28px] leading-tight uppercase tracking-wide mt-3 stamp-mark inline-block px-3 py-1">
                Kata Sandi Diperbarui
              </h1>
              <p className="text-[#6b6355] text-sm mt-6">
                Silakan masuk kembali menggunakan kata sandi baru Anda.
              </p>

              <button
                onClick={() => navigate('/login')}
                className="w-full mt-8 bg-[#2a2118] text-[#f3ead9] font-stamp uppercase tracking-[0.15em] text-sm py-3.5 hover:bg-[#8a3324] transition-colors"
              >
                Ke Halaman Masuk →
              </button>
            </div>
          ) : (
            <>
              <div className="mb-9">
                <span className="font-plex-mono text-[11px] tracking-widest text-[#8a3324] uppercase">
                  Pemulihan Akses
                </span>
                <h1 className="font-stamp text-[#2a2118] text-[28px] leading-tight uppercase tracking-wide mt-3 stamp-mark inline-block px-3 py-1">
                  Kata Sandi Baru
                </h1>
                <p className="text-[#6b6355] text-sm mt-4">untuk {email}</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {apiError && (
                  <div className="font-plex-mono text-[13px] text-[#8a3324] bg-[#8a3324]/[0.06] border border-[#8a3324]/25 px-4 py-3">
                    ⚠ {apiError}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-plex-mono text-[11px] tracking-widest uppercase text-[#6b6355]">
                      Kata Sandi Baru
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="font-plex-mono text-[11px] text-[#8a3324] hover:underline"
                    >
                      {showPassword ? 'sembunyikan' : 'tampilkan'}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="w-full bg-transparent border-b-2 border-[#d9cbb0] px-1 py-2.5 text-[#2a2118] placeholder:text-[#a89c85] focus:outline-none focus:border-[#8a3324] transition-colors"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="font-plex-mono text-[11px] text-[#8a3324] mt-1.5">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-plex-mono text-[11px] tracking-widest uppercase text-[#6b6355] mb-2">
                    Konfirmasi Kata Sandi
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password_confirmation')}
                    className="w-full bg-transparent border-b-2 border-[#d9cbb0] px-1 py-2.5 text-[#2a2118] placeholder:text-[#a89c85] focus:outline-none focus:border-[#8a3324] transition-colors"
                    placeholder="••••••••"
                  />
                  {errors.password_confirmation && (
                    <p className="font-plex-mono text-[11px] text-[#8a3324] mt-1.5">{errors.password_confirmation.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full mt-2 bg-[#2a2118] text-[#f3ead9] font-stamp uppercase tracking-[0.15em] text-sm py-3.5 hover:bg-[#8a3324] disabled:opacity-50 transition-colors"
                >
                  {mutation.isPending ? 'Menyimpan...' : 'Reset Kata Sandi →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}