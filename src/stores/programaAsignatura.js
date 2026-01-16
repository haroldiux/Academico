import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { useGruposStore } from './grupos'
import programaAsignaturaService from 'src/services/programaAsignaturaService'

/**
 * Store para gestionar Programa de Asignatura
 * Incluye integración con horarios desde API externa
 */
export const useProgramaAsignaturaStore = defineStore('programaAsignatura', () => {
    const authStore = useAuthStore()
    const gruposStore = useGruposStore()

    // ==========================================
    // STATE
    // ==========================================

    const asignaturaId = ref(null)
    const loading = ref(false)
    const guardando = ref(false)
    const error = ref(null)

    // Datos del programa (a nivel MATERIA - compartido)
    const programa = ref({
        // Sección 3: Justificación
        justificacion: '',

        // Sección 4: Propósito General
        proposito_general: '',

        // Sección 5: Competencias
        competencias: {
            global_especifica: '',
            competencia_asignatura: ''
        },

        // Sección 6: Elementos de Competencia
        elementos_competencia: [],

        // Sección 9: Metodología General
        metodologia_general: '',

        // Sección 10: Sistema de Evaluación
        sistema_evaluacion: {
            diagnostica: '',
            formativa: '',
            sumativa: ''
        },

        // Sección 12: Organización y Calendario
        organizacion_calendario: '',

        // Sección 15: Bibliografía Complementaria
        bibliografia_complementaria: []
    })

    // ==========================================
    // GETTERS - PERMISOS
    // ==========================================

    const ROLES_EDICION = ['DOCENTE', 'DIRECTOR_CARRERA', 'ADMIN', 'SUPER_ADMIN']
    const ROLES_SOLO_LECTURA = ['DIRECCION_ACADEMICA', 'VICERRECTOR_SEDE', 'VICERRECTOR_NACIONAL']

    const puedeEditar = computed(() => {
        const userRol = authStore.rol
        return ROLES_EDICION.includes(userRol)
    })

    const esSoloLectura = computed(() => {
        const userRol = authStore.rol
        return ROLES_SOLO_LECTURA.includes(userRol)
    })

    // ==========================================
    // GETTERS - HORARIOS (desde API externa)
    // ==========================================

    /**
     * Obtiene los horarios de la materia actual desde gruposStore
     */
    const horariosMateria = computed(() => {
        if (!asignaturaId.value) return []

        // Buscar la materia en materiasExterno
        const materia = gruposStore.materiasExterno?.find(m =>
            m.id === asignaturaId.value || m.codigo === asignaturaId.value
        )

        if (!materia?.grupos) return []

        // Transformar grupos a formato de horarios
        return materia.grupos.map(g => ({
            dia: g.dia,
            horaInicio: g.hora_inicio,
            horaFin: g.hora_fin,
            aula: g.aula || '',
            bloque: g.bloque || '',
            grupo: g.grupo,
            tipoClase: g.tipo_clase,
            docente: g.docente
        }))
    })

    /**
     * Datos generales de la materia desde API externa
     */
    const datosGenerales = computed(() => {
        if (!asignaturaId.value) return null

        const materia = gruposStore.materiasExterno?.find(m =>
            m.id === asignaturaId.value || m.codigo === asignaturaId.value
        )

        if (!materia) return null

        return {
            carrera: materia.carrera,
            asignatura: materia.nombre,
            codigo: materia.codigo,
            semestre: materia.semestre,
            sede: materia.sede_nombre,
            gestion: materia.gestion
        }
    })

    // ==========================================
    // ACTIONS
    // ==========================================

    /**
     * Cargar programa de asignatura
     */
    async function cargarPrograma(asigId) {
        loading.value = true
        error.value = null
        asignaturaId.value = asigId

        try {
            // Asegurar que tenemos los datos externos cargados
            if (!gruposStore.materiasExterno?.length) {
                await gruposStore.fetchGruposExterno()
            }

            // Cargar datos del programa desde API local
            const response = await programaAsignaturaService.getPrograma(asigId)

            if (response.data) {
                programa.value = {
                    justificacion: response.data.justificacion || '',
                    proposito_general: response.data.proposito_general || '',
                    competencias: response.data.competencias || { global_especifica: '', competencia_asignatura: '' },
                    elementos_competencia: response.data.elementos_competencia || [],
                    metodologia_general: response.data.metodologia_general || '',
                    sistema_evaluacion: response.data.sistema_evaluacion || { diagnostica: '', formativa: '', sumativa: '' },
                    organizacion_calendario: response.data.organizacion_calendario || '',
                    bibliografia_complementaria: response.data.bibliografia_complementaria || []
                }
            }

            return response.data
        } catch (err) {
            console.error('Error cargando programa:', err)
            error.value = err.message || 'Error al cargar programa'
            // Si no existe, usar valores por defecto (ya inicializados)
        } finally {
            loading.value = false
        }
    }

    /**
     * Guardar programa de asignatura
     */
    async function guardarPrograma() {
        if (!asignaturaId.value) {
            throw new Error('No hay asignatura seleccionada')
        }

        if (!puedeEditar.value) {
            throw new Error('No tiene permisos para editar')
        }

        guardando.value = true
        error.value = null

        try {
            await programaAsignaturaService.saveProgramaCompleto(asignaturaId.value, programa.value)
            return true
        } catch (err) {
            console.error('Error guardando programa:', err)
            error.value = err.message || 'Error al guardar programa'
            throw err
        } finally {
            guardando.value = false
        }
    }

    /**
     * Agregar elemento de competencia
     */
    function agregarElementoCompetencia() {
        const numero = programa.value.elementos_competencia.length + 1
        programa.value.elementos_competencia.push({
            codigo: `E.C.${numero}`,
            descripcion: ''
        })
    }

    /**
     * Eliminar elemento de competencia
     */
    function eliminarElementoCompetencia(index) {
        programa.value.elementos_competencia.splice(index, 1)
        // Renumerar códigos
        programa.value.elementos_competencia.forEach((ec, idx) => {
            ec.codigo = `E.C.${idx + 1}`
        })
    }

    /**
     * Agregar bibliografía complementaria
     */
    function agregarBibliografiaComplementaria() {
        programa.value.bibliografia_complementaria.push({
            autor: '',
            titulo: '',
            editorial: '',
            anio: '',
            edicion: ''
        })
    }

    /**
     * Eliminar bibliografía complementaria
     */
    function eliminarBibliografiaComplementaria(index) {
        programa.value.bibliografia_complementaria.splice(index, 1)
    }

    /**
     * Limpiar estado
     */
    function limpiar() {
        asignaturaId.value = null
        programa.value = {
            justificacion: '',
            proposito_general: '',
            competencias: { global_especifica: '', competencia_asignatura: '' },
            elementos_competencia: [],
            metodologia_general: '',
            sistema_evaluacion: { diagnostica: '', formativa: '', sumativa: '' },
            organizacion_calendario: '',
            bibliografia_complementaria: []
        }
        error.value = null
    }

    return {
        // State
        asignaturaId,
        loading,
        guardando,
        error,
        programa,

        // Getters
        puedeEditar,
        esSoloLectura,
        horariosMateria,
        datosGenerales,

        // Actions
        cargarPrograma,
        guardarPrograma,
        agregarElementoCompetencia,
        eliminarElementoCompetencia,
        agregarBibliografiaComplementaria,
        eliminarBibliografiaComplementaria,
        limpiar
    }
})
