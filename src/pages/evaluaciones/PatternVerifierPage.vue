<template>
  <q-page class="pattern-verifier-page q-pa-md">
    <div class="page-shell">
      <section class="page-hero">
        <div>
          <div class="hero-eyebrow">Módulo de apoyo para revisión</div>
          <h1 class="hero-title">
            <q-icon name="fact_check" color="deep-purple" size="30px" class="q-mr-sm" />
            Verificador de Patrones
          </h1>
          <p class="hero-copy">
            Selecciona el contexto del examen, carga el PDF consolidado generado y revisa el patrón
            completo de todas las variantes registradas.
          </p>
        </div>
        <div class="hero-status">
          <div class="status-pill">
            <q-icon name="verified" size="18px" />
            Revisión asistida
          </div>
        </div>
      </section>

      <section class="filters-band">
        <div class="band-title">Contexto del examen</div>
        <div class="filters-grid">
          <q-select
            v-model="filtros.sede"
            :options="sedeOptions"
            label="Sede"
            outlined
            dense
            emit-value
            map-options
            :disable="sedeOptions.length <= 1"
          />
          <q-select
            v-model="filtros.carrera"
            :options="carreraOptions"
            label="Carrera"
            outlined
            dense
            emit-value
            map-options
            :disable="!filtros.sede || loadingCatalogs"
          />
          <q-select
            v-model="filtros.asignatura"
            :options="asignaturaOptions"
            label="Asignatura"
            outlined
            dense
            emit-value
            map-options
            :disable="!filtros.carrera || loadingCatalogs"
            use-input
            input-debounce="0"
          />
          <q-select
            v-model="filtros.grupo"
            :options="grupoOptions"
            label="Grupo"
            outlined
            dense
            emit-value
            map-options
            :disable="!contextExams.length || loadingGeneratedExams"
          />
        </div>

        <div class="selectors-row">
          <q-select
            v-model="filtros.rolExamenId"
            :options="examOptions"
            label="Examen generado"
            outlined
            dense
            emit-value
            map-options
            class="exam-select"
            :loading="loadingGeneratedExams"
            :disable="!filteredGeneratedExams.length"
          />
          <q-file
            v-model="uploadedPdf"
            outlined
            dense
            use-chips
            clearable
            accept=".pdf,application/pdf"
            label="PDF del examen consolidado"
            class="upload-input"
          >
            <template #prepend>
              <q-icon name="picture_as_pdf" color="red-6" />
            </template>
          </q-file>
          <q-btn
            color="deep-purple"
            icon="fact_check"
            label="Verificar patrones"
            no-caps
            unelevated
            :loading="verifying"
            :disable="!canVerify"
            @click="runVerification"
          />
        </div>

        <q-banner v-if="selectedExam" class="bg-blue-1 text-blue-9 q-mt-md" rounded dense>
          <q-icon name="info" class="q-mr-sm" />
          {{ selectedExam.materia }} · {{ selectedExam.tipo_examen }} · {{ selectedExam.grupo }} ·
          {{ selectedExam.fecha || 'Sin fecha' }}
        </q-banner>
      </section>

      <section class="results-band" v-if="verificationResult">
        <div class="results-header">
          <div>
            <div class="band-title">Patrones detectados</div>
            <div class="result-subtitle">
              {{ verificationResult.exam.codigo }} · {{ verificationResult.exam.materia }}
            </div>
          </div>
          <div class="results-actions">
            <q-btn
              v-if="verificationResult.downloads?.exam"
              outline
              color="deep-purple"
              icon="download"
              label="Examen PDF"
              no-caps
              @click="downloadRegisteredFile('exam')"
            />
            <q-btn
              v-if="verificationResult.downloads?.patron_pdf"
              outline
              color="green"
              icon="download"
              label="Patrón PDF"
              no-caps
              @click="downloadRegisteredFile('patron_pdf')"
            />
            <q-btn
              v-if="verificationResult.downloads?.patron_xlsx"
              outline
              color="blue"
              icon="download"
              label="Patrón XLSX"
              no-caps
              @click="downloadRegisteredFile('patron_xlsx')"
            />
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-panel summary-panel-primary">
            <div class="summary-label">Archivo cargado</div>
            <div class="summary-value">{{ verificationResult.uploaded_file.name }}</div>
            <div class="summary-note">
              {{ formatFileSize(verificationResult.uploaded_file.size) }}
            </div>
          </div>
          <div class="summary-panel">
            <div class="summary-label">Coincidencias PDF/DB</div>
            <div class="summary-value">{{ verificationResult.variants.length }}</div>
            <div class="summary-note">
              {{ verificationSummaryLabel }}
            </div>
          </div>
          <div class="summary-panel">
            <div class="summary-label">Diferencias detectadas</div>
            <div class="summary-value">
              {{ verificationResult.verification?.mismatched || 0 }}
            </div>
            <div class="summary-note">
              {{ verificationResult.verification?.unmatched || 0 }} sin coincidencia exacta
            </div>
          </div>
        </div>

        <q-banner
          v-if="!verificationResult.uploaded_file.matches_registered_name"
          class="bg-orange-1 text-orange-10 q-mt-md"
          rounded
          dense
        >
          <q-icon name="warning" class="q-mr-sm" />
          El nombre del PDF cargado no coincide con el archivo registrado en el sistema. Se mostrará
          el patrón asociado al examen seleccionado de todos modos.
        </q-banner>

        <q-tabs
          v-model="activeVariant"
          dense
          align="left"
          active-color="deep-purple"
          indicator-color="deep-purple"
          class="q-mt-lg"
        >
          <q-tab
            v-for="variant in verificationResult.variants"
            :key="variant.letra"
            :name="variant.letra"
            :label="`Variante ${variant.letra}`"
          />
        </q-tabs>

        <q-tab-panels v-model="activeVariant" animated class="variant-panels">
          <q-tab-panel
            v-for="variant in verificationResult.variants"
            :key="variant.letra"
            :name="variant.letra"
            class="variant-panel"
          >
            <div class="variant-header">
              <div>
                <div class="variant-title">Variante {{ variant.letra }}</div>
                <div class="variant-copy">
                  {{ variant.answered_count }} respuestas verificadas ·
                  {{ variant.verification?.correct || 0 }} correctas ·
                  {{ variant.verification?.mismatched || 0 }} observadas
                </div>
              </div>
              <q-chip color="deep-purple-1" text-color="deep-purple-9" size="sm">
                {{ variant.answered_count }}/100
              </q-chip>
            </div>

            <div class="answer-columns">
              <div
                v-for="(column, columnIndex) in buildAnswerColumns(
                  variant.answers,
                  variant.questions,
                )"
                :key="`${variant.letra}-${columnIndex}`"
                class="answer-column"
              >
                <div
                  v-for="entry in column"
                  :key="`${variant.letra}-${entry.number}`"
                  class="answer-row"
                >
                  <span class="answer-number">P{{ entry.number }}</span>
                  <div class="answer-actions">
                    <span class="answer-value" :class="answerStatusClass(entry)">
                      {{ entry.answer || '—' }}
                    </span>
                    <q-btn
                      v-if="entry.question"
                      flat
                      round
                      dense
                      size="sm"
                      icon="visibility"
                      color="deep-purple"
                      @click="openQuestionPreview(variant, entry)"
                    >
                      <q-tooltip>Ver pregunta</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </section>

      <section v-else class="empty-band">
        <q-icon name="rule_folder" size="38px" color="grey-5" />
        <div class="empty-title">Aún no hay verificación cargada</div>
        <div class="empty-copy">
          Selecciona una asignatura con examen generado, elige el grupo, carga el PDF y ejecuta la
          revisión.
        </div>
      </section>
    </div>

    <q-dialog v-model="questionPreviewDialog">
      <q-card class="question-preview-card">
        <q-card-section class="question-preview-header">
          <div>
            <div class="question-preview-eyebrow">
              Variante {{ selectedQuestionPreview?.variant }} · Pregunta
              {{ selectedQuestionPreview?.question?.number }}
              <template v-if="selectedQuestionPreview?.question?.id">
                · banco_preguntas #{{ selectedQuestionPreview.question.id }}
              </template>
            </div>
            <div class="question-preview-title">Detalle de la pregunta</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section v-if="selectedQuestionPreview?.question" class="question-preview-body">
          <div class="question-meta-row">
            <q-chip
              v-if="selectedQuestionPreview.question.id"
              size="sm"
              color="grey-2"
              text-color="grey-9"
              icon="tag"
            >
              ID {{ selectedQuestionPreview.question.id }}
            </q-chip>
            <q-chip size="sm" color="deep-purple-1" text-color="deep-purple-9">
              {{ selectedQuestionPreview.question.tipo || 'Sin tipo' }}
            </q-chip>
            <q-chip
              v-if="selectedQuestionPreview.question.dificultad"
              size="sm"
              color="orange-1"
              text-color="orange-9"
            >
              {{ selectedQuestionPreview.question.dificultad }}
            </q-chip>
            <q-chip
              v-if="selectedQuestionPreview.question.grupo"
              size="sm"
              color="blue-1"
              text-color="blue-9"
            >
              {{ selectedQuestionPreview.question.grupo }}
            </q-chip>
          </div>

          <div class="question-block">
            <div class="question-block-label">Enunciado</div>
            <div class="question-block-content">
              {{ selectedQuestionPreview.question.enunciado || 'Sin enunciado registrado.' }}
            </div>
          </div>

          <div v-if="selectedQuestionPreview.question.imagen_url" class="question-image-wrap">
            <img
              :src="selectedQuestionPreview.question.imagen_url"
              alt="Imagen de la pregunta"
              class="question-image"
            />
          </div>

          <div v-if="selectedQuestionPreview.question.opciones?.length" class="question-block">
            <div class="question-block-label">Opciones registradas</div>
            <div class="question-options">
              <div
                v-for="(option, optionIndex) in selectedQuestionPreview.question.opciones"
                :key="`${selectedQuestionPreview.question.id || 'opt'}-${optionIndex}`"
                class="question-option"
              >
                <span class="question-option-key">{{ optionKey(optionIndex) }}</span>
                <span class="question-option-text">{{ formatQuestionOption(option) }}</span>
              </div>
            </div>
          </div>

          <div class="question-block">
            <div class="question-block-label">Respuesta registrada</div>
            <div class="question-block-content answer-registered">
              {{ formatCorrectAnswer(selectedQuestionPreview.question.respuesta_correcta) }}
            </div>
          </div>

          <div class="question-block">
            <div class="question-block-label">Validación contra patrón</div>
            <div class="question-validation-grid">
              <div>
                <span>Patrón</span>
                <strong>{{ selectedQuestionPreview.question.pattern_answer || '—' }}</strong>
              </div>
              <div>
                <span>Esperada desde PDF</span>
                <strong>{{ selectedQuestionPreview.question.expected_answer || '—' }}</strong>
              </div>
            </div>
          </div>

          <div v-if="selectedQuestionPreview.question.pdf_text" class="question-block">
            <div class="question-block-label">Texto leído del PDF</div>
            <div class="question-block-content pdf-text">
              {{ selectedQuestionPreview.question.pdf_text }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { usePermisos } from 'src/composables/usePermisos'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'
import { useAsignaturasStore } from 'src/stores/asignaturas'

const $q = useQuasar()
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()
const asignaturasStore = useAsignaturasStore()
const { sedesFiltradas, carrerasFiltradas, sedeId, carreraId } = usePermisos()

const loadingCatalogs = ref(false)
const loadingGeneratedExams = ref(false)
const verifying = ref(false)
const uploadedPdf = ref(null)
const contextExams = ref([])
const generatedExams = ref([])
const verificationResult = ref(null)
const activeVariant = ref(null)
const questionPreviewDialog = ref(false)
const selectedQuestionPreview = ref(null)

const filtros = ref({
  sede: null,
  carrera: null,
  asignatura: null,
  grupo: null,
  rolExamenId: null,
})

const selectedAsignatura = computed(() =>
  asignaturasStore.asignaturas.find((item) => Number(item.id) === Number(filtros.value.asignatura)),
)

const selectedExam = computed(() =>
  filteredGeneratedExams.value.find(
    (item) => Number(item.id) === Number(filtros.value.rolExamenId),
  ),
)

const sedeOptions = computed(() =>
  sedesFiltradas.value.map((item) => ({
    label: item.nombre,
    value: item.id,
  })),
)

const carreraOptions = computed(() => {
  const source = filtros.value.sede
    ? carrerasStore.getCarrerasBySede(filtros.value.sede)
    : carrerasFiltradas.value

  return source.map((item) => ({
    label: item.nombre,
    value: item.id,
  }))
})

const asignaturaOptions = computed(() =>
  asignaturasStore.asignaturas.map((item) => ({
    label: `${item.codigo} · ${item.nombre}`,
    value: item.id,
  })),
)

const grupoOptions = computed(() => {
  const uniqueGroups = [...new Set(contextExams.value.map((item) => item.grupo).filter(Boolean))]
  return uniqueGroups.map((grupo) => ({ label: grupo, value: grupo }))
})

const filteredGeneratedExams = computed(() => {
  if (!filtros.value.grupo) return generatedExams.value
  return generatedExams.value.filter((item) => item.grupo === filtros.value.grupo)
})

const examOptions = computed(() =>
  filteredGeneratedExams.value.map((item) => ({
    label: `${item.tipo_examen} · ${item.grupo} · ${item.fecha || 'Sin fecha'}`,
    value: item.id,
  })),
)

const canVerify = computed(() => Boolean(filtros.value.rolExamenId && uploadedPdf.value))

const verificationSummaryLabel = computed(() => {
  const summary = verificationResult.value?.verification || {}
  return `${summary.correct || 0} correctas · ${summary.matched || 0} emparejadas`
})

const allowedVerifierStatuses = new Set([
  'generado',
  'generados',
  'impreso',
  'impresos',
  'entregado',
  'entregados',
  'devuelto',
  'devueltos',
  'revisado',
  'revisados',
  'subido',
  'subidos',
])

watch(
  () => filtros.value.sede,
  async (newValue, oldValue) => {
    if (newValue === oldValue) return
    filtros.value.carrera = null
    filtros.value.asignatura = null
    filtros.value.grupo = null
    filtros.value.rolExamenId = null
    contextExams.value = []
    generatedExams.value = []
    verificationResult.value = null
    activeVariant.value = null
    if (!newValue) {
      asignaturasStore.asignaturas = []
    }
  },
)

watch(
  () => filtros.value.carrera,
  async (newValue, oldValue) => {
    if (newValue === oldValue) return
    filtros.value.asignatura = null
    filtros.value.grupo = null
    filtros.value.rolExamenId = null
    contextExams.value = []
    generatedExams.value = []
    verificationResult.value = null
    activeVariant.value = null

    if (filtros.value.sede && newValue) {
      await fetchAsignaturas()
    }
  },
)

watch(
  () => filtros.value.asignatura,
  async (newValue, oldValue) => {
    if (newValue === oldValue) return
    filtros.value.grupo = null
    filtros.value.rolExamenId = null
    verificationResult.value = null
    activeVariant.value = null

    if (filtros.value.sede && filtros.value.carrera && newValue) {
      await fetchGeneratedExams()
    } else {
      contextExams.value = []
      generatedExams.value = []
    }
  },
)

watch(
  () => filtros.value.grupo,
  (newValue, oldValue) => {
    if (newValue === oldValue) return
    filtros.value.rolExamenId = null
    verificationResult.value = null
    activeVariant.value = null

    if (filteredGeneratedExams.value.length === 1) {
      filtros.value.rolExamenId = filteredGeneratedExams.value[0].id
    }
  },
)

async function bootstrapCatalogs() {
  loadingCatalogs.value = true
  try {
    if (!sedesStore.sedes.length) {
      await sedesStore.fetchSedes()
    }

    if (!carrerasStore.carreras.length) {
      await carrerasStore.fetchCarreras()
    }

    if (sedeOptions.value.length === 1) {
      filtros.value.sede = sedeOptions.value[0].value
    } else if (sedeId.value) {
      filtros.value.sede = sedeId.value
    }

    if (carreraId.value) {
      filtros.value.carrera = carreraId.value
      await fetchAsignaturas()
    }
  } finally {
    loadingCatalogs.value = false
  }
}

async function fetchAsignaturas() {
  if (!filtros.value.sede || !filtros.value.carrera) return
  await asignaturasStore.fetchAsignaturas(filtros.value.sede, filtros.value.carrera)
}

async function fetchGeneratedExams() {
  if (!selectedAsignatura.value) return

  loadingGeneratedExams.value = true
  contextExams.value = []
  generatedExams.value = []
  verificationResult.value = null
  activeVariant.value = null

  try {
    const response = await api.get('/rol-examenes', {
      params: {
        sede_id: filtros.value.sede,
        carrera_id: filtros.value.carrera,
        materia_codigo: selectedAsignatura.value.codigo,
      },
    })

    const rows = response.data?.data || response.data || []
    contextExams.value = rows.sort((a, b) =>
      `${a.grupo || ''}-${a.tipo_examen || ''}`.localeCompare(
        `${b.grupo || ''}-${b.tipo_examen || ''}`,
      ),
    )

    generatedExams.value = contextExams.value
      .filter((item) =>
        allowedVerifierStatuses.has(
          String(item.estado || '')
            .toLowerCase()
            .trim(),
        ),
      )
      .sort((a, b) => `${a.tipo_examen}-${a.grupo}`.localeCompare(`${b.tipo_examen}-${b.grupo}`))

    if (grupoOptions.value.length === 1) {
      filtros.value.grupo = grupoOptions.value[0].value
    }

    if (generatedExams.value.length === 1) {
      filtros.value.rolExamenId = generatedExams.value[0].id
    }
  } catch (error) {
    console.error('Error al cargar exámenes generados:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'No se pudieron cargar los exámenes generados.',
    })
  } finally {
    loadingGeneratedExams.value = false
  }
}

