import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(__dirname, '../../driven/infra/storage/images');

export const videoHelper = {
	extractImages: async (videoFilePath: string): Promise<string[]> => {
		const duration = await videoHelper.getVideoDuration(videoFilePath);

		if (duration < 2) {
			throw new Error('Video is too short to extract images');
		}

		const timestamps = Array.from(
			{ length: Math.floor(duration / 2) },
			(_, i) => ((i + 1) * 2).toString()
		);

		return videoHelper.captureScreenshots(videoFilePath, timestamps);
	},

	getVideoDuration: (videoFilePath: string): Promise<number> =>
		new Promise((resolve, reject) => {
			ffmpeg.ffprobe(videoFilePath, (err, metadata) => {
				if (err) {
					reject(new Error('Failed to retrieve video metadata'));
				} else {
					resolve(metadata.format.duration || 0);
				}
			});
		}),

	captureScreenshots: (
		videoFilePath: string,
		timestamps: string[]
	): Promise<string[]> =>
		new Promise((resolve, reject) => {
			ffmpeg(videoFilePath)
				.screenshots({
					timestamps,
					folder: OUTPUT_DIR,
					filename: 'screenshot-%i.png',
				})
				.on('end', () => resolve(videoHelper.getExtractedImages()))
				.on('error', reject);
		}),

	getExtractedImages: (): string[] =>
		fs
			.readdirSync(OUTPUT_DIR)
			.filter((file: string) => file.startsWith('screenshot')),
};
