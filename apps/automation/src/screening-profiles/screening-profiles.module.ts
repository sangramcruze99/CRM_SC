import { Module } from '@nestjs/common';
import { ScreeningProfilesController } from './screening-profiles.controller';
import { ScreeningProfilesService } from './screening-profiles.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ScreeningProfilesController],
  providers: [ScreeningProfilesService],
  exports: [ScreeningProfilesService],
})
export class ScreeningProfilesModule {}
