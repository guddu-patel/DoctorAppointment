import { AppointmentStatus, Role } from '@prisma/client';
import { BadRequestError, ForbiddenError } from '../exceptions/AppError';

/** Terminal statuses — no further clinical transitions allowed (except admin override). */
export const TERMINAL_STATUSES: AppointmentStatus[] = ['COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'];

/**
 * Allowed next statuses from a given status (clinical lifecycle).
 * Ownership: only this module defines legal transitions; services must call assertTransition.
 */
export const APPOINTMENT_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['CHECKED_IN', 'CANCELLED', 'NO_SHOW', 'COMPLETED'],
  CHECKED_IN: ['COMPLETED', 'NO_SHOW'],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
  NO_SHOW: [],
};

/** Role → statuses they may set (intersection with transition graph still required). */
export const ROLE_STATUS_PERMISSIONS: Record<Role, AppointmentStatus[] | '*'> = {
  SUPER_ADMIN: '*',
  ADMIN: '*',
  STAFF: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'NO_SHOW', 'COMPLETED'],
  DOCTOR: ['CONFIRMED', 'REJECTED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW'],
  PATIENT: ['CANCELLED'],
};

export function canTransition(from: AppointmentStatus, to: AppointmentStatus): boolean {
  if (from === to) return true;
  return APPOINTMENT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function roleMaySetStatus(role: Role, to: AppointmentStatus): boolean {
  const allowed = ROLE_STATUS_PERMISSIONS[role];
  if (allowed === '*') return true;
  return allowed.includes(to);
}

/**
 * Enforces appointment status state machine + RBAC.
 * Throws ForbiddenError / BadRequestError — never silently allow illegal paths.
 */
export function assertAppointmentStatusChange(
  current: AppointmentStatus,
  next: AppointmentStatus,
  role: Role
): void {
  if (current === next) return;

  if (!roleMaySetStatus(role, next)) {
    throw new ForbiddenError(`Role ${role} cannot set appointment status to ${next}`);
  }

  // SUPER_ADMIN / ADMIN may force transitions for ops recovery, but still block nonsense on terminals for others
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return;
  }

  if (TERMINAL_STATUSES.includes(current)) {
    throw new BadRequestError(`Cannot change status of a ${current} appointment`);
  }

  if (!canTransition(current, next)) {
    throw new BadRequestError(
      `Illegal appointment status transition: ${current} → ${next}`
    );
  }

  if (role === 'PATIENT' && next === 'CANCELLED' && TERMINAL_STATUSES.includes(current)) {
    throw new BadRequestError('Cannot cancel this appointment');
  }
}

export function describeStateMachine(): string {
  return Object.entries(APPOINTMENT_TRANSITIONS)
    .map(([from, tos]) => `${from} → [${tos.join(', ') || '∅'}]`)
    .join('\n');
}
