<template>
  <q-page class="grupos-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">
          <q-icon name="groups" color="teal" class="q-mr-sm" />
          Gestión de Grupos por Materia
        </h1>
        <p class="page-subtitle">Visualiza los grupos/paralelos organizados por materia, docente y horario</p>
      </div>
      <div class="header-actions">
        <q-btn
          flat
          color="teal"
          icon="refresh"
          label="Actualizar"
          no-caps
          :loading="gruposStore.loading"
          @click="refrescarDatos"
        />
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <q-select
        v-model="filtros.sede"
        :options="sedesOptions"
        outlined
        dense
        label="Sede"
        emit-value
        map-options
        style="min-width: 180px;"
        @update:model-value="onFiltroChange"
      />
      <q-select
        v-model="filtros.carrera"
        :options="carrerasOptions"
        outlined
        dense
        label="Carrera"
        emit-value
        map-options
        style="min-width: 220px;"
        @update:model-value="onFiltroChange"
      />
      <q-select
        v-model="filtros.gestion"
        :options="gestionesOptions"
        outlined
        dense
        label="Gestión"
        emit-value
        map-options
        style="min-width: 130px;"
        @update:model-value="onFiltroChange"
      />
      <q-select
        v-model="filtros.semestre"
        :options="semestresOptions"
        outlined
        dense
        label="Semestre"
        emit-value
        map-options
        clearable
        style="min-width: 150px;"
      />
    </div>

    <!-- Estadísticas -->
    <div class="stats-row">
      <div class="stat-card">
        <q-icon name="menu_book" size="28px" color="purple" />
        <div class="stat-info">
          <span class="stat-value">{{ materiasFiltradas.length }}</span>
          <span class="stat-label">Materias</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="groups" size="28px" color="teal" />
        <div class="stat-info">
          <span class="stat-value">{{ gruposStore.metaExterno.total_grupos || totalGrupos }}</span>
          <span class="stat-label">Horarios/Grupos</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="person" size="28px" color="green" />
        <div class="stat-info">
          <span class="stat-value">{{ gruposStore.metaExterno.total_docentes || 0 }}</span>
          <span class="stat-label">Docentes</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="location_city" size="28px" color="indigo" />
        <div class="stat-info">
          <span class="stat-value">{{ gruposStore.metaExterno.carrera || '-' }}</span>
          <span class="stat-label">Carrera</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="gruposStore.loading" class="loading-state">
      <q-spinner-dots size="50px" color="teal" />
      <p>Cargando datos desde el sistema académico...</p>
    </div>

    <!-- Vista por Materias con sus Grupos -->
    <div v-else class="materias-container">
      <div v-for="materia in materiasFiltradas" :key="materia.codigo + '-' + materia.semestre" class="materia-section">
        <div class="materia-header">
          <div class="materia-info">
            <q-chip color="blue-1" text-color="blue-10" size="sm" dense class="text-weight-bold">{{ materia.codigo }}</q-chip>
            <h3 class="materia-nombre">{{ materia.nombre }}</h3>
            <div class="materia-meta">
              <q-chip size="xs" color="purple-2" text-color="purple-9">{{ materia.carrera }}</q-chip>
              <q-chip size="xs" color="blue-2" text-color="blue-9">{{ materia.sede_nombre }}</q-chip>
              <q-chip size="xs" outline>{{ materia.semestre }}° Sem</q-chip>
              <q-chip size="xs" color="grey-3" text-color="grey-8">{{ materia.gestion }}</q-chip>
            </div>
          </div>
          <q-chip color="teal-1" text-color="teal-9" icon="schedule">
            {{ materia.grupos?.length || 0 }} horarios
          </q-chip>
        </div>

        <div class="grupos-grid">
          <div v-for="(grupo, idx) in materia.grupos" :key="idx" class="grupo-card">
            <div class="grupo-header">
              <div class="grupo-badge" :class="grupo.tipo_clase === 'Teorico' ? 'teorico' : 'practico'">
                <span class="grupo-numero">{{ grupo.grupo }}</span>
              </div>
              <div class="grupo-info">
                <span class="grupo-title">Grupo {{ grupo.grupo }} - {{ grupo.tipo_clase }}</span>
                <span class="grupo-dia">{{ grupo.dia }}</span>
              </div>
              <q-chip
                :color="grupo.tipo_clase === 'Teorico' ? 'blue-2' : 'orange-2'"
                :text-color="grupo.tipo_clase === 'Teorico' ? 'blue-9' : 'orange-9'"
                size="xs"
                dense
              >
                {{ grupo.tipo_clase }}
              </q-chip>
            </div>

            <div class="grupo-content">
              <div class="info-row">
                <q-icon name="person" size="16px" color="green" />
                <span class="docente-nombre">{{ grupo.docente || 'Sin asignar' }}</span>
              </div>
              <div class="info-row">
                <q-icon name="schedule" size="16px" color="indigo" />
                <span class="horario-text">{{ grupo.hora_inicio }} - {{ grupo.hora_fin }}</span>
              </div>
              <div class="info-row">
                <q-icon name="room" size="16px" color="orange" />
                <span>{{ grupo.aula || 'Sin aula' }}</span>
              </div>
              <div class="info-row">
                <q-icon name="apartment" size="16px" color="purple" />
                <span>{{ grupo.bloque || '-' }}</span>
              </div>
              <div class="info-row">
                <q-icon name="event_seat" size="16px" color="blue" />
                <span>Capacidad: {{ grupo.capacidad }} | Pupitres: {{ grupo.pupitres || '-' }}</span>
              </div>
            </div>
          </div>

          <div v-if="!materia.grupos?.length" class="empty-grupos">
            <q-icon name="group_off" size="32px" color="grey-5" />
            <span>Sin horarios asignados</span>
          </div>
        </div>
      </div>

      <div v-if="materiasFiltradas.length === 0 && !gruposStore.loading" class="empty-state">
        <q-icon name="menu_book" size="80px" color="grey-4" />
        <h3>No hay materias</h3>
        <p>No se encontraron materias para los filtros seleccionados</p>
        <q-btn unelevated color="teal" icon="refresh" label="Recargar" @click="fetchData" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useGruposStore } from 'src/stores/grupos'
