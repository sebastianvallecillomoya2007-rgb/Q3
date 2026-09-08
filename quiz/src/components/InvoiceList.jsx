import { useState, useMemo } from 'react'
import { formatCurrency, formatDate } from '../utils/formatters'
import { calculateInvoiceTotals } from '../utils/calculations'

/**
 * Panel de lista e historial de facturas emitidas.
 * @param {{
 *   invoices: Array<any>,
 *   selectedId: string,
 *   onSelect: (id: string) => void,
 *   onDelete: (id: string) => void
 * }} props
 */
export function InvoiceList({ invoices, selectedId, onSelect, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'paid' | 'pending'

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.client.taxId && inv.client.taxId.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus =
        statusFilter === 'all' ? true : inv.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [invoices, searchTerm, statusFilter])

  const handleDelete = (e, id, number) => {
    e.stopPropagation()
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar la factura ${number}? Esta acción no se puede deshacer.`
    )
    if (confirmDelete) {
      onDelete(id)
    }
  }

  return (
    <aside className="list-panel">
      {/* CABECERA DEL PANEL */}
      <div className="list-title">
        <div>
          <p className="eyebrow">REGISTRO CONTABLE</p>
          <h2>Historial de Facturas</h2>
        </div>
        <span className="count-badge" title="Total facturas registradas">
          {filteredInvoices.length} / {invoices.length}
        </span>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="list-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por Nº o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="filter-chips">
          <button
            type="button"
            className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Todas ({invoices.length})
          </button>
          <button
            type="button"
            className={`filter-chip ${statusFilter === 'paid' ? 'active' : ''}`}
            onClick={() => setStatusFilter('paid')}
          >
            Pagadas ({invoices.filter((i) => i.status === 'paid').length})
          </button>
          <button
            type="button"
            className={`filter-chip ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pendientes ({invoices.filter((i) => i.status === 'pending').length})
          </button>
        </div>
      </div>

      {/* LISTA DE FACTURAS */}
      {filteredInvoices.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">∅</span>
          <p>No se encontraron facturas</p>
          <small>
            {searchTerm || statusFilter !== 'all'
              ? 'Prueba con otros términos de búsqueda o filtros.'
              : 'Las facturas que emitas aparecerán aquí organizadas.'}
          </small>
        </div>
      ) : (
        <div className="invoice-list-items">
          {filteredInvoices.map((inv) => {
            const totals = calculateInvoiceTotals(inv.items, inv.taxRate)
            const isSelected = selectedId === inv.id
            const isPaid = inv.status === 'paid'

            return (
              <div
                key={inv.id}
                role="button"
                tabIndex={0}
                className={`invoice-list-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => onSelect(inv.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(inv.id)
                  }
                }}
              >
                <div className="invoice-card-main">
                  <div className="invoice-card-header">
                    <strong className="invoice-card-number">{inv.number}</strong>
                    <span
                      className={`status-pill ${isPaid ? 'pill-paid' : 'pill-pending'}`}
                    >
                      {isPaid ? 'Pagada' : 'Pendiente'}
                    </span>
                  </div>

                  <p className="invoice-card-client" title={inv.client.name}>
                    {inv.client.name}
                  </p>

                  <div className="invoice-card-footer">
                    <span className="invoice-card-date">
                      {formatDate(inv.issueDate)}
                    </span>
                    <strong className="invoice-card-total">
                      {formatCurrency(totals.total)}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="invoice-card-delete-btn"
                  title="Eliminar factura"
                  onClick={(e) => handleDelete(e, inv.id, inv.number)}
                  aria-label={`Eliminar factura ${inv.number}`}
                >
                  🗑
                </button>
              </div>
            )
          })}
        </div>
      )}
    </aside>
  )
}
