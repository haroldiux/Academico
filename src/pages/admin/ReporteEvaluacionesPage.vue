<template>
  <q-page class="reporte-evaluaciones-page q-pa-md">
    <div class="page-header row items-center justify-between q-mb-md">
      <div>
        <h1 class="page-title">
          <q-icon name="query_stats" color="primary" class="q-mr-sm" />
          Reporte Evaluaciones
        </h1>
        <p class="page-subtitle">
          Estadisticas operativas de evaluaciones por alcance, estados y fechas.
        </p>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          flat
          round
          dense
          icon="refresh"
          color="grey-7"
          :loading="loadingReporte"
          @click="cargarReporte"
        >
          <q-tooltip>Actualizar reporte</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          color="teal"
          icon="picture_as_pdf"
          label="Exportar PDF"
          no-caps
          :disable="detalleRows.length === 0"
          @click="exportarPdf"
        />
      </div>
    </div>

    <section class="filters-band q-pa-md q-mb-md">
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-2">
          <q-select
            v-model="filtros.alcance"
            :options="alcanceOptions"
            label="Alcance"
            outlined
            dense
            emit-value
            map-options
            @update:model-value="onCambiarAlcance"
          >
            <template #prepend>
              <q-icon name="public" />
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model="filtros.gestion" label="Gestion" outlined dense>
            <template #prepend>
              <q-icon name="event_available" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-3">
          <q-select
            v-model="filtros.sede_id"
            :options="sedesOptions"
            label="Sede"
            outlined
            dense
            emit-value
            map-options
            clearable
            :disable="filtros.alcance === 'nacional'"
            @update:model-value="onCambiarSede"
          >
            <template #prepend>
              <q-icon name="apartment" />
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-3">
          <q-select
            v-model="filtros.carrera_id"
            :options="carrerasOptions"
            label="Carrera"
            outlined
            dense
            emit-value
            map-options
            clearable
            :disable="filtros.alcance !== 'carrera'"
          >
            <template #prepend>
              <q-icon name="school" />
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-2">
          <q-select
            v-model="filtros.parcial"
            :options="parcialOptions"
            label="Parcial"
            outlined
            dense
            emit-value
            map-options
            clearable
          >
            <template #prepend>
              <q-icon name="assignment" />
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-3">
          <q-select
            v-model="filtros.estados"
            :options="estadoOptions"
            label="Estados"
            outlined
            dense
            multiple
            emit-value
            map-options
            use-chips
            clearable
          >
            <template #prepend>
              <q-icon name="flag" />
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model="filtros.fecha_inicio" type="date" label="Desde" outlined dense />
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model="filtros.fecha_fin" type="date" label="Hasta" outlined dense />
        </div>
        <div class="col-12 col-md-2">
          <q-select
            v-model="filtros.origen"
            :options="origenOptions"
            label="Fuente"
            outlined
            dense
            emit-value
            map-options
          />
        </div>
        <div class="col-12 col-md-3">
          <q-btn
            class="full-width"
            unelevated
            color="primary"
            icon="analytics"
            label="Generar reporte"
            no-caps
            :loading="loadingReporte"
            @click="cargarReporte"
          />
        </div>
      </div>
    </section>

    <q-banner v-if="reporte" dense class="bg-blue-1 text-blue-10 q-mb-md rounded-borders">
      <template #avatar>
        <q-icon name="info" color="primary" />
      </template>
      Reporte generado para <strong>{{ alcanceLabel }}</strong>
      <span v-if="rangoLabel">, {{ rangoLabel }}</span
      >. La cobertura compara programaciones del rol contra registros operativos generados.
    </q-banner>

    <div class="row q-col-gutter-md q-mb-md">
      <div v-for="item in metricasPrincipales" :key="item.key" class="col-12 col-sm-6 col-lg-3">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="metric-label">{{ item.label }}</div>
            <div class="row items-end justify-between">
              <div class="metric-value" :class="item.className">{{ item.value }}</div>
              <q-icon :name="item.icon" :color="item.color" size="28px" />
            </div>
            <div class="metric-caption">{{ item.caption }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-lg-5">
        <q-card flat bordered>
          <q-card-section>
            <div class="section-title">Estados</div>
            <div class="section-subtitle">Distribucion del flujo operativo</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div v-for="estado in estadosRows" :key="estado.estado" class="state-row">
              <div class="row items-center justify-between q-mb-xs">
                <div class="row items-center">
                  <q-icon :name="getEstadoIcon(estado.estado)" class="q-mr-sm" color="primary" />
                  <span class="text-weight-medium">{{ estado.label }}</span>
                </div>
                <span class="text-weight-bold">{{ estado.total }}</span>
              </div>
              <div class="state-breakdown">
                Rol {{ estado.programados || 0 }} / Manual {{ estado.operativos || 0 }}
              </div>
              <q-linear-progress
                rounded
                size="8px"
                :value="getEstadoProgress(estado.total)"
                color="primary"
                track-color="grey-3"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-7">
        <q-card flat bordered>
          <q-card-section>
            <div class="section-title">Tendencia por fecha</div>
            <div class="section-subtitle">Programados, generados y finalizados en el rango</div>
          </q-card-section>
          <q-table
            flat
            dense
            :rows="fechaRows"
            :columns="fechaColumns"
            row-key="fecha"
            :loading="loadingReporte"
            :rows-per-page-options="[7, 15, 30]"
            no-data-label="No hay datos por fecha para los filtros seleccionados."
          />
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-lg-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="section-title">Resumen por sede</div>
          </q-card-section>
          <q-table
            flat
            dense
            :rows="sedeRows"
            :columns="agrupacionColumns"
            row-key="id"
            :loading="loadingReporte"
            :rows-per-page-options="[5, 10, 20]"
            no-data-label="Sin datos por sede."
          >
            <template #body-cell-avance="props">
              <q-td :props="props">
                <div class="avance-cell">
                  <q-linear-progress
                    rounded
                    size="8px"
                    :value="getAvanceAgrupacion(props.row)"
                    color="teal"
                    track-color="grey-3"
                  />
                  <span>{{ getAvanceAgrupacionLabel(props.row) }}</span>
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card>
      </div>

      <div class="col-12 col-lg-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="section-title">Resumen por carrera</div>
          </q-card-section>
          <q-table
            flat
            dense
            :rows="carreraRows"
            :columns="agrupacionColumns"
            row-key="id"
            :loading="loadingReporte"
            :rows-per-page-options="[5, 10, 20]"
            no-data-label="Sin datos por carrera."
          >
            <template #body-cell-avance="props">
              <q-td :props="props">
                <div class="avance-cell">
                  <q-linear-progress
                    rounded
                    size="8px"
                    :value="getAvanceAgrupacion(props.row)"
                    color="teal"
                    track-color="grey-3"
                  />
                  <span>{{ getAvanceAgrupacionLabel(props.row) }}</span>
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>

    <q-card flat bordered>
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="section-title">Detalle del reporte</div>
          <div class="section-subtitle">
            Maximo 500 registros para consulta y exportacion rapida
          </div>
        </div>
        <q-input
          v-model="busqueda"
          dense
          outlined
          clearable
          placeholder="Buscar materia, docente, carrera, sede o estado"
          style="width: min(420px, 100%)"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>
      <q-table
        flat
        :rows="detalleFiltrado"
        :columns="detalleColumns"
        row-key="row_key"
        :loading="loadingReporte"
        :rows-per-page-options="[10, 25, 50, 100]"
        no-data-label="No hay registros para los filtros seleccionados."
      >
        <template #body-cell-origen="props">
          <q-td :props="props">
            <q-chip
              :color="props.row.origen === 'manual' ? 'deep-purple' : 'blue-grey'"
              text-color="white"
              size="sm"
              dense
            >
              {{ props.row.origen === 'manual' ? 'Operativo' : 'Rol' }}
            </q-chip>
          </q-td>
        </template>
        <template #body-cell-estado="props">
          <q-td :props="props">
            <q-chip :color="getEstadoColor(props.row.estado)" text-color="white" size="sm" dense>
              {{ props.row.estado_label || props.row.estado }}
            </q-chip>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { date, useQuasar } from 'quasar'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

import { api } from 'boot/axios'
import { useCarrerasStore } from 'src/stores/carreras'
import { useSedesStore } from 'src/stores/sedes'

const $q = useQuasar()
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()

const today = new Date()
const filtros = reactive({
  alcance: 'nacional',
  gestion: '2026-I',
  sede_id: null,
  carrera_id: null,
  parcial: null,
  estados: [],
  origen: 'todos',
  fecha_inicio: date.formatDate(new Date(today.getFullYear(), today.getMonth(), 1), 'YYYY-MM-DD'),
  fecha_fin: date.formatDate(today, 'YYYY-MM-DD'),
})

const reporte = ref(null)
const loadingReporte = ref(false)
const busqueda = ref('')

const alcanceOptions = [
  { label: 'Nacional', value: 'nacional' },
  { label: 'Sede', value: 'sede' },
  { label: 'Carrera', value: 'carrera' },
]

const parcialOptions = [
  { label: '1er Parcial', value: '1er Parcial' },
  { label: '2do Parcial', value: '2do Parcial' },
  { label: 'Final', value: 'Final' },
  { label: '2da Instancia', value: '2da Instancia' },
]

const origenOptions = [
  { label: 'Todo', value: 'todos' },
  { label: 'Rol oficial', value: 'rol' },
  { label: 'Operativo', value: 'manual' },
]

const estadoOptions = [
  { label: 'Programado', value: 'PROGRAMADO' },
  { label: 'Generado', value: 'GENERADO' },
  { label: 'Impreso', value: 'IMPRESO' },
  { label: 'Entregado', value: 'ENTREGADO' },
  { label: 'Devuelto', value: 'DEVUELTO' },
  { label: 'Revisado', value: 'REVISADO' },
  { label: 'Subido', value: 'SUBIDO' },
]

const estadoMeta = {
  PROGRAMADO: { icon: 'event_note', color: 'blue-7' },
  GENERADO: { icon: 'auto_awesome', color: 'indigo-7' },
  IMPRESO: { icon: 'print', color: 'green-7' },
  ENTREGADO: { icon: 'inventory_2', color: 'orange-8' },
  DEVUELTO: { icon: 'assignment_returned', color: 'teal-7' },
  REVISADO: { icon: 'fact_check', color: 'deep-purple-7' },
  SUBIDO: { icon: 'cloud_done', color: 'purple-9' },
}

const sedesOptions = computed(() =>
  (sedesStore.sedes || []).map((sede) => ({
    label: sede.nombre,
    value: sede.id,
  })),
)

const carrerasOptions = computed(() => {
  const lista = filtros.sede_id
    ? carrerasStore.getCarrerasBySede(filtros.sede_id)
    : carrerasStore.carreras

  return (lista || []).map((carrera) => ({
    label: carrera.nombre,
    value: carrera.id,
  }))
})

const resumen = computed(() => reporte.value?.resumen || {})
const estadosRows = computed(() => reporte.value?.por_estado || [])
const fechaRows = computed(() => reporte.value?.por_fecha || [])
const sedeRows = computed(() => reporte.value?.por_sede || [])
const carreraRows = computed(() => reporte.value?.por_carrera || [])
const detalleRows = computed(() =>
  (reporte.value?.detalle || []).map((row, index) => ({
    ...row,
    row_key: `${row.origen}-${row.id}-${index}`,
  })),
)

const alcanceLabel = computed(() => {
  if (filtros.alcance === 'nacional') return 'nivel nacional'
  const sede = sedesOptions.value.find((item) => item.value === filtros.sede_id)?.label
  if (filtros.alcance === 'sede') return sede || 'sede seleccionada'
  const carrera = carrerasOptions.value.find((item) => item.value === filtros.carrera_id)?.label
  return [sede, carrera].filter(Boolean).join(' / ') || 'carrera seleccionada'
})

const rangoLabel = computed(() => {
  if (!filtros.fecha_inicio && !filtros.fecha_fin) return ''
  if (filtros.fecha_inicio && filtros.fecha_fin) {
    return `${filtros.fecha_inicio} al ${filtros.fecha_fin}`
  }
  return filtros.fecha_inicio ? `desde ${filtros.fecha_inicio}` : `hasta ${filtros.fecha_fin}`
})

const metricasPrincipales = computed(() => [
  {
    key: 'programados',
    label: 'Programados en rol',
    value: resumen.value.programados_rol || 0,
    caption: 'Examenes del rol oficial',
    icon: 'event_note',
    color: 'blue-7',
  },
  {
    key: 'operativos',
    label: 'Registros operativos',
    value: resumen.value.registros_operativos || 0,
    caption: 'Generaciones y seguimiento',
    icon: 'assignment_turned_in',
    color: 'deep-purple',
  },
  {
    key: 'generados',
    label: 'Generados',
    value: `${resumen.value.generados || 0}`,
    caption: `${resumen.value.cobertura_generacion || 0}% de cobertura sobre rol`,
    icon: 'auto_awesome',
    color: 'indigo-7',
  },
  {
    key: 'finalizados',
    label: 'Finalizados',
    value: `${resumen.value.finalizados || 0}`,
    caption: `${resumen.value.avance_finalizacion || 0}% con notas subidas`,
    icon: 'cloud_done',
    color: 'purple-9',
  },
])

const maxEstadoTotal = computed(() =>
  Math.max(...estadosRows.value.map((item) => Number(item.total || 0)), 1),
)

const detalleFiltrado = computed(() => {
  const term = busqueda.value
    ? busqueda.value
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    : ''

  if (!term) return detalleRows.value

  return detalleRows.value.filter((row) =>
    [
      row.sede,
      row.carrera,
      row.materia_codigo,
      row.materia_nombre,
      row.docente,
      row.parcial,
      row.grupo,
      row.estado_label,
    ]
      .join(' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .includes(term),
  )
})

const fechaColumns = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'programados', label: 'Rol', field: 'programados', align: 'center', sortable: true },
  { name: 'operativos', label: 'Operativos', field: 'operativos', align: 'center', sortable: true },
  { name: 'generados', label: 'Generados', field: 'generados', align: 'center', sortable: true },
  { name: 'finalizados', label: 'Subidos', field: 'finalizados', align: 'center', sortable: true },
]

