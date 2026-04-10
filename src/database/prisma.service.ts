import { PrismaClient } from '../generated/prisma/client';
import { ENV_KEYS } from '../config/env.constants';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.get(ENV_KEYS.DATABASE_URL) as string,
    });
    super({ adapter });
  }
}
