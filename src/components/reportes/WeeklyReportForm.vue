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

      <!-- Sessions Detail Table -->
      <div v-if="report.sesiones_detalle && report.sesiones_detalle.length > 0" class="q-mb-lg">
        <div class="text-subtitle2 q-mb-sm text-grey-9 text-uppercase">Sesiones Controladas</div>
        <q-markup-table flat bordered dense class="bg-grey-1">
          <thead>
            <tr>
              <th class="text-left text-weight-bold">Fecha</th>
              <th class="text-left text-weight-bold">Tema</th>
              <th class="text-left text-weight-bold">Tipo</th>
              <th class="text-left text-weight-bold">Estado Real</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(session, idx) in report.sesiones_detalle" :key="idx">
              <td style="width: 15%">{{ formatDateSimple(session.fecha) }}</td>
              <td>{{ session.tema }}</td>
              <td style="width: 15%">
                <q-chip
                  dense
                  :color="
                    session.tipo === 'Programada'
                      ? 'primary'
                      : session.tipo === 'Extra'
                        ? 'secondary'
                        : 'grey'
                  "
                  text-color="white"
                >
                  {{ session.tipo }}
                </q-chip>
              </td>
              <td style="width: 15%">
                <q-badge :color="session.estado === 'PENDIENTE' ? 'red' : 'positive'">{{
                  session.estado
                }}</q-badge>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
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
                  <q-chip class="q-ma-xs" dense outline color="primary" icon="analytics"
                    >Detectados: {{ data.stats.count }}</q-chip
                  >
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
          <span class="text-positive text-weight-bold">Verde (90-100%)</span> •
          <span class="text-warning text-weight-bold">Amarillo (70-89%)</span> •
          <span class="text-negative text-weight-bold">Rojo (0-69%)</span>
        </div>
        <q-btn
          outline
          color="primary"
          icon="print"
          label="Generar Reporte Imprimible"
          @click="printOfficialReport"
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, date } from 'quasar'

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
const report = ref(null)

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

const formatDateSimple = (dateStr) => {
  if (!dateStr || dateStr === 'N/A') return dateStr
  try {
    return date.formatDate(new Date(dateStr + 'T12:00:00'), 'DD/MM/YYYY')
  } catch {
    return dateStr
  }
}

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

  if (percentage < 70) report.value.escala_alerta = 'ROJO'
  else if (percentage < 90) report.value.escala_alerta = 'AMARILLO'
  else report.value.escala_alerta = 'VERDE'
}

const saveReport = async () => {
  saving.value = true
  try {
    await api.post('/reportes/semanal', report.value)
    $q.notify({ type: 'positive', message: 'Informe guardado correctamente' })
    emit('saved')
  } catch (error) {
    console.error('Error saving report:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar el informe' })
  } finally {
    saving.value = false
  }
}

const printOfficialReport = () => {
  if (!report.value || !report.value.grupo_id) return

  // Construir URL para el reporte HTML imprimible
  const url = `${api.defaults.baseURL}/reportes/semanal/print?grupo_id=${report.value.grupo_id}&fecha_inicio=${props.fechaInicio}`
  window.open(url, '_blank')
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
</style>
