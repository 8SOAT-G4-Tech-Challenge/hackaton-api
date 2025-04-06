// eslint-disable-next-line @typescript-eslint/no-unused-vars
import fastify from 'fastify';

declare module 'fastify' {
	interface FastifyRequest {
		user: {
			sub: string;
			email: string;
			phoneNumber: string;
			username: string;
			id: string;
		};
	}
}
