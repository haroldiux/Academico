<template>
  <q-page class="reportes-nacionales-page">
    <!-- Header -->
    <div class="page-header q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h4 class="text-h4 text-weight-bold q-mb-xs">Reportes Nacionales</h4>
          <p class="text-grey-7 q-mb-none">Control y supervisión de reportes a nivel nacional</p>
        </div>
        <div class="row q-gutter-sm">
          <q-btn color="primary" icon="download" label="Exportar PDF" @click="exportarPDF" />
          <q-btn outline color="primary" icon="table_chart" label="Exportar Excel" @click="exportarExcel" />
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.sede"
              :options="opcionesSedes"
              label="Sede"
              outlined
              dense
              emit-value
              map-options
            >
              <template v-slot:prepend>
                <q-icon name="apartment" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.periodo"
              :options="opcionesPeriodo"
              label="Período"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.tipoReporte"
              :options="opcionesTipoReporte"
              label="Tipo de Reporte"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-md-3 flex justify-end">
            <q-btn color="primary" icon="refresh" label="Actualizar" @click="actualizarReportes" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- KPIs Nacionales -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-primary">{{ kpis.progresoGeneral }}%</div>
                <div class="text-caption text-grey-7">Progreso General</div>
              </div>
              <q-circular-progress
                :value="kpis.progresoGeneral"
                size="50px"
                :thickness="0.2"
                color="primary"
                track-color="grey-3"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-positive">{{ kpis.sedesAlDia }}</div>
                <div class="text-caption text-grey-7">Sedes al Día</div>
              </div>
              <q-icon name="check_circle" size="40px" color="positive" />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-warning">{{ kpis.sedesConRetraso }}</div>
                <div class="text-caption text-grey-7">Sedes con Retraso</div>
              </div>
              <q-icon name="warning" size="40px" color="warning" />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-info">{{ kpis.totalDocentes }}</div>
                <div class="text-caption text-grey-7">Docentes Activos</div>
              </div>
              <q-icon name="people" size="40px" color="info" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabs de Reportes -->
    <q-card flat bordered>
      <q-tabs v-model="tabActivo" class="text-grey" active-color="primary" indicator-color="primary" align="left">
        <q-tab name="sedes" label="Por Sede" icon="apartment" />
        <q-tab name="directores" label="Directores de Carrera" icon="person" />
        <q-tab name="academicos" label="Directores Académicos" icon="school" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tabActivo" animated>
        <!-- Tab: Por Sede -->
        <q-tab-panel name="sedes">
          <q-table
            :rows="reportesPorSede"
            :columns="columnasSedes"
            row-key="id"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:body-cell-progreso="props">
              <q-td :props="props">
                <div class="row items-center no-wrap q-gutter-sm">
                  <q-linear-progress
                    :value="props.row.progreso / 100"
                    :color="getColorProgreso(props.row.progreso)"
                    rounded
                    size="8px"
                    style="width: 100px"
                  />
                  <span class="text-weight-bold">{{ props.row.progreso }}%</span>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-chip
                  :color="props.row.estado === 'Al día' ? 'positive' : props.row.estado === 'Retraso' ? 'warning' : 'negative'"
                  text-color="white"
                  size="sm"
                >
                  {{ props.row.estado }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn flat round dense icon="visibility" color="primary" @click="verDetalleSede(props.row)">
                  <q-tooltip>Ver Detalle</q-tooltip>
                </q-btn>
                <q-btn flat round dense icon="download" color="grey" @click="descargarReporteSede(props.row)">
                  <q-tooltip>Descargar Reporte</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- Tab: Directores de Carrera -->
        <q-tab-panel name="directores">
          <q-table
            :rows="reportesDirectores"
            :columns="columnasDirectores"
            row-key="id"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:body-cell-director="props">
              <q-td :props="props">
                <div class="row items-center no-wrap q-gutter-sm">
                  <q-avatar size="32px" color="primary" text-color="white">
                    {{ props.row.iniciales }}
                  </q-avatar>
                  <div>
                    <div class="text-weight-medium">{{ props.row.nombre }}</div>
                    <div class="text-caption text-grey">{{ props.row.carrera }}</div>
                  </div>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-cumplimiento="props">
              <q-td :props="props">
                <q-chip
                  :color="props.row.cumplimiento >= 80 ? 'positive' : props.row.cumplimiento >= 60 ? 'warning' : 'negative'"
                  text-color="white"
                  size="sm"
                >
                  {{ props.row.cumplimiento }}%
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn flat round dense icon="visibility" color="primary" @click="verDetalleDirector(props.row)">
                  <q-tooltip>Ver Detalle</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- Tab: Directores Académicos -->
        <q-tab-panel name="academicos">
          <q-table
            :rows="reportesAcademicos"
            :columns="columnasAcademicos"
            row-key="id"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:body-cell-director="props">
              <q-td :props="props">
                <div class="row items-center no-wrap q-gutter-sm">
                  <q-avatar size="32px" color="secondary" text-color="white">
                    {{ props.row.iniciales }}
                  </q-avatar>
                  <div>
                    <div class="text-weight-medium">{{ props.row.nombre }}</div>
                    <div class="text-caption text-grey">{{ props.row.sede }}</div>
                  </div>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-carrerasSupervision="props">
              <q-td :props="props">
                <q-badge color="info" :label="props.row.carrerasSupervision + ' carreras'" />
              </q-td>
            </template>
            <template v-slot:body-cell-cumplimientoGeneral="props">
              <q-td :props="props">
                <div class="row items-center no-wrap q-gutter-sm">
                  <q-linear-progress
                    :value="props.row.cumplimientoGeneral / 100"
                    :color="getColorProgreso(props.row.cumplimientoGeneral)"
                    rounded
                    size="8px"
                    style="width: 80px"
                  />
                  <span class="text-weight-bold">{{ props.row.cumplimientoGeneral }}%</span>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn flat round dense icon="visibility" color="primary" @click="verDetalleAcademico(props.row)">
                  <q-tooltip>Ver Detalle</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Dialog Detalle -->
    <q-dialog v-model="dialogDetalle" maximized>
      <q-card>
        <q-bar class="bg-primary text-white">
          <q-icon name="info" />
          <div class="q-ml-sm">{{ detalleSeleccionado?.titulo }}</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section class="q-pa-lg">
          <div class="text-h6 q-mb-md">{{ detalleSeleccionado?.subtitulo }}</div>
          <p class="text-grey-7">Aquí se mostrará el detalle completo del reporte seleccionado.</p>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useSedesStore } from 'src/stores/sedes'

