import { api } from 'src/boot/axios'

export default {
  /**
   * Obtener estadísticas de dirección por sede
   * Retorna: stats, kpis, carreras con progreso
   */
  getDireccionStats(sedeId) {
    return api.get('/direccion/stats', { params: { sede_id: sedeId } })
  },

  /**
   * Obtener reporte de avance general con materias comunes
   * Incluye vinculaciones entre materias
   */
  getAvanceGeneral(params = {}) {
    return api.get('/reportes/avance-general', { params })
  },

  /**
   * Obtener reporte de materias por carrera (existente)
   */
  getReporteMaterias(params = {}) {
    return api.get('/reportes', { params })
  },

  /**
   * Obtener auditoría semanal de un docente
   */
  getAuditoriaSemanal(params) {
    return api.get('/reportes/auditoria-semanal', { params })
  },

  /**
   * Generar reporte semanal de carrera
   */
  generateWeeklyReport(params) {
    return api.get('/reportes/semanal', { params })
  },

  /**
   * Matriz de Control Institucional (Nivel 3)
   * Calcula avance real vs planeado con semáforos
   */
  getMatrizControl(params = {}) {
    return api.get('/reportes/matriz-control', { params })
  },

  /**
   * Auditoría 25% semanal (Nivel 3)
   * Selección aleatoria de asignaturas para auditoría
   */
  getAuditoria25(params = {}) {
    return api.get('/reportes/auditoria-25', { params })
  },

  // ========================================
  // NIVEL 2: DIRECTOR DE CARRERA
  // ========================================

  /** Docentes con 0% de documentación */
  getDocentesSinAvance(params = {}) {
    return api.get('/reportes/docentes-sin-avance', { params })
  },

  /** Docentes con avance <50% */
  getDocentesCriticos(params = {}) {
    return api.get('/reportes/docentes-criticos', { params })
  },

  /** Ranking de docentes por % de avance */
  getRankingDocentes(params = {}) {
    return api.get('/reportes/ranking-docentes', { params })
  },

  /** Asignaturas sin ningún cronograma */
  getAsignaturasSinCronograma(params = {}) {
    return api.get('/reportes/asignaturas-sin-cronograma', { params })
  },

  // ========================================
  // NIVEL 3: DIRECCIÓN ACADÉMICA
  // ========================================

  /** Carreras con avance <50% */
  getCarrerasCriticas(params = {}) {
    return api.get('/reportes/carreras-criticas', { params })
  },

  /** Ranking de carreras por sede */
  getRankingCarreras(params = {}) {
    return api.get('/reportes/ranking-carreras', { params })
  },

  /** Resumen ejecutivo consolidado de sede */
  getResumenSede(sedeId) {
    return api.get('/reportes/resumen-sede', { params: { sede_id: sedeId } })
  },

  // ========================================
  // NIVEL 4: VICERRECTOR
  // ========================================

  /** Monitoreo de avance por carrera */
  getMonitoreoCarreras(params = {}) {
    return api.get('/reportes/monitoreo-carreras', { params })
  },

  /** Sedes con avance crítico (solo Nacional) */
  getSedesCriticas(params = {}) {
    return api.get('/reportes/sedes-criticas', { params })
  },

  /** Ranking de sedes por avance */
  getRankingSedes(params = {}) {
    return api.get('/reportes/ranking-sedes', { params })
  },

  /** Alertas rojas consolidadas (todas las críticas) */
  getAlertasRojas(params = {}) {
    return api.get('/reportes/alertas-rojas', { params })
  },
}
