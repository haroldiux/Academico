const routes = [
  // Login (fuera del MainLayout)
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/LoginPage.vue'),
    meta: { title: 'Iniciar Sesión', public: true }
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/IndexPage.vue'),
        meta: { title: 'Dashboard' }
      },
      // Dashboards por Rol
      {
        path: 'docente/dashboard',
        name: 'docente-dashboard',
        component: () => import('pages/dashboards/DocenteDashboard.vue'),
        meta: { title: 'Panel Docente', rol: 'DOCENTE' }
      },
      {
        path: 'carrera/dashboard',
        name: 'director-carrera-dashboard',
        component: () => import('pages/dashboards/DirectorCarreraDashboard.vue'),
        meta: { title: 'Panel Director de Carrera', rol: 'DIRECTOR_CARRERA' }
      },
      {
        path: 'direccion/dashboard',
        name: 'direccion-academica-dashboard',
        component: () => import('pages/dashboards/DireccionAcademicaDashboard.vue'),
        meta: { title: 'Panel Dirección Académica', rol: 'DIRECCION_ACADEMICA' }
      },
      {
        path: 'vicerrector-sede/dashboard',
        name: 'vicerrector-sede-dashboard',
        component: () => import('pages/dashboards/VicerrectorSedeDashboard.vue'),
        meta: { title: 'Panel Vicerrector Sede', rol: 'VICERRECTOR_SEDE' }
      },
      {
        path: 'vicerrector/dashboard',
        name: 'vicerrector-nacional-dashboard',
        component: () => import('pages/dashboards/VicerrectorNacionalDashboard.vue'),
        meta: { title: 'Panel Nacional', rol: 'VICERRECTOR_NACIONAL' }
      },
      {
        path: 'admin/dashboard',
        name: 'admin-dashboard',
        component: () => import('pages/dashboards/AdminDashboard.vue'),
        meta: { title: 'Panel Administrativo', rol: 'ADMIN' }
      },
      // Docente Routes
      {
        path: 'docente',
        children: [
          {
            path: 'clase',
            name: 'docente-clase',
            component: () => import('pages/docente/ClasePage.vue'),
            meta: { title: 'Control de Clase', rol: 'DOCENTE' }
          },
          {
            path: 'asistencia-general',
            name: 'asistencia-general',
            component: () => import('pages/docente/AsistenciaGeneralPage.vue'),
            meta: { title: 'Vista General Asistencia' }
          },
          {
            path: 'evaluaciones',
            name: 'docente-evaluaciones',
            component: () => import('pages/docente/MisEvaluacionesPage.vue'),
            meta: { title: 'Mis Evaluaciones', rol: 'DOCENTE' }
          },
          {
            path: 'reporte-asistencia',
            name: 'reporte-asistencia',
            component: () => import('pages/docente/ReporteAsistenciaPage.vue'),
            meta: { title: 'Reporte de Asistencias', rol: 'DOCENTE' }
          }
        ]
      },
      // Shared Routes
      {
        path: 'carreras',
        name: 'carreras-list',
        component: () => import('pages/admin/CarrerasPage.vue'),
        meta: { title: 'Carreras', rol: ['DIRECCION_ACADEMICA', 'VICERRECTOR_SEDE', 'VICERRECTOR_NACIONAL'] }
      },
      // Vicerrector Nacional Routes
      {
        path: 'vicerrector',
        children: [
          {
            path: 'reportes',
            name: 'reportes-nacionales',
            component: () => import('pages/vicerrector/ReportesNacionalesPage.vue'),
            meta: { title: 'Reportes Nacionales', rol: 'VICERRECTOR_NACIONAL' }
          }
        ]
      },
      // Director de Carrera Routes
      {
        path: 'director',
        children: [
          {
            path: 'docentes',
            name: 'director-docentes',
            component: () => import('pages/director/DocentesPage.vue'),
            meta: { title: 'Gestión de Docentes', rol: ['DIRECTOR_CARRERA', 'DIRECCION_ACADEMICA', 'VICERRECTOR_SEDE', 'VICERRECTOR_NACIONAL'] }
          },
          {
            path: 'rol-examenes',
            name: 'rol-examenes',
            component: () => import('pages/director/RolExamenesPage.vue'),
            meta: { title: 'Rol de Exámenes', rol: ['DIRECTOR_CARRERA', 'DIRECCION_ACADEMICA', 'VICERRECTOR_SEDE', 'VICERRECTOR_NACIONAL'] }
          },
          {
            path: 'reportes',
            name: 'director-reportes',
            component: () => import('pages/director/ReportesPage.vue'),
            meta: { title: 'Centro de Reportes', rol: ['DIRECTOR_CARRERA', 'DIRECCION_ACADEMICA', 'VICERRECTOR_SEDE', 'VICERRECTOR_NACIONAL'] }
          },
          {
            path: 'asignaturas',
            name: 'director-asignaturas',
            component: () => import('pages/director/AsignaturasDirectorPage.vue'),
            meta: { title: 'Plan de Estudios', rol: ['DIRECTOR_CARRERA', 'DIRECCION_ACADEMICA', 'VICERRECTOR_SEDE', 'VICERRECTOR_NACIONAL'] }
          },
          {
            path: 'materias-comunes',
            name: 'director-materias-comunes',
            component: () => import('pages/director/MateriasComunesPage.vue'),
            meta: { title: 'Materias Comunes', rol: ['DIRECTOR_CARRERA', 'DIRECCION_ACADEMICA', 'VICERRECTOR_SEDE', 'VICERRECTOR_NACIONAL'] }
          }
        ]
      },
      // Admin Routes
      {
        path: 'admin',
        children: [
          {
            path: 'usuarios',
            name: 'usuarios',
            component: () => import('pages/admin/UsuariosPage.vue'),
            meta: { title: 'Gestión de Usuarios' }
          },
          {
            path: 'roles',
            name: 'roles',
            component: () => import('pages/admin/RolesPage.vue'),
            meta: { title: 'Gestión de Roles' }
          },
          {
            path: 'sedes',
            name: 'sedes',
            component: () => import('pages/admin/SedesPage.vue'),
            meta: { title: 'Gestión de Sedes' }
          },
          {
            path: 'carreras',
            name: 'carreras',
            component: () => import('pages/admin/CarrerasPage.vue'),
            meta: { title: 'Gestión de Carreras' }
          },
          {
            path: 'asignaturas',
            name: 'asignaturas',
            component: () => import('pages/admin/AsignaturasPage.vue'),
            meta: { title: 'Gestión de Asignaturas' }
          },
          {
            path: 'grupos',
            name: 'grupos',
            component: () => import('pages/admin/GruposPage.vue'),
            meta: { title: 'Gestión de Grupos' }
          },
          {
            path: 'docentes',
            name: 'docentes',
            component: () => import('pages/admin/DocentesPage.vue'),
            meta: { title: 'Gestión de Docentes' }
          },
          {
            path: 'estadisticas',
            name: 'estadisticas',
            component: () => import('pages/admin/EstadisticasPage.vue'),
            meta: { title: 'Estadísticas' }
          },
          {
            path: 'configuracion',
            name: 'configuracion',
            component: () => import('pages/admin/ConfiguracionPage.vue'),
            meta: { title: 'Configuración' }
          },
          {
            path: 'evaluaciones',
            name: 'evaluaciones',
            component: () => import('pages/admin/EvaluacionesPage.vue'),
            meta: { title: 'Gestión de Evaluaciones' }
          },
          {
            path: 'reportes',
            name: 'reportes',
            component: () => import('pages/admin/ReportesPage.vue'),
            meta: { title: 'Reportes' }
          }
        ]
      },
      // Documentación
      {
        path: 'documentacion',
        children: [
          {
            path: '',
            name: 'documentacion',
            component: () => import('pages/documentacion/DocumentacionPage.vue'),
            meta: { title: 'Documentación Académica' }
          },
          {
            path: ':id',
            name: 'asignatura-edit',
            component: () => import('pages/documentacion/AsignaturaEditPage.vue'),
            meta: { title: 'Editar Asignatura' }
          },
          {
            path: ':id/unidad/:unidadId/tema/:temaId',
            name: 'tema-edit',
            component: () => import('pages/documentacion/TemaEditPage.vue'),
            meta: { title: 'Documentar Tema' }
          },
          {
            path: ':id/planificacion',
            name: 'asignatura-planificacion',
            component: () => import('pages/documentacion/PlanificacionPage.vue'),
            meta: { title: 'Planificación Semestral' }
          },
          {
            path: ':id/programa',
            name: 'programa-asignatura',
            component: () => import('pages/documentacion/ProgramaAsignaturaPage.vue'),
            meta: { title: 'Programa de Asignatura' }
          }
        ]
      },
      // Preguntas (Banco de preguntas por logro)
      {
        path: 'preguntas/:asignaturaId/:temaId/:logroId',
        name: 'preguntas',
        component: () => import('pages/preguntas/PreguntasPage.vue'),
        meta: { title: 'Banco de Preguntas' }
      }
    ],
  },

  // 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
