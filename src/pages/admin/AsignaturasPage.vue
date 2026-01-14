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
        <q-btn outline color="primary" icon="download" label="Exportar" no-caps @click="exportTable" />
        <q-btn unelevated color="primary" icon="add" label="Nueva Asignatura" no-caps @click="openDialog()" />
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <q-select v-model="filtros.sede" :options="sedesOptions" outlined dense label="Sede" emit-value map-options
        clearable style="min-width: 200px;" @update:model-value="onSedeChange" />
      <q-select v-model="filtros.carrera" :options="carrerasOptions" outlined dense label="Carrera" emit-value
        map-options clearable use-input input-debounce="0" @filter="filterCarreras" style="min-width: 300px;"
        @update:model-value="onCarreraChange" />
      <q-select v-model="filtros.semestre" :options="semestresOptions" outlined dense label="Semestre" emit-value
        map-options clearable style="min-width: 150px;" />
      <q-input v-model="filtros.busqueda" outlined dense placeholder="Buscar asignatura..." class="search-input">
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
      <q-table :rows="asignaturasFiltradas" :columns="columns" row-key="id" :pagination="{ rowsPerPage: 10 }" flat
        :loading="loading">
        <template v-slot:no-data>
          <div class="full-width row flex-center text-accent q-gutter-sm" style="padding: 40px">
            <q-icon size="2em" name="info" />
            <span v-if="!filtros.sede && !filtros.carrera">
              Seleccione una <strong>Sede</strong> o <strong>Carrera</strong> para ver más asignaturas.
            </span>
            <span v-else>
              No se encontraron asignaturas para esta selección.
            </span>
          </div>
        </template>

        <template v-slot:body-cell-codigo="props">
          <q-td :props="props">
            <q-chip outline color="primary" text-color="primary" size="sm" class="text-weight-bold">
              {{ props.row.codigo }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <div class="asignatura-info">
              <span class="asignatura-nombre text-weight-bold">{{ props.row.nombre }}</span>
              <span class="asignatura-carrera text-grey-8">{{ props.row.carrera_nombre }}</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-semestre="props">
          <q-td :props="props">
            <q-badge :color="getSemestreColor(props.row.semestre)" text-color="white"
              class="q-px-sm q-py-xs text-weight-medium" rounded>
              {{ props.row.semestre }}° Sem
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-docentes="props">
          <q-td :props="props">
            <div class="docentes-avatars">
              <q-avatar v-for="(docente, idx) in props.row.docentes?.slice(0, 3)" :key="idx" size="28px" color="primary"
                text-color="white" class="docente-avatar" font-size="12px">
                {{ docente.charAt(0) }}
                <q-tooltip>{{ docente }}</q-tooltip>
              </q-avatar>
              <q-avatar v-if="props.row.docentes?.length > 3" size="28px" color="grey-4" text-color="grey-9"
                class="docente-avatar" font-size="12px">
                +{{ props.row.docentes.length - 3 }}
              </q-avatar>
              <span v-if="!props.row.docentes?.length" class="text-grey-7 text-italic" style="font-size: 0.85rem;">
                Sin asignar
              </span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-badge :color="props.row.activa ? 'positive' : 'grey-5'" text-color="white" class="q-px-sm" rounded>
              {{ props.row.activa ? 'Activa' : 'Inactiva' }}
            </q-badge>
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
              <q-select v-model="form.sede_id" :options="sedesOptions" outlined label="Sede *" emit-value map-options
                @update:model-value="onFormSedeChange" />
            </div>
            <div class="col-6">
              <q-select v-model="form.carrera_id" :options="carrerasFormOptions" outlined label="Carrera *" emit-value
                map-options :disable="!form.sede_id" />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-4">
              <q-select v-model="form.semestre" :options="semestresOptions" outlined label="Semestre *" emit-value
                map-options />
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
              <q-select v-model="form.prerequisitos" :options="asignaturasPrerequisito" outlined label="Prerequisitos"
                emit-value map-options multiple use-chips />
            </div>
          </div>

          <q-input v-model="form.descripcion" outlined type="textarea" rows="3" label="Descripción"
            placeholder="Descripción de la asignatura..." />

          <q-toggle v-model="form.activa" label="Asignatura activa" />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" @click="closeDialog" />
          <q-btn unelevated color="primary" :label="editMode ? 'Guardar Cambios' : 'Crear Asignatura'"
            @click="guardarAsignatura" />
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

          <q-select v-model="docentesSeleccionados" :options="docentesDisponibles" outlined label="Seleccionar Docentes"
            emit-value map-options multiple use-chips />

          <div class="q-mt-md">
            <p class="text-caption text-grey-6">Docentes actualmente asignados:</p>
            <div class="docentes-list">
              <q-chip v-for="docente in asignaturaSeleccionada?.docentes" :key="docente" removable
                @remove="removeDocente(docente)" color="green-2" text-color="green-9">
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
import { useAsignaturasStore } from 'src/stores/asignaturas'

const router = useRouter()
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()

const asignaturasStore = useAsignaturasStore()

// Computed proxy for store data
const asignaturasFiltradas = computed(() => {
  let resultado = asignaturasStore.asignaturas

  // Filtrar por semestre
  if (filtros.value.semestre) {
    resultado = resultado.filter(a => a.semestre === filtros.value.semestre)
  }

  // Filtrar por búsqueda (nombre o código)
  if (filtros.value.busqueda) {
    const normalizeText = (text) => {
      return text
        ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        : ""
    }

    const term = normalizeText(filtros.value.busqueda)
    resultado = resultado.filter(a =>
      normalizeText(a.nombre).includes(term) ||
      normalizeText(a.codigo).includes(term)
    )
  }

  return resultado
})
const loading = computed(() => asignaturasStore.loading)

// State
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

// Columns definition
const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Asignatura', field: 'nombre', align: 'left', sortable: true },
  {
    name: 'sede',
    label: 'Sede',
    field: row => {
      // Prioridad: 1. Dato de fila, 2. Filtro seleccionado, 3. N/A
      if (row.sede_nombre && row.sede_nombre !== 'N/A') return row.sede_nombre
      if (filtros.value.sede) return sedesStore.getSedeById(filtros.value.sede)?.nombre
      return 'N/A'
    },
    align: 'left'
  },
  { name: 'semestre', label: 'Semestre', field: 'semestre', align: 'center', sortable: true },
  { name: 'horas', label: 'Horas (T/P)', field: row => `${row.horas_teoricas}/${row.horas_practicas}`, align: 'center' },
  {
    name: 'carga_total',
    label: 'Carga Total',
    field: row => ((row.horas_teoricas || 0) + (row.horas_practicas || 0)) * 20,
    align: 'center',
    sortable: true
  },
  { name: 'creditos', label: 'Créditos', field: 'creditos', align: 'center', sortable: true },
  { name: 'docentes', label: 'Docentes', field: 'docentes', align: 'left' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

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

const docentesDisponibles = [
  { label: 'Dr. Juan Pérez', value: 'Dr. Juan Pérez' },
  { label: 'Lic. María López', value: 'Lic. María López' },
  { label: 'Ing. Carlos Mendoza', value: 'Ing. Carlos Mendoza' },
  { label: 'Ing. Pedro García', value: 'Ing. Pedro García' },
  { label: 'Lic. Ana Torres', value: 'Lic. Ana Torres' },
  { label: 'Ing. Roberto Flores', value: 'Ing. Roberto Flores' },
  { label: 'Dr. Luis Vargas', value: 'Dr. Luis Vargas' }
]

const sedesOptions = computed(() =>
  sedesStore.sedes.map(s => ({ label: s.nombre, value: s.id }))
)

const carrerasFiltradas = computed(() => {
  if (filtros.value.sede) {
    return carrerasStore.getCarrerasBySede(filtros.value.sede).map(c => ({ label: c.nombre, value: c.id }))
  }
  // Mostrar todas las carreras con la sede entre paréntesis si no hay filtro de sede
  return carrerasStore.carreras
    .filter(c => c.activo)
    .map(c => {
      const sede = sedesStore.getSedeById(c.sede_id)
      return {
        label: `${c.nombre} (${sede?.nombre || 'Sede ?'})`,
        value: c.id,
        sede_id: c.sede_id // Extra data for auto-select
      }
    })
})

const carrerasFormOptions = computed(() => {
  if (!form.value.sede_id) return []
  return carrerasStore.getCarrerasBySede(form.value.sede_id).map(c => ({ label: c.nombre, value: c.id }))
})

const asignaturasPrerequisito = computed(() =>
  asignaturasStore.asignaturas
    .filter(a => a.id !== form.value.id)
    .map(a => ({ label: `${a.codigo} - ${a.nombre}`, value: a.id }))
)

const carrerasOptions = ref([])

function filterCarreras(val, update) {
  if (val === '') {
    update(() => {
      carrerasOptions.value = carrerasFiltradas.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    carrerasOptions.value = carrerasFiltradas.value.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
  })
}

// Watchers / Event Handlers
async function onSedeChange() {
  filtros.value.carrera = null
  // Si se selecciona una sede, cargar sus asignaturas locales
  if (filtros.value.sede) {
    const sede = sedesStore.getSedeById(filtros.value.sede)
    if (sede?.codigo) {
      // Cargar asignaturas de la sede seleccioanda (sin career_code)
      await asignaturasStore.fetchAsignaturas(sede.codigo, null)
    }
  } else {
    // Si se limpia la sede, cargar TODO
    await asignaturasStore.fetchAsignaturas()
  }
}

async function onCarreraChange() {
  // Auto-seleccionar sede si no está seleccionada
  if (!filtros.value.sede && filtros.value.carrera) {
    const carrera = carrerasStore.getCarreraById(filtros.value.carrera)
    if (carrera?.sede_id) {
      filtros.value.sede = carrera.sede_id
    }
  }

  if (filtros.value.sede && filtros.value.carrera) {
    const sede = sedesStore.getSedeById(filtros.value.sede)
    const carrera = carrerasStore.getCarreraById(filtros.value.carrera)

    if (sede?.codigo && carrera?.codigo) {
      await asignaturasStore.fetchAsignaturas(sede.codigo, carrera.codigo)
    }
  }
}

// ... (Rest of options logic remains similar, passing ID) ...


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
    // TODO: Implement update via API/Store
    console.log('Update asignatura:', form.value)
  } else {
    // TODO: Implement create via API/Store
    console.log('Create asignatura:', form.value)
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
    // TODO: Implement save docentes
    console.log('Save docents', docentesSeleccionados.value)
  }
  showDocentesDialog.value = false
}

function eliminarAsignatura(asignatura) {
  if (confirm(`¿Estás seguro de eliminar la asignatura "${asignatura.nombre}"?`)) {
    // TODO: Implement delete via API/Store
    console.log('Delete asignatura:', asignatura.id)
  }
}

onMounted(() => {
  sedesStore.fetchSedes()
  carrerasStore.fetchCarreras()
  // Fetch initial "all local" asignaturas
  asignaturasStore.fetchAsignaturas()
})

import * as XLSX from 'xlsx'

function exportTable() {
  // 1. Prepare data
  const data = asignaturasFiltradas.value.map(row => {
    // Intentar obtener nombre de sede de la fila, o del filtro de sede seleccionado
    const sedeNombre = row.sede_nombre && row.sede_nombre !== 'N/A'
      ? row.sede_nombre
      : (sedesStore.getSedeById(filtros.value.sede)?.nombre || 'N/A')

    return {
      'Código': row.codigo,
      'Asignatura': row.nombre,
      'Sede': sedeNombre,
      'Carrera': row.carrera_nombre,
      'Semestre': `${row.semestre}° Sem/Año`,
      'Horas Teóricas': row.horas_teoricas || 0,
      'Horas Prácticas': row.horas_practicas || 0,
      'Carga Total': ((row.horas_teoricas || 0) + (row.horas_practicas || 0)) * 20,
      'Créditos': row.creditos
    }
  })

  // 2. Create worksheet
  const ws = XLSX.utils.json_to_sheet(data)

  // 3. Auto-size columns nicely
  const colWidths = [
    { wch: 10 }, // Codigo
    { wch: 40 }, // Asignatura
    { wch: 20 }, // Sede
    { wch: 30 }, // Carrera
    { wch: 12 }, // Semestre
    { wch: 15 }, // HT
    { wch: 15 }, // HP
    { wch: 12 }, // Total
    { wch: 10 }  // Creditos
  ]
  ws['!cols'] = colWidths

  // 4. Create workbook and download
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Asignaturas')
  XLSX.writeFile(wb, 'Reporte_Asignaturas.xlsx')
}
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
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
