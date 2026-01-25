<template>
  <q-page class="dashboard-page">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-left">
        <p class="greeting">{{ greeting }}</p>
        <h1 class="page-title">Mi Panel Docente</h1>
        <p class="welcome-text">
          Bienvenido, <span class="highlight">{{ authStore.nombreCompleto }}</span>
          <q-chip size="sm" color="primary" text-color="white" class="q-ml-sm">
            {{ sedeActual?.nombre || 'Sin sede' }}
          </q-chip>
        </p>
      </div>
      <div class="header-right">
        <q-btn flat round icon="notifications" class="notification-btn">
          <q-badge color="red" floating rounded>{{ notificaciones }}</q-badge>
        </q-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon purple">
          <q-icon name="menu_book" size="24px" />
        </div>
        <p class="stat-label">Materias Asignadas</p>
        <div class="stat-value-row">
          <span class="stat-value">{{ materiasAsignadas }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <q-icon name="groups" size="24px" />
        </div>
        <p class="stat-label">Grupos a Cargo</p>
        <div class="stat-value-row">
          <span class="stat-value">{{ grupos.length }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">
          <q-icon name="pending_actions" size="24px" />
        </div>
        <p class="stat-label">Documentación Pendiente</p>
        <div class="stat-value-row">
          <span class="stat-value">{{ documentacionPendiente }}</span>
          <span class="stat-trend" :class="documentacionPendiente > 0 ? 'negative' : 'positive'">
            {{ documentacionPendiente > 0 ? 'Por completar' : '¡Al día!' }}
          </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon blue">
          <q-icon name="check_circle" size="24px" />
        </div>
        <p class="stat-label">Progreso General</p>
        <div class="stat-value-row">
          <span class="stat-value">{{ progresoGeneral }}%</span>
          <span class="stat-trend" :class="progresoGeneral >= 80 ? 'positive' : 'neutral'">
            {{ progresoGeneral >= 80 ? 'Excelente' : 'En progreso' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="content-grid">
      <!-- Mis Materias -->
      <div class="main-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">
              <q-icon name="school" color="primary" class="q-mr-sm" />
              Mis Materias Asignadas
            </h2>
            <p class="card-subtitle">Materias que puedes ver y editar</p>
          </div>
          <q-btn flat class="view-all-btn" to="/documentacion" no-caps>
            Ver todas
            <q-icon name="chevron_right" size="18px" />
          </q-btn>
        </div>

        <div v-if="asignaturasFiltradas.length === 0" class="empty-state">
          <q-icon name="folder_open" size="64px" color="grey-5" />
          <p class="text-grey-6 q-mt-md">No tienes materias asignadas actualmente</p>
        </div>

        <div v-else class="items-list">
          <div
            v-for="asig in asignaturasFiltradas.slice(0, 5)"
            :key="asig.id"
            class="list-item"
            @click="$router.push(`/documentacion/${asig.id}`)"
          >
            <div class="item-icon" style="background: rgba(124, 58, 237, 0.15); color: var(--primary);">
              <q-icon name="description" size="20px" />
            </div>
            <div class="item-info">
              <p class="item-title">{{ asig.nombre }}</p>
              <p class="item-subtitle">{{ asig.codigo }} • {{ asig.semestre }}° Semestre</p>
            </div>
            <div class="item-progress">
              <q-circular-progress
                :value="asig.progreso || 0"
                size="36px"
                :thickness="0.15"
                :color="(asig.progreso || 0) >= 80 ? 'green' : (asig.progreso || 0) >= 50 ? 'orange' : 'red'"
                track-color="grey-8"
              />
              <span class="progress-text">{{ asig.progreso || 0 }}%</span>
            </div>
            <q-icon name="edit" size="20px" color="primary" />
          </div>
        </div>
      </div>

      <!-- Resumen de Actividad -->
      <div class="side-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Mi Progreso</h2>
            <p class="card-subtitle">Documentación del período</p>
          </div>
        </div>

        <!-- Progress Ring -->
        <div class="progress-container">
          <q-circular-progress
            :value="progresoGeneral"
            size="140px"
            :thickness="0.12"
            :color="progresoGeneral >= 80 ? 'green' : progresoGeneral >= 50 ? 'orange' : 'red'"
            track-color="grey-8"
          >
            <div class="progress-inner">
              <span class="progress-value">{{ progresoGeneral }}%</span>
              <span class="progress-label">Completado</span>
            </div>
          </q-circular-progress>
        </div>

        <!-- Desglose -->
        <div class="mini-stats-grid">
          <div class="mini-stat">
            <p class="mini-stat-value green">{{ temasCompletados }}</p>
            <p class="mini-stat-label">Temas Listos</p>
          </div>
          <div class="mini-stat">
            <p class="mini-stat-value orange">{{ temasPendientes }}</p>
            <p class="mini-stat-label">Pendientes</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Accesos Rápidos -->
    <div class="quick-access-section">
      <h2 class="section-title">Acciones Rápidas</h2>
      <div class="quick-access-grid-3">
        <router-link to="/documentacion" class="quick-access-card">
          <div class="quick-icon purple">
            <q-icon name="edit_document" size="28px" />
          </div>
          <span class="quick-label">Documentar Tema</span>
        </router-link>

        <div class="quick-access-card" @click="generarPDF">
          <div class="quick-icon green">
            <q-icon name="picture_as_pdf" size="28px" />
          </div>
          <span class="quick-label">Generar PDF</span>
        </div>

        <router-link to="/perfil" class="quick-access-card">
          <div class="quick-icon blue">
            <q-icon name="person" size="28px" />
          </div>
          <span class="quick-label">Mi Perfil</span>
        </router-link>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useSedesStore } from 'src/stores/sedes'

const authStore = useAuthStore()
const sedesStore = useSedesStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
})

// Datos directamente del usuario logueado
const misAsignaturas = computed(() => {
    // Check nested first
    if (authStore.usuarioActual?.docente?.asignaturas) return authStore.usuarioActual.docente.asignaturas;
    // Fallback?
    return authStore.usuarioActual?.materias_asignadas || [];
})

const misGrupos = computed(() => {
    // Check nested first
    if (authStore.usuarioActual?.docente?.grupos) return authStore.usuarioActual.docente.grupos;
    // Fallback
    return authStore.usuarioActual?.grupos || [];
})

// Sede del docente
const sedeActual = computed(() => {
  // First try nested object from backend (fixed in AuthController)
  if (authStore.usuarioActual?.docente?.sede) {
    return authStore.usuarioActual.docente.sede
  }

  // Fallback to store logic
  const sedeId = authStore.usuarioActual?.sede_id
  if (!sedeId) return null
  return sedesStore.sedes.find(s => s.id === sedeId)
})

// Estadísticas
const materiasAsignadas = computed(() => misAsignaturas.value.length)
const grupos = computed(() => misGrupos.value)
const notificaciones = ref(2)
const documentacionPendiente = computed(() => misAsignaturas.value.filter(a => (a.progreso || 0) < 100).length)
const progresoGeneral = computed(() => {
  if (misAsignaturas.value.length === 0) return 0
  const total = misAsignaturas.value.reduce((sum, a) => sum + (a.progreso || 0), 0)
  return Math.round(total / misAsignaturas.value.length)
})
const temasCompletados = computed(() => {
  return misAsignaturas.value.reduce((sum, a) => sum + (a.estadisticas?.completados || 0), 0)
})
const temasPendientes = computed(() => {
  return misAsignaturas.value.reduce((sum, a) => sum + (a.estadisticas?.pendientes || 0), 0)
})

// Para el listado (usamos directamente las del authStore)
const asignaturasFiltradas = misAsignaturas

function generarPDF() {
  // TODO: Implementar generación de PDF
  console.log('Generando PDF...')
}
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
  background: var(--bg-primary);
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.greeting {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0 0 4px 0;
}

.page-title {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.welcome-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.highlight {
  color: var(--primary);
  font-weight: 600;
}

.notification-btn {
  color: var(--text-secondary);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .stats-grid { grid-template-columns: 1fr; }
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.stat-icon.purple { background: rgba(124, 58, 237, 0.15); color: var(--primary-light); }
.stat-icon.green { background: rgba(34, 197, 94, 0.15); color: var(--accent-green); }
.stat-icon.orange { background: rgba(249, 115, 22, 0.15); color: var(--accent-orange); }
.stat-icon.blue { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0 0 8px 0;
}

.stat-value-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.stat-value {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-trend {
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-trend.positive { color: var(--accent-green); }
.stat-trend.negative { color: var(--accent-red); }
.stat-trend.neutral { color: var(--text-secondary); }

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

@media (max-width: 1024px) {
  .content-grid { grid-template-columns: 1fr; }
}

.main-card, .side-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.card-title {
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
}

.card-subtitle {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0;
}

.view-all-btn {
  color: var(--primary) !important;
}

.empty-state {
  text-align: center;
  padding: 48px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.list-item:hover {
  border-color: var(--primary);
  background: var(--bg-hover);
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-info {
  flex: 1;
}

.item-title {
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 2px 0;
}

.item-subtitle {
  color: var(--text-muted);
  font-size: 0.75rem;
  margin: 0;
}

.item-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 40px;
}

/* Side Card */
.progress-container {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

.progress-inner {
  text-align: center;
}

.progress-value {
  display: block;
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
}

.progress-label {
  display: block;
  color: var(--text-muted);
  font-size: 0.75rem;
  margin-top: 4px;
}

.mini-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 24px;
}

.mini-stat {
  background: var(--bg-tertiary);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.mini-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.mini-stat-value.green { color: var(--accent-green); }
.mini-stat-value.orange { color: var(--accent-orange); }

.mini-stat-label {
  color: var(--text-muted);
  font-size: 0.75rem;
  margin: 4px 0 0 0;
}

/* Quick Access */
.quick-access-section {
  margin-top: 8px;
}

.section-title {
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.quick-access-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 600px) {
  .quick-access-grid-3 { grid-template-columns: 1fr; }
}

.quick-access-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}

.quick-access-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.quick-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.quick-icon.purple { background: rgba(124, 58, 237, 0.15); color: var(--primary-light); }
.quick-icon.green { background: rgba(34, 197, 94, 0.15); color: var(--accent-green); }
.quick-icon.blue { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }

.quick-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
