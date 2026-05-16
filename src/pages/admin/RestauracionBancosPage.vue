<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="row items-center no-wrap q-gutter-sm">
          <q-icon name="healing" size="28px" color="deep-orange" />
          <div>
            <div class="text-h6 text-weight-bold">Recuperación de Bancos de Preguntas</div>
            <div class="text-caption text-grey-6">
              Restaura preguntas que se desligaron de su materia por fusiones incorrectas
            </div>
          </div>
        </div>
      </div>
      <div class="col-auto">
        <q-badge color="deep-orange-1" text-color="deep-orange-9" class="q-pa-sm">
          <q-icon name="info" size="xs" class="q-mr-xs" />
          Solo SUPER_ADMIN
        </q-badge>
      </div>
    </div>

    <q-banner rounded class="bg-orange-1 text-orange-9 q-mb-md">
      <template #avatar><q-icon name="warning" color="orange" /></template>
      <div class="text-weight-medium">Filtros flexibles</div>
      <div>
        Puedes dejar cualquier filtro vacío. Si todos están vacíos se procesan todas las preguntas.
        <strong>Siempre haz clic en "Previsualizar" primero.</strong>
      </div>
    </q-banner>

    <!-- FILTROS -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-sm items-end">
          <div class="col-12 col-sm-2">
            <q-select
              v-model="parcial"
              :options="['1er Parcial', '2do Parcial']"
              label="Parcial"
              outlined dense emit-value
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filtroSedeId"
              :options="opcionesSedes"
              label="Sede (opcional)"
              outlined dense clearable emit-value map-options
              option-value="id" option-label="nombre"
              :loading="cargandoSedes"
              @update:model-value="onCambioSede"
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filtroCarreraId"
              :options="opcionesCarreras"
              label="Carrera (opcional)"
              outlined dense clearable emit-value map-options
              option-value="id" option-label="label"
              :loading="cargandoCarreras"
              @update:model-value="onCambioCarrera"
            />
          </div>
          <div class="col-12 col-sm-4">
            <q-select
              v-model="filtroMateria"
              :options="opcionesMaterias"
              label="Materia (opcional)"
              outlined dense clearable emit-value map-options
              option-value="value" option-label="label"
              :loading="cargandoMaterias"
              use-input
              input-debounce="200"
              @filter="filtrarMaterias"
            />
          </div>
        </div>
        <div class="row items-center q-gutter-md q-mt-sm">
          <q-space />
          <q-btn unelevated color="info" icon="preview" label="Previsualizar"
            :loading="loadingPreview" @click="preview" />
          <q-btn unelevated color="deep-orange" icon="healing" label="Ejecutar Restauración"
            :loading="loadingExecute" :disable="!puedeEjecutar" @click="confirmarEjecutar" />
        </div>
      </q-card-section>
    </q-card>

    <!-- LOADING -->
    <div v-if="loadingPreview || loadingExecute" class="column items-center q-py-xl">
      <q-spinner-dots color="deep-orange" size="40px" />
      <div class="q-mt-sm text-grey-6">
        {{ loadingExecute ? 'Ejecutando restauración...' : 'Analizando backups...' }}
      </div>
    </div>

    <!-- RESULTADOS -->
    <div v-if="mostrarResultados">
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-6 col-sm-3" v-for="stat in statsCards" :key="stat.label">
          <q-card flat bordered :class="'bg-' + stat.color + '-1'">
            <q-card-section class="text-center">
              <div class="text-h4" :class="'text-' + stat.color + '-9'">{{ stat.valor }}</div>
              <div class="text-caption" :class="'text-' + stat.color + '-8'">{{ stat.label }}</div>
            </q-card-section>
    </q-card>
      </div>
    </div>

    <!-- Preview -->
      <div v-if="previewData && !resultado?.ok">
        <div class="text-subtitle2 text-weight-bold q-mb-sm">
          <q-icon name="preview" color="info" class="q-mr-xs" />
          Resultados ({{ previewData.mostrando || previewData.detalles?.length || 0 }} de {{ previewData.total_encontradas || 0 }})
        </div>

        <div v-if="previewData.detalles && previewData.detalles.length > 0">
          <q-markup-table dense flat bordered class="q-mb-md">
            <thead>
              <tr>
                <th>ID</th>
                <th>Parcial</th>
                <th>Parcial Final</th>
                <th>Asig. Actual</th>
                <th>Asig. Correcta</th>
                <th>Origen</th>
                <th>Creado</th>
                <th>Doc</th>
                <th>Grupo</th>
                <th>Sede</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in previewData.detalles" :key="d.pregunta_id" :class="rowClass(d.accion)">
                <td>{{ d.pregunta_id }}</td>
                <td>{{ d.parcial }}</td>
                <td>
                  <span :class="d.auto_2do_parcial ? 'text-positive text-weight-medium' : ''">
                    {{ d.parcial_final || d.parcial }}
                  </span>
                  <q-badge v-if="d.auto_2do_parcial" color="green" text-color="white" class="q-ml-xs" dense>
                    2do ✓
                  </q-badge>
                </td>
                <td :class="d.accion === 'restaurar' ? 'text-negative' : ''">{{ d.asignatura_actual || 'N/A' }}</td>
                <td :class="d.accion === 'restaurar' ? 'text-positive text-weight-medium' : ''">{{ d.asignatura_sugerida || '—' }}</td>
                <td>{{ d.backup_fuente || '—' }}</td>
                <td class="text-caption">{{ formatFecha(d.created_at) }}</td>
                <td>{{ d.docente_id || '—' }}</td>
                <td>{{ d.grupo_teorico || '—' }}</td>
                <td>{{ d.sede_id || '—' }}</td>
                <td>
                  <q-chip dense size="sm" :color="accionColor(d.accion).bg"
                    :text-color="accionColor(d.accion).text" :icon="accionColor(d.accion).icon">
                    {{ accionLabel(d.accion) }}
                  </q-chip>
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>

      <!-- Execute results -->
      <div v-if="resultado?.ok && resultado.cambios && resultado.cambios.length > 0">
        <div class="text-subtitle2 text-weight-bold q-mb-sm">
          <q-icon name="checklist" color="positive" class="q-mr-xs" />
          {{ resultado.cambios.length }} preguntas restauradas
        </div>
        <q-table :rows="resultado.cambios" :columns="columnasCambios" row-key="pregunta_id"
          dense flat bordered :rows-per-page-options="[20, 50, 100]" />
      </div>

      <q-banner v-if="resultado?.ok && (!resultado.cambios || resultado.cambios.length === 0)"
        rounded class="bg-green-1 text-green-9">
        <template #avatar><q-icon name="check_circle" color="green" /></template>
        Todas las preguntas ya estaban en su asignatura correcta.
      </q-banner>

      <q-banner v-if="(previewData?.sin_consenso || 0) > 0" rounded class="bg-grey-2 text-grey-8 q-mt-md">
        <template #avatar><q-icon name="help" color="grey" /></template>
        {{ previewData.sin_consenso }} preguntas sin datos en backups — se usarán los datos de la asignatura actual.
      </q-banner>
    </div>

    <!-- EMPTY STATE -->
    <div v-if="!previewData && !resultado && !loadingPreview && !loadingExecute"
      class="column items-center q-py-xl">
      <q-icon name="healing" size="56px" color="grey-4" />
      <div class="q-mt-sm text-grey-6">Haz clic en "Previsualizar" para analizar las bases de datos</div>
    </div>

    <!-- CONFIRM DIALOG -->
    <q-dialog v-model="confirmDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-deep-orange text-white">
          <div class="text-h6">Confirmar Restauración</div>
        </q-card-section>
        <q-card-section>
          <p>Se procesarán <strong>{{ previewData?.total_procesar || 0 }}</strong> preguntas.</p>
          <p v-if="previewData?.restaurables > 0" class="text-positive text-weight-medium">
            {{ previewData.restaurables }} preguntas serán restauradas.
          </p>
          <p v-if="previewData?.sin_consenso > 0" class="text-orange text-weight-medium">
            {{ previewData.sin_consenso }} preguntas sin backup se restaurarán usando la asignatura actual.
          </p>
          <p class="text-negative text-weight-medium">Esta acción modifica la base de datos.</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn unelevated color="deep-orange" label="Sí, restaurar" @click="ejecutar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

