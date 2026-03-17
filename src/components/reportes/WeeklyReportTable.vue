<template>
  <div class="weekly-report-table">
    <div class="row q-gutter-sm q-mb-md items-center justify-between">
      <div class="row q-gutter-sm items-center col-grow">
        <!-- Week Selector (Only if not provided externally) -->
        <q-select
          v-if="!externalWeek"
          v-model="selectedWeek"
          :options="weekOptions"
          label="Semana Académica"
          outlined
          dense
          style="min-width: 250px"
          emit-value
          map-options
          @update:model-value="loadReports"
        >
          <template v-slot:prepend>
            <q-icon name="event" />
          </template>
        </q-select>

        <!-- Progress/Alert Filter -->
        <q-select
          v-model="filterStatus"
          :options="statusOptions"
          label="Estado / Alerta"
          outlined
          dense
          style="min-width: 160px"
          emit-value
          map-options
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar v-if="scope.opt.color">
                <q-icon name="circle" :color="scope.opt.color" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <!-- Filtros de Texto -->
        <q-input v-model="filterDocente" outlined dense label="Docente" style="min-width: 150px">
          <template v-slot:append>
            <q-icon name="search" v-if="!filterDocente" />
            <q-icon name="close" v-else @click="filterDocente = ''" class="cursor-pointer" />
          </template>
        </q-input>

        <q-input
          v-model="filterAsignatura"
          outlined
          dense
          label="Asignatura"
          style="min-width: 150px"
        >
          <template v-slot:append>
            <q-icon name="search" v-if="!filterAsignatura" />
            <q-icon name="close" v-else @click="filterAsignatura = ''" class="cursor-pointer" />
          </template>
        </q-input>

        <!-- Buscador General -->
        <q-input
          v-model="searchText"
          outlined
          dense
          :placeholder="viewMode === 'docente' ? 'Buscar docente...' : 'Buscar asignatura...'"
          style="min-width: 150px"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-icon
              name="close"
              v-if="searchText"
              @click="searchText = ''"
              class="cursor-pointer"
            />
          </template>
        </q-input>

        <!--           <q-btn icon="filter_alt" outline color="warning" label="Pendientes (Rojos/Amarillos)" @click="filterStatus = 'PENDIENTES'" v-if="filterStatus !== 'PENDIENTES'" /> -->
        <!--           <q-btn icon="playlist_add_check" outline color="primary" label="Con Acciones Tomadas" @click="filterStatus = 'GESTIONADOS'" v-if="filterStatus !== 'GESTIONADOS'" /> -->
        <q-btn
          icon="check_circle"
          color="positive"
          label="Autogenerar Verdes"
          @click="confirmarAutogenerarVerdes"
          :loading="isGenerating"
        />
        <q-btn
          icon="refresh"
          flat
          round
          color="primary"
          @click="loadReports"
          :disable="isGenerating"
        />
      </div>

      <div class="text-caption text-grey">Mostrando: {{ filteredReports.length }} registros</div>
    </div>

    <q-table
      :rows="filteredReports"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
      :pagination="{ rowsPerPage: 15 }"
    >
      <template v-slot:body-cell-asignatura="props">
        <q-td :props="props">
          {{ props.value }}
          <q-badge
            v-if="props.row.subReports && props.row.subReports.length > 1"
            color="blue-grey"
            text-color="white"
            class="q-ml-sm"
          >
            {{ props.row.subReports.length }} Grupos
          </q-badge>
          <q-badge
            v-if="isPropagated(props.row)"
            color="info"
            text-color="white"
            class="q-ml-sm"
            icon="content_copy"
          >
            Propagado
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge :color="getEstadoColor(props.value)">
            {{ props.value }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-alerta="props">
        <q-td :props="props">
          <q-chip :color="getAlertColor(props.value)" text-color="white" size="sm">
            {{ props.value }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props" auto-width>
          <q-btn
            flat
            round
            dense
            icon="edit"
            color="primary"
            @click="checkAndOpenReport(props.row)"
          >
            <q-tooltip>Revisar/Editar Informe</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Dialog for Group Selection -->
    <q-dialog v-model="showGroupSelection">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Seleccionar Grupo</div>
          <div class="text-caption">Esta asignatura tiene múltiples grupos asignados.</div>
        </q-card-section>

        <q-list separator>
          <q-item
            v-for="rep in selectedGroupList"
            :key="rep.id"
            clickable
            @click="openReportForm(rep)"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="group" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ rep.grupo_nombre || 'Grupo ' + rep.grupo_id }}</q-item-label>
              <q-item-label caption>
                Estado: <span :class="'text-' + getEstadoColor(rep.estado)">{{ rep.estado }}</span>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge :color="getAlertColor(rep.alerta)" rounded />
            </q-item-section>
          </q-item>
        </q-list>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog for Form -->
    <q-dialog v-model="showForm" transition-show="scale" transition-hide="scale">
      <q-card style="width: 900px; max-width: 90vw">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>Informe de Cumplimiento Micro-curricular</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
          <WeeklyReportForm
            v-if="selectedGroup"
            :grupo-id="selectedGroup.grupo_id"
            :fecha-inicio="selectedWeek"
            @saved="onReportSaved"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { api } from 'boot/axios'
