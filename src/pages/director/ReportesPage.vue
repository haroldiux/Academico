<template>
  <q-page class="reportes-page">
    <!-- Header -->
    <div class="page-header q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h4 class="text-h4 text-weight-bold q-mb-xs">Centro de Reportes</h4>
          <div class="row items-center q-gutter-sm">
            <p class="text-grey-7 q-mb-none">Genera reportes de seguimiento académico de tu carrera</p>
            <q-chip v-if="authStore.rol === 'DIRECCION_ACADEMICA' || authStore.rol === 'VICERRECTOR_SEDE'" 
                    color="primary" text-color="white" size="sm" icon="apartment">
              Sede: Cochabamba
            </q-chip>
          </div>
        </div>
        <q-btn color="primary" icon="download" label="Exportar" @click="exportarReporte" />
      </div>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-md">
          <q-icon name="filter_alt" class="q-mr-xs" />
          Filtros
        </div>
        <div class="row q-col-gutter-md">
          <!-- Filtro Sede -->
          <div class="col-12 col-md-3" v-if="authStore.rol === 'VICERRECTOR_NACIONAL' || authStore.rol === 'SUPER_ADMIN'">
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

          <!-- Filtro Carrera -->
          <div class="col-12 col-md-3">
             <q-select
              v-model="filtros.carrera"
              :options="carrerasOptions"
              label="Carrera"
              outlined
              dense
              bg-color="white"
              emit-value
              map-options
              :disable="authStore.rol === 'DIRECTOR_CARRERA'"
            >
              <template v-slot:prepend>
                <q-icon name="school" />
              </template>
            </q-select>
          </div>

          <!-- Filtro Tipo Reporte -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.tipoReporte"
              :options="tiposReporte"
              label="Tipo de Reporte"
              emit-value
              map-options
              outlined
              dense
            />
          </div>

          <!-- Fecha Desde -->
          <div class="col-12 col-md-3">
            <q-input
              v-model="filtros.fechaDesde"
              label="Fecha Desde"
              type="date"
              outlined
              dense
            />
          </div>

          <!-- Fecha Hasta -->
          <div class="col-12 col-md-3">
            <q-input
              v-model="filtros.fechaHasta"
              label="Fecha Hasta"
              type="date"
              outlined
              dense
            />
          </div>

          <!-- Docente -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.docente"
              :options="docentesOptions"
              label="Docente"
              emit-value
              map-options
              outlined
              dense
              clearable
            />
          </div>

          <!-- Materia -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.materia"
              :options="materiasOptions"
              label="Materia"
              emit-value
              map-options
              outlined
              dense
              clearable
            />
          </div>

          <!-- Botones -->
          <div class="col-12 col-md-3 flex items-center justify-end">
            <q-btn flat color="grey" label="Limpiar" @click="limpiarFiltros" class="q-mr-sm" />
            <q-btn color="primary" icon="search" label="Generar" @click="generarReporte" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Métricas Resumen -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-primary">{{ metricas.totalDocentes }}</div>
                <div class="text-caption text-grey-7">Docentes Activos</div>
              </div>
              <q-icon name="people" size="40px" color="primary" class="q-ml-md" />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-positive">{{ metricas.promedioAsistencia }}%</div>
                <div class="text-caption text-grey-7">Asistencia Promedio</div>
              </div>
              <q-icon name="how_to_reg" size="40px" color="positive" class="q-ml-md" />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-info">{{ metricas.cumplimientoTemas }}%</div>
                <div class="text-caption text-grey-7">Cumplimiento Temas</div>
              </div>
              <q-icon name="check_circle" size="40px" color="info" class="q-ml-md" />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-warning">{{ metricas.documentacionPendiente }}</div>
                <div class="text-caption text-grey-7">Documentos Pendientes</div>
              </div>
              <q-icon name="description" size="40px" color="warning" class="q-ml-md" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabs de Reportes -->
    <q-card flat bordered>
      <q-tabs v-model="tabActivo" class="text-primary" active-color="primary" indicator-color="primary" align="left">
        <q-tab name="materias" icon="menu_book" label="Por Materia" />
        <q-tab name="asistencias" icon="event_available" label="Asistencias" />
        <q-tab name="seguimiento" icon="playlist_add_check" label="Seguimiento de Clase" />
        <q-tab name="documentacion" icon="folder_open" label="Documentación" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tabActivo" animated>
        <!-- NUEVO: Reporte por Materia -->
        <q-tab-panel name="materias">
          <div class="text-h6 q-mb-md">Seguimiento por Materia</div>
          <div class="row q-col-gutter-md">
            <div v-for="materia in reporteMaterias" :key="materia.codigo" class="col-12">
              <q-expansion-item
                :label="materia.nombre"
                :caption="`${materia.codigo} • ${materia.semestre}° Semestre • ${materia.docentes.length} docente(s)`"
                header-class="bg-grey-1"
                expand-icon-class="text-primary"
                default-opened
              >
                <template v-slot:header>
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white" icon="menu_book" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ materia.nombre }}</q-item-label>
                    <q-item-label caption>{{ materia.codigo }} • {{ materia.semestre }}° Semestre</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row q-gutter-sm">
                      <q-chip :color="getColorPorcentaje(materia.promedioGeneral)" :text-color="getTextColor(getColorPorcentaje(materia.promedioGeneral))" size="sm">
                        {{ materia.promedioGeneral }}% Avance
                      </q-chip>
                      <q-btn flat round dense icon="assessment" color="primary" @click.stop="generarReporteMateria(materia)">
                        <q-tooltip>Generar Reporte</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </template>

                <q-card class="bg-grey-1" flat bordered>
                  <q-card-section class="q-pa-md">
                    <q-table
                      :rows="materia.docentes"
                      :columns="columnasDocentesMateria"
                      row-key="id"
                      flat
                      bordered
                      separator="cell"
                      dense
                      hide-bottom
                      class="bg-white rounded-borders"
                    >
                      <template v-slot:body-cell-docente="props">
                        <q-td :props="props">
                          <div class="row items-center no-wrap">
                            <q-avatar color="blue-grey-4" text-color="white" size="28px" class="q-mr-sm">
                              {{ props.row.iniciales }}
                            </q-avatar>
                            <div>
                              <div class="text-weight-medium">{{ props.row.nombre }}</div>
                              <div class="text-caption text-grey-6">Grupo {{ props.row.grupo }}</div>
                            </div>
                          </div>
                        </q-td>
                      </template>
                      <template v-slot:body-cell-avanceTemas="props">
                        <q-td :props="props">
                          <div class="row items-center no-wrap justify-center" style="min-width: 120px;">
                            <q-linear-progress
                              :value="props.row.avanceTemas / 100"
                              :color="getColorPorcentaje(props.row.avanceTemas)"
                              class="q-mr-sm"
                              rounded
                              size="8px"
                              style="width: 60px;"
                            />
                            <span class="text-caption">{{ props.row.avanceTemas }}%</span>
                          </div>
                        </q-td>
                      </template>
                      <template v-slot:body-cell-asistencia="props">
                        <q-td :props="props">
                          <q-chip
                            :color="getColorPorcentaje(props.row.asistencia)"
                            :text-color="getTextColor(getColorPorcentaje(props.row.asistencia))"
                            size="sm"
                          >
                            {{ props.row.asistencia }}%
                          </q-chip>
                        </q-td>
                      </template>
                      <template v-slot:body-cell-documentacion="props">
                        <q-td :props="props">
                          <div class="row q-gutter-xs justify-center">
                            <q-icon
                              name="description"
                              :color="props.row.pac ? 'positive' : 'negative'"
                              size="18px"
                            >
                              <q-tooltip>PAC: {{ props.row.pac ? 'Entregado' : 'Pendiente' }}</q-tooltip>
                            </q-icon>
                            <q-icon
                              name="class"
                              :color="props.row.planClase ? 'positive' : 'negative'"
                              size="18px"
                            >
                              <q-tooltip>Plan de Clase: {{ props.row.planClase ? 'Entregado' : 'Pendiente' }}</q-tooltip>
                            </q-icon>
                            <q-icon
                              name="book"
                              :color="props.row.syllabus ? 'positive' : 'negative'"
                              size="18px"
                            >
                              <q-tooltip>Syllabus: {{ props.row.syllabus ? 'Entregado' : 'Pendiente' }}</q-tooltip>
                            </q-icon>
                          </div>
                        </q-td>
                      </template>
                      <template v-slot:body-cell-estado="props">
                        <q-td :props="props">
                          <q-chip
                            :color="getColorEstado(props.row.estado)"
                            :text-color="getTextColor(getColorEstado(props.row.estado))"
                            size="sm"
                          >
                            {{ props.row.estado }}
                          </q-chip>
                        </q-td>
                      </template>
                      <template v-slot:body-cell-acciones="props">
                        <q-td :props="props">
                          <q-btn flat round dense icon="visibility" color="primary" size="sm" @click="verDetalleDocenteMateria(materia, props.row)">
                            <q-tooltip>Ver Detalle</q-tooltip>
                          </q-btn>
                          <q-btn flat round dense icon="download" color="grey" size="sm" @click="descargarReporteDocenteMateria(materia, props.row)">
                            <q-tooltip>Descargar</q-tooltip>
                          </q-btn>
                        </q-td>
                      </template>
                    </q-table>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </div>
          </div>
        </q-tab-panel>

        <!-- Reporte de Asistencias -->
        <q-tab-panel name="asistencias">
          <div class="text-h6 q-mb-md">Reporte de Asistencias por Materia</div>
          <q-table
            :rows="reporteAsistencias"
            :columns="columnasAsistencias"
            row-key="id"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:body-cell-porcentaje="props">
              <q-td :props="props">
                <q-chip
                  :color="getColorPorcentaje(props.row.porcentaje)"
                  :text-color="getTextColor(getColorPorcentaje(props.row.porcentaje))"
                  size="sm"
                >
                  {{ props.row.porcentaje }}%
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn flat round dense icon="visibility" color="primary" @click="verDetalle(props.row)" />
                <q-btn flat round dense icon="download" color="grey" @click="descargarDetalle(props.row)" />
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- Reporte de Seguimiento -->
        <q-tab-panel name="seguimiento">
          <div class="text-h6 q-mb-md">Seguimiento de Clases - Cumplimiento de Temas</div>
          <q-table
            :rows="reporteSeguimiento"
            :columns="columnasSeguimiento"
            row-key="id"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:body-cell-temasCompletados="props">
              <q-td :props="props">
                <div class="row items-center no-wrap">
                  <q-linear-progress
                    :value="props.row.temasCompletados / props.row.temasTotales"
                    color="positive"
                    class="q-mr-sm"
                    style="width: 100px;"
                    rounded
                    size="10px"
                  />
                  <span class="text-caption">{{ props.row.temasCompletados }}/{{ props.row.temasTotales }}</span>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-chip
                  :color="getColorEstado(props.row.estado)"
                  :text-color="getTextColor(getColorEstado(props.row.estado))"
                  size="sm"
                >
                  {{ props.row.estado }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn flat round dense icon="visibility" color="primary" @click="verSeguimiento(props.row)" />
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- Reporte de Documentación -->
        <q-tab-panel name="documentacion">
          <div class="text-h6 q-mb-md">Estado de Documentación por Materia</div>
          <q-table
            :rows="reporteDocumentacion"
            :columns="columnasDocumentacion"
            row-key="id"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:body-cell-pac="props">
              <q-td :props="props">
                <q-icon
                  :name="props.row.pac ? 'check_circle' : 'cancel'"
                  :color="props.row.pac ? 'positive' : 'negative'"
                  size="20px"
                />
              </q-td>
            </template>
            <template v-slot:body-cell-planClase="props">
              <q-td :props="props">
                <q-icon
                  :name="props.row.planClase ? 'check_circle' : 'cancel'"
                  :color="props.row.planClase ? 'positive' : 'negative'"
                  size="20px"
                />
              </q-td>
            </template>
            <template v-slot:body-cell-syllabus="props">
              <q-td :props="props">
                <q-icon
                  :name="props.row.syllabus ? 'check_circle' : 'cancel'"
                  :color="props.row.syllabus ? 'positive' : 'negative'"
                  size="20px"
                />
              </q-td>
            </template>
            <template v-slot:body-cell-avance="props">
              <q-td :props="props">
                <q-chip
                  :color="getColorPorcentaje(props.row.avance)"
                  :text-color="getTextColor(getColorPorcentaje(props.row.avance))"
                  size="sm"
                >
                  {{ props.row.avance }}%
                </q-chip>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Dialog de Detalle -->
    <q-dialog v-model="dialogDetalle" persistent maximized>
      <q-card>
        <q-bar class="bg-primary text-white">
          <q-icon name="info" />
          <div class="q-ml-sm">Detalle del Reporte</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section class="q-pa-lg">
          <div class="text-h6 q-mb-md">{{ detalleSeleccionado?.titulo }}</div>
          <p class="text-grey-7">Aquí se mostrará el detalle completo del reporte seleccionado.</p>
          <!-- Contenido del detalle -->
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useSedesStore } from 'src/stores/sedes'

