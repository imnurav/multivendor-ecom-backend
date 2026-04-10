import { JwtStrategy } from './strategies/jwt.strategy';
import { ENV_KEYS } from '../../config/env.constants';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(ENV_KEYS.JWT_SECRET),
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
