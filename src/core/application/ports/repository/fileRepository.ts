import { File } from '@src/core/domain/models/file';

export interface FileRepository {
	getFiles(): Promise<File[]>;
	getFileById(id: string): Promise<File | null>;
	getFilesByUserId(id: string): Promise<File[]>;
	createFile(file: File): Promise<File>;
	updateFile(file: File): Promise<File>;
}
