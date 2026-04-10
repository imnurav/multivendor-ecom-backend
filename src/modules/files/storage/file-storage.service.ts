import { FileStorageProvider, FileUploadInput } from './file-storage.interface';
import { CloudinaryStorageProvider } from './cloudinary-storage.provider';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ImageKitStorageProvider } from './imagekit-storage.provider';
import { ENV_KEYS } from '../../../config/env.constants';
import { ConfigService } from '@nestjs/config';
import {
  FileDeleteInput,
  FileDeleteOutput,
  FileUploadOutput,
  StorageProvider,
} from './file-storage.interface';

@Injectable()
export class FileStorageService {
  constructor(
    private readonly configService: ConfigService,
    private readonly imageKit: ImageKitStorageProvider,
    private readonly cloudinary: CloudinaryStorageProvider,
  ) {}

  private resolveProvider(value?: string): StorageProvider {
    const normalized = (value ?? StorageProvider.IMAGEKIT).toLowerCase();

    if (normalized === StorageProvider.IMAGEKIT) {
      return StorageProvider.IMAGEKIT;
    }
    if (normalized === StorageProvider.CLOUDINARY) {
      return StorageProvider.CLOUDINARY;
    }

    throw new InternalServerErrorException(
      `Unsupported FILE_STORAGE_PROVIDER: ${value}`,
    );
  }

  private getProvider(providerOverride?: string): FileStorageProvider {
    const provider = this.resolveProvider(
      providerOverride ??
        this.configService.get<string>(ENV_KEYS.FILE_STORAGE_PROVIDER),
    );

    switch (provider) {
      case StorageProvider.IMAGEKIT:
        return this.imageKit;
      case StorageProvider.CLOUDINARY:
        return this.cloudinary;
    }
  }

  upload(input: FileUploadInput): Promise<FileUploadOutput> {
    return this.getProvider().upload(input);
  }

  delete(
    input: FileDeleteInput,
    providerOverride: string,
  ): Promise<FileDeleteOutput> {
    return this.getProvider(providerOverride).delete(input);
  }
}
