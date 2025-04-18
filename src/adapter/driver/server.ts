import 'dotenv/config';

import fastify from 'fastify';

import logger from '@common/logger';
import { errorHandler } from '@driver/errorHandler';
import fastifyCors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import { routes } from '@routes/index';

export const app = fastify({
	bodyLimit: 50 * 1024 * 1024,
});

app.register(fastifyCors, {
	origin: '*',
});

app.register(fastifyMultipart, {
	limits: {
		fileSize: 50 * 1024 * 1024,
	},
});

app.register(helmet, {
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "'unsafe-inline'"],
			objectSrc: ["'none'"],
			upgradeInsecureRequests: [],
		},
	},
	frameguard: {
		action: 'deny',
	},
	referrerPolicy: {
		policy: 'no-referrer',
	},
	xssFilter: true,
	noSniff: true,
});

app.register(routes, { prefix: '/files' });

app.setErrorHandler(errorHandler);

async function run() {
	await app.ready();

	await app.listen({
		port: Number(process.env.API_PORT) || 3334,
		host: '0.0.0.0',
	});

	logger.info('Documentation running at http://localhost:3333/docs');
}

run();
