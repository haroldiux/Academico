import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import asignaturaService from 'src/services/asignaturaService'

export const useAsignaturasStore = defineStore('asignaturas', () => {
  const asignaturas = ref([])
  const loading = ref(false)
  const error = ref(null)

  const asignaturaActual = ref(null)

  // Getters
  const totalAsignaturas = computed(() => asignaturas.value.length)

  // Actions
  async function fetchAsignaturas(sedeCode, careerCode, includeDetails = false, search = '') {
    // Permite cargar sin filtros (carga "todas" las locales)
    loading.value = true
    error.value = null
    try {
      // El backend espera branch_code y career_code
      const params = {}
      if (sedeCode) params.branch_code = sedeCode
      if (careerCode) params.career_code = careerCode
      if (includeDetails) params.include_details = 1
      if (search) params.search = search
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

  async function setAsignaturaActual(id) {
    loading.value = true
    error.value = null
    asignaturaActual.value = null
    try {
        const response = await asignaturaService.getAsignatura(id)
        asignaturaActual.value = response.data
    } catch (err) {
        console.error('Error getting asignatura:', err)
        error.value = err
    } finally {
        loading.value = false
    }
  }

  // Stubs to prevent crash (User can implement full logic later or I can do it in next steps)
  function updateAsignatura(id, data) { console.log('updateAsignatura', id, data) }
  function updateElementoCompetencia(asigId, unidadId, data) { console.log('updateElemento', asigId, unidadId, data) }
  function addBibliografia(asigId, data) { console.log('addBiblio', asigId, data) }
  function updateBibliografia(asigId, biblioId, data) { console.log('updateBiblio', asigId, biblioId, data) }
  function deleteBibliografia(asigId, biblioId) { console.log('deleteBiblio', asigId, biblioId) }
  function calcularProgresoTema() { return 0 } // Dummy

  return {
    asignaturas,
    asignaturaActual,
    loading,
    error,
    totalAsignaturas,
    fetchAsignaturas,
    setAsignaturaActual,
    updateAsignatura,
    updateElementoCompetencia,
    addBibliografia,
    updateBibliografia,
    deleteBibliografia,
    calcularProgresoTema
  }
})
