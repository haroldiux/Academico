import { api } from 'src/boot/axios'

export default {
  /**
   * Obtener carga académica de una materia específica.
   * GET /api/carga-academica/materia
   * Query: { sede_id, carrera_id, asignatura_id, gestion? }
   */
  getByMateria(params) {
    return api.get('/carga-academica/materia', { params })
  },

  /**
   * Obtener carga académica de todas las materias de una carrera.
   * GET /api/carga-academica/carrera
   * Query: { sede_id, carrera_id, gestion? }
   */
  getByCarrera(params) {
    return api.get('/carga-academica/carrera', { params })
  },

  /**
   * Crear un nuevo grupo con horarios.
   * POST /api/carga-academica/grupo
   */
  createGrupo(data) {
    return api.post('/carga-academica/grupo', data)
  },

  /**
   * Actualizar un grupo existente con horarios.
   * PUT /api/carga-academica/grupo/{id}
   */
  updateGrupo(id, data) {
    return api.put(`/carga-academica/grupo/${id}`, data)
  },

  /**
   * Reasignar docente a un grupo.
   * PUT /api/carga-academica/grupo/{id}/docente
   */
  assignDocente(id, data) {
    return api.put(`/carga-academica/grupo/${id}/docente`, data)
  },

  /**
   * Validar conflictos sin guardar.
   * POST /api/carga-academica/validar
   */
  validar(data) {
    return api.post('/carga-academica/validar', data)
  },

  /**
   * Sincronizar una materia específica desde la API externa.
   * POST /api/carga-academica/sync
   */
  syncMateria(data) {
    return api.post('/carga-academica/sync', data)
  },
}
