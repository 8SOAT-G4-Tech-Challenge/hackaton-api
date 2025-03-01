import { FastifyInstance } from 'fastify';

import { FileService, UserService } from '@application/services';
import { FileRepositoryImpl, UserRepositoryImpl } from '@driven/infra';
import { FileController, UserController } from '@driver/controllers';

import {
	SwaggerGetFileById,
	SwaggerGetFiles,
	SwaggerGetFilesByUserId,
} from './docs/file';
import { SwaggerHealthCheck } from './docs/health';
import {
	SwaggerCreateUser,
	SwaggerDeleteUser,
	SwaggerGetUserByEmail,
	SwaggerGetUserById,
	SwaggerGetUsers,
	SwaggerUpdateUser,
} from './docs/user';

const userRepository = new UserRepositoryImpl();
const fileRepository = new FileRepositoryImpl();

const userService = new UserService(userRepository);
const fileService = new FileService(fileRepository);

const userController = new UserController(userService);
const fileController = new FileController(fileService);

export const routes = async (fastify: FastifyInstance) => {
	fastify.get('/health', SwaggerHealthCheck, async (_request, reply) => {
		reply.status(200).send({ message: 'Health Check - Ok' });
	});

	fastify.get(
		'/users',
		SwaggerGetUsers,
		userController.getUsers.bind(userController)
	);
	fastify.get(
		'/users/:id',
		SwaggerGetUserById,
		userController.getUserById.bind(userController)
	);
	fastify.get(
		'/users/email/:email',
		SwaggerGetUserByEmail,
		userController.getUserByEmail.bind(userController)
	);
	fastify.post(
		'/users',
		SwaggerCreateUser,
		userController.createUser.bind(userController)
	);
	fastify.put(
		'/users/:id',
		SwaggerUpdateUser,
		userController.updateUser.bind(userController)
	);
	fastify.delete(
		'/users/:id',
		SwaggerDeleteUser,
		userController.deleteUser.bind(userController)
	);

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
		fileController.processVideoFile.bind(fileController)
	);
};
