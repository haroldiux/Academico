import { defineStore } from 'pinia'
import { ref } from 'vue'
import bloqueService from 'src/services/bloqueService'

export const useBloquesStore = defineStore('bloques', () => {
  const bloques = ref([])
  const loading = ref(false)

  async function fetchBloques(params = {}) {
    loading.value = true
    try {
      const response = await bloqueService.getBloques(params)
      bloques.value = response.data
    } catch (err) {
      console.error('Error fetching bloques:', err)
    } finally {
      loading.value = false
    }
  }

  async function createBloque(data) {
    loading.value = true
    try {
      const response = await bloqueService.createBloque(data)
      bloques.value.push(response.data)
      return response.data
    } catch (err) {
      console.error('Error creating bloque:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateBloque(id, data) {
    loading.value = true
    try {
      const response = await bloqueService.updateBloque(id, data)
      const idx = bloques.value.findIndex((b) => b.id === id)
      if (idx !== -1) bloques.value[idx] = response.data
      return response.data
    } catch (err) {
      console.error('Error updating bloque:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteBloque(id) {
    loading.value = true
    try {
      await bloqueService.deleteBloque(id)
      bloques.value = bloques.value.filter((b) => b.id !== id)
    } catch (err) {
      console.error('Error deleting bloque:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function getBloquesBySede(sedeId) {
    return bloques.value.filter((b) => b.sede_id == sedeId)
  }

  return {
    bloques,
    loading,
    fetchBloques,
    createBloque,
    updateBloque,
    deleteBloque,
    getBloquesBySede,
  }
})
