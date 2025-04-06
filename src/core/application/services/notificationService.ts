import logger from '@src/core/common/logger';
import {
	ERROR_MESSAGE,
	PROCESSED_MESSAGE,
} from '@src/core/domain/constants/messages';
import { Notification } from '@src/core/domain/models/notification';

import { InvalidNotificationException } from '../exceptions/invalidNotificationException';
import { CreateNotificationParams } from '../ports/input/notification';
import { NotificationRepository } from '../ports/repository/notificationRepository';
import { SmsService } from './smsService';

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
		logger.info('[NOTIFICATION SERVICE] Creating notification...');

		if (!createNotificationParams.fileId) {
			throw new InvalidNotificationException(
				`fileId ${createNotificationParams.fileId} não é válido.`
			);
		}

		if (
			createNotificationParams.fileStatus === 'processed' &&
			!createNotificationParams.imagesCompressedUrl
		) {
			throw new InvalidNotificationException(
				`imagesCompressedUrl ${createNotificationParams.imagesCompressedUrl} não é válido.`
			);
		}

		const text =
			createNotificationParams.fileStatus === 'processed'
				? PROCESSED_MESSAGE(createNotificationParams.imagesCompressedUrl!)
				: ERROR_MESSAGE;

		const notification: Notification = {
			userId: createNotificationParams.userId,
			fileId: createNotificationParams.fileId,
			notificationType:
				createNotificationParams.fileStatus === 'processed'
					? 'success'
					: 'error',
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
