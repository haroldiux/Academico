import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import sedeService from 'src/services/sedeService'

export const useSedesStore = defineStore('sedes', () => {
  const sedes = ref([])
  const loading = ref(false)

  // Campus por sede (Mock local por ahora, ya que la API no entrega esto aún)
  const campus = ref([])

  const sedesActivas = computed(() => sedes.value.filter(s => s.activo))
  const totalSedes = computed(() => sedes.value.length)

  const stats = ref({
    total_sedes: 0,
    sedes_activas: 0,
    total_carreras: 0,
    total_docentes: 0
  })

  // Actions
  async function fetchSedes() {
    loading.value = true
    try {
      const response = await sedeService.getSedes()
      // Handle both legacy (array) and new (object) response formats
      if (Array.isArray(response.data)) {
        sedes.value = response.data
      } else if (response.data && response.data.data) {
         sedes.value = response.data.data
         if (response.data.stats) {
             stats.value = response.data.stats
         }
      }
    } catch (error) {
      console.error('Error fetching sedes:', error)
    } finally {
      loading.value = false
    }
  }

  function getSedeById(id) {
    return sedes.value.find(s => s.id === id)
  }

  function getSedeByNombre(nombre) {
    return sedes.value.find(s => s.nombre.toLowerCase() === nombre.toLowerCase())
  }

  // Mock function until backend provides Campus
  function getCampusBySede(sedeId) {
      if (!sedeId) return []
      // Fake campus generation
      const sede = sedes.value.find(s => s.id === sedeId)
      if (!sede) return []

      return [
          { id: sedeId * 10 + 1, nombre: 'Campus Principal ' + sede.nombre },
          { id: sedeId * 10 + 2, nombre: 'Campus Secundario ' + sede.nombre }
      ]
  }

  function getCampusById(campusId) {
      // Decode mock ID
      const sedeId = Math.floor(campusId / 10)
      const sede = sedes.value.find(s => s.id === sedeId)
      return { id: campusId, nombre: (campusId % 10 === 1 ? 'Campus Principal ' : 'Campus Secundario ') + (sede ? sede.nombre : '') }
  }

  return {
    sedes,
    stats,
    campus, // Se mantiene vacío o mock
    sedesActivas,
    totalSedes,
    loading,
    fetchSedes,
    getSedeById,
    getSedeByNombre,
    getCampusBySede,
    getCampusById,
    // Nuevas funciones para API externa
    getSedeApiId: (sedeId) => {
      const sede = sedes.value.find(s => s.id === sedeId)
      return sede?.id_api || sedeId
    },
    getSedesOptions: () => sedes.value.map(s => ({
      label: s.nombre,
      value: s.id,
      id_api: s.id_api
    }))
  }
})
