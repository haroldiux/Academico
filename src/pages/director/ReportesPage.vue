<template>
  <q-page class="reportes-dashboard q-pa-md bg-grey-1">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="text-h4 text-weight-bold q-my-none text-primary">Panel de Control Académico</h4>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          Monitoreo en tiempo real del desempeño de la carrera
          <q-chip
            v-if="authStore.rol === 'DIRECCION_ACADEMICA' || authStore.rol === 'VICERRECTOR_SEDE'"
            color="primary"
            text-color="white"
            size="sm"
            icon="apartment"
            class="q-ml-sm"
          >
            {{ nombreSedeUsuario }}
          </q-chip>
        </div>
      </div>

      <div class="row q-gutter-sm">
        <!-- Filtros Globales -->
        <q-select
          v-if="mostrarFiltroSede"
          v-model="filtros.sede"
          :options="opcionesSedes"
          label="Sede"
          dense
          outlined
          bg-color="white"
          style="min-width: 150px"
          emit-value
          map-options
          @update:model-value="reloadAll"
        />

        <q-select
          v-model="filtros.carrera"
          :options="carrerasOptions"
          label="Carrera"
          dense
          outlined
          bg-color="white"
          style="min-width: 200px"
          emit-value
          map-options
          :disable="authStore.rol === 'DIRECTOR_CARRERA'"
          @update:model-value="reloadAll"
        >
          <template v-slot:prepend><q-icon name="school" /></template>
        </q-select>

        <q-select
          v-model="filtros.semana"
          :options="weekOptions"
          label="Semana Académica"
          dense
          outlined
          bg-color="white"
          style="min-width: 250px"
          emit-value
          map-options
          @update:model-value="reloadAll"
        >
          <template v-slot:prepend><q-icon name="event" /></template>
        </q-select>

        <q-btn color="primary" icon="refresh" flat round @click="reloadAll">
          <q-tooltip>Actualizar Datos</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- KPIs Section -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Total Asignaturas -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card bg-white">
          <q-card-section class="row items-center justify-between no-wrap">
            <div>
              <div class="text-h4 text-weight-bolder text-primary">
                {{ kpis.total_asignaturas }}
              </div>
              <div class="text-caption text-grey-7 text-uppercase text-weight-medium">
                Asignaturas
              </div>
            </div>
            <q-icon name="menu_book" size="40px" class="text-primary opacity-20" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Docentes Activos -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card bg-white">
          <q-card-section class="row items-center justify-between no-wrap">
            <div>
              <div class="text-h4 text-weight-bolder text-secondary">
                {{ kpis.docentes_activos }}
              </div>
              <div class="text-caption text-grey-7 text-uppercase text-weight-medium">
                Docentes Activos
              </div>
            </div>
            <q-icon name="people" size="40px" class="text-secondary opacity-20" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Cursos Atrasados -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card
          flat
          bordered
          class="kpi-card bg-white cursor-pointer hover-effect"
          @click="scrollToTab('materias', 'atrasado')"
        >
          <q-card-section class="row items-center justify-between no-wrap">
            <div>
              <div class="text-h4 text-weight-bolder text-negative">
                {{ kpis.cursos_atrasados }}
              </div>
              <div class="text-caption text-negative text-uppercase text-weight-medium">
                Cursos Atrasados
              </div>
            </div>
            <q-icon name="warning" size="40px" class="text-negative opacity-20" />
          </q-card-section>
          <q-tooltip>Ver detalle de cursos con avance &lt; 20%</q-tooltip>
        </q-card>
      </div>

    </div>

    <!-- Charts Section (Oculto a petición) -->
    <div class="row q-col-gutter-md q-mb-lg" v-if="false">
      <!-- Avance Distribution -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <div class="text-h6 text-weight-bold">Distribución de Avance</div>
            <div class="text-caption text-grey">Porcentaje de avance en silabo</div>
          </q-card-section>
          <q-card-section>
            <apexchart
              type="bar"
              height="300"
              :options="chartOptions.avance"
              :series="chartSeries.avance"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Asistencia Trend -->
      <div class="col-12 col-md-8">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <div class="text-h6 text-weight-bold">Tendencia de Asistencia Semanal</div>
            <div class="text-caption text-grey">
              Promedio de asistencia de estudiantes por semana
            </div>
          </q-card-section>
          <q-card-section>
            <apexchart
              type="area"
              height="300"
              :options="chartOptions.asistencia"
              :series="chartSeries.asistencia"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Detailed Tabs Section -->
    <q-card flat bordered>
      <q-tabs
        v-model="tabActivo"
        class="text-grey-8"
        active-color="primary"
        indicator-color="primary"
        align="left"
      >
        <q-tab name="materias" label="Detalle por Materia" icon="list" v-if="false" />
        <q-tab name="docentes" label="Detalle por Docente" icon="person" v-if="false" />
        <q-tab name="semanal" label="Informe Semanal" icon="assignment_turned_in" />
        <q-tab name="asistencias" label="Asistencias" icon="how_to_reg" v-if="false" />
        <q-tab name="auditoria" label="Auditoría 25%" icon="policy" v-if="rolPermiteAuditoria" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tabActivo" animated>
        <!-- Panel Materias -->
        <q-tab-panel name="materias" class="q-pa-md">
          <WeeklyReportTable
            :sede-id="Number(filtros.sede)"
            :carrera-id="Number(filtros.carrera)"
            :external-week="filtros.semana"
            view-mode="materia"
          />
        </q-tab-panel>

        <!-- Panel Docentes -->
        <q-tab-panel name="docentes" class="q-pa-md">
          <WeeklyReportTable
            :sede-id="Number(filtros.sede)"
            :carrera-id="Number(filtros.carrera)"
            :external-week="filtros.semana"
            view-mode="docente"
          />
        </q-tab-panel>

        <!-- Panel Semanal -->
        <q-tab-panel name="semanal">
          <WeeklyReportTable
            :sede-id="Number(filtros.sede)"
            :carrera-id="Number(filtros.carrera)"
            :external-week="filtros.semana"
          />
        </q-tab-panel>

        <!-- Panel Asistencias -->
        <q-tab-panel name="asistencias">
          <div class="text-h6 q-mb-md">Reporte de Asistencias por Materia</div>
          <p>Visualización del porcentaje de asistencia semanal por grupo.</p>
          <div class="bg-grey-2 q-pa-md rounded-borders text-center">
            <q-icon name="analytics" size="60px" color="grey-4" />
            <div class="text-grey-6">Módulo de Asistencias Detallado en construcción</div>
          </div>
        </q-tab-panel>

        <!-- Panel Auditoría -->
        <q-tab-panel name="auditoria">
          <MatrizControlInstitucional 
            :sede-id="Number(filtros.sede)"
            :carrera-id="Number(filtros.carrera)"
          />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Loading Overlay -->
    <q-inner-loading :showing="loading">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'
