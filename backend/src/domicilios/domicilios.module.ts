import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Direccion, Domicilio, Venta } from '../entities/index.js';
import { DomiciliosController } from './domicilios.controller.js';
import { DomiciliosService } from './domicilios.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Domicilio, Venta, Direccion])],
  controllers: [DomiciliosController],
  providers: [DomiciliosService],
})
export class DomiciliosModule {}
