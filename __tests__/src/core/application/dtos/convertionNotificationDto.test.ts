import { ConvertionNotificationDto } from '../../../../../src/core/application/dtos/convertionNotificationDto';
import { StatusType } from '../../../../../src/core/domain/types/statusType';

describe('ConvertionNotificationDto', () => {
	it('should create an instance with compressedFileKey provided', () => {
		const status: StatusType = 'processed';
		const userId = 'user-123';
		const compressedFileKey = 'compressed-key-456';

		const dto = new ConvertionNotificationDto(
			status,
			userId,
			compressedFileKey
		);

		expect(dto.status).toBe(status);
		expect(dto.userId).toBe(userId);
		expect(dto.compressedFileKey).toBe(compressedFileKey);
	});

	it('should create an instance with default compressedFileKey when not provided', () => {
		const status: StatusType = 'processing';
		const userId = 'user-789';

		const dto = new ConvertionNotificationDto(status, userId);

		expect(dto.status).toBe(status);
		expect(dto.userId).toBe(userId);
		expect(dto.compressedFileKey).toBe('');
	});
});
