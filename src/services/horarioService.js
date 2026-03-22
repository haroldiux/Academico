import { api } from 'src/boot/axios'

export default {
  // Obtener horarios (con filtros opcionales)
  getHorarios(params = {}) {
    return api.get('/horarios', { params })
  },

  // Obtener detalle
  getHorario(id) {
    return api.get(`/horarios/${id}`)
  },

  // Crear horario
  createHorario(data) {
    return api.post('/horarios', data)
  },

  // Actualizar horario
  updateHorario(id, data) {
    return api.put(`/horarios/${id}`, data)
  },

  // Eliminar horario
  deleteHorario(id) {
    return api.delete(`/horarios/${id}`)
  },
}
