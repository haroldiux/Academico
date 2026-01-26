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

  cambiarEstado(id, estado) {
    return api.put(`/asignaturas/${id}/estado`, { estado })
  },

  deleteAsignatura(id) {
    return api.delete(`/asignaturas/${id}`)
  },

  assignDocentes(id, docentesIds) {
    // docentesIds expects array of integers
    return api.post(`/asignaturas/${id}/docentes`, { docentes: docentesIds })
  },

  importWord(id, file, options = {}) {
    const formData = new FormData()
    formData.append('file', file)
    if (options.datos !== undefined) formData.append('import_datos', options.datos ? 1 : 0)
    if (options.unidades !== undefined) formData.append('import_unidades', options.unidades ? 1 : 0)
    if (options.bibliografia !== undefined) formData.append('import_bibliografia', options.bibliografia ? 1 : 0)

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
  },

  // Unidades y Temas CRUD
  createUnidad(asignaturaId, data) {
    // data: { titulo, numero, ... }
    return api.post(`/planificacion/asignaturas/${asignaturaId}/unidades`, data)
  },

  updateUnidad(id, data) {
    return api.put(`/planificacion/unidades/${id}`, data)
  },

  deleteUnidad(id) {
    return api.delete(`/planificacion/unidades/${id}`)
  },

  createTema(unidadId, data) {
    // data: { titulo, horas_teoricas, ... }
    return api.post(`/planificacion/unidades/${unidadId}/temas`, data)
  },

  updateTema(id, data) {
    // data: { titulo, ... } o contenido completo
    return api.put(`/planificacion/temas/${id}/contenido`, data)
  },

  deleteTema(id) {
    return api.delete(`/planificacion/temas/${id}`)
  },

  moveTema(id, direction) {
    return api.post(`/planificacion/temas/${id}/move`, { direction })
  }
}
