import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from './empresa.entity.js';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  nombre: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ length: 50 })
  rol: string; // admin | asesor | repartidor

  @Column({ name: 'empresa_id' })
  empresa_id: number;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;
}
