import { MultipartFile } from '@fastify/multipart';
import { SimpleStorageService } from '@src/core/application/services/simpleStorageService';

describe('SimpleStorageService', () => {
	let awsSimpleStorage: any;
	let simpleStorageService: SimpleStorageService;

	beforeEach(() => {
		awsSimpleStorage = {
			getObject: jest.fn(),
			uploadFile: jest.fn(),
			getSignedUrl: jest.fn(),
			deleteFile: jest.fn(),
		};

		simpleStorageService = new SimpleStorageService(awsSimpleStorage);
	});

	describe('getVideo', () => {
		it('should call awsSimpleStorage.getObject with the provided key and return its value', async () => {
			const key = 'user-1/videos/sample.mp4';
			const videoData = { data: 'fake-video-data' };

			awsSimpleStorage.getObject.mockResolvedValue(videoData);

			const result = await simpleStorageService.getVideo(key);

			expect(awsSimpleStorage.getObject).toHaveBeenCalledWith(key);
			expect(result).toEqual(videoData);
		});
	});

	describe('uploadVideo', () => {
		it('should construct the correct bucket key, call uploadFile and return the bucket key', async () => {
			const userId = 'user-1';
			const videoFile = { filename: 'video.mp4' } as MultipartFile;
			const fixedTimestamp = 123456789;
			jest.spyOn(Date.prototype, 'getTime').mockReturnValue(fixedTimestamp);

			awsSimpleStorage.uploadFile.mockResolvedValue(undefined);

			const bucketKey = `${userId}/videos/${fixedTimestamp}_${videoFile.filename}`;
			const result = await simpleStorageService.uploadVideo(userId, videoFile);

			expect(awsSimpleStorage.uploadFile).toHaveBeenCalledWith(
				bucketKey,
				videoFile
			);
			expect(result).toBe(bucketKey);
		});
	});

	describe('getSignedUrl', () => {
		it('should call awsSimpleStorage.getSignedUrl with the provided key and return its value', async () => {
			const key = 'user-1/videos/sample.mp4';
			const signedUrl = 'http://signed.url';
			awsSimpleStorage.getSignedUrl.mockResolvedValue(signedUrl);

			const result = await simpleStorageService.getSignedUrl(key);

			expect(awsSimpleStorage.getSignedUrl).toHaveBeenCalledWith(key);
			expect(result).toBe(signedUrl);
		});
	});

	describe('deleteFile', () => {
		it('should call awsSimpleStorage.deleteFile with the provided key', async () => {
			const key = 'user-1/videos/sample.mp4';

			awsSimpleStorage.deleteFile.mockResolvedValue(undefined);

			await simpleStorageService.deleteFile(key);

			expect(awsSimpleStorage.deleteFile).toHaveBeenCalledWith(key);
		});
	});
});
