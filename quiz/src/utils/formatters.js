/**
 * Formatea un número como valor monetario en USD con formato regional estándar.
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
export function formatCurrency(amount = 0, currency = 'USD') {
  const numericAmount = Number(amount) || 0
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount)
}

/**
 * Formatea una fecha YYYY-MM-DD a formato amigable en español.
 * @param {string} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  } catch {
    return dateString
  }
}

/**
 * Genera el siguiente número correlativo de factura basado en el historial existente.
 * Ej: Si existe FAC-0003, sugiere FAC-0004.
 * @param {Array<{number: string}>} invoices
 * @param {string} prefix
 * @returns {string}
 */
export function generateNextInvoiceNumber(invoices = [], prefix = 'FAC-') {
  let highestNum = 0

  invoices.forEach((inv) => {
    if (inv?.number && inv.number.startsWith(prefix)) {
      const parsed = parseInt(inv.number.replace(prefix, ''), 10)
      if (!isNaN(parsed) && parsed > highestNum) {
        highestNum = parsed
      }
    }
  })

  const nextNumber = highestNum + 1
  return `${prefix}${String(nextNumber).padStart(4, '0')}`
}
