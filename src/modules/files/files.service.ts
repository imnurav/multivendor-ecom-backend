import { FileStorageService } from './storage/file-storage.service';
import { ENV_DEFAULTS, ENV_KEYS } from '../../config/env.constants';
import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageProvider } from './storage/file-storage.interface';
import { PrismaService } from '../../database/prisma.service';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { ConfigService } from '@nestjs/config';
import {
  DeletedFileResponse,
  UploadedFileResponse,
  UploadFileOptions,
} from './files.types';

@Injectable()
export class FilesService {
  private readonly storageRootFolder: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorageService: FileStorageService,
    private readonly configService: ConfigService,
  ) {
    this.storageRootFolder = this.sanitizePathSegment(
      this.configService.get<string>(ENV_KEYS.FILE_STORAGE_ROOT_FOLDER) ??
        ENV_DEFAULTS.FILE_STORAGE_ROOT_FOLDER,
    );
  }

  async uploadFile(
    userId: string,
    file: Express.Multer.File,
    options: UploadFileOptions,
  ): Promise<UploadedFileResponse> {
    if (!file) throw new BadRequestException('file is required');
    if (!file.buffer || !file.originalname || !file.mimetype) {
      throw new BadRequestException('invalid file payload');
    }
    if (!options?.folder) throw new BadRequestException('folder is required');

    if (options.allowedMimePrefixes?.length) {
      const allowed = options.allowedMimePrefixes.some((prefix) =>
        file.mimetype.startsWith(prefix),
      );
      if (!allowed) {
        throw new BadRequestException(
          `Unsupported file type: ${file.mimetype}`,
        );
      }
    }

    const uploaded = await this.fileStorageService.upload({
      buffer: file.buffer as Buffer,
      originalName: file.originalname as string,
      mimeType: file.mimetype as string,
      folder: this.buildStorageFolder(options.folder),
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

    if (!created)
      throw new InternalServerErrorException('Failed to save uploaded file');

    return {
      ...created,
      provider: created.provider as StorageProvider,
    };
  }

  async deleteFile(
    userId: string,
    fileId: string,
  ): Promise<DeletedFileResponse> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        uploadedById: true,
        provider: true,
        path: true,
        meta: true,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.uploadedById && file.uploadedById !== userId) {
      throw new ForbiddenException(
        'You do not have access to delete this file',
      );
    }

    const storageResult = await this.fileStorageService.delete(
      {
        path: file.path,
        meta: (file.meta as Record<string, unknown> | null) ?? undefined,
      },
      file.provider,
    );

    await this.prisma.file.delete({
      where: { id: file.id },
    });

    return {
      id: file.id,
      provider: storageResult.provider,
      deleted: storageResult.deleted,
    };
  }

  private buildStorageFolder(folder: string): string {
    const sanitizedFolder = this.sanitizePathSegment(folder);
    if (!sanitizedFolder) {
      throw new BadRequestException('folder cannot be empty');
    }
    return `/${this.storageRootFolder}/${sanitizedFolder}`;
  }

  private sanitizePathSegment(value: string): string {
    return value.trim().replace(/^\/+|\/+$/g, '');
  }
}