// ── Filtros ──
const parcial = ref('2do Parcial')
const filtroSedeId = ref(null)
const filtroCarreraId = ref(null)
const filtroMateria = ref(null)

// ── Opciones de selectores ──
const opcionesSedes = ref([])
const opcionesCarreras = ref([])
const opcionesMaterias = ref([])
const todasMaterias = ref([])
const cargandoSedes = ref(false)
const cargandoCarreras = ref(false)
const cargandoMaterias = ref(false)

// ── Estado ──
const loadingPreview = ref(false)
const loadingExecute = ref(false)
const previewData = ref(null)
const resultado = ref(null)
const confirmDialog = ref(false)

// ── Computed ──
const puedeEjecutar = computed(() => {
  if (!previewData.value) return false
  return (previewData.value.restaurables || 0) > 0 || (previewData.value.sin_consenso || 0) > 0
})

const mostrarResultados = computed(() => {
  return (previewData.value || resultado.value) && !loadingPreview.value && !loadingExecute.value
})

const statsCards = computed(() => {
  const d = resultado.value || previewData.value
  if (!d) return []
  const total = d.total_procesar ?? (d.total_huerfanas || 0) + (d.total_mal_asignadas || 0)
  return [
    { label: 'Total a procesar', valor: total, color: 'blue' },
    { label: 'Restaurables', valor: d.restaurables ?? 0, color: 'deep-orange' },
    { label: 'Ya correctas', valor: d.ya_correctas ?? 0, color: 'green' },
    { label: 'Sin consenso', valor: d.sin_consenso ?? 0, color: 'grey' },
  ]
})

