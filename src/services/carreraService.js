import { api } from 'src/boot/axios'

export default {
  // Obtener carreras (con filtros opcionales)
  getCarreras(params = {}) {
    return api.get('/carreras', { params })
  },

  // Obtener detalle
  getCarrera(id) {
    return api.get(`/carreras/${id}`)
  },

  // Crear carrera
  createCarrera(data) {
    return api.post('/carreras', data)
  },

  // Actualizar carrera
  updateCarrera(id, data) {
    return api.put(`/carreras/${id}`, data)
  },

  // Eliminar carrera
  deleteCarrera(id) {
    return api.delete(`/carreras/${id}`)
  },
}
