import { prisma } from '@driven/infra/lib/prisma';
import { FileRepository } from '@ports/repository/fileRepository';
import { File } from '@src/core/domain/models/file';

export class FileRepositoryImpl implements FileRepository {
	async getFiles(): Promise<File[]> {
		const files = await prisma.file.findMany({
			select: {
				createdAt: true,
				id: true,
				imagesCompressedUrl: true,
				status: true,
				updatedAt: true,
				userId: true,
				videoUrl: true,
			},
		});

		return files;
	}

	async getFileById(id: string): Promise<File | null> {
		const file = await prisma.file.findUnique({
			where: { id },
			select: {
				createdAt: true,
				id: true,
				imagesCompressedUrl: true,
				status: true,
				updatedAt: true,
				userId: true,
				videoUrl: true,
			},
		});

		return file;
	}

	async getFilesByUserId(userId: string): Promise<File[]> {
		const files = await prisma.file.findMany({
			where: { userId },
			select: {
				createdAt: true,
				id: true,
				imagesCompressedUrl: true,
				status: true,
				updatedAt: true,
				userId: true,
				videoUrl: true,
			},
		});

		return files;
	}

	async createFile(file: File): Promise<File> {
		const createdFile = await prisma.file.create({
			data: file,
		});

		return createdFile;
	}
}
