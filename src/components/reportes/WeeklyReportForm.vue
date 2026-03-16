<template>
  <div class="weekly-report-form">
    <div v-if="loading" class="row justify-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="!report" class="text-center text-grey q-pa-lg">
      <q-icon name="warning" size="3em" />
      <div class="text-h6 q-mt-md">No se pudo cargar el informe</div>
      <div>Verifique que existan horarios/cronogramas para esta semana.</div>
    </div>

    <div v-else class="q-pa-none">
      <!-- Header Document Style -->
      <div class="row items-center q-mb-md q-pb-sm border-bottom-primary">
        <div class="col">
          <div class="text-h6 text-primary text-weight-bold">
            NIVEL 2: CONTROL DEL DIRECTOR DE CARRERA
          </div>
          <div class="text-caption text-grey-8">
            Verificación técnica de cumplimiento micro-curricular semanal
          </div>
        </div>
        <div class="col-auto">
          <q-chip :color="alertColor" text-color="white" icon="assessment" class="text-weight-bold">
            {{ report.escala_alerta }} ({{ report.cumplimiento_porcentaje }}%)
          </q-chip>
        </div>
      </div>

      <!-- Metadata Grid -->
      <div class="bg-grey-1 q-pa-md rounded-borders q-mb-lg border-light">
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-4">
            <div class="text-caption text-grey-8 text-uppercase">Docente</div>
            <div class="text-subtitle2 text-weight-medium">{{ report.docente_nombre }}</div>
          </div>
          <div class="col-12 col-md-4">
            <div class="text-caption text-grey-8 text-uppercase">Asignatura</div>
            <div class="text-subtitle2 text-weight-medium">{{ report.asignatura_nombre }}</div>
          </div>
          <div class="col-12 col-md-4">
            <div class="text-caption text-grey-8 text-uppercase">Semana Académica</div>
            <div class="text-subtitle2 text-weight-medium text-primary">
              Semana {{ academicWeekNumber }}
            </div>
            <div class="text-caption text-grey-6">{{ weekRangeLabel }}</div>
          </div>
        </div>
      </div>
      <!-- Criteria Table -->
      <div v-if="hasCriteria">
        <q-markup-table flat bordered class="criteria-table q-mb-lg">
          <thead>
            <tr>
              <th class="text-left bg-grey-2 text-weight-bold" style="width: 35%">
                ELEMENTO VERIFICADO
              </th>
              <th class="text-center bg-grey-2 text-weight-bold" style="width: 15%">
                CUMPLIMIENTO
              </th>
              <th class="text-left bg-grey-2 text-weight-bold">OBSERVACIÓN / EVIDENCIA</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, key) in report.criterios" :key="key">
              <td class="vertical-top">
                <div class="text-weight-bold text-primary">{{ key }}</div>
                <div class="text-caption text-grey-8 q-mb-sm">
                  {{ getCriteriaDescription(key) }}
                </div>

                <!-- Stat Chips if present -->
                <div v-if="data.type === 'cumplimiento'" class="row q-gutter-xs">
                  <q-chip
                    class="q-ma-xs"
                    dense
                    color="positive"
                    text-color="white"
                    icon="check_circle"
                    >Totalmente: {{ data.stats.totalmente }}</q-chip
                  >
                  <q-chip class="q-ma-xs" dense color="warning" text-color="white" icon="timelapse"
                    >Parcial: {{ data.stats.parcialmente }}</q-chip
                  >
                  <q-chip class="q-ma-xs" dense color="negative" text-color="white" icon="cancel"
                    >No Cumplido: {{ data.stats.no_cumplido }}</q-chip
                  >
                </div>
                <div v-if="data.type === 'planificacion_item'" class="row q-gutter-xs">
                  <q-chip
                    v-for="(item, idx) in data.items"
                    :key="idx"
                    class="q-ma-xs chip-wrapped"
                    dense
                    outline
                    color="primary"
                    icon="analytics"
                  >
                    {{ item }}
                  </q-chip>
                  <q-chip
                    v-if="!data.items || data.items.length === 0"
                    class="q-ma-xs"
                    dense
                    outline
                    color="grey"
                  >
                    Ninguno detectado
                  </q-chip>
                </div>
                <div v-if="data.type === 'integracion'" class="row q-gutter-xs">
                  <q-chip
                    v-if="data.stats.investigacion"
                    class="q-ma-xs"
                    dense
                    outline
                    color="secondary"
                    >Investigación: {{ data.stats.investigacion }}</q-chip
                  >
                  <q-chip
                    v-if="data.stats.interaccion_social"
                    class="q-ma-xs"
                    dense
                    outline
                    color="secondary"
                    >Interacción Social: {{ data.stats.interaccion_social }}</q-chip
                  >
                  <q-chip
                    v-if="data.stats.internalizacion"
                    class="q-ma-xs"
                    dense
                    outline
                    color="secondary"
                    >Internalización: {{ data.stats.internalizacion }}</q-chip
                  >
                </div>
                <div v-if="data.type === 'evidencias'" class="row q-gutter-xs">
                  <q-chip
                    v-if="data.stats.fotos_videos"
                    class="q-ma-xs"
                    dense
                    outline
                    color="indigo"
                    icon="image"
                    >Fotos/Videos: {{ data.stats.fotos_videos }}</q-chip
                  >
                  <q-chip
                    v-if="data.stats.link_evidencia"
                    class="q-ma-xs"
                    dense
                    outline
                    color="indigo"
                    icon="link"
                    >Links: {{ data.stats.link_evidencia }}</q-chip
                  >
                  <q-chip
                    v-if="data.stats.archivos_secuencia"
                    class="q-ma-xs"
                    dense
                    outline
                    color="indigo"
                    icon="description"
                    >Docs: {{ data.stats.archivos_secuencia }}</q-chip
                  >
                </div>
                <!-- Botón Ver Sesiones y Evidencias -->
                <div v-if="data.type === 'evidencias'" class="q-mt-sm">
                  <q-btn
                    color="primary"
                    icon="visibility"
                    label="Ver Sesiones y Evidencias"
                    size="sm"
                    unelevated
                    @click="showSessionsModal = true"
                  />
                </div>
                <div v-if="data.type === 'registro_oportuno'" class="row q-gutter-xs">
                  <q-chip class="q-ma-xs" dense color="positive" text-color="white" icon="timer"
                    >En Hora: {{ data.stats.en_hora_verde }}</q-chip
                  >
                  <q-chip class="q-ma-xs" dense color="warning" text-color="white" icon="today"
                    >En el Día: {{ data.stats.en_el_dia_amarillo }}</q-chip
                  >
                  <q-chip class="q-ma-xs" dense color="negative" text-color="white" icon="history"
                    >Fuera: {{ data.stats.fuera_rojo }}</q-chip
                  >
                </div>
              </td>
              <td class="text-center vertical-top">
                <q-btn-toggle
                  v-model="data.cumple"
                  spread
                  no-caps
                  rounded
                  unelevated
                  toggle-color="positive"
                  :options="[
                    { label: 'Sí', value: true },
                    { label: 'No', value: false },
                  ]"
                  @update:model-value="recalculateAlert"
                />
              </td>
              <td class="vertical-top">
                <q-input
                  v-model="data.obs"
                  dense
                  outlined
                  autogrow
                  placeholder="Ingrese observación justificativa..."
                  class="full-width"
                />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>

      <div v-else class="q-banner bg-red-1 text-red-9 q-pa-md q-mb-lg rounded-borders border-red">
        <q-icon name="error" size="sm" class="q-mr-sm" />
        <strong>Sin Planificación:</strong> No se ha registrado cronograma para esta semana. El
        informe se guardará como <strong>ROJO</strong>.
      </div>

      <!-- General Observations -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm text-grey-9">
          Conclusiones / Recomendaciones del Director
        </div>
        <q-input
          v-model="report.observaciones"
          type="textarea"
          outlined
          rows="3"
          placeholder="Ingrese conclusiones generales o recomendaciones para el docente..."
          bg-color="white"
        />
      </div>

      <!-- Footnote / Printing -->
      <div class="row items-center justify-between q-mt-lg">
        <div class="text-caption text-grey-6">
          Escala de Alerta:
          <span class="text-positive text-weight-bold">Verde (67-100%)</span> •
          <span class="text-warning text-weight-bold">Amarillo (34-66%)</span> •
          <span class="text-negative text-weight-bold">Rojo (0-33%)</span>
        </div>
        <q-btn
          unelevated
          color="primary"
          icon="picture_as_pdf"
          label="Exportar PDF"
          @click="exportarPDF"
          :loading="exportando"
        />
      </div>

      <!-- Actions -->
      <div class="row justify-end q-gutter-sm q-mt-md">
        <q-btn flat label="Cancelar" v-close-popup color="grey-8" />
        <q-btn
          label="Guardar y Firmar Informe"
          color="primary"
          icon="save"
          @click="saveReport"
          :loading="saving"
        />
      </div>
    </div>

    <!-- Sessions & Evidences Modal -->
    <q-dialog v-model="showSessionsModal">
      <q-card style="min-width: 800px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Sesiones Controladas de la Semana</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div
            v-if="!report?.sesiones_detalle || report?.sesiones_detalle.length === 0"
            class="text-center text-grey"
          >
            No hay sesiones registradas.
          </div>
          <q-markup-table v-else flat bordered dense class="bg-grey-1">
            <thead>
              <tr>
                <th class="text-left text-weight-bold">Fecha</th>
                <th class="text-left text-weight-bold">Tema / Actividad</th>
                <th class="text-left text-weight-bold">Tipo Sesión</th>
                <th class="text-left text-weight-bold">Estado Real</th>
                <th class="text-left text-weight-bold">Evidencias Subidas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(session, idx) in report.sesiones_detalle" :key="idx">
                <td style="width: 15%">
                  {{
                    session.fecha && session.fecha !== 'N/A'
                      ? formatDateSimple(session.fecha)
                      : 'N/A'
                  }}
                </td>
                <td style="white-space: normal; min-width: 200px">{{ session.tema }}</td>
                <td style="width: 15%">
                  <q-badge
                    v-if="session.es_examen || session.tipo_examen"
                    :color="session.es_examen ? 'positive' : 'primary'"
                    class="q-mb-xs"
                  >
                    {{ formatSessionType(session) }}
                  </q-badge>
                  <q-badge v-else color="grey" class="q-mb-xs"> Clase Regular </q-badge>
                </td>
                <td style="width: 15%">
                  <q-badge :color="session.estado === 'PENDIENTE' ? 'red' : 'positive'">{{
                    session.estado
                  }}</q-badge>
                </td>
                <td>
                  <div class="row q-gutter-xs">
                    <template
                      v-if="session.evidencias && Object.keys(session.evidencias).length > 0"
                    >
                      <q-btn
                        v-for="(path, type) in session.evidencias"
                        :key="type"
                        v-show="path"
                        flat
                        round
                        dense
                        :color="getEvidenceColor(type)"
                        :icon="getEvidenceIcon(type)"
                        @click="openEvidence(path)"
                      >
                        <q-tooltip>{{ formatEvidenceType(type) }}</q-tooltip>
                      </q-btn>
                    </template>
                    <span v-else class="text-caption text-grey">Sin evidencias</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, date } from 'quasar'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const props = defineProps({
  grupoId: {
    type: Number,
    required: true,
  },
  fechaInicio: {
    type: String, // YYYY-MM-DD
    required: true,
  },
})

