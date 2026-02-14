<template>
  <q-page class="reportes-dashboard q-pa-md bg-grey-1">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="text-h4 text-weight-bold q-my-none text-primary">Panel de Control Académico</h4>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          Monitoreo en tiempo real del desempeño de la carrera
          <q-chip v-if="authStore.rol === 'DIRECCION_ACADEMICA' || authStore.rol === 'VICERRECTOR_SEDE'"
            color="primary" text-color="white" size="sm" icon="apartment" class="q-ml-sm">
            {{ nombreSedeUsuario }}
          </q-chip>
        </div>
      </div>
      
      <div class="row q-gutter-sm">
        <!-- Filtros Globales -->
        <q-select
          v-if="mostrarFiltroSede"
          v-model="filtros.sede"
          :options="opcionesSedes"
          label="Sede"
          dense outlined bg-color="white"
          style="min-width: 150px"
          emit-value map-options
          @update:model-value="reloadAll"
        />
        
        <q-select
          v-model="filtros.carrera"
          :options="carrerasOptions"
          label="Carrera"
          dense outlined bg-color="white"
          style="min-width: 200px"
          emit-value map-options
          :disable="authStore.rol === 'DIRECTOR_CARRERA'"
          @update:model-value="reloadAll"
        >
          <template v-slot:prepend><q-icon name="school" /></template>
        </q-select>

        <q-btn color="primary" icon="refresh" flat round @click="reloadAll">
          <q-tooltip>Actualizar Datos</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- KPIs Section -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Total Asignaturas -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card bg-white">
          <q-card-section class="row items-center justify-between no-wrap">
            <div>
              <div class="text-h4 text-weight-bolder text-primary">{{ kpis.total_asignaturas }}</div>
              <div class="text-caption text-grey-7 text-uppercase text-weight-medium">Asignaturas</div>
            </div>
            <q-icon name="menu_book" size="40px" class="text-primary opacity-20" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Docentes Activos -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card bg-white">
          <q-card-section class="row items-center justify-between no-wrap">
            <div>
              <div class="text-h4 text-weight-bolder text-secondary">{{ kpis.docentes_activos }}</div>
              <div class="text-caption text-grey-7 text-uppercase text-weight-medium">Docentes Activos</div>
            </div>
            <q-icon name="people" size="40px" class="text-secondary opacity-20" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Cursos Atrasados -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card bg-white cursor-pointer hover-effect" 
                @click="scrollToTab('materias', 'atrasado')">
          <q-card-section class="row items-center justify-between no-wrap">
            <div>
              <div class="text-h4 text-weight-bolder text-negative">{{ kpis.cursos_atrasados }}</div>
              <div class="text-caption text-negative text-uppercase text-weight-medium">Cursos Atrasados</div>
            </div>
            <q-icon name="warning" size="40px" class="text-negative opacity-20" />
          </q-card-section>
          <q-tooltip>Ver detalle de cursos con avance &lt; 20%</q-tooltip>
        </q-card>
      </div>

      <!-- Riesgo Asistencia -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card bg-white cursor-pointer hover-effect"
                @click="scrollToTab('asistencias', 'riesgo')">
          <q-card-section class="row items-center justify-between no-wrap">
            <div>
              <div class="text-h4 text-weight-bolder text-orange">{{ kpis.cursos_riesgo_asistencia }}</div>
              <div class="text-caption text-orange text-uppercase text-weight-medium">Baja Asistencia (&lt;50%)</div>
            </div>
            <q-icon name="person_off" size="40px" class="text-orange opacity-20" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Avance Distribution -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <div class="text-h6 text-weight-bold">Distribución de Avance</div>
            <div class="text-caption text-grey">Porcentaje de avance en silabo</div>
          </q-card-section>
          <q-card-section>
            <apexchart type="bar" height="300" :options="chartOptions.avance" :series="chartSeries.avance" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Asistencia Trend -->
      <div class="col-12 col-md-8">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <div class="text-h6 text-weight-bold">Tendencia de Asistencia Semanal</div>
            <div class="text-caption text-grey">Promedio de asistencia de estudiantes por semana</div>
          </q-card-section>
          <q-card-section>
            <apexchart type="area" height="300" :options="chartOptions.asistencia" :series="chartSeries.asistencia" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Docente Ranking -->
    <div class="row q-col-gutter-md q-mb-xl">
       <div class="col-12 col-md-6">
          <q-card flat bordered>
            <q-card-section class="bg-green-1">
               <div class="text-h6 text-green-9 text-weight-bold">Top 5 Docentes - Desempeño</div>
               <div class="text-caption text-green-8">Basado en avance y asistencia</div>
            </q-card-section>
            <q-list separator>
               <q-item v-for="(doc, idx) in chartData.top_docentes" :key="doc.id">
                  <q-item-section avatar>
                     <q-avatar color="green" text-color="white" size="sm">{{ idx + 1 }}</q-avatar>
                  </q-item-section>
                  <q-item-section>
                     <q-item-label class="text-weight-bold">{{ doc.nombre }}</q-item-label>
                     <q-item-label caption>
                        Avance: {{ doc.avance }}% | Asistencia: {{ doc.asistencia }}%
                     </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                     <q-chip size="sm" color="green-2" text-color="green-9">
                        {{ Math.round(doc.score) }} pts
                     </q-chip>
                  </q-item-section>
               </q-item>
            </q-list>
          </q-card>
       </div>

       <div class="col-12 col-md-6">
          <q-card flat bordered>
            <q-card-section class="bg-red-1">
               <div class="text-h6 text-red-9 text-weight-bold">Atención Requerida - Docentes</div>
               <div class="text-caption text-red-8">Docentes con indicadores bajos</div>
            </q-card-section>
            <q-list separator>
               <q-item v-for="doc in chartData.bottom_docentes" :key="doc.id">
                  <q-item-section avatar>
                     <q-icon name="warning" color="red" />
                  </q-item-section>
                  <q-item-section>
                     <q-item-label class="text-weight-bold">{{ doc.nombre }}</q-item-label>
                     <q-item-label caption>
                        Avance: {{ doc.avance }}% | Asistencia: {{ doc.asistencia }}%
                     </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                     <q-btn flat round dense icon="visibility" color="grey" size="sm" @click="verDetalleDocente(doc.id)" />
                  </q-item-section>
               </q-item>
            </q-list>
          </q-card>
       </div>
    </div>

    <!-- Detailed Tabs Section -->
    <q-card flat bordered>
       <q-tabs v-model="tabActivo" class="text-grey-8" active-color="primary" indicator-color="primary" align="left">
          <q-tab name="materias" label="Detalle por Materia" icon="list" />
          <q-tab name="asistencias" label="Registro de Asistencias" icon="event_available" />
          <q-tab name="semanal" label="Informe Semanal" icon="assignment_turned_in" />
          <q-tab name="auditoria" label="Auditoría 25%" icon="policy" 
                 v-if="rolPermiteAuditoria" />
       </q-tabs>
       <q-separator />
       
       <q-tab-panels v-model="tabActivo" animated>
          <!-- Panel Materias -->
          <q-tab-panel name="materias">
             <q-inner-loading :showing="loadingDetail">
                <q-spinner-dots size="40px" color="primary" />
             </q-inner-loading>

             <div v-if="!loadingDetail && detalleMaterias.length === 0" class="text-center q-pa-lg text-grey">
                <q-icon name="inbox" size="4rem" />
                <div class="text-h6">No hay materias registradas</div>
             </div>

             <q-table
                v-if="detalleMaterias.length > 0"
                :rows="detalleMaterias"
                :columns="columnasMaterias"
                row-key="id"
                flat bordered
                :pagination="{ rowsPerPage: 20 }"
             >
                <template v-slot:body="props">
                   <q-tr :props="props" class="cursor-pointer" @click="props.expand = !props.expand">
                      <q-td auto-width>
                         <q-btn flat round dense :icon="props.expand ? 'expand_less' : 'expand_more'" size="sm" />
                      </q-td>
                      <q-td key="codigo" :props="props">{{ props.row.codigo }}</q-td>
                      <q-td key="nombre" :props="props">
                         <span class="text-weight-bold">{{ props.row.nombre }}</span>
                      </q-td>
                      <q-td key="semestre" :props="props">
                         <q-badge color="blue-grey" :label="'Sem ' + props.row.semestre" />
                      </q-td>
                      <q-td key="docentes" :props="props">{{ props.row.docentes.length }}</q-td>
                      <q-td key="avance" :props="props">
                         <q-linear-progress :value="props.row.promedioGeneral / 100"
                            :color="props.row.promedioGeneral >= 80 ? 'positive' : props.row.promedioGeneral >= 50 ? 'warning' : 'negative'"
                            rounded size="10px" class="q-mb-xs" />
                         <span class="text-caption">{{ props.row.promedioGeneral }}%</span>
                      </q-td>
                   </q-tr>
                   <!-- Expanded Row: Docentes -->
                   <q-tr v-show="props.expand" :props="props">
                      <q-td colspan="100%" class="bg-grey-1 q-pa-md">
                         <div class="text-subtitle2 q-mb-sm text-grey-8">Docentes asignados:</div>
                         <q-table
                            :rows="props.row.docentes"
                            :columns="columnasDocentes"
                            row-key="id"
                            flat bordered dense
                            hide-pagination
                            :pagination="{ rowsPerPage: 0 }"
                         >
                            <template v-slot:body-cell-estado="scope">
                               <q-td :props="scope">
                                  <q-badge
                                     :color="scope.value === 'Al día' ? 'positive' : scope.value === 'Atrasado' ? 'negative' : 'orange'"
                                  >
                                     {{ scope.value }}
                                  </q-badge>
                               </q-td>
                            </template>
                            <template v-slot:body-cell-avanceTemas="scope">
                               <q-td :props="scope">
                                  <q-linear-progress :value="scope.value / 100"
                                     :color="scope.value >= 80 ? 'positive' : scope.value >= 50 ? 'warning' : 'negative'"
                                     rounded size="8px" class="q-mb-xs" style="min-width: 60px" />
                                  <span class="text-caption">{{ scope.value }}%</span>
                               </q-td>
                            </template>
                            <template v-slot:body-cell-pac="scope">
                               <q-td :props="scope">
                                  <q-icon :name="scope.value ? 'check_circle' : 'cancel'" 
                                     :color="scope.value ? 'positive' : 'negative'" size="sm" />
                               </q-td>
                            </template>
                         </q-table>
                      </q-td>
                   </q-tr>
                </template>
             </q-table>
          </q-tab-panel>

          <!-- Panel Asistencias -->
          <q-tab-panel name="asistencias">
             <q-inner-loading :showing="loadingDetail">
                <q-spinner-dots size="40px" color="primary" />
             </q-inner-loading>

             <div v-if="!loadingDetail && detalleAsistencias.length === 0" class="text-center q-pa-lg text-grey">
                <q-icon name="event_busy" size="4rem" />
                <div class="text-h6">No hay datos de asistencia registrados</div>
             </div>

             <q-table
                v-if="detalleAsistencias.length > 0"
                :rows="detalleAsistencias"
                :columns="columnasAsistencias"
                row-key="uid"
                flat bordered
                :pagination="{ rowsPerPage: 20 }"
             >
                <template v-slot:body-cell-asistencia="props">
                   <q-td :props="props">
                      <q-linear-progress :value="props.value / 100"
                         :color="props.value >= 80 ? 'positive' : props.value >= 50 ? 'warning' : 'negative'"
                         rounded size="10px" class="q-mb-xs" style="min-width: 80px" />
                      <span class="text-caption">{{ props.value }}%</span>
                   </q-td>
                </template>
                <template v-slot:body-cell-estado="props">
                   <q-td :props="props">
                      <q-badge
                         :color="props.value === 'Al día' ? 'positive' : props.value === 'Atrasado' ? 'negative' : 'orange'"
                      >
                         {{ props.value }}
                      </q-badge>
                   </q-td>
                </template>
             </q-table>
          </q-tab-panel>

          <!-- Panel Semanal -->
          <q-tab-panel name="semanal">
             <WeeklyReportTable 
                :sede-id="Number(filtros.sede)" 
                :carrera-id="Number(filtros.carrera)" 
             />
          </q-tab-panel>

          <!-- Panel Auditoría -->
          <q-tab-panel name="auditoria">
              <div class="text-h6 q-mb-md">Gestión de Auditorías In Situ</div>
              <p>Selección aleatoria de asignaturas para control de calidad.</p>
              <div class="bg-grey-2 q-pa-md rounded-borders">Componente de Auditoría</div>
          </q-tab-panel>
       </q-tab-panels>
    </q-card>

    <!-- Loading Overlay -->
    <q-inner-loading :showing="loading">
       <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'
