<template>
  <q-page class="dashboard-page">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-left">
        <p class="greeting">{{ greeting }}</p>
        <h1 class="page-title">Panel Nacional</h1>
        <p class="welcome-text">
          <span class="highlight">Vicerrectorado Nacional</span>
          <q-chip size="sm" color="green" text-color="white" class="q-ml-sm">
            <q-icon name="edit" size="14px" class="q-mr-xs" />
            Acceso Total
          </q-chip>
        </p>
      </div>
      <div class="header-right">
        <q-btn flat round icon="notifications" class="notification-btn">
          <q-badge color="red" floating rounded>{{ notificaciones }}</q-badge>
        </q-btn>
        <q-btn unelevated class="primary-btn" to="/documentacion">
          <q-icon name="edit" size="18px" class="q-mr-xs" />
          Gestionar
        </q-btn>
      </div>
    </div>

    <!-- KPIs Nacionales -->
    <div class="national-stats-grid">
      <div class="national-stat-card main">
        <div class="stat-content">
          <span class="stat-title">Progreso Nacional</span>
          <span class="stat-big-value">{{ progresoNacional }}%</span>
          <q-linear-progress 
            :value="progresoNacional / 100" 
            color="primary" 
            rounded 
            size="10px" 
            class="q-mt-md"
          />
        </div>
      </div>

      <div class="national-stat-card">
        <q-icon name="location_city" size="36px" color="purple" />
        <div class="stat-data">
          <span class="stat-value">{{ totalSedes }}</span>
          <span class="stat-label">Sedes Activas</span>
        </div>
      </div>

      <div class="national-stat-card">
        <q-icon name="school" size="36px" color="green" />
        <div class="stat-data">
          <span class="stat-value">{{ totalCarreras }}</span>
          <span class="stat-label">Carreras</span>
        </div>
      </div>

      <div class="national-stat-card">
        <q-icon name="menu_book" size="36px" color="orange" />
        <div class="stat-data">
          <span class="stat-value">{{ totalAsignaturas }}</span>
          <span class="stat-label">Asignaturas</span>
        </div>
      </div>

      <div class="national-stat-card">
        <q-icon name="people" size="36px" color="blue" />
        <div class="stat-data">
          <span class="stat-value">{{ totalDocentes }}</span>
          <span class="stat-label">Docentes</span>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="content-grid">
      <!-- Progreso por Sede -->
      <div class="main-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">
              <q-icon name="map" color="primary" class="q-mr-sm" />
              Progreso por Sede
            </h2>
            <p class="card-subtitle">Estado de documentación nacional</p>
          </div>
          <q-btn flat color="primary" icon="picture_as_pdf" label="Exportar" no-caps @click="exportarReporte" />
        </div>

        <div class="sedes-list">
          <div v-for="sede in sedesProgreso" :key="sede.id" class="sede-item" @click="irASede(sede)">
            <div class="sede-info">
              <div class="sede-avatar">{{ sede.codigo }}</div>
              <div class="sede-details">
                <span class="sede-nombre">{{ sede.nombre }}</span>
                <span class="sede-stats">{{ sede.carreras }} carreras • {{ sede.docentes }} docentes</span>
              </div>
            </div>
            <div class="sede-progress">
              <div class="progress-bar">
                <q-linear-progress 
                  :value="sede.progreso / 100" 
                  :color="sede.progreso >= 80 ? 'green' : sede.progreso >= 60 ? 'orange' : 'red'"
                  rounded size="8px"
                />
              </div>
              <span class="progress-text" :class="sede.progreso >= 80 ? 'text-green' : 'text-orange'">
                {{ sede.progreso }}%
              </span>
              <q-btn flat round dense icon="chevron_right" size="sm" />
            </div>
          </div>
        </div>
      </div>

      <!-- Panel Derecho -->
      <div class="side-panel">
        <!-- Resumen -->
        <div class="side-card summary">
          <h3 class="side-title">Resumen Nacional</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-value green">{{ asignaturasCompletas }}</span>
              <span class="summary-label">Completas</span>
            </div>
            <div class="summary-item">
              <span class="summary-value orange">{{ asignaturasEnProgreso }}</span>
              <span class="summary-label">En Progreso</span>
            </div>
            <div class="summary-item">
              <span class="summary-value red">{{ asignaturasAtrasadas }}</span>
              <span class="summary-label">Atrasadas</span>
            </div>
            <div class="summary-item">
              <span class="summary-value blue">{{ asignaturasSinIniciar }}</span>
              <span class="summary-label">Sin Iniciar</span>
            </div>
          </div>
        </div>

        <!-- Top Sedes -->
        <div class="side-card">
          <h3 class="side-title">Top 3 Sedes</h3>
          <div class="top-list">
            <div v-for="(sede, idx) in topSedes" :key="sede.id" class="top-item">
              <div class="top-medal" :class="'medal-' + (idx + 1)">
                <q-icon :name="idx === 0 ? 'emoji_events' : 'military_tech'" size="20px" />
              </div>
              <span class="top-nombre">{{ sede.nombre }}</span>
              <span class="top-valor">{{ sede.progreso }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones Rápidas -->
    <div class="actions-section">
      <h2 class="section-title">Gestión Nacional</h2>
      <div class="actions-grid">
        <router-link to="/documentacion" class="action-card">
          <div class="action-icon purple">
            <q-icon name="edit_document" size="28px" />
          </div>
          <span class="action-label">Editar Contenidos</span>
        </router-link>

        <div class="action-card" @click="generarReporteNacional">
          <div class="action-icon green">
            <q-icon name="assessment" size="28px" />
          </div>
          <span class="action-label">Reporte Nacional</span>
        </div>

        <router-link to="/admin/sedes" class="action-card">
          <div class="action-icon orange">
            <q-icon name="location_city" size="28px" />
          </div>
          <span class="action-label">Gestionar Sedes</span>
        </router-link>

        <router-link to="/admin/usuarios" class="action-card">
          <div class="action-icon blue">
            <q-icon name="manage_accounts" size="28px" />
          </div>
          <span class="action-label">Usuarios</span>
        </router-link>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePermisos } from 'src/composables/usePermisos'

