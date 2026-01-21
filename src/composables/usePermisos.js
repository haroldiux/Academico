import { computed } from 'vue'
import { useAuthStore, ROLES, PERMISOS_ROL } from 'src/stores/auth'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'
import { useAsignaturasStore } from 'src/stores/asignaturas'

/**
 * Composable para manejar permisos y filtrado de datos según el rol del usuario
 */
export function usePermisos() {
  const authStore = useAuthStore()
  const sedesStore = useSedesStore()
  const carrerasStore = useCarrerasStore()
  const asignaturasStore = useAsignaturasStore()

  // === COMPUTED ===

  // Información del usuario actual
  const usuario = computed(() => authStore.usuarioActual)
  const rol = computed(() => authStore.rol)
  const sedeId = computed(() => authStore.sedeId)
  const carreraId = computed(() => authStore.carreraId)
  const permisos = computed(() => authStore.permisos)

  // Permisos básicos
  const puedeEditar = computed(() => authStore.puedeEditar)
  const esSoloLectura = computed(() => !authStore.puedeEditar)
  const alcance = computed(() => authStore.alcance)

  // Verificaciones de rol específico
  const esSuperAdmin = computed(() => rol.value === ROLES.SUPER_ADMIN)
  const esAdmin = computed(() => rol.value === ROLES.ADMIN)
  const esVicerrectorNacional = computed(() => rol.value === ROLES.VICERRECTOR_NACIONAL)
  const esVicerrectorSede = computed(() => rol.value === ROLES.VICERRECTOR_SEDE)
  const esDireccionAcademica = computed(() => rol.value === ROLES.DIRECCION_ACADEMICA)
  const esDirectorCarrera = computed(() => rol.value === ROLES.DIRECTOR_CARRERA)
  const esDocente = computed(() => rol.value === ROLES.DOCENTE)
  const esEvaluaciones = computed(() => rol.value === ROLES.EVALUACIONES)

  // Niveles de acceso
  const tieneAccesoGlobal = computed(() => alcance.value === 'global')
  const tieneAccesoSede = computed(() => ['global', 'sede'].includes(alcance.value))
  const tieneAccesoCarrera = computed(() => ['global', 'sede', 'carrera'].includes(alcance.value))

  // Información de sede del usuario
  const sedeActual = computed(() => {
    if (!sedeId.value) return null
    return sedesStore.getSedeById(sedeId.value)
  })

  // Información de carrera del usuario
  const carreraActual = computed(() => {
    if (!carreraId.value) return null
    return carrerasStore.getCarreraById(carreraId.value)
  })

  // === SEDES FILTRADAS ===
  const sedesFiltradas = computed(() => {
    if (tieneAccesoGlobal.value) {
      return sedesStore.sedesActivas
    }
    // Para usuarios con acceso solo a su sede
    if (sedeId.value) {
      return sedesStore.sedesActivas.filter(s => s.id === sedeId.value)
    }
    return []
  })

  // === CARRERAS FILTRADAS ===
  const carrerasFiltradas = computed(() => {
    if (tieneAccesoGlobal.value) {
      return carrerasStore.carrerasActivas
    }
    if (tieneAccesoSede.value && sedeId.value) {
      return carrerasStore.getCarrerasBySede(sedeId.value)
    }
    if (esDirectorCarrera.value && carreraId.value) {
      return carrerasStore.carrerasActivas.filter(c =>
        c.id === carreraId.value && c.sede_id === sedeId.value
      )
    }
    return []
  })

  // === ASIGNATURAS FILTRADAS ===
  const asignaturasFiltradas = computed(() => {
    const todasAsignaturas = asignaturasStore.asignaturas

    // Super Admin, Admin, Vicerrector Nacional - ve todo
    if (tieneAccesoGlobal.value) {
      return todasAsignaturas
    }

    // Vicerrector Sede, Dirección Académica - ve todo de su sede
    if (tieneAccesoSede.value && sedeId.value) {
      return todasAsignaturas.filter(a => a.sede_id === sedeId.value)
    }

    // Director de Carrera - ve todo de su carrera y sede
    if (esDirectorCarrera.value) {
      return todasAsignaturas.filter(a =>
        a.carrera_id === carreraId.value && a.sede_id === sedeId.value
      )
    }

    // Docente - solo sus materias asignadas
    if (esDocente.value) {
      const materiasAsignadas = usuario.value?.materias_asignadas || []
      // Manejar tanto IDs directos como objetos {id, nombre, ...}
      const idsAsignados = materiasAsignadas.map(m => typeof m === 'object' ? m.id : m)
      return todasAsignaturas.filter(a => idsAsignados.includes(a.id))
    }

    return []
  })

  // === MÉTODOS ===

  /**
   * Verifica si el usuario puede ver una asignatura específica
   */
  function puedeVerAsignatura(asignatura) {
    if (!asignatura) return false
    return authStore.tieneAccesoMateria(
      asignatura.id,
      asignatura.carrera_id,
      asignatura.sede_id
    )
  }

  /**
   * Verifica si el usuario puede editar una asignatura específica
   */
  function puedeEditarAsignatura(asignatura) {
    if (!asignatura) return false
    return authStore.puedeEditarMateria(
      asignatura.id,
      asignatura.carrera_id,
      asignatura.sede_id
    )
  }

  /**
   * Verifica si el usuario puede ver una carrera
   */
  function puedeVerCarrera(carrera) {
    if (!carrera) return false
    return authStore.tieneAccesoCarrera(carrera.id, carrera.sede_id)
  }

  /**
   * Verifica si el usuario puede ver una sede
   */
  function puedeVerSede(sede) {
    if (!sede) return false
    return authStore.tieneAccesoSede(sede.id)
  }

  /**
   * Obtiene el dashboard correspondiente al rol
   */
  function getDashboardRoute() {
    const dashboards = {
      [ROLES.SUPER_ADMIN]: '/admin/dashboard',
      [ROLES.ADMIN]: '/admin/dashboard',
      [ROLES.VICERRECTOR_NACIONAL]: '/vicerrector/dashboard',
      [ROLES.VICERRECTOR_SEDE]: '/vicerrector-sede/dashboard',
      [ROLES.DIRECCION_ACADEMICA]: '/direccion/dashboard',
      [ROLES.DIRECTOR_CARRERA]: '/carrera/dashboard',
      [ROLES.DOCENTE]: '/docente/dashboard',
      [ROLES.EVALUACIONES]: '/evaluaciones/dashboard'
    }
    return dashboards[rol.value] || '/'
  }

  /**
   * Obtiene los items del menú según el rol
   */
  function getMenuItems() {
    const itemsBase = [
      { label: 'Dashboard', icon: 'dashboard', to: getDashboardRoute() }
    ]

    // Items según rol
    if (esDocente.value) {
      return [
        ...itemsBase,
        { label: 'Mis Asignaturas', icon: 'menu_book', to: '/documentacion' },
        { label: 'Control de Clase', icon: 'class', to: '/docente/clase' },
        { label: 'Reporte Asistencia', icon: 'assessment', to: '/docente/reporte-asistencia' },
        { label: 'Mis Evaluaciones', icon: 'quiz', to: '/docente/evaluaciones' },
        { label: 'Mi Perfil', icon: 'person', to: '/perfil' }
      ]
    }

    if (esDirectorCarrera.value) {
      return [
        ...itemsBase,
        { label: 'Asignaturas', icon: 'menu_book', to: '/documentacion' },
        { label: 'Docentes', icon: 'people', to: '/docentes' },
        { label: 'Reportes', icon: 'assessment', to: '/reportes' }
      ]
    }

    if (esDireccionAcademica.value || esVicerrectorSede.value) {
      return [
        ...itemsBase,
        { label: 'Carreras', icon: 'school', to: '/carreras' },
        { label: 'Asignaturas', icon: 'menu_book', to: '/documentacion' },
        { label: 'Reportes', icon: 'assessment', to: '/reportes' }
      ]
    }

    if (esVicerrectorNacional.value) {
      return [
        ...itemsBase,
        { label: 'Sedes', icon: 'location_city', to: '/sedes' },
        { label: 'Carreras', icon: 'school', to: '/carreras' },
        { label: 'Asignaturas', icon: 'menu_book', to: '/documentacion' },
        { label: 'Reportes Nacionales', icon: 'analytics', to: '/reportes' }
      ]
    }

    if (esAdmin.value || esSuperAdmin.value) {
      return [
        ...itemsBase,
        { label: 'Usuarios', icon: 'people', to: '/admin/usuarios' },
        { label: 'Roles', icon: 'admin_panel_settings', to: '/admin/roles' },
        { label: 'Sedes', icon: 'location_city', to: '/admin/sedes' },
        { label: 'Carreras', icon: 'school', to: '/admin/carreras' },
        { label: 'Asignaturas', icon: 'menu_book', to: '/admin/asignaturas' },
        { label: 'Grupos', icon: 'groups', to: '/admin/grupos' },
        { label: 'Docentes', icon: 'person', to: '/admin/docentes' },
        { label: 'Evaluaciones', icon: 'quiz', to: '/admin/evaluaciones' },
        { label: 'Documentación', icon: 'description', to: '/documentacion' },
        { label: 'Reportes', icon: 'assessment', to: '/admin/reportes' },
        { label: 'Estadísticas', icon: 'analytics', to: '/admin/estadisticas' },
        { label: 'Configuración', icon: 'settings', to: '/admin/configuracion' }
      ]
    }

    return itemsBase
  }

  /**
   * Obtiene estadísticas según el rol
   */
  function getEstadisticasRol() {
    const stats = {
      asignaturas: asignaturasFiltradas.value.length,
      carreras: carrerasFiltradas.value.length,
      sedes: sedesFiltradas.value.length
    }

    if (esDocente.value) {
      stats.materiasAsignadas = usuario.value?.materias_asignadas?.length || 0
      stats.grupos = usuario.value?.grupos?.length || 0
    }

    return stats
  }

  return {
    // Estado
    usuario,
    rol,
    sedeId,
    carreraId,
    permisos,
    sedeActual,
    carreraActual,

    // Permisos
    puedeEditar,
    esSoloLectura,
    alcance,

    // Verificaciones de rol
    esSuperAdmin,
    esAdmin,
    esVicerrectorNacional,
    esVicerrectorSede,
    esDireccionAcademica,
    esDirectorCarrera,
    esDocente,
    esEvaluaciones,

    // Niveles de acceso
    tieneAccesoGlobal,
    tieneAccesoSede,
    tieneAccesoCarrera,

    // Datos filtrados
    sedesFiltradas,
    carrerasFiltradas,
    asignaturasFiltradas,

    // Métodos
    puedeVerAsignatura,
    puedeEditarAsignatura,
    puedeVerCarrera,
    puedeVerSede,
    getDashboardRoute,
    getMenuItems,
    getEstadisticasRol,

    // Constantes
    ROLES,
    PERMISOS_ROL
  }
}