const $q = useQuasar()
const authStore = useAuthStore()
const sedesStore = useSedesStore()

// Filtros
const filtros = ref({
  sede: 'todas',
  carrera: 'todas',
  tipoReporte: 'todos',
  docente: null,
  materia: null,
  fechaDesde: '',
  fechaHasta: ''
})

const tabActivo = ref('materias')
const dialogDetalle = ref(false)
const detalleSeleccionado = ref(null)

const opcionesSedes = computed(() => [
  { label: 'Todas las sedes', value: 'todas' },
  ...sedesStore.sedes.map(s => ({ label: s.nombre, value: s.id }))
])

const carrerasOptions = [
  { label: 'Todas las carreras', value: 'todas' },
  { label: 'Medicina', value: 'medicina' },
  { label: 'Odontología', value: 'odontologia' }
]

onMounted(async () => {
  await sedesStore.fetchSedes()
  
  if (authStore.rol === 'DIRECTOR_CARRERA') {
    filtros.value.carrera = 'medicina' // Mock
  } else if (['DIRECCION_ACADEMICA', 'VICERRECTOR_SEDE'].includes(authStore.rol)) {
    // Si es dirección de sede, fijar su sede
    filtros.value.sede = authStore.sedeId || 1 // Mock ID 1
  }
})

