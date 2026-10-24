# YALA ERP

ERP SaaS multiempresa, offline-first, para tiendas, barberias, restaurantes y servicios.

## Stack

- **Backend**: NestJS + TypeORM + PostgreSQL (JWT, multiempresa, auditoria)
- **Frontend**: React + Vite (POS, inventario, RRHH, informes, offline con IndexedDB)
- **Base de datos**: PostgreSQL, 19 tablas (`database/schema.sql`)

## Instalacion rapida (Windows)

```powershell
./install.ps1
```

El script instala Git, Node.js y PostgreSQL si faltan (los omite si ya estan), instala las dependencias de `backend/` y `frontend/`, crea los `.env` desde `.env.example`, y crea + carga la base de datos `yala`.

## Instalacion manual

```bash
# Base de datos
psql -U postgres -c "CREATE DATABASE yala;"
psql -U postgres -d yala -f database/schema.sql

# Backend
cd backend
cp .env.example .env   # edita DB_PASSWORD y JWT_SECRET
npm install
npm run start:dev      # http://localhost:3000

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```

## Usuario de prueba

```
Email:    admin@test.com
Password: 123456
```

Si no existe en tu base de datos local, créalo desde `/registro` en el frontend (crea empresa + usuario admin en un solo paso).

## Modulos implementados

Autenticacion (JWT + roles) · Empresas/Multiempresa · Inventario (productos, categorias, lotes, alertas) · Ventas/POS (IVA, factura, descuento de stock) · Clientes · RRHH (empleados, contratos, nomina) · Turnos · Domicilios · Auditoria · Logs tecnicos · Informes (dashboard, ganancias, export CSV) · Modo offline (cola en IndexedDB con sincronizacion automatica).
