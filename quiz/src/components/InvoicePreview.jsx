import { formatCurrency, formatDate } from '../utils/formatters'
import { calculateInvoiceTotals, calculateItemSubtotal } from '../utils/calculations'

/**
 * Componente de visualización profesional de la factura lista para imprimir.
 * @param {{
 *   invoice: any,
 *   onToggleStatus: (id: string) => void,
 *   onDuplicate: (invoice: any) => void,
 *   onDelete: (id: string) => void
 * }} props
 */
export function InvoicePreview({ invoice, onToggleStatus, onDuplicate, onDelete }) {
  if (!invoice) {
    return (
      <section className="invoice-preview blank-preview">
        <div className="preview-placeholder">
          <span className="placeholder-icon">✦</span>
          <h2>Selecciona una factura</h2>
          <p>Elige un comprobante del historial o emite uno nuevo para ver su diseño formal.</p>
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
    <section className="invoice-preview">
      {/* BARRA DE HERRAMIENTAS SUPERIOR */}
      <div className="preview-toolbar">
        <div>
          <p className="eyebrow">DOCUMENTO TRIBUTARIO</p>
          <h2>Vista Previa Oficial</h2>
        </div>

        <div className="preview-actions">
          <button
            type="button"
            className={`button ${isPaid ? 'button-soft-amber' : 'button-soft-green'}`}
            onClick={() => onToggleStatus(invoice.id)}
            title="Cambiar estado de la factura"
          >
            {isPaid ? '↺ Marcar como Pendiente' : '✓ Marcar como Pagada'}
          </button>

          <button
            type="button"
            className="button button-soft"
            onClick={() => onDuplicate(invoice)}
            title="Duplicar ítems y cliente en una nueva factura"
          >
            📋 Duplicar
          </button>

          <button
            type="button"
            className="button button-primary"
            onClick={handlePrint}
            title="Imprimir o guardar en PDF"
          >
            🖨 Imprimir / PDF
          </button>

          <button
            type="button"
            className="button button-danger-icon"
            onClick={handleConfirmDelete}
            title="Eliminar factura"
            aria-label="Eliminar factura"
          >
            🗑
          </button>
        </div>
      </div>

      {/* HOJA DE LA FACTURA IMPRIMIBLE */}
      <article className="invoice-paper" id="invoice-printable-area">
        {/* ENCABEZADO DE FACTURA */}
        <header className="invoice-header">
          <div className="invoice-brand-block">
            <div className="brand-badge">
              <span className="brand-logo">Q3</span>
              <div>
                <span className="brand-sub">Comprobante Oficial</span>
              </div>
            </div>
            <h1 className="issuer-name">{invoice.issuer.name}</h1>
            <p className="issuer-tax">ID Fiscal / NIT: <strong>{invoice.issuer.taxId}</strong></p>
            {invoice.issuer.address && <p className="issuer-detail">{invoice.issuer.address}</p>}
            {invoice.issuer.email && <p className="issuer-detail">{invoice.issuer.email} · {invoice.issuer.phone}</p>}
          </div>

          <div className="invoice-meta-block">
            <div className="invoice-title-tag">FACTURA DE VENTA</div>
            <strong className="invoice-number-display">{invoice.number}</strong>
            <div className={`invoice-status-tag ${isPaid ? 'is-paid' : 'is-pending'}`}>
              <span className="status-dot-sm" />
              {isPaid ? 'PAGADA' : 'PENDIENTE DE PAGO'}
            </div>

            <div className="invoice-dates">
              <div>
                <span>Emisión:</span>
                <strong>{formatDate(invoice.issueDate)}</strong>
              </div>
              {invoice.dueDate && (
                <div>
                  <span>Vencimiento:</span>
                  <strong>{formatDate(invoice.dueDate)}</strong>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* DATOS DE LAS PARTES (EMISOR Y RECEPTOR) */}
        <div className="invoice-parties-grid">
          <div className="party-card party-issuer">
            <span className="party-label">EMISOR (PROVEEDOR)</span>
            <strong className="party-name">{invoice.issuer.name}</strong>
            <p><strong>NIT/RUC:</strong> {invoice.issuer.taxId}</p>
            {invoice.issuer.email && <p><strong>Email:</strong> {invoice.issuer.email}</p>}
            {invoice.issuer.phone && <p><strong>Tel:</strong> {invoice.issuer.phone}</p>}
            {invoice.issuer.address && <p><strong>Dir:</strong> {invoice.issuer.address}</p>}
          </div>

          <div className="party-card party-client">
            <span className="party-label">FACTURAR A (CLIENTE)</span>
            <strong className="party-name">{invoice.client.name}</strong>
            {invoice.client.taxId && <p><strong>NIT/ID:</strong> {invoice.client.taxId}</p>}
            {invoice.client.email && <p><strong>Email:</strong> {invoice.client.email}</p>}
            {invoice.client.phone && <p><strong>Tel:</strong> {invoice.client.phone}</p>}
            {invoice.client.address && <p><strong>Dir:</strong> {invoice.client.address}</p>}
          </div>
        </div>

        {/* TABLA DE CONCEPTOS FACTURADOS */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Descripción del Concepto / Servicio</th>
              <th style={{ width: '70px', textAlign: 'center' }}>Cant.</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Precio Unit.</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => {
              const sub = calculateItemSubtotal(item.quantity, item.price)
              return (
                <tr key={item.id || idx}>
                  <td className="cell-muted" style={{ textAlign: 'center' }}>
                    {String(idx + 1).padStart(2, '0')}
                  </td>
                  <td className="cell-description">
                    <strong>{item.description}</strong>
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatCurrency(sub)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* SECCIÓN INFERIOR: NOTAS Y TOTALES */}
        <div className="invoice-bottom-layout">
          <div className="invoice-notes-block">
            {invoice.notes && (
              <div className="notes-box">
                <span className="notes-heading">Términos y Observaciones:</span>
                <p>{invoice.notes}</p>
              </div>
            )}
            <div className="invoice-compliance-note">
              <p>Este documento constituye un comprobante digital oficial de cobro emitido bajo las normas contables vigentes.</p>
              <small>Emitido mediante el sistema interno de facturación · TechStore S.A.</small>
            </div>
          </div>

          <div className="invoice-totals-box">
            <div className="totals-row">
              <span>Subtotal Neto:</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="totals-row">
              <span>Impuesto IVA ({invoice.taxRate}%):</span>
              <span>{formatCurrency(totals.taxAmount)}</span>
            </div>
            <div className="totals-row grand-total-row">
              <span>TOTAL A PAGAR:</span>
              <strong className="grand-total-amount">
                {formatCurrency(totals.total)}
              </strong>
            </div>
            <div className="currency-note">Valores expresados en USD ($)</div>
          </div>
        </div>

        {/* PIE DE PÁGINA IMPRESIÓN */}
        <footer className="invoice-print-footer">
          <span>{invoice.issuer.name} · Factura Nº {invoice.number} · Hoja 1 de 1</span>
          <span>Impreso el {new Date().toLocaleDateString('es-ES')}</span>
        </footer>
      </article>
    </section>
  )
}
