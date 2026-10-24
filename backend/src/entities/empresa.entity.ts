import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ name: 'tipo_negocio', length: 100, nullable: true })
  tipo_negocio: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;
}
