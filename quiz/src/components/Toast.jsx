import { useEffect } from 'react'

/**
 * Notificación flotante informativa y accesible.
 * @param {{
 *   message: string,
 *   type?: 'success' | 'info' | 'warning',
 *   onClose: () => void
 * }} props
 */
export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => {
      onClose()
    }, 4000)
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  return (
    <div className={`toast-container toast-${type}`} role="alert" aria-live="assertive">
      <span className="toast-icon">
        {type === 'success' && '✓'}
        {type === 'warning' && '⚠'}
        {type === 'info' && 'ℹ'}
      </span>
      <span className="toast-message">{message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  )
}
