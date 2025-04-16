import { Decimal } from '@prisma/client/runtime/library';

import { toFileDTO } from '../../../../../src/core/application/dtos/fileDto';
import { StatusType } from '../../../../../src/core/domain/types/statusType';

describe('FileDto', () => {
	it('should convert PrismaFile to File DTO with numeric screenshotsTime', () => {
		const screenshotsTime = new Decimal(10.5);
		const prismaFile = {
			id: 'file-123',
			userId: 'user-456',
			videoUrl: 'path/to/video.mp4',
			imagesCompressedUrl: 'path/to/images.zip',
			screenshotsTime,
			status: 'processed' as StatusType,
			createdAt: new Date('2023-01-01'),
			updatedAt: new Date('2023-01-02'),
		};

		// Act
		const fileDto = toFileDTO(prismaFile);

		expect(fileDto).toEqual({
			...prismaFile,
			screenshotsTime: 10.5,
		});
		expect(typeof fileDto.screenshotsTime).toBe('number');
	});

	it('should handle null or undefined screenshotsTime by returning 0', () => {
		const prismaFile = {
			id: 'file-123',
			userId: 'user-456',
			videoUrl: 'path/to/video.mp4',
			imagesCompressedUrl: null,
			screenshotsTime: null as unknown as Decimal,
			status: 'initialized' as StatusType,
			createdAt: new Date('2023-01-01'),
			updatedAt: new Date('2023-01-01'),
		};

		const fileDto = toFileDTO(prismaFile);

		expect(fileDto.screenshotsTime).toBe(0);
	});

	it('should preserve all other properties from the prisma file', () => {
		const now = new Date();
		const screenshotsTime = new Decimal(5);
		const prismaFile = {
			id: 'unique-id',
			userId: 'user-789',
			videoUrl: 'url/to/video.mp4',
			imagesCompressedUrl: 'url/to/images.zip',
			screenshotsTime,
			status: 'processing' as StatusType,
			createdAt: now,
			updatedAt: now,
		};

		const fileDto = toFileDTO(prismaFile);

		expect(fileDto.id).toBe(prismaFile.id);
		expect(fileDto.userId).toBe(prismaFile.userId);
		expect(fileDto.videoUrl).toBe(prismaFile.videoUrl);
		expect(fileDto.imagesCompressedUrl).toBe(prismaFile.imagesCompressedUrl);
		expect(fileDto.status).toBe(prismaFile.status);
		expect(fileDto.createdAt).toBe(prismaFile.createdAt);
		expect(fileDto.updatedAt).toBe(prismaFile.updatedAt);
	});
});
