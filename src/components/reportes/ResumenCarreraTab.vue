<template>
  <div class="resumen-carrera-container q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h5 class="text-h5 text-weight-bold q-my-none text-primary">Resumen Semanal de Carrera</h5>
        <div class="text-subtitle2 text-grey-7" v-if="semanaLabel">
          <span class="text-weight-bold text-primary">SEMANA {{ semanaNum }}</span>
          &nbsp;·&nbsp;{{ semanaLabel }}
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn color="primary" icon="refresh" flat round @click="cargarDatos">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
        <q-btn
          color="primary"
          icon="picture_as_pdf"
          unelevated
          label="Exportar PDF"
          @click="exportarPDF"
          :loading="exportando"
        />
      </div>
    </div>

    <!-- KPI Cards (clickeables) -->
    <div class="row q-col-gutter-md q-mb-lg" v-if="datosTotales.total > 0">
      <!-- VERDE -->
      <div class="col-12 col-md-4">
        <q-card
          flat
          bordered
          class="kpi-card hover-effect border-green"
          :class="{ 'kpi-active': filtroColor === 'verde' }"
          @click="toggleFiltro('verde')"
          style="cursor: pointer"
        >
          <q-card-section class="row items-center no-wrap">
            <q-avatar
              color="positive"
              text-color="white"
              icon="check_circle"
              size="50px"
              class="q-mr-md shadow-2"
            />
            <div class="col">
              <div class="text-h4 text-weight-bolder text-positive">
                {{ datosPorcentajes.verde }}%
              </div>
              <div class="text-caption text-weight-bold text-grey-8">Visto Bueno (67-100%)</div>
              <div class="text-caption text-grey">
                {{ datosTotales.verde }} informes<span
                  v-if="datosTotales.docentes_verde !== datosTotales.verde"
                >
                  · {{ datosTotales.docentes_verde }} docente{{
                    datosTotales.docentes_verde !== 1 ? 's' : ''
                  }}</span
                >
                — <span class="text-positive text-weight-medium">clic para ver lista</span>
              </div>
            </div>
            <q-icon
              :name="filtroColor === 'verde' ? 'expand_less' : 'expand_more'"
              color="positive"
              size="24px"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- AMARILLO -->
      <div class="col-12 col-md-4">
        <q-card
          flat
          bordered
          class="kpi-card hover-effect border-yellow"
          :class="{ 'kpi-active': filtroColor === 'amarillo' }"
          @click="toggleFiltro('amarillo')"
          style="cursor: pointer"
        >
          <q-card-section class="row items-center no-wrap">
            <q-avatar
              color="warning"
              text-color="white"
              icon="warning"
              size="50px"
              class="q-mr-md shadow-2"
            />
            <div class="col">
              <div class="text-h4 text-weight-bolder text-warning">
                {{ datosPorcentajes.amarillo }}%
              </div>
              <div class="text-caption text-weight-bold text-grey-8">Atención (34-66%)</div>
              <div class="text-caption text-grey">
                {{ datosTotales.amarillo }} informes<span
                  v-if="datosTotales.docentes_amarillo !== datosTotales.amarillo"
                >
                  · {{ datosTotales.docentes_amarillo }} docente{{
                    datosTotales.docentes_amarillo !== 1 ? 's' : ''
                  }}</span
                >
                — <span class="text-warning text-weight-medium">clic para ver lista</span>
              </div>
            </div>
            <q-icon
              :name="filtroColor === 'amarillo' ? 'expand_less' : 'expand_more'"
              color="warning"
              size="24px"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- ROJO -->
      <div class="col-12 col-md-4">
        <q-card
          flat
          bordered
          class="kpi-card hover-effect border-red"
          :class="{ 'kpi-active': filtroColor === 'rojo' }"
          @click="toggleFiltro('rojo')"
          style="cursor: pointer"
        >
          <q-card-section class="row items-center no-wrap">
            <q-avatar
              color="negative"
              text-color="white"
              icon="error"
              size="50px"
              class="q-mr-md shadow-2"
            />
            <div class="col">
              <div class="text-h4 text-weight-bolder text-negative">
                {{ datosPorcentajes.rojo }}%
              </div>
              <div class="text-caption text-weight-bold text-grey-8">Crítico (0-33%)</div>
              <div class="text-caption text-grey">
                {{ datosTotales.rojo }} informes<span
                  v-if="datosTotales.docentes_rojo !== datosTotales.rojo"
                >
                  · {{ datosTotales.docentes_rojo }} docente{{
                    datosTotales.docentes_rojo !== 1 ? 's' : ''
                  }}</span
                >
                — <span class="text-negative text-weight-medium">clic para ver lista</span>
              </div>
            </div>
            <q-icon
              :name="filtroColor === 'rojo' ? 'expand_less' : 'expand_more'"
              color="negative"
              size="24px"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Lista expandible por color -->
    <transition name="slide-fade">
      <q-card
        flat
        bordered
        class="q-mb-lg list-card"
        v-if="filtroColor && listaActual.length > 0"
        :key="filtroColor"
      >
        <q-card-section class="list-header" :class="`list-header-${filtroColor}`">
          <div class="row items-center justify-between">
            <div class="row items-center">
              <q-icon :name="iconoFiltro" size="22px" class="q-mr-sm" color="white" />
              <div>
                <div class="text-subtitle1 text-white text-weight-bold">{{ tituloFiltro }}</div>
                <div class="text-caption text-white opacity-80">
                  SEMANA {{ semanaNum }} — {{ semanaLabel }}
                </div>
              </div>
            </div>
            <q-btn flat round dense icon="close" color="white" @click="filtroColor = null" />
          </div>
        </q-card-section>
        <q-list separator>
          <q-item v-for="d in listaActual" :key="d.docente_id" class="q-py-sm">
            <q-item-section avatar>
              <q-avatar :color="colorAvatar" text-color="white" icon="person" size="36px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ d.nombre }}</q-item-label>
              <q-item-label caption>
                <q-chip
                  dense
                  square
                  size="sm"
                  icon="calendar_today"
                  outline
                  :color="colorAvatar"
                  class="q-mr-xs text-caption"
                >
                  {{ d.fecha }}
                </q-chip>
                <q-badge
                  :color="
                    colorAvatar === 'positive'
                      ? 'green-2'
                      : colorAvatar === 'warning'
                        ? 'amber-2'
                        : 'red-2'
                  "
                  :text-color="
                    colorAvatar === 'positive'
                      ? 'green-9'
                      : colorAvatar === 'warning'
                        ? 'amber-9'
                        : 'red-9'
                  "
                >
                  {{ d.materia }}
                </q-badge>
              </q-item-label>
              <q-item-label
                caption
                v-if="d.accion_director"
                class="text-italic text-grey-8 q-mt-xs"
              >
                <q-icon name="comment" size="12px" class="q-mr-xs" />{{ d.accion_director }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge :color="colorAvatar" outline>{{ filtroColor.toUpperCase() }}</q-badge>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
      <q-card
        flat
        bordered
        class="q-mb-lg"
        v-else-if="filtroColor && listaActual.length === 0"
        :key="`empty-${filtroColor}`"
      >
        <q-card-section class="text-center text-grey-6 q-pa-lg">
          <q-icon name="sentiment_satisfied_alt" size="40px" class="q-mb-xs" />
          <div>No hay docentes en este estado para la semana seleccionada.</div>
        </q-card-section>
      </q-card>
    </transition>

    <div v-if="!loading && datosTotales.total === 0" class="q-pa-xl text-center">
      <q-icon name="assessment" size="64px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-sm">No hay reportes semanales registrados</div>
    </div>

    <!-- Gráfico Diario -->
    <q-card flat bordered class="q-mb-lg chart-card" v-if="graficoCargado">
      <q-card-section class="bg-gradient-primary-dark text-white">
        <div class="row items-center">
          <q-icon name="bar_chart" size="26px" class="q-mr-sm" />
          <div>
            <div class="text-h6 text-weight-bold">Actividad Académica por Día</div>
            <div class="text-caption opacity-70">
              Sesiones esperadas (horario) vs sesiones marcadas (control de clase)
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-section class="q-pa-sm">
        <apexchart type="bar" height="260" :options="chartOptions" :series="chartSeries" />
      </q-card-section>
      <q-card-section class="row q-gutter-md q-pt-none">
        <div class="row items-center">
          <div class="legend-dot" style="background: #1565c0"></div>
          <span class="text-caption text-grey-8 q-ml-xs">Sesiones Esperadas (Horario)</span>
        </div>
        <div class="row items-center">
          <div class="legend-dot" style="background: #00c853"></div>
          <span class="text-caption text-grey-8 q-ml-xs">Sesiones Marcadas (Control de Clase)</span>
        </div>
      </q-card-section>
    </q-card>

    <q-inner-loading :showing="loading">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, date } from 'quasar'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const props = defineProps({
  sedeId: { type: Number, required: false },
  carreraId: { type: Number, required: false },
  semana: { type: String, required: true },
  carreraNombre: { type: String, default: '' },
})

