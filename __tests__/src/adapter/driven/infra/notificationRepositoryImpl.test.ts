import { prisma } from '@driven/infra/lib/prisma';
import { NotificationRepositoryImpl } from '@src/adapter/driven/infra';
import { Notification } from '@src/core/domain/models/notification';

import { NotificationMockBuilder } from '../../../../mocks/notification.mock-builder';

jest.mock('@driven/infra/lib/prisma', () => ({
	prisma: {
		notification: {
			findUnique: jest.fn(),
			findMany: jest.fn(),
			create: jest.fn(),
		},
	},
}));

describe('NotificationRepositoryImpl', () => {
	let repository: NotificationRepositoryImpl;

	beforeEach(() => {
		repository = new NotificationRepositoryImpl();
		jest.clearAllMocks();
	});

	describe('getNotificationById', () => {
		it('should return a notification when found', async () => {
			const notificationMock: Notification = new NotificationMockBuilder()
				.withId('notif-1')
				.withUserId('user-1')
				.withFileId('file-1')
				.withNotificationType('success')
				.withText('Test notification')
				.build();

			(prisma.notification.findUnique as jest.Mock).mockResolvedValue(
				notificationMock,
			);

			const result = await repository.getNotificationById('notif-1');

			expect(prisma.notification.findUnique).toHaveBeenCalledWith({
				where: { id: 'notif-1' },
			});
			expect(result).toEqual(notificationMock);
		});

		it('should return null if notification is not found', async () => {
			(prisma.notification.findUnique as jest.Mock).mockResolvedValue(null);

			const result = await repository.getNotificationById('non-existent-id');

			expect(prisma.notification.findUnique).toHaveBeenCalledWith({
				where: { id: 'non-existent-id' },
			});
			expect(result).toBeNull();
		});
	});

	describe('getNotificationsByUserId', () => {
		it('should return notifications for a given userId', async () => {
			const notification1 = new NotificationMockBuilder()
				.withId('notif-1')
				.withUserId('user-1')
				.withFileId('file-1')
				.build();

			const notification2 = new NotificationMockBuilder()
				.withId('notif-2')
				.withUserId('user-1')
				.withFileId('file-2')
				.build();

			(prisma.notification.findMany as jest.Mock).mockResolvedValue([
				notification1,
				notification2,
			]);

			const result = await repository.getNotificationsByUserId('user-1');

			expect(prisma.notification.findMany).toHaveBeenCalledWith({
				where: { userId: 'user-1' },
			});
			expect(result).toEqual([notification1, notification2]);
		});
	});

	describe('createNotification', () => {
		it('should create and return a new notification', async () => {
			const inputNotification: Notification = new NotificationMockBuilder()
				.withId('temp-id')
				.withUserId('user-1')
				.withFileId('file-1')
				.withNotificationType('success')
				.withText('New notification text')
				.build();

			const createdNotification: Notification = {
				...inputNotification,
				id: 'notif-1',
			};

			(prisma.notification.create as jest.Mock).mockResolvedValue(
				createdNotification,
			);

			const result = await repository.createNotification(inputNotification);

			expect(prisma.notification.create).toHaveBeenCalledWith({
				data: {
					userId: inputNotification.userId,
					fileId: inputNotification.fileId,
					notificationType: inputNotification.notificationType,
					text: inputNotification.text,
					createdAt: inputNotification.createdAt,
				},
			});
			expect(result).toEqual(createdNotification);
		});
	});
});
