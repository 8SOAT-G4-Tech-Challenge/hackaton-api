import { ConverterInfoDto } from '@application/dtos/converterInfoDto';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { AwsSimpleQueueImpl } from '@src/adapter/driven/infra/awsSimpleQueueImpl';

describe('AwsSimpleQueueImpl', () => {
	let queueImpl: AwsSimpleQueueImpl;
	let mockSend: jest.Mock;

	beforeEach(() => {
		process.env.AWS_SQS_URL = 'http://test-queue-url';
		process.env.AWS_REGION = 'us-east-1';

		queueImpl = new AwsSimpleQueueImpl();

		mockSend = jest.fn();
		(queueImpl as any).client = { send: mockSend } as unknown as SQSClient;
	});

	it('should send the correct command with the provided ConverterInfoDto', async () => {
		const message: ConverterInfoDto = {
			fileName: 'video.mp4',
			fileStorageKey: 'some-storage-key',
			userId: 'user-1',
			fileId: 'file-1',
			screenshotsTime: 10,
		};

		const expectedInput = {
			QueueUrl: process.env.AWS_SQS_URL,
			MessageBody: JSON.stringify(message),
		};

		const fakeResponse = { MessageId: '12345' };
		mockSend.mockResolvedValue(fakeResponse);

		const result = await queueImpl.publishMessage(message);

		expect(mockSend).toHaveBeenCalledTimes(1);
		const commandArg = mockSend.mock.calls[0][0];
		expect(commandArg).toBeInstanceOf(SendMessageCommand);
		expect(commandArg.input).toEqual(expectedInput);
		expect(result).toEqual(fakeResponse);
	});

	it('should propagate errors when send fails', async () => {
		const message: ConverterInfoDto = {
			fileName: 'video.mp4',
			fileStorageKey: 'some-storage-key',
			userId: 'user-1',
			fileId: 'file-1',
			screenshotsTime: 10,
		};

		const error = new Error('SQS failure');
		mockSend.mockRejectedValue(error);

		await expect(queueImpl.publishMessage(message)).rejects.toThrowError(
			'SQS failure'
		);
	});
});
