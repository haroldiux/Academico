<template>
  <q-page class="grupos-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">
          <q-icon name="groups" color="teal" class="q-mr-sm" />
          Gestión de Grupos
        </h1>
        <p class="page-subtitle">Administra los grupos y paralelos de cada carrera</p>
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
        style="min-width: 200px;"
        @update:model-value="onSedeChange"
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
        style="min-width: 250px;"
        :disable="!filtros.sede"
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
        <q-icon name="groups" size="28px" color="teal" />
        <div class="stat-info">
          <span class="stat-value">{{ gruposFiltrados.length }}</span>
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
      <div class="stat-card">
        <q-icon name="menu_book" size="28px" color="purple" />
        <div class="stat-info">
          <span class="stat-value">{{ totalMaterias }}</span>
          <span class="stat-label">Materias Asignadas</span>
        </div>
      </div>
    </div>

    <!-- Grid de Grupos -->
    <div class="grupos-grid">
      <div v-for="grupo in gruposFiltrados" :key="grupo.id" class="grupo-card">
        <div class="grupo-header">
          <div class="grupo-badge">
            <span class="grupo-letra">{{ grupo.paralelo }}</span>
          </div>
          <div class="grupo-info">
            <h3 class="grupo-nombre">Grupo {{ grupo.paralelo }}</h3>
            <p class="grupo-carrera">{{ grupo.carrera_nombre }}</p>
          </div>
          <q-btn flat round dense icon="more_vert" size="sm">
            <q-menu>
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup @click="openDialog(grupo)">
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

        <div class="grupo-stats">
          <div class="stat-item">
            <q-icon name="people" size="18px" color="blue" />
            <span>{{ grupo.estudiantes }} estudiantes</span>
          </div>
          <div class="stat-item">
            <q-icon name="calendar_today" size="18px" color="orange" />
            <span>{{ grupo.semestre }}° Semestre</span>
          </div>
          <div class="stat-item">
            <q-icon name="event" size="18px" color="green" />
            <span>Gestión {{ grupo.gestion }}</span>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <div class="grupo-materias">
          <p class="section-title">
            <q-icon name="menu_book" size="16px" class="q-mr-xs" />
            Materias Asignadas
          </p>
          <div class="materias-list">
            <div v-for="materia in grupo.materias" :key="materia.id" class="materia-item">
              <div class="materia-info">
                <span class="materia-codigo">{{ materia.codigo }}</span>
                <span class="materia-nombre">{{ materia.nombre }}</span>
              </div>
              <q-avatar size="24px" color="green-2" text-color="green-9">
                {{ materia.docente?.charAt(0) || '?' }}
                <q-tooltip v-if="materia.docente">{{ materia.docente }}</q-tooltip>
              </q-avatar>
            </div>
            <div v-if="!grupo.materias?.length" class="text-grey-5 text-center q-pa-sm">
              Sin materias asignadas
            </div>
          </div>
        </div>

        <div class="grupo-actions">
          <q-btn flat color="primary" icon="assignment" label="Asignar Materias" size="sm" no-caps @click="asignarMaterias(grupo)" />
        </div>
      </div>

      <div v-if="gruposFiltrados.length === 0" class="empty-state">
        <q-icon name="groups" size="80px" color="grey-4" />
        <h3>No hay grupos</h3>
        <p>Crea un nuevo grupo para comenzar</p>
        <q-btn unelevated color="teal" icon="add" label="Nuevo Grupo" no-caps @click="openDialog()" />
      </div>
    </div>

    <!-- Dialog Crear/Editar Grupo -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="dialog-card" style="min-width: 500px;">
        <div class="dialog-header" style="background: linear-gradient(135deg, #14b8a6, #0d9488);">
          <h3>
            <q-icon :name="editMode ? 'edit' : 'add_circle'" class="q-mr-sm" />
            {{ editMode ? 'Editar' : 'Nuevo' }} Grupo
          </h3>
        </div>

        <q-card-section class="q-gutter-md">
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
              />
            </div>
            <div class="col-6">
              <q-select
                v-model="form.carrera_id"
                :options="carrerasFormOptions"
                outlined
                label="Carrera *"
                emit-value
                map-options
                :disable="!form.sede_id"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-4">
              <q-select
                v-model="form.paralelo"
                :options="paralelosOptions"
                outlined
                label="Paralelo *"
                emit-value
                map-options
              />
            </div>
            <div class="col-4">
              <q-select
                v-model="form.semestre"
                :options="semestresOptions"
                outlined
                label="Semestre *"
                emit-value
                map-options
              />
            </div>
            <div class="col-4">
              <q-select
                v-model="form.gestion"
                :options="gestionesOptions"
                outlined
                label="Gestión *"
                emit-value
                map-options
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model.number="form.capacidad" outlined type="number" label="Capacidad Máxima" min="1" />
            </div>
            <div class="col-6">
              <q-input v-model.number="form.estudiantes" outlined type="number" label="Estudiantes Inscritos" min="0" />
            </div>
          </div>

          <q-input v-model="form.aula" outlined label="Aula Principal" placeholder="Ej: Aula 301" />

          <q-toggle v-model="form.activo" label="Grupo activo" />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" @click="closeDialog" />
          <q-btn unelevated color="teal" :label="editMode ? 'Guardar Cambios' : 'Crear Grupo'" @click="guardarGrupo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Asignar Materias -->
    <q-dialog v-model="showMateriasDialog" persistent>
      <q-card class="dialog-card" style="min-width: 600px;">
        <div class="dialog-header" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
          <h3><q-icon name="assignment" class="q-mr-sm" /> Asignar Materias al Grupo {{ grupoSeleccionado?.paralelo }}</h3>
        </div>

        <q-card-section>
          <p class="text-subtitle2 q-mb-md">
            {{ grupoSeleccionado?.carrera_nombre }} - {{ grupoSeleccionado?.semestre }}° Semestre
          </p>

          <q-table
            :rows="materiasDisponibles"
            :columns="materiasColumns"
            row-key="id"
            flat
            dense
            selection="multiple"
            v-model:selected="materiasSeleccionadas"
          >
            <template v-slot:body-cell-docente="props">
              <q-td :props="props">
                <q-select
                  v-model="props.row.docente_asignado"
                  :options="docentesOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  style="min-width: 180px;"
                  placeholder="Seleccionar docente"
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" @click="showMateriasDialog = false" />
          <q-btn unelevated color="purple" label="Guardar Asignación" @click="guardarAsignacionMaterias" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'

