import { api } from 'src/boot/axios'

export default {
  // Obtener asignaturas con filtros (Sede, Carrera)
  getAsignaturas(params = {}) {
    return api.get('/asignaturas', { params })
  },

  getAsignatura(id) {
    return api.get(`/asignaturas/${id}`)
  },

  createAsignatura(data) {
    return api.post('/asignaturas', data)
  },

  updateAsignatura(id, data) {
    return api.put(`/asignaturas/${id}`, data)
  },

  deleteAsignatura(id) {
    return api.delete(`/asignaturas/${id}`)
  },

  assignDocentes(id, docentesIds) {
    // docentesIds expects array of integers
    return api.post(`/asignaturas/${id}/docentes`, { docentes: docentesIds })
  },

  importWord(id, file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/asignaturas/${id}/import-word`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Bibliografias
  addBibliografia(data) {
    return api.post('/bibliografias', data)
  },

  updateBibliografia(id, data) {
    return api.put(`/bibliografias/${id}`, data)
  },

  deleteBibliografia(id) {
    return api.delete(`/bibliografias/${id}`)
  }
}
