import { FileStorageProvider, StorageProvider } from './file-storage.interface';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { ENV_KEYS } from '../../../config/env.constants';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import {
  FileDeleteInput,
  FileDeleteOutput,
  FileUploadInput,
  FileUploadOutput,
} from './file-storage.interface';

@Injectable()
export class CloudinaryStorageProvider implements FileStorageProvider {
  constructor(private readonly configService: ConfigService) {}

  private configureClient(): void {
    const apiKey = this.configService.get<string>(ENV_KEYS.CLOUDINARY_API_KEY);
    const apiSecret = this.configService.get<string>(
      ENV_KEYS.CLOUDINARY_API_SECRET,
    );
    const cloudName = this.configService.get<string>(
      ENV_KEYS.CLOUDINARY_CLOUD_NAME,
    );

    if (!apiSecret || !cloudName || !apiKey) {
      throw new InternalServerErrorException(
        'Cloudinary is not configured: CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET missing',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async upload(input: FileUploadInput): Promise<FileUploadOutput> {
    this.configureClient();

    const sanitizedOriginalName = input.originalName.replace(/\s+/g, '-');
    const fileName = `${randomUUID()}-${sanitizedOriginalName}`;
    const sanitizedFolder = input.folder?.replace(/^\/+|\/+$/g, '');

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: sanitizedFolder,
          resource_type: 'auto',
          public_id: fileName,
          overwrite: true,
          use_filename: false,
          unique_filename: false,
        },
        (error, response) => {
          if (error || !response) {
            reject(
              new InternalServerErrorException(
                `Cloudinary upload failed: ${error?.message ?? 'Unknown error'}`,
              ),
            );
            return;
          }
          resolve(response);
        },
      );

      uploadStream.end(input.buffer);
    });

    return {
      provider: StorageProvider.CLOUDINARY,
      path: result.public_id,
      url: result.secure_url ?? result.url,
      size: result.bytes ?? input.buffer.byteLength,
      meta: {
        fileId: result.asset_id,
        name: result.original_filename,
        format: result.format,
        resourceType: result.resource_type,
        width: result.width,
        height: result.height,
      },
    };
  }

  async delete(input: FileDeleteInput): Promise<FileDeleteOutput> {
    this.configureClient();

    const resourceTypes: Array<'image' | 'video' | 'raw'> = [
      'image',
      'video',
      'raw',
    ];

    for (const resourceType of resourceTypes) {
      const result = await cloudinary.uploader.destroy(input.path, {
        resource_type: resourceType,
        invalidate: true,
      });

      if (result.result === 'ok' || result.result === 'not found') {
        return {
          provider: StorageProvider.CLOUDINARY,
          deleted: true,
        };
      }
    }

    return {
      provider: StorageProvider.CLOUDINARY,
      deleted: false,
    };
  }
}
