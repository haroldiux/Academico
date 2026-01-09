<template>
  <q-page class="preguntas-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <q-btn flat round icon="arrow_back" @click="$router.back()" class="back-btn" />
        <div>
          <h1 class="page-title">
            <q-icon name="quiz" color="primary" class="q-mr-sm" />
            Banco de Preguntas
          </h1>
          <p class="page-subtitle">
            {{ logroInfo?.descripcion || 'Gestiona las preguntas del logro esperado' }}
          </p>
        </div>
      </div>
      <div class="header-actions">
        <q-btn outline color="primary" icon="download" label="Descargar Plantilla" no-caps @click="descargarPlantilla" />
        <q-btn unelevated color="primary" icon="upload_file" label="Importar Excel" no-caps @click="showImportDialog = true" />
        <q-btn unelevated color="green" icon="add" label="Nueva Pregunta" no-caps @click="showAddDialog = true" />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row">
      <div class="stat-mini-card">
        <q-icon name="quiz" size="24px" color="primary" />
        <div>
          <span class="stat-number">{{ estadisticas.total }}</span>
          <span class="stat-label">Total Preguntas</span>
        </div>
      </div>
      <div class="stat-mini-card">
        <q-icon name="radio_button_checked" size="24px" color="blue" />
        <div>
          <span class="stat-number">{{ estadisticas.porTipo.seleccionUnica }}</span>
          <span class="stat-label">Selección Única</span>
        </div>
      </div>
      <div class="stat-mini-card">
        <q-icon name="check_box" size="24px" color="purple" />
        <div>
          <span class="stat-number">{{ estadisticas.porTipo.seleccionMultiple }}</span>
          <span class="stat-label">Selección Múltiple</span>
        </div>
      </div>
      <div class="stat-mini-card">
        <q-icon name="toggle_on" size="24px" color="orange" />
        <div>
          <span class="stat-number">{{ estadisticas.porTipo.falsoVerdadero }}</span>
          <span class="stat-label">Falso/Verdadero</span>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-row">
      <q-input
        v-model="filtro.busqueda"
        outlined
        dense
        placeholder="Buscar pregunta..."
        class="search-input"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-select
        v-model="filtro.tipo"
        :options="opcionesTipo"
        outlined
        dense
        label="Tipo"
        emit-value
        map-options
        clearable
        style="min-width: 180px;"
      />
      <q-select
        v-model="filtro.dificultad"
        :options="opcionesDificultad"
        outlined
        dense
        label="Dificultad"
        emit-value
        map-options
        clearable
        style="min-width: 150px;"
      />
    </div>

    <!-- Lista de Preguntas -->
    <div class="preguntas-list">
      <div v-if="preguntasFiltradas.length === 0" class="empty-state">
        <q-icon name="quiz" size="80px" color="grey-5" />
        <h3>No hay preguntas</h3>
        <p>Importa preguntas desde un Excel o crea una nueva manualmente</p>
        <q-btn unelevated color="primary" icon="upload_file" label="Importar Excel" no-caps @click="showImportDialog = true" />
      </div>

      <div v-for="(pregunta, index) in preguntasFiltradas" :key="pregunta.id" class="pregunta-card">
        <div class="pregunta-header">
          <div class="pregunta-badges">
            <q-chip :color="getTipoColor(pregunta.tipo)" text-color="white" size="sm" dense>
              {{ getTipoLabel(pregunta.tipo) }}
            </q-chip>
            <q-chip :color="getDificultadColor(pregunta.nivel_dificultad)" text-color="white" size="sm" dense>
              {{ pregunta.nivel_dificultad }}
            </q-chip>
            <q-chip outline size="sm" dense>
              Peso: {{ pregunta.peso }}
            </q-chip>
          </div>
          <div class="pregunta-actions">
            <q-btn flat round dense icon="edit" size="sm" @click="editarPregunta(pregunta)" />
            <q-btn flat round dense icon="delete" size="sm" color="red" @click="eliminarPregunta(pregunta)" />
          </div>
        </div>

        <div class="pregunta-numero">Pregunta {{ index + 1 }}</div>
        <p class="pregunta-enunciado">{{ pregunta.enunciado }}</p>

        <div class="pregunta-opciones">
          <template v-for="(opcion, letra) in pregunta.opciones" :key="letra">
            <div 
              v-if="opcion"
              :class="['opcion-item', { 'correcta': pregunta.respuesta_correcta.includes(letra) }]"
            >
              <span class="opcion-letra">{{ letra }}</span>
              <span class="opcion-texto">{{ opcion }}</span>
              <q-icon v-if="pregunta.respuesta_correcta.includes(letra)" name="check_circle" color="green" size="18px" />
            </div>
          </template>
        </div>

        <div class="pregunta-footer">
          <span class="grupos-badge">
            <q-icon name="groups" size="16px" />
            Grupos: {{ pregunta.grupos?.join(', ') || 'Todos' }}
          </span>
          <span class="fecha">{{ pregunta.fecha_creacion }}</span>
        </div>
      </div>
    </div>

    <!-- Dialog Importar Excel -->
    <q-dialog v-model="showImportDialog" persistent>
      <q-card class="import-dialog">
        <div class="dialog-header">
          <h3><q-icon name="upload_file" class="q-mr-sm" /> Importar Preguntas desde Excel</h3>
        </div>

        <q-card-section>
          <div class="import-instructions">
            <h4>Instrucciones:</h4>
            <ol>
              <li>Descarga la plantilla Excel haciendo clic en "Descargar Plantilla"</li>
              <li>Completa las preguntas siguiendo el formato de la plantilla</li>
              <li>Sube el archivo Excel completado</li>
            </ol>

            <div class="format-info">
              <h5>Formato de columnas:</h5>
              <table class="format-table">
                <tr><td><strong>ENUNCIADO</strong></td><td>Texto de la pregunta</td></tr>
                <tr><td><strong>TIPO</strong></td><td>SELECCION_UNICA, SELECCION_MULTIPLE, FALSO_VERDADERO</td></tr>
                <tr><td><strong>A, B, C, D, E</strong></td><td>Opciones de respuesta</td></tr>
                <tr><td><strong>DIFICULTAD</strong></td><td>FACIL, MEDIO, DIFICIL</td></tr>
                <tr><td><strong>PESO</strong></td><td>Valor numérico (ej: 10)</td></tr>
                <tr><td><strong>RESPUESTA</strong></td><td>Letra(s) correcta(s): A, B, A;B;C para múltiple</td></tr>
              </table>
            </div>
          </div>

          <div class="upload-area" 
               @dragover.prevent 
               @drop.prevent="handleDrop"
               :class="{ 'dragging': isDragging }"
               @dragenter="isDragging = true"
               @dragleave="isDragging = false"
          >
            <input 
              type="file" 
              ref="fileInput" 
              accept=".xlsx,.xls" 
              @change="handleFileSelect"
              style="display: none;"
            />
            <q-icon name="cloud_upload" size="48px" color="primary" />
            <p>Arrastra tu archivo Excel aquí o</p>
            <q-btn outline color="primary" label="Seleccionar Archivo" no-caps @click="$refs.fileInput.click()" />
            <p v-if="selectedFile" class="file-name">
              <q-icon name="description" /> {{ selectedFile.name }}
            </p>
          </div>

          <!-- Preview de datos -->
          <div v-if="previewData.length > 0" class="preview-section">
            <h4>Vista Previa ({{ previewData.length }} preguntas)</h4>
            <q-scroll-area style="height: 200px;">
              <div v-for="(item, idx) in previewData.slice(0, 5)" :key="idx" class="preview-item">
                <span class="preview-num">{{ idx + 1 }}.</span>
                <span class="preview-text">{{ item.enunciado }}</span>
                <q-chip size="xs" :color="item.valido ? 'green' : 'red'" text-color="white">
                  {{ item.valido ? 'OK' : 'Error' }}
                </q-chip>
              </div>
              <p v-if="previewData.length > 5" class="text-grey-6">
                ... y {{ previewData.length - 5 }} preguntas más
              </p>
            </q-scroll-area>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" @click="cancelarImport" />
          <q-btn 
            unelevated 
            color="primary" 
            label="Importar Preguntas" 
            :disable="previewData.length === 0"
            :loading="importing"
            @click="confirmarImport" 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Nueva Pregunta -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card class="add-dialog">
        <div class="dialog-header">
          <h3><q-icon name="add_circle" class="q-mr-sm" /> {{ editMode ? 'Editar' : 'Nueva' }} Pregunta</h3>
        </div>

        <q-card-section>
          <q-input
            v-model="nuevaPregunta.enunciado"
            outlined
            type="textarea"
            label="Enunciado de la pregunta"
            rows="3"
            class="q-mb-md"
          />

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-select
                v-model="nuevaPregunta.tipo"
                :options="opcionesTipoCompleto"
                outlined
                label="Tipo de pregunta"
                emit-value
                map-options
              />
            </div>
            <div class="col-3">
              <q-select
                v-model="nuevaPregunta.nivel_dificultad"
                :options="opcionesDificultadCompleto"
                outlined
                label="Dificultad"
                emit-value
                map-options
              />
            </div>
            <div class="col-3">
              <q-input
                v-model.number="nuevaPregunta.peso"
                outlined
                type="number"
                label="Peso"
                min="1"
              />
            </div>
          </div>

          <div class="opciones-section">
            <h4>Opciones de respuesta</h4>
            <div v-for="letra in ['A', 'B', 'C', 'D', 'E']" :key="letra" class="opcion-input-row">
              <q-checkbox 
                v-model="nuevaPregunta.respuesta_correcta" 
                :val="letra"
                :disable="nuevaPregunta.tipo === 'FALSO_VERDADERO' && letra !== 'A' && letra !== 'B'"
              />
              <span class="opcion-letra-input">{{ letra }}.</span>
              <q-input
                v-model="nuevaPregunta.opciones[letra]"
                outlined
                dense
                :placeholder="getPlaceholderOpcion(letra)"
                :disable="nuevaPregunta.tipo === 'FALSO_VERDADERO' && letra !== 'A' && letra !== 'B'"
                class="flex-1"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" @click="cancelarAdd" />
          <q-btn unelevated color="primary" :label="editMode ? 'Guardar Cambios' : 'Crear Pregunta'" @click="guardarPregunta" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePreguntasStore, TIPOS_PREGUNTA } from 'src/stores/preguntas'
