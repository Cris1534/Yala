import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [historial, setHistorial] = useState(null);

  async function cargar() {
    const { data } = await api.get('/clientes');
    setClientes(data);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function agregar(e) {
    e.preventDefault();
    await api.post('/clientes', { nombre, telefono: telefono || undefined, email: email || undefined });
    setNombre('');
    setTelefono('');
    setEmail('');
    cargar();
  }

  async function verHistorial(cliente) {
    setSeleccionado(cliente);
    const { data } = await api.get(`/clientes/${cliente.id}/historial`);
    setHistorial(data);
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>YALA ERP</h1>
        <Link to="/dashboard" className="back-link">← Dashboard</Link>
      </header>

      <main className="dashboard-content">
        <h2>Clientes</h2>

        <div className="panel">
          <form className="inline-form" onSubmit={agregar}>
            <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            <input placeholder="Telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit">Agregar cliente</button>
          </form>

          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Telefono</th>
                <th>Email</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td>{c.telefono || '-'}</td>
                  <td>{c.email || '-'}</td>
                  <td>
                    <button className="link-btn" onClick={() => verHistorial(c)}>
                      Ver historial
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {seleccionado && historial && (
          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3>Historial de {seleccionado.nombre}</h3>
            <p className="subtitle">
              {historial.total_compras} compra(s) — total ${historial.total_comprado.toLocaleString()}
            </p>
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {historial.ventas.map((v) => (
                  <tr key={v.id}>
                    <td>{new Date(v.fecha).toLocaleString()}</td>
                    <td>${Number(v.total).toLocaleString()}</td>
                    <td>{v.estado}</td>
                  </tr>
                ))}
                {historial.ventas.length === 0 && (
                  <tr><td colSpan={3} style={{ color: 'var(--muted)' }}>Sin compras todavia</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
