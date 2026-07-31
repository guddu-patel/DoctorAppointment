import { describe, expect, it } from 'vitest';
import { ROLE_HOME, APP_NAME, API_URL } from '@/config';

describe('config', () => {
  it('exposes app name and api url', () => {
    expect(APP_NAME.length).toBeGreaterThan(0);
    expect(API_URL).toContain('/api/v1');
  });

  it('maps every role to a dashboard home', () => {
    expect(ROLE_HOME.PATIENT).toBe('/patient');
    expect(ROLE_HOME.DOCTOR).toBe('/doctor');
    expect(ROLE_HOME.STAFF).toBe('/staff');
    expect(ROLE_HOME.ADMIN).toBe('/admin');
    expect(ROLE_HOME.SUPER_ADMIN).toBe('/admin');
  });
});