async function runVerification() {
  if (!filtros.value.rolExamenId || !uploadedPdf.value) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona el examen y carga el PDF antes de verificar.',
    })
    return
  }

  verifying.value = true
  verificationResult.value = null

  try {
    const formData = new FormData()
    formData.append('archivo', uploadedPdf.value)

    const response = await api.post(
      `/rol-examenes/${filtros.value.rolExamenId}/pattern-verifier`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )

    verificationResult.value = response.data
    activeVariant.value = response.data?.variants?.[0]?.letra || null

    $q.notify({
      type: 'positive',
      message: 'Patrones cargados correctamente.',
    })
  } catch (error) {
    console.error('Error al verificar patrones:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'No se pudo completar la verificación.',
    })
  } finally {
    verifying.value = false
  }
}

function buildAnswerColumns(answers = [], questions = []) {
  const normalized = Array.from({ length: 100 }, (_, index) => ({
    number: index + 1,
    answer: String(questions[index]?.answer ?? answers[index] ?? '').trim(),
    status: questions[index]?.status || '',
    expected_answer: questions[index]?.expected_answer || '',
    match_score: questions[index]?.match_score || null,
    question: questions[index]?.question
      ? {
          ...questions[index].question,
          number: index + 1,
          status: questions[index].status,
          pattern_answer: questions[index].answer,
          expected_answer: questions[index].expected_answer,
          match_score: questions[index].match_score,
        }
      : null,
  }))

  return [0, 25, 50, 75].map((start) => normalized.slice(start, start + 25))
}

