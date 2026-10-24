import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from './empresa.entity.js';

@Entity('suscripciones')
export class Suscripcion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empresa_id' })
  empresa_id: number;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ length: 20 })
  tipo: string; // trial | basico | pro | enterprise

  @Column({ type: 'date', name: 'fecha_inicio' })
  fecha_inicio: string;

  @Column({ type: 'date', name: 'fecha_fin' })
  fecha_fin: string;

  @Column({ length: 20, default: 'activa' })
  estado: string; // activa | vencida | suspendida
}
