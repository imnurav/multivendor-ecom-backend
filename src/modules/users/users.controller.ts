import {
  Body,
  Controller,
  Get,
  Patch,
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
import { UpdateMeProfileDto } from './dto/update-me-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { Express, Request } from 'express';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@Req() req: Request & { user: { sub: string } }) {
    return this.usersService.getMe(req.user.sub);
  }

  @Patch('me')
  @ApiOperation({
    summary:
      'Update current user profile (name and optional image upload handled by backend)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Nurav Sharma' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  updateMe(
    @Req() req: Request & { user: { sub: string } },
    @Body() body: UpdateMeProfileDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.usersService.updateMeProfile(req.user.sub, body, image);
  }
}
