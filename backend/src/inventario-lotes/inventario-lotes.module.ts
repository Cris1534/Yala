import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioLote, Producto } from '../entities/index.js';
import { InventarioLotesController } from './inventario-lotes.controller.js';
import { InventarioLotesService } from './inventario-lotes.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([InventarioLote, Producto])],
  controllers: [InventarioLotesController],
  providers: [InventarioLotesService],
})
export class InventarioLotesModule {}
