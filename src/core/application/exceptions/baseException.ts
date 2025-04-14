export class BaseException extends Error {
	public statusCode: number;

	constructor(message: string, name: string, statusCode: number) {
		super(message);
		this.name = name;
		this.statusCode = statusCode;

		Error.captureStackTrace(this, this.constructor);
	}
}
