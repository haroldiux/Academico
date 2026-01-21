import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Guard de autenticación
  // Guard de autenticación y roles
  Router.beforeEach((to, from, next) => {
    const isPublic = to.meta?.public === true
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('auth_user')
    const user = userStr ? JSON.parse(userStr) : null

    // 1. Verificación de Login
    if (!isPublic && !token) {
      return next({ name: 'login' })
    }

    // 2. Redirección si ya está logueado
    if (to.name === 'login' && token) {
      // Redirigir al dashboard según rol (si existe lógica) o al home
      return next({ name: 'dashboard' }) // O usar user.rol para redirigir a dashboard específico
    }

    // 3. Verificación de Roles (Autorización)
    if (to.meta?.rol && user) {
      const requiredRol = to.meta.rol
      // Si el rol no coincide (y no es Super Admin, que suele poder todo)
      if (user.rol !== requiredRol && user.rol !== 'SUPER_ADMIN') {
        // Redirigir a 'unauthorized' o al dashboard con notificación
        // Por ahora, redirigimos al home/dashboard básico
        console.warn(`Acceso denegado: Se requiere ${requiredRol} pero usuario es ${user.rol}`)
        return next({ name: 'dashboard' })
      }
    }

    next()
  })

  return Router
})
