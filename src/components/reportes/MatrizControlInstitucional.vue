<template>
  <div class="matriz-control">
    <!-- Header con controles -->
    <div class="row items-center justify-between q-mb-sm q-gutter-sm">
      <div class="text-h6 col-auto">Matriz de Control Institucional</div>
      <div class="row q-gutter-sm items-center">
        <!-- Botón Reincidentes Rojos -->
        <q-btn
          :color="soloReincidentes ? 'red-8' : 'grey-6'"
          :icon="soloReincidentes ? 'filter_alt' : 'filter_alt_off'"
          :label="soloReincidentes ? 'Mostrando Rojos 2 sem.' : 'Solo Rojos 2 Semanas'"
          size="sm"
          no-caps
          @click="toggleReincidentes"
          :loading="loadingReincidentes"
        >
          <q-tooltip>Mostrar solo docentes con informe ROJO 2 semanas consecutivas</q-tooltip>
        </q-btn>

        <q-btn color="primary" icon="refresh" label="Actualizar" @click="loadMatriz" flat />
      </div>
    </div>

    <!-- Chip informativo de semana -->
    <div class="row q-mb-md q-gutter-sm" v-if="semanaInfo">
      <q-chip color="blue-1" text-color="blue-9" icon="info">
        {{ semanaInfo.label }}
      </q-chip>
      <q-chip color="teal-1" text-color="teal-9" icon="analytics">
        A. Planeado: <strong class="q-ml-xs">{{ semanaInfo.avancePlaneado }}%</strong>
      </q-chip>
    </div>

    <q-table
      :rows="filteredMatrizData"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
      class="bg-white q-mt-md"
      :pagination="{ rowsPerPage: 15 }"
    >
      <template v-slot:top-right>
        <div class="row q-gutter-sm items-center">
          <q-select
            v-model="filtroEstado"
            :options="opcionesEstado"
            dense
            outlined
            options-dense
            emit-value
            map-options
            label="Filtrar por Estado"
            style="min-width: 150px"
          >
            <template v-slot:prepend>
              <q-icon name="filter_list" />
            </template>
          </q-select>
          <q-input
            borderless
            dense
            debounce="300"
            v-model="filter"
            placeholder="Buscar asignatura o docente..."
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </template>

      <template v-slot:body-cell-avancePlaneado="props">
        <q-td :props="props" class="text-center">
          <q-chip
            :color="getAvanceColor(parseFloat(props.value))"
            text-color="white"
            size="sm"
            dense
          >
            {{ props.value }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-avanceReal="props">
        <q-td :props="props" class="text-center">
          <q-chip
            :color="getAvanceColor(parseFloat(props.value))"
            text-color="white"
            size="sm"
            dense
          >
            {{ props.value }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-diferencia="props">
        <q-td :props="props" class="text-center">
          <span class="text-weight-bold" :class="getDiferenciaClass(props.value)">{{
            props.value
          }}</span>
        </q-td>
      </template>

      <template v-slot:body-cell-semaforo="props">
        <q-td :props="props" class="text-center">
          <q-chip :color="props.row.semaforo" text-color="white" size="sm" class="text-weight-bold">
            {{ props.row.alertaLabel }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-alertas="props">
        <q-td :props="props">
          <div class="text-negative text-caption" v-if="props.row.alertas !== 'Ninguna'">
            <q-icon name="warning" class="q-mr-xs" /> {{ props.row.alertas }}
          </div>
          <div v-else class="text-grey-6 text-caption">Ninguna</div>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn
            size="sm"
            color="indigo"
            label="Auditar"
            icon="checklist"
            @click="openAuditForm(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Audit Form Dialog -->
    <q-dialog v-model="showAuditForm" persistent>
      <AcademicAuditForm
        :asignatura-id="selectedRow?.id"
        :asignatura-nombre="selectedRow?.asignatura"
        :docente-id="selectedRow?.docenteId"
        :docente-nombre="selectedRow?.docente"
        @saved="onAuditSaved"
      />
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import AcademicAuditForm from './AcademicAuditForm.vue'
import { useQuasar, date } from 'quasar'

const props = defineProps({
  sedeId: { type: Number, default: null },
  carreraId: { type: Number, default: null },
  semanaInicio: { type: String, default: null }, // Viene del padre (ReportesPage)
})

const $q = useQuasar()
const loading = ref(false)
const loadingReincidentes = ref(false)
const matrizData = ref([])
const filter = ref('')
const filtroEstado = ref('todos')
const soloReincidentes = ref(false)
const reincidentesIds = ref([])

const showAuditForm = ref(false)
const selectedRow = ref(null)

// ── weekOptions igual al padre para poder mostrar la etiqueta ──────────────
const weekOptions = computed(() => {
  const options = []
  const semesterStart = new Date(2026, 1, 9) // Feb 9, 2026
  let d = new Date(semesterStart)
  for (let i = 1; i <= 20; i++) {
    const start = date.formatDate(d, 'YYYY-MM-DD')
    const end = date.addToDate(d, { days: 5 })
    const label = `Semana ${i} (${date.formatDate(d, 'DD/MM')} - ${date.formatDate(end, 'DD/MM')})`
    options.push({ label, value: start })
    d = date.addToDate(d, { days: 7 })
  }
  return options
})

// Info de la semana: usa el prop del padre, o calcula la semana actual como fallback
const semanaInfo = computed(() => {
  const semana = props.semanaInicio
  if (!semana) return null
  const opt = weekOptions.value.find((o) => o.value === semana)
  if (!opt) return null
  // Número de semana (1-indexed) = posición en la lista + 1
  const idx = weekOptions.value.indexOf(opt) + 1
  const avancePlaneado = Math.min(100, Math.round((idx / 20) * 100))
  return { label: opt.label, avancePlaneado }
})

const opcionesEstado = [
  { label: 'Todos los estados', value: 'todos' },
  { label: 'Normal (Verde)', value: 'positive' },
  { label: 'Atención (Amarillo)', value: 'warning' },
  { label: 'Crítico (Rojo)', value: 'negative' },
]

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', sortable: true, align: 'left' },
  { name: 'asignatura', label: 'Asignatura', field: 'asignatura', sortable: true, align: 'left' },
  { name: 'docente', label: 'Docente', field: 'docente', sortable: true, align: 'left' },
  { name: 'carrera', label: 'Carrera', field: 'carrera', sortable: true, align: 'left' },
  {
    name: 'avancePlaneado',
    label: 'A. Planeado',
    field: 'avancePlaneado',
    sortable: true,
    align: 'center',
  },
  { name: 'avanceReal', label: 'A. Real', field: 'avanceReal', sortable: true, align: 'center' },
  { name: 'diferencia', label: 'Diferencia', field: 'diferencia', sortable: true, align: 'center' },
  { name: 'semaforo', label: 'Estado', field: 'semaforo', sortable: true, align: 'center' },
  { name: 'alertas', label: 'Alertas', field: 'alertas', sortable: true, align: 'left' },
  {
    name: 'acciones_correctivas',
    label: 'Acciones Dispuestas',
    field: 'acciones',
    sortable: true,
    align: 'left',
  },
  { name: 'acciones', label: 'Auditar', field: 'acciones', align: 'center' },
]

const filteredMatrizData = computed(() => {
  let result = matrizData.value

  if (soloReincidentes.value && reincidentesIds.value.length > 0) {
    result = result.filter((row) => reincidentesIds.value.includes(row.docenteId))
  }

  if (filter.value) {
    const searchTerm = filter.value.toLowerCase()
    result = result.filter(
      (row) =>
        (row.asignatura && row.asignatura.toLowerCase().includes(searchTerm)) ||
        (row.docente && row.docente.toLowerCase().includes(searchTerm)) ||
        (row.codigo && row.codigo.toLowerCase().includes(searchTerm)),
    )
  }

  if (filtroEstado.value !== 'todos') {
    result = result.filter((row) => row.semaforo === filtroEstado.value)
  }

  return result
})

function getAvanceColor(val) {
  if (val >= 80) return 'green'
  if (val >= 50) return 'orange'
  if (val >= 30) return 'amber'
  return 'red'
}

function getDiferenciaClass(val) {
  const num = parseFloat(val)
  if (num >= 0) return 'text-positive'
  if (num >= -10) return 'text-warning'
  return 'text-negative'
}

const loadMatriz = async () => {
  if (!props.sedeId) return

  loading.value = true
  try {
    const params = {
      sede_id: props.sedeId,
      carrera_id: props.carreraId || undefined,
    }
    // Pasar la semana del padre al backend
    if (props.semanaInicio) {
      params.semana_inicio = props.semanaInicio
    }

    const { data } = await api.get('/reportes/matriz-control', { params })
    matrizData.value = data
  } catch (error) {
    console.error('Error loading Matriz Control:', error)
    $q.notify({ type: 'negative', message: 'Error cargando matriz de control' })
  } finally {
    loading.value = false
  }
}

const loadReincidentes = async () => {
  if (!props.carreraId || !props.semanaInicio) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona una carrera y semana para filtrar reincidentes',
    })
    return
  }

  loadingReincidentes.value = true
  try {
    const { data } = await api.get('/reportes/director/reincidentes-semanal', {
      params: {
        sede_id: props.sedeId,
        carrera_id: props.carreraId,
        semana_inicio: props.semanaInicio,
      },
    })
    const criticos = data.docentes_criticos || []
    reincidentesIds.value = criticos.map((d) => d.docente_id)

    if (reincidentesIds.value.length === 0) {
      $q.notify({ type: 'info', message: 'No hay docentes con 2 semanas consecutivas en ROJO' })
    } else {
      $q.notify({
        type: 'warning',
        message: `${reincidentesIds.value.length} docente(s) con rojo 2 semanas consecutivas`,
      })
    }
  } catch (error) {
    console.error('Error loading reincidentes:', error)
    $q.notify({ type: 'negative', message: 'Error cargando reincidentes' })
    reincidentesIds.value = []
  } finally {
    loadingReincidentes.value = false
  }
}

async function toggleReincidentes() {
  soloReincidentes.value = !soloReincidentes.value
  if (soloReincidentes.value) {
    await loadReincidentes()
  } else {
    reincidentesIds.value = []
  }
}

const openAuditForm = (row) => {
  selectedRow.value = row
  showAuditForm.value = true
}

const onAuditSaved = () => {
  showAuditForm.value = false
  loadMatriz()
}

onMounted(() => {
  if (props.sedeId) loadMatriz()
})

// Recargar cuando cambie la semana desde el padre
watch(
  () => props.semanaInicio,
  () => {
    soloReincidentes.value = false
    reincidentesIds.value = []
    loadMatriz()
  },
)

watch(() => props.sedeId, loadMatriz)
watch(
  () => props.carreraId,
  () => {
    soloReincidentes.value = false
    reincidentesIds.value = []
    loadMatriz()
  },
)
</script>