const agrupacionColumns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'programados', label: 'Rol', field: 'programados', align: 'center', sortable: true },
  { name: 'operativos', label: 'Oper.', field: 'operativos', align: 'center', sortable: true },
  { name: 'generados', label: 'Gen.', field: 'generados', align: 'center', sortable: true },
  { name: 'finalizados', label: 'Sub.', field: 'finalizados', align: 'center', sortable: true },
  { name: 'avance', label: 'Avance', align: 'left' },
]

const detalleColumns = [
  { name: 'origen', label: 'Fuente', field: 'origen', align: 'center', sortable: true },
  { name: 'sede', label: 'Sede', field: 'sede', align: 'left', sortable: true },
  { name: 'carrera', label: 'Carrera', field: 'carrera', align: 'left', sortable: true },
  {
    name: 'materia',
    label: 'Materia',
    field: (row) => [row.materia_codigo, row.materia_nombre].filter(Boolean).join(' - '),
    align: 'left',
    sortable: true,
  },
  { name: 'docente', label: 'Docente', field: 'docente', align: 'left', sortable: true },
  { name: 'parcial', label: 'Parcial', field: 'parcial', align: 'center', sortable: true },
  { name: 'grupo', label: 'Grupo', field: 'grupo', align: 'center', sortable: true },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'center', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
]

function onCambiarAlcance(value) {
  if (value === 'nacional') {
    filtros.sede_id = null
    filtros.carrera_id = null
  }
  if (value === 'sede') {
    filtros.carrera_id = null
  }
}

function onCambiarSede() {
  filtros.carrera_id = null
}

function getEstadoIcon(estado) {
  return estadoMeta[estado]?.icon || 'radio_button_checked'
}

function getEstadoColor(estado) {
  return estadoMeta[estado]?.color || 'grey-7'
}

function getEstadoProgress(valor) {
  return Number(valor || 0) / maxEstadoTotal.value
}

function getAvanceAgrupacion(row) {
  const base = Number(row.programados || row.operativos || 0)
  if (!base) return 0
  return Math.min(Number(row.finalizados || 0) / base, 1)
}

function getAvanceAgrupacionLabel(row) {
  return `${Math.round(getAvanceAgrupacion(row) * 100)}%`
}

function buildParams() {
  return {
    gestion: filtros.gestion || undefined,
    sede_id: filtros.alcance !== 'nacional' ? filtros.sede_id || undefined : undefined,
    carrera_id: filtros.alcance === 'carrera' ? filtros.carrera_id || undefined : undefined,
    parcial: filtros.parcial || undefined,
    fecha_inicio: filtros.fecha_inicio || undefined,
    fecha_fin: filtros.fecha_fin || undefined,
    estado: filtros.estados?.length ? filtros.estados.join(',') : undefined,
    origen: filtros.origen || 'todos',
  }
}

