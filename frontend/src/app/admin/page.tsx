'use client';

import { useEffect, useState } from 'react';
import { DashboardShell, StatCard } from '@/components/dashboard-shell';
import { useRequireAuth } from '@/contexts/auth-context';
import { dashboardApi } from '@/services/api';
import type { Appointment } from '@/types';
import { formatDate, formatMoney, statusBadgeClass } from '@/lib/utils';

export default function AdminDashboard() {
  useRequireAuth(['ADMIN', 'SUPER_ADMIN']);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [recent, setRecent] = useState<Appointment[]>([]);

  useEffect(() => {
    dashboardApi.get().then((r) => {
      setStats(r.data.data);
      setRecent((r.data.data.recentAppointments as Appointment[]) || []);
    });
  }, []);

  return (
    <DashboardShell title="Admin overview" subtitle="Clinic-wide health and operations">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Doctors" value={Number(stats?.totalDoctors ?? 0)} />
        <StatCard label="Patients" value={Number(stats?.totalPatients ?? 0)} />
        <StatCard label="Staff" value={Number(stats?.totalStaff ?? 0)} />
        <StatCard label="Appointments" value={Number(stats?.totalAppointments ?? 0)} />
        <StatCard label="Today" value={Number(stats?.todayAppointments ?? 0)} />
        <StatCard label="Pending bills" value={Number(stats?.pendingBills ?? 0)} />
        <StatCard label="Revenue" value={formatMoney(Number(stats?.revenue ?? 0))} />
      </div>
      <h3 className="font-display text-2xl mb-3">Recent appointments</h3>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((a) => (
              <tr key={a.id}>
                <td>{a.patient?.user?.name}</td>
                <td>{a.doctor?.user?.name}</td>
                <td>{formatDate(a.appointmentDate)}</td>
                <td><span className={statusBadgeClass(a.status)}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
