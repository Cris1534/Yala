import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useOffline } from '../offline/OfflineContext';

const IVA_RATE = 0.19;

export default function Ventas() {
  const [tab, setTab] = useState('pos');
  const { pendientes, conflictos } = useOffline();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>YALA ERP</h1>
        <Link to="/dashboard" className="back-link">
          ← Dashboard
        </Link>
      </header>

      <main className="dashboard-content">
        <h2>Ventas</h2>

        <div className="tabs">
          <button className={tab === 'pos' ? 'tab active' : 'tab'} onClick={() => setTab('pos')}>
            Punto de venta
          </button>
          <button
            className={tab === 'historial' ? 'tab active' : 'tab'}
            onClick={() => setTab('historial')}
          >
            Historial
          </button>
          <button
            className={tab === 'offline' ? 'tab active' : 'tab'}
            onClick={() => setTab('offline')}
          >
            Cola offline {pendientes + conflictos > 0 ? `(${pendientes + conflictos})` : ''}
          </button>
        </div>

        {tab === 'pos' && <Pos />}
        {tab === 'historial' && <Historial />}
        {tab === 'offline' && <ColaOffline />}
      </main>
    </div>
  );
}

function Pos() {
  const { online, registrarVentaOffline } = useOffline();
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [carrito, setCarrito] = useState([]);
  const [error, setError] = useState('');
  const [factura, setFactura] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function cargarProductos() {
    const { data } = await api.get('/productos');
    setProductos(data);
  }

  useEffect(() => {
    cargarProductos();
    api.get('/clientes').then((res) => setClientes(res.data));
  }, []);

  function agregarAlCarrito(e) {
    e.preventDefault();
    setError('');
    const producto = productos.find((p) => p.id === Number(productoId));
    if (!producto) return;

    const cant = Number(cantidad);
    const yaEnCarrito = carrito.find((i) => i.producto_id === producto.id);
    const cantidadTotal = (yaEnCarrito?.cantidad || 0) + cant;

    if (cantidadTotal > producto.stock) {
      setError(`Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock})`);
      return;
    }

    if (yaEnCarrito) {
      setCarrito(
        carrito.map((i) =>
          i.producto_id === producto.id ? { ...i, cantidad: cantidadTotal } : i,
        ),
      );
    } else {
      setCarrito([
        ...carrito,
        {
          producto_id: producto.id,
          nombre: producto.nombre,
          precio_venta: Number(producto.precio_venta),
          cantidad: cant,
        },
      ]);
    }
    setProductoId('');
    setCantidad(1);
  }

  function quitarDelCarrito(producto_id) {
    setCarrito(carrito.filter((i) => i.producto_id !== producto_id));
  }

  const subtotal = carrito.reduce((acc, i) => acc + i.precio_venta * i.cantidad, 0);
  const iva = Math.round(subtotal * IVA_RATE * 100) / 100;
  const total = subtotal + iva;

  async function confirmarVenta() {
    setError('');
    setEnviando(true);
    const payload = {
      items: carrito.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      cliente_id: clienteId ? Number(clienteId) : undefined,
    };

    try {
      if (!online) {
        await registrarVentaOffline(payload);
        setFactura({ numero: 'Pendiente de sincronizar', total });
        // Descuento optimista del stock local: se confirma con el servidor al sincronizar.
        setProductos((prev) =>
          prev.map((p) => {
            const item = carrito.find((c) => c.producto_id === p.id);
            return item ? { ...p, stock: p.stock - item.cantidad } : p;
          }),
        );
        setCarrito([]);
        return;
      }

      const { data } = await api.post('/ventas', payload);
      setFactura(data.factura);
      setCarrito([]);
      await cargarProductos();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo completar la venta');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="panel">
      {!online && (
        <p className="subtitle" style={{ color: '#92400e' }}>
          Sin conexion: la venta se guardara en este dispositivo y se sincronizara automaticamente.
        </p>
      )}

      <div className="inline-form">
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Consumidor final</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      <form className="inline-form" onSubmit={agregarAlCarrito}>
        <select value={productoId} onChange={(e) => setProductoId(e.target.value)} required>
          <option value="">Producto...</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} — ${Number(p.precio_venta).toLocaleString()} (stock {p.stock})
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          style={{ width: '80px' }}
        />
        <button type="submit">Agregar</button>
      </form>

      {error && <div className="error">{error}</div>}

      {factura && (
        <div className="alerta" style={{ background: '#d1fae5', color: '#065f46' }}>
          ✓ Venta registrada — Factura {factura.numero} — Total $
          {Number(factura.total).toLocaleString()}
        </div>
      )}

      <table className="tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {carrito.map((i) => (
            <tr key={i.producto_id}>
              <td>{i.nombre}</td>
              <td>{i.cantidad}</td>
              <td>${i.precio_venta.toLocaleString()}</td>
              <td>${(i.precio_venta * i.cantidad).toLocaleString()}</td>
              <td>
                <button className="chip-remove" onClick={() => quitarDelCarrito(i.producto_id)}>
                  ×
                </button>
              </td>
            </tr>
          ))}
          {carrito.length === 0 && (
            <tr>
              <td colSpan={5} style={{ color: 'var(--muted)' }}>
                Carrito vacio
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {carrito.length > 0 && (
        <div className="pos-totales">
          <div>Subtotal: ${subtotal.toLocaleString()}</div>
          <div>IVA (19%): ${iva.toLocaleString()}</div>
          <div className="pos-total">Total: ${total.toLocaleString()}</div>
          <button onClick={confirmarVenta} disabled={enviando}>
            {enviando ? 'Procesando...' : 'Confirmar venta'}
          </button>
        </div>
      )}
    </div>
  );
}

