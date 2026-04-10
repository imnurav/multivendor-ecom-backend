import {
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeletedFileResponse, UploadedFileResponse } from './files.types';
import { FileModuleFolder } from './storage/file-storage.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { Express, Request } from 'express';

@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  upload(
    @Req() req: Request & { user: { sub: string } },
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadedFileResponse> {
    return this.filesService.uploadFile(req.user.sub, file, {
      folder: FileModuleFolder.GENERAL,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete uploaded file by id' })
  deleteFile(
    @Req() req: Request & { user: { sub: string } },
    @Param('id') id: string,
  ): Promise<DeletedFileResponse> {
    return this.filesService.deleteFile(req.user.sub, id);
  }
}
