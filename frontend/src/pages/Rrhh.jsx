import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Rrhh() {
  const [tab, setTab] = useState('empleados');
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSel, setEmpleadoSel] = useState(null);

  async function cargarEmpleados() {
    const { data } = await api.get('/empleados');
    setEmpleados(data);
  }

  useEffect(() => {
    cargarEmpleados();
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>YALA ERP</h1>
        <Link to="/dashboard" className="back-link">← Dashboard</Link>
      </header>

      <main className="dashboard-content">
        <h2>RRHH</h2>

        <div className="tabs">
          <button className={tab === 'empleados' ? 'tab active' : 'tab'} onClick={() => setTab('empleados')}>
            Empleados
          </button>
        </div>

        {tab === 'empleados' && (
          <EmpleadosPanel
            empleados={empleados}
            onChange={cargarEmpleados}
            empleadoSel={empleadoSel}
            setEmpleadoSel={setEmpleadoSel}
          />
        )}
      </main>
    </div>
  );
}

function EmpleadosPanel({ empleados, onChange, empleadoSel, setEmpleadoSel }) {
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [cargo, setCargo] = useState('');

  async function agregar(e) {
    e.preventDefault();
    await api.post('/empleados', { nombre, documento: documento || undefined, cargo: cargo || undefined });
    setNombre('');
    setDocumento('');
    setCargo('');
    onChange();
  }

  return (
    <>
      <div className="panel">
        <form className="inline-form" onSubmit={agregar}>
          <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <input placeholder="Documento" value={documento} onChange={(e) => setDocumento(e.target.value)} />
          <input placeholder="Cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} />
          <button type="submit">Agregar empleado</button>
        </form>

        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Cargo</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((e) => (
              <tr key={e.id}>
                <td>{e.nombre}</td>
                <td>{e.documento || '-'}</td>
                <td>{e.cargo || '-'}</td>
                <td>{e.activo ? 'Activo' : 'Retirado'}</td>
                <td>
                  <button className="link-btn" onClick={() => setEmpleadoSel(e)}>
                    Contratos / Nomina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {empleadoSel && <ContratosYNomina empleado={empleadoSel} />}
    </>
  );
}

function ContratosYNomina({ empleado }) {
  const [contratos, setContratos] = useState([]);
  const [nomina, setNomina] = useState([]);
  const [tipo, setTipo] = useState('fijo');
  const [salarioBase, setSalarioBase] = useState('');
  const [porcentajeComision, setPorcentajeComision] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');

  const [contratoId, setContratoId] = useState('');
  const [periodoInicio, setPeriodoInicio] = useState('');
  const [periodoFin, setPeriodoFin] = useState('');
  const [comisiones, setComisiones] = useState('');
  const [deducciones, setDeducciones] = useState('');

  async function cargar() {
    const [c, n] = await Promise.all([
      api.get(`/empleados/${empleado.id}/contratos`),
      api.get(`/empleados/${empleado.id}/nomina`),
    ]);
    setContratos(c.data);
    setNomina(n.data);
  }

  useEffect(() => {
    cargar();
  }, [empleado.id]);

  async function crearContrato(e) {
    e.preventDefault();
    await api.post('/contratos', {
      empleado_id: empleado.id,
      tipo,
      salario_base: salarioBase ? Number(salarioBase) : 0,
      porcentaje_comision: porcentajeComision ? Number(porcentajeComision) : 0,
      fecha_inicio: fechaInicio,
    });
    setSalarioBase('');
    setPorcentajeComision('');
    setFechaInicio('');
    cargar();
  }

  async function generarNomina(e) {
    e.preventDefault();
    await api.post('/nomina', {
      empleado_id: empleado.id,
      contrato_id: Number(contratoId),
      periodo_inicio: periodoInicio,
      periodo_fin: periodoFin,
      comisiones: comisiones ? Number(comisiones) : 0,
      deducciones: deducciones ? Number(deducciones) : 0,
    });
    setComisiones('');
    setDeducciones('');
    cargar();
  }

  async function pagar(id) {
    await api.patch(`/nomina/${id}/pagar`);
    cargar();
  }

  return (
    <div className="panel" style={{ marginTop: '1rem' }}>
      <h3>{empleado.nombre} — Contratos y nomina</h3>

      <h4>Contratos</h4>
      <form className="inline-form" onSubmit={crearContrato}>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="fijo">Fijo</option>
          <option value="comision">Comision</option>
          <option value="mixto">Mixto</option>
        </select>
        <input placeholder="Salario base" type="number" value={salarioBase} onChange={(e) => setSalarioBase(e.target.value)} />
        <input placeholder="% comision" type="number" value={porcentajeComision} onChange={(e) => setPorcentajeComision(e.target.value)} />
        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
        <button type="submit">Crear contrato</button>
      </form>

      <table className="tabla">
        <thead>
          <tr><th>Tipo</th><th>Salario base</th><th>% Comision</th><th>Inicio</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {contratos.map((c) => (
            <tr key={c.id}>
              <td>{c.tipo}</td>
              <td>${Number(c.salario_base).toLocaleString()}</td>
              <td>{c.porcentaje_comision}%</td>
              <td>{c.fecha_inicio}</td>
              <td>{c.activo ? 'Activo' : 'Terminado'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4>Nomina</h4>
      <form className="inline-form" onSubmit={generarNomina}>
        <select value={contratoId} onChange={(e) => setContratoId(e.target.value)} required>
          <option value="">Contrato...</option>
          {contratos.map((c) => (
            <option key={c.id} value={c.id}>{c.tipo} — ${Number(c.salario_base).toLocaleString()}</option>
          ))}
        </select>
        <input type="date" value={periodoInicio} onChange={(e) => setPeriodoInicio(e.target.value)} required />
        <input type="date" value={periodoFin} onChange={(e) => setPeriodoFin(e.target.value)} required />
        <input placeholder="Comisiones" type="number" value={comisiones} onChange={(e) => setComisiones(e.target.value)} />
        <input placeholder="Deducciones" type="number" value={deducciones} onChange={(e) => setDeducciones(e.target.value)} />
        <button type="submit">Generar nomina</button>
      </form>

      <table className="tabla">
        <thead>
          <tr><th>Periodo</th><th>Salario base</th><th>Comisiones</th><th>Deducciones</th><th>Total</th><th>Estado</th><th></th></tr>
        </thead>
        <tbody>
          {nomina.map((n) => (
            <tr key={n.id}>
              <td>{n.periodo_inicio} a {n.periodo_fin}</td>
              <td>${Number(n.salario_base).toLocaleString()}</td>
              <td>${Number(n.comisiones).toLocaleString()}</td>
              <td>${Number(n.deducciones).toLocaleString()}</td>
              <td><strong>${Number(n.total_pago).toLocaleString()}</strong></td>
              <td>{n.estado}</td>
              <td>
                {n.estado === 'pendiente' && (
                  <button className="link-btn" onClick={() => pagar(n.id)}>Marcar pagado</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
