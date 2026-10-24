import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ProveedoresService, type ProveedorInput } from './proveedores.service.js';

@UseGuards(JwtAuthGuard)
@Controller('proveedores')
export class ProveedoresController {
  constructor(private proveedoresService: ProveedoresService) {}

  @Post()
  create(@Req() req: any, @Body() body: ProveedorInput) {
    return this.proveedoresService.create(req.user.empresa_id, body);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.proveedoresService.findAll(req.user.empresa_id);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.proveedoresService.findOne(req.user.empresa_id, +id);
  }
}
