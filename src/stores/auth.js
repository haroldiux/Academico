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

// Mapeo de nombres de rol de BD a constantes del frontend
// Solo incluye los códigos que la BD realmente envía
const ROLE_NAME_MAP = {
  'SUPER_ADMIN': ROLES.SUPER_ADMIN,
  'ADMIN': ROLES.ADMIN,
  'VICERRECTORADO_NACIONAL': ROLES.VICERRECTOR_NACIONAL,
  'VICERRECTORADO': ROLES.VICERRECTOR_SEDE,
  'VICERRECTOR_SEDE': ROLES.VICERRECTOR_SEDE,
  'DIRECCION_ACADEMICA': ROLES.DIRECCION_ACADEMICA,
  'DIRECTOR_CARRERA': ROLES.DIRECTOR_CARRERA,
  'DOCENTE': ROLES.DOCENTE,
  'EVALUACIONES': ROLES.EVALUACIONES,
  // Variaciones de texto
  'DIRECCIÓN ACADÉMICA': ROLES.DIRECCION_ACADEMICA,
  'DIRECCION ACADEMICA': ROLES.DIRECCION_ACADEMICA,
  'DIRECTOR DE CARRERA': ROLES.DIRECTOR_CARRERA
}

// Función para normalizar nombre de rol
export function normalizeRoleName(roleName) {
  if (!roleName) return ROLES.DOCENTE
  const normalized = ROLE_NAME_MAP[roleName.toUpperCase().trim()]
  return normalized || ROLES.DOCENTE
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
      // Normalizar rol: BD puede enviar 'VICERRECTORADO', frontend usa 'VICERRECTOR_NACIONAL'
      const rolRaw = user.rol?.codigo || user.rol?.nombre || 'DOCENTE'
      const rolNombre = normalizeRoleName(rolRaw)

      usuarioActual.value = {
        id: user.id,
        nombre: `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.username,
        email: user.email,
        ci: user.ci,
        rol: rolNombre,
        // Fix: prioritize docente.sede_id, then user.sede_id (if any), then null
        sede_id: user.docente?.sede_id || user.docente?.sede?.id || user.sede_id || null,
        // Persist full sede object for UI use if available
        docente: {
          ...user.docente,
          sede: user.docente?.sede || null
        },
        carrera_id: user.director?.carrera_id || user.carrera_id || null,
        avatar: (user.nombre?.[0] || 'U') + (user.apellido?.[0] || ''),
        materias_asignadas: (() => {
          // Group grupos by asignatura_id to avoid duplicate cards
          const gruposRaw = user.docente?.grupos || []
          const grouped = {}

          for (const g of gruposRaw) {
            const asig = g.asignatura || {}
            const asigId = asig.id || g.asignatura_id
            if (!asigId) continue

            // Format this group's schedule
            const horariosFmt = g.horarios?.map(h =>
              `${h.dia?.substring(0, 3) || '?'} ${h.hora_inicio?.substring(0, 5) || ''}-${h.hora_fin?.substring(0, 5) || ''}`
            ).join(', ') || ''

            if (!grouped[asigId]) {
              grouped[asigId] = {
                id: asigId,
                nombre: asig.nombre || 'Desconocida',
                codigo: asig.codigo || '---',
                semestre: asig.semestre || g.semestre,
                progreso: asig.progreso || 0,
                estadisticas: asig.estadisticas_progreso || { total: 0, completados: 0, pendientes: 0 },
                carreras: asig.carreras?.map(c => c.nombre) || [],
                grupos: [], // All groups for this subject
                pivot: {} // Legacy: first group's data
              }
            }

            // Add this group to the list
            grouped[asigId].grupos.push({
              id: g.id,
              nombre: g.nombre,
              tipo: g.tipo,
              turno: g.turno,
              gestion: g.gestion,
              carrera_id: g.carrera_id,
              sede_id: g.sede_id,
              horario: horariosFmt
            })

            // Set pivot to first group's data (legacy compatibility)
            if (!grouped[asigId].pivot.grupo) {
              grouped[asigId].pivot = {
                grupo: g.nombre,
                aula: g.aula_id,
                horario: horariosFmt || 'Por definir',
                turno: g.turno,
                gestion: g.gestion,
                sede_id: g.sede_id // Added sede context
              }
            }
          }

          return Object.values(grouped)
        })(),
        // Flat list of all unique career names this teacher belongs to
        carreras: [...new Set(user.docente?.asignaturas?.flatMap(a => a.carreras?.map(c => c.nombre)) || [])],
        // Fix: Load groups from docente.grupos relation, fallback to legacy
        grupos: user.docente?.grupos || (user.docente?.asignaturas?.map(a => a.pivot?.grupo).filter((v, i, a) => v && a.indexOf(v) === i) || []),
        // Director data
        director: user.director ? {
          ...user.director,
          carrera: user.director.carrera,
          carreras: user.director.carreras // If multiple
        } : null
      }

      isAuthenticated.value = true
      passwordChangeRequired.value = password_change_required
      localStorage.setItem('auth_user', JSON.stringify(usuarioActual.value))

      return { success: true, usuario: usuarioActual.value, passwordChangeRequired: password_change_required }
    } catch (error) {
      console.error('Login error detail:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      const status = error.response?.status ? ` [HTTP ${error.response.status}]` : ''
      const details = error.response?.data?.message || error.response?.data?.errors?.username?.[0] || error.message || ''
      const mensaje = `${details}${status}`
      return { success: false, error: mensaje }
    }
  }

  // Cambiar contraseña
  async function changePassword(newPassword) {
    try {
      await api.post('/change-password', {
        new_password: newPassword,
        new_password_confirmation: newPassword
      })
      passwordChangeRequired.value = false
      return { success: true }
    } catch (error) {
      const mensaje = error.response?.data?.message || 'Error al cambiar contraseña'
      return { success: false, error: mensaje }
    }
  }

  // Actualizar Perfil
  async function updateProfile(profileData) {
    try {
      const response = await api.post('/update-profile', profileData)
      const { user } = response.data

      // Actualizar estado local
      if (usuarioActual.value) {
        // Actualizar datos base
        usuarioActual.value = {
          ...usuarioActual.value,
          nombre: `${user.nombre || ''} ${user.apellido || ''}`.trim(),
          email: user.email,
          ci: user.ci,
          telefono: user.telefono,
          avatar: (user.nombre?.[0] || 'U') + (user.apellido?.[0] || '')
        }

        // Optimistic Update para Docente (Formación y Teléfono)
        // Si enviamos formacion, la guardamos localmente aunque el backend no devuelva el objeto docente completo
        if (profileData.formacion !== undefined && usuarioActual.value.docente) {
          usuarioActual.value.docente.formacion = profileData.formacion
        }
        if (profileData.telefono !== undefined) {
          usuarioActual.value.telefono = profileData.telefono
          if (usuarioActual.value.docente) {
            usuarioActual.value.docente.celular = profileData.telefono
          }
        }

        localStorage.setItem('auth_user', JSON.stringify(usuarioActual.value))
      }

      return { success: true, message: response.data.message }
    } catch (error) {
      const mensaje = error.response?.data?.message || 'Error al actualizar el perfil'
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

  async function fetchUser() {
    try {
      const response = await api.get('/me')
      const user = response.data

      // Re-utilizar lógica de normalización de login
      const rolRaw = user.rol?.codigo || user.rol?.nombre || 'DOCENTE'
      const rolNombre = normalizeRoleName(rolRaw)

      usuarioActual.value = {
        ...usuarioActual.value,
        id: user.id,
        nombre: `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.username,
        email: user.email,
        ci: user.ci,
        rol: rolNombre,
        sede_id: user.docente?.sede_id || user.docente?.sede?.id || user.sede_id || null,
        carrera_id: user.director?.carrera_id || user.carrera_id || null,
        docente: {
          ...user.docente,
          sede: user.docente?.sede || null
        },
        avatar: (user.nombre?.[0] || 'U') + (user.apellido?.[0] || ''),
        materias_asignadas: (() => {
          // Group grupos by asignatura_id to avoid duplicate cards
          const gruposRaw = user.docente?.grupos || []
          const grouped = {}

          for (const g of gruposRaw) {
            const asig = g.asignatura || {}
            const asigId = asig.id || g.asignatura_id
            if (!asigId) continue

            // Format this group's schedule
            const horariosFmt = g.horarios?.map(h =>
              `${h.dia?.substring(0, 3) || '?'} ${h.hora_inicio?.substring(0, 5) || ''}-${h.hora_fin?.substring(0, 5) || ''}`
            ).join(', ') || ''

            if (!grouped[asigId]) {
              grouped[asigId] = {
                id: asigId,
                nombre: asig.nombre || 'Desconocida',
                codigo: asig.codigo || '---',
                semestre: asig.semestre || g.semestre,
                progreso: asig.progreso || 0,
                // Sede: Priorizar Sede del GRUPO (donde enseña), fallback a Sede de la Materia
                sede_nombre: g.sede?.nombre || asig.sede?.nombre || null,
                estadisticas: asig.estadisticas_progreso || { total: 0, completados: 0, pendientes: 0 },
                carreras: asig.carreras?.map(c => c.nombre) || [],
                grupos: [],
                pivot: {}
              }
            }

            grouped[asigId].grupos.push({
              id: g.id,
              nombre: g.nombre,
              tipo: g.tipo,
              turno: g.turno,
              gestion: g.gestion,
              carrera_id: g.carrera_id,
              horario: horariosFmt,
              sede_nombre: g.sede?.nombre // Guardar también por grupo
            })

            if (!grouped[asigId].pivot.grupo) {
              grouped[asigId].pivot = {
                grupo: g.nombre,
                aula: g.aula_id,
                horario: horariosFmt || 'Por definir',
                turno: g.turno,
                gestion: g.gestion,
                sede_id: g.sede_id,
                sede_nombre: g.sede?.nombre // Added sede context
              }
            }
          }

          return Object.values(grouped)
        })(),
        carreras: [...new Set(user.docente?.asignaturas?.flatMap(a => a.carreras?.map(c => c.nombre)) || [])],
        grupos: user.docente?.grupos || (user.docente?.asignaturas?.map(a => a.pivot?.grupo).filter((v, i, a) => v && a.indexOf(v) === i) || []),
        director: user.director ? {
          ...user.director,
          carrera: user.director.carrera,
          carreras: user.director.carreras
        } : null
      }

      localStorage.setItem('auth_user', JSON.stringify(usuarioActual.value))
      return { success: true }
    } catch (error) {
      console.error('Error fetching user:', error)
      return { success: false }
    }
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
    updateProfile,
    fetchUser,
    logout,
    checkAuth,
    tieneAccesoSede,
    tieneAccesoCarrera,
    tieneAccesoMateria,
    puedeEditarMateria
  }
}, {
  persist: true
})
