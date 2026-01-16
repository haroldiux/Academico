import { api } from 'boot/axios'

/**
 * Servicio para gestionar Plan de Clase
 * Separa datos a nivel MATERIA (compartidos) de datos a nivel DOCENTE (personalizados)
 */
export default {
  // ==========================================
  // DATOS A NIVEL MATERIA (compartidos)
  // ==========================================

  /**
   * Obtener datos del plan de clase a nivel materia
   * @param {number} materiaId - ID de la materia
   * @param {number} temaId - ID del tema
   */
  getDatosMateria(materiaId, temaId) {
    return api.get(`/materias/${materiaId}/temas/${temaId}/plan-clase/materia`)
  },

  /**
   * Actualizar datos del plan de clase a nivel materia
   * Solo DOCENTE, DIRECTOR_CARRERA y ADMIN pueden editar
   */
  updateDatosMateria(materiaId, temaId, data) {
    return api.put(`/materias/${materiaId}/temas/${temaId}/plan-clase/materia`, data)
  },

  // ==========================================
  // DATOS A NIVEL DOCENTE (personalizados)
  // ==========================================

  /**
   * Obtener datos del plan de clase a nivel docente
   * @param {number} materiaId - ID de la materia
   * @param {number} temaId - ID del tema
   * @param {number} docenteId - ID del docente (opcional, usa el actual si no se especifica)
   */
  getDatosDocente(materiaId, temaId, docenteId = null) {
    const params = docenteId ? { docente_id: docenteId } : {}
    return api.get(`/materias/${materiaId}/temas/${temaId}/plan-clase/docente`, { params })
  },

  /**
   * Actualizar datos del plan de clase a nivel docente
   * El docente solo puede editar sus propios datos
   */
  updateDatosDocente(materiaId, temaId, data, docenteId = null) {
    const params = docenteId ? { docente_id: docenteId } : {}
    return api.put(`/materias/${materiaId}/temas/${temaId}/plan-clase/docente`, data, { params })
  },

  // ==========================================
  // OPERACIONES COMBINADAS
  // ==========================================

  /**
   * Obtener plan de clase completo (materia + docente)
   */
  async getPlanClaseCompleto(materiaId, temaId, docenteId = null) {
    try {
      const [materiaRes, docenteRes] = await Promise.all([
        this.getDatosMateria(materiaId, temaId),
        this.getDatosDocente(materiaId, temaId, docenteId)
      ])

      return {
        materia: materiaRes.data,
        docente: docenteRes.data
      }
    } catch (error) {
      console.error('Error obteniendo plan de clase completo:', error)
      throw error
    }
  },

  /**
   * Guardar plan de clase completo
   * @param {Object} datosMateria - Datos a nivel materia
   * @param {Object} datosDocente - Datos a nivel docente
   * @param {boolean} puedeEditarMateria - Si el usuario puede editar datos de materia
   */
  async savePlanClaseCompleto(materiaId, temaId, datosMateria, datosDocente, puedeEditarMateria = false) {
    const promises = []

    // Solo guardar materia si tiene permisos
    if (puedeEditarMateria && datosMateria) {
      promises.push(this.updateDatosMateria(materiaId, temaId, datosMateria))
    }

    // Siempre puede guardar sus datos de docente
    if (datosDocente) {
      promises.push(this.updateDatosDocente(materiaId, temaId, datosDocente))
    }

    return Promise.all(promises)
  }
}
