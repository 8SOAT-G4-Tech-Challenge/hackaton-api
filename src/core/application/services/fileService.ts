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

	async getFiles(): Promise<File[]> {
		logger.info('[FILE SERVICE] Listing files');
		const files: File[] = await this.fileRepository.getFiles();
		return files;
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
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await this.fileRepository.createFile(fileToCreate);

		logger.info('[FILE SERVICE] File created');

		await this.simpleQueueService.publishMessage({
			fileName: videoFile.filename,
			fileStorageKey: videoUrl || '',
			userId: createFileParams.userId,
		});

		return fileToCreate;
	}

	async updateFile(updateFileParams: UpdateFileParams): Promise<File> {
		const existingFile = await this.fileRepository.getFileByIdOrThrow(
			updateFileParams.id
		);
		await this.fileRepository.getFileByUserIdOrThrow(updateFileParams.userId);

		logger.info('[FILE SERVICE] Updating file...');
		const fileToUpdate: File = {
			id: existingFile.id,
			userId: existingFile.userId,
			videoUrl: existingFile.videoUrl,
			createdAt: existingFile.createdAt,
			imagesCompressedUrl: updateFileParams.compressedFileKey,
			status: updateFileParams.status,
			updatedAt: new Date(),
		};

		const fileUpdated = await this.fileRepository.updateFile(fileToUpdate);

		const createNotificationParams: CreateNotificationParams = {
			userId: existingFile.userId,
			userPhoneNumber: updateFileParams.userPhoneNumber,
			fileStatus: existingFile.status,
			fileId: existingFile.id,
			imagesCompressedUrl: fileUpdated.imagesCompressedUrl,
		};

		this.notificationService.createNotification(createNotificationParams);

		return fileUpdated;
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
