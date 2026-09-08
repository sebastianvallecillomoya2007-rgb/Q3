import { useState } from 'react'
import { calculateInvoiceTotals, calculateItemSubtotal } from '../utils/calculations'
import { formatCurrency } from '../utils/formatters'
import { DEFAULT_COMPANY } from '../data/initialData'

function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

function getDefaultDueDate(daysAhead = 15) {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  return d.toISOString().slice(0, 10)
}

function createEmptyItem() {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    price: '',
  }
}

/**
 * Formulario profesional de emisión de facturas.
 * @param {{
 *   onCreate: (invoice: any) => void,
 *   suggestedNumber: string,
 *   onCancel?: () => void
 * }} props
 */
export function InvoiceForm({ onCreate, suggestedNumber, onCancel }) {
  const [formData, setFormData] = useState({
    number: suggestedNumber || 'FAC-0001',
    issueDate: getTodayDate(),
    dueDate: getDefaultDueDate(15),
    status: 'pending',
    taxRate: 12,
    issuer: {
      name: DEFAULT_COMPANY.name,
      taxId: DEFAULT_COMPANY.taxId,
      email: DEFAULT_COMPANY.email,
      phone: DEFAULT_COMPANY.phone,
      address: DEFAULT_COMPANY.address,
    },
    client: {
      name: '',
      taxId: '',
      email: '',
      phone: '',
      address: '',
    },
    items: [
      { id: crypto.randomUUID(), description: '', quantity: 1, price: '' },
    ],
    notes: 'Pago recibido oportunamente mediante transferencia bancaria. ¡Gracias por su compra!',
  })

  const [useDefaultCompany, setUseDefaultCompany] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleIssuerChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      issuer: { ...prev.issuer, [field]: value },
    }))
  }

  const handleClientChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      client: { ...prev.client, [field]: value },
    }))
  }

  const handleToggleDefaultCompany = (e) => {
    const isChecked = e.target.checked
    setUseDefaultCompany(isChecked)
    if (isChecked) {
      setFormData((prev) => ({
        ...prev,
        issuer: {
          name: DEFAULT_COMPANY.name,
          taxId: DEFAULT_COMPANY.taxId,
          email: DEFAULT_COMPANY.email,
          phone: DEFAULT_COMPANY.phone,
          address: DEFAULT_COMPANY.address,
        },
      }))
    }
  }

  const handleItemChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== id) return item
        return { ...item, [field]: value }
      }),
    }))
  }

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, createEmptyItem()],
    }))
  }

  const handleRemoveItem = (id) => {
    if (formData.items.length <= 1) return
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }))
  }

  const handleReset = () => {
    setFormData({
      number: suggestedNumber || 'FAC-0001',
      issueDate: getTodayDate(),
      dueDate: getDefaultDueDate(15),
      status: 'pending',
      taxRate: 12,
      issuer: {
        name: DEFAULT_COMPANY.name,
        taxId: DEFAULT_COMPANY.taxId,
        email: DEFAULT_COMPANY.email,
        phone: DEFAULT_COMPANY.phone,
        address: DEFAULT_COMPANY.address,
      },
      client: {
        name: '',
        taxId: '',
        email: '',
        phone: '',
        address: '',
      },
      items: [createEmptyItem()],
      notes: 'Pago recibido oportunamente mediante transferencia bancaria.',
    })
    setUseDefaultCompany(true)
    setErrorMessage('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!formData.number.trim()) {
      setErrorMessage('Ingresa un número de factura válido (ej. FAC-0001).')
      return
    }
    if (!formData.issuer.name.trim() || !formData.issuer.taxId.trim()) {
      setErrorMessage('Los datos del emisor (Razón social y NIT/RUC) son obligatorios.')
      return
    }
    if (!formData.client.name.trim() || !formData.client.email.trim()) {
      setErrorMessage('Los datos del cliente (Nombre y Correo electrónico) son requeridos.')
      return
    }

    const hasInvalidItem = formData.items.some(
      (item) =>
        !item.description.trim() ||
        Number(item.quantity) <= 0 ||
        Number(item.price) < 0 ||
        item.price === ''
    )

    if (hasInvalidItem) {
      setErrorMessage(
        'Todos los productos o servicios deben tener descripción, cantidad mayor a 0 y precio unitario válido.'
      )
      return
    }

    const sanitizedInvoice = {
      id: crypto.randomUUID(),
      number: formData.number.trim().toUpperCase(),
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      status: formData.status,
      taxRate: Math.max(0, Number(formData.taxRate) || 0),
      issuer: {
        name: formData.issuer.name.trim(),
        taxId: formData.issuer.taxId.trim(),
        email: formData.issuer.email.trim(),
        phone: formData.issuer.phone.trim(),
        address: formData.issuer.address.trim(),
      },
      client: {
        name: formData.client.name.trim(),
        taxId: formData.client.taxId.trim(),
        email: formData.client.email.trim(),
        phone: formData.client.phone.trim(),
        address: formData.client.address.trim(),
      },
      items: formData.items.map((item) => ({
        id: item.id,
        description: item.description.trim(),
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
      notes: formData.notes.trim(),
    }

    onCreate(sanitizedInvoice)
  }

  const liveTotals = calculateInvoiceTotals(formData.items, formData.taxRate)

  return (
    <form className="form-panel-modern" onSubmit={handleSubmit} noValidate>
      {/* CABECERA DEL FORMULARIO */}
      <div className="form-card-header">
        <div>
          <div className="form-title-badge">
            <span className="badge-bullet" />
            <span>NUEVA EMISIÓN</span>
          </div>
          <h2 className="form-main-title">Formulario de Facturación</h2>
          <p className="form-subtitle">
            Completa la información tributaria, datos del cliente y los conceptos a facturar.
          </p>
        </div>

        <div className="form-header-actions">
          <button
            type="button"
            className="button button-outline button-sm"
            onClick={handleReset}
            title="Limpiar formulario"
          >
            Limpiar Campos
          </button>
          {onCancel && (
            <button
              type="button"
              className="button button-soft button-sm"
              onClick={onCancel}
            >
              Cerrar
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="alert-box alert-error" role="alert">
          <span className="alert-icon">⚠️</span>
          <div className="alert-content">
            <strong>Revisa los campos del formulario:</strong>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* BLOQUE 1: DATOS DEL COMPROBANTE */}
      <div className="form-section-card">
        <div className="section-card-heading">
          <span className="section-number">1</span>
          <div>
            <h3>Datos Generales del Comprobante</h3>
            <small>Identificación, fecha de emisión y régimen tributario</small>
          </div>
        </div>

        <div className="grid-fields grid-fields-4">
          <label className="field-group">
            <span className="field-label">Nº de Factura <span className="req">*</span></span>
            <input
              type="text"
              className="field-input field-input-bold"
              value={formData.number}
              onChange={(e) => handleChange('number', e.target.value)}
              placeholder="FAC-0001"
              required
            />
          </label>

          <label className="field-group">
            <span className="field-label">Fecha de Emisión <span className="req">*</span></span>
            <input
              type="date"
              className="field-input"
              value={formData.issueDate}
              onChange={(e) => handleChange('issueDate', e.target.value)}
              required
            />
          </label>

          <label className="field-group">
            <span className="field-label">Fecha de Vencimiento</span>
            <input
              type="date"
              className="field-input"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
            />
          </label>

          <label className="field-group">
            <span className="field-label">Estado Inicial</span>
            <select
              className="field-input field-select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="pending">⏳ Pendiente de Pago</option>
              <option value="paid">✓ Pagada (Cancelada)</option>
            </select>
          </label>
        </div>
      </div>

      {/* BLOQUE 2: EMISOR Y CLIENTE (DOS COLUMNAS PARALELAS) */}
      <div className="form-parties-layout">
        {/* EMISOR */}
        <div className="form-section-card party-section-card">
          <div className="section-card-heading section-card-between">
            <div className="heading-with-icon">
              <span className="section-number">2A</span>
              <div>
                <h3>Empresa Emisora (De:)</h3>
                <small>Datos de la pequeña empresa</small>
              </div>
            </div>
            <label className="toggle-checkbox-label">
              <input
                type="checkbox"
                checked={useDefaultCompany}
                onChange={handleToggleDefaultCompany}
              />
              <span>Usar datos de la empresa</span>
            </label>
          </div>

          <div className="grid-fields grid-fields-2">
            <label className="field-group">
              <span className="field-label">Razón Social <span className="req">*</span></span>
              <input
                type="text"
                className="field-input"
                value={formData.issuer.name}
                onChange={(e) => handleIssuerChange('name', e.target.value)}
                placeholder="TechStore S.A."
                required
              />
            </label>

            <label className="field-group">
              <span className="field-label">NIT / RUC / ID Fiscal <span className="req">*</span></span>
              <input
                type="text"
                className="field-input"
                value={formData.issuer.taxId}
                onChange={(e) => handleIssuerChange('taxId', e.target.value)}
                placeholder="J-40123456-7"
                required
              />
            </label>
          </div>

          <div className="grid-fields grid-fields-2">
            <label className="field-group">
              <span className="field-label">Correo Electrónico</span>
              <input
                type="email"
                className="field-input"
                value={formData.issuer.email}
                onChange={(e) => handleIssuerChange('email', e.target.value)}
                placeholder="facturacion@empresa.com"
              />
            </label>

            <label className="field-group">
              <span className="field-label">Teléfono</span>
              <input
                type="text"
                className="field-input"
                value={formData.issuer.phone}
                onChange={(e) => handleIssuerChange('phone', e.target.value)}
                placeholder="+57 300 123 4567"
              />
            </label>
          </div>

          <label className="field-group">
            <span className="field-label">Dirección Fiscal</span>
            <input
              type="text"
              className="field-input"
              value={formData.issuer.address}
              onChange={(e) => handleIssuerChange('address', e.target.value)}
              placeholder="Av. Las Palmas #45-12"
            />
          </label>
        </div>

        {/* CLIENTE */}
        <div className="form-section-card party-section-card">
          <div className="section-card-heading">
            <div className="heading-with-icon">
              <span className="section-number">2B</span>
              <div>
                <h3>Cliente / Destinatario (Para:)</h3>
                <small>Información del comprador</small>
              </div>
            </div>
          </div>

          <div className="grid-fields grid-fields-2">
            <label className="field-group">
              <span className="field-label">Nombre / Razón Social <span className="req">*</span></span>
              <input
                type="text"
                className="field-input"
                value={formData.client.name}
                onChange={(e) => handleClientChange('name', e.target.value)}
                placeholder="Nombre o empresa del cliente"
                required
              />
            </label>

            <label className="field-group">
              <span className="field-label">NIT / Cédula / ID Fiscal</span>
              <input
                type="text"
                className="field-input"
                value={formData.client.taxId}
                onChange={(e) => handleClientChange('taxId', e.target.value)}
                placeholder="900.542.112-4"
              />
            </label>
          </div>

          <div className="grid-fields grid-fields-2">
            <label className="field-group">
              <span className="field-label">Correo Electrónico <span className="req">*</span></span>
              <input
                type="email"
                className="field-input"
                value={formData.client.email}
                onChange={(e) => handleClientChange('email', e.target.value)}
                placeholder="cliente@empresa.com"
                required
              />
            </label>

            <label className="field-group">
              <span className="field-label">Teléfono de Contacto</span>
              <input
                type="text"
                className="field-input"
                value={formData.client.phone}
                onChange={(e) => handleClientChange('phone', e.target.value)}
                placeholder="+57 310 987 6543"
              />
            </label>
          </div>

          <label className="field-group">
            <span className="field-label">Dirección de Entrega / Fiscal</span>
            <input
              type="text"
              className="field-input"
              value={formData.client.address}
              onChange={(e) => handleClientChange('address', e.target.value)}
              placeholder="Calle 100 #15-31"
            />
          </label>
        </div>
      </div>

      {/* BLOQUE 3: LÍNEAS DE CONCEPTOS (PRODUCTOS O SERVICIOS) */}
      <div className="form-section-card">
        <div className="section-card-heading section-card-between">
          <div className="heading-with-icon">
            <span className="section-number">3</span>
            <div>
              <h3>Conceptos a Facturar</h3>
              <small>Especifica cada producto, servicio, cantidad y precio unitario</small>
            </div>
          </div>

          <button
            type="button"
            className="button button-soft button-sm"
            onClick={handleAddItem}
          >
            + Agregar Línea
          </button>
        </div>

        <div className="items-table-container">
          <div className="items-grid-header">
            <span className="h-idx">#</span>
            <span className="h-desc">Descripción del Producto o Servicio</span>
            <span className="h-qty">Cant.</span>
            <span className="h-price">Precio Unit. ($)</span>
            <span className="h-total">Subtotal ($)</span>
            <span className="h-del"></span>
          </div>

          <div className="items-grid-body">
            {formData.items.map((item, index) => {
              const lineSubtotal = calculateItemSubtotal(item.quantity, item.price)
              return (
                <div className="items-grid-row" key={item.id}>
                  <span className="cell-item-idx">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <input
                    type="text"
                    className="field-input cell-item-desc"
                    placeholder="Ej. Teclado ergonómico, Mantenimiento de servidores..."
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(item.id, 'description', e.target.value)
                    }
                    required
                  />

                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="field-input cell-item-qty"
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(item.id, 'quantity', e.target.value)
                    }
                    required
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="field-input cell-item-price"
                    placeholder="0.00"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(item.id, 'price', e.target.value)
                    }
                    required
                  />

                  <div className="cell-item-subtotal">
                    {formatCurrency(lineSubtotal)}
                  </div>

                  <button
                    type="button"
                    className="item-row-delete"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={formData.items.length <= 1}
                    title="Eliminar este ítem"
                    aria-label="Eliminar ítem"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* BLOQUE 4: NOTAS Y RESUMEN FINANCIERO */}
      <div className="form-section-card form-footer-section">
        <div className="footer-notes-col">
          <label className="field-group">
            <span className="field-label">Condiciones de Pago y Notas para el Cliente</span>
            <textarea
              className="field-input field-textarea"
              rows="3"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Ej. Cuenta corriente Bancolombia Nº 123-456789. Plazo de 15 días..."
            />
          </label>

          <div className="tax-config-row">
            <label className="tax-label-group">
              <span className="field-label">Tasa de Impuesto IVA:</span>
              <div className="tax-input-wrap">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  className="field-input tax-number-input"
                  value={formData.taxRate}
                  onChange={(e) => handleChange('taxRate', e.target.value)}
                />
                <span className="tax-percent-sym">%</span>
              </div>
            </label>
          </div>
        </div>

        {/* TARJETA DE TOTALES EN VIVO */}
        <div className="footer-summary-card">
          <div className="summary-title-row">
            <span>Resumen Contable</span>
            <span className="summary-currency-tag">USD ($)</span>
          </div>

          <div className="summary-calc-row">
            <span>Subtotal Neto:</span>
            <strong>{formatCurrency(liveTotals.subtotal)}</strong>
          </div>

          <div className="summary-calc-row">
            <span>IVA Calculado ({formData.taxRate}%):</span>
            <strong>{formatCurrency(liveTotals.taxAmount)}</strong>
          </div>

          <div className="summary-divider" />

          <div className="summary-calc-row summary-grand-total">
            <span>Total a Pagar:</span>
            <span className="total-highlight">{formatCurrency(liveTotals.total)}</span>
          </div>

          <div className="form-action-buttons">
            <button
              type="submit"
              className="button button-primary button-lg button-full-width"
            >
              <span>✓ Emitir y Guardar Factura</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
