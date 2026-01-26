import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import carreraService from 'src/services/carreraService'

export const useCarrerasStore = defineStore('carreras', () => {
  const carreras = ref([])
  const loading = ref(false)
  const error = ref(null)

  const carrerasActivas = computed(() => carreras.value.filter(c => c.activo))
  const totalCarreras = computed(() => carreras.value.length)

  async function fetchCarreras(params = {}) {
    loading.value = true
    try {
      const response = await carreraService.getCarreras(params)
      carreras.value = response.data
    } catch (err) {
      console.error('Error fetching carreras:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  function getCarreraById(id) {
    return carreras.value.find(c => c.id === id)
  }

  function getCarrerasBySede(sedeId) {
    if (!sedeId) return carreras.value // Retornar todo si no hay sede
    // Usar == para comparar string/number indistintamente
    return carreras.value.filter(c => {
      const match = (c.sede_id == sedeId) || (c.sedes_ids && c.sedes_ids.includes(Number(sedeId)))
      return match && c.activo
    })
  }

  function getCarrerasByNombre(nombre) {
    return carreras.value.filter(c =>
      c.nombre.toLowerCase().includes(nombre.toLowerCase()) && c.activo
    )
  }

  return {
    carreras,
    carrerasActivas,
    totalCarreras,
    loading,
    error,
    fetchCarreras,
    getCarreraById,
    getCarrerasBySede,
    getCarrerasByNombre,
    // Nuevas funciones para API externa
    getCarrerasOptions: (sedeId = null) => {
      const lista = sedeId
        ? carreras.value.filter(c => {
            const match = (c.sede_id == sedeId) || (c.sedes_ids && c.sedes_ids.includes(Number(sedeId)))
            return match && c.activo
          })
        : carreras.value.filter(c => c.activo)

      return lista.map(c => ({
        label: c.nombre,
        value: c.id,
        codigo: c.codigo // Código para la API externa
      }))
    },
    getCarreraCodigo: (carreraId) => {
      const carrera = carreras.value.find(c => c.id === carreraId)
      return carrera?.codigo?.toLowerCase() || null
    }
  }
})