import { date } from 'quasar'
import WeeklyReportForm from './WeeklyReportForm.vue'

const props = defineProps({
  sedeId: Number,
  carreraId: Number,
  externalWeek: String, // Optional: if provided, internal selector will be hidden/overridden
  viewMode: {
    type: String,
    default: 'both', // 'materia', 'docente', 'both'
  },
})

const loading = ref(false)
const reports = ref([])
// Default to first week instead of current date
const selectedWeek = ref('')
const filterStatus = ref('TODOS')
const filterDocente = ref('')
const filterAsignatura = ref('')
const searchText = ref('')

const showForm = ref(false)
const showGroupSelection = ref(false)
const selectedGroup = ref(null)
const selectedGroupList = ref([])

// Helper to generate weeks (Start date: Feb 9, 2026)
const weekOptions = computed(() => {
  const options = []
  // Semester Start: Feb 9, 2026 (Monday)
  const semesterStart = new Date(2026, 1, 9)

  let d = new Date(semesterStart)
  for (let i = 1; i <= 20; i++) {
    const start = date.formatDate(d, 'YYYY-MM-DD')
    // week end: Saturday (Start + 5 days)
    const end = date.addToDate(d, { days: 5 })

    const label = `Semana ${i} (${date.formatDate(d, 'DD/MM')} - ${date.formatDate(end, 'DD/MM')})`

    options.push({ label, value: start })

    // Next week starts 7 days later
    d = date.addToDate(d, { days: 7 })
  }
  return options
})

const statusOptions = [
  { label: 'Todos', value: 'TODOS', color: null },
  { label: 'Pendientes (Rojo/Amarillos)', value: 'PENDIENTES', color: 'orange' },
  { label: 'Gestionados (Con Acciones)', value: 'GESTIONADOS', color: 'primary' },
  { label: 'Cumplimiento Total (Verde)', value: 'VERDE', color: 'positive' },
  { label: ' Atención (Amarillo)', value: 'AMARILLO', color: 'warning' },
  { label: 'Crítico / Sin Plan (Rojo)', value: 'ROJO', color: 'negative' },
]

const columns = computed(() => {
  const baseColumns = [
    { name: 'docente', label: 'Docente', field: 'docente', align: 'left', sortable: true },
    { name: 'asignatura', label: 'Asignatura', field: 'asignatura', align: 'left', sortable: true },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
    {
      name: 'criterios',
      label: 'Cump. Técnico',
      field: (row) => computeTechScore(row.criterios),
      align: 'center',
    },
    { name: 'alerta', label: 'Escala Alerta', field: 'alerta', align: 'center', sortable: true },
    { name: 'acciones', label: 'Acciones', align: 'right' },
  ]

  if (props.viewMode === 'materia') {
    // Reorder to put asignatura first
    return [
      baseColumns[1], // asignatura
      baseColumns[0], // docente
      ...baseColumns.slice(2),
    ]
  }

  return baseColumns
})