const columnasCambios = [
  { name: 'pregunta_id', label: 'ID', field: 'pregunta_id', align: 'left' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'old_asig', label: 'Asig. Anterior', field: 'old_asignatura_id', align: 'left' },
  { name: 'new_asig', label: 'Asig. Nueva', field: 'new_asignatura_id', align: 'left' },
  { name: 'plan', label: 'Plan', field: 'plan', align: 'center' },
]

// ── Selectores cascada ──
async function cargarSedes() {
  cargandoSedes.value = true
  try {
    const res = await api.post('/restauracion/bancos/sedes')
    opcionesSedes.value = res.data || []
  } catch { opcionesSedes.value = [] }
  finally { cargandoSedes.value = false }
}

async function cargarCarreras() {
  cargandoCarreras.value = true
  try {
    const params = {}
    if (filtroSedeId.value) params.sede_id = filtroSedeId.value
    const res = await api.post('/restauracion/bancos/carreras', params)
    opcionesCarreras.value = (res.data || []).map(c => ({
      id: c.id, label: `${c.sigla || c.id} — ${c.nombre}`,
    }))
  } catch { opcionesCarreras.value = [] }
  finally { cargandoCarreras.value = false }
}

async function cargarMaterias() {
  cargandoMaterias.value = true
  try {
    const params = {}
    if (filtroSedeId.value) params.sede_id = filtroSedeId.value
    if (filtroCarreraId.value) params.carrera_id = filtroCarreraId.value
    const res = await api.post('/restauracion/bancos/materias', params)
    todasMaterias.value = res.data || []
    opcionesMaterias.value = [...todasMaterias.value]
  } catch { todasMaterias.value = []; opcionesMaterias.value = [] }
  finally { cargandoMaterias.value = false }
}

function filtrarMaterias(val, update) {
  update(() => {
    const needle = (val || '').toLowerCase()
    opcionesMaterias.value = needle
      ? todasMaterias.value.filter(m => m.label.toLowerCase().includes(needle))
      : [...todasMaterias.value]
  })
}

function onCambioSede() {
  filtroCarreraId.value = null
  filtroMateria.value = null
  cargarCarreras()
}

function onCambioCarrera() {
  filtroMateria.value = null
  cargarMaterias()
}

// ── Helpers visuales ──
function accionColor(accion) {
  switch (accion) {
    case 'restaurar': return { bg: 'deep-orange-1', text: 'deep-orange-9', icon: 'healing' }
    case 'ya_correcta': return { bg: 'green-1', text: 'green-9', icon: 'check_circle' }
    case 'sin_consenso': return { bg: 'amber-1', text: 'amber-9', icon: 'warning' }
    default: return { bg: 'grey-2', text: 'grey-7', icon: 'help' }
  }
}
function accionLabel(accion) {
  switch (accion) {
    case 'restaurar': return 'Restaurar'
    case 'ya_correcta': return 'Correcta'
    case 'sin_consenso': return 'Sin backup'
    default: return accion
  }
}
function rowClass(accion) {
  if (accion === 'restaurar') return 'bg-orange-1'
  if (accion === 'ya_correcta') return 'bg-green-1'
  return ''
}

// ── Preview / Execute ──
function formatFecha(fecha) {
  if (!fecha) return '—'
  const d = new Date(fecha)
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function buildFilters() {
  const f = {}
  if (filtroSedeId.value) f.sede_id = filtroSedeId.value
  if (filtroCarreraId.value) f.carrera_id = filtroCarreraId.value
  if (filtroMateria.value) {
    const [codigo, plan] = filtroMateria.value.split('|')
    f.codigo = codigo
    f.plan_estudios = plan
  }
  return f
}

async function preview() {
  loadingPreview.value = true
  previewData.value = null
  resultado.value = null
  try {
    const res = await api.post('/restauracion/bancos/preview', {
      parcial: parcial.value,
      ...buildFilters(),
    })
    previewData.value = res.data
    Notify.create({
      type: 'info',
      message: `${res.data.total_encontradas || 0} encontradas, ${res.data.restaurables || 0} restaurables`,
    })
  } catch (e) {
    Notify.create({ type: 'negative', message: 'Error: ' + (e.response?.data?.message || e.message) })
  } finally { loadingPreview.value = false }
}

function confirmarEjecutar() { confirmDialog.value = true }

async function ejecutar() {
  confirmDialog.value = false
  loadingExecute.value = true
  resultado.value = null
  try {
    const res = await api.post('/restauracion/bancos/execute', {
      parcial: parcial.value,
      ...buildFilters(),
    })
    resultado.value = res.data
    previewData.value = null
    Notify.create({
      type: 'positive',
      message: `${res.data.restauradas || 0} preguntas restauradas`,
    })
  } catch (e) {
    Notify.create({ type: 'negative', message: 'Error: ' + (e.response?.data?.message || e.message) })
  } finally { loadingExecute.value = false }
}

// ── Init: solo cargar sedes al entrar ──
cargarSedes()

watch(parcial, () => {
  filtroSedeId.value = null
  filtroCarreraId.value = null
  filtroMateria.value = null
  opcionesCarreras.value = []
  opcionesMaterias.value = []
  todasMaterias.value = []
})
</script>
