import { userMiddleware } from '@src/adapter/driver/middlewares/user';
import { FastifyRequest, FastifyReply } from 'fastify';

jest.mock('jwt-decode', () => ({
    __esModule: true,
    jwtDecode: jest.fn(),
}));
import { jwtDecode } from 'jwt-decode';

describe('userMiddleware', () => {
    let request: Partial<FastifyRequest>;
    let reply: Partial<FastifyReply>;

    beforeEach(() => {
        request = { headers: {} };
        reply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        const mockJwtDecode = jwtDecode as unknown as jest.Mock;
        if (typeof mockJwtDecode.mockReset === 'function') {
            mockJwtDecode.mockReset();
        }
    });

    it('should decode user using x-amzn-oidc-data header', async () => {
        const claims = {
            sub: 'user1',
            phone_number: '555-1234',
            email: 'user1@example.com',
            'cognito:username': 'user1',
        };
        const base64 = Buffer.from(JSON.stringify(claims), 'utf8').toString('base64');
        request.headers!['x-amzn-oidc-data'] = base64;

        await userMiddleware(request as FastifyRequest, reply as FastifyReply);

        expect(request.user).toEqual({
            id: claims.sub,
            phoneNumber: claims.phone_number,
            email: claims.email,
            username: claims['cognito:username'],
        });
        expect(reply.status).not.toHaveBeenCalled();
        expect(reply.send).not.toHaveBeenCalled();
    });

    it('should decode user using Authorization header and jwtDecode', async () => {
        request.headers!.authorization = 'Bearer token123';

        const mockJwtDecode = jwtDecode as unknown as jest.Mock;

        mockJwtDecode.mockReturnValue({
            sub: 'user2',
            phone_number: '555-2345',
            email: 'user2@example.com',
            'cognito:username': 'user2',
        });

        await userMiddleware(request as FastifyRequest, reply as FastifyReply);

        expect(request.user).toEqual({
            id: 'user2',
            phoneNumber: '555-2345',
            email: 'user2@example.com',
            username: 'user2',
        });
        expect(reply.status).not.toHaveBeenCalled();
        expect(reply.send).not.toHaveBeenCalled();
    });

    it('should return 401 Unauthorized if no token is provided', async () => {
        await userMiddleware(request as FastifyRequest, reply as FastifyReply);

        expect(reply.status).toHaveBeenCalledWith(401);
        expect(reply.send).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });
});
