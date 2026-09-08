/**
 * Barra superior institucional para el sistema de facturación.
 * @param {{
 *   onNewInvoice: () => void,
 *   onResetDemo: () => void,
 *   invoiceCount: number
 * }} props
 */
export function Navbar({ onNewInvoice, onResetDemo, invoiceCount }) {
  const currentDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <header className="topbar">
      <div className="logo-lockup">
        <div className="logo">
          Q<span>3</span>
        </div>
        <div>
          <strong>QUARTER BILLING</strong>
          <small>SISTEMA DE FACTURACIÓN INTERNA</small>
        </div>
      </div>

      <div className="topbar-center">
        <span className="status">
          <span className="status-dot" /> Sistema activo · {currentDate} ({invoiceCount} {invoiceCount === 1 ? 'factura' : 'facturas'})
        </span>
      </div>

      <div className="topbar-actions">
        <button
          type="button"
          className="button button-soft button-sm"
          onClick={onResetDemo}
          title="Restablece los datos de ejemplo iniciales"
        >
          ↻ Datos Demo
        </button>
        <button
          type="button"
          className="button button-primary button-sm"
          onClick={onNewInvoice}
        >
          + Nueva Factura
        </button>
      </div>
    </header>
  )
}
