<template>
  <q-page class="dashboard-page">
    <!-- Header con badge de Solo Lectura -->
    <div class="dashboard-header">
      <div class="header-left">
        <p class="greeting">{{ greeting }}</p>
        <h1 class="page-title">Dirección Académica</h1>
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
        <q-btn outline color="primary" icon="assessment" label="Generar Reporte" no-caps @click="generarReporte" />
      </div>
    </div>

    <!-- Stats Cards - Resumen de Sede -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon purple">
          <q-icon name="school" size="24px" />
        </div>
        <p class="stat-label">Carreras Activas</p>
        <div class="stat-value-row">
          <span class="stat-value">{{ totalCarreras }}</span>
          <span class="stat-trend neutral">En la sede</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <q-icon name="menu_book" size="24px" />
        </div>
        <p class="stat-label">Total Asignaturas</p>
        <div class="stat-value-row">
          <span class="stat-value">{{ totalAsignaturas }}</span>
          <span class="stat-trend positive">Todas las carreras</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">
          <q-icon name="people" size="24px" />
        </div>
        <p class="stat-label">Docentes Activos</p>
        <div class="stat-value-row">
          <span class="stat-value">{{ docentesActivos }}</span>
          <span class="stat-trend neutral">De la sede</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon blue">
          <q-icon name="trending_up" size="24px" />
        </div>
        <p class="stat-label">Progreso General</p>
        <div class="stat-value-row">
          <span class="stat-value">{{ progresoGeneral }}%</span>
          <span class="stat-trend" :class="progresoGeneral >= 70 ? 'positive' : 'neutral'">
            Documentación
          </span>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="content-grid">
      <!-- Progreso por Carrera -->
      <div class="main-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">
              <q-icon name="analytics" color="primary" class="q-mr-sm" />
              Progreso por Carrera
            </h2>
            <p class="card-subtitle">Estado de documentación de cada carrera</p>
          </div>
        </div>

        <div class="carreras-list">
          <div v-for="carrera in carrerasSede" :key="carrera.id" class="carrera-item">
            <div class="carrera-info">
              <div class="carrera-icon" :style="{ background: carrera.color + '20', color: carrera.color }">
                <q-icon name="school" size="20px" />
              </div>
              <div class="carrera-details">
                <span class="carrera-nombre">{{ carrera.nombre }}</span>
                <span class="carrera-stats">{{ carrera.asignaturas }} asignaturas • {{ carrera.docentes }} docentes</span>
              </div>
            </div>
            <div class="carrera-progress">
              <div class="progress-bar-container">
                <q-linear-progress
                  :value="carrera.progreso / 100"
                  :color="carrera.progreso >= 80 ? 'green' : carrera.progreso >= 50 ? 'orange' : 'red'"
                  rounded
                  size="8px"
                />
              </div>
              <span class="progress-value" :class="carrera.progreso >= 80 ? 'text-green' : 'text-orange'">
                {{ carrera.progreso }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Métricas y KPIs -->
      <div class="side-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">KPIs de la Sede</h2>
            <p class="card-subtitle">Indicadores clave</p>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <q-icon name="check_circle" size="32px" color="green" />
            <div class="kpi-info">
              <span class="kpi-value">{{ asignaturasCompletas }}</span>
              <span class="kpi-label">Asig. Completas</span>
            </div>
          </div>
          <div class="kpi-card">
            <q-icon name="pending" size="32px" color="orange" />
            <div class="kpi-info">
              <span class="kpi-value">{{ asignaturasPendientes }}</span>
              <span class="kpi-label">En Progreso</span>
            </div>
          </div>
          <div class="kpi-card">
            <q-icon name="warning" size="32px" color="red" />
            <div class="kpi-info">
              <span class="kpi-value">{{ asignaturasAtrasadas }}</span>
              <span class="kpi-label">Atrasadas</span>
            </div>
          </div>
          <div class="kpi-card">
            <q-icon name="group" size="32px" color="blue" />
            <div class="kpi-info">
              <span class="kpi-value">{{ directoresCarrera }}</span>
              <span class="kpi-label">Dir. Carrera</span>
            </div>
          </div>
        </div>

        <!-- Mini Chart Placeholder -->
        <div class="chart-placeholder">
          <q-icon name="bar_chart" size="48px" color="grey-6" />
          <p class="text-grey-6 q-mt-sm text-center">Gráfico de tendencia<br>mensual</p>
        </div>
      </div>
    </div>

    <!-- Reportes Disponibles -->
    <div class="quick-access-section">
      <h2 class="section-title">Reportes Disponibles</h2>
      <div class="reports-grid">
        <div class="report-card" @click="generarReporteGeneral">
          <div class="report-icon purple">
            <q-icon name="summarize" size="24px" />
          </div>
          <div class="report-info">
            <span class="report-title">Reporte General de Sede</span>
            <span class="report-desc">Resumen completo de todas las carreras</span>
          </div>
          <q-icon name="download" size="20px" color="grey-6" />
        </div>

        <div class="report-card" @click="generarReporteCarreras">
          <div class="report-icon green">
            <q-icon name="school" size="24px" />
          </div>
          <div class="report-info">
            <span class="report-title">Comparativo por Carrera</span>
            <span class="report-desc">Progreso y métricas comparativas</span>
          </div>
          <q-icon name="download" size="20px" color="grey-6" />
        </div>

        <div class="report-card" @click="generarReporteDocentes">
          <div class="report-icon orange">
            <q-icon name="people" size="24px" />
          </div>
          <div class="report-info">
            <span class="report-title">Estado de Docentes</span>
            <span class="report-desc">Cumplimiento por docente</span>
          </div>
          <q-icon name="download" size="20px" color="grey-6" />
        </div>

        <div class="report-card" @click="generarReportePendientes">
          <div class="report-icon red">
            <q-icon name="assignment_late" size="24px" />
          </div>
          <div class="report-info">
            <span class="report-title">Pendientes y Atrasados</span>
            <span class="report-desc">Documentación por completar</span>
          </div>
          <q-icon name="download" size="20px" color="grey-6" />
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

const totalCarreras = computed(() => carrerasFiltradas.value.length)
const totalAsignaturas = computed(() => asignaturasFiltradas.value.length)
const docentesActivos = ref(45)
const notificaciones = ref(8)
const progresoGeneral = ref(72)
const asignaturasCompletas = ref(28)
const asignaturasPendientes = ref(15)
const asignaturasAtrasadas = ref(4)
const directoresCarrera = ref(8)

const carrerasSede = ref([
  { id: 1, nombre: 'Ingeniería de Sistemas', asignaturas: 45, docentes: 12, progreso: 78, color: '#7C3AED' },
  { id: 2, nombre: 'Ingeniería Civil', asignaturas: 52, docentes: 15, progreso: 65, color: '#14B8A6' },
  { id: 3, nombre: 'Ingeniería Comercial', asignaturas: 38, docentes: 10, progreso: 82, color: '#F97316' },
  { id: 4, nombre: 'Derecho', asignaturas: 48, docentes: 14, progreso: 71, color: '#3B82F6' },
  { id: 5, nombre: 'Medicina', asignaturas: 65, docentes: 20, progreso: 58, color: '#EF4444' },
  { id: 6, nombre: 'Odontología', asignaturas: 42, docentes: 11, progreso: 75, color: '#22C55E' },
  { id: 7, nombre: 'Contaduría Pública', asignaturas: 35, docentes: 9, progreso: 88, color: '#8B5CF6' },
  { id: 8, nombre: 'Arquitectura', asignaturas: 40, docentes: 10, progreso: 62, color: '#EC4899' }
])

function generarReporte() {
  console.log('Generando reporte general...')
}

function generarReporteGeneral() {
  console.log('Reporte general de sede')
}

function generarReporteCarreras() {
  console.log('Reporte comparativo por carrera')
}

function generarReporteDocentes() {
  console.log('Reporte de docentes')
}

function generarReportePendientes() {
  console.log('Reporte de pendientes')
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

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
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

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
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

/* Carreras List */
.carreras-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.carrera-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 12px;
}

.carrera-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.carrera-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carrera-details {
  display: flex;
  flex-direction: column;
}

.carrera-nombre {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.carrera-stats {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.carrera-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 150px;
}

.progress-bar-container {
  flex: 1;
}

.progress-value {
  font-weight: 600;
  font-size: 0.875rem;
  min-width: 40px;
  text-align: right;
}

.text-green { color: var(--accent-green); }
.text-orange { color: var(--accent-orange); }

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 12px;
}

.kpi-info {
  display: flex;
  flex-direction: column;
}

.kpi-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.kpi-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  border: 1px dashed var(--border-color);
}

/* Reports Grid */
.quick-access-section {
  margin-top: 8px;
}

.section-title {
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 900px) {
  .reports-grid { grid-template-columns: 1fr; }
}

.report-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.report-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.report-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.report-icon.purple { background: rgba(124, 58, 237, 0.15); color: var(--primary-light); }
.report-icon.green { background: rgba(34, 197, 94, 0.15); color: var(--accent-green); }
.report-icon.orange { background: rgba(249, 115, 22, 0.15); color: var(--accent-orange); }
.report-icon.red { background: rgba(239, 68, 68, 0.15); color: var(--accent-red); }

.report-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.report-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.report-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
