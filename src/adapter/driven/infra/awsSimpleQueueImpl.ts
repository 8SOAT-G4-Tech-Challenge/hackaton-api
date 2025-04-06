import { ConverterInfoDto } from '@application/dtos/converterInfoDto';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import logger from '@common/logger';
import { AwsSimpleQueue } from '@ports/output/awsSimpleQueue';

export class AwsSimpleQueueImpl implements AwsSimpleQueue {
	async publishMessage(message: ConverterInfoDto): Promise<any> {
		logger.info(
			`[SQS SERVICE] Sending message ${JSON.stringify(message)} to queue: ${
				process.env.AWS_SQS_URL
			}`
		);
		const client = new SQSClient({ region: process.env.AWS_REGION });
		const input = {
			QueueUrl: process.env.AWS_SQS_URL,
			MessageBody: JSON.stringify(message),
		};
		const command = new SendMessageCommand(input);

		return client.send(command);
	}
}