const $q = useQuasar()
const loading = ref(false)
const exportando = ref(false)

const datosTotales = ref({
  rojo: 0,
  amarillo: 0,
  verde: 0,
  total: 0,
  docentes_rojo: 0,
  docentes_amarillo: 0,
  docentes_verde: 0,
})
const datosPorcentajes = ref({ rojo: 0, amarillo: 0, verde: 0 })
const docentesRojo = ref([])
const docentesAmarillo = ref([])
const docentesVerde = ref([])
const graficoDiario = ref(null)
const semanaFin = ref('')
const semanaNum = ref(0)
const filtroColor = ref(null)

const semanaLabel = computed(() => {
  if (!props.semana) return ''
  const ini = date.formatDate(new Date(props.semana + 'T12:00:00'), 'DD/MM/YYYY')
  return semanaFin.value
    ? `${ini} – ${date.formatDate(new Date(semanaFin.value + 'T12:00:00'), 'DD/MM/YYYY')}`
    : ini
})
const graficoCargado = computed(() => graficoDiario.value !== null)

const listaActual = computed(() => {
  if (filtroColor.value === 'rojo') return docentesRojo.value
  if (filtroColor.value === 'amarillo') return docentesAmarillo.value
  if (filtroColor.value === 'verde') return docentesVerde.value
  return []
})
const colorAvatar = computed(
  () =>
    ({
      rojo: 'negative',
      amarillo: 'warning',
      verde: 'positive',
    })[filtroColor.value] ?? 'grey',
)
const tituloFiltro = computed(
  () =>
    ({
      rojo: `Docentes en ROJO (Crítico 0-33%)`,
      amarillo: `Docentes en AMARILLO (Atención 34-66%)`,
      verde: `Docentes en VERDE (Visto Bueno 67-100%)`,
    })[filtroColor.value] ?? '',
)
const iconoFiltro = computed(
  () =>
    ({
      rojo: 'error',
      amarillo: 'warning',
      verde: 'check_circle',
    })[filtroColor.value] ?? 'list',
)

