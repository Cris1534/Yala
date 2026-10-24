import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { EmpresasService } from './empresas.service.js';

@Controller('empresas')
export class EmpresasController {
  constructor(private empresasService: EmpresasService) {}

  // Publico: alta de un nuevo tenant (aun no existe usuario para autenticarse)
  @Post()
  create(@Body() body: { nombre: string; tipo_negocio?: string }) {
    return this.empresasService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.empresasService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empresasService.findOne(+id);
  }
}
