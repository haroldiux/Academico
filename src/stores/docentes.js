import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'

export const useDocentesStore = defineStore('docentes', () => {
  const docentes = ref([])
  const loading = ref(false)

  async function fetchDocentes() {
    loading.value = true
    try {
      const response = await api.get('/docentes')
      docentes.value = response.data
    } catch (error) {
      console.error('Error fetching docentes:', error)
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
