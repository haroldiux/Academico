import { defineStore } from 'pinia'
import { ref } from 'vue'
import grupoService from 'src/services/grupoService'

export const useGruposStore = defineStore('grupos', () => {
  const materias = ref([]) // List of subjects with nested groups
  const loading = ref(false)
  const error = ref(null)

  // Pagination meta
  const total = ref(0)
  const currentPage = ref(1)
  const lastPage = ref(1)

  // Actions
  async function fetchGrupos(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await grupoService.getGrupos(params)
      // Response structure from controller: { data: [...], meta: { current_page, ... } }
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

  async function createGrupo(data) {
    loading.value = true
    try {
      await grupoService.createGrupo(data)
      await fetchGrupos({ page: currentPage.value }) // Refresh current page or ideal page
      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    materias,
    loading,
    error,
    total,
    currentPage,
    lastPage,
    fetchGrupos,
    createGrupo
  }
})
