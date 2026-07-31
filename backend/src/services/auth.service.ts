import { Role } from '@prisma/client';
import prisma from '../prisma/client';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../exceptions/AppError';
import {
  comparePassword,
  getRefreshExpiryDate,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/auth';
import { auditService } from './audit.service';

function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  status: string;
  emailVerified: boolean;
  avatarUrl: string | null;
  createdAt: Date;
  doctor?: { id: string } | null;
  patient?: { id: string } | null;
  staff?: { id: string } | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    status: user.status,
    emailVerified: user.emailVerified,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    doctorId: user.doctor?.id ?? null,
    patientId: user.patient?.id ?? null,
    staffId: user.staff?.id ?? null,
  };
}

export class AuthService {
  async register(input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'PATIENT' | 'DOCTOR' | 'STAFF';
  }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) throw new ConflictError('Email already registered');

    const role = input.role ?? 'PATIENT';
    if (role !== 'PATIENT') {
      throw new ForbiddenError('Only patients can self-register. Contact admin for staff/doctor accounts.');
    }

    const hashed = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        password: hashed,
        phone: input.phone,
        role: 'PATIENT',
        emailVerified: true,
        patient: { create: {} },
      },
      include: { patient: true, doctor: true, staff: true },
    });

    const tokens = await this.issueTokens(user);
    await auditService.log({ userId: user.id, action: 'CREATE', entity: 'User', entityId: user.id });

    return { user: sanitizeUser(user), ...tokens };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      include: { patient: true, doctor: true, staff: true },
    });

    if (!user) throw new UnauthorizedError('Invalid email or password');
    if (user.status !== 'ACTIVE') throw new ForbiddenError('Account is not active');

    const valid = await comparePassword(password, user.password);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    const tokens = await this.issueTokens(user);
    await auditService.log({ userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id });

    return { user: sanitizeUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired or revoked');
    }

    const user = await prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null, status: 'ACTIVE' },
      include: { patient: true, doctor: true, staff: true },
    });
    if (!user) throw new UnauthorizedError('User not found');

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  }

  async logout(accessToken: string | undefined, refreshToken?: string) {
    if (accessToken) {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await prisma.tokenBlacklist.create({
        data: { token: accessToken, expiresAt },
      }).catch(() => undefined);
    }
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revokedAt: new Date() },
      });
    }
    return { message: 'Logged out' };
  }

  async me(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        patient: true,
        doctor: { include: { department: true, schedules: true } },
        staff: true,
      },
    });
    if (!user) throw new NotFoundError('User not found');
    return {
      ...sanitizeUser(user),
      profile: user.patient ?? user.doctor ?? user.staff ?? null,
    };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Always return success to avoid email enumeration
    if (!user) return { message: 'If that email exists, a reset link will be sent.' };
    // Placeholder — integrate Nodemailer in production
    return { message: 'If that email exists, a reset link will be sent.' };
  }

  private async issueTokens(user: { id: string; email: string; role: Role }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: getRefreshExpiryDate(),
      },
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
