import { api } from 'boot/axios'

export default {
  /**
   * Obtiene la planificación (cronogramas) de una asignatura.
   * params: { grupo_id }
   */
  getPlanificacion(asignaturaId, params) {
    return api.get(`/planificacion-semestral/${asignaturaId}`, { params })
  },

  /**
   * Guarda o actualiza la planificación.
   * data: { sesiones: [], grupo_id: ... }
   */
  savePlanificacion(asignaturaId, data) {
    return api.post(`/planificacion-semestral/${asignaturaId}/planificacion`, data)
  },

  /**
   * Guarda la configuración (fechas, semestres).
   */
  saveConfig(asignaturaId, data) {
    return api.post(`/planificacion-semestral/${asignaturaId}/config`, data)
  }
}
