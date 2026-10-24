import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('auditoria')
export class Auditoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id', type: 'int', nullable: true })
  usuario_id: number | null;

  @Column({ length: 100 })
  modulo: string;

  @Column({ length: 100 })
  accion: string;

  @Column({ type: 'text', nullable: true })
  detalle: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip: string | null;

  @CreateDateColumn()
  fecha: Date;
}
