<template>
  <q-page class="gestion-eval-page">
    <!-- Header Section -->
    <div class="page-header q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h1 class="page-title text-h4 text-weight-bold row items-center">
            <q-icon name="assignment" color="deep-purple" class="q-mr-md" />
            Gestión de Evaluaciones
          </h1>
          <p class="page-subtitle text-grey-7 q-mt-xs">
            Crea y administra exámenes desde el banco de preguntas
          </p>
        </div>
        <div class="header-actions">
          <q-btn unelevated color="deep-purple" icon="refresh" label="Actualizar" no-caps @click="cargarDatos" />
        </div>
      </div>
    </div>

    <!-- Statistics & Printable list button -->
    <div class="row q-col-gutter-sm q-mb-lg items-center">
      <div class="col-12 col-md-2">
        <q-select 
          v-model="filtros.sede" 
          :options="sedesOptions" 
          outlined dense label="Sede" 
          :clearable="!esSedeRestringida" 
          :readonly="esSedeRestringida"
          :loading="loadingOptions.sedes"
          bg-color="white" 
        />
      </div>
      <div class="col-12 col-md-2">
        <q-select 
          v-model="filtros.carrera" 
          :options="carrerasOptions" 
          outlined dense label="Carrera" 
          clearable 
          :loading="loadingOptions.carreras"
          bg-color="white" 
        />
      </div>
      <div class="col-12 col-md-2">
        <q-select v-model="filtros.parcial" :options="parcialesOptions" outlined dense label="Parcial" clearable bg-color="white" />
      </div>
      <div class="col-12 col-md-4 flex items-center no-wrap">
        <q-input v-model="filtros.fecha" outlined dense type="date" label="Filtrar por Fecha" clearable bg-color="white" class="full-width q-mr-sm" />
        <q-btn unelevated color="blue-7" icon="assessment" @click="dialogStats = true" class="q-mr-xs">
          <q-tooltip>Ver Estadísticas del Día</q-tooltip>
        </q-btn>
        <q-btn unelevated color="deep-purple" icon="print" @click="imprimirListaDiaria">
          <q-tooltip>Imprimir Lista de Seguimiento</q-tooltip>
        </q-btn>
      </div>
      <div class="col-12 col-md-2 text-right">
        <q-btn flat dense icon="filter_alt_off" label="Limpiar Filtros" color="grey-7" no-caps @click="limpiarFiltros" />
      </div>
    </div>

    <!-- State Buttons Filter -->
    <div class="row q-mb-lg bg-white q-pa-sm rounded-borders shadow-1 items-center justify-center">
      <div class="text-caption text-grey-8 q-mr-md text-weight-bold">ETAPA ACTUAL:</div>
      <q-btn-toggle
        v-model="filtros.estado"
        toggle-color="deep-purple"
        unelevated
        flat
        :options="[
          { label: 'Todos', value: null },
          ...estadosOptions
        ]"
        no-caps
        class="custom-toggle"
      />
    </div>

    <!-- Summary Cards (HIDDEN AS PER REQUEST, ACCESSIBLE VIA MODAL) -->
    <!-- <div class="row q-col-gutter-md q-mb-xl">...</div> -->

    <!-- Modal: Estadísticas del Día -->
    <q-dialog v-model="dialogStats" backdrop-filter="blur(4px)">
      <q-card style="width: 500px; max-width: 90vw; border-radius: 16px;">
        <q-card-section class="bg-blue-8 text-white row items-center no-wrap">
          <q-icon name="analytics" size="24px" class="q-mr-sm" />
          <div class="text-h6 text-weight-bold">Resumen de Evaluaciones</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="text-subtitle2 text-grey-7 q-mb-md">PARA LA FECHA: <span class="text-weight-bold text-black">{{ filtros.fecha || 'TODAS' }}</span></div>
          
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-card flat bordered class="bg-blue-1 text-blue-9">
                <q-card-section class="flex justify-between items-center q-py-md">
                  <div class="text-h6 no-margin">TOTAL EVALUACIONES</div>
                  <div class="text-h4 text-weight-bolder">{{ examenesFiltrados.length }}</div>
                </q-card-section>
              </q-card>
            </div>
            
            <div class="col-12 q-mt-md">
              <div class="text-caption text-grey-8 text-weight-bold q-mb-sm">DESGLOSE POR ESTADOS:</div>
              <q-list separator bordered class="rounded-borders">
                <q-item v-for="st in statsDesglose" :key="st.key" class="q-py-sm">
                  <q-item-section avatar>
                    <q-icon :name="st.icon" :color="st.color" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ st.label }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge :color="st.color" text-color="white" class="text-weight-bold q-px-md">{{ st.count }}</q-badge>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Main Table -->
    <q-card class="table-card" flat bordered>
      <q-table
        :rows="examenesFiltrados"
        :columns="columns"
        row-key="id"
        flat
        :pagination="{ rowsPerPage: 10 }"
        class="main-table"
      >
        <!-- Materia / Carrera / Grupo -->
        <template v-slot:body-cell-materia="props">
          <q-td :props="props">
            <div class="flex items-center no-wrap">
              <q-chip :color="props.row.color_materia || 'blue-8'" text-color="white" size="xs" dense class="q-mr-sm">
                {{ props.row.codigo }}
              </q-chip>
              <div>
                <div class="text-weight-bold">{{ props.row.materia }}</div>
                <div class="text-caption text-grey-6">{{ props.row.carrera }} - G. {{ props.row.grupo }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Docente -->
        <template v-slot:body-cell-docente="props">
          <q-td :props="props">
            <div class="text-weight-medium text-uppercase text-grey-9 text-caption">{{ props.row.docente }}</div>
          </q-td>
        </template>

        <!-- Parcial -->
        <template v-slot:body-cell-parcial="props">
          <q-td :props="props" align="center">
            <q-chip :color="getParcialColor(props.row.parcial)" text-color="white" size="sm" dense>
              {{ props.row.parcial }}
            </q-chip>
          </q-td>
        </template>

        <!-- Fecha / Hora -->
        <template v-slot:body-cell-fecha="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-icon name="calendar_today" color="grey-6" size="14px" class="q-mr-xs" />
              <div class="text-weight-bold text-grey-9">{{ formatFriendlyDate(props.row.fecha_examen) }}</div>
            </div>
            <div class="row items-center no-wrap q-mt-xs">
              <q-icon name="schedule" color="deep-purple-4" size="14px" class="q-mr-xs" />
              <div class="text-caption text-weight-medium text-deep-purple-7">{{ props.row.hora }}</div>
            </div>
          </q-td>
        </template>

        <!-- Preguntas (Progress Bar) -->
        <template v-slot:body-cell-preguntas="props">
          <q-td :props="props">
            <div class="preguntas-cell">
              <div class="flex justify-between items-center q-mb-xs">
                <span class="text-weight-bold">{{ props.row.total_preguntas }}</span>
                <span class="text-caption text-grey-6">{{ props.row.distribucion.facil }}F / {{ props.row.distribucion.medio }}M / {{ props.row.distribucion.dificil }}D</span>
              </div>
              <div class="distribution-bar">
                <div class="bar-segment facile" :style="{ width: (props.row.distribucion.facil / (props.row.total_preguntas || 1) * 100) + '%' }"><q-tooltip>Fáciles: {{ props.row.distribucion.facil }}</q-tooltip></div>
                <div class="bar-segment medio" :style="{ width: (props.row.distribucion.medio / (props.row.total_preguntas || 1) * 100) + '%' }"><q-tooltip>Medios: {{ props.row.distribucion.medio }}</q-tooltip></div>
                <div class="bar-segment dificil" :style="{ width: (props.row.distribucion.dificil / (props.row.total_preguntas || 1) * 100) + '%' }"><q-tooltip>Difíciles: {{ props.row.distribucion.dificil }}</q-tooltip></div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Estado -->
        <template v-slot:body-cell-estado="props">
          <q-td :props="props" align="center">
            <q-chip
              :color="getEstadoEstilo(props.row.estado).color"
              :text-color="getEstadoEstilo(props.row.estado).textColor"
              size="sm"
              icon="circle"
              class="text-weight-bold"
            >
              {{ props.row.estado.toUpperCase() }}
            </q-chip>
            <div class="progreso-bullets q-mt-xs justify-center">
              <div v-for="(st, i) in ESTADOS_FLOW" :key="i" class="bullet-dot" :class="{ 'active': isEstadoActive(props.row.estado, st.key), 'completed': isEstadoCompleted(props.row.estado, st.key) }">
                <q-tooltip v-if="props.row.timestamps[st.key]">
                  {{ st.label }}: {{ formatTimestamp(props.row.timestamps[st.key]) }}
                </q-tooltip>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Documentos (Examenes + Patrones) -->
        <template v-slot:body-cell-documentos="props">
          <q-td :props="props" align="center">
            <div class="flex items-center justify-center gap-1">
              <!-- Variantes generadas -->
              <template v-if="props.row.variantes && props.row.variantes.length > 0">
                <q-btn flat round dense color="red-8" icon="picture_as_pdf" size="sm" v-for="v in props.row.variantes" :key="v">
                  <q-tooltip>Examen Variante {{ v }}</q-tooltip>
                </q-btn>
              </template>
              <div v-else class="text-caption text-grey-4">Sin variantes</div>
              
              <q-separator vertical class="q-mx-xs" v-if="props.row.patrones && props.row.patrones.length > 0" />
              
              <!-- Patrones generados -->
              <template v-if="props.row.patrones && props.row.patrones.length > 0">
                <q-btn flat round dense color="teal-7" icon="quiz" size="sm" v-for="p in props.row.patrones" :key="p">
                  <q-tooltip>Patrón de Respuestas {{ p }}</q-tooltip>
                </q-btn>
              </template>
            </div>
          </q-td>
        </template>

        <!-- Acciones -->
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" align="center">
            <div class="acciones-row justify-center no-wrap">
              <q-btn flat round dense color="primary" icon="visibility" size="sm" @click="verDetalles(props.row)">
                <q-tooltip>Ver detalles</q-tooltip>
              </q-btn>
              
              <!-- Botón Dinámico Llamativo -->
              <template v-if="tieneGestion(props.row.estado)">
                <q-btn 
                  unelevated 
                  dense 
                  color="deep-purple" 
                  :icon="props.row.estado === 'programados' ? 'auto_awesome' : 'settings'" 
                  label="GESTIONAR"
                  no-caps
                  class="action-btn-main shadow-2"
                  @click="gestionarEstado(props.row)"
                />
              </template>
              <template v-else-if="props.row.estado !== 'subidos'">
                <q-btn 
                  unelevated 
                  dense 
                  color="teal" 
                  icon="arrow_forward" 
                  label="PASAR ETAPA"
                  no-caps
                  class="action-btn-main shadow-2"
                  @click="avanzarDirecto(props.row)"
                />
              </template>
              <template v-else>
                <q-btn flat dense icon="check_circle" color="green-8" label="Subido" disable no-caps />
              </template>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- UI Modal: Gestión Especializada -->
    <q-dialog v-model="dialogGestion.show" backdrop-filter="blur(4px)">
      <q-card style="width: 700px; max-width: 90vw; border-radius: 20px;">
        <q-card-section class="bg-deep-purple text-white q-pa-lg">
          <div class="row items-center no-wrap justify-between">
            <div class="flex items-center no-wrap">
              <q-icon :name="configGestion.icon" size="32px" class="q-mr-md" />
              <div>
                <div class="text-h6 text-weight-bold">{{ configGestion.titulo }}</div>
                <div class="text-subtitle2">{{ dialogGestion.examen?.materia }} - Grupo {{ dialogGestion.examen?.grupo }}</div>
              </div>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-xl">
          <!-- CASO 1: PROGRAMADOS (Generación) -->
          <div v-if="dialogGestion.examen?.estado === 'programados'" class="config-generacion">
            <div class="text-subtitle1 text-weight-bold q-mb-md flex items-center">
              <q-icon name="tune" color="primary" class="q-mr-xs" />
              Parámetros de Generación
            </div>
            
            <div class="q-mb-md">
              <q-input 
                v-model.number="tempConfig.cantVariantes" 
                outlined label="Cantidad de Variantes (Max 5)" 
                type="number" min="1" max="5" 
                hint="Se generarán archivos PDF por cada variante"
                bg-color="grey-1"
              >
                <template v-slot:prepend><q-icon name="filter_none" /></template>
              </q-input>
            </div>

            <div class="row q-col-gutter-sm q-mt-sm">
              <div class="col-4">
                <q-input v-model.number="tempConfig.facil" outlined label="Fáciles" type="number" dense color="green" stack-label>
                   <template v-slot:append>
                    <div class="text-caption text-grey-6">/ {{ bancoStats.facil }}</div>
                  </template>
                </q-input>
              </div>
              <div class="col-4">
                <q-input v-model.number="tempConfig.medio" outlined label="Medios" type="number" dense color="orange" stack-label>
                   <template v-slot:append>
                    <div class="text-caption text-grey-6">/ {{ bancoStats.medio }}</div>
                  </template>
                </q-input>
              </div>
              <div class="col-4">
                <q-input v-model.number="tempConfig.dificil" outlined label="Difíciles" type="number" dense color="red" stack-label>
                   <template v-slot:append>
                    <div class="text-caption text-grey-6">/ {{ bancoStats.dificil }}</div>
                  </template>
                </q-input>
              </div>
            </div>
            
            <div class="total-badge q-mt-sm row justify-end">
              <q-chip label outline color="primary" class="text-weight-bold">
                TOTAL PREGUNTAS: {{ tempConfig.facil + tempConfig.medio + tempConfig.dificil }}
              </q-chip>
            </div>
            
            <q-banner class="bg-blue-1 text-blue-9 q-mt-lg rounded-borders row items-center" dense>
              <template v-slot:avatar><q-icon name="verified" /></template>
              Regla aplicada desde nivel: 
              <strong class="text-uppercase q-ml-xs">{{ configOrigenActual }}</strong>
              <span class="q-ml-sm" v-if="configOrigenActual !== 'nacional'">( {{ dialogGestion.examen?.sede }} {{ configOrigenActual === 'carrera' ? '> ' + dialogGestion.examen?.carrera : '' }} )</span>
            </q-banner>
            
            <div class="q-mt-lg text-caption text-grey-6 items-center flex">
              <q-avatar size="24px" color="primary" text-color="white" class="q-mr-xs">{{ authStore.usuarioActual?.nombre?.charAt(0) || 'A' }}</q-avatar>
              El usuario <strong>{{ authStore.usuarioActual?.nombre || 'Administrador' }}</strong> será registrado como el generador.
            </div>
          </div>

          <!-- CASO 2: DEVUELTOS (Patrones) -->
          <div v-else-if="dialogGestion.examen?.estado === 'devueltos'" class="config-patrones">
            <q-banner class="bg-orange-1 text-orange-9 rounded-borders q-mb-xl">
              <template v-slot:avatar><q-icon name="warning" color="orange" size="32px" /></template>
              <div class="text-h6 text-weight-bold">¿Generar Patrones de Respuestas?</div>
              Esta acción creará las plantillas de corrección oficial para las variantes 
              <strong>{{ dialogGestion.examen?.variantes.join(', ') }}</strong>.
            </q-banner>
            
            <div class="text-center q-pa-lg">
              <q-icon name="fact_check" size="120px" color="orange-2" class="q-mb-md" />
              <p class="text-grey-7">Se requiere esta acción para que los docentes puedan proceder con la revisión de exámenes.</p>
            </div>
          </div>

          <!-- CASO GENERAL (Si existiera) -->
          <div v-else class="text-center q-pa-xl">
             <q-icon :name="configGestion.icon" size="64px" color="grey-4" class="q-mb-md" />
             <p class="text-body1 text-grey-7">{{ configGestion.descripcion }}</p>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup no-caps />
          <q-btn 
            unelevated 
            rounded 
            color="deep-purple-7" 
            :label="configGestion.actionLabel" 
            :icon="configGestion.actionIcon" 
            @click="ejecutarAccionGestion"
            no-caps
            class="q-px-lg shadow-3"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar, date } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore, ROLES } from 'src/stores/auth'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const $q = useQuasar()