const router = useRouter()
const { sedesFiltradas, carrerasFiltradas, asignaturasFiltradas } = usePermisos()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
})

const progresoNacional = ref(71)
const totalSedes = computed(() => sedesFiltradas.value.length || 9)
const totalCarreras = computed(() => carrerasFiltradas.value.length || 72)
const totalAsignaturas = computed(() => asignaturasFiltradas.value.length || 2850)
const totalDocentes = ref(890)
const notificaciones = ref(15)

const asignaturasCompletas = ref(1420)
const asignaturasEnProgreso = ref(980)
const asignaturasAtrasadas = ref(280)
const asignaturasSinIniciar = ref(170)

const sedesProgreso = ref([
  { id: 1, nombre: 'Cochabamba', codigo: 'CBB', carreras: 12, docentes: 180, progreso: 78 },
  { id: 2, nombre: 'La Paz', codigo: 'LPZ', carreras: 10, docentes: 150, progreso: 72 },
  { id: 3, nombre: 'Santa Cruz', codigo: 'SCZ', carreras: 11, docentes: 165, progreso: 68 },
  { id: 4, nombre: 'Oruro', codigo: 'ORU', carreras: 8, docentes: 95, progreso: 82 },
  { id: 5, nombre: 'Sucre', codigo: 'SUC', carreras: 9, docentes: 110, progreso: 75 },
  { id: 6, nombre: 'Potosí', codigo: 'PTS', carreras: 6, docentes: 70, progreso: 65 },
  { id: 7, nombre: 'Tarija', codigo: 'TJA', carreras: 7, docentes: 80, progreso: 70 },
  { id: 8, nombre: 'Trinidad', codigo: 'TDD', carreras: 5, docentes: 55, progreso: 58 },
  { id: 9, nombre: 'Cobija', codigo: 'CIJ', carreras: 4, docentes: 45, progreso: 52 }
])

const topSedes = computed(() => 
  [...sedesProgreso.value].sort((a, b) => b.progreso - a.progreso).slice(0, 3)
)

function irASede(sede) {
  router.push(`/sedes/${sede.id}`)
}

function exportarReporte() {
  console.log('Exportando reporte nacional...')
}

function generarReporteNacional() {
  console.log('Generando reporte nacional...')
}
</script>

<style scoped>
.dashboard-page { padding: 24px; background: var(--bg-primary); min-height: 100vh; }
.dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
.greeting { color: var(--text-muted); font-size: 0.875rem; margin: 0 0 4px 0; }
.page-title { color: var(--text-primary); font-size: 2rem; font-weight: 700; margin: 0 0 8px 0; }
.welcome-text { color: var(--text-secondary); font-size: 0.875rem; margin: 0; }
.highlight { color: var(--primary); font-weight: 600; }
.header-right { display: flex; align-items: center; gap: 12px; }
.notification-btn { color: var(--text-secondary); }
.primary-btn { background: linear-gradient(135deg, var(--primary), var(--primary-dark)) !important; color: white !important; padding: 10px 20px; border-radius: 10px; }

