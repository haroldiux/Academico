import { e as z, P as a, R as r, al as j } from './index-CVgKKHHv.js'
import { u as q } from './sedes-xi7lRAei.js'
import { u as H } from './carreras-B-7e1Sez.js'
import { u as J } from './asignaturas-C0o3NZaO.js'
typeof window < 'u' && window.Capacitor?.isNativePlatform?.()
function Y() {
  const o = z(),
    A = q(),
    l = H(),
    O = J(),
    u = a(() => o.usuarioActual),
    n = a(() => o.rol),
    t = a(() => o.sedeId),
    i = a(() => o.carreraId),
    M = a(() => o.permisos),
    y = a(() => o.puedeEditar),
    V = a(() => !o.puedeEditar),
    d = a(() => o.alcance),
    E = a(() => n.value === r.SUPER_ADMIN),
    f = a(() => n.value === r.ADMIN),
    g = a(() => n.value === r.VICERRECTOR_NACIONAL),
    C = a(() => n.value === r.VICERRECTOR_SEDE),
    _ = a(() => n.value === r.DIRECCION_ACADEMICA),
    m = a(() => n.value === r.DIRECTOR_CARRERA),
    v = a(() => n.value === r.DOCENTE),
    R = a(() => n.value === r.EVALUACIONES),
    S = a(() => n.value === r.RESPONSABLE_EVALUACIONES),
    b = a(() => d.value === 'global'),
    p = a(() => ['global', 'sede'].includes(d.value)),
    x = a(() => ['global', 'sede', 'carrera'].includes(d.value)),
    L = a(() => (t.value ? A.getSedeById(t.value) : null)),
    k = a(() => (i.value ? l.getCarreraById(i.value) : null)),
    I = a(() =>
      b.value ? A.sedesActivas : t.value ? A.sedesActivas.filter((e) => e.id === t.value) : [],
    ),
    h = a(() =>
      b.value
        ? l.carrerasActivas
        : p.value && t.value
          ? l.getCarrerasBySede(t.value)
          : m.value && i.value
            ? l.carrerasActivas.filter((e) => e.id === i.value && e.sede_id === t.value)
            : [],
    ),
    D = a(() => {
      const e = O.asignaturas
      if (b.value) return e
      if (p.value && t.value) return e.filter((s) => s.sede_id === t.value)
      if (m.value) return e.filter((s) => s.carrera_id === i.value && s.sede_id === t.value)
      if (v.value) {
        const F = (u.value?.materias_asignadas || []).map((c) => (typeof c == 'object' ? c.id : c))
        return e.filter((c) => F.includes(c.id))
      }
      return []
    })
  function P(e) {
    return e ? o.tieneAccesoMateria(e.id, e.carrera_id, e.sede_id) : !1
  }
  function T(e) {
    return e ? o.puedeEditarMateria(e.id, e.carrera_id, e.sede_id) : !1
  }
  function B(e) {
    return e ? o.tieneAccesoCarrera(e.id, e.sede_id) : !1
  }
  function U(e) {
    return e ? o.tieneAccesoSede(e.id) : !1
  }
  function N() {
    return (
      {
        [r.SUPER_ADMIN]: '/admin/dashboard',
        [r.ADMIN]: '/admin/dashboard',
        [r.VICERRECTOR_NACIONAL]: '/vicerrector/dashboard',
        [r.VICERRECTOR_SEDE]: '/vicerrector-sede/dashboard',
        [r.DIRECCION_ACADEMICA]: '/direccion/dashboard',
        [r.DIRECTOR_CARRERA]: '/carrera/dashboard',
        [r.DOCENTE]: '/docente/dashboard',
        [r.EVALUACIONES]: '/evaluaciones/dashboard',
        [r.RESPONSABLE_EVALUACIONES]: '/evaluaciones/dashboard',
      }[n.value] || '/'
    )
  }
  function G() {
    const e = [{ label: 'Dashboard', icon: 'dashboard', to: N() }]
    if (v.value) return [{ label: 'Mis Asignaturas', icon: 'menu_book', to: '/documentacion' }]
    if (m.value)
      return [
        ...e,
        { label: 'Asignaturas', icon: 'menu_book', to: '/director/asignaturas' },
        { label: 'Materias Comunes', icon: 'merge_type', to: '/director/materias-comunes' },
        { label: 'Docentes', icon: 'people', to: '/director/docentes' },
        { label: 'Centro de Reportes', icon: 'assessment', to: '/director/reportes' },
        { label: 'Rol de Exámenes', icon: 'event_note', to: '/director/rol-examenes' },
        { label: 'Información Carrera', icon: 'business', to: '/director/contexto' },
        { label: 'Mallas Curriculares', icon: 'account_tree', to: '/director/mallas-curriculares' },
      ]
    if (_.value || C.value)
      return [
        ...e,
        { label: 'Carreras', icon: 'school', to: '/carreras' },
        { label: 'Asignaturas', icon: 'menu_book', to: '/director/asignaturas' },
        { label: 'Docentes', icon: 'people', to: '/director/docentes' },
        { label: 'Centro de Reportes', icon: 'assessment', to: '/director/reportes' },
        { label: 'Mallas Curriculares', icon: 'account_tree', to: '/director/mallas-curriculares' },
        { label: 'Rol de Exámenes', icon: 'event_note', to: '/director/rol-examenes' },
      ]
    if (R.value || S.value) {
      const s = [
        { label: 'Gestión de Evaluaciones', icon: 'assignment', to: '/admin/evaluaciones' },
      ]
      return (
        S.value &&
          s.push({
            label: 'Adm. Evaluaciones',
            icon: 'manage_accounts',
            to: '/admin/administracion-evaluaciones',
          }),
        s
      )
    }
    if (g.value)
      return [
        ...e,
        { label: 'Sedes', icon: 'apartment', to: '/admin/sedes' },
        { label: 'Carreras', icon: 'school', to: '/carreras' },
        { label: 'Asignaturas', icon: 'menu_book', to: '/director/asignaturas' },
        { label: 'Materias Comunes', icon: 'merge_type', to: '/director/materias-comunes' },
        { label: 'Docentes', icon: 'people', to: '/director/docentes' },
        { label: 'Centro de Reportes', icon: 'assessment', to: '/director/reportes' },
        { label: 'Mallas Curriculares', icon: 'account_tree', to: '/admin/mallas-curriculares' },
        { label: 'Rol de Exámenes', icon: 'event_note', to: '/director/rol-examenes' },
        {
          label: 'Adm. Evaluaciones',
          icon: 'manage_accounts',
          to: '/admin/administracion-evaluaciones',
        },
        { label: 'Gestión de Evaluaciones', icon: 'assignment', to: '/admin/evaluaciones' },
        { label: 'Reportes Nacionales', icon: 'analytics', to: '/vicerrector/reportes' },
      ]
    if (f.value || E.value) {
      const s = [
        ...e,
        { label: 'Usuarios', icon: 'people', to: '/admin/usuarios' },
        { label: 'Roles', icon: 'admin_panel_settings', to: '/admin/roles' },
        { label: 'Sedes', icon: 'location_city', to: '/admin/sedes' },
        { label: 'Carreras', icon: 'school', to: '/admin/carreras' },
        { label: 'Asignaturas', icon: 'menu_book', to: '/admin/asignaturas' },
        { label: 'Plan de Estudios', icon: 'layers', to: '/director/asignaturas' },
        { label: 'Grupos', icon: 'groups', to: '/admin/grupos' },
        { label: 'Docentes', icon: 'person', to: '/admin/docentes' },
        { label: 'Mallas Curriculares', icon: 'account_tree', to: '/admin/mallas-curriculares' },
        { label: 'Gestión de Evaluaciones', icon: 'assignment', to: '/admin/evaluaciones' },
        {
          label: 'Adm. Evaluaciones',
          icon: 'manage_accounts',
          to: '/admin/administracion-evaluaciones',
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
      ]
      return (
        E.value &&
          (s.push({
            label: 'Gestión Académica',
            icon: 'grid_view',
            to: '/admin/gestion-academica',
          }),
          s.push({ label: 'Sincronización', icon: 'sync', to: '/admin/sincronizacion' })),
        s
      )
    }
    return e
  }
  function w() {
    const e = { asignaturas: D.value.length, carreras: h.value.length, sedes: I.value.length }
    return (
      v.value &&
        ((e.materiasAsignadas = u.value?.materias_asignadas?.length || 0),
        (e.grupos = u.value?.grupos?.length || 0)),
      e
    )
  }
  return {
    usuario: u,
    rol: n,
    sedeId: t,
    carreraId: i,
    permisos: M,
    sedeActual: L,
    carreraActual: k,
    puedeEditar: y,
    esSoloLectura: V,
    alcance: d,
    esSuperAdmin: E,
    esAdmin: f,
    esVicerrectorNacional: g,
    esVicerrectorSede: C,
    esDireccionAcademica: _,
    esDirectorCarrera: m,
    esDocente: v,
    esEvaluaciones: R,
    tieneAccesoGlobal: b,
    tieneAccesoSede: p,
    tieneAccesoCarrera: x,
    sedesFiltradas: I,
    carrerasFiltradas: h,
    asignaturasFiltradas: D,
    puedeVerAsignatura: P,
    puedeEditarAsignatura: T,
    puedeVerCarrera: B,
    puedeVerSede: U,
    getDashboardRoute: N,
    getMenuItems: G,
    getEstadisticasRol: w,
    ROLES: r,
    PERMISOS_ROL: j,
  }
}
export { Y as u }
