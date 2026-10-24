import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ContratosService, type ContratoInput } from './contratos.service.js';

@UseGuards(JwtAuthGuard)
@Controller()
export class ContratosController {
  constructor(private contratosService: ContratosService) {}

  @Post('contratos')
  create(@Req() req: any, @Body() body: ContratoInput) {
    return this.contratosService.create(req.user.empresa_id, body);
  }

  @Get('empleados/:empleado_id/contratos')
  findByEmpleado(@Req() req: any, @Param('empleado_id') empleadoId: string) {
    return this.contratosService.findByEmpleado(req.user.empresa_id, +empleadoId);
  }

  @Get('contratos/:id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.contratosService.findOne(req.user.empresa_id, +id);
  }

  @Patch('contratos/:id/terminar')
  terminar(@Req() req: any, @Param('id') id: string) {
    return this.contratosService.terminar(req.user.empresa_id, +id);
  }
}
