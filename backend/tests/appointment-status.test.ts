import { describe, expect, it } from 'vitest';
import { AppointmentStatus } from '@prisma/client';
import {
  assertAppointmentStatusChange,
  canTransition,
  roleMaySetStatus,
  APPOINTMENT_TRANSITIONS,
} from '../src/domain/appointment-status';
import { BadRequestError, ForbiddenError } from '../src/exceptions/AppError';

describe('appointment status state machine', () => {
  it('allows PENDING → CONFIRMED / REJECTED / CANCELLED', () => {
    expect(canTransition('PENDING', 'CONFIRMED')).toBe(true);
    expect(canTransition('PENDING', 'REJECTED')).toBe(true);
    expect(canTransition('PENDING', 'CANCELLED')).toBe(true);
    expect(canTransition('PENDING', 'COMPLETED')).toBe(false);
  });

  it('blocks transitions out of terminal states', () => {
    for (const terminal of ['COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'] as AppointmentStatus[]) {
      expect(APPOINTMENT_TRANSITIONS[terminal]).toEqual([]);
      expect(canTransition(terminal, 'CONFIRMED')).toBe(false);
    }
  });

  it('patients may only set CANCELLED', () => {
    expect(roleMaySetStatus('PATIENT', 'CANCELLED')).toBe(true);
    expect(roleMaySetStatus('PATIENT', 'CONFIRMED')).toBe(false);
  });

  it('assertAppointmentStatusChange accepts doctor confirm from pending', () => {
    expect(() => assertAppointmentStatusChange('PENDING', 'CONFIRMED', 'DOCTOR')).not.toThrow();
  });

  it('assertAppointmentStatusChange rejects patient confirm', () => {
    expect(() => assertAppointmentStatusChange('PENDING', 'CONFIRMED', 'PATIENT')).toThrow(
      ForbiddenError
    );
  });

  it('assertAppointmentStatusChange rejects illegal graph edge for doctor', () => {
    expect(() => assertAppointmentStatusChange('PENDING', 'COMPLETED', 'DOCTOR')).toThrow(
      BadRequestError
    );
  });

  it('assertAppointmentStatusChange rejects changes from completed for staff', () => {
    expect(() => assertAppointmentStatusChange('COMPLETED', 'CANCELLED', 'STAFF')).toThrow(
      BadRequestError
    );
  });

  it('admin may override role graph (ops recovery)', () => {
    expect(() => assertAppointmentStatusChange('COMPLETED', 'CONFIRMED', 'ADMIN')).not.toThrow();
  });
});
