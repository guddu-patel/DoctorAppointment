'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useRequireAuth } from '@/contexts/auth-context';
import { patientsApi } from '@/services/api';
import type { Patient } from '@/types';

export default function AdminPatientsPage() {
  useRequireAuth(['ADMIN', 'SUPER_ADMIN']);
  const [items, setItems] = useState<Patient[]>([]);

  useEffect(() => {
    patientsApi.list({ limit: 100 }).then((r) => setItems(r.data.data));
  }, []);

  return (
    <DashboardShell title="Patients" subtitle="All registered patients">
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Blood group</th>
              <th>Insurance</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.user.name}</td>
                <td>{p.user.email}</td>
                <td>{p.user.phone || '—'}</td>
                <td>{p.bloodGroup?.replace('_', ' ') || '—'}</td>
                <td>{p.insuranceProvider || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
