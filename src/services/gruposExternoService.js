import { api } from 'boot/axios'

export default {
  /**
   * Listar grupos desde la API externa
   * @param {Object} params - Parámetros de consulta
   * @param {string} params.gestion - Gestión académica (ej: '1-2026')
   * @param {string} params.carrera - Código de carrera (ej: 'carsis')
   * @param {number} params.sede - ID de la sede
   */
  listarGrupos(params = {}) {
    return api.get('/grupos', { params })
  },

  /**
   * Recargar datos (alias de listar para consistencia)
   * @param {Object} params - Parámetros de consulta
   */
  refrescarGrupos(params = {}) {
    return api.get('/grupos', { params })
  }
}
