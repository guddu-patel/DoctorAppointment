import { DayOfWeek, Prisma } from '@prisma/client';
import prisma from '../prisma/client';
import { ConflictError, NotFoundError, BadRequestError } from '../exceptions/AppError';
import { hashPassword } from '../utils/auth';
import { generateSlots, jsDayToEnum, minutesToTime, timeToMinutes } from '../utils/helpers';
import { auditService } from './audit.service';

const doctorInclude = {
  user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, status: true } },
  department: true,
  schedules: { where: { isActive: true }, orderBy: { dayOfWeek: 'asc' as const } },
  _count: { select: { reviews: true, appointments: true } },
  reviews: { select: { rating: true } },
} satisfies Prisma.DoctorInclude;

function mapDoctor(doctor: Awaited<ReturnType<typeof prisma.doctor.findFirst>> & object) {
  if (!doctor) return null;
  const d = doctor as Awaited<ReturnType<typeof prisma.doctor.findFirst>> & {
    reviews?: { rating: number }[];
    user: { id: string; name: string; email: string; phone: string | null; avatarUrl: string | null; status: string };
    department: { id: string; name: string; slug: string };
    schedules: unknown[];
    _count?: { reviews: number; appointments: number };
  };
  const ratings = d.reviews ?? [];
  const avgRating =
    ratings.length > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;

  const { reviews: _r, ...rest } = d;
  return {
    ...rest,
    consultationFee: Number(d.consultationFee),
    averageRating: Math.round(avgRating * 10) / 10,
    reviewCount: d._count?.reviews ?? ratings.length,
  };
}

