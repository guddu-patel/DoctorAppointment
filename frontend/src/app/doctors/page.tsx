'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doctorsApi, departmentsApi } from '@/services/api';
import type { Department, Doctor } from '@/types';
import { formatMoney } from '@/lib/utils';
import { APP_NAME } from '@/config';
import { Stethoscope, Star } from 'lucide-react';

export default function PublicDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentId, setDepartmentId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentsApi.list().then((r) => setDepartments(r.data.data)).catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
    doctorsApi
      .list({ search: search || undefined, departmentId: departmentId || undefined, limit: 50 })
      .then((r) => setDoctors(r.data.data))
      .finally(() => setLoading(false));
  }, [search, departmentId]);

  return (
    <div className="min-h-screen">
      <header className="container-page flex items-center justify-between py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-xl bg-[var(--brand)] text-white grid place-items-center">
            <Stethoscope size={16} />
          </span>
          <span className="font-display text-xl">{APP_NAME}</span>
        </Link>
        <Link href="/login" className="btn btn-primary !py-2">Book now</Link>
      </header>

      <section className="container-page pb-16">
        <h1 className="font-display text-4xl md:text-5xl text-[var(--brand-deep)] fade-up">Our doctors</h1>
        <p className="text-[var(--ink-muted)] mt-2 max-w-xl">Find specialists by department and book a convenient slot.</p>

        <div className="mt-8 grid md:grid-cols-[1fr_240px] gap-3">
          <input
            className="input"
            placeholder="Search by name or specialty"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="select" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="mt-10 text-[var(--ink-muted)]">Loading doctors…</p>
        ) : (
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doc) => (
              <article key={doc.id} className="glass-panel p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl">{doc.user.name}</h2>
                    <p className="text-sm text-[var(--ink-muted)]">{doc.department.name}</p>
                  </div>
                  <span className="badge badge-confirmed inline-flex gap-1">
                    <Star size={12} /> {doc.averageRating?.toFixed(1) ?? '—'}
                  </span>
                </div>
                <p className="text-sm mt-3 text-[var(--ink-muted)] line-clamp-2">{doc.qualification}</p>
                <p className="text-sm mt-1">{doc.experience} yrs experience</p>
                <div className="mt-auto pt-5 flex items-center justify-between">
                  <strong>{formatMoney(doc.consultationFee)}</strong>
                  <Link href={`/doctors/${doc.id}`} className="btn btn-secondary !py-2">View</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
