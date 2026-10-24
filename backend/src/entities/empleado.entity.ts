import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from './empresa.entity.js';

@Entity('empleados')
export class Empleado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 50, unique: true, nullable: true })
  documento: string;

  @Column({ length: 100, nullable: true })
  cargo: string;

  @Column({ type: 'date', name: 'fecha_ingreso', default: () => 'CURRENT_DATE' })
  fecha_ingreso: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ name: 'empresa_id' })
  empresa_id: number;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;
}