// Opciones de filtros
const tiposReporte = [
  { label: 'Todos los reportes', value: 'todos' },
  { label: 'Por Materia', value: 'materias' },
  { label: 'Asistencias', value: 'asistencias' },
  { label: 'Seguimiento', value: 'seguimiento' },
  { label: 'Documentación', value: 'documentacion' }
]

const docentesOptions = [
  { label: 'Andrea Sonia Salinas Gil', value: 1 },
  { label: 'Luis Claros Gutierrez', value: 2 },
  { label: 'Harold Marco Antonio Rojas Torres', value: 3 },
  { label: 'Carmen Daniela Davalos Zelada', value: 4 },
  { label: 'Pamela Katherine Gutierrez Montero', value: 5 },
  { label: 'Carlos René Seleme Trigo', value: 6 }
]

const materiasOptions = [
  { label: 'Anatomía Humana I (MED-111)', value: 'MED-111' },
  { label: 'Histología Humana I (MED-112)', value: 'MED-112' },
  { label: 'Genética y Embriología (MED-113)', value: 'MED-113' },
  { label: 'Bioestadística (MED-114)', value: 'MED-114' },
  { label: 'Inglés Médico I (MED-115)', value: 'MED-115' },
  { label: 'Informática Médica (MED-226)', value: 'MED-226' }
]

