'use client';

import { useEffect, useState } from 'react';
import { DashboardShell, EmptyState } from '@/components/dashboard-shell';
import { useRequireAuth, getErrorMessage } from '@/contexts/auth-context';
import { billsApi } from '@/services/api';
import type { Bill } from '@/types';
import { formatDate, formatMoney, statusBadgeClass } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PatientPaymentsPage() {
  useRequireAuth(['PATIENT']);
  const [items, setItems] = useState<Bill[]>([]);

  async function load() {
    const { data } = await billsApi.list({ limit: 50 });
    setItems(data.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function pay(id: string) {
    try {
      await billsApi.pay(id, { paymentMethod: 'UPI' });
      toast.success('Payment recorded');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <DashboardShell title="Payments" subtitle="Invoices and payment status">
      {items.length === 0 ? (
        <EmptyState title="No bills yet" description="Bills are created after consultation or at reception." />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Doctor</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id}>
                  <td>{b.billNumber}</td>
                  <td>{b.appointment?.doctor?.user?.name ?? '—'}</td>
                  <td>{formatMoney(b.total)}</td>
                  <td><span className={statusBadgeClass(b.paymentStatus)}>{b.paymentStatus}</span></td>
                  <td>{formatDate(b.appointment?.appointmentDate)}</td>
                  <td>
                    {b.paymentStatus === 'PENDING' ? (
                      <button className="btn btn-primary !py-1 !px-3" onClick={() => pay(b.id)}>Pay now</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
