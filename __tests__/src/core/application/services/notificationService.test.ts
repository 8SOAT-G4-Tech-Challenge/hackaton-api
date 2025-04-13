import { StatusEnum } from '@src/core/application/enumerations/statusEnum';
import { NotificationTypeEnum } from '@src/core/application/enumerations/typeEnum';
import { InvalidNotificationException } from '@src/core/application/exceptions/invalidNotificationException';
import { NotificationService } from '@src/core/application/services/notificationService';
import { PROCESSING_MESSAGE } from '@src/core/domain/constants/messages';

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

	describe('createNotification', () => {
		it('should throw InvalidNotificationException if fileId is invalid (empty string)', async () => {
			const params = {
				userId: 'user-1',
				fileId: '',
				fileStatus: StatusEnum.processed,
				imagesCompressedUrl: 'compressed.jpg',
				userPhoneNumber: '123456789',
			};

			await expect(
				notificationService.createNotification(params)
			).rejects.toThrow(InvalidNotificationException);
		});

		it('should throw InvalidNotificationException if imagesCompressedUrl is invalid for processed status (empty string)', async () => {
			const params = {
				userId: 'user-1',
				fileId: 'file-1',
				fileStatus: StatusEnum.processed,
				imagesCompressedUrl: '',
				userPhoneNumber: '123456789',
			};

			await expect(
				notificationService.createNotification(params)
			).rejects.toThrow(InvalidNotificationException);
		});

		it('should create notification successfully without sending SMS when userPhoneNumber is not provided', async () => {
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

			notificationRepositoryMock.createNotification.mockResolvedValue(
				createdNotification
			);

			const result = await notificationService.createNotification(params);

			expect(
				notificationRepositoryMock.createNotification
			).toHaveBeenCalledWith(
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

		it('should create notification successfully and send SMS when userPhoneNumber is provided', async () => {
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

			notificationRepositoryMock.createNotification.mockResolvedValue(
				createdNotification
			);
			smsServiceMock.sendSms.mockResolvedValue(undefined);

			const result = await notificationService.createNotification(params);

			expect(
				notificationRepositoryMock.createNotification
			).toHaveBeenCalledWith(
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

			notificationRepositoryMock.createNotification.mockResolvedValue(
				createdNotification
			);
			smsServiceMock.sendSms.mockRejectedValue(new Error('SMS service failed'));

			const result = await notificationService.createNotification(params);

			expect(notificationRepositoryMock.createNotification).toHaveBeenCalled();
			expect(smsServiceMock.sendSms).toHaveBeenCalledWith(
				params.userPhoneNumber,
				expectedText
			);
			expect(result).toEqual(createdNotification);
		});
	});
});
