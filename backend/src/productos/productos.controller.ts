import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ProductosService, type ProductoInput } from './productos.service.js';

@UseGuards(JwtAuthGuard)
@Controller('productos')
export class ProductosController {
  constructor(private productosService: ProductosService) {}

  @Post()
  create(@Req() req: any, @Body() body: ProductoInput) {
    return this.productosService.create(req.user.empresa_id, body);
  }

  @Get()
  findAll(@Req() req: any, @Query('categoria_id') categoriaId?: string) {
    return this.productosService.findAll(
      req.user.empresa_id,
      categoriaId ? +categoriaId : undefined,
    );
  }

  @Get('alertas/stock-bajo')
  stockBajo(@Req() req: any) {
    return this.productosService.stockBajo(req.user.empresa_id);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.productosService.findOne(req.user.empresa_id, +id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: Partial<ProductoInput>) {
    return this.productosService.update(req.user.empresa_id, +id, body);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.productosService.remove(req.user.empresa_id, +id);
  }
}
