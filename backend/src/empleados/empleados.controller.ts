import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { EmpleadosService, type EmpleadoInput } from './empleados.service.js';

@UseGuards(JwtAuthGuard)
@Controller('empleados')
export class EmpleadosController {
  constructor(private empleadosService: EmpleadosService) {}

  @Post()
  create(@Req() req: any, @Body() body: EmpleadoInput) {
    return this.empleadosService.create(req.user.empresa_id, body);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.empleadosService.findAll(req.user.empresa_id);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.empleadosService.findOne(req.user.empresa_id, +id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: Partial<EmpleadoInput>) {
    return this.empleadosService.update(req.user.empresa_id, +id, body);
  }

  @Patch(':id/retirar')
  retirar(@Req() req: any, @Param('id') id: string) {
    return this.empleadosService.retirar(req.user.empresa_id, +id);
  }
}