const authStore = useAuthStore()

// ESTADOS DEL PROCESO
const ESTADOS_FLOW = [
  { key: 'programados', label: 'Programado', icon: 'event_note', color: 'blue-7', action: 'GENERAR', hasGestion: true, desc: 'Definir variantes y cantidad de preguntas' },
  { key: 'generados', label: 'Generado', icon: 'auto_awesome', color: 'indigo-7', action: 'IMPRIMIR', hasGestion: false, desc: 'Exámenes generados listos para impresión' },
  { key: 'impresos', label: 'Impreso', icon: 'print', color: 'green-7', action: 'ENTREGAR', hasGestion: false, desc: 'Material impreso para recojo' },
  { key: 'entregados', label: 'Entregado', icon: 'inventory_2', color: 'orange-8', action: 'GESTIONAR', hasGestion: true, desc: 'En aula (generar patrones para devolución)' },
  { key: 'devueltos', label: 'Devuelto', icon: 'assignment_returned', color: 'teal-7', action: 'REVISAR', hasGestion: false, desc: 'Exámenes y patrones devueltos por el docente' },
  { key: 'revisados', label: 'Revisado', icon: 'fact_check', color: 'deep-purple-7', action: 'SUBIR NOTAS', hasGestion: false, desc: 'Revisión técnica completada' },
  { key: 'subidos', label: 'Subido', icon: 'cloud_done', color: 'purple-9', action: 'FINALIZADO', hasGestion: false, desc: 'Notas subidas al sistema académico' }
]