import { useAuthStore } from 'src/stores/auth'
import * as XLSX from 'xlsx'

const route = useRoute()
const preguntasStore = usePreguntasStore()
const authStore = useAuthStore()

// IDs de contexto
const logroId = computed(() => parseInt(route.params.logroId) || 1)
const asignaturaId = computed(() => parseInt(route.params.asignaturaId) || 1)
const temaId = computed(() => parseInt(route.params.temaId) || 1)

const logroInfo = ref({ descripcion: 'Demuestra comprensión de los conceptos fundamentales' })

// Dialogs
const showImportDialog = ref(false)
const showAddDialog = ref(false)
const editMode = ref(false)

// Filtros
const filtro = ref({
  busqueda: '',
  tipo: null,
  dificultad: null
})

// Import Excel
const fileInput = ref(null)
const selectedFile = ref(null)
const isDragging = ref(false)
const previewData = ref([])
const importing = ref(false)

// Nueva pregunta
const nuevaPreguntaDefault = {
  enunciado: '',
  tipo: TIPOS_PREGUNTA.SELECCION_UNICA,
  opciones: { A: '', B: '', C: '', D: '', E: '' },
  respuesta_correcta: [],
  nivel_dificultad: 'MEDIO',
  peso: 10
}
const nuevaPregunta = ref({ ...nuevaPreguntaDefault })

