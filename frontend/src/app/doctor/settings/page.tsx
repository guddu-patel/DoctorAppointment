'use client';

import { DashboardShell } from '@/components/dashboard-shell';
import { useRequireAuth } from '@/contexts/auth-context';

export default function DoctorSettingsPage() {
  const { user } = useRequireAuth(['DOCTOR']);
  return (
    <DashboardShell title="Settings" subtitle="Account overview">
      <div className="glass-panel p-6 max-w-xl space-y-2">
        <div><span className="text-[var(--ink-muted)]">Name:</span> {user?.name}</div>
        <div><span className="text-[var(--ink-muted)]">Email:</span> {user?.email}</div>
        <div><span className="text-[var(--ink-muted)]">Role:</span> {user?.role}</div>
        <p className="text-sm text-[var(--ink-muted)] pt-3">Profile edits for doctors are managed from Admin or Availability.</p>
      </div>
    </DashboardShell>
  );
}
