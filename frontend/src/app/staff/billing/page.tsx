'use client';

import { FormEvent, useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useRequireAuth, getErrorMessage } from '@/contexts/auth-context';
import { appointmentsApi, billsApi } from '@/services/api';
import type { Appointment, Bill } from '@/types';
import { formatMoney, statusBadgeClass } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function StaffBillingPage() {
  useRequireAuth(['STAFF']);
  const [bills, setBills] = useState<Bill[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState({
    appointmentId: '',
    consultationFee: 800,
    medicineCharges: 0,
    labCharges: 0,
    discount: 0,
    tax: 0,
    paymentMethod: 'CASH',
  });

  async function load() {
    const [b, a] = await Promise.all([
      billsApi.list({ limit: 50 }),
      appointmentsApi.list({ limit: 50 }),
    ]);
    setBills(b.data.data);
    setAppointments(a.data.data.filter((x) => !x.bill));
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await billsApi.create(form);
      toast.success('Invoice created');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function collect(id: string) {
    try {
      await billsApi.pay(id, { paymentMethod: 'CASH' });
      toast.success('Payment collected');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <DashboardShell title="Billing" subtitle="Create invoices and collect payments">
      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={onSubmit} className="glass-panel p-6 space-y-3">
          <h3 className="font-display text-2xl">New invoice</h3>
          <div>
            <label className="label">Appointment</label>
            <select className="select" value={form.appointmentId} onChange={(e) => setForm({ ...form, appointmentId: e.target.value })} required>
              <option value="">Select</option>
              {appointments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.patient?.user?.name} → {a.doctor?.user?.name} ({a.startTime})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Consultation</label>
              <input className="input" type="number" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Medicines</label>
              <input className="input" type="number" value={form.medicineCharges} onChange={(e) => setForm({ ...form, medicineCharges: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Lab</label>
              <input className="input" type="number" value={form.labCharges} onChange={(e) => setForm({ ...form, labCharges: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Discount</label>
              <input className="input" type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="label">Payment method</label>
            <select className="select" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
              {['CASH', 'CARD', 'UPI', 'ONLINE', 'INSURANCE'].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <button className="btn btn-primary">Generate invoice</button>
        </form>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id}>
                  <td>{b.billNumber}</td>
                  <td>{formatMoney(b.total)}</td>
                  <td><span className={statusBadgeClass(b.paymentStatus)}>{b.paymentStatus}</span></td>
                  <td>
                    {b.paymentStatus === 'PENDING' ? (
                      <button className="btn btn-primary !py-1 !px-2" onClick={() => collect(b.id)}>Collect</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
