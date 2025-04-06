import { MultipartFile } from '@fastify/multipart';

export interface AwsSimpleStorage {
	getObject(key: string): Promise<any>;
	uploadFile(userId: string, key: string, file: MultipartFile): Promise<void>;
}