const toggleFiltro = (color) => {
  filtroColor.value = filtroColor.value === color ? null : color
}

const chartSeries = computed(() => {
  if (!graficoDiario.value) return []
  return [
    { name: 'Sesiones Esperadas', data: graficoDiario.value.esperadas },
    { name: 'Sesiones Marcadas', data: graficoDiario.value.marcadas },
  ]
})
const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    animations: {
      enabled: true,
      easing: 'easeOutBounce',
      speed: 800,
      animateGradually: { enabled: true, delay: 100 },
      dynamicAnimation: { enabled: true, speed: 500 },
    },
    dropShadow: { enabled: true, blur: 4, left: 0, top: 4, opacity: 0.15 },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 6,
      dataLabels: { position: 'top' },
    },
  },
  dataLabels: {
    enabled: true,
    offsetY: -20,
    style: { fontSize: '11px', fontWeight: 700, colors: ['#333'] },
  },
  colors: ['#1565C0', '#00C853'],
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      gradientToColors: ['#42A5F5', '#69F0AE'],
      opacityFrom: 1,
      opacityTo: 0.75,
      stops: [0, 100],
    },
  },
  stroke: { show: true, width: 2, colors: ['transparent'] },
  xaxis: {
    categories: graficoDiario.value?.dias ?? [],
    labels: { style: { fontSize: '12px', fontWeight: 600, colors: '#546E7A' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { fontSize: '11px', colors: '#90A4AE' }, formatter: (v) => Math.round(v) },
    min: 0,
  },
  grid: { borderColor: '#f0f0f0', strokeDashArray: 4, xaxis: { lines: { show: false } } },
  legend: { show: false },
  tooltip: { theme: 'dark', y: { formatter: (v) => `${v} sesiones` } },
}))

