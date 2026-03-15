<template>
  <q-page class="evaluaciones-docente">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <q-icon name="quiz" color="orange" class="q-mr-sm" />
          Mis Evaluaciones
        </h1>
        <p class="page-subtitle">Exámenes programados de tus materias</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row q-mb-lg">
      <div class="stat-card">
        <q-icon name="event" size="32px" color="blue" />
        <div class="stat-info">
          <span class="stat-value">{{ evaluacionesProgramadas }}</span>
          <span class="stat-label">Programadas</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="play_circle" size="32px" color="green" />
        <div class="stat-info">
          <span class="stat-value">{{ evaluacionesEnCurso }}</span>
          <span class="stat-label">En Curso</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="check_circle" size="32px" color="purple" />
        <div class="stat-info">
          <span class="stat-value">{{ evaluacionesCompletadas }}</span>
          <span class="stat-label">Completadas</span>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section q-mb-lg">
      <q-select
        v-model="filtros.materia"
        :options="materiasOptions"
        label="Materia"
        outlined
        dense
        emit-value
        map-options
        clearable
        style="width: 100%; max-width: 200px; min-width: 150px"
      />
      <q-select
        v-model="filtros.parcial"
        :options="parcialOptions"
        label="Parcial"
        outlined
        dense
        emit-value
        map-options
        clearable
        style="width: 100%; max-width: 150px; min-width: 120px"
      />
    </div>

    <!-- Lista de Evaluaciones -->
    <div class="evaluaciones-grid">
      <q-card v-for="evaluacion in evaluacionesFiltradas" :key="evaluacion.id" class="eval-card">
        <q-card-section>
          <div class="eval-header">
            <q-chip :color="getParcialColor(evaluacion.parcial)" text-color="white" size="sm">
              {{ getParcialLabel(evaluacion.parcial) }}
            </q-chip>
            <q-chip
              :color="getEstadoColor(evaluacion.estado)"
              text-color="white"
              size="sm"
              :icon="getEstadoIcon(evaluacion.estado)"
            >
              {{ evaluacion.estado }}
            </q-chip>
          </div>

          <h3 class="eval-materia">{{ evaluacion.materia }}</h3>
          <p class="eval-grupo">{{ evaluacion.grupo }}</p>

          <div class="eval-info">
            <div class="info-item">
              <q-icon name="event" size="16px" color="grey-6" />
              <span>{{ evaluacion.fecha }}</span>
            </div>
            <div class="info-item">
              <q-icon name="schedule" size="16px" color="grey-6" />
              <span>{{ evaluacion.hora }}</span>
            </div>
            <div class="info-item">
              <q-icon name="room" size="16px" color="grey-6" />
              <span>{{ evaluacion.aula }}</span>
            </div>
          </div>

          <div class="eval-preguntas">
            <q-icon name="help_outline" size="16px" color="primary" />
            <span>{{ evaluacion.preguntas }} preguntas</span>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions>
          <q-btn
            flat
            color="primary"
            icon="visibility"
            label="Ver Detalles"
            @click="verDetalles(evaluacion)"
          />
          <q-space />
          <q-btn
            v-if="evaluacion.estado === 'Completada'"
            flat
            color="green"
            icon="fact_check"
            @click="verPatron(evaluacion)"
          >
            <q-tooltip>Ver Patrón</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </div>

    <!-- Empty State -->
    <div v-if="evaluacionesFiltradas.length === 0" class="empty-state">
      <q-icon name="event_busy" size="80px" color="grey-4" />
      <p class="text-h6 text-grey-6 q-mt-md">No hay evaluaciones</p>
      <p class="text-caption text-grey-5">
        No tienes exámenes programados para las materias seleccionadas
      </p>
    </div>

    <!-- Dialog Detalles -->
    <q-dialog v-model="showDetalles">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="quiz" class="q-mr-sm" />
            Detalles del Examen
          </div>
        </q-card-section>

        <q-card-section v-if="evaluacionSeleccionada">
          <div class="detalles-grid">
            <div class="detalle-item">
              <span class="detalle-label">Materia</span>
              <span class="detalle-value">{{ evaluacionSeleccionada.materia }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Grupo</span>
              <span class="detalle-value">{{ evaluacionSeleccionada.grupo }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Fecha</span>
              <span class="detalle-value">{{ evaluacionSeleccionada.fecha }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Hora</span>
              <span class="detalle-value">{{ evaluacionSeleccionada.hora }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Aula</span>
              <span class="detalle-value">{{ evaluacionSeleccionada.aula }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Preguntas</span>
              <span class="detalle-value">{{ evaluacionSeleccionada.preguntas }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Duración</span>
              <span class="detalle-value">{{ evaluacionSeleccionada.duracion }} minutos</span>
            </div>
          </div>

          <q-banner class="bg-blue-1 text-blue-9 q-mt-md" rounded>
            <q-icon name="info" class="q-mr-sm" />
            Recuerda llegar 15 minutos antes para preparar el aula
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()

const filtros = ref({ materia: null, parcial: null })
const showDetalles = ref(false)
const evaluacionSeleccionada = ref(null)
const loading = ref(false)

// Data real
const evaluaciones = ref([])

onMounted(() => {
  cargarEvaluaciones()
})

async function cargarEvaluaciones() {
  loading.value = true
  try {
    const { data } = await api.get('/mis-evaluaciones')
    evaluaciones.value = data
  } catch (error) {
    console.error('Error cargando evaluaciones:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las evaluaciones programadas',
    })
  } finally {
    loading.value = false
  }
}

const materiasOptions = computed(() => {
  const materias = [...new Set(evaluaciones.value.map((e) => e.materia))]
  return materias.map((m) => ({ label: m, value: m }))
})

const parcialOptions = [
  { label: '1° Parcial', value: '1° Parcial' }, // Adjusted to match backend string
  { label: '2° Parcial', value: '2° Parcial' },
  { label: 'Final', value: 'Final' },
  { label: '2da Instancia', value: '2da Instancia' },
]

const evaluacionesFiltradas = computed(() => {
  return evaluaciones.value.filter((e) => {
    if (filtros.value.materia && e.materia !== filtros.value.materia) return false
    if (filtros.value.parcial && e.parcial !== filtros.value.parcial) return false
    return true
  })
})

const evaluacionesProgramadas = computed(
  () => evaluaciones.value.filter((e) => e.estado === 'Programada').length,
)
const evaluacionesEnCurso = computed(
  () => evaluaciones.value.filter((e) => e.estado === 'En Curso').length,
)
const evaluacionesCompletadas = computed(
  () => evaluaciones.value.filter((e) => e.estado === 'Completada').length,
)

function getParcialColor(parcial) {
  const colors = {
    '1° Parcial': 'blue',
    '2° Parcial': 'orange',
    '1er Parcial': 'blue',
    '2do Parcial': 'orange',
    Final: 'purple',
    '2da Instancia': 'red',
  }
  return colors[parcial] || 'grey'
}

function getParcialLabel(parcial) {
  // If backend returns the label directly, we can just return it or map if shorter needed
  return parcial || 'Examen'
}

function getEstadoColor(estado) {
  const colors = { Programada: 'blue', 'En Curso': 'green', Completada: 'purple' }
  return colors[estado] || 'grey'
}

function getEstadoIcon(estado) {
  const icons = { Programada: 'schedule', 'En Curso': 'play_circle', Completada: 'check_circle' }
  return icons[estado] || 'info'
}

function verDetalles(eval_) {
  evaluacionSeleccionada.value = eval_
  showDetalles.value = true
}

function verPatron(eval_) {
  $q.notify({ message: `Abriendo patrón de: ${eval_.materia}`, icon: 'fact_check' })
}
</script>

<style scoped>
.evaluaciones-docente {
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.filters-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.evaluaciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.eval-card {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.eval-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.eval-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.eval-materia {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.eval-grupo {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.eval-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.eval-preguntas {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--text-primary);
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.detalles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detalle-item {
  display: flex;
  flex-direction: column;
}

.detalle-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

.detalle-value {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 500;
}
</style>
