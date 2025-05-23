import { StatusCodes } from 'http-status-codes';

import * as ErrorHandler from '@driver/errorHandler';
import { FileController } from '@src/adapter/driver/controllers/fileController';

import { FileMockBuilder } from '../../../../mocks/file.mock-builder';

describe('FileController', () => {
	let fileService: any;
	let fileController: FileController;
	let fakeReply: any;
	let fakeReq: any;

	beforeEach(() => {
		fileService = {
			getFileById: jest.fn(),
			getFilesByUserId: jest.fn(),
			createFile: jest.fn(),
			updateFile: jest.fn(),
			getSignedUrl: jest.fn(),
			deleteFile: jest.fn(),
		};

		fileController = new FileController(fileService);

		fakeReply = {
			code: jest.fn().mockReturnThis(),
			send: jest.fn(),
			redirect: jest.fn(),
		};
	});

	describe('getFileById', () => {
		it('should return the file with status 200 when found', async () => {
			const file = new FileMockBuilder().withId('file-1').build();
			fileService.getFileById.mockResolvedValue(file);
			fakeReq = { params: { id: 'file-1' } };

			await fileController.getFileById(fakeReq, fakeReply);

			expect(fileService.getFileById).toHaveBeenCalledWith('file-1');
			expect(fakeReply.code).toHaveBeenCalledWith(StatusCodes.OK);
			expect(fakeReply.send).toHaveBeenCalledWith(file);
		});

		it('should return 404 when the file is not found', async () => {
			fileService.getFileById.mockResolvedValue(null);
			fakeReq = { params: { id: 'non-existent-id' } };

			await fileController.getFileById(fakeReq, fakeReply);

			expect(fileService.getFileById).toHaveBeenCalledWith('non-existent-id');
			expect(fakeReply.code).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
			expect(fakeReply.send).toHaveBeenCalledWith({
				error: 'Not Found',
				message: 'File not found',
			});
		});

		it('should call handleError when an error occurs in getFileById', async () => {
			const testError = new Error('Test error');
			fileService.getFileById.mockRejectedValue(testError);
			fakeReq = { params: { id: 'file-1' } };

			const spyHandleError = jest
				.spyOn(ErrorHandler, 'handleError')
				.mockImplementation((req, reply, error) => {
					reply.code(500).send({ error: error.message });
				});

			await fileController.getFileById(fakeReq, fakeReply);
			expect(spyHandleError).toHaveBeenCalledWith(
				fakeReq,
				fakeReply,
				testError,
			);
		});
	});

	describe('getFilesByUserId', () => {
		it('should return the user files list with status 200', async () => {
			const file1 = new FileMockBuilder().withId('file-1').build();
			const file2 = new FileMockBuilder().withId('file-2').build();
			fileService.getFilesByUserId.mockResolvedValue([file1, file2]);
			fakeReq = { user: { id: 'user-123' } };

			await fileController.getFilesByUserId(fakeReq, fakeReply);

			expect(fileService.getFilesByUserId).toHaveBeenCalledWith('user-123');
			expect(fakeReply.code).toHaveBeenCalledWith(StatusCodes.OK);
			expect(fakeReply.send).toHaveBeenCalledWith([file1, file2]);
		});

		it('should call handleError when an error occurs in getFilesByUserId', async () => {
			const testError = new Error('Test error');
			fileService.getFilesByUserId.mockRejectedValue(testError);
			fakeReq = { user: { id: 'user-123' } };

			const spyHandleError = jest
				.spyOn(ErrorHandler, 'handleError')
				.mockImplementation((req, reply, error) => {
					reply.code(500).send({ error: error.message });
				});

			await fileController.getFilesByUserId(fakeReq, fakeReply);
			expect(spyHandleError).toHaveBeenCalledWith(
				fakeReq,
				fakeReply,
				testError,
			);
		});
	});

	describe('createFile', () => {
		it('should create the file and return with status 200 when header is provided', async () => {
			const fakeVideoFile = { fieldname: 'video', filename: 'video.mp4' };
			fakeReq = {
				user: { id: 'user-123' },
				headers: {
					'x-screenshots-time': '45',
				},
				file: jest.fn().mockResolvedValue(fakeVideoFile),
			};

			const file = new FileMockBuilder().withId('file-1').build();
			fileService.createFile.mockResolvedValue(file);

			await fileController.createFile(fakeReq, fakeReply);

			expect(fakeReq.file).toHaveBeenCalled();
			expect(fileService.createFile).toHaveBeenCalledWith(
				{ userId: 'user-123', screenshotsTime: 45 },
				fakeVideoFile,
			);
			expect(fakeReply.code).toHaveBeenCalledWith(StatusCodes.OK);
			expect(fakeReply.send).toHaveBeenCalledWith(file);
		});

		it('should create the file using default screenshotsTime (30) when header is missing', async () => {
			const fakeVideoFile = { fieldname: 'video', filename: 'video.mp4' };
			fakeReq = {
				user: { id: 'user-123' },
				headers: {},
				file: jest.fn().mockResolvedValue(fakeVideoFile),
			};

			const file = new FileMockBuilder().withId('file-2').build();
			fileService.createFile.mockResolvedValue(file);

			await fileController.createFile(fakeReq, fakeReply);

			expect(fileService.createFile).toHaveBeenCalledWith(
				{ userId: 'user-123', screenshotsTime: 30 },
				fakeVideoFile,
			);
			expect(fakeReply.code).toHaveBeenCalledWith(StatusCodes.OK);
			expect(fakeReply.send).toHaveBeenCalledWith(file);
		});

		it('should call handleError when an error occurs in createFile', async () => {
			const testError = new Error('Test error');
			fakeReq = {
				user: { id: 'user-123' },
				headers: { 'x-screenshots-time': '45' },
				file: jest.fn().mockRejectedValue(testError),
			};

			const spyHandleError = jest
				.spyOn(ErrorHandler, 'handleError')
				.mockImplementation((req, reply, error) => {
					reply.code(500).send({ error: error.message });
				});

			await fileController.createFile(fakeReq, fakeReply);
			expect(spyHandleError).toHaveBeenCalledWith(
				fakeReq,
				fakeReply,
				testError,
			);
		});
	});

	describe('updateFile', () => {
		it('should update the file and return with status 200', async () => {
			const updateData = { someField: 'someValue' };
			fakeReq = {
				params: { fileId: 'file-1' },
				body: updateData,
			};

			const file = new FileMockBuilder().withId('file-1').build();
			fileService.updateFile.mockResolvedValue(file);

			await fileController.updateFile(fakeReq, fakeReply);

			expect(fileService.updateFile).toHaveBeenCalledWith({
				...updateData,
				id: 'file-1',
			});
			expect(fakeReply.code).toHaveBeenCalledWith(StatusCodes.OK);
			expect(fakeReply.send).toHaveBeenCalledWith(file);
		});

		it('should call handleError when an error occurs in updateFile', async () => {
			const testError = new Error('Test error');
			fakeReq = {
				params: { fileId: 'file-1' },
				body: { someField: 'someValue' },
			};
			fileService.updateFile.mockRejectedValue(testError);

			const spyHandleError = jest
				.spyOn(ErrorHandler, 'handleError')
				.mockImplementation((req, reply, error) => {
					reply.code(500).send({ error: error.message });
				});

			await fileController.updateFile(fakeReq, fakeReply);
			expect(spyHandleError).toHaveBeenCalledWith(
				fakeReq,
				fakeReply,
				testError,
			);
		});
	});

	describe('getSignedUrl', () => {
		it('should redirect to the signed URL returned by the service', async () => {
			fakeReq = { params: { fileId: 'file-1' } };
			const signedUrl = 'http://signed-url.com';
			fileService.getSignedUrl.mockResolvedValue(signedUrl);

			await fileController.getSignedUrl(fakeReq, fakeReply);

			expect(fileService.getSignedUrl).toHaveBeenCalledWith('file-1');
			expect(fakeReply.redirect).toHaveBeenCalledWith(signedUrl);
		});

		it('should call handleError when an error occurs in getSignedUrl', async () => {
			const testError = new Error('Test error');
			fakeReq = { params: { fileId: 'file-1' } };
			fileService.getSignedUrl.mockRejectedValue(testError);

			const spyHandleError = jest
				.spyOn(ErrorHandler, 'handleError')
				.mockImplementation((req, reply, error) => {
					reply.code(500).send({ error: error.message });
				});

			await fileController.getSignedUrl(fakeReq, fakeReply);
			expect(spyHandleError).toHaveBeenCalledWith(
				fakeReq,
				fakeReply,
				testError,
			);
		});
	});

	describe('deleteFile', () => {
		it('should delete the file and return with status 200', async () => {
			fakeReq = { params: { fileId: 'file-1' } };
			fileService.deleteFile.mockResolvedValue(undefined);

			await fileController.deleteFile(fakeReq, fakeReply);

			expect(fileService.deleteFile).toHaveBeenCalledWith('file-1');
			expect(fakeReply.code).toHaveBeenCalledWith(StatusCodes.OK);
			expect(fakeReply.send).toHaveBeenCalled();
		});

		it('should call handleError when an error occurs in deleteFile', async () => {
			const testError = new Error('Test error');
			fakeReq = { params: { fileId: 'file-1' } };
			fileService.deleteFile.mockRejectedValue(testError);

			const spyHandleError = jest
				.spyOn(ErrorHandler, 'handleError')
				.mockImplementation((req, reply, error) => {
					reply.code(500).send({ error: error.message });
				});

			await fileController.deleteFile(fakeReq, fakeReply);
			expect(spyHandleError).toHaveBeenCalledWith(
				fakeReq,
				fakeReply,
				testError,
			);
		});
	});
});
