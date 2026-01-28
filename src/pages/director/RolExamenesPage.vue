<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="assignment" size="36px" color="orange" class="q-mr-sm" />
          <span class="text-gradient">Rol de Exámenes</span>
        </h4>
        <p class="q-ma-none q-mt-xs text-grey-6">
          Gestiona las fechas de exámenes por carrera y gestión
        </p>
      </div>
      <div class="col-auto row q-gutter-sm">
        <q-btn v-if="examenesFiltrados.length > 0" outline color="red" icon="delete_forever" label="Eliminar Todo"
          no-caps @click="eliminarTodo" />
        <q-btn outline color="blue" icon="download" label="Descargar Plantilla" no-caps @click="descargarPlantilla" />
        <q-btn unelevated color="green" icon="upload_file" label="Subir Excel" no-caps
          @click="showUploadDialog = true" />
      </div>
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-3">
            <q-select v-model="filtros.gestion" :options="gestionesOptions" outlined dense label="Gestión" emit-value
              map-options />
          </div>
          <div class="col-12 col-md-4">
            <q-select v-model="filtros.carrera_id" :options="carrerasOptions" outlined dense label="Carrera" emit-value
              map-options clearable />
          </div>
          <div class="col-12 col-md-2">
            <q-select v-model="filtroSemestre" :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" outlined dense
              label="Semestre" clearable />
          </div>
          <div class="col-12 col-md-2">
            <q-select v-model="filtroTipo" :options="tiposExamenOptions" outlined dense label="Tipo" emit-value
              map-options clearable />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="busqueda" outlined dense label="Buscar materia..." clearable>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-auto">
            <q-btn unelevated color="primary" icon="refresh" label="Cargar" no-caps @click="cargarExamenes"
              :loading="loading" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de Exámenes -->
    <q-card>
      <q-card-section class="q-pa-none">
        <q-table :rows="examenesFiltrados" :columns="columns" row-key="id" :loading="loading" flat bordered
          :pagination="{ rowsPerPage: 20 }">
          <template v-slot:body-cell-semestre="props">
            <q-td :props="props" class="text-center">
              <q-badge color="teal" :label="props.row.semestre" v-if="props.row.semestre" />
              <span v-else>-</span>
            </q-td>
          </template>

          <template v-slot:body-cell-tipo_examen="props">
            <q-td :props="props">
              <q-chip :color="getExamenColor(props.row.tipo_examen)" text-color="white" size="sm" dense>
                {{ props.row.tipo_examen }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-fecha="props">
            <q-td :props="props">
              <q-icon name="event" size="xs" class="q-mr-xs" />
              {{ formatDate(props.row.fecha) }}
            </q-td>
          </template>

          <template v-slot:body-cell-horario="props">
            <q-td :props="props">
              <q-icon name="schedule" size="xs" class="q-mr-xs" />
              {{ props.row.hora_inicio }} - {{ props.row.hora_fin }}
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <q-btn flat round dense icon="edit" size="sm" color="primary" @click="editarExamen(props.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="delete" size="sm" color="red" @click="eliminarExamen(props.row)">
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="text-center q-pa-xl">
              <q-icon name="event_busy" size="64px" color="grey-4" />
              <p class="text-grey-6 q-mt-md">No hay exámenes cargados para esta gestión</p>
              <q-btn unelevated color="green" icon="upload_file" label="Subir Excel" no-caps
                @click="showUploadDialog = true" />
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog Subir Excel -->
    <q-dialog v-model="showUploadDialog">
      <q-card style="min-width: 500px;">
        <div class="dialog-header bg-green">
          <h3><q-icon name="upload_file" class="q-mr-sm" />Subir Rol de Exámenes</h3>
        </div>

        <q-card-section>
          <q-banner class="bg-blue-1 text-blue-9 q-mb-md" rounded dense>
            <template v-slot:avatar>
              <q-icon name="info" color="blue" />
            </template>
            <strong>Formato del Excel:</strong>
            <ul class="q-ma-none q-pl-md">
              <li>Columna A: Código Materia</li>
              <li>Columna B: Nombre Materia</li>
              <li>Columna C: Tipo Examen (1er Parcial, 2do Parcial, Final, 2da Instancia)</li>
              <li>Columna D: Grupo (Opcional, para validar días de clase)</li>
              <li>Columna E: Semana (número)</li>
              <li>Columna F: Fecha (YYYY-MM-DD)</li>
              <li>Columna G: Hora Inicio (HH:MM)</li>
              <li>Columna H: Hora Fin (HH:MM)</li>
              <li>Columna I: Aula (opcional)</li>
            </ul>
          </q-banner>

          <div class="text-center q-pa-lg upload-zone" @dragover.prevent @drop.prevent="onDrop">
            <input type="file" ref="fileInput" @change="onFileSelected" accept=".xlsx,.xls" style="display: none" />

            <div v-if="!selectedFile">
              <q-icon name="cloud_upload" size="64px" color="grey-4" />
              <p class="text-grey-6 q-mt-md">Arrastra un archivo Excel aquí o</p>
              <q-btn outline color="primary" label="Seleccionar Archivo" no-caps @click="$refs.fileInput.click()" />
            </div>

            <div v-else>
              <q-icon name="description" size="48px" color="green" />
              <p class="text-subtitle1 q-mt-sm text-weight-medium">{{ selectedFile.name }}</p>
              <p class="text-caption text-grey-6">{{ formatFileSize(selectedFile.size) }}</p>
              <q-btn flat color="red" label="Quitar" no-caps icon="close" @click="selectedFile = null" />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="showUploadDialog = false" />
          <q-btn unelevated color="green" label="Subir" icon="upload" no-caps :disable="!selectedFile"
            :loading="uploading" @click="subirExcel" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Editar Examen -->
    <q-dialog v-model="showEditDialog">
      <q-card style="min-width: 450px;">
        <div class="dialog-header">
          <h3><q-icon name="edit" class="q-mr-sm" />Editar Examen</h3>
        </div>

        <q-card-section class="q-gutter-md">
          <q-input v-model="examenForm.materia_nombre" outlined dense label="Materia" readonly />
          <q-select v-model="examenForm.tipo_examen" :options="tiposExamenOptions" outlined dense label="Tipo de Examen"
            emit-value map-options />
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model="examenForm.semana" outlined dense label="Semana" type="number" />
            </div>
            <div class="col-6">
              <q-input v-model="examenForm.fecha" outlined dense label="Fecha" type="date" />
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model="examenForm.hora_inicio" outlined dense label="Hora Inicio" type="time" />
            </div>
            <div class="col-6">
              <q-input v-model="examenForm.hora_fin" outlined dense label="Hora Fin" type="time" />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="showEditDialog = false" />
          <q-btn unelevated color="primary" label="Guardar" icon="save" no-caps @click="guardarExamen" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRolExamenesStore } from 'src/stores/rolExamenes'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const store = useRolExamenesStore()

