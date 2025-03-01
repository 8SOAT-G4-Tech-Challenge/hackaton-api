import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { handleError } from '@driver/errorHandler';
import { CreateFileParams } from '@src/core/application/ports/input/file';
import { FileService } from '@src/core/application/services';
import logger from '@src/core/common/logger';
import { File } from '@src/core/domain/models/file';

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

	// eslint-disable-next-line consistent-return
	async processVideoFile(
		req: FastifyRequest<{ Body: CreateFileParams }>,
		reply: FastifyReply
	) {
		try {
			logger.info('[FILE CONTROLLER] Processing video file...');

			const data = await req.file();

			if (!data || !data.filename) {
				return await reply.status(400).send({ message: 'No file uploaded' });
			}

			const fileBuffer = await data.toBuffer();
			const originalFilename = data.filename;

			const createdFile = await this.fileService.processVideoFile(
				fileBuffer,
				originalFilename
			);

			logger.info(`[FILE CONTROLLER] File processed: ${createdFile.id}`);
			reply.code(StatusCodes.CREATED).send(createdFile);
		} catch (error) {
			handleError(req, reply, error);
		}
	}
}
