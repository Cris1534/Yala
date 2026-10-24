import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class InformesService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async dashboard(empresa_id: number) {
    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);

    const ventasHoy = await this.dataSource.query(
      `SELECT COUNT(*)::int AS cantidad, COALESCE(SUM(total), 0)::float AS total
       FROM ventas WHERE empresa_id = $1 AND fecha >= $2 AND estado = 'completada'`,
      [empresa_id, hoyInicio],
    );

    const stockCritico = await this.dataSource.query(
      `SELECT id, nombre, stock, stock_minimo FROM productos
       WHERE empresa_id = $1 AND stock <= stock_minimo`,
      [empresa_id],
    );

    const domiciliosActivos = await this.dataSource.query(
      `SELECT COUNT(*)::int AS cantidad FROM domicilios d
       INNER JOIN ventas v ON v.id = d.venta_id
       WHERE v.empresa_id = $1 AND d.estado IN ('pendiente', 'en_camino')`,
      [empresa_id],
    );

    const turnoActivo = await this.dataSource.query(
      `SELECT t.id, t.fecha_inicio, t.caja_inicial, u.nombre AS asesor
       FROM turnos t INNER JOIN usuarios u ON u.id = t.usuario_id
       WHERE t.empresa_id = $1 AND t.fecha_fin IS NULL
       ORDER BY t.fecha_inicio DESC LIMIT 1`,
      [empresa_id],
    );

    const topProductos = await this.dataSource.query(
      `SELECT p.nombre, SUM(dv.cantidad)::int AS unidades, SUM(dv.subtotal)::float AS total
       FROM detalle_venta dv
       INNER JOIN productos p ON p.id = dv.producto_id
       INNER JOIN ventas v ON v.id = dv.venta_id
       WHERE v.empresa_id = $1 AND v.fecha >= $2
       GROUP BY p.nombre ORDER BY unidades DESC LIMIT 5`,
      [empresa_id, hoyInicio],
    );

    return {
      ventas_hoy: { cantidad: ventasHoy[0].cantidad, total: ventasHoy[0].total },
      stock_critico: stockCritico,
      domicilios_activos: domiciliosActivos[0].cantidad,
      turno_activo: turnoActivo[0] ?? null,
      top_productos: topProductos,
    };
  }

  async ventasPorPeriodo(empresa_id: number, desde: string, hasta: string) {
    return this.dataSource.query(
      `SELECT v.id, v.fecha, v.subtotal, v.iva, v.total, v.estado, u.nombre AS asesor
       FROM ventas v INNER JOIN usuarios u ON u.id = v.usuario_id
       WHERE v.empresa_id = $1 AND v.fecha BETWEEN $2 AND $3
       ORDER BY v.fecha DESC`,
      [empresa_id, desde, hasta],
    );
  }

  async ganancias(empresa_id: number, desde: string, hasta: string) {
    const filas = await this.dataSource.query(
      `SELECT p.nombre,
              SUM(dv.cantidad)::int AS unidades_vendidas,
              SUM(dv.subtotal)::float AS ingresos,
              SUM(p.precio_compra * dv.cantidad)::float AS costos
       FROM detalle_venta dv
       INNER JOIN productos p ON p.id = dv.producto_id
       INNER JOIN ventas v ON v.id = dv.venta_id
       WHERE v.empresa_id = $1 AND v.fecha BETWEEN $2 AND $3
       GROUP BY p.nombre ORDER BY ingresos DESC`,
      [empresa_id, desde, hasta],
    );

    const totales = filas.reduce(
      (acc: { ingresos: number; costos: number }, f: { ingresos: number; costos: number }) => ({
        ingresos: acc.ingresos + Number(f.ingresos),
        costos: acc.costos + Number(f.costos),
      }),
      { ingresos: 0, costos: 0 },
    );

    return {
      detalle: filas.map((f: { ingresos: number; costos: number; [k: string]: unknown }) => ({
        ...f,
        margen: Number(f.ingresos) - Number(f.costos),
      })),
      totales: { ...totales, margen: totales.ingresos - totales.costos },
    };
  }

  async inventarioActual(empresa_id: number) {
    return this.dataSource.query(
      `SELECT p.nombre, c.nombre AS categoria, p.stock, p.stock_minimo, p.precio_venta
       FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id
       WHERE p.empresa_id = $1 ORDER BY p.nombre`,
      [empresa_id],
    );
  }
}
