import { StatusType } from '../types/statusType';

export interface File {
	id?: string;
	userId: string;
	videoUrl: string;
	imagesCompressedUrl?: string | null | undefined;
	status: StatusType;
	createdAt: Date;
	updatedAt: Date;
}
