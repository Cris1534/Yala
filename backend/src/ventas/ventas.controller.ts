import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { VentasService, type CrearVentaInput } from './ventas.service.js';

@UseGuards(JwtAuthGuard)
@Controller('ventas')
export class VentasController {
  constructor(private ventasService: VentasService) {}

  @Post()
  crear(@Req() req: any, @Body() body: CrearVentaInput) {
    return this.ventasService.crear(req.user.empresa_id, req.user.sub, body);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.ventasService.findAll(req.user.empresa_id);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.ventasService.findOne(req.user.empresa_id, +id);
  }
}
