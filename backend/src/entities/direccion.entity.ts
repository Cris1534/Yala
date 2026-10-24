import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cliente } from './cliente.entity.js';

@Entity('direcciones')
export class Direccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cliente_id' })
  cliente_id: number;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ type: 'text' })
  direccion: string;

  @Column({ type: 'text', nullable: true })
  referencia: string;

  @Column({ length: 100, nullable: true })
  ciudad: string;
}
