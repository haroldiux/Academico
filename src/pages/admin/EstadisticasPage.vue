<template>
  <q-page class="estadisticas-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">
          <q-icon name="analytics" color="purple" class="q-mr-sm" />
          Estadísticas del Sistema
        </h1>
        <p class="page-subtitle">Análisis y métricas académicas en tiempo real</p>
      </div>
      <div class="header-actions">
        <q-select
          v-model="periodoSeleccionado"
          :options="periodosOptions"
          outlined
          dense
          emit-value
          map-options
          style="min-width: 150px;"
        />
        <q-btn outline color="primary" icon="download" label="Exportar" no-caps />
      </div>
    </div>

    <!-- Filtros principales -->
    <div class="filters-section">
      <q-select
        v-model="filtros.sede"
        :options="sedesOptions"
        outlined
        dense
        label="Sede"
        emit-value
        map-options
        clearable
        style="min-width: 180px;"
      />
      <q-select
        v-model="filtros.carrera"
        :options="carrerasOptions"
        outlined
        dense
        label="Carrera"
        emit-value
        map-options
        clearable
        style="min-width: 220px;"
      />
    </div>

    <!-- KPIs Principales -->
    <div class="kpi-grid">
      <div class="kpi-card gradient-purple">
        <div class="kpi-icon">
          <q-icon name="people" size="32px" />
        </div>
        <div class="kpi-content">
          <span class="kpi-value">{{ stats.totalEstudiantes.toLocaleString() }}</span>
          <span class="kpi-label">Estudiantes Activos</span>
          <div class="kpi-change positive">
            <q-icon name="trending_up" size="14px" />
            +12% vs gestión anterior
          </div>
        </div>
      </div>

      <div class="kpi-card gradient-blue">
        <div class="kpi-icon">
          <q-icon name="school" size="32px" />
        </div>
        <div class="kpi-content">
          <span class="kpi-value">{{ stats.totalDocentes }}</span>
          <span class="kpi-label">Docentes</span>
          <div class="kpi-change positive">
            <q-icon name="trending_up" size="14px" />
            +5% vs gestión anterior
          </div>
        </div>
      </div>

      <div class="kpi-card gradient-green">
        <div class="kpi-icon">
          <q-icon name="menu_book" size="32px" />
        </div>
        <div class="kpi-content">
          <span class="kpi-value">{{ stats.totalMaterias }}</span>
          <span class="kpi-label">Materias Activas</span>
          <div class="kpi-change neutral">
            <q-icon name="remove" size="14px" />
            Sin cambios
          </div>
        </div>
      </div>

      <div class="kpi-card gradient-orange">
        <div class="kpi-icon">
          <q-icon name="groups" size="32px" />
        </div>
        <div class="kpi-content">
          <span class="kpi-value">{{ stats.totalGrupos }}</span>
          <span class="kpi-label">Grupos Activos</span>
          <div class="kpi-change positive">
            <q-icon name="trending_up" size="14px" />
            +8% vs gestión anterior
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="charts-grid">
      <!-- Estudiantes por Sede -->
      <q-card class="chart-card">
        <q-card-section>
          <div class="chart-header">
            <h3>Estudiantes por Sede</h3>
            <q-btn flat round dense icon="more_vert" size="sm" />
          </div>
          <div class="chart-content">
            <div class="bar-chart">
              <div v-for="sede in estudiantesPorSede" :key="sede.nombre" class="bar-item">
                <div class="bar-label">{{ sede.nombre }}</div>
                <div class="bar-container">
                  <div class="bar-fill" :style="{ width: sede.porcentaje + '%', background: sede.color }"></div>
                </div>
                <div class="bar-value">{{ sede.cantidad.toLocaleString() }}</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Distribución por Carrera -->
      <q-card class="chart-card">
        <q-card-section>
          <div class="chart-header">
            <h3>Distribución por Carrera</h3>
            <q-btn flat round dense icon="more_vert" size="sm" />
          </div>
          <div class="chart-content donut-wrapper">
            <div class="donut-chart">
              <svg viewBox="0 0 100 100" class="donut">
                <circle 
                  v-for="carrera in carrerasDistribucion" 
                  :key="carrera.nombre"
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  :stroke="carrera.color"
                  stroke-width="15"
                  :stroke-dasharray="carrera.dasharray"
                  :stroke-dashoffset="carrera.offset"
                  :style="{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }"
                />
              </svg>
              <div class="donut-center">
                <span class="donut-value">{{ stats.totalEstudiantes.toLocaleString() }}</span>
                <span class="donut-label">Total</span>
              </div>
            </div>
            <div class="donut-legend">
              <div v-for="carrera in carrerasDistribucion" :key="carrera.nombre" class="legend-item">
                <span class="legend-color" :style="{ background: carrera.color }"></span>
                <span class="legend-name">{{ carrera.nombre }}</span>
                <span class="legend-value">{{ carrera.porcentaje }}%</span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Progreso de Documentación -->
      <q-card class="chart-card">
        <q-card-section>
          <div class="chart-header">
            <h3>Progreso de Documentación</h3>
            <q-chip size="sm" color="green-2" text-color="green-9">{{ progresoGeneral }}% completado</q-chip>
          </div>
          <div class="chart-content">
            <div class="progress-list">
              <div v-for="item in progresoDocumentacion" :key="item.carrera" class="progress-item">
                <div class="progress-header">
                  <span class="progress-name">{{ item.carrera }}</span>
                  <span class="progress-percent">{{ item.progreso }}%</span>
                </div>
                <q-linear-progress 
                  :value="item.progreso / 100" 
                  :color="getProgressColor(item.progreso)"
                  rounded
                  size="8px"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Carga Docente -->
      <q-card class="chart-card">
        <q-card-section>
          <div class="chart-header">
            <h3>Carga Docente Promedio</h3>
            <q-btn flat round dense icon="more_vert" size="sm" />
          </div>
          <div class="chart-content">
            <div class="metric-grid">
              <div class="metric-item">
                <span class="metric-value">{{ stats.promedioGruposPorDocente }}</span>
                <span class="metric-label">Grupos/Docente</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">{{ stats.promedioHorasSemanales }}</span>
                <span class="metric-label">Horas/Semana</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">{{ stats.promedioEstudiantesPorDocente }}</span>
                <span class="metric-label">Estudiantes/Docente</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">{{ stats.promedioMateriasPorDocente }}</span>
                <span class="metric-label">Materias/Docente</span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Tabla de Rendimiento por Sede -->
    <q-card class="table-card">
      <q-card-section>
        <div class="chart-header">
          <h3>Rendimiento por Sede</h3>
          <q-btn flat color="primary" icon="download" label="Exportar Excel" size="sm" no-caps />
        </div>
        <q-table
          :rows="rendimientoPorSede"
          :columns="columnsRendimiento"
          row-key="sede"
          flat
          dense
        >
          <template v-slot:body-cell-progreso="props">
            <q-td :props="props">
              <div class="flex items-center gap-2">
                <q-linear-progress 
                  :value="props.row.progreso / 100" 
                  :color="getProgressColor(props.row.progreso)"
                  style="width: 80px;"
                  rounded
                />
                <span>{{ props.row.progreso }}%</span>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-tendencia="props">
            <q-td :props="props">
              <q-chip 
                :color="props.row.tendencia > 0 ? 'green-2' : props.row.tendencia < 0 ? 'red-2' : 'grey-3'" 
                :text-color="props.row.tendencia > 0 ? 'green-9' : props.row.tendencia < 0 ? 'red-9' : 'grey-7'"
                size="sm"
                dense
              >
                <q-icon :name="props.row.tendencia > 0 ? 'trending_up' : props.row.tendencia < 0 ? 'trending_down' : 'remove'" size="14px" class="q-mr-xs" />
                {{ props.row.tendencia > 0 ? '+' : '' }}{{ props.row.tendencia }}%
              </q-chip>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'

