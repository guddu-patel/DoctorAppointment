'use client';

import { useEffect, useState } from 'react';
import { DashboardShell, StatCard } from '@/components/dashboard-shell';
import { useRequireAuth } from '@/contexts/auth-context';
import { appointmentsApi, dashboardApi } from '@/services/api';
import type { Appointment } from '@/types';
import { formatDate, statusBadgeClass } from '@/lib/utils';
import Link from 'next/link';

export default function DoctorDashboard() {
  useRequireAuth(['DOCTOR']);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [queue, setQueue] = useState<Appointment[]>([]);

  useEffect(() => {
    dashboardApi.get().then((r) => setStats(r.data.data));
    appointmentsApi.todayQueue().then((r) => setQueue(r.data.data));
  }, []);

  return (
    <DashboardShell title="Doctor workspace" subtitle="Today's patients and clinic performance" actions={
      <Link href="/doctor/appointments" className="btn btn-primary !py-2">Open queue</Link>
    }>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Today's patients" value={Number(stats?.todayPatients ?? 0)} />
        <StatCard label="Completed" value={Number(stats?.completedConsultations ?? 0)} />
        <StatCard label="Upcoming" value={Number(stats?.upcomingAppointments ?? 0)} />
        <StatCard label="Pending Rx" value={Number(stats?.pendingPrescriptions ?? 0)} />
        <StatCard label="Revenue" value={`₹${Number(stats?.revenueEarned ?? 0)}`} />
      </div>

      <h3 className="font-display text-2xl mb-3">Today&apos;s queue</h3>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Time</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((a) => (
              <tr key={a.id}>
                <td>{a.queueNumber ?? '—'}</td>
                <td>{a.patient?.user?.name}</td>
                <td>{a.startTime}</td>
                <td>{a.reason || '—'}</td>
                <td><span className={statusBadgeClass(a.status)}>{a.status}</span></td>
              </tr>
            ))}
            {queue.length === 0 ? (
              <tr><td colSpan={5} className="text-[var(--ink-muted)]">No appointments scheduled for today.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[var(--ink-muted)] mt-3">As of {formatDate(new Date())}</p>
    </DashboardShell>
  );
}