const emit = defineEmits(['saved'])
const $q = useQuasar()

const loading = ref(true)
const saving = ref(false)
const exportando = ref(false)
const report = ref(null)
const showSessionsModal = ref(false)

const alertColor = computed(() => {
  if (!report.value) return 'grey'
  switch (report.value.escala_alerta) {
    case 'VERDE':
      return 'positive'
    case 'AMARILLO':
      return 'warning'
    case 'ROJO':
      return 'negative'
    default:
      return 'grey'
  }
})

const weekRangeLabel = computed(() => {
  if (!report.value || !report.value.semana_inicio) return 'Sin fecha'
  try {
    const dataStr =
      typeof report.value.semana_inicio === 'string'
        ? report.value.semana_inicio.split('T')[0]
        : report.value.semana_inicio
    const start = new Date(dataStr + 'T12:00:00') // Force midday avoid TZ
    if (isNaN(start.getTime())) return 'Fecha inválida'
    const end = date.addToDate(start, { days: 5 }) // Mon-Sat
    return `${date.formatDate(start, 'DD/MM/YYYY')} al ${date.formatDate(end, 'DD/MM/YYYY')}`
  } catch {
    return 'Error de formato'
  }
})

const academicWeekNumber = computed(() => {
  if (!report.value || !report.value.semana_inicio) return '-'
  try {
    const dataStr =
      typeof report.value.semana_inicio === 'string'
        ? report.value.semana_inicio.split('T')[0]
        : report.value.semana_inicio

    // Base: Feb 9, 2026
    const baseDate = new Date('2026-02-09T12:00:00')
    const targetDate = new Date(dataStr + 'T12:00:00')

    const diffTime = targetDate - baseDate
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const week = Math.floor(diffDays / 7) + 1

    return week > 0 ? week : 1
  } catch {
    return '-'
  }
})

