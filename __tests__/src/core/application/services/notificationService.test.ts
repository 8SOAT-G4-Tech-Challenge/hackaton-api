import { StatusEnum } from '@src/core/application/enumerations/statusEnum';
import { NotificationTypeEnum } from '@src/core/application/enumerations/typeEnum';
import { InvalidNotificationException } from '@src/core/application/exceptions/invalidNotificationException';
import { NotificationService } from '@src/core/application/services/notificationService';
import { PROCESSING_MESSAGE, ERROR_MESSAGE } from '@src/core/domain/constants/messages';

const notificationRepositoryMock = {
	getNotificationById: jest.fn(),
	getNotificationsByUserId: jest.fn(),
	createNotification: jest.fn(),
};

class SmsServiceMock {
	sendSms = jest.fn();
}
const smsServiceMock = new SmsServiceMock();

describe('NotificationService', () => {
	let notificationService: NotificationService;

	beforeEach(() => {
		jest.clearAllMocks();
		notificationService = new NotificationService(
			notificationRepositoryMock,
			smsServiceMock as any
		);
	});

	describe('getNotificationById', () => {
		it('should return the notification when found', async () => {
			const fakeNotification = {
				id: 'notif-1',
				userId: 'user-1',
				fileId: 'file-1',
				notificationType: NotificationTypeEnum.success,
				text: 'Test text',
				createdAt: new Date(),
			};
			notificationRepositoryMock.getNotificationById.mockResolvedValue(fakeNotification);

			const result = await notificationService.getNotificationById('notif-1');
			expect(notificationRepositoryMock.getNotificationById).toHaveBeenCalledWith('notif-1');
			expect(result).toEqual(fakeNotification);
		});

		it('should return null when notification is not found', async () => {
			notificationRepositoryMock.getNotificationById.mockResolvedValue(null);

			const result = await notificationService.getNotificationById('non-existent-id');
			expect(notificationRepositoryMock.getNotificationById).toHaveBeenCalledWith('non-existent-id');
			expect(result).toBeNull();
		});
	});

	describe('getNotificationsByUserId', () => {
		it('should return the list of notifications for the given userId', async () => {
			const fakeNotifications = [
				{ id: 'notif-1', userId: 'user-1', fileId: 'file-1', notificationType: NotificationTypeEnum.success, text: 'Test text', createdAt: new Date() },
				{ id: 'notif-2', userId: 'user-1', fileId: 'file-2', notificationType: NotificationTypeEnum.success, text: 'Another text', createdAt: new Date() },
			];
			notificationRepositoryMock.getNotificationsByUserId.mockResolvedValue(fakeNotifications);

			const result = await notificationService.getNotificationsByUserId('user-1');
			expect(notificationRepositoryMock.getNotificationsByUserId).toHaveBeenCalledWith('user-1');
			expect(result).toEqual(fakeNotifications);
		});
	});

	describe('createNotification', () => {
		it('should throw InvalidNotificationException if fileId is invalid (empty string)', async () => {
			const params = {
				userId: 'user-1',
				fileId: '',
				fileStatus: StatusEnum.processed,
				imagesCompressedUrl: 'compressed.jpg',
				userPhoneNumber: '123456789',
			};

			try {
				await notificationService.createNotification(params);
				fail('The function should have thrown an InvalidNotificationException');
			} catch (error: any) {
				expect(error).toBeInstanceOf(InvalidNotificationException);
				expect(error.message).toBe(`fileId ${params.fileId} não é válido.`);
			}
		});

		it('should throw InvalidNotificationException if imagesCompressedUrl is invalid for processed status (empty string)', async () => {
			const params = {
				userId: 'user-1',
				fileId: 'file-1',
				fileStatus: StatusEnum.processed,
				imagesCompressedUrl: '',
				userPhoneNumber: '123456789',
			};

			try {
				await notificationService.createNotification(params);
				fail('The function should have thrown an InvalidNotificationException');
			} catch (error: any) {
				expect(error).toBeInstanceOf(InvalidNotificationException);
				expect(error.message).toBe(`imagesCompressedUrl ${params.imagesCompressedUrl} não é válido.`);
			}
		});

		it('should create notification successfully without sending SMS when userPhoneNumber is empty', async () => {
			const params = {
				userId: 'user-1',
				fileId: 'file-1',
				fileStatus: StatusEnum.processing,
				imagesCompressedUrl: 'compressed.jpg',
				userPhoneNumber: '',
			};

			const expectedText = PROCESSING_MESSAGE;

			const createdNotification = {
				id: 'notif-1',
				userId: params.userId,
				fileId: params.fileId,
				notificationType: NotificationTypeEnum.success,
				text: expectedText,
				createdAt: new Date(),
			};

			notificationRepositoryMock.createNotification.mockResolvedValue(createdNotification);

			const result = await notificationService.createNotification(params);

			expect(notificationRepositoryMock.createNotification).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: params.userId,
					fileId: params.fileId,
					notificationType: NotificationTypeEnum.success,
					text: expectedText,
				})
			);
			expect(smsServiceMock.sendSms).not.toHaveBeenCalled();
			expect(result).toEqual(createdNotification);
		});

		it('should create notification successfully and send SMS when userPhoneNumber is provided (processed status)', async () => {
			const params = {
				userId: 'user-1',
				fileId: 'file-1',
				fileStatus: StatusEnum.processed,
				imagesCompressedUrl: 'compressed.jpg',
				userPhoneNumber: '123456789',
			};

			process.env.AWS_API_URL = 'http://example.com';
			const expectedText = `${process.env.AWS_API_URL}/files/download/${params.fileId}`;

			const createdNotification = {
				id: 'notif-1',
				userId: params.userId,
				fileId: params.fileId,
				notificationType: NotificationTypeEnum.success,
				text: expectedText,
				createdAt: new Date(),
			};

			notificationRepositoryMock.createNotification.mockResolvedValue(createdNotification);
			smsServiceMock.sendSms.mockResolvedValue(undefined);

			const result = await notificationService.createNotification(params);

			expect(notificationRepositoryMock.createNotification).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: params.userId,
					fileId: params.fileId,
					notificationType: NotificationTypeEnum.success,
					text: expectedText,
				})
			);
			expect(smsServiceMock.sendSms).toHaveBeenCalledWith(
				params.userPhoneNumber,
				expectedText
			);
			expect(result).toEqual(createdNotification);
		});

		it('should create notification and catch error when SMS sending fails', async () => {
			const params = {
				userId: 'user-1',
				fileId: 'file-1',
				fileStatus: StatusEnum.processed,
				imagesCompressedUrl: 'compressed.jpg',
				userPhoneNumber: '123456789',
			};

			process.env.AWS_API_URL = 'http://example.com';
			const expectedText = `${process.env.AWS_API_URL}/files/download/${params.fileId}`;

			const createdNotification = {
				id: 'notif-1',
				userId: params.userId,
				fileId: params.fileId,
				notificationType: NotificationTypeEnum.success,
				text: expectedText,
				createdAt: new Date(),
			};

			notificationRepositoryMock.createNotification.mockResolvedValue(createdNotification);
			smsServiceMock.sendSms.mockRejectedValue(new Error('SMS service failed'));

			const result = await notificationService.createNotification(params);

			expect(notificationRepositoryMock.createNotification).toHaveBeenCalled();
			expect(smsServiceMock.sendSms).toHaveBeenCalledWith(
				params.userPhoneNumber,
				expectedText
			);
			expect(result).toEqual(createdNotification);
		});

		it('should create notification successfully and send SMS when fileStatus is error', async () => {
			const params = {
				userId: 'user-1',
				fileId: 'file-1',
				fileStatus: StatusEnum.error,
				imagesCompressedUrl: 'compressed.jpg',
				userPhoneNumber: '987654321',
			};

			const expectedText = ERROR_MESSAGE;

			const createdNotification = {
				id: 'notif-2',
				userId: params.userId,
				fileId: params.fileId,
				notificationType: NotificationTypeEnum.error,
				text: expectedText,
				createdAt: new Date(),
			};

			notificationRepositoryMock.createNotification.mockResolvedValue(createdNotification);
			smsServiceMock.sendSms.mockResolvedValue(undefined);

			const result = await notificationService.createNotification(params);

			expect(notificationRepositoryMock.createNotification).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: params.userId,
					fileId: params.fileId,
					notificationType: NotificationTypeEnum.error,
					text: expectedText,
				})
			);
			expect(smsServiceMock.sendSms).toHaveBeenCalledWith(
				params.userPhoneNumber,
				expectedText
			);
			expect(result).toEqual(createdNotification);
		});

		it('should create notification successfully and send SMS when fileStatus is initialized', async () => {
			const params = {
				userId: 'user-1',
				fileId: 'file-1',
				fileStatus: StatusEnum.initialized,
				imagesCompressedUrl: 'compressed.jpg',
				userPhoneNumber: '111222333',
			};

			const expectedText = '';

			const createdNotification = {
				id: 'notif-3',
				userId: params.userId,
				fileId: params.fileId,
				notificationType: NotificationTypeEnum.success,
				text: expectedText,
				createdAt: new Date(),
			};

			notificationRepositoryMock.createNotification.mockResolvedValue(createdNotification);
			smsServiceMock.sendSms.mockResolvedValue(undefined);

			const result = await notificationService.createNotification(params);

			expect(notificationRepositoryMock.createNotification).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: params.userId,
					fileId: params.fileId,
					notificationType: NotificationTypeEnum.success,
					text: expectedText,
				})
			);
			expect(smsServiceMock.sendSms).toHaveBeenCalledWith(
				params.userPhoneNumber,
				expectedText
			);
			expect(result).toEqual(createdNotification);
		});
	});
});