// ─── PDF EXPORT ──────────────────────────────────────────────────────────────
const exportarPDF = () => {
  exportando.value = true
  try {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const azul = [21, 101, 192]
    const W = 297

    const buildSeccion = (titulo, lista, colorH) => {
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 60
      // Check page space
      if (finalY > 185) doc.addPage()
      const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 60
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...colorH)
      doc.text(titulo, 14, startY)
      if (lista.length === 0) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(150)
        doc.text('Ningún docente en este estado.', 14, startY + 5)
        // fake autoTable position
        doc.lastAutoTable = { finalY: startY + 8 }
        return
      }
      autoTable(doc, {
        startY: startY + 2,
        head: [['Fecha', 'Docente', 'Materia', 'Observación / Acción del Director']],
        body: lista.map((d) => [d.fecha ?? '—', d.nombre, d.materia, d.accion_director || '—']),
        headStyles: { fillColor: colorH, textColor: 255, fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, valign: 'top' },
        columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 58 }, 2: { cellWidth: 50 } },
        margin: { left: 14, right: 14 },
      })
    }

    // ── Encabezado ────────────────────────────────────────────────────────────
    doc.setFillColor(...azul)
    doc.rect(0, 0, W, 22, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('RESUMEN SEMANAL DE CARRERA', 14, 11)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`SEMANA ${semanaNum.value}   |   ${semanaLabel.value}`, 14, 18)
    doc.text(`Generado: ${date.formatDate(new Date(), 'DD/MM/YYYY HH:mm')}`, W - 14, 18, {
      align: 'right',
    })

    // ── KPIs ──────────────────────────────────────────────────────────────────
    let y = 28
    autoTable(doc, {
      startY: y,
      head: [['VERDE (67-100%)', 'AMARILLO (34-66%)', 'ROJO (0-33%)', 'TOTAL']],
      body: [
        [
          `${datosPorcentajes.value.verde}%  (${datosTotales.value.verde})`,
          `${datosPorcentajes.value.amarillo}%  (${datosTotales.value.amarillo})`,
          `${datosPorcentajes.value.rojo}%  (${datosTotales.value.rojo})`,
          `${datosTotales.value.total} informes`,
        ],
      ],
      headStyles: { fillColor: azul, textColor: 255, fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { fontSize: 10, fontStyle: 'bold' },
      columnStyles: {
        0: { textColor: [27, 148, 69] },
        1: { textColor: [180, 130, 0] },
        2: { textColor: [193, 0, 21] },
        3: { textColor: [60, 60, 60] },
      },
      margin: { left: 14, right: 14 },
    })

    // ── Listas por color ──────────────────────────────────────────────────────
    buildSeccion('DOCENTES EN ESTADO ROJO (Crítico 0-33%)', docentesRojo.value, [193, 0, 21])
    buildSeccion(
      'DOCENTES EN ESTADO AMARILLO (Atención 34-66%)',
      docentesAmarillo.value,
      [180, 130, 0],
    )
    buildSeccion(
      'DOCENTES EN ESTADO VERDE (Visto Bueno 67-100%)',
      docentesVerde.value,
      [27, 148, 69],
    )

    // ── Pie ───────────────────────────────────────────────────────────────────
    const total = doc.internal.getNumberOfPages()
    for (let i = 1; i <= total; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(`Página ${i} de ${total}`, W - 14, 205, { align: 'right' })
    }

    doc.save(`resumen_carrera_semana${semanaNum.value}_${props.semana}.pdf`)
    $q.notify({ color: 'positive', icon: 'check_circle', message: 'PDF generado exitosamente' })
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', icon: 'error', message: 'Error al generar el PDF' })
  } finally {
    exportando.value = false
  }
}
// ─────────────────────────────────────────────────────────────────────────────

const cargarDatos = async () => {
  if (!props.carreraId || !props.semana) return
  loading.value = true
  try {
    const { data } = await api.get('/reportes/director/resumen-carrera', {
      params: { sede_id: props.sedeId, carrera_id: props.carreraId, semana_inicio: props.semana },
    })
    datosTotales.value = data.totales
    datosPorcentajes.value = data.porcentajes
    docentesRojo.value = data.docentes_rojo ?? []
    docentesAmarillo.value = data.docentes_amarillo ?? []
    docentesVerde.value = data.docentes_verde ?? []
    graficoDiario.value = data.grafico_diario ?? null
    semanaFin.value = data.semana_fin ?? ''
    semanaNum.value = data.semana_academica ?? 0
  } catch (error) {
    console.error('Error:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar el resumen de la carrera',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

watch(() => props.semana, cargarDatos)
watch(() => props.carreraId, cargarDatos)
watch(() => props.sedeId, cargarDatos)
onMounted(cargarDatos)
</script>

<style scoped>
.border-green {
  border-left: 4px solid #21ba45;
}
.border-yellow {
  border-left: 4px solid #f2c037;
}
.border-red {
  border-left: 4px solid #c10015;
}
.kpi-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}
.kpi-active {
  box-shadow: 0 0 0 2px currentColor;
}
.chart-card {
  overflow: hidden;
}
.bg-gradient-primary-dark {
  background: linear-gradient(135deg, #1a237e 0%, #283593 60%, #1565c0 100%);
}
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
/* Colored list headers */
.list-header-verde {
  background: linear-gradient(90deg, #1b7a38, #43a047);
}
.list-header-amarillo {
  background: linear-gradient(90deg, #b47a00, #f9a825);
}
.list-header-rojo {
  background: linear-gradient(90deg, #b71c1c, #e53935);
}
/* Slide transition */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}
</style>
