import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Cliente } from './cliente.entity.js';
import { Usuario } from './usuario.entity.js';
import { Turno } from './turno.entity.js';
import { Empresa } from './empresa.entity.js';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cliente_id', nullable: true })
  cliente_id: number;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ name: 'usuario_id' })
  usuario_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'turno_id', nullable: true })
  turno_id: number;

  @ManyToOne(() => Turno)
  @JoinColumn({ name: 'turno_id' })
  turno: Turno;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  iva: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total: number;

  @Column({ length: 30, default: 'completada' })
  estado: string; // completada | anulada | pendiente_revision

  @CreateDateColumn()
  fecha: Date;

  @Column({ name: 'empresa_id' })
  empresa_id: number;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;
}