function answerStatusClass(entry) {
  return {
    'answer-ok': entry.status === 'correct',
    'answer-warning': ['unmatched', 'not_found_in_pdf'].includes(entry.status),
    'answer-error': entry.status === 'mismatch',
  }
}

function openQuestionPreview(variant, entry) {
  if (!entry?.question) return

  selectedQuestionPreview.value = {
    variant: variant.letra,
    question: entry.question,
  }
  questionPreviewDialog.value = true
}

function formatQuestionOption(option) {
  if (option == null) return ''
  if (typeof option === 'string') return option
  if (typeof option === 'object') {
    return option.texto || option.text || option.valor || option.label || JSON.stringify(option)
  }
  return String(option)
}

function formatCorrectAnswer(answer) {
  if (Array.isArray(answer)) {
    return answer.length ? answer.join(', ') : 'Sin respuesta registrada'
  }

  if (answer == null || String(answer).trim() === '') {
    return 'Sin respuesta registrada'
  }

  return String(answer)
}

function optionKey(index) {
  return String.fromCharCode(65 + index)
}

async function downloadRegisteredFile(kind) {
  if (!verificationResult.value?.exam?.id) return

  const examId = verificationResult.value.exam.id
  let endpoint = ''
  let filename = ''
  let responseType = 'blob'

  if (kind === 'exam') {
    filename = verificationResult.value.downloads?.exam
    endpoint = `/rol-examenes/${examId}/download-examen?file=${encodeURIComponent(filename)}`
  } else if (kind === 'patron_pdf') {
    filename = verificationResult.value.downloads?.patron_pdf
    endpoint = `/rol-examenes/${examId}/download-patron?tipo=pdf&file=${encodeURIComponent(filename)}`
  } else if (kind === 'patron_xlsx') {
    filename = verificationResult.value.downloads?.patron_xlsx
    endpoint = `/rol-examenes/${examId}/download-patron?tipo=xlsx&file=${encodeURIComponent(filename)}`
  }

  if (!endpoint || !filename) return

  try {
    const response = await api.get(endpoint, { responseType })
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
    const anchor = document.createElement('a')
    anchor.href = blobUrl
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('Error al descargar archivo verificado:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo descargar el archivo solicitado.',
    })
  }
}

