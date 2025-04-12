import { MultipartFile } from '@fastify/multipart';
import { StatusType } from '@src/core/domain/types/statusType';

export type MultipartFileBuffer = MultipartFile & { buffer: Buffer };

export type CreateFileParams = {
	screenshotsTime: number;
	userId: string;
};

export type UpdateFileParams = {
	id: string;
	userId: string;
	userPhoneNumber: string;
	fileId: string;
	compressedFileKey: string;
	status: StatusType;
};
