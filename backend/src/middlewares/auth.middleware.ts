import { NextFunction, Response } from 'express';
import { Role } from '@prisma/client';
import prisma from '../prisma/client';
import { AuthRequest } from '../types';
import { UnauthorizedError, ForbiddenError } from '../exceptions/AppError';
import { verifyAccessToken } from '../utils/auth';

export async function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const blacklisted = await prisma.tokenBlacklist.findUnique({ where: { token } });
    if (blacklisted) {
      throw new UnauthorizedError('Token has been revoked');
    }

    const payload = verifyAccessToken(token);
    if (payload.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    const user = await prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
      include: {
        doctor: { select: { id: true } },
        patient: { select: { id: true } },
        staff: { select: { id: true } },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedError('User not found or inactive');
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      doctorId: user.doctor?.id,
      patientId: user.patient?.id,
      staffId: user.staff?.id,
    };

    next();
  } catch (err) {
    next(err instanceof UnauthorizedError ? err : new UnauthorizedError('Invalid or expired token'));
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission for this action'));
    }
    next();
  };
}

/** Optional auth — attaches user if token present, otherwise continues */
export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) return next();

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null, status: 'ACTIVE' },
      include: {
        doctor: { select: { id: true } },
        patient: { select: { id: true } },
        staff: { select: { id: true } },
      },
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        doctorId: user.doctor?.id,
        patientId: user.patient?.id,
        staffId: user.staff?.id,
      };
    }
    next();
  } catch {
    next();
  }
}
