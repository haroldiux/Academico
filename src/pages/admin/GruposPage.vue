<template>
  <q-page class="grupos-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">
          <q-icon name="groups" color="teal" class="q-mr-sm" />
          Gestión de Grupos por Materia
        </h1>
        <p class="page-subtitle">Administra los grupos/paralelos de cada materia por sede y carrera</p>
      </div>
      <div class="header-actions">
        <q-btn unelevated color="teal" icon="add" label="Nuevo Grupo" no-caps @click="openDialog()" />
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
        clearable
        style="min-width: 180px;"
        @update:model-value="onSedeChange"
      />
      <q-select
        v-model="filtros.campus"
        :options="campusFiltrados"
        outlined
        dense
        label="Campus"
        emit-value
        map-options
        clearable
        style="min-width: 200px;"
        :disable="!filtros.sede"
      />
      <q-select
        v-model="filtros.carrera"
        :options="carrerasFiltradas"
        outlined
        dense
        label="Carrera"
        emit-value
        map-options
        clearable
        style="min-width: 220px;"
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
      <q-select
        v-model="filtros.gestion"
        :options="gestionesOptions"
        outlined
        dense
        label="Gestión"
        emit-value
        map-options
        style="min-width: 120px;"
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
          <span class="stat-value">{{ totalGrupos }}</span>
          <span class="stat-label">Grupos</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="people" size="28px" color="blue" />
        <div class="stat-info">
          <span class="stat-value">{{ totalEstudiantes }}</span>
          <span class="stat-label">Estudiantes</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="person" size="28px" color="green" />
        <div class="stat-info">
          <span class="stat-value">{{ totalDocentes }}</span>
          <span class="stat-label">Docentes</span>
        </div>
      </div>
    </div>

    <!-- Vista por Materias con sus Grupos -->
    <div class="materias-container">
      <div v-for="materia in materiasFiltradas" :key="materia.id" class="materia-section">
        <div class="materia-header">
          <div class="materia-info">
            <q-chip color="blue-1" text-color="blue-10" size="sm" dense class="text-weight-bold">{{ materia.codigo }}</q-chip>
            <h3 class="materia-nombre">{{ materia.nombre }}</h3>
            <div class="materia-meta">
              <q-chip size="xs" color="purple-2" text-color="purple-9">{{ materia.carrera_nombre }}</q-chip>
              <q-chip size="xs" color="blue-2" text-color="blue-9">{{ materia.sede_nombre }}</q-chip>
              <q-chip size="xs" outline>{{ materia.semestre }}° Sem</q-chip>
            </div>
          </div>
          <q-btn flat color="teal" icon="add" label="Agregar Grupo" size="sm" no-caps @click="agregarGrupoAMateria(materia)" />
        </div>

        <div class="grupos-grid">
          <div v-for="grupo in materia.grupos" :key="grupo.id" class="grupo-card">
            <div class="grupo-header">
              <div class="grupo-badge">
                <span class="grupo-numero">{{ grupo.numero }}</span>
              </div>
              <div class="grupo-info">
                <span class="grupo-title">Grupo {{ grupo.numero }}</span>
                <span class="grupo-campus">{{ grupo.campus_nombre }}</span>
              </div>
              <q-btn flat round dense icon="more_vert" size="sm">
                <q-menu>
                  <q-list style="min-width: 150px">
                    <q-item clickable v-close-popup @click="editarGrupo(grupo)">
                      <q-item-section avatar><q-icon name="edit" size="sm" /></q-item-section>
                      <q-item-section>Editar</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="verHorario(grupo)">
                      <q-item-section avatar><q-icon name="schedule" size="sm" /></q-item-section>
                      <q-item-section>Horario</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable v-close-popup @click="eliminarGrupo(grupo)" class="text-red">
                      <q-item-section avatar><q-icon name="delete" size="sm" color="red" /></q-item-section>
                      <q-item-section>Eliminar</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <div class="grupo-content">
              <div class="info-row">
                <q-icon name="person" size="16px" color="green" />
                <span class="docente-nombre">{{ grupo.docente_nombre || 'Sin asignar' }}</span>
              </div>
              <div class="info-row">
                <q-icon name="people" size="16px" color="blue" />
                <span>{{ grupo.estudiantes }} / {{ grupo.capacidad }} estudiantes</span>
              </div>
              <div class="info-row">
                <q-icon name="room" size="16px" color="orange" />
                <span>{{ grupo.aula || 'Sin aula' }}</span>
              </div>
            </div>

            <q-linear-progress
              :value="grupo.estudiantes / grupo.capacidad"
              :color="grupo.estudiantes >= grupo.capacidad ? 'red' : 'green'"
              class="q-mt-sm"
              rounded
            />
          </div>

          <div v-if="!materia.grupos?.length" class="empty-grupos">
            <q-icon name="group_off" size="32px" color="grey-5" />
            <span>Sin grupos asignados</span>
            <q-btn flat color="teal" size="sm" icon="add" label="Crear grupo" no-caps @click="agregarGrupoAMateria(materia)" />
          </div>
        </div>
      </div>

      <div v-if="materiasFiltradas.length === 0" class="empty-state">
        <q-icon name="menu_book" size="80px" color="grey-4" />
        <h3>No hay materias</h3>
        <p>Selecciona una sede y carrera para ver las materias y sus grupos</p>
      </div>
    </div>

    <!-- Dialog Crear/Editar Grupo -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="dialog-card" style="min-width: 550px;">
        <div class="dialog-header">
          <h3>
            <q-icon :name="editMode ? 'edit' : 'add_circle'" class="q-mr-sm" />
            {{ editMode ? 'Editar' : 'Nuevo' }} Grupo
          </h3>
        </div>

        <q-card-section class="q-gutter-md">
          <q-banner v-if="materiaSeleccionada" dense class="bg-purple-1 text-purple-9 q-mb-md">
            <template v-slot:avatar>
              <q-icon name="menu_book" />
            </template>
            <strong>{{ materiaSeleccionada.codigo }}</strong> - {{ materiaSeleccionada.nombre }}
          </q-banner>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-select
                v-model="form.sede_id"
                :options="sedesOptions"
                outlined
                label="Sede *"
                emit-value
                map-options
                @update:model-value="onFormSedeChange"
                :disable="!!materiaSeleccionada"
              />
            </div>
            <div class="col-6">
              <q-select
                v-model="form.campus_id"
                :options="campusFormOptions"
                outlined
                label="Campus *"
                emit-value
                map-options
                :disable="!form.sede_id"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-4">
              <q-input v-model.number="form.numero" outlined type="number" label="Número de Grupo *" min="1" />
            </div>
            <div class="col-4">
              <q-input v-model.number="form.capacidad" outlined type="number" label="Capacidad" min="1" />
            </div>
            <div class="col-4">
              <q-input v-model.number="form.estudiantes" outlined type="number" label="Inscritos" min="0" />
            </div>
          </div>

          <q-select
            v-model="form.docente_id"
            :options="docentesOptions"
            outlined
            label="Docente Asignado"
            emit-value
            map-options
            clearable
          />

          <q-input v-model="form.aula" outlined label="Aula" placeholder="Ej: Aula 301, Lab. A" />

          <q-input v-model="form.horario" outlined label="Horario" placeholder="Ej: Lun-Mie-Vie 8:00-10:00" />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" @click="closeDialog" />
          <q-btn unelevated color="teal" :label="editMode ? 'Guardar' : 'Crear Grupo'" @click="guardarGrupo" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'