const hasCriteria = computed(() => {
  return (
    report.value &&
    report.value.criterios &&
    (Array.isArray(report.value.criterios)
      ? report.value.criterios.length > 0
      : Object.keys(report.value.criterios).length > 0)
  )
})

const getCriteriaDescription = (key) => {
  const details = {
    'Cumplimiento del Tema': 'Estado declarado por el docente (se marca SÍ si es Total o Parcial).',
    'Estrategias Pedagógicas':
      'Verificación del uso de métodos y recursos educativos planificados.',
    'Evaluación Formativa': 'Uso de instrumentos de evaluación durante la sesión.',
    'Secuencia Didáctica': 'Cumplimiento de los momentos de la clase (Inicio, Desarrollo, Cierre).',
    'Integración Transversal': 'Contiene Investigación, Interacción Social o Internacionalización.',
    'Evidencia de Aprendizaje': 'Respaldo multimedia, enlaces o documentos subidos.',
    'Registro Oportuno':
      'Puntualidad en el registro del seguimiento dentro de los tiempos institucionales.',
  }
  return details[key] || 'Verificación técnica.'
}

const formatDateSimple = (dateStr) => {
  if (!dateStr || dateStr === 'N/A') return dateStr
  try {
    return date.formatDate(new Date(dateStr + 'T12:00:00'), 'DD/MM/YYYY')
  } catch {
    return dateStr
  }
}

