import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../entities/index.js';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private empresasRepo: Repository<Empresa>,
  ) {}

  create(data: { nombre: string; tipo_negocio?: string }) {
    const empresa = this.empresasRepo.create(data);
    return this.empresasRepo.save(empresa);
  }

  findAll() {
    return this.empresasRepo.find();
  }

  async findOne(id: number) {
    const empresa = await this.empresasRepo.findOne({ where: { id } });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');
    return empresa;
  }
}
