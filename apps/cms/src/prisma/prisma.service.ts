import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient, applyAuditMiddleware } from '@repo/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  public isConnected = false;

  constructor() {
    super();
    applyAuditMiddleware(this);
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log('Database connected successfully');
    } catch (err: any) {
      this.isConnected = false;
      this.logger.warn(`Database connection deferred: ${err.message}`);
    }
  }
}