const filtros = ref({
  sede: null,
  carrera: null,
  parcial: '1er Parcial',
  fecha: date.formatDate(Date.now(), 'YYYY-MM-DD'),
  estado: null
})

const sedesOptions = ref([])
const carrerasOptions = ref([])
const parcialesOptions = ['1er Parcial', '2do Parcial', 'Final', '2da Instancia']
const loadingOptions = ref({ sedes: false, carreras: false })

const esSedeRestringida = computed(() => {
  return authStore.rol === ROLES.EVALUACIONES || authStore.alcance === 'sede'
})

const fetchSedes = async () => {
  loadingOptions.value.sedes = true
  try {
    const response = await api.get('/sedes')
    const rawSedes = response.data.data || []
    sedesOptions.value = rawSedes.map(s => ({ label: s.nombre, value: s.id }))
    
    // Si es restringido, pre-seleccionar su sede
    if (esSedeRestringida.value && authStore.sedeId) {
      const sedeUsuario = sedesOptions.value.find(s => s.value === authStore.sedeId)
      if (sedeUsuario) {
        filtros.value.sede = sedeUsuario
      }
    }
  } catch (error) {
    console.error('Error sedes:', error)
  } finally {
    loadingOptions.value.sedes = false
  }
}

const fetchCarreras = async (sedeId) => {
  if (!sedeId) {
    carrerasOptions.value = []
    return
  }
  loadingOptions.value.carreras = true
  try {
    const response = await api.get(`/sedes/${sedeId}/carreras`)
    carrerasOptions.value = response.data.map(c => ({ label: c.nombre, value: c.id }))
  } catch (error) {
    console.error('Error carreras:', error)
  } finally {
    loadingOptions.value.carreras = false
  }
}

