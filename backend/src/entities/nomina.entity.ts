import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empleado } from './empleado.entity.js';
import { Contrato } from './contrato.entity.js';

@Entity('nomina')
export class Nomina {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empleado_id' })
  empleado_id: number;

  @ManyToOne(() => Empleado)
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;

  @Column({ name: 'contrato_id' })
  contrato_id: number;

  @ManyToOne(() => Contrato)
  @JoinColumn({ name: 'contrato_id' })
  contrato: Contrato;

  @Column({ type: 'date', name: 'periodo_inicio' })
  periodo_inicio: string;

  @Column({ type: 'date', name: 'periodo_fin' })
  periodo_fin: string;

  @Column({ name: 'salario_base', type: 'numeric', precision: 10, scale: 2, default: 0 })
  salario_base: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  comisiones: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  deducciones: number;

  @Column({ name: 'total_pago', type: 'numeric', precision: 10, scale: 2 })
  total_pago: number;

  @Column({ length: 30, default: 'pendiente' })
  estado: string; // pendiente | pagado

  @Column({ type: 'date', name: 'fecha_pago', nullable: true })
  fecha_pago: string;
}
