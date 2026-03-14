<template>
  <q-page class="rol-examenes-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">
          <q-icon name="fact_check" color="deep-purple" class="q-mr-sm" />
          Rol de Exámenes
        </h1>
        <p class="page-subtitle">Lista de exámenes por carrera — gestión y generación</p>
      </div>
      <div class="header-actions">
        <q-btn outline color="deep-purple" icon="refresh" label="Actualizar" no-caps @click="cargarExamenes" />
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row q-mb-lg">
      <div class="stat-card" v-for="stat in statsCards" :key="stat.label">
        <q-icon :name="stat.icon" size="28px" :color="stat.color" />
        <div class="stat-info">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section q-mb-md">
      <q-select v-model="filtros.carrera" :options="carrerasOptions" outlined dense label="Carrera"
        emit-value map-options clearable style="min-width: 200px;" />
      <q-select v-model="filtros.parcial" :options="parcialesOptions" outlined dense label="Parcial"
        emit-value map-options clearable style="min-width: 160px;" />
      <q-select v-model="filtros.estado" :options="estadosOptions" outlined dense label="Estado"
        emit-value map-options clearable style="min-width: 160px;" />
      <q-input v-model="filtros.busqueda" outlined dense label="Buscar materia..." clearable
        style="min-width: 200px;">
        <template v-slot:prepend><q-icon name="search" /></template>
      </q-input>
    </div>

    <!-- Tabla de Exámenes -->
    <q-card class="table-card">
      <q-table :rows="examenesOrdenados" :columns="columns" row-key="id" flat
        :pagination="pagination" @update:pagination="pagination = $event">

        <!-- Materia -->
        <template v-slot:body-cell-materia="props">
          <q-td :props="props">
            <div class="materia-cell">
              <q-chip size="sm" color="primary" text-color="white" dense>{{ props.row.codigo }}</q-chip>
              <div>
                <div class="text-weight-medium">{{ props.row.materia }}</div>
                <div class="text-caption text-grey-6">{{ props.row.carrera }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Fecha con alerta 24h -->
        <template v-slot:body-cell-fecha="props">
          <q-td :props="props">
            <div class="fecha-cell">
              <div class="text-weight-medium">{{ props.row.fecha }}</div>
              <div class="text-caption">{{ props.row.hora }}</div>
              <!-- Alerta si están dentro del umbral configurado -->
              <q-badge v-if="esProximo(props.row)" color="orange" class="q-mt-xs">
                <q-icon name="notifications_active" size="12px" class="q-mr-xs" />
                En {{ tiempoRestante(props.row) }}
              </q-badge>
            </div>
          </q-td>
        </template>

        <!-- Parcial -->
        <template v-slot:body-cell-parcial="props">
          <q-td :props="props">
            <q-chip :color="getParcialColor(props.row.parcial)" text-color="white" size="sm" dense>
              {{ props.row.parcial }}
            </q-chip>
          </q-td>
        </template>

        <!-- Estado -->
        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <div class="estado-cell">
              <q-chip :color="getEstadoColor(props.row.estado)" text-color="white" size="sm" dense>
                <q-icon :name="getEstadoIcon(props.row.estado)" size="14px" class="q-mr-xs" />
                {{ props.row.estado }}
              </q-chip>
            </div>
          </q-td>
        </template>

        <!-- Acciones -->
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <div class="acciones-cell">
              <!-- Botón Generar Examen (disponible 24h antes, configurable) -->
              <q-btn v-if="puedeGenerarExamen(props.row)" unelevated color="deep-purple"
                icon="description" label="Generar" size="sm" no-caps @click="generarExamen(props.row)"
                class="q-mr-xs">
                <q-tooltip>Generar examen(es)</q-tooltip>
              </q-btn>
              <q-chip v-else-if="props.row.estado === 'Pendiente'" color="grey-3" text-color="grey-6"
                size="sm" dense>
                <q-icon name="lock_clock" size="14px" class="q-mr-xs" />
                Disponible en {{ horasParaGeneracion(props.row) }}
              </q-chip>

              <!-- Botón Ver Patrón (solo si está entregado o calificado) -->
              <q-btn v-if="puedeVerPatron(props.row)" flat round dense icon="fact_check"
                color="green" size="sm" @click="verPatron(props.row)">
                <q-tooltip>Ver Patrón de Respuestas</q-tooltip>
              </q-btn>

              <!-- Ver detalles siempre -->
              <q-btn flat round dense icon="visibility" color="primary" size="sm"
                @click="verDetalles(props.row)">
                <q-tooltip>Ver Detalles</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <!-- Versiones generadas -->
        <template v-slot:body-cell-versiones="props">
          <q-td :props="props">
            <div v-if="props.row.versiones && props.row.versiones.length > 0" class="versiones-chips">
              <q-chip v-for="v in props.row.versiones" :key="v" color="deep-purple-1"
                text-color="deep-purple-9" size="xs" dense>Tipo {{ v }}</q-chip>
            </div>
            <span v-else class="text-grey-5 text-caption">—</span>
          </q-td>
        </template>

      </q-table>
    </q-card>

    <!-- DIALOG: Generar Examen -->
    <q-dialog v-model="showDialogGenerar" persistent>
      <q-card style="min-width: 550px; max-width: 650px;">
        <div class="dialog-header">
          <q-icon name="description" class="q-mr-sm" />
          Generar Examen — {{ examenSeleccionado?.materia }}
        </div>

        <q-card-section>
          <q-banner class="bg-blue-1 text-blue-9 q-mb-md" rounded dense>
            <q-icon name="info" class="q-mr-sm" />
            Configuración aplicada: {{ examenSeleccionado?.totalPreguntas }} preguntas
            ({{ examenSeleccionado?.distribucion?.facil }}% fácil,
            {{ examenSeleccionado?.distribucion?.medio }}% medio,
            {{ examenSeleccionado?.distribucion?.dificil }}% difícil)
          </q-banner>

          <div class="section-label q-mb-md">Versiones a generar</div>
          <div class="q-gutter-sm versiones-toggle">
            <q-toggle v-for="v in ['A', 'B', 'C', 'D', 'E']" :key="v"
              v-model="versionesSeleccionadas" :val="v" :label="`Tipo ${v}`"
              color="deep-purple" />
          </div>

          <q-banner class="bg-orange-1 text-orange-9 q-mt-md" rounded dense>
            <q-icon name="warning" class="q-mr-sm" />
            Se generarán <strong>{{ versionesSeleccionadas.length }}</strong> versión(es) del examen.
            Las preguntas se mezclarán automáticamente.
          </q-banner>

          <div class="q-mt-md">
            <q-toggle v-model="mezclarPreguntas" label="Mezclar orden de preguntas" color="deep-purple" />
            <q-toggle v-model="mezclarOpciones" label="Mezclar opciones de respuesta" color="deep-purple"
              class="q-ml-lg" />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="showDialogGenerar = false" />
          <q-btn unelevated color="deep-purple" icon="auto_awesome" label="Generar Examen(es)"
            :disable="versionesSeleccionadas.length === 0" @click="confirmarGeneracion" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOG: Patrón de Respuestas -->
    <q-dialog v-model="showPatronDialog" maximized>
      <q-card class="patron-dialog">
        <q-card-section class="row items-center q-pb-none no-print">
          <div class="text-h6">
            <q-icon name="fact_check" color="green" class="q-mr-sm" />
            Patrón de Respuestas — {{ patronData?.materia }}
          </div>
          <q-space />
          <q-btn flat round dense icon="print" @click="imprimirPatron" color="primary">
            <q-tooltip>Imprimir</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section v-if="patronData" class="patron-content" id="patron-print">
          <!-- Selector de versión -->
          <div class="no-print q-mb-md flex items-center gap-3">
            <span class="text-subtitle2">Ver patrón de versión:</span>
            <q-btn-toggle v-model="versionPatron" toggle-color="deep-purple" :options="
              patronData.versiones.map(v => ({ label: `Tipo ${v}`, value: v }))
            " dense unelevated no-caps />
          </div>

          <!-- Header institucional -->
          <div class="patron-header">
            <div class="logo-fallback">
              <div class="logo-text">UNITEPC</div>
            </div>
            <div class="header-info">
              <div class="universidad-name">UNIVERSIDAD TÉCNICA PRIVADA COSMOS</div>
              <div class="carrera-line">Carrera: <span class="field-value">{{ patronData.carrera }}</span></div>
              <div class="slogan">"TÚ ESTÁS AQUÍ PORQUE FORMAS PARTE DE NUESTRA HISTORIA"</div>
            </div>
            <div class="codigo-section">
              <div class="codigo-box">TIPO {{ versionPatron }}</div>
            </div>
          </div>

          <!-- Datos del examen -->
          <div class="datos-examen">
            <div class="field-row">
              <span class="field-label">Materia:</span>
              <span class="field-value">{{ patronData.materia }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Docente:</span>
              <span class="field-value">{{ patronData.docente }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Examen:</span>
              <span class="field-value">{{ patronData.parcial }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Fecha:</span>
              <span class="field-value">{{ patronData.fecha }}</span>
            </div>
          </div>

          <!-- Grilla de respuestas -->
          <div class="respuestas-grid">
            <div v-for="col in 4" :key="col" class="respuestas-column">
              <div class="column-header">
                <span class="col-num"></span>
                <span v-for="opt in ['A','B','C','D','E']" :key="opt" class="opt-header">{{ opt }}</span>
              </div>
              <div v-for="num in 25" :key="num" class="respuesta-row">
                <span class="pregunta-num">{{ (col - 1) * 25 + num }}</span>
                <span v-for="opt in ['A','B','C','D','E']" :key="opt" class="bubble"
                  :class="{ filled: patronData.respuestas[versionPatron]?.[(col - 1) * 25 + num - 1] === opt }">
                  {{ opt }}
                </span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- DIALOG: Detalles del examen -->
    <q-dialog v-model="showDetalles">
      <q-card style="min-width: 460px;">
        <q-card-section class="bg-deep-purple text-white">
          <div class="text-h6">
            <q-icon name="info" class="q-mr-sm" />
            Detalles del Examen
          </div>
        </q-card-section>
        <q-card-section v-if="examenSeleccionado">
          <div class="detalles-grid">
            <div class="detalle-item"><span class="detalle-label">Materia</span><span class="detalle-value">{{ examenSeleccionado.materia }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Carrera</span><span class="detalle-value">{{ examenSeleccionado.carrera }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Parcial</span><span class="detalle-value">{{ examenSeleccionado.parcial }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Fecha</span><span class="detalle-value">{{ examenSeleccionado.fecha }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Hora</span><span class="detalle-value">{{ examenSeleccionado.hora }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Aula</span><span class="detalle-value">{{ examenSeleccionado.aula }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Total Preguntas</span><span class="detalle-value">{{ examenSeleccionado.totalPreguntas }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Docente</span><span class="detalle-value">{{ examenSeleccionado.docente }}</span></div>
          </div>
          <div v-if="examenSeleccionado.versiones?.length" class="q-mt-md">
            <div class="text-caption text-grey-6 q-mb-xs">Versiones generadas:</div>
            <q-chip v-for="v in examenSeleccionado.versiones" :key="v" color="deep-purple" text-color="white" size="sm" dense class="q-mr-xs">
              Tipo {{ v }}
            </q-chip>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Configuración (en producción vendría del módulo de configuración)
const CONFIG = {
  horasAntesGeneracion: 24,
  minutosAntesEntrega: 15,
  alertaHorasAntes: 24,
}

const filtros = ref({ carrera: null, parcial: null, estado: null, busqueda: '' })
const showDialogGenerar = ref(false)
const showPatronDialog = ref(false)
const showDetalles = ref(false)
const examenSeleccionado = ref(null)
const versionesSeleccionadas = ref(['A'])
const mezclarPreguntas = ref(true)
const mezclarOpciones = ref(true)
const versionPatron = ref('A')
const patronData = ref(null)

const pagination = ref({ rowsPerPage: 15 })

// Mock data — se reemplaza con API
const examenes = ref([
  {
    id: 1, codigo: 'MED-101', materia: 'Anatomía I', carrera: 'Medicina', parcial: '1° Parcial',
    fecha: '2026-03-14', hora: '08:00', aula: 'Aula 201', estado: 'Pendiente',
    totalPreguntas: 20, docente: 'Dr. García', versiones: [],
    distribucion: { facil: 40, medio: 40, dificil: 20 },
    fechaHoraMs: Date.now() + (20 * 3600000) // 20 horas en el futuro
  },
  {
    id: 2, codigo: 'ENF-111', materia: 'Bioquímica', carrera: 'Enfermería', parcial: '1° Parcial',
    fecha: '2026-03-15', hora: '10:00', aula: 'Aula 105', estado: 'Pendiente',
    totalPreguntas: 20, docente: 'Dra. Martínez', versiones: [],
    distribucion: { facil: 30, medio: 40, dificil: 30 },
    fechaHoraMs: Date.now() + (48 * 3600000)
  },
  {
    id: 3, codigo: 'MED-205', materia: 'Fisiología', carrera: 'Medicina', parcial: '2° Parcial',
    fecha: '2026-03-13', hora: '14:00', aula: 'Aula 310', estado: 'En Proceso',
    totalPreguntas: 20, docente: 'Dr. López', versiones: ['A', 'B', 'C'],
    distribucion: { facil: 30, medio: 40, dificil: 30 },
    fechaHoraMs: Date.now() - (2 * 3600000)
  },
  {
    id: 4, codigo: 'ODO-220', materia: 'Anatomía Oral', carrera: 'Odontología', parcial: '1° Parcial',
    fecha: '2026-03-12', hora: '08:00', aula: 'Aula 102', estado: 'Entregado',
    totalPreguntas: 20, docente: 'Dra. Rivera', versiones: ['A', 'B'],
    distribucion: { facil: 40, medio: 40, dificil: 20 },
    fechaHoraMs: Date.now() - (30 * 3600000)
  },
  {
    id: 5, codigo: 'MED-301', materia: 'Patología General', carrera: 'Medicina', parcial: 'Examen Final',
    fecha: '2026-03-10', hora: '09:00', aula: 'Aula 401', estado: 'Calificado',
    totalPreguntas: 40, docente: 'Dr. Vargas', versiones: ['A', 'B', 'C', 'D'],
    distribucion: { facil: 30, medio: 40, dificil: 30 },
    fechaHoraMs: Date.now() - (72 * 3600000)
  },
])

const carrerasOptions = computed(() => {
  const carreras = [...new Set(examenes.value.map(e => e.carrera))]
  return carreras.map(c => ({ label: c, value: c }))
})

const parcialesOptions = [
  { label: '1° Parcial', value: '1° Parcial' },
  { label: '2° Parcial', value: '2° Parcial' },
  { label: 'Examen Final', value: 'Examen Final' },
  { label: '2da Instancia', value: '2da Instancia' },
]

const estadosOptions = [
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'En Proceso', value: 'En Proceso' },
  { label: 'Entregado', value: 'Entregado' },
  { label: 'Calificado', value: 'Calificado' },
]

const columns = [
  { name: 'materia', label: 'Materia / Carrera', field: 'materia', align: 'left', sortable: true },
  { name: 'parcial', label: 'Parcial', field: 'parcial', align: 'center', sortable: true },
  { name: 'fecha', label: 'Fecha / Hora', field: 'fecha', align: 'left', sortable: true },
  { name: 'aula', label: 'Aula', field: 'aula', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  { name: 'versiones', label: 'Versiones', field: 'versiones', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

const statsCards = computed(() => [
  { label: 'Pendientes', value: examenes.value.filter(e => e.estado === 'Pendiente').length, icon: 'pending_actions', color: 'orange' },
  { label: 'En Proceso', value: examenes.value.filter(e => e.estado === 'En Proceso').length, icon: 'hourglass_top', color: 'blue' },
  { label: 'Entregados', value: examenes.value.filter(e => e.estado === 'Entregado').length, icon: 'assignment_turned_in', color: 'green' },
  { label: 'Calificados', value: examenes.value.filter(e => e.estado === 'Calificado').length, icon: 'grade', color: 'purple' },
])

const examenesOrdenados = computed(() => {
  let result = [...examenes.value]
  if (filtros.value.carrera) result = result.filter(e => e.carrera === filtros.value.carrera)
  if (filtros.value.parcial) result = result.filter(e => e.parcial === filtros.value.parcial)
  if (filtros.value.estado) result = result.filter(e => e.estado === filtros.value.estado)
  if (filtros.value.busqueda) {
    const q = filtros.value.busqueda.toLowerCase()
    result = result.filter(e => e.materia.toLowerCase().includes(q) || e.codigo.toLowerCase().includes(q))
  }
  // Ordenar: los más próximos primero
  return result.sort((a, b) => a.fechaHoraMs - b.fechaHoraMs)
})

// Helper: ms restantes hasta el examen
function msRestantes(examen) {
  return examen.fechaHoraMs - Date.now()
}

function esProximo(examen) {
  const ms = msRestantes(examen)
  return ms > 0 && ms <= CONFIG.alertaHorasAntes * 3600000 && examen.estado === 'Pendiente'
}

function tiempoRestante(examen) {
  const ms = msRestantes(examen)
  const horas = Math.floor(ms / 3600000)
  const minutos = Math.floor((ms % 3600000) / 60000)
  if (horas > 0) return `${horas}h ${minutos}m`
  return `${minutos} min`
}

function horasParaGeneracion(examen) {
  const msHastaGeneracion = msRestantes(examen) - CONFIG.horasAntesGeneracion * 3600000
  if (msHastaGeneracion <= 0) return 'ahora'
  const horas = Math.floor(msHastaGeneracion / 3600000)
  return `${horas}h`
}

function puedeGenerarExamen(examen) {
  if (examen.estado !== 'Pendiente' && examen.estado !== 'En Proceso') return false
  // Disponible cuando faltan horas <= CONFIG.horasAntesGeneracion antes del examen
  return msRestantes(examen) <= CONFIG.horasAntesGeneracion * 3600000
}

function puedeVerPatron(examen) {
  return ['Entregado', 'Calificado'].includes(examen.estado) && examen.versiones?.length > 0
}

function getParcialColor(parcial) {
  const colors = { '1° Parcial': 'blue', '2° Parcial': 'orange', 'Examen Final': 'purple', '2da Instancia': 'red' }
  return colors[parcial] || 'grey'
}

function getEstadoColor(estado) {
  const colors = { 'Pendiente': 'orange', 'En Proceso': 'blue', 'Entregado': 'green', 'Calificado': 'purple' }
  return colors[estado] || 'grey'
}

function getEstadoIcon(estado) {
  const icons = { 'Pendiente': 'pending_actions', 'En Proceso': 'hourglass_top', 'Entregado': 'assignment_turned_in', 'Calificado': 'grade' }
  return icons[estado] || 'info'
}

function generarExamen(examen) {
  examenSeleccionado.value = examen
  versionesSeleccionadas.value = ['A']
  showDialogGenerar.value = true
}

function confirmarGeneracion() {
  $q.notify({
    type: 'positive',
    message: `Generando ${versionesSeleccionadas.value.length} versión(es) del examen de ${examenSeleccionado.value.materia}`,
    icon: 'auto_awesome'
  })
  // Mock: actualizamos el examen con las versiones
  const idx = examenes.value.findIndex(e => e.id === examenSeleccionado.value.id)
  if (idx !== -1) {
    examenes.value[idx].versiones = [...versionesSeleccionadas.value]
    if (examenes.value[idx].estado === 'Pendiente') {
      examenes.value[idx].estado = 'En Proceso'
    }
  }
  showDialogGenerar.value = false
}

function verPatron(examen) {
  versionPatron.value = examen.versiones[0]
  patronData.value = {
    materia: examen.materia,
    carrera: examen.carrera,
    docente: examen.docente,
    parcial: examen.parcial,
    fecha: examen.fecha,
    versiones: examen.versiones,
    // Respuestas mock por versión
    respuestas: Object.fromEntries(
      examen.versiones.map(v => [v, Array.from({ length: 100 }, () => ['A','B','C','D','E'][Math.floor(Math.random() * 5)])])
    )
  }
  showPatronDialog.value = true
}

function verDetalles(examen) {
  examenSeleccionado.value = examen
  showDetalles.value = true
}

function imprimirPatron() {
  window.print()
}

function cargarExamenes() {
  $q.notify({ type: 'info', message: 'Actualizando lista de exámenes...', icon: 'refresh' })
}
</script>

<style scoped>
.rol-examenes-page {
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
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
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
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.filters-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.table-card {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.materia-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fecha-cell {
  min-width: 110px;
}

.acciones-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.versiones-chips {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.estado-cell {
  display: flex;
  justify-content: center;
}

.dialog-header {
  background: linear-gradient(135deg, #4527a0, #7b1fa2);
  color: white;
  padding: 16px 20px;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  border-radius: 4px 4px 0 0;
}

.versiones-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Patrón */
.patron-dialog {
  background: white;
}

.patron-content {
  font-family: 'Arial', sans-serif;
  font-size: 11px;
  color: #000;
  padding: 16px;
}

.patron-header {
  display: flex;
  align-items: center;
  border: 2px solid #000;
  padding: 8px;
  margin-bottom: 8px;
}

.logo-fallback { margin-right: 12px; }
.logo-text {
  font-size: 18px;
  font-weight: 900;
  color: #1976d2;
  border: 3px solid #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
}

.header-info { flex: 1; }
.universidad-name { font-size: 13px; font-weight: 700; }
.carrera-line { font-size: 11px; }
.slogan { font-size: 9px; font-style: italic; }
.field-value { font-weight: 600; }

.codigo-section { margin-left: 12px; }
.codigo-box {
  border: 2px solid #000;
  padding: 8px 12px;
  font-weight: 900;
  font-size: 14px;
  text-align: center;
}

.datos-examen {
  border: 1px solid #ccc;
  padding: 8px;
  margin-bottom: 8px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.field-row {
  display: flex;
  gap: 6px;
  font-size: 11px;
}

.field-label { font-weight: 600; }

.respuestas-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 8px 0;
}

.respuestas-column { border: 1px solid #ccc; }

.column-header {
  display: flex;
  background: #eee;
  padding: 2px 4px;
  font-weight: 700;
}

.respuesta-row {
  display: flex;
  align-items: center;
  padding: 1px 4px;
  border-top: 1px solid #eee;
}

.pregunta-num {
  width: 20px;
  font-size: 10px;
  font-weight: 600;
  color: #333;
}

.opt-header {
  width: 18px;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
}

.bubble {
  width: 18px;
  height: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 9px;
  border: 1px solid #999;
  margin: 1px;
}

.bubble.filled {
  background: #000;
  color: white;
  border-color: #000;
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

@media print {
  .no-print { display: none !important; }
  .patron-content { padding: 0; }
}
</style>
