import { api } from 'src/boot/axios'

export default {
  // Obtener carreras (con filtros opcionales)
  getCarreras(params = {}) {
    return api.get('/carreras', { params })
  },

  // Obtener detalle
  getCarrera(id) {
    return api.get(`/carreras/${id}`)
  }
}
