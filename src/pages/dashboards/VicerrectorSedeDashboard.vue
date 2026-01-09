<template>
  <q-page class="dashboard-page">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-left">
        <p class="greeting">{{ greeting }}</p>
        <h1 class="page-title">Panel Vicerrectorado</h1>
        <p class="welcome-text">
          Sede: <span class="highlight">{{ sedeActual?.nombre || 'Sede' }}</span>
          <q-chip size="sm" color="amber" text-color="black" class="q-ml-sm">
            <q-icon name="visibility" size="14px" class="q-mr-xs" />
            Solo Lectura
          </q-chip>
        </p>
      </div>
      <div class="header-right">
        <q-btn flat round icon="notifications" class="notification-btn">
          <q-badge color="red" floating rounded>{{ notificaciones }}</q-badge>
        </q-btn>
        <q-btn outline color="primary" icon="picture_as_pdf" label="Informe Ejecutivo" no-caps @click="generarInforme" />
      </div>
    </div>

    <!-- KPIs Ejecutivos -->
    <div class="kpi-executive-grid">
      <div class="kpi-executive-card main">
        <div class="kpi-content">
          <span class="kpi-title">Progreso General de Sede</span>
          <span class="kpi-big-value">{{ progresoSede }}%</span>
          <span class="kpi-description">Documentación académica</span>
        </div>
        <q-circular-progress
          :value="progresoSede"
          size="100px"
          :thickness="0.15"
          :color="progresoSede >= 70 ? 'green' : 'orange'"
          track-color="grey-8"
        />
      </div>

      <div class="kpi-executive-card">
        <q-icon name="school" size="32px" color="purple" />
        <div class="kpi-data">
          <span class="kpi-value">{{ totalCarreras }}</span>
          <span class="kpi-label">Carreras</span>
        </div>
      </div>

      <div class="kpi-executive-card">
        <q-icon name="menu_book" size="32px" color="green" />
        <div class="kpi-data">
          <span class="kpi-value">{{ totalAsignaturas }}</span>
          <span class="kpi-label">Asignaturas</span>
        </div>
      </div>

      <div class="kpi-executive-card">
        <q-icon name="people" size="32px" color="blue" />
        <div class="kpi-data">
          <span class="kpi-value">{{ totalDocentes }}</span>
          <span class="kpi-label">Docentes</span>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="content-grid-3">
      <!-- Resumen por Carrera -->
      <div class="panel-card">
        <div class="card-header">
          <h2 class="card-title">
            <q-icon name="leaderboard" color="primary" class="q-mr-sm" />
            Ranking Carreras
          </h2>
        </div>
        <div class="ranking-list">
          <div v-for="(carrera, idx) in carrerasRanking" :key="carrera.id" class="ranking-item">
            <div class="ranking-position" :class="'pos-' + (idx + 1)">{{ idx + 1 }}</div>
            <div class="ranking-info">
              <span class="ranking-nombre">{{ carrera.nombre }}</span>
              <q-linear-progress 
                :value="carrera.progreso / 100" 
                :color="carrera.progreso >= 80 ? 'green' : carrera.progreso >= 60 ? 'orange' : 'red'"
                rounded size="6px" class="q-mt-xs"
              />
            </div>
            <span class="ranking-value">{{ carrera.progreso }}%</span>
          </div>
        </div>
      </div>

      <!-- Indicadores Clave -->
      <div class="panel-card">
        <div class="card-header">
          <h2 class="card-title">
            <q-icon name="insights" color="secondary" class="q-mr-sm" />
            Indicadores Clave
          </h2>
        </div>
        <div class="indicators-grid">
          <div class="indicator-item">
            <div class="indicator-icon green">
              <q-icon name="check_circle" size="24px" />
            </div>
            <div class="indicator-data">
              <span class="indicator-value">{{ asignaturasCompletas }}</span>
              <span class="indicator-label">Completas</span>
            </div>
          </div>
          <div class="indicator-item">
            <div class="indicator-icon orange">
              <q-icon name="schedule" size="24px" />
            </div>
            <div class="indicator-data">
              <span class="indicator-value">{{ asignaturasEnProgreso }}</span>
              <span class="indicator-label">En Progreso</span>
            </div>
          </div>
          <div class="indicator-item">
            <div class="indicator-icon red">
              <q-icon name="warning" size="24px" />
            </div>
            <div class="indicator-data">
              <span class="indicator-value">{{ asignaturasAtrasadas }}</span>
              <span class="indicator-label">Atrasadas</span>
            </div>
          </div>
          <div class="indicator-item">
            <div class="indicator-icon blue">
              <q-icon name="trending_up" size="24px" />
            </div>
            <div class="indicator-data">
              <span class="indicator-value">+{{ crecimientoMensual }}%</span>
              <span class="indicator-label">vs mes anterior</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Alertas -->
      <div class="panel-card">
        <div class="card-header">
          <h2 class="card-title">
            <q-icon name="notifications_active" color="orange" class="q-mr-sm" />
            Alertas
          </h2>
        </div>
        <div class="alerts-list">
          <div v-for="alerta in alertas" :key="alerta.id" class="alert-item" :class="'alert-' + alerta.tipo">
            <q-icon :name="alerta.icono" size="20px" />
            <div class="alert-content">
              <span class="alert-title">{{ alerta.titulo }}</span>
              <span class="alert-desc">{{ alerta.descripcion }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones -->
    <div class="actions-section">
      <h2 class="section-title">Informes Disponibles</h2>
      <div class="actions-grid">
        <div class="action-card" @click="generarInformeGeneral">
          <q-icon name="summarize" size="32px" color="primary" />
          <span>Informe General</span>
        </div>
        <div class="action-card" @click="generarInformeCarreras">
          <q-icon name="school" size="32px" color="green" />
          <span>Por Carreras</span>
        </div>
        <div class="action-card" @click="generarInformeDocentes">
          <q-icon name="people" size="32px" color="orange" />
          <span>Por Docentes</span>
        </div>
        <div class="action-card" @click="generarInformePendientes">
          <q-icon name="pending_actions" size="32px" color="red" />
          <span>Pendientes</span>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePermisos } from 'src/composables/usePermisos'

