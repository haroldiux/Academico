import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import grupoService from 'src/services/grupoService'
import gruposExternoService from 'src/services/gruposExternoService'

export const useGruposStore = defineStore('grupos', () => {
  const materias = ref([]) // List of subjects with nested groups
  const materiasExterno = ref([]) // Datos de la API externa
  const loading = ref(false)
  const error = ref(null)

  // Pagination meta (para API interna)
  const total = ref(0)
  const currentPage = ref(1)
  const lastPage = ref(1)

  // Meta de API externa
  const metaExterno = ref({
    gestion: '',
    carrera: '',
    sede: 0,
    total_materias: 0,
    total_grupos: 0,
    total_docentes: 0
  })

  // Computed: Estadísticas de materias externas
  const statsExterno = computed(() => ({
    totalMaterias: materiasExterno.value.length,
    totalGrupos: materiasExterno.value.reduce((sum, m) => sum + (m.grupos?.length || 0), 0),
    totalDocentes: metaExterno.value.total_docentes || 0
  }))

  // Actions - API Interna (Legacy)
  async function fetchGrupos(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await grupoService.getGrupos(params)
      materias.value = response.data.data

      if (response.data.meta) {
          total.value = response.data.meta.total
          currentPage.value = response.data.meta.current_page
          lastPage.value = response.data.meta.last_page
      }

      return response.data
    } catch (err) {
      console.error('Error fetching grupos:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // Actions - API Externa
  async function fetchGruposExterno(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await gruposExternoService.listarGrupos(params)
      materiasExterno.value = response.data.data || []

      if (response.data.meta) {
        metaExterno.value = response.data.meta
      }

      return response.data
    } catch (err) {
      console.error('Error fetching grupos externos:', err)
      error.value = err
      return { data: [], meta: {} }
    } finally {
      loading.value = false
    }
  }

  // Refrescar cache de API externa
  async function refrescarGruposExterno(params = {}) {
    loading.value = true
    try {
      const response = await gruposExternoService.refrescarGrupos(params)
      materiasExterno.value = response.data.data || []
      return response.data
    } catch (err) {
      console.error('Error refreshing grupos:', err)
      error.value = err
      return null
    } finally {
      loading.value = false
    }
  }

  async function createGrupo(data) {
    loading.value = true
    try {
      await grupoService.createGrupo(data)
      await fetchGrupos({ page: currentPage.value })
      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    materias,
    materiasExterno,
    loading,
    error,
    total,
    currentPage,
    lastPage,
    metaExterno,
    // Computed
    statsExterno,
    // Actions
    fetchGrupos,
    fetchGruposExterno,
    refrescarGruposExterno,
    createGrupo
  }
})
