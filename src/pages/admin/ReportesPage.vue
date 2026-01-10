<template>
  <q-page class="reportes-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <q-icon name="assessment" color="indigo" class="q-mr-sm" />
          Reportes del Sistema
        </h1>
        <p class="page-subtitle">Genera reportes por docente, carrera o sede</p>
      </div>
      <div class="header-actions">
        <q-btn outline color="green" icon="table_chart" label="Exportar Excel" no-caps @click="exportarExcel" />
        <q-btn unelevated color="red" icon="picture_as_pdf" label="Exportar PDF" no-caps @click="exportarPDF" />
      </div>
    </div>

    <!-- Filtros -->
    <q-card class="filtros-card q-mb-lg">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-2">
            <q-select
              v-model="filtros.tipoReporte"
              :options="tiposReporte"
              outlined
              dense
              label="Tipo de Reporte"
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-md-2">
            <q-select
              v-model="filtros.sede"
              :options="sedesOptions"
              outlined
              dense
              label="Sede"
              emit-value
              map-options
              clearable
            />
          </div>
          <div class="col-12 col-md-2" v-if="filtros.tipoReporte !== 'sedes'">
            <q-select
              v-model="filtros.carrera"
              :options="carrerasOptions"
              outlined
              dense
              label="Carrera"
              emit-value
              map-options
              clearable
            />
          </div>
          <div class="col-12 col-md-2" v-if="filtros.tipoReporte === 'docentes'">
            <q-select
              v-model="filtros.docente"
              :options="docentesOptions"
              outlined
              dense
              label="Docente"
              emit-value
              map-options
              clearable
            />
          </div>
          <div class="col-12 col-md-2">
            <q-select
              v-model="filtros.gestion"
              :options="gestionesOptions"
              outlined
              dense
              label="Gestión"
              emit-value
              map-options
            />
          </div>
          <div class="col-auto">
            <q-btn unelevated color="indigo" icon="search" label="Generar" no-caps @click="generarReporte" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Contenido del Reporte -->
    <div v-if="reporteGenerado">
      <!-- Reporte por Docentes -->
      <div v-if="filtros.tipoReporte === 'docentes'">
        <div class="reporte-header q-mb-md">
          <h2 class="reporte-titulo">Reporte de Docentes</h2>
          <p class="reporte-fecha">Generado: {{ fechaReporte }}</p>
        </div>

        <div class="row q-col-gutter-lg q-mb-lg">
          <div class="col-12 col-md-3">
            <q-card class="stat-card stat-primary">
              <q-card-section>
                <q-icon name="person" size="32px" />
                <div class="stat-value">{{ reporteDocentes.total }}</div>
                <div class="stat-label">Total Docentes</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="stat-card stat-success">
              <q-card-section>
                <q-icon name="menu_book" size="32px" />
                <div class="stat-value">{{ reporteDocentes.materias }}</div>
                <div class="stat-label">Materias Asignadas</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="stat-card stat-warning">
              <q-card-section>
                <q-icon name="groups" size="32px" />
                <div class="stat-value">{{ reporteDocentes.grupos }}</div>
                <div class="stat-label">Grupos Activos</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="stat-card stat-info">
              <q-card-section>
                <q-icon name="schedule" size="32px" />
                <div class="stat-value">{{ reporteDocentes.horasSemanales }}h</div>
                <div class="stat-label">Horas Semanales</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-card class="data-card">
          <q-card-section>
            <q-table
              :rows="reporteDocentes.detalle"
              :columns="columnasDocentes"
              row-key="id"
              flat
              bordered
            >
              <template v-slot:body-cell-progreso="props">
                <q-td :props="props">
                  <q-linear-progress :value="props.value / 100" :color="props.value >= 80 ? 'green' : props.value >= 50 ? 'orange' : 'red'" rounded size="8px" />
                  <span class="text-caption">{{ props.value }}%</span>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- Reporte por Carreras -->
      <div v-if="filtros.tipoReporte === 'carreras'">
        <div class="reporte-header q-mb-md">
          <h2 class="reporte-titulo">Reporte por Carreras</h2>
          <p class="reporte-fecha">Generado: {{ fechaReporte }}</p>
        </div>

        <div class="row q-col-gutter-lg q-mb-lg">
          <div class="col-12 col-md-3">
            <q-card class="stat-card stat-primary">
              <q-card-section>
                <q-icon name="school" size="32px" />
                <div class="stat-value">{{ reporteCarreras.total }}</div>
                <div class="stat-label">Total Carreras</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="stat-card stat-success">
              <q-card-section>
                <q-icon name="people" size="32px" />
                <div class="stat-value">{{ reporteCarreras.estudiantes }}</div>
                <div class="stat-label">Estudiantes</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="stat-card stat-warning">
              <q-card-section>
                <q-icon name="menu_book" size="32px" />
                <div class="stat-value">{{ reporteCarreras.materias }}</div>
                <div class="stat-label">Materias</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="stat-card stat-info">
              <q-card-section>
                <q-icon name="description" size="32px" />
                <div class="stat-value">{{ reporteCarreras.documentacion }}%</div>
                <div class="stat-label">Documentación</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-card class="data-card">
          <q-card-section>
            <q-table
              :rows="reporteCarreras.detalle"
              :columns="columnasCarreras"
              row-key="id"
              flat
              bordered
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Reporte por Sedes -->
      <div v-if="filtros.tipoReporte === 'sedes'">
        <div class="reporte-header q-mb-md">
          <h2 class="reporte-titulo">Reporte por Sedes</h2>
          <p class="reporte-fecha">Generado: {{ fechaReporte }}</p>
        </div>

        <div class="row q-col-gutter-lg q-mb-lg">
          <div class="col-12 col-md-3">
            <q-card class="stat-card stat-primary">
              <q-card-section>
                <q-icon name="location_city" size="32px" />
                <div class="stat-value">{{ reporteSedes.total }}</div>
                <div class="stat-label">Total Sedes</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="stat-card stat-success">
              <q-card-section>
                <q-icon name="people" size="32px" />
                <div class="stat-value">{{ reporteSedes.estudiantes }}</div>
                <div class="stat-label">Estudiantes Total</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="stat-card stat-warning">
              <q-card-section>
                <q-icon name="person" size="32px" />
                <div class="stat-value">{{ reporteSedes.docentes }}</div>
                <div class="stat-label">Docentes Total</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="stat-card stat-info">
              <q-card-section>
                <q-icon name="school" size="32px" />
                <div class="stat-value">{{ reporteSedes.carreras }}</div>
                <div class="stat-label">Carreras Total</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-card class="data-card">
          <q-card-section>
            <q-table
              :rows="reporteSedes.detalle"
              :columns="columnasSedes"
              row-key="id"
              flat
              bordered
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Estado Inicial -->
    <div v-else class="empty-state">
      <q-icon name="analytics" size="80px" color="grey-4" />
      <h3>Selecciona los filtros y genera un reporte</h3>
      <p>Puedes generar reportes por docentes, carreras o sedes</p>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'

