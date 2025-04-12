import { StatusEnum } from '@application/enumerations/statusEnum';
import { NotificationTypeEnum } from '@application/enumerations/typeEnum';
import logger from '@common/logger';
import { ERROR_MESSAGE, PROCESSING_MESSAGE } from '@domain/constants/messages';
import { Notification } from '@domain/models/notification';
import { InvalidNotificationException } from '@exceptions/invalidNotificationException';
import { CreateNotificationParams } from '@ports/input/notification';
import { NotificationRepository } from '@ports/repository/notificationRepository';
import { StatusType } from '@src/core/domain/types/statusType';

import { SmsService } from './smsService';

const getSmsMessage = (status: StatusType, fileId: string) => {
	if (status === StatusEnum.processed) {
		return `${process.env.AWS_API_URL}/files/download/${fileId}`;
	}

	if (status === StatusEnum.processing) {
		return PROCESSING_MESSAGE;
	}

	if (status === StatusEnum.error) {
		return ERROR_MESSAGE;
	}

	return '';
};

export class NotificationService {
	private readonly notificationRepository;

	private readonly smsService;

	constructor(
		notificationRepository: NotificationRepository,
		smsService: SmsService
	) {
		this.notificationRepository = notificationRepository;
		this.smsService = smsService;
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

	async createNotification(
		createNotificationParams: CreateNotificationParams
	): Promise<Notification> {
		logger.info('[NOTIFICATION SERVICE] Sending notification');

		if (!createNotificationParams.fileId) {
			throw new InvalidNotificationException(
				`fileId ${createNotificationParams.fileId} não é válido.`
			);
		}

		if (
			createNotificationParams.fileStatus === StatusEnum.processed &&
			!createNotificationParams.imagesCompressedUrl
		) {
			throw new InvalidNotificationException(
				`imagesCompressedUrl ${createNotificationParams.imagesCompressedUrl} não é válido.`
			);
		}

		const text = getSmsMessage(
			createNotificationParams.fileStatus,
			createNotificationParams?.fileId || ''
		);

		const successStatuses: StatusType[] = [
			StatusEnum.processed,
			StatusEnum.processing,
			StatusEnum.initialized,
		];

		const notification: Notification = {
			userId: createNotificationParams.userId,
			fileId: createNotificationParams.fileId,
			notificationType: successStatuses.includes(
				createNotificationParams.fileStatus
			)
				? NotificationTypeEnum.success
				: NotificationTypeEnum.error,
			text,
			createdAt: new Date(),
		};

		const notificationCreated =
			await this.notificationRepository.createNotification(notification);

		if (createNotificationParams.userPhoneNumber) {
			try {
				await this.smsService.sendSms(
					createNotificationParams.userPhoneNumber,
					text
				);
			} catch (error) {
				logger.error(`[NOTIFICATION SERVICE] Erro ao enviar SMS: ${error}`);
			}
		}

		return notificationCreated;
	}
}
