import { MultipartFile } from '@fastify/multipart';
import { StatusType } from '@src/core/domain/types/statusType';

export type MultipartFileBuffer = MultipartFile & { buffer: Buffer };

export type CreateFileParams = {
	userId: string;
};

export type UpdateFileParams = {
	id: string;
	userId: string;
	compressedFileKey: string;
	videoFileKey: string;
	status: StatusType;
};
