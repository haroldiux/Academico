import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import rolService from 'src/services/rolService'

export const useRolesStore = defineStore('roles', () => {
  // State
  const roles = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const rolesActivos = computed(() => roles.value.filter(r => r.activo))
  const totalRoles = computed(() => roles.value.length)
  const rolesOrdenados = computed(() => [...roles.value].sort((a, b) => a.orden - b.orden))

  // Actions
  async function fetchRoles() {
    loading.value = true
    error.value = null
    try {
      const response = await rolService.getRoles()
      roles.value = response.data
    } catch (err) {
      console.error('Error fetching roles:', err)
      error.value = 'Error al cargar roles'
    } finally {
      loading.value = false
    }
  }

  function getRolById(id) {
    return roles.value.find(r => r.id === id)
  }

  async function addRol(rol) {
    loading.value = true
    try {
      const response = await rolService.createRol(rol)
      roles.value.push(response.data)
      return response.data.id
    } catch (err) {
      console.error('Error creating rol:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateRol(id, datosActualizados) {
    loading.value = true
    try {
      const response = await rolService.updateRol(id, datosActualizados)
      const index = roles.value.findIndex(r => r.id === id)
      if (index !== -1) {
        roles.value[index] = response.data
      }
      return true
    } catch (err) {
      console.error('Error updating rol:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteRol(id) {
    loading.value = true
    try {
      await rolService.deleteRol(id)
      const index = roles.value.findIndex(r => r.id === id)
      if (index !== -1) {
        roles.value.splice(index, 1)
      }
      return true
    } catch (err) {
      console.error('Error deleting rol:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function toggleRolActivo(id) {
    const rol = roles.value.find(r => r.id === id)
    if (rol) {
      const nuevoEstado = !rol.activo
      // Optimistic update
      rol.activo = nuevoEstado
      try {
        await rolService.updateRol(id, { activo: nuevoEstado })
        return true
      } catch (err) {
        console.error('Error toggling rol:', err)
        rol.activo = !nuevoEstado // Revert
        return false
      }
    }
    return false
  }

  return {
    // State
    roles,
    loading,
    error,
    // Getters
    rolesActivos,
    totalRoles,
    rolesOrdenados,
    // Actions
    fetchRoles,
    getRolById,
    addRol,
    updateRol,
    deleteRol,
    toggleRolActivo
  }
})
