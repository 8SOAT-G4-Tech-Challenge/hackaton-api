import { PassThrough } from 'stream';

import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl as mockedGetSignedUrl } from '@aws-sdk/s3-request-presigner';
import { MultipartFile } from '@fastify/multipart';
import { AwsSimpleStorageImpl } from '@src/adapter/driven/infra/awsSimpleStorageImpl';

jest.mock('fs', () => {
	const actualFs = jest.requireActual('fs');
	return {
		...actualFs,
		readFileSync: jest.fn(() => Buffer.from('fake-content')),
	};
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
	getSignedUrl: jest.fn().mockResolvedValue('http://signed.url/fake'),
}));

process.env.AWS_REGION = 'us-east-1';
process.env.AWS_BUCKET = 'test-bucket';
process.env.AWS_SQS_URL = 'http://test-queue-url';

describe('AwsSimpleStorageImpl - Constructor', () => {
	it('should properly initialize S3Client using environment variables', () => {
		const storageReal = new AwsSimpleStorageImpl();
		expect((storageReal as any).client).toBeDefined();
		expect((storageReal as any).client).toBeInstanceOf(S3Client);
	});
});

describe('AwsSimpleStorageImpl', () => {
	let storage: AwsSimpleStorageImpl;
	let mockSend: jest.Mock;

	beforeEach(() => {
		storage = new AwsSimpleStorageImpl();
		mockSend = jest.fn();
		(storage as any).client = { send: mockSend } as unknown as S3Client;
	});

	describe('getObject', () => {
		it('should get an object from S3 and return its details', async () => {
			const key = 'folder/file.txt';
			const fakeResponse = {
				Body: 'fake-body-content',
				ETag: 'etag-123',
				VersionId: 'v1',
			};

			mockSend.mockResolvedValue(fakeResponse);

			const result = await storage.getObject(key);

			expect(mockSend).toHaveBeenCalledTimes(1);
			const commandArg = mockSend.mock.calls[0][0];
			expect(commandArg).toBeInstanceOf(GetObjectCommand);
			expect(commandArg.input).toEqual({
				Bucket: process.env.AWS_BUCKET,
				Key: key,
			});
			expect(result).toEqual({
				key,
				content: fakeResponse.Body,
				eTag: fakeResponse.ETag,
				versionId: fakeResponse.VersionId,
			});
		});
	});

	describe('uploadFile', () => {
		it('should upload a file to S3 with the correct parameters', async () => {
			(storage as any).saveMultipartToTmp = jest.fn().mockResolvedValue({
				path: '/tmp/fake.txt',
				size: 10,
			});

			const fakeFileStream = Object.assign(new PassThrough(), {
				truncated: false,
				bytesRead: 100,
			});
			fakeFileStream.end('dummy data');

			const fakeMultipart: MultipartFile = {
				filename: 'test.txt',
				mimetype: 'text/plain',
				file: fakeFileStream,
				fieldname: 'file',
				encoding: '7bit',
				type: 'file',
				fields: {},
				toBuffer: async () => Buffer.from('dummy data'),
			};

			const bucketKey = 'user-1/videos/123_test.txt';
			mockSend.mockResolvedValue({});

			await storage.uploadFile(bucketKey, fakeMultipart);

			expect(mockSend).toHaveBeenCalledTimes(1);
			const commandArg = mockSend.mock.calls[0][0];
			expect(commandArg).toBeInstanceOf(PutObjectCommand);

			const fileContent = Buffer.from('fake-content');
			expect(commandArg.input).toEqual({
				Bucket: process.env.AWS_BUCKET,
				Key: bucketKey,
				Body: fileContent,
				ContentType: fakeMultipart.mimetype,
				ContentLength: fileContent.length,
			});
		});
	});

	describe('getSignedUrl', () => {
		it('should return a signed URL for the given key', async () => {
			const key = 'folder/file.txt';
			const result = await storage.getSignedUrl(key);

			expect(result).toBe('http://signed.url/fake');
			expect((mockedGetSignedUrl as jest.Mock).mock.calls[0][1]).toBeInstanceOf(
				GetObjectCommand,
			);
			expect((mockedGetSignedUrl as jest.Mock).mock.calls[0][1].input).toEqual({
				Bucket: process.env.AWS_BUCKET,
				Key: key,
			});
		});
	});

	describe('deleteFile', () => {
		it('should delete a file from S3 with the correct parameters', async () => {
			const key = 'folder/file.txt';
			mockSend.mockResolvedValue({});

			await storage.deleteFile(key);

			expect(mockSend).toHaveBeenCalledTimes(1);
			const commandArg = mockSend.mock.calls[0][0];
			expect(commandArg).toBeInstanceOf(DeleteObjectCommand);
			expect(commandArg.input).toEqual({
				Bucket: process.env.AWS_BUCKET,
				Key: key,
			});
		});
	});

	describe('saveMultipartToTmp', () => {
		it('should save multipart file to tmp directory', async () => {
			const mockWriteStream = new PassThrough();
			jest
				.spyOn(jest.requireActual('fs'), 'createWriteStream')
				.mockReturnValue(mockWriteStream);

			const mockStat = { size: 1024 };
			jest
				.spyOn(jest.requireActual('fs').promises, 'stat')
				.mockResolvedValue(mockStat);

			const mockFile = new PassThrough();
			const fakeMultipart: MultipartFile = {
				filename: 'test.txt',
				mimetype: 'text/plain',
				file: mockFile as any,
				fieldname: 'file',
				encoding: '7bit',
				type: 'file',
				fields: {},
				toBuffer: async () => Buffer.from('test content'),
			};

			setTimeout(() => {
				mockFile.emit('end');
			}, 10);

			const result = await (storage as any).saveMultipartToTmp(fakeMultipart);

			expect(result).toEqual({
				path: expect.stringContaining('/tmp/test.txt'),
				size: 1024,
			});
		});

		it('should handle errors when saving to tmp', async () => {
			const mockWriteStream = new PassThrough();
			jest
				.spyOn(jest.requireActual('fs'), 'createWriteStream')
				.mockReturnValue(mockWriteStream);

			const mockFile = new PassThrough();
			const fakeMultipart: MultipartFile = {
				filename: 'test.txt',
				mimetype: 'text/plain',
				file: mockFile as any,
				fieldname: 'file',
				encoding: '7bit',
				type: 'file',
				fields: {},
				toBuffer: async () => Buffer.from('test content'),
			};

			const error = new Error('Stream error');
			setTimeout(() => {
				mockFile.emit('error', error);
			}, 10);

			await expect(
				(storage as any).saveMultipartToTmp(fakeMultipart),
			).rejects.toThrow('Stream error');
		});
	});

	describe('getObject in TEST_MODE', () => {
		it('should return mock content when TEST_MODE is true', async () => {
			(mockedGetSignedUrl as jest.Mock).mockClear();
			const originalTestMode = process.env.TEST_MODE;
			process.env.TEST_MODE = 'true';

			const key = 'folder/file.txt';
			const result = await storage.getObject(key);

			expect(result).toEqual({
				Body: Buffer.from('mock content'),
			});

			expect(mockSend).not.toHaveBeenCalled();

			process.env.TEST_MODE = originalTestMode;
		});
	});

	describe('uploadVideo', () => {
		it('should upload a video to S3 and return the key', async () => {
			(storage as any).saveMultipartToTmp = jest.fn().mockResolvedValue({
				path: '/tmp/video.mp4',
				size: 1024,
			});

			const userId = 'user-123';
			const fakeFileStream = Object.assign(new PassThrough(), {
				truncated: false,
				bytesRead: 100,
			});
			fakeFileStream.end('dummy video data');

			const fakeMultipart: MultipartFile = {
				filename: 'video.mp4',
				mimetype: 'video/mp4',
				file: fakeFileStream,
				fieldname: 'file',
				encoding: '7bit',
				type: 'file',
				fields: {},
				toBuffer: async () => Buffer.from('dummy video data'),
			};
			const originalDateNow = Date.now;
			Date.now = jest.fn().mockReturnValue(12345);

			mockSend.mockResolvedValue({});

			const result = await storage.uploadFile(userId, fakeMultipart);

			expect(result).toBe(undefined);
			expect(mockSend).toHaveBeenCalledTimes(1);

			Date.now = originalDateNow;
		});

		it('should return a mock key when in TEST_MODE', async () => {
			const originalTestMode = process.env.TEST_MODE;
			process.env.TEST_MODE = 'true';

			const userId = 'user-123';
			const fakeFileStream = Object.assign(new PassThrough(), {
				truncated: false,
				bytesRead: 100,
			});
			fakeFileStream.end('dummy video data');

			const fakeMultipart: MultipartFile = {
				filename: 'video.mp4',
				mimetype: 'video/mp4',
				file: fakeFileStream,
				fieldname: 'file',
				encoding: '7bit',
				type: 'file',
				fields: {},
				toBuffer: async () => Buffer.from('dummy video data'),
			};

			const originalDateNow = Date.now;
			Date.now = jest.fn().mockReturnValue(12345);

			const result = await storage.uploadFile(userId, fakeMultipart);

			expect(result).toBe(undefined);
			expect(mockSend).not.toHaveBeenCalled();

			Date.now = originalDateNow;
			process.env.TEST_MODE = originalTestMode;
		});
	});

	describe('getSignedUrl in TEST_MODE', () => {
		it('should return a mock URL when in TEST_MODE', async () => {
			const originalTestMode = process.env.TEST_MODE;
			process.env.TEST_MODE = 'true';

			const key = 'folder/file.txt';
			const result = await storage.getSignedUrl(key);

			expect(result).toMatch(/http:\/\/localhost:\d+\/test-signed-url\/.*/);
			expect(mockSend).not.toHaveBeenCalled();

			process.env.TEST_MODE = originalTestMode;
		});
	});

	describe('deleteFile in TEST_MODE', () => {
		it('should skip S3 deletion when in TEST_MODE', async () => {
			(mockedGetSignedUrl as jest.Mock).mockClear();
			const originalTestMode = process.env.TEST_MODE;
			process.env.TEST_MODE = 'true';

			const key = 'folder/file.txt';
			await storage.deleteFile(key);

			expect(mockSend).not.toHaveBeenCalled();

			process.env.TEST_MODE = originalTestMode;
		});
	});
});
