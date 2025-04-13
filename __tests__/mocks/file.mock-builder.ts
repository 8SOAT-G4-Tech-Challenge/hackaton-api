import { StatusEnum } from "@src/core/application/enumerations/statusEnum";
import { File } from "@models/file";

export class FileMockBuilder {
    private file: File;

    constructor() {
        this.file = {
            id: 'mock-file-id',
            userId: 'mock-user-id',
            videoUrl: 'http://mock.video.url/video.mp4',
            imagesCompressedUrl: 'http://mock.images.url/image.jpg',
            screenshotsTime: 10,
            status: StatusEnum.initialized,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    withId(id: string): FileMockBuilder {
        this.file.id = id;
        return this;
    }

    withUserId(userId: string): FileMockBuilder {
        this.file.userId = userId;
        return this;
    }

    withVideoUrl(videoUrl: string): FileMockBuilder {
        this.file.videoUrl = videoUrl;
        return this;
    }

    withImagesCompressedUrl(imagesCompressedUrl: string): FileMockBuilder {
        this.file.imagesCompressedUrl = imagesCompressedUrl;
        return this;
    }

    withScreenshotsTime(screenshotsTime: number): FileMockBuilder {
        this.file.screenshotsTime = screenshotsTime;
        return this;
    }

    withStatus(status: keyof typeof StatusEnum): FileMockBuilder {
        this.file.status = StatusEnum[status];
        return this;
    }

    withCreatedAt(createdAt: Date): FileMockBuilder {
        this.file.createdAt = createdAt;
        return this;
    }

    withUpdatedAt(updatedAt: Date): FileMockBuilder {
        this.file.updatedAt = updatedAt;
        return this;
    }

    build(): File {
        return this.file;
    }
}