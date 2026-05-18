<template>
  <q-page padding class="bg-grey-1">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-primary text-weight-bold">Banco por Plan de Estudios</div>
        <div class="text-caption text-grey-7">
          Detecta bancos guardados en materias con el mismo codigo pero otro plan de estudios.
        </div>
      </div>
      <q-btn
        color="primary"
        icon="manage_search"
        label="Analizar"
        unelevated
        :loading="loadingReporte"
        :disable="!puedeAnalizar"
        @click="cargarReporte"
      />
    </div>

    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.sede_id"
              outlined
              dense
              emit-value
              map-options
              option-value="id"
              option-label="nombre"
              :options="sedes"
              label="Sede"
              :loading="loadingSedes"
              @update:model-value="onSedeChange"
            >
              <template #prepend>
                <q-icon name="apartment" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="filtros.carrera_id"
              outlined
              dense
              emit-value
              map-options
              use-input
              option-value="id"
              :option-label="formatCarrera"
              :options="carrerasFiltradas"
              label="Carrera"
              :disable="!filtros.sede_id"
              :loading="loadingCarreras"
              @filter="filtrarCarreras"
            >
              <template #prepend>
                <q-icon name="school" />
              </template>
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">Sin carreras para esta busqueda</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-2">
            <q-select
              v-model="filtros.parcial"
              outlined
              dense
              emit-value
              map-options
              :options="parciales"
              label="Parcial"
            >
              <template #prepend>
                <q-icon name="event_note" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-3">
            <q-input
              v-model.trim="filtros.codigo"
              outlined
              dense
              clearable
              label="Codigo de materia (opcional)"
              @keyup.enter="cargarReporte"
            >
              <template #prepend>
                <q-icon name="tag" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-banner v-if="reporte" dense class="bg-blue-1 text-blue-10 q-mb-md rounded-borders">
      <template #avatar>
        <q-icon name="info" color="primary" />
      </template>
      Analisis para <strong>{{ sedeActual }}</strong> / <strong>{{ carreraActual }}</strong
      >, {{ filtros.parcial }}. Este reporte solo diagnostica preguntas flotando por plan de
      estudios.
    </q-banner>

    <div class="row q-col-gutter-md q-mb-md">
      <div v-for="stat in stats" :key="stat.label" class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section>
            <div class="text-caption text-grey-7">{{ stat.label }}</div>
            <div :class="['text-h5 text-weight-bold', stat.color]">{{ stat.value }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold">Materias con preguntas flotando</div>
        <div class="text-caption text-grey-7">
          Resumen por materia detectada antes de revisar el detalle por docente y grupo.
        </div>
      </q-card-section>
      <q-table
        flat
        dense
        :rows="materiasDetectadas"
        :columns="materiasColumns"
        row-key="codigo"
        :loading="loadingReporte"
        :rows-per-page-options="[10, 25, 50]"
        no-data-label="No se detectaron materias con preguntas flotando para los filtros actuales."
      >
        <template #body-cell-materia="props">
          <q-td :props="props">
            <div class="text-weight-bold">{{ props.row.codigo }}</div>
            <div>{{ props.row.materia }}</div>
          </q-td>
        </template>
        <template #body-cell-planes="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <q-badge color="green" outline>Correcto {{ props.row.planesDestino }}</q-badge>
              <q-badge color="deep-orange" outline>Origen {{ props.row.planesOrigen }}</q-badge>
            </div>
          </q-td>
        </template>
        <template #body-cell-estado="props">
          <q-td :props="props">
            <q-badge color="deep-orange" outline>
              {{ props.row.preguntas }} preguntas flotando
            </q-badge>
            <q-badge color="blue-grey" outline class="q-ml-xs">
              {{ props.row.grupos }} docente/grupo
            </q-badge>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-card flat bordered>
      <q-card-section class="row items-center justify-between q-gutter-sm">
        <div>
          <div class="text-subtitle1 text-weight-bold">Detalle por docente y grupo</div>
          <div class="text-caption text-grey-7">
            Permite revisar de donde viene el banco y previsualizar sus preguntas.
          </div>
        </div>
        <div class="row items-center q-gutter-sm">
          <q-input
            v-model="busqueda"
            outlined
            dense
            clearable
            debounce="250"
            placeholder="Buscar codigo, materia, docente o grupo"
            class="search-input"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </q-card-section>

      <q-table
        flat
        :rows="rowsFiltradas"
        :columns="columns"
        row-key="issue_key"
        :loading="loadingReporte"
        :rows-per-page-options="[10, 25, 50, 100]"
        no-data-label="Selecciona sede y carrera para analizar bancos en otro plan."
      >
        <template #body="props">
          <q-tr :props="props" :class="{ 'bg-orange-1': props.row.estado === 'conflicto' }">
            <q-td key="materia" :props="props">
              <div class="text-weight-bold">{{ props.row.codigo }}</div>
              <div>{{ props.row.materia }}</div>
              <div class="text-caption text-grey-7">Grupo {{ props.row.grupo_teorico }}</div>
            </q-td>
            <q-td key="docente" :props="props">
              <div class="text-body2">{{ props.row.docente || 'Sin docente' }}</div>
            </q-td>
            <q-td key="planes" :props="props">
              <div class="row q-gutter-xs items-center no-wrap">
                <q-badge color="green" outline
                  >Correcto {{ formatPlan(props.row.plan_destino) }}</q-badge
                >
                <q-icon name="arrow_back" size="16px" color="grey-7" />
                <q-badge color="deep-orange" outline
                  >Origen {{ formatPlan(props.row.plan_origen) }}</q-badge
                >
              </div>
              <div v-if="props.row.origen_eliminada" class="text-caption text-negative">
                Materia origen eliminada
              </div>
            </q-td>
            <q-td key="conteo" :props="props">
              <div class="text-primary text-weight-bold text-body1">
                {{ props.row.preguntas_otro_plan }} preguntas
              </div>
              <q-badge color="blue-1" text-color="primary"> Otro plan </q-badge>
              <q-badge color="green-1" text-color="positive" class="q-ml-xs">
                Correcto {{ props.row.preguntas_plan_correcto }}
              </q-badge>
            </q-td>
            <q-td key="estado" :props="props">
              <q-badge :color="estadoMeta(props.row.estado).color">
                {{ estadoMeta(props.row.estado).label }}
              </q-badge>
            </q-td>
            <q-td key="acciones" :props="props" class="text-right">
              <q-btn
                dense
                flat
                round
                color="primary"
                icon="visibility"
                @click="previsualizar(props.row)"
              >
                <q-tooltip>Previsualizar preguntas</q-tooltip>
              </q-btn>
              <q-btn
                dense
                flat
                round
                color="orange"
                icon="drive_file_move"
                :loading="loadingTraslado && trasladoKey === props.row.issue_key"
                :disable="!puedeTrasladar(props.row)"
                @click="confirmarTraslado(props.row)"
              >
                <q-tooltip>{{ tooltipTraslado(props.row) }}</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="previewDialog" maximized>
      <q-card>
        <q-bar class="bg-primary text-white">
          <q-icon name="visibility" />
          <div>
            Previsualizacion de preguntas
            <span v-if="previewTotal">({{ previewPreguntas.length }} de {{ previewTotal }})</span>
          </div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section v-if="previewRow" class="bg-grey-2">
          <div class="row items-center justify-between q-gutter-sm">
            <div>
              <div class="text-subtitle1 text-weight-bold">
                {{ previewRow.codigo }} - {{ previewRow.materia }}
              </div>
              <div class="text-caption text-grey-7">
                Docente: {{ previewRow.docente || 'Sin docente' }} | Grupo
                {{ previewRow.grupo_teorico }} | {{ previewRow.parcial }} | Plan origen
                {{ formatPlan(previewRow.plan_origen) }}
              </div>
            </div>
            <q-badge color="primary" class="preview-count-badge">
              {{ previewTotal || previewRow.preguntas_otro_plan }} preguntas
            </q-badge>
          </div>
        </q-card-section>
        <q-card-section>
          <q-inner-loading :showing="loadingPreview">
            <q-spinner-dots size="42px" color="primary" />
          </q-inner-loading>
          <div class="row q-col-gutter-md">
            <div v-for="(pregunta, index) in previewPreguntas" :key="pregunta.id" class="col-12">
              <q-card flat bordered class="question-preview-card">
                <q-card-section>
                  <div class="row items-start no-wrap q-gutter-sm">
                    <q-avatar color="primary" text-color="white" size="34px">
                      {{ index + 1 }}
                    </q-avatar>
                    <div class="col">
                      <div class="row items-center q-gutter-xs q-mb-xs">
                        <q-badge color="blue-grey" outline>ID {{ pregunta.id }}</q-badge>
                        <q-badge color="primary" outline>{{ labelTipo(pregunta.tipo) }}</q-badge>
                        <q-badge :color="colorDificultad(pregunta.dificultad)" outline>
                          {{ labelDificultad(pregunta.dificultad) }}
                        </q-badge>
                      </div>
                      <div
                        class="question-statement"
                        v-html="pregunta.enunciado_html || pregunta.enunciado"
                      />
                      <div v-if="opcionesPregunta(pregunta).length" class="q-mt-sm">
                        <div
                          v-for="opcion in opcionesPregunta(pregunta)"
                          :key="opcion.id"
                          :class="[
                            'question-option',
                            esRespuestaCorrecta(pregunta, opcion) ? 'question-option--correct' : '',
                          ]"
                        >
                          <span class="question-option__id">{{ opcion.id }}</span>
                          <span>{{ opcion.text }}</span>
                          <q-icon
                            v-if="esRespuestaCorrecta(pregunta, opcion)"
                            name="check_circle"
                            color="positive"
                            size="16px"
                            class="q-ml-sm"
                          />
                        </div>
                      </div>
                      <div class="text-caption text-grey-7 q-mt-xs">
                        Respuesta correcta: {{ formatRespuesta(pregunta.respuesta_correcta) }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="bg-grey-1">
          <q-btn flat label="Cerrar" color="grey-8" v-close-popup />
          <q-btn
            color="primary"
            icon="picture_as_pdf"
            label="Previsualizar examen"
            outline
            :disable="previewPreguntas.length === 0"
            :loading="previsualizandoExamen"
            @click="previsualizarExamenFlotante"
          />
          <q-btn
            v-if="previewRow"
            color="orange"
            icon="drive_file_move"
            label="Trasladar este banco"
            unelevated
            :disable="!puedeTrasladar(previewRow)"
            :loading="loadingTraslado && trasladoKey === previewRow.issue_key"
            @click="confirmarTraslado(previewRow)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import {
  EXAM_PDF_DEFAULT_CONFIG,
  createExamPdfDocument,
  generateExamPdf,
  mixExamQuestionOptions,
  sortExamQuestionsForPdf,
} from 'src/services/examPdfService'

const $q = useQuasar()

const parciales = [
  { label: '2do Parcial', value: '2do Parcial' },
  { label: '1er Parcial', value: '1er Parcial' },
]

const filtros = ref({
  sede_id: null,
  carrera_id: null,
  parcial: '2do Parcial',
  codigo: '',
})

const sedes = ref([])
const carreras = ref([])
const carrerasFiltradas = ref([])
const reporte = ref(null)
const busqueda = ref('')
const previewDialog = ref(false)
const previewRow = ref(null)
const previewPreguntas = ref([])
const previewTotal = ref(0)

const loadingSedes = ref(false)
const loadingCarreras = ref(false)
const loadingReporte = ref(false)
const loadingPreview = ref(false)
const loadingTraslado = ref(false)
const previsualizandoExamen = ref(false)
const trasladoKey = ref(null)

const columns = [
  { name: 'materia', label: 'Materia / Grupo', field: 'codigo', align: 'left', sortable: true },
  { name: 'docente', label: 'Docente', field: 'docente', align: 'left', sortable: true },
  { name: 'planes', label: 'Versus de planes', field: 'plan_origen', align: 'left' },
  {
    name: 'conteo',
    label: 'Preguntas',
    field: 'preguntas_otro_plan',
    align: 'left',
    sortable: true,
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'right' },
]

const materiasColumns = [
  { name: 'materia', label: 'Materia', field: 'codigo', align: 'left', sortable: true },
  { name: 'planes', label: 'Planes detectados', field: 'planesOrigen', align: 'left' },
  { name: 'estado', label: 'Resumen', field: 'preguntas', align: 'left', sortable: true },
]

const rows = computed(() => reporte.value?.detalles || [])
const puedeAnalizar = computed(() => Boolean(filtros.value.sede_id && filtros.value.carrera_id))
const sedeActual = computed(
  () => sedes.value.find((sede) => sede.id === filtros.value.sede_id)?.nombre || '',
)
const carreraActual = computed(() => {
  const carrera = carreras.value.find((item) => item.id === filtros.value.carrera_id)
  return carrera ? formatCarrera(carrera) : ''
})

const rowsFiltradas = computed(() => {
  const term = busqueda.value.trim().toLowerCase()
  if (!term) return rows.value

  return rows.value.filter((row) =>
    [row.codigo, row.materia, row.docente, row.grupo_teorico, row.plan_origen, row.plan_destino]
      .join(' ')
      .toLowerCase()
      .includes(term),
  )
})

const materiasDetectadas = computed(() => {
  const mapa = new Map()

  rows.value.forEach((row) => {
    if (!mapa.has(row.codigo)) {
      mapa.set(row.codigo, {
        codigo: row.codigo,
        materia: row.materia,
        preguntas: 0,
        gruposKeys: new Set(),
        planesOrigen: new Set(),
        planesDestino: new Set(),
      })
    }

    const item = mapa.get(row.codigo)
    item.preguntas += Number(row.preguntas_otro_plan || 0)
    item.gruposKeys.add(`${row.docente_id}|${row.grupo_teorico}`)
    item.planesOrigen.add(formatPlan(row.plan_origen))
    item.planesDestino.add(formatPlan(row.plan_destino))
  })

  return Array.from(mapa.values()).map((item) => ({
    codigo: item.codigo,
    materia: item.materia,
    preguntas: item.preguntas,
    grupos: item.gruposKeys.size,
    planesOrigen: Array.from(item.planesOrigen).join(', '),
    planesDestino: Array.from(item.planesDestino).join(', '),
  }))
})

const stats = computed(() => {
  const resumen = reporte.value?.resumen || {}
  return [
    {
      label: 'Grupos revisados',
      value: resumen.grupos_revisados || 0,
      color: 'text-primary',
    },
    {
      label: 'Materias con flotantes',
      value: resumen.materias_detectadas || 0,
      color: 'text-deep-orange',
    },
    {
      label: 'Docente/grupo detectados',
      value: resumen.grupos_detectados || 0,
      color: 'text-positive',
    },
    {
      label: 'Preguntas flotando',
      value: resumen.preguntas_otro_plan || 0,
      color: 'text-deep-orange',
    },
  ]
})

onMounted(() => {
  cargarSedes()
})

async function cargarSedes() {
  loadingSedes.value = true
  try {
    const { data } = await api.post('/restauracion/bancos-plan/sedes')
    sedes.value = data || []
  } catch (error) {
    notificarError(error, 'No se pudieron cargar las sedes')
  } finally {
    loadingSedes.value = false
  }
}

async function cargarCarreras() {
  if (!filtros.value.sede_id) {
    carreras.value = []
    carrerasFiltradas.value = []
    return
  }

  loadingCarreras.value = true
  try {
    const { data } = await api.post('/restauracion/bancos-plan/carreras', {
      sede_id: filtros.value.sede_id,
    })
    carreras.value = data || []
    carrerasFiltradas.value = [...carreras.value]
  } catch (error) {
    notificarError(error, 'No se pudieron cargar las carreras')
  } finally {
    loadingCarreras.value = false
  }
}

function onSedeChange() {
  filtros.value.carrera_id = null
  reporte.value = null
  cargarCarreras()
}

function filtrarCarreras(val, update) {
  update(() => {
    const term = (val || '').toLowerCase()
    carrerasFiltradas.value = carreras.value.filter((carrera) =>
      formatCarrera(carrera).toLowerCase().includes(term),
    )
  })
}

async function cargarReporte() {
  if (!puedeAnalizar.value) {
    $q.notify({ type: 'warning', message: 'Selecciona una sede y una carrera.' })
    return
  }

  loadingReporte.value = true
  try {
    const { data } = await api.post('/restauracion/bancos-plan/preview', {
      sede_id: filtros.value.sede_id,
      carrera_id: filtros.value.carrera_id,
      parcial: filtros.value.parcial,
      codigo: filtros.value.codigo || null,
    })
    reporte.value = data
  } catch (error) {
    notificarError(error, 'No se pudo generar el reporte')
  } finally {
    loadingReporte.value = false
  }
}

async function previsualizar(row) {
  previewRow.value = row
  previewPreguntas.value = []
  previewTotal.value = Number(row.preguntas_otro_plan || 0)
  previewDialog.value = true
  loadingPreview.value = true
  try {
    const { data } = await api.post('/restauracion/bancos-plan/questions', {
      ...row,
      limit: Math.min(Number(row.preguntas_otro_plan || 300), 500),
    })
    previewTotal.value = data?.total || row.preguntas_otro_plan || 0
    previewPreguntas.value = normalizarPreguntasPreview(data?.preguntas || [])
  } catch (error) {
    notificarError(error, 'No se pudieron previsualizar las preguntas')
  } finally {
    loadingPreview.value = false
  }
}

async function previsualizarExamenFlotante() {
  if (!previewRow.value || previewPreguntas.value.length === 0) return

  previsualizandoExamen.value = true
  try {
    const preguntas = sortExamQuestionsForPdf(mixExamQuestionOptions([...previewPreguntas.value]), {
      aleatorizarSecciones: false,
      preservarOrdenOriginalBloques: true,
    })
    const configPreview = {
      ...EXAM_PDF_DEFAULT_CONFIG,
      aleatorizarSecciones: false,
    }
    const doc = createExamPdfDocument(configPreview)

    await generateExamPdf(
      doc,
      {
        codigo: previewRow.value.codigo || 'BANCO',
        materia: previewRow.value.materia || previewRow.value.materia_origen || '',
        docente: previewRow.value.docente || '',
        grupo: previewRow.value.grupo_teorico || '',
        sede: sedeActual.value || '',
        carrera: carreraActual.value || '',
        parcial: previewRow.value.parcial || filtros.value.parcial,
        fecha_examen: new Date().toISOString(),
        semestre: '',
        hora: '',
      },
      configPreview,
      'A',
      preguntas,
    )

    window.open(doc.output('bloburl'), '_blank')
  } catch (error) {
    console.error('Error al previsualizar examen flotante:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo generar la previsualizacion del examen.',
      caption: error.message,
    })
  } finally {
    previsualizandoExamen.value = false
  }
}

function normalizarPreguntasPreview(preguntas) {
  return preguntas.map((pregunta) => ({
    ...pregunta,
    enunciado: pregunta.enunciado || '',
    enunciado_html: pregunta.enunciado_html || pregunta.enunciado || '',
    opciones: parseOpciones(pregunta.opciones),
    grupo: previewRow.value?.grupo_teorico || '',
    grupoTeorico: previewRow.value?.grupo_teorico || '',
  }))
}

function parseOpciones(opciones) {
  if (Array.isArray(opciones)) return opciones.map(normalizarOpcion)
  if (!opciones) return []

  try {
    const parsed = JSON.parse(opciones)
    return Array.isArray(parsed) ? parsed.map(normalizarOpcion) : []
  } catch {
    return []
  }
}

function normalizarOpcion(opcion, index) {
  if (typeof opcion === 'string') {
    return { id: String.fromCharCode(65 + index), text: opcion }
  }

  return {
    id: opcion?.id || opcion?.key || String.fromCharCode(65 + index),
    text: opcion?.text || opcion?.label || opcion?.enunciado || '',
  }
}

function opcionesPregunta(pregunta) {
  return Array.isArray(pregunta.opciones) ? pregunta.opciones : []
}

function esRespuestaCorrecta(pregunta, opcion) {
  const respuesta = formatRespuesta(pregunta.respuesta_correcta).toUpperCase()
  const opcionId = String(opcion?.id || '').toUpperCase()
  return (
    respuesta === opcionId || respuesta.includes(`"${opcionId}"`) || respuesta.includes(opcionId)
  )
}

function formatRespuesta(respuesta) {
  if (Array.isArray(respuesta)) return respuesta.join(', ')
  if (respuesta === null || respuesta === undefined) return ''
  return String(respuesta)
    .replace(/[[\]"]/g, '')
    .trim()
}

function labelTipo(tipo) {
  return String(tipo || 'SIN TIPO').replaceAll('_', ' ')
}

function labelDificultad(dificultad) {
  const value = String(dificultad || '').toUpperCase()
  if (['1', 'FACIL'].includes(value)) return 'Facil'
  if (['2', 'MEDIO', 'MEDIA'].includes(value)) return 'Medio'
  if (['3', 'DIFICIL'].includes(value)) return 'Dificil'
  return dificultad || 'Sin dificultad'
}

function colorDificultad(dificultad) {
  const value = String(dificultad || '').toUpperCase()
  if (['1', 'FACIL'].includes(value)) return 'positive'
  if (['2', 'MEDIO', 'MEDIA'].includes(value)) return 'orange'
  if (['3', 'DIFICIL'].includes(value)) return 'negative'
  return 'grey'
}

function puedeTrasladar(row) {
  return ['restaurable', 'sin_grupo_actual'].includes(row?.estado)
}

function tooltipTraslado(row) {
  if (puedeTrasladar(row)) return 'Trasladar preguntas al plan correcto'
  return 'No se traslada porque el plan correcto ya tiene banco'
}

function confirmarTraslado(row) {
  if (!puedeTrasladar(row)) return

  $q.dialog({
    title: 'Confirmar traslado',
    message: `Se trasladaran ${row.preguntas_otro_plan} pregunta(s) de ${row.codigo} desde el plan ${formatPlan(row.plan_origen)} al plan ${formatPlan(row.plan_destino)} para el docente/grupo seleccionado.`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Trasladar',
      color: 'orange',
      unelevated: true,
    },
  }).onOk(() => trasladar(row))
}

async function trasladar(row) {
  loadingTraslado.value = true
  trasladoKey.value = row.issue_key

  try {
    const { data } = await api.post('/restauracion/bancos-plan/restore', {
      items: [row],
    })

    const movidas = data?.total_restaurado || 0
    const omitidos = data?.omitidos?.length || 0

    if (movidas > 0) {
      $q.notify({
        type: 'positive',
        message: `Traslado completado. Preguntas movidas: ${movidas}.`,
      })
      previewDialog.value = false
      await cargarReporte()
      return
    }

    $q.notify({
      type: 'warning',
      message: omitidos
        ? data.omitidos[0]?.motivo || 'El traslado fue omitido.'
        : 'No se trasladaron preguntas.',
    })
  } catch (error) {
    notificarError(error, 'No se pudo trasladar el banco')
  } finally {
    loadingTraslado.value = false
    trasladoKey.value = null
  }
}

function formatCarrera(carrera) {
  if (!carrera) return ''
  return carrera.sigla ? `${carrera.sigla} - ${carrera.nombre}` : carrera.nombre
}

function formatPlan(plan) {
  const value = String(plan || '').trim()
  return value || 'SIN PLAN'
}

function estadoMeta(estado) {
  const estados = {
    restaurable: { color: 'positive', label: 'Coincide con grupo actual' },
    conflicto: { color: 'warning', label: 'Tambien existe en plan correcto' },
    sin_grupo_actual: { color: 'blue-grey', label: 'Sin grupo actual exacto' },
  }

  return estados[estado] || { color: 'grey', label: 'Detectado' }
}

function notificarError(error, fallback) {
  console.error(fallback, error)
  $q.notify({
    type: 'negative',
    message: error.response?.data?.message || fallback,
  })
}
</script>

<style scoped>
.stat-card {
  min-height: 86px;
}

.search-input {
  min-width: 340px;
}

.preview-count-badge {
  font-size: 13px;
  padding: 8px 12px;
}

.question-preview-card {
  border-left: 4px solid var(--q-primary);
}

.question-statement {
  color: #10233f;
  font-size: 13px;
  line-height: 1.45;
}

.question-option {
  align-items: center;
  border: 1px solid #d9e2ef;
  border-radius: 6px;
  display: flex;
  margin-top: 6px;
  padding: 7px 9px;
}

.question-option--correct {
  background: #ecfdf3;
  border-color: #21ba45;
}

.question-option__id {
  align-items: center;
  background: #eef2f7;
  border-radius: 50%;
  display: inline-flex;
  font-weight: 700;
  height: 24px;
  justify-content: center;
  margin-right: 8px;
  min-width: 24px;
}

@media (max-width: 700px) {
  .search-input {
    min-width: 100%;
  }
}
</style>
