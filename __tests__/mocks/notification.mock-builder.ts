import { Notification } from '@models/notification';
import { NotificationTypeEnum } from '@src/core/application/enumerations/typeEnum';

export class NotificationMockBuilder {
	private notification: Notification;

	constructor() {
		this.notification = {
			id: 'mock-notification-id',
			userId: 'mock-user-id',
			fileId: 'mock-file-id',
			notificationType: NotificationTypeEnum.success,
			text: 'Mensagem de notificação de sucesso',
			createdAt: new Date(),
		};
	}

	withId(id: string): NotificationMockBuilder {
		this.notification.id = id;
		return this;
	}

	withUserId(userId: string): NotificationMockBuilder {
		this.notification.userId = userId;
		return this;
	}

	withFileId(fileId: string): NotificationMockBuilder {
		this.notification.fileId = fileId;
		return this;
	}

	withNotificationType(
		notificationType: keyof typeof NotificationTypeEnum
	): NotificationMockBuilder {
		this.notification.notificationType = NotificationTypeEnum[notificationType];
		return this;
	}

	withText(text: string): NotificationMockBuilder {
		this.notification.text = text;
		return this;
	}

	withCreatedAt(createdAt: Date): NotificationMockBuilder {
		this.notification.createdAt = createdAt;
		return this;
	}

	build(): Notification {
		return this.notification;
	}
}
