import * as fs from 'fs';
import path from 'path';

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

	async uploadFile(bucketKey: string, file: MultipartFile): Promise<void> {
		const tempFile = await this.saveMultipartToTmp(file);

		const client = new S3Client({ region: process.env.AWS_REGION });
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
			`[BUCKET SERVICE] Uploading file ${file.filename} to AWS bucket ${bucket}: ${bucketKey}`
		);
		const command = new PutObjectCommand(input);
		await client.send(command);
		logger.info(`[BUCKET SERVICE] Successfully uploaded file ${bucketKey}`);
	}

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
}
