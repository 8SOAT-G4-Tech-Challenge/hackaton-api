import { MultipartFile } from '@fastify/multipart';

export interface AwsSimpleStorage {
	getObject(key: string): Promise<any>;
	uploadFile(key: string, file: MultipartFile): Promise<void>;
}
