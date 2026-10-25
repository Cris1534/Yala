import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Registro() {
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState('tienda');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const { data: empresa } = await api.post('/empresas', {
        nombre: nombreEmpresa,
        tipo_negocio: tipoNegocio,
      });

      await api.post('/auth/register', {
        nombre,
        email,
        password,
        rol: 'admin',
        empresa_id: empresa.id,
      });

      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo completar el registro');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-grid" aria-hidden="true" />
      <div className="auth-orb auth-orb--a" aria-hidden="true" />
      <div className="auth-orb auth-orb--b" aria-hidden="true" />

      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <span className="auth-logo" aria-hidden="true">Y</span>
          <h1>YALA ERP</h1>
        </div>
        <p className="subtitle">Registra tu negocio</p>

        <label>Nombre del negocio</label>
        <input value={nombreEmpresa} onChange={(e) => setNombreEmpresa(e.target.value)} required />

        <label>Tipo de negocio</label>
        <select value={tipoNegocio} onChange={(e) => setTipoNegocio(e.target.value)}>
          <option value="tienda">Tienda</option>
          <option value="barberia">Barberia</option>
          <option value="restaurante">Restaurante</option>
          <option value="servicio">Servicio</option>
        </select>

        <label>Tu nombre</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Contrasena</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Creando...' : 'Crear cuenta'}
        </button>

        <p className="link">
          Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
        </p>
      </form>
    </div>
  );
}
