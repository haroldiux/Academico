import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

  // Usuarios de prueba para desarrollo
  const usuariosPrueba = [
    {
      id: 1,
      nombre: 'Super Administrador',
      email: 'superadmin@unitepc.edu.bo',
      rol: ROLES.SUPER_ADMIN,
      sede_id: null,
      carrera_id: null,
      avatar: 'SA'
    },
    {
      id: 2,
      nombre: 'Administrador General',
      email: 'admin@unitepc.edu.bo',
      rol: ROLES.ADMIN,
      sede_id: null,
      carrera_id: null,
      avatar: 'AD'
    },
    {
      id: 3,
      nombre: 'Dr. Carlos Mendoza',
      email: 'vicerrector.nacional@unitepc.edu.bo',
      rol: ROLES.VICERRECTOR_NACIONAL,
      sede_id: null,
      carrera_id: null,
      avatar: 'CM'
    },
    {
      id: 4,
      nombre: 'Lic. María Fernández',
      email: 'vicerrector.cbba@unitepc.edu.bo',
      rol: ROLES.VICERRECTOR_SEDE,
      sede_id: 1, // Cochabamba
      carrera_id: null,
      avatar: 'MF'
    },
    {
      id: 5,
      nombre: 'Ing. Roberto Paz',
      email: 'direccion.academica@unitepc.edu.bo',
      rol: ROLES.DIRECCION_ACADEMICA,
      sede_id: 1, // Cochabamba
      carrera_id: null,
      avatar: 'RP'
    },
    {
      id: 6,
      nombre: 'Ing. Laura Sánchez',
      email: 'director.sistemas@unitepc.edu.bo',
      rol: ROLES.DIRECTOR_CARRERA,
      sede_id: 1, // Cochabamba
      carrera_id: 1, // Ingeniería de Sistemas
      avatar: 'LS'
    },
    {
      id: 7,
      nombre: 'Ing. Pedro García',
      email: 'docente.garcia@unitepc.edu.bo',
      rol: ROLES.DOCENTE,
      sede_id: 1,
      carrera_id: 1,
      grupos: ['A', 'B'],
      materias_asignadas: [1, 2, 3], // IDs de materias
      avatar: 'PG'
    },
    {
      id: 8,
      nombre: 'Lic. Ana Torres',
      email: 'docente.torres@unitepc.edu.bo',
      rol: ROLES.DOCENTE,
      sede_id: 1,
      carrera_id: 1,
      grupos: ['C'],
      materias_asignadas: [4, 5],
      avatar: 'AT'
    }
  ]

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

  // Métodos
  // eslint-disable-next-line no-unused-vars
  function login(email, password) {
    // Simulación de login - en producción validar password con API
    const usuario = usuariosPrueba.find(u => u.email === email)
    if (usuario) {
      usuarioActual.value = usuario
      isAuthenticated.value = true
      token.value = 'token_simulado_' + Date.now()
      localStorage.setItem('auth_user', JSON.stringify(usuario))
      localStorage.setItem('auth_token', token.value)
      return { success: true, usuario }
    }
    return { success: false, error: 'Credenciales inválidas' }
  }

  function loginAs(rolKey) {
    // Login rápido como un rol específico (solo desarrollo)
    const usuario = usuariosPrueba.find(u => u.rol === rolKey)
    if (usuario) {
      usuarioActual.value = usuario
      isAuthenticated.value = true
      token.value = 'token_dev_' + Date.now()
      localStorage.setItem('auth_user', JSON.stringify(usuario))
      localStorage.setItem('auth_token', token.value)
      return { success: true, usuario }
    }
    return { success: false, error: 'Rol no encontrado' }
  }

  function logout() {
    usuarioActual.value = null
    isAuthenticated.value = false
    token.value = null
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
    usuariosPrueba,
    
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
    loginAs,
    logout,
    checkAuth,
    tieneAccesoSede,
    tieneAccesoCarrera,
    tieneAccesoMateria,
    puedeEditarMateria
  }
})
