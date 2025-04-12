import { prisma } from '@driven/infra/lib/prisma';
import { NotificationRepository } from '@src/core/application/ports/repository/notificationRepository';
import { Notification } from '@src/core/domain/models/notification';

export class NotificationRepositoryImpl implements NotificationRepository {
	async getNotifications(): Promise<Notification[]> {
		const notifications = await prisma.notification.findMany({
			select: {
				id: true,
				userId: true,
				fileId: true,
				notificationType: true,
				text: true,
				createdAt: true
			},
		});

		return notifications;
	}

	async getNotificationById(id: string): Promise<Notification | null> {
		const notification = await prisma.notification.findUnique({
			where: { id },
			select: {
				id: true,
				userId: true,
				fileId: true,
				notificationType: true,
				text: true,
				createdAt: true
			},
		});

		return notification;
	}

	async getNotificationsByUserId(userId: string): Promise<Notification[]> {
		const notifications = await prisma.notification.findMany({
			where: { userId },
			select: {
				id: true,
				userId: true,
				fileId: true,
				notificationType: true,
				text: true,
				createdAt: true
			},
		});

		return notifications;
	}

	async createNotification(notification: Notification): Promise<Notification> {
		const createdNotification = await prisma.notification.create({
			data: {
				userId: notification.userId,
				fileId: notification.fileId,
				notificationType: notification.notificationType,
				text: notification.text,
				createdAt: notification.createdAt
			},
			select: {
				id: true,
				userId: true,
				fileId: true,
				notificationType: true,
				text: true,
				createdAt: true
			},
		});

		return createdNotification;
	}
}
