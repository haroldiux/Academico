<template>
  <div class="public-exam-page">
    <div v-if="!accessToken && !finished && !waiting" class="access-panel">
      <div class="brand">
        <q-img src="/unitepc-logo-clean.png" width="54px" height="54px" fit="contain" />
        <div>
          <h1>Examen Virtual</h1>
          <p>Ingresa el codigo entregado por tu docente.</p>
        </div>
      </div>

      <q-form class="q-gutter-md" @submit="ingresar">
        <q-input
          v-model="form.token"
          outlined
          label="Codigo token"
          maxlength="20"
          autocomplete="off"
        />
        <q-input v-model="form.codigo" outlined label="Codigo de estudiante" autocomplete="off" />
        <q-input v-model="form.nombre" outlined label="Nombre completo" autocomplete="name" />
        <q-btn
          unelevated
          color="primary"
          class="full-width"
          type="submit"
          label="Ingresar al examen"
          :loading="loading"
        />
      </q-form>
    </div>

    <div v-else-if="waiting" class="access-panel waiting-panel">
      <q-icon
        :name="waitingInfo.approval_pending ? 'how_to_reg' : 'schedule'"
        size="64px"
        color="primary"
      />
      <h1>{{ waitingInfo.approval_pending ? 'Registro pendiente' : 'Examen en espera' }}</h1>
      <p>{{ waitingInfo.message || 'El examen aun no inicio.' }}</p>

      <div class="time-grid">
        <div>
          <span>Hora actual</span>
          <strong>{{ formatDateTime(waitingInfo.server_time) }}</strong>
        </div>
        <div>
          <span>Inicio del examen</span>
          <strong>{{
            waitingInfo.starts_at_human || formatDateTime(waitingInfo.starts_at)
          }}</strong>
        </div>
      </div>

      <q-banner class="bg-blue-1 text-blue-10 q-mt-md" rounded>
        {{
          waitingInfo.approval_pending
            ? 'Tus datos ya aparecen en el monitoreo del docente. Vuelve a verificar cuando seas aceptado.'
            : 'Tus datos ya fueron registrados. Vuelve a verificar cuando llegue la hora de inicio.'
        }}
      </q-banner>

      <q-btn
        unelevated
        color="primary"
        class="full-width q-mt-md"
        icon="refresh"
        :label="waitingInfo.approval_pending ? 'Verificar aceptacion' : 'Verificar inicio'"
        :loading="loading"
        @click="ingresar"
      />
    </div>

    <div v-else-if="finished" class="access-panel">
      <q-icon name="check_circle" size="70px" color="green" />
      <h1>Examen finalizado</h1>
      <p>Tu patron fue guardado correctamente.</p>
      <q-btn
        v-if="downloadToken"
        unelevated
        color="teal"
        icon="download"
        label="Descargar patron"
        @click="descargarPatron"
      />
    </div>

    <div v-else-if="launchCountdown > 0" class="access-panel waiting-panel">
      <q-icon name="timer" size="70px" color="primary" />
      <h1>El examen inicia en</h1>
      <div class="launch-countdown">{{ launchCountdown }}</div>
      <p>Preparate para comenzar. Seras redirigido automaticamente.</p>
    </div>

    <div v-else class="exam-shell">
      <div class="exam-header">
        <div>
          <div class="text-caption text-grey-7">Variante {{ attempt.variant }}</div>
          <h1>{{ exam.codigo }} - {{ exam.materia }}</h1>
          <p>{{ exam.parcial }} / Grupo {{ exam.grupo }}</p>
        </div>
        <div class="timer" :class="{ danger: remainingSeconds < 300 }">
          {{ remainingLabel }}
        </div>
      </div>

      <q-banner class="bg-blue-1 text-blue-10 q-mb-md" rounded>
        Tus respuestas se guardan automaticamente. Al finalizar, presiona "Terminar examen".
      </q-banner>

      <div class="questions">
        <section v-for="section in questionSections" :key="section.name" class="question-section">
          <div class="section-heading">
            <div>
              <h2>{{ section.name }}</h2>
              <p>{{ sectionInstruction(section.name) }}</p>
            </div>
            <q-chip dense color="blue-1" text-color="primary">
              {{ section.questions.length }} preguntas
            </q-chip>
          </div>

          <div v-if="section.isMatching && section.options.length" class="matching-options-bank">
            <div class="matching-options-title">Lista de opciones</div>
            <div v-for="option in section.options" :key="option.id" class="matching-option">
              <strong>{{ option.id }}.</strong>
              <span v-html="option.text || option.label || ''"></span>
            </div>
          </div>

          <q-card
            v-for="question in section.questions"
            :key="question.number"
            flat
            bordered
            class="question-card"
            :class="{ 'matching-question-card': section.isMatching }"
          >
            <q-card-section>
              <div class="question-title">
                <q-badge color="primary">{{ question.displayNumber }}</q-badge>
                <span v-html="question.enunciado"></span>
              </div>

              <q-option-group
                v-if="question.opciones?.length"
                v-model="answers[question.number]"
                :options="optionItems(question, section)"
                :type="isMultiple(question) ? 'checkbox' : 'radio'"
                color="primary"
                :inline="section.isMatching"
                class="q-mt-md"
                :class="{ 'matching-answer-options': section.isMatching }"
                @update:model-value="guardarRespuesta(question.number)"
              />
              <q-banner v-else class="bg-red-1 text-red-10 q-mt-md" rounded>
                Esta pregunta no tiene opciones configuradas. Reporta este caso al docente.
              </q-banner>
            </q-card-section>
          </q-card>
        </section>
      </div>

      <div class="submit-bar">
        <q-btn
          unelevated
          color="primary"
          icon="send"
          label="Terminar examen"
          :loading="finishing"
          @click="finalizar"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()

