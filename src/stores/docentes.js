import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'

export const useDocentesStore = defineStore('docentes', () => {
  const docentes = ref([])
  const loading = ref(false)

  async function fetchDocentes(params = {}) {
    loading.value = true
    try {
      // Params: { q, sede_id, estado, page }
      const response = await api.get('/docentes', { params })

      // Determine if response is array (legacy) or object { data, stats }
      if (Array.isArray(response.data)) {
          docentes.value = response.data
          return { data: response.data, stats: null }
      } else {
          docentes.value = response.data.data
          return response.data // Returns { data, stats }
      }
    } catch (error) {
      console.error('Error fetching docentes:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    docentes,
    loading,
    fetchDocentes
  }
})
