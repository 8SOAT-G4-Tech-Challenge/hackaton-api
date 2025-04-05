import { FastifyInstance } from 'fastify';

import { FileService, NotificationService } from '@application/services';
import { FileRepositoryImpl, NotificationRepositoryImpl } from '@driven/infra';
import { FileController, NotificationController } from '@driver/controllers';

import {
	SwaggerCreateFile,
	SwaggerGetFileById,
	SwaggerGetFiles,
	SwaggerGetFilesByUserId
} from './docs/file';
import { SwaggerHealthCheck } from './docs/health';
import { SwaggerGetNotificationById, SwaggerGetNotifications, SwaggerGetNotificationsByUserId } from './docs/notification';

const fileRepository = new FileRepositoryImpl();
const notificationRepository = new NotificationRepositoryImpl();

const fileService = new FileService(fileRepository);
const notificationService = new NotificationService(notificationRepository);

const fileController = new FileController(fileService);
const notificationController = new NotificationController(notificationService);

export const routes = async (fastify: FastifyInstance) => {
	fastify.get('/health', SwaggerHealthCheck, async (_request, reply) => {
		reply.status(200).send({ message: 'Health Check - Ok' });
	});

	fastify.get(
		'/files',
		SwaggerGetFiles,
		fileController.getFiles.bind(fileController)
	);
	fastify.get(
		'/files/:id',
		SwaggerGetFileById,
		fileController.getFileById.bind(fileController)
	);
	fastify.get(
		'/users/:userId/files',
		SwaggerGetFilesByUserId,
		fileController.getFilesByUserId.bind(fileController)
	);
	fastify.post(
		'/files',
		SwaggerCreateFile,
		fileController.createFile.bind(fileController)
	)
	fastify.get(
		'/notifications',
		SwaggerGetNotifications,
		notificationController.getNotifications.bind(notificationController)
	);
	fastify.get(
		'/notifications/:id',
		SwaggerGetNotificationById,
		notificationController.getNotificationById.bind(notificationController)
	);
	fastify.get(
		'/users/:userId/notifications',
		SwaggerGetNotificationsByUserId,
		notificationController.getNotificationsByUserId.bind(notificationController)
	);
};
