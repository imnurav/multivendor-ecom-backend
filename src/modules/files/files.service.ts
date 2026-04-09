import { FileStorageService } from './storage/file-storage.service';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { Express } from 'express';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

type UploadFileBody = {
  folder?: string;
};

@Injectable()
export class FilesService {
  private readonly storageRootFolder: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorageService: FileStorageService,
    private readonly configService: ConfigService,
  ) {
    this.storageRootFolder = this.sanitizePathSegment(
      this.configService.get<string>('FILE_STORAGE_ROOT_FOLDER') ??
        'marketplace-core',
    );
  }

  async uploadUserImage(
    userId: string,
    file: Express.Multer.File,
    body: UploadFileBody = {},
  ) {
    if (!file) throw new BadRequestException('file is required');
    if (!file.buffer || !file.originalname || !file.mimetype) {
      throw new BadRequestException('invalid file payload');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const uploaded = await this.fileStorageService.upload({
      buffer: file.buffer as Buffer,
      originalName: file.originalname as string,
      mimeType: file.mimetype as string,
      folder: this.buildStorageFolder(body.folder ?? 'user-profiles'),
    });

    const created = await this.prisma.file.create({
      data: {
        originalName: file.originalname as string,
        mimeType: file.mimetype as string,
        size: uploaded.size,
        provider: uploaded.provider,
        path: uploaded.path,
        url: uploaded.url,
        uploadedById: userId,
        meta: uploaded.meta
          ? (uploaded.meta as Prisma.InputJsonValue)
          : undefined,
      },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        size: true,
        provider: true,
        path: true,
        url: true,
        createdAt: true,
      },
    });

    if (!created) {
      throw new InternalServerErrorException('Failed to save uploaded file');
    }

    return created;
  }

  private buildStorageFolder(folder: string): string {
    const sanitizedFolder = this.sanitizePathSegment(folder);
    return `/${this.storageRootFolder}/${sanitizedFolder}`;
  }

  private sanitizePathSegment(value: string): string {
    return value.trim().replace(/^\/+|\/+$/g, '');
  }
}
