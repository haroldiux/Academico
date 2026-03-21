import { defineStore } from 'pinia'
import { ref } from 'vue'
import aulaService from 'src/services/aulaService'

export const useAulasStore = defineStore('aulas', () => {
  const aulas   = ref([])
  const loading = ref(false)

  async function fetchAulas(params = {}) {
    loading.value = true
    try {
      const response = await aulaService.getAulas(params)
      aulas.value = response.data
    } catch (err) {
      console.error('Error fetching aulas:', err)
    } finally {
      loading.value = false
    }
  }

  async function createAula(data) {
    loading.value = true
    try {
      const response = await aulaService.createAula(data)
      aulas.value.push(response.data)
      return response.data
    } catch (err) {
      console.error('Error creating aula:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAula(id, data) {
    loading.value = true
    try {
      const response = await aulaService.updateAula(id, data)
      const idx = aulas.value.findIndex(a => a.id === id)
      if (idx !== -1) aulas.value[idx] = response.data
      return response.data
    } catch (err) {
      console.error('Error updating aula:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAula(id) {
    loading.value = true
    try {
      await aulaService.deleteAula(id)
      aulas.value = aulas.value.filter(a => a.id !== id)
    } catch (err) {
      console.error('Error deleting aula:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function getAulaById(id) {
    return aulas.value.find(a => a.id === id)
  }

  return { aulas, loading, fetchAulas, createAula, updateAula, deleteAula, getAulaById }
})
