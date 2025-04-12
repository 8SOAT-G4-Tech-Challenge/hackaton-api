import { FastifyInstance } from 'fastify';

import { FileService, NotificationService } from '@application/services';
import { SimpleQueueService } from '@application/services/simpleQueueService';
import { SimpleStorageService } from '@application/services/simpleStorageService';
import { SmsService } from '@application/services/smsService';
import { FileRepositoryImpl, NotificationRepositoryImpl } from '@driven/infra';
import { AwsSimpleQueueImpl } from '@driven/infra/awsSimpleQueueImpl';
import { AwsSimpleStorageImpl } from '@driven/infra/awsSimpleStorageImpl';
import { FileController, NotificationController } from '@driver/controllers';

import { UpdateFileParams } from '@src/core/application/ports/input/file';
import { userMiddleware } from '../middlewares/user';

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
	fastify.get('/health', async (_request, reply) => {
		reply.status(200).send({ message: 'Health Check - Ok' });
	});
	fastify.post(
		'/upload',
		{ preHandler: userMiddleware },
		fileController.createFile.bind(fileController)
	);
	fastify.put<{ Params: { fileId: string }, Body: UpdateFileParams }>(
		'/files/:fileId',
		{ preHandler: userMiddleware },
		fileController.updateFile.bind(fileController)
	);
	fastify.get(
		'/download/:fileId',
		fileController.getSignedUrl.bind(fileController)
	);
	fastify.get('/:id', fileController.getFileById.bind(fileController));
	fastify.get(
		'/user/files',
		{ preHandler: userMiddleware },
		fileController.getFilesByUserId.bind(fileController)
	);
	fastify.get(
		'/notification/:id',
		notificationController.getNotificationById.bind(notificationController)
	);
	fastify.get(
		'/user/notifications',
		{ preHandler: userMiddleware },
		notificationController.getNotificationsByUserId.bind(notificationController)
	);
	fastify.delete('/:fileId', fileController.deleteFile.bind(fileController));
	fastify.put('/:fileId', fileController.updateFile.bind(fileController));
};
