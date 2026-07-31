'use client';

import { FormEvent, useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useRequireAuth, getErrorMessage } from '@/contexts/auth-context';
import { appointmentsApi, prescriptionsApi } from '@/services/api';
import type { Appointment } from '@/types';
import { statusBadgeClass } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function DoctorAppointmentsPage() {
  useRequireAuth(['DOCTOR']);
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [rx, setRx] = useState({
    diagnosis: '',
    medicineName: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: '',
  });

  async function load() {
    const { data } = await appointmentsApi.todayQueue();
    setQueue(data.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    try {
      await appointmentsApi.update(id, { status });
      toast.success(`Marked ${status}`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function submitRx(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    try {
      await prescriptionsApi.create({
        appointmentId: selected.id,
        diagnosis: rx.diagnosis,
        medicines: [
          {
            name: rx.medicineName,
            dosage: rx.dosage,
            frequency: rx.frequency,
            duration: rx.duration,
          },
        ],
        notes: rx.notes,
      });
      toast.success('Prescription saved');
      setSelected(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <DashboardShell title="Today's appointments" subtitle="Accept, check-in, prescribe, complete">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Queue</th>
                <th>Patient</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((a) => (
                <tr key={a.id}>
                  <td>{a.queueNumber}</td>
                  <td>{a.patient?.user?.name}</td>
                  <td>{a.startTime}</td>
                  <td><span className={statusBadgeClass(a.status)}>{a.status}</span></td>
                  <td className="space-x-1">
                    {a.status === 'PENDING' ? (
                      <>
                        <button className="btn btn-primary !py-1 !px-2" onClick={() => setStatus(a.id, 'CONFIRMED')}>Accept</button>
                        <button className="btn btn-danger !py-1 !px-2" onClick={() => setStatus(a.id, 'REJECTED')}>Reject</button>
                      </>
                    ) : null}
                    {a.status === 'CONFIRMED' ? (
                      <button className="btn btn-secondary !py-1 !px-2" onClick={() => setStatus(a.id, 'CHECKED_IN')}>Check-in</button>
                    ) : null}
                    {['CHECKED_IN', 'CONFIRMED'].includes(a.status) ? (
                      <button className="btn btn-secondary !py-1 !px-2" onClick={() => setSelected(a)}>Prescribe</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected ? (
          <form onSubmit={submitRx} className="glass-panel p-6 space-y-3">
            <h3 className="font-display text-2xl">Prescription — {selected.patient?.user?.name}</h3>
            <div>
              <label className="label">Diagnosis</label>
              <input className="input" value={rx.diagnosis} onChange={(e) => setRx({ ...rx, diagnosis: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Medicine</label>
                <input className="input" value={rx.medicineName} onChange={(e) => setRx({ ...rx, medicineName: e.target.value })} required />
              </div>
              <div>
                <label className="label">Dosage</label>
                <input className="input" value={rx.dosage} onChange={(e) => setRx({ ...rx, dosage: e.target.value })} required />
              </div>
              <div>
                <label className="label">Frequency</label>
                <input className="input" value={rx.frequency} onChange={(e) => setRx({ ...rx, frequency: e.target.value })} required />
              </div>
              <div>
                <label className="label">Duration</label>
                <input className="input" value={rx.duration} onChange={(e) => setRx({ ...rx, duration: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="textarea" rows={3} value={rx.notes} onChange={(e) => setRx({ ...rx, notes: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary">Save & complete</button>
              <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="glass-panel p-6 text-[var(--ink-muted)]">
            Select a patient to write a prescription.
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
