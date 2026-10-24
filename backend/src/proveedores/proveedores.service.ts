import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from '../entities/index.js';

export interface ProveedorInput {
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private proveedoresRepo: Repository<Proveedor>,
  ) {}

  create(empresa_id: number, data: ProveedorInput) {
    const proveedor = this.proveedoresRepo.create({ ...data, empresa_id });
    return this.proveedoresRepo.save(proveedor);
  }

  findAll(empresa_id: number) {
    return this.proveedoresRepo.find({ where: { empresa_id } });
  }

  async findOne(empresa_id: number, id: number) {
    const proveedor = await this.proveedoresRepo.findOne({ where: { id, empresa_id } });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
    return proveedor;
  }
}
