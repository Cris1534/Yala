import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { InformesService } from './informes.service.js';
import { aCsv } from './csv.util.js';

@UseGuards(JwtAuthGuard)
@Controller('informes')
export class InformesController {
  constructor(private informesService: InformesService) {}

  @Get('dashboard')
  dashboard(@Req() req: any) {
    return this.informesService.dashboard(req.user.empresa_id);
  }

  @Get('ventas')
  async ventas(
    @Req() req: any,
    @Res() res: Response,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    @Query('formato') formato?: string,
  ) {
    const filas = await this.informesService.ventasPorPeriodo(
      req.user.empresa_id,
      desde || '2000-01-01',
      hasta || '2100-01-01',
    );

    if (formato === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="ventas.csv"');
      return res.send(aCsv(filas));
    }
    return res.json(filas);
  }

  @Get('ganancias')
  ganancias(
    @Req() req: any,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.informesService.ganancias(
      req.user.empresa_id,
      desde || '2000-01-01',
      hasta || '2100-01-01',
    );
  }

  @Get('inventario')
  async inventario(@Req() req: any, @Res() res: Response, @Query('formato') formato?: string) {
    const filas = await this.informesService.inventarioActual(req.user.empresa_id);

    if (formato === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="inventario.csv"');
      return res.send(aCsv(filas));
    }
    return res.json(filas);
  }
}
