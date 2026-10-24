import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventarioLote, Producto } from '../entities/index.js';

export interface LoteInput {
  producto_id: number;
  cantidad: number;
  fecha_vencimiento?: string;
  proveedor_id?: number;
}

@Injectable()
export class InventarioLotesService {
  constructor(
    @InjectRepository(InventarioLote)
    private lotesRepo: Repository<InventarioLote>,
    @InjectRepository(Producto)
    private productosRepo: Repository<Producto>,
  ) {}

  async create(empresa_id: number, data: LoteInput) {
    const producto = await this.productosRepo.findOne({
      where: { id: data.producto_id, empresa_id },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    const lote = this.lotesRepo.create(data);
    const guardado = await this.lotesRepo.save(lote);

    producto.stock += data.cantidad;
    await this.productosRepo.save(producto);

    return guardado;
  }

  async findByProducto(empresa_id: number, producto_id: number) {
    const producto = await this.productosRepo.findOne({
      where: { id: producto_id, empresa_id },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    return this.lotesRepo.find({
      where: { producto_id },
      order: { fecha_vencimiento: 'ASC' },
    });
  }

  async proximosAVencer(empresa_id: number, dias = 7) {
    const limite = new Date();
    limite.setDate(limite.getDate() + dias);

    return this.lotesRepo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.producto', 'producto')
      .where('producto.empresa_id = :empresa_id', { empresa_id })
      .andWhere('l.fecha_vencimiento IS NOT NULL')
      .andWhere('l.fecha_vencimiento <= :limite', { limite: limite.toISOString().slice(0, 10) })
      .orderBy('l.fecha_vencimiento', 'ASC')
      .getMany();
  }
}