export class DoctorService {
  async list(params: {
    page: number;
    limit: number;
    skip: number;
    search?: string;
    departmentId?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const where: Prisma.DoctorWhereInput = {
      deletedAt: null,
      ...(params.departmentId ? { departmentId: params.departmentId } : {}),
      ...(params.search
        ? {
            OR: [
              { user: { name: { contains: params.search, mode: 'insensitive' } } },
              { qualification: { contains: params.search, mode: 'insensitive' } },
              { department: { name: { contains: params.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [raw, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        include: doctorInclude,
        skip: params.skip,
        take: params.limit,
        orderBy: { createdAt: params.sortOrder },
      }),
      prisma.doctor.count({ where }),
    ]);

    return { items: raw.map((d) => mapDoctor(d)), total };
  }

  async getById(id: string) {
    const doctor = await prisma.doctor.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...doctorInclude,
        holidays: { orderBy: { date: 'asc' } },
        reviews: {
          include: { patient: { include: { user: { select: { name: true } } } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!doctor) throw new NotFoundError('Doctor not found');
    return mapDoctor(doctor);
  }

  async create(input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    departmentId: string;
    qualification: string;
    experience: number;
    consultationFee: number;
    licenseNumber: string;
    bio?: string;
    schedules?: {
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
      slotMins: number;
    }[];
  }, actorId: string) {
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) throw new ConflictError('Email already registered');

    const dept = await prisma.department.findFirst({ where: { id: input.departmentId, deletedAt: null } });
    if (!dept) throw new NotFoundError('Department not found');

    const licenseExists = await prisma.doctor.findUnique({ where: { licenseNumber: input.licenseNumber } });
    if (licenseExists) throw new ConflictError('License number already exists');

    const hashed = await hashPassword(input.password);
    const defaultSchedules = input.schedules ?? [
      { dayOfWeek: 'MONDAY' as DayOfWeek, startTime: '09:00', endTime: '17:00', slotMins: 30 },
      { dayOfWeek: 'TUESDAY' as DayOfWeek, startTime: '09:00', endTime: '17:00', slotMins: 30 },
      { dayOfWeek: 'WEDNESDAY' as DayOfWeek, startTime: '09:00', endTime: '17:00', slotMins: 30 },
      { dayOfWeek: 'THURSDAY' as DayOfWeek, startTime: '09:00', endTime: '17:00', slotMins: 30 },
      { dayOfWeek: 'FRIDAY' as DayOfWeek, startTime: '09:00', endTime: '17:00', slotMins: 30 },
    ];

    const doctor = await prisma.doctor.create({
      data: {
        qualification: input.qualification,
        experience: input.experience,
        consultationFee: input.consultationFee,
        licenseNumber: input.licenseNumber,
        bio: input.bio,
        department: { connect: { id: input.departmentId } },
        user: {
          create: {
            name: input.name,
            email: input.email.toLowerCase(),
            password: hashed,
            phone: input.phone,
            role: 'DOCTOR',
            emailVerified: true,
          },
        },
        schedules: { create: defaultSchedules },
      },
      include: doctorInclude,
    });

    await auditService.log({
      userId: actorId,
      action: 'CREATE',
      entity: 'Doctor',
      entityId: doctor.id,
    });

    return mapDoctor(doctor);
  }

  async update(id: string, input: Record<string, unknown>, actorId: string) {
    const doctor = await prisma.doctor.findFirst({ where: { id, deletedAt: null } });
    if (!doctor) throw new NotFoundError('Doctor not found');

    const { name, phone, ...doctorFields } = input;

    if (name || phone) {
      await prisma.user.update({
        where: { id: doctor.userId },
        data: {
          ...(name ? { name: name as string } : {}),
          ...(phone !== undefined ? { phone: phone as string } : {}),
        },
      });
    }

    const updated = await prisma.doctor.update({
      where: { id },
      data: doctorFields as Prisma.DoctorUpdateInput,
      include: doctorInclude,
    });

    await auditService.log({ userId: actorId, action: 'UPDATE', entity: 'Doctor', entityId: id });
    return mapDoctor(updated);
  }

  async remove(id: string, actorId: string) {
    const doctor = await prisma.doctor.findFirst({ where: { id, deletedAt: null } });
    if (!doctor) throw new NotFoundError('Doctor not found');

    await prisma.$transaction([
      prisma.doctor.update({ where: { id }, data: { deletedAt: new Date(), isAvailable: false } }),
      prisma.user.update({ where: { id: doctor.userId }, data: { status: 'INACTIVE', deletedAt: new Date() } }),
    ]);

    await auditService.log({ userId: actorId, action: 'DELETE', entity: 'Doctor', entityId: id });
    return { message: 'Doctor deleted' };
  }

  async updateSchedule(doctorId: string, schedules: {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    slotMins: number;
    isActive: boolean;
  }[]) {
    const doctor = await prisma.doctor.findFirst({ where: { id: doctorId, deletedAt: null } });
    if (!doctor) throw new NotFoundError('Doctor not found');

    await prisma.$transaction([
      prisma.doctorSchedule.deleteMany({ where: { doctorId } }),
      prisma.doctorSchedule.createMany({
        data: schedules.map((s) => ({ ...s, doctorId })),
      }),
    ]);

    return prisma.doctorSchedule.findMany({ where: { doctorId }, orderBy: { dayOfWeek: 'asc' } });
  }

  async getAvailableSlots(doctorId: string, dateStr: string) {
    const doctor = await prisma.doctor.findFirst({
      where: { id: doctorId, deletedAt: null, isAvailable: true },
      include: { schedules: { where: { isActive: true } }, holidays: true },
    });
    if (!doctor) throw new NotFoundError('Doctor not found or unavailable');

    const date = new Date(dateStr + 'T00:00:00');
    if (Number.isNaN(date.getTime())) throw new BadRequestError('Invalid date');

    const holiday = doctor.holidays.find(
      (h) => h.date.toISOString().slice(0, 10) === dateStr
    );
    if (holiday) return { date: dateStr, slots: [], reason: holiday.reason ?? 'Doctor on holiday' };

    const dayEnum = jsDayToEnum(date.getDay()) as DayOfWeek;
    const schedule = doctor.schedules.find((s) => s.dayOfWeek === dayEnum);
    if (!schedule) return { date: dateStr, slots: [], reason: 'Doctor not available this day' };

    const allSlots = generateSlots(schedule.startTime, schedule.endTime, schedule.slotMins);

    const booked = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: date,
        deletedAt: null,
        status: { notIn: ['CANCELLED', 'REJECTED'] },
      },
      select: { startTime: true },
    });
    const bookedSet = new Set(booked.map((b) => b.startTime));

    const now = new Date();
    const isToday = dateStr === now.toISOString().slice(0, 10);
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const slots = allSlots
      .filter((t) => !bookedSet.has(t))
      .filter((t) => !isToday || timeToMinutes(t) > currentMins)
      .map((startTime) => ({
        startTime,
        endTime: minutesToTime(timeToMinutes(startTime) + schedule.slotMins),
      }));

    return { date: dateStr, slots, slotMins: schedule.slotMins };
  }
}

export const doctorService = new DoctorService();
