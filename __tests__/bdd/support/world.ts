import { setWorldConstructor } from '@cucumber/cucumber';

export class CustomWorld {
	authToken: string | null;

	userId: string | null;

	response: any;

	error: any;

	fileId: string | null;

	testFilePath: string | null;

	fileName: string | null;

	constructor() {
		this.authToken = null;
		this.userId = null;
		this.response = null;
		this.error = null;
		this.fileId = null;
		this.testFilePath = null;
		this.fileName = null;
	}
}

setWorldConstructor(CustomWorld);
