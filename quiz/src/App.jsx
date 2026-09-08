import { useState, useRef } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { INITIAL_INVOICES, DEFAULT_COMPANY } from './data/initialData'
import { generateNextInvoiceNumber } from './utils/formatters'
import { Navbar } from './components/Navbar'
import { StatsBar } from './components/StatsBar'
import { InvoiceForm } from './components/InvoiceForm'
import { InvoiceList } from './components/InvoiceList'
import { InvoicePreview } from './components/InvoicePreview'
import { Toast } from './components/Toast'
import './App.css'

function App() {
  const [invoices, setInvoices] = useLocalStorage('qu3_invoices_v2', INITIAL_INVOICES)
  const [selectedId, setSelectedId] = useState(() => {
    return invoices.length > 0 ? invoices[0].id : null
  })
  const [toast, setToast] = useState(null)
  const formRef = useRef(null)

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
    showToast(`¡Factura ${newInvoice.number} emitida y guardada con éxito!`, 'success')
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
      `Factura actualizada a estado: ${newStatus === 'paid' ? 'Pagada ✓' : 'Pendiente ⏳'}`,
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
    showToast(`Factura duplicada correctamente como ${cloned.number}`, 'success')
  }

  // Eliminar factura
  const handleDeleteInvoice = (id) => {
    const remaining = invoices.filter((inv) => inv.id !== id)
    setInvoices(remaining)
    if (selectedId === id) {
      setSelectedId(remaining.length > 0 ? remaining[0].id : null)
    }
    showToast('Factura eliminada del registro.', 'warning')
  }

  // Restablecer datos de ejemplo
  const handleResetDemo = () => {
    if (window.confirm('¿Deseas restablecer las facturas de demostración iniciales?')) {
      setInvoices(INITIAL_INVOICES)
      setSelectedId(INITIAL_INVOICES[0].id)
      showToast('Datos de demostración restablecidos.', 'info')
    }
  }

  // Scroll suave al formulario al hacer clic en "+ Nueva Factura"
  const handleScrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      const firstInput = formRef.current.querySelector('input')
      if (firstInput) firstInput.focus()
    }
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
        onNewInvoice={handleScrollToForm}
        onResetDemo={handleResetDemo}
        invoiceCount={invoices.length}
      />

      {/* SECCIÓN HERO / INTRO */}
      <section className="intro">
        <div className="intro-content">
          <p className="eyebrow">HERRAMIENTA EMPRESARIAL · GESTIÓN DE COBROS</p>
          <h1>
            Emisión y Control de <em>Facturas</em>
          </h1>
          <p className="intro-copy">
            Ingresa los datos de tu comprobante, calcula impuestos y subtotales en tiempo real,
            organiza el historial de cobros y genera comprobantes profesionales listos para imprimir o exportar.
          </p>
        </div>

        {/* MÉTRICAS FINANCIERAS RESUMIDAS */}
        <StatsBar invoices={invoices} />
      </section>

      {/* ÁREA DE TRABAJO PRINCIPAL: FORMULARIO, LISTA Y VISTA PREVIA */}
      <div className="workspace">
        {/* COLUMNA 1: FORMULARIO DE FACTURACIÓN */}
        <div className="workspace-column column-form" ref={formRef}>
          <InvoiceForm
            key={suggestedNumber}
            onCreate={handleCreateInvoice}
            suggestedNumber={suggestedNumber}
            defaultCompany={DEFAULT_COMPANY}
          />
        </div>

        {/* COLUMNA 2: HISTORIAL Y LISTA DE FACTURAS */}
        <div className="workspace-column column-list">
          <InvoiceList
            invoices={invoices}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={handleDeleteInvoice}
          />
        </div>

        {/* COLUMNA 3: VISTA PREVIA IMPRIMIBLE PROFESIONAL */}
        <div className="workspace-column column-preview">
          <InvoicePreview
            invoice={selectedInvoice}
            onToggleStatus={handleToggleStatus}
            onDuplicate={handleDuplicateInvoice}
            onDelete={handleDeleteInvoice}
          />
        </div>
      </div>
    </div>
  )
}

export default App
