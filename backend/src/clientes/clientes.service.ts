import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente, Direccion, Venta } from '../entities/index.js';

export interface ClienteInput {
  nombre: string;
  telefono?: string;
  email?: string;
}

export interface DireccionInput {
  direccion: string;
  referencia?: string;
  ciudad?: string;
}

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clientesRepo: Repository<Cliente>,
    @InjectRepository(Direccion)
    private direccionesRepo: Repository<Direccion>,
    @InjectRepository(Venta)
    private ventasRepo: Repository<Venta>,
  ) {}

  create(empresa_id: number, data: ClienteInput) {
    const cliente = this.clientesRepo.create({ ...data, empresa_id });
    return this.clientesRepo.save(cliente);
  }

  findAll(empresa_id: number) {
    return this.clientesRepo.find({ where: { empresa_id }, order: { nombre: 'ASC' } });
  }

  async findOne(empresa_id: number, id: number) {
    const cliente = await this.clientesRepo.findOne({ where: { id, empresa_id } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async update(empresa_id: number, id: number, data: Partial<ClienteInput>) {
    const cliente = await this.findOne(empresa_id, id);
    Object.assign(cliente, data);
    return this.clientesRepo.save(cliente);
  }

  async agregarDireccion(empresa_id: number, cliente_id: number, data: DireccionInput) {
    await this.findOne(empresa_id, cliente_id);
    const direccion = this.direccionesRepo.create({ ...data, cliente_id });
    return this.direccionesRepo.save(direccion);
  }

  async direcciones(empresa_id: number, cliente_id: number) {
    await this.findOne(empresa_id, cliente_id);
    return this.direccionesRepo.find({ where: { cliente_id } });
  }

  async historial(empresa_id: number, cliente_id: number) {
    await this.findOne(empresa_id, cliente_id);
    const ventas = await this.ventasRepo.find({
      where: { cliente_id, empresa_id },
      order: { fecha: 'DESC' },
    });
    const totalComprado = ventas.reduce((acc, v) => acc + Number(v.total), 0);
    return { ventas, total_compras: ventas.length, total_comprado: totalComprado };
  }
}
