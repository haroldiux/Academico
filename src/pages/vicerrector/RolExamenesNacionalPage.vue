<template>
  <q-page class="rol-nacional-page">
    <!-- Header -->
    <div class="page-header q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h1 class="page-title text-h4 text-weight-bold row items-center q-mb-xs">
            <q-icon name="fact_check" color="deep-purple" class="q-mr-md" />
            Rol de Exámenes por Carrera
          </h1>
          <p class="text-grey-7 q-mt-xs">
            Vista panorámica del estado de carga por dirección de carrera
            <q-chip
              v-if="esDireccionAcademica"
              color="blue-1"
              text-color="blue-9"
              size="sm"
              icon="location_on"
              class="q-ml-sm"
            >
              {{ sedeNombre || 'Tu sede' }}
            </q-chip>
          </p>
        </div>
        <q-btn
          unelevated
          color="deep-purple"
          icon="refresh"
          label="Actualizar"
          no-caps
          @click="cargarDatos"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Filtros globales -->
    <div class="row q-col-gutter-md q-mb-lg items-end">
      <div class="col-12 col-md-3" v-if="!esDireccionAcademica">
        <q-select
          v-model="filtros.sede"
          :options="sedesOptions"
          outlined
          dense
          label="Sede"
          clearable
          :loading="loadingSedes"
          bg-color="white"
          @update:model-value="onSedeChange"
        >
          <template v-slot:prepend><q-icon name="apartment" color="grey-6" /></template>
        </q-select>
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="filtros.parcial"
          :options="parcialesOptions"
          outlined
          dense
          label="Parcial"
          clearable
          bg-color="white"
        >
          <template v-slot:prepend><q-icon name="event_note" color="grey-6" /></template>
        </q-select>
      </div>
      <div class="col-12 col-md-3">
        <q-input
          v-model="filtros.busqueda"
          outlined
          dense
          label="Buscar carrera..."
          clearable
          bg-color="white"
        >
          <template v-slot:prepend><q-icon name="search" /></template>
        </q-input>
      </div>
      <div class="col-auto">
        <q-btn
          flat
          dense
          icon="filter_alt_off"
          label="Limpiar"
          color="grey-7"
          no-caps
          @click="limpiarFiltros"
        />
      </div>
    </div>

    <!-- Resumen general -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-6 col-md-3">
        <q-card class="summary-card bg-green-1 border-green" flat bordered>
          <q-card-section class="row items-center no-wrap q-pa-md">
            <q-icon name="check_circle" color="green-7" size="32px" class="q-mr-md" />
            <div>
              <div class="text-h4 text-weight-bold text-green-8">{{ totalSubidas }}</div>
              <div class="text-caption text-green-8">Carreras con rol subido</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="summary-card bg-red-1 border-red" flat bordered>
          <q-card-section class="row items-center no-wrap q-pa-md">
            <q-icon name="cancel" color="red-7" size="32px" class="q-mr-md" />
            <div>
              <div class="text-h4 text-weight-bold text-red-8">{{ totalPendientes }}</div>
              <div class="text-caption text-red-8">Carreras pendientes</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="summary-card bg-blue-1" flat bordered>
          <q-card-section class="row items-center no-wrap q-pa-md">
            <q-icon name="school" color="blue-7" size="32px" class="q-mr-md" />
            <div>
              <div class="text-h4 text-weight-bold text-blue-8">{{ totalCarreras }}</div>
              <div class="text-caption text-blue-8">Total carreras</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="summary-card bg-purple-1" flat bordered>
          <q-card-section class="row items-center no-wrap q-pa-md">
            <q-icon name="percent" color="purple-7" size="32px" class="q-mr-md" />
            <div>
              <div class="text-h4 text-weight-bold text-purple-8">{{ porcentajeSubidas }}%</div>
              <div class="text-caption text-purple-8">Cumplimiento</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Estado: cargando -->
    <div v-if="loading" class="flex flex-center q-py-xl">
      <q-spinner-dots color="deep-purple" size="48px" />
    </div>

    <!-- Estado: sin datos -->
    <div v-else-if="sedesAgrupadas.length === 0" class="text-center q-py-xl text-grey-5">
      <q-icon name="search_off" size="64px" class="q-mb-md" />
      <div class="text-h6">Sin datos disponibles</div>
      <div class="text-caption">Selecciona una sede o parcial para ver el estado</div>
    </div>

    <!-- Sedes agrupadas -->
    <template v-else>
      <div v-for="sede in sedesAgrupadas" :key="sede.id" class="q-mb-xl">
        <!-- Encabezado de Sede -->
        <div class="sede-header q-mb-md">
          <div class="row items-center">
            <q-icon name="apartment" color="deep-purple" size="24px" class="q-mr-sm" />
            <span class="text-h6 text-weight-bold text-deep-purple-9">{{ sede.nombre }}</span>
            <q-chip :color="getSedeColor(sede)" text-color="white" size="sm" class="q-ml-md">
              {{ sede.subidas }}/{{ sede.carreras.length }} subidas
            </q-chip>
            <!-- Barra de progreso de sede -->
            <div class="col q-ml-md">
              <q-linear-progress
                :value="sede.carreras.length > 0 ? sede.subidas / sede.carreras.length : 0"
                :color="getSedeProgressColor(sede)"
                track-color="grey-3"
                rounded
                size="8px"
              />
            </div>
            <span class="q-ml-sm text-caption text-grey-6">
              {{
                sede.carreras.length > 0
                  ? Math.round((sede.subidas / sede.carreras.length) * 100)
                  : 0
              }}%
            </span>
          </div>
        </div>

        <!-- Grid de carreras -->
        <div class="row q-col-gutter-md">
          <div
            v-for="carrera in sede.carreras"
            :key="carrera.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <q-card
              class="carrera-card cursor-pointer"
              :class="{ 'carrera-subida': carrera.subida, 'carrera-pendiente': !carrera.subida }"
              flat
              bordered
              @click="verDetalleCarrera(carrera)"
            >
              <q-card-section class="q-pa-md">
                <div class="row items-start no-wrap">
                  <div class="flex-1 q-mr-sm" style="min-width: 0">
                    <div class="text-body2 text-weight-bold text-grey-9 ellipsis">
                      {{ carrera.nombre }}
                    </div>
                    <div class="text-caption text-grey-6 q-mt-xs row items-center">
                      <q-icon name="grid_view" size="12px" class="q-mr-xs" />
                      {{ carrera.totalExamenes }} examen(es)
                    </div>
                  </div>
                  <!-- Indicador principal -->
                  <q-icon
                    :name="carrera.subida ? 'check_circle' : 'cancel'"
                    :color="carrera.subida ? 'green-7' : 'red-5'"
                    size="28px"
                  />
                </div>

                <!-- Badge de estado -->
                <div class="q-mt-sm">
                  <q-chip
                    :color="carrera.subida ? 'green' : 'red'"
                    text-color="white"
                    size="xs"
                    dense
                    :icon="carrera.subida ? 'done' : 'pending'"
                    :label="carrera.subida ? 'ROL SUBIDO' : 'PENDIENTE'"
                  />
                </div>

                <!-- Mini estadísticas si hay exámenes -->
                <div v-if="carrera.subida && carrera.stats" class="q-mt-sm">
                  <div class="row q-col-gutter-xs">
                    <div class="col-4 text-center">
                      <div class="text-caption text-grey-5">Pendient.</div>
                      <div class="text-caption text-weight-bold text-orange-7">
                        {{ carrera.stats.pendientes }}
                      </div>
                    </div>
                    <div class="col-4 text-center">
                      <div class="text-caption text-grey-5">En proc.</div>
                      <div class="text-caption text-weight-bold text-blue-7">
                        {{ carrera.stats.enProceso }}
                      </div>
                    </div>
                    <div class="col-4 text-center">
                      <div class="text-caption text-grey-5">Finalizad.</div>
                      <div class="text-caption text-weight-bold text-green-7">
                        {{ carrera.stats.finalizados }}
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </template>

    <!-- DIALOG: Detalle de carrera (solo lectura) -->
    <q-dialog v-model="dialogDetalle.show" backdrop-filter="blur(4px)">
      <q-card style="width: 750px; max-width: 95vw; border-radius: 16px">
        <q-card-section class="bg-deep-purple text-white q-pa-lg">
          <div class="row items-center no-wrap justify-between">
            <div class="flex items-center no-wrap">
              <q-icon name="school" size="28px" class="q-mr-md" />
              <div>
                <div class="text-h6 text-weight-bold">{{ dialogDetalle.carrera?.nombre }}</div>
                <div class="text-caption opacity-80">{{ dialogDetalle.carrera?.sede }}</div>
              </div>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </div>
        </q-card-section>

        <!-- Banner solo lectura -->
        <q-banner class="bg-blue-1 text-blue-9 q-px-lg" dense>
          <template v-slot:avatar><q-icon name="visibility" color="blue-7" /></template>
          Vista de solo lectura — Esta información no puede ser editada desde aquí
        </q-banner>

        <q-card-section class="q-pa-lg" v-if="dialogDetalle.examenes.length > 0">
          <q-table
            :rows="dialogDetalle.examenes"
            :columns="columnsDetalle"
            row-key="id"
            flat
            dense
            :pagination="{ rowsPerPage: 8 }"
          >
            <template v-slot:body-cell-materia="props">
              <q-td :props="props">
                <div class="text-weight-medium text-grey-9">{{ props.row.materia }}</div>
                <div class="text-caption text-grey-5">G. {{ props.row.grupo }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-parcial="props">
              <q-td :props="props" align="center">
                <q-chip
                  :color="getParcialColor(props.row.parcial)"
                  text-color="white"
                  size="xs"
                  dense
                >
                  {{ props.row.parcial }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-estado="props">
              <q-td :props="props" align="center">
                <q-chip
                  :color="getEstadoColor(props.row.estado)"
                  text-color="white"
                  size="xs"
                  dense
                  :icon="getEstadoIcon(props.row.estado)"
                >
                  {{ props.row.estado }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-fecha="props">
              <q-td :props="props">
                <span class="text-caption text-grey-7">{{ props.row.fecha }}</span>
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-section v-else class="text-center q-py-xl text-grey-5">
          <q-icon name="event_busy" size="48px" class="q-mb-md" />
          <div class="text-body1">No hay exámenes registrados para esta carrera</div>
          <div class="text-caption">en el parcial seleccionado</div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cerrar" color="grey-7" v-close-popup no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore, ROLES } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

const esDireccionAcademica = computed(() => authStore.rol === ROLES.DIRECCION_ACADEMICA)

// ===================== FILTROS =====================
const parcialesOptions = ['1er Parcial', '2do Parcial', 'Final', '2da Instancia']
const filtros = ref({
  sede: null,
  parcial: '1er Parcial',
  busqueda: '',
})

// ===================== DATA =====================
const loading = ref(false)
const loadingSedes = ref(false)
const sedesOptions = ref([])
const rawData = ref([]) // { sede_id, sede_nombre, carrera_id, carrera_nombre, examenes: [] }

// Nombre de la sede para Dirección Académica
const sedeNombre = computed(() => {
  if (!esDireccionAcademica.value) return ''
  const s = sedesOptions.value.find((s) => s.value === authStore.sedeId)
  return s?.label || ''
})

// ===================== FETCH =====================
const fetchSedes = async () => {
  loadingSedes.value = true
  try {
    const res = await api.get('/sedes')
    sedesOptions.value = (res.data.data || []).map((s) => ({ label: s.nombre, value: s.id }))

    // Para Dirección Académica, preseleccionar su sede
    if (esDireccionAcademica.value && authStore.sedeId) {
      const found = sedesOptions.value.find((s) => s.value === authStore.sedeId)
      if (found) filtros.value.sede = found
    }
  } catch (e) {
    console.error('Error al cargar sedes:', e)
  } finally {
    loadingSedes.value = false
  }
}

const cargarDatos = async () => {
  loading.value = true
  try {
    const params = {}
    if (filtros.value.parcial) params.tipo_examen = filtros.value.parcial
    if (filtros.value.sede?.value) params.sede_id = filtros.value.sede.value

    // Para Dirección Académica forzar su sede
    if (esDireccionAcademica.value && authStore.sedeId) {
      params.sede_id = authStore.sedeId
    }

    const res = await api.get('/rol-examenes/por-carrera', { params })
    rawData.value = res.data.data || []
  } catch (e) {
    console.error('Error al cargar datos:', e)
    $q.notify({ type: 'negative', message: 'No se pudo cargar el rol de exámenes' })
  } finally {
    loading.value = false
  }
}

const onSedeChange = () => {
  cargarDatos()
}

const limpiarFiltros = () => {
  filtros.value.busqueda = ''
  filtros.value.parcial = '1er Parcial'
  if (!esDireccionAcademica.value) filtros.value.sede = null
  cargarDatos()
}

watch(
  () => filtros.value.parcial,
  () => cargarDatos(),
)

onMounted(async () => {
  await fetchSedes()
  await cargarDatos()
})

// ===================== COMPUTED AGRUPADO =====================
const sedesAgrupadas = computed(() => {
  // Agrupar por sede
  const mapaS = {}
  for (const item of rawData.value) {
    if (!mapaS[item.sede_id]) {
      mapaS[item.sede_id] = { id: item.sede_id, nombre: item.sede_nombre, carreras: [], subidas: 0 }
    }
    const carrera = {
      id: item.carrera_id,
      nombre: item.carrera_nombre,
      sede: item.sede_nombre,
      subida: item.total_examenes > 0,
      totalExamenes: item.total_examenes || 0,
      stats: item.stats || null,
      examenes: item.examenes || [],
    }
    mapaS[item.sede_id].carreras.push(carrera)
    if (carrera.subida) mapaS[item.sede_id].subidas++
  }

  let lista = Object.values(mapaS)

  // Filtro búsqueda
  const q = filtros.value.busqueda?.toLowerCase()
  if (q) {
    lista = lista
      .map((s) => ({
        ...s,
        carreras: s.carreras.filter((c) => c.nombre.toLowerCase().includes(q)),
      }))
      .filter((s) => s.carreras.length > 0)
  }

  return lista
})

const totalCarreras = computed(() =>
  sedesAgrupadas.value.reduce((a, s) => a + s.carreras.length, 0),
)
const totalSubidas = computed(() => sedesAgrupadas.value.reduce((a, s) => a + s.subidas, 0))
const totalPendientes = computed(() => totalCarreras.value - totalSubidas.value)
const porcentajeSubidas = computed(() =>
  totalCarreras.value === 0 ? 0 : Math.round((totalSubidas.value / totalCarreras.value) * 100),
)

// ===================== DIALOG DETALLE =====================
const dialogDetalle = ref({ show: false, carrera: null, examenes: [] })

const verDetalleCarrera = (carrera) => {
  dialogDetalle.value = { show: true, carrera, examenes: carrera.examenes || [] }
}

const columnsDetalle = [
  { name: 'materia', label: 'Materia / Grupo', field: 'materia', align: 'left', sortable: true },
  { name: 'parcial', label: 'Parcial', field: 'parcial', align: 'center' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'hora', label: 'Hora', field: 'hora', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
]

// ===================== HELPERS =====================
function getSedeColor(sede) {
  if (sede.carreras.length === 0) return 'grey'
  const pct = sede.subidas / sede.carreras.length
  if (pct >= 1) return 'green'
  if (pct >= 0.5) return 'orange'
  return 'red'
}

function getSedeProgressColor(sede) {
  if (sede.carreras.length === 0) return 'grey'
  const pct = sede.subidas / sede.carreras.length
  if (pct >= 1) return 'green'
  if (pct >= 0.5) return 'orange'
  return 'red'
}

function getParcialColor(parcial) {
  const m = {
    '1er Parcial': 'blue',
    '2do Parcial': 'orange',
    Final: 'purple',
    '2da Instancia': 'red',
  }
  return m[parcial] || 'grey'
}

function getEstadoColor(estado) {
  const m = {
    programados: 'blue-7',
    generados: 'indigo-7',
    impresos: 'green-7',
    entregados: 'orange-8',
    devueltos: 'teal-7',
    revisados: 'deep-purple-7',
    subidos: 'purple-9',
  }
  return m[estado] || 'grey'
}

function getEstadoIcon(estado) {
  const m = {
    programados: 'event_note',
    generados: 'auto_awesome',
    impresos: 'print',
    entregados: 'inventory_2',
    devueltos: 'assignment_returned',
    revisados: 'fact_check',
    subidos: 'cloud_done',
  }
  return m[estado] || 'info'
}
</script>

<style scoped>
.rol-nacional-page {
  padding: 28px;
  background: var(--bg-primary, #f5f7fb);
  min-height: 100vh;
}

.page-title {
  margin: 0;
  color: var(--text-primary, #1a1d2e);
}

.summary-card {
  border-radius: 12px !important;
}

.border-green {
  border-color: #43a047 !important;
}
.border-red {
  border-color: #e53935 !important;
}

.sede-header {
  border-left: 4px solid var(--q-deep-purple, #6200ea);
  padding-left: 12px;
}

.carrera-card {
  border-radius: 12px !important;
  transition: all 0.2s ease;
}

.carrera-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
}

.carrera-subida {
  border-color: #43a047 !important;
  background: #f1f8f1 !important;
}

.carrera-pendiente {
  border-color: #ef9a9a !important;
  background: #fff5f5 !important;
}

.flex-1 {
  flex: 1;
}
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