// Opciones para selects
const opcionesTipo = [
  { label: 'Selección Única', value: TIPOS_PREGUNTA.SELECCION_UNICA },
  { label: 'Selección Múltiple', value: TIPOS_PREGUNTA.SELECCION_MULTIPLE },
  { label: 'Falso/Verdadero', value: TIPOS_PREGUNTA.FALSO_VERDADERO }
]

const opcionesTipoCompleto = opcionesTipo

const opcionesDificultad = [
  { label: 'Fácil', value: 'FACIL' },
  { label: 'Medio', value: 'MEDIO' },
  { label: 'Difícil', value: 'DIFICIL' }
]

const opcionesDificultadCompleto = opcionesDificultad

// Computed
const preguntasLogro = computed(() => preguntasStore.getPreguntasByLogro(logroId.value))

const preguntasFiltradas = computed(() => {
  let resultado = preguntasLogro.value

  if (filtro.value.busqueda) {
    const busqueda = filtro.value.busqueda.toLowerCase()
    resultado = resultado.filter(p => p.enunciado.toLowerCase().includes(busqueda))
  }

  if (filtro.value.tipo) {
    resultado = resultado.filter(p => p.tipo === filtro.value.tipo)
  }

  if (filtro.value.dificultad) {
    resultado = resultado.filter(p => p.nivel_dificultad === filtro.value.dificultad)
  }

  return resultado
})