// Métricas resumen
const metricas = ref({
  totalDocentes: 82,
  promedioAsistencia: 87,
  cumplimientoTemas: 78,
  documentacionPendiente: 12
})

// Columnas para tabla de docentes dentro de materia
const columnasDocentesMateria = [
  { name: 'docente', label: 'Docente', field: 'nombre', align: 'left' },
  { name: 'avanceTemas', label: 'Avance Temas', field: 'avanceTemas', align: 'center' },
  { name: 'asistencia', label: 'Asistencia', field: 'asistencia', align: 'center' },
  { name: 'documentacion', label: 'Documentación', field: 'documentacion', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// Columnas de tablas
const columnasAsistencias = [
  { name: 'materia', label: 'Materia', field: 'materia', align: 'left', sortable: true },
  { name: 'docente', label: 'Docente', field: 'docente', align: 'left', sortable: true },
  { name: 'grupo', label: 'Grupo', field: 'grupo', align: 'center' },
  { name: 'clasesImpartidas', label: 'Clases Impartidas', field: 'clasesImpartidas', align: 'center' },
  { name: 'estudiantesInscritos', label: 'Estudiantes', field: 'estudiantesInscritos', align: 'center' },
  { name: 'porcentaje', label: '% Asistencia', field: 'porcentaje', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const columnasSeguimiento = [
  { name: 'materia', label: 'Materia', field: 'materia', align: 'left', sortable: true },
  { name: 'docente', label: 'Docente', field: 'docente', align: 'left' },
  { name: 'temasCompletados', label: 'Temas Completados', field: 'temasCompletados', align: 'center' },
  { name: 'ultimaClase', label: 'Última Clase', field: 'ultimaClase', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const columnasDocumentacion = [
  { name: 'materia', label: 'Materia', field: 'materia', align: 'left', sortable: true },
  { name: 'docente', label: 'Docente', field: 'docente', align: 'left' },
  { name: 'pac', label: 'PAC', field: 'pac', align: 'center' },
  { name: 'planClase', label: 'Plan de Clase', field: 'planClase', align: 'center' },
  { name: 'syllabus', label: 'Syllabus', field: 'syllabus', align: 'center' },
  { name: 'avance', label: '% Avance', field: 'avance', align: 'center', sortable: true }
]

// DATOS MOCK - Por Materia (estructura principal)
const reporteMaterias = ref([
  {
    codigo: 'MED-111',
    nombre: 'Anatomía Humana I',
    semestre: 1,
    promedioGeneral: 88,
    docentes: [
      { id: 1, nombre: 'Andrea Sonia Salinas Gil', iniciales: 'AS', grupo: 'G1', avanceTemas: 85, asistencia: 92, pac: true, planClase: true, syllabus: true, estado: 'Al día' },
      { id: 2, nombre: 'Luis Claros Gutierrez', iniciales: 'LC', grupo: 'G2', avanceTemas: 78, asistencia: 88, pac: true, planClase: true, syllabus: false, estado: 'Al día' },
      { id: 5, nombre: 'Pamela Katherine Gutierrez Montero', iniciales: 'PG', grupo: 'G7', avanceTemas: 88, asistencia: 94, pac: true, planClase: true, syllabus: true, estado: 'Al día' }
    ]
  },
  {
    codigo: 'MED-112',
    nombre: 'Histología Humana I',
    semestre: 1,
    promedioGeneral: 65,
    docentes: [
      { id: 4, nombre: 'Carmen Daniela Davalos Zelada', iniciales: 'CD', grupo: 'G1', avanceTemas: 60, asistencia: 85, pac: true, planClase: false, syllabus: false, estado: 'Con retraso' }
    ]
  },
  {
    codigo: 'MED-113',
    nombre: 'Genética y Embriología',
    semestre: 1,
    promedioGeneral: 55,
    docentes: [
      { id: 6, nombre: 'Carlos René Seleme Trigo', iniciales: 'CS', grupo: 'G1', avanceTemas: 55, asistencia: 72, pac: true, planClase: false, syllabus: true, estado: 'Atrasado' }
    ]
  },
  {
    codigo: 'MED-226',
    nombre: 'Informática Médica',
    semestre: 4,
    promedioGeneral: 58,
    docentes: [
      { id: 3, nombre: 'Harold Marco Antonio Rojas Torres', iniciales: 'HR', grupo: 'G7', avanceTemas: 70, asistencia: 78, pac: false, planClase: false, syllabus: false, estado: 'Sin documentación' }
    ]
  }
])

// Datos mock - Asistencias
const reporteAsistencias = ref([
  { id: 1, materia: 'Anatomía Humana I', docente: 'Andrea Sonia Salinas Gil', grupo: 'G1', clasesImpartidas: 24, estudiantesInscritos: 42, porcentaje: 92 },
  { id: 2, materia: 'Anatomía Humana I', docente: 'Luis Claros Gutierrez', grupo: 'G2', clasesImpartidas: 22, estudiantesInscritos: 44, porcentaje: 88 },
  { id: 3, materia: 'Histología Humana I', docente: 'Carmen Daniela Davalos Zelada', grupo: 'G1', clasesImpartidas: 20, estudiantesInscritos: 40, porcentaje: 85 },
  { id: 4, materia: 'Informática Médica', docente: 'Harold Marco Antonio Rojas Torres', grupo: 'G7', clasesImpartidas: 18, estudiantesInscritos: 38, porcentaje: 78 },
  { id: 5, materia: 'Anatomía Humana I', docente: 'Pamela Katherine Gutierrez Montero', grupo: 'G7', clasesImpartidas: 24, estudiantesInscritos: 45, porcentaje: 94 },
  { id: 6, materia: 'Genética y Embriología', docente: 'Carlos René Seleme Trigo', grupo: 'G1', clasesImpartidas: 16, estudiantesInscritos: 42, porcentaje: 72 }
])

// Datos mock - Seguimiento
const reporteSeguimiento = ref([
  { id: 1, materia: 'Anatomía Humana I', docente: 'Andrea Sonia Salinas Gil', temasCompletados: 18, temasTotales: 24, ultimaClase: '2026-01-20', estado: 'Al día' },
  { id: 2, materia: 'Anatomía Humana I', docente: 'Luis Claros Gutierrez', temasCompletados: 15, temasTotales: 24, ultimaClase: '2026-01-19', estado: 'Al día' },
  { id: 3, materia: 'Histología Humana I', docente: 'Carmen Daniela Davalos Zelada', temasCompletados: 12, temasTotales: 20, ultimaClase: '2026-01-18', estado: 'Atrasado' },
  { id: 4, materia: 'Informática Médica', docente: 'Harold Marco Antonio Rojas Torres', temasCompletados: 10, temasTotales: 16, ultimaClase: '2026-01-21', estado: 'Al día' },
  { id: 5, materia: 'Genética y Embriología', docente: 'Carlos René Seleme Trigo', temasCompletados: 8, temasTotales: 18, ultimaClase: '2026-01-15', estado: 'Atrasado' }
])

// Datos mock - Documentación
const reporteDocumentacion = ref([
  { id: 1, materia: 'Anatomía Humana I', docente: 'Andrea Sonia Salinas Gil', pac: true, planClase: true, syllabus: true, avance: 100 },
  { id: 2, materia: 'Anatomía Humana I', docente: 'Luis Claros Gutierrez', pac: true, planClase: true, syllabus: false, avance: 75 },
  { id: 3, materia: 'Histología Humana I', docente: 'Carmen Daniela Davalos Zelada', pac: true, planClase: false, syllabus: false, avance: 50 },
  { id: 4, materia: 'Informática Médica', docente: 'Harold Marco Antonio Rojas Torres', pac: false, planClase: false, syllabus: false, avance: 25 },
  { id: 5, materia: 'Anatomía Humana I', docente: 'Pamela Katherine Gutierrez Montero', pac: true, planClase: true, syllabus: true, avance: 100 },
  { id: 6, materia: 'Genética y Embriología', docente: 'Carlos René Seleme Trigo', pac: true, planClase: false, syllabus: true, avance: 66 }
])

// Funciones auxiliares
const getColorPorcentaje = (porcentaje) => {
  if (porcentaje >= 90) return 'positive'
  if (porcentaje >= 75) return 'info'
  if (porcentaje >= 60) return 'warning'
  return 'negative'
}

const getColorEstado = (estado) => {
  if (estado === 'Al día') return 'positive'
  if (estado === 'Atrasado') return 'negative'
  return 'warning'
}

const getTextColor = (color) => {
  return ['warning', 'info'].includes(color) ? 'black' : 'white'
}

// Acciones
const limpiarFiltros = () => {
  filtros.value = {
    tipoReporte: 'todos',
    docente: null,
    materia: null,
    fechaDesde: '',
    fechaHasta: ''
  }
}

const generarReporte = () => {
  $q.notify({
    type: 'info',
    message: 'Generando reporte...',
    icon: 'sync'
  })
  // Aquí se aplicarían los filtros
}

const exportarReporte = () => {
  $q.notify({
    type: 'positive',
    message: 'Reporte exportado exitosamente',
    icon: 'download'
  })
}

const verDetalle = (row) => {
  detalleSeleccionado.value = { titulo: `Detalle de Asistencia - ${row.materia}`, data: row }
  dialogDetalle.value = true
}

const descargarDetalle = (row) => {
  $q.notify({
    type: 'positive',
    message: `Descargando detalle de ${row.materia}...`,
    icon: 'download'
  })
}

const verSeguimiento = (row) => {
  detalleSeleccionado.value = { titulo: `Seguimiento - ${row.materia}`, data: row }
  dialogDetalle.value = true
}



// Funciones para el nuevo tab "Por Materia"
const generarReporteMateria = (materia) => {
  $q.notify({
    type: 'info',
    message: `Generando reporte de ${materia.nombre}...`,
    icon: 'assessment'
  })
}

const verDetalleDocenteMateria = (materia, docente) => {
  detalleSeleccionado.value = { 
    titulo: `${docente.nombre} - ${materia.nombre}`,
    materia: materia,
    data: docente 
  }
  dialogDetalle.value = true
}

const descargarReporteDocenteMateria = (materia, docente) => {
  $q.notify({
    type: 'positive',
    message: `Descargando reporte de ${docente.nombre} para ${materia.nombre}...`,
    icon: 'download'
  })
}
</script>

<style scoped>
.reportes-page {
  padding: 24px;
  background-color: #f5f7fa;
}

.page-header {
  margin-bottom: 24px;
}

.metric-card {
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.docente-card {
  height: 100%;
  transition: all 0.3s ease;
}

.docente-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
</style>
