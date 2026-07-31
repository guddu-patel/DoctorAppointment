'use client';

import { FormEvent, useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useRequireAuth, getErrorMessage } from '@/contexts/auth-context';
import { departmentsApi } from '@/services/api';
import type { Department } from '@/types';
import toast from 'react-hot-toast';

export default function AdminDepartmentsPage() {
  useRequireAuth(['ADMIN', 'SUPER_ADMIN']);
  const [items, setItems] = useState<Department[]>([]);
  const [form, setForm] = useState({ name: '', description: '' });

  async function load() {
    const { data } = await departmentsApi.list();
    setItems(data.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await departmentsApi.create(form);
      toast.success('Department created');
      setForm({ name: '', description: '' });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <DashboardShell title="Departments" subtitle="Clinical specialties">
      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={onSubmit} className="glass-panel p-6 space-y-3">
          <h3 className="font-display text-2xl">Add department</h3>
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <button className="btn btn-primary">Create</button>
        </form>
        <div className="space-y-3">
          {items.map((d) => (
            <div key={d.id} className="glass-panel p-4">
              <h4 className="font-display text-xl">{d.name}</h4>
              <p className="text-sm text-[var(--ink-muted)]">{d.description}</p>
              <p className="text-xs mt-2">{d._count?.doctors ?? 0} doctors</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