// State
const showUploadDialog = ref(false)
const showEditDialog = ref(false)
const selectedFile = ref(null)
const busqueda = ref('')
const filtroSemestre = ref(null)
const filtroTipo = ref(null)

const filtros = ref({
  gestion: '2026-I',
  carrera_id: null
})

const examenForm = ref({
  id: null,
  materia_codigo: '',
  materia_nombre: '',
  tipo_examen: '',
  semana: 0,
  fecha: '',
  hora_inicio: '',
  hora_fin: ''
})

// Options
const gestionesOptions = [
  { label: 'Gestión 2026-I', value: '2026-I' },
  { label: 'Gestión 2025-II', value: '2025-II' },
  { label: 'Gestión 2025-I', value: '2025-I' }
]

const authStore = useAuthStore()

const carrerasOptions = computed(() => {
  const user = authStore.usuarioActual
  if (!user || !user.director) return []

  const carreras = user.director.carreras || (user.director.carrera ? [user.director.carrera] : [])

  return carreras.map(c => ({
    label: c.nombre,
    value: c.id
  }))
})

const tiposExamenOptions = [
  { label: '1er Parcial', value: '1er Parcial' },
  { label: '2do Parcial', value: '2do Parcial' },
  { label: 'Final', value: 'Final' },
  { label: '2da Instancia', value: '2da Instancia' }
]

const columns = [
  { name: 'materia_codigo', label: 'Código', field: 'materia_codigo', align: 'left', sortable: true },
  { name: 'materia_nombre', label: 'Materia', field: 'materia_nombre', align: 'left', sortable: true },
  { name: 'semestre', label: 'Sem.', field: 'semestre', align: 'center', sortable: true },
  { name: 'grupo', label: 'Grupo', field: 'grupo', align: 'center', sortable: true },
  { name: 'tipo_examen', label: 'Tipo', field: 'tipo_examen', align: 'center', sortable: true },
  { name: 'semana', label: 'Semana', field: 'semana', align: 'center', sortable: true },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'center', sortable: true },
  { name: 'horario', label: 'Horario', align: 'center' },
  { name: 'actions', label: 'Acciones', align: 'center' }
]

// Computed
const loading = computed(() => store.loading)
const uploading = computed(() => store.uploading)

const examenesFiltrados = computed(() => {
  let lista = store.examenes

  if (filtroSemestre.value) {
    lista = lista.filter(e => e.semestre == filtroSemestre.value)
  }

  if (filtroTipo.value) {
    lista = lista.filter(e => e.tipo_examen === filtroTipo.value)
  }

  if (busqueda.value) {
    const term = busqueda.value.toLowerCase()
    lista = lista.filter(e =>
      e.materia_codigo?.toLowerCase().includes(term) ||
      e.materia_nombre?.toLowerCase().includes(term)
    )
  }
  return lista
})

