import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const isNative = typeof window !== 'undefined' &&
  (window.location.protocol.startsWith('capacitor') || window.location.hostname === 'localhost');

const api = axios.create({
  baseURL: process.env.DEV
    ? 'http://127.0.0.1:8000/api'
    : 'https://planificacion.unitepc.edu.bo/api',
  withCredentials: !isNative,
  headers: {
    'Accept': 'application/json'
  }
})

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api

  // Interceptor para manejar expiración de sesión (401 Unauthorized)
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        const { useAuthStore } = require('src/stores/auth')
        const authStore = useAuthStore()
        authStore.logout()
        
        // Redirigir al login si no estamos ya allí
        if (window.location.hash !== '#/login' && window.location.pathname !== '/login') {
          window.location.href = '/#/login?expired=true'
        }
      }
      return Promise.reject(error)
    }
  )
})

export { api }
