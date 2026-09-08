import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { INITIAL_INVOICES } from './data/initialData'
import { generateNextInvoiceNumber } from './utils/formatters'
import { Navbar } from './components/Navbar'
import { StatsBar } from './components/StatsBar'
import { InvoiceForm } from './components/InvoiceForm'
import { InvoiceList } from './components/InvoiceList'
import { InvoicePreview } from './components/InvoicePreview'
import { Toast } from './components/Toast'
import './App.css'

function App() {
  const [invoices, setInvoices] = useLocalStorage('qu3_invoices_v3', INITIAL_INVOICES)
  const [selectedId, setSelectedId] = useState(() => {
    return invoices.length > 0 ? invoices[0].id : null
  })
  const [activeView, setActiveView] = useState('overview') // 'overview' (List + Preview) | 'form' | 'split'
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  // Factura actualmente seleccionada
  const selectedInvoice = invoices.find((inv) => inv.id === selectedId) || invoices[0] || null

  // Siguiente número de factura sugerido correlativo
  const suggestedNumber = generateNextInvoiceNumber(invoices, 'FAC-')

  // Crear nueva factura
  const handleCreateInvoice = (newInvoice) => {
    setInvoices((prev) => [newInvoice, ...prev])
    setSelectedId(newInvoice.id)
    setActiveView('overview') // Cambiar inmediatamente a vista previa oficial
    showToast(`¡Factura ${newInvoice.number} emitida y registrada correctamente!`, 'success')
  }

  // Alternar estado de pago (Pagada / Pendiente)
  const handleToggleStatus = (id) => {
    let newStatus = 'paid'
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          newStatus = inv.status === 'paid' ? 'pending' : 'paid'
          return { ...inv, status: newStatus }
        }
        return inv
      })
    )
    showToast(
      `Factura actualizada: ${newStatus === 'paid' ? 'Marcada como Pagada ✓' : 'Marcada como Pendiente ⏳'}`,
      'info'
    )
  }

  // Duplicar factura
  const handleDuplicateInvoice = (invoiceToClone) => {
    const nextNum = generateNextInvoiceNumber(invoices, 'FAC-')
    const cloned = {
      ...invoiceToClone,
      id: crypto.randomUUID(),
      number: nextNum,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      status: 'pending',
      items: invoiceToClone.items.map((item) => ({
        ...item,
        id: crypto.randomUUID(),
      })),
    }

    setInvoices((prev) => [cloned, ...prev])
    setSelectedId(cloned.id)
    setActiveView('overview')
    showToast(`Factura duplicada con éxito bajo el correlativo ${cloned.number}`, 'success')
  }

  // Eliminar factura
  const handleDeleteInvoice = (id) => {
    const remaining = invoices.filter((inv) => inv.id !== id)
    setInvoices(remaining)
    if (selectedId === id) {
      setSelectedId(remaining.length > 0 ? remaining[0].id : null)
    }
    showToast('Factura eliminada del historial.', 'warning')
  }

  // Restablecer datos de ejemplo
  const handleResetDemo = () => {
    if (window.confirm('¿Deseas restablecer las facturas de demostración iniciales?')) {
      setInvoices(INITIAL_INVOICES)
      setSelectedId(INITIAL_INVOICES[0].id)
      setActiveView('overview')
      showToast('Datos de demostración restablecidos.', 'info')
    }
  }

  const handleOpenNewInvoice = () => {
    setActiveView('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      {/* NOTIFICACIÓN FLOTANTE */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* BARRA SUPERIOR DE NAVEGACIÓN */}
      <Navbar
        onNewInvoice={handleOpenNewInvoice}
        onResetDemo={handleResetDemo}
        invoiceCount={invoices.length}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* CABECERA RESUMIDA Y MÉTRICAS FINANCIERAS */}
      <section className="dashboard-hero">
        <div className="hero-top-info">
          <div>
            <div className="hero-badge">HERRAMIENTA EMPRESARIAL</div>
            <h1 className="hero-heading">
              Panel de Control y <em>Facturación</em>
            </h1>
            <p className="hero-desc">
              Emite comprobantes en minutos con cálculo automático de impuestos, administra el historial de cobranzas y visualiza facturas oficiales listas para imprimir.
            </p>
          </div>

          <div className="hero-quick-actions">
            <button
              type="button"
              className={`hero-action-tab ${activeView === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveView('overview')}
            >
              📋 Ver Historial y Facturas
            </button>
            <button
              type="button"
              className={`hero-action-tab ${activeView === 'form' ? 'active' : ''}`}
              onClick={() => setActiveView('form')}
            >
              ✍️ Emitir Nueva Factura
            </button>
          </div>
        </div>

        {/* MÉTRICAS FINANCIERAS RESUMIDAS */}
        <StatsBar invoices={invoices} />
      </section>

      {/* CONTENEDOR DEL ESPACIO DE TRABAJO */}
      <main className="main-content-container">
        {/* VISTA 1: OVERVIEW (HISTORIAL + VISTA PREVIA MASTER-DETAIL) */}
        {activeView === 'overview' && (
          <div className="workspace-master-detail">
            <div className="workspace-left-col">
              <InvoiceList
                invoices={invoices}
                selectedId={selectedId}
                onSelect={(id) => {
                  setSelectedId(id)
                }}
                onDelete={handleDeleteInvoice}
                onCreateNewClick={handleOpenNewInvoice}
              />
            </div>

            <div className="workspace-right-col">
              <InvoicePreview
                invoice={selectedInvoice}
                onToggleStatus={handleToggleStatus}
                onDuplicate={handleDuplicateInvoice}
                onDelete={handleDeleteInvoice}
                onEditClick={handleOpenNewInvoice}
              />
            </div>
          </div>
        )}

        {/* VISTA 2: FORM (EMISIÓN ENFOCADA Y AMPLIA) */}
        {activeView === 'form' && (
          <div className="workspace-focused-form">
            <InvoiceForm
              key={suggestedNumber}
              onCreate={handleCreateInvoice}
              suggestedNumber={suggestedNumber}
              onCancel={() => setActiveView('overview')}
            />
          </div>
        )}

        {/* VISTA 3: SPLIT (TODO VISIBLE EN 3 COLUMNAS) */}
        {activeView === 'split' && (
          <div className="workspace-split-three">
            <div className="col-split col-form">
              <InvoiceForm
                key={suggestedNumber}
                onCreate={handleCreateInvoice}
                suggestedNumber={suggestedNumber}
              />
            </div>

            <div className="col-split col-list">
              <InvoiceList
                invoices={invoices}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onDelete={handleDeleteInvoice}
                onCreateNewClick={handleOpenNewInvoice}
              />
            </div>

            <div className="col-split col-preview">
              <InvoicePreview
                invoice={selectedInvoice}
                onToggleStatus={handleToggleStatus}
                onDuplicate={handleDuplicateInvoice}
                onDelete={handleDeleteInvoice}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
