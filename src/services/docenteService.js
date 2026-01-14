import { api } from 'boot/axios'

export default {
  getDocentes(params) {
    return api.get('/docentes', { params })
  },
  getDocente(id) {
    return api.get(`/docentes/${id}`)
  },
  createDocente(data) {
    return api.post('/docentes', data)
  },
  updateDocente(id, data) {
    return api.put(`/docentes/${id}`, data)
  },
  deleteDocente(id) {
    return api.delete(`/docentes/${id}`)
  }
}
