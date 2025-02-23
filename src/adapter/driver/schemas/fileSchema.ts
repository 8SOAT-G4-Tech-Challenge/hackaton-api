import { z } from 'zod';

const allowedVideoFormats = ['mp4', 'mov', 'wmv', 'avi', 'flv', 'mkv'];

export const fileSchema = z.object({
	videoFile: z.string().refine(
		(file) => {
			const extension = file.split('.').pop()?.toLowerCase();
			return extension && allowedVideoFormats.includes(extension);
		},
		{
			message:
				'Invalid video format. Allowed formats: MP4, MOV, WMV, AVI, FLV, MKV',
		}
	),
});

export type FileDto = z.infer<typeof fileSchema>;