import { useSedesStore } from 'src/stores/sedes'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const gruposStore = useGruposStore()
const sedesStore = useSedesStore()

const filtros = ref({
  sede: null, // ID interno
  carrera: 'carsis',
  gestion: '1-2026',
  semestre: null
})

// Opciones de filtros - Sedes dinámicas del backend
const sedesOptions = computed(() => sedesStore.getSedesOptions())

const carrerasOptions = [
  { label: 'Ingeniería de Sistemas', value: 'carsis' },
  { label: 'Medicina', value: 'med' },
  { label: 'Derecho', value: 'der' },
  { label: 'Odontología', value: 'odo' },
  { label: 'Enfermería', value: 'enf' },
  { label: 'Contaduría', value: 'cont' },
  { label: 'Administración', value: 'adm' }
]

const gestionesOptions = [
  { label: '1-2026', value: '1-2026' },
  { label: '2-2025', value: '2-2025' },
  { label: '1-2025', value: '1-2025' },
  { label: '2-2024', value: '2-2024' }
]

const semestresOptions = [
  { label: 'Todos', value: null },
  { label: '1° Semestre', value: 1 },
  { label: '2° Semestre', value: 2 },
  { label: '3° Semestre', value: 3 },
  { label: '4° Semestre', value: 4 },
  { label: '5° Semestre', value: 5 },
  { label: '6° Semestre', value: 6 },
  { label: '7° Semestre', value: 7 },
  { label: '8° Semestre', value: 8 },
  { label: '9° Semestre', value: 9 },
  { label: '10° Semestre', value: 10 }
]

// Materias filtradas por semestre (del frontend)
const materiasFiltradas = computed(() => {
  const materias = gruposStore.materiasExterno || []
  if (!filtros.value.semestre) return materias
  return materias.filter(m => m.semestre === filtros.value.semestre)
})

// Stats
const totalGrupos = computed(() =>
  materiasFiltradas.value.reduce((sum, m) => sum + (m.grupos?.length || 0), 0)
)

// Methods
async function fetchData() {
  if (!filtros.value.sede) return

  // Usar el id_api de la sede para la API externa
  const sedeApiId = sedesStore.getSedeApiId(filtros.value.sede)

  await gruposStore.fetchGruposExterno({
    gestion: filtros.value.gestion,
    carrera: filtros.value.carrera,
    sede: sedeApiId
  })
}

function onFiltroChange() {
  fetchData()
}

async function refrescarDatos() {
  if (!filtros.value.sede) return

  const sedeApiId = sedesStore.getSedeApiId(filtros.value.sede)

  await gruposStore.refrescarGruposExterno({
    gestion: filtros.value.gestion,
    carrera: filtros.value.carrera,
    sede: sedeApiId
  })
  $q.notify({ type: 'positive', message: 'Datos actualizados', icon: 'check' })
}

// Watch semestre filter (client-side only)
watch(() => filtros.value.semestre, () => {
  // No API call needed, filtering is client-side
})

// Lifecycle
onMounted(async () => {
  // Cargar sedes del backend
  await sedesStore.fetchSedes()

  // Seleccionar Cochabamba por defecto (id=1)
  if (sedesStore.sedes.length > 0) {
    filtros.value.sede = sedesStore.sedes.find(s => s.codigo === 'CBA')?.id || sedesStore.sedes[0].id
  }

  fetchData()
})
</script>

<style scoped>
.grupos-page {
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

.filters-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: block;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  color: var(--text-muted);
}

.materias-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.materia-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
}

.materia-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.materia-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.materia-nombre {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.materia-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.grupos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.grupo-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.grupo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.grupo-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.grupo-badge {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grupo-badge.teorico {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.grupo-badge.practico {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.grupo-numero {
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
}

.grupo-info {
  flex: 1;
}

.grupo-title {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.grupo-dia {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
}

.grupo-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.docente-nombre {
  font-weight: 500;
  color: var(--text-primary);
}

.horario-text {
  font-weight: 600;
  color: var(--primary);
}

.empty-grupos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  gap: 8px;
  color: var(--text-muted);
  border: 2px dashed var(--border-color);
  border-radius: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.empty-state h3 {
  color: var(--text-primary);
  margin: 16px 0 8px;
}

.empty-state p {
  color: var(--text-muted);
}

@media (max-width: 1024px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .stats-row { grid-template-columns: 1fr; }
  .grupos-grid { grid-template-columns: 1fr; }
}
</style>
