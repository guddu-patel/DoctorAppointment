'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Stethoscope } from 'lucide-react';
import { useAuth, getErrorMessage } from '@/contexts/auth-context';
import { APP_NAME } from '@/config';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('patient@doctorcare.local');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div
        className="hidden lg:block relative"
        style={{
          backgroundImage:
            'linear-gradient(160deg, rgba(8,76,59,0.9), rgba(13,110,86,0.55)), url(https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 p-12 flex flex-col justify-end text-white">
          <h1 className="font-display text-5xl max-w-md leading-tight">{APP_NAME}</h1>
          <p className="mt-4 text-white/80 max-w-sm">Sign in to manage visits, prescriptions, and clinic operations.</p>
        </div>
      </div>

      <div className="grid place-items-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-md glass-panel p-8 fade-up">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <span className="h-9 w-9 rounded-xl bg-[var(--brand)] text-white grid place-items-center">
              <Stethoscope size={16} />
            </span>
            <span className="font-display text-xl">{APP_NAME}</span>
          </Link>
          <h2 className="font-display text-3xl">Welcome back</h2>
          <p className="text-sm text-[var(--ink-muted)] mt-1 mb-6">Use a demo account or your credentials.</p>

          <label className="label">Email</label>
          <input className="input mb-4" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label className="label">Password</label>
          <input className="input mb-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <div className="flex justify-between text-sm mb-6">
            <Link href="/forgot-password" className="text-[var(--brand)] font-semibold">Forgot password?</Link>
          </div>

          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-sm text-center mt-5 text-[var(--ink-muted)]">
            New patient? <Link href="/register" className="text-[var(--brand)] font-semibold">Create account</Link>
          </p>

          <div className="mt-6 rounded-xl bg-[var(--brand-soft)] p-3 text-xs text-[var(--brand-deep)] space-y-1">
            <div><strong>Admin:</strong> admin@doctorcare.local</div>
            <div><strong>Doctor:</strong> doctor@doctorcare.local</div>
            <div><strong>Staff:</strong> staff@doctorcare.local</div>
            <div><strong>Patient:</strong> patient@doctorcare.local</div>
            <div>Password: <strong>Password@123</strong></div>
          </div>
        </form>
      </div>
    </div>
  );
}
