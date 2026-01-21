<template>
  <q-page class="dashboard-wrapper">
    <!-- Componente Dinámico según Rol -->
    <component :is="currentDashboardComponent" v-if="currentDashboardComponent" />

    <!-- Fallback / Loading -->
    <div v-else class="flex flex-center full-height">
      <q-spinner-dots size="40px" color="primary" />
    </div>
  </q-page>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()

// Mapa de Componentes (Async para mejor rendimiento)
const dashboards = {
  SuperAdminDashboard: defineAsyncComponent(() => import('pages/dashboards/AdminDashboard.vue')), // Reutilizamos Admin por ahora o crear SuperAdmin específico
  AdminDashboard: defineAsyncComponent(() => import('pages/dashboards/AdminDashboard.vue')),
  VicerrectorNacionalDashboard: defineAsyncComponent(() => import('pages/dashboards/VicerrectorNacionalDashboard.vue')),
  VicerrectorSedeDashboard: defineAsyncComponent(() => import('pages/dashboards/VicerrectorSedeDashboard.vue')),
  DireccionAcademicaDashboard: defineAsyncComponent(() => import('pages/dashboards/DireccionAcademicaDashboard.vue')),
  DirectorCarreraDashboard: defineAsyncComponent(() => import('pages/dashboards/DirectorCarreraDashboard.vue')),
  DocenteDashboard: defineAsyncComponent(() => import('pages/dashboards/DocenteDashboard.vue')),
  EvaluacionesDashboard: defineAsyncComponent(() => import('pages/dashboards/AdminDashboard.vue')) // Fallback o específico
}

const currentDashboardComponent = computed(() => {
  const dashboardName = authStore.dashboard
  return dashboards[dashboardName] || dashboards['DocenteDashboard'] // Fallback seguro
})
</script>

<style scoped>
.dashboard-wrapper {
  background: var(--bg-primary);
  min-height: 100vh;
}
</style>