watch(() => filtros.value.sede, (newSede) => {
  filtros.value.carrera = null
  if (newSede) {
    fetchCarreras(newSede.value)
  } else {
    carrerasOptions.value = []
  }
})

onMounted(() => {
  fetchSedes()
})

const dialogGestion = ref({
  show: false,
  examen: null
})

const dialogStats = ref(false)

const tempConfig = ref({
  cantVariantes: 1,
  facil: 10,
  medio: 10,
  dificil: 5
})

const bancoStats = ref({ facil: 0, medio: 0, dificil: 0, total: 0 })
const configOrigenActual = ref('nacional')

const examenesList = ref([])

const cargarDatos = async () => {
  if (!filtros.value.sede) return
  
  $q.loading.show({ message: 'Cargando evaluaciones...' })
  try {
    const params = {
      gestion: '2026-I', // Podría ser dinámico si existe un selector de gestión
      sede_id: filtros.value.sede.value,
      fecha: filtros.value.fecha
    }
    
    if (filtros.value.carrera) {
      params.carrera_id = filtros.value.carrera.value
    }

    const response = await api.get('/rol-examenes', { params })
    
    // Transformar datos del backend al formato del componente
    examenesList.value = response.data.data.map(e => ({
      ...e,
      id: e.id,
      codigo: e.materia_codigo,
      materia: e.materia_nombre,
      carrera: e.carrera?.nombre || 'Carrera',
      sede: e.sede?.nombre || 'Sede',
      grupo: e.grupo || '-',
      docente: e.docente_nombre || 'POR ASIGNAR', // Ajustar si viene del join
      parcial: e.tipo_examen,
      fecha_examen: e.fecha,
      hora: e.hora_inicio?.substring(0, 5) || '00:00',
      total_preguntas: e.config_generacion?.total || 0,
      distribucion: e.config_generacion || { facil: 0, medio: 0, dificil: 0 },
      estado: e.estado || 'programados',
      variantes: e.variantes || [],
      patrones: e.patrones || [],
      timestamps: e.timestamps_proceso || { programados: e.created_at },
      color_materia: 'blue-8'
    }))
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar las evaluaciones' })
  } finally {
    $q.loading.hide()
  }
}