const filteredReports = computed(() => {
  return reports.value.filter((r) => {
    let matchStatus = false
    if (filterStatus.value === 'TODOS') matchStatus = true
    else if (filterStatus.value === 'PENDIENTES') {
      // Pendientes son los que aún no se han gestionado (no están guardados todavía o no tienen acción real)
      matchStatus = (r.alerta === 'ROJO' || r.alerta === 'AMARILLO') && r.estado !== 'Guardado'
    } else if (filterStatus.value === 'GESTIONADOS') {
      const checkGestionado = (rep) =>
        (rep.alerta === 'ROJO' || rep.alerta === 'AMARILLO') &&
        rep.estado === 'Guardado' &&
        rep.acciones &&
        rep.acciones.trim() !== ''
      if (r.subReports && r.subReports.length > 0) {
        matchStatus = r.subReports.some(checkGestionado)
      } else {
        matchStatus = checkGestionado(r)
      }
    } else matchStatus = r.alerta === filterStatus.value

    const matchDocente =
      !filterDocente.value || r.docente.toLowerCase().includes(filterDocente.value.toLowerCase())
    const matchAsignatura =
      !filterAsignatura.value ||
      r.asignatura.toLowerCase().includes(filterAsignatura.value.toLowerCase())
    const matchSearch =
      !searchText.value ||
      r.docente.toLowerCase().includes(searchText.value.toLowerCase()) ||
      r.asignatura.toLowerCase().includes(searchText.value.toLowerCase()) ||
      r.estado.toLowerCase().includes(searchText.value.toLowerCase())

    return matchStatus && matchDocente && matchAsignatura && matchSearch
  })
})

const computeTechScore = (criterios) => {
  if (!criterios) return 'Sin datos'
  if (Array.isArray(criterios)) {
    return criterios.length === 0 ? 'Sin datos' : criterios.length + ' sesiones'
  }
  // It's checked object (Saved report)
  const keys = Object.keys(criterios)
  const yes = keys.filter((k) => criterios[k].cumple).length
  return `${yes}/${keys.length} Cumplidos`
}

const isPropagated = (row) => {
  if (row.es_propagado) return true
  if (row.subReports && row.subReports.length > 0) {
    return row.subReports.some((sub) => sub.es_propagado)
  }
  return false
}

const getAlertColor = (alert) => {
  switch (alert) {
    case 'VERDE':
      return 'positive'
    case 'AMARILLO':
      return 'warning'
    case 'ROJO':
      return 'negative'
    default:
      return 'grey'
  }
}

const getEstadoColor = (estado) => {
  switch (estado) {
    case 'Guardado':
      return 'positive'
    case 'Borrador':
      return 'orange'
    case 'Pendiente':
      return 'red'
    default:
      return 'grey'
  }
}

const loadReports = async () => {
  if (!props.carreraId || !props.sedeId) return

  loading.value = true
  try {
    const { data } = await api.get('/reportes/director/weekly', {
      params: {
        sede_id: props.sedeId,
        carrera_id: props.carreraId,
        fecha_inicio: selectedWeek.value, // Send selected week start date
      },
    })

    // Grouping by Docente + Asignatura
    const groups = {}

    data.forEach((r) => {
      const key = `${r.docente}-${r.asignatura}`
      if (!groups[key]) {
        groups[key] = {
          ...r,
          // Clone the array rather than assigning the reference
          criterios: Array.isArray(r.criterios) ? [...r.criterios] : r.criterios,
          subReports: [r],
          grupo_id: null, // clear distinctive ID
        }
      } else {
        groups[key].subReports.push(r)
        // Prioritize worst status/alert for the group view
        if (r.alerta === 'ROJO') groups[key].alerta = 'ROJO'
        else if (r.alerta === 'AMARILLO' && groups[key].alerta !== 'ROJO')
          groups[key].alerta = 'AMARILLO'

        if (r.estado === 'Pendiente') groups[key].estado = 'Pendiente'
        else if (r.estado === 'Borrador' && groups[key].estado !== 'Pendiente')
          groups[key].estado = 'Borrador'

        // Merge criterios to show total sessions for computeTechScore
        if (Array.isArray(groups[key].criterios) && Array.isArray(r.criterios)) {
          groups[key].criterios = [...groups[key].criterios, ...r.criterios]
        } else if (
          !groups[key].criterios ||
          (Array.isArray(groups[key].criterios) && groups[key].criterios.length === 0)
        ) {
          groups[key].criterios = r.criterios
        }
      }
    })

    reports.value = Object.values(groups)
  } catch (error) {
    console.error('Error loading reports', error)
  } finally {
    loading.value = false
  }
}

