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
  async function fetchAsignaturas(sedeId = null, carreraId = null, semestre = null, search = '') {
    loading.value = true
    error.value = null
    try {
      // Nuevos parámetros: sede_id, carrera_id, semestre
      const params = {}
      if (sedeId) params.sede_id = sedeId
      if (carreraId) params.carrera_id = carreraId
      if (semestre) params.semestre = semestre
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

  async function importarWord(id, file) {
    loading.value = true
    try {
      const response = await asignaturaService.importWord(id, file)
      // Actualizar asignatura actual con los nuevos datos
      // Podríamos hacer un merge manual, pero lo más seguro es recargar o usar la data retornada si es completa.
      // El backend retorna { message: '...', data: { justificacion, ... } }
      // Combinamos con lo actual
      if (asignaturaActual.value && asignaturaActual.value.id === id) {
          // Actualización parcial reactiva
          Object.assign(asignaturaActual.value, response.data.data)
          // Recargar bibliografias si vinieron nuevas (el backend las guardó en BD, pero aquí no las tenemos en response.data.data como objetos completos con ID)
          // Mejor recargar la asignatura completa para traer bibliografías con IDs generados.
          await setAsignaturaActual(id)
      }
      return response.data
    } catch (err) {
      console.error('Error importing word:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function updateElementoCompetencia(asigId, unidadId, data) { console.log('updateElemento', asigId, unidadId, data) }
  async function addBibliografia(asigId, data) {
    loading.value = true
    try {
      const payload = { ...data, asignatura_id: asigId }
      const response = await asignaturaService.addBibliografia(payload)
      if (asignaturaActual.value && asignaturaActual.value.id === asigId) {
        if (!asignaturaActual.value.bibliografias) asignaturaActual.value.bibliografias = []
        asignaturaActual.value.bibliografias.push(response.data)
      }
      return response.data
    } catch (err) {
      console.error('Error adding biblio:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateBibliografia(asigId, biblioId, data) {
    loading.value = true
    try {
      const response = await asignaturaService.updateBibliografia(biblioId, data)
      if (asignaturaActual.value && asignaturaActual.value.id === asigId) {
        const index = asignaturaActual.value.bibliografias.findIndex(b => b.id === biblioId)
        if (index !== -1) {
          asignaturaActual.value.bibliografias[index] = response.data
        }
      }
      return response.data
    } catch (err) {
      console.error('Error updating biblio:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteBibliografia(asigId, biblioId) {
    loading.value = true
    try {
      await asignaturaService.deleteBibliografia(biblioId)
      if (asignaturaActual.value && asignaturaActual.value.id === asigId) {
        asignaturaActual.value.bibliografias = asignaturaActual.value.bibliografias.filter(b => b.id !== biblioId)
      }
    } catch (err) {
      console.error('Error deleting biblio:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
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
    calcularProgresoTema,
    importarWord
  }
})