// Observadores para recarga automática
watch([() => filtros.value.sede, () => filtros.value.carrera, () => filtros.value.fecha], () => {
  cargarDatos()
})

const estadosOptions = ESTADOS_FLOW.map(e => ({ label: e.label, value: e.key }))

const columns = [
  { name: 'materia', label: 'MATERIA / GRUPO', field: 'materia', align: 'left', sortable: true },
  { name: 'docente', label: 'DOCENTE', field: 'docente', align: 'left', sortable: true },
  { name: 'parcial', label: 'PARCIAL', field: 'parcial', align: 'center' },
  { name: 'fecha', label: 'FECHA / HORA', field: row => row.fecha_examen + ' ' + row.hora, align: 'left', sortable: true },
  { name: 'preguntas', label: 'PREGUNTAS', align: 'left' },
  { name: 'estado', label: 'ESTADO', align: 'center' },
  { name: 'documentos', label: 'DOCUMENTOS', align: 'center' },
  { name: 'acciones', label: 'ACCIONES', align: 'center' }
]

const statsDesglose = computed(() => {
  return ESTADOS_FLOW.map(st => {
    const estilo = getEstadoEstilo(st.key)
    return {
      key: st.key,
      label: st.label,
      icon: st.icon,
      color: estilo.textColor.split('-')[0],
      count: examenesList.value.filter(e => e.estado === st.key).length
    }
  })
})

