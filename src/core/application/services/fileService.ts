import { FileDto, fileSchema } from '@src/adapter/driver/schemas/fileSchema';
import logger from '@src/core/common/logger';
import { File } from '@src/core/domain/models/file';

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

	async processVideoFile(file: FileDto): Promise<File> {
		fileSchema.parse(file);

		logger.info('[FILE SERVICE] Processing file...');

		const fileCreatedMock: File = {
			id: '123',
			userId: '123',
			imagesCompressedUrl: 'https://example.com/image.jpg',
			videoUrl: 'https://example.com/video.mp4',
			createdAt: new Date(),
			updatedAt: new Date(),
			status: 'processed',
		};

		return fileCreatedMock;
	}
}
