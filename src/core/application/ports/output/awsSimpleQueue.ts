import { ConverterInfoDto } from '../../dtos/converterInfoDto';

export interface AwsSimpleQueue {
	publishMessage(message: ConverterInfoDto): Promise<void>;
}
