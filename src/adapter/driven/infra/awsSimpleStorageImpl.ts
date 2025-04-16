import * as fs from 'fs';
import path from 'path';

import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import logger from '@common/logger';
import { MultipartFile } from '@fastify/multipart';
import { AwsSimpleStorage } from '@ports/output/awsSimpleStorage';

export class AwsSimpleStorageImpl implements AwsSimpleStorage {
	private readonly client = new S3Client({ region: process.env.AWS_REGION });

	private async saveMultipartToTmp(file: MultipartFile) {
		const tmpPath = path.join('/tmp', file.filename);
		const writeStream = fs.createWriteStream(tmpPath);

		await new Promise((resolve, reject) => {
			file.file.pipe(writeStream);
			file.file.on('end', resolve);
			file.file.on('error', reject);
		});

		const stats = await fs.promises.stat(tmpPath);

		return {
			path: tmpPath,
			size: stats.size,
		};
	}

	async getObject(key: string): Promise<any> {
		if (process.env.TEST_MODE === 'true') {
			logger.info(`[TEST MODE] Getting object file ${key}`);
			return { Body: Buffer.from('mock content') };
		}

		const bucket = process.env.AWS_BUCKET;

		const input = {
			Bucket: bucket,
			Key: key,
		};
		logger.info(
			`[BUCKET SERVICE] Getting object ${key} from AWS bucket ${bucket}`,
		);
		const command = new GetObjectCommand(input);
		const response = await this.client.send(command);
		logger.info(`[BUCKET SERVICE] Successfully obtained object ${key}`);
		return {
			key,
			content: response?.Body,
			eTag: response?.ETag,
			versionId: response?.VersionId,
		};
	}

	async uploadFile(bucketKey: string, file: MultipartFile): Promise<void> {
		if (process.env.TEST_MODE === 'true') {
			const key = bucketKey;
			logger.info(`[TEST MODE] Successfully uploaded file ${key}`);
			return;
		}
		const tempFile = await this.saveMultipartToTmp(file);

		const bucket = process.env.AWS_BUCKET;

		const fileContent = fs.readFileSync(tempFile.path);

		const input = {
			Bucket: bucket,
			Key: bucketKey,
			Body: fileContent,
			ContentType: file.mimetype,
			ContentLength: fileContent.length,
		};

		logger.info(
			`[BUCKET SERVICE] Uploading file ${file.filename} to AWS bucket ${bucket}: ${bucketKey}`,
		);
		const command = new PutObjectCommand(input);
		await this.client.send(command);
		logger.info(`[BUCKET SERVICE] Successfully uploaded file ${bucketKey}`);
	}

	async getSignedUrl(key: string): Promise<string> {
		if (process.env.TEST_MODE === 'true') {
			logger.info(`[TEST MODE] Get signed URL for ${key}`);
			return `http://localhost:3333/test-signed-url/${key}`;
		}

		const signedUrl = await getSignedUrl(
			this.client,
			new GetObjectCommand({
				Bucket: process.env.AWS_BUCKET,
				Key: key,
			}),
			{ expiresIn: 60 * 60 },
		);

		return signedUrl;
	}

	async deleteFile(key: string): Promise<void> {
		if (process.env.TEST_MODE === 'true') {
			logger.info(`[TEST MODE] Successfully deleted file ${key}`);
			return;
		}

		const bucket = process.env.AWS_BUCKET;

		const input = {
			Bucket: bucket,
			Key: key,
		};

		const command = new DeleteObjectCommand(input);
		await this.client.send(command);
	}
}
