import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../entities/index.js';

export interface ProductoInput {
  nombre: string;
  codigo_barra?: string;
  precio_compra?: number;
  precio_venta: number;
  stock?: number;
  stock_minimo?: number;
  categoria_id?: number;
}

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepo: Repository<Producto>,
  ) {}

  create(empresa_id: number, data: ProductoInput) {
    const producto = this.productosRepo.create({ ...data, empresa_id });
    return this.productosRepo.save(producto);
  }

  findAll(empresa_id: number, categoria_id?: number) {
    return this.productosRepo.find({
      where: categoria_id ? { empresa_id, categoria_id } : { empresa_id },
      relations: { categoria: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(empresa_id: number, id: number) {
    const producto = await this.productosRepo.findOne({
      where: { id, empresa_id },
      relations: { categoria: true },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async update(empresa_id: number, id: number, data: Partial<ProductoInput>) {
    const producto = await this.findOne(empresa_id, id);
    Object.assign(producto, data);
    return this.productosRepo.save(producto);
  }

  async remove(empresa_id: number, id: number) {
    const producto = await this.findOne(empresa_id, id);
    await this.productosRepo.remove(producto);
    return { ok: true };
  }

  stockBajo(empresa_id: number) {
    return this.productosRepo
      .createQueryBuilder('p')
      .where('p.empresa_id = :empresa_id', { empresa_id })
      .andWhere('p.stock <= p.stock_minimo')
      .getMany();
  }
}
