import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { EmpresasModule } from './empresas/empresas.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { ProveedoresModule } from './proveedores/proveedores.module.js';
import { ProductosModule } from './productos/productos.module.js';
import { InventarioLotesModule } from './inventario-lotes/inventario-lotes.module.js';
import { VentasModule } from './ventas/ventas.module.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { EmpleadosModule } from './empleados/empleados.module.js';
import { ContratosModule } from './contratos/contratos.module.js';
import { NominaModule } from './nomina/nomina.module.js';
import { TurnosModule } from './turnos/turnos.module.js';
import { DomiciliosModule } from './domicilios/domicilios.module.js';
import { AuditoriaModule } from './auditoria/auditoria.module.js';
import { LogsModule } from './logs/logs.module.js';
import { InformesModule } from './informes/informes.module.js';
import * as entities from './entities/index.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'yala',
      entities: Object.values(entities),
      synchronize: false,
    }),
    AuditoriaModule,
    LogsModule,
    AuthModule,
    EmpresasModule,
    UsuariosModule,
    CategoriasModule,
    ProveedoresModule,
    ProductosModule,
    InventarioLotesModule,
    TurnosModule,
    VentasModule,
    ClientesModule,
    EmpleadosModule,
    ContratosModule,
    NominaModule,
    DomiciliosModule,
    InformesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