const form = reactive({ token: '', codigo: '', nombre: '' })
const loading = ref(false)
const finishing = ref(false)
const accessToken = ref('')
const downloadToken = ref('')
const finished = ref(false)
const waiting = ref(false)
const waitingInfo = ref({})
const attempt = ref({})
const exam = ref({})
const answers = reactive({})
const remainingSeconds = ref(0)
let timerId = null
let saveTimer = null
let waitingPollId = null
let launchTimerId = null
const launchCountdown = ref(0)
const pendingExamPayload = ref(null)

const remainingLabel = computed(() => {
  const totalSeconds = Math.floor(Number(remainingSeconds.value) || 0)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const questionSections = computed(() => {
  const sections = new Map()

  ;(exam.value.questions || []).forEach((question) => {
    const name = question.seccion || 'PREGUNTAS'
    const current = sections.get(name) || {
      name,
      order: Number(question.seccion_orden || 99),
      questions: [],
      isMatching: name === 'EMPAREJAMIENTO AMPLIADO',
      options: [],
    }

    current.questions.push(question)
    if (current.isMatching && !current.options.length && question.opciones?.length) {
      current.options = uniqueOptions(question.opciones)
    }
    sections.set(name, current)
  })

  let displayNumber = 1

  return [...sections.values()]
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      ...section,
      questions: section.questions.map((question) => ({
        ...question,
        displayNumber: displayNumber++,
      })),
    }))
})

async function ingresar() {
  loading.value = true
  try {
    const { data } = await api.post('/examen-virtual/access', form)
    if (data.waiting) {
      waiting.value = true
      waitingInfo.value = data
      accessToken.value = ''
      finished.value = false
      startWaitingPoll()
      return
    }

    const shouldCountdown = waiting.value && !waitingInfo.value?.approval_pending
    stopWaitingPoll()
    if (shouldCountdown) {
      startLaunchCountdown(data)
      return
    }

    startExam(data)
  } catch (error) {
    if (error.response?.status === 409) {
      stopWaitingPoll()
      finished.value = true
      downloadToken.value = error.response.data?.download_token || ''
      return
    }
    $q.notify({
      type: 'negative',
      message: 'No se pudo ingresar al examen.',
      caption: error.response?.data?.message || error.message,
    })
  } finally {
    loading.value = false
  }
}

function startExam(data) {
  waiting.value = false
  waitingInfo.value = {}
  launchCountdown.value = 0
  pendingExamPayload.value = null
  accessToken.value = data.access_token
  attempt.value = data.attempt
  exam.value = data.exam
  remainingSeconds.value = Math.floor(Number(data.attempt.remaining_seconds || 0))
  startTimer()
}

function startWaitingPoll() {
  if (waitingPollId) return

  waitingPollId = setInterval(() => {
    if (!waiting.value || loading.value || finished.value) return
    ingresar()
  }, 5000)
}

function stopWaitingPoll() {
  if (waitingPollId) {
    clearInterval(waitingPollId)
    waitingPollId = null
  }
}

function startLaunchCountdown(data) {
  pendingExamPayload.value = data
  waiting.value = false
  waitingInfo.value = {}
  launchCountdown.value = 15

  if (launchTimerId) clearInterval(launchTimerId)
  launchTimerId = setInterval(() => {
    launchCountdown.value = Math.max(launchCountdown.value - 1, 0)
    if (launchCountdown.value <= 0) {
      clearInterval(launchTimerId)
      launchTimerId = null
      startExam(pendingExamPayload.value)
    }
  }, 1000)
}

function startTimer() {
  if (timerId) clearInterval(timerId)
  timerId = setInterval(() => {
    remainingSeconds.value = Math.max(Math.floor(Number(remainingSeconds.value) || 0) - 1, 0)
    if (remainingSeconds.value <= 0) {
      clearInterval(timerId)
      finalizar({ skipSave: true })
    }
  }, 1000)
}

function optionItems(question, section = null) {
  if (section?.isMatching) {
    const options = section.options.length ? section.options : question.opciones || []

    return options.map((option) => ({
      label: String(option.id || ''),
      value: option.id,
    }))
  }

  return (question.opciones || []).map((option) => ({
    label: `${option.id}. ${option.text || option.label || ''}`,
    value: option.id,
  }))
}

