import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity.js';
import { Empresa } from './empresa.entity.js';

@Entity('turnos')
export class Turno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  usuario_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'timestamp', name: 'fecha_inicio' })
  fecha_inicio: Date;

  @Column({ type: 'timestamp', name: 'fecha_fin', nullable: true })
  fecha_fin: Date;

  @Column({ name: 'caja_inicial', type: 'numeric', precision: 10, scale: 2, default: 0 })
  caja_inicial: number;

  @Column({ name: 'caja_final', type: 'numeric', precision: 10, scale: 2, nullable: true })
  caja_final: number;

  @Column({ name: 'total_ventas', type: 'numeric', precision: 10, scale: 2, default: 0 })
  total_ventas: number;

  @Column({ name: 'empresa_id' })
  empresa_id: number;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;
}