import { api } from 'boot/axios'
import WeeklyReportTable from 'src/components/reportes/WeeklyReportTable.vue'

const authStore = useAuthStore()
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()

// State
const loading = ref(false)
const loadingDetail = ref(false)
const tabActivo = ref('materias')
const filtros = ref({
  sede: authStore.usuarioActual?.sede_id,
  carrera: authStore.carreraId || null
})

// Detail data for tabs
const detalleMaterias = ref([])
const detalleAsistencias = ref([])

// Data
const kpis = ref({
   total_asignaturas: 0,
   docentes_activos: 0,
   cursos_atrasados: 0,
   cursos_riesgo_asistencia: 0
})

const chartData = ref({
   top_docentes: [],
   bottom_docentes: []
})

const chartSeries = ref({
   avance: [{ name: 'Asignaturas', data: [] }],
   asistencia: [{ name: 'Asistencia Promedio', data: [] }]
})

// Chart Options (Reactive to support theme changes if needed)
const chartOptions = ref({
   avance: {
      chart: { id: 'avance-chart', toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 4, distributed: true } },
      colors: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'], // Red, Orange, Blue, Green
      xaxis: { categories: [] },
      legend: { show: false }
   },
   asistencia: {
      chart: { id: 'asistencia-chart', toolbar: { show: false } },
      colors: ['#6366F1'],
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.1 } },
      xaxis: { type: 'category' } // Dates will be categories
   }
})

