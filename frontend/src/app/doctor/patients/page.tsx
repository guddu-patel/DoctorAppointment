'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useRequireAuth } from '@/contexts/auth-context';
import { appointmentsApi } from '@/services/api';
import type { Appointment } from '@/types';
import { formatDate } from '@/lib/utils';

export default function DoctorPatientsPage() {
  useRequireAuth(['DOCTOR']);
  const [items, setItems] = useState<Appointment[]>([]);

  useEffect(() => {
    appointmentsApi.list({ limit: 100, status: 'COMPLETED' }).then((r) => setItems(r.data.data));
  }, []);

  const unique = Array.from(
    new Map(items.map((a) => [a.patient.id, a.patient])).values()
  );

  return (
    <DashboardShell title="Patients" subtitle="Patients you have consulted">
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Blood group</th>
              <th>Last visit context</th>
            </tr>
          </thead>
          <tbody>
            {unique.map((p) => (
              <tr key={p.id}>
                <td>{p.user.name}</td>
                <td>{p.user.email}</td>
                <td>{p.user.phone || '—'}</td>
                <td>{p.bloodGroup?.replace('_', ' ') || '—'}</td>
                <td>{formatDate(items.find((a) => a.patient.id === p.id)?.appointmentDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
