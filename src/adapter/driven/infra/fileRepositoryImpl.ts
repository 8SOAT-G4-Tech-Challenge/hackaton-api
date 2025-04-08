import { prisma } from '@driven/infra/lib/prisma';
import { InvalidFileException } from '@exceptions/invalidFileException';
import { File } from '@models/file';
import { FileRepository } from '@ports/repository/fileRepository';

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

	async getFileByIdOrThrow(id: string): Promise<File> {
		const file = await this.getFileById(id);

		if (!file) {
			throw new InvalidFileException(`File with id ${id} not found.`);
		}

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

	async getFileByUserIdOrThrow(userId: string): Promise<File> {
		const file = await prisma.file.findFirstOrThrow({
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

		return file;
	}

	async createFile(file: File): Promise<File> {
		const createdFile = await prisma.file.create({
			data: { ...file, videoUrl: file?.videoUrl || '' },
		});

		return createdFile;
	}

	async updateFile(file: Partial<File>): Promise<File> {
		const updatedFile = await prisma.file.update({
			where: { id: file.id },
			data: { ...file, videoUrl: file?.videoUrl || '' },
		});

		return updatedFile;
	}
}
