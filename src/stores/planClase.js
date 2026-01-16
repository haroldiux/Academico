import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import planClaseService from 'src/services/planClaseService'

/**
 * Store para gestionar Plan de Clase
 * Maneja la separación entre datos de MATERIA (compartidos) y DOCENTE (personalizados)
 */
export const usePlanClaseStore = defineStore('planClase', () => {
    const authStore = useAuthStore()

    // ==========================================
    // STATE
    // ==========================================

    // Datos a nivel materia (compartidos entre docentes)
    const datosMateria = ref({
        resultado_aprendizaje: '',
        logros_esperados: [],
        contenidos: {
            conceptual: [],
            procedimental: [],
            actitudinal: []
        },
        referencias_bibliograficas: []
    })

    // Datos a nivel docente (personalizados)
    const datosDocente = ref({
        estrategias: {
            metodologicas: '',
            aprendizaje: '',
            recursos: []
        },
        evaluacion: {
            formativa: { actividades: [], instrumentos: [], evidencias: [] },
            sumativa: { actividades: [], instrumentos: [], evidencias: [] }
        },
        secuencia_didactica: []
    })

    // Estado de carga y errores
    const loading = ref(false)
    const error = ref(null)
    const guardando = ref(false)

    // IDs actuales
    const materiaId = ref(null)
    const temaId = ref(null)

    // ==========================================
    // GETTERS - PERMISOS
    // ==========================================

    // Roles que pueden editar
    const ROLES_EDICION = ['DOCENTE', 'DIRECTOR_CARRERA', 'ADMIN', 'SUPER_ADMIN']
    const ROLES_SOLO_LECTURA = ['DIRECCION_ACADEMICA', 'VICERRECTOR_SEDE', 'VICERRECTOR_NACIONAL']

    /**
     * Verifica si el usuario actual puede editar campos de MATERIA
     * DOCENTE, DIRECTOR_CARRERA y ADMIN pueden editar
     */
    const puedeEditarMateria = computed(() => {
        const userRol = authStore.rol
        return ROLES_EDICION.includes(userRol)
    })

    /**
     * Verifica si el usuario actual puede editar campos de DOCENTE
     * Solo si es DOCENTE de esta materia, DIRECTOR_CARRERA o ADMIN
     */
    const puedeEditarDocente = computed(() => {
        const userRol = authStore.rol
        return ROLES_EDICION.includes(userRol)
    })

    /**
     * Verifica si el usuario tiene acceso de solo lectura
     */
    const esSoloLectura = computed(() => {
        const userRol = authStore.rol
        return ROLES_SOLO_LECTURA.includes(userRol)
    })

    /**
     * Rol del usuario actual
     */
    const rolUsuario = computed(() => authStore.rol)

    /**
     * ID del docente actual (para filtrar sus datos)
     */
    const docenteActualId = computed(() => authStore.usuarioActual?.docente_id || authStore.usuarioActual?.id || null)

    // ==========================================
    // ACTIONS
    // ==========================================

    /**
     * Cargar plan de clase completo
     */
    async function cargarPlanClase(matId, temId) {
        loading.value = true
        error.value = null
        materiaId.value = matId
        temaId.value = temId

        try {
            const resultado = await planClaseService.getPlanClaseCompleto(matId, temId, docenteActualId.value)

            // Cargar datos de materia
            if (resultado.materia) {
                datosMateria.value = {
                    resultado_aprendizaje: resultado.materia.resultado_aprendizaje || '',
                    logros_esperados: resultado.materia.logros_esperados || [],
                    contenidos: resultado.materia.contenidos || { conceptual: [], procedimental: [], actitudinal: [] },
                    referencias_bibliograficas: resultado.materia.referencias_bibliograficas || []
                }
            }

            // Cargar datos de docente
            if (resultado.docente) {
                datosDocente.value = {
                    estrategias: resultado.docente.estrategias || { metodologicas: '', aprendizaje: '', recursos: [] },
                    evaluacion: resultado.docente.evaluacion || {
                        formativa: { actividades: [], instrumentos: [], evidencias: [] },
                        sumativa: { actividades: [], instrumentos: [], evidencias: [] }
                    },
                    secuencia_didactica: resultado.docente.secuencia_didactica || []
                }
            }

            return resultado
        } catch (err) {
            console.error('Error cargando plan de clase:', err)
            error.value = err.message || 'Error al cargar plan de clase'
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Guardar plan de clase (materia y/o docente según permisos)
     */
    async function guardarPlanClase() {
        if (!materiaId.value || !temaId.value) {
            throw new Error('No hay materia/tema seleccionado')
        }

        guardando.value = true
        error.value = null

        try {
            await planClaseService.savePlanClaseCompleto(
                materiaId.value,
                temaId.value,
                puedeEditarMateria.value ? datosMateria.value : null,
                puedeEditarDocente.value ? datosDocente.value : null,
                puedeEditarMateria.value
            )

            return true
        } catch (err) {
            console.error('Error guardando plan de clase:', err)
            error.value = err.message || 'Error al guardar plan de clase'
            throw err
        } finally {
            guardando.value = false
        }
    }

    /**
     * Limpiar estado
     */
    function limpiar() {
        datosMateria.value = {
            resultado_aprendizaje: '',
            logros_esperados: [],
            contenidos: { conceptual: [], procedimental: [], actitudinal: [] },
            referencias_bibliograficas: []
        }
        datosDocente.value = {
            estrategias: { metodologicas: '', aprendizaje: '', recursos: [] },
            evaluacion: {
                formativa: { actividades: [], instrumentos: [], evidencias: [] },
                sumativa: { actividades: [], instrumentos: [], evidencias: [] }
            },
            secuencia_didactica: []
        }
        materiaId.value = null
        temaId.value = null
        error.value = null
    }

    // ==========================================
    // HELPERS para UI
    // ==========================================

    /**
     * Obtener etiqueta de sección según tipo
     */
    function getSeccionLabel(tipo) {
        return tipo === 'materia' ? '📚 Campo Compartido (Materia)' : '👤 Campo Personal (Docente)'
    }

    /**
     * Obtener color de sección según tipo
     */
    function getSeccionColor(tipo) {
        return tipo === 'materia' ? 'purple' : 'teal'
    }

    /**
     * Verificar si una sección es editable
     */
    function esEditable(tipo) {
        if (esSoloLectura.value) return false
        return tipo === 'materia' ? puedeEditarMateria.value : puedeEditarDocente.value
    }

    return {
        // State
        datosMateria,
        datosDocente,
        loading,
        error,
        guardando,
        materiaId,
        temaId,

        // Getters
        puedeEditarMateria,
        puedeEditarDocente,
        esSoloLectura,
        rolUsuario,
        docenteActualId,

        // Actions
        cargarPlanClase,
        guardarPlanClase,
        limpiar,

        // Helpers UI
        getSeccionLabel,
        getSeccionColor,
        esEditable
    }
})
