import { NotificationType } from '../types/notificationType';

export interface Notification {
	id?: string;
	userId: string;
	fileId: string;
	notificationType: NotificationType;
	text: string;
	createdAt: Date;
}
