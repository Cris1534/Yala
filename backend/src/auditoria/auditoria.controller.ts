import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AuditoriaService } from './auditoria.service.js';

@UseGuards(JwtAuthGuard)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private auditoriaService: AuditoriaService) {}

  @Get()
  findAll(
    @Req() req: any,
    @Query('usuario_id') usuarioId?: string,
    @Query('modulo') modulo?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.auditoriaService.findAll(req.user.empresa_id, {
      usuario_id: usuarioId ? +usuarioId : undefined,
      modulo,
      desde,
      hasta,
    });
  }
}
