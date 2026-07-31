'use client';

import { useEffect, useState } from 'react';
import { DashboardShell, EmptyState } from '@/components/dashboard-shell';
import { useRequireAuth, getErrorMessage } from '@/contexts/auth-context';
import { appointmentsApi } from '@/services/api';
import type { Appointment } from '@/types';
import { formatDate, statusBadgeClass } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PatientAppointmentsPage() {
  useRequireAuth(['PATIENT']);
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await appointmentsApi.list({ limit: 50 });
      setItems(data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function cancel(id: string) {
    try {
      await appointmentsApi.update(id, { status: 'CANCELLED', cancelledReason: 'Cancelled by patient' });
      toast.success('Appointment cancelled');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <DashboardShell title="My appointments" subtitle="Track, cancel, or review past visits">
      {loading ? (
        <p className="text-[var(--ink-muted)]">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState title="No appointments yet" description="Book your first visit from the Book Appointment page." />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Department</th>
                <th>Date</th>
                <th>Time</th>
                <th>Queue</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td>{a.doctor?.user?.name}</td>
                  <td>{a.doctor?.department?.name}</td>
                  <td>{formatDate(a.appointmentDate)}</td>
                  <td>{a.startTime}</td>
                  <td>{a.queueNumber ?? '—'}</td>
                  <td><span className={statusBadgeClass(a.status)}>{a.status}</span></td>
                  <td>
                    {['PENDING', 'CONFIRMED'].includes(a.status) ? (
                      <button className="btn btn-danger !py-1 !px-3" onClick={() => cancel(a.id)}>Cancel</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
