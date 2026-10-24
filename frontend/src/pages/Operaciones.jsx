import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const ESTADOS = ['pendiente', 'en_camino', 'entregado', 'cancelado'];

export default function Operaciones() {
  const [tab, setTab] = useState('turnos');

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>YALA ERP</h1>
        <Link to="/dashboard" className="back-link">← Dashboard</Link>
      </header>

      <main className="dashboard-content">
        <h2>Operaciones</h2>

        <div className="tabs">
          <button className={tab === 'turnos' ? 'tab active' : 'tab'} onClick={() => setTab('turnos')}>
            Turnos
          </button>
          <button className={tab === 'domicilios' ? 'tab active' : 'tab'} onClick={() => setTab('domicilios')}>
            Domicilios
          </button>
        </div>

        {tab === 'turnos' && <Turnos />}
        {tab === 'domicilios' && <Domicilios />}
      </main>
    </div>
  );
}

function Turnos() {
  const [activo, setActivo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cajaInicial, setCajaInicial] = useState('');
  const [cajaFinal, setCajaFinal] = useState('');
  const [error, setError] = useState('');

  async function cargar() {
    const [a, h] = await Promise.all([api.get('/turnos/activo'), api.get('/turnos')]);
    setActivo(a.data);
    setHistorial(h.data);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function abrir(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/turnos/abrir', { caja_inicial: cajaInicial ? Number(cajaInicial) : 0 });
      setCajaInicial('');
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo abrir el turno');
    }
  }

  async function cerrar(e) {
    e.preventDefault();
    await api.patch(`/turnos/${activo.id}/cerrar`, { caja_final: cajaFinal ? Number(cajaFinal) : 0 });
    setCajaFinal('');
    cargar();
  }

  return (
    <div className="panel">
      {error && <div className="error">{error}</div>}

      {!activo && (
        <form className="inline-form" onSubmit={abrir}>
          <input placeholder="Caja inicial" type="number" value={cajaInicial} onChange={(e) => setCajaInicial(e.target.value)} />
          <button type="submit">Abrir turno</button>
        </form>
      )}

      {activo && (
        <div className="alerta alerta-warning" style={{ marginBottom: '1rem' }}>
          Turno abierto desde {new Date(activo.fecha_inicio).toLocaleString()} — caja inicial $
          {Number(activo.caja_inicial).toLocaleString()}
          <form className="inline-form" onSubmit={cerrar} style={{ marginTop: '0.75rem' }}>
            <input placeholder="Caja final" type="number" value={cajaFinal} onChange={(e) => setCajaFinal(e.target.value)} />
            <button type="submit">Cerrar turno</button>
          </form>
        </div>
      )}

      <h3>Historial de turnos</h3>
      <table className="tabla">
        <thead>
          <tr><th>Asesor</th><th>Inicio</th><th>Fin</th><th>Caja inicial</th><th>Caja final</th><th>Total ventas</th></tr>
        </thead>
        <tbody>
          {historial.map((t) => (
            <tr key={t.id}>
              <td>{t.usuario?.nombre}</td>
              <td>{new Date(t.fecha_inicio).toLocaleString()}</td>
              <td>{t.fecha_fin ? new Date(t.fecha_fin).toLocaleString() : 'Abierto'}</td>
              <td>${Number(t.caja_inicial).toLocaleString()}</td>
              <td>{t.caja_final !== null ? `$${Number(t.caja_final).toLocaleString()}` : '-'}</td>
              <td>${Number(t.total_ventas).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Domicilios() {
  const [domicilios, setDomicilios] = useState([]);

  async function cargar() {
    const { data } = await api.get('/domicilios');
    setDomicilios(data);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cambiarEstado(id, estado) {
    await api.patch(`/domicilios/${id}/estado`, { estado });
    cargar();
  }

  return (
    <div className="panel">
      <table className="tabla">
        <thead>
          <tr><th>Venta</th><th>Direccion</th><th>Repartidor</th><th>Costo envio</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {domicilios.map((d) => (
            <tr key={d.id}>
              <td>#{d.venta_id}</td>
              <td>{d.direccion?.direccion} ({d.direccion?.ciudad})</td>
              <td>{d.repartidor?.nombre || 'Sin asignar'}</td>
              <td>${Number(d.costo_envio).toLocaleString()}</td>
              <td>
                <select value={d.estado} onChange={(e) => cambiarEstado(d.id, e.target.value)}>
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
          {domicilios.length === 0 && (
            <tr><td colSpan={5} style={{ color: 'var(--muted)' }}>Sin domicilios todavia</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
