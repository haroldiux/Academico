<template>
  <router-view />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'

const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()

// Configuración: 1 hora en milisegundos
const INACTIVITY_LIMIT = 60 * 60 * 1000
let checkInterval = null
let lastActivity = Date.now()

const updateActivity = () => {
  lastActivity = Date.now()
}

const checkInactivity = () => {
  if (!authStore.isAuthenticated) return

  const timeSinceLastActivity = Date.now() - lastActivity
  if (timeSinceLastActivity > INACTIVITY_LIMIT) {
    authStore.logout()
    router.push({ name: 'login' })
    $q.notify({
      type: 'warning',
      message: 'Sesión cerrada por inactividad (1 hora sin uso).',
      position: 'top',
      timeout: 0,
      actions: [{ label: 'Entendido', color: 'white', handler: () => { /* dismiss */ } }]
    })
  }
}

onMounted(() => {
  // Inicializar tracking (Performance friendly: no ejecutar lógica pesada en cada evento)
  const events = ['mousemove', 'mousedown', 'keypress', 'touchmove', 'scroll', 'click']
  events.forEach(evt => window.addEventListener(evt, updateActivity))

  // Chequear cada 1 minuto si se cumplió el tiempo
  checkInterval = setInterval(checkInactivity, 60 * 1000)

  // Recuperar auth si existe al cargar (opcional si ya no está en authStore)
  authStore.checkAuth()
})

onUnmounted(() => {
  const events = ['mousemove', 'mousedown', 'keypress', 'touchmove', 'scroll', 'click']
  events.forEach(evt => window.removeEventListener(evt, updateActivity))
  if (checkInterval) clearInterval(checkInterval)
})
</script>
