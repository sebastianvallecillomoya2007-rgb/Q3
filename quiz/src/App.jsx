import { useState } from 'react'
import './App.css'

const initialItems = [
  { id: crypto.randomUUID(), description: 'Teclado mecánico', quantity: 2, price: 25 },
  { id: crypto.randomUUID(), description: 'Monitor ultrawide', quantity: 1, price: 180 },
  { id: crypto.randomUUID(), description: 'Mouse inalámbrico', quantity: 3, price: 12 },
]

const demoInvoice = {
  id: crypto.randomUUID(),
  number: 'FAC-0001',
  issueDate: '2026-09-07',
  tax: 12,
  issuer: { name: 'TechStore S.A.', taxId: 'J-40123456-7' },
  client: { name: 'Juan Pérez', contact: 'juan.perez@email.com' },
  items: initialItems,
}

const emptyForm = {
  number: '',
  issueDate: new Date().toISOString().slice(0, 10),
  tax: '12',
  issuerName: '',
  issuerTaxId: '',
  clientName: '',
  clientContact: '',
  items: [{ id: crypto.randomUUID(), description: '', quantity: 1, price: 0 }],
}

const money = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' }).format(value)

function getTotals(invoice) {
  const subtotal = invoice.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.price), 0)
  const tax = subtotal * (Number(invoice.tax) / 100)
  return { subtotal, tax, total: subtotal + tax }
}

function InvoiceForm({ onCreate }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const updateItem = (id, field, value) => {
    setForm((current) => ({ ...current, items: current.items.map((item) => item.id === id ? { ...item, [field]: value } : item) }))
  }

  const addItem = () => setForm((current) => ({
    ...current,
    items: [...current.items, { id: crypto.randomUUID(), description: '', quantity: 1, price: 0 }],
  }))

  const removeItem = (id) => setForm((current) => ({
    ...current,
    items: current.items.length > 1 ? current.items.filter((item) => item.id !== id) : current.items,
  }))

  const handleSubmit = (event) => {
    event.preventDefault()
    const validItems = form.items.every((item) => item.description.trim() && Number(item.quantity) > 0 && Number(item.price) >= 0)
    if (!form.number.trim() || !form.issueDate || !form.issuerName.trim() || !form.issuerTaxId.trim() || !form.clientName.trim() || !form.clientContact.trim() || !validItems) {
      setError('Completa los campos requeridos y verifica cantidades y precios.')
      return
    }
    onCreate({
      id: crypto.randomUUID(),
      number: form.number.trim(),
      issueDate: form.issueDate,
      tax: Number(form.tax) || 0,
      issuer: { name: form.issuerName.trim(), taxId: form.issuerTaxId.trim() },
      client: { name: form.clientName.trim(), contact: form.clientContact.trim() },
      items: form.items.map((item) => ({ ...item, quantity: Number(item.quantity), price: Number(item.price) })),
    })
    setForm({ ...emptyForm, number: `FAC-${String(Date.now()).slice(-4)}`, items: [{ id: crypto.randomUUID(), description: '', quantity: 1, price: 0 }] })
    setError('')
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <div className="section-heading"><span className="step">01</span><div><p className="eyebrow">Nueva factura</p><h2>Datos generales</h2></div></div>
      <div className="form-grid">
        <label>Número de factura<input value={form.number} onChange={(event) => updateForm('number', event.target.value)} placeholder="FAC-0002" required /></label>
        <label>Fecha de emisión<input type="date" value={form.issueDate} onChange={(event) => updateForm('issueDate', event.target.value)} required /></label>
      </div>
      <div className="form-grid">
        <label>Nombre del emisor<input value={form.issuerName} onChange={(event) => updateForm('issuerName', event.target.value)} placeholder="Empresa S.A." required /></label>
        <label>RUC / NIT / ID fiscal<input value={form.issuerTaxId} onChange={(event) => updateForm('issuerTaxId', event.target.value)} placeholder="J-12345678-9" required /></label>
      </div>
      <div className="form-grid">
        <label>Nombre del cliente<input value={form.clientName} onChange={(event) => updateForm('clientName', event.target.value)} placeholder="Nombre completo" required /></label>
        <label>Correo o dirección<input value={form.clientContact} onChange={(event) => updateForm('clientContact', event.target.value)} placeholder="cliente@email.com" required /></label>
      </div>
      <div className="section-heading items-heading"><span className="step">02</span><div><p className="eyebrow">Detalle</p><h2>Productos o servicios</h2></div><button type="button" className="button button-soft" onClick={addItem}>+ Agregar ítem</button></div>
      <div className="items-form">
        {form.items.map((item, index) => <div className="item-row" key={item.id}>
          <span className="item-index">{String(index + 1).padStart(2, '0')}</span>
          <input aria-label="Descripción" value={item.description} onChange={(event) => updateItem(item.id, 'description', event.target.value)} placeholder="Descripción del producto" required />
          <input aria-label="Cantidad" type="number" min="1" step="1" value={item.quantity} onChange={(event) => updateItem(item.id, 'quantity', event.target.value)} required />
          <input aria-label="Precio unitario" type="number" min="0" step="0.01" value={item.price} onChange={(event) => updateItem(item.id, 'price', event.target.value)} required />
          <button type="button" className="icon-button" onClick={() => removeItem(item.id)} aria-label="Eliminar ítem">×</button>
        </div>)}
      </div>
      <div className="form-footer"><label className="tax-field">Impuesto<input type="number" min="0" max="100" step="0.5" value={form.tax} onChange={(event) => updateForm('tax', event.target.value)} /> %</label><button className="button button-primary" type="submit">Guardar factura <span>→</span></button></div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  )
}

