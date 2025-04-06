import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { handleError } from '@driver/errorHandler';
import { NotificationService } from '@src/core/application/services';
import logger from '@src/core/common/logger';
import { Notification } from '@src/core/domain/models/notification';

export class NotificationController {
	private readonly notificationService;

	constructor(notificationService: NotificationService) {
		this.notificationService = notificationService;
	}

	async getNotifications(req: FastifyRequest, reply: FastifyReply) {
		try {
			logger.info('[NOTIFICATION CONTROLLER] Listing notifications');
			const notifications: Notification[] =
				await this.notificationService.getNotifications();
			reply.code(StatusCodes.OK).send(notifications);
		} catch (error) {
			handleError(req, reply, error);
		}
	}

	async getNotificationById(
		req: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply
	) {
		try {
			const { id } = req.params;
			logger.info(
				`[NOTIFICATION CONTROLLER] Listing notification by ID: ${id}`
			);
			const notification: Notification | null =
				await this.notificationService.getNotificationById(id);

			if (!notification) {
				reply.code(StatusCodes.NOT_FOUND).send({
					error: 'Not Found',
					message: 'Notification not found',
				});
				return;
			}

			reply.code(StatusCodes.OK).send(notification);
		} catch (error) {
			handleError(req, reply, error);
		}
	}

	async getNotificationsByUserId(
		req: FastifyRequest<{ Params: { userId: string } }>,
		reply: FastifyReply
	) {
		try {
			const { userId } = req.params;
			logger.info(
				`[NOTIFICATION CONTROLLER] Listing notifications by user ID: ${userId}`
			);
			const notifications: Notification[] =
				await this.notificationService.getNotificationsByUserId(userId);
			reply.code(StatusCodes.OK).send(notifications);
		} catch (error) {
			handleError(req, reply, error);
		}
	}
}
