import { FastifyReply, FastifyRequest } from 'fastify';
import { jwtDecode } from 'jwt-decode';
import NodeCache from 'node-cache';

const userCache = new NodeCache({ stdTTL: 300 });

const getUserLocalHost = (token: string, request: FastifyRequest) => {
	const cacheKey = `user:${token}`;

	let userData: any = userCache.get(cacheKey);

	if (!userData) {
		const user: any = jwtDecode(token);

		userData = {
			id: user.sub,
			phoneNumber: user.phone_number,
			email: user.email,
			username: user['cognito:username'],
		};

		userCache.set(cacheKey, userData);
	}

	request.user = userData;
};

const getUserCognitoAuthorizer = (token: any, request: FastifyRequest) => {
	const cacheKey = `user:${token}`;

	let userData: any = userCache.get(cacheKey);

	if (!userData) {
		const claims = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));

		userData = {
			id: claims.sub,
			phoneNumber: claims.phone_number,
			email: claims.email,
			username: claims['cognito:username'],
		};

		userCache.set(cacheKey, userData);
	}

	request.user = userData;
};

export async function userMiddleware(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const userClaimsBase64 = request.headers['x-amzn-oidc-data'];
	if (userClaimsBase64) {
		return getUserCognitoAuthorizer(userClaimsBase64, request);
	}

	const token =
		request.headers.authorization?.replace('Bearer', '').trim() ?? '';
	if (token && !userClaimsBase64) {
		return getUserLocalHost(token, request);
	}

	reply.status(401).send({ message: 'Unauthorized' });

	return '';
}