const checkAndOpenReport = (row) => {
  if (row.subReports && row.subReports.length > 1) {
    selectedGroupList.value = row.subReports
    showGroupSelection.value = true
  } else if (row.subReports && row.subReports.length === 1) {
    // Use the original subReport so grupo_id is not null
    openReportForm(row.subReports[0])
  } else {
    openReportForm(row)
  }
}

const openReportForm = (row) => {
  selectedGroup.value = row
  showGroupSelection.value = false
  showForm.value = true
}

const onReportSaved = () => {
  showForm.value = false
  loadReports()
}

import { useQuasar } from 'quasar'
const $q = useQuasar()
const isGenerating = ref(false)

const confirmarAutogenerarVerdes = () => {
  // Find all completely pending reports that are supposed to be green.
  const greenGroups = []
  reports.value.forEach((r) => {
    if (r.subReports) {
      r.subReports.forEach((sr) => {
        if (sr.alerta === 'VERDE' && sr.estado !== 'Guardado') {
          greenGroups.push(sr.grupo_id)
        }
      })
    } else {
      if (r.alerta === 'VERDE' && r.estado !== 'Guardado') {
        greenGroups.push(r.grupo_id)
      }
    }
  })

  // Deduplicate grouping
  const uniqueGroups = [...new Set(greenGroups.filter((id) => id !== null))]

  if (uniqueGroups.length === 0) {
    $q.notify({
      color: 'info',
      icon: 'info',
      message: 'No hay reportes en estado Verde pendientes de guardar.',
    })
    return
  }

  $q.dialog({
    title: 'Confirmar Autogeneración',
    message: `Se han detectado ${uniqueGroups.length} asignaturas/grupos en la semana seleccionada con cumplimiento Verde. ¿Deseas aprobar y guardar sus reportes automáticamente?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Generar y Guardar',
      color: 'positive',
    },
  }).onOk(() => {
    autogenerarVerdes(uniqueGroups)
  })
}

const autogenerarVerdes = async (gruposIds) => {
  isGenerating.value = true
  try {
    const { data } = await api.post('/reportes/semanal/bulk-verdes', {
      grupos: gruposIds,
      fecha_inicio: selectedWeek.value,
    })

    $q.notify({
      color: 'positive',
      icon: 'check_circle',
      message: data.message || `Mostrando ${data.generated_count} reportes generados exitosamente.`,
    })

    // Reload table
    await loadReports()
  } catch (e) {
    console.error('Error bulk generating: ', e)
    $q.notify({
      color: 'negative',
      icon: 'error',
      message: 'Ocurrió un error al intentar autogenerar los reportes.',
    })
  } finally {
    isGenerating.value = false
  }
}

watch(
  () => [props.sedeId, props.carreraId, props.externalWeek],
  () => {
    if (props.externalWeek) {
      selectedWeek.value = props.externalWeek
    }
    loadReports()
  },
)

onMounted(() => {
  if (props.externalWeek) {
    selectedWeek.value = props.externalWeek
  } else if (weekOptions.value.length > 0) {
    selectedWeek.value = weekOptions.value[0].value
  }
  loadReports()
})
</script>
```
