import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { TurnosService } from './turnos.service.js';

@UseGuards(JwtAuthGuard)
@Controller('turnos')
export class TurnosController {
  constructor(private turnosService: TurnosService) {}

  @Post('abrir')
  abrir(@Req() req: any, @Body() body: { caja_inicial?: number }) {
    return this.turnosService.abrir(req.user.empresa_id, req.user.sub, body.caja_inicial ?? 0);
  }

  @Get('activo')
  activo(@Req() req: any) {
    return this.turnosService.activo(req.user.sub);
  }

  @Patch(':id/cerrar')
  cerrar(@Req() req: any, @Param('id') id: string, @Body() body: { caja_final?: number }) {
    return this.turnosService.cerrar(req.user.empresa_id, req.user.sub, +id, body.caja_final ?? 0);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.turnosService.findAll(req.user.empresa_id);
  }
}
