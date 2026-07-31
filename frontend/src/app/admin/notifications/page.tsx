'use client';

import { useEffect, useState } from 'react';
import { DashboardShell, EmptyState } from '@/components/dashboard-shell';
import { useRequireAuth } from '@/contexts/auth-context';
import { notificationsApi } from '@/services/api';
import type { NotificationItem } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminNotificationsPage() {
  useRequireAuth(['ADMIN', 'SUPER_ADMIN']);
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    notificationsApi.list().then((r) => setItems(r.data.data.items));
  }, []);

  return (
    <DashboardShell title="Notifications">
      {items.length === 0 ? (
        <EmptyState title="No system alerts" description="Operational notifications will show here." />
      ) : (
        <div className="space-y-3 max-w-3xl">
          {items.map((n) => (
            <article key={n.id} className="glass-panel p-4">
              <h3 className="font-semibold">{n.title}</h3>
              <p className="text-sm text-[var(--ink-muted)] mt-1">{n.message}</p>
              <p className="text-xs mt-2 text-[var(--ink-muted)]">{formatDate(n.createdAt, 'DD MMM, HH:mm')}</p>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
