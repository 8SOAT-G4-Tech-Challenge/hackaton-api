import { FastifyInstance } from 'fastify';

import { FileService } from '@application/services';
import { FileRepositoryImpl } from '@driven/infra';
import { FileController } from '@driver/controllers';

import {
	SwaggerGetFileById,
	SwaggerGetFiles,
	SwaggerGetFilesByUserId,
	SwaggerProcessVideoFile
} from './docs/file';
import { SwaggerHealthCheck } from './docs/health';

const fileRepository = new FileRepositoryImpl();

const fileService = new FileService(fileRepository);

const fileController = new FileController(fileService);

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
		'/files/process-video-file',
		SwaggerProcessVideoFile,
		fileController.processVideoFile.bind(fileController)
	);
};