import { useGruposStore } from 'src/stores/grupos'
import { useDocentesStore } from 'src/stores/docentes'

const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()
const gruposStore = useGruposStore()
const docentesStore = useDocentesStore()

const showDialog = ref(false)
const editMode = ref(false)
const materiaSeleccionada = ref(null)

const filtros = ref({
  sede: null,
  campus: null,
  carrera: null,
  semestre: null,
  gestion: 2026
})

const form = ref({
  id: null,
  materia_id: null,
  sede_id: null,
  campus_id: null,
  numero: 1,
  docente_id: null,
  capacidad: 40,
  estudiantes: 0,
  aula: '',
  horario: ''
})

// Computed Options
const sedesOptions = computed(() =>
  sedesStore.sedes.map(s => ({ label: s.nombre, value: s.id }))
)

const campusFiltrados = computed(() => {
  if (!filtros.value.sede) return []
  return sedesStore.getCampusBySede(filtros.value.sede).map(c => ({ label: c.nombre, value: c.id }))
})

const campusFormOptions = computed(() => {
  if (!form.value.sede_id) return []
  return sedesStore.getCampusBySede(form.value.sede_id).map(c => ({ label: c.nombre, value: c.id }))
})

const carrerasFiltradas = computed(() => {
    // If sede selected, filter careers by sede
    if (filtros.value.sede) {
        return carrerasStore.getCarrerasBySede(filtros.value.sede).map(c => ({ label: c.nombre, value: c.id }))
    }
    return carrerasStore.carreras.map(c => ({ label: c.nombre, value: c.id }))
})

