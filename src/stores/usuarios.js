import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import userService from 'src/services/userService'

export const useUsuariosStore = defineStore('usuarios', () => {
  // State
  const usuarios = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const usuariosActivos = computed(() => usuarios.value.filter((u) => u.estado === 'activo'))
  const usuariosInactivos = computed(() => usuarios.value.filter((u) => u.estado !== 'activo'))
  const totalUsuarios = computed(() => usuarios.value.length)

  // Note: usuariosPorRol calculation might needs to wait for data, or be done in backend
  const usuariosPorRol = computed(() => {
    const grupos = {}
    usuarios.value.forEach((u) => {
      const rolName = u.rol ? u.rol.nombre : 'Sin Rol'
      if (!grupos[rolName]) {
        grupos[rolName] = []
      }
      grupos[rolName].push(u)
    })
    return grupos
  })

  // Helper para mapear usuario del backend a formato frontend
  function normalizarSedesUsuario(u) {
    const sedes = Array.isArray(u.sedes_asignadas)
      ? u.sedes_asignadas
          .map((sede) => ({
            id: Number(sede.id),
            nombre: sede.nombre,
          }))
          .filter((sede) => sede.id)
      : []

    if (sedes.length === 0 && (u.sede_id || u.sede_nombre || u.sede?.nombre)) {
      sedes.push({
        id: Number(u.sede_id || u.sede?.id),
        nombre: u.sede_nombre || u.sede?.nombre,
      })
    }

    const unique = new Map()
    sedes.forEach((sede) => {
      if (sede.id && !unique.has(sede.id)) unique.set(sede.id, sede)
    })

    return [...unique.values()]
  }

  function mapUser(u) {
    let cIds = []
    if (u.director) {
      if (u.director.carreras && u.director.carreras.length > 0) {
        cIds = u.director.carreras.map((c) => c.id)
      } else if (u.director.carrera) {
        cIds = [u.director.carrera.id]
      }
    }
    // Fallback a string legacy
    if (cIds.length === 0 && u.carrera && typeof u.carrera === 'string') {
      if (/^[\d,\s]+$/.test(u.carrera)) {
        cIds = u.carrera
          .split(',')
          .map((s) => parseInt(s.trim()))
          .filter((n) => !isNaN(n))
      }
    }

    const sedesAsignadas = normalizarSedesUsuario(u)
    const sedeId = Number(u.sede_id) || sedesAsignadas[0]?.id || null

    return {
      ...u,
      rolNombre: u.rol ? u.rol.nombre : '',
      rolId: u.rol_id,
      estado: u.estado ? 'activo' : 'inactivo',
      carrera: u.carrera_nombre || u.carrera,
      carreraIds: cIds,
      sedeNombre: sedesAsignadas
        .map((sede) => sede.nombre)
        .filter(Boolean)
        .join(', '),
      sedeId,
      sedeIds: sedesAsignadas.map((sede) => sede.id),
      sedesAsignadas,
    }
  }

  // Actions
  async function fetchUsuarios(search = '') {
    loading.value = true
    try {
      const response = await userService.getUsuarios(search)
      usuarios.value = response.data.map(mapUser)
    } catch (err) {
      console.error(err)
      error.value = 'Error al cargar usuarios'
    } finally {
      loading.value = false
    }
  }

  function getUsuarioById(id) {
    return usuarios.value.find((u) => u.id === id)
  }

  async function addUsuario(usuario) {
    loading.value = true
    try {
      // Adapt frontend data to backend payload
      const payload = { ...usuario }

      // Mapear campos frontend a backend
      if (payload.rolId !== undefined) {
        payload.rol_id = payload.rolId
        delete payload.rolId
      }
      if (payload.sedeId !== undefined) {
        payload.sede_id = payload.sedeId
        delete payload.sedeId
      }

      // Convertir carrera array a string separado por comas
      if (payload.carrera !== undefined) {
        if (Array.isArray(payload.carrera)) {
          payload.carrera = payload.carrera.join(', ')
        } else if (payload.carrera === null || payload.carrera === '') {
          payload.carrera = ''
        }
        // Si ya es string, mantenerlo
      }

      // Convertir estado string a booleano
      if (payload.estado !== undefined) {
        if (typeof payload.estado === 'string') {
          payload.estado = payload.estado === 'activo'
        } else if (typeof payload.estado === 'boolean') {
          // Ya es booleano, mantener
        } else {
          // Valor inesperado, default a true
          payload.estado = true
        }
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

      // Mapear campos frontend a backend
      if (payload.rolId !== undefined) {
        payload.rol_id = payload.rolId
        delete payload.rolId
      }
      if (payload.sedeId !== undefined) {
        payload.sede_id = payload.sedeId
        delete payload.sedeId
      }

      // Convertir carrera array a string separado por comas
      if (payload.carrera !== undefined) {
        if (Array.isArray(payload.carrera)) {
          payload.carrera = payload.carrera.join(', ')
        } else if (payload.carrera === null || payload.carrera === '') {
          payload.carrera = ''
        }
        // Si ya es string, mantenerlo
      }

      // Convertir estado string a booleano
      if (payload.estado !== undefined) {
        if (typeof payload.estado === 'string') {
          payload.estado = payload.estado === 'activo'
        } else if (typeof payload.estado === 'boolean') {
          // Ya es booleano, mantener
        } else {
          // Valor inesperado, default a true
          payload.estado = true
        }
      }

      const response = await userService.updateUsuario(id, payload)
      // Actualización local optimista con datos mapeados de la respuesta
      const index = usuarios.value.findIndex((u) => u.id === id)
      if (index !== -1 && response.data) {
        usuarios.value[index] = mapUser(response.data)
      } else {
        fetchUsuarios()
      }
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
    } catch (err) {
      console.error(err)
      return false
    }
  }

  async function toggleUsuarioEstado(id) {
    const usuario = usuarios.value.find((u) => u.id === id)
    if (usuario) {
      const nuevoEstado = usuario.estado !== 'activo' // bool
      // ... optimistic update and API call
      await userService.updateUsuario(id, { estado: nuevoEstado })
      fetchUsuarios()
      return true
    }
    return false
  }

  async function resetPasswordUsuario(id) {
    try {
      await userService.resetPassword(id)
      return true
    } catch (err) {
      console.error(err)
      throw err
    }
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
    resetPasswordUsuario,
    buscarUsuarios,
  }
})
