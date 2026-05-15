const routes = [
  // Login (fuera del MainLayout)
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/LoginPage.vue'),
    meta: { title: 'Iniciar Sesión', public: true },
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/IndexPage.vue'),
        meta: { title: 'Dashboard' },
      },
      {
        path: 'perfil',
        name: 'perfil',
        component: () => import('pages/perfil/PerfilPage.vue'),
        meta: { title: 'Mi Perfil' },
      },
      // Dashboards por Rol
      {
        path: 'docente/dashboard',
        name: 'docente-dashboard',
        component: () => import('pages/dashboards/DocenteDashboard.vue'),
        meta: { title: 'Panel Docente', rol: 'DOCENTE' },
      },
      {
        path: 'carrera/dashboard',
        name: 'director-carrera-dashboard',
        component: () => import('pages/dashboards/DirectorCarreraDashboard.vue'),
        meta: { title: 'Panel Director de Carrera', rol: 'DIRECTOR_CARRERA' },
      },
      {
        path: 'direccion/dashboard',
        name: 'direccion-academica-dashboard',
        component: () => import('pages/dashboards/DireccionAcademicaDashboard.vue'),
        meta: { title: 'Panel Dirección Académica', rol: 'DIRECCION_ACADEMICA' },
      },
      {
        path: 'vicerrector-sede/dashboard',
        name: 'vicerrector-sede-dashboard',
        component: () => import('pages/dashboards/VicerrectorSedeDashboard.vue'),
        meta: { title: 'Panel Vicerrector Sede', rol: 'VICERRECTOR_SEDE' },
      },
      {
        path: 'vicerrector/dashboard',
        name: 'vicerrector-nacional-dashboard',
        component: () => import('pages/dashboards/VicerrectorNacionalDashboard.vue'),
        meta: { title: 'Panel Nacional', rol: 'VICERRECTOR_NACIONAL' },
      },
      {
        path: 'evaluaciones/dashboard',
        name: 'evaluaciones-dashboard',
        component: () => import('pages/dashboards/EvaluacionesDashboard.vue'),
        meta: { title: 'Panel Evaluaciones', rol: 'EVALUACIONES' },
      },
      {
        path: 'admin/dashboard',
        name: 'admin-dashboard',
        component: () => import('pages/dashboards/AdminDashboard.vue'),
        meta: { title: 'Panel Administrativo', rol: 'ADMIN' },
      },
      {
        path: 'admin/explorador',
        name: 'explorador-academico',
        component: () => import('pages/admin/ExploradorAcademicoPage.vue'),
        meta: {
          title: 'Explorador Académico',
          rol: ['SUPER_ADMIN', 'VICERRECTOR_NACIONAL', 'ADMIN'],
        },
      },
      // Docente Routes
      {
        path: 'docente',
        children: [
          {
            path: 'clase',
            name: 'docente-clase',
            component: () => import('pages/docente/ClasePage.vue'),
            meta: { title: 'Control de Clase', rol: 'DOCENTE' },
          },
          {
            path: 'asistencia-general',
            name: 'asistencia-general',
            component: () => import('pages/docente/AsistenciaGeneralPage.vue'),
            meta: { title: 'Vista General Asistencia' },
          },
          {
            path: 'evaluaciones',
            name: 'docente-evaluaciones',
            component: () => import('pages/docente/MisEvaluacionesPage.vue'),
            meta: { title: 'Mis Evaluaciones', rol: 'DOCENTE' },
          },
          {
            path: 'reporte-asistencia',
            name: 'reporte-asistencia',
            component: () => import('pages/docente/ReporteAsistenciaPage.vue'),
            meta: { title: 'Reporte de Asistencias', rol: 'DOCENTE' },
          },
          {
            path: 'carpeta/:id',
            name: 'docente-carpeta',
            component: () => import('pages/docente/CarpetaPagina.vue'),
            meta: { title: 'Carpeta Docente', rol: 'DOCENTE' },
          },
        ],
      },
      // Shared Routes
      {
        path: 'carreras',
        name: 'carreras-list',
        component: () => import('pages/admin/CarrerasPage.vue'),
        meta: {
          title: 'Carreras',
          rol: ['DIRECCION_ACADEMICA', 'VICERRECTOR_SEDE', 'VICERRECTOR_NACIONAL'],
        },
      },
      // Vicerrector Nacional Routes
      {
        path: 'vicerrector',
        children: [
          {
            path: 'reportes',
            name: 'reportes-nacionales',
            component: () => import('pages/vicerrector/ReportesNacionalesPage.vue'),
            meta: { title: 'Reportes Nacionales', rol: 'VICERRECTOR_NACIONAL' },
          },
        ],
      },
      // Director de Carrera Routes
      {
        path: 'director',
        children: [
          {
            path: 'docentes',
            name: 'director-docentes',
            component: () => import('pages/director/DocentesPage.vue'),
            meta: {
              title: 'Gestión de Docentes',
              rol: [
                'DIRECTOR_CARRERA',
                'DIRECCION_ACADEMICA',
                'VICERRECTOR_SEDE',
                'VICERRECTOR_NACIONAL',
              ],
            },
          },
          {
            path: 'rol-examenes',
            name: 'rol-examenes',
            component: () => import('pages/director/RolExamenesPage.vue'),
            meta: {
              title: 'Rol de Exámenes',
              rol: [
                'DIRECTOR_CARRERA',
                'DIRECCION_ACADEMICA',
                'VICERRECTOR_SEDE',
                'VICERRECTOR_NACIONAL',
                'ADMIN',
                'SUPER_ADMIN',
              ],
            },
          },
          {
            path: 'reportes',
            name: 'director-reportes',
            component: () => import('pages/director/ReportesPage.vue'),
            meta: {
              title: 'Centro de Reportes',
              rol: [
                'DIRECTOR_CARRERA',
                'DIRECCION_ACADEMICA',
                'VICERRECTOR_SEDE',
                'VICERRECTOR_NACIONAL',
              ],
            },
          },
          {
            path: 'asignaturas',
            name: 'director-asignaturas',
            component: () => import('pages/director/AsignaturasDirectorPage.vue'),
            meta: {
              title: 'Plan de Estudios',
              rol: [
                'DIRECTOR_CARRERA',
                'DIRECCION_ACADEMICA',
                'VICERRECTOR_SEDE',
                'VICERRECTOR_NACIONAL',
                'ADMIN',
                'SUPER_ADMIN',
              ],
            },
          },
          {
            path: 'restaurar-programas',
            name: 'director-restaurar-programas',
            component: () => import('pages/director/RestaurarProgramasPage.vue'),
            meta: {
              title: 'Restaurar Programas',
              rol: [
                'DIRECTOR_CARRERA',
                'DIRECCION_ACADEMICA',
                'VICERRECTOR_SEDE',
                'VICERRECTOR_NACIONAL',
                'ADMIN',
                'SUPER_ADMIN',
              ],
            },
          },
          {
            path: 'materias-comunes',
            name: 'director-materias-comunes',
            component: () => import('pages/director/MateriasComunesPage.vue'),
            meta: {
              title: 'Materias Comunes',
              rol: [
                'DIRECTOR_CARRERA',
                'DIRECCION_ACADEMICA',
                'VICERRECTOR_SEDE',
                'VICERRECTOR_NACIONAL',
              ],
            },
          },
          {
            path: 'contexto',
            name: 'director-contexto',
            component: () => import('pages/director/CarreraContextoPage.vue'),
            meta: {
              title: 'Información de la Carrera',
              rol: [
                'DIRECTOR_CARRERA',
                'DIRECCION_ACADEMICA',
                'VICERRECTOR_SEDE',
                'VICERRECTOR_NACIONAL',
              ],
            },
          },
          {
            path: 'mallas-curriculares',
            name: 'mallas-curriculares',
            component: () => import('pages/director/MallasCurricularesPage.vue'),
            meta: {
              title: 'Mallas Curriculares',
              rol: [
                'DIRECTOR_CARRERA',
                'DIRECCION_ACADEMICA',
                'VICERRECTOR_SEDE',
                'VICERRECTOR_NACIONAL',
                'ADMIN',
                'SUPER_ADMIN',
              ],
            },
          },
        ],
      },
      // Admin Routes
      {
        path: 'admin',
        children: [
          {
            path: 'usuarios',
            name: 'usuarios',
            component: () => import('pages/admin/UsuariosPage.vue'),
            meta: { title: 'Gestión de Usuarios' },
          },
          {
            path: 'roles',
            name: 'roles',
            component: () => import('pages/admin/RolesPage.vue'),
            meta: { title: 'Gestión de Roles' },
          },
          {
            path: 'sedes',
            name: 'sedes',
            component: () => import('pages/admin/SedesPage.vue'),
            meta: { title: 'Gestión de Sedes' },
          },
          {
            path: 'carreras',
            name: 'carreras',
            component: () => import('pages/admin/CarrerasPage.vue'),
            meta: { title: 'Gestión de Carreras' },
          },
          {
            path: 'gestion-academica',
            name: 'gestion-academica',
            component: () => import('pages/admin/GestionAcademicaPage.vue'),
            meta: { title: 'Gestión Académica', rol: 'SUPER_ADMIN' },
          },
          // Rutas legacy mantenidas por compatibilidad con el menú lateral
          {
            path: 'carreras-admin',
            name: 'carreras-admin',
            component: () => import('pages/admin/crud/CarrerasCrudPage.vue'),
            meta: { title: 'Administración de Carreras', rol: 'SUPER_ADMIN' },
          },
          {
            path: 'sedes-admin',
            name: 'sedes-admin',
            component: () => import('pages/admin/crud/SedesCrudPage.vue'),
            meta: { title: 'Administración de Sedes', rol: 'SUPER_ADMIN' },
          },
          {
            path: 'asignaturas-admin',
            name: 'asignaturas-admin',
            component: () => import('pages/admin/crud/AsignaturasCrudPage.vue'),
            meta: { title: 'Administración de Asignaturas', rol: 'SUPER_ADMIN' },
          },
          {
            path: 'grupos-admin',
            name: 'grupos-admin',
            component: () => import('pages/admin/crud/GruposCrudPage.vue'),
            meta: { title: 'Administración de Grupos', rol: 'SUPER_ADMIN' },
          },
          {
            path: 'horarios-admin',
            name: 'horarios-admin',
            component: () => import('pages/admin/crud/HorariosCrudPage.vue'),
            meta: { title: 'Administración de Horarios', rol: 'SUPER_ADMIN' },
          },
          {
            path: 'asignaturas',
            name: 'asignaturas',
            component: () => import('pages/admin/AsignaturasPage.vue'),
            meta: { title: 'Gestión de Asignaturas' },
          },
          {
            path: 'grupos',
            name: 'grupos',
            component: () => import('pages/admin/GruposPage.vue'),
            meta: { title: 'Gestión de Grupos' },
          },
          {
            path: 'docentes',
            name: 'docentes',
            component: () => import('pages/admin/DocentesPage.vue'),
            meta: { title: 'Gestión de Docentes' },
          },
          {
            path: 'estadisticas',
            name: 'estadisticas',
            component: () => import('pages/admin/EstadisticasPage.vue'),
            meta: { title: 'Estadísticas' },
          },
          {
            path: 'configuracion',
            name: 'configuracion',
            component: () => import('pages/admin/ConfiguracionPage.vue'),
            meta: { title: 'Configuración' },
          },
          {
            path: 'evaluaciones',
            name: 'evaluaciones',
            component: () => import('pages/evaluaciones/GestionEvaluacionesPage.vue'),
            meta: { title: 'Gestión de Evaluaciones' },
          },
          {
            path: 'verificador-patrones',
            name: 'admin-verificador-patrones',
            component: () => import('pages/evaluaciones/PatternVerifierPage.vue'),
            meta: {
              title: 'Verificador de Patrones',
              rol: [
                'DIRECTOR_CARRERA',
                'DIRECCION_ACADEMICA',
                'VICERRECTOR_SEDE',
                'VICERRECTOR_NACIONAL',
                'EVALUACIONES',
                'RESPONSABLE_EVALUACIONES',
                'ADMIN',
                'SUPER_ADMIN',
              ],
            },
          },
          {
            path: 'administracion-evaluaciones',
            name: 'administracion-evaluaciones',
            component: () => import('pages/admin/AdministracionEvaluacionPage.vue'),
            meta: {
              title: 'Administración de Evaluaciones',
              rol: ['VICERRECTOR_NACIONAL', 'ADMIN', 'SUPER_ADMIN'],
            },
          },
          {
            path: 'reportes',
            name: 'reportes',
            component: () => import('pages/admin/ReportesPage.vue'),
            meta: { title: 'Reportes' },
          },
          {
            path: 'comparador-backup',
            name: 'comparador-backup',
            component: () => import('pages/admin/ComparadorBackupPage.vue'),
            meta: { title: 'Comparador de Backups', rol: ['SUPER_ADMIN', 'ADMIN'] },
          },
          {
            path: 'recuperacion-manual',
            name: 'recuperacion-manual',
            component: () => import('pages/admin/RecuperacionManualPage.vue'),
            meta: { title: 'Recuperación Manual', rol: ['SUPER_ADMIN', 'ADMIN'] },
          },
          {
            path: 'mallas-curriculares',
            name: 'admin-mallas-curriculares',
            component: () => import('pages/admin/MallasCurricularesPage.vue'),
            meta: {
              title: 'Mallas Curriculares (Admin)',
              rol: ['ADMIN', 'SUPER_ADMIN', 'VICERRECTOR_NACIONAL'],
            },
          },
          {
            path: 'comparacion-asignatura',
            name: 'comparacion-asignatura',
            component: () => import('pages/admin/ComparacionAsignaturaPage.vue'),
            meta: {
              title: 'Comparación de Asignatura',
              rol: ['ADMIN', 'SUPER_ADMIN', 'VICERRECTOR_NACIONAL'],
            },
          },
          {
            path: 'sincronizacion',
            name: 'sincronizacion',
            component: () => import('pages/admin/SincronizacionPage.vue'),
            meta: {
              title: 'Sincronización Académica',
              rol: ['SUPER_ADMIN'],
            },
          },
        ],
      },
      // Documentación
      {
        path: 'documentacion',
        children: [
          {
            path: '',
            name: 'documentacion',
            component: () => import('pages/documentacion/DocumentacionPage.vue'),
            meta: { title: 'Documentación Académica' },
          },
          {
            path: ':id',
            name: 'asignatura-edit',
            component: () => import('pages/documentacion/AsignaturaEditPage.vue'),
            meta: { title: 'Editar Asignatura' },
          },
          {
            path: ':id/unidad/:unidadId/tema/:temaId',
            name: 'tema-edit',
            component: () => import('pages/documentacion/TemaEditPage.vue'),
            meta: { title: 'Documentar Tema' },
          },
          {
            path: ':id/planificacion',
            name: 'asignatura-planificacion',
            component: () => import('pages/documentacion/PlanificacionPage.vue'),
            meta: { title: 'Planificación Semestral' },
          },
          {
            path: ':id/programa',
            name: 'programa-asignatura',
            component: () => import('pages/documentacion/ProgramaAsignaturaPage.vue'),
            meta: { title: 'Programa de Asignatura' },
          },
        ],
      },
      // Preguntas (Banco de preguntas por logro)
      {
        path: 'preguntas/:asignaturaId/:temaId/:logroId',
        name: 'preguntas',
        component: () => import('pages/preguntas/PreguntasPage.vue'),
        meta: { title: 'Banco de Preguntas' },
      },
      // Evaluaciones — Rol de Exámenes
      {
        path: 'evaluaciones/rol-examenes',
        name: 'evaluaciones-rol-examenes',
        component: () => import('pages/evaluaciones/RolExamenesEvaluacionPage.vue'),
        meta: {
          title: 'Rol de Exámenes',
          rol: ['EVALUACIONES', 'ADMIN', 'SUPER_ADMIN', 'VICERRECTOR_NACIONAL'],
        },
      },
    ],
  },

  // 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
