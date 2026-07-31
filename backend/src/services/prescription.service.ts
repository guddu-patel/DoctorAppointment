import prisma from '../prisma/client';
import { ForbiddenError, NotFoundError, ConflictError } from '../exceptions/AppError';
import { AuthUser } from '../types';
import { auditService } from './audit.service';
import { notificationService } from './notification.service';

export class PrescriptionService {
  async create(
    input: {
      appointmentId: string;
      diagnosis: string;
      medicines: { name: string; dosage: string; frequency: string; duration: string; notes?: string }[];
      tests?: string[];
      notes?: string;
      followupDate?: string;
    },
    user: AuthUser
  ) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: input.appointmentId, deletedAt: null },
      include: { prescription: true, patient: true, doctor: true },
    });
    if (!appointment) throw new NotFoundError('Appointment not found');
    if (appointment.prescription) throw new ConflictError('Prescription already exists for this appointment');

    if (user.role === 'DOCTOR' && user.doctorId !== appointment.doctorId) {
      throw new ForbiddenError('You can only prescribe for your own appointments');
    }

    const prescription = await prisma.prescription.create({
      data: {
        appointmentId: input.appointmentId,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        diagnosis: input.diagnosis,
        medicines: input.medicines,
        tests: input.tests ?? [],
        notes: input.notes,
        followupDate: input.followupDate ? new Date(input.followupDate) : undefined,
      },
      include: {
        doctor: { include: { user: { select: { name: true } } } },
        patient: { include: { user: { select: { name: true } } } },
        appointment: true,
      },
    });

    // Mark appointment completed if still checked-in/confirmed
    if (['CONFIRMED', 'CHECKED_IN', 'PENDING'].includes(appointment.status)) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'COMPLETED' },
      });
    }

    await notificationService.create({
      userId: appointment.patient.userId,
      title: 'Prescription Ready',
      message: 'Your doctor has uploaded a prescription. You can download it from your dashboard.',
      type: 'PRESCRIPTION_UPLOADED',
      meta: { prescriptionId: prescription.id },
    });

    await auditService.log({
      userId: user.id,
      action: 'CREATE',
      entity: 'Prescription',
      entityId: prescription.id,
    });

    return prescription;
  }

  async getById(id: string, user: AuthUser) {
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        doctor: { include: { user: { select: { name: true, email: true } }, department: true } },
        patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
        appointment: true,
      },
    });
    if (!prescription) throw new NotFoundError('Prescription not found');

    if (user.role === 'PATIENT' && user.patientId !== prescription.patientId) {
      throw new ForbiddenError('Access denied');
    }
    if (user.role === 'DOCTOR' && user.doctorId !== prescription.doctorId) {
      throw new ForbiddenError('Access denied');
    }

    return prescription;
  }

  async update(id: string, input: Record<string, unknown>, user: AuthUser) {
    const prescription = await prisma.prescription.findUnique({ where: { id } });
    if (!prescription) throw new NotFoundError('Prescription not found');

    if (user.role === 'DOCTOR' && user.doctorId !== prescription.doctorId) {
      throw new ForbiddenError('Access denied');
    }

    const updated = await prisma.prescription.update({
      where: { id },
      data: {
        ...(input.diagnosis ? { diagnosis: input.diagnosis as string } : {}),
        ...(input.medicines ? { medicines: input.medicines as object } : {}),
        ...(input.tests !== undefined ? { tests: input.tests as object } : {}),
        ...(input.notes !== undefined ? { notes: input.notes as string } : {}),
        ...(input.followupDate
          ? { followupDate: new Date(input.followupDate as string) }
          : {}),
      },
      include: {
        doctor: { include: { user: { select: { name: true } } } },
        patient: { include: { user: { select: { name: true } } } },
      },
    });

    await auditService.log({ userId: user.id, action: 'UPDATE', entity: 'Prescription', entityId: id });
    return updated;
  }

  async listForPatient(patientId: string) {
    return prisma.prescription.findMany({
      where: { patientId },
      include: {
        doctor: { include: { user: { select: { name: true } }, department: true } },
        appointment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const prescriptionService = new PrescriptionService();