const examenesFiltrados = computed(() => {
  let list = [...examenesList.value]
  if (filtros.value.estado) list = list.filter(e => e.estado === filtros.value.estado)
  if (filtros.value.parcial) list = list.filter(e => e.parcial === filtros.value.parcial)
  
  return list.sort((a, b) => a.hora.localeCompare(b.hora))
})

// Función para imprimir PDF consolidada
function imprimirListaDiaria() {
  if (examenesFiltrados.value.length === 0) {
    $q.notify({ message: 'No hay evaluaciones para imprimir en la fecha seleccionada', color: 'orange' })
    return
  }
  // ... (mismo código jsPDF pero usando examenesFiltrados del backend)
  const doc = jsPDF({ orientation: 'landscape' })
  const fecha = filtros.value.fecha || 'Sin fecha'
  const sedeObj = filtros.value.sede
  const sedeName = sedeObj ? (typeof sedeObj === 'string' ? sedeObj : sedeObj.label) : 'Todas las Sedes'
  
  doc.setFillColor(45, 23, 102); doc.rect(0, 0, 300, 20, 'F')
  doc.setTextColor(255, 255, 255); doc.setFontSize(14)
  doc.text('REPORTE DIARIO DE SEGUIMIENTO DE EVALUACIONES (CONTROL DE RECEPCIÓN)', 14, 13)
  
  doc.setTextColor(0, 0, 0); doc.setFontSize(10); doc.setFont('helvetica', 'bold')
  doc.text(`CAMPUS: ${sedeName.toUpperCase()}`, 14, 30); doc.text(`FECHA: ${fecha}`, 120, 30)
  doc.text(`PARCIAL: ${filtros.value.parcial || 'TODOS'}`, 210, 30)
  
  const tableData = examenesFiltrados.value.map(e => [e.hora, `${e.materia}\n(G: ${e.grupo})`, e.docente, '', '', '', '', '', ''])
  doc.autoTable({
    startY: 38, head: [['HORA', 'MATERIA / GRUPO', 'DOCENTE', 'H. RECOJO', 'CANT.', 'FIRMA', 'H. DEV.', 'CANT.', 'FIRMA']],
    body: tableData, theme: 'grid', headStyles: { fillColor: [45, 23, 102], fontSize: 8 }, styles: { fontSize: 7 }
  })
  doc.save(`Seguimiento_Evaluaciones_${fecha}.pdf`)
}

