const beneficios = [
  {
    titulo: 'Ventas y facturación',
    texto: 'Punto de venta con IVA, facturas y descuento automático de inventario.',
    icono: (
      <path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.8h7.7a2 2 0 0 0 2-1.6L21 8H6M10 21h.01M17 21h.01" />
    ),
  },
  {
    titulo: 'Inventario al día',
    texto: 'Productos, lotes y alertas de stock bajo en tiempo real.',
    icono: <path d="M21 8 12 3 3 8v8l9 5 9-5V8ZM3 8l9 5 9-5M12 13v8" />,
  },
  {
    titulo: 'Equipo y nómina',
    texto: 'Empleados, contratos, turnos y pagos en un solo lugar.',
    icono: (
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    ),
  },
  {
    titulo: 'Funciona sin internet',
    texto: 'Sigue vendiendo aunque se caiga la conexión; todo se sincroniza después.',
    icono: <path d="M12 20h.01M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 14 0M2 9.5a15 15 0 0 1 20 0" />,
  },
];

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <div className="auth-brand">
          <span className="auth-logo" aria-hidden="true">Y</span>
          <span className="auth-brand-name">YALA ERP</span>
        </div>

        <h2 className="auth-tagline">
          Gestiona ventas, inventario y nómina de tu negocio en un solo lugar.
        </h2>

        <ul className="auth-benefits">
          {beneficios.map((b) => (
            <li key={b.titulo}>
              <span className="auth-benefit-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {b.icono}
                </svg>
              </span>
              <div>
                <strong>{b.titulo}</strong>
                <p>{b.texto}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="auth-aside-foot">Para tiendas, barberías, restaurantes y servicios.</p>
      </aside>

      <main className="auth-main">{children}</main>
    </div>
  );
}
