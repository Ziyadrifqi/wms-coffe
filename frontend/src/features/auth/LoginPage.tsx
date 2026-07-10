import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../stores/authStore';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ email, password });
      const { user, token } = response.data.data;
      setAuth(user, token);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Login gagal. Periksa email dan password Anda.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f3ead9]">
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
        .crate-texture {
          background-image: repeating-linear-gradient(
            135deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 2px,
            transparent 2px, transparent 14px
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
        @media (prefers-reduced-motion: reduce) {
          .fade-up { animation: none; }
        }
      `}</style>

      {/* Panel kiri: foto gudang */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden bg-[#1c130d]">
        <img
          src="/images/warehouse.jpg"
          alt=""
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c130d] via-[#1c130d]/40 to-[#1c130d]/10" />
        <div className="crate-texture absolute inset-0" />

        <div className="relative z-10 flex flex-col w-full p-10">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.svg"
              alt="WMS Coffee"
              className="h-9 w-9 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="font-stamp uppercase tracking-[0.2em] text-[#f3ead9] text-sm">
              WMS Coffee
            </span>
          </div>

          <div className="mt-auto text-left">
            <p className="font-stamp text-[#f3ead9] text-3xl leading-tight max-w-md">
              Setiap karung, setiap palet,<br />tercatat dengan pasti.
            </p>
          </div>
        </div>
      </div>

      {/* Panel kanan: form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10 paper-grain relative font-plex">
        <div className="w-full max-w-[380px] fade-up">

          <div className="lg:hidden flex items-center gap-2.5 mb-10">
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

          <div className="mb-9">
            <span className="font-plex-mono text-[11px] tracking-widest text-[#8a3324] uppercase">
              Terminal Akses · 001
            </span>
            <h1 className="font-stamp text-[#2a2118] text-[32px] leading-tight uppercase tracking-wide mt-3 stamp-mark inline-block px-3 py-1">
              Masuk Gudang
            </h1>
            <p className="text-[#6b6355] text-sm mt-4">
              Gunakan kredensial staf Anda untuk mengakses sistem manajemen gudang.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="font-plex-mono text-[13px] text-[#8a3324] bg-[#8a3324]/[0.06] border border-[#8a3324]/25 px-4 py-3">
                ⚠ {error}
              </div>
            )}

            <div>
              <label className="block font-plex-mono text-[11px] tracking-widest uppercase text-[#6b6355] mb-2">
                ID Pengguna / Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border-b-2 border-[#d9cbb0] px-1 py-2.5 text-[#2a2118] placeholder:text-[#a89c85] focus:outline-none focus:border-[#8a3324] transition-colors"
                placeholder="Masukkan email anda"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-plex-mono text-[11px] tracking-widest uppercase text-[#6b6355]">
                  Kata Sandi
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent border-b-2 border-[#d9cbb0] px-1 py-2.5 text-[#2a2118] placeholder:text-[#a89c85] focus:outline-none focus:border-[#8a3324] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end -mt-1">
              <Link
                to="/forgot-password"
                className="font-plex-mono text-[11px] text-[#8a3324] hover:underline"
              >
                lupa kata sandi?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#2a2118] text-[#f3ead9] font-stamp uppercase tracking-[0.15em] text-sm py-3.5 hover:bg-[#8a3324] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Memproses...' : 'Masuk →'}
            </button>
          </form>

          <p className="font-plex-mono text-[11px] text-[#a89c85] mt-8 text-center tracking-wide">
            Sesi aman · Data terenkripsi
          </p>
        </div>
      </div>
    </div>
  );
}