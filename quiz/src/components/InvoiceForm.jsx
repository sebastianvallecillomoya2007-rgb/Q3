import { useState } from 'react'
import { calculateInvoiceTotals, calculateItemSubtotal } from '../utils/calculations'
import { formatCurrency } from '../utils/formatters'
import { DEFAULT_COMPANY } from '../data/initialData'

/**
 * Devuelve la fecha de hoy en formato YYYY-MM-DD.
 */
function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Devuelve una fecha sumando N días a hoy en formato YYYY-MM-DD.
 */
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
 * Formulario para creación de facturas.
 * @param {{
 *   onCreate: (invoice: any) => void,
 *   suggestedNumber: string
 * }} props
 */
export function InvoiceForm({ onCreate, suggestedNumber }) {
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
    notes: 'Gracias por su preferencia. Pago mediante transferencia bancaria.',
  })

  const [useDefaultCompany, setUseDefaultCompany] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  // Manejadores de cambios en campos directos
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Manejador para datos de emisor
  const handleIssuerChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      issuer: { ...prev.issuer, [field]: value },
    }))
  }

  // Manejador para datos de cliente
  const handleClientChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      client: { ...prev.client, [field]: value },
    }))
  }

  // Alternar carga de datos de la empresa
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

  // Manejo de ítems
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

  // Restablecer formulario
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
      notes: 'Gracias por su preferencia.',
    })
    setUseDefaultCompany(true)
    setErrorMessage('')
  }

  // Enviar formulario
  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    // Validaciones
    if (!formData.number.trim()) {
      setErrorMessage('Por favor ingresa un número de factura válido.')
      return
    }
    if (!formData.issuer.name.trim() || !formData.issuer.taxId.trim()) {
      setErrorMessage('Los datos del emisor (nombre e identificación fiscal) son requeridos.')
      return
    }
    if (!formData.client.name.trim() || !formData.client.email.trim()) {
      setErrorMessage('Los datos del cliente (nombre y correo electrónico) son requeridos.')
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
        'Todos los productos o servicios deben tener descripción, cantidad mayor a 0 y precio válido.'
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

    // Resetear manteniendo datos del emisor
    setFormData((prev) => ({
      ...prev,
      client: { name: '', taxId: '', email: '', phone: '', address: '' },
      items: [createEmptyItem()],
      notes: 'Gracias por su preferencia.',
    }))
  }

  const liveTotals = calculateInvoiceTotals(formData.items, formData.taxRate)

  return (
    <form className="form-panel" onSubmit={handleSubmit} noValidate>
      <div className="form-header-bar">
        <div>
          <span className="step-badge">NUEVA EMISIÓN</span>
          <h2 className="panel-title">Emisión de Factura</h2>
        </div>
        <button
          type="button"
          className="button-link"
          onClick={handleReset}
          title="Limpiar formulario"
        >
          Limpiar campos
        </button>
      </div>

      {errorMessage && (
        <div className="form-error-banner" role="alert">
          <span className="error-icon">⚠</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECCIÓN 1: DATOS GENERALES */}
      <fieldset className="fieldset-section">
        <legend className="section-legend">
          <span className="legend-number">01</span>
          <div>
            <strong>Datos del Comprobante</strong>
            <small>Identificador correlativo, fechas y estado</small>
          </div>
        </legend>

        <div className="form-grid-3">
          <label>
            <span>Nº de Factura *</span>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => handleChange('number', e.target.value)}
              placeholder="FAC-0001"
              required
            />
          </label>

          <label>
            <span>Fecha de Emisión *</span>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => handleChange('issueDate', e.target.value)}
              required
            />
          </label>

          <label>
            <span>Fecha de Vencimiento</span>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
            />
          </label>
        </div>

        <div className="form-grid-2">
          <label>
            <span>Estado Inicial</span>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="select-input"
            >
              <option value="pending">Pendiente de Pago</option>
              <option value="paid">Pagada (Cancelada)</option>
            </select>
          </label>

          <label>
            <span>Impuesto IVA (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={formData.taxRate}
              onChange={(e) => handleChange('taxRate', e.target.value)}
              placeholder="12"
            />
          </label>
        </div>
      </fieldset>

      {/* SECCIÓN 2: DATOS DEL EMISOR */}
      <fieldset className="fieldset-section">
        <legend className="section-legend">
          <span className="legend-number">02</span>
          <div>
            <strong>Datos del Emisor</strong>
            <small>Información tributaria de la empresa</small>
          </div>
          <label className="checkbox-pill">
            <input
              type="checkbox"
              checked={useDefaultCompany}
              onChange={handleToggleDefaultCompany}
            />
            <span>Usar datos de la empresa</span>
          </label>
        </legend>

        <div className="form-grid-2">
          <label>
            <span>Razón Social / Nombre Emisor *</span>
            <input
              type="text"
              value={formData.issuer.name}
              onChange={(e) => handleIssuerChange('name', e.target.value)}
              placeholder="TechStore S.A."
              required
            />
          </label>

          <label>
            <span>NIT / RUC / ID Fiscal *</span>
            <input
              type="text"
              value={formData.issuer.taxId}
              onChange={(e) => handleIssuerChange('taxId', e.target.value)}
              placeholder="J-40123456-7"
              required
            />
          </label>
        </div>

        <div className="form-grid-3">
          <label>
            <span>Correo Emisor</span>
            <input
              type="email"
              value={formData.issuer.email}
              onChange={(e) => handleIssuerChange('email', e.target.value)}
              placeholder="facturacion@empresa.com"
            />
          </label>

          <label>
            <span>Teléfono Emisor</span>
            <input
              type="text"
              value={formData.issuer.phone}
              onChange={(e) => handleIssuerChange('phone', e.target.value)}
              placeholder="+57 300 000 0000"
            />
          </label>

          <label>
            <span>Dirección Emisor</span>
            <input
              type="text"
              value={formData.issuer.address}
              onChange={(e) => handleIssuerChange('address', e.target.value)}
              placeholder="Av. Principal #123"
            />
          </label>
        </div>
      </fieldset>

      {/* SECCIÓN 3: DATOS DEL CLIENTE */}
      <fieldset className="fieldset-section">
        <legend className="section-legend">
          <span className="legend-number">03</span>
          <div>
            <strong>Datos del Cliente (Receptor)</strong>
            <small>A quién va dirigida la factura</small>
          </div>
        </legend>

        <div className="form-grid-2">
          <label>
            <span>Cliente / Razón Social *</span>
            <input
              type="text"
              value={formData.client.name}
              onChange={(e) => handleClientChange('name', e.target.value)}
              placeholder="Nombre o empresa del cliente"
              required
            />
          </label>

          <label>
            <span>NIT / Cédula / ID Fiscal</span>
            <input
              type="text"
              value={formData.client.taxId}
              onChange={(e) => handleClientChange('taxId', e.target.value)}
              placeholder="900.123.456-7"
            />
          </label>
        </div>

        <div className="form-grid-3">
          <label>
            <span>Correo Electrónico *</span>
            <input
              type="email"
              value={formData.client.email}
              onChange={(e) => handleClientChange('email', e.target.value)}
              placeholder="cliente@correo.com"
              required
            />
          </label>

          <label>
            <span>Teléfono de Contacto</span>
            <input
              type="text"
              value={formData.client.phone}
              onChange={(e) => handleClientChange('phone', e.target.value)}
              placeholder="+57 310 000 0000"
            />
          </label>

          <label>
            <span>Dirección Fiscal</span>
            <input
              type="text"
              value={formData.client.address}
              onChange={(e) => handleClientChange('address', e.target.value)}
              placeholder="Calle 10 #20-30"
            />
          </label>
        </div>
      </fieldset>

      {/* SECCIÓN 4: DETALLE DE CONCEPTOS (PRODUCTOS O SERVICIOS) */}
      <fieldset className="fieldset-section">
        <div className="section-legend-with-action">
          <legend className="section-legend">
            <span className="legend-number">04</span>
            <div>
              <strong>Detalle de Ítems</strong>
              <small>Productos y servicios a facturar</small>
            </div>
          </legend>
          <button
            type="button"
            className="button button-soft button-sm"
            onClick={handleAddItem}
          >
            + Agregar Línea
          </button>
        </div>

        <div className="items-table-wrapper">
          <div className="items-table-header">
            <span className="col-idx">#</span>
            <span className="col-desc">Descripción del Producto / Servicio</span>
            <span className="col-qty">Cant.</span>
            <span className="col-price">Precio Unit. ($)</span>
            <span className="col-subtotal">Subtotal ($)</span>
            <span className="col-action"></span>
          </div>

          <div className="items-table-body">
            {formData.items.map((item, index) => {
              const lineSubtotal = calculateItemSubtotal(item.quantity, item.price)
              return (
                <div className="item-row-edit" key={item.id}>
                  <span className="col-idx item-idx-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <input
                    type="text"
                    className="col-desc input-item"
                    placeholder="Ej. Asesoría técnica, Teclado inalámbrico..."
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
                    className="col-qty input-item"
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
                    className="col-price input-item"
                    placeholder="0.00"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(item.id, 'price', e.target.value)
                    }
                    required
                  />
                  <span className="col-subtotal item-subtotal-display">
                    {formatCurrency(lineSubtotal)}
                  </span>
                  <button
                    type="button"
                    className="col-action icon-delete-btn"
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

        {/* NOTAS ADICIONALES */}
        <div className="notes-field">
          <label>
            <span>Términos, Condiciones o Notas</span>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Instrucciones bancarias, método de pago, política de garantía..."
            />
          </label>
        </div>

        {/* RESUMEN EN VIVO DE TOTALES */}
        <div className="live-summary-card">
          <div className="live-summary-row">
            <span>Subtotal Neto:</span>
            <strong>{formatCurrency(liveTotals.subtotal)}</strong>
          </div>
          <div className="live-summary-row">
            <span>Impuesto IVA ({formData.taxRate}%):</span>
            <strong>{formatCurrency(liveTotals.taxAmount)}</strong>
          </div>
          <div className="live-summary-row live-summary-total">
            <span>Total a Pagar:</span>
            <strong className="accent-total">{formatCurrency(liveTotals.total)}</strong>
          </div>
        </div>
      </fieldset>

      {/* PIE DEL FORMULARIO CON BOTONES */}
      <div className="form-submit-footer">
        <button
          type="button"
          className="button button-outline"
          onClick={handleReset}
        >
          Limpiar
        </button>
        <button type="submit" className="button button-primary button-lg">
          <span>Guardar y Emitir Factura</span>
          <span className="btn-arrow">→</span>
        </button>
      </div>
    </form>
  )
}
