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
            <div class="flex items-center justify-center gap-1" v-if="props.row.estado !== 'programados'">
              <!-- Variantes generadas -->
              <template v-if="props.row.variantes && props.row.variantes.length > 0">
                <q-btn 
                  flat round dense 
                  color="red-8" 
                  icon="picture_as_pdf" 
                  size="sm" 
                  v-for="v in props.row.variantes" 
                  :key="v.letra || v"
                  type="a"
                  :href="getExamenUrl(v)"
                  target="_blank"
                >
                  <q-tooltip>Examen Variante {{ v.letra || v }}</q-tooltip>
                </q-btn>
              </template>
              <div v-else class="text-caption text-grey-4 text-xs">Sin variantes</div>
              
              <q-separator vertical class="q-mx-xs" v-if="props.row.patrones && props.row.patrones.length > 0" />
              
              <!-- Patrones generados -->
              <template v-if="props.row.patrones && props.row.patrones.length > 0">
                <div v-for="p in props.row.patrones" :key="p.letra" class="row no-wrap">
                  <q-btn flat round dense color="teal-7" icon="quiz" size="sm" type="a" :href="getPatronUrl(p, 'pdf')" target="_blank" v-if="p.pdf">
                    <q-tooltip>Patrón PDF {{ p.letra }}</q-tooltip>
                  </q-btn>
                  <q-btn flat round dense color="green-8" icon="description" size="sm" type="a" :href="getPatronUrl(p, 'xlsx')" target="_blank" v-if="p.xlsx">
                    <q-tooltip>Patrón Remark {{ p.letra }}</q-tooltip>
                  </q-btn>
                </div>
              </template>
            </div>
            <div v-else class="text-caption text-grey-4 text-xs">
              Esperando generación
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
              <div 
                class="q-pa-md rounded-borders q-mb-lg flex justify-between items-center bg-indigo-50 border-indigo-200 shadow-1"
                v-if="bancoStats.total > 0"
              >
                <div class="flex items-center text-indigo-9">
                  <q-icon name="help_center" size="24px" class="q-mr-md" />
                  <div class="column">
                    <span class="text-weight-bold">Banco Disponible para esta Evaluación</span>
                    <span class="text-caption">Se encontraron preguntas que coinciden con el Parcial y Grupo.</span>
                  </div>
                </div>
                <div class="text-h4 text-indigo-7 text-weight-bolder">
                  {{ bancoStats.total }}
                </div>
              </div>

              <q-banner v-if="bancoStats.total === 0 && (bancoTotalAsignatura || 0) > 0" class="bg-amber-1 text-amber-9 rounded-borders q-mb-lg border-amber" dense bordered>
                <template v-slot:avatar><q-icon name="warning" color="amber-9" size="32px" /></template>
                <div class="text-weight-bold">Aviso de Disponibilidad:</div>
                No hay preguntas para este <b>Grupo o Parcial</b>, pero tienes <b>{{ bancoTotalAsignatura }}</b> preguntas en total en la asignatura. 
                Verifica que el Grupo en el Excel coincida con el del Rol de Examen.
              </q-banner>
            <div class="text-subtitle1 text-weight-bold q-mb-md flex items-center">
              <q-icon name="tune" color="primary" class="q-mr-xs" />
              Parámetros de Generación
            </div>
            
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-md-8">
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
              <div class="col-12 col-md-4">
                <q-select
                  v-model="tempConfig.formatoHoja"
                  :options="optionsHoja"
                  outlined
                  label="Tamaño Hoja"
                  bg-color="blue-50"
                  input-class="text-weight-bold"
                >
                  <template v-slot:prepend><q-icon name="description" color="primary" /></template>
                </q-select>
              </div>
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
            
            <div class="total-badge q-mt-sm row justify-end items-center q-gutter-x-sm">
              <q-chip v-if="!bancoSuficiente" dense color="red-1" text-color="red-7" icon="error_outline" label="Banco Insuficiente" class="text-weight-bold" />
              <q-chip label outline :color="bancoSuficiente ? 'primary' : 'red'" class="text-weight-bold">
                TOTAL PREGUNTAS: {{ tempConfig.facil + tempConfig.medio + tempConfig.dificil }}
              </q-chip>
            </div>
            
            <q-banner class="bg-blue-1 text-blue-9 q-mt-lg rounded-borders row items-center" dense>
              <template v-slot:avatar><q-icon name="verified" /></template>
              Regla aplicada desde nivel: 
              <strong class="text-uppercase q-ml-xs">{{ configOrigenActual }}</strong>
              <span class="q-ml-sm" v-if="configOrigenActual !== 'nacional'">( {{ dialogGestion.examen?.sede }} {{ configOrigenActual === 'carrera' ? '> ' + dialogGestion.examen?.carrera : '' }} )</span>
            </q-banner>

            <q-banner v-if="!bancoSuficiente" class="bg-red-1 text-red-9 q-mt-sm rounded-borders" dense>
              <template v-slot:avatar><q-icon name="warning" color="red" /></template>
              No existen suficientes preguntas en el banco para cumplir con la distribución solicitada.
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
            :disable="!bancoSuficiente"
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
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

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