import { api } from 'boot/axios'
import { date } from 'quasar'
import WeeklyReportTable from 'src/components/reportes/WeeklyReportTable.vue'
import MatrizControlInstitucional from 'src/components/reportes/MatrizControlInstitucional.vue'

const authStore = useAuthStore()
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()
const route = useRoute()

// State
const loading = ref(false)
const tabActivo = ref('semanal')
const filtros = ref({
  sede: authStore.usuarioActual?.sede_id,
  carrera: authStore.carreraId || null,
  semana: '',
})

// Data
const kpis = ref({
  total_asignaturas: 0,
  docentes_activos: 0,
  cursos_atrasados: 0,
  cursos_riesgo_asistencia: 0,
})

const chartSeries = ref({
  avance: [{ name: 'Asignaturas', data: [] }],
  asistencia: [{ name: 'Asistencia Promedio', data: [] }],
})

// Chart Options (Reactive to support theme changes if needed)
const chartOptions = ref({
  avance: {
    chart: { id: 'avance-chart', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, distributed: true } },
    colors: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'], // Red, Orange, Blue, Green
    xaxis: { categories: [] },
    legend: { show: false },
  },
  asistencia: {
    chart: { id: 'asistencia-chart', toolbar: { show: false } },
    colors: ['#6366F1'],
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.1 } },
    xaxis: { type: 'category' }, // Dates will be categories
  },
})

// Computes
const mostrarFiltroSede = computed(() => {
  return ['VICERRECTOR_NACIONAL', 'SUPER_ADMIN'].includes(authStore.rol)
})

const rolPermiteAuditoria = computed(() => {
  return [
    'DIRECCION_ACADEMICA',
    'VICERRECTOR_SEDE',
    'SUPER_ADMIN',
    'VICERRECTOR_NACIONAL',
  ].includes(authStore.rol)
})

