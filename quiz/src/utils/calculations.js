/**
 * Calcula el subtotal para una línea de producto o servicio.
 * @param {number|string} quantity
 * @param {number|string} price
 * @returns {number}
 */
export function calculateItemSubtotal(quantity = 0, price = 0) {
  const q = Math.max(0, Number(quantity) || 0)
  const p = Math.max(0, Number(price) || 0)
  return Math.round((q * p) * 100) / 100
}

/**
 * Calcula los totales de una factura (subtotal imponible, impuesto y total general).
 * @param {Array<{quantity: number|string, price: number|string}>} items
 * @param {number|string} taxRate
 * @returns {{ subtotal: number, taxAmount: number, total: number }}
 */
export function calculateInvoiceTotals(items = [], taxRate = 0) {
  const subtotal = items.reduce((sum, item) => {
    return sum + calculateItemSubtotal(item.quantity, item.price)
  }, 0)

  const rate = Math.max(0, Number(taxRate) || 0)
  const taxAmount = Math.round((subtotal * (rate / 100)) * 100) / 100
  const total = Math.round((subtotal + taxAmount) * 100) / 100

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount,
    total,
  }
}
