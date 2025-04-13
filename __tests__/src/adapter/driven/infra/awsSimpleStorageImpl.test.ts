jest.mock('fs', () => {
    const actualFs = jest.requireActual('fs');
    return {
        ...actualFs,
        readFileSync: jest.fn(() => Buffer.from('fake-content')),
    };
});

import { PassThrough } from 'stream';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { MultipartFile } from '@fastify/multipart';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: jest.fn().mockResolvedValue('http://signed.url/fake'),
}));
import { getSignedUrl as mockedGetSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AwsSimpleStorageImpl } from '@src/adapter/driven/infra/awsSimpleStorageImpl';

process.env.AWS_REGION = 'us-east-1';
process.env.AWS_BUCKET = 'test-bucket';
process.env.AWS_SQS_URL = 'http://test-queue-url';

describe('AwsSimpleStorageImpl', () => {
    let storage: AwsSimpleStorageImpl;
    let mockSend: jest.Mock;

    beforeEach(() => {
        storage = new AwsSimpleStorageImpl();
        mockSend = jest.fn();
        storage['client'] = { send: mockSend } as unknown as S3Client;
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

            const bucketKey = `user-1/videos/123_test.txt`;
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

            expect((mockedGetSignedUrl as jest.Mock).mock.calls[0][1]).toBeInstanceOf(GetObjectCommand);
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
});
