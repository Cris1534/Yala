import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../entities/index.js';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private categoriasRepo: Repository<Categoria>,
  ) {}

  create(empresa_id: number, nombre: string) {
    const categoria = this.categoriasRepo.create({ nombre, empresa_id });
    return this.categoriasRepo.save(categoria);
  }

  findAll(empresa_id: number) {
    return this.categoriasRepo.find({ where: { empresa_id } });
  }

  async findOne(empresa_id: number, id: number) {
    const categoria = await this.categoriasRepo.findOne({ where: { id, empresa_id } });
    if (!categoria) throw new NotFoundException('Categoria no encontrada');
    return categoria;
  }

  async remove(empresa_id: number, id: number) {
    const categoria = await this.findOne(empresa_id, id);
    await this.categoriasRepo.remove(categoria);
    return { ok: true };
  }
}
