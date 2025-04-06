import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import logger from '@src/core/common/logger';

export class SmsService {
	private client: SNSClient;

	constructor() {
		const region = process.env.AWS_REGION;
		this.client = new SNSClient({ region });
	}

	async sendSms(phoneNumber: string, message: string): Promise<void> {
		logger.info('[SMS SERVICE] Sending SMS...');
		const command = new PublishCommand({
			Message: message,
			PhoneNumber: phoneNumber,
		});

		try {
			const response = await this.client.send(command);
			logger.info(`[SMS SERVICE] SMS sent successfully: ${response}`);
		} catch (error) {
			logger.error(`[SMS SERVICE] Error sending SMS: ${error}`);
			throw error;
		}
	}
}
