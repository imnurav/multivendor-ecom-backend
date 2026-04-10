import { CloudinaryStorageProvider } from './storage/cloudinary-storage.provider';
import { ImageKitStorageProvider } from './storage/imagekit-storage.provider';
import { FileStorageService } from './storage/file-storage.service';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [FilesController],
  providers: [
    FilesService,
    FileStorageService,
    ImageKitStorageProvider,
    CloudinaryStorageProvider,
  ],
  exports: [FilesService],
})
export class FilesModule {}
