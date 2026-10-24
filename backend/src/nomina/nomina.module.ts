import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contrato, Empleado, Nomina } from '../entities/index.js';
import { NominaController } from './nomina.controller.js';
import { NominaService } from './nomina.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Nomina, Contrato, Empleado])],
  controllers: [NominaController],
  providers: [NominaService],
})
export class NominaModule {}