const getEvidenceIcon = (type) => {
  if (type === 'aprendizaje_activo') return 'image'
  if (type === 'evaluacion_formativa') return 'link'
  if (type === 'secuencia_didactica') return 'description'
  if (type === 'investigacion' || type === 'interaccion' || type === 'internalizacion')
    return 'auto_stories'
  return 'attach_file'
}

const getEvidenceColor = (type) => {
  if (type === 'aprendizaje_activo') return 'primary'
  if (type === 'evaluacion_formativa') return 'info'
  if (type === 'secuencia_didactica') return 'secondary'
  if (type === 'investigacion' || type === 'interaccion' || type === 'internalizacion')
    return 'accent'
  return 'grey'
}

const formatEvidenceType = (type) => {
  const titles = {
    aprendizaje_activo: 'Evidencia de Aprendizaje',
    evaluacion_formativa: 'Evidencia de Evaluación',
    secuencia_didactica: 'Archivo de Secuencia',
    investigacion: 'Gestión de I+D',
    interaccion: 'Interacción Social',
    internalizacion: 'Internalización',
  }
  return titles[type] || type
}

const openEvidence = (path) => {
  if (!path) return

  // If it looks like a backend file path
  if (path.includes('/') && !path.startsWith('http')) {
    window.open(`${api.defaults.baseURL.replace('/api', '/storage')}/${path}`, '_blank')
  }
  // If it's already a full URL
  else if (path.startsWith('http://') || path.startsWith('https://')) {
    window.open(path, '_blank')
  }
  // Otherwise, fallback to treating it as an external link (like 'google.com' or just text)
  else {
    window.open(`https://${path}`, '_blank')
  }
}

