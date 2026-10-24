import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Venta } from './venta.entity.js';
import { Direccion } from './direccion.entity.js';
import { Usuario } from './usuario.entity.js';

@Entity('domicilios')
export class Domicilio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'venta_id' })
  venta_id: number;

  @ManyToOne(() => Venta)
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @Column({ name: 'direccion_id' })
  direccion_id: number;

  @ManyToOne(() => Direccion)
  @JoinColumn({ name: 'direccion_id' })
  direccion: Direccion;

  @Column({ name: 'repartidor_id', nullable: true })
  repartidor_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'repartidor_id' })
  repartidor: Usuario;

  @Column({ length: 50, default: 'pendiente' })
  estado: string; // pendiente | en_camino | entregado | cancelado

  @Column({ name: 'costo_envio', type: 'numeric', precision: 10, scale: 2, default: 0 })
  costo_envio: number;

  @Column({ type: 'timestamp', name: 'fecha_entrega', nullable: true })
  fecha_entrega: Date;
}
