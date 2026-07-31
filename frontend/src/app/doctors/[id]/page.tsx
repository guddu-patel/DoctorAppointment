'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { doctorsApi } from '@/services/api';
import type { Doctor } from '@/types';
import { formatMoney } from '@/lib/utils';
import { APP_NAME } from '@/config';

export default function DoctorDetailPage() {
  const params = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    if (!params.id) return;
    doctorsApi.get(params.id).then((r) => setDoctor(r.data.data));
  }, [params.id]);

  if (!doctor) {
    return <div className="min-h-screen grid place-items-center text-[var(--ink-muted)]">Loading…</div>;
  }

  return (
    <div className="min-h-screen">
      <header className="container-page py-5 flex justify-between items-center">
        <Link href="/" className="font-display text-xl text-[var(--brand-deep)]">{APP_NAME}</Link>
        <Link href="/login" className="btn btn-primary !py-2">Book appointment</Link>
      </header>
      <section className="container-page pb-16 grid lg:grid-cols-[1.4fr_0.8fr] gap-6">
        <div className="glass-panel p-8 fade-up">
          <p className="text-sm uppercase tracking-wide text-[var(--ink-muted)]">{doctor.department.name}</p>
          <h1 className="font-display text-4xl mt-2">{doctor.user.name}</h1>
          <p className="mt-3 text-[var(--ink-muted)]">{doctor.qualification}</p>
          <p className="mt-4">{doctor.bio}</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="stat-card"><div className="text-sm text-[var(--ink-muted)]">Experience</div><div className="font-display text-2xl">{doctor.experience} yrs</div></div>
            <div className="stat-card"><div className="text-sm text-[var(--ink-muted)]">Fee</div><div className="font-display text-2xl">{formatMoney(doctor.consultationFee)}</div></div>
          </div>
        </div>
        <div className="glass-panel p-6 h-fit">
          <h2 className="font-display text-2xl mb-3">Weekly schedule</h2>
          <ul className="space-y-2 text-sm">
            {(doctor.schedules || []).map((s) => (
              <li key={s.id} className="flex justify-between border-b border-[var(--line)] py-2">
                <span className="font-semibold">{s.dayOfWeek}</span>
                <span>{s.startTime} – {s.endTime}</span>
              </li>
            ))}
          </ul>
          <Link href="/patient/book" className="btn btn-primary w-full mt-6">Book as patient</Link>
        </div>
      </section>
    </div>
  );
}