// Methods
function getExamenColor(tipo) {
  switch (tipo) {
    case '1er Parcial': return 'blue'
    case '2do Parcial': return 'orange'
    case 'Final': return 'purple'
    case '2da Instancia': return 'red'
    default: return 'grey'
  }
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function cargarExamenes() {
  await store.cargarExamenes(filtros.value)
}

function onFileSelected(event) {
  selectedFile.value = event.target.files[0]
}

function onDrop(event) {
  const files = event.dataTransfer.files
  if (files.length) {
    selectedFile.value = files[0]
  }
}

async function subirExcel() {
  if (!selectedFile.value) return

  if (!filtros.value.carrera_id) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar una carrera antes de subir el archivo.',
      icon: 'warning'
    })
    return
  }

  try {
    const response = await store.uploadExcel(selectedFile.value, filtros.value.gestion, filtros.value.carrera_id)

    // Show warnings/errors if any


    if ((response.errors && response.errors.length > 0) || (response.warnings && response.warnings.length > 0)) {
      let html = '<div class="text-left">'

      if (response.imported > 0) {
        html += `<div class="text-positive q-mb-sm"><b>✔ Se importaron ${response.imported} registros correctamente.</b></div>`
      } else {
        html += `<div class="text-grey-8 q-mb-sm">No se importaron registros.</div>`
      }

      if (response.errors && response.errors.length > 0) {
        html += `<div class="text-red text-weight-bold q-mt-md">Errores (Registros no importados):</div>`
        html += `<ul class="q-pl-md text-red-9">`
        response.errors.forEach(e => html += `<li>${e}</li>`)
        html += `</ul>`
        html += `</ul>`
      }

      if (response.warnings && response.warnings.length > 0) {
        html += `<div class="text-orange-9 text-weight-bold q-mt-md">Advertencias (Registros importados):</div>`
        html += `<ul class="q-pl-md text-orange-10">`
        response.warnings.forEach(w => html += `<li>${w}</li>`)
        html += `</ul>`
      }

      html += '</div>'

      $q.dialog({
        title: 'Resultado de la Importación',
        message: html,
        html: true,
        ok: 'Entendido'
      })
    } else {
      $q.notify({
        type: 'positive',
        message: `Se importaron ${response.imported} registros correctamente.`,
        icon: 'check_circle'
      })
    }

    showUploadDialog.value = false
    selectedFile.value = null
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al subir archivo: ' + error.message,
      icon: 'error'
    })
  }
}

async function descargarPlantilla() {
  console.log('Store:', store)
  console.log('downloadTemplate:', store.downloadTemplate)

  if (typeof store.downloadTemplate !== 'function') {
    $q.notify({ type: 'negative', message: 'Error crítico: La acción no se encuentra en el store. Recarga la página.', icon: 'warning' })
    return
  }

  $q.notify({ type: 'info', message: 'Descargando plantilla...', icon: 'cloud_download', timeout: 1000 })
  try {
    await store.downloadTemplate()
    $q.notify({ type: 'positive', message: 'Plantilla descargada', icon: 'check_circle' })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al descargar: ' + error.message, icon: 'error' })
  }
}

function editarExamen(examen) {
  examenForm.value = { ...examen }
  showEditDialog.value = true
}

async function guardarExamen() {
  try {
    await store.actualizarExamen(examenForm.value.id, examenForm.value)
    $q.notify({
      type: 'positive',
      message: 'Examen actualizado',
      icon: 'check'
    })
    showEditDialog.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar: ' + error.message,
      icon: 'error'
    })
  }
}

function eliminarExamen(examen) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar el examen de ${examen.materia_nombre}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await store.eliminarExamen(examen.id)
      $q.notify({
        type: 'positive',
        message: 'Examen eliminado',
        icon: 'delete'
      })
    } catch {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar',
        icon: 'error'
      })
    }
  })
}

function eliminarTodo() {
  if (!filtros.value.carrera_id) return

  $q.dialog({
    title: '⚠️ Peligro: Eliminar Todo',
    message: `¿Estás seguro de que quieres ELIMINAR TODOS los exámenes de esta carrera para la gestión ${filtros.value.gestion}? Esta acción no se puede deshacer.`,
    persistent: true,
    ok: { label: 'Eliminar Todo', color: 'negative', flat: true },
    cancel: { label: 'Cancelar', color: 'primary' }
  }).onOk(async () => {
    try {
      const res = await store.deleteAll(filtros.value.gestion, filtros.value.carrera_id)
      $q.notify({
        type: 'positive',
        message: res.message || 'Se eliminaron los exámenes correctamente',
        icon: 'delete_forever'
      })
      await cargarExamenes()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar todo: ' + error.message,
        icon: 'error'
      })
    }
  })
}

onMounted(async () => {
  // Auto-seleccionar si solo hay una carrera
  if (carrerasOptions.value.length === 1) {
    filtros.value.carrera_id = carrerasOptions.value[0].value
  }

  await cargarExamenes()
})
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dialog-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #4338ca, #3730a3);
  color: white;
  margin: -16px -16px 16px -16px;
}

.dialog-header.bg-green {
  background: linear-gradient(135deg, #10b981, #059669);
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
}

.upload-zone {
  border: 2px dashed #ccc;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.upload-zone:hover {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}
</style>
