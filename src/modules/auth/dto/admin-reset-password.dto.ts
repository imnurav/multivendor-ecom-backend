import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AdminResetPasswordDto {
  @ApiProperty({ example: '1f8a9d5e-cd88-4f0d-8bf2-3ce2f5fadc11' })
  @IsString()
  targetUserId!: string;

  @ApiProperty({ example: 'newStrongPassword123', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
