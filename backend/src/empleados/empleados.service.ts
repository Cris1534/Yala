import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from '../entities/index.js';

export interface EmpleadoInput {
  nombre: string;
  documento?: string;
  cargo?: string;
}

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private empleadosRepo: Repository<Empleado>,
  ) {}

  create(empresa_id: number, data: EmpleadoInput) {
    const empleado = this.empleadosRepo.create({ ...data, empresa_id });
    return this.empleadosRepo.save(empleado);
  }

  findAll(empresa_id: number) {
    return this.empleadosRepo.find({ where: { empresa_id }, order: { nombre: 'ASC' } });
  }

  async findOne(empresa_id: number, id: number) {
    const empleado = await this.empleadosRepo.findOne({ where: { id, empresa_id } });
    if (!empleado) throw new NotFoundException('Empleado no encontrado');
    return empleado;
  }

  async update(empresa_id: number, id: number, data: Partial<EmpleadoInput> & { activo?: boolean }) {
    const empleado = await this.findOne(empresa_id, id);
    Object.assign(empleado, data);
    return this.empleadosRepo.save(empleado);
  }

  async retirar(empresa_id: number, id: number) {
    return this.update(empresa_id, id, { activo: false });
  }
}
