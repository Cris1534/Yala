import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/index.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import { LogsService } from '../logs/logs.service.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepo: Repository<Usuario>,
    private jwtService: JwtService,
    private auditoriaService: AuditoriaService,
    private logsService: LogsService,
  ) {}

  async register(dto: RegisterDto) {
    const existente = await this.usuariosRepo.findOne({ where: { email: dto.email } });
    if (existente) {
      throw new ConflictException('El email ya esta registrado');
    }

    const hash = await bcrypt.hash(dto.password, 10);
    const usuario = this.usuariosRepo.create({
      nombre: dto.nombre,
      email: dto.email,
      password: hash,
      rol: dto.rol,
      empresa_id: dto.empresa_id,
    });
    const guardado = await this.usuariosRepo.save(usuario);
    return this.toPublicUser(guardado);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosRepo.findOne({ where: { email: dto.email } });
    if (!usuario) {
      this.logsService.registrar('security', 'Auth', `Login fallido: ${dto.email} no existe`);
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.password);
    if (!passwordValida) {
      this.logsService.registrar('security', 'Auth', `Login fallido: password incorrecta (${dto.email})`);
      this.auditoriaService.registrar(usuario.id, 'Acceso', 'Login fallido', 'Password incorrecta');
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      empresa_id: usuario.empresa_id,
    };

    this.auditoriaService.registrar(usuario.id, 'Acceso', 'Login exitoso');

    return {
      access_token: this.jwtService.sign(payload),
      usuario: this.toPublicUser(usuario),
    };
  }

  private toPublicUser(usuario: Usuario) {
    const { password, ...publico } = usuario;
    return publico;
  }
}
