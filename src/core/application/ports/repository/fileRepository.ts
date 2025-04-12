import { File } from '@src/core/domain/models/file';

export interface FileRepository {
	getFileById(id: string): Promise<File | null>;
	getFileByIdOrThrow(id: string): Promise<File>;
	getFileByUserIdOrThrow(id: string): Promise<File>;
	getFilesByUserId(id: string): Promise<File[]>;
	createFile(file: File): Promise<File>;
	updateFile(file: Partial<File>): Promise<File>;
	deleteFile(fileId: string): Promise<void>;
}
