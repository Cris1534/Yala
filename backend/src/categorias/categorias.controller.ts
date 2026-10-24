import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CategoriasService } from './categorias.service.js';

@UseGuards(JwtAuthGuard)
@Controller('categorias')
export class CategoriasController {
  constructor(private categoriasService: CategoriasService) {}

  @Post()
  create(@Req() req: any, @Body() body: { nombre: string }) {
    return this.categoriasService.create(req.user.empresa_id, body.nombre);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.categoriasService.findAll(req.user.empresa_id);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.categoriasService.remove(req.user.empresa_id, +id);
  }
}