function formatFileSize(size = 0) {
  if (!size) return '0 KB'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(2)} MB`
}

onMounted(async () => {
  await bootstrapCatalogs()
})
</script>

<style scoped>
.pattern-verifier-page {
  background: #f4f7fb;
}

.page-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-hero,
.filters-band,
.results-band,
.empty-band {
  background: white;
  border: 1px solid #dde4f0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.page-hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px;
  align-items: flex-start;
}

.hero-eyebrow {
  color: #6b7280;
  font-size: 0.85rem;
  margin-bottom: 6px;
}

.hero-title {
  display: flex;
  align-items: center;
  margin: 0;
  color: #1f2937;
  font-size: 1.9rem;
  line-height: 1.1;
}

.hero-copy {
  margin: 10px 0 0;
  max-width: 760px;
  color: #64748b;
  font-size: 0.98rem;
}

.hero-status {
  display: flex;
  align-items: center;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #ede9fe;
  color: #6d28d9;
  border-radius: 999px;
  font-weight: 600;
  white-space: nowrap;
}

.filters-band,
.results-band {
  padding: 18px 20px;
}

.band-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 14px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.selectors-row {
  display: grid;
  grid-template-columns: minmax(280px, 1.2fr) minmax(260px, 1fr) auto;
  gap: 12px;
  margin-top: 12px;
  align-items: start;
}

.exam-select,
.upload-input {
  min-width: 0;
}

.results-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.result-subtitle {
  color: #64748b;
  font-size: 0.92rem;
  margin-top: 4px;
}

.results-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.summary-panel {
  border: 1px solid #dbe4f3;
  border-radius: 8px;
  padding: 14px 16px;
  background: #f8fbff;
}

.summary-panel-primary {
  background: #f5f3ff;
  border-color: #ddd6fe;
}

.summary-label {
  color: #64748b;
  font-size: 0.84rem;
  margin-bottom: 8px;
}

.summary-value {
  color: #1f2937;
  font-weight: 700;
  font-size: 1.02rem;
  word-break: break-word;
}

.summary-note {
  color: #64748b;
  font-size: 0.85rem;
  margin-top: 6px;
}

.variant-panels {
  margin-top: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.variant-panel {
  padding: 18px 10px 10px;
}

.variant-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
  padding: 0 8px;
}

.variant-title {
  color: #1f2937;
  font-size: 1rem;
  font-weight: 700;
}

.variant-copy {
  color: #64748b;
  font-size: 0.88rem;
  margin-top: 4px;
}

.answer-columns {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.answer-column {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #fcfdff;
}

.answer-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #eef2f7;
}

.answer-row:last-child {
  border-bottom: 0;
}

.answer-number {
  color: #64748b;
  font-size: 0.88rem;
}

.answer-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.answer-value {
  min-width: 36px;
  text-align: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: #ede9fe;
  color: #5b21b6;
  font-weight: 700;
  font-size: 0.88rem;
}

.answer-ok {
  background: #dcfce7;
  color: #166534;
}

.answer-warning {
  background: #fef3c7;
  color: #92400e;
}

.answer-error {
  background: #fee2e2;
  color: #b91c1c;
}

.question-preview-card {
  width: min(820px, 92vw);
  max-width: 92vw;
}

.question-preview-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.question-preview-eyebrow {
  color: #64748b;
  font-size: 0.82rem;
}

.question-preview-title {
  color: #1f2937;
  font-size: 1.08rem;
  font-weight: 700;
  margin-top: 4px;
}

.question-preview-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.question-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.question-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-block-label {
  color: #475569;
  font-size: 0.84rem;
  font-weight: 700;
}

.question-block-content {
  color: #1f2937;
  line-height: 1.55;
  white-space: pre-wrap;
}

.answer-registered {
  font-weight: 700;
  color: #6d28d9;
}

.question-validation-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.question-validation-grid > div {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  background: #f8fafc;
}

.question-validation-grid span {
  display: block;
  color: #64748b;
  font-size: 0.78rem;
  margin-bottom: 4px;
}

.question-validation-grid strong {
  color: #1f2937;
  font-size: 0.95rem;
}

.pdf-text {
  max-height: 180px;
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  background: #f8fafc;
  font-size: 0.88rem;
}

.question-image-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
  padding: 12px;
}

.question-image {
  display: block;
  max-width: 100%;
  max-height: 360px;
  margin: 0 auto;
  object-fit: contain;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-option {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafbff;
}

.question-option-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #ede9fe;
  color: #5b21b6;
  font-weight: 700;
  font-size: 0.82rem;
}

.question-option-text {
  color: #1f2937;
  line-height: 1.45;
  white-space: pre-wrap;
}

.empty-band {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 20px;
}

.empty-title {
  margin-top: 12px;
  color: #334155;
  font-weight: 700;
  font-size: 1rem;
}

.empty-copy {
  margin-top: 8px;
  max-width: 620px;
  color: #64748b;
  font-size: 0.92rem;
}

@media (max-width: 1280px) {
  .filters-grid,
  .summary-grid,
  .answer-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .selectors-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-hero,
  .results-header,
  .variant-header {
    flex-direction: column;
  }

  .filters-grid,
  .summary-grid,
  .answer-columns {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 1.5rem;
  }
}
</style>
