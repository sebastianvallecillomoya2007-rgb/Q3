import { formatCurrency } from '../utils/formatters'
import { calculateInvoiceTotals } from '../utils/calculations'

/**
 * Panel de métricas y estadísticas financieras rápidas.
 * @param {{ invoices: Array<any> }} props
 */
export function StatsBar({ invoices = [] }) {
  const stats = invoices.reduce(
    (acc, inv) => {
      const { total } = calculateInvoiceTotals(inv.items, inv.taxRate)
      acc.totalBilled += total
      acc.count += 1

      if (inv.status === 'paid') {
        acc.paidCount += 1
        acc.paidAmount += total
      } else {
        acc.pendingCount += 1
        acc.pendingAmount += total
      }
      return acc
    },
    {
      totalBilled: 0,
      count: 0,
      paidCount: 0,
      paidAmount: 0,
      pendingCount: 0,
      pendingAmount: 0,
    }
  )

  const avgTicket = stats.count > 0 ? stats.totalBilled / stats.count : 0

  return (
    <section className="stats-container" aria-label="Métricas de facturación">
      <div className="stat-card stat-total">
        <div className="stat-header">
          <span className="stat-label">Total Facturado</span>
          <span className="stat-icon-badge">📊</span>
        </div>
        <strong className="stat-value">{formatCurrency(stats.totalBilled)}</strong>
        <span className="stat-detail">
          <strong>{stats.count}</strong> {stats.count === 1 ? 'comprobante emitido' : 'comprobantes emitidos'}
        </span>
      </div>

      <div className="stat-card stat-paid">
        <div className="stat-header">
          <span className="stat-label">Total Cobrado</span>
          <span className="stat-icon-badge paid-badge">✓</span>
        </div>
        <strong className="stat-value stat-value-paid">
          {formatCurrency(stats.paidAmount)}
        </strong>
        <span className="stat-detail">
          <strong>{stats.paidCount}</strong> facturas liquidadas
        </span>
      </div>

      <div className="stat-card stat-pending">
        <div className="stat-header">
          <span className="stat-label">Por Cobrar (Pendiente)</span>
          <span className="stat-icon-badge pending-badge">⏳</span>
        </div>
        <strong className="stat-value stat-value-pending">
          {formatCurrency(stats.pendingAmount)}
        </strong>
        <span className="stat-detail">
          <strong>{stats.pendingCount}</strong> facturas por cobrar
        </span>
      </div>

      <div className="stat-card stat-avg">
        <div className="stat-header">
          <span className="stat-label">Ticket Promedio</span>
          <span className="stat-icon-badge avg-badge">📈</span>
        </div>
        <strong className="stat-value">
          {formatCurrency(avgTicket)}
        </strong>
        <span className="stat-detail">
          Promedio por factura
        </span>
      </div>
    </section>
  )
}