// Load Docentes for Select (Ideally should be paginated or search-based, but loading 800 is okay for select)
// To avoid loading 800 at once, we might want to filter by Sede in the dialog.
const docentesOptions = computed(() =>
  docentesStore.docentes.map(d => ({ label: d.nombre_completo || d.nombre, value: d.id }))
)

const semestresOptions = [
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

const gestionesOptions = [
  { label: '2026', value: 2026 },
  { label: '2025', value: 2025 },
  { label: '2024', value: 2024 }
]

// Data from Store
const materiasFiltradas = computed(() => gruposStore.materias)

// Stats
const totalGrupos = computed(() =>
  materiasFiltradas.value.reduce((sum, m) => sum + (m.grupos?.length || 0), 0)
)

const totalEstudiantes = computed(() =>
  materiasFiltradas.value.reduce((sum, m) =>
    sum + (m.grupos?.reduce((gs, g) => gs + (g.estudiantes || 0), 0) || 0), 0)
)

const totalDocentes = computed(() => {
  const docentesSet = new Set()
  materiasFiltradas.value.forEach(m =>
    m.grupos?.forEach(g => g.docente_id && docentesSet.add(g.docente_id))
  )
  return docentesSet.size
})

// Methods
async function fetchData() {
    const params = {
        sede_id: filtros.value.sede,
        carrera_id: filtros.value.carrera,
        semestre: filtros.value.semestre,
        per_page: 20 // Adjust as needed
    }
    await gruposStore.fetchGrupos(params)
}

function onSedeChange() {
  filtros.value.campus = null
  fetchData()
}

// Watch filters
watch(() => [filtros.value.carrera, filtros.value.semestre], () => {
    fetchData()
})

// Lifecycle
onMounted(async () => {
    await Promise.all([
        sedesStore.fetchSedes(),
        carrerasStore.fetchCarreras(),
        docentesStore.fetchDocentes({ per_page: 100 }), // Load initial teachers, ideally search
        fetchData()
    ])
})


function onFormSedeChange() {
  form.value.campus_id = null
}

function openDialog() {
  editMode.value = false
  materiaSeleccionada.value = null
  form.value = {
    id: null,
    materia_id: null,
    sede_id: null,
    campus_id: null,
    numero: 1,
    docente_id: null,
    capacidad: 40,
    estudiantes: 0,
    aula: '',
    horario: ''
  }
  showDialog.value = true
}

function agregarGrupoAMateria(materia) {
  editMode.value = false
  materiaSeleccionada.value = materia
  form.value = {
    id: null,
    materia_id: materia.id,
    sede_id: materia.sede_id, // Ensure backend returns sede_id or map it
    campus_id: null,
    numero: (materia.grupos?.length || 0) + 1,
    docente_id: null,
    capacidad: 40,
    estudiantes: 0,
    aula: '',
    horario: ''
  }
  showDialog.value = true
}

function editarGrupo(grupo) {
  editMode.value = true
  const materia = materiasFiltradas.value.find(m => m.grupos?.some(g => g.id === grupo.id))
  materiaSeleccionada.value = materia
  form.value = {
    ...grupo,
    materia_id: materia?.id,
    sede_id: materia?.sede_id,
  }
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  materiaSeleccionada.value = null
}

async function guardarGrupo() {
  if (materiaSeleccionada.value) {
      if (editMode.value) {
          // Update Logic (Call store)
          // await gruposStore.updateGrupo(...)
      } else {
          // Create Logic
          // const success = await gruposStore.createGrupo({ ...form.value, asignatura_id: materiaSeleccionada.value.id })
          // if (success) closeDialog()
      }
      // Since Store update logic isn't fully built for pivot yet, we'll implement full functionality in next step.
      // For now, let's refresh to show we connected read-only correctly.
      closeDialog()
      fetchData()
  }
}

function verHorario(grupo) {
  console.log('Ver horario de grupo:', grupo)
}

function eliminarGrupo(grupo) {
  if (confirm(`¿Estás seguro de eliminar el Grupo ${grupo.numero}?`)) {
    // Call store delete
  }
}
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.grupo-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
}

.grupo-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.grupo-badge {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grupo-numero {
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
}

.grupo-info {
  flex: 1;
}

.grupo-title {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
}

.grupo-campus {
  display: block;
  font-size: 0.7rem;
  color: var(--text-muted);
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

.dialog-card {
  background: var(--bg-secondary) !important;
  border-radius: 16px !important;
}

.dialog-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  color: white;
  margin: -16px -16px 16px -16px;
  border-radius: 16px 16px 0 0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
}

.dialog-actions {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 1024px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .stats-row { grid-template-columns: 1fr; }
  .grupos-grid { grid-template-columns: 1fr; }
}
</style>
