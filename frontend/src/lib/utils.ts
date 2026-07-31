import { clsx, type ClassValue } from 'clsx';
import dayjs from 'dayjs';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(value?: string | Date | null, fmt = 'DD MMM YYYY') {
  if (!value) return '—';
  return dayjs(value).format(fmt);
}

export function formatMoney(amount?: number | null) {
  if (amount == null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function statusBadgeClass(status: string) {
  return `badge badge-${status.toLowerCase()}`;
}

export function tomorrowISO() {
  return dayjs().add(1, 'day').format('YYYY-MM-DD');
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