const formatSessionType = (session) => {
  if (session.es_examen) {
    const examType = session.tipo_examen
    if (examType === 'PRIMER_PARCIAL') return '1er Parcial'
    if (examType === 'SEGUNDO_PARCIAL') return '2do Parcial'
    if (examType === 'TERCER_PARCIAL') return '3er Parcial'
    if (examType === 'FINAL') return 'Examen Final'
    if (examType === 'RECUPERATORIO') return 'Recuperatorio'
    return 'Examen'
  }

  if (session.tipo_examen) {
    const practiceType = session.tipo_examen
    if (practiceType === 'LABORATORIO') return 'Práctica Lab.'
    if (practiceType === 'ANFITEATRO') return 'Práctica Anf.'
    if (practiceType === 'CAMPO') return 'Práctica Campo'
    if (practiceType === 'TALLER') return 'Taller Práctico'
    return 'Práctica Especial'
  }

  return 'Clase Regular'
}

// ─── INDIVIDUAL PDF EXPORT ──────────────────────────────────────────────────
const exportarPDF = () => {
  if (!report.value) return
  exportando.value = true
  try {
    const r = report.value
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const w = 210
    const margin = 14

    // Color del estado
    const colorMap = { VERDE: [27, 148, 69], AMARILLO: [204, 153, 0], ROJO: [193, 0, 21] }
    const statusColor = colorMap[r.escala_alerta] ?? [80, 80, 80]
    const azul = [21, 101, 192]

    // ── Encabezado ───────────────────────────────────────────────────────────
    doc.setFillColor(...azul)
    doc.rect(0, 0, w, 24, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('NIVEL 2: CONTROL DEL DIRECTOR DE CARRERA', margin, 11)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Verificación técnica de cumplimiento micro-curricular semanal', margin, 17)

    // Badge de estado
    const statusText = `${r.escala_alerta}  (${r.cumplimiento_porcentaje}%)`
    doc.setFillColor(...statusColor)
    doc.roundedRect(w - margin - 50, 8, 50, 10, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(statusText, w - margin - 25, 14.5, { align: 'center' })

    // ── Metadata ─────────────────────────────────────────────────────────────
    let y = 30
    doc.setTextColor(0)
    autoTable(doc, {
      startY: y,
      body: [
        ['Docente', r.docente_nombre ?? '—', 'Asignatura', r.asignatura_nombre ?? '—'],
        ['Semana', `Semana ${academicWeekNumber.value}`, 'Período', weekRangeLabel.value],
      ],
      bodyStyles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [240, 244, 255], cellWidth: 25 },
        1: { cellWidth: 70 },
        2: { fontStyle: 'bold', fillColor: [240, 244, 255], cellWidth: 25 },
        3: { cellWidth: 66 },
      },
      margin: { left: margin, right: margin },
    })

    // ── Criterios ─────────────────────────────────────────────────────────────
    y = doc.lastAutoTable.finalY + 6
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...azul)
    doc.text('ELEMENTOS VERIFICADOS', margin, y)

    const criteriosRows = []
    const getCriteriaDesc = (key) => {
      const details = {
        'Cumplimiento de Planificación':
          'Verificación del uso de métodos y recursos educativos planificados.',
        'Evaluación Formativa': 'Uso de instrumentos de evaluación durante la sesión.',
        'Secuencia Didáctica':
          'Cumplimiento de los momentos de la clase (Inicio, Desarrollo, Cierre).',
        'Integración Transversal':
          'Contiene Investigación, Interacción Social o Internacionalización.',
        'Evidencia de Aprendizaje': 'Respaldo multimedia, enlaces o documentos subidos.',
        'Registro Oportuno':
          'Puntualidad en el registro del seguimiento dentro de los tiempos institucionales.',
      }
      return details[key] || ''
    }

    if (r.criterios && typeof r.criterios === 'object') {
      Object.entries(r.criterios).forEach(([key, val]) => {
        criteriosRows.push([
          `${key}\n${getCriteriaDesc(key)}`,
          val.cumple ? 'SÍ' : 'NO',
          val.obs ?? '',
        ])
      })
    }

    autoTable(doc, {
      startY: y + 3,
      head: [['ELEMENTO VERIFICADO', 'CUMPLE', 'OBSERVACIÓN / EVIDENCIA']],
      body: criteriosRows,
      headStyles: { fillColor: azul, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, valign: 'top', cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 95 },
        1: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
        2: { cellWidth: 73 },
      },
      margin: { left: margin, right: margin },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.section === 'body') {
          data.cell.styles.textColor = data.row.raw[1] === 'SÍ' ? [27, 148, 69] : [193, 0, 21]
        }
      },
    })

    // ── Observaciones del Director ────────────────────────────────────────────
    y = doc.lastAutoTable.finalY + 6
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...azul)
    doc.text('CONCLUSIONES / RECOMENDACIONES DEL DIRECTOR', margin, y)
    y += 3
    autoTable(doc, {
      startY: y,
      body: [[r.observaciones || 'Sin observaciones registradas.']],
      bodyStyles: {
        fontSize: 9,
        fontStyle: 'italic',
        textColor: r.observaciones ? [30, 30, 30] : [150, 150, 150],
      },
      margin: { left: margin, right: margin },
    })

    // ── Pie de página ─────────────────────────────────────────────────────────
    const totalPags = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPags; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(150)
      doc.text(
        `Generado el ${date.formatDate(new Date(), 'DD/MM/YYYY HH:mm')}  ·  Página ${i} de ${totalPags}`,
        margin,
        290,
      )
      doc.setDrawColor(200)
      doc.line(margin, 286, w - margin, 286)
    }

    const docenteSlug = (r.docente_nombre ?? 'docente').replace(/\s+/g, '_').toLowerCase()
    doc.save(`informe_${docenteSlug}_semana${academicWeekNumber.value}_${props.fechaInicio}.pdf`)
    $q.notify({ color: 'positive', icon: 'check_circle', message: 'PDF generado correctamente' })
  } catch (err) {
    console.error('Error generando PDF:', err)
    $q.notify({ color: 'negative', icon: 'error', message: 'Error al generar el PDF' })
  } finally {
    exportando.value = false
  }
}
// ─────────────────────────────────────────────────────────────────────────────

