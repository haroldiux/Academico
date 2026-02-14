<template>
  <div class="weekly-report-table">
    <div class="row q-gutter-sm q-mb-md items-center justify-between">
       <div class="row q-gutter-sm items-center col-grow">
          <!-- Week Selector -->
          <q-select
            v-model="selectedWeek"
            :options="weekOptions"
            label="Semana Académica"
            outlined dense
            style="min-width: 250px"
            emit-value map-options
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
            outlined dense
            style="min-width: 160px"
            emit-value map-options
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

          <q-input v-model="filterAsignatura" outlined dense label="Asignatura" style="min-width: 150px">
             <template v-slot:append>
                <q-icon name="search" v-if="!filterAsignatura" />
                <q-icon name="close" v-else @click="filterAsignatura = ''" class="cursor-pointer" />
             </template>
          </q-input>

          <!-- Buscador General -->
          <q-input v-model="searchText" outlined dense placeholder="Buscar..." style="min-width: 150px">
             <template v-slot:prepend>
                <q-icon name="search" />
             </template>
             <template v-slot:append>
                <q-icon name="close" v-if="searchText" @click="searchText = ''" class="cursor-pointer" />
             </template>
          </q-input>

          <q-btn icon="refresh" flat round color="primary" @click="loadReports" />
       </div>
       
       <div class="text-caption text-grey">
          Mostrando: {{ filteredReports.length }} registros
       </div>
    </div>

    <q-table
      :rows="filteredReports"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat bordered
      :pagination="{ rowsPerPage: 15 }"
    >
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge :color="getEstadoColor(props.value)">
            {{ props.value }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-alerta="props">
        <q-td :props="props">
          <q-chip
            :color="getAlertColor(props.value)"
            text-color="white"
            size="sm"
          >
            {{ props.value }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props" auto-width>
          <q-btn 
            flat round dense 
            icon="edit" 
            color="primary" 
            @click="openReportForm(props.row)"
          >
            <q-tooltip>Revisar/Editar Informe</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Dialog for Form -->
    <q-dialog v-model="showForm" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card>
        <q-toolbar class="bg-primary text-white">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title>Informe de Cumplimiento Micro-curricular</q-toolbar-title>
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
  carreraId: Number
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
const selectedGroup = ref(null)

// Helper to generate weeks (Mocking a start date of approx 2 months ago for Semester start)
const weekOptions = computed(() => {
   const options = []
   // Assume semester started Feb 1st, 2026 (or dynamic) 
   // For now, let's generate 20 weeks around current date
   // Ideally this comes from a configuration
   
   // Hardcoded semantic "Semester Start" for this example: Jan 20, 2026
   const semesterStart = new Date(2026, 0, 20) 
   // Actually, let's just show options relative to current date to be safe if we don't know start
   // Or better: List weeks for the current year?
   // Let's generate weeks for the current active semester period
   
   let d = new Date(semesterStart)
   for (let i = 1; i <= 20; i++) {
      const start = date.formatDate(d, 'YYYY-MM-DD')
      // week end not needed for value
      const label = `Semana ${i} (${date.formatDate(d, 'DD/MM')} - ${date.formatDate(date.addToDate(d, { days: 6 }), 'DD/MM')})`
      
      options.push({ label, value: start })
      
      // Next week
      d = date.addToDate(d, { days: 7 })
   }
   return options
})

const statusOptions = [
   { label: 'Todos', value: 'TODOS', color: null },
   { label: 'Cumplimiento Total (Verde)', value: 'VERDE', color: 'positive' },
   { label: ' Atención (Amarillo)', value: 'AMARILLO', color: 'warning' },
   { label: 'Crítico / Sin Plan (Rojo)', value: 'ROJO', color: 'negative' }
]

const columns = [
  { name: 'docente', label: 'Docente', field: 'docente', align: 'left', sortable: true },
  { name: 'asignatura', label: 'Asignatura', field: 'asignatura', align: 'left', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  { name: 'criterios', label: 'Cump. Técnico', field: row => computeTechScore(row.criterios), align: 'center' },
  { name: 'alerta', label: 'Escala Alerta', field: 'alerta', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', align: 'right' }
]

const filteredReports = computed(() => {
   return reports.value.filter(r => {
      const matchStatus = filterStatus.value === 'TODOS' || r.alerta === filterStatus.value
      const matchDocente = !filterDocente.value || r.docente.toLowerCase().includes(filterDocente.value.toLowerCase())
      const matchAsignatura = !filterAsignatura.value || r.asignatura.toLowerCase().includes(filterAsignatura.value.toLowerCase())
      const matchSearch = !searchText.value || 
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
   const yes = keys.filter(k => criterios[k].cumple).length
   return `${yes}/${keys.length} Cumplidos`
}

const getAlertColor = (alert) => {
  switch(alert) {
    case 'VERDE': return 'positive'
    case 'AMARILLO': return 'warning'
    case 'ROJO': return 'negative'
    default: return 'grey'
  }
}

const getEstadoColor = (estado) => {
  switch(estado) {
    case 'Guardado': return 'positive'
    case 'Borrador': return 'orange'
    case 'Pendiente': return 'red'
    default: return 'grey'
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
        fecha_inicio: selectedWeek.value // Send selected week start date
      }
    })
    reports.value = data.map(r => ({
       ...r,
       grupo_id: parseInt(r.id.split('-')[0]) // Extract grupo_id from composite ID
    }))
  } catch (error) {
    console.error('Error loading reports', error)
  } finally {
    loading.value = false
  }
}

const openReportForm = (row) => {
  selectedGroup.value = row
  showForm.value = true
}

const onReportSaved = () => {
  showForm.value = false
  loadReports()
}

watch(() => [props.sedeId, props.carreraId], () => {
  loadReports()
})

onMounted(() => {
   // Set default week to the first one available
   if (weekOptions.value.length > 0) {
      selectedWeek.value = weekOptions.value[0].value
   }
   loadReports()
})
</script>
```
