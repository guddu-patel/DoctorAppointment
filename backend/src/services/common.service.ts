import prisma from '../prisma/client';
import { ConflictError, NotFoundError } from '../exceptions/AppError';
import { slugify } from '../utils/helpers';
import { hashPassword } from '../utils/auth';
import { AuthUser } from '../types';

export class DepartmentService {
  async list() {
    return prisma.department.findMany({
      where: { deletedAt: null, isActive: true },
      include: { _count: { select: { doctors: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(input: { name: string; description?: string; icon?: string }) {
    const slug = slugify(input.name);
    const exists = await prisma.department.findFirst({
      where: { OR: [{ name: input.name }, { slug }] },
    });
    if (exists) throw new ConflictError('Department already exists');

    return prisma.department.create({
      data: { name: input.name, slug, description: input.description, icon: input.icon },
    });
  }

  async update(id: string, input: { name?: string; description?: string; icon?: string; isActive?: boolean }) {
    const dept = await prisma.department.findFirst({ where: { id, deletedAt: null } });
    if (!dept) throw new NotFoundError('Department not found');

    return prisma.department.update({
      where: { id },
      data: {
        ...input,
        ...(input.name ? { slug: slugify(input.name) } : {}),
      },
    });
  }

  async remove(id: string) {
    const dept = await prisma.department.findFirst({ where: { id, deletedAt: null } });
    if (!dept) throw new NotFoundError('Department not found');
    await prisma.department.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    return { message: 'Department deleted' };
  }
}

export class StaffService {
  async list(params: { page: number; limit: number; skip: number; search?: string }) {
    const where = {
      deletedAt: null as null,
      ...(params.search
        ? {
            OR: [
              { user: { name: { contains: params.search, mode: 'insensitive' as const } } },
              { user: { email: { contains: params.search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true, phone: true, status: true } } },
        skip: params.skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.staff.count({ where }),
    ]);
    return { items, total };
  }

  async create(input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    designation?: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) throw new ConflictError('Email already registered');

    const hashed = await hashPassword(input.password);
    return prisma.staff.create({
      data: {
        designation: input.designation,
        user: {
          create: {
            name: input.name,
            email: input.email.toLowerCase(),
            password: hashed,
            phone: input.phone,
            role: 'STAFF',
            emailVerified: true,
          },
        },
      },
      include: { user: { select: { id: true, name: true, email: true, phone: true, status: true } } },
    });
  }

  async remove(id: string) {
    const staff = await prisma.staff.findFirst({ where: { id, deletedAt: null } });
    if (!staff) throw new NotFoundError('Staff not found');
    await prisma.$transaction([
      prisma.staff.update({ where: { id }, data: { deletedAt: new Date() } }),
      prisma.user.update({ where: { id: staff.userId }, data: { status: 'INACTIVE', deletedAt: new Date() } }),
    ]);
    return { message: 'Staff deleted' };
  }
}

export class ReviewService {
  async create(input: { doctorId: string; rating: number; review?: string }, user: AuthUser) {
    if (!user.patientId) throw new ConflictError('Only patients can review');

    return prisma.review.upsert({
      where: {
        doctorId_patientId: { doctorId: input.doctorId, patientId: user.patientId },
      },
      create: {
        doctorId: input.doctorId,
        patientId: user.patientId,
        rating: input.rating,
        review: input.review,
      },
      update: { rating: input.rating, review: input.review },
    });
  }

  async listForDoctor(doctorId: string) {
    return prisma.review.findMany({
      where: { doctorId },
      include: { patient: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export class DashboardService {
  async adminStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalDoctors,
      totalPatients,
      totalStaff,
      totalAppointments,
      todayAppointments,
      pendingBills,
      revenueAgg,
      appointmentsByStatus,
      recentAppointments,
    ] = await Promise.all([
      prisma.doctor.count({ where: { deletedAt: null } }),
      prisma.patient.count({ where: { deletedAt: null } }),
      prisma.staff.count({ where: { deletedAt: null } }),
      prisma.appointment.count({ where: { deletedAt: null } }),
      prisma.appointment.count({ where: { deletedAt: null, appointmentDate: today } }),
      prisma.bill.count({ where: { paymentStatus: 'PENDING' } }),
      prisma.bill.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true },
      }),
      prisma.appointment.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: true,
      }),
      prisma.appointment.findMany({
        where: { deletedAt: null },
        include: {
          doctor: { include: { user: { select: { name: true } } } },
          patient: { include: { user: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    return {
      totalDoctors,
      totalPatients,
      totalStaff,
      totalAppointments,
      todayAppointments,
      pendingBills,
      revenue: Number(revenueAgg._sum.total ?? 0),
      appointmentsByStatus: appointmentsByStatus.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      recentAppointments,
    };
  }

  async doctorStats(doctorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayPatients, completed, upcoming, pendingPrescriptions, revenueAgg] = await Promise.all([
      prisma.appointment.count({
        where: { doctorId, appointmentDate: today, deletedAt: null, status: { notIn: ['CANCELLED', 'REJECTED'] } },
      }),
      prisma.appointment.count({ where: { doctorId, status: 'COMPLETED', deletedAt: null } }),
      prisma.appointment.count({
        where: {
          doctorId,
          deletedAt: null,
          status: { in: ['PENDING', 'CONFIRMED'] },
          appointmentDate: { gte: today },
        },
      }),
      prisma.appointment.count({
        where: {
          doctorId,
          status: { in: ['CHECKED_IN', 'CONFIRMED'] },
          prescription: null,
          deletedAt: null,
        },
      }),
      prisma.bill.aggregate({
        where: { paymentStatus: 'PAID', appointment: { doctorId } },
        _sum: { consultationFee: true },
      }),
    ]);

    return {
      todayPatients,
      completedConsultations: completed,
      upcomingAppointments: upcoming,
      pendingPrescriptions,
      revenueEarned: Number(revenueAgg._sum.consultationFee ?? 0),
    };
  }

  async patientStats(patientId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [upcoming, previous, pendingBills, prescriptions, unreadNotifications] = await Promise.all([
      prisma.appointment.findFirst({
        where: {
          patientId,
          deletedAt: null,
          status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
          appointmentDate: { gte: today },
        },
        include: {
          doctor: { include: { user: { select: { name: true } }, department: true } },
        },
        orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
      }),
      prisma.appointment.count({
        where: { patientId, status: 'COMPLETED', deletedAt: null },
      }),
      prisma.bill.count({
        where: { paymentStatus: 'PENDING', appointment: { patientId } },
      }),
      prisma.prescription.count({ where: { patientId } }),
      prisma.notification.count({
        where: { isRead: false, user: { patient: { id: patientId } } },
      }),
    ]);

    return {
      upcomingAppointment: upcoming,
      previousVisits: previous,
      pendingBills,
      medicalReports: prescriptions,
      unreadNotifications,
    };
  }

  async staffStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayAppointments, checkedIn, pendingBills, walkIns] = await Promise.all([
      prisma.appointment.count({ where: { appointmentDate: today, deletedAt: null } }),
      prisma.appointment.count({
        where: { appointmentDate: today, status: 'CHECKED_IN', deletedAt: null },
      }),
      prisma.bill.count({ where: { paymentStatus: 'PENDING' } }),
      prisma.appointment.count({
        where: {
          appointmentDate: today,
          deletedAt: null,
          notes: { contains: 'walk-in', mode: 'insensitive' },
        },
      }),
    ]);

    return { todayAppointments, checkedIn, pendingBills, walkIns };
  }
}

export const departmentService = new DepartmentService();
export const staffService = new StaffService();
export const reviewService = new ReviewService();
export const dashboardService = new DashboardService();
