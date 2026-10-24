import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empleado } from '../entities/index.js';
import { EmpleadosController } from './empleados.controller.js';
import { EmpleadosService } from './empleados.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Empleado])],
  controllers: [EmpleadosController],
  providers: [EmpleadosService],
})
export class EmpleadosModule {}
