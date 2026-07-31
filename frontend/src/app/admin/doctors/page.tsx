'use client';

import { FormEvent, useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useRequireAuth, getErrorMessage } from '@/contexts/auth-context';
import { departmentsApi, doctorsApi } from '@/services/api';
import type { Department, Doctor } from '@/types';
import { formatMoney } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminDoctorsPage() {
  useRequireAuth(['ADMIN', 'SUPER_ADMIN']);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'Password@123',
    phone: '',
    departmentId: '',
    qualification: '',
    experience: 5,
    consultationFee: 800,
    licenseNumber: '',
    bio: '',
  });

  async function load() {
    const [d, deps] = await Promise.all([doctorsApi.list({ limit: 100 }), departmentsApi.list()]);
    setDoctors(d.data.data);
    setDepartments(deps.data.data);
    if (deps.data.data[0]) {
      setForm((f) => ({ ...f, departmentId: f.departmentId || deps.data.data[0].id }));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await doctorsApi.create(form);
      toast.success('Doctor created');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <DashboardShell title="Doctors" subtitle="Manage clinician profiles">
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
        <form onSubmit={onSubmit} className="glass-panel p-6 space-y-3">
          <h3 className="font-display text-2xl">Add doctor</h3>
          {(['name', 'email', 'phone', 'qualification', 'licenseNumber'] as const).map((key) => (
            <div key={key}>
              <label className="label">{key}</label>
              <input
                className="input"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={['name', 'email', 'qualification', 'licenseNumber'].includes(key)}
              />
            </div>
          ))}
          <div>
            <label className="label">Department</label>
            <select className="select" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Experience</label>
              <input className="input" type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Fee</label>
              <input className="input" type="number" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })} />
            </div>
          </div>
          <button className="btn btn-primary">Create</button>
        </form>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Dept</th>
                <th>Fee</th>
                <th>Exp</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d.id}>
                  <td>{d.user.name}</td>
                  <td>{d.department.name}</td>
                  <td>{formatMoney(d.consultationFee)}</td>
                  <td>{d.experience} yrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