const configGestion = computed(() => {
  const estado = dialogGestion.value.examen?.estado
  if (estado === 'programados') return { titulo: 'Parametrización de Generación', icon: 'settings_suggest', actionLabel: 'Generar Variantes Ahora', actionIcon: 'auto_awesome' }
  if (estado === 'entregados') return { titulo: 'Recepción y Generación de Patrones', icon: 'fact_check', actionLabel: 'Generar Patrones y Devolver', actionIcon: 'done_all' }
  return { titulo: 'Avance de Etapa', icon: 'arrow_forward', actionLabel: 'Confirmar Avance', actionIcon: 'check', descripcion: '¿Deseas pasar este examen a la siguiente etapa del proceso?' }
})

const gestionarEstado = async (examen) => {
  dialogGestion.value.examen = examen
  if (examen.estado === 'programados') {
    // Valores por defecto iniciales (fallback hard)
    tempConfig.value = { 
      cantVariantes: examen.variantes.length || 1, 
      facil: examen.distribucion.facil || 10, 
      medio: examen.distribucion.medio || 10, 
      dificil: examen.distribucion.dificil || 5 
    }

    // Intentar cargar configuración efectiva del backend
    try {
      const { data } = await api.get('/evaluaciones/config', {
        params: { 
          nivel: 'carrera', 
          sede_id: examen.sede_id, 
          carrera_id: examen.carrera_id 
        }
      })
      if (data.success && data.configuracion) {
        configOrigenActual.value = data.nivel_hallado || 'nacional'
        // Buscar el parcial correspondiente en la configuración
        const partialKey = examen.tipo_examen || examen.parcial
        const confParcial = data.configuracion.parciales.find(p => 
          p.nombre.toLowerCase().includes('1') && partialKey.toLowerCase().includes('1') ||
          p.nombre.toLowerCase().includes('2') && partialKey.toLowerCase().includes('2') ||
          p.nombre.toLowerCase().includes('final') && partialKey.toLowerCase().includes('final') ||
          p.nombre.toLowerCase().includes('instancia') && partialKey.toLowerCase().includes('instancia')
        )

        if (confParcial && (!examen.distribucion || examen.distribucion.total === 0)) {
          tempConfig.value.facil = confParcial.distribucion.facil
          tempConfig.value.medio = confParcial.distribucion.medio
          tempConfig.value.dificil = confParcial.distribucion.dificil
        }
      }
    } catch (err) {
      console.error('Error cargando config efectiva:', err)
    }

    // Cargar estadísticas del banco de preguntas
    try {
      const { data } = await api.get('/banco-preguntas/stats', {
        params: {
          asignatura_id: examen.asignatura_id,
          docente_id: examen.docente_id,
          sede_id: examen.sede_id
        }
      })
      if (data.success) {
        bancoStats.value = data.stats
      }
    } catch (err) {
      console.error('Error cargando estadísticas del banco:', err)
    }
  }
  dialogGestion.value.show = true
}

const ejecutarAccionGestion = async () => {
  const examen = dialogGestion.value.examen
  const currentIndex = ESTADOS_FLOW.findIndex(e => e.key === examen.estado)
  const nextKey = ESTADOS_FLOW[currentIndex + 1].key
  
  $q.dialog({
    title: 'Confirmar Acción',
    message: `¿Deseas procesar y pasar al estado: ${nextKey.toUpperCase()}?`,
    ok: { label: 'Sí, Procesar', color: 'deep-purple', unelevated: true },
    cancel: { label: 'Cancelar', flat: true },
    persistent: true
  }).onOk(async () => {
    try {
      const payload = { estado: nextKey }
      const ts = { ...examen.timestamps, [nextKey]: new Date().toISOString() }
      payload.timestamps_proceso = ts

      if (examen.estado === 'programados') {
        const v = ['A', 'B', 'C', 'D', 'E'].slice(0, tempConfig.value.cantVariantes)
        payload.variantes = v
        payload.config_generacion = { 
          facil: tempConfig.value.facil, medio: tempConfig.value.medio, dificil: tempConfig.value.dificil,
          total: tempConfig.value.facil + tempConfig.value.medio + tempConfig.value.dificil
        }
      }

      if (examen.estado === 'entregados') {
        payload.patrones = [...examen.variantes]
      }

      await api.put(`/rol-examenes/${examen.id}`, payload)
      $q.notify({ type: 'positive', message: 'Procesado correctamente' })
      dialogGestion.value.show = false
      cargarDatos()
    } catch (error) {
       console.error('Error al actualizar el estado:', error)
       $q.notify({ type: 'negative', message: 'Error al actualizar el estado' })
    }
  })
}

