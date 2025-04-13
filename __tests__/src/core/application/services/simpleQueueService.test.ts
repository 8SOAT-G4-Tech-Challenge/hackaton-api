import { ConverterInfoDto } from "@src/core/application/dtos/converterInfoDto";
import { SimpleQueueService } from "@src/core/application/services/simpleQueueService";

describe('SimpleQueueService', () => {
    let awsSimpleQueue: any;
    let simpleQueueService: SimpleQueueService;

    beforeEach(() => {
        awsSimpleQueue = {
            publishMessage: jest.fn(),
        };

        simpleQueueService = new SimpleQueueService(awsSimpleQueue);
    });

    describe('publishMessage', () => {
        it('should call awsSimpleQueue.publishMessage with provided data', async () => {
            const data: ConverterInfoDto = {
                fileName: 'video.mp4',
                fileStorageKey: 'some-storage-key',
                userId: 'user-1',
                fileId: 'file-1',
                screenshotsTime: 10,
            };

            awsSimpleQueue.publishMessage.mockResolvedValue(undefined);

            await simpleQueueService.publishMessage(data);

            expect(awsSimpleQueue.publishMessage).toHaveBeenCalledWith(data);
        });

        it('should propagate errors from awsSimpleQueue.publishMessage', async () => {
            const data: ConverterInfoDto = {
                fileName: 'video.mp4',
                fileStorageKey: 'some-storage-key',
                userId: 'user-1',
                fileId: 'file-1',
                screenshotsTime: 10,
            };

            const error = new Error('Publishing failed');
            awsSimpleQueue.publishMessage.mockRejectedValue(error);

            await expect(simpleQueueService.publishMessage(data)).rejects.toThrowError(error);
        });
    });
});