const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()

const showDialog = ref(false)
const showMateriasDialog = ref(false)
const editMode = ref(false)
const grupoSeleccionado = ref(null)
const materiasSeleccionadas = ref([])

const filtros = ref({
  sede: null,
  carrera: null,
  semestre: null,
  gestion: 2026
})

const form = ref({
  id: null,
  sede_id: null,
  carrera_id: null,
  paralelo: 'A',
  semestre: 1,
  gestion: 2026,
  capacidad: 40,
  estudiantes: 0,
  aula: '',
  activo: true
})

// Datos de ejemplo
const grupos = ref([
  { id: 1, carrera_id: 1, carrera_nombre: 'Ing. de Sistemas', paralelo: 'A', semestre: 1, gestion: 2026, estudiantes: 35, capacidad: 40, aula: 'Aula 101', materias: [
    { id: 1, codigo: 'MAT-101', nombre: 'Cálculo I', docente: 'Dr. Juan Pérez' },
    { id: 2, codigo: 'FIS-101', nombre: 'Física I', docente: 'Ing. Carlos Mendoza' },
    { id: 3, codigo: 'PRG-101', nombre: 'Programación I', docente: 'Ing. Pedro García' }
  ]},
  { id: 2, carrera_id: 1, carrera_nombre: 'Ing. de Sistemas', paralelo: 'B', semestre: 1, gestion: 2026, estudiantes: 32, capacidad: 40, aula: 'Aula 102', materias: [
    { id: 1, codigo: 'MAT-101', nombre: 'Cálculo I', docente: 'Lic. María López' },
    { id: 2, codigo: 'FIS-101', nombre: 'Física I', docente: 'Ing. Carlos Mendoza' }
  ]},
  { id: 3, carrera_id: 1, carrera_nombre: 'Ing. de Sistemas', paralelo: 'A', semestre: 2, gestion: 2026, estudiantes: 28, capacidad: 40, aula: 'Aula 201', materias: [] },
  { id: 4, carrera_id: 2, carrera_nombre: 'Medicina', paralelo: 'A', semestre: 1, gestion: 2026, estudiantes: 45, capacidad: 50, aula: 'Anfiteatro 1', materias: [
    { id: 7, codigo: 'MED-101', nombre: 'Anatomía I', docente: 'Dr. Luis Vargas' }
  ]},
  { id: 5, carrera_id: 3, carrera_nombre: 'Derecho', paralelo: 'A', semestre: 1, gestion: 2026, estudiantes: 38, capacidad: 40, aula: 'Aula 301', materias: [] }
])

const materiasColumns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'nombre', label: 'Materia', field: 'nombre', align: 'left' },
  { name: 'docente', label: 'Docente Asignado', field: 'docente', align: 'left' }
]

const materiasDisponibles = ref([
  { id: 1, codigo: 'MAT-101', nombre: 'Cálculo I', docente_asignado: null },
  { id: 2, codigo: 'FIS-101', nombre: 'Física I', docente_asignado: null },
  { id: 3, codigo: 'PRG-101', nombre: 'Programación I', docente_asignado: null },
  { id: 4, codigo: 'QUI-101', nombre: 'Química General', docente_asignado: null }
])

const docentesOptions = [
  { label: 'Dr. Juan Pérez', value: 'Dr. Juan Pérez' },
  { label: 'Lic. María López', value: 'Lic. María López' },
  { label: 'Ing. Carlos Mendoza', value: 'Ing. Carlos Mendoza' },
  { label: 'Ing. Pedro García', value: 'Ing. Pedro García' }
]

const sedesOptions = computed(() => 
  sedesStore.sedes.map(s => ({ label: s.nombre, value: s.id }))
)

