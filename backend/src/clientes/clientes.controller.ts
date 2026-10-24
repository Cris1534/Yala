import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import {
  ClientesService,
  type ClienteInput,
  type DireccionInput,
} from './clientes.service.js';

@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private clientesService: ClientesService) {}

  @Post()
  create(@Req() req: any, @Body() body: ClienteInput) {
    return this.clientesService.create(req.user.empresa_id, body);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.clientesService.findAll(req.user.empresa_id);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.clientesService.findOne(req.user.empresa_id, +id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: Partial<ClienteInput>) {
    return this.clientesService.update(req.user.empresa_id, +id, body);
  }

  @Post(':id/direcciones')
  agregarDireccion(@Req() req: any, @Param('id') id: string, @Body() body: DireccionInput) {
    return this.clientesService.agregarDireccion(req.user.empresa_id, +id, body);
  }

  @Get(':id/direcciones')
  direcciones(@Req() req: any, @Param('id') id: string) {
    return this.clientesService.direcciones(req.user.empresa_id, +id);
  }

  @Get(':id/historial')
  historial(@Req() req: any, @Param('id') id: string) {
    return this.clientesService.historial(req.user.empresa_id, +id);
  }
}
