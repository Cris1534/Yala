import { Module } from '@nestjs/common';
import { InformesController } from './informes.controller.js';
import { InformesService } from './informes.service.js';

@Module({
  controllers: [InformesController],
  providers: [InformesService],
})
export class InformesModule {}
