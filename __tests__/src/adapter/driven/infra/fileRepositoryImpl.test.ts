import { toFileDTO } from '@application/dtos/fileDto';
import { prisma } from '@driven/infra/lib/prisma';
import { InvalidFileException } from '@exceptions/invalidFileException';
import { Decimal } from '@prisma/client/runtime/library';
import { FileRepositoryImpl } from '@src/adapter/driven/infra';
import { StatusEnum } from '@src/core/application/enumerations/statusEnum';

import { FileMockBuilder } from '../../../../mocks/file.mock-builder';

const fail = (message?: string): never => {
	throw new Error(message || 'Test failed');
};

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
		jest.resetAllMocks();
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
				videoUrl: fileMock.videoUrl ?? '',
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
				videoUrl: fileMock.videoUrl ?? '',
				imagesCompressedUrl: fileMock.imagesCompressedUrl ?? null,
				screenshotsTime: new Decimal(fileMock.screenshotsTime),
			};

			(prisma.file.findUnique as jest.Mock).mockResolvedValue(fileMockWithId);

			const result = await repository.getFileByIdOrThrow('file-1');

			expect(result).toEqual(toFileDTO(fileMockWithId));
		});

		it('should throw InvalidFileException when file is not found', async () => {
			(prisma.file.findUnique as jest.Mock).mockResolvedValue(null);

			const rejectedFunction = async () => {
				await repository.getFileByIdOrThrow('non-existent-id');
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown an InvalidFileException');
			} catch (error: any) {
				expect(error).toBeInstanceOf(InvalidFileException);
				expect(error.message).toBe('File with id non-existent-id not found.');
			}
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
				videoUrl: file1.videoUrl ?? '',
				imagesCompressedUrl: file1.imagesCompressedUrl ?? null,
				screenshotsTime: new Decimal(file1.screenshotsTime),
			};

			const file2WithId = {
				...file2,
				id: file2.id!,
				videoUrl: file2.videoUrl ?? '',
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
				videoUrl: fileData.videoUrl ?? '',
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
				videoUrl: fileData.videoUrl ?? '',
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
					videoUrl: '',
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