async function cargarReporte() {
  if (filtros.alcance === 'sede' && !filtros.sede_id) {
    $q.notify({ type: 'warning', message: 'Selecciona una sede para generar el reporte.' })
    return
  }

  if (filtros.alcance === 'carrera' && (!filtros.sede_id || !filtros.carrera_id)) {
    $q.notify({ type: 'warning', message: 'Selecciona sede y carrera para generar el reporte.' })
    return
  }

  loadingReporte.value = true
  try {
    const { data } = await api.get('/reportes/evaluaciones', { params: buildParams() })
    reporte.value = data
  } catch (error) {
    console.error('Error cargando reporte de evaluaciones:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo generar el reporte de evaluaciones.',
      caption: error.response?.data?.message || error.message,
    })
  } finally {
    loadingReporte.value = false
  }
}

function pdfValue(value) {
  return String(value ?? '').trim() || '-'
}

function exportarPdf() {
  if (!detalleFiltrado.value.length) {
    $q.notify({ type: 'warning', message: 'No hay datos para exportar.' })
    return
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const generatedAt = date.formatDate(new Date(), 'DD/MM/YYYY HH:mm')
  const sede =
    filtros.alcance === 'nacional' ? 'Nacional' : alcanceLabel.value.split(' / ')[0] || '-'
  const carrera =
    filtros.alcance === 'carrera' ? alcanceLabel.value.split(' / ')[1] || '-' : 'Todas'
  const rango = rangoLabel.value || 'Sin rango de fechas'
  const parcial = filtros.parcial || 'Todos'
  const fuente = origenOptions.find((item) => item.value === filtros.origen)?.label || 'Todo'

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('REPORTE DE EVALUACIONES', 14, 14)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generado: ${generatedAt}`, pageWidth - 14, 14, { align: 'right' })

  autoTable(doc, {
    startY: 20,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 1.5 },
    body: [
      ['Alcance', alcanceLabel.value, 'Gestion', filtros.gestion || '-'],
      ['Sede', sede, 'Carrera', carrera],
      ['Rango de fechas', rango, 'Parcial', parcial],
      ['Fuente', fuente, 'Registros exportados', detalleFiltrado.value.length],
    ],
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 28 },
      1: { cellWidth: 115 },
      2: { fontStyle: 'bold', cellWidth: 32 },
      3: { cellWidth: 70 },
    },
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 4,
    head: [['Programados', 'Operativos', 'Generados', 'Subidos', 'Cobertura', 'Avance']],
    body: [
      [
        resumen.value.programados_rol || 0,
        resumen.value.registros_operativos || 0,
        resumen.value.generados || 0,
        resumen.value.finalizados || 0,
        `${resumen.value.cobertura_generacion || 0}%`,
        `${resumen.value.avance_finalizacion || 0}%`,
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [21, 101, 192], textColor: 255, fontSize: 8 },
    styles: { fontSize: 8, halign: 'center' },
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 5,
    head: [
      ['Fuente', 'Sede', 'Carrera', 'Materia', 'Docente', 'Parcial', 'Grupo', 'Fecha', 'Estado'],
    ],
    body: detalleFiltrado.value.map((row) => [
      row.origen === 'manual' ? 'Manual' : 'Rol',
      pdfValue(row.sede),
      pdfValue(row.carrera),
      pdfValue([row.materia_codigo, row.materia_nombre].filter(Boolean).join(' - ')),
      pdfValue(row.docente),
      pdfValue(row.parcial),
      pdfValue(row.grupo),
      pdfValue(row.fecha),
      pdfValue(row.estado_label || row.estado),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 7 },
    styles: { fontSize: 6.6, cellPadding: 1.4, overflow: 'linebreak', valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center' },
      1: { cellWidth: 24 },
      2: { cellWidth: 42 },
      3: { cellWidth: 56 },
      4: { cellWidth: 44 },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 13, halign: 'center' },
      7: { cellWidth: 20, halign: 'center' },
      8: { cellWidth: 20, halign: 'center' },
    },
    didDrawPage: () => {
      doc.setFontSize(7)
      doc.setTextColor(100)
      doc.text(
        `Pagina ${doc.internal.getNumberOfPages()}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 7,
        { align: 'right' },
      )
    },
  })

  const fileDate = date.formatDate(new Date(), 'YYYYMMDD_HHmm')
  doc.save(`reporte_evaluaciones_${fileDate}.pdf`)
}

onMounted(async () => {
  await Promise.all([sedesStore.fetchSedes(), carrerasStore.fetchCarreras()])
  cargarReporte()
})
</script>

<style scoped>
.reporte-evaluaciones-page {
  background: #f6f8fb;
  color: #0f172a;
}

.page-title {
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0;
}

.page-subtitle {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 13px;
}

.filters-band {
  width: 100%;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #ffffff;
}

.metric-card {
  min-height: 116px;
  border-radius: 8px;
}

.metric-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.metric-value {
  margin-top: 6px;
  color: #0f172a;
  font-size: 30px;
  font-weight: 850;
  line-height: 1;
}

.metric-caption {
  margin-top: 8px;
  color: #64748b;
  font-size: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 800;
}

.section-subtitle {
  color: #64748b;
  font-size: 12px;
}

.state-row {
  margin-bottom: 14px;
}

.state-breakdown {
  margin-bottom: 4px;
  color: #64748b;
  font-size: 11px;
}

.avance-cell {
  display: grid;
  grid-template-columns: minmax(80px, 1fr) 38px;
  align-items: center;
  gap: 8px;
  min-width: 130px;
  color: #334155;
  font-size: 12px;
}
</style>
