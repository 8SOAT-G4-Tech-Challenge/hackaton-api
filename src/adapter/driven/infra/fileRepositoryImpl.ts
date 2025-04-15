import { toFileDTO } from '@application/dtos/fileDto';
import { prisma } from '@driven/infra/lib/prisma';
import { InvalidFileException } from '@exceptions/invalidFileException';
import { File } from '@models/file';
import { FileRepository } from '@ports/repository/fileRepository';

export class FileRepositoryImpl implements FileRepository {
	async getFileById(id: string): Promise<File | null> {
		const file: any = await prisma.file.findUnique({
			where: { id },
		});

		if (!file) {
			return null;
		}

		return toFileDTO(file);
	}

	async getFileByIdOrThrow(id: string): Promise<File> {
		const file = await prisma.file.findUnique({
			where: { id },
		});

		if (!file) {
			throw new InvalidFileException(`File with id ${id} not found.`);
		}

		return {
			...file,
			screenshotsTime: Number(file.screenshotsTime),
		};
	}

	async getFilesByUserId(userId: string): Promise<File[]> {
		const files: any[] = await prisma.file.findMany({
			where: { userId },
		});

		return files.map(toFileDTO);
	}

	async createFile(file: File): Promise<File> {
		const createdFile: any = await prisma.file.create({
			data: { ...file, videoUrl: file?.videoUrl ?? '' },
		});

		return toFileDTO(createdFile);
	}

	async updateFile(file: Partial<File>): Promise<File> {
		const updatedFile: any = await prisma.file.update({
			where: { id: file.id },
			data: { ...file, videoUrl: file?.videoUrl ?? '' },
		});

		return toFileDTO(updatedFile);
	}

	async deleteFile(fileId: string): Promise<void> {
		await prisma.file.delete({
			where: { id: fileId },
		});
	}
}
