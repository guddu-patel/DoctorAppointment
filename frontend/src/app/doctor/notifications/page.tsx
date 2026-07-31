'use client';

import { useEffect, useState } from 'react';
import { DashboardShell, EmptyState } from '@/components/dashboard-shell';
import { useRequireAuth } from '@/contexts/auth-context';
import { notificationsApi } from '@/services/api';
import type { NotificationItem } from '@/types';
import { formatDate } from '@/lib/utils';

export default function DoctorNotificationsPage() {
  useRequireAuth(['DOCTOR']);
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    notificationsApi.list().then((r) => setItems(r.data.data.items));
  }, []);

  return (
    <DashboardShell title="Notifications">
      {items.length === 0 ? (
        <EmptyState title="No alerts" description="New booking requests will appear here." />
      ) : (
        <div className="space-y-3 max-w-3xl">
          {items.map((n) => (
            <article key={n.id} className="glass-panel p-4">
              <div className="flex justify-between gap-3">
                <h3 className="font-semibold">{n.title}</h3>
                <span className="text-xs text-[var(--ink-muted)]">{formatDate(n.createdAt, 'DD MMM, HH:mm')}</span>
              </div>
              <p className="text-sm text-[var(--ink-muted)] mt-1">{n.message}</p>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
