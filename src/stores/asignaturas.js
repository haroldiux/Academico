import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import asignaturaService from 'src/services/asignaturaService'

export const useAsignaturasStore = defineStore('asignaturas', () => {
  const asignaturas = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalAsignaturas = computed(() => asignaturas.value.length)

  // Actions
  async function fetchAsignaturas(sedeCode, careerCode) {
    // Permite cargar sin filtros (carga "todas" las locales)
    loading.value = true
    error.value = null
    try {
      // El backend espera branch_code y career_code
      const params = {}
      if (sedeCode) params.branch_code = sedeCode
      if (careerCode) params.career_code = careerCode
      const response = await asignaturaService.getAsignaturas(params)
      asignaturas.value = response.data
    } catch (err) {
      console.error('Error fetching asignaturas:', err)
      error.value = err
      asignaturas.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    asignaturas,
    loading,
    error,
    totalAsignaturas,
    fetchAsignaturas
  }
})
