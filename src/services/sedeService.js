import { api } from 'src/boot/axios'

export default {
  // Obtener todas las sedes (con estadísticas)
  getSedes() {
    return api.get('/sedes')
  },

  // Obtener detalle de una sede
  getSede(id) {
    return api.get(`/sedes/${id}`)
  },

  // Crear sede
  createSede(data) {
    return api.post('/sedes', data)
  },

  // Actualizar sede
  updateSede(id, data) {
    return api.put(`/sedes/${id}`, data)
  },

  // Eliminar sede
  deleteSede(id) {
    return api.delete(`/sedes/${id}`)
  },
}
