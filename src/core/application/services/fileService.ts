import { MultipartFile } from '@fastify/multipart';
import logger from '@src/core/common/logger';
import { File } from '@src/core/domain/models/file';

import { InvalidFileException } from '../exceptions/invalidFileException';
import { CreateFileParams, UpdateFileParams } from '../ports/input/file';
import { FileRepository } from '../ports/repository/fileRepository';

export class FileService {
	private readonly fileRepository;

	constructor(fileRepository: FileRepository) {
		this.fileRepository = fileRepository;
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
		file: CreateFileParams,
		videoFile: MultipartFile | undefined
	): Promise<File> {
		if (!videoFile) {
			logger.info('[FILE SERVICE] videoFile is null or undefined');
			throw new InvalidFileException('videoFile não é válido.');
		}

		this.validateVideoFormat(videoFile.filename);

		logger.info('[FILE SERVICE] Creating file...');
		const fileToCreate: File = {
			userId: file.userId,
			videoUrl: null,
			imagesCompressedUrl: null,
			status: 'initialized',
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const createdFile: File = await this.fileRepository.createFile(
			fileToCreate
		);
		logger.info('[FILE SERVICE] File created');

		logger.info('[FILE SERVICE] Requesting hackaton-converter...');
		// Chamar o hackaton-converter enviando o videoUrl e o userId

		return createdFile;
	}

	async updateFile(fileParams: UpdateFileParams): Promise<File> {
		const existingFile = this.fileRepository.getFileById(fileParams.id);

		if (!existingFile) {
			throw new InvalidFileException(
				`Category Product with ID ${fileParams.id} not found.`
			);
		}

		// chamar o hackaton-sso para pegar o telefone do user
		// chamar o service de notification para envio do SMS

		logger.info('[FILE SERVICE] Updating file...');
		const fileToUpdate: File = {
			id: fileParams.id,
			userId: fileParams.userId,
			videoUrl: fileParams.videoFileKey,
			imagesCompressedUrl: fileParams.compressedFileKey,
			status: fileParams.status,
			updatedAt: new Date(),
		};

		const updatedFile: File = await this.fileRepository.updateFile(
			fileToUpdate
		);
		logger.info('[FILE SERVICE] File updated');
		return updatedFile;
	}

	private validateVideoFormat(fileName: string): void {
		logger.info('[FILE SERVICE] Validating video format');

		const allowedFormats = ['mp4', 'mov', 'mkv', 'avi', 'wmv', 'webm'];
		const fileExtension = fileName.split('.').pop()?.toLowerCase();

		if (!fileExtension || !allowedFormats.includes(fileExtension)) {
			logger.info(`[FILE SERVICE] invalid format: ${fileExtension}`);
			throw new InvalidFileException(
				`Invalid video format. Allowed formats: ${allowedFormats.join(', ')}`
			);
		}

		logger.info('[FILE SERVICE] Valid format');
	}
}
