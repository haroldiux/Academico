const routes = [
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
