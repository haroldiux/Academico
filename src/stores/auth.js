import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'boot/axios'

// Constantes de roles
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  VICERRECTOR_NACIONAL: 'VICERRECTOR_NACIONAL',
  VICERRECTOR_SEDE: 'VICERRECTOR_SEDE',
  DIRECCION_ACADEMICA: 'DIRECCION_ACADEMICA',
  DIRECTOR_CARRERA: 'DIRECTOR_CARRERA',
  DOCENTE: 'DOCENTE',
  EVALUACIONES: 'EVALUACIONES'
}

// Permisos por rol
export const PERMISOS_ROL = {
  [ROLES.SUPER_ADMIN]: {
    nivel: 100,
    puedeEditar: true,
    alcance: 'global',
    dashboard: 'SuperAdminDashboard',
    descripcion: 'Control total del sistema'
  },
  [ROLES.ADMIN]: {
    nivel: 90,
    puedeEditar: false,
    alcance: 'global',
    dashboard: 'AdminDashboard',
    descripcion: 'Ve todo + estadísticas especiales'
  },
  [ROLES.VICERRECTOR_NACIONAL]: {
    nivel: 80,
    puedeEditar: true,
    alcance: 'global',
    dashboard: 'VicerrectorNacionalDashboard',
    descripcion: 'Ver y editar todo el sistema'
  },
  [ROLES.VICERRECTOR_SEDE]: {
    nivel: 70,
    puedeEditar: false,
    alcance: 'sede',
    dashboard: 'VicerrectorSedeDashboard',
    descripcion: 'Ver todo de su sede'
  },
  [ROLES.DIRECCION_ACADEMICA]: {
    nivel: 60,
    puedeEditar: false,
    alcance: 'sede',
    dashboard: 'DireccionAcademicaDashboard',
    descripcion: 'Ver todas las materias de su sede'
  },
  [ROLES.DIRECTOR_CARRERA]: {
    nivel: 50,
    puedeEditar: true,
    alcance: 'carrera',
    dashboard: 'DirectorCarreraDashboard',
    descripcion: 'Ver y editar materias de su carrera y sede'
  },
  [ROLES.DOCENTE]: {
    nivel: 30,
    puedeEditar: true,
    alcance: 'asignado',
    dashboard: 'DocenteDashboard',
    descripcion: 'Ver y editar solo materias asignadas'
  },
  [ROLES.EVALUACIONES]: {
    nivel: 40,
    puedeEditar: false,
    alcance: 'global',
    dashboard: 'EvaluacionesDashboard',
    descripcion: 'Gestión de evaluaciones y exámenes'
  }
}

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const usuarioActual = ref(null)
  const isAuthenticated = ref(false)
  const token = ref(null)
  const passwordChangeRequired = ref(false)

  // Computed
  const rol = computed(() => usuarioActual.value?.rol || null)
  const sedeId = computed(() => usuarioActual.value?.sede_id || null)
  const carreraId = computed(() => usuarioActual.value?.carrera_id || null)
  const permisos = computed(() => PERMISOS_ROL[rol.value] || null)
  const puedeEditar = computed(() => permisos.value?.puedeEditar || false)
  const alcance = computed(() => permisos.value?.alcance || null)
  const dashboard = computed(() => permisos.value?.dashboard || 'DocenteDashboard')
  const nombreCompleto = computed(() => usuarioActual.value?.nombre || 'Usuario')
  const avatar = computed(() => usuarioActual.value?.avatar || 'U')

  // Login real con API
  async function login(username, password) {
    try {
      const response = await api.post('/login', { username, password })
      const { token: authToken, user, password_change_required } = response.data

      // Guardar token
      token.value = authToken
      localStorage.setItem('auth_token', authToken)
      api.defaults.headers.common['Authorization'] = 'Bearer ' + authToken

      // Configurar usuario
      const rolNombre = user.rol?.nombre || 'DOCENTE'
      usuarioActual.value = {
        id: user.id,
        nombre: `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.username,
        email: user.email,
        ci: user.ci,
        rol: rolNombre,
        sede_id: user.docente?.sede_id || null,
        carrera_id: null,
        avatar: (user.nombre?.[0] || 'U') + (user.apellido?.[0] || ''),
        materias_asignadas: user.docente?.asignaturas?.map(a => ({
          id: a.id,
          nombre: a.nombre,
          codigo: a.codigo,
          semestre: a.semestre,
          progreso: 0,
          pivot: a.pivot ? {
            grupo: a.pivot.grupo,
            aula: a.pivot.aula,
            horario: a.pivot.horario
          } : null
        })) || [],
        grupos: user.docente?.asignaturas?.map(a => a.pivot?.grupo).filter((v, i, a) => v && a.indexOf(v) === i) || []
      }

      isAuthenticated.value = true
      passwordChangeRequired.value = password_change_required
      localStorage.setItem('auth_user', JSON.stringify(usuarioActual.value))

      return { success: true, usuario: usuarioActual.value, passwordChangeRequired: password_change_required }
    } catch (error) {
      const mensaje = error.response?.data?.message || error.response?.data?.errors?.username?.[0] || 'Error de autenticación'
      return { success: false, error: mensaje }
    }
  }

  // Cambiar contraseña
  async function changePassword(currentPassword, newPassword) {
    try {
      await api.post('/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPassword
      })
      passwordChangeRequired.value = false
      return { success: true }
    } catch (error) {
      const mensaje = error.response?.data?.message || error.response?.data?.errors?.current_password?.[0] || 'Error al cambiar contraseña'
      return { success: false, error: mensaje }
    }
  }

  function logout() {
    usuarioActual.value = null
    isAuthenticated.value = false
    token.value = null
    passwordChangeRequired.value = false
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
  }

  function checkAuth() {
    const storedUser = localStorage.getItem('auth_user')
    const storedToken = localStorage.getItem('auth_token')
    if (storedUser && storedToken) {
      usuarioActual.value = JSON.parse(storedUser)
      isAuthenticated.value = true
      token.value = storedToken
      // Restaurar header para Axios
      api.defaults.headers.common['Authorization'] = 'Bearer ' + storedToken
      return true
    }
    return false
  }

  // Verificar si tiene acceso a una sede
  function tieneAccesoSede(sedeIdObjetivo) {
    if (!usuarioActual.value) return false
    const alcanceActual = permisos.value?.alcance

    if (alcanceActual === 'global') return true
    if (alcanceActual === 'sede' || alcanceActual === 'carrera' || alcanceActual === 'asignado') {
      return usuarioActual.value.sede_id === sedeIdObjetivo
    }
    return false
  }

  // Verificar si tiene acceso a una carrera
  function tieneAccesoCarrera(carreraIdObjetivo, sedeIdObjetivo) {
    if (!usuarioActual.value) return false
    const alcanceActual = permisos.value?.alcance

    if (alcanceActual === 'global') return true
    if (alcanceActual === 'sede') {
      return usuarioActual.value.sede_id === sedeIdObjetivo
    }
    if (alcanceActual === 'carrera') {
      return usuarioActual.value.carrera_id === carreraIdObjetivo &&
             usuarioActual.value.sede_id === sedeIdObjetivo
    }
    return false
  }

  // Verificar si tiene acceso a una materia
  function tieneAccesoMateria(materiaId, carreraIdMateria, sedeIdMateria) {
    if (!usuarioActual.value) return false
    const alcanceActual = permisos.value?.alcance

    if (alcanceActual === 'global') return true
    if (alcanceActual === 'sede') {
      return usuarioActual.value.sede_id === sedeIdMateria
    }
    if (alcanceActual === 'carrera') {
      return usuarioActual.value.carrera_id === carreraIdMateria &&
             usuarioActual.value.sede_id === sedeIdMateria
    }
    if (alcanceActual === 'asignado') {
      return usuarioActual.value.materias_asignadas?.includes(materiaId)
    }
    return false
  }

  // Verificar si puede editar una materia
  function puedeEditarMateria(materiaId, carreraIdMateria, sedeIdMateria) {
    if (!puedeEditar.value) return false
    return tieneAccesoMateria(materiaId, carreraIdMateria, sedeIdMateria)
  }

  return {
    // Estado
    usuarioActual,
    isAuthenticated,
    token,
    passwordChangeRequired,

    // Computed
    rol,
    sedeId,
    carreraId,
    permisos,
    puedeEditar,
    alcance,
    dashboard,
    nombreCompleto,
    avatar,

    // Métodos
    login,
    changePassword,
    logout,
    checkAuth,
    tieneAccesoSede,
    tieneAccesoCarrera,
    tieneAccesoMateria,
    puedeEditarMateria
  }
})
