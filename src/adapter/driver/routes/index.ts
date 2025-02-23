import { FastifyInstance } from 'fastify';

import { UserService } from '@application/services';
import { UserRepositoryImpl } from '@driven/infra';
import { UserController } from '@driver/controllers';

const userRepository = new UserRepositoryImpl();

const userService = new UserService(userRepository);

const userController = new UserController(userService);

export const routes = async (fastify: FastifyInstance) => {
	fastify.get('/health', async (_request, reply) => {
		reply.status(200).send({ message: 'Health Check User - Ok' });
	});
	fastify.get('/users', userController.getUsers.bind(userController));
	fastify.get('/users/:id', userController.getUserById.bind(userController));
	fastify.get(
		'/users/email/:email',
		userController.getUserByEmail.bind(userController)
	);
	fastify.post('/users', userController.createUser.bind(userController));
	fastify.put('/users/:id', userController.updateUser.bind(userController));
	fastify.delete('/users/:id', userController.deleteUser.bind(userController));
};
