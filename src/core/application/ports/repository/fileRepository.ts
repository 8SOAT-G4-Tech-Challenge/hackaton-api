import { File } from '@src/core/domain/models/file';

export interface FileRepository {
	getFiles(): Promise<File[]>;
	getFileById(id: string): Promise<File | null>;
	getFilesByUserId(email: string): Promise<File[]>;
}
