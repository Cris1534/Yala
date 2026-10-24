import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Log } from '../entities/index.js';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private logsRepo: Repository<Log>,
  ) {}

  registrar(tipo: 'error' | 'warning' | 'info' | 'security', modulo: string, mensaje: string, stack?: string) {
    const log = this.logsRepo.create({ tipo, modulo, mensaje, stack });
    return this.logsRepo.save(log).catch(() => undefined);
  }

  findAll(tipo?: string) {
    const where: FindOptionsWhere<Log> = {};
    if (tipo) where.tipo = tipo;
    return this.logsRepo.find({ where, order: { fecha: 'DESC' }, take: 500 });
  }
}