const nombreSedeUsuario = computed(() => {
  return sedesStore.sedes.find((s) => s.id === filtros.value.sede)?.nombre || ''
})

const opcionesSedes = computed(() => {
  return sedesStore.sedes.map((s) => ({ label: s.nombre, value: s.id }))
})

const carrerasOptions = computed(() => {
  return carrerasStore
    .getCarrerasBySede(filtros.value.sede)
    .map((c) => ({ label: c.nombre, value: c.id }))
})

// Helper to generate weeks (Start date: Feb 9, 2026)
const weekOptions = computed(() => {
  const options = []
  // Semester Start: Feb 9, 2026 (Monday)
  const semesterStart = new Date(2026, 1, 9)

  let d = new Date(semesterStart)
  for (let i = 1; i <= 20; i++) {
    const start = date.formatDate(d, 'YYYY-MM-DD')
    // week end: Saturday (Start + 5 days)
    const end = date.addToDate(d, { days: 5 })
    const label = `Semana ${i} (${date.formatDate(d, 'DD/MM')} - ${date.formatDate(end, 'DD/MM')})`
    options.push({ label, value: start })
    d = date.addToDate(d, { days: 7 })
  }
  return options
})

// Methods
const loadDashboardData = async () => {
  // For directors, ensure carrera is set from auth
  if (!filtros.value.carrera && authStore.rol === 'DIRECTOR_CARRERA') {
    filtros.value.carrera = authStore.carreraId
  }

  if (!filtros.value.sede) return

  loading.value = true
  try {
    const { data } = await api.get('/reportes/metrics', {
      params: {
        sede_id: filtros.value.sede,
        carrera_id: filtros.value.carrera,
        fecha_inicio: filtros.value.semana,
      },
    })

    // Update KPIs
    kpis.value = data.kpis

    // Update Charts
    chartSeries.value.avance = [
      {
        name: 'Asignaturas',
        data: data.charts.avance_distribucion.data,
      },
    ]
    chartOptions.value.avance = {
      ...chartOptions.value.avance,
      xaxis: { categories: data.charts.avance_distribucion.categories },
    }

    chartSeries.value.asistencia = [
      {
        name: 'Asistencia %',
        data: data.charts.asistencia_trend.map((i) => i.y),
      },
    ]
    chartOptions.value.asistencia = {
      ...chartOptions.value.asistencia,
      xaxis: { categories: data.charts.asistencia_trend.map((i) => i.x) },
    }
  } catch (error) {
    console.error('Error loading dashboard:', error)
  } finally {
    loading.value = false
  }
}

const reloadAll = () => {
  loadDashboardData()
}

const scrollToTab = (tabName) => {
  tabActivo.value = tabName
  // Optional: Emit event to child table/component to apply filter metrics
}

// Lifecycle
onMounted(async () => {
  await Promise.all([sedesStore.fetchSedes(), carrerasStore.fetchCarreras()])

  // Read URL params
  if (route.query.tab) {
    tabActivo.value = route.query.tab
  }
  if (route.query.sede) {
    filtros.value.sede = parseInt(route.query.sede)
  }
  if (route.query.carrera) {
    filtros.value.carrera = parseInt(route.query.carrera)
  }

  // Set default week to the first one available
  if (weekOptions.value.length > 0 && !filtros.value.semana) {
    filtros.value.semana = weekOptions.value[0].value
  }

  loadDashboardData()
})

// Watchers
watch(
  () => filtros.value.sede,
  () => {
    // Only reset carrera on sede change for non-directors and if there's no url query for carrera
    if (authStore.rol !== 'DIRECTOR_CARRERA' && !route.query.carrera) {
      filtros.value.carrera = null
    }
  },
)

// Reload detail data when tab changes isn't strictly needed for WeeklyReportTable component
// watch(tabActivo, (newTab) => { ... })
</script>

<style scoped>
.kpi-card {
  border-radius: 12px;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.opacity-20 {
  opacity: 0.15;
}

.hover-effect {
  position: relative;
  overflow: hidden;
}

.hover-effect::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: currentColor;
  opacity: 0;
  transition: opacity 0.2s;
}

.hover-effect:hover::after {
  opacity: 0.05;
}
</style>
