'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useRequireAuth } from '@/contexts/auth-context';
import { appointmentsApi, doctorsApi } from '@/services/api';
import type { Appointment, Doctor } from '@/types';
import { statusBadgeClass } from '@/lib/utils';

export default function StaffQueuePage() {
  useRequireAuth(['STAFF']);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState('');
  const [queue, setQueue] = useState<Appointment[]>([]);

  useEffect(() => {
    doctorsApi.list({ limit: 50 }).then((r) => {
      setDoctors(r.data.data);
      if (r.data.data[0]) setDoctorId(r.data.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!doctorId) return;
    appointmentsApi.todayQueue(doctorId).then((r) => setQueue(r.data.data));
  }, [doctorId]);

  return (
    <DashboardShell title="Live queue" subtitle="Per-doctor waiting list for today">
      <div className="mb-4 max-w-sm">
        <label className="label">Doctor</label>
        <select className="select" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.user.name}</option>)}
        </select>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {queue.map((a) => (
          <div key={a.id} className="glass-panel p-5">
            <div className="flex justify-between items-start">
              <span className="font-display text-3xl text-[var(--brand)]">#{a.queueNumber}</span>
              <span className={statusBadgeClass(a.status)}>{a.status}</span>
            </div>
            <h3 className="font-display text-xl mt-2">{a.patient?.user?.name}</h3>
            <p className="text-sm text-[var(--ink-muted)]">{a.startTime} – {a.endTime}</p>
            <p className="text-sm mt-2">{a.reason || 'General visit'}</p>
          </div>
        ))}
        {queue.length === 0 ? <p className="text-[var(--ink-muted)]">Queue is empty for this doctor.</p> : null}
      </div>
    </DashboardShell>
  );
}
