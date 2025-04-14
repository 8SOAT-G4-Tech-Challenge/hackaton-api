import { Decimal } from '@prisma/client/runtime/library';
import { File } from '@src/core/domain/models/file';
import { StatusType } from '@src/core/domain/types/statusType';

type PrismaFile = {
	id: string;
	userId: string;
	videoUrl: string | null;
	imagesCompressedUrl: string | null;
	screenshotsTime: Decimal;
	status: StatusType;
	createdAt: Date;
	updatedAt: Date;
};

export function toFileDTO(prismaFile: PrismaFile): File {
	return {
		...prismaFile,
		screenshotsTime: prismaFile?.screenshotsTime
			? Number(prismaFile.screenshotsTime)
			: 0,
	};
}
