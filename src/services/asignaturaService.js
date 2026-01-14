import { api } from 'src/boot/axios'

export default {
  // Obtener asignaturas con filtros (Sede, Carrera)
  getAsignaturas(params = {}) {
    return api.get('/asignaturas', { params })
  },

  getAsignatura(id) {
    return api.get(`/asignaturas/${id}`)
  }
}
