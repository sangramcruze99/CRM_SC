import { Module, Global } from '@nestjs/common';
import { BusinessEventBusService } from './business-event-bus.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [BusinessEventBusService],
  exports: [BusinessEventBusService],
})
export class EventBusModule {}
