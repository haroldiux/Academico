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

  async function createAsignatura(data) {
    loading.value = true
    try {
      const response = await asignaturaService.createAsignatura(data)
      // Recargar lista u optimísticamente agregar
      asignaturas.value.push(response.data)
      return response.data
    } catch (err) {
      console.error('Error creating asignatura:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAsignatura(id, data) {
    loading.value = true
    try {
      const response = await asignaturaService.updateAsignatura(id, data)
      // Actualizar en lista local
      const index = asignaturas.value.findIndex(a => a.id === id)
      if (index !== -1) {
        asignaturas.value[index] = { ...asignaturas.value[index], ...response.data }
      }
      return response.data
    } catch (err) {
      console.error('Error updating asignatura:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAsignatura(id) {
    loading.value = true
    try {
        await asignaturaService.deleteAsignatura(id)
        asignaturas.value = asignaturas.value.filter(a => a.id !== id)
    } catch (err) {
        console.error('Error deleting asignatura:', err)
        throw err
    } finally {
        loading.value = false
    }
  }

  async function assignDocentes(id, docenteIds) {
    loading.value = true
    try {
        const response = await asignaturaService.assignDocentes(id, docenteIds)
        // Actualizar lista local si es necesario (ej: propiedad docentes)
        const index = asignaturas.value.findIndex(a => a.id === id)
        if (index !== -1) {
           // Asumimos que el backend retorna los datos actualizados de docentes o forzamos recarga
           asignaturas.value[index].docentes = response.data.docentes.map(d => d.nombre_completo)
        }
        return response.data
    } catch (err) {
        console.error('Error assigning docentes:', err)
        throw err
    } finally {
        loading.value = false
    }
  }

  function updateElementoCompetencia(asigId, unidadId, data) { console.log('updateElemento', asigId, unidadId, data) }
  function addBibliografia(asigId, data) { console.log('addBiblio', asigId, data) }
  function updateBibliografia(asigId, biblioId, data) { console.log('updateBiblio', asigId, biblioId, data) }
  function deleteBibliografia(asigId, biblioId) { console.log('deleteBiblio', asigId, biblioId) }
  function calcularProgresoTema() { return 0 } // Dummy

  // Getter para buscar asignatura por ID (usa asignaturaActual o busca en lista)
  async function getAsignaturaById(id) {
    // Primero revisar si ya la tenemos cargada
    if (asignaturaActual.value && asignaturaActual.value.id == id) {
      return asignaturaActual.value
    }
    // Buscar en lista local
    const found = asignaturas.value.find(a => a.id == id)
    if (found) {
      return found
    }
    // Si no está, cargarla desde API
    await setAsignaturaActual(id)
    return asignaturaActual.value
  }

  return {
    asignaturas,
    asignaturaActual,
    loading,
    error,
    totalAsignaturas,
    fetchAsignaturas,
    setAsignaturaActual,
    getAsignaturaById,
    createAsignatura,
    updateAsignatura,
    deleteAsignatura,
    assignDocentes,
    updateElementoCompetencia,
    addBibliografia,
    updateBibliografia,
    deleteBibliografia,
    calcularProgresoTema
  }
})
