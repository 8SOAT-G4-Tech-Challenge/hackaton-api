import { StatusCodes } from 'http-status-codes';

import { InvalidNotificationException } from '@src/core/application/exceptions/invalidNotificationException';

describe('InvalidNotificationException', () => {
	it('should create an instance with the correct properties using default status', () => {
		const message = 'Invalid notification provided';
		const exception = new InvalidNotificationException(message);

		expect(exception).toBeInstanceOf(InvalidNotificationException);
		expect(exception.message).toBe(message);
		expect(exception.name).toBe('InvalidNotificationException');
		expect(exception.statusCode).toBe(StatusCodes.BAD_REQUEST);
	});

	it('should create an instance with the correct properties using a custom status code', () => {
		const message = 'Custom invalid notification error';
		const customStatus = StatusCodes.UNPROCESSABLE_ENTITY;
		const exception = new InvalidNotificationException(message, customStatus);

		expect(exception).toBeInstanceOf(InvalidNotificationException);
		expect(exception.message).toBe(message);
		expect(exception.name).toBe('InvalidNotificationException');
		expect(exception.statusCode).toBe(customStatus);
	});
});
