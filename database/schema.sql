-- ============================================================
-- YALA ERP - Base de Datos Completa (PostgreSQL)
-- 19 tablas, segun YALA_ERP_Base_de_Datos_SQL.docx
-- ============================================================

CREATE TABLE empresas (
    id               SERIAL PRIMARY KEY,
    nombre           VARCHAR(255) NOT NULL,
    tipo_negocio     VARCHAR(100),
    fecha_creacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100),
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    rol         VARCHAR(50) NOT NULL, -- admin | asesor | repartidor
    empresa_id  INT NOT NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE suscripciones (
    id           SERIAL PRIMARY KEY,
    empresa_id   INT NOT NULL,
    tipo         VARCHAR(20) NOT NULL, -- trial | basico | pro | enterprise
    fecha_inicio DATE NOT NULL,
    fecha_fin    DATE NOT NULL,
    estado       VARCHAR(20) DEFAULT 'activa', -- activa | vencida | suspendida
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE categorias (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    empresa_id  INT NOT NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE proveedores (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(255) NOT NULL,
    telefono    VARCHAR(50),
    email       VARCHAR(100),
    direccion   TEXT,
    empresa_id  INT NOT NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE productos (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(255) NOT NULL,
    codigo_barra    VARCHAR(100) UNIQUE,
    precio_compra   NUMERIC(10,2) DEFAULT 0,
    precio_venta    NUMERIC(10,2) NOT NULL,
    stock           INT DEFAULT 0,
    stock_minimo    INT DEFAULT 5,
    categoria_id    INT,
    empresa_id      INT NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (empresa_id)   REFERENCES empresas(id)
);

CREATE TABLE inventario_lotes (
    id                  SERIAL PRIMARY KEY,
    producto_id         INT NOT NULL,
    cantidad            INT NOT NULL,
    fecha_ingreso       DATE DEFAULT CURRENT_DATE,
    fecha_vencimiento   DATE,
    proveedor_id        INT,
    FOREIGN KEY (producto_id)  REFERENCES productos(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

CREATE TABLE clientes (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    telefono    VARCHAR(50),
    email       VARCHAR(100),
    empresa_id  INT NOT NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE direcciones (
    id          SERIAL PRIMARY KEY,
    cliente_id  INT NOT NULL,
    direccion   TEXT NOT NULL,
    referencia  TEXT,
    ciudad      VARCHAR(100),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE empleados (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    documento       VARCHAR(50) UNIQUE,
    cargo           VARCHAR(100),
    fecha_ingreso   DATE DEFAULT CURRENT_DATE,
    activo          BOOLEAN DEFAULT TRUE,
    empresa_id      INT NOT NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE contratos (
    id                      SERIAL PRIMARY KEY,
    empleado_id             INT NOT NULL,
    tipo                    VARCHAR(50) NOT NULL, -- fijo | comision | mixto
    salario_base            NUMERIC(10,2) DEFAULT 0,
    porcentaje_comision     NUMERIC(5,2) DEFAULT 0,
    fecha_inicio            DATE NOT NULL,
    fecha_fin               DATE,
    activo                  BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id)
);

CREATE TABLE turnos (
    id              SERIAL PRIMARY KEY,
    usuario_id      INT NOT NULL,
    fecha_inicio    TIMESTAMP NOT NULL,
    fecha_fin       TIMESTAMP,
    caja_inicial    NUMERIC(10,2) DEFAULT 0,
    caja_final      NUMERIC(10,2),
    total_ventas    NUMERIC(10,2) DEFAULT 0,
    empresa_id      INT NOT NULL,
    FOREIGN KEY (usuario_id)  REFERENCES usuarios(id),
    FOREIGN KEY (empresa_id)  REFERENCES empresas(id)
);

CREATE TABLE ventas (
    id          SERIAL PRIMARY KEY,
    cliente_id  INT,
    usuario_id  INT NOT NULL,
    turno_id    INT,
    subtotal    NUMERIC(10,2) NOT NULL,
    iva         NUMERIC(10,2) DEFAULT 0,
    total       NUMERIC(10,2) NOT NULL,
    estado      VARCHAR(30) DEFAULT 'completada', -- completada | anulada | pendiente_revision
    fecha       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    empresa_id  INT NOT NULL,
    FOREIGN KEY (cliente_id)  REFERENCES clientes(id),
    FOREIGN KEY (usuario_id)  REFERENCES usuarios(id),
    FOREIGN KEY (turno_id)    REFERENCES turnos(id),
    FOREIGN KEY (empresa_id)  REFERENCES empresas(id)
);

CREATE TABLE detalle_venta (
    id          SERIAL PRIMARY KEY,
    venta_id    INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad    INT NOT NULL,
    precio      NUMERIC(10,2) NOT NULL,
    subtotal    NUMERIC(10,2) NOT NULL,
    FOREIGN KEY (venta_id)    REFERENCES ventas(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE facturas (
    id          SERIAL PRIMARY KEY,
    venta_id    INT NOT NULL UNIQUE,
    numero      VARCHAR(50) NOT NULL UNIQUE,
    subtotal    NUMERIC(10,2) NOT NULL,
    iva         NUMERIC(10,2) NOT NULL,
    total       NUMERIC(10,2) NOT NULL,
    fecha       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venta_id) REFERENCES ventas(id)
);

CREATE TABLE domicilios (
    id              SERIAL PRIMARY KEY,
    venta_id        INT NOT NULL,
    direccion_id    INT NOT NULL,
    repartidor_id   INT,
    estado          VARCHAR(50) DEFAULT 'pendiente', -- pendiente | en_camino | entregado | cancelado
    costo_envio     NUMERIC(10,2) DEFAULT 0,
    fecha_entrega   TIMESTAMP,
    FOREIGN KEY (venta_id)      REFERENCES ventas(id),
    FOREIGN KEY (direccion_id)  REFERENCES direcciones(id),
    FOREIGN KEY (repartidor_id) REFERENCES usuarios(id)
);

CREATE TABLE nomina (
    id              SERIAL PRIMARY KEY,
    empleado_id     INT NOT NULL,
    contrato_id     INT NOT NULL,
    periodo_inicio  DATE NOT NULL,
    periodo_fin     DATE NOT NULL,
    salario_base    NUMERIC(10,2) DEFAULT 0,
    comisiones      NUMERIC(10,2) DEFAULT 0,
    deducciones     NUMERIC(10,2) DEFAULT 0,
    total_pago      NUMERIC(10,2) NOT NULL,
    estado          VARCHAR(30) DEFAULT 'pendiente', -- pendiente | pagado
    fecha_pago      DATE,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id),
    FOREIGN KEY (contrato_id) REFERENCES contratos(id)
);

CREATE TABLE auditoria (
    id          SERIAL PRIMARY KEY,
    usuario_id  INT,
    modulo      VARCHAR(100) NOT NULL,
    accion      VARCHAR(100) NOT NULL,
    detalle     TEXT,
    ip          VARCHAR(50),
    fecha       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logs (
    id          SERIAL PRIMARY KEY,
    tipo        VARCHAR(20) NOT NULL, -- error | warning | info | security
    modulo      VARCHAR(100),
    mensaje     TEXT NOT NULL,
    stack       TEXT,
    fecha       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
