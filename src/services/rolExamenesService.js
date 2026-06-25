import { api } from 'boot/axios'

/**
 * Servicio para gestionar el Rol de Exámenes
 * Permite subir Excel masivo y consultar fechas de exámenes por materia
 */
export default {
  /**
   * Subir Excel con rol de exámenes
   * @param {FormData} formData - Archivo Excel
   * @param {Object} params - gestion, carrera_id, sede_id
   */
  uploadExcel(formData, params = {}) {
    return api.post('/rol-examenes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params,
    })
  },

  /**
   * Subir Excel simple con rol de 2da instancia
   * @param {FormData} formData - Archivo Excel
   * @param {Object} params - gestion, carrera_id, sede_id
   */
  uploadSegundaInstancia(formData, params = {}) {
    return api.post('/rol-examenes/upload-segunda-instancia', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params,
    })
  },

  /**
   * Obtener rol de exámenes por gestión y carrera
   */
  getRolExamenes(params = {}) {
    return api.get('/rol-examenes', { params })
  },

  /**
   * Obtener exámenes de una materia específica
   */
  getExamenesByMateria(materiaId, gestion) {
    return api.get(`/rol-examenes/materia/${materiaId}`, {
      params: { gestion },
    })
  },

  /**
   * Actualizar un examen
   */
  updateExamen(id, data) {
    return api.put(`/rol-examenes/${id}`, data)
  },

  /**
   * Eliminar un examen
   */
  deleteExamen(id) {
    return api.delete(`/rol-examenes/${id}`)
  },

  /**
   * Crear examen manualmente
   */
  createExamen(data) {
    return api.post('/rol-examenes', data)
  },

  /**
   * Descargar plantilla Excel
   */
  downloadTemplate() {
    return api.get('/rol-examenes/template', {
      responseType: 'blob',
    })
  },

  /**
   * Descargar plantilla Excel para 2da instancia
   */
  downloadSegundaInstanciaTemplate(params = {}) {
    return api.get('/rol-examenes/template-segunda-instancia', {
      responseType: 'blob',
      params,
    })
  },

  /**
   * Eliminar todos los exámenes de una gestión/carrera/sede
   */
  deleteAll(gestion, carrera_id, sede_id) {
    return api.post('/rol-examenes/bulk-delete', { gestion, carrera_id, sede_id })
  },
}