const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()

const periodoSeleccionado = ref('2026-1')
const filtros = ref({
  sede: null,
  carrera: null
})

const periodosOptions = [
  { label: 'Gestión 2026-I', value: '2026-1' },
  { label: 'Gestión 2025-II', value: '2025-2' },
  { label: 'Gestión 2025-I', value: '2025-1' }
]

const sedesOptions = computed(() => 
  sedesStore.sedes.map(s => ({ label: s.nombre, value: s.id }))
)

const carrerasOptions = computed(() => 
  carrerasStore.carreras.map(c => ({ label: c.nombre, value: c.id }))
)

// Estadísticas generales
const stats = ref({
  totalEstudiantes: 8547,
  totalDocentes: 245,
  totalMaterias: 186,
  totalGrupos: 423,
  promedioGruposPorDocente: 3.2,
  promedioHorasSemanales: 28,
  promedioEstudiantesPorDocente: 35,
  promedioMateriasPorDocente: 2.4
})

// Estudiantes por sede
const estudiantesPorSede = ref([
  { nombre: 'Cochabamba', cantidad: 3250, porcentaje: 100, color: '#7c3aed' },
  { nombre: 'La Paz', cantidad: 2180, porcentaje: 67, color: '#3b82f6' },
  { nombre: 'Santa Cruz', cantidad: 1450, porcentaje: 45, color: '#10b981' },
  { nombre: 'Ivirgarzama', cantidad: 890, porcentaje: 27, color: '#f59e0b' },
  { nombre: 'El Alto', cantidad: 580, porcentaje: 18, color: '#ef4444' },
  { nombre: 'Oruro', cantidad: 197, porcentaje: 6, color: '#ec4899' }
])

