import { StatusType } from '@domain/types/statusType';

export class ConvertionNotificationDto {
	status: StatusType;

	compressedFileKey?: string;

	userId: string;

	constructor(
		status: StatusType,
		userId: string,
		compressedFileKey: string = ''
	) {
		this.status = status;
		this.compressedFileKey = compressedFileKey;
		this.userId = userId;
	}
}
