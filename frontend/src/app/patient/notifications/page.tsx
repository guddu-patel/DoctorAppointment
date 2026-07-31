'use client';

import { useEffect, useState } from 'react';
import { DashboardShell, EmptyState } from '@/components/dashboard-shell';
import { useRequireAuth } from '@/contexts/auth-context';
import { notificationsApi } from '@/services/api';
import type { NotificationItem } from '@/types';
import { formatDate } from '@/lib/utils';

function NotificationsView({ roles }: { roles: string[] }) {
  useRequireAuth(roles);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    const { data } = await notificationsApi.list();
    setItems(data.data.items);
    setUnread(data.data.unreadCount);
  }

  useEffect(() => {
    load();
  }, []);

  async function markAll() {
    await notificationsApi.markAllRead();
    load();
  }

  return (
    <DashboardShell
      title="Notifications"
      subtitle={`${unread} unread`}
      actions={<button className="btn btn-secondary !py-2" onClick={markAll}>Mark all read</button>}
    >
      {items.length === 0 ? (
        <EmptyState title="All quiet" description="You will see booking and payment alerts here." />
      ) : (
        <div className="space-y-3 max-w-3xl">
          {items.map((n) => (
            <article
              key={n.id}
              className={`glass-panel p-4 ${n.isRead ? 'opacity-70' : ''}`}
              onClick={() => !n.isRead && notificationsApi.markRead(n.id).then(load)}
            >
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

export default function PatientNotificationsPage() {
  return <NotificationsView roles={['PATIENT']} />;
}
