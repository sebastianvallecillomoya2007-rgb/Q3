import { formatCurrency, formatDate } from '../utils/formatters'
import { calculateInvoiceTotals, calculateItemSubtotal } from '../utils/calculations'

/**
 * Componente de visualización profesional de la factura tipo comprobante oficial.
 * @param {{
 *   invoice: any,
 *   onToggleStatus: (id: string) => void,
 *   onDuplicate: (invoice: any) => void,
 *   onDelete: (id: string) => void,
 *   onEditClick?: () => void
 * }} props
 */
export function InvoicePreview({ invoice, onToggleStatus, onDuplicate, onDelete, onEditClick }) {
  if (!invoice) {
    return (
      <section className="preview-container-modern empty-preview-state">
        <div className="empty-preview-card">
          <span className="empty-preview-icon">🧾</span>
          <h3>Ninguna factura seleccionada</h3>
          <p>Selecciona una factura del historial o genera una nueva para ver su diseño oficial.</p>
        </div>
      </section>
    )
  }

  const totals = calculateInvoiceTotals(invoice.items, invoice.taxRate)
  const isPaid = invoice.status === 'paid'

  const handlePrint = () => {
    window.print()
  }

  const handleConfirmDelete = () => {
    const ok = window.confirm(
      `¿Deseas eliminar definitivamente la factura ${invoice.number}?`
    )
    if (ok) {
      onDelete(invoice.id)
    }
  }

  return (
    <section className="preview-container-modern">
      {/* BARRA DE HERRAMIENTAS DE VISTA PREVIA */}
      <div className="preview-action-toolbar">
        <div className="toolbar-info">
          <span className="toolbar-tag">DOCUMENTO TRIBUTARIO</span>
          <h2 className="toolbar-title">Vista Previa de Comprobante</h2>
        </div>

        <div className="toolbar-button-group">
          <button
            type="button"
            className={`button button-sm ${isPaid ? 'button-soft-amber' : 'button-soft-green'}`}
            onClick={() => onToggleStatus(invoice.id)}
            title="Cambiar estado entre Pagada y Pendiente"
          >
            {isPaid ? '↺ Marcar Pendiente' : '✓ Marcar Pagada'}
          </button>

          <button
            type="button"
            className="button button-outline button-sm"
            onClick={() => onDuplicate(invoice)}
            title="Clonar datos para emitir otra factura similar"
          >
            📋 Duplicar
          </button>

          {onEditClick && (
            <button
              type="button"
              className="button button-outline button-sm"
              onClick={onEditClick}
            >
              ✍️ Nueva
            </button>
          )}

          <button
            type="button"
            className="button button-primary button-sm"
            onClick={handlePrint}
            title="Imprimir o guardar como PDF"
          >
            🖨 Imprimir / PDF
          </button>

          <button
            type="button"
            className="button button-danger-icon button-sm"
            onClick={handleConfirmDelete}
            title="Eliminar factura"
            aria-label="Eliminar factura"
          >
            🗑
          </button>
        </div>
      </div>

      {/* HOJA IMPRIMIBLE DE LA FACTURA (DOCUMENTO OFICIAL) */}
      <article className="official-invoice-sheet" id="printable-invoice">
        {/* CABECERA PRINCIPAL */}
        <header className="invoice-sheet-header">
          <div className="issuer-profile-block">
            <div className="corporate-badge">
              <div className="corporate-logo-icon">Q3</div>
              <div>
                <span className="corporate-tagline">COMPROBANTE ELECTRÓNICO OFICIAL</span>
                <h1 className="corporate-name">{invoice.issuer.name}</h1>
              </div>
            </div>

            <div className="issuer-details-list">
              <p><strong>NIT / RUC:</strong> {invoice.issuer.taxId}</p>
              {invoice.issuer.address && <p><strong>Dirección:</strong> {invoice.issuer.address}</p>}
              {invoice.issuer.email && (
                <p>
                  <strong>Contacto:</strong> {invoice.issuer.email}
                  {invoice.issuer.phone ? ` · ${invoice.issuer.phone}` : ''}
                </p>
              )}
            </div>
          </div>

          <div className="invoice-meta-card">
            <span className="invoice-type-label">FACTURA DE VENTA</span>
            <div className="invoice-correlative-num">{invoice.number}</div>

            <div className={`invoice-status-pill ${isPaid ? 'status-paid' : 'status-pending'}`}>
              <span className="status-dot-inner" />
              <span>{isPaid ? 'PAGADA' : 'PENDIENTE DE PAGO'}</span>
            </div>

            <div className="meta-dates-grid">
              <div className="date-item">
                <span className="date-lbl">Emisión:</span>
                <strong className="date-val">{formatDate(invoice.issueDate)}</strong>
              </div>
              {invoice.dueDate && (
                <div className="date-item">
                  <span className="date-lbl">Vence:</span>
                  <strong className="date-val">{formatDate(invoice.dueDate)}</strong>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* BLOQUE DE EMISOR Y RECEPTOR */}
        <div className="parties-comparison-grid">
          <div className="party-box party-box-issuer">
            <span className="party-role-tag">EMISOR (PROVEEDOR)</span>
            <strong className="party-title">{invoice.issuer.name}</strong>
            <div className="party-meta-rows">
              <span>NIT / RUC: <strong>{invoice.issuer.taxId}</strong></span>
              {invoice.issuer.email && <span>Email: {invoice.issuer.email}</span>}
              {invoice.issuer.phone && <span>Teléfono: {invoice.issuer.phone}</span>}
              {invoice.issuer.address && <span>Dirección: {invoice.issuer.address}</span>}
            </div>
          </div>

          <div className="party-box party-box-client">
            <span className="party-role-tag">FACTURADO A (CLIENTE)</span>
            <strong className="party-title">{invoice.client.name}</strong>
            <div className="party-meta-rows">
              {invoice.client.taxId && <span>NIT / ID: <strong>{invoice.client.taxId}</strong></span>}
              {invoice.client.email && <span>Email: {invoice.client.email}</span>}
              {invoice.client.phone && <span>Teléfono: {invoice.client.phone}</span>}
              {invoice.client.address && <span>Dirección: {invoice.client.address}</span>}
            </div>
          </div>
        </div>

        {/* TABLA DE PRODUCTOS / SERVICIOS */}
        <div className="table-responsive-wrapper">
          <table className="official-table">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                <th>Descripción del Concepto / Servicio</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Cant.</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Precio Unit.</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => {
                const itemSub = calculateItemSubtotal(item.quantity, item.price)
                return (
                  <tr key={item.id || index}>
                    <td style={{ textAlign: 'center' }} className="td-index">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="td-desc">
                      <strong>{item.description}</strong>
                    </td>
                    <td style={{ textAlign: 'center' }} className="td-qty">
                      {item.quantity}
                    </td>
                    <td style={{ textAlign: 'right' }} className="td-price">
                      {formatCurrency(item.price)}
                    </td>
                    <td style={{ textAlign: 'right' }} className="td-subtotal">
                      {formatCurrency(itemSub)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* SECCIÓN INFERIOR: CONDICIONES Y LIQUIDACIÓN DE TOTALES */}
        <div className="invoice-footer-layout">
          <div className="terms-and-notes-box">
            {invoice.notes && (
              <div className="notes-content-wrap">
                <span className="notes-box-title">Instrucciones y Condiciones de Pago:</span>
                <p className="notes-text">{invoice.notes}</p>
              </div>
            )}

            <div className="legal-disclaimer">
              <p>Comprobante de emisión digital interna para control administrativo y comercial.</p>
              <small>Generado con el Sistema de Facturación QUARTER · Todos los derechos reservados.</small>
            </div>
          </div>

          <div className="totals-calculation-card">
            <div className="calc-row">
              <span className="calc-label">Subtotal Imponible:</span>
              <span className="calc-amount">{formatCurrency(totals.subtotal)}</span>
            </div>

            <div className="calc-row">
              <span className="calc-label">Impuesto IVA ({invoice.taxRate}%):</span>
              <span className="calc-amount">{formatCurrency(totals.taxAmount)}</span>
            </div>

            <div className="calc-divider" />

            <div className="calc-row grand-total-highlight">
              <span className="grand-label">TOTAL FACTURADO:</span>
              <strong className="grand-amount">{formatCurrency(totals.total)}</strong>
            </div>

            <div className="currency-disclaimer">Valores expresados en Dólares (USD $)</div>
          </div>
        </div>

        {/* PIE PARA IMPRESIÓN OFICIAL */}
        <footer className="print-only-footer">
          <span>{invoice.issuer.name} · Factura Nº {invoice.number}</span>
          <span>Página 1 de 1 · Fecha de impresión: {new Date().toLocaleDateString('es-ES')}</span>
        </footer>
      </article>
    </section>
  )
}
