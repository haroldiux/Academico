import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import horarioService from 'src/services/horarioService'

export const useHorariosStore = defineStore('horarios', () => {
  const horarios = ref([])
  const loading = ref(false)
  const error = ref(null)

  const totalHorarios = computed(() => horarios.value.length)

  async function fetchHorarios(params = {}) {
    loading.value = true
    try {
      const response = await horarioService.getHorarios(params)
      horarios.value = response.data
    } catch (err) {
      console.error('Error fetching horarios:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  async function createHorario(data) {
    loading.value = true
    try {
      const response = await horarioService.createHorario(data)
      // Agregar el nuevo horario a la lista
      horarios.value.push(response.data)
      return response.data
    } catch (err) {
      console.error('Error creating horario:', err)
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateHorario(id, data) {
    loading.value = true
    try {
      const response = await horarioService.updateHorario(id, data)
      // Actualizar el horario en la lista
      const index = horarios.value.findIndex((h) => h.id === id)
      if (index !== -1) {
        horarios.value[index] = response.data
      }
      return response.data
    } catch (err) {
      console.error('Error updating horario:', err)
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteHorario(id) {
    loading.value = true
    try {
      await horarioService.deleteHorario(id)
      // Eliminar el horario de la lista
      horarios.value = horarios.value.filter((h) => h.id !== id)
    } catch (err) {
      console.error('Error deleting horario:', err)
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  function getHorarioById(id) {
    return horarios.value.find((h) => h.id === id)
  }

  function getHorariosByGrupo(grupoId) {
    if (!grupoId) return horarios.value
    return horarios.value.filter((h) => h.grupo_id == grupoId)
  }

  return {
    horarios,
    totalHorarios,
    loading,
    error,
    fetchHorarios,
    createHorario,
    updateHorario,
    deleteHorario,
    getHorarioById,
    getHorariosByGrupo,
  }
})
