import {
  ApiHideProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class ForgotPasswordDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+919999999999' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, {
    message: 'phone must be a valid phone number',
  })
  phone?: string;

  @ApiHideProperty()
  @ValidateIf((o: ForgotPasswordDto) => !o.email && !o.phone)
  @IsString({ message: 'either email or phone is required' })
  identifierGuard?: string;
}
