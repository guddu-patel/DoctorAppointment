'use client';

import { useEffect, useState } from 'react';
import { DashboardShell, EmptyState } from '@/components/dashboard-shell';
import { useRequireAuth } from '@/contexts/auth-context';
import { prescriptionsApi } from '@/services/api';
import type { Prescription } from '@/types';
import { formatDate } from '@/lib/utils';

export default function PatientPrescriptionsPage() {
  useRequireAuth(['PATIENT']);
  const [items, setItems] = useState<Prescription[]>([]);

  useEffect(() => {
    prescriptionsApi.list().then((r) => setItems(r.data.data));
  }, []);

  return (
    <DashboardShell title="Prescriptions" subtitle="Diagnosis and medicines from your visits">
      {items.length === 0 ? (
        <EmptyState title="No prescriptions" description="Prescriptions appear here after consultations." />
      ) : (
        <div className="space-y-4">
          {items.map((p) => (
            <article key={p.id} className="glass-panel p-6">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <h3 className="font-display text-2xl">{p.diagnosis}</h3>
                  <p className="text-sm text-[var(--ink-muted)]">
                    {p.doctor?.user?.name} · {formatDate(p.createdAt)}
                  </p>
                </div>
                {p.followupDate ? <span className="badge badge-confirmed">Follow-up {formatDate(p.followupDate)}</span> : null}
              </div>
              <ul className="mt-4 space-y-2">
                {p.medicines.map((m, i) => (
                  <li key={i} className="rounded-xl bg-[var(--brand-soft)] px-4 py-3 text-sm">
                    <strong>{m.name}</strong> — {m.dosage}, {m.frequency}, {m.duration}
                  </li>
                ))}
              </ul>
              {p.notes ? <p className="mt-3 text-sm text-[var(--ink-muted)]">{p.notes}</p> : null}
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
