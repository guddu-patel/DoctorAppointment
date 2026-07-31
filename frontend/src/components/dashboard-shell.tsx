'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Stethoscope,
  Users,
  Wallet,
  X,
  Building2,
  FileText,
  Clock3,
  UserRound,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { APP_NAME } from '@/config';
import { initials } from '@/lib/utils';

type NavItem = { href: string; label: string; icon: ReactNode };

const NAV: Record<string, NavItem[]> = {
  PATIENT: [
    { href: '/patient', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/patient/appointments', label: 'Appointments', icon: <CalendarDays size={18} /> },
    { href: '/patient/book', label: 'Book Visit', icon: <Clock3 size={18} /> },
    { href: '/patient/prescriptions', label: 'Prescriptions', icon: <FileText size={18} /> },
    { href: '/patient/payments', label: 'Payments', icon: <Wallet size={18} /> },
    { href: '/patient/profile', label: 'Profile', icon: <UserRound size={18} /> },
  ],
  DOCTOR: [
    { href: '/doctor', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/doctor/appointments', label: "Today's Queue", icon: <ClipboardList size={18} /> },
    { href: '/doctor/patients', label: 'Patients', icon: <Users size={18} /> },
    { href: '/doctor/availability', label: 'Availability', icon: <CalendarDays size={18} /> },
    { href: '/doctor/settings', label: 'Settings', icon: <Settings size={18} /> },
  ],
  STAFF: [
    { href: '/staff', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/staff/appointments', label: 'Appointments', icon: <CalendarDays size={18} /> },
    { href: '/staff/patients', label: 'Patients', icon: <Users size={18} /> },
    { href: '/staff/billing', label: 'Billing', icon: <Wallet size={18} /> },
    { href: '/staff/queue', label: 'Queue', icon: <ClipboardList size={18} /> },
  ],
  ADMIN: [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/admin/doctors', label: 'Doctors', icon: <Stethoscope size={18} /> },
    { href: '/admin/patients', label: 'Patients', icon: <Users size={18} /> },
    { href: '/admin/staff', label: 'Staff', icon: <Building2 size={18} /> },
    { href: '/admin/appointments', label: 'Appointments', icon: <CalendarDays size={18} /> },
    { href: '/admin/departments', label: 'Departments', icon: <Building2 size={18} /> },
    { href: '/admin/billing', label: 'Billing', icon: <Wallet size={18} /> },
  ],
  SUPER_ADMIN: [],
};

NAV.SUPER_ADMIN = NAV.ADMIN;

export function DashboardShell({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="glass-panel px-8 py-6 text-sm text-[var(--ink-muted)]">Loading your workspace…</div>
      </div>
    );
  }

  const items = NAV[user.role] || NAV.PATIENT;

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[260px] border-r border-[var(--line)] bg-[rgba(255,255,255,0.92)] backdrop-blur-xl p-4 transition-transform md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-[var(--brand)] text-white grid place-items-center">
              <Stethoscope size={18} />
            </span>
            <span className="font-display text-xl text-[var(--brand-deep)]">{APP_NAME}</span>
          </Link>
          <button className="md:hidden btn btn-ghost" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => logout()}
          className="sidebar-link mt-8 w-full text-left text-[var(--danger)]"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgba(243,247,245,0.85)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
            <div className="flex items-center gap-3">
              <button className="md:hidden btn btn-secondary !px-3" onClick={() => setOpen(true)}>
                <Menu size={18} />
              </button>
              <div>
                <h1 className="font-display text-2xl leading-tight">{title}</h1>
                {subtitle ? <p className="text-sm text-[var(--ink-muted)]">{subtitle}</p> : null}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {actions}
              <Link href={`/${user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? 'admin' : user.role.toLowerCase()}/notifications`} className="btn btn-secondary !px-3">
                <Bell size={16} />
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white pl-1 pr-3 py-1">
                <span className="h-8 w-8 rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)] grid place-items-center text-xs font-bold">
                  {initials(user.name)}
                </span>
                <div className="hide-mobile leading-tight">
                  <div className="text-sm font-semibold">{user.name}</div>
                  <div className="text-[11px] uppercase tracking-wide text-[var(--ink-muted)]">{user.role.replace('_', ' ')}</div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8 fade-up">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="stat-card">
      <div className="text-sm text-[var(--ink-muted)] font-semibold">{label}</div>
      <div className="font-display text-3xl mt-2 text-[var(--brand-deep)]">{value}</div>
      {hint ? <div className="text-xs text-[var(--ink-muted)] mt-2">{hint}</div> : null}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="glass-panel p-10 text-center">
      <h3 className="font-display text-xl">{title}</h3>
      <p className="text-[var(--ink-muted)] mt-2 max-w-md mx-auto">{description}</p>
    </div>
  );
}