// Distribución por carrera (para gráfico donut)
const carrerasDistribucion = computed(() => {
  const data = [
    { nombre: 'Medicina', porcentaje: 35, color: '#7c3aed' },
    { nombre: 'Ing. Sistemas', porcentaje: 22, color: '#3b82f6' },
    { nombre: 'Derecho', porcentaje: 18, color: '#10b981' },
    { nombre: 'Administración', porcentaje: 15, color: '#f59e0b' },
    { nombre: 'Otros', porcentaje: 10, color: '#6b7280' }
  ]
  
  let offset = 0
  return data.map(item => {
    const dasharray = (item.porcentaje / 100) * 251.2 // 2 * PI * 40
    const result = {
      ...item,
      dasharray: `${dasharray} ${251.2 - dasharray}`,
      offset: -offset
    }
    offset += dasharray
    return result
  })
})

// Progreso de documentación
const progresoDocumentacion = ref([
  { carrera: 'Medicina', progreso: 85 },
  { carrera: 'Ing. de Sistemas', progreso: 72 },
  { carrera: 'Derecho', progreso: 68 },
  { carrera: 'Administración', progreso: 54 },
  { carrera: 'Contaduría', progreso: 45 }
])

const progresoGeneral = computed(() => {
  const total = progresoDocumentacion.value.reduce((sum, item) => sum + item.progreso, 0)
  return Math.round(total / progresoDocumentacion.value.length)
})

// Rendimiento por sede
const rendimientoPorSede = ref([
  { sede: 'Cochabamba', estudiantes: 3250, docentes: 98, grupos: 156, progreso: 78, tendencia: 12 },
  { sede: 'La Paz', estudiantes: 2180, docentes: 65, grupos: 104, progreso: 72, tendencia: 8 },
  { sede: 'Santa Cruz', estudiantes: 1450, docentes: 42, grupos: 68, progreso: 65, tendencia: 5 },
  { sede: 'Ivirgarzama', estudiantes: 890, docentes: 24, grupos: 42, progreso: 58, tendencia: -2 },
  { sede: 'El Alto', estudiantes: 580, docentes: 12, grupos: 35, progreso: 45, tendencia: 15 },
  { sede: 'Oruro', estudiantes: 197, docentes: 4, grupos: 18, progreso: 35, tendencia: 0 }
])

const columnsRendimiento = [
  { name: 'sede', label: 'Sede', field: 'sede', align: 'left', sortable: true },
  { name: 'estudiantes', label: 'Estudiantes', field: 'estudiantes', align: 'right', sortable: true, format: val => val.toLocaleString() },
  { name: 'docentes', label: 'Docentes', field: 'docentes', align: 'right', sortable: true },
  { name: 'grupos', label: 'Grupos', field: 'grupos', align: 'right', sortable: true },
  { name: 'progreso', label: 'Documentación', field: 'progreso', align: 'left', sortable: true },
  { name: 'tendencia', label: 'Tendencia', field: 'tendencia', align: 'center', sortable: true }
]

function getProgressColor(value) {
  if (value >= 70) return 'green'
  if (value >= 50) return 'orange'
  return 'red'
}
</script>

<style scoped>
.estadisticas-page {
  padding: 24px;
  background: var(--bg-primary);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
}

.page-subtitle {
  color: var(--text-secondary);
  margin: 4px 0 0 0;
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

/* KPI Cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.kpi-card {
  padding: 24px;
  border-radius: 16px;
  color: white;
  display: flex;
  align-items: center;
  gap: 20px;
}

.gradient-purple { background: linear-gradient(135deg, #7c3aed, #5b21b6); }
.gradient-blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.gradient-green { background: linear-gradient(135deg, #10b981, #059669); }
.gradient-orange { background: linear-gradient(135deg, #f59e0b, #d97706); }

.kpi-icon {
  width: 60px;
  height: 60px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-content {
  flex: 1;
}

.kpi-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
}

.kpi-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.kpi-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  margin-top: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  width: fit-content;
}

.kpi-change.positive { background: rgba(255,255,255,0.2); }
.kpi-change.neutral { background: rgba(255,255,255,0.15); }

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Bar Chart */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bar-item {
  display: grid;
  grid-template-columns: 100px 1fr 60px;
  align-items: center;
  gap: 12px;
}

.bar-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.bar-container {
  height: 12px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease;
}

.bar-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
}

/* Donut Chart */
.donut-wrapper {
  display: flex;
  align-items: center;
  gap: 24px;
}

.donut-chart {
  position: relative;
  width: 160px;
  height: 160px;
}

.donut {
  width: 100%;
  height: 100%;
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.donut-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.donut-label {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.donut-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-name {
  flex: 1;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.legend-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Progress List */
.progress-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
}

.progress-name {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.progress-percent {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Metric Grid */
.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.metric-item {
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  text-align: center;
}

.metric-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.metric-label {
  font-size: 0.7rem;
  color: var(--text-muted);
}

/* Table Card */
.table-card {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

@media (max-width: 1200px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-grid { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .kpi-grid { grid-template-columns: 1fr; }
  .donut-wrapper { flex-direction: column; }
}
</style>
