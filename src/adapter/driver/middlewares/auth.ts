import axios from 'axios';
import { FastifyReply, FastifyRequest } from 'fastify';
import NodeCache from 'node-cache';

const userCache = new NodeCache({ stdTTL: 300 });

const api = axios.create({
	baseURL: process.env.AWS_API_URL,
});

export const getUserData = async (token: string, reply: FastifyReply) => {
	const response = await api.get('/user-data', {
		headers: {
			Authorization: token,
		},
	});

	if (!response.data) {
		return reply.status(404).send({ message: 'Not Found' });
	}

	return response.data;
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
		userData = await getUserData(token, reply);
		userCache.set(cacheKey, userData);
	}

	request.user = userData as any;

	return userData;
}
