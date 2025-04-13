import { InvalidFileException } from '@exceptions/invalidFileException';
import { MultipartFile } from '@fastify/multipart';
import { CreateFileParams, UpdateFileParams } from '@ports/input/file';
import { FileService } from '@src/core/application/services';

import { FileMockBuilder } from '../../../../mocks/file.mock-builder';

describe('FileService', () => {
	let fileRepository: any;
	let simpleStorageService: any;
	let simpleQueueService: any;
	let notificationService: any;
	let fileService: FileService;

	beforeEach(() => {
		fileRepository = {
			getFileById: jest.fn(),
			getFilesByUserId: jest.fn(),
			createFile: jest.fn(),
			getFileByIdOrThrow: jest.fn(),
			updateFile: jest.fn(),
			deleteFile: jest.fn(),
		};

		simpleStorageService = {
			uploadVideo: jest.fn(),
			getSignedUrl: jest.fn(),
			deleteFile: jest.fn(),
		};

		simpleQueueService = {
			publishMessage: jest.fn(),
		};

		notificationService = {
			createNotification: jest.fn(),
		};

		fileService = new FileService(
			fileRepository,
			simpleStorageService,
			simpleQueueService,
			notificationService
		);
	});

	describe('getFileById', () => {
		it('should return the file when found', async () => {
			const file = new FileMockBuilder()
				.withId('file-1')
				.withUserId('user-1')
				.build();
			fileRepository.getFileById.mockResolvedValue(file);

			const result = await fileService.getFileById('file-1');

			expect(fileRepository.getFileById).toHaveBeenCalledWith('file-1');
			expect(result).toEqual(file);
		});
	});

	describe('getFilesByUserId', () => {
		it("should return the user's file list when found", async () => {
			const file1 = new FileMockBuilder()
				.withId('file-1')
				.withUserId('user-1')
				.build();
			const file2 = new FileMockBuilder()
				.withId('file-2')
				.withUserId('user-1')
				.build();
			fileRepository.getFilesByUserId.mockResolvedValue([file1, file2]);

			const result = await fileService.getFilesByUserId('user-1');

			expect(fileRepository.getFilesByUserId).toHaveBeenCalledWith('user-1');
			expect(result).toEqual([file1, file2]);
		});
	});

	describe('createFile', () => {
		const validCreateParams: CreateFileParams = {
			userId: 'user-1',
			screenshotsTime: 10,
		};
		const validVideoFile = { filename: 'video.mp4' } as MultipartFile;

		it('should throw an error if videoFile is undefined', async () => {
			await expect(
				fileService.createFile(validCreateParams, undefined)
			).rejects.toThrow(InvalidFileException);
		});

		it('should throw an error if screenshotsTime is lower than the minimum', async () => {
			const invalidParams = { ...validCreateParams, screenshotsTime: 0.05 };
			await expect(
				fileService.createFile(invalidParams, validVideoFile)
			).rejects.toThrow(InvalidFileException);
		});

		it('should throw an error if screenshotsTime is greater than the maximum', async () => {
			const invalidParams = { ...validCreateParams, screenshotsTime: 31 };
			await expect(
				fileService.createFile(invalidParams, validVideoFile)
			).rejects.toThrow(InvalidFileException);
		});

		it('should throw an error if video format is invalid', async () => {
			const invalidVideoFile = { filename: 'video.txt' } as MultipartFile;
			await expect(
				fileService.createFile(validCreateParams, invalidVideoFile)
			).rejects.toThrow(InvalidFileException);
		});

		it('should create the file and return the created file with status "initialized"', async () => {
			const mockVideoUrl = 'http://storage.url/video.mp4';
			const createdFile = new FileMockBuilder()
				.withId('file-1')
				.withUserId(validCreateParams.userId)
				.build();
			createdFile.videoUrl = mockVideoUrl;
			createdFile.status = 'initialized';

			simpleStorageService.uploadVideo.mockResolvedValue(mockVideoUrl);
			fileRepository.createFile.mockResolvedValue(createdFile);
			simpleQueueService.publishMessage.mockResolvedValue(undefined);

			const result = await fileService.createFile(
				validCreateParams,
				validVideoFile
			);

			expect(simpleStorageService.uploadVideo).toHaveBeenCalledWith(
				validCreateParams.userId,
				validVideoFile
			);
			expect(fileRepository.createFile).toHaveBeenCalled();
			expect(simpleQueueService.publishMessage).toHaveBeenCalledWith({
				fileName: validVideoFile.filename,
				fileStorageKey: mockVideoUrl || '',
				userId: validCreateParams.userId,
				fileId: createdFile.id,
				screenshotsTime: validCreateParams.screenshotsTime,
			});
			expect(result).toEqual(createdFile);
		});
	});

	describe('updateFile', () => {
		const validUpdateParams: UpdateFileParams = {
			id: 'file-1',
			userId: 'user-1',
			status: 'processed',
			compressedFileKey: 'compressed.jpg',
			userPhoneNumber: '123456789',
			fileId: 'file-1',
		};

		it('should update the file and trigger a notification', async () => {
			const existingFile = new FileMockBuilder()
				.withId('file-1')
				.withUserId('user-1')
				.build();
			const updatedFile = new FileMockBuilder()
				.withId('file-1')
				.withUserId('user-1')
				.build();
			updatedFile.imagesCompressedUrl = validUpdateParams.compressedFileKey;
			updatedFile.status = validUpdateParams.status;

			fileRepository.getFileByIdOrThrow.mockResolvedValue(existingFile);
			fileRepository.updateFile.mockResolvedValue(updatedFile);

			(fileService as any).getUserInternal = jest.fn().mockResolvedValue({
				username: 'testUser',
				email: 'user@test.com',
				phoneNumber: '123456789',
				id: 'user-1',
			});

			const result = await fileService.updateFile(validUpdateParams);

			expect(fileRepository.getFileByIdOrThrow).toHaveBeenCalledWith(
				validUpdateParams.id
			);
			expect(fileRepository.updateFile).toHaveBeenCalledWith(
				expect.objectContaining({
					id: validUpdateParams.id,
					imagesCompressedUrl: validUpdateParams.compressedFileKey,
					status: validUpdateParams.status,
				})
			);
			expect(notificationService.createNotification).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: existingFile.userId,
					userPhoneNumber: '123456789',
					fileStatus: validUpdateParams.status,
					fileId: existingFile.id,
					imagesCompressedUrl: updatedFile.imagesCompressedUrl,
				})
			);
			expect(result).toEqual(updatedFile);
		});
	});

	describe('getSignedUrl', () => {
		it('should return the signed URL for the given file', async () => {
			const file = new FileMockBuilder()
				.withId('file-1')
				.withUserId('user-1')
				.build();

			file.imagesCompressedUrl = 'compressed.jpg';
			fileRepository.getFileById.mockResolvedValue(file);

			const expectedPath = `${file.userId}/images/${file.imagesCompressedUrl}`;
			const expectedSignedUrl = 'http://signed.url';
			simpleStorageService.getSignedUrl.mockResolvedValue(expectedSignedUrl);

			const result = await fileService.getSignedUrl('file-1');

			expect(fileRepository.getFileById).toHaveBeenCalledWith('file-1');
			expect(simpleStorageService.getSignedUrl).toHaveBeenCalledWith(
				expectedPath
			);
			expect(result).toEqual(expectedSignedUrl);
		});
	});

	describe('deleteFile', () => {
		it('should delete the file and remove it from storage when the file exists', async () => {
			const file = new FileMockBuilder()
				.withId('file-1')
				.withUserId('user-1')
				.build();
			file.imagesCompressedUrl = 'compressed.jpg';
			fileRepository.getFileById.mockResolvedValue(file);
			fileRepository.deleteFile.mockResolvedValue(undefined);
			simpleStorageService.deleteFile.mockResolvedValue(undefined);

			await fileService.deleteFile('file-1');

			expect(fileRepository.getFileById).toHaveBeenCalledWith('file-1');
			expect(fileRepository.deleteFile).toHaveBeenCalledWith('file-1');
			expect(simpleStorageService.deleteFile).toHaveBeenCalledWith(
				`${file.userId}/images/${file.imagesCompressedUrl}`
			);
		});

		it('should throw an error if the file is not found', async () => {
			fileRepository.getFileById.mockResolvedValue(null);
			await expect(fileService.deleteFile('non-existent-file')).rejects.toThrow(
				InvalidFileException
			);
		});
	});
});
