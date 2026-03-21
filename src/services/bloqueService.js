import { api } from 'boot/axios'

export default {
  getBloques(params = {}) {
    return api.get('/bloques', { params })
  },
  createBloque(data) {
    return api.post('/bloques', data)
  },
  updateBloque(id, data) {
    return api.put(`/bloques/${id}`, data)
  },
  deleteBloque(id) {
    return api.delete(`/bloques/${id}`)
  },
}
