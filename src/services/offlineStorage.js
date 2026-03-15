/**
 * offlineStorage.js
 *
 * Usa @capacitor/preferences en dispositivos nativos (Android/iOS)
 * y localStorage como fallback en el navegador web.
 *
 * IMPORTANTE: Capacitor.isNativePlatform() detecta si estamos en
 * una app nativa o en el navegador para evitar crashes del bridge.
 */

import { Preferences } from '@capacitor/preferences'
import { Capacitor } from '@capacitor/core'

const isNative = Capacitor.isNativePlatform()

export const offlineStorage = {
  /**
   * Guarda un valor (cualquier tipo serializable a JSON)
   */
  async set(key, value) {
    const json = JSON.stringify(value)
    if (isNative) {
      await Preferences.set({ key, value: json })
    } else {
      localStorage.setItem(key, json)
    }
  },

  /**
   * Obtiene un valor por clave. Retorna null si no existe.
   */
  async get(key) {
    try {
      if (isNative) {
        const { value } = await Preferences.get({ key })
        return value ? JSON.parse(value) : null
      } else {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : null
      }
    } catch {
      return null
    }
  },

  /**
   * Elimina una clave
   */
  async remove(key) {
    if (isNative) {
      await Preferences.remove({ key })
    } else {
      localStorage.removeItem(key)
    }
  },

  /**
   * Verifica si una clave tiene datos guardados
   */
  async has(key) {
    const value = await this.get(key)
    return value !== null && value !== undefined
  },
}