const $q = useQuasar()
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()

const reporteGenerado = ref(false)
const fechaReporte = ref('')

const filtros = ref({
  tipoReporte: 'docentes',
  sede: null,
  carrera: null,
  docente: null,
  gestion: '2026-I'
})

const tiposReporte = [
  { label: 'Por Docentes', value: 'docentes' },
  { label: 'Por Carreras', value: 'carreras' },
  { label: 'Por Sedes', value: 'sedes' }
]

const gestionesOptions = [
  { label: 'Gestión 2026-I', value: '2026-I' },
  { label: 'Gestión 2025-II', value: '2025-II' },
  { label: 'Gestión 2025-I', value: '2025-I' }
]

const sedesOptions = computed(() => 
  sedesStore.sedesActivas.map(s => ({ label: s.nombre, value: s.id }))
)

const carrerasOptions = computed(() => 
  carrerasStore.carreras.map(c => ({ label: c.nombre, value: c.id }))
)

const docentesOptions = [
  { label: 'Dr. Juan Pérez', value: 1 },
  { label: 'Dra. María García', value: 2 },
  { label: 'Ing. Carlos López', value: 3 },
  { label: 'Lic. Ana Martínez', value: 4 }
]

// Datos de ejemplo para reportes
const reporteDocentes = ref({
  total: 45,
  materias: 120,
  grupos: 85,
  horasSemanales: 640,
  detalle: [
    { id: 1, nombre: 'Dr. Juan Pérez', especialidad: 'Medicina', materias: 3, grupos: 4, horas: 16, progreso: 85 },
    { id: 2, nombre: 'Dra. María García', especialidad: 'Pediatría', materias: 2, grupos: 3, horas: 12, progreso: 92 },
    { id: 3, nombre: 'Ing. Carlos López', especialidad: 'Sistemas', materias: 4, grupos: 5, horas: 20, progreso: 78 },
    { id: 4, nombre: 'Lic. Ana Martínez', especialidad: 'Derecho', materias: 2, grupos: 2, horas: 8, progreso: 65 },
    { id: 5, nombre: 'Dr. Roberto Fernández', especialidad: 'Anatomía', materias: 3, grupos: 4, horas: 16, progreso: 95 }
  ]
})

