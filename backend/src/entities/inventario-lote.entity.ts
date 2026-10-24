import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from './producto.entity.js';
import { Proveedor } from './proveedor.entity.js';

@Entity('inventario_lotes')
export class InventarioLote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'producto_id' })
  producto_id: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'date', name: 'fecha_ingreso', default: () => 'CURRENT_DATE' })
  fecha_ingreso: string;

  @Column({ type: 'date', name: 'fecha_vencimiento', nullable: true })
  fecha_vencimiento: string;

  @Column({ name: 'proveedor_id', nullable: true })
  proveedor_id: number;

  @ManyToOne(() => Proveedor)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;
}
