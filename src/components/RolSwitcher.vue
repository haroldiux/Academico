<template>
  <div class="rol-switcher">
    <q-btn-dropdown 
      flat 
      :label="rolActual?.nombre || 'Seleccionar Rol'" 
      :color="rolActual ? 'primary' : 'grey'"
      no-caps
      class="rol-dropdown"
    >
      <q-list style="min-width: 280px;">
        <q-item-label header class="text-weight-bold">
          <q-icon name="swap_horiz" class="q-mr-sm" />
          Cambiar Rol (Dev Mode)
        </q-item-label>
        <q-separator />
        
        <q-item 
          v-for="rol in rolesDisponibles" 
          :key="rol.key" 
          clickable 
          v-close-popup 
          @click="cambiarRol(rol.key)"
          :class="{ 'bg-primary-light': authStore.rol === rol.key }"
        >
          <q-item-section avatar>
            <q-avatar :color="rol.color" text-color="white" size="36px">
              <q-icon :name="rol.icono" size="20px" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ rol.nombre }}</q-item-label>
            <q-item-label caption>{{ rol.descripcion }}</q-item-label>
          </q-item-section>
          <q-item-section side v-if="authStore.rol === rol.key">
            <q-icon name="check_circle" color="green" />
          </q-item-section>
        </q-item>

        <q-separator />
        <q-item clickable v-close-popup @click="cerrarSesion">
          <q-item-section avatar>
            <q-icon name="logout" color="red" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-red">Cerrar Sesión</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, ROLES } from 'src/stores/auth'
import { usePermisos } from 'src/composables/usePermisos'

const router = useRouter()
const authStore = useAuthStore()
const { getDashboardRoute } = usePermisos()

const rolesDisponibles = [
  { key: ROLES.SUPER_ADMIN, nombre: 'Super Admin', descripcion: 'Control total', icono: 'shield', color: 'deep-purple' },
  { key: ROLES.ADMIN, nombre: 'Admin', descripcion: 'Estadísticas especiales', icono: 'admin_panel_settings', color: 'purple' },
  { key: ROLES.VICERRECTOR_NACIONAL, nombre: 'Vicerrector Nacional', descripcion: 'Ver y editar todo', icono: 'public', color: 'blue' },
  { key: ROLES.VICERRECTOR_SEDE, nombre: 'Vicerrector Sede', descripcion: 'Ver todo de sede', icono: 'location_city', color: 'teal' },
  { key: ROLES.DIRECCION_ACADEMICA, nombre: 'Dir. Académica', descripcion: 'Ver sede (solo lectura)', icono: 'business', color: 'amber' },
  { key: ROLES.DIRECTOR_CARRERA, nombre: 'Dir. Carrera', descripcion: 'Ver y editar carrera', icono: 'school', color: 'orange' },
  { key: ROLES.DOCENTE, nombre: 'Docente', descripcion: 'Solo materias asignadas', icono: 'person', color: 'green' }
]

const rolActual = computed(() => {
  return rolesDisponibles.find(r => r.key === authStore.rol)
})

function cambiarRol(rolKey) {
  authStore.loginAs(rolKey)
  // Redirigir al dashboard correspondiente
  const dashboardRoute = getDashboardRoute()
  router.push(dashboardRoute)
}

function cerrarSesion() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.rol-switcher {
  display: flex;
  align-items: center;
}

.rol-dropdown {
  font-size: 0.875rem;
}

.bg-primary-light {
  background: rgba(124, 58, 237, 0.1);
}
</style>
