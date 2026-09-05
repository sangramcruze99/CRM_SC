import { Module } from '@nestjs/common';
import { ConnectorRegistryService } from './connector-registry.service';
import { ConnectorsController } from './connectors.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConnectorsController],
  providers: [ConnectorRegistryService],
  exports: [ConnectorRegistryService],
})
export class ConnectorsModule {}
