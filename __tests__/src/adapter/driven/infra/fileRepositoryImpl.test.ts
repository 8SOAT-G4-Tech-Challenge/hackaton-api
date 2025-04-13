import { toFileDTO } from '@application/dtos/fileDto';
import { prisma } from '@driven/infra/lib/prisma';
import { InvalidFileException } from '@exceptions/invalidFileException';
import { Decimal } from '@prisma/client/runtime/library';
import { FileRepositoryImpl } from '@src/adapter/driven/infra';
import { StatusEnum } from '@src/core/application/enumerations/statusEnum';

import { FileMockBuilder } from '../../../../mocks/file.mock-builder';

jest.mock('@driven/infra/lib/prisma', () => ({
	prisma: {
		file: {
			findUnique: jest.fn(),
			findMany: jest.fn(),
			findFirstOrThrow: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
	},
}));

describe('FileRepositoryImpl', () => {
	let repository: FileRepositoryImpl;

	beforeEach(() => {
		repository = new FileRepositoryImpl();
		jest.clearAllMocks();
	});

	describe('getFileById', () => {
		it('should return a file when found', async () => {
			const fileMock = new FileMockBuilder()
				.withId('file-1')
				.withUserId('user-1')
				.withVideoUrl('http://mock.video.url/video.mp4')
				.build();

			const fileMockWithId = {
				...fileMock,
				id: fileMock.id!,
				videoUrl: fileMock.videoUrl ?? null,
				imagesCompressedUrl: fileMock.imagesCompressedUrl ?? null,
				screenshotsTime: new Decimal(fileMock.screenshotsTime),
			};

			(prisma.file.findUnique as jest.Mock).mockResolvedValue(fileMockWithId);

			const result = await repository.getFileById('file-1');

			expect(prisma.file.findUnique).toHaveBeenCalledWith({
				where: { id: 'file-1' },
			});
			expect(result).toEqual(toFileDTO(fileMockWithId));
		});

		it('should return null if file is not found', async () => {
			(prisma.file.findUnique as jest.Mock).mockResolvedValue(null);

			const result = await repository.getFileById('non-existent-id');

			expect(prisma.file.findUnique).toHaveBeenCalledWith({
				where: { id: 'non-existent-id' },
			});

			expect(result).toBeNull();
		});
	});

	describe('getFileByIdOrThrow', () => {
		it('should return a file when found', async () => {
			const fileMock = new FileMockBuilder()
				.withId('file-1')
				.withUserId('user-1')
				.withVideoUrl('http://mock.video.url/video.mp4')
				.build();

			const fileMockWithId = {
				...fileMock,
				id: fileMock.id!,
				videoUrl: fileMock.videoUrl ?? null,
				imagesCompressedUrl: fileMock.imagesCompressedUrl ?? null,
				screenshotsTime: new Decimal(fileMock.screenshotsTime),
			};

			(prisma.file.findUnique as jest.Mock).mockResolvedValue(fileMockWithId);

			const result = await repository.getFileByIdOrThrow('file-1');

			expect(result).toEqual(toFileDTO(fileMockWithId));
		});

		it('should throw InvalidFileException when file is not found', async () => {
			(prisma.file.findUnique as jest.Mock).mockResolvedValue(null);

			await expect(
				repository.getFileByIdOrThrow('non-existent-id')
			).rejects.toThrow(InvalidFileException);
		});
	});

	describe('getFilesByUserId', () => {
		it('should return files for the given userId', async () => {
			const file1 = new FileMockBuilder()
				.withId('file-1')
				.withUserId('user-1')
				.withVideoUrl('http://mock.video.url/video.mp4')
				.build();
			const file2 = new FileMockBuilder()
				.withId('file-2')
				.withUserId('user-1')
				.withVideoUrl('http://mock.video.url/video.mp4')
				.build();

			const file1WithId = {
				...file1,
				id: file1.id!,
				videoUrl: file1.videoUrl ?? null,
				imagesCompressedUrl: file1.imagesCompressedUrl ?? null,
				screenshotsTime: new Decimal(file1.screenshotsTime),
			};

			const file2WithId = {
				...file2,
				id: file2.id!,
				videoUrl: file2.videoUrl ?? null,
				imagesCompressedUrl: file2.imagesCompressedUrl ?? null,
				screenshotsTime: new Decimal(file2.screenshotsTime),
			};

			(prisma.file.findMany as jest.Mock).mockResolvedValue([
				file1WithId,
				file2WithId,
			]);

			const result = await repository.getFilesByUserId('user-1');

			expect(prisma.file.findMany).toHaveBeenCalledWith({
				where: { userId: 'user-1' },
			});
			expect(result).toEqual([toFileDTO(file1WithId), toFileDTO(file2WithId)]);
		});
	});

	describe('getFileByUserIdOrThrow', () => {
		it('should return the first file for the given userId', async () => {
			const fileFromPrisma = new FileMockBuilder()
				.withId('file-1')
				.withUserId('user-1')
				.withVideoUrl('http://mock.video.url/video.mp4')
				.build();
			const fileWithId = {
				...fileFromPrisma,
				id: fileFromPrisma.id!,
				videoUrl: fileFromPrisma.videoUrl ?? null,
			};

			(prisma.file.findFirstOrThrow as jest.Mock).mockResolvedValue(fileWithId);

			const result = await repository.getFileByUserIdOrThrow('user-1');
			const expectedResult = {
				...fileWithId,
				screenshotsTime: Number(fileWithId.screenshotsTime),
			};

			expect(prisma.file.findFirstOrThrow).toHaveBeenCalledWith({
				where: { userId: 'user-1' },
				select: {
					createdAt: true,
					id: true,
					imagesCompressedUrl: true,
					screenshotsTime: true,
					status: true,
					updatedAt: true,
					userId: true,
					videoUrl: true,
				},
			});
			expect(result).toEqual(expectedResult);
		});
	});

	describe('createFile', () => {
		it('should create and return a file', async () => {
			const fileData = new FileMockBuilder()
				.withId('file-1')
				.withUserId('user-1')
				.withVideoUrl('http://mock.video.url/video.mp4')
				.build();

			const fileDataWithId = {
				...fileData,
				id: fileData.id!,
				videoUrl: fileData.videoUrl ?? null,
				imagesCompressedUrl: fileData.imagesCompressedUrl ?? null,
				screenshotsTime: new Decimal(fileData.screenshotsTime),
			};

			(prisma.file.create as jest.Mock).mockResolvedValue({
				...fileData,
				screenshotsTime: new Decimal(fileData.screenshotsTime),
			});

			const result = await repository.createFile(fileData);

			expect(prisma.file.create).toHaveBeenCalledWith({
				data: { ...fileData },
			});
			expect(result).toEqual(toFileDTO(fileDataWithId));
		});
	});

	describe('updateFile', () => {
		it('should update and return a file', async () => {
			const fileData = new FileMockBuilder()
				.withId('file-1')
				.withUserId('user-1')
				.withVideoUrl('http://mock.video.url/video.mp4')
				.build();

			const fileDataWithId = {
				...fileData,
				id: fileData.id!,
				videoUrl: fileData.videoUrl ?? null,
				imagesCompressedUrl: fileData.imagesCompressedUrl ?? null,
				screenshotsTime: new Decimal(fileData.screenshotsTime),
			};

			const updatedFile = { ...fileData, status: 'processed' };

			(prisma.file.update as jest.Mock).mockResolvedValue({
				...updatedFile,
				screenshotsTime: new Decimal(fileData.screenshotsTime),
			});

			const result = await repository.updateFile({
				id: fileData.id,
				status: StatusEnum.processed,
			});

			const updatedFileDataWithId = {
				...fileDataWithId,
				status: StatusEnum.processed,
			};

			expect(prisma.file.update).toHaveBeenCalledWith({
				where: { id: fileData.id },
				data: {
					id: fileData.id,
					status: StatusEnum.processed,
					videoUrl: null,
				},
			});

			expect(result).toEqual(toFileDTO(updatedFileDataWithId));
		});
	});

	describe('deleteFile', () => {
		it('should call delete on prisma with the given file id', async () => {
			(prisma.file.delete as jest.Mock).mockResolvedValue(undefined);

			await repository.deleteFile('file-1');

			expect(prisma.file.delete).toHaveBeenCalledWith({
				where: { id: 'file-1' },
			});
		});
	});
});
