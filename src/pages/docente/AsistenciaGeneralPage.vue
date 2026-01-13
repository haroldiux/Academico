<template>
  <q-page class="asistencia-general-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <q-icon name="analytics" color="primary" class="q-mr-sm" />
          Vista General de Asistencia
        </h1>
        <p class="page-subtitle">Resumen y estadísticas de asistencia por materia</p>
      </div>
      <div class="header-actions">
        <q-btn outline color="primary" icon="picture_as_pdf" label="Exportar PDF" @click="exportarPDF" />
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section q-mb-lg">
      <q-select
        v-model="materiaSeleccionada"
        :options="materiasOptions"
        label="Materia"
        outlined
        dense
        emit-value
        map-options
        style="min-width: 280px"
        @update:model-value="cargarEstadisticas"
      />
      <q-select
        v-model="grupoSeleccionado"
        :options="gruposOptions"
        label="Grupo"
        outlined
        dense
        emit-value
        map-options
        style="min-width: 150px"
        @update:model-value="cargarEstadisticas"
      />
    </div>

    <!-- Stats Cards -->
    <div v-if="estudiantesConStats.length > 0" class="stats-row q-mb-lg">
      <div class="stat-card">
        <q-icon name="people" size="40px" color="primary" />
        <div class="stat-info">
          <span class="stat-value">{{ estudiantesConStats.length }}</span>
          <span class="stat-label">Total Estudiantes</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="trending_up" size="40px" color="green" />
        <div class="stat-info">
          <span class="stat-value">{{ promedioAsistencia }}%</span>
          <span class="stat-label">Promedio Asistencia</span>
        </div>
      </div>
      <div class="stat-card warning">
        <q-icon name="warning" size="40px" color="orange" />
        <div class="stat-info">
          <span class="stat-value">{{ estudiantesAdvertencia }}</span>
          <span class="stat-label">En Advertencia</span>
        </div>
      </div>
      <div class="stat-card danger">
        <q-icon name="error" size="40px" color="red" />
        <div class="stat-info">
          <span class="stat-value">{{ estudiantesRiesgo }}</span>
          <span class="stat-label">En Riesgo</span>
        </div>
      </div>
    </div>

    <!-- Leyenda -->
    <div v-if="estudiantesConStats.length > 0" class="leyenda q-mb-md">
      <span class="leyenda-item">
        <q-badge color="green" /> Normal (&lt;15% faltas)
      </span>
      <span class="leyenda-item">
        <q-badge color="orange" /> Advertencia (15-25% faltas)
      </span>
      <span class="leyenda-item">
        <q-badge color="red" /> En Riesgo (&gt;25% faltas)
      </span>
    </div>

    <!-- Empty State -->
    <div v-if="!materiaSeleccionada" class="empty-state">
      <q-icon name="school" size="80px" color="grey-4" />
      <p class="text-h6 text-grey-6 q-mt-md">Selecciona una materia</p>
      <p class="text-caption text-grey-5">Para ver las estadísticas de asistencia</p>
    </div>

    <!-- Tabla de Estudiantes -->
    <q-card v-else-if="estudiantesConStats.length > 0" class="table-card">
      <q-table
        :rows="estudiantesConStats"
        :columns="columns"
        row-key="id"
        :pagination="{ rowsPerPage: 20 }"
        flat
        :filter="busqueda"
      >
        <template v-slot:top>
          <div class="table-header">
            <span class="text-h6">{{ materiaInfo?.nombre || 'Estudiantes' }}</span>
            <q-space />
            <q-input v-model="busqueda" placeholder="Buscar estudiante..." dense outlined style="min-width: 200px">
              <template v-slot:prepend><q-icon name="search" /></template>
            </q-input>
          </div>
        </template>

        <template v-slot:body-cell-foto="props">
          <q-td :props="props">
            <q-avatar size="36px" color="primary" text-color="white">
              {{ props.row.nombre.charAt(0) }}{{ props.row.apellido.charAt(0) }}
            </q-avatar>
          </q-td>
        </template>

        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <div class="estudiante-nombre">{{ props.row.nombreCompleto }}</div>
            <div class="estudiante-codigo text-caption text-grey">{{ props.row.codigo }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-porcentaje="props">
          <q-td :props="props">
            <div class="porcentaje-cell">
              <q-linear-progress
                :value="props.row.estadisticas.porcentajeAsistencia / 100"
                :color="getColorPorcentaje(props.row.estadisticas.porcentajeAsistencia)"
                rounded
                size="8px"
                class="q-mr-sm"
                style="width: 80px"
              />
              <span :class="'text-' + getColorPorcentaje(props.row.estadisticas.porcentajeAsistencia)">
                {{ props.row.estadisticas.porcentajeAsistencia }}%
              </span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-faltas="props">
          <q-td :props="props">
            <q-chip 
              :color="props.row.estadisticas.ausentes > 2 ? 'red' : 'grey'" 
              text-color="white" 
              size="sm"
            >
              {{ props.row.estadisticas.ausentes }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-tardanzas="props">
          <q-td :props="props">
            <q-chip 
              :color="props.row.estadisticas.tardanzas > 0 ? 'orange' : 'grey'" 
              text-color="white" 
              size="sm"
            >
              {{ props.row.estadisticas.tardanzas }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-justificadas="props">
          <q-td :props="props">
            <q-chip 
              :color="props.row.estadisticas.justificadas > 0 ? 'blue' : 'grey'" 
              text-color="white" 
              size="sm"
            >
              {{ props.row.estadisticas.justificadas }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-badge 
              :color="getColorEstado(props.row.estadisticas.estadoRiesgo)"
              :label="getLabelEstado(props.row.estadisticas.estadoRiesgo)"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn flat round size="sm" color="primary" icon="visibility" @click="verDetalle(props.row)">
              <q-tooltip>Ver detalle</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Detalle -->
    <q-dialog v-model="dialogDetalle">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Detalle de Asistencia</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section v-if="estudianteDetalle">
          <div class="text-subtitle1 q-mb-md">{{ estudianteDetalle.nombreCompleto }}</div>
          <div class="detalle-stats">
            <div class="detalle-item">
              <span class="label">Total clases:</span>
              <span class="value">{{ estudianteDetalle.estadisticas.total }}</span>
            </div>
            <div class="detalle-item">
              <span class="label">Presentes:</span>
              <span class="value text-green">{{ estudianteDetalle.estadisticas.presentes }}</span>
            </div>
            <div class="detalle-item">
              <span class="label">Ausentes:</span>
              <span class="value text-red">{{ estudianteDetalle.estadisticas.ausentes }}</span>
            </div>
            <div class="detalle-item">
              <span class="label">Tardanzas:</span>
              <span class="value text-orange">{{ estudianteDetalle.estadisticas.tardanzas }}</span>
            </div>
            <div class="detalle-item">
              <span class="label">Justificadas:</span>
              <span class="value text-blue">{{ estudianteDetalle.estadisticas.justificadas }}</span>
            </div>
            <div class="detalle-item">
              <span class="label">% Asistencia:</span>
              <span class="value text-primary text-bold">{{ estudianteDetalle.estadisticas.porcentajeAsistencia }}%</span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAsistenciaStore } from 'src/stores/asistencia'
import { useAsignaturasStore } from 'src/stores/asignaturas'

const $q = useQuasar()
const asistenciaStore = useAsistenciaStore()
const asignaturasStore = useAsignaturasStore()

const materiaSeleccionada = ref(null)
const grupoSeleccionado = ref(null)
const busqueda = ref('')
const dialogDetalle = ref(false)
const estudianteDetalle = ref(null)

// Opciones de materias
const materiasOptions = computed(() => {
  return asignaturasStore.asignaturas.map(a => ({
    label: `${a.nombre} (${a.codigo})`,
    value: a.id
  }))
})

const materiaInfo = computed(() => {
  return asignaturasStore.asignaturas.find(a => a.id === materiaSeleccionada.value)
})

const gruposOptions = computed(() => {
  if (!materiaInfo.value) return []
  return (materiaInfo.value.grupos || []).map(g => ({
    label: `${g.nombre} - ${g.turno}`,
    value: g.id
  }))
})

// Estudiantes con estadísticas
const estudiantesConStats = computed(() => {
  if (!materiaSeleccionada.value) return []
  return asistenciaStore.getEstudiantesConEstadisticas(materiaSeleccionada.value)
})

// Stats resumen
const promedioAsistencia = computed(() => {
  if (estudiantesConStats.value.length === 0) return 0
  const suma = estudiantesConStats.value.reduce((acc, e) => acc + e.estadisticas.porcentajeAsistencia, 0)
  return Math.round(suma / estudiantesConStats.value.length)
})

const estudiantesRiesgo = computed(() => {
  return estudiantesConStats.value.filter(e => e.estadisticas.estadoRiesgo === 'riesgo').length
})

const estudiantesAdvertencia = computed(() => {
  return estudiantesConStats.value.filter(e => e.estadisticas.estadoRiesgo === 'advertencia').length
})

// Columnas de la tabla
const columns = [
  { name: 'foto', label: '', field: 'foto', align: 'center', style: 'width: 50px' },
  { name: 'nombre', label: 'Estudiante', field: 'nombreCompleto', align: 'left', sortable: true },
  { name: 'porcentaje', label: '% Asistencia', field: row => row.estadisticas.porcentajeAsistencia, align: 'center', sortable: true },
  { name: 'faltas', label: 'Faltas', field: row => row.estadisticas.ausentes, align: 'center', sortable: true },
  { name: 'tardanzas', label: 'Tardanzas', field: row => row.estadisticas.tardanzas, align: 'center', sortable: true },
  { name: 'justificadas', label: 'Justificadas', field: row => row.estadisticas.justificadas, align: 'center', sortable: true },
  { name: 'estado', label: 'Estado', field: row => row.estadisticas.estadoRiesgo, align: 'center' },
  { name: 'acciones', label: '', field: 'acciones', align: 'center' }
]

function cargarEstadisticas() {
  // Los datos se cargan automáticamente via computed
}

function getColorPorcentaje(porcentaje) {
  if (porcentaje >= 85) return 'green'
  if (porcentaje >= 75) return 'orange'
  return 'red'
}

function getColorEstado(estado) {
  switch (estado) {
    case 'riesgo': return 'red'
    case 'advertencia': return 'orange'
    default: return 'green'
  }
}

function getLabelEstado(estado) {
  switch (estado) {
    case 'riesgo': return 'En Riesgo'
    case 'advertencia': return 'Advertencia'
    default: return 'Normal'
  }
}

function verDetalle(estudiante) {
  estudianteDetalle.value = estudiante
  dialogDetalle.value = true
}

function exportarPDF() {
  $q.notify({ type: 'info', message: 'Exportando reporte de asistencia...', icon: 'picture_as_pdf' })
}
</script>

<style scoped>
.asistencia-general-page { padding: 24px; background: var(--bg-primary); min-height: 100vh; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); margin: 0; display: flex; align-items: center; }
.page-subtitle { color: var(--text-secondary); margin: 4px 0 0 0; }
.header-actions { display: flex; gap: 12px; }

.filters-section { display: flex; gap: 16px; flex-wrap: wrap; }

.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}
.stat-card.warning { border-left: 4px solid var(--warning); }
.stat-card.danger { border-left: 4px solid var(--error); }
.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
.stat-label { font-size: 0.85rem; color: var(--text-secondary); }

.leyenda { display: flex; gap: 24px; flex-wrap: wrap; }
.leyenda-item { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-secondary); }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 24px; }

.table-card { border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); }
.table-header { display: flex; align-items: center; width: 100%; padding: 8px 0; }

.estudiante-nombre { font-weight: 600; color: var(--text-primary); }
.estudiante-codigo { font-size: 0.8rem; }

.porcentaje-cell { display: flex; align-items: center; }

.detalle-stats { display: flex; flex-direction: column; gap: 12px; }
.detalle-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); }
.detalle-item .label { color: var(--text-secondary); }
.detalle-item .value { font-weight: 600; }
</style>