const $q = useQuasar()
const sedesStore = useSedesStore()

// State
const tabActivo = ref('sedes')
const dialogDetalle = ref(false)
const detalleSeleccionado = ref(null)

// Filtros
const filtros = ref({
  sede: 'todas',
  periodo: '2026-1',
  tipoReporte: 'todos'
})

const opcionesSedes = computed(() => [
  { label: 'Todas las Sedes', value: 'todas' },
  ...sedesStore.sedes.map(s => ({ label: s.nombre, value: s.id }))
])

const opcionesPeriodo = [
  { label: 'Gestión 2026 - I', value: '2026-1' },
  { label: 'Gestión 2025 - II', value: '2025-2' },
  { label: 'Gestión 2025 - I', value: '2025-1' }
]

const opcionesTipoReporte = [
  { label: 'Todos los Reportes', value: 'todos' },
  { label: 'Documentación', value: 'documentacion' },
  { label: 'Asistencias', value: 'asistencias' },
  { label: 'Avance Temático', value: 'avance' }
]

// KPIs
const kpis = ref({
  progresoGeneral: 72,
  sedesAlDia: 5,
  sedesConRetraso: 4,
  totalDocentes: 890
})

// Columnas
const columnasSedes = [
  { name: 'sede', label: 'Sede', field: 'nombre', align: 'left', sortable: true },
  { name: 'carreras', label: 'Carreras', field: 'carreras', align: 'center' },
  { name: 'docentes', label: 'Docentes', field: 'docentes', align: 'center' },
  { name: 'progreso', label: 'Progreso', field: 'progreso', align: 'center', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const columnasDirectores = [
  { name: 'director', label: 'Director', field: 'nombre', align: 'left' },
  { name: 'sede', label: 'Sede', field: 'sede', align: 'left' },
  { name: 'asignaturas', label: 'Asignaturas', field: 'asignaturas', align: 'center' },
  { name: 'docentesCargo', label: 'Docentes', field: 'docentesCargo', align: 'center' },
  { name: 'cumplimiento', label: 'Cumplimiento', field: 'cumplimiento', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const columnasAcademicos = [
  { name: 'director', label: 'Director Académico', field: 'nombre', align: 'left' },
  { name: 'carrerasSupervision', label: 'Carreras', field: 'carrerasSupervision', align: 'center' },
  { name: 'docentesTotal', label: 'Docentes', field: 'docentesTotal', align: 'center' },
  { name: 'cumplimientoGeneral', label: 'Cumplimiento', field: 'cumplimientoGeneral', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// Mock Data
const reportesPorSede = ref([
  { id: 1, nombre: 'Cochabamba', carreras: 12, docentes: 180, progreso: 78, estado: 'Al día' },
  { id: 2, nombre: 'La Paz', carreras: 10, docentes: 150, progreso: 72, estado: 'Al día' },
  { id: 3, nombre: 'Santa Cruz', carreras: 11, docentes: 165, progreso: 68, estado: 'Retraso' },
  { id: 4, nombre: 'Oruro', carreras: 8, docentes: 95, progreso: 82, estado: 'Al día' },
  { id: 5, nombre: 'Sucre', carreras: 9, docentes: 110, progreso: 75, estado: 'Al día' },
  { id: 6, nombre: 'Potosí', carreras: 6, docentes: 70, progreso: 65, estado: 'Retraso' },
  { id: 7, nombre: 'Tarija', carreras: 7, docentes: 80, progreso: 70, estado: 'Al día' },
  { id: 8, nombre: 'Trinidad', carreras: 5, docentes: 55, progreso: 58, estado: 'Retraso' },
  { id: 9, nombre: 'Cobija', carreras: 4, docentes: 45, progreso: 52, estado: 'Crítico' }
])

const reportesDirectores = ref([
  { id: 1, nombre: 'Dr. Juan Carlos Mendoza', iniciales: 'JM', carrera: 'Medicina', sede: 'Cochabamba', asignaturas: 45, docentesCargo: 28, cumplimiento: 85 },
  { id: 2, nombre: 'Lic. María Elena Vargas', iniciales: 'MV', carrera: 'Odontología', sede: 'Cochabamba', asignaturas: 38, docentesCargo: 22, cumplimiento: 78 },
  { id: 3, nombre: 'Ing. Roberto Paz', iniciales: 'RP', carrera: 'Ingeniería Civil', sede: 'La Paz', asignaturas: 42, docentesCargo: 25, cumplimiento: 72 },
  { id: 4, nombre: 'Lic. Ana Gutiérrez', iniciales: 'AG', carrera: 'Derecho', sede: 'Santa Cruz', asignaturas: 35, docentesCargo: 20, cumplimiento: 65 },
  { id: 5, nombre: 'Dr. Pedro Rojas', iniciales: 'PR', carrera: 'Medicina', sede: 'La Paz', asignaturas: 45, docentesCargo: 30, cumplimiento: 82 }
])

const reportesAcademicos = ref([
  { id: 1, nombre: 'Dr. Carlos Fernández', iniciales: 'CF', sede: 'Cochabamba', carrerasSupervision: 12, docentesTotal: 180, cumplimientoGeneral: 78 },
  { id: 2, nombre: 'Lic. Patricia Sandoval', iniciales: 'PS', sede: 'La Paz', carrerasSupervision: 10, docentesTotal: 150, cumplimientoGeneral: 72 },
  { id: 3, nombre: 'Ing. Mario Delgado', iniciales: 'MD', sede: 'Santa Cruz', carrerasSupervision: 11, docentesTotal: 165, cumplimientoGeneral: 68 },
  { id: 4, nombre: 'Lic. Rosa Mamani', iniciales: 'RM', sede: 'Oruro', carrerasSupervision: 8, docentesTotal: 95, cumplimientoGeneral: 82 }
])

// Functions
onMounted(async () => {
  await sedesStore.fetchSedes()
})

const getColorProgreso = (progreso) => {
  if (progreso >= 80) return 'positive'
  if (progreso >= 60) return 'warning'
  return 'negative'
}

const actualizarReportes = () => {
  $q.notify({ type: 'info', message: 'Actualizando reportes...', icon: 'sync' })
}

const exportarPDF = () => {
  $q.notify({ type: 'positive', message: 'Exportando reporte en PDF...', icon: 'picture_as_pdf' })
}

const exportarExcel = () => {
  $q.notify({ type: 'positive', message: 'Exportando reporte en Excel...', icon: 'table_chart' })
}

const verDetalleSede = (sede) => {
  detalleSeleccionado.value = { titulo: `Reporte de Sede: ${sede.nombre}`, subtitulo: `${sede.carreras} carreras, ${sede.docentes} docentes` }
  dialogDetalle.value = true
}

const descargarReporteSede = (sede) => {
  $q.notify({ type: 'positive', message: `Descargando reporte de ${sede.nombre}...` })
}

const verDetalleDirector = (director) => {
  detalleSeleccionado.value = { titulo: `Reporte: ${director.nombre}`, subtitulo: `${director.carrera} - ${director.sede}` }
  dialogDetalle.value = true
}

const verDetalleAcademico = (academico) => {
  detalleSeleccionado.value = { titulo: `Reporte: ${academico.nombre}`, subtitulo: `Dirección Académica - ${academico.sede}` }
  dialogDetalle.value = true
}
</script>

<style scoped>
.reportes-nacionales-page {
  padding: 24px;
  background-color: #f5f7fa;
}

.metric-card {
  transition: transform 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
}
</style>
