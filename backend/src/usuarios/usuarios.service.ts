import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/index.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepo: Repository<Usuario>,
  ) {}

  private readonly camposPublicos = {
    id: true,
    nombre: true,
    email: true,
    rol: true,
    empresa_id: true,
  } as const;

  findByEmpresa(empresa_id: number) {
    return this.usuariosRepo.find({
      where: { empresa_id },
      select: this.camposPublicos,
    });
  }

  async findOne(id: number) {
    const usuario = await this.usuariosRepo.findOne({
      where: { id },
      select: this.camposPublicos,
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }
}