const shuffle = (array) => {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

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
const optionsHoja = ['Oficio (8.5" x 13")', 'Carta', 'Oficio']
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
    const currentSedeId = authStore.usuarioActual?.sede_id
    if (esSedeRestringida.value && currentSedeId) {
      const sedeUsuario = sedesOptions.value.find(s => Number(s.value) === Number(currentSedeId))
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

const fetchCarreras = async (sedeId, campusId = null) => {
  if (!sedeId && !campusId) {
    carrerasOptions.value = []
    return
  }
  loadingOptions.value.carreras = true
  try {
    const url = campusId ? `/campus/${campusId}/carreras` : `/sedes/${sedeId}/carreras`
    const response = await api.get(url)
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
    const userSedeId = Number(authStore.usuarioActual?.sede_id)
    const selectedSedeId = Number(newSede.value)
    // Si la sede seleccionada es la del usuario y tiene campus_id, cargar por campus
    if (authStore.usuarioActual?.campus_id && selectedSedeId === userSedeId) {
       fetchCarreras(null, authStore.usuarioActual.campus_id)
    } else {
       fetchCarreras(selectedSedeId)
    }
  } else {
    carrerasOptions.value = []
  }
})

onMounted(async () => {
  // Asegurar que tenemos los últimos datos del usuario (con relaciones campus/sede)
  if (authStore.isAuthenticated) {
    await authStore.fetchUser()
  }
  await fetchSedes()
  cargarDatos()
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
  dificil: 5,
  formatoHoja: 'Oficio (8.5" x 13")'
})

const configOrigenActual = ref('nacional')
const bancoStats = ref({ facil: 0, medio: 0, dificil: 0, total: 0 })
const bancoTotalAsignatura = ref(0)

const bancoSuficiente = computed(() => {
  if (dialogGestion.value.examen?.estado !== 'programados') return true
  return (tempConfig.value.facil || 0) <= (bancoStats.value.facil || 0) &&
         (tempConfig.value.medio || 0) <= (bancoStats.value.medio || 0) &&
         (tempConfig.value.dificil || 0) <= (bancoStats.value.dificil || 0)
})

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
      materia: e.materia,
      carrera: e.carrera || 'Carrera',
      sede: e.sede || 'Sede',
      grupo: e.grupo || '-',
      docente: e.docente || 'POR ASIGNAR', 
      parcial: e.tipo_examen || e.parcial,
      fecha_examen: e.fecha,
      hora: e.hora_inicio?.substring(0, 5) || '00:00',
      total_preguntas: e.config_generacion?.total || 0,
      distribucion: e.config_generacion || { facil: 0, medio: 0, dificil: 0, total: 0 },
      estado: e.estado || 'programados',
      sede_id: e.sede_id,
      carrera_id: e.carrera_id,
      asignatura_id: e.asignatura_id,
      docente_id: e.docente_id,
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
  const doc = new jsPDF({ orientation: 'landscape' })
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
  autoTable(doc, {
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
      dificil: examen.distribucion.dificil || 5,
      formatoHoja: examen.distribucion.formatoHoja || 'Oficio (8.5" x 13")'
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

        // Solo sobreescribir si el examen NO tiene configuración guardada (todos en 0)
        const tieneConfigGuardada = examen.distribucion && (
          examen.distribucion.facil > 0 || 
          examen.distribucion.medio > 0 || 
          examen.distribucion.dificil > 0
        )

        if (confParcial && !tieneConfigGuardada) {
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
          sede_id: examen.sede_id,
          parcial: examen.tipo_examen || examen.parcial,
          grupo: examen.grupo
        }
      })
      if (data.success) {
        bancoStats.value = data.stats
        bancoTotalAsignatura.value = data.total_asignatura || 0
      }
    } catch (err) {
      console.error('Error cargando estadísticas del banco:', err)
    }
  }
  dialogGestion.value.show = true
}

