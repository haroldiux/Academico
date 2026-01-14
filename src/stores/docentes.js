import { defineStore } from 'pinia'
import { ref } from 'vue'
import docenteService from 'src/services/docenteService'

export const useDocentesStore = defineStore('docentes', () => {
  const docentes = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Pagination metadata checks
  const total = ref(0)
  const lastPage = ref(1)
  const currentPage = ref(1)

  // Actions
  async function fetchDocentes(params = {}) {
    loading.value = true
    error.value = null
    try {
      // Default to larger page size for grid view if not specified
      if (!params.per_page) params.per_page = 50

      const response = await docenteService.getDocentes(params)
      // Laravel paginate response: { data: [...], current_page, last_page, total }
      docentes.value = response.data.data
      total.value = response.data.total
      lastPage.value = response.data.last_page
      currentPage.value = response.data.current_page

      return response.data // Return full response including 'stats'
    } catch (err) {
      console.error('Error fetching docentes:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  async function createDocente(data) {
    loading.value = true
    try {
      await docenteService.createDocente(data)
      await fetchDocentes() // Reload
      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateDocente(id, data) {
    loading.value = true
    try {
      await docenteService.updateDocente(id, data)
      await fetchDocentes() // Reload
      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    docentes,
    loading,
    error,
    total,
    currentPage,
    lastPage,
    fetchDocentes,
    createDocente,
    updateDocente
  }
})
