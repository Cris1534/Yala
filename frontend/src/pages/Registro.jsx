import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

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
    <AuthLayout>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Crea tu cuenta</h1>
        <p className="subtitle">Registra tu negocio en menos de un minuto</p>

        <label htmlFor="reg-empresa">Nombre del negocio</label>
        <input id="reg-empresa" value={nombreEmpresa} onChange={(e) => setNombreEmpresa(e.target.value)} required />

        <label htmlFor="reg-tipo">Tipo de negocio</label>
        <select id="reg-tipo" value={tipoNegocio} onChange={(e) => setTipoNegocio(e.target.value)}>
          <option value="tienda">Tienda</option>
          <option value="barberia">Barbería</option>
          <option value="restaurante">Restaurante</option>
          <option value="servicio">Servicio</option>
        </select>

        <label htmlFor="reg-nombre">Tu nombre</label>
        <input id="reg-nombre" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

        <label htmlFor="reg-email">Email</label>
        <input id="reg-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="reg-password">Contraseña</label>
        <input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Creando…' : 'Crear cuenta'}
        </button>

        <p className="link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
