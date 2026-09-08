import { useState, useMemo } from 'react'
import { formatCurrency, formatDate } from '../utils/formatters'
import { calculateInvoiceTotals } from '../utils/calculations'

/**
 * Panel de lista e historial de facturas emitidas.
 * @param {{
 *   invoices: Array<any>,
 *   selectedId: string,
 *   onSelect: (id: string) => void,
 *   onDelete: (id: string) => void,
 *   onCreateNewClick?: () => void
 * }} props
 */
export function InvoiceList({ invoices, selectedId, onSelect, onDelete, onCreateNewClick }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'paid' | 'pending'

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const term = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !term ||
        inv.number.toLowerCase().includes(term) ||
        inv.client.name.toLowerCase().includes(term) ||
        (inv.client.taxId && inv.client.taxId.toLowerCase().includes(term))

      const matchesStatus =
        statusFilter === 'all' ? true : inv.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [invoices, searchTerm, statusFilter])

  const handleDelete = (e, id, number) => {
    e.stopPropagation()
    const confirmDelete = window.confirm(
      `¿Deseas eliminar la factura ${number}? Esta acción no se puede deshacer.`
    )
    if (confirmDelete) {
      onDelete(id)
    }
  }

  const paidCount = invoices.filter((i) => i.status === 'paid').length
  const pendingCount = invoices.filter((i) => i.status === 'pending').length

  return (
    <aside className="list-panel-modern">
      {/* CABECERA DEL LISTADO */}
      <div className="list-panel-header">
        <div>
          <span className="list-eyebrow">REGISTRO DE COBROS</span>
          <h2 className="list-panel-title">Historial de Facturas</h2>
        </div>
        <span className="list-counter-badge" title="Mostrando / Total">
          {filteredInvoices.length} de {invoices.length}
        </span>
      </div>

      {/* BUSCADOR Y FILTROS SEGMENTADOS */}
      <div className="list-filter-bar">
        <div className="search-input-wrapper">
          <span className="search-svg-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por Nº de factura, cliente o NIT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-field"
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-action"
              onClick={() => setSearchTerm('')}
              title="Borrar búsqueda"
            >
              ×
            </button>
          )}
        </div>

        {/* BOTONES DE FILTRADO POR ESTADO */}
        <div className="filter-segmented-control">
          <button
            type="button"
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Todas <span className="filter-pill-count">{invoices.length}</span>
          </button>
          <button
            type="button"
            className={`filter-btn ${statusFilter === 'paid' ? 'active' : ''}`}
            onClick={() => setStatusFilter('paid')}
          >
            Pagadas <span className="filter-pill-count count-paid">{paidCount}</span>
          </button>
          <button
            type="button"
            className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pendientes <span className="filter-pill-count count-pending">{pendingCount}</span>
          </button>
        </div>
      </div>

      {/* LISTA DE TARJETAS */}
      {filteredInvoices.length === 0 ? (
        <div className="empty-results-box">
          <span className="empty-box-icon">📂</span>
          <h3>Sin facturas coincidentes</h3>
          <p>
            {searchTerm || statusFilter !== 'all'
              ? 'No se encontraron resultados con los filtros actuales.'
              : 'Aún no hay facturas registradas.'}
          </p>
          {onCreateNewClick && (
            <button
              type="button"
              className="button button-primary button-sm"
              onClick={onCreateNewClick}
              style={{ marginTop: '12px' }}
            >
              + Emitir primera factura
            </button>
          )}
        </div>
      ) : (
        <div className="invoice-cards-scroll">
          {filteredInvoices.map((inv) => {
            const totals = calculateInvoiceTotals(inv.items, inv.taxRate)
            const isSelected = selectedId === inv.id
            const isPaid = inv.status === 'paid'

            return (
              <div
                key={inv.id}
                role="button"
                tabIndex={0}
                className={`invoice-item-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelect(inv.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(inv.id)
                  }
                }}
              >
                <div className="card-top-row">
                  <div className="card-number-tag">
                    <span className="card-doc-icon">📄</span>
                    <strong>{inv.number}</strong>
                  </div>
                  <span className={`status-badge-pill ${isPaid ? 'status-paid' : 'status-pending'}`}>
                    <span className="badge-dot" />
                    {isPaid ? 'Pagada' : 'Pendiente'}
                  </span>
                </div>

                <div className="card-client-name" title={inv.client.name}>
                  {inv.client.name}
                </div>

                <div className="card-bottom-row">
                  <span className="card-date">
                    📅 {formatDate(inv.issueDate)}
                  </span>
                  <div className="card-price-action">
                    <strong className="card-total-amount">
                      {formatCurrency(totals.total)}
                    </strong>
                    <button
                      type="button"
                      className="card-delete-icon"
                      title="Eliminar factura"
                      onClick={(e) => handleDelete(e, inv.id, inv.number)}
                      aria-label={`Eliminar ${inv.number}`}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </aside>
  )
}
