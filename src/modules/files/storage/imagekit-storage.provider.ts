import {
  FileStorageProvider,
  FileUploadInput,
  FileUploadOutput,
} from './file-storage.interface';
import ImageKit, { toFile } from '@imagekit/nodejs';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class ImagekitStorageProvider implements FileStorageProvider {
  constructor(private readonly configService: ConfigService) {}

  async upload(input: FileUploadInput): Promise<FileUploadOutput> {
    const privateKey = this.configService.get<string>('IMAGEKIT_PRIVATE_KEY');

    if (!privateKey) {
      throw new InternalServerErrorException(
        'ImageKit is not configured: IMAGEKIT_PRIVATE_KEY missing',
      );
    }

    const sanitizedOriginalName = input.originalName.replace(/\s+/g, '-');
    const fileName = `${randomUUID()}-${sanitizedOriginalName}`;
    const client = new ImageKit({ privateKey });

    const uploadedFile = await toFile(input.buffer, fileName);

    const result = await client.files.upload({
      file: uploadedFile,
      fileName,
      folder: input.folder,
      useUniqueFileName: false,
    });

    return {
      provider: 'imagekit',
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
}
