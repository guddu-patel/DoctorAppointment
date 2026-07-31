import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/prisma/client';

type LoginResult = { accessToken: string; user: { id: string; role: string } };

async function login(email: string, password = 'Password@123'): Promise<LoginResult> {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  expect(res.status).toBe(200);
  return res.body.data;
}

function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

describe('HTTP auth + appointment status paths', () => {
  let patientToken: string;
  let doctorToken: string;
  let staffToken: string;
  let doctorId: string;
  let patientId: string;
  let appointmentId: string;

  beforeAll(async () => {
    const patient = await login('patient@doctorcare.local');
    const doctor = await login('doctor@doctorcare.local');
    const staff = await login('staff@doctorcare.local');
    patientToken = patient.accessToken;
    doctorToken = doctor.accessToken;
    staffToken = staff.accessToken;

    const meDoctor = await request(app).get('/api/v1/auth/me').set(auth(doctorToken));
    doctorId = meDoctor.body.data.doctorId;
    const mePatient = await request(app).get('/api/v1/auth/me').set(auth(patientToken));
    patientId = mePatient.body.data.patientId;

    expect(doctorId).toBeTruthy();
    expect(patientId).toBeTruthy();
  });

  afterAll(async () => {
    if (appointmentId) {
      await prisma.appointment.deleteMany({ where: { id: appointmentId } }).catch(() => undefined);
    }
    await prisma.$disconnect();
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'patient@doctorcare.local', password: 'WrongPass!' });
    expect(res.status).toBe(401);
  });

  it('patient cannot book an already-taken slot (conflict)', async () => {
    // Find a free slot first
    const date = new Date();
    date.setDate(date.getDate() + 3);
    while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
    const dateStr = date.toISOString().slice(0, 10);

    const slotsRes = await request(app).get(`/api/v1/doctors/${doctorId}/slots`).query({ date: dateStr });
    expect(slotsRes.status).toBe(200);
    const slots = slotsRes.body.data.slots as { startTime: string; endTime: string }[];
    expect(slots.length).toBeGreaterThan(0);
    const slot = slots[0];

    const book1 = await request(app)
      .post('/api/v1/appointments')
      .set(auth(patientToken))
      .send({
        doctorId,
        appointmentDate: dateStr,
        startTime: slot.startTime,
        endTime: slot.endTime,
        reason: 'Integration test booking',
      });
    expect(book1.status).toBe(201);
    appointmentId = book1.body.data.id;
    expect(book1.body.data.status).toBe('PENDING');

    const book2 = await request(app)
      .post('/api/v1/appointments')
      .set(auth(patientToken))
      .send({
        doctorId,
        appointmentDate: dateStr,
        startTime: slot.startTime,
        endTime: slot.endTime,
        reason: 'Double book attempt',
      });
    expect(book2.status).toBe(409);
  });

  it('patient cannot confirm own appointment (illegal role)', async () => {
    const res = await request(app)
      .put(`/api/v1/appointments/${appointmentId}`)
      .set(auth(patientToken))
      .send({ status: 'CONFIRMED' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('doctor can confirm PENDING → CONFIRMED', async () => {
    const res = await request(app)
      .put(`/api/v1/appointments/${appointmentId}`)
      .set(auth(doctorToken))
      .send({ status: 'CONFIRMED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CONFIRMED');
  });

  it('doctor cannot jump CONFIRMED → REJECTED (illegal graph)', async () => {
    const res = await request(app)
      .put(`/api/v1/appointments/${appointmentId}`)
      .set(auth(doctorToken))
      .send({ status: 'REJECTED' });
    expect(res.status).toBe(400);
    expect(String(res.body.message)).toMatch(/Illegal appointment status transition/i);
  });

  it('staff can check-in CONFIRMED → CHECKED_IN', async () => {
    const res = await request(app)
      .put(`/api/v1/appointments/${appointmentId}`)
      .set(auth(staffToken))
      .send({ status: 'CHECKED_IN' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CHECKED_IN');
  });

  it('doctor can complete CHECKED_IN → COMPLETED', async () => {
    const res = await request(app)
      .put(`/api/v1/appointments/${appointmentId}`)
      .set(auth(doctorToken))
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('patient cannot cancel a COMPLETED appointment', async () => {
    const res = await request(app)
      .put(`/api/v1/appointments/${appointmentId}`)
      .set(auth(patientToken))
      .send({ status: 'CANCELLED' });
    expect([400, 403]).toContain(res.status);
  });
});
