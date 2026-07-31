import { AppointmentStatus, Prisma } from '@prisma/client';
import prisma from '../prisma/client';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../exceptions/AppError';
import { auditService } from './audit.service';
import { notificationService } from './notification.service';
import { doctorService } from './doctor.service';
import { AuthUser } from '../types';
import { assertAppointmentStatusChange } from '../domain/appointment-status';

const appointmentInclude = {
  doctor: {
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      department: true,
    },
  },
  patient: {
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  },
  prescription: true,
  bill: true,
} satisfies Prisma.AppointmentInclude;

export class AppointmentService {
  async list(
    params: {
      page: number;
      limit: number;
      skip: number;
      search?: string;
      status?: AppointmentStatus;
      doctorId?: string;
      patientId?: string;
      date?: string;
      sortOrder: 'asc' | 'desc';
    },
    user: AuthUser
  ) {
    const where: Prisma.AppointmentWhereInput = {
      deletedAt: null,
      ...(params.status ? { status: params.status } : {}),
      ...(params.date ? { appointmentDate: new Date(params.date + 'T00:00:00') } : {}),
    };

    // Scope by role
    if (user.role === 'DOCTOR') {
      where.doctorId = user.doctorId;
    } else if (user.role === 'PATIENT') {
      where.patientId = user.patientId;
    } else {
      if (params.doctorId) where.doctorId = params.doctorId;
      if (params.patientId) where.patientId = params.patientId;
    }

    if (params.search) {
      where.OR = [
        { reason: { contains: params.search, mode: 'insensitive' } },
        { patient: { user: { name: { contains: params.search, mode: 'insensitive' } } } },
        { doctor: { user: { name: { contains: params.search, mode: 'insensitive' } } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: appointmentInclude,
        skip: params.skip,
        take: params.limit,
        orderBy: [{ appointmentDate: params.sortOrder }, { startTime: 'asc' }],
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      items: items.map((a) => ({
        ...a,
        doctor: a.doctor
          ? { ...a.doctor, consultationFee: Number(a.doctor.consultationFee) }
          : a.doctor,
        bill: a.bill
          ? {
              ...a.bill,
              consultationFee: Number(a.bill.consultationFee),
              medicineCharges: Number(a.bill.medicineCharges),
              labCharges: Number(a.bill.labCharges),
              otherCharges: Number(a.bill.otherCharges),
              discount: Number(a.bill.discount),
              tax: Number(a.bill.tax),
              subtotal: Number(a.bill.subtotal),
              total: Number(a.bill.total),
            }
          : null,
      })),
      total,
    };
  }

  async getById(id: string, user: AuthUser) {
    const appointment = await prisma.appointment.findFirst({
      where: { id, deletedAt: null },
      include: appointmentInclude,
    });
    if (!appointment) throw new NotFoundError('Appointment not found');
    this.assertAccess(appointment, user);
    return appointment;
  }

  async create(
    input: {
      doctorId: string;
      patientId?: string;
      appointmentDate: string;
      startTime: string;
      endTime?: string;
      reason?: string;
      notes?: string;
    },
    user: AuthUser
  ) {
    let patientId = input.patientId;
    if (user.role === 'PATIENT') {
      patientId = user.patientId;
    }
    if (!patientId) throw new BadRequestError('Patient is required');

    const doctor = await prisma.doctor.findFirst({
      where: { id: input.doctorId, deletedAt: null, isAvailable: true },
      include: { user: true, schedules: { where: { isActive: true } } },
    });
    if (!doctor) throw new NotFoundError('Doctor not found or unavailable');

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, deletedAt: null },
      include: { user: true },
    });
    if (!patient) throw new NotFoundError('Patient not found');

    const availability = await doctorService.getAvailableSlots(input.doctorId, input.appointmentDate);
    const slot = availability.slots.find((s) => s.startTime === input.startTime);
    if (!slot) throw new ConflictError('Selected time slot is not available');

    const endTime = input.endTime ?? slot.endTime;
    const date = new Date(input.appointmentDate + 'T00:00:00');

    // Queue number for the day
    const countToday = await prisma.appointment.count({
      where: {
        doctorId: input.doctorId,
        appointmentDate: date,
        deletedAt: null,
        status: { notIn: ['CANCELLED', 'REJECTED'] },
      },
    });

    const appointment = await prisma.appointment.create({
      data: {
        doctorId: input.doctorId,
        patientId,
        appointmentDate: date,
        startTime: input.startTime,
        endTime,
        reason: input.reason,
        notes: input.notes,
        status: 'PENDING',
        queueNumber: countToday + 1,
      },
      include: appointmentInclude,
    });

    await notificationService.create({
      userId: doctor.userId,
      title: 'New Appointment Request',
      message: `${patient.user.name} requested an appointment on ${input.appointmentDate} at ${input.startTime}`,
      type: 'APPOINTMENT_BOOKED',
      meta: { appointmentId: appointment.id },
    });

    await notificationService.create({
      userId: patient.userId,
      title: 'Appointment Booked',
      message: `Your appointment with Dr. ${doctor.user.name} on ${input.appointmentDate} at ${input.startTime} is pending confirmation.`,
      type: 'APPOINTMENT_BOOKED',
      meta: { appointmentId: appointment.id },
    });

    await auditService.log({
      userId: user.id,
      action: 'CREATE',
      entity: 'Appointment',
      entityId: appointment.id,
    });

    return appointment;
  }

