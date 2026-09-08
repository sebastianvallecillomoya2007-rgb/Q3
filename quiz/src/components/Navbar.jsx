/**
 * Barra superior institucional para el sistema de facturación.
 * @param {{
 *   onNewInvoice: () => void,
 *   onResetDemo: () => void,
 *   invoiceCount: number,
 *   activeView: string,
 *   onViewChange: (view: string) => void
 * }} props
 */
export function Navbar({ onNewInvoice, onResetDemo, invoiceCount, activeView, onViewChange }) {
  const currentDate = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date())

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="logo-lockup" onClick={() => onViewChange('overview')} role="button" tabIndex={0} style={{ cursor: 'pointer' }}>
          <div className="logo">
            <span>Q</span>3
          </div>
          <div>
            <div className="brand-title">
              <strong>QUARTER</strong>
              <span className="brand-badge-pill">BILLING</span>
            </div>
            <small>TechStore S.A. · Herramienta Interna</small>
          </div>
        </div>

        {/* SELECTOR DE VISTAS (PESTAÑAS DEL SISTEMA) */}
        <nav className="view-switcher" aria-label="Modo de visualización">
          <button
            type="button"
            className={`view-tab ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => onViewChange('overview')}
          >
            📋 Facturas & Historial
            <span className="tab-count">{invoiceCount}</span>
          </button>
          <button
            type="button"
            className={`view-tab ${activeView === 'form' ? 'active' : ''}`}
            onClick={() => onViewChange('form')}
          >
            ✍️ Nueva Emisión
          </button>
          <button
            type="button"
            className={`view-tab ${activeView === 'split' ? 'active' : ''}`}
            onClick={() => onViewChange('split')}
            title="Mostrar Formulario, Historial y Vista Previa al mismo tiempo"
          >
            ⊞ Vista Dividida
          </button>
        </nav>
      </div>

      <div className="topbar-right">
        <span className="status-indicator">
          <span className="status-dot" />
          <span>Activo · {currentDate}</span>
        </span>

        <button
          type="button"
          className="button button-outline button-sm"
          onClick={onResetDemo}
          title="Restablece los datos iniciales de demostración"
        >
          ↻ Reset Demo
        </button>

        <button
          type="button"
          className="button button-primary button-sm"
          onClick={onNewInvoice}
        >
          <span>+ Nueva Factura</span>
        </button>
      </div>
    </header>
  )
}
