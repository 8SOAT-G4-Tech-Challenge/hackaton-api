import { Notification } from '@src/core/domain/models/notification';

export interface NotificationRepository {
	getNotificationById(id: string): Promise<Notification | null>;
	getNotificationsByUserId(id: string): Promise<Notification[]>;
	createNotification(notification: Notification): Promise<Notification>;
}
