import { NotificationType, Prisma } from '@prisma/client';
import prisma from '../prisma/client';

export class NotificationService {
  async create(input: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    meta?: Prisma.InputJsonValue;
  }) {
    return prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type ?? 'SYSTEM',
        meta: input.meta,
      },
    });
  }

  async listForUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { items, total, unreadCount, page, limit };
  }

  async markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

export const notificationService = new NotificationService();