/* National Stats */
.national-stats-grid { display: grid; grid-template-columns: 2fr repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
@media (max-width: 1200px) { .national-stats-grid { grid-template-columns: repeat(3, 1fr); } }
.national-stat-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 16px; }
.national-stat-card.main { flex-direction: column; align-items: stretch; }
.stat-content { text-align: center; }
.stat-title { color: var(--text-muted); font-size: 0.875rem; display: block; }
.stat-big-value { color: var(--text-primary); font-size: 3.5rem; font-weight: 700; display: block; }
.stat-data { display: flex; flex-direction: column; }
.stat-value { color: var(--text-primary); font-size: 1.75rem; font-weight: 700; }
.stat-label { color: var(--text-muted); font-size: 0.875rem; }

/* Content Grid */
.content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 32px; }
@media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } }
.main-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.card-title { color: var(--text-primary); font-size: 1.125rem; font-weight: 600; margin: 0 0 4px 0; display: flex; align-items: center; }
.card-subtitle { color: var(--text-muted); font-size: 0.875rem; margin: 0; }

/* Sedes List */
.sedes-list { display: flex; flex-direction: column; gap: 12px; }
.sede-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-tertiary); border-radius: 12px; cursor: pointer; transition: all 0.2s ease; }
.sede-item:hover { border: 1px solid var(--primary); margin: -1px; }
.sede-info { display: flex; align-items: center; gap: 12px; }
.sede-avatar { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; }
.sede-details { display: flex; flex-direction: column; }
.sede-nombre { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
.sede-stats { font-size: 0.75rem; color: var(--text-muted); }
.sede-progress { display: flex; align-items: center; gap: 12px; min-width: 200px; }
.progress-bar { flex: 1; }
.progress-text { font-weight: 700; font-size: 0.875rem; min-width: 45px; }
.text-green { color: var(--accent-green); }
.text-orange { color: var(--accent-orange); }

/* Side Panel */
.side-panel { display: flex; flex-direction: column; gap: 16px; }
.side-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; padding: 20px; }
.side-title { color: var(--text-primary); font-size: 1rem; font-weight: 600; margin: 0 0 16px 0; }
.summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.summary-item { text-align: center; padding: 12px; background: var(--bg-tertiary); border-radius: 10px; }
.summary-value { display: block; font-size: 1.5rem; font-weight: 700; }
.summary-value.green { color: var(--accent-green); }
.summary-value.orange { color: var(--accent-orange); }
.summary-value.red { color: var(--accent-red); }
.summary-value.blue { color: var(--accent-blue); }
.summary-label { font-size: 0.75rem; color: var(--text-muted); }

/* Top List */
.top-list { display: flex; flex-direction: column; gap: 10px; }
.top-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--bg-tertiary); border-radius: 10px; }
.top-medal { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.top-medal.medal-1 { background: rgba(255, 215, 0, 0.2); color: #FFD700; }
.top-medal.medal-2 { background: rgba(192, 192, 192, 0.2); color: #C0C0C0; }
.top-medal.medal-3 { background: rgba(205, 127, 50, 0.2); color: #CD7F32; }
.top-nombre { flex: 1; font-size: 0.875rem; color: var(--text-primary); font-weight: 500; }
.top-valor { font-weight: 700; color: var(--accent-green); }

/* Actions */
.actions-section { margin-top: 8px; }
.section-title { color: var(--text-primary); font-size: 1.125rem; font-weight: 600; margin: 0 0 16px 0; }
.actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
@media (max-width: 900px) { .actions-grid { grid-template-columns: repeat(2, 1fr); } }
.action-card { display: flex; flex-direction: column; align-items: center; padding: 24px 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; cursor: pointer; text-decoration: none; transition: all 0.2s ease; }
.action-card:hover { border-color: var(--primary); transform: translateY(-2px); }
.action-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.action-icon.purple { background: rgba(124, 58, 237, 0.15); color: var(--primary-light); }
.action-icon.green { background: rgba(34, 197, 94, 0.15); color: var(--accent-green); }
.action-icon.orange { background: rgba(249, 115, 22, 0.15); color: var(--accent-orange); }
.action-icon.blue { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }
.action-label { color: var(--text-secondary); font-size: 0.875rem; font-weight: 500; }
</style>
