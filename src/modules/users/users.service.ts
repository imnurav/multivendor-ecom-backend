import { FileModuleFolder } from '../files/storage/file-storage.interface';
import { UpdateMeProfileDto } from './dto/update-me-profile.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { FilesService } from '../files/files.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImageFileId: true,
        profileImage: {
          select: {
            id: true,
            url: true,
            mimeType: true,
          },
        },
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { id: true, name: true } },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMeProfile(
    userId: string,
    body: UpdateMeProfileDto,
    image?: Express.Multer.File,
  ) {
    const uploadedImage = image
      ? await this.filesService.uploadFile(userId, image, {
          folder: FileModuleFolder.USER_PROFILE,
          allowedMimePrefixes: ['image/'],
        })
      : null;

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(body.name !== undefined ? { name: body.name } : {}),
          ...(uploadedImage?.id
            ? { profileImageFileId: uploadedImage.id }
            : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImageFileId: true,
          profileImage: {
            select: {
              id: true,
              url: true,
              mimeType: true,
            },
          },
          isActive: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          role: { select: { id: true, name: true } },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }
}