  async update(id: string, input: Record<string, unknown>, user: AuthUser) {
    const appointment = await prisma.appointment.findFirst({
      where: { id, deletedAt: null },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });
    if (!appointment) throw new NotFoundError('Appointment not found');
    this.assertAccess(appointment, user);

    // Reschedule validation
    if (input.appointmentDate || input.startTime) {
      const dateStr =
        (input.appointmentDate as string) ??
        appointment.appointmentDate.toISOString().slice(0, 10);
      const startTime = (input.startTime as string) ?? appointment.startTime;
      const availability = await doctorService.getAvailableSlots(appointment.doctorId, dateStr);
      const slot = availability.slots.find((s) => s.startTime === startTime);
      // Allow keeping same slot
      const sameSlot =
        dateStr === appointment.appointmentDate.toISOString().slice(0, 10) &&
        startTime === appointment.startTime;
      if (!slot && !sameSlot) throw new ConflictError('Selected time slot is not available');
      if (slot && !input.endTime) {
        input.endTime = slot.endTime;
      }
    }

    const data: Prisma.AppointmentUpdateInput = {};
    if (input.appointmentDate) data.appointmentDate = new Date((input.appointmentDate as string) + 'T00:00:00');
    if (input.startTime) data.startTime = input.startTime as string;
    if (input.endTime) data.endTime = input.endTime as string;
    if (input.reason !== undefined) data.reason = input.reason as string;
    if (input.notes !== undefined) data.notes = input.notes as string;
    if (input.cancelledReason !== undefined) data.cancelledReason = input.cancelledReason as string;
    if (input.status) {
      this.assertStatusChange(appointment.status, input.status as AppointmentStatus, user);
      data.status = input.status as AppointmentStatus;
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data,
      include: appointmentInclude,
    });

    if (input.status === 'CONFIRMED') {
      await notificationService.create({
        userId: appointment.patient.userId,
        title: 'Appointment Confirmed',
        message: `Your appointment with Dr. ${appointment.doctor.user.name} has been confirmed.`,
        type: 'APPOINTMENT_CONFIRMED',
        meta: { appointmentId: id },
      });
    }

    if (input.status === 'CANCELLED' || input.status === 'REJECTED') {
      await notificationService.create({
        userId: appointment.patient.userId,
        title: `Appointment ${input.status === 'CANCELLED' ? 'Cancelled' : 'Rejected'}`,
        message: `Your appointment on ${appointment.appointmentDate.toISOString().slice(0, 10)} was ${String(input.status).toLowerCase()}.`,
        type: 'APPOINTMENT_CANCELLED',
        meta: { appointmentId: id },
      });
    }

    if (input.appointmentDate || input.startTime) {
      await notificationService.create({
        userId: appointment.patient.userId,
        title: 'Appointment Rescheduled',
        message: `Your appointment has been rescheduled.`,
        type: 'APPOINTMENT_RESCHEDULED',
        meta: { appointmentId: id },
      });
    }

    await auditService.log({
      userId: user.id,
      action: input.status ? 'STATUS_CHANGE' : 'UPDATE',
      entity: 'Appointment',
      entityId: id,
      details: input as Prisma.InputJsonValue,
    });

    return updated;
  }

  async remove(id: string, user: AuthUser) {
    const appointment = await prisma.appointment.findFirst({ where: { id, deletedAt: null } });
    if (!appointment) throw new NotFoundError('Appointment not found');
    this.assertAccess(appointment, user);

    await prisma.appointment.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CANCELLED' },
    });

    await auditService.log({ userId: user.id, action: 'DELETE', entity: 'Appointment', entityId: id });
    return { message: 'Appointment cancelled' };
  }

  async todayQueue(doctorId: string | undefined, user: AuthUser) {
    const id = user.role === 'DOCTOR' ? user.doctorId : doctorId;
    if (!id) throw new BadRequestError('doctorId required');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = await prisma.appointment.findMany({
      where: {
        doctorId: id,
        appointmentDate: today,
        deletedAt: null,
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
      },
      include: appointmentInclude,
      orderBy: [{ queueNumber: 'asc' }, { startTime: 'asc' }],
    });

    return items;
  }

  private assertAccess(
    appointment: { doctorId: string; patientId: string },
    user: AuthUser
  ) {
    if (['SUPER_ADMIN', 'ADMIN', 'STAFF'].includes(user.role)) return;
    if (user.role === 'DOCTOR' && user.doctorId === appointment.doctorId) return;
    if (user.role === 'PATIENT' && user.patientId === appointment.patientId) return;
    throw new ForbiddenError('Access denied to this appointment');
  }

  private assertStatusChange(
    current: AppointmentStatus,
    next: AppointmentStatus,
    user: AuthUser
  ) {
    assertAppointmentStatusChange(current, next, user.role);
  }
}

export const appointmentService = new AppointmentService();
