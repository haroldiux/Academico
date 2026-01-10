<template>
  <q-page class="asignaturas-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">
          <q-icon name="menu_book" color="primary" class="q-mr-sm" />
          Gestión de Asignaturas
        </h1>
        <p class="page-subtitle">Administra las materias del plan de estudios</p>
      </div>
      <div class="header-actions">
        <q-btn outline color="primary" icon="download" label="Exportar" no-caps />
        <q-btn unelevated color="primary" icon="add" label="Nueva Asignatura" no-caps @click="openDialog()" />
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
      <q-input
        v-model="filtros.busqueda"
        outlined
        dense
        placeholder="Buscar asignatura..."
        class="search-input"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="stats-row">
      <div class="stat-card">
        <q-icon name="menu_book" size="28px" color="primary" />
        <div class="stat-info">
          <span class="stat-value">{{ asignaturasFiltradas.length }}</span>
          <span class="stat-label">Asignaturas</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="schedule" size="28px" color="blue" />
        <div class="stat-info">
          <span class="stat-value">{{ totalHoras }}</span>
          <span class="stat-label">Horas Totales</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="star" size="28px" color="amber" />
        <div class="stat-info">
          <span class="stat-value">{{ totalCreditos }}</span>
          <span class="stat-label">Créditos</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="person" size="28px" color="green" />
        <div class="stat-info">
          <span class="stat-value">{{ docentesAsignados }}</span>
          <span class="stat-label">Docentes Asignados</span>
        </div>
      </div>
    </div>

    <!-- Tabla de Asignaturas -->
    <q-card class="table-card">
      <q-table
        :rows="asignaturasFiltradas"
        :columns="columns"
        row-key="id"
        :pagination="{ rowsPerPage: 10 }"
        flat
        :loading="loading"
      >
        <template v-slot:body-cell-codigo="props">
          <q-td :props="props">
            <q-chip color="primary" text-color="white" size="sm" dense>
              {{ props.row.codigo }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <div class="asignatura-info">
              <span class="asignatura-nombre">{{ props.row.nombre }}</span>
              <span class="asignatura-carrera">{{ props.row.carrera_nombre }}</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-semestre="props">
          <q-td :props="props">
            <q-chip 
              :color="getSemestreColor(props.row.semestre)" 
              text-color="white" 
              size="sm" 
              dense
            >
              {{ props.row.semestre }}° Sem
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-docentes="props">
          <q-td :props="props">
            <div class="docentes-avatars">
              <q-avatar 
                v-for="(docente, idx) in props.row.docentes?.slice(0, 3)" 
                :key="idx"
                size="28px"
                color="grey-4"
                text-color="grey-8"
                class="docente-avatar"
              >
                {{ docente.charAt(0) }}
                <q-tooltip>{{ docente }}</q-tooltip>
              </q-avatar>
              <q-avatar 
                v-if="props.row.docentes?.length > 3" 
                size="28px" 
                color="primary" 
                text-color="white"
                class="docente-avatar"
              >
                +{{ props.row.docentes.length - 3 }}
              </q-avatar>
              <span v-if="!props.row.docentes?.length" class="text-grey-5">Sin asignar</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-chip 
              :color="props.row.activa ? 'green' : 'grey'" 
              text-color="white" 
              size="sm" 
              dense
            >
              {{ props.row.activa ? 'Activa' : 'Inactiva' }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn flat round dense icon="visibility" size="sm" color="primary" @click="verAsignatura(props.row)">
              <q-tooltip>Ver detalles</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="edit" size="sm" color="orange" @click="openDialog(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="group_add" size="sm" color="green" @click="asignarDocentes(props.row)">
              <q-tooltip>Asignar docentes</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete" size="sm" color="red" @click="eliminarAsignatura(props.row)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Crear/Editar Asignatura -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="dialog-card" style="min-width: 600px;">
        <div class="dialog-header">
          <h3>
            <q-icon :name="editMode ? 'edit' : 'add_circle'" class="q-mr-sm" />
            {{ editMode ? 'Editar' : 'Nueva' }} Asignatura
          </h3>
        </div>

        <q-card-section class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-4">
              <q-input v-model="form.codigo" outlined label="Código *" placeholder="MAT-101" />
            </div>
            <div class="col-8">
              <q-input v-model="form.nombre" outlined label="Nombre *" placeholder="Nombre de la asignatura" />
            </div>
          </div>

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
                v-model="form.semestre"
                :options="semestresOptions"
                outlined
                label="Semestre *"
                emit-value
                map-options
              />
            </div>
            <div class="col-4">
              <q-input v-model.number="form.horas_teoricas" outlined type="number" label="Horas Teóricas" min="0" />
            </div>
            <div class="col-4">
              <q-input v-model.number="form.horas_practicas" outlined type="number" label="Horas Prácticas" min="0" />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-4">
              <q-input v-model.number="form.creditos" outlined type="number" label="Créditos" min="0" />
            </div>
            <div class="col-8">
              <q-select
                v-model="form.prerequisitos"
                :options="asignaturasPrerequisito"
                outlined
                label="Prerequisitos"
                emit-value
                map-options
                multiple
                use-chips
              />
            </div>
          </div>

          <q-input 
            v-model="form.descripcion" 
            outlined 
            type="textarea" 
            rows="3" 
            label="Descripción"
            placeholder="Descripción de la asignatura..."
          />

          <q-toggle v-model="form.activa" label="Asignatura activa" />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" @click="closeDialog" />
          <q-btn unelevated color="primary" :label="editMode ? 'Guardar Cambios' : 'Crear Asignatura'" @click="guardarAsignatura" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Asignar Docentes -->
    <q-dialog v-model="showDocentesDialog" persistent>
      <q-card class="dialog-card" style="min-width: 500px;">
        <div class="dialog-header" style="background: linear-gradient(135deg, #22c55e, #16a34a);">
          <h3><q-icon name="group_add" class="q-mr-sm" /> Asignar Docentes</h3>
        </div>

        <q-card-section>
          <p class="text-subtitle2 q-mb-md">
            Asignatura: <strong>{{ asignaturaSeleccionada?.nombre }}</strong>
          </p>

          <q-select
            v-model="docentesSeleccionados"
            :options="docentesDisponibles"
            outlined
            label="Seleccionar Docentes"
            emit-value
            map-options
            multiple
            use-chips
          />

          <div class="q-mt-md">
            <p class="text-caption text-grey-6">Docentes actualmente asignados:</p>
            <div class="docentes-list">
              <q-chip 
                v-for="docente in asignaturaSeleccionada?.docentes" 
                :key="docente"
                removable
                @remove="removeDocente(docente)"
                color="green-2"
                text-color="green-9"
              >
                {{ docente }}
              </q-chip>
              <span v-if="!asignaturaSeleccionada?.docentes?.length" class="text-grey-5">
                Ningún docente asignado
              </span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" @click="showDocentesDialog = false" />
          <q-btn unelevated color="green" label="Guardar Asignación" @click="guardarDocentes" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'

const router = useRouter()
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()

const loading = ref(false)
const showDialog = ref(false)
const showDocentesDialog = ref(false)
const editMode = ref(false)
const asignaturaSeleccionada = ref(null)
const docentesSeleccionados = ref([])

const filtros = ref({
  sede: null,
  carrera: null,
  semestre: null,
  busqueda: ''
})

const form = ref({
  id: null,
  codigo: '',
  nombre: '',
  sede_id: null,
  carrera_id: null,
  semestre: null,
  horas_teoricas: 0,
  horas_practicas: 0,
  creditos: 0,
  prerequisitos: [],
  descripcion: '',
  activa: true
})

// Datos de ejemplo
const asignaturas = ref([
  { id: 1, codigo: 'MAT-101', nombre: 'Cálculo I', carrera_id: 1, carrera_nombre: 'Ing. de Sistemas', semestre: 1, horas_teoricas: 4, horas_practicas: 2, creditos: 6, docentes: ['Dr. Juan Pérez', 'Lic. María López'], activa: true },
  { id: 2, codigo: 'FIS-101', nombre: 'Física I', carrera_id: 1, carrera_nombre: 'Ing. de Sistemas', semestre: 1, horas_teoricas: 3, horas_practicas: 2, creditos: 5, docentes: ['Ing. Carlos Mendoza'], activa: true },
  { id: 3, codigo: 'PRG-101', nombre: 'Programación I', carrera_id: 1, carrera_nombre: 'Ing. de Sistemas', semestre: 1, horas_teoricas: 2, horas_practicas: 4, creditos: 6, docentes: ['Ing. Pedro García'], activa: true },
  { id: 4, codigo: 'MAT-201', nombre: 'Cálculo II', carrera_id: 1, carrera_nombre: 'Ing. de Sistemas', semestre: 2, horas_teoricas: 4, horas_practicas: 2, creditos: 6, docentes: [], activa: true },
  { id: 5, codigo: 'PRG-201', nombre: 'Programación II', carrera_id: 1, carrera_nombre: 'Ing. de Sistemas', semestre: 2, horas_teoricas: 2, horas_practicas: 4, creditos: 6, docentes: ['Ing. Pedro García', 'Lic. Ana Torres'], activa: true },
  { id: 6, codigo: 'BD-301', nombre: 'Base de Datos I', carrera_id: 1, carrera_nombre: 'Ing. de Sistemas', semestre: 3, horas_teoricas: 3, horas_practicas: 3, creditos: 6, docentes: ['Ing. Roberto Flores'], activa: true },
  { id: 7, codigo: 'MED-101', nombre: 'Anatomía I', carrera_id: 2, carrera_nombre: 'Medicina', semestre: 1, horas_teoricas: 5, horas_practicas: 3, creditos: 8, docentes: ['Dr. Luis Vargas'], activa: true },
  { id: 8, codigo: 'DER-101', nombre: 'Derecho Romano', carrera_id: 3, carrera_nombre: 'Derecho', semestre: 1, horas_teoricas: 4, horas_practicas: 0, creditos: 4, docentes: [], activa: false }
])

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Asignatura', field: 'nombre', align: 'left', sortable: true },
  { name: 'semestre', label: 'Semestre', field: 'semestre', align: 'center', sortable: true },
  { name: 'horas', label: 'Horas (T/P)', field: row => `${row.horas_teoricas}/${row.horas_practicas}`, align: 'center' },
  { name: 'creditos', label: 'Créditos', field: 'creditos', align: 'center', sortable: true },
  { name: 'docentes', label: 'Docentes', field: 'docentes', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'activa', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
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
  { label: '8° Semestre', value: 8 },
  { label: '9° Semestre', value: 9 },
  { label: '10° Semestre', value: 10 }
]

const asignaturasPrerequisito = computed(() => 
  asignaturas.value
    .filter(a => a.id !== form.value.id)
    .map(a => ({ label: `${a.codigo} - ${a.nombre}`, value: a.id }))
)

const docentesDisponibles = [
  { label: 'Dr. Juan Pérez', value: 'Dr. Juan Pérez' },
  { label: 'Lic. María López', value: 'Lic. María López' },
  { label: 'Ing. Carlos Mendoza', value: 'Ing. Carlos Mendoza' },
  { label: 'Ing. Pedro García', value: 'Ing. Pedro García' },
  { label: 'Lic. Ana Torres', value: 'Lic. Ana Torres' },
  { label: 'Ing. Roberto Flores', value: 'Ing. Roberto Flores' },
  { label: 'Dr. Luis Vargas', value: 'Dr. Luis Vargas' }
]

const asignaturasFiltradas = computed(() => {
  let resultado = asignaturas.value

  if (filtros.value.carrera) {
    resultado = resultado.filter(a => a.carrera_id === filtros.value.carrera)
  }

  if (filtros.value.semestre) {
    resultado = resultado.filter(a => a.semestre === filtros.value.semestre)
  }

  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter(a => 
      a.nombre.toLowerCase().includes(busqueda) || 
      a.codigo.toLowerCase().includes(busqueda)
    )
  }

  return resultado
})

const totalHoras = computed(() => 
  asignaturasFiltradas.value.reduce((sum, a) => sum + a.horas_teoricas + a.horas_practicas, 0)
)

const totalCreditos = computed(() => 
  asignaturasFiltradas.value.reduce((sum, a) => sum + a.creditos, 0)
)

const docentesAsignados = computed(() => {
  const docentes = new Set()
  asignaturasFiltradas.value.forEach(a => a.docentes?.forEach(d => docentes.add(d)))
  return docentes.size
})

function getSemestreColor(semestre) {
  const colors = ['blue', 'green', 'orange', 'purple', 'teal', 'pink', 'cyan', 'amber', 'indigo', 'deep-purple']
  return colors[(semestre - 1) % colors.length]
}

function onSedeChange() {
  filtros.value.carrera = null
}

function onFormSedeChange() {
  form.value.carrera_id = null
}

function openDialog(asignatura = null) {
  if (asignatura) {
    editMode.value = true
    form.value = { ...asignatura }
  } else {
    editMode.value = false
    form.value = {
      id: null,
      codigo: '',
      nombre: '',
      sede_id: null,
      carrera_id: null,
      semestre: null,
      horas_teoricas: 0,
      horas_practicas: 0,
      creditos: 0,
      prerequisitos: [],
      descripcion: '',
      activa: true
    }
  }
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
}

function guardarAsignatura() {
  if (editMode.value) {
    const idx = asignaturas.value.findIndex(a => a.id === form.value.id)
    if (idx !== -1) {
      asignaturas.value[idx] = { ...form.value }
    }
  } else {
    const newId = Math.max(...asignaturas.value.map(a => a.id), 0) + 1
    asignaturas.value.push({ ...form.value, id: newId, docentes: [] })
  }
  closeDialog()
}

function verAsignatura(asignatura) {
  router.push(`/documentacion/${asignatura.id}`)
}

function asignarDocentes(asignatura) {
  asignaturaSeleccionada.value = asignatura
  docentesSeleccionados.value = []
  showDocentesDialog.value = true
}

function removeDocente(docente) {
  if (asignaturaSeleccionada.value) {
    asignaturaSeleccionada.value.docentes = asignaturaSeleccionada.value.docentes.filter(d => d !== docente)
  }
}

function guardarDocentes() {
  if (asignaturaSeleccionada.value && docentesSeleccionados.value.length > 0) {
    asignaturaSeleccionada.value.docentes = [
      ...(asignaturaSeleccionada.value.docentes || []),
      ...docentesSeleccionados.value.filter(d => !asignaturaSeleccionada.value.docentes?.includes(d))
    ]
  }
  showDocentesDialog.value = false
}

function eliminarAsignatura(asignatura) {
  if (confirm(`¿Estás seguro de eliminar la asignatura "${asignatura.nombre}"?`)) {
    asignaturas.value = asignaturas.value.filter(a => a.id !== asignatura.id)
  }
}

onMounted(() => {
  // Cargar datos iniciales si es necesario
})
</script>

<style scoped>
.asignaturas-page {
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
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
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

.table-card {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.asignatura-info {
  display: flex;
  flex-direction: column;
}

.asignatura-nombre {
  font-weight: 500;
  color: var(--text-primary);
}

.asignatura-carrera {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.docentes-avatars {
  display: flex;
  align-items: center;
}

.docente-avatar {
  margin-left: -8px;
  border: 2px solid var(--bg-secondary);
}

.docente-avatar:first-child {
  margin-left: 0;
}

.dialog-card {
  background: var(--bg-secondary) !important;
  border-radius: 16px !important;
}

.dialog-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
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

.docentes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

@media (max-width: 1024px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .stats-row { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; gap: 16px; }
}
</style>
