'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { authApi } from '@/services/api';
import { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await authApi.forgotPassword(email);
      setDone(true);
      toast.success('If that email exists, instructions were sent.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md glass-panel p-8">
        <h1 className="font-display text-3xl">Reset password</h1>
        <p className="text-sm text-[var(--ink-muted)] mt-2 mb-6">
          Enter your email and we will send reset instructions when email is configured.
        </p>
        {done ? (
          <p className="text-[var(--success)] font-semibold">Check your inbox for next steps.</p>
        ) : (
          <>
            <label className="label">Email</label>
            <input className="input mb-6" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button className="btn btn-primary w-full">Send reset link</button>
          </>
        )}
        <p className="text-sm text-center mt-5">
          <Link href="/login" className="text-[var(--brand)] font-semibold">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
