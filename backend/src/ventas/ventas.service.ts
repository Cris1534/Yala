import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DetalleVenta, Factura, Producto, Venta } from '../entities/index.js';
import { TurnosService } from '../turnos/turnos.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';

const IVA_RATE = 0.19;

export interface ItemVentaInput {
  producto_id: number;
  cantidad: number;
}

export interface CrearVentaInput {
  items: ItemVentaInput[];
  cliente_id?: number;
}

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventasRepo: Repository<Venta>,
    private dataSource: DataSource,
    private turnosService: TurnosService,
    private auditoriaService: AuditoriaService,
  ) {}

  async crear(empresa_id: number, usuario_id: number, input: CrearVentaInput) {
    if (!input.items?.length) {
      throw new BadRequestException('La venta debe tener al menos un producto');
    }

    const turno = await this.turnosService.activo(usuario_id);
    if (!turno) {
      throw new BadRequestException('Debes abrir un turno antes de vender');
    }

    return this.dataSource.transaction(async (manager) => {
      let subtotal = 0;
      const items: { producto_id: number; cantidad: number; precio: number; subtotal: number }[] = [];

      for (const item of input.items) {
        if (item.cantidad <= 0) {
          throw new BadRequestException('La cantidad debe ser mayor a cero');
        }

        const producto = await manager.findOne(Producto, {
          where: { id: item.producto_id, empresa_id },
        });
        if (!producto) {
          throw new NotFoundException(`Producto ${item.producto_id} no encontrado`);
        }
        if (producto.stock < item.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock})`,
          );
        }

        const precio = Number(producto.precio_venta);
        const subtotalItem = Math.round(precio * item.cantidad * 100) / 100;
        subtotal += subtotalItem;
        items.push({ producto_id: producto.id, cantidad: item.cantidad, precio, subtotal: subtotalItem });

        producto.stock -= item.cantidad;
        await manager.save(producto);
      }

      const iva = Math.round(subtotal * IVA_RATE * 100) / 100;
      const total = Math.round((subtotal + iva) * 100) / 100;

      const venta = manager.create(Venta, {
        cliente_id: input.cliente_id,
        usuario_id,
        turno_id: turno.id,
        subtotal,
        iva,
        total,
        estado: 'completada',
        empresa_id,
      });
      const ventaGuardada = await manager.save(venta);

      for (const item of items) {
        const detalle = manager.create(DetalleVenta, { ...item, venta_id: ventaGuardada.id });
        await manager.save(detalle);
      }

      const totalFacturas = await manager.count(Factura);
      const numero = `FAC-${String(totalFacturas + 1).padStart(4, '0')}`;
      const factura = manager.create(Factura, {
        venta_id: ventaGuardada.id,
        numero,
        subtotal,
        iva,
        total,
      });
      const facturaGuardada = await manager.save(factura);

      this.auditoriaService.registrar(
        usuario_id,
        'Ventas',
        'Venta creada',
        `Factura ${numero} — total $${total}`,
      );

      return { venta: ventaGuardada, factura: facturaGuardada, detalle: items };
    });
  }

  async findAll(empresa_id: number) {
    const ventas = await this.ventasRepo.find({
      where: { empresa_id },
      relations: { usuario: true, cliente: true },
      order: { fecha: 'DESC' },
    });
    return ventas.map((v) => this.ocultarPassword(v));
  }

  async findOne(empresa_id: number, id: number) {
    const venta = await this.ventasRepo.findOne({
      where: { id, empresa_id },
      relations: { usuario: true, cliente: true },
    });
    if (!venta) throw new NotFoundException('Venta no encontrada');

    const detalle = await this.dataSource.getRepository(DetalleVenta).find({
      where: { venta_id: id },
      relations: { producto: true },
    });
    const factura = await this.dataSource
      .getRepository(Factura)
      .findOne({ where: { venta_id: id } });

    return { ...this.ocultarPassword(venta), detalle, factura };
  }

  private ocultarPassword(venta: Venta) {
    return {
      ...venta,
      usuario: venta.usuario
        ? { id: venta.usuario.id, nombre: venta.usuario.nombre, rol: venta.usuario.rol }
        : null,
    };
  }
}
