import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  tipo: string; // error | warning | info | security

  @Column({ length: 100, nullable: true })
  modulo: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ type: 'text', nullable: true })
  stack: string;

  @CreateDateColumn()
  fecha: Date;
}
