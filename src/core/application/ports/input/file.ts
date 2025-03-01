import { MultipartFile } from '@fastify/multipart';

export type MultipartFileBuffer = MultipartFile & { buffer: Buffer };

export type CreateFileParams = {
	videoFile: MultipartFileBuffer;
};
