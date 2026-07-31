import { describe, expect, it } from 'vitest';
import {
  comparePassword,
  getRefreshExpiryDate,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../src/utils/auth';

describe('password hashing', () => {
  it('hashes and verifies password', async () => {
    const hash = await hashPassword('Password@123');
    expect(hash).not.toBe('Password@123');
    expect(await comparePassword('Password@123', hash)).toBe(true);
    expect(await comparePassword('wrong', hash)).toBe(false);
  });
});

describe('JWT tokens', () => {
  const payload = {
    sub: 'user_1',
    email: 'doc@example.com',
    role: 'DOCTOR' as const,
  };

  it('signs and verifies access token', () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe('user_1');
    expect(decoded.email).toBe('doc@example.com');
    expect(decoded.role).toBe('DOCTOR');
    expect(decoded.type).toBe('access');
  });

  it('signs and verifies refresh token', () => {
    const token = signRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded.type).toBe('refresh');
    expect(decoded.sub).toBe('user_1');
  });

  it('rejects access token verified with refresh secret path', () => {
    const access = signAccessToken(payload);
    expect(() => verifyRefreshToken(access)).toThrow();
  });
});

describe('getRefreshExpiryDate', () => {
  it('returns a future date for 7d config', () => {
    const expiry = getRefreshExpiryDate();
    expect(expiry.getTime()).toBeGreaterThan(Date.now());
  });
});
