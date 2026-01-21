<template>
  <q-layout view="lHh LpR lFf">
    <!-- Header -->
    <q-header class="header-dark">
      <q-toolbar class="toolbar-content">
        <q-btn flat dense round icon="chevron_left" class="toggle-btn" @click="toggleLeftDrawer" />

        <!-- Logo -->
        <div class="logo-container">
          <div class="logo-icon">
            <q-icon name="school" size="18px" />
          </div>
          <span class="logo-text">UNITEPC</span>
        </div>

        <q-space />

        <!-- Search -->
        <div class="search-box">
          <q-icon name="search" size="18px" class="search-icon" />
          <input v-model="searchQuery" type="text" placeholder="Buscar..." class="search-input" />
          <div class="search-keys">
            <kbd>⌘</kbd>
            <kbd>K</kbd>
          </div>
        </div>



        <!-- Connected Badge -->
        <div class="connected-badge">
          <span class="connected-dot"></span>
          Conectado
        </div>

        <!-- Theme Toggle -->
        <button class="theme-toggle" @click="themeStore.toggleTheme">
          <q-icon :name="themeStore.isDark ? 'light_mode' : 'dark_mode'" size="20px" />
          <q-tooltip>{{ themeStore.isDark ? 'Modo Claro' : 'Modo Oscuro' }}</q-tooltip>
        </button>

        <!-- User Avatar -->
        <q-btn flat round dense class="user-btn">
          <div class="user-avatar">{{ authStore.avatar }}</div>
          <q-menu anchor="bottom right" self="top right" class="user-menu">
            <div class="user-menu-content">
              <div class="user-menu-header">
                <div class="user-avatar-lg">{{ authStore.avatar }}</div>
                <div>
                  <p class="user-name">{{ authStore.nombreCompleto }}</p>
                  <p class="user-role">{{ rolLabel }}</p>
                </div>
              </div>
              <q-separator class="menu-separator" />
              <q-item clickable v-ripple class="menu-item">
                <q-item-section avatar><q-icon name="person" size="18px" /></q-item-section>
                <q-item-section>Mi Perfil</q-item-section>
              </q-item>
              <q-item clickable v-ripple class="menu-item">
                <q-item-section avatar><q-icon name="settings" size="18px" /></q-item-section>
                <q-item-section>Configuración</q-item-section>
              </q-item>
              <q-separator class="menu-separator" />
              <q-item clickable v-ripple class="menu-item logout" @click="handleLogout">
                <q-item-section avatar><q-icon name="logout" size="18px" /></q-item-section>
                <q-item-section>Cerrar Sesión</q-item-section>
              </q-item>
            </div>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Sidebar -->
    <q-drawer v-model="leftDrawerOpen" show-if-above :width="240" :breakpoint="1024" class="sidebar-dark">
      <div class="sidebar-content">
        <!-- User Card -->
        <div class="sidebar-user-card">
          <div class="sidebar-user-avatar">{{ authStore.avatar }}</div>
          <div class="sidebar-user-info">
            <p class="sidebar-user-name">{{ authStore.nombreCompleto }}</p>
            <p class="sidebar-user-role">{{ rolLabel }}</p>
          </div>
          <q-btn flat round dense icon="expand_more" size="sm" class="expand-btn" />
        </div>

        <!-- Navigation Dinámico -->
        <q-scroll-area class="sidebar-nav-area">
          <nav class="sidebar-nav">
            <router-link
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              custom
              v-slot="{ isActive, navigate }"
            >
              <div @click="navigate" :class="['nav-item', { 'active': isActive }]">
                <q-icon :name="item.icon" size="20px" />
                <span>{{ item.label }}</span>
                <q-chip v-if="item.badge" size="xs" color="red" text-color="white" class="q-ml-auto">
                  {{ item.badge }}
                </q-chip>
              </div>
            </router-link>

            <!-- Items deshabilitados -->
            <div v-if="!authStore.isAuthenticated" class="nav-item disabled">
              <q-icon name="login" size="20px" />
              <span>Iniciar sesión para ver opciones</span>
            </div>
          </nav>
        </q-scroll-area>

        <!-- Sede/Carrera Info -->
        <div v-if="sedeActual" class="sidebar-context">
          <q-icon name="location_on" size="16px" />
          <span>{{ sedeActual?.nombre }}</span>
        </div>

        <!-- Footer -->
        <div class="sidebar-footer">
          <div class="nav-item" @click="$router.push('/ayuda')">
            <q-icon name="help_outline" size="20px" />
            <span>Ayuda</span>
          </div>
          <div class="nav-item logout" @click="handleLogout">
            <q-icon name="logout" size="20px" />
            <span>Cerrar Sesión</span>
          </div>
        </div>
      </div>
    </q-drawer>

    <!-- Page Container -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from 'src/stores/theme'
