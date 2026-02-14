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
      <template v-slot:body-cell-asignatura="props">
         <q-td :props="props">
            {{ props.value }}
            <q-badge v-if="props.row.subReports && props.row.subReports.length > 1" 
                     color="blue-grey" text-color="white" class="q-ml-sm">
               {{ props.row.subReports.length }} Grupos
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
             <q-item v-for="rep in selectedGroupList" :key="rep.id" clickable @click="openReportForm(rep)" v-ripple>
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
    
    // Grouping by Docente + Asignatura
    const groups = {}
    
    data.forEach(r => {
       const key = `${r.docente}-${r.asignatura}`
       if (!groups[key]) {
          groups[key] = {
             ...r,
             subReports: [r],
             grupo_id: null // clear distinctive ID
          }
       } else {
          groups[key].subReports.push(r)
          // Prioritize worst status/alert for the group view
          if (r.alerta === 'ROJO') groups[key].alerta = 'ROJO'
          else if (r.alerta === 'AMARILLO' && groups[key].alerta !== 'ROJO') groups[key].alerta = 'AMARILLO'
          
          if (r.estado === 'Pendiente') groups[key].estado = 'Pendiente'
          else if (r.estado === 'Borrador' && groups[key].estado !== 'Pendiente') groups[key].estado = 'Borrador'
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
