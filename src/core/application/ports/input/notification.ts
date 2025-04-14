import { StatusType } from '@src/core/domain/types/statusType';

export type CreateNotificationParams = {
	userPhoneNumber: string;
	userId: string;
	fileId: string | undefined;
	fileStatus: StatusType;
	imagesCompressedUrl?: string | null | undefined;
};
