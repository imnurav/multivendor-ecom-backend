import {
  FileStorageProvider,
  FileUploadInput,
  FileUploadOutput,
} from './file-storage.interface';
import { ImagekitStorageProvider } from './imagekit-storage.provider';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileStorageService {
  constructor(
    private readonly configService: ConfigService,
    private readonly imagekitStorageProvider: ImagekitStorageProvider,
  ) {}

  private getProvider(): FileStorageProvider {
    const provider = (
      this.configService.get<string>('FILE_STORAGE_PROVIDER') ?? 'imagekit'
    ).toLowerCase();

    switch (provider) {
      case 'imagekit':
        return this.imagekitStorageProvider;
      default:
        throw new InternalServerErrorException(
          `Unsupported FILE_STORAGE_PROVIDER: ${provider}`,
        );
    }
  }

  upload(input: FileUploadInput): Promise<FileUploadOutput> {
    return this.getProvider().upload(input);
  }
}
