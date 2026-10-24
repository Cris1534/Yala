# YALA ERP — Limitaciones y alcance

Las 9 fases del plan se implementaron y se probaron funcionalmente (API + compilación del frontend). Backend en NestJS + PostgreSQL, frontend en React + Vite. Los puntos siguientes son donde la implementación se desvía del documento original o quedó simplificada.

## Repositorio

Código en [github.com/Cris1534/Yala](https://github.com/Cris1534/Yala). Para compartir con el equipo, envía esa URL — el repo es público, se clona con `git clone https://github.com/Cris1534/Yala.git`. Incluye `install.ps1` para instalar dependencias automáticamente.

## Fase 9 — Modo offline

El documento original pedía PouchDB sincronizando contra una base CouchDB. Eso exigiría replicar el protocolo CouchDB sobre PostgreSQL, fuera de alcance razonable. En su lugar se implementó el mismo comportamiento con IndexedDB nativo: cola local de ventas, detección online/offline, sincronización automática en orden (FIFO) al reconectar, y marcado de conflictos cuando el servidor rechaza una venta (ej. stock insuficiente).

## RRHH — Nómina y comisiones

El esquema de base de datos no vincula `empleados` con `usuarios` (son tablas separadas), así que el sistema no puede calcular automáticamente las comisiones de un empleado a partir de sus ventas. Las comisiones y deducciones se ingresan manualmente al generar la nómina.

## Informes — exportación

Los reportes se exportan en CSV (se abre en Excel). No se generó export a PDF real: haría falta una librería de generación de PDF (ej. pdfkit) que no se incluyó por alcance.

## Facturación electrónica (DIAN)

El documento original ya definía esto como "base para integración futura", no como requisito a implementar ahora. El sistema calcula IVA y genera factura interna con numeración consecutiva, pero no se conecta a la API real de la DIAN.

## Interfaz — verificación visual

No hubo navegador disponible en este entorno para probar visualmente la interfaz. Se verificó que el frontend compila sin errores y que cada pantalla llama correctamente a la API (probado end-to-end desde la terminal), pero falta una prueba manual de click-through con capturas.