const carrerasFiltradas = computed(() => {
  if (!filtros.value.sede) return []
  return carrerasStore.getCarrerasBySede(filtros.value.sede).map(c => ({ label: c.nombre, value: c.id }))
})

const carrerasFormOptions = computed(() => {
  if (!form.value.sede_id) return []
  return carrerasStore.getCarrerasBySede(form.value.sede_id).map(c => ({ label: c.nombre, value: c.id }))
})

const semestresOptions = [
  { label: '1° Semestre', value: 1 },
  { label: '2° Semestre', value: 2 },
  { label: '3° Semestre', value: 3 },
  { label: '4° Semestre', value: 4 },
  { label: '5° Semestre', value: 5 },
  { label: '6° Semestre', value: 6 },
  { label: '7° Semestre', value: 7 },
  { label: '8° Semestre', value: 8 }
]

const gestionesOptions = [
  { label: '2026', value: 2026 },
  { label: '2025', value: 2025 },
  { label: '2024', value: 2024 }
]

const paralelosOptions = [
  { label: 'Paralelo A', value: 'A' },
  { label: 'Paralelo B', value: 'B' },
  { label: 'Paralelo C', value: 'C' },
  { label: 'Paralelo D', value: 'D' },
  { label: 'Paralelo E', value: 'E' }
]

const gruposFiltrados = computed(() => {
  let resultado = grupos.value

  if (filtros.value.carrera) {
    resultado = resultado.filter(g => g.carrera_id === filtros.value.carrera)
  }

  if (filtros.value.semestre) {
    resultado = resultado.filter(g => g.semestre === filtros.value.semestre)
  }

  if (filtros.value.gestion) {
    resultado = resultado.filter(g => g.gestion === filtros.value.gestion)
  }

  return resultado
})

const totalEstudiantes = computed(() => 
  gruposFiltrados.value.reduce((sum, g) => sum + g.estudiantes, 0)
)

const totalDocentes = computed(() => {
  const docentes = new Set()
  gruposFiltrados.value.forEach(g => g.materias?.forEach(m => m.docente && docentes.add(m.docente)))
  return docentes.size
})

const totalMaterias = computed(() => 
  gruposFiltrados.value.reduce((sum, g) => sum + (g.materias?.length || 0), 0)
)

function onSedeChange() {
  filtros.value.carrera = null
}

function onFormSedeChange() {
  form.value.carrera_id = null
}

function openDialog(grupo = null) {
  if (grupo) {
    editMode.value = true
    form.value = { ...grupo }
  } else {
    editMode.value = false
    form.value = {
      id: null,
      sede_id: null,
      carrera_id: null,
      paralelo: 'A',
      semestre: 1,
      gestion: 2026,
      capacidad: 40,
      estudiantes: 0,
      aula: '',
      activo: true
    }
  }
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
}

function guardarGrupo() {
  if (editMode.value) {
    const idx = grupos.value.findIndex(g => g.id === form.value.id)
    if (idx !== -1) {
      grupos.value[idx] = { ...grupos.value[idx], ...form.value }
    }
  } else {
    const newId = Math.max(...grupos.value.map(g => g.id), 0) + 1
    const carrera = carrerasStore.carreras.find(c => c.id === form.value.carrera_id)
    grupos.value.push({ 
      ...form.value, 
      id: newId, 
      carrera_nombre: carrera?.nombre || '',
      materias: [] 
    })
  }
  closeDialog()
}

function asignarMaterias(grupo) {
  grupoSeleccionado.value = grupo
  materiasSeleccionadas.value = []
  showMateriasDialog.value = true
}

function guardarAsignacionMaterias() {
  if (grupoSeleccionado.value) {
    grupoSeleccionado.value.materias = materiasSeleccionadas.value.map(m => ({
      id: m.id,
      codigo: m.codigo,
      nombre: m.nombre,
      docente: m.docente_asignado
    }))
  }
  showMateriasDialog.value = false
}

function verHorario(grupo) {
  console.log('Ver horario de grupo:', grupo)
}

function eliminarGrupo(grupo) {
  if (confirm(`¿Estás seguro de eliminar el Grupo ${grupo.paralelo}?`)) {
    grupos.value = grupos.value.filter(g => g.id !== grupo.id)
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
  gap: 16px;
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

.grupos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.grupo-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s ease;
}

.grupo-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.grupo-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.grupo-badge {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grupo-letra {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
}

.grupo-info {
  flex: 1;
}

.grupo-nombre {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.grupo-carrera {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.grupo-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
}

.materias-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.materia-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-radius: 8px;
}

.materia-codigo {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--primary);
  margin-right: 8px;
}

.materia-nombre {
  font-size: 0.8rem;
  color: var(--text-primary);
}

.grupo-actions {
  margin-top: 16px;
  text-align: center;
}

.empty-state {
  grid-column: 1 / -1;
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
  margin-bottom: 24px;
}

.dialog-card {
  background: var(--bg-secondary) !important;
  border-radius: 16px !important;
}

.dialog-header {
  padding: 20px 24px;
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
