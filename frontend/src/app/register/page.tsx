'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useAuth, getErrorMessage } from '@/contexts/auth-context';
import { APP_NAME } from '@/config';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-lg glass-panel p-8 fade-up">
        <h1 className="font-display text-3xl text-[var(--brand-deep)]">Join {APP_NAME}</h1>
        <p className="text-sm text-[var(--ink-muted)] mt-1 mb-6">Create a patient account to book appointments online.</p>

        <label className="label">Full name</label>
        <input className="input mb-4" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

        <label className="label">Email</label>
        <input className="input mb-4" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />

        <label className="label">Phone</label>
        <input className="input mb-4" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

        <label className="label">Password</label>
        <input className="input mb-6" type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>

        <p className="text-sm text-center mt-5 text-[var(--ink-muted)]">
          Already registered? <Link href="/login" className="text-[var(--brand)] font-semibold">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
