import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { handleError } from '@driver/errorHandler';
import { FileService } from '@src/core/application/services';
import logger from '@src/core/common/logger';
import { File } from '@src/core/domain/models/file';

import { FileDto } from '../schemas/fileSchema';

export class FileController {
	private readonly fileService;

	constructor(fileService: FileService) {
		this.fileService = fileService;
	}

	async getFiles(req: FastifyRequest, reply: FastifyReply) {
		try {
			logger.info('[FILE CONTROLLER] Listing files');
			const files: File[] = await this.fileService.getFiles();
			reply.code(StatusCodes.OK).send(files);
		} catch (error) {
			handleError(req, reply, error);
		}
	}

	async getFileById(
		req: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply
	) {
		try {
			const { id } = req.params;
			logger.info(`[FILE CONTROLLER] Listing file by ID: ${id}`);
			const file: File | null = await this.fileService.getFileById(id);

			if (!file) {
				reply.code(StatusCodes.NOT_FOUND).send({
					error: 'Not Found',
					message: 'File not found',
				});
				return;
			}

			reply.code(StatusCodes.OK).send(file);
		} catch (error) {
			handleError(req, reply, error);
		}
	}

	async getFilesByUserId(
		req: FastifyRequest<{ Params: { userId: string } }>,
		reply: FastifyReply
	) {
		try {
			const { userId } = req.params;
			logger.info(`[FILE CONTROLLER] Listing files by user ID: ${userId}`);
			const files: File[] = await this.fileService.getFilesByUserId(userId);
			reply.code(StatusCodes.OK).send(files);
		} catch (error) {
			handleError(req, reply, error);
		}
	}

	async processVideoFile(
		req: FastifyRequest<{ Body: FileDto }>,
		reply: FastifyReply
	) {
		try {
			logger.info('[FILE CONTROLLER] Processing video file...');
			const videoFile = req.body;
			const createdFile = await this.fileService.processVideoFile(videoFile);
			logger.info(`[FILE CONTROLLER] File processed: ${createdFile.id}`);
			reply.code(StatusCodes.CREATED).send(createdFile);
		} catch (error) {
			handleError(req, reply, error);
		}
	}
}
