'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { useRequireAuth, getErrorMessage } from '@/contexts/auth-context';
import { appointmentsApi, departmentsApi, doctorsApi } from '@/services/api';
import type { Department, Doctor } from '@/types';
import { formatMoney, tomorrowISO } from '@/lib/utils';
import toast from 'react-hot-toast';

function BookForm() {
  useRequireAuth(['PATIENT']);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<{ startTime: string; endTime: string }[]>([]);
  const [slotReason, setSlotReason] = useState('');
  const [form, setForm] = useState({
    departmentId: '',
    doctorId: searchParams.get('doctorId') || '',
    appointmentDate: tomorrowISO(),
    startTime: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    departmentsApi.list().then((r) => setDepartments(r.data.data));
  }, []);

  useEffect(() => {
    doctorsApi
      .list({ departmentId: form.departmentId || undefined, limit: 100 })
      .then((r) => setDoctors(r.data.data));
  }, [form.departmentId]);

  useEffect(() => {
    if (!form.doctorId || !form.appointmentDate) return;
    doctorsApi.slots(form.doctorId, form.appointmentDate).then((r) => {
      setSlots(r.data.data.slots);
      setSlotReason(r.data.data.reason || '');
      setForm((f) => ({ ...f, startTime: '' }));
    });
  }, [form.doctorId, form.appointmentDate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.doctorId || !form.startTime) {
      toast.error('Select doctor and time slot');
      return;
    }
    setLoading(true);
    try {
      const slot = slots.find((s) => s.startTime === form.startTime);
      await appointmentsApi.create({
        doctorId: form.doctorId,
        appointmentDate: form.appointmentDate,
        startTime: form.startTime,
        endTime: slot?.endTime,
        reason: form.reason,
      });
      toast.success('Appointment booked');
      router.push('/patient/appointments');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const selectedDoctor = doctors.find((d) => d.id === form.doctorId);

  return (
    <form onSubmit={onSubmit} className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
      <div className="glass-panel p-6 space-y-4">
        <div>
          <label className="label">Department</label>
          <select className="select" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value, doctorId: '' })}>
            <option value="">All departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Doctor</label>
          <select className="select" value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} required>
            <option value="">Select doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.user.name} — {d.department.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input className="input" type="date" value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} required />
        </div>
        <div>
          <label className="label">Reason</label>
          <textarea className="textarea" rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Brief reason for visit" />
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="font-display text-2xl mb-1">Available slots</h3>
        {selectedDoctor ? (
          <p className="text-sm text-[var(--ink-muted)] mb-4">
            Fee {formatMoney(selectedDoctor.consultationFee)} · {selectedDoctor.qualification}
          </p>
        ) : null}
        {slotReason ? <p className="text-sm text-[var(--warning)] mb-3">{slotReason}</p> : null}
        <div className="grid grid-cols-3 gap-2 max-h-[320px] overflow-auto">
          {slots.length === 0 ? (
            <p className="col-span-3 text-sm text-[var(--ink-muted)]">No open slots for this day.</p>
          ) : (
            slots.map((s) => (
              <button
                key={s.startTime}
                type="button"
                className={`btn !rounded-xl !py-2 ${form.startTime === s.startTime ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setForm({ ...form, startTime: s.startTime })}
              >
                {s.startTime}
              </button>
            ))
          )}
        </div>
        <button className="btn btn-primary w-full mt-6" disabled={loading}>
          {loading ? 'Booking…' : 'Confirm booking'}
        </button>
      </div>
    </form>
  );
}

export default function BookAppointmentPage() {
  return (
    <DashboardShell title="Book appointment" subtitle="Choose doctor, date, and an open slot">
      <Suspense fallback={<p className="text-[var(--ink-muted)]">Loading booking form…</p>}>
        <BookForm />
      </Suspense>
    </DashboardShell>
  );
}
