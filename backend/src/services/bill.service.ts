import { Prisma } from '@prisma/client';
import prisma from '../prisma/client';
import { ConflictError, NotFoundError } from '../exceptions/AppError';
import { generateBillNumber } from '../utils/helpers';
import { AuthUser } from '../types';
import { auditService } from './audit.service';
import { notificationService } from './notification.service';

function mapBill(bill: {
  consultationFee: Prisma.Decimal;
  medicineCharges: Prisma.Decimal;
  labCharges: Prisma.Decimal;
  otherCharges: Prisma.Decimal;
  discount: Prisma.Decimal;
  tax: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  total: Prisma.Decimal;
  [key: string]: unknown;
}) {
  return {
    ...bill,
    consultationFee: Number(bill.consultationFee),
    medicineCharges: Number(bill.medicineCharges),
    labCharges: Number(bill.labCharges),
    otherCharges: Number(bill.otherCharges),
    discount: Number(bill.discount),
    tax: Number(bill.tax),
    subtotal: Number(bill.subtotal),
    total: Number(bill.total),
  };
}

export class BillService {
  async list(params: {
    page: number;
    limit: number;
    skip: number;
    paymentStatus?: string;
    sortOrder: 'asc' | 'desc';
  }, user: AuthUser) {
    const where: Prisma.BillWhereInput = {
      ...(params.paymentStatus ? { paymentStatus: params.paymentStatus as never } : {}),
      ...(user.role === 'PATIENT'
        ? { appointment: { patientId: user.patientId } }
        : {}),
      ...(user.role === 'DOCTOR'
        ? { appointment: { doctorId: user.doctorId } }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        include: {
          appointment: {
            include: {
              patient: { include: { user: { select: { name: true, email: true } } } },
              doctor: { include: { user: { select: { name: true } } } },
            },
          },
        },
        skip: params.skip,
        take: params.limit,
        orderBy: { createdAt: params.sortOrder },
      }),
      prisma.bill.count({ where }),
    ]);

    return { items: items.map(mapBill), total };
  }

  async getById(id: string) {
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
            doctor: { include: { user: { select: { name: true } }, department: true } },
          },
        },
      },
    });
    if (!bill) throw new NotFoundError('Bill not found');
    return mapBill(bill);
  }

  async create(
    input: {
      appointmentId: string;
      consultationFee?: number;
      medicineCharges?: number;
      labCharges?: number;
      otherCharges?: number;
      discount?: number;
      tax?: number;
      paymentMethod?: string;
      notes?: string;
    },
    user: AuthUser
  ) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: input.appointmentId, deletedAt: null },
      include: { bill: true, doctor: true, patient: true },
    });
    if (!appointment) throw new NotFoundError('Appointment not found');
    if (appointment.bill) throw new ConflictError('Bill already exists for this appointment');

    const consultationFee = input.consultationFee ?? Number(appointment.doctor.consultationFee);
    const medicineCharges = input.medicineCharges ?? 0;
    const labCharges = input.labCharges ?? 0;
    const otherCharges = input.otherCharges ?? 0;
    const discount = input.discount ?? 0;
    const tax = input.tax ?? 0;
    const subtotal = consultationFee + medicineCharges + labCharges + otherCharges;
    const total = Math.max(0, subtotal - discount + tax);

    const bill = await prisma.bill.create({
      data: {
        appointmentId: input.appointmentId,
        billNumber: generateBillNumber(),
        consultationFee,
        medicineCharges,
        labCharges,
        otherCharges,
        discount,
        tax,
        subtotal,
        total,
        paymentMethod: input.paymentMethod as never,
        notes: input.notes,
        paymentStatus: input.paymentMethod ? 'PAID' : 'PENDING',
        paidAt: input.paymentMethod ? new Date() : undefined,
      },
      include: {
        appointment: {
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
          },
        },
      },
    });

    if (bill.paymentStatus === 'PAID') {
      await notificationService.create({
        userId: appointment.patient.userId,
        title: 'Payment Successful',
        message: `Payment of ₹${total.toFixed(2)} received. Invoice ${bill.billNumber}`,
        type: 'PAYMENT_SUCCESS',
        meta: { billId: bill.id },
      });
    }

    await auditService.log({
      userId: user.id,
      action: 'CREATE',
      entity: 'Bill',
      entityId: bill.id,
    });

    return mapBill(bill);
  }

  async pay(id: string, input: { paymentMethod: string; paymentStatus?: string }, user: AuthUser) {
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: { appointment: { include: { patient: true } } },
    });
    if (!bill) throw new NotFoundError('Bill not found');

    const updated = await prisma.bill.update({
      where: { id },
      data: {
        paymentMethod: input.paymentMethod as never,
        paymentStatus: (input.paymentStatus as never) ?? 'PAID',
        paidAt: new Date(),
      },
      include: {
        appointment: {
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
          },
        },
      },
    });

    await notificationService.create({
      userId: bill.appointment.patient.userId,
      title: 'Payment Successful',
      message: `Payment of ₹${Number(bill.total).toFixed(2)} received. Invoice ${bill.billNumber}`,
      type: 'PAYMENT_SUCCESS',
      meta: { billId: bill.id },
    });

    await auditService.log({
      userId: user.id,
      action: 'PAYMENT',
      entity: 'Bill',
      entityId: id,
    });

    return mapBill(updated);
  }
}

export const billService = new BillService();
