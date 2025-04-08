import { StatusType } from '../types/statusType';

export interface File {
	id?: string;
	userId: string;
	videoUrl?: string | null;
	imagesCompressedUrl?: string | null;
	status: StatusType;
	createdAt: Date;
	updatedAt: Date;
}
