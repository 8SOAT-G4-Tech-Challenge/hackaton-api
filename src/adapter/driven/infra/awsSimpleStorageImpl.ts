import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
} from '@aws-sdk/client-s3';
import logger from '@common/logger';
import { MultipartFile } from '@fastify/multipart';
import { AwsSimpleStorage } from '@ports/output/awsSimpleStorage';

export class AwsSimpleStorageImpl implements AwsSimpleStorage {
	async getObject(key: string): Promise<any> {
		const bucket = process.env.AWS_BUCKET;
		const client = new S3Client({ region: process.env.AWS_REGION });
		const input = {
			Bucket: bucket,
			Key: key,
		};
		logger.info(
			`[BUCKET SERVICE] Getting object ${key} from AWS bucket ${bucket}`
		);
		const command = new GetObjectCommand(input);
		const response = await client.send(command);
		logger.info(`[BUCKET SERVICE] Successfully obtained object ${key}`);
		return {
			key,
			content: response?.Body,
			eTag: response?.ETag,
			versionId: response?.VersionId,
		};
	}

	async uploadFile(
		userId: string,
		key: string,
		file: MultipartFile
	): Promise<void> {
		const client = new S3Client({ region: process.env.AWS_REGION });
		const bucket = process.env.AWS_BUCKET;

		const input = {
			Bucket: bucket,
			Key: `${userId}/videos/${key}`,
			Body: file.file,
			ContentType: file.mimetype,
		};

		logger.info(
			`[BUCKET SERVICE] Uploading file ${key} to AWS bucket ${bucket}: ${key}`
		);
		const command = new PutObjectCommand(input);
		await client.send(command);
		logger.info(`[BUCKET SERVICE] Successfully uploaded file ${key}`);
	}
}