const reporteCarreras = ref({
  total: 8,
  estudiantes: 2540,
  materias: 156,
  documentacion: 72,
  detalle: [
    { id: 1, nombre: 'Medicina', sede: 'Cochabamba', estudiantes: 450, docentes: 28, materias: 45, documentacion: 85 },
    { id: 2, nombre: 'Ing. de Sistemas', sede: 'Cochabamba', estudiantes: 320, docentes: 15, materias: 38, documentacion: 78 },
    { id: 3, nombre: 'Derecho', sede: 'La Paz', estudiantes: 280, docentes: 12, materias: 32, documentacion: 65 },
    { id: 4, nombre: 'Odontología', sede: 'Cochabamba', estudiantes: 180, docentes: 14, materias: 28, documentacion: 72 },
    { id: 5, nombre: 'Enfermería', sede: 'El Alto', estudiantes: 210, docentes: 10, materias: 22, documentacion: 58 }
  ]
})

const reporteSedes = ref({
  total: 5,
  estudiantes: 3200,
  docentes: 180,
  carreras: 24,
  detalle: [
    { id: 1, nombre: 'Cochabamba', campus: 3, carreras: 8, estudiantes: 1450, docentes: 85, documentacion: 78 },
    { id: 2, nombre: 'La Paz', campus: 2, carreras: 6, estudiantes: 820, docentes: 45, documentacion: 65 },
    { id: 3, nombre: 'El Alto', campus: 1, carreras: 4, estudiantes: 430, docentes: 22, documentacion: 55 },
    { id: 4, nombre: 'Ivirgarzama', campus: 1, carreras: 3, estudiantes: 280, docentes: 15, documentacion: 48 },
    { id: 5, nombre: 'Santa Cruz', campus: 2, carreras: 3, estudiantes: 220, docentes: 13, documentacion: 42 }
  ]
})

const columnasDocentes = [
  { name: 'nombre', label: 'Docente', field: 'nombre', align: 'left', sortable: true },
  { name: 'especialidad', label: 'Especialidad', field: 'especialidad', align: 'left' },
  { name: 'materias', label: 'Materias', field: 'materias', align: 'center' },
  { name: 'grupos', label: 'Grupos', field: 'grupos', align: 'center' },
  { name: 'horas', label: 'Horas/Sem', field: 'horas', align: 'center' },
  { name: 'progreso', label: 'Documentación', field: 'progreso', align: 'center' }
]

const columnasCarreras = [
  { name: 'nombre', label: 'Carrera', field: 'nombre', align: 'left', sortable: true },
  { name: 'sede', label: 'Sede', field: 'sede', align: 'left' },
  { name: 'estudiantes', label: 'Estudiantes', field: 'estudiantes', align: 'center' },
  { name: 'docentes', label: 'Docentes', field: 'docentes', align: 'center' },
  { name: 'materias', label: 'Materias', field: 'materias', align: 'center' },
  { name: 'documentacion', label: 'Doc. %', field: 'documentacion', align: 'center' }
]

const columnasSedes = [
  { name: 'nombre', label: 'Sede', field: 'nombre', align: 'left', sortable: true },
  { name: 'campus', label: 'Campus', field: 'campus', align: 'center' },
  { name: 'carreras', label: 'Carreras', field: 'carreras', align: 'center' },
  { name: 'estudiantes', label: 'Estudiantes', field: 'estudiantes', align: 'center' },
  { name: 'docentes', label: 'Docentes', field: 'docentes', align: 'center' },
  { name: 'documentacion', label: 'Doc. %', field: 'documentacion', align: 'center' }
]

function generarReporte() {
  fechaReporte.value = new Date().toLocaleString('es-BO')
  reporteGenerado.value = true
  $q.notify({ type: 'positive', message: 'Reporte generado exitosamente', icon: 'check_circle' })
}

function exportarPDF() {
  $q.notify({ type: 'positive', message: 'Exportando reporte a PDF...', icon: 'picture_as_pdf' })
}

function exportarExcel() {
  $q.notify({ type: 'positive', message: 'Exportando reporte a Excel...', icon: 'table_chart' })
}
</script>

<style scoped>
.reportes-page {
  padding: 24px;
  background: var(--bg-primary);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left { display: flex; flex-direction: column; }
.header-actions { display: flex; gap: 12px; }

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
}

.filtros-card {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.reporte-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reporte-titulo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.reporte-fecha {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0;
}

/* Stat Cards */
.stat-card {
  border-radius: 12px;
  text-align: center;
  color: white;
}

.stat-card .q-card-section {
  padding: 20px;
}

.stat-primary { background: linear-gradient(135deg, #6366f1, #4f46e5); }
.stat-success { background: linear-gradient(135deg, #10b981, #059669); }
.stat-warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
.stat-info { background: linear-gradient(135deg, #3b82f6, #2563eb); }

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 8px 0;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.9;
}

/* Data Card */
.data-card {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-state h3 {
  color: var(--text-secondary);
  margin: 16px 0 8px;
}

.empty-state p {
  color: var(--text-muted);
}
</style>
