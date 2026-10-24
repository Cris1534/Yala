import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Venta } from './venta.entity.js';
import { Producto } from './producto.entity.js';

@Entity('detalle_venta')
export class DetalleVenta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'venta_id' })
  venta_id: number;

  @ManyToOne(() => Venta)
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @Column({ name: 'producto_id' })
  producto_id: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  precio: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  subtotal: number;
}