const ejecutarAccionGestion = async () => {
  const examen = dialogGestion.value.examen
  if (!examen) return

  // Validación de disponibilidad en el banco (solo para generación de variantes)
  if (examen.estado === 'programados' && !bancoSuficiente.value) {
    $q.notify({
      type: 'negative',
      message: 'No hay suficientes preguntas en el banco para la distribución solicitada.',
      icon: 'warning'
    })
    return
  }

  const currentIndex = ESTADOS_FLOW.findIndex(e => e.key === examen.estado)
  const nextKey = ESTADOS_FLOW[currentIndex + 1].key
  
  const msg = nextKey === 'devueltos' 
    ? `¿Deseas procesar la generacion de patron(es) y pasar al estado: ${nextKey.toUpperCase()}?`
    : `¿Deseas procesar la generacion de examen(es) y pasar al estado: ${nextKey.toUpperCase()}?`
  
  $q.dialog({
    title: 'Confirmar Acción',
    message: msg,
    ok: { label: 'Sí, Procesar', color: 'deep-purple', unelevated: true },
    cancel: { label: 'Cancelar', flat: true },
    persistent: true
  }).onOk(async () => {
    try {
      const payload = { estado: nextKey }
      const ts = { ...examen.timestamps, [nextKey]: new Date().toISOString() }
      payload.timestamps_proceso = ts

      if (examen.estado === 'programados') {
        $q.loading.show({ message: 'Obteniendo banco de preguntas...' })
        let bancoPreguntas = []
        try {
          const resp = await api.get('/banco-preguntas', { 
            params: { 
              asignatura_id: examen.asignatura_id, 
              docente_id: examen.docente_id,
              grupoTeorico: examen.grupo,
              parcial: examen.parcial,
              all_docentes: true 
            } 
          })
          bancoPreguntas = resp.data.preguntas || resp.data
        } catch (err) {
          console.error('Error al obtener banco:', err)
          $q.notify({ type: 'negative', message: 'No se pudo obtener el banco de preguntas' })
          $q.loading.hide()
          return
        }
        $q.loading.hide()

        // Agrupar por dificultad
        const variantes = ['A', 'B', 'C', 'D', 'E'].slice(0, tempConfig.value.cantVariantes)
        payload.config_generacion = { 
          facil: tempConfig.value.facil, medio: tempConfig.value.medio, dificil: tempConfig.value.dificil,
          total: tempConfig.value.facil + tempConfig.value.medio + tempConfig.value.dificil,
          formatoHoja: tempConfig.value.formatoHoja
        }

        const todas = Array.isArray(bancoPreguntas) ? bancoPreguntas : (bancoPreguntas.preguntas || [])
        
        // 1. Identificar Grupos Macro (Headers PR/EM + sus Subpreguntas)
        const headers = todas.filter(p => ['PR', 'EM', 'PROBLEMA', 'EMPAREJAMIENTO'].includes(p.tipo?.toUpperCase()))
        const subpreguntas = todas.filter(p => ['SP', 'SUBPREGUNTA', 'SUBPROBLEMA'].includes(p.tipo?.toUpperCase()))
        
        const macroGrupos = headers.map(h => {
          return {
            header: h,
            // Las subpreguntas se vinculan por el campo 'grupo' (Referencia)
            children: subpreguntas.filter(sp => sp.grupo?.trim() === h.grupo?.trim() && h.grupo)
          }
        }).filter(mg => mg.children.length > 0) // Solo grupos con contenido

        // 2. Identificar Preguntas Individuales
        const individuales = todas.filter(p => 
          ['SELECCION_UNICA', 'SELECCION_MULTIPLE', 'FALSO_VERDADERO', 'SS', 'SM', 'FV'].includes(p.tipo?.toUpperCase())
        )

        for (const letra of variantes) {
          let seleccionadasFinal = []
          let totalPreguntasContadas = 0
          const meta = 30

          // A. Macro Grupos al inicio
          const poolGrupos = shuffle([...macroGrupos])
          for (const mg of poolGrupos) {
            if (totalPreguntasContadas + mg.children.length <= meta) {
              seleccionadasFinal.push(JSON.parse(JSON.stringify(mg.header))) 
              seleccionadasFinal.push(...JSON.parse(JSON.stringify(shuffle([...mg.children]))))
              totalPreguntasContadas += mg.children.length
            }
          }

          // B. Individuales
          const faltantes = meta - totalPreguntasContadas
          if (faltantes > 0) {
            const extras = shuffle([...individuales]).slice(0, faltantes)
            seleccionadasFinal.push(...JSON.parse(JSON.stringify(extras)))
            totalPreguntasContadas += extras.length
          }

          // C. MEZCLAR INCISOS (Excepto FV) y Sincronizar Respuesta Correcta
          seleccionadasFinal = seleccionadasFinal.map(p => {
            if (['FALSO_VERDADERO', 'FV'].includes(p.tipo?.toUpperCase()) || !p.opciones || p.opciones.length === 0) {
              return p
            }
            
            // 1. Identificar textos correctos originales
            const rCorrectasOrig = Array.isArray(p.respuesta_correcta) ? p.respuesta_correcta : [p.respuesta_correcta]
            const textosCorrectos = p.opciones
              .filter(o => rCorrectasOrig.includes(o.id))
              .map(o => o.text)

            // 2. Mezclar opciones
            const nuevasOpciones = shuffle([...p.opciones])
            
            // 3. Re-asignar IDs (A, B, C...) y encontrar nuevas correctas
            const abcd = 'ABCDEFGHIJ'.split('')
            let nuevasRCorrectas = []
            
            p.opciones = nuevasOpciones.map((o, idx) => {
              const newId = abcd[idx] || (idx + 1).toString()
              if (textosCorrectos.includes(o.text)) {
                nuevasRCorrectas.push(newId)
              }
              return { ...o, id: newId }
            })

            // 4. Actualizar respuesta_correcta (manteniendo el formato original string/array)
            p.respuesta_correcta = Array.isArray(p.respuesta_correcta) 
              ? nuevasRCorrectas 
              : (nuevasRCorrectas[0] || p.respuesta_correcta)

            return p
          })

          // D. ORDENAR PARA EVITAR DUPLICIDAD DE SECCIONES (Manteniendo MacroGrupos al inicio)
          // Grupos Macro (PR/EM) -> SU -> SM -> FV
          const ordenTipos = ['PROBLEMA', 'EMPAREJAMIENTO', 'SUBPROBLEMA', 'SELECCION_UNICA', 'SELECCION_MULTIPLE', 'FALSO_VERDADERO', 'SS', 'SM', 'FV']
          const sorted = [...seleccionadasFinal].sort((a, b) => {
            // Si son del mismo grupo macro, NO los separamos
            if (a.grupo && b.grupo && a.grupo === b.grupo) return 0 
            
            // Prioridad por tipo
            let ta = a.tipo?.toUpperCase().replace('PR', 'PROBLEMA').replace('EM', 'EMPAREJAMIENTO').replace('SP', 'SUBPROBLEMA')
            let tb = b.tipo?.toUpperCase().replace('PR', 'PROBLEMA').replace('EM', 'EMPAREJAMIENTO').replace('SP', 'SUBPROBLEMA')
            
            // Si uno es macro y el otro no, el macro va primero
            const isAMacro = ['PROBLEMA', 'EMPAREJAMIENTO'].includes(ta) || (a.tipo?.toUpperCase() === 'SUBPROBLEMA' && a.grupo)
            const isBMacro = ['PROBLEMA', 'EMPAREJAMIENTO'].includes(tb) || (b.tipo?.toUpperCase() === 'SUBPROBLEMA' && b.grupo)
            
            if (isAMacro && !isBMacro) return -1
            if (!isAMacro && isBMacro) return 1
            
            return ordenTipos.indexOf(ta) - ordenTipos.indexOf(tb)
          })

          const { blob, filename } = await generarExamenPDF(examen, tempConfig.value, letra, sorted)
          
          const formData = new FormData()
          formData.append('archivo', blob, filename)
          formData.append('variante', letra)
          formData.append('filename', filename)

          try {
            // 1. Subir EXAMEN PDF
            await api.post(`/rol-examenes/${examen.id}/upload-examen`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            })

            // 2. Generar y Subir PATRON PDF (usando el mismo orden 'sorted')
            const pPDF = await generarPatronPDF(examen, letra, sorted)
            const fPatronPDF = new FormData()
            fPatronPDF.append('archivo', pPDF.blob, pPDF.filename)
            fPatronPDF.append('variante', letra)
            fPatronPDF.append('tipo', 'pdf')
            fPatronPDF.append('filename', pPDF.filename)
            await api.post(`/rol-examenes/${examen.id}/upload-patron`, fPatronPDF)

            // 3. Generar y Subir PATRON XLSX (usando el mismo orden 'sorted')
            const pXLSX = generarPatronXLSX(examen, letra, sorted)
            const fPatronXLSX = new FormData()
            fPatronXLSX.append('archivo', pXLSX.blob, pXLSX.filename)
            fPatronXLSX.append('variante', letra)
            fPatronXLSX.append('tipo', 'xlsx')
            fPatronXLSX.append('filename', pXLSX.filename)
            await api.post(`/rol-examenes/${examen.id}/upload-patron`, fPatronXLSX)

          } catch (uploadErr) {
            console.error(`Error subiendo archivos variante ${letra}:`, uploadErr)
          }
        }
      }

      // La generación de patrones ahora ocurre en el estado 'programados'
      // para asegurar consistencia con las preguntas seleccionadas aleatoriamente.

      await api.put(`/rol-examenes/${examen.id}`, payload)
      
      $q.notify({ type: 'positive', message: 'Estado actualizado correctamente' })
      dialogGestion.value.show = false
      cargarDatos() // RECARGAR PARA VER CAMBIOS (PDFs/Patrones)
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

const getExamenUrl = (v) => {
  const filename = typeof v === 'string' ? null : v.archivo
  if (!filename) return 'javascript:void(0)'
  const baseUrl = api.defaults.baseURL.replace('/api', '')
  return `${baseUrl}/storage/examenes/${filename}`
}

const getPatronUrl = (p, tipo) => {
  const filename = typeof p === 'string' ? null : p[tipo]
  if (!filename) return 'javascript:void(0)'
  const baseUrl = api.defaults.baseURL.replace('/api', '')
  return `${baseUrl}/storage/patrones/${filename}`
}

const generarPatronPDF = async (examen, letra, preguntas = []) => {
  const doc = new jsPDF()
  const margin = 15
  const pageWidth = doc.internal.pageSize.getWidth()
  const PURPLE = [121, 40, 169]

  // Logo
  const logoUrl = `${api.defaults.baseURL}/banco-preguntas/logo-unitepc`
  let logoBase64 = null
  try {
     logoBase64 = await fetchImageAsBase64(logoUrl)
  } catch (e) {
    console.warn('No se pudo cargar el logo oficial para el patrón:', e)
  }

  // Header Design
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', margin, margin, 25, 20)
  }
  
  doc.setTextColor(PURPLE[0], PURPLE[1], PURPLE[2])
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('UNIVERSIDAD TÉCNICA PRIVADA COSMOS', pageWidth / 2, margin + 8, { align: 'center' })
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text(`Carrera: ${examen.carrera || ''}`, pageWidth / 2, margin + 14, { align: 'center' })
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.text('"TÚ ESTÁS AQUÍ PORQUE FORMAS PARTE DE NUESTRA HISTORIA"', pageWidth / 2, margin + 19, { align: 'center' })
  
  doc.setDrawColor(PURPLE[0], PURPLE[1], PURPLE[2])
  doc.setLineWidth(0.8)
  doc.line(margin, margin + 22, pageWidth - margin, margin + 22)
  
  // Info Section
  let currentY = margin + 30
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('PATRÓN', margin + 35, currentY + 5)

  // Exam Variant Bubbles (Top Right)
  const drawVariantBubbles = (x, y, activeLetra) => {
    const letters = ['A', 'B', 'C', 'D', 'E']
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('TIPO DE EXAMEN', x + 15, y - 5, { align: 'center' })
    letters.forEach((l, idx) => {
      const bx = x + (idx * 7)
      const isSelected = l === activeLetra
      doc.setLineWidth(0.2)
      doc.setDrawColor(0, 0, 0)
      if (isSelected) {
        doc.setFillColor(0, 0, 0)
        doc.circle(bx, y, 2.5, 'FD')
        doc.setTextColor(255, 255, 255)
      } else {
        doc.circle(bx, y, 2.5, 'S')
        doc.setTextColor(0, 0, 0)
      }
      doc.text(l, bx, y + 0.8, { align: 'center', baseline: 'middle' })
    })
    doc.setTextColor(0, 0, 0)
  }
  drawVariantBubbles(pageWidth - margin - 35, currentY + 5, letra)

  // Signature Box
  doc.setLineWidth(0.2)
  doc.setDrawColor(180, 180, 180)
  doc.rect(pageWidth - margin - 50, currentY + 15, 50, 20)
  doc.setFontSize(7)
  doc.text('FIRMA DOCENTE Y SELLO', pageWidth - margin - 25, currentY + 32, { align: 'center' })

  // Meta Fields
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  const fields = [
    { k: 'Materia:', v: examen.materia },
    { k: 'Docente:', v: examen.docente },
    { k: 'Examen:', v: examen.parcial },
    { k: 'Grupo:', v: `Grupo ${examen.grupo || ''}` }
  ]
  fields.forEach((f, idx) => {
    const fy = currentY + 15 + (idx * 6)
    doc.text(f.k, margin, fy)
    doc.setFont('helvetica', 'normal')
    doc.text(f.v || '', margin + 20, fy)
    doc.setFont('helvetica', 'bold')
  })
  
  doc.text('FECHA:', pageWidth - margin - 45, currentY + 21)
  doc.setFont('helvetica', 'normal')
  const fechaStr = examen.fecha_examen ? new Date(examen.fecha_examen).toISOString().split('T')[0] : '-'
  doc.text(fechaStr, pageWidth - margin - 30, currentY + 21)

  doc.setLineWidth(0.2)
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, currentY + 42, pageWidth - margin, currentY + 42)

  // OMR GRID
  currentY += 55
  const colWidth = (pageWidth - 2 * margin) / 4
  const startYGrid = currentY
  
  const drawOMRLine = (qNum, answer, x, y) => {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(`${qNum}`, x, y + 1, { baseline: 'middle' })
    
    const options = ['A', 'B', 'C', 'D', 'E']
    options.forEach((opt, idx) => {
      const bx = x + 8 + (idx * 7)
      const isCorrect = answer && answer.toUpperCase().includes(opt)
      
      doc.setLineWidth(0.1)
      doc.setDrawColor(100, 100, 100)
      if (isCorrect) {
        doc.setFillColor(50, 50, 50)
        doc.circle(bx, y, 2.2, 'FD')
        doc.setTextColor(255, 255, 255)
      } else {
        doc.circle(bx, y, 2.2, 'S')
        doc.setTextColor(100, 100, 100)
      }
      doc.setFontSize(6)
      doc.text(opt, bx, y + 0.8, { align: 'center', baseline: 'middle' })
    })
    doc.setTextColor(0, 0, 0)
  }

  // Mapping Answers - FORZAR 100 FILAS (siempre mostrar 100 burbujas)
  const preguntasReales = preguntas.filter(p => !['PR', 'EM', 'PROBLEMA', 'EMPAREJAMIENTO'].includes(p.tipo?.toUpperCase()))
  const totalFilas = 100
  const qPerCol = 25
  
  for (let i = 0; i < totalFilas; i++) {
    const p = preguntasReales[i] || null
    const colIndex = Math.floor(i / qPerCol)
    const rowIndex = i % qPerCol
    
    const x = margin + (colIndex * colWidth)
    const y = startYGrid + (rowIndex * 7)
    
    // Normalize answer
    let ans = ''
    if (p) {
       ans = String(p.respuesta_correcta || '').replace(/["']/g, '')
       const tipo = p.tipo?.toUpperCase()
       if (['FALSO_VERDADERO', 'FV'].includes(tipo)) {
          const lower = ans.toLowerCase()
          if (lower === 'true' || lower === 'verdadero' || lower === 'v') ans = 'A'
          if (lower === 'false' || lower === 'falso' || lower === 'f') ans = 'B'
       }
    }

    drawOMRLine(i + 1, ans, x, y)
    
    // Bottom line deco
    doc.setDrawColor(230, 230, 230)
    doc.setLineWidth(0.1)
    doc.line(x, y + 3.5, x + colWidth - 5, y + 3.5)
  }

  const rawFilename = `${examen.codigo}_${examen.sede.replace(/\s/g, '')}_G${examen.grupo}_${examen.parcial.replace(/\s/g, '')}_PatronVar${letra}.pdf`
  const blob = doc.output('blob')
  return { blob, filename: rawFilename }
}

const generarPatronXLSX = (examen, letra, preguntas = []) => {
  // Filtrar tipos que no son preguntas reales (PR, EM son solo contenedores)
  const preguntasReales = preguntas.filter(p => !['PR', 'EM', 'PROBLEMA', 'EMPAREJAMIENTO'].includes(p.tipo?.toUpperCase()))
  
  // Formato para Remark: Encabezados y luego 100 filas
  const data = [
    ["UNITEPC - PATRÓN DE RESPUESTAS (REMARK)"],
    ["MATERIA", examen.materia],
    ["DOCENTE", examen.docente],
    ["VARIANTE", letra],
    [],
    ["Pregunta", "Respuesta Correcta"]
  ]
  
  for (let i = 0; i < 100; i++) {
    const p = preguntasReales[i] || null
    let ans = ''
    if (p) {
       ans = String(p.respuesta_correcta || '').replace(/["']/g, '')
       const tipo = p.tipo?.toUpperCase()
       if (['FALSO_VERDADERO', 'FV'].includes(tipo)) {
          const lower = ans.toLowerCase()
          if (lower === 'true' || lower === 'verdadero' || lower === 'v') ans = 'A'
          if (lower === 'false' || lower === 'falso' || lower === 'f') ans = 'B'
       }
    }
    data.push([i + 1, ans])
  }
  
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Patron")
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  const rawFilename = `${examen.codigo}_${examen.sede.replace(/\s/g, '')}_G${examen.grupo}_${examen.parcial.replace(/\s/g, '')}_PatronVar${letra}.xlsx`
  return { blob, filename: rawFilename }
}

const generarExamenPDF = async (examen, config, letra = 'A', preguntas = []) => {
  const formatMap = {
    'Carta': 'letter',
    'Oficio': 'legal',
    'Oficio (8.5" x 13")': [215.9, 330.2]
  }
  const paperFormat = formatMap[config.formatoHoja] || [215.9, 330.2]
  
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: paperFormat
  })

  const margin = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - (margin * 2)

  const formatFecha = (f) => {
    if (!f) return '-'
    const d = new Date(f)
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  // LOGO / TITULO TABLE
  const logoUrl = `${api.defaults.baseURL}/banco-preguntas/logo-unitepc`
  let logoBase64 = null
  try {
     logoBase64 = await fetchImageAsBase64(logoUrl)
  } catch (e) {
    console.warn('No se pudo cargar el logo oficial:', e)
  }

  autoTable(doc, {
    startY: margin,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 11, font: 'helvetica', textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0,0,0] },
    body: [
      [
        { 
          content: logoBase64 ? '' : 'LOGO\nUNITEPC', 
          rowSpan: 2, 
          styles: { 
            halign: 'center', 
            valign: 'middle', 
            fontSize: 8, 
            cellWidth: 35,
            minCellHeight: 20
          } 
        },
        { content: 'UNIVERSIDAD TECNICA PRIVADA COSMOS\nGESTION I-2026', styles: { halign: 'center', fontSize: 13, fontStyle: 'bold' } },
        { content: '', rowSpan: 2, styles: { cellWidth: 35 } }
      ],
      [
        { content: `EVALUACION TEÓRICA ${examen.parcial.toUpperCase()}`, styles: { halign: 'center', fontStyle: 'bold' } }
      ]
    ],
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 0 && data.row.index === 0 && logoBase64) {
        const padding = 2
        doc.addImage(logoBase64, 'PNG', data.cell.x + padding, data.cell.y + padding, data.cell.width - (padding*2), data.cell.height - (padding*2))
      }
    }
  })

  // Margen doble para la cabecera superior (homogeneizar con info table)
  doc.setLineWidth(0.4)
  doc.setDrawColor(0, 0, 0)
  doc.rect(margin, margin, contentWidth, doc.lastAutoTable.finalY - margin)

  // INFO TABLE
  const startYTable = doc.lastAutoTable.finalY + 2
  autoTable(doc, {
    startY: startYTable,
    margin: { left: margin, right: margin },
    tableWidth: pageWidth - (margin * 2),
    theme: 'grid',
    styles: { 
      fontSize: 9, 
      cellPadding: 2.5, 
      lineWidth: 0.15, 
      lineColor: [0,0,0],
      font: 'helvetica'
    },
    body: [
      [
        { content: 'NOMBRE ESTUDIANTE:', styles: { fontStyle: 'bold', minCellHeight: 10, cellWidth: (pageWidth - margin*2) * 0.65 } },
        { content: 'CÓDIGO:', styles: { fontStyle: 'bold', cellWidth: (pageWidth - margin*2) * 0.35 } }
      ],
      [
        { content: `CARRERA: ${examen.carrera || ''}`, styles: { fontStyle: 'bold' } },
        { content: `GRUPO: ${examen.grupo}`, styles: { fontStyle: 'bold' } }
      ],
      [
        { content: `DOCENTE: ${examen.docente}`, styles: { fontStyle: 'bold' } },
        { content: `TIPO DE EXAMEN: ${examen.parcial} - VAR ${letra}`, styles: { fontStyle: 'bold' } }
      ],
      [
        { content: `MATERIA: ${examen.materia}`, styles: { fontStyle: 'bold' } },
        { content: `FECHA: ${formatFecha(examen.fecha_examen)}`, styles: { fontStyle: 'bold' } }
      ],
      [
        { content: `SEMESTRE: ${examen.semestre || '-'}`, styles: { fontStyle: 'bold' } },
        { content: `HORA: ${examen.hora}`, styles: { fontStyle: 'bold' } }
      ]
    ]
  })

  // Efecto de margen doble minimalista (borde exterior más grueso)
  const tableHeight = doc.lastAutoTable.finalY - startYTable
  doc.setLineWidth(0.4)
  doc.rect(margin, startYTable, contentWidth, tableHeight)

  let currentY = doc.lastAutoTable.finalY + 10

  // AGRUPAR POR TIPO PARA RENDERIZAR SECCIONES
  const descripciones = {
    'SELECCION_UNICA': 'SECCIÓN: SELECCIÓN ÚNICA - Seleccione la respuesta correcta entre las opciones presentadas.',
    'SELECCION_MULTIPLE': 'SECCIÓN: SELECCIÓN MÚLTIPLE - Seleccione todas las respuestas correctas. Puede haber más de una.',
    'FALSO_VERDADERO': 'SECCIÓN: FALSO O VERDADERO - Marque si la afirmación es Verdadera (A) o Falsa (B)',
    'PROBLEMA': 'SECCIÓN: PROBLEMAS - Resuelva los siguientes planteamientos. Lea detenidamente cada enunciado y resuelva las preguntas asociadas:',
    'EMPAREJAMIENTO': 'SECCIÓN: EMPAREJAMIENTO - Relacione los términos o conceptos con sus definiciones o descripciones correspondientes.',
  }

  let ultimoTipo = null

  // RENDER PREGUNTAS
  for (let i = 0; i < preguntas.length; i++) {
    const p = preguntas[i]
    let tipoActualOriginal = p.tipo?.toUpperCase()
    let tipoActual = tipoActualOriginal === 'PR' ? 'PROBLEMA' : (tipoActualOriginal === 'EM' ? 'EMPAREJAMIENTO' : (['SP', 'SUBPREGUNTA', 'SUBPROBLEMA'].includes(tipoActualOriginal) ? 'SUBPREGUNTA' : tipoActualOriginal))
    
    // Encabezado de sección (Solo para tipos principales)
    const tiposPrincipales = ['SELECCION_UNICA', 'SELECCION_MULTIPLE', 'FALSO_VERDADERO', 'PROBLEMA', 'EMPAREJAMIENTO']
    if (tipoActual !== ultimoTipo && tiposPrincipales.includes(tipoActual)) {
      const descText = descripciones[tipoActual] || `SECCIÓN: ${tipoActual.replace('_', ' ')}`
      const descLines = doc.splitTextToSize(descText, contentWidth - 4)
      const rectH = (descLines.length * 4.5) + 4

      if (currentY + rectH > (doc.internal.pageSize.getHeight() - 40)) {
        doc.addPage()
        currentY = margin
      }
      
      // Diseño minimalista para secciones: Línea de acento izquierda y sin fondo
      doc.setDrawColor(70, 70, 70) // Gris oscuro para la línea
      doc.setLineWidth(0.8)
      doc.line(margin, currentY, margin, currentY + rectH - 1)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(descLines, margin + 4, currentY + 4)
      currentY += rectH + (tipoActual === 'PROBLEMA' ? 1 : 4) // Espacio mínimo para problemas
      ultimoTipo = tipoActual
    }
    
    // Check for page break
    if (currentY > (doc.internal.pageSize.getHeight() - 30)) {
       doc.addPage()
       currentY = margin
    }
    // RENDER PREGUNTA ACTUAL
    const enumTextBase = i + 1 - preguntas.slice(0, i).filter(x => ['PR', 'EM', 'PROBLEMA', 'EMPAREJAMIENTO'].includes(x.tipo?.toUpperCase())).length
    
    // CASO ESPECIAL: EMPAREJAMIENTO (TABLA 2 COLUMNAS)
    if (tipoActual === 'EMPAREJAMIENTO') {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      let cleanEnunciado = (p.enunciado || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').trim()
      if (cleanEnunciado.toUpperCase().startsWith('EMPAREJAMIENTO:')) {
        cleanEnunciado = cleanEnunciado.substring(16).trim()
      }
      const enunciadoLines = doc.splitTextToSize(cleanEnunciado, contentWidth - 10)
      doc.text(enunciadoLines, margin + 8, currentY) // Alineado con preguntas normales
      currentY += (enunciadoLines.length * 6) + 4

      // Buscar subpreguntas
      let matchingSubs = []
      let j = i + 1
      while (j < preguntas.length && (preguntas[j].tipo?.toUpperCase() === 'SUBPROBLEMA' || preguntas[j].tipo?.toUpperCase() === 'SUBPREGUNTA') && preguntas[j].grupo === p.grupo) {
        matchingSubs.push(preguntas[j])
        j++
      }

      // Tabla
      const tableData = []
      const maxRows = Math.max((p.opciones || []).length, matchingSubs.length)
      for (let r = 0; r < maxRows; r++) {
        const opt = (p.opciones || [])[r] || null
        const sub = matchingSubs[r] || null
        const numReal = enumTextBase + r
        tableData.push([
          opt ? `${opt.id}) ${opt.text}` : '',
          sub ? `(      )  ${numReal}. ${sub.enunciado?.replace(/<[^>]*>/g, '').trim()}` : ''
        ])
      }

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin },
        tableWidth: contentWidth,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2, valign: 'middle' },
        columnStyles: { 
          0: { cellWidth: contentWidth * 0.25, fontStyle: 'bold' }, 
          1: { cellWidth: contentWidth * 0.75 } 
        },
        body: tableData
      })

      currentY = doc.lastAutoTable.finalY + 10
      i = j - 1 // Saltar subpreguntas
      continue
    }

    // CASO NORMAL (SU, SM, FV, PR)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    
    // Solo numeramos si NO es un encabezado PROBLEMA
    const esHeader = ['PR', 'PROBLEMA'].includes(p.tipo?.toUpperCase())
    if (!esHeader) {
      const headersAntes = preguntas.slice(0, i).filter(x => ['PR', 'EM', 'PROBLEMA', 'EMPAREJAMIENTO'].includes(x.tipo?.toUpperCase())).length
      const realNum = i + 1 - headersAntes
      doc.text(`${realNum}. `, margin, currentY)
    }
    
    doc.setFont('helvetica', 'normal')
    let cleanEnunciado = (p.enunciado || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').trim()
    
    // Eliminar prefijos redundantes si la cabecera ya los menciona
    if (cleanEnunciado.toUpperCase().startsWith('EMPAREJAMIENTO:')) {
      cleanEnunciado = cleanEnunciado.substring(16).trim()
    }
    if (cleanEnunciado.toUpperCase().startsWith('PROBLEMA:')) {
      cleanEnunciado = cleanEnunciado.substring(9).trim()
    }

    const enunciadoLines = doc.splitTextToSize(cleanEnunciado, contentWidth - 10)
    doc.text(enunciadoLines, margin + 8, currentY)
    currentY += (enunciadoLines.length * 6) + (esHeader ? 1 : 2)

    // Imagen (si existe)
    if (p.imagen) {
      try {
        const imgUrl = `${api.defaults.baseURL}/banco-preguntas/image/${p.imagen}`
        const imgData = await fetchImageAsBase64(imgUrl)
        if (imgData) {
          const imgProps = doc.getImageProperties(imgData)
          
          // Ajuste por ALTURA definida (ej: 45) y centrado
          let imgH = 45 
          let imgW = (imgProps.width * imgH) / imgProps.height
          
          // Si el ancho calculado es mayor al disponible, re-escalamos por ancho
          if (imgW > contentWidth - 10) {
            imgW = contentWidth - 10
            imgH = (imgProps.height * imgW) / imgProps.width
          }

          if (currentY + imgH > (doc.internal.pageSize.getHeight() - 20)) {
            doc.addPage(); currentY = margin
          }

          doc.addImage(imgData, 'JPEG', (pageWidth - imgW) / 2, currentY, imgW, imgH)
          currentY += imgH + 2
        } else {
          // DIAGNÓSTICO: Si falla la carga, dibujar un cuadro rojo
          doc.setDrawColor(255, 0, 0)
          doc.rect((pageWidth - 20)/2, currentY, 20, 10)
          doc.text("ERR_IMG", (pageWidth - 20)/2 + 2, currentY + 7)
          currentY += 15
        }
      } catch (e) { 
        console.error("Error cargando imagen en PDF:", e)
        doc.text("CATCH_IMG_ERR", margin, currentY)
        currentY += 10
      }
    }

    // Opciones
    const opciones = Array.isArray(p.opciones) ? p.opciones : []
    let tipoActualNoNormalizado = p.tipo?.toUpperCase()
    
    if (opciones.length > 0) {
      doc.setFontSize(10)
      for (const opc of opciones) {
        let textToShow = opc.text || ''
        if (['FALSO_VERDADERO', 'FV'].includes(tipoActualNoNormalizado)) {
          const lower = textToShow.toLowerCase().trim()
          if (lower === 'true') textToShow = 'Verdadero'
          if (lower === 'false') textToShow = 'Falsa'
        }
        const opcText = `${opc.id || ''}) ${textToShow}`
        const opcLines = doc.splitTextToSize(opcText, contentWidth - 15)
        if (currentY + (opcLines.length * 5) > (doc.internal.pageSize.getHeight() - 20)) {
          doc.addPage(); currentY = margin
        }
        doc.text(opcLines, margin + 12, currentY)
        currentY += (opcLines.length * 5) + 1
      }
    }
    currentY += (esHeader ? 2 : 5)
  }

  // Corregir la numeración en el PDF (Los headers PR/EM no deberían tener número si el usuario dice que no cuentan)
  // Pero actualmente uso `${i + 1}. ` en la línea 1203. 
  // Voy a ajustar eso arriba.

  const rawFilename = `${examen.codigo}_${examen.sede.replace(/\s/g, '')}_G${examen.grupo}_${examen.parcial.replace(/\s/g, '')}_Var${letra}.pdf`
  const blob = doc.output('blob')
  return { blob, filename: rawFilename }
}

async function fetchImageAsBase64(url) {
  try {
    const response = await api.get(url, { responseType: 'blob' })
    const blob = response.data
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (e) {
    console.error('Error convirtiendo imagen a Base64 con API:', e)
    return null
  }
}

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
