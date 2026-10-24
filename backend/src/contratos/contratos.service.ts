import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contrato, Empleado } from '../entities/index.js';

export interface ContratoInput {
  empleado_id: number;
  tipo: 'fijo' | 'comision' | 'mixto';
  salario_base?: number;
  porcentaje_comision?: number;
  fecha_inicio: string;
  fecha_fin?: string;
}

@Injectable()
export class ContratosService {
  constructor(
    @InjectRepository(Contrato)
    private contratosRepo: Repository<Contrato>,
    @InjectRepository(Empleado)
    private empleadosRepo: Repository<Empleado>,
  ) {}

  async create(empresa_id: number, data: ContratoInput) {
    const empleado = await this.empleadosRepo.findOne({
      where: { id: data.empleado_id, empresa_id },
    });
    if (!empleado) throw new NotFoundException('Empleado no encontrado');

    const contrato = this.contratosRepo.create(data);
    return this.contratosRepo.save(contrato);
  }

  async findByEmpleado(empresa_id: number, empleado_id: number) {
    const empleado = await this.empleadosRepo.findOne({
      where: { id: empleado_id, empresa_id },
    });
    if (!empleado) throw new NotFoundException('Empleado no encontrado');

    return this.contratosRepo.find({ where: { empleado_id }, order: { fecha_inicio: 'DESC' } });
  }

  async findOne(empresa_id: number, id: number) {
    const contrato = await this.contratosRepo.findOne({
      where: { id },
      relations: { empleado: true },
    });
    if (!contrato || contrato.empleado.empresa_id !== empresa_id) {
      throw new NotFoundException('Contrato no encontrado');
    }
    return contrato;
  }

  async terminar(empresa_id: number, id: number) {
    const contrato = await this.findOne(empresa_id, id);
    contrato.activo = false;
    contrato.fecha_fin = new Date().toISOString().slice(0, 10);
    return this.contratosRepo.save(contrato);
  }
}
