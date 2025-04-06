import logger from '@common/logger';
import { MultipartFile } from '@fastify/multipart';
import { AwsSimpleStorage } from '@ports/output/awsSimpleStorage';

export class SimpleStorageService {
	private readonly awsSimpleStorage;

	constructor(awsSimpleStorage: AwsSimpleStorage) {
		this.awsSimpleStorage = awsSimpleStorage;
	}

	async getVideo(key: string): Promise<any> {
		logger.info(`[SIMPLE STORAGE SERVICE] Getting video ${key}`);
		return this.awsSimpleStorage.getObject(key);
	}

	async uploadVideo(userId: string, videoFile: MultipartFile): Promise<string> {
		logger.info(
			`[SIMPLE STORAGE SERVICE] Uploading video file ${videoFile.filename}`
		);
		const timestamp = new Date().getTime();
		const bucketKey = `${userId}/videos/${timestamp}_${videoFile.filename}`;

		await this.awsSimpleStorage.uploadFile(userId, bucketKey, videoFile);

		return bucketKey;
	}
}
