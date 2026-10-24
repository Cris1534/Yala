import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Venta } from './venta.entity.js';

@Entity('facturas')
export class Factura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'venta_id', unique: true })
  venta_id: number;

  @OneToOne(() => Venta)
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @Column({ length: 50, unique: true })
  numero: string; // FAC-0001...

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  iva: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total: number;

  @CreateDateColumn()
  fecha: Date;
}