// Computes
const mostrarFiltroSede = computed(() => {
   return ['VICERRECTOR_NACIONAL', 'SUPER_ADMIN'].includes(authStore.rol)
})

const rolPermiteAuditoria = computed(() => {
   return ['DIRECCION_ACADEMICA', 'VICERRECTOR_SEDE', 'SUPER_ADMIN', 'VICERRECTOR_NACIONAL'].includes(authStore.rol)
})

const nombreSedeUsuario = computed(() => {
   return sedesStore.sedes.find(s => s.id === filtros.value.sede)?.nombre || ''
})

const opcionesSedes = computed(() => {
   return sedesStore.sedes.map(s => ({ label: s.nombre, value: s.id }))
})

const carrerasOptions = computed(() => {
   if (!filtros.value.sede) return []
   return carrerasStore.getCarrerasBySede(filtros.value.sede)
      .map(c => ({ label: c.nombre, value: c.id }))
})

// Column definitions for Materias tab
const columnasMaterias = [
   { name: 'expand', label: '', field: '', align: 'left' },
   { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
   { name: 'nombre', label: 'Materia', field: 'nombre', align: 'left', sortable: true },
   { name: 'semestre', label: 'Semestre', field: 'semestre', align: 'center', sortable: true },
   { name: 'docentes', label: 'Docentes', field: row => row.docentes.length, align: 'center' },
   { name: 'avance', label: 'Avance Promedio', field: 'promedioGeneral', align: 'center', sortable: true }
]

const columnasDocentes = [
   { name: 'nombre', label: 'Docente', field: 'nombre', align: 'left', sortable: true },
   { name: 'grupo', label: 'Grupo', field: 'grupo', align: 'center' },
   { name: 'avanceTemas', label: 'Avance', field: 'avanceTemas', align: 'center', sortable: true },
   { name: 'clasesImpartidas', label: 'Clases', field: row => `${row.temasCompletados}/${row.temasTotales}`, align: 'center' },
   { name: 'pac', label: 'PAC', field: 'pac', align: 'center' },
   { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
   { name: 'ultimaClase', label: 'Última Clase', field: 'ultimaClase', align: 'center' }
]

const columnasAsistencias = [
   { name: 'docente', label: 'Docente', field: 'nombre', align: 'left', sortable: true },
   { name: 'materia', label: 'Materia', field: 'materia', align: 'left', sortable: true },
   { name: 'grupo', label: 'Grupo', field: 'grupo', align: 'center' },
   { name: 'asistencia', label: 'Asistencia Prom.', field: 'asistencia', align: 'center', sortable: true },
   { name: 'clasesImpartidas', label: 'Clases', field: row => `${row.temasCompletados}/${row.temasTotales}`, align: 'center' },
   { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true }
]

// Methods
const loadDashboardData = async () => {
   // For directors, ensure carrera is set from auth
   if (!filtros.value.carrera && authStore.rol === 'DIRECTOR_CARRERA') {
      filtros.value.carrera = authStore.carreraId
   }
   
   if (!filtros.value.sede) return
   
   loading.value = true
   try {
      const { data } = await api.get('/reportes/metrics', { params: { 
         sede_id: filtros.value.sede,
         carrera_id: filtros.value.carrera 
      }})

      // Update KPIs
      kpis.value = data.kpis
      
      // Update Charts
      chartSeries.value.avance = [{ 
         name: 'Asignaturas', 
         data: data.charts.avance_distribucion.data 
      }]
      chartOptions.value.avance = { 
         ...chartOptions.value.avance, 
         xaxis: { categories: data.charts.avance_distribucion.categories } 
      }

      chartSeries.value.asistencia = [{ 
         name: 'Asistencia %', 
         data: data.charts.asistencia_trend.map(i => i.y) 
      }]
      chartOptions.value.asistencia = {
         ...chartOptions.value.asistencia,
         xaxis: { categories: data.charts.asistencia_trend.map(i => i.x) }
      }

      chartData.value.top_docentes = data.charts.top_docentes
      chartData.value.bottom_docentes = data.charts.bottom_docentes

   } catch (error) {
      console.error('Error loading dashboard:', error)
   } finally {
      loading.value = false
   }
}

const loadDetailData = async () => {
   if (!filtros.value.sede) return
   
   loadingDetail.value = true
   try {
      const { data } = await api.get('/reportes/director', { params: {
         sede_id: filtros.value.sede,
         carrera_id: filtros.value.carrera
      }})

      detalleMaterias.value = data.reporteMaterias || []
      
      // Flatten docentes for asistencias tab
      const asistencias = []
      for (const materia of (data.reporteMaterias || [])) {
         for (const doc of (materia.docentes || [])) {
            asistencias.push({
               uid: `${materia.id}-${doc.id}`,
               ...doc,
               materia: materia.nombre
            })
         }
      }
      detalleAsistencias.value = asistencias

   } catch (error) {
      console.error('Error loading detail data:', error)
   } finally {
      loadingDetail.value = false
   }
}

const reloadAll = () => {
   loadDashboardData()
   loadDetailData()
}

const scrollToTab = (tabName) => {
   tabActivo.value = tabName
   // Optional: Emit event to child table/component to apply filter metrics
}

const verDetalleDocente = (id) => {
   // Verify logic
   console.log('Ver detalle docente', id)
}

// Lifecycle
onMounted(async () => {
   await Promise.all([
      sedesStore.fetchSedes(),
      carrerasStore.fetchCarreras()
   ])

   // Ensure carrera is set for directors
   if (authStore.rol === 'DIRECTOR_CARRERA' && authStore.carreraId) {
      filtros.value.carrera = authStore.carreraId
   }
   
   loadDashboardData()
   loadDetailData()
})

// Watchers
watch(() => filtros.value.sede, () => {
   // Only reset carrera on sede change for non-directors
   if (authStore.rol !== 'DIRECTOR_CARRERA') {
      filtros.value.carrera = null
   }
})

// Reload detail data when tab changes to materias/asistencias
watch(tabActivo, (newTab) => {
   if ((newTab === 'materias' || newTab === 'asistencias') && detalleMaterias.value.length === 0) {
      loadDetailData()
   }
})

</script>

<style scoped>
.kpi-card {
   border-radius: 12px;
   height: 100px;
   display: flex;
   flex-direction: column;
   justify-content: center;
   transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card:hover {
   transform: translateY(-2px);
   box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.opacity-20 {
   opacity: 0.15;
}

.hover-effect {
   position: relative;
   overflow: hidden;
}

.hover-effect::after {
   content: '';
   position: absolute;
   top: 0; left: 0; right: 0; bottom: 0;
   background: currentColor;
   opacity: 0;
   transition: opacity 0.2s;
}

.hover-effect:hover::after {
   opacity: 0.05;
}
</style>
