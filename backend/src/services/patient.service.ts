import { Prisma } from '@prisma/client';
import prisma from '../prisma/client';
import { ConflictError, NotFoundError } from '../exceptions/AppError';
import { hashPassword } from '../utils/auth';
import { auditService } from './audit.service';

const patientInclude = {
  user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, status: true, createdAt: true } },
} satisfies Prisma.PatientInclude;

export class PatientService {
  async list(params: { page: number; limit: number; skip: number; search?: string; sortOrder: 'asc' | 'desc' }) {
    const where: Prisma.PatientWhereInput = {
      deletedAt: null,
      ...(params.search
        ? {
            OR: [
              { user: { name: { contains: params.search, mode: 'insensitive' } } },
              { user: { email: { contains: params.search, mode: 'insensitive' } } },
              { user: { phone: { contains: params.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: patientInclude,
        skip: params.skip,
        take: params.limit,
        orderBy: { createdAt: params.sortOrder },
      }),
      prisma.patient.count({ where }),
    ]);

    return { items, total };
  }

  async getById(id: string) {
    const patient = await prisma.patient.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...patientInclude,
        documents: { orderBy: { uploadedAt: 'desc' } },
        appointments: {
          where: { deletedAt: null },
          include: {
            doctor: { include: { user: { select: { name: true } }, department: true } },
            prescription: true,
            bill: true,
          },
          orderBy: { appointmentDate: 'desc' },
          take: 20,
        },
      },
    });
    if (!patient) throw new NotFoundError('Patient not found');
    return patient;
  }

  async create(input: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    bloodGroup?: string;
    dob?: string;
    gender?: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    allergies?: string;
    medicalHistory?: string;
    insuranceProvider?: string;
    insuranceNumber?: string;
  }, actorId: string) {
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) throw new ConflictError('Email already registered');

    const hashed = await hashPassword(input.password ?? 'Patient@123');

    const patient = await prisma.patient.create({
      data: {
        bloodGroup: (input.bloodGroup as never) ?? 'UNKNOWN',
        dob: input.dob ? new Date(input.dob) : undefined,
        gender: input.gender as never,
        address: input.address,
        emergencyContact: input.emergencyContact,
        emergencyPhone: input.emergencyPhone,
        allergies: input.allergies,
        medicalHistory: input.medicalHistory,
        insuranceProvider: input.insuranceProvider,
        insuranceNumber: input.insuranceNumber,
        user: {
          create: {
            name: input.name,
            email: input.email.toLowerCase(),
            password: hashed,
            phone: input.phone,
            role: 'PATIENT',
            emailVerified: true,
          },
        },
      },
      include: patientInclude,
    });

    await auditService.log({ userId: actorId, action: 'CREATE', entity: 'Patient', entityId: patient.id });
    return patient;
  }

  async update(id: string, input: Record<string, unknown>, actorId: string) {
    const patient = await prisma.patient.findFirst({ where: { id, deletedAt: null } });
    if (!patient) throw new NotFoundError('Patient not found');

    const { name, phone, dob, ...fields } = input;

    if (name || phone) {
      await prisma.user.update({
        where: { id: patient.userId },
        data: {
          ...(name ? { name: name as string } : {}),
          ...(phone !== undefined ? { phone: phone as string } : {}),
        },
      });
    }

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        ...fields,
        ...(dob ? { dob: new Date(dob as string) } : {}),
      } as Prisma.PatientUpdateInput,
      include: patientInclude,
    });

    await auditService.log({ userId: actorId, action: 'UPDATE', entity: 'Patient', entityId: id });
    return updated;
  }

  async remove(id: string, actorId: string) {
    const patient = await prisma.patient.findFirst({ where: { id, deletedAt: null } });
    if (!patient) throw new NotFoundError('Patient not found');

    await prisma.$transaction([
      prisma.patient.update({ where: { id }, data: { deletedAt: new Date() } }),
      prisma.user.update({ where: { id: patient.userId }, data: { status: 'INACTIVE', deletedAt: new Date() } }),
    ]);

    await auditService.log({ userId: actorId, action: 'DELETE', entity: 'Patient', entityId: id });
    return { message: 'Patient deleted' };
  }
}

export const patientService = new PatientService();
