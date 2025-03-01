import logger from '@src/core/common/logger';
import { File } from '@src/core/domain/models/file';

import { FileRepository } from '../ports/repository/fileRepository';
import { fileHelper } from '../utils/fileHelper';
import { videoHelper } from '../utils/videoHelper';

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

	async processVideoFile(
		fileBuffer: Buffer,
		originalFilename: string
	): Promise<File> {
		const videoFilePath = fileHelper.saveFile(fileBuffer, originalFilename);
		logger.info(`[FILE SERVICE] Video file saved at: ${videoFilePath}`);

		try {
			const imageFiles = await videoHelper.extractImages(videoFilePath);
			logger.info(`[FILE SERVICE] Extracted ${imageFiles.length} images`);

			if (imageFiles.length === 0) {
				throw new Error('No images were extracted from the video');
			}

			const zipFilePath = await fileHelper.createZip(imageFiles);
			logger.info(`[FILE SERVICE] ZIP created at: ${zipFilePath}`);

			fileHelper.deleteFile(videoFilePath);

			const fileToCreate: File = {
				userId: '83ddd6e4-dbb0-46f0-b818-a6b70827bdab',
				imagesCompressedUrl: zipFilePath,
				videoUrl: videoFilePath,
				createdAt: new Date(),
				updatedAt: new Date(),
				status: 'processed',
			};

			const fileCreated = await this.fileRepository.createFile(fileToCreate);
			logger.info(`[FILE SERVICE] File created with ID: ${fileCreated.id}`);

			return fileCreated;
		} catch (error) {
			logger.error('[FILE SERVICE] Error processing video');
			logger.error(error);
			fileHelper.deleteFile(videoFilePath);
			throw new Error('Error processing video file');
		}
	}
}
