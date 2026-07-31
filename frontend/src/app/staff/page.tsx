'use client';

import { useEffect, useState } from 'react';
import { DashboardShell, StatCard } from '@/components/dashboard-shell';
import { useRequireAuth } from '@/contexts/auth-context';
import { appointmentsApi, dashboardApi } from '@/services/api';
import type { Appointment } from '@/types';
import { formatDate, statusBadgeClass } from '@/lib/utils';
import Link from 'next/link';

export default function StaffDashboard() {
  useRequireAuth(['STAFF']);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [today, setToday] = useState<Appointment[]>([]);

  useEffect(() => {
    dashboardApi.get().then((r) => setStats(r.data.data));
    const d = new Date().toISOString().slice(0, 10);
    appointmentsApi.list({ date: d, limit: 20 }).then((r) => setToday(r.data.data));
  }, []);

  return (
    <DashboardShell title="Reception desk" subtitle="Check-ins, walk-ins, and billing" actions={
      <Link href="/staff/patients" className="btn btn-primary !py-2">Register patient</Link>
    }>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Today's appointments" value={Number(stats?.todayAppointments ?? 0)} />
        <StatCard label="Checked in" value={Number(stats?.checkedIn ?? 0)} />
        <StatCard label="Pending bills" value={Number(stats?.pendingBills ?? 0)} />
        <StatCard label="Walk-ins" value={Number(stats?.walkIns ?? 0)} />
      </div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Time</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {today.map((a) => (
              <tr key={a.id}>
                <td>{a.patient?.user?.name}</td>
                <td>{a.doctor?.user?.name}</td>
                <td>{a.startTime}</td>
                <td><span className={statusBadgeClass(a.status)}>{a.status}</span></td>
                <td>{formatDate(a.appointmentDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
