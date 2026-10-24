import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from './empresa.entity.js';
import { Categoria } from './categoria.entity.js';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ name: 'codigo_barra', length: 100, unique: true, nullable: true })
  codigo_barra: string;

  @Column({ name: 'precio_compra', type: 'numeric', precision: 10, scale: 2, default: 0 })
  precio_compra: number;

  @Column({ name: 'precio_venta', type: 'numeric', precision: 10, scale: 2 })
  precio_venta: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'stock_minimo', type: 'int', default: 5 })
  stock_minimo: number;

  @Column({ name: 'categoria_id', nullable: true })
  categoria_id: number;

  @ManyToOne(() => Categoria)
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  @Column({ name: 'empresa_id' })
  empresa_id: number;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;
}