const estadisticas = computed(() => preguntasStore.getEstadisticasByLogro(logroId.value))

// Watchers
watch(() => nuevaPregunta.value.tipo, (newTipo) => {
  if (newTipo === TIPOS_PREGUNTA.FALSO_VERDADERO) {
    nuevaPregunta.value.opciones = { A: 'Verdadero', B: 'Falso', C: null, D: null, E: null }
    nuevaPregunta.value.respuesta_correcta = nuevaPregunta.value.respuesta_correcta.filter(r => ['A', 'B'].includes(r))
  }
})

// Métodos
function getTipoColor(tipo) {
  const colores = {
    [TIPOS_PREGUNTA.SELECCION_UNICA]: 'blue',
    [TIPOS_PREGUNTA.SELECCION_MULTIPLE]: 'purple',
    [TIPOS_PREGUNTA.FALSO_VERDADERO]: 'orange'
  }
  return colores[tipo] || 'grey'
}

function getTipoLabel(tipo) {
  const labels = {
    [TIPOS_PREGUNTA.SELECCION_UNICA]: 'Única',
    [TIPOS_PREGUNTA.SELECCION_MULTIPLE]: 'Múltiple',
    [TIPOS_PREGUNTA.FALSO_VERDADERO]: 'V/F'
  }
  return labels[tipo] || tipo
}

function getDificultadColor(dificultad) {
  const colores = { FACIL: 'green', MEDIO: 'orange', DIFICIL: 'red' }
  return colores[dificultad] || 'grey'
}

function getPlaceholderOpcion(letra) {
  if (nuevaPregunta.value.tipo === TIPOS_PREGUNTA.FALSO_VERDADERO) {
    return letra === 'A' ? 'Verdadero' : letra === 'B' ? 'Falso' : ''
  }
  return `Opción ${letra}`
}

// Descargar plantilla Excel (archivo estático pre-generado)
function descargarPlantilla() {
  // Abrir el archivo directamente - el navegador lo descargará
  window.open('/templates/plantilla_preguntas.xlsx', '_blank')
}

// Manejar archivo Excel
function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    procesarExcel(file)
  }
}

function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
    procesarExcel(file)
  }
}

function procesarExcel(file) {
  selectedFile.value = file
  const reader = new FileReader()
  
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result)
    const workbook = XLSX.read(data, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    // Procesar y validar datos
    previewData.value = jsonData.map(row => {
      const pregunta = {
        enunciado: row.ENUNCIADO || '',
        tipo: row.TIPO || TIPOS_PREGUNTA.SELECCION_UNICA,
        opciones: {
          A: row.A || null,
          B: row.B || null,
          C: row.C || null,
          D: row.D || null,
          E: row.E || null
        },
        nivel_dificultad: row.DIFICULTAD || 'MEDIO',
        peso: parseInt(row.PESO) || 10,
        respuesta_correcta: (row.RESPUESTA || '').split(';').filter(r => r.trim())
      }

      const validacion = preguntasStore.validarPreguntaExcel(pregunta)
      return { ...pregunta, valido: validacion.valido, errores: validacion.errores }
    })
  }

  reader.readAsArrayBuffer(file)
}

function cancelarImport() {
  showImportDialog.value = false
  selectedFile.value = null
  previewData.value = []
}

function confirmarImport() {
  importing.value = true
  
  const preguntasValidas = previewData.value.filter(p => p.valido)
  const docenteId = authStore.usuarioActual?.id || 7
  const grupos = authStore.usuarioActual?.grupos || ['A', 'B']

  const count = preguntasStore.addPreguntasBatch(
    preguntasValidas,
    logroId.value,
    asignaturaId.value,
    temaId.value,
    docenteId,
    grupos
  )

  setTimeout(() => {
    importing.value = false
    showImportDialog.value = false
    selectedFile.value = null
    previewData.value = []
    
    // Notificación de éxito
    console.log(`${count} preguntas importadas exitosamente`)
  }, 1000)
}

