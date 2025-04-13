import { InvalidFileException } from '@src/core/application/exceptions/invalidFileException';
import { StatusCodes } from 'http-status-codes';

describe('InvalidFileException', () => {
    it('should create an instance with the correct properties using default status', () => {
        const message = 'Invalid file provided';
        const exception = new InvalidFileException(message);

        expect(exception).toBeInstanceOf(InvalidFileException);
        expect(exception.message).toBe(message);
        expect(exception.name).toBe('InvalidFileException');
        expect(exception.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should create an instance with the correct properties using a custom status code', () => {
        const message = 'Custom invalid file error';
        const customStatus = StatusCodes.UNPROCESSABLE_ENTITY;
        const exception = new InvalidFileException(message, customStatus);

        expect(exception).toBeInstanceOf(InvalidFileException);
        expect(exception.message).toBe(message);
        expect(exception.name).toBe('InvalidFileException');
        expect(exception.statusCode).toBe(customStatus);
    });
});
