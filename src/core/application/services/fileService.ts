import {
	CognitoIdentityProviderClient,
	ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import logger from '@common/logger';
import { File } from '@domain/models/file';
import { InvalidFileException } from '@exceptions/invalidFileException';
import { MultipartFile } from '@fastify/multipart';
import { CreateFileParams, UpdateFileParams } from '@ports/input/file';
import { CreateNotificationParams } from '@ports/input/notification';
import { FileRepository } from '@ports/repository/fileRepository';
import { NotificationService } from '@services/notificationService';
import { SimpleQueueService } from '@services/simpleQueueService';
import { SimpleStorageService } from '@services/simpleStorageService';

export class FileService {
	private readonly fileRepository;

	private readonly simpleStorageService;

	private readonly simpleQueueService;

	private readonly notificationService;

	private minimumScreenshotsTime = 0.1;

	private maximumScreenshotsTime = 30;

	constructor(
		fileRepository: FileRepository,
		simpleStorageService: SimpleStorageService,
		simpleQueueService: SimpleQueueService,
		notificationService: NotificationService
	) {
		this.fileRepository = fileRepository;
		this.simpleStorageService = simpleStorageService;
		this.simpleQueueService = simpleQueueService;
		this.notificationService = notificationService;
	}

	private async getUserInternal(userId: string) {
		const cognitoClient = new CognitoIdentityProviderClient({
			region: process.env.AWS_REGION,
		});

		const command = new ListUsersCommand({
			UserPoolId: process.env.USER_POOL_ID,
			Filter: `sub = "${userId}"`,
			Limit: 1,
		});

		const response = await cognitoClient.send(command);

		if (!response.Users || response.Users.length === 0) {
			throw new Error('Usuário não encontrado');
		}

		const user = response.Users[0];

		return {
			username: user.Username,
			email: user.Attributes?.find((prop) => prop.Name === 'email')?.Value,
			phoneNumber: user.Attributes?.find((prop) => prop.Name === 'phone_number')
				?.Value,
			id: user.Attributes?.find((prop) => prop.Name === 'sub')?.Value,
		};
	}

	async getFileById(id: string): Promise<File | null> {
		logger.info(`[FILE SERVICE] Listing file by ID: ${id}`);
		const file: File | null = await this.fileRepository.getFileById(id);
		return file;
	}

	async getFilesByUserId(userId: string): Promise<File[]> {
		logger.info(`[FILE SERVICE] Listing files by user ID: ${userId}`);
		const files: File[] = await this.fileRepository.getFilesByUserId(userId);
		return files;
	}

	async createFile(
		createFileParams: CreateFileParams,
		videoFile: MultipartFile | undefined
	): Promise<File> {
		if (!videoFile) {
			logger.info('[FILE SERVICE] videoFile is null or undefined');
			throw new InvalidFileException('videoFile não é válido.');
		}

		if (
			createFileParams.screenshotsTime < this.minimumScreenshotsTime ||
			createFileParams.screenshotsTime > this.maximumScreenshotsTime
		) {
			logger.info(
				`[FILE SERVICE] screenshotsTime inválido: ${createFileParams.screenshotsTime}`
			);
			throw new InvalidFileException(
				`Screenshot Time deve ser entre ${this.minimumScreenshotsTime} e ${this.maximumScreenshotsTime} segundos`
			);
		}

		this.validateVideoFormat(videoFile.filename);

		logger.info('[FILE SERVICE] Uploading video...');
		const videoUrl = await this.simpleStorageService.uploadVideo(
			createFileParams.userId,
			videoFile
		);

		logger.info('[FILE SERVICE] Creating file...');
		const fileToCreate: File = {
			userId: createFileParams.userId,
			videoUrl,
			imagesCompressedUrl: null,
			status: 'initialized',
			screenshotsTime: createFileParams.screenshotsTime,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const createdFile = await this.fileRepository.createFile(fileToCreate);

		logger.info('[FILE SERVICE] File created');

		await this.simpleQueueService.publishMessage({
			fileName: videoFile.filename,
			fileStorageKey: videoUrl || '',
			userId: createFileParams.userId,
			fileId: createdFile?.id || '',
			screenshotsTime: createFileParams.screenshotsTime,
		});

		return fileToCreate;
	}

	async updateFile(updateFileParams: UpdateFileParams): Promise<File> {
		logger.info(`[FILE SERVICE] Getting file by id: ${updateFileParams.id}`);
		const existingFile = await this.fileRepository.getFileByIdOrThrow(
			updateFileParams.id
		);

		logger.info(`[FILE SERVICE] Updating file by id: ${updateFileParams.id}`);
		const fileToUpdate: Partial<File> = {
			id: updateFileParams.id,
			imagesCompressedUrl: updateFileParams?.compressedFileKey || '',
			status: updateFileParams.status,
			updatedAt: new Date(),
		};

		const fileUpdated = await this.fileRepository.updateFile(fileToUpdate);

		logger.info('[FILE SERVICE] File updated successfully');
		const user = await this.getUserInternal(updateFileParams.userId);

		const createNotificationParams: CreateNotificationParams = {
			userId: existingFile.userId,
			userPhoneNumber: user.phoneNumber || '',
			fileStatus: updateFileParams.status,
			fileId: existingFile.id,
			imagesCompressedUrl: fileUpdated.imagesCompressedUrl,
		};

		this.notificationService.createNotification(createNotificationParams);

		return fileUpdated;
	}

	async getSignedUrl(fileId: string): Promise<string> {
		logger.info(`[FILE SERVICE] Signing url for file ${fileId}`);

		const file = await this.fileRepository.getFileById(fileId);

		const signedUrl = await this.simpleStorageService.getSignedUrl(
			`${file?.userId}/images/${file?.imagesCompressedUrl}`
		);

		return signedUrl;
	}

	async deleteFile(fileId: string): Promise<void> {
		logger.info(`[FILE SERVICE] Deleting file ${fileId}`);

		await this.fileRepository.deleteFile(fileId);
	}

	private validateVideoFormat(fileName: string): void {
		logger.info('[FILE SERVICE] Validating video format...');

		const allowedFormats = ['mp4', 'mov', 'mkv', 'avi', 'wmv', 'webm'];
		const fileExtension = fileName.split('.').pop()?.toLowerCase();

		if (!fileExtension || !allowedFormats.includes(fileExtension)) {
			throw new InvalidFileException(
				`Invalid video format.
				Current format: ${fileExtension}.
				Allowed formats: ${allowedFormats.join(', ')}`
			);
		}
	}
}
