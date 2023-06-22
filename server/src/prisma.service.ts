import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '.prisma/client'; // <-- import the dot generated folder, not @prisma/client

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
    this.$use(async (params, next) => {
      const result = await next(params);

      if (params.model === 'Item') {
        // console.log(params);
      }

      return result;
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
