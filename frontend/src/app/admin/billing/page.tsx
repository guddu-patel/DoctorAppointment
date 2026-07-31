'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useRequireAuth } from '@/contexts/auth-context';
import { billsApi } from '@/services/api';
import type { Bill } from '@/types';
import { formatMoney, statusBadgeClass } from '@/lib/utils';

export default function AdminBillingPage() {
  useRequireAuth(['ADMIN', 'SUPER_ADMIN']);
  const [items, setItems] = useState<Bill[]>([]);

  useEffect(() => {
    billsApi.list({ limit: 100 }).then((r) => setItems(r.data.data));
  }, []);

  const revenue = items.filter((b) => b.paymentStatus === 'PAID').reduce((s, b) => s + b.total, 0);

  return (
    <DashboardShell title="Billing reports" subtitle={`Collected revenue ${formatMoney(revenue)}`}>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Total</th>
              <th>Method</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id}>
                <td>{b.billNumber}</td>
                <td>{b.appointment?.patient?.user?.name ?? '—'}</td>
                <td>{b.appointment?.doctor?.user?.name ?? '—'}</td>
                <td>{formatMoney(b.total)}</td>
                <td>{b.paymentMethod || '—'}</td>
                <td><span className={statusBadgeClass(b.paymentStatus)}>{b.paymentStatus}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
