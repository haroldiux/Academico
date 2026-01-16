import { api } from 'boot/axios'

/**
 * Servicio para gestionar Programa de Asignatura
 * Maneja datos a nivel MATERIA (compartidos) con campos específicos del programa
 */
export default {
    // ==========================================
    // DATOS DEL PROGRAMA DE ASIGNATURA
    // ==========================================

    /**
     * Obtener programa de asignatura completo
     * @param {number} asignaturaId - ID de la asignatura
     */
    getPrograma(asignaturaId) {
        return api.get(`/asignaturas/${asignaturaId}/programa`)
    },

    /**
     * Actualizar programa de asignatura
     */
    updatePrograma(asignaturaId, data) {
        return api.put(`/asignaturas/${asignaturaId}/programa`, data)
    },

    // ==========================================
    // SECCIONES ESPECÍFICAS
    // ==========================================

    /**
     * Obtener justificación y propósito
     */
    getJustificacion(asignaturaId) {
        return api.get(`/asignaturas/${asignaturaId}/programa/justificacion`)
    },

    updateJustificacion(asignaturaId, data) {
        return api.put(`/asignaturas/${asignaturaId}/programa/justificacion`, data)
    },

    /**
     * Obtener competencias
     */
    getCompetencias(asignaturaId) {
        return api.get(`/asignaturas/${asignaturaId}/programa/competencias`)
    },

    updateCompetencias(asignaturaId, data) {
        return api.put(`/asignaturas/${asignaturaId}/programa/competencias`, data)
    },

    /**
     * Obtener elementos de competencia
     */
    getElementosCompetencia(asignaturaId) {
        return api.get(`/asignaturas/${asignaturaId}/programa/elementos-competencia`)
    },

    updateElementosCompetencia(asignaturaId, data) {
        return api.put(`/asignaturas/${asignaturaId}/programa/elementos-competencia`, data)
    },

    /**
     * Obtener metodología y evaluación
     */
    getMetodologia(asignaturaId) {
        return api.get(`/asignaturas/${asignaturaId}/programa/metodologia`)
    },

    updateMetodologia(asignaturaId, data) {
        return api.put(`/asignaturas/${asignaturaId}/programa/metodologia`, data)
    },

    /**
     * Obtener bibliografía complementaria
     */
    getBibliografiaComplementaria(asignaturaId) {
        return api.get(`/asignaturas/${asignaturaId}/programa/bibliografia-complementaria`)
    },

    updateBibliografiaComplementaria(asignaturaId, data) {
        return api.put(`/asignaturas/${asignaturaId}/programa/bibliografia-complementaria`, data)
    },

    // ==========================================
    // OPERACIÓN COMBINADA PARA GUARDAR TODO
    // ==========================================

    /**
     * Guardar programa completo
     */
    async saveProgramaCompleto(asignaturaId, programa) {
        return api.put(`/asignaturas/${asignaturaId}/programa`, {
            justificacion: programa.justificacion,
            proposito_general: programa.proposito_general,
            competencias: programa.competencias,
            elementos_competencia: programa.elementos_competencia,
            metodologia_general: programa.metodologia_general,
            sistema_evaluacion: programa.sistema_evaluacion,
            organizacion_calendario: programa.organizacion_calendario,
            bibliografia_complementaria: programa.bibliografia_complementaria
        })
    }
}
