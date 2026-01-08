<template>
  <q-page class="dashboard-page">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-left">
        <p class="greeting">{{ greeting }}</p>
        <h1 class="page-title">Panel de Administración</h1>
        <p class="welcome-text">Hola, <span class="highlight">Usuario Admin</span></p>
      </div>
      <div class="header-right">
        <q-btn flat round icon="notifications" class="notification-btn">
          <q-badge color="red" floating rounded>3</q-badge>
        </q-btn>
        <q-btn unelevated class="primary-btn" to="/documentacion">
          <q-icon name="add" size="18px" class="q-mr-xs" />
          Nueva Documentación
        </q-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon purple">
          <q-icon name="people" size="24px" />
        </div>
        <p class="stat-label">Usuarios Registrados</p>
        <div class="stat-value-row">
          <span class="stat-value">{{ usuariosStore.totalUsuarios }}</span>
          <span class="stat-trend positive">↑ +12%</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <q-icon name="badge" size="24px" />
        </div>
        <p class="stat-label">Roles del Sistema</p>
        <div class="stat-value-row">
          <span class="stat-value">{{ rolesStore.totalRoles }}</span>
          <span class="stat-trend positive">Activos</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">
          <q-icon name="menu_book" size="24px" />
        </div>
        <p class="stat-label">Asignaturas</p>
        <div class="stat-value-row">
          <span class="stat-value">{{ asignaturasStore.asignaturas.length }}</span>
          <span class="stat-trend neutral">Disponibles</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon blue">
          <q-icon name="school" size="24px" />
        </div>
        <p class="stat-label">Carreras Activas</p>
        <div class="stat-value-row">
          <span class="stat-value">8</span>
          <span class="stat-trend positive">En progreso</span>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="content-grid">
      <!-- Documentación Reciente -->
      <div class="main-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Documentación Reciente</h2>
            <p class="card-subtitle">Últimas asignaturas actualizadas</p>
          </div>
          <q-btn flat class="view-all-btn" to="/documentacion" no-caps>
            Ver todas
            <q-icon name="chevron_right" size="18px" />
          </q-btn>
        </div>

        <div class="items-list">
          <div v-for="asig in asignaturasRecientes" :key="asig.id" class="list-item" @click="$router.push(`/documentacion/${asig.id}`)">
            <div class="item-icon" :style="{ background: asig.color + '20', color: asig.color }">
              <q-icon name="description" size="20px" />
            </div>
            <div class="item-info">
              <p class="item-title">{{ asig.nombre }}</p>
              <p class="item-subtitle">{{ asig.codigo }} • {{ asig.carrera }}</p>
            </div>
            <div class="item-progress">
              <q-circular-progress
                :value="asig.progreso"
                size="36px"
                :thickness="0.15"
                :color="asig.progreso >= 80 ? 'green' : asig.progreso >= 50 ? 'orange' : 'red'"
                track-color="grey-9"
              />
              <span class="progress-text">{{ asig.progreso }}%</span>
            </div>
            <q-icon name="chevron_right" size="20px" class="item-arrow" />
          </div>
        </div>
      </div>

      <!-- Resumen de Actividad -->
      <div class="side-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Progreso General</h2>
            <p class="card-subtitle">Documentación del período</p>
          </div>
          <q-btn flat round icon="calendar_today" size="sm" class="calendar-btn" />
        </div>

        <!-- Progress Ring -->
        <div class="progress-container">
          <q-circular-progress
            :value="progresoGeneral"
            size="140px"
            :thickness="0.12"
            color="primary"
            track-color="grey-9"
          >
            <div class="progress-inner">
              <span class="progress-value">{{ progresoGeneral }}%</span>
              <span class="progress-label">Completado</span>
            </div>
          </q-circular-progress>
        </div>

        <!-- Mini Stats -->
        <div class="mini-stats-grid">
          <div class="mini-stat">
            <p class="mini-stat-value green">{{ docentesActivos }}</p>
            <p class="mini-stat-label">Docentes Activos</p>
          </div>
          <div class="mini-stat">
            <p class="mini-stat-value orange">{{ documentosPendientes }}</p>
            <p class="mini-stat-label">Doc. Pendientes</p>
          </div>
          <div class="mini-stat">
            <p class="mini-stat-value purple">{{ unidadesCompletadas }}</p>
            <p class="mini-stat-label">Unidades Listas</p>
          </div>
          <div class="mini-stat">
            <p class="mini-stat-value blue">{{ evaluacionesProgramadas }}</p>
            <p class="mini-stat-label">Evaluaciones</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Accesos Rápidos -->
    <div class="quick-access-section">
      <h2 class="section-title">Accesos Rápidos</h2>
      <div class="quick-access-grid">
        <router-link to="/admin/usuarios" class="quick-access-card">
          <div class="quick-icon purple">
            <q-icon name="people" size="28px" />
          </div>
          <span class="quick-label">Usuarios</span>
        </router-link>

        <router-link to="/admin/roles" class="quick-access-card">
          <div class="quick-icon green">
            <q-icon name="admin_panel_settings" size="28px" />
          </div>
          <span class="quick-label">Roles</span>
        </router-link>

        <router-link to="/documentacion" class="quick-access-card">
          <div class="quick-icon orange">
            <q-icon name="description" size="28px" />
          </div>
          <span class="quick-label">Documentación</span>
        </router-link>

        <div class="quick-access-card disabled">
          <div class="quick-icon blue">
            <q-icon name="school" size="28px" />
          </div>
          <span class="quick-label">Carreras</span>
          <span class="quick-badge">Próx.</span>
        </div>

        <div class="quick-access-card disabled">
          <div class="quick-icon red">
            <q-icon name="quiz" size="28px" />
          </div>
          <span class="quick-label">Evaluaciones</span>
          <span class="quick-badge">Próx.</span>
        </div>

        <div class="quick-access-card disabled">
          <div class="quick-icon cyan">
            <q-icon name="settings" size="28px" />
          </div>
          <span class="quick-label">Configuración</span>
          <span class="quick-badge">Próx.</span>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useUsuariosStore } from 'src/stores/usuarios'
