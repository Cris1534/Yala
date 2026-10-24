import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empleado } from './empleado.entity.js';

@Entity('contratos')
export class Contrato {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empleado_id' })
  empleado_id: number;

  @ManyToOne(() => Empleado)
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;

  @Column({ length: 50 })
  tipo: string; // fijo | comision | mixto

  @Column({ name: 'salario_base', type: 'numeric', precision: 10, scale: 2, default: 0 })
  salario_base: number;

  @Column({ name: 'porcentaje_comision', type: 'numeric', precision: 5, scale: 2, default: 0 })
  porcentaje_comision: number;

  @Column({ type: 'date', name: 'fecha_inicio' })
  fecha_inicio: string;

  @Column({ type: 'date', name: 'fecha_fin', nullable: true })
  fecha_fin: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;
}
