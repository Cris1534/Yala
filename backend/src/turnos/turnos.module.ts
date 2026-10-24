import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Turno, Venta } from '../entities/index.js';
import { TurnosController } from './turnos.controller.js';
import { TurnosService } from './turnos.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Turno, Venta])],
  controllers: [TurnosController],
  providers: [TurnosService],
  exports: [TurnosService],
})
export class TurnosModule {}
