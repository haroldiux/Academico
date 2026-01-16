import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import rolExamenesService from 'src/services/rolExamenesService'

/**
 * Store para gestionar el Rol de Exámenes
 */
export const useRolExamenesStore = defineStore('rolExamenes', () => {
    const authStore = useAuthStore()

    // ==========================================
    // STATE
    // ==========================================

    const examenes = ref([])
    const loading = ref(false)
    const uploading = ref(false)
    const error = ref(null)

    // Filtros activos
    const filtros = ref({
        gestion: '2026-I',
        carrera_id: null,
        materia_id: null
    })

    // ==========================================
    // GETTERS
    // ==========================================

    const puedeEditar = computed(() => {
        const rol = authStore.rol
        return ['DIRECTOR_CARRERA', 'ADMIN', 'SUPER_ADMIN'].includes(rol)
    })

    const examenesPorMateria = computed(() => {
        const map = new Map()
        examenes.value.forEach(ex => {
            const key = ex.materia_codigo || ex.materia_id
            if (!map.has(key)) {
                map.set(key, [])
            }
            map.get(key).push(ex)
        })
        return map
    })

    const examenesPorSemana = computed(() => {
        const map = new Map()
        examenes.value.forEach(ex => {
            if (!map.has(ex.semana)) {
                map.set(ex.semana, [])
            }
            map.get(ex.semana).push(ex)
        })
        return map
    })

    // ==========================================
    // ACTIONS
    // ==========================================

    /**
     * Cargar rol de exámenes
     */
    async function cargarExamenes(params = {}) {
        loading.value = true
        error.value = null

        try {
            const response = await rolExamenesService.getRolExamenes({
                ...filtros.value,
                ...params
            })
            examenes.value = response.data.data || response.data || []
            return examenes.value
        } catch (err) {
            console.error('Error cargando exámenes:', err)
            error.value = err.message || 'Error al cargar exámenes'
            return []
        } finally {
            loading.value = false
        }
    }

    /**
     * Subir Excel con rol de exámenes
     */
    async function uploadExcel(file, gestion, carreraId) {
        uploading.value = true
        error.value = null

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await rolExamenesService.uploadExcel(formData, {
                gestion,
                carrera_id: carreraId
            })

            // Recargar exámenes después de subir
            await cargarExamenes({ gestion, carrera_id: carreraId })

            return response.data
        } catch (err) {
            console.error('Error subiendo Excel:', err)
            error.value = err.response?.data?.message || err.message || 'Error al subir archivo'
            throw err
        } finally {
            uploading.value = false
        }
    }

    /**
     * Obtener exámenes para una materia específica
     */
    async function getExamenesMateria(materiaId, gestion) {
        try {
            const response = await rolExamenesService.getExamenesByMateria(materiaId, gestion)
            return response.data.data || response.data || []
        } catch (err) {
            console.error('Error obteniendo exámenes de materia:', err)
            return []
        }
    }

    /**
     * Actualizar examen
     */
    async function actualizarExamen(id, data) {
        loading.value = true
        try {
            await rolExamenesService.updateExamen(id, data)
            // Actualizar en lista local
            const idx = examenes.value.findIndex(e => e.id === id)
            if (idx !== -1) {
                examenes.value[idx] = { ...examenes.value[idx], ...data }
            }
            return true
        } catch (err) {
            console.error('Error actualizando examen:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Eliminar examen
     */
    async function eliminarExamen(id) {
        loading.value = true
        try {
            await rolExamenesService.deleteExamen(id)
            examenes.value = examenes.value.filter(e => e.id !== id)
            return true
        } catch (err) {
            console.error('Error eliminando examen:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Crear examen manualmente
     */
    async function crearExamen(data) {
        loading.value = true
        try {
            const response = await rolExamenesService.createExamen(data)
            examenes.value.push(response.data)
            return response.data
        } catch (err) {
            console.error('Error creando examen:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Limpiar estado
     */
    function limpiar() {
        examenes.value = []
        error.value = null
    }

    return {
        // State
        examenes,
        loading,
        uploading,
        error,
        filtros,

        // Getters
        puedeEditar,
        examenesPorMateria,
        examenesPorSemana,

        // Actions
        cargarExamenes,
        uploadExcel,
        getExamenesMateria,
        actualizarExamen,
        eliminarExamen,
        crearExamen,
        limpiar
    }
})