function uniqueOptions(options = []) {
  const seen = new Set()

  return options.filter((option) => {
    const key = option.id || option.text || option.label
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function isMultiple(question) {
  return String(question.tipo || '')
    .toUpperCase()
    .includes('MULTIPLE')
}

function sectionInstruction(sectionName) {
  const instructions = {
    'VERDADERO O FALSO SIMPLE': 'Marca la opcion correcta para cada enunciado.',
    'PREGUNTA CON CLAVE': 'Selecciona la combinacion correcta segun las premisas.',
    'RESPUESTA A/B/AMBAS/NINGUNA':
      'Selecciona si la primera, segunda, ambas o ninguna premisa es verdadera.',
    'SELECCION DE LA MEJOR RESPUESTA': 'Selecciona una sola respuesta correcta.',
    'CASOS O PROBLEMAS': 'Responde cada subpregunta segun el caso presentado.',
    'EMPAREJAMIENTO AMPLIADO': 'Relaciona cada enunciado con la opcion correcta.',
  }

  return instructions[sectionName] || 'Selecciona la respuesta correcta.'
}

function guardarRespuesta(number) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    await api.post('/examen-virtual/answers', {
      access_token: accessToken.value,
      respuestas: [{ numero: number, respuesta: answers[number] }],
    })
  }, 350)
}

async function finalizar(options = {}) {
  if (!accessToken.value || finished.value) return
  finishing.value = true
  try {
    const respuestas = Object.keys(answers).map((number) => ({
      numero: Number(number),
      respuesta: answers[number],
    }))
    if (respuestas.length && !options.skipSave) {
      try {
        await api.post('/examen-virtual/answers', { access_token: accessToken.value, respuestas })
      } catch (error) {
        if (remainingSeconds.value > 0) throw error
      }
    }
    const { data } = await api.post('/examen-virtual/finish', { access_token: accessToken.value })
    downloadToken.value = data.download_token
    finished.value = true
    accessToken.value = ''
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo finalizar.',
      caption: error.response?.data?.message || error.message,
    })
  } finally {
    finishing.value = false
  }
}

function descargarPatron() {
  window.open(`${api.defaults.baseURL}/examen-virtual/patron/${downloadToken.value}`, '_blank')
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId)
  if (saveTimer) clearTimeout(saveTimer)
  stopWaitingPoll()
  if (launchTimerId) clearInterval(launchTimerId)
})
</script>

<style scoped>
.public-exam-page {
  min-height: 100vh;
  background: #eef4fb;
  color: #0f172a;
}

.access-panel {
  width: min(460px, calc(100vw - 28px));
  margin: 8vh auto;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: white;
  padding: 26px;
  box-shadow: 0 16px 42px rgba(15, 23, 42, 0.12);
}

.waiting-panel {
  text-align: center;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.time-grid div {
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #f8fafc;
  padding: 12px;
  text-align: left;
}

.time-grid span {
  display: block;
  color: #64748b;
  font-size: 12px;
}

.time-grid strong {
  display: block;
  margin-top: 4px;
  color: #0f172a;
}

.launch-countdown {
  margin: 18px auto 8px;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #ede9fe;
  color: #5b21b6;
  font-size: 48px;
  font-weight: 800;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
}

.brand h1,
.access-panel h1,
.exam-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
}

.brand p,
.access-panel p,
.exam-header p {
  margin: 4px 0 0;
  color: #64748b;
}

.exam-shell {
  width: min(1080px, calc(100vw - 24px));
  margin: 0 auto;
  padding: 18px 0 90px;
}

.exam-header {
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #dbe3ef;
  background: #eef4fb;
  padding: 14px 0;
}

.timer {
  border-radius: 8px;
  background: #0f766e;
  color: white;
  padding: 10px 16px;
  font-size: 26px;
  font-weight: 850;
}

.timer.danger {
  background: #dc2626;
}

.question-section {
  margin-bottom: 22px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  border-top: 4px solid #1f2937;
  margin: 22px 0 12px;
  padding-top: 10px;
}

.section-heading h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 850;
}

.section-heading p {
  margin: 4px 0 0;
  color: #64748b;
}

.question-card {
  margin-bottom: 12px;
  border-radius: 8px;
}

.matching-options-bank {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  padding: 14px 16px;
  margin-bottom: 12px;
}

.matching-options-title {
  margin-bottom: 8px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
}

.matching-option {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 8px;
  padding: 5px 0;
  border-top: 1px solid #eef2f7;
  font-size: 14px;
}

.matching-option:first-of-type {
  border-top: 0;
}

.matching-question-card {
  margin-bottom: 8px;
}

.matching-answer-options :deep(.q-radio__label) {
  min-width: 18px;
  font-weight: 800;
}

.question-title {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 15px;
  font-weight: 650;
}

.submit-bar {
  position: fixed;
  right: 24px;
  bottom: 18px;
}
</style>
