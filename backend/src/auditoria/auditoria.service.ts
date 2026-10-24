import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria, Usuario } from '../entities/index.js';

export interface FiltroAuditoria {
  usuario_id?: number;
  modulo?: string;
  desde?: string;
  hasta?: string;
}

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private auditoriaRepo: Repository<Auditoria>,
  ) {}

  registrar(usuario_id: number | null, modulo: string, accion: string, detalle?: string, ip?: string) {
    const registro = this.auditoriaRepo.create({ usuario_id, modulo, accion, detalle, ip });
    return this.auditoriaRepo.save(registro).catch(() => undefined);
  }

  // La tabla auditoria no tiene empresa_id (asi lo define el schema original),
  // por eso se filtra por tenant uniendo con usuarios para no filtrar datos entre empresas.
  findAll(empresa_id: number, filtro: FiltroAuditoria) {
    const qb = this.auditoriaRepo
      .createQueryBuilder('a')
      .innerJoin(Usuario, 'u', 'u.id = a.usuario_id')
      .where('u.empresa_id = :empresa_id', { empresa_id });

    if (filtro.usuario_id) qb.andWhere('a.usuario_id = :usuario_id', { usuario_id: filtro.usuario_id });
    if (filtro.modulo) qb.andWhere('a.modulo = :modulo', { modulo: filtro.modulo });
    if (filtro.desde) qb.andWhere('a.fecha >= :desde', { desde: filtro.desde });
    if (filtro.hasta) qb.andWhere('a.fecha <= :hasta', { hasta: filtro.hasta });

    return qb.orderBy('a.fecha', 'DESC').take(500).getMany();
  }
}
