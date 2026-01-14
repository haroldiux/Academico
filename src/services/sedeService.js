import { api } from 'src/boot/axios'

export default {
  // Obtener todas las sedes (con estadísticas)
  getSedes() {
    return api.get('/sedes')
  },

  // Obtener detalle de una sede
  getSede(id) {
    return api.get(`/sedes/${id}`)
  }
}
