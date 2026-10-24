import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { LogsService } from './logs.service.js';

@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogsController {
  constructor(private logsService: LogsService) {}

  @Get()
  findAll(@Query('tipo') tipo?: string) {
    return this.logsService.findAll(tipo);
  }
}
