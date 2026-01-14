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

  // Actions
  async function fetchSedes() {
    loading.value = true
    try {
      const response = await sedeService.getSedes()
      sedes.value = response.data
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

  return {
    sedes,
    campus, // Se mantiene vacío o mock
    sedesActivas,
    totalSedes,
    loading,
    fetchSedes,
    getSedeById,
    getSedeByNombre
  }
})
