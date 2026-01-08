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
          }
        ]
      },
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
      }

    ],
  },


  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
