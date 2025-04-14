import { BaseException } from '@src/core/application/exceptions/baseException';

describe('BaseException', () => {
	it('should create an exception with the correct properties', () => {
		const message = 'Test error occurred';
		const name = 'TestException';
		const statusCode = 400;

		const exception = new BaseException(message, name, statusCode);

		expect(exception).toBeInstanceOf(BaseException);
		expect(exception.message).toBe(message);
		expect(exception.name).toBe(name);
		expect(exception.statusCode).toBe(statusCode);
	});
});
