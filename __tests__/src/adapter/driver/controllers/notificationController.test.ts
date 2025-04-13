import { StatusCodes } from 'http-status-codes';

import { NotificationController } from '@src/adapter/driver/controllers';

import { NotificationMockBuilder } from '../../../../mocks/notification.mock-builder';

describe('NotificationController', () => {
	let notificationService: any;
	let notificationController: NotificationController;
	let fakeReply: any;
	let fakeReq: any;

	beforeEach(() => {
		notificationService = {
			getNotificationById: jest.fn(),
			getNotificationsByUserId: jest.fn(),
		};

		notificationController = new NotificationController(notificationService);

		fakeReply = {
			code: jest.fn().mockReturnThis(),
			send: jest.fn(),
		};
	});

	describe('getNotificationById', () => {
		it('should return the notification with status 200 when found', async () => {
			const notification = new NotificationMockBuilder()
				.withId('notification-1')
				.build();
			notificationService.getNotificationById.mockResolvedValue(notification);

			fakeReq = { params: { id: 'notification-1' } };

			await notificationController.getNotificationById(fakeReq, fakeReply);

			expect(notificationService.getNotificationById).toHaveBeenCalledWith(
				'notification-1'
			);
			expect(fakeReply.code).toHaveBeenCalledWith(StatusCodes.OK);
			expect(fakeReply.send).toHaveBeenCalledWith(notification);
		});

		it('should return 404 when the notification is not found', async () => {
			notificationService.getNotificationById.mockResolvedValue(null);
			fakeReq = { params: { id: 'non-existent-id' } };

			await notificationController.getNotificationById(fakeReq, fakeReply);

			expect(notificationService.getNotificationById).toHaveBeenCalledWith(
				'non-existent-id'
			);
			expect(fakeReply.code).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
			expect(fakeReply.send).toHaveBeenCalledWith({
				error: 'Not Found',
				message: 'Notification not found',
			});
		});
	});

	describe('getNotificationsByUserId', () => {
		it("should return the user's notifications list with status 200", async () => {
			const notification1 = new NotificationMockBuilder()
				.withId('notif-1')
				.build();
			const notification2 = new NotificationMockBuilder()
				.withId('notif-2')
				.build();
			notificationService.getNotificationsByUserId.mockResolvedValue([
				notification1,
				notification2,
			]);

			fakeReq = { user: { id: 'user-123' } };

			await notificationController.getNotificationsByUserId(fakeReq, fakeReply);

			expect(notificationService.getNotificationsByUserId).toHaveBeenCalledWith(
				'user-123'
			);
			expect(fakeReply.code).toHaveBeenCalledWith(StatusCodes.OK);
			expect(fakeReply.send).toHaveBeenCalledWith([
				notification1,
				notification2,
			]);
		});
	});
});
