import { FastifyReply, FastifyRequest } from 'fastify';
import NodeCache from 'node-cache';

import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const userCache = new NodeCache({ stdTTL: 300 });

const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION });

const getUserDataFromLambda = async (token: string, reply: FastifyReply) => {
	const command = new InvokeCommand({
		FunctionName: process.env.AWS_AUTH_LAMBDA,
		Payload: Buffer.from(JSON.stringify({ accessToken: token })),
	});

	const response = await lambdaClient.send(command);

	if (!response.Payload) {
		return reply.status(404).send({ message: 'Not Found' });
	}

	const responseData = JSON.parse(Buffer.from(response.Payload).toString());

	if (response.FunctionError || responseData.statusCode === 500) {
		return reply.status(401).send({ message: 'Token expired' });
	}

	return responseData.body;
};

export async function authMiddleware(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const token =
		request.headers.authorization?.replace('Bearer', '').trim() || '';

	if (!token) {
		return reply.status(401).send({ message: 'Unauthorized' });
	}

	const cacheKey = `user:${token}`;

	let userData = userCache.get(cacheKey);

	if (!userData) {
		userData = await getUserDataFromLambda(token, reply);
		userCache.set(cacheKey, userData);
	}

	request.user = JSON.parse(userData as any);

	return userData;
}
