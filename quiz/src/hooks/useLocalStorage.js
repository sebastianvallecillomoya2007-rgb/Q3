import { useState, useEffect } from 'react'

/**
 * Hook personalizado para persistir y sincronizar estado en localStorage de forma segura.
 * @template T
 * @param {string} key
 * @param {T} initialValue
 * @returns {[T, (value: T | ((val: T) => T)) => void]}
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error al leer la clave "${key}" de localStorage:`, error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.warn(`Error al guardar la clave "${key}" en localStorage:`, error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}
