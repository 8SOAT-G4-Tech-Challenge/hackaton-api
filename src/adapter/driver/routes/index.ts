import { FastifyInstance } from 'fastify';

import { FileService, NotificationService } from '@application/services';
import { SimpleQueueService } from '@application/services/simpleQueueService';
import { SimpleStorageService } from '@application/services/simpleStorageService';
import { SmsService } from '@application/services/smsService';
import { FileRepositoryImpl, NotificationRepositoryImpl } from '@driven/infra';
import { AwsSimpleQueueImpl } from '@driven/infra/awsSimpleQueueImpl';
import { AwsSimpleStorageImpl } from '@driven/infra/awsSimpleStorageImpl';
import { FileController, NotificationController } from '@driver/controllers';

import { authMiddleware } from '../middlewares/auth';

const fileRepository = new FileRepositoryImpl();
const notificationRepository = new NotificationRepositoryImpl();

const awsSimpleStorageImpl = new AwsSimpleStorageImpl();
const simpleStorageService = new SimpleStorageService(awsSimpleStorageImpl);

const smsService = new SmsService();
const notificationService = new NotificationService(
	notificationRepository,
	smsService
);

const awsSimpleQueueImpl = new AwsSimpleQueueImpl();
const simpleQueueService = new SimpleQueueService(awsSimpleQueueImpl);

const fileService = new FileService(
	fileRepository,
	simpleStorageService,
	simpleQueueService,
	notificationService
);

const fileController = new FileController(fileService);
const notificationController = new NotificationController(notificationService);

export const routes = async (fastify: FastifyInstance) => {
	// External (pode passar authMiddleware)
	fastify.get('/health', async (_request, reply) => {
		reply.status(200).send({ message: 'Health Check - Ok' });
	});
	fastify.post(
		'/upload',
		{ preHandler: authMiddleware },
		fileController.createFile.bind(fileController)
	);
	fastify.get(
		'/download/:fileId',
		fileController.getSignedUrl.bind(fileController)
	);

	// Internal (não pode passar authMiddleware)
	fastify.put('/:fileId', fileController.updateFile.bind(fileController));

	// Não mexi
	fastify.get('/', fileController.getFiles.bind(fileController));
	fastify.get('/:id', fileController.getFileById.bind(fileController));
	fastify.get(
		'/users/:userId',
		fileController.getFilesByUserId.bind(fileController)
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
