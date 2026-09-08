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

  return (
    <section className="stats-container">
      <div className="stat-card stat-total">
        <span className="stat-label">Total Facturado</span>
        <strong className="stat-value">{formatCurrency(stats.totalBilled)}</strong>
        <span className="stat-detail">{stats.count} facturas emitidas</span>
      </div>

      <div className="stat-card stat-paid">
        <span className="stat-label">Total Recaudado (Pagadas)</span>
        <strong className="stat-value stat-value-paid">
          {formatCurrency(stats.paidAmount)}
        </strong>
        <span className="stat-detail">{stats.paidCount} comprobantes liquidados</span>
      </div>

      <div className="stat-card stat-pending">
        <span className="stat-label">Por Recaudar (Pendientes)</span>
        <strong className="stat-value stat-value-pending">
          {formatCurrency(stats.pendingAmount)}
        </strong>
        <span className="stat-detail">{stats.pendingCount} facturas por cobrar</span>
      </div>
    </section>
  )
}
