'use client';

import { FormEvent, useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useRequireAuth, getErrorMessage } from '@/contexts/auth-context';
import { staffApi } from '@/services/api';
import toast from 'react-hot-toast';

interface StaffRow {
  id: string;
  designation?: string | null;
  user: { name: string; email: string; phone?: string | null; status: string };
}

export default function AdminStaffPage() {
  useRequireAuth(['ADMIN', 'SUPER_ADMIN']);
  const [items, setItems] = useState<StaffRow[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'Password@123',
    phone: '',
    designation: 'Receptionist',
  });

  async function load() {
    const { data } = await staffApi.list({ limit: 50 });
    setItems(data.data as StaffRow[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await staffApi.create(form);
      toast.success('Staff created');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <DashboardShell title="Staff" subtitle="Reception and clinic staff accounts">
      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={onSubmit} className="glass-panel p-6 space-y-3">
          <h3 className="font-display text-2xl">Add staff</h3>
          {(['name', 'email', 'phone', 'designation', 'password'] as const).map((key) => (
            <div key={key}>
              <label className="label">{key}</label>
              <input
                className="input"
                type={key === 'password' ? 'password' : 'text'}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={key !== 'phone'}
              />
            </div>
          ))}
          <button className="btn btn-primary">Create</button>
        </form>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td>{s.user.name}</td>
                  <td>{s.user.email}</td>
                  <td>{s.designation || 'Staff'}</td>
                  <td>{s.user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
