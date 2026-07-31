'use client';

import { FormEvent, useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useRequireAuth, getErrorMessage } from '@/contexts/auth-context';
import { doctorsApi } from '@/services/api';
import toast from 'react-hot-toast';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

type ScheduleRow = { dayOfWeek: string; startTime: string; endTime: string; slotMins: number; isActive: boolean };

export default function DoctorAvailabilityPage() {
  const { user } = useRequireAuth(['DOCTOR']);
  const [rows, setRows] = useState<ScheduleRow[]>(
    DAYS.slice(0, 5).map((d) => ({ dayOfWeek: d, startTime: '09:00', endTime: '17:00', slotMins: 30, isActive: true }))
  );

  useEffect(() => {
    if (!user?.doctorId) return;
    doctorsApi.get(user.doctorId).then((r) => {
      const schedules = r.data.data.schedules;
      if (schedules?.length) {
        setRows(
          schedules.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            slotMins: s.slotMins,
            isActive: true,
          }))
        );
      }
    });
  }, [user?.doctorId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user?.doctorId) return;
    try {
      await doctorsApi.updateSchedule(user.doctorId, rows);
      toast.success('Availability updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <DashboardShell title="Availability" subtitle="Weekly clinic hours and slot length">
      <form onSubmit={onSubmit} className="glass-panel p-6 space-y-4 max-w-3xl">
        {rows.map((row, idx) => (
          <div key={row.dayOfWeek} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="label">Day</label>
              <select
                className="select"
                value={row.dayOfWeek}
                onChange={(e) => {
                  const next = [...rows];
                  next[idx] = { ...row, dayOfWeek: e.target.value };
                  setRows(next);
                }}
              >
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Start</label>
              <input className="input" type="time" value={row.startTime} onChange={(e) => {
                const next = [...rows]; next[idx] = { ...row, startTime: e.target.value }; setRows(next);
              }} />
            </div>
            <div>
              <label className="label">End</label>
              <input className="input" type="time" value={row.endTime} onChange={(e) => {
                const next = [...rows]; next[idx] = { ...row, endTime: e.target.value }; setRows(next);
              }} />
            </div>
            <div>
              <label className="label">Slot (mins)</label>
              <input className="input" type="number" min={10} max={120} value={row.slotMins} onChange={(e) => {
                const next = [...rows]; next[idx] = { ...row, slotMins: Number(e.target.value) }; setRows(next);
              }} />
            </div>
          </div>
        ))}
        <button className="btn btn-primary">Save schedule</button>
      </form>
    </DashboardShell>
  );
}
