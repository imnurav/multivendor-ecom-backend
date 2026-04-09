import { UsersController } from './users.controller';
import { FilesModule } from '../files/files.module';
import { UsersService } from './users.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [FilesModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
