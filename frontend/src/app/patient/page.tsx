'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell, StatCard, EmptyState } from '@/components/dashboard-shell';
import { useRequireAuth } from '@/contexts/auth-context';
import { appointmentsApi, dashboardApi } from '@/services/api';
import type { Appointment } from '@/types';
import { formatDate, formatMoney, statusBadgeClass } from '@/lib/utils';

export default function PatientDashboard() {
  useRequireAuth(['PATIENT']);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    dashboardApi.get().then((r) => setStats(r.data.data));
    appointmentsApi.list({ limit: 5, sortOrder: 'desc' }).then((r) => setAppointments(r.data.data));
  }, []);

  const upcoming = stats?.upcomingAppointment as Appointment | null | undefined;

  return (
    <DashboardShell title="Patient home" subtitle="Your visits, bills, and care history" actions={
      <Link href="/patient/book" className="btn btn-primary !py-2">Book appointment</Link>
    }>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Previous visits" value={Number(stats?.previousVisits ?? 0)} />
        <StatCard label="Pending bills" value={Number(stats?.pendingBills ?? 0)} />
        <StatCard label="Prescriptions" value={Number(stats?.medicalReports ?? 0)} />
        <StatCard label="Unread alerts" value={Number(stats?.unreadNotifications ?? 0)} />
      </div>

      {upcoming ? (
        <div className="glass-panel p-6 mb-8">
          <p className="text-sm uppercase tracking-wide text-[var(--ink-muted)]">Next appointment</p>
          <h2 className="font-display text-3xl mt-1">{upcoming.doctor?.user?.name}</h2>
          <p className="text-[var(--ink-muted)]">{upcoming.doctor?.department?.name}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span>{formatDate(upcoming.appointmentDate)} · {upcoming.startTime}</span>
            <span className={statusBadgeClass(upcoming.status)}>{upcoming.status}</span>
            {upcoming.queueNumber ? <span>Queue #{upcoming.queueNumber}</span> : null}
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <EmptyState title="No upcoming visit" description="Book a doctor when you need care — slots update in real time." />
        </div>
      )}

      <h3 className="font-display text-2xl mb-3">Recent appointments</h3>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Fee</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>{a.doctor?.user?.name}</td>
                <td>{formatDate(a.appointmentDate)}</td>
                <td>{a.startTime}</td>
                <td><span className={statusBadgeClass(a.status)}>{a.status}</span></td>
                <td>{formatMoney(a.doctor?.consultationFee)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
