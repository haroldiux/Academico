import { computed } from 'vue'
import { useAuthStore, ROLES, PERMISOS_ROL } from 'src/stores/auth'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'
import { useAsignaturasStore } from 'src/stores/asignaturas'

// Detectar si estamos corriendo como app nativa (Capacitor)
// eslint-disable-next-line no-unused-vars
const esAppNativa = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.() === true

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
  const esResponsableEvaluaciones = computed(() => rol.value === ROLES.RESPONSABLE_EVALUACIONES)
  const esPlataforma = computed(() => rol.value === ROLES.PLATAFORMA)

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
      return sedesStore.sedesActivas.filter((s) => s.id === sedeId.value)
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
      return carrerasStore.carrerasActivas.filter(
        (c) => c.id === carreraId.value && c.sede_id === sedeId.value,
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
      return todasAsignaturas.filter((a) => a.sede_id === sedeId.value)
    }

    // Director de Carrera - ve todo de su carrera y sede
    if (esDirectorCarrera.value) {
      return todasAsignaturas.filter(
        (a) => a.carrera_id === carreraId.value && a.sede_id === sedeId.value,
      )
    }

    // Docente - solo sus materias asignadas
    if (esDocente.value) {
      const materiasAsignadas = usuario.value?.materias_asignadas || []
      // Manejar tanto IDs directos como objetos {id, nombre, ...}
      const idsAsignados = materiasAsignadas.map((m) => (typeof m === 'object' ? m.id : m))
      return todasAsignaturas.filter((a) => idsAsignados.includes(a.id))
    }

    return []
  })

  // === MÉTODOS ===

  /**
   * Verifica si el usuario puede ver una asignatura específica
   */
  function puedeVerAsignatura(asignatura) {
    if (!asignatura) return false
    return authStore.tieneAccesoMateria(asignatura.id, asignatura.carrera_id, asignatura.sede_id)
  }

  /**
   * Verifica si el usuario puede editar una asignatura específica
   */
  function puedeEditarAsignatura(asignatura) {
    if (!asignatura) return false
    return authStore.puedeEditarMateria(asignatura.id, asignatura.carrera_id, asignatura.sede_id)
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
      [ROLES.EVALUACIONES]: '/evaluaciones/dashboard',
      [ROLES.RESPONSABLE_EVALUACIONES]: '/evaluaciones/dashboard',
      [ROLES.PLATAFORMA]: '/director/asignaturas',
    }
    return dashboards[rol.value] || '/'
  }

  /**
   * Obtiene los items del menú según el rol
   */
  function getMenuItems() {
    const itemsBase = [{ label: 'Dashboard', icon: 'dashboard', to: getDashboardRoute() }]

    // Items según rol
    if (esPlataforma.value) {
      return [{ label: 'Plan de Estudios', icon: 'layers', to: '/director/asignaturas' }]
    }

    if (esDocente.value) {
      return [{ label: 'Mis Asignaturas', icon: 'menu_book', to: '/documentacion' }]
    }

    if (esDirectorCarrera.value) {
      return [
        ...itemsBase,
        { label: 'Asignaturas', icon: 'menu_book', to: '/director/asignaturas' },
        {
          label: 'Restaurar Programas',
          icon: 'cloud_download',
          to: '/director/restaurar-programas',
        },
        { label: 'Materias Comunes', icon: 'merge_type', to: '/director/materias-comunes' },
        { label: 'Docentes', icon: 'people', to: '/director/docentes' },
        { label: 'Centro de Reportes', icon: 'assessment', to: '/director/reportes' },
        { label: 'Rol de Exámenes', icon: 'event_note', to: '/director/rol-examenes' },
        { label: 'Gestión de Evaluaciones', icon: 'assignment', to: '/admin/evaluaciones' },
        {
          label: 'Reporte Evaluaciones',
          icon: 'query_stats',
          to: '/admin/reporte-evaluaciones',
        },
        { label: 'Información Carrera', icon: 'business', to: '/director/contexto' },
        { label: 'Mallas Curriculares', icon: 'account_tree', to: '/director/mallas-curriculares' },
      ]
    }

    if (esDireccionAcademica.value || esVicerrectorSede.value) {
      return [
        ...itemsBase,
        { label: 'Carreras', icon: 'school', to: '/carreras' },
        { label: 'Asignaturas', icon: 'menu_book', to: '/director/asignaturas' },
        // Materias Comunes removed requested by user for Vicerrector Sede
        // { label: 'Materias Comunes', icon: 'merge_type', to: '/director/materias-comunes' },
        { label: 'Docentes', icon: 'people', to: '/director/docentes' },
        { label: 'Centro de Reportes', icon: 'assessment', to: '/director/reportes' },
        { label: 'Rol de Exámenes', icon: 'event_note', to: '/director/rol-examenes' },
        { label: 'Gestión de Evaluaciones', icon: 'assignment', to: '/admin/evaluaciones' },
        {
          label: 'Reporte Evaluaciones',
          icon: 'query_stats',
          to: '/admin/reporte-evaluaciones',
        },
      ]
    }

    if (esEvaluaciones.value || esResponsableEvaluaciones.value) {
      const items = [
        { label: 'Gestión de Evaluaciones', icon: 'assignment', to: '/admin/evaluaciones' },
      ]
      if (esResponsableEvaluaciones.value) {
        items.push({
          label: 'Adm. Evaluaciones',
          icon: 'manage_accounts',
          to: '/admin/administracion-evaluaciones',
        })
        items.push({
          label: 'Reporte Evaluaciones',
          icon: 'query_stats',
          to: '/admin/reporte-evaluaciones',
        })
      }
      return items
    }

    if (esVicerrectorNacional.value) {
      return [
        ...itemsBase,
        { label: 'Sedes', icon: 'apartment', to: '/admin/sedes' },
        { label: 'Carreras', icon: 'school', to: '/carreras' },
        { label: 'Asignaturas', icon: 'menu_book', to: '/director/asignaturas' },
        { label: 'Materias Comunes', icon: 'merge_type', to: '/director/materias-comunes' },
        { label: 'Docentes', icon: 'people', to: '/director/docentes' },
        { label: 'Centro de Reportes', icon: 'assessment', to: '/director/reportes' },
        { label: 'Mallas Curriculares', icon: 'account_tree', to: '/admin/mallas-curriculares' },
        { label: 'Rol de Exámenes', icon: 'event_note', to: '/director/rol-examenes' },
        { label: 'Gestión de Evaluaciones', icon: 'assignment', to: '/admin/evaluaciones' },
        {
          label: 'Adm. Evaluaciones',
          icon: 'manage_accounts',
          to: '/admin/administracion-evaluaciones',
        },
        {
          label: 'Reporte Evaluaciones',
          icon: 'query_stats',
          to: '/admin/reporte-evaluaciones',
        },
      ]
    }

    if (esAdmin.value || esSuperAdmin.value) {
      const items = [
        ...itemsBase,
        { label: 'Usuarios', icon: 'people', to: '/admin/usuarios' },
        { label: 'Roles', icon: 'admin_panel_settings', to: '/admin/roles' },
        { label: 'Sedes', icon: 'location_city', to: '/admin/sedes' },
        { label: 'Carreras', icon: 'school', to: '/admin/carreras' },
        { label: 'Asignaturas', icon: 'menu_book', to: '/admin/asignaturas' },
        { label: 'Plan de Estudios', icon: 'layers', to: '/director/asignaturas' },
        {
          label: 'Restaurar Programas',
          icon: 'cloud_download',
          to: '/director/restaurar-programas',
        },
        { label: 'Grupos', icon: 'groups', to: '/admin/grupos' },
        { label: 'Docentes', icon: 'person', to: '/admin/docentes' },
        { label: 'Mallas Curriculares', icon: 'account_tree', to: '/admin/mallas-curriculares' },
        { label: 'Gestión de Evaluaciones', icon: 'assignment', to: '/admin/evaluaciones' },
        { label: 'Verificador de Patrones', icon: 'fact_check', to: '/admin/verificador-patrones' },
        {
          label: 'Adm. Evaluaciones',
          icon: 'manage_accounts',
          to: '/admin/administracion-evaluaciones',
        },
        {
          label: 'Reporte Evaluaciones',
          icon: 'query_stats',
          to: '/admin/reporte-evaluaciones',
        },
        { label: 'Rol Exámenes (Eval)', icon: 'fact_check', to: '/evaluaciones/rol-examenes' },
        { label: 'Rol de Exámenes', icon: 'event_note', to: '/director/rol-examenes' },
        { label: 'Documentación', icon: 'description', to: '/documentacion' },
        { label: 'Reportes', icon: 'assessment', to: '/admin/reportes' },
        { label: 'Estadísticas', icon: 'analytics', to: '/admin/estadisticas' },
        { label: 'Configuración', icon: 'settings', to: '/admin/configuracion' },
        { label: 'Comparador Backups', icon: 'history_edu', to: '/admin/comparador-backup' },
        {
          label: 'Recuperación Manual',
          icon: 'settings_backup_restore',
          to: '/admin/recuperacion-manual',
        },
        {
          label: 'Banco por Plan',
          icon: 'rule_folder',
          to: '/admin/auditoria-banco-plan',
        },
      ]
      // Opciones adicionales solo para SUPER_ADMIN
      if (esSuperAdmin.value) {
        items.push({
          label: 'Gestión Académica',
          icon: 'grid_view',
          to: '/admin/gestion-academica',
        })
        items.push({
          label: 'Recuperación Bancos',
          icon: 'healing',
          to: '/admin/restauracion-bancos',
        })
        items.push({
          label: 'Sincronización',
          icon: 'sync',
          to: '/admin/sincronizacion',
        })
      }
      return items
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
      sedes: sedesFiltradas.value.length,
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
    esResponsableEvaluaciones,
    esPlataforma,

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
    PERMISOS_ROL,
  }
}
