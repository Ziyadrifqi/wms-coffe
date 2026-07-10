import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Coffee, ArrowLeft, MailCheck } from 'lucide-react';
import { forgotPassword } from '../../api/auth.api';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { TextField } from '../../components/common/FormField';
import Button from '../../components/common/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => forgotPassword({ email }),
    onSuccess: () => setSent(true),
    onError: (err: unknown) => setError(getErrorMessage(err)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-latte relative overflow-hidden px-4">
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-caramel/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full bg-roast/10 blur-3xl" />

      <div className="w-full max-w-sm bg-cream rounded-2xl shadow-xl shadow-espresso/5 border border-espresso/5 p-8 relative animate-page-in">
        {sent ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-moss-light flex items-center justify-center mx-auto mb-4">
              <MailCheck size={22} className="text-moss" />
            </div>
            <h1 className="font-display text-xl font-medium text-espresso mb-2">Cek Email Anda</h1>
            <p className="text-espresso/50 text-sm mb-6">
              Jika email <span className="font-medium text-espresso/70">{email}</span> terdaftar, kami telah mengirimkan tautan untuk reset password.
            </p>
            <Link to="/login" className="text-sm text-caramel hover:text-caramel-dark font-medium">
              Kembali ke halaman login
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-roast flex items-center justify-center mb-4 shadow-md shadow-roast/30">
                <Coffee size={22} className="text-latte" strokeWidth={1.75} />
              </div>
              <h1 className="font-display text-xl font-medium text-espresso">Lupa Password</h1>
              <p className="text-espresso/50 text-sm mt-1 text-center">
                Masukkan email Anda, kami akan kirimkan tautan reset password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-clay-light text-clay text-sm px-3 py-2.5 rounded-lg border border-clay/10">
                  {error}
                </div>
              )}

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nama@wmscoffee.test"
              />

              <Button type="submit" fullWidth disabled={mutation.isPending}>
                {mutation.isPending ? 'Mengirim...' : 'Kirim Tautan Reset'}
              </Button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 text-sm text-espresso/50 hover:text-espresso mt-2"
              >
                <ArrowLeft size={14} /> Kembali ke login
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}