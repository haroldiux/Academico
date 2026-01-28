import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'

export const useReportesStore = defineStore('reportes', () => {
    // State
    const reporteMaterias = ref([])
    const metricas = ref({
        totalDocentes: 0,
        promedioAsistencia: 0,
        cumplimientoTemas: 0,
        documentacionPendiente: 0
    })
    const loading = ref(false)

    // Actions
    async function fetchReportes(params = {}) {
        loading.value = true
        try {
            const response = await api.get('/reportes/director', { params })

            if (response.data) {
                reporteMaterias.value = response.data.reporteMaterias || []
                metricas.value = response.data.metricas || {
                    totalDocentes: 0,
                    promedioAsistencia: 0,
                    cumplimientoTemas: 0,
                    documentacionPendiente: 0
                }
            }
            return response.data
        } catch (error) {
            console.error('Error fetching reportes:', error)
            return null
        } finally {
            loading.value = false
        }
    }

    async function fetchSeguimientoSemanal(params = {}) {
        loading.value = true
        try {
            const response = await api.get('/seguimiento-semanal', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching seguimiento semanal:', error)
            return []
        } finally {
            loading.value = false
        }
    }

    async function createSeguimientoSemanal(data) {
        loading.value = true
        try {
            const response = await api.post('/seguimiento-semanal', data)
            return response.data
        } catch (error) {
            console.error('Error creating seguimiento semanal:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    async function updateSeguimientoSemanal(id, data) {
        loading.value = true
        try {
            const response = await api.put(`/seguimiento-semanal/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating seguimiento semanal:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    return {
        // State
        reporteMaterias,
        metricas,
        loading,

        // Actions
        fetchReportes,
        fetchSeguimientoSemanal,
        createSeguimientoSemanal,
        updateSeguimientoSemanal
    }
})
