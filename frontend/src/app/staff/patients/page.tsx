'use client';

import { FormEvent, useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useRequireAuth, getErrorMessage } from '@/contexts/auth-context';
import { appointmentsApi, patientsApi, doctorsApi } from '@/services/api';
import type { Doctor, Patient } from '@/types';
import { tomorrowISO } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function StaffPatientsPage() {
  useRequireAuth(['STAFF']);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    doctorId: '',
    appointmentDate: tomorrowISO(),
    startTime: '10:00',
    reason: 'Walk-in',
  });

  async function load() {
    const [p, d] = await Promise.all([
      patientsApi.list({ limit: 50 }),
      doctorsApi.list({ limit: 50 }),
    ]);
    setPatients(p.data.data);
    setDoctors(d.data.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const created = await patientsApi.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: 'Patient@123',
      });
      const patientId = created.data.data.id;
      if (form.doctorId) {
        await appointmentsApi.create({
          doctorId: form.doctorId,
          patientId,
          appointmentDate: form.appointmentDate,
          startTime: form.startTime,
          endTime: '10:30',
          reason: form.reason,
          notes: 'walk-in',
        });
      }
      toast.success('Patient registered');
      setForm({ ...form, name: '', email: '', phone: '' });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <DashboardShell title="Patient registration" subtitle="Walk-in registration and quick booking">
      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={onSubmit} className="glass-panel p-6 space-y-3">
          <h3 className="font-display text-2xl">New walk-in</h3>
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Doctor (optional booking)</label>
            <select className="select" value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
              <option value="">Register only</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.user.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Time</label>
              <input className="input" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary">Register</button>
        </form>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>{p.user.name}</td>
                  <td>{p.user.email}</td>
                  <td>{p.user.phone || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