const fetchDraft = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/reportes/semanal/draft', {
      params: {
        grupo_id: props.grupoId,
        fecha_inicio: props.fechaInicio,
      },
    })

    if (data.draft === null && data.message) {
      $q.notify({ type: 'warning', message: data.message })
      report.value = null
    } else {
      report.value = data.report
      // Ensure criteria is object for reactivity if array comes in
      if (Array.isArray(report.value.criterios) && report.value.criterios.length === 0) {
        // keep logic handling empty
      }
    }
  } catch (error) {
    console.error('Error fetching draft:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar borrador del informe' })
  } finally {
    loading.value = false
  }
}

const recalculateAlert = () => {
  if (!report.value) return

  if (!hasCriteria.value) {
    report.value.cumplimiento_porcentaje = 0
    report.value.escala_alerta = 'ROJO'
    return
  }

  const criteriaKeys = Object.keys(report.value.criterios)
  const yesCount = criteriaKeys.filter((k) => report.value.criterios[k].cumple).length
  const percentage = Math.round((yesCount / criteriaKeys.length) * 100)

  report.value.cumplimiento_porcentaje = percentage

  if (percentage <= 33) report.value.escala_alerta = 'ROJO'
  else if (percentage <= 66) report.value.escala_alerta = 'AMARILLO'
  else report.value.escala_alerta = 'VERDE'
}

const saveReport = async () => {
  saving.value = true
  try {
    console.log('Enviando datos del informe:', JSON.stringify(report.value, null, 2))
    const response = await api.post('/reportes/semanal', report.value)
    console.log('Respuesta del servidor:', response.data)
    $q.notify({ type: 'positive', message: 'Informe guardado correctamente' })
    emit('saved')
  } catch (error) {
    console.error('Error saving report:', error)
    console.error('Datos enviados:', report.value)
    console.error('Respuesta del error:', error.response?.data)
    $q.notify({ type: 'negative', message: 'Error al guardar el informe' })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchDraft()
})
</script>

<style scoped>
.weekly-report-form {
  max-width: 950px;
  margin: 0 auto;
}
.border-bottom-primary {
  border-bottom: 2px solid var(--q-primary);
}
.border-light {
  border: 1px solid #e0e0e0;
}
.border-red {
  border: 1px solid #ffcdd2;
}
.criteria-table th {
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}
.chip-wrapped {
  height: auto;
  min-height: 1.5rem;
  padding: 4px 8px;
}
.chip-wrapped :deep(.q-chip__content) {
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.2;
}
</style>
