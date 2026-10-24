import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    api.get('/informes/dashboard').then((res) => setResumen(res.data));
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>YALA ERP</h1>
        <div className="user-info">
          <span>{usuario?.nombre} · {usuario?.rol}</span>
          <button onClick={handleLogout}>Cerrar sesion</button>
        </div>
      </header>

      <main className="dashboard-content">
        <h2>Dashboard</h2>

        {resumen && (
          <div className="cards" style={{ marginBottom: '1.5rem' }}>
            <div className="card">
              Ventas de hoy<br />
              <strong>${resumen.ventas_hoy.total.toLocaleString()}</strong> ({resumen.ventas_hoy.cantidad})
            </div>
            <div className="card">
              Stock critico<br />
              <strong>{resumen.stock_critico.length}</strong> producto(s)
            </div>
            <div className="card">
              Domicilios activos<br />
              <strong>{resumen.domicilios_activos}</strong>
            </div>
            <div className="card">
              Turno activo<br />
              <strong>{resumen.turno_activo ? resumen.turno_activo.asesor : 'Ninguno'}</strong>
            </div>
          </div>
        )}

        <div className="cards">
          <Link to="/inventario" className="card card-link">Inventario</Link>
          <Link to="/ventas" className="card card-link">Ventas / POS</Link>
          <Link to="/clientes" className="card card-link">Clientes</Link>
          <Link to="/rrhh" className="card card-link">RRHH</Link>
          <Link to="/operaciones" className="card card-link">Operaciones</Link>
          <Link to="/informes" className="card card-link">Auditoria / Informes</Link>
        </div>
      </main>
    </div>
  );
}
