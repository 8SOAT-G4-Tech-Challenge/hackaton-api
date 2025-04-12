import { ConverterInfoDto } from '@application/dtos/converterInfoDto';
import logger from '@common/logger';
import { AwsSimpleQueue } from '@ports/output/awsSimpleQueue';

export class SimpleQueueService {
	private readonly awsSimpleQueue;

	constructor(awsSimpleQueue: AwsSimpleQueue) {
		this.awsSimpleQueue = awsSimpleQueue;
	}

	async publishMessage(data: ConverterInfoDto): Promise<void> {
		logger.info('[SQS SERVICE] Publishing messages');
		return this.awsSimpleQueue.publishMessage(data);
	}
}
