import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { DomiciliosService, type DomicilioInput } from './domicilios.service.js';

@UseGuards(JwtAuthGuard)
@Controller('domicilios')
export class DomiciliosController {
  constructor(private domiciliosService: DomiciliosService) {}

  @Post()
  create(@Req() req: any, @Body() body: DomicilioInput) {
    return this.domiciliosService.create(req.user.empresa_id, body);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.domiciliosService.findAll(req.user.empresa_id);
  }

  @Patch(':id/asignar')
  asignar(@Req() req: any, @Param('id') id: string, @Body() body: { repartidor_id: number }) {
    return this.domiciliosService.asignarRepartidor(req.user.empresa_id, +id, body.repartidor_id);
  }

  @Patch(':id/estado')
  cambiarEstado(@Req() req: any, @Param('id') id: string, @Body() body: { estado: string }) {
    return this.domiciliosService.cambiarEstado(req.user.empresa_id, +id, body.estado);
  }
}
