'use client';

import { FormEvent, useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useRequireAuth, getErrorMessage } from '@/contexts/auth-context';
import { patientsApi } from '@/services/api';
import toast from 'react-hot-toast';

export default function PatientProfilePage() {
  const { user } = useRequireAuth(['PATIENT']);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    bloodGroup: 'UNKNOWN',
    allergies: '',
    emergencyContact: '',
    emergencyPhone: '',
    insuranceProvider: '',
    insuranceNumber: '',
    medicalHistory: '',
  });

  useEffect(() => {
    if (!user?.patientId) return;
    patientsApi.get(user.patientId).then((r) => {
      const p = r.data.data;
      setForm({
        name: p.user.name,
        phone: p.user.phone || '',
        address: p.address || '',
        bloodGroup: p.bloodGroup || 'UNKNOWN',
        allergies: p.allergies || '',
        emergencyContact: p.emergencyContact || '',
        emergencyPhone: p.emergencyPhone || '',
        insuranceProvider: p.insuranceProvider || '',
        insuranceNumber: p.insuranceNumber || '',
        medicalHistory: p.medicalHistory || '',
      });
    });
  }, [user?.patientId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user?.patientId) return;
    try {
      await patientsApi.update(user.patientId, form);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <DashboardShell title="Profile" subtitle="Personal and medical details">
      <form onSubmit={onSubmit} className="glass-panel p-6 grid md:grid-cols-2 gap-4 max-w-4xl">
        {[
          ['name', 'Full name'],
          ['phone', 'Phone'],
          ['address', 'Address'],
          ['emergencyContact', 'Emergency contact'],
          ['emergencyPhone', 'Emergency phone'],
          ['insuranceProvider', 'Insurance provider'],
          ['insuranceNumber', 'Insurance number'],
          ['allergies', 'Allergies'],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="label">{label}</label>
            <input
              className="input"
              value={(form as Record<string, string>)[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}
        <div>
          <label className="label">Blood group</label>
          <select className="select" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
            {['UNKNOWN','A_POSITIVE','A_NEGATIVE','B_POSITIVE','B_NEGATIVE','AB_POSITIVE','AB_NEGATIVE','O_POSITIVE','O_NEGATIVE'].map((g) => (
              <option key={g} value={g}>{g.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="label">Medical history</label>
          <textarea className="textarea" rows={4} value={form.medicalHistory} onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <button className="btn btn-primary">Save profile</button>
        </div>
      </form>
    </DashboardShell>
  );
}