import { useAuthStore, ROLES } from 'src/stores/auth'
import { usePermisos } from 'src/composables/usePermisos'

import { useQuasar } from 'quasar'

const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const $q = useQuasar()
const { getMenuItems, sedeActual } = usePermisos()

const leftDrawerOpen = ref(true)
const searchQuery = ref('')

// Verificar autenticación al montar
// Verificar autenticación al montar
onMounted(() => {
  authStore.checkAuth()
})

const rolLabel = computed(() => {
  const labels = {
    [ROLES.SUPER_ADMIN]: 'Super Administrador',
    [ROLES.ADMIN]: 'Administrador',
    [ROLES.VICERRECTOR_NACIONAL]: 'Vicerrector Nacional',
    [ROLES.VICERRECTOR_SEDE]: 'Vicerrector Sede',
    [ROLES.DIRECCION_ACADEMICA]: 'Dirección Académica',
    [ROLES.DIRECTOR_CARRERA]: 'Director de Carrera',
    [ROLES.DOCENTE]: 'Docente',
    [ROLES.EVALUACIONES]: 'Evaluaciones'
  }
  return labels[authStore.rol] || 'Usuario'
})

const menuItems = computed(() => getMenuItems())

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function handleLogout() {
  $q.dialog({
    title: 'Cerrar Sesión',
    message: '¿Estás seguro de que deseas salir del sistema?',
    persistent: true,
    ok: {
      label: 'Sí, Salir',
      color: 'primary',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'negative',
      flat: true
    }
  }).onOk(() => {
    authStore.logout()
    router.push('/login')
  })
}
</script>

<style scoped>
/* Header */
.header-dark {
  background: var(--bg-secondary) !important;
  border-bottom: 1px solid var(--border-color);
}

.toolbar-content {
  padding: 8px 16px;
}

.toggle-btn {
  color: var(--text-secondary);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-text {
  color: var(--text-primary);
  font-weight: 700;
  font-size: 1.1rem;
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 6px 12px;
  margin-right: 16px;
}

.search-icon {
  color: var(--text-muted);
  margin-right: 8px;
}

.search-input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 0.875rem;
  width: 160px;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-keys {
  display: flex;
  gap: 4px;
  margin-left: 12px;
}

.search-keys kbd {
  padding: 2px 6px;
  background: var(--bg-hover);
  border-radius: 4px;
  font-size: 10px;
  color: var(--text-secondary);
}

/* Connected Badge - usando variables */
.connected-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 20px;
  color: var(--accent-green);
  font-size: 0.875rem;
  margin-right: 12px;
}

.connected-dot {
  width: 8px;
  height: 8px;
  background: var(--accent-green);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Theme Toggle */
.theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 12px;
}

.theme-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--primary);
}

/* User */
.user-avatar {
  width: 36px;
  height: 36px;
  background: var(--primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-avatar-lg {
  width: 40px;
  height: 40px;
  background: var(--primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.user-menu {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 12px !important;
}

.user-menu-content {
  padding: 16px;
  min-width: 200px;
}

.user-menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.user-name {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.875rem;
  margin: 0;
}

.user-role {
  color: var(--text-muted);
  font-size: 0.75rem;
  margin: 0;
}

.menu-separator {
  background: var(--border-color) !important;
  margin: 8px 0;
}

.menu-item {
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  min-height: 40px;
}

.menu-item:hover {
  background: var(--bg-hover);
}

.menu-item.logout {
  color: var(--accent-red);
}

.menu-item.logout:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Sidebar */
.sidebar-dark {
  background: var(--bg-secondary) !important;
  border-right: 1px solid var(--border-color) !important;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin: 16px 8px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.sidebar-user-avatar {
  width: 36px;
  height: 36px;
  background: var(--primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.sidebar-user-info {
  flex: 1;
  min-width: 0;
}

.sidebar-user-name {
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user-role {
  color: var(--text-muted);
  font-size: 0.75rem;
  margin: 0;
}

.expand-btn {
  color: var(--text-muted);
}

.sidebar-nav-area {
  flex: 1;
  margin-top: 8px;
}

.sidebar-nav {
  padding: 0 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  font-weight: 500;
}

.nav-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-item.logout {
  color: var(--accent-red);
}

.nav-item.logout:hover {
  background: rgba(239, 68, 68, 0.1);
}

.nav-badge {
  margin-left: auto;
  padding: 2px 6px;
  background: var(--bg-hover);
  border-radius: 4px;
  font-size: 10px;
  color: var(--text-secondary);
}

.sidebar-context {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin: 0 8px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.sidebar-footer {
  padding: 16px 8px;
  border-top: 1px solid var(--border-color);
}
</style>
