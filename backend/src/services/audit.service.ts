import { AuditAction, Prisma } from '@prisma/client';
import prisma from '../prisma/client';

export class AuditService {
  async log(input: {
    userId?: string;
    action: AuditAction;
    entity: string;
    entityId?: string;
    details?: Prisma.InputJsonValue;
    ipAddress?: string;
  }) {
    return prisma.auditLog.create({ data: input });
  }

  async list(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count(),
    ]);
    return { items, total, page, limit };
  }
}

export const auditService = new AuditService();
