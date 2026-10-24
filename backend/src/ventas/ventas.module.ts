import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleVenta, Factura, Producto, Venta } from '../entities/index.js';
import { TurnosModule } from '../turnos/turnos.module.js';
import { VentasController } from './ventas.controller.js';
import { VentasService } from './ventas.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Venta, DetalleVenta, Factura, Producto]), TurnosModule],
  controllers: [VentasController],
  providers: [VentasService],
})
export class VentasModule {}
