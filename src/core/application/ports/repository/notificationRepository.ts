import { Notification } from '@src/core/domain/models/notification';

export interface NotificationRepository {
	getNotifications(): Promise<Notification[]>;
	getNotificationById(id: string): Promise<Notification | null>;
	getNotificationsByUserId(id: string): Promise<Notification[]>;
}
