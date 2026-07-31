'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useRequireAuth, getErrorMessage } from '@/contexts/auth-context';
import { appointmentsApi } from '@/services/api';
import type { Appointment } from '@/types';
import { formatDate, statusBadgeClass } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function StaffAppointmentsPage() {
  useRequireAuth(['STAFF']);
  const [items, setItems] = useState<Appointment[]>([]);

  async function load() {
    const { data } = await appointmentsApi.list({ limit: 100 });
    setItems(data.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    try {
      await appointmentsApi.update(id, { status });
      toast.success(`Updated to ${status}`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <DashboardShell title="Appointments" subtitle="Verify, check-in, and update status">
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Queue</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.patient?.user?.name}</td>
                <td>{a.doctor?.user?.name}</td>
                <td>{formatDate(a.appointmentDate)}</td>
                <td>{a.startTime}</td>
                <td>{a.queueNumber ?? '—'}</td>
                <td><span className={statusBadgeClass(a.status)}>{a.status}</span></td>
                <td className="space-x-1">
                  {a.status === 'CONFIRMED' ? (
                    <button className="btn btn-primary !py-1 !px-2" onClick={() => updateStatus(a.id, 'CHECKED_IN')}>Check-in</button>
                  ) : null}
                  {a.status === 'PENDING' ? (
                    <button className="btn btn-secondary !py-1 !px-2" onClick={() => updateStatus(a.id, 'CONFIRMED')}>Confirm</button>
                  ) : null}
                  {['PENDING', 'CONFIRMED'].includes(a.status) ? (
                    <button className="btn btn-danger !py-1 !px-2" onClick={() => updateStatus(a.id, 'CANCELLED')}>Cancel</button>
                  ) : null}
                  {a.status === 'CHECKED_IN' ? (
                    <button className="btn btn-secondary !py-1 !px-2" onClick={() => updateStatus(a.id, 'NO_SHOW')}>No-show</button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
