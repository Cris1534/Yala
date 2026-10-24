import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contrato, Empleado, Nomina } from '../entities/index.js';

export interface NominaInput {
  empleado_id: number;
  contrato_id: number;
  periodo_inicio: string;
  periodo_fin: string;
  comisiones?: number;
  deducciones?: number;
}

@Injectable()
export class NominaService {
  constructor(
    @InjectRepository(Nomina)
    private nominaRepo: Repository<Nomina>,
    @InjectRepository(Contrato)
    private contratosRepo: Repository<Contrato>,
    @InjectRepository(Empleado)
    private empleadosRepo: Repository<Empleado>,
  ) {}

  async generar(empresa_id: number, data: NominaInput) {
    const empleado = await this.empleadosRepo.findOne({
      where: { id: data.empleado_id, empresa_id },
    });
    if (!empleado) throw new NotFoundException('Empleado no encontrado');

    const contrato = await this.contratosRepo.findOne({
      where: { id: data.contrato_id, empleado_id: data.empleado_id },
    });
    if (!contrato) throw new NotFoundException('Contrato no encontrado');

    const salario_base = contrato.tipo === 'comision' ? 0 : Number(contrato.salario_base);
    const comisiones = data.comisiones ?? 0;
    const deducciones = data.deducciones ?? 0;
    const total_pago = Math.round((salario_base + comisiones - deducciones) * 100) / 100;

    const nomina = this.nominaRepo.create({
      empleado_id: data.empleado_id,
      contrato_id: data.contrato_id,
      periodo_inicio: data.periodo_inicio,
      periodo_fin: data.periodo_fin,
      salario_base,
      comisiones,
      deducciones,
      total_pago,
      estado: 'pendiente',
    });
    return this.nominaRepo.save(nomina);
  }

  async findByEmpleado(empresa_id: number, empleado_id: number) {
    const empleado = await this.empleadosRepo.findOne({
      where: { id: empleado_id, empresa_id },
    });
    if (!empleado) throw new NotFoundException('Empleado no encontrado');

    return this.nominaRepo.find({ where: { empleado_id }, order: { periodo_inicio: 'DESC' } });
  }

  async pagar(empresa_id: number, id: number) {
    const nomina = await this.nominaRepo.findOne({ where: { id }, relations: { empleado: true } });
    if (!nomina || nomina.empleado.empresa_id !== empresa_id) {
      throw new NotFoundException('Registro de nomina no encontrado');
    }
    nomina.estado = 'pagado';
    nomina.fecha_pago = new Date().toISOString().slice(0, 10);
    return this.nominaRepo.save(nomina);
  }
}
