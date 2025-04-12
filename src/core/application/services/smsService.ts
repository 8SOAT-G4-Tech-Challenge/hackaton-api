import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import logger from '@common/logger';

export class SmsService {
	private client: SNSClient;

	constructor() {
		this.client = new SNSClient({ region: process.env.AWS_REGION });
	}

	async sendSms(phoneNumber: string, message: string): Promise<void> {
		logger.info(`[SMS SERVICE] Sending SMS to ${phoneNumber}`);
		const command = new PublishCommand({
			Message: message,
			PhoneNumber: phoneNumber,
		});

		try {
			await this.client.send(command);
			logger.info(`[SMS SERVICE] SMS sent successfully to ${phoneNumber}`);
		} catch (error) {
			logger.error(`[SMS SERVICE] Error sending SMS: ${JSON.stringify(error)}`);
			throw error;
		}
	}
}
