import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMeProfileDto {
  @ApiPropertyOptional({ example: 'Nurav Sharma' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;
}
