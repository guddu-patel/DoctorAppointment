import { describe, expect, it } from 'vitest';
import {
  createAppointmentSchema,
  createBillSchema,
  createPrescriptionSchema,
  loginSchema,
  registerSchema,
  updateAppointmentSchema,
} from '../src/validators/schemas';

describe('registerSchema', () => {
  it('accepts valid patient registration', () => {
    const data = registerSchema.parse({
      name: 'Aarav Patel',
      email: 'aarav@example.com',
      password: 'Password@123',
      phone: '+91-9000000006',
    });
    expect(data.role).toBe('PATIENT');
  });

  it('rejects short password', () => {
    expect(() =>
      registerSchema.parse({ name: 'A', email: 'a@b.com', password: 'short' })
    ).toThrow();
  });

  it('rejects invalid email', () => {
    expect(() =>
      registerSchema.parse({ name: 'Aarav', email: 'not-an-email', password: 'Password@123' })
    ).toThrow();
  });
});

describe('loginSchema', () => {
  it('requires email and password', () => {
    expect(loginSchema.parse({ email: 'a@b.com', password: 'x' }).email).toBe('a@b.com');
    expect(() => loginSchema.parse({ email: 'bad', password: '' })).toThrow();
  });
});

describe('createAppointmentSchema', () => {
  it('accepts booking payload', () => {
    const data = createAppointmentSchema.parse({
      doctorId: 'doc_1',
      appointmentDate: '2026-08-01',
      startTime: '10:00',
      reason: 'Checkup',
    });
    expect(data.startTime).toBe('10:00');
  });

  it('rejects bad date format', () => {
    expect(() =>
      createAppointmentSchema.parse({
        doctorId: 'doc_1',
        appointmentDate: '01-08-2026',
        startTime: '10:00',
      })
    ).toThrow();
  });
});

describe('updateAppointmentSchema', () => {
  it('allows status transitions values', () => {
    expect(updateAppointmentSchema.parse({ status: 'CONFIRMED' }).status).toBe('CONFIRMED');
    expect(() => updateAppointmentSchema.parse({ status: 'UNKNOWN' })).toThrow();
  });
});

describe('createPrescriptionSchema', () => {
  it('requires medicines array', () => {
    const data = createPrescriptionSchema.parse({
      appointmentId: 'apt_1',
      diagnosis: 'Flu',
      medicines: [
        { name: 'Paracetamol', dosage: '500mg', frequency: 'TID', duration: '3 days' },
      ],
    });
    expect(data.medicines).toHaveLength(1);
  });
});

describe('createBillSchema', () => {
  it('defaults numeric charges', () => {
    const data = createBillSchema.parse({ appointmentId: 'apt_1' });
    expect(data.consultationFee).toBe(0);
    expect(data.discount).toBe(0);
  });

  it('accepts payment method', () => {
    const data = createBillSchema.parse({
      appointmentId: 'apt_1',
      consultationFee: 800,
      paymentMethod: 'UPI',
    });
    expect(data.paymentMethod).toBe('UPI');
  });
});
