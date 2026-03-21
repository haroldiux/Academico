import { api } from 'boot/axios'

export default {
  /**
   * Lista asignaturas con sus grupos anidados (vista docente/director).
   * GET /api/grupos — devuelve { data: [...asignaturas con grupos[]], meta }
   */
  getGrupos(params) {
    return api.get('/grupos', { params })
  },

  /**
   * Lista grupos reales (modelo Grupo) con relaciones — para CRUD admin.
   * GET /api/grupos-flat — devuelve { data: [...grupos], meta }
   * Soporta: sede_id, carrera_id, search, per_page, page
   */
  getGruposFlat(params) {
    return api.get('/grupos-flat', { params })
  },

  createGrupo(data) {
    return api.post('/grupos', data)
  },

  updateGrupo(id, data) {
    return api.put(`/grupos/${id}`, data)
  },

  deleteGrupo(id) {
    return api.delete(`/grupos/${id}`)
  },
}
