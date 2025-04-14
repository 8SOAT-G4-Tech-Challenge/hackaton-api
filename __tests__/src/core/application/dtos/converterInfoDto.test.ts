import { ConverterInfoDto } from '../../../../../src/core/application/dtos/converterInfoDto';

describe('ConverterInfoDto', () => {
	it('should create an instance with the correct properties', () => {
		const converterInfoData = {
			fileName: 'video.mp4',
			fileStorageKey: 'storage-key-123',
			userId: 'user-1',
			fileId: 'file-1',
			screenshotsTime: 10,
		};

		const dto = new ConverterInfoDto(converterInfoData);

		expect(dto).toBeInstanceOf(ConverterInfoDto);
		expect(dto.fileName).toBe(converterInfoData.fileName);
		expect(dto.fileStorageKey).toBe(converterInfoData.fileStorageKey);
		expect(dto.userId).toBe(converterInfoData.userId);
		expect(dto.fileId).toBe(converterInfoData.fileId);
		expect(dto.screenshotsTime).toBe(converterInfoData.screenshotsTime);
	});

	it('should correctly copy the properties from a given object', () => {
		const inputData = {
			fileName: 'example.txt',
			fileStorageKey: 'example-key',
			userId: 'user-123',
			fileId: 'file-123',
			screenshotsTime: 5,
		};

		const dto = new ConverterInfoDto(inputData);

		expect(dto.fileName).toEqual(inputData.fileName);
		expect(dto.fileStorageKey).toEqual(inputData.fileStorageKey);
		expect(dto.userId).toEqual(inputData.userId);
		expect(dto.fileId).toEqual(inputData.fileId);
		expect(dto.screenshotsTime).toEqual(inputData.screenshotsTime);
	});
});
