import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Turno, Venta } from '../entities/index.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';

@Injectable()
export class TurnosService {
  constructor(
    @InjectRepository(Turno)
    private turnosRepo: Repository<Turno>,
    @InjectRepository(Venta)
    private ventasRepo: Repository<Venta>,
    private auditoriaService: AuditoriaService,
  ) {}

  async abrir(empresa_id: number, usuario_id: number, caja_inicial: number) {
    const abierto = await this.turnosRepo.findOne({
      where: { usuario_id, fecha_fin: IsNull() },
    });
    if (abierto) {
      throw new BadRequestException('Ya tienes un turno abierto');
    }

    const turno = this.turnosRepo.create({
      usuario_id,
      empresa_id,
      fecha_inicio: new Date(),
      caja_inicial: caja_inicial ?? 0,
    });
    const guardado = await this.turnosRepo.save(turno);
    this.auditoriaService.registrar(usuario_id, 'Turnos', 'Turno abierto', `Caja inicial: $${caja_inicial}`);
    return guardado;
  }

  async activo(usuario_id: number) {
    return this.turnosRepo.findOne({ where: { usuario_id, fecha_fin: IsNull() } });
  }

  async cerrar(empresa_id: number, usuario_id: number, id: number, caja_final: number) {
    const turno = await this.turnosRepo.findOne({ where: { id, empresa_id } });
    if (!turno) throw new NotFoundException('Turno no encontrado');
    if (turno.usuario_id !== usuario_id) {
      throw new BadRequestException('Solo puedes cerrar tu propio turno');
    }
    if (turno.fecha_fin) {
      throw new BadRequestException('El turno ya esta cerrado');
    }

    const ventas = await this.ventasRepo.find({ where: { turno_id: id } });
    const total_ventas = ventas.reduce((acc, v) => acc + Number(v.total), 0);

    turno.fecha_fin = new Date();
    turno.caja_final = caja_final ?? 0;
    turno.total_ventas = total_ventas;
    const guardado = await this.turnosRepo.save(turno);
    this.auditoriaService.registrar(
      usuario_id,
      'Turnos',
      'Turno cerrado',
      `Corte de caja: $${total_ventas} en ventas`,
    );
    return guardado;
  }

  async findAll(empresa_id: number) {
    const turnos = await this.turnosRepo.find({
      where: { empresa_id },
      relations: { usuario: true },
      order: { fecha_inicio: 'DESC' },
    });
    return turnos.map((t) => ({
      ...t,
      usuario: t.usuario ? { id: t.usuario.id, nombre: t.usuario.nombre, rol: t.usuario.rol } : null,
    }));
  }
}
