
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SmsService } from '@src/core/application/services/smsService';

describe('SmsService', () => {
    let smsService: SmsService;
    let mockSend: jest.Mock;

    beforeEach(() => {
        smsService = new SmsService();
        mockSend = jest.fn();

        smsService['client'] = {
            send: mockSend,
            config: {},
            destroy: jest.fn(),
            middlewareStack: { add: jest.fn(), addRelativeTo: jest.fn(), clone: jest.fn(), remove: jest.fn(), use: jest.fn() },
        } as unknown as SNSClient;
    });

    it('should send SMS successfully', async () => {
        const phoneNumber = '+123456789';
        const message = 'Test message';

        mockSend.mockResolvedValue({});

        await smsService.sendSms(phoneNumber, message);

        expect(mockSend).toHaveBeenCalledTimes(1);

        const commandArg = mockSend.mock.calls[0][0];
        expect(commandArg).toBeInstanceOf(PublishCommand);
        expect(commandArg.input).toEqual({
            Message: message,
            PhoneNumber: phoneNumber,
        });
    });

    it('should throw an error if SMS sending fails', async () => {
        const phoneNumber = '+123456789';
        const message = 'Test message';
        const error = new Error('SNS failure');

        mockSend.mockRejectedValue(error);

        await expect(smsService.sendSms(phoneNumber, message)).rejects.toThrow(error);
    });
});
