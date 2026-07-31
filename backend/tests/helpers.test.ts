import { describe, expect, it } from 'vitest';
import {
  generateBillNumber,
  generateSlots,
  getPagination,
  jsDayToEnum,
  minutesToTime,
  slugify,
  timeToMinutes,
} from '../src/utils/helpers';

describe('getPagination', () => {
  it('uses defaults when query empty', () => {
    const result = getPagination({ query: {} } as never);
    expect(result).toEqual({
      page: 1,
      limit: 10,
      skip: 0,
      search: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('parses page, limit, search and sort', () => {
    const result = getPagination({
      query: { page: '2', limit: '20', search: '  cardio ', sortBy: 'name', sortOrder: 'asc' },
    } as never);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(20);
    expect(result.skip).toBe(20);
    expect(result.search).toBe('cardio');
    expect(result.sortBy).toBe('name');
    expect(result.sortOrder).toBe('asc');
  });

  it('clamps invalid page/limit', () => {
    const result = getPagination({ query: { page: '0', limit: '999' } } as never);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(100);
  });
});

describe('slugify', () => {
  it('slugifies department names', () => {
    expect(slugify('General Medicine')).toBe('general-medicine');
    expect(slugify('  Cardiology!! ')).toBe('cardiology');
  });
});

describe('time helpers', () => {
  it('converts time <-> minutes', () => {
    expect(timeToMinutes('09:30')).toBe(570);
    expect(minutesToTime(570)).toBe('09:30');
    expect(minutesToTime(0)).toBe('00:00');
  });

  it('maps JS weekday to enum', () => {
    expect(jsDayToEnum(0)).toBe('SUNDAY');
    expect(jsDayToEnum(1)).toBe('MONDAY');
    expect(jsDayToEnum(5)).toBe('FRIDAY');
  });
});

describe('generateSlots', () => {
  it('creates 30-minute slots for a work window', () => {
    const slots = generateSlots('09:00', '11:00', 30);
    expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30']);
  });

  it('returns empty when window shorter than slot', () => {
    expect(generateSlots('09:00', '09:20', 30)).toEqual([]);
  });

  it('supports custom slot length', () => {
    expect(generateSlots('10:00', '11:00', 20)).toEqual(['10:00', '10:20', '10:40']);
  });
});

describe('generateBillNumber', () => {
  it('matches invoice pattern', () => {
    expect(generateBillNumber()).toMatch(/^INV-\d{8}-\d{4}$/);
  });
});