const { sedeActual, carrerasFiltradas, asignaturasFiltradas } = usePermisos()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
})

const progresoSede = ref(74)
const totalCarreras = computed(() => carrerasFiltradas.value.length || 8)
const totalAsignaturas = computed(() => asignaturasFiltradas.value.length || 365)
const totalDocentes = ref(120)
const notificaciones = ref(12)
const asignaturasCompletas = ref(180)
const asignaturasEnProgreso = ref(140)
const asignaturasAtrasadas = ref(45)
const crecimientoMensual = ref(8)

const carrerasRanking = ref([
  { id: 1, nombre: 'Contaduría Pública', progreso: 92 },
  { id: 2, nombre: 'Ing. Comercial', progreso: 85 },
  { id: 3, nombre: 'Ing. Sistemas', progreso: 78 },
  { id: 4, nombre: 'Derecho', progreso: 72 },
  { id: 5, nombre: 'Odontología', progreso: 68 }
])

const alertas = ref([
  { id: 1, tipo: 'warning', icono: 'warning', titulo: '12 asignaturas atrasadas', descripcion: 'Ingeniería Civil' },
  { id: 2, tipo: 'info', icono: 'info', titulo: 'Fecha límite próxima', descripcion: 'Entrega: 15 Feb 2026' },
  { id: 3, tipo: 'success', icono: 'check', titulo: 'Meta alcanzada', descripcion: 'Contaduría: 90%+' }
])

function generarInforme() { console.log('Generando informe ejecutivo...') }
function generarInformeGeneral() { console.log('Informe general') }
function generarInformeCarreras() { console.log('Informe por carreras') }
function generarInformeDocentes() { console.log('Informe por docentes') }
function generarInformePendientes() { console.log('Informe de pendientes') }
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

