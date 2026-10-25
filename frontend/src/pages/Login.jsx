import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
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
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales invalidas');
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
        <p className="subtitle">Inicia sesion en tu panel de control</p>

        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          placeholder="tu@empresa.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="login-password">Contrasena</label>
        <input
          id="login-password"
          type="password"
          placeholder="••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p className="link">
          No tienes cuenta? <Link to="/registro">Registrar empresa</Link>
        </p>
      </form>
    </div>
  );
}
