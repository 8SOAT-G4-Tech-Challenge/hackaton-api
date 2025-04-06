import logger from '@src/core/common/logger';
import { Notification } from '@src/core/domain/models/notification';

import { NotificationRepository } from '../ports/repository/notificationRepository';

export class NotificationService {
	private readonly notificationRepository;

	constructor(notificationRepository: NotificationRepository) {
		this.notificationRepository = notificationRepository;
	}

	async getNotifications(): Promise<Notification[]> {
		logger.info('[NOTIFICATION SERVICE] Listing files');
		const notifications: Notification[] =
			await this.notificationRepository.getNotifications();
		return notifications;
	}

	async getNotificationById(id: string): Promise<Notification | null> {
		logger.info(`[NOTIFICATION SERVICE] Listing file by ID: ${id}`);
		const notification: Notification | null =
			await this.notificationRepository.getNotificationById(id);
		return notification;
	}

	async getNotificationsByUserId(userId: string): Promise<Notification[]> {
		logger.info(`[NOTIFICATION SERVICE] Listing files by user ID: ${userId}`);
		const notifications: Notification[] =
			await this.notificationRepository.getNotificationsByUserId(userId);
		return notifications;
	}
}
