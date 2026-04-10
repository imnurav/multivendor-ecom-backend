import { FileStorageProvider, StorageProvider } from './file-storage.interface';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ENV_KEYS } from '../../../config/env.constants';
import ImageKit, { toFile } from '@imagekit/nodejs';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import {
  FileDeleteInput,
  FileDeleteOutput,
  FileUploadInput,
  FileUploadOutput,
} from './file-storage.interface';

@Injectable()
export class ImageKitStorageProvider implements FileStorageProvider {
  constructor(private readonly configService: ConfigService) {}

  private getClient(): ImageKit {
    const privateKey = this.configService.get<string>(
      ENV_KEYS.IMAGEKIT_PRIVATE_KEY,
    );

    if (!privateKey) {
      throw new InternalServerErrorException(
        'ImageKit is not configured: IMAGEKIT_PRIVATE_KEY missing',
      );
    }

    return new ImageKit({ privateKey });
  }

  async upload(input: FileUploadInput): Promise<FileUploadOutput> {
    const sanitizedOriginalName = input.originalName.replace(/\s+/g, '-');
    const fileName = `${randomUUID()}-${sanitizedOriginalName}`;
    const client = this.getClient();

    const uploadedFile = await toFile(input.buffer, fileName);

    const result = await client.files.upload({
      file: uploadedFile,
      fileName,
      folder: input.folder,
      useUniqueFileName: false,
    });

    return {
      provider: StorageProvider.IMAGEKIT,
      path: result.filePath,
      url: result.url,
      size: result.size ?? input.buffer.byteLength,
      meta: {
        fileId: result.fileId,
        name: result.name,
        width: result.width,
        height: result.height,
      },
    };
  }

  async delete(input: FileDeleteInput): Promise<FileDeleteOutput> {
    const fileId = input.meta?.fileId;
    if (!fileId || typeof fileId !== 'string') {
      throw new InternalServerErrorException(
        'ImageKit delete requires fileId in file meta',
      );
    }

    const client = this.getClient();
    await client.files.delete(fileId);

    return {
      provider: StorageProvider.IMAGEKIT,
      deleted: true,
    };
  }
}
