import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import userService from 'src/services/userService'

export const useUsuariosStore = defineStore('usuarios', () => {
  // State
  const usuarios = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const usuariosActivos = computed(() => usuarios.value.filter(u => u.estado === 'activo'))
  const usuariosInactivos = computed(() => usuarios.value.filter(u => u.estado !== 'activo'))
  const totalUsuarios = computed(() => usuarios.value.length)

  // Note: usuariosPorRol calculation might needs to wait for data, or be done in backend
  const usuariosPorRol = computed(() => {
    const grupos = {}
    usuarios.value.forEach(u => {
      const rolName = u.rol ? u.rol.nombre : 'Sin Rol'
      if (!grupos[rolName]) {
        grupos[rolName] = []
      }
      grupos[rolName].push(u)
    })
    return grupos
  })

  // Actions
  async function fetchUsuarios(search = '') {
    loading.value = true
    try {
      const response = await userService.getUsuarios(search)
      // Map response to match expected format if needed, OR user backend format directly
      // Backend returns User models with 'rol' relation
      usuarios.value = response.data.map(u => ({
        ...u,
        rolNombre: u.rol ? u.rol.nombre : '',
        rolId: u.rol_id,
        // Adapt status boolean to logic if needed (frontend uses 'activo'/'inactivo' strings in mock?)
        estado: u.estado ? 'activo' : 'inactivo'
      }))
    } catch (err) {
      console.error(err)
      error.value = 'Error al cargar usuarios'
    } finally {
      loading.value = false
    }
  }

  function getUsuarioById(id) {
    return usuarios.value.find(u => u.id === id)
  }

  async function addUsuario(usuario) {
    loading.value = true
    try {
      // Adapt frontend data to backend payload
      // Frontend sends { nombre, apellido, ... } but User model needs { username, email, password, rol_id }
      // This is a discrepancy! Frontend form creates academic profiles?
      // For now, we assume basic User creation.
      const payload = {
        ...usuario,
        rol_id: usuario.rolId,
        estado: usuario.estado === 'activo'
      }
      const response = await userService.createUsuario(payload)
      usuarios.value.push(response.data)
      return response.data.id
    } finally {
      loading.value = false
    }
  }

  async function updateUsuario(id, datosActualizados) {
    try {
       const payload = { ...datosActualizados }
       if (payload.rolId) payload.rol_id = payload.rolId;
       if (payload.estado) payload.estado = payload.estado === 'activo';

       await userService.updateUsuario(id, payload)
       // Refresh local
       fetchUsuarios()
       return true
    } catch (err) {
       console.error(err)
       return false
    }
  }

  async function deleteUsuario(id) {
    try {
      await userService.deleteUsuario(id)
      fetchUsuarios()
      return true
    } catch(err) {
      console.error(err)
      return false
    }
  }

  async function toggleUsuarioEstado(id) {
    const usuario = usuarios.value.find(u => u.id === id)
    if (usuario) {
       const nuevoEstado = usuario.estado !== 'activo' // bool
       // ... optimistic update and API call
       await userService.updateUsuario(id, { estado: nuevoEstado })
       fetchUsuarios()
       return true
    }
    return false
  }

  function buscarUsuarios(termino) {
    return fetchUsuarios(termino)
  }

  return {
    // State
    usuarios,
    loading,
    error,
    // Getters
    usuariosActivos,
    usuariosInactivos,
    totalUsuarios,
    usuariosPorRol,
    // Actions
    fetchUsuarios, // NEW action to call initially
    getUsuarioById,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    toggleUsuarioEstado,
    buscarUsuarios
  }
})
