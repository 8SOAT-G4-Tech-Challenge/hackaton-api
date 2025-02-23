import { FastifyInstance } from 'fastify';

import { UserService } from '@application/services';
import { UserRepositoryImpl } from '@driven/infra';
import { UserController } from '@driver/controllers';

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

const userService = new UserService(userRepository);

const userController = new UserController(userService);

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
};
