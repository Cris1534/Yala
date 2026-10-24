import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contrato, Empleado } from '../entities/index.js';
import { ContratosController } from './contratos.controller.js';
import { ContratosService } from './contratos.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Contrato, Empleado])],
  controllers: [ContratosController],
  providers: [ContratosService],
})
export class ContratosModule {}
