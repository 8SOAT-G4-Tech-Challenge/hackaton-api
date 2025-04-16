import { ConverterInfoDto } from '@application/dtos/converterInfoDto';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import logger from '@common/logger';
import { AwsSimpleQueue } from '@ports/output/awsSimpleQueue';

export class AwsSimpleQueueImpl implements AwsSimpleQueue {
	private readonly client = new SQSClient({ region: process.env.AWS_REGION });

	async publishMessage(message: ConverterInfoDto): Promise<any> {
		if (process.env.TEST_MODE === 'true') {
			logger.info(`[TEST MODE] Sending message ${JSON.stringify(message)}`);
			return Promise.resolve();
		}
		logger.info(
			`[SQS SERVICE] Sending message ${JSON.stringify(message)} to queue: ${
				process.env.AWS_SQS_URL
			}`,
		);
		const input = {
			QueueUrl: process.env.AWS_SQS_URL,
			MessageBody: JSON.stringify(message),
		};
		const command = new SendMessageCommand(input);

		return this.client.send(command);
	}
}