import { useRolesStore } from 'src/stores/roles'
import { useAsignaturasStore } from 'src/stores/asignaturas'

const usuariosStore = useUsuariosStore()
const rolesStore = useRolesStore()
const asignaturasStore = useAsignaturasStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
})

const asignaturasRecientes = computed(() => {
  const colors = ['#7C3AED', '#14B8A6', '#F97316', '#3B82F6']
  return asignaturasStore.asignaturas.slice(0, 4).map((a, i) => ({
    ...a,
    color: colors[i % colors.length],
    progreso: Math.round(Math.random() * 40 + 60) // Simulado
  }))
})

const progresoGeneral = computed(() => 72)
const docentesActivos = computed(() => usuariosStore.usuarios.filter(u => u.rol === 'DOCENTE').length || 3)
const documentosPendientes = computed(() => 5)
const unidadesCompletadas = computed(() => 12)
const evaluacionesProgramadas = computed(() => 8)
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
  background: #0a0a0b;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.greeting {
  color: #71717a;
  font-size: 0.875rem;
  margin: 0 0 4px 0;
}

.page-title {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.welcome-text {
  color: #a1a1aa;
  font-size: 0.875rem;
  margin: 0;
}

.highlight {
  color: #7C3AED;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-btn {
  color: #a1a1aa;
}

.primary-btn {
  background: linear-gradient(135deg, #7C3AED, #6D28D9) !important;
  color: white !important;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 500;
  text-transform: none;
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
  background: rgba(17, 17, 19, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
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

.stat-icon.purple { background: rgba(124, 58, 237, 0.2); color: #A78BFA; }
.stat-icon.green { background: rgba(16, 185, 129, 0.2); color: #34D399; }
.stat-icon.orange { background: rgba(249, 115, 22, 0.2); color: #FB923C; }
.stat-icon.blue { background: rgba(59, 130, 246, 0.2); color: #60A5FA; }

.stat-label {
  color: #71717a;
  font-size: 0.875rem;
  margin: 0 0 8px 0;
}

.stat-value-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.stat-value {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-trend {
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-trend.positive { color: #34D399; }
.stat-trend.negative { color: #F87171; }
.stat-trend.neutral { color: #a1a1aa; }

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
  background: rgba(17, 17, 19, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
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
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.card-subtitle {
  color: #71717a;
  font-size: 0.875rem;
  margin: 0;
}

.view-all-btn {
  color: #7C3AED !important;
  font-size: 0.875rem;
}

.calendar-btn {
  color: #71717a;
}

/* Items List */
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
  background: rgba(39, 39, 42, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.list-item:hover {
  background: rgba(39, 39, 42, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
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
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 2px 0;
}

.item-subtitle {
  color: #71717a;
  font-size: 0.75rem;
  margin: 0;
}

.item-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 40px;
}

.item-arrow {
  color: #52525b;
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
  color: white;
  font-size: 2rem;
  font-weight: 700;
}

.progress-label {
  display: block;
  color: #71717a;
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
  background: rgba(39, 39, 42, 0.5);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.mini-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.mini-stat-value.green { color: #34D399; }
.mini-stat-value.orange { color: #F97316; }
.mini-stat-value.purple { color: #A78BFA; }
.mini-stat-value.blue { color: #60A5FA; }

.mini-stat-label {
  color: #71717a;
  font-size: 0.75rem;
  margin: 4px 0 0 0;
}

/* Quick Access */
.quick-access-section {
  margin-top: 8px;
}

.section-title {
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

@media (max-width: 1200px) {
  .quick-access-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 600px) {
  .quick-access-grid { grid-template-columns: repeat(2, 1fr); }
}

.quick-access-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background: rgba(17, 17, 19, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
}

.quick-access-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.quick-access-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.quick-icon.purple { background: rgba(124, 58, 237, 0.2); color: #A78BFA; }
.quick-icon.green { background: rgba(16, 185, 129, 0.2); color: #34D399; }
.quick-icon.orange { background: rgba(249, 115, 22, 0.2); color: #FB923C; }
.quick-icon.blue { background: rgba(59, 130, 246, 0.2); color: #60A5FA; }
.quick-icon.red { background: rgba(239, 68, 68, 0.2); color: #F87171; }
.quick-icon.cyan { background: rgba(20, 184, 166, 0.2); color: #2DD4BF; }

.quick-label {
  color: #d4d4d8;
  font-size: 0.875rem;
  font-weight: 500;
}

.quick-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 6px;
  background: #3f3f46;
  border-radius: 4px;
  font-size: 10px;
  color: #a1a1aa;
}
</style>
