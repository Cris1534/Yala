import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { InventarioLotesService, type LoteInput } from './inventario-lotes.service.js';

@UseGuards(JwtAuthGuard)
@Controller('inventario-lotes')
export class InventarioLotesController {
  constructor(private lotesService: InventarioLotesService) {}

  @Post()
  create(@Req() req: any, @Body() body: LoteInput) {
    return this.lotesService.create(req.user.empresa_id, body);
  }

  @Get('vencimiento')
  proximosAVencer(@Req() req: any, @Query('dias') dias?: string) {
    return this.lotesService.proximosAVencer(req.user.empresa_id, dias ? +dias : 7);
  }

  @Get('producto/:producto_id')
  findByProducto(@Req() req: any, @Param('producto_id') productoId: string) {
    return this.lotesService.findByProducto(req.user.empresa_id, +productoId);
  }
}