// Gestión de preguntas manuales
function guardarPregunta() {
  const docenteId = authStore.usuarioActual?.id || 7
  const grupos = authStore.usuarioActual?.grupos || ['A', 'B']

  if (editMode.value && nuevaPregunta.value.id) {
    preguntasStore.updatePregunta(nuevaPregunta.value.id, nuevaPregunta.value)
  } else {
    preguntasStore.addPregunta({
      ...nuevaPregunta.value,
      logro_id: logroId.value,
      asignatura_id: asignaturaId.value,
      tema_id: temaId.value,
      docente_id: docenteId,
      grupos: grupos
    })
  }

  cancelarAdd()
}

function editarPregunta(pregunta) {
  editMode.value = true
  nuevaPregunta.value = { ...pregunta, opciones: { ...pregunta.opciones }, respuesta_correcta: [...pregunta.respuesta_correcta] }
  showAddDialog.value = true
}

function eliminarPregunta(pregunta) {
  if (confirm('¿Estás seguro de eliminar esta pregunta?')) {
    preguntasStore.deletePregunta(pregunta.id)
  }
}

function cancelarAdd() {
  showAddDialog.value = false
  editMode.value = false
  nuevaPregunta.value = { ...nuevaPreguntaDefault, opciones: { A: '', B: '', C: '', D: '', E: '' }, respuesta_correcta: [] }
}
</script>

<style scoped>
.preguntas-page {
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

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.back-btn {
  color: var(--text-secondary);
}

.page-title {
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Stats Row */
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-mini-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Filters */
.filters-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

/* Preguntas List */
.preguntas-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  margin-bottom: 24px;
}

.pregunta-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s ease;
}

.pregunta-card:hover {
  border-color: var(--primary);
}

.pregunta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.pregunta-badges {
  display: flex;
  gap: 8px;
}

.pregunta-numero {
  font-size: 0.75rem;
  color: var(--primary);
  font-weight: 600;
  margin-bottom: 8px;
}

.pregunta-enunciado {
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.pregunta-opciones {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.opcion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.opcion-item.correcta {
  background: rgba(34, 197, 94, 0.1);
  border-color: var(--accent-green);
}

.opcion-letra {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--text-primary);
  flex-shrink: 0;
}

.opcion-item.correcta .opcion-letra {
  background: var(--accent-green);
  color: white;
}

.opcion-texto {
  flex: 1;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.pregunta-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.grupos-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.fecha {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Dialogs */
.import-dialog, .add-dialog {
  background: var(--bg-secondary) !important;
  border-radius: 16px !important;
  min-width: 600px;
  max-width: 800px;
}

.dialog-header {
  padding: 24px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  margin: -16px -16px 0 -16px;
  border-radius: 16px 16px 0 0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
}

.import-instructions {
  margin-bottom: 24px;
}

.import-instructions h4 {
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.import-instructions ol {
  color: var(--text-secondary);
  padding-left: 20px;
  margin: 0 0 16px 0;
}

.format-info h5 {
  color: var(--text-primary);
  margin: 16px 0 8px 0;
}

.format-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.format-table td {
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.format-table td:first-child {
  background: var(--bg-tertiary);
  width: 150px;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  transition: all 0.2s ease;
}

.upload-area.dragging {
  border-color: var(--primary);
  background: rgba(124, 58, 237, 0.05);
}

.upload-area p {
  color: var(--text-muted);
  margin: 12px 0;
}

.file-name {
  color: var(--primary);
  font-weight: 500;
}

.preview-section {
  margin-top: 24px;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 12px;
}

.preview-section h4 {
  color: var(--text-primary);
  margin: 0 0 12px 0;
  font-size: 0.875rem;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.preview-num {
  color: var(--text-muted);
  font-weight: 600;
  min-width: 24px;
}

.preview-text {
  flex: 1;
  color: var(--text-primary);
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dialog-actions {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}

/* Opciones Section */
.opciones-section {
  margin-top: 16px;
}

.opciones-section h4 {
  color: var(--text-primary);
  font-size: 0.875rem;
  margin: 0 0 12px 0;
}

.opcion-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.opcion-letra-input {
  font-weight: 700;
  color: var(--text-primary);
  min-width: 24px;
}

.flex-1 {
  flex: 1;
}

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 16px; }
  .header-actions { flex-wrap: wrap; }
  .stats-row { flex-wrap: wrap; }
  .stat-mini-card { min-width: 150px; }
  .filters-row { flex-direction: column; }
  .import-dialog, .add-dialog { min-width: 90vw; }
}
</style>