function Historial() {
  const [ventas, setVentas] = useState([]);
  const [detalleAbierto, setDetalleAbierto] = useState(null);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    api.get('/ventas').then((res) => setVentas(res.data));
  }, []);

  async function verDetalle(id) {
    if (detalleAbierto === id) {
      setDetalleAbierto(null);
      return;
    }
    const { data } = await api.get(`/ventas/${id}`);
    setDetalle(data);
    setDetalleAbierto(id);
  }

  return (
    <div className="panel">
      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Subtotal</th>
            <th>IVA</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((v) => (
            <Fragment key={v.id}>
              <tr onClick={() => verDetalle(v.id)} style={{ cursor: 'pointer' }}>
                <td>{new Date(v.fecha).toLocaleString()}</td>
                <td>{v.usuario?.nombre}</td>
                <td>${Number(v.subtotal).toLocaleString()}</td>
                <td>${Number(v.iva).toLocaleString()}</td>
                <td>${Number(v.total).toLocaleString()}</td>
                <td>{v.estado}</td>
              </tr>
              {detalleAbierto === v.id && detalle && (
                <tr>
                  <td colSpan={6}>
                    <strong>Factura {detalle.factura?.numero}</strong>
                    <ul>
                      {detalle.detalle.map((d) => (
                        <li key={d.id}>
                          {d.producto?.nombre} x{d.cantidad} — ${Number(d.subtotal).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
          {ventas.length === 0 && (
            <tr>
              <td colSpan={6} style={{ color: 'var(--muted)' }}>
                Sin ventas todavia
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ColaOffline() {
  const { online, cola, sincronizando, sincronizar } = useOffline();

  return (
    <div className="panel">
      <p className="subtitle">
        Ventas registradas en este dispositivo mientras no habia conexion. Se sincronizan
        automaticamente al volver internet, en orden (la mas antigua primero).
      </p>

      <div className="inline-form">
        <button onClick={sincronizar} disabled={!online || sincronizando}>
          {sincronizando ? 'Sincronizando...' : 'Sincronizar ahora'}
        </button>
      </div>

      <table className="tabla">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Items</th>
            <th>Estado</th>
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {cola.map((item) => (
            <tr key={item.id} className={item.estado === 'conflicto' ? 'fila-alerta' : ''}>
              <td>{new Date(item.timestamp).toLocaleString()}</td>
              <td>{item.payload.items.reduce((acc, i) => acc + i.cantidad, 0)} unidad(es)</td>
              <td>{item.estado}</td>
              <td>{item.mensaje || '-'}</td>
            </tr>
          ))}
          {cola.length === 0 && (
            <tr>
              <td colSpan={4} style={{ color: 'var(--muted)' }}>
                Cola vacia — no hay ventas offline
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
