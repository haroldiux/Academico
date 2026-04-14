import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const isNative =
  typeof window !== 'undefined' &&
  (window.location.protocol.startsWith('capacitor') || window.location.hostname === 'localhost')

const resolveApiBaseUrl = () => {
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL
  }

  if (process.env.DEV) {
    return 'http://127.0.0.1:8000/api'
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin.replace(/\/$/, '')}/api`
  }

  return '/api'
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: !isNative,
  headers: {
    Accept: 'application/json',
  },
})

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api

  // Interceptor para manejar expiración de sesión (401 Unauthorized)
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        // Importación dinámica para evitar dependencia circular y corregir error 'require' en el navegador
        const { useAuthStore } = await import('src/stores/auth')
        const authStore = useAuthStore()
        authStore.logout()

        // Redirigir al login si no estamos ya allí
        const currentPath = window.location.hash || window.location.pathname
        if (!currentPath.includes('/login') && !currentPath.includes('login')) {
          window.location.href = '/#/login?expired=true'
        }
      }
      return Promise.reject(error)
    },
  )
})

export { api }
