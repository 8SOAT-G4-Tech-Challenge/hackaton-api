import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';

import { BaseException } from '@exceptions/baseException';

import {
	errorHandler,
	handleError,
} from '../../../../src/adapter/driver/errorHandler';

interface FastifyError extends Error {
	code: string;
}

function createReplyMock(): FastifyReply {
	return {
		status: jest.fn().mockReturnThis(),
		send: jest.fn(),
	} as unknown as FastifyReply;
}

describe('errorHandler', () => {
	it('deve enviar uma resposta com mensagem genérica se o erro não tiver mensagem', () => {
		const request = { url: '/test' } as FastifyRequest;
		const reply = createReplyMock();

		const fakeError = {
			message: '',
			code: 'ERR_TEST',
			name: 'Error',
		} as FastifyError;

		errorHandler(fakeError, request, reply);

		expect(reply.status).toHaveBeenCalledWith(
			StatusCodes.INTERNAL_SERVER_ERROR
		);
		expect(reply.send).toHaveBeenCalledWith(
			JSON.stringify({
				path: '/test',
				status: StatusCodes.INTERNAL_SERVER_ERROR,
				message: 'Generic error',
			})
		);
	});

	it('deve enviar uma resposta com a mensagem de erro informada', () => {
		const request = { url: '/test' } as FastifyRequest;
		const error: FastifyError = Object.assign(new Error('Test error'), {
			code: 'ERR_TEST',
		});
		const reply = createReplyMock();

		errorHandler(error, request, reply);

		expect(reply.status).toHaveBeenCalledWith(
			StatusCodes.INTERNAL_SERVER_ERROR
		);
		expect(reply.send).toHaveBeenCalledWith(
			JSON.stringify({
				path: '/test',
				status: StatusCodes.INTERNAL_SERVER_ERROR,
				message: 'Test error',
			})
		);
	});
});

describe('handleError', () => {
	it('deve tratar um erro simples enviando a mensagem do erro', () => {
		const req = { url: '/test' } as FastifyRequest;
		const reply = createReplyMock();
		const error = new Error('Test error');
		(error as any).code = 'ERR_TEST';

		handleError(req, reply, error);

		expect(reply.status).toHaveBeenCalledWith(
			StatusCodes.INTERNAL_SERVER_ERROR
		);
		expect(reply.send).toHaveBeenCalledWith(
			JSON.stringify({
				path: '/test',
				status: StatusCodes.INTERNAL_SERVER_ERROR,
				message: 'Test error',
			})
		);
	});

	it('deve sobrescrever a mensagem do erro quando fornecida uma mensagem customizada', () => {
		const req = { url: '/test' } as FastifyRequest;
		const reply = createReplyMock();
		const error = new Error('Test error');
		(error as any).code = 'ERR_TEST';

		handleError(req, reply, error, 'Custom message');

		expect(reply.status).toHaveBeenCalledWith(
			StatusCodes.INTERNAL_SERVER_ERROR
		);
		expect(reply.send).toHaveBeenCalledWith(
			JSON.stringify({
				path: '/test',
				status: StatusCodes.INTERNAL_SERVER_ERROR,
				message: 'Custom message',
			})
		);
	});

	it('deve tratar erros do tipo ZodError configurando BAD_REQUEST e formatando a mensagem', () => {
		const req = { url: '/test' } as FastifyRequest;
		const reply = createReplyMock();
		const zodErrors = [
			{
				path: ['field'],
				message: 'Invalid value',
			},
		];
		const error = new ZodError(zodErrors as any);

		handleError(req, reply, error);

		expect(reply.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(reply.send).toHaveBeenCalledWith(
			JSON.stringify({
				path: '/test',
				status: StatusCodes.BAD_REQUEST,
				message: 'field: Invalid value',
			})
		);
	});

	it('deve tratar erros do tipo BaseException configurando o status e a mensagem definidos', () => {
		class TestException extends BaseException {
			constructor() {
				super('Base exception error', 'ERR_NOT_FOUND', StatusCodes.NOT_FOUND);
			}
		}
		const req = { url: '/test' } as FastifyRequest;
		const reply = createReplyMock();
		const error = new TestException();

		handleError(req, reply, error);

		expect(reply.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
		expect(reply.send).toHaveBeenCalledWith(
			JSON.stringify({
				path: '/test',
				status: StatusCodes.NOT_FOUND,
				message: 'Base exception error',
			})
		);
	});
});
