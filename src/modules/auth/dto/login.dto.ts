import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class LoginDto {
  @ApiPropertyOptional({ example: 'nurav@gmail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+919873538514' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, {
    message: 'phone must be a valid phone number',
  })
  phone?: string;

  @ApiHideProperty()
  @ValidateIf((o: LoginDto) => !o.email && !o.phone)
  @IsString({ message: 'either email or phone is required' })
  loginIdentifierGuard?: string;

  @ApiProperty({ example: 'Varun@9873', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
