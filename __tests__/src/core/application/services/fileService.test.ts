import {
	CognitoIdentityProviderClient,
	ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { InvalidFileException } from '@exceptions/invalidFileException';
import { MultipartFile } from '@fastify/multipart';
import { CreateFileParams, UpdateFileParams } from '@ports/input/file';
import { FileService } from '@src/core/application/services/fileService';

import { FileMockBuilder } from '../../../../mocks/file.mock-builder';

jest.mock('@aws-sdk/client-cognito-identity-provider', () => {
	const originalModule = jest.requireActual(
		'@aws-sdk/client-cognito-identity-provider',
	);

	return {
		__esModule: true,
		...originalModule,
		CognitoIdentityProviderClient: jest.fn(() => ({
			send: jest.fn(),
		})),
		ListUsersCommand: jest.fn(),
	};
});

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
			notificationService,
		);
	});

	describe('createFile', () => {
		const validCreateParams: CreateFileParams = {
			userId: 'user-1',
			screenshotsTime: 10,
		};
		const validVideoFile = { filename: 'video.mp4' } as MultipartFile;

		it('should throw an error if videoFile is undefined', async () => {
			const rejectedFunction = async () => {
				await fileService.createFile(validCreateParams, undefined);
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown an InvalidFileException');
			} catch (error: any) {
				expect(error).toBeInstanceOf(InvalidFileException);
				expect(error.message).toBe('videoFile não é válido.');
			}
		});

		it('should throw an error if screenshotsTime is lower than the minimum', async () => {
			const invalidParams = { ...validCreateParams, screenshotsTime: 0.05 };
			const rejectedFunction = async () => {
				await fileService.createFile(invalidParams, validVideoFile);
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown an InvalidFileException');
			} catch (error: any) {
				expect(error).toBeInstanceOf(InvalidFileException);
				expect(error.message).toBe(
					'Screenshot Time deve ser entre 0.1 e 30 segundos',
				);
			}
		});

		it('should throw an error if screenshotsTime is greater than the maximum', async () => {
			const invalidParams = { ...validCreateParams, screenshotsTime: 31 };
			const rejectedFunction = async () => {
				await fileService.createFile(invalidParams, validVideoFile);
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown an InvalidFileException');
			} catch (error: any) {
				expect(error).toBeInstanceOf(InvalidFileException);
				expect(error.message).toBe(
					'Screenshot Time deve ser entre 0.1 e 30 segundos',
				);
			}
		});

		it('should throw an error if video format is invalid', async () => {
			const invalidVideoFile = { filename: 'video.txt' } as MultipartFile;
			const rejectedFunction = async () => {
				await fileService.createFile(validCreateParams, invalidVideoFile);
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown an InvalidFileException');
			} catch (error: any) {
				expect(error).toBeInstanceOf(InvalidFileException);
				const expectedPattern =
					/Invalid video format\.\s+Current format: txt\.\s+Allowed formats: mp4, mov, mkv, avi, wmv, webm/;
				expect(error.message).toMatch(expectedPattern);
			}
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
				validVideoFile,
			);

			expect(simpleStorageService.uploadVideo).toHaveBeenCalledWith(
				validCreateParams.userId,
				validVideoFile,
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
				validUpdateParams.id,
			);
			expect(fileRepository.updateFile).toHaveBeenCalledWith(
				expect.objectContaining({
					id: validUpdateParams.id,
					imagesCompressedUrl: validUpdateParams.compressedFileKey,
					status: validUpdateParams.status,
				}),
			);
			expect(notificationService.createNotification).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: existingFile.userId,
					userPhoneNumber: '123456789',
					fileStatus: validUpdateParams.status,
					fileId: existingFile.id,
					imagesCompressedUrl: updatedFile.imagesCompressedUrl,
				}),
			);
			expect(result).toEqual(updatedFile);
		});

		it('should throw an error if getUserInternal fails', async () => {
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

			(fileService as any).getUserInternal = jest
				.fn()
				.mockRejectedValue(new Error('Usuário não encontrado'));

			await expect(fileService.updateFile(validUpdateParams)).rejects.toThrow(
				'Usuário não encontrado',
			);
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
				expectedPath,
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
				`${file.userId}/images/${file.imagesCompressedUrl}`,
			);
		});

		it('should throw an error if the file is not found', async () => {
			fileRepository.getFileById.mockResolvedValue(null);

			const rejectedFunction = async () => {
				await fileService.deleteFile('non-existent-file');
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown an InvalidFileException');
			} catch (error: any) {
				expect(error).toBeInstanceOf(InvalidFileException);
			}
		});
	});

	describe('getUserInternal', () => {
		let mockCognitoSend: jest.Mock;

		beforeEach(() => {
			mockCognitoSend = jest.fn();
			(CognitoIdentityProviderClient as jest.Mock).mockImplementation(() => ({
				send: mockCognitoSend,
			}));

			(ListUsersCommand as unknown as jest.Mock).mockImplementation(
				(params) => ({
					...params,
				}),
			);

			process.env.AWS_REGION = 'us-east-1';
			process.env.USER_POOL_ID = 'test-user-pool';
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		it('should return user details when user exists', async () => {
			const userId = 'user-123';
			const mockResponse = {
				Users: [
					{
						Username: 'testuser',
						Attributes: [
							{ Name: 'email', Value: 'test@example.com' },
							{ Name: 'phone_number', Value: '+1234567890' },
							{ Name: 'sub', Value: userId },
						],
					},
				],
			};
			mockCognitoSend.mockResolvedValue(mockResponse);

			const result = await (fileService as any).getUserInternal(userId);

			expect(ListUsersCommand).toHaveBeenCalledWith({
				UserPoolId: 'test-user-pool',
				Filter: `sub = "${userId}"`,
				Limit: 1,
			});
			expect(mockCognitoSend).toHaveBeenCalled();
			expect(result).toEqual({
				username: 'testuser',
				email: 'test@example.com',
				phoneNumber: '+1234567890',
				id: userId,
			});
		});

		it('should throw an error when user is not found', async () => {
			const userId = 'nonexistent-user';
			mockCognitoSend.mockResolvedValue({
				Users: [],
			});

			await expect(
				(fileService as any).getUserInternal(userId),
			).rejects.toThrow('Usuário não encontrado');
			expect(ListUsersCommand).toHaveBeenCalledWith({
				UserPoolId: 'test-user-pool',
				Filter: `sub = "${userId}"`,
				Limit: 1,
			});
		});

		it('should throw an error when Users property is undefined', async () => {
			const userId = 'user-123';
			mockCognitoSend.mockResolvedValue({});

			await expect(
				(fileService as any).getUserInternal(userId),
			).rejects.toThrow('Usuário não encontrado');
		});

		it('should handle missing user attributes gracefully', async () => {
			const userId = 'user-123';
			const mockResponse = {
				Users: [
					{
						Username: 'testuser',
						Attributes: [],
					},
				],
			};
			mockCognitoSend.mockResolvedValue(mockResponse);

			const result = await (fileService as any).getUserInternal(userId);

			expect(result).toEqual({
				username: 'testuser',
				email: undefined,
				phoneNumber: undefined,
				id: undefined,
			});
		});

		it('should mock getUserInternal in TEST_MODE', async () => {
			const originalTestMode = process.env.TEST_MODE;
			process.env.TEST_MODE = 'true';

			const userId = 'test-user-id';

			const result = await (fileService as any).getUserInternal(userId);

			expect(result).toEqual({
				username: 'test-user',
				email: 'test@example.com',
				phoneNumber: '+5511999999999',
				id: userId,
			});

			expect(mockCognitoSend).not.toHaveBeenCalled();

			process.env.TEST_MODE = originalTestMode;
		});

		it('should handle Cognito API errors', async () => {
			const userId = 'user-123';
			const errorMessage = 'API Error';
			mockCognitoSend.mockRejectedValue(new Error(errorMessage));

			await expect(
				(fileService as any).getUserInternal(userId),
			).rejects.toThrow(errorMessage);
		});
	});

	describe('createFile in TEST_MODE', () => {
		beforeEach(() => {
			fileRepository = {
				createFile: jest.fn(),
				getFileById: jest.fn(),
			};
			simpleStorageService = {
				uploadVideo: jest.fn().mockResolvedValue('mocked-video-url'),
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
				notificationService,
			);

			jest
				.spyOn(fileService as any, 'validateVideoFormat')
				.mockImplementation(() => {});
		});

		it('should mock file creation and skip queue when TEST_MODE is true', async () => {
			const originalTestMode = process.env.TEST_MODE;
			process.env.TEST_MODE = 'true';

			const originalDateNow = Date.now;
			Date.now = jest.fn().mockReturnValue(12345);

			const createParams: CreateFileParams = {
				userId: 'test-user-123',
				screenshotsTime: 10,
			};

			const fakeFile: MultipartFile = {
				filename: 'test-video.mp4',
				mimetype: 'video/mp4',
				file: {} as any,
				fieldname: 'file',
				encoding: '7bit',
				type: 'file',
				fields: {},
				toBuffer: async () => Buffer.from('test'),
			};

			const result = await fileService.createFile(createParams, fakeFile);

			expect(fileRepository.createFile).not.toHaveBeenCalled();

			expect(simpleQueueService.publishMessage).not.toHaveBeenCalled();

			expect(result.id).toBe('mock-file-id-12345');
			expect(result.userId).toBe('test-user-123');

			process.env.TEST_MODE = originalTestMode;
			Date.now = originalDateNow;
		});

		it('should call repository and queue service when TEST_MODE is false', async () => {
			const originalTestMode = process.env.TEST_MODE;
			process.env.TEST_MODE = 'false';

			const createParams: CreateFileParams = {
				userId: 'test-user-123',
				screenshotsTime: 10,
			};

			const fakeFile: MultipartFile = {
				filename: 'test-video.mp4',
				mimetype: 'video/mp4',
				file: {} as any,
				fieldname: 'file',
				encoding: '7bit',
				type: 'file',
				fields: {},
				toBuffer: async () => Buffer.from('test'),
			};

			const createdFile = {
				id: 'real-db-id',
				userId: 'test-user-123',
				videoUrl: 'mocked-video-url',
				imagesCompressedUrl: null,
				status: 'initialized',
				screenshotsTime: 10,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			fileRepository.createFile.mockResolvedValue(createdFile);

			const result = await fileService.createFile(createParams, fakeFile);

			expect(fileRepository.createFile).toHaveBeenCalled();

			expect(simpleQueueService.publishMessage).toHaveBeenCalledWith({
				fileName: 'test-video.mp4',
				fileStorageKey: 'mocked-video-url',
				userId: 'test-user-123',
				fileId: 'real-db-id',
				screenshotsTime: 10,
			});

			expect(result).toBe(createdFile);

			process.env.TEST_MODE = originalTestMode;
		});

		it('should still call uploadVideo even in TEST_MODE', async () => {
			const originalTestMode = process.env.TEST_MODE;
			process.env.TEST_MODE = 'true';

			const createParams: CreateFileParams = {
				userId: 'test-user-123',
				screenshotsTime: 10,
			};

			const fakeFile: MultipartFile = {
				filename: 'test-video.mp4',
				mimetype: 'video/mp4',
				file: {} as any,
				fieldname: 'file',
				encoding: '7bit',
				type: 'file',
				fields: {},
				toBuffer: async () => Buffer.from('test'),
			};

			await fileService.createFile(createParams, fakeFile);

			expect(simpleStorageService.uploadVideo).toHaveBeenCalledWith(
				'test-user-123',
				fakeFile,
			);

			process.env.TEST_MODE = originalTestMode;
		});
	});
});
