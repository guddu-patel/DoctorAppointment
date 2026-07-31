import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env';
import { JwtPayload } from '../types';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: { sub: string; email: string; role: Role }): string {
  return jwt.sign({ ...payload, type: 'access' }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(payload: { sub: string; email: string; role: Role }): string {
  return jwt.sign({ ...payload, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}

export function getRefreshExpiryDate(): Date {
  const match = env.JWT_REFRESH_EXPIRES_IN.match(/^(\d+)([dhms])$/);
  const now = Date.now();
  if (!match) return new Date(now + 7 * 24 * 60 * 60 * 1000);
  const value = Number(match[1]);
  const unit = match[2];
  const ms =
    unit === 'd'
      ? value * 24 * 60 * 60 * 1000
      : unit === 'h'
        ? value * 60 * 60 * 1000
        : unit === 'm'
          ? value * 60 * 1000
          : value * 1000;
  return new Date(now + ms);
}
