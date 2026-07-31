'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useRequireAuth } from '@/contexts/auth-context';
import { appointmentsApi } from '@/services/api';
import type { Appointment } from '@/types';
import { formatDate, statusBadgeClass } from '@/lib/utils';

export default function AdminAppointmentsPage() {
  useRequireAuth(['ADMIN', 'SUPER_ADMIN']);
  const [items, setItems] = useState<Appointment[]>([]);

  useEffect(() => {
    appointmentsApi.list({ limit: 100 }).then((r) => setItems(r.data.data));
  }, []);

  return (
    <DashboardShell title="All appointments" subtitle="Clinic appointment ledger">
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.patient?.user?.name}</td>
                <td>{a.doctor?.user?.name}</td>
                <td>{formatDate(a.appointmentDate)}</td>
                <td>{a.startTime}</td>
                <td><span className={statusBadgeClass(a.status)}>{a.status}</span></td>
                <td>{a.reason || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