const avanzarDirecto = (examen) => {
  const currentIndex = ESTADOS_FLOW.findIndex(e => e.key === examen.estado)
  const nextKey = ESTADOS_FLOW[currentIndex + 1].key
  
  $q.dialog({
    title: 'Avanzar Etapa',
    message: `¿Pasar a ${nextKey.toUpperCase()} directamente?`,
    ok: { label: 'Avanzar', color: 'teal', unelevated: true },
    cancel: true
  }).onOk(async () => {
    try {
      const ts = { ...examen.timestamps, [nextKey]: new Date().toISOString() }
      await api.put(`/rol-examenes/${examen.id}`, { estado: nextKey, timestamps_proceso: ts })
      $q.notify({ message: 'Etapa actualizada', color: 'positive' })
      cargarDatos()
    } catch (e) {
      console.error('Error de conexión al avanzar etapa:', e)
      $q.notify({ message: 'Error de conexión', color: 'negative' })
    }
  })
}

// Helpers
const formatFriendlyDate = (f) => {
  if (!f) return ''
  // Si viene con formato ISO o similar, tomamos solo la fecha (YYYY-MM-DD)
  const dateStr = f.substring(0, 10)
  const parts = dateStr.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return f
}
const getParcialColor = (parcial) => {
  if (!parcial) return 'grey-7'
  if (parcial.includes('1er') || parcial.includes('1°')) return 'blue-7'
  if (parcial.includes('2do') || parcial.includes('2°')) return 'orange-8'
  return 'purple-7'
}
const getEstadoEstilo = (estado) => {
  const map = { programados: { color: 'blue-1', textColor: 'blue-9' }, generados: { color: 'purple-1', textColor: 'purple-9' }, impresos: { color: 'cyan-1', textColor: 'cyan-9' }, entregados: { color: 'indigo-1', textColor: 'indigo-9' }, devueltos: { color: 'orange-1', textColor: 'orange-9' }, revisados: { color: 'green-1', textColor: 'green-9' }, subidos: { color: 'teal-1', textColor: 'teal-9' } }
  return map[estado] || { color: 'grey-2', textColor: 'grey-8' }
}
const isEstadoActive = (curr, target) => curr === target
const isEstadoCompleted = (curr, target) => ESTADOS_FLOW.findIndex(e => e.key === target) < ESTADOS_FLOW.findIndex(e => e.key === curr)
const tieneGestion = (e) => ['programados', 'entregados'].includes(e)
const formatTimestamp = (ts) => ts ? new Date(ts).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''
const limpiarFiltros = () => {
  const sDefault = esSedeRestringida.value ? filtros.value.sede : null
  filtros.value = { sede: sDefault, carrera: null, parcial: '1° Parcial', estado: null, fecha: date.formatDate(Date.now(), 'YYYY-MM-DD') }
}
const verDetalles = (ex) => $q.notify({ message: `Materia: ${ex.materia}`, icon: 'info' })

</script>

<style scoped>
.gestion-eval-page { padding: 40px; background-color: #f8fafc; min-height: 100vh; }
.page-title { color: #1e293b; letter-spacing: -0.025em; }
.stat-card { border-radius: 12px; border: 1px solid #e2e8f0; }
.icon-box { width: 52px; height: 52px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.table-card { border-radius: 16px; background: white; border: 1px solid #edf2f7; }
.main-table :deep(thead th) { font-weight: 700; color: #64748b; background: #f8fafc; padding: 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
.preguntas-cell { width: 140px; }
.distribution-bar { height: 6px; width: 100%; background: #e2e8f0; border-radius: 3px; display: flex; overflow: hidden; }
.bar-segment { height: 100%; transition: width 0.3s ease; }
.bar-segment.facile { background: #10b981; }
.bar-segment.medio { background: #f59e0b; }
.bar-segment.dificil { background: #ef4444; }
.progreso-bullets { display: flex; gap: 4px; }
.bullet-dot { width: 5px; height: 5px; border-radius: 50%; background: #e2e8f0; transition: all 0.3s ease; }
.bullet-dot.active { background: #6366f1; transform: scale(1.4); }
.bullet-dot.completed { background: #94a3b8; }
.action-btn-main { font-weight: 700; letter-spacing: 0.02em; font-size: 11px; padding: 4px 12px; border-radius: 8px; }
.action-btn-main:hover { transform: translateY(-1px); }
.total-badge .q-chip { height: 28px; }
</style>
