import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import Clientes from './pages/Clientes';
import Rrhh from './pages/Rrhh';
import Operaciones from './pages/Operaciones';
import Informes from './pages/Informes';
import RutaPrivada from './components/RutaPrivada';

function privada(Componente) {
  return (
    <RutaPrivada>
      <Componente />
    </RutaPrivada>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/dashboard" element={privada(Dashboard)} />
      <Route path="/inventario" element={privada(Inventario)} />
      <Route path="/ventas" element={privada(Ventas)} />
      <Route path="/clientes" element={privada(Clientes)} />
      <Route path="/rrhh" element={privada(Rrhh)} />
      <Route path="/operaciones" element={privada(Operaciones)} />
      <Route path="/informes" element={privada(Informes)} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
