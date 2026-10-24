import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Direccion, Domicilio, Venta } from '../entities/index.js';

const ESTADOS_VALIDOS = ['pendiente', 'en_camino', 'entregado', 'cancelado'];

export interface DomicilioInput {
  venta_id: number;
  direccion_id: number;
  costo_envio?: number;
  repartidor_id?: number;
}

@Injectable()
export class DomiciliosService {
  constructor(
    @InjectRepository(Domicilio)
    private domiciliosRepo: Repository<Domicilio>,
    @InjectRepository(Venta)
    private ventasRepo: Repository<Venta>,
    @InjectRepository(Direccion)
    private direccionesRepo: Repository<Direccion>,
  ) {}

  async create(empresa_id: number, data: DomicilioInput) {
    const venta = await this.ventasRepo.findOne({ where: { id: data.venta_id, empresa_id } });
    if (!venta) throw new NotFoundException('Venta no encontrada');

    const direccion = await this.direccionesRepo.findOne({ where: { id: data.direccion_id } });
    if (!direccion) throw new NotFoundException('Direccion no encontrada');

    const domicilio = this.domiciliosRepo.create({
      venta_id: data.venta_id,
      direccion_id: data.direccion_id,
      costo_envio: data.costo_envio ?? 0,
      repartidor_id: data.repartidor_id,
      estado: 'pendiente',
    });
    return this.domiciliosRepo.save(domicilio);
  }

  async findAll(empresa_id: number) {
    const domicilios = await this.domiciliosRepo
      .createQueryBuilder('d')
      .innerJoin(Venta, 'v', 'v.id = d.venta_id')
      .where('v.empresa_id = :empresa_id', { empresa_id })
      .leftJoinAndSelect('d.direccion', 'direccion')
      .leftJoinAndSelect('d.repartidor', 'repartidor')
      .orderBy('d.id', 'DESC')
      .getMany();

    return domicilios.map((d) => ({
      ...d,
      repartidor: d.repartidor
        ? { id: d.repartidor.id, nombre: d.repartidor.nombre, rol: d.repartidor.rol }
        : null,
    }));
  }

  private async obtener(empresa_id: number, id: number) {
    const domicilio = await this.domiciliosRepo.findOne({ where: { id } });
    if (!domicilio) throw new NotFoundException('Domicilio no encontrado');
    const venta = await this.ventasRepo.findOne({ where: { id: domicilio.venta_id, empresa_id } });
    if (!venta) throw new NotFoundException('Domicilio no encontrado');
    return domicilio;
  }

  async asignarRepartidor(empresa_id: number, id: number, repartidor_id: number) {
    const domicilio = await this.obtener(empresa_id, id);
    domicilio.repartidor_id = repartidor_id;
    return this.domiciliosRepo.save(domicilio);
  }

  async cambiarEstado(empresa_id: number, id: number, estado: string) {
    if (!ESTADOS_VALIDOS.includes(estado)) {
      throw new BadRequestException(`Estado invalido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`);
    }
    const domicilio = await this.obtener(empresa_id, id);
    domicilio.estado = estado;
    if (estado === 'entregado') {
      domicilio.fecha_entrega = new Date();
    }
    return this.domiciliosRepo.save(domicilio);
  }
}
