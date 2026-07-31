import { describe, expect, it } from 'vitest';
import {
  cn,
  formatDate,
  formatMoney,
  initials,
  statusBadgeClass,
  tomorrowISO,
} from '@/lib/utils';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });
});

describe('formatDate', () => {
  it('returns em dash for empty', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });

  it('formats ISO dates', () => {
    expect(formatDate('2026-07-31')).toMatch(/Jul 2026|31/);
  });
});

describe('formatMoney', () => {
  it('formats INR amounts', () => {
    expect(formatMoney(null)).toBe('₹0');
    expect(formatMoney(800)).toMatch(/800/);
  });
});

describe('statusBadgeClass', () => {
  it('lowercases status into badge class', () => {
    expect(statusBadgeClass('CONFIRMED')).toBe('badge badge-confirmed');
  });
});

describe('initials', () => {
  it('uses first letters capped at 2', () => {
    expect(initials('Aarav Patel')).toBe('AP');
    expect(initials('Dr Ananya Mehta Kapoor')).toBe('DA');
  });
});

describe('tomorrowISO', () => {
  it('returns YYYY-MM-DD', () => {
    expect(tomorrowISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
