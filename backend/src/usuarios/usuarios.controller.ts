import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UsuariosService } from './usuarios.service.js';

@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }

  @Get()
  findByEmpresa(@Req() req: any) {
    return this.usuariosService.findByEmpresa(req.user.empresa_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }
}