function InvoiceList({ invoices, selectedId, onSelect }) {
  return <aside className="list-panel"><div className="list-title"><div><p className="eyebrow">Historial</p><h2>Facturas creadas</h2></div><span className="count-badge">{invoices.length}</span></div>{invoices.length === 0 ? <div className="empty-state"><span>∅</span><p>No hay facturas registradas</p><small>Las facturas que guardes aparecerán aquí.</small></div> : <div className="invoice-list">{invoices.map((invoice) => { const totals = getTotals(invoice); return <button className={`invoice-list-item ${selectedId === invoice.id ? 'is-selected' : ''}`} key={invoice.id} onClick={() => onSelect(invoice.id)}><span className="invoice-icon">▤</span><span className="invoice-summary"><strong>{invoice.number}</strong><small>{invoice.client.name}</small></span><span className="invoice-total">{money(totals.total)}<small>{new Date(`${invoice.issueDate}T12:00:00`).toLocaleDateString('es-ES')}</small></span></button> })}</div>}</aside>
}

function Invoice({ invoice }) {
  if (!invoice) return <section className="invoice-preview blank-preview"><div className="preview-placeholder"><span>✦</span><h2>Selecciona una factura</h2><p>Elige una factura del historial para ver su diseño completo.</p></div></section>
  const totals = getTotals(invoice)
  return <section className="invoice-preview"><div className="preview-toolbar"><div><p className="eyebrow">Vista previa</p><h2>Factura lista para emitir</h2></div><button className="button button-outline" onClick={() => window.print()}>Imprimir <span>↗</span></button></div><article className="invoice-paper"><header className="invoice-header"><div><div className="brand-mark">T<span>S</span></div><h2>{invoice.issuer.name}</h2><p>ID fiscal: {invoice.issuer.taxId}</p></div><div className="invoice-meta"><span>FACTURA</span><strong>{invoice.number}</strong><small>Emitida el {new Date(`${invoice.issueDate}T12:00:00`).toLocaleDateString('es-ES')}</small></div></header><div className="invoice-parties"><div><span>EMISOR</span><strong>{invoice.issuer.name}</strong><p>{invoice.issuer.taxId}</p></div><div><span>FACTURAR A</span><strong>{invoice.client.name}</strong><p>{invoice.client.contact}</p></div></div><table><thead><tr><th>Descripción</th><th>Cant.</th><th>Precio unit.</th><th>Total</th></tr></thead><tbody>{invoice.items.map((item) => <tr key={item.id}><td>{item.description}</td><td>{item.quantity}</td><td>{money(item.price)}</td><td>{money(item.quantity * item.price)}</td></tr>)}</tbody></table><div className="invoice-bottom"><p>Gracias por confiar en nosotros.<br /><small>Este documento fue generado digitalmente.</small></p><div className="totals"><div><span>Subtotal</span><strong>{money(totals.subtotal)}</strong></div><div><span>Impuesto ({invoice.tax}%)</span><strong>{money(totals.tax)}</strong></div><div className="grand-total"><span>Total</span><strong>{money(totals.total)}</strong></div></div></div></article></section>
}

function App() {
  const [invoices, setInvoices] = useState([demoInvoice])
  const [selectedId, setSelectedId] = useState(demoInvoice.id)
  const selectedInvoice = invoices.find((invoice) => invoice.id === selectedId)
  const createInvoice = (invoice) => { setInvoices((current) => [invoice, ...current]); setSelectedId(invoice.id) }

  return <main className="app-shell"><header className="topbar"><div className="logo-lockup"><div className="logo">Q<span>3</span></div><div><strong>QUARTER</strong><small>GESTIÓN DE FACTURACIÓN</small></div></div><div className="status"><span className="status-dot" /> Espacio de trabajo activo</div></header><section className="intro"><div><p className="eyebrow">Panel de administración · Septiembre 2026</p><h1>Facturación <em>sin fricción.</em></h1><p className="intro-copy">Crea, organiza y visualiza tus comprobantes en un solo lugar.</p></div><div className="summary-chip"><strong>{invoices.length}</strong><span>facturas<br />registradas</span></div></section><div className="workspace"><InvoiceForm onCreate={createInvoice} /><InvoiceList invoices={invoices} selectedId={selectedId} onSelect={setSelectedId} /><Invoice invoice={selectedInvoice} /></div></main>
}

export default App