.greeting { color: var(--text-muted); font-size: 0.875rem; margin: 0 0 4px 0; }
.page-title { color: var(--text-primary); font-size: 2rem; font-weight: 700; margin: 0 0 8px 0; }
.welcome-text { color: var(--text-secondary); font-size: 0.875rem; margin: 0; }
.highlight { color: var(--primary); font-weight: 600; }
.header-right { display: flex; align-items: center; gap: 12px; }
.notification-btn { color: var(--text-secondary); }

/* KPI Executive Grid */
.kpi-executive-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1200px) {
  .kpi-executive-grid { grid-template-columns: 1fr 1fr; }
}

.kpi-executive-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.kpi-executive-card.main {
  justify-content: space-between;
}

.kpi-content { display: flex; flex-direction: column; }
.kpi-title { color: var(--text-muted); font-size: 0.875rem; }
.kpi-big-value { color: var(--text-primary); font-size: 3rem; font-weight: 700; line-height: 1; }
.kpi-description { color: var(--text-secondary); font-size: 0.875rem; margin-top: 4px; }
.kpi-data { display: flex; flex-direction: column; }
.kpi-value { color: var(--text-primary); font-size: 1.75rem; font-weight: 700; }
.kpi-label { color: var(--text-muted); font-size: 0.875rem; }

/* Content Grid 3 columns */
.content-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

@media (max-width: 1200px) {
  .content-grid-3 { grid-template-columns: 1fr; }
}

.panel-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
}

.card-header { margin-bottom: 20px; }
.card-title { color: var(--text-primary); font-size: 1rem; font-weight: 600; margin: 0; display: flex; align-items: center; }

/* Ranking */
.ranking-list { display: flex; flex-direction: column; gap: 12px; }
.ranking-item { display: flex; align-items: center; gap: 12px; }
.ranking-position {
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.875rem;
  background: var(--bg-tertiary); color: var(--text-secondary);
}
.ranking-position.pos-1 { background: rgba(255, 215, 0, 0.2); color: #FFD700; }
.ranking-position.pos-2 { background: rgba(192, 192, 192, 0.2); color: #C0C0C0; }
.ranking-position.pos-3 { background: rgba(205, 127, 50, 0.2); color: #CD7F32; }
.ranking-info { flex: 1; }
.ranking-nombre { font-size: 0.875rem; color: var(--text-primary); font-weight: 500; }
.ranking-value { font-weight: 700; color: var(--accent-green); font-size: 0.875rem; }

/* Indicators */
.indicators-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.indicator-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-tertiary); border-radius: 10px; }
.indicator-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.indicator-icon.green { background: rgba(34, 197, 94, 0.15); color: var(--accent-green); }
.indicator-icon.orange { background: rgba(249, 115, 22, 0.15); color: var(--accent-orange); }
.indicator-icon.red { background: rgba(239, 68, 68, 0.15); color: var(--accent-red); }
.indicator-icon.blue { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }
.indicator-data { display: flex; flex-direction: column; }
.indicator-value { font-size: 1.125rem; font-weight: 700; color: var(--text-primary); }
.indicator-label { font-size: 0.75rem; color: var(--text-muted); }

/* Alerts */
.alerts-list { display: flex; flex-direction: column; gap: 10px; }
.alert-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-radius: 10px; }
.alert-item.alert-warning { background: rgba(249, 115, 22, 0.1); color: var(--accent-orange); }
.alert-item.alert-info { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); }
.alert-item.alert-success { background: rgba(34, 197, 94, 0.1); color: var(--accent-green); }
.alert-content { display: flex; flex-direction: column; }
.alert-title { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
.alert-desc { font-size: 0.75rem; color: var(--text-secondary); }

/* Actions */
.actions-section { margin-top: 8px; }
.section-title { color: var(--text-primary); font-size: 1.125rem; font-weight: 600; margin: 0 0 16px 0; }
.actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
@media (max-width: 900px) { .actions-grid { grid-template-columns: repeat(2, 1fr); } }
.action-card {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 24px; background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 16px; cursor: pointer; transition: all 0.2s ease;
}
.action-card:hover { border-color: var(--primary); transform: translateY(-2px); }
.action-card span { color: var(--text-secondary); font-size: 0.875rem; font-weight: 500; }
</style>
