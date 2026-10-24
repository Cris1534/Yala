import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Informes() {
  const [tab, setTab] = useState('auditoria');

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>YALA ERP</h1>
        <Link to="/dashboard" className="back-link">← Dashboard</Link>
      </header>

      <main className="dashboard-content">
        <h2>Auditoria e Informes</h2>

        <div className="tabs">
          <button className={tab === 'auditoria' ? 'tab active' : 'tab'} onClick={() => setTab('auditoria')}>
            Auditoria
          </button>
          <button className={tab === 'ganancias' ? 'tab active' : 'tab'} onClick={() => setTab('ganancias')}>
            Ganancias
          </button>
          <button className={tab === 'exportar' ? 'tab active' : 'tab'} onClick={() => setTab('exportar')}>
            Exportar
          </button>
        </div>

        {tab === 'auditoria' && <Auditoria />}
        {tab === 'ganancias' && <Ganancias />}
        {tab === 'exportar' && <Exportar />}
      </main>
    </div>
  );
}

function Auditoria() {
  const [registros, setRegistros] = useState([]);
  const [modulo, setModulo] = useState('');

  async function cargar() {
    const { data } = await api.get('/auditoria', { params: modulo ? { modulo } : {} });
    setRegistros(data);
  }

  useEffect(() => {
    cargar();
  }, [modulo]);

  return (
    <div className="panel">
      <div className="inline-form">
        <select value={modulo} onChange={(e) => setModulo(e.target.value)}>
          <option value="">Todos los modulos</option>
          <option value="Acceso">Acceso</option>
          <option value="Ventas">Ventas</option>
          <option value="Turnos">Turnos</option>
        </select>
      </div>

      <table className="tabla">
        <thead>
          <tr><th>Fecha</th><th>Usuario</th><th>Modulo</th><th>Accion</th><th>Detalle</th></tr>
        </thead>
        <tbody>
          {registros.map((r) => (
            <tr key={r.id}>
              <td>{new Date(r.fecha).toLocaleString()}</td>
              <td>{r.usuario_id ?? 'sistema'}</td>
              <td>{r.modulo}</td>
              <td>{r.accion}</td>
              <td>{r.detalle || '-'}</td>
            </tr>
          ))}
          {registros.length === 0 && (
            <tr><td colSpan={5} style={{ color: 'var(--muted)' }}>Sin registros</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Ganancias() {
  const [desde, setDesde] = useState('2000-01-01');
  const [hasta, setHasta] = useState('2100-01-01');
  const [datos, setDatos] = useState(null);

  async function cargar() {
    const { data } = await api.get('/informes/ganancias', { params: { desde, hasta } });
    setDatos(data);
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="panel">
      <form className="inline-form" onSubmit={(e) => { e.preventDefault(); cargar(); }}>
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        <button type="submit">Filtrar</button>
      </form>

      {datos && (
        <>
          <div className="cards" style={{ marginBottom: '1rem' }}>
            <div className="card">Ingresos: ${datos.totales.ingresos.toLocaleString()}</div>
            <div className="card">Costos: ${datos.totales.costos.toLocaleString()}</div>
            <div className="card">Margen: ${datos.totales.margen.toLocaleString()}</div>
          </div>

          <table className="tabla">
            <thead>
              <tr><th>Producto</th><th>Unidades</th><th>Ingresos</th><th>Costos</th><th>Margen</th></tr>
            </thead>
            <tbody>
              {datos.detalle.map((d, i) => (
                <tr key={i}>
                  <td>{d.nombre}</td>
                  <td>{d.unidades_vendidas}</td>
                  <td>${Number(d.ingresos).toLocaleString()}</td>
                  <td>${Number(d.costos).toLocaleString()}</td>
                  <td>${Number(d.margen).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function Exportar() {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  function descargar(ruta) {
    const token = localStorage.getItem('yala_token');
    fetch(`${base}${ruta}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = ruta.includes('ventas') ? 'ventas.csv' : 'inventario.csv';
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  return (
    <div className="panel">
      <p className="subtitle">Exportacion en formato CSV (compatible con Excel).</p>
      <div className="inline-form">
        <button onClick={() => descargar('/informes/ventas?formato=csv')}>Exportar ventas</button>
        <button onClick={() => descargar('/informes/inventario?formato=csv')}>Exportar inventario</button>
      </div>
    </div>
  );
}
