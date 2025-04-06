import { FastifyInstance } from 'fastify';

import { FileService, NotificationService } from '@application/services';
import { FileRepositoryImpl, NotificationRepositoryImpl } from '@driven/infra';
import { FileController, NotificationController } from '@driver/controllers';
import { AwsSimpleQueueImpl } from '@src/adapter/driven/infra/awsSimpleQueueImpl';
import { AwsSimpleStorageImpl } from '@src/adapter/driven/infra/awsSimpleStorageImpl';
import { SimpleQueueService } from '@src/core/application/services/simpleQueueService';
import { SimpleStorageService } from '@src/core/application/services/simpleStorageService';

import { authMiddleware } from '../middlewares/auth';

const fileRepository = new FileRepositoryImpl();
const notificationRepository = new NotificationRepositoryImpl();

const awsSimpleStorageImpl = new AwsSimpleStorageImpl();
const simpleStorageService = new SimpleStorageService(awsSimpleStorageImpl);

const awsSimpleQueueImpl = new AwsSimpleQueueImpl();
const simpleQueueService = new SimpleQueueService(awsSimpleQueueImpl);

const fileService = new FileService(
	fileRepository,
	simpleStorageService,
	simpleQueueService
);
const notificationService = new NotificationService(notificationRepository);

const fileController = new FileController(fileService);
const notificationController = new NotificationController(notificationService);

export const routes = async (fastify: FastifyInstance) => {
	fastify.get('/health', async (_request, reply) => {
		reply.status(200).send({ message: 'Health Check - Ok' });
	});
	fastify.get('/files', fileController.getFiles.bind(fileController));
	fastify.get('/files/:id', fileController.getFileById.bind(fileController));
	fastify.get(
		'/users/:userId/files',
		fileController.getFilesByUserId.bind(fileController)
	);
	fastify.post(
		'/files',
		{ preHandler: authMiddleware },
		fileController.createFile.bind(fileController)
	);
	fastify.get(
		'/notifications',
		notificationController.getNotifications.bind(notificationController)
	);
	fastify.get(
		'/notifications/:id',
		notificationController.getNotificationById.bind(notificationController)
	);
	fastify.get(
		'/users/:userId/notifications',
		notificationController.getNotificationsByUserId.bind(notificationController)
	);
};
