import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { NominaService, type NominaInput } from './nomina.service.js';

@UseGuards(JwtAuthGuard)
@Controller()
export class NominaController {
  constructor(private nominaService: NominaService) {}

  @Post('nomina')
  generar(@Req() req: any, @Body() body: NominaInput) {
    return this.nominaService.generar(req.user.empresa_id, body);
  }

  @Get('empleados/:empleado_id/nomina')
  findByEmpleado(@Req() req: any, @Param('empleado_id') empleadoId: string) {
    return this.nominaService.findByEmpleado(req.user.empresa_id, +empleadoId);
  }

  @Patch('nomina/:id/pagar')
  pagar(@Req() req: any, @Param('id') id: string) {
    return this.nominaService.pagar(req.user.empresa_id, +id);
  }
}
