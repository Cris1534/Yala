import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Inventario() {
  const [tab, setTab] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [stockBajo, setStockBajo] = useState([]);
  const [vencimientos, setVencimientos] = useState([]);
  const [error, setError] = useState('');

  async function cargarTodo() {
    try {
      const [p, c, pr, sb, ve] = await Promise.all([
        api.get('/productos'),
        api.get('/categorias'),
        api.get('/proveedores'),
        api.get('/productos/alertas/stock-bajo'),
        api.get('/inventario-lotes/vencimiento'),
      ]);
      setProductos(p.data);
      setCategorias(c.data);
      setProveedores(pr.data);
      setStockBajo(sb.data);
      setVencimientos(ve.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error cargando inventario');
    }
  }

  useEffect(() => {
    cargarTodo();
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>YALA ERP</h1>
        <Link to="/dashboard" className="back-link">
          ← Dashboard
        </Link>
      </header>

      <main className="dashboard-content">
        <h2>Inventario</h2>

        {(stockBajo.length > 0 || vencimientos.length > 0) && (
          <div className="alertas">
            {stockBajo.length > 0 && (
              <div className="alerta alerta-warning">
                ⚠ {stockBajo.length} producto(s) con stock bajo:{' '}
                {stockBajo.map((p) => p.nombre).join(', ')}
              </div>
            )}
            {vencimientos.length > 0 && (
              <div className="alerta alerta-danger">
                ⏰ {vencimientos.length} lote(s) por vencer:{' '}
                {vencimientos.map((l) => `${l.producto?.nombre} (${l.fecha_vencimiento})`).join(', ')}
              </div>
            )}
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <div className="tabs">
          {['productos', 'categorias', 'proveedores', 'lotes'].map((t) => (
            <button
              key={t}
              className={tab === t ? 'tab active' : 'tab'}
              onClick={() => setTab(t)}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'productos' && (
          <ProductosPanel productos={productos} categorias={categorias} onChange={cargarTodo} />
        )}
        {tab === 'categorias' && (
          <CategoriasPanel categorias={categorias} onChange={cargarTodo} />
        )}
        {tab === 'proveedores' && (
          <ProveedoresPanel proveedores={proveedores} onChange={cargarTodo} />
        )}
        {tab === 'lotes' && (
          <LotesPanel productos={productos} proveedores={proveedores} onChange={cargarTodo} />
        )}
      </main>
    </div>
  );
}

function ProductosPanel({ productos, categorias, onChange }) {
  const [nombre, setNombre] = useState('');
  const [codigoBarra, setCodigoBarra] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [stockMinimo, setStockMinimo] = useState(5);
  const [categoriaId, setCategoriaId] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    await api.post('/productos', {
      nombre,
      codigo_barra: codigoBarra || undefined,
      precio_compra: precioCompra ? Number(precioCompra) : 0,
      precio_venta: Number(precioVenta),
      stock_minimo: Number(stockMinimo),
      categoria_id: categoriaId ? Number(categoriaId) : undefined,
    });
    setNombre('');
    setCodigoBarra('');
    setPrecioCompra('');
    setPrecioVenta('');
    onChange();
  }

  return (
    <div className="panel">
      <form className="inline-form" onSubmit={handleSubmit}>
        <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <input placeholder="Codigo de barra" value={codigoBarra} onChange={(e) => setCodigoBarra(e.target.value)} />
        <input placeholder="Precio compra" type="number" value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} />
        <input placeholder="Precio venta" type="number" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} required />
        <input placeholder="Stock minimo" type="number" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} />
        <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
          <option value="">Sin categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <button type="submit">Agregar producto</button>
      </form>

      <table className="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Codigo</th>
            <th>Categoria</th>
            <th>Precio venta</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id} className={p.stock <= p.stock_minimo ? 'fila-alerta' : ''}>
              <td>{p.nombre}</td>
              <td>{p.codigo_barra || '-'}</td>
              <td>{p.categoria?.nombre || '-'}</td>
              <td>${Number(p.precio_venta).toLocaleString()}</td>
              <td>{p.stock} (min {p.stock_minimo})</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoriasPanel({ categorias, onChange }) {
  const [nombre, setNombre] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    await api.post('/categorias', { nombre });
    setNombre('');
    onChange();
  }

  async function eliminar(id) {
    await api.delete(`/categorias/${id}`);
    onChange();
  }

  return (
    <div className="panel">
      <form className="inline-form" onSubmit={handleSubmit}>
        <input placeholder="Nombre de la categoria" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <button type="submit">Agregar categoria</button>
      </form>

      <ul className="lista-chips">
        {categorias.map((c) => (
          <li key={c.id} className="chip">
            {c.nombre}
            <button className="chip-remove" onClick={() => eliminar(c.id)}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProveedoresPanel({ proveedores, onChange }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    await api.post('/proveedores', { nombre, telefono: telefono || undefined, email: email || undefined });
    setNombre('');
    setTelefono('');
    setEmail('');
    onChange();
  }

  return (
    <div className="panel">
      <form className="inline-form" onSubmit={handleSubmit}>
        <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <input placeholder="Telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit">Agregar proveedor</button>
      </form>

      <table className="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Telefono</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.telefono || '-'}</td>
              <td>{p.email || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LotesPanel({ productos, proveedores, onChange }) {
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [mensaje, setMensaje] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje('');
    await api.post('/inventario-lotes', {
      producto_id: Number(productoId),
      cantidad: Number(cantidad),
      fecha_vencimiento: fechaVencimiento || undefined,
      proveedor_id: proveedorId ? Number(proveedorId) : undefined,
    });
    setMensaje('Lote registrado, stock actualizado.');
    setCantidad('');
    setFechaVencimiento('');
    onChange();
  }

  return (
    <div className="panel">
      <form className="inline-form" onSubmit={handleSubmit}>
        <select value={productoId} onChange={(e) => setProductoId(e.target.value)} required>
          <option value="">Producto...</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        <input placeholder="Cantidad" type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
        <input placeholder="Vencimiento" type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
        <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
          <option value="">Sin proveedor</option>
          {proveedores.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        <button type="submit">Registrar lote</button>
      </form>
      {mensaje && <p className="link">{mensaje}</p>}
      <p className="subtitle">Al registrar un lote, el stock del producto sube automaticamente.</p>
    </div>
  );
}
