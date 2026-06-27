<template>
  <q-page :class="['virtual-exams-page q-pa-md', { 'virtual-exams-page--embedded': embedded }]">
    <div v-if="!embedded" class="row items-center justify-between q-mb-md">
      <div>
        <h1 class="page-title">
          <q-icon name="computer" color="primary" class="q-mr-sm" />
          Examenes Virtuales
        </h1>
        <p class="page-subtitle">
          Generacion, nomina, ejecucion y exportacion de examenes en linea.
        </p>
      </div>
      <q-btn
        flat
        round
        dense
        icon="refresh"
        color="grey-7"
        :loading="loading || loadingRol"
        @click="cargarTodo"
      />
    </div>

    <div
      class="virtual-state-filter row q-mb-md bg-white q-pa-sm rounded-borders shadow-1 items-center"
    >
      <div class="text-caption text-grey-8 q-mr-md text-weight-bold">ETAPA VIRTUAL:</div>
      <div class="row q-gutter-x-xs">
        <q-btn
          v-for="estado in estadosFiltroVirtual"
          :key="estado.key"
          unelevated
          rounded
          dense
          no-caps
          size="sm"
          :icon="estado.icon"
          :label="estado.label"
          :color="estadoFiltro === estado.key ? 'deep-purple-7' : 'grey-2'"
          :text-color="estadoFiltro === estado.key ? 'white' : 'grey-8'"
          @click="estadoFiltro = estado.key"
        />
      </div>
    </div>

    <q-card flat bordered class="virtual-table-card">
      <q-card-section class="row items-center justify-between q-col-gutter-md">
        <div class="col-12 col-md">
          <div class="section-title">Examenes virtuales del rol</div>
          <div class="section-subtitle">
            Lista de examenes marcados como virtuales, con generacion, token, nomina y seguimiento.
          </div>
        </div>
        <div class="col-12 col-md-4">
          <q-input
            v-model="busqueda"
            dense
            outlined
            clearable
            placeholder="Buscar materia, docente, token, carrera o estado"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </q-card-section>

      <q-table
        flat
        dense
        class="virtual-table"
        :rows="filasFiltradas"
        :columns="columns"
        row-key="row_key"
        :loading="loading || loadingRol"
        :rows-per-page-options="[10, 25, 50]"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template #body-cell-materia="props">
          <q-td :props="props">
            <div class="row items-start no-wrap q-gutter-sm">
              <q-chip dense color="blue-7" text-color="white" class="text-weight-bold">
                {{ props.row.materia_codigo || 'S/C' }}
              </q-chip>
              <div>
                <div class="text-weight-bold">{{ props.row.materia_nombre || 'Sin materia' }}</div>
                <div class="text-caption text-grey-7">
                  {{ props.row.carrera || 'Sin carrera' }} - G. {{ props.row.grupo || '-' }}
                </div>
                <div class="text-caption text-grey-6">{{ props.row.sede || 'Sin sede' }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-docente="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.docente || 'Sin docente' }}</div>
          </q-td>
        </template>

        <template #body-cell-fecha="props">
          <q-td :props="props">
            <div class="text-weight-medium">
              <q-icon name="event" size="14px" class="q-mr-xs" />
              {{ formatearFecha(props.row.fecha) }}
            </div>
            <div class="text-caption text-grey-7">
              <q-icon name="schedule" size="14px" class="q-mr-xs" />
              {{ formatearHora(props.row.hora_inicio) }} - {{ formatearHora(props.row.hora_fin) }}
            </div>
          </q-td>
        </template>

        <template #body-cell-token="props">
          <q-td :props="props">
            <q-chip
              v-if="props.row.token"
              dense
              color="indigo-1"
              text-color="indigo-9"
              class="text-weight-bold"
            >
              {{ props.row.token }}
            </q-chip>
            <q-chip v-else dense color="grey-3" text-color="grey-7">Pendiente</q-chip>
          </q-td>
        </template>

        <template #body-cell-banco="props">
          <q-td :props="props">
            <div class="bank-cell">
              <q-chip
                dense
                size="sm"
                :color="props.row.banco_total > 0 ? 'green-1' : 'red-1'"
                :text-color="props.row.banco_total > 0 ? 'green-9' : 'red-9'"
                class="text-weight-bold"
              >
                {{ props.row.banco_total }} preg.
              </q-chip>
              <div class="row justify-center q-gutter-x-xs q-mt-xs">
                <q-badge color="green-1" text-color="green-9"
                  >F {{ props.row.banco_facil }}</q-badge
                >
                <q-badge color="orange-1" text-color="orange-9"
                  >M {{ props.row.banco_medio }}</q-badge
                >
                <q-badge color="red-1" text-color="red-9">D {{ props.row.banco_dificil }}</q-badge>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-variantes="props">
          <q-td :props="props">
            <q-chip dense color="deep-purple-1" text-color="deep-purple-9" class="text-weight-bold">
              {{ props.row.cantidad_variantes || 1 }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-nomina="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.attempts_count }} ingresados</div>
            <div class="text-caption text-grey-7">{{ props.row.roster_count }} en nomina</div>
          </q-td>
        </template>

        <template #body-cell-estado="props">
          <q-td :props="props">
            <div class="virtual-flow">
              <q-btn
                v-for="estado in estadosVirtuales"
                :key="estado.key"
                dense
                round
                unelevated
                size="sm"
                :icon="estado.icon"
                :color="colorBotonEstado(props.row, estado.key)"
                :text-color="textoBotonEstado(props.row, estado.key)"
                :outline="
                  !isEstadoActivo(props.row, estado.key) &&
                  !isEstadoCompletado(props.row, estado.key)
                "
                :disable="!puedeEjecutarEstado(props.row, estado.key)"
                :loading="accionEnProceso === accionKey(props.row, estado.key)"
                @click="ejecutarEstado(props.row, estado.key)"
                class="state-step-btn"
              >
                <q-tooltip>{{ estado.label }}</q-tooltip>
              </q-btn>
            </div>
            <q-chip
              dense
              size="sm"
              class="q-mt-xs"
              :color="estadoColor(props.row.estado)"
              text-color="white"
            >
              {{ estadoLabel(props.row.estado) }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-acciones="props">
          <q-td :props="props" class="text-right">
            <q-btn
              v-if="props.row.session_id"
              flat
              round
              dense
              icon="visibility"
              color="blue-grey"
              @click="abrirDetalle(props.row)"
            >
              <q-tooltip>Monitorear</q-tooltip>
            </q-btn>
            <q-btn
              v-if="puedeCerrarFila(props.row)"
              flat
              round
              dense
              icon="stop"
              color="negative"
              :loading="accionEnProceso === accionKey(props.row, 'REALIZADO')"
              @click="cerrarSesion(props.row)"
            >
              <q-tooltip>Detener examen</q-tooltip>
            </q-btn>
            <q-btn
              v-if="puedeGenerar && props.row.session_id"
              flat
              round
              dense
              icon="download"
              color="teal"
              @click="exportarRemark(props.row)"
            >
              <q-tooltip>Exportar Remark</q-tooltip>
            </q-btn>
            <q-btn
              v-if="puedeReiniciar && props.row.session_id"
              flat
              round
              dense
              icon="restart_alt"
              color="negative"
              :loading="accionEnProceso === accionKey(props.row, 'RESET')"
              @click="reiniciarSesion(props.row)"
            >
              <q-tooltip>Restaurar proceso virtual</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialogNomina">
      <q-card style="width: 720px; max-width: 95vw">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Cargar nomina autorizada</div>
          <div class="text-caption">Formato: codigo,nombre. Un estudiante por linea.</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="nominaTexto"
            outlined
            type="textarea"
            autogrow
            label="Nomina"
            placeholder="123456, JUAN PEREZ"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" no-caps v-close-popup />
          <q-btn
            unelevated
            color="primary"
            label="Guardar nomina"
            no-caps
            :loading="guardandoNomina"
            @click="guardarNomina"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogDetalle" maximized>
      <q-card>
        <q-bar class="bg-primary text-white">
          <div class="text-weight-bold">Monitoreo de examen virtual</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section v-if="detalle">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-3">
              <div class="detail-box">
                <span>Token</span>
                <strong>{{ detalle.token }}</strong>
              </div>
            </div>
            <div class="col-12 col-md-3">
              <div class="detail-box">
                <span>Estado</span>
                <strong>{{ detalle.estado }}</strong>
              </div>
            </div>
            <div class="col-12 col-md-3">
              <div class="detail-box">
                <span>Finaliza</span>
                <strong>{{ detalle.finaliza_en || '-' }}</strong>
              </div>
            </div>
            <div class="col-12 col-md-3">
              <div class="detail-box">
                <span>Ingresados</span>
                <strong>{{ detalle.attempts_count }} / {{ detalle.roster_count }}</strong>
              </div>
            </div>
          </div>
          <div class="row items-center justify-between q-mb-sm q-col-gutter-sm">
            <div class="col-12 col-md">
              <div class="text-weight-bold">Estudiantes registrados</div>
              <div class="text-caption text-grey-7">
                Ordenados por codigo. Acepta a quienes podran ingresar al examen.
              </div>
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="detalleBusqueda"
                dense
                outlined
                clearable
                placeholder="Buscar por codigo, nombre o estado"
              >
                <template #prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>
          <q-table
            flat
            dense
            :rows="detalleRosterFiltrado"
            :columns="detalleColumns"
            row-key="id"
            :rows-per-page-options="[20, 50, 100]"
          >
            <template #body-cell-intento="props">
              <q-td :props="props">
                <q-chip
                  v-if="props.row.intento"
                  :color="colorIntento(props.row.intento.estado)"
                  text-color="white"
                  size="sm"
                >
                  {{ props.row.intento.estado }} / Var {{ props.row.intento.variante }}
                </q-chip>
                <q-chip v-else color="grey-3" text-color="grey-8" size="sm">Pendiente</q-chip>
              </q-td>
            </template>

            <template #body-cell-validacion="props">
              <q-td :props="props">
                <q-chip
                  dense
                  size="sm"
                  :color="colorValidacion(props.row.validacion)"
                  text-color="white"
                >
                  {{ props.row.validacion || 'PENDIENTE' }}
                </q-chip>
              </q-td>
            </template>

            <template #body-cell-acciones="props">
              <q-td :props="props" class="text-right">
                <q-btn
                  flat
                  round
                  dense
                  icon="check_circle"
                  color="green"
                  :loading="accionEnProceso === `roster-${props.row.id}-ACEPTADO`"
                  @click="actualizarValidacionEstudiante(props.row, 'ACEPTADO')"
                >
                  <q-tooltip>Aceptar estudiante</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="cancel"
                  color="negative"
                  :loading="accionEnProceso === `roster-${props.row.id}-RECHAZADO`"
                  @click="actualizarValidacionEstudiante(props.row, 'RECHAZADO')"
                >
                  <q-tooltip>Rechazar estudiante</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogGenerar" persistent>
      <q-card style="min-width: 550px; max-width: 650px">
        <div class="dialog-header">
          <q-icon name="auto_awesome" class="q-mr-sm" />
          Generar examen virtual - {{ filaGeneracion?.materia_nombre }}
        </div>

        <q-card-section>
          <q-banner class="bg-blue-1 text-blue-9 q-mb-md" rounded dense>
            <q-icon name="info" class="q-mr-sm" />
            Banco disponible: {{ filaGeneracion?.banco_total || 0 }} preguntas. Se generaran
            variantes virtuales para el acceso en linea.
          </q-banner>

          <div class="section-label q-mb-md">Variantes a generar</div>
          <div class="q-gutter-sm versiones-toggle">
            <q-toggle
              v-for="v in ['A', 'B', 'C', 'D', 'E']"
              :key="v"
              v-model="formGeneracion.variantes"
              :val="v"
              :label="`Tipo ${v}`"
              color="deep-purple"
            />
          </div>

          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="formGeneracion.duracion_minutos"
                outlined
                dense
                type="number"
                min="10"
                max="240"
                label="Tiempo del examen"
                suffix="minutos"
              />
            </div>
          </div>

          <q-banner class="bg-orange-1 text-orange-9 q-mt-md" rounded dense>
            <q-icon name="warning" class="q-mr-sm" />
            Se generaran <strong>{{ formGeneracion.variantes.length }}</strong> variante(s). Tiempo
            predeterminado: 45 minutos.
          </q-banner>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" no-caps @click="dialogGenerar = false" />
          <q-btn
            unelevated
            color="deep-purple"
            icon="auto_awesome"
            label="Generar examen"
            no-caps
            :disable="formGeneracion.variantes.length === 0"
            :loading="accionEnProceso === accionKey(filaGeneracion || {}, 'GENERADO')"
            @click="confirmarGeneracionVirtual"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { ROLES, useAuthStore } from 'src/stores/auth'

defineProps({
  embedded: { type: Boolean, default: false },
})

const $q = useQuasar()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const loadingRol = ref(false)
const guardandoNomina = ref(false)
const accionEnProceso = ref(null)
const sesiones = ref([])
const rolesOriginal = ref([])
const busqueda = ref('')
const estadoFiltro = ref('TODOS')
const dialogNomina = ref(false)
const dialogDetalle = ref(false)
const dialogGenerar = ref(false)
const nominaTexto = ref('')
const sesionActual = ref(null)
const detalle = ref(null)
const detalleBusqueda = ref('')
const filaGeneracion = ref(null)
const variantesPorRol = reactive({})
const formGeneracion = reactive({
  variantes: ['A'],
  duracion_minutos: 45,
})

const filtros = reactive({ gestion: '2026-I' })

const puedeGenerar = computed(() =>
  [ROLES.EVALUACIONES, ROLES.RESPONSABLE_EVALUACIONES, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(
    authStore.rol,
  ),
)

const puedeIniciar = computed(() =>
  [ROLES.DOCENTE, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(authStore.rol),
)

const puedeReiniciar = computed(() => [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(authStore.rol))

const estadosVirtuales = [
  { key: 'PROGRAMADO', label: 'Programado', icon: 'event_note', color: 'blue-grey' },
  { key: 'GENERADO', label: 'Generado', icon: 'auto_awesome', color: 'deep-purple-7' },
  { key: 'EJECUCION', label: 'Ejecucion', icon: 'play_arrow', color: 'orange-8' },
  { key: 'REALIZADO', label: 'Realizado', icon: 'task_alt', color: 'green-7' },
  { key: 'SUBIDO', label: 'Subido', icon: 'cloud_done', color: 'teal-7' },
]

const estadosFiltroVirtual = [{ key: 'TODOS', label: 'Todos', icon: 'apps' }, ...estadosVirtuales]

const columns = [
  { name: 'materia', label: 'MATERIA / GRUPO', align: 'left', sortable: true },
  { name: 'docente', label: 'DOCENTE', align: 'left', sortable: true },
  { name: 'parcial', label: 'PARCIAL', field: 'parcial', align: 'center', sortable: true },
  { name: 'fecha', label: 'FECHA / HORA', align: 'left', sortable: true },
  { name: 'token', label: 'TOKEN', align: 'center' },
  { name: 'banco', label: 'BANCO', field: 'banco_total', align: 'center', sortable: true },
  { name: 'variantes', label: 'VAR.', align: 'center' },
  { name: 'nomina', label: 'REGISTROS / INGRESOS', align: 'center' },
  { name: 'estado', label: 'ESTADO', align: 'center', sortable: true },
  { name: 'acciones', label: 'ACCIONES', align: 'right' },
]

const detalleColumns = [
  { name: 'codigo', label: 'Codigo', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'intento', label: 'Intento', align: 'center' },
  { name: 'validacion', label: 'Validacion', field: 'validacion', align: 'center', sortable: true },
  {
    name: 'respuestas',
    label: 'Resp.',
    field: (row) => row.intento?.respuestas_total || 0,
    align: 'center',
  },
  {
    name: 'correctas',
    label: 'Correctas',
    field: (row) => row.intento?.correctas_total || 0,
    align: 'center',
  },
  { name: 'acciones', label: 'Acciones', align: 'right' },
]

const sesionesPorRol = computed(() =>
  sesiones.value.reduce((map, sesion) => {
    map[sesion.rol_examen_id] = sesion
    return map
  }, {}),
)

const filasVirtuales = computed(() => {
  const filas = rolesOriginal.value
    .filter((rol) => normalizarModalidadRol(rol) === 'VIRTUAL')
    .map((rol) => construirFilaVirtual(rol, sesionesPorRol.value[rol.id]))

  const rolesIds = new Set(filas.map((fila) => fila.rol_examen_id))
  sesiones.value.forEach((sesion) => {
    if (!rolesIds.has(sesion.rol_examen_id)) {
      filas.push(construirFilaVirtualDesdeSesion(sesion))
    }
  })

  return filas
})

const filasFiltradas = computed(() => {
  const term = busqueda.value?.toLowerCase().trim()

  return filasVirtuales.value.filter((row) => {
    const coincideEstado = estadoFiltro.value === 'TODOS' || row.estado === estadoFiltro.value
    if (!coincideEstado) return false
    if (!term) return true

    return [
      row.token,
      row.estado,
      row.materia_codigo,
      row.materia_nombre,
      row.docente,
      row.sede,
      row.carrera,
      row.grupo,
      row.parcial,
    ]
      .join(' ')
      .toLowerCase()
      .includes(term)
  })
})

const detalleRosterFiltrado = computed(() => {
  const term = detalleBusqueda.value?.toLowerCase().trim()

  return [...(detalle.value?.roster || [])]
    .sort((a, b) =>
      String(a.codigo || '').localeCompare(String(b.codigo || ''), 'es', {
        numeric: true,
        sensitivity: 'base',
      }),
    )
    .filter((row) => {
      if (!term) return true

      return [row.codigo, row.nombre, row.validacion, row.intento?.estado, row.intento?.variante]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
})

onMounted(cargarTodo)

async function cargarTodo() {
  await Promise.all([cargarSesiones(), cargarRol()])
  await abrirDetalleDesdeQuery()
}

async function cargarSesiones() {
  loading.value = true
  try {
    const { data } = await api.get('/virtual-exams', { params: { gestion: filtros.gestion } })
    sesiones.value = data.data || []
    sincronizarVariantes()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los examenes virtuales.' })
  } finally {
    loading.value = false
  }
}

async function cargarRol() {
  loadingRol.value = true
  try {
    const { data } = await api.get('/rol-examenes', {
      params: { gestion: filtros.gestion, modalidad: 'VIRTUAL' },
    })
    rolesOriginal.value = (data.data || data || []).filter(
      (item) => normalizarModalidadRol(item) === 'VIRTUAL',
    )
    sincronizarVariantes()
  } catch (error) {
    console.error('Error cargando examenes virtuales del rol:', error)
    rolesOriginal.value = []
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los examenes marcados como virtuales.',
      caption: error.response?.data?.message || error.message,
    })
  } finally {
    loadingRol.value = false
  }
}

function sincronizarVariantes() {
  rolesOriginal.value.forEach((rol) => {
    const session = sesiones.value.find((item) => item.rol_examen_id === rol.id)
    if (!variantesPorRol[rol.id]) {
      variantesPorRol[rol.id] = Number(
        session?.cantidad_variantes || rol.config_generacion?.cantVariantes || 1,
      )
    }
  })
}

function normalizarModalidadRol(item) {
  return String(item?.modalidad || item?.config_generacion?.modalidad || 'PRESENCIAL_CON_CARTILLA')
    .trim()
    .toUpperCase()
}

function construirFilaVirtual(rol, session = null) {
  return {
    row_key: `rol-${rol.id}`,
    rol_examen_id: rol.id,
    session_id: session?.id || null,
    session,
    token: session?.token || null,
    estado: session?.estado || 'PROGRAMADO',
    cantidad_variantes: Number(session?.cantidad_variantes || variantesPorRol[rol.id] || 1),
    roster_count: Number(session?.roster_count || 0),
    attempts_count: Number(session?.attempts_count || 0),
    materia_codigo: rol.materia_codigo,
    materia_nombre: rol.materia_nombre || rol.materia,
    docente: rol.docente,
    sede: rol.sede,
    carrera: rol.carrera,
    grupo: rol.grupo,
    parcial: rol.tipo_examen || rol.parcial,
    fecha: rol.fecha,
    hora_inicio: rol.hora_inicio,
    hora_fin: rol.hora_fin,
    banco_total: Number(rol.total_banco || rol.banco_stats?.total || 0),
    banco_facil: Number(rol.banco_facil || rol.banco_stats?.facil || 0),
    banco_medio: Number(rol.banco_medio || rol.banco_stats?.medio || 0),
    banco_dificil: Number(rol.banco_dificil || rol.banco_stats?.dificil || 0),
    banco_g1: Number(rol.banco_g1 || rol.banco_stats?.g1 || 0),
    banco_g2: Number(rol.banco_g2 || rol.banco_stats?.g2 || 0),
    banco_g3: Number(rol.banco_g3 || rol.banco_stats?.g3 || 0),
  }
}

function construirFilaVirtualDesdeSesion(session) {
  return {
    row_key: `session-${session.id}`,
    rol_examen_id: session.rol_examen_id,
    session_id: session.id,
    session,
    token: session.token,
    estado: session.estado,
    cantidad_variantes: Number(session.cantidad_variantes || 1),
    roster_count: Number(session.roster_count || 0),
    attempts_count: Number(session.attempts_count || 0),
    materia_codigo: session.rol?.materia_codigo,
    materia_nombre: session.rol?.materia_nombre,
    docente: null,
    sede: session.rol?.sede,
    carrera: session.rol?.carrera,
    grupo: session.rol?.grupo,
    parcial: session.rol?.parcial,
    fecha: session.rol?.fecha,
    hora_inicio: session.rol?.hora_inicio,
    hora_fin: session.rol?.hora_fin,
    banco_total: Number(session.rol?.total_banco || session.rol?.banco_stats?.total || 0),
    banco_facil: Number(session.rol?.banco_facil || session.rol?.banco_stats?.facil || 0),
    banco_medio: Number(session.rol?.banco_medio || session.rol?.banco_stats?.medio || 0),
    banco_dificil: Number(session.rol?.banco_dificil || session.rol?.banco_stats?.dificil || 0),
    banco_g1: Number(session.rol?.banco_g1 || session.rol?.banco_stats?.g1 || 0),
    banco_g2: Number(session.rol?.banco_g2 || session.rol?.banco_stats?.g2 || 0),
    banco_g3: Number(session.rol?.banco_g3 || session.rol?.banco_stats?.g3 || 0),
  }
}

function indiceEstado(estado) {
  return estadosVirtuales.findIndex((item) => item.key === estado)
}

function isEstadoActivo(row, estado) {
  return row.estado === estado
}

function isEstadoCompletado(row, estado) {
  const actual = indiceEstado(row.estado)
  const destino = indiceEstado(estado)
  return actual >= 0 && destino >= 0 && destino < actual
}

function colorBotonEstado(row, estado) {
  if (isEstadoActivo(row, estado))
    return estadosVirtuales.find((item) => item.key === estado)?.color || 'primary'
  if (isEstadoCompletado(row, estado)) return 'green-4'
  return 'grey-4'
}

function textoBotonEstado(row, estado) {
  return isEstadoActivo(row, estado) || isEstadoCompletado(row, estado) ? 'white' : 'grey-8'
}

function puedeEjecutarEstado(row, estado) {
  if (estado === 'GENERADO') return puedeGenerarFila(row)
  if (estado === 'EJECUCION') return puedeIniciarFila(row)
  if (estado === 'REALIZADO') return puedeCerrarFila(row)
  if (estado === 'SUBIDO') return puedeMarcarSubidoFila(row)
  return false
}

function puedeGenerarFila(row) {
  return puedeGenerar.value && ['PROGRAMADO', 'GENERADO'].includes(row.estado)
}

function puedeIniciarFila(row) {
  return puedeIniciar.value && row.session_id && row.estado === 'GENERADO'
}

function puedeCerrarFila(row) {
  return row.session_id && row.estado === 'EJECUCION'
}

function puedeMarcarSubidoFila(row) {
  return puedeGenerar.value && row.session_id && row.estado === 'REALIZADO'
}

function accionKey(row, estado) {
  return `${row.rol_examen_id}-${estado}`
}

async function ejecutarEstado(row, estado) {
  if (estado === 'GENERADO') return abrirDialogGenerar(row)
  if (estado === 'EJECUCION') return iniciarSesion(row)
  if (estado === 'REALIZADO') return cerrarSesion(row)
  if (estado === 'SUBIDO') return marcarSubido(row)
}

function abrirDialogGenerar(row) {
  filaGeneracion.value = row
  const cantidad = Number(variantesPorRol[row.rol_examen_id] || row.cantidad_variantes || 1)
  formGeneracion.variantes = ['A', 'B', 'C', 'D', 'E'].slice(0, Math.min(Math.max(cantidad, 1), 5))
  formGeneracion.duracion_minutos = Number(row.session?.duracion_minutos || 45)
  dialogGenerar.value = true
}

async function confirmarGeneracionVirtual() {
  if (!filaGeneracion.value) return
  await generarVirtual(filaGeneracion.value, {
    cantidad_variantes: formGeneracion.variantes.length,
    duracion_minutos: Number(formGeneracion.duracion_minutos || 45),
  })
}

async function generarVirtual(row, config = {}) {
  const key = accionKey(row, 'GENERADO')
  accionEnProceso.value = key
  try {
    await api.post(`/virtual-exams/rol-examenes/${row.rol_examen_id}/generate`, {
      cantidad_variantes: Number(config.cantidad_variantes || row.cantidad_variantes || 1),
      duracion_minutos: Number(config.duracion_minutos || 45),
    })
    $q.notify({ type: 'positive', message: 'Examen virtual generado.' })
    dialogGenerar.value = false
    await cargarTodo()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo generar el examen virtual.',
      caption: error.response?.data?.message || error.message,
    })
  } finally {
    accionEnProceso.value = null
  }
}

function parseNomina(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[,;\t]/).map((item) => item.trim())
      if (parts.length >= 2) return { codigo: parts[0], nombre: parts.slice(1).join(' ') }
      const [codigo, ...nombre] = line.split(/\s+/)
      return { codigo, nombre: nombre.join(' ') }
    })
    .filter((item) => item.codigo && item.nombre)
}

async function guardarNomina() {
  const estudiantes = parseNomina(nominaTexto.value)
  if (!estudiantes.length) {
    $q.notify({ type: 'warning', message: 'No se detectaron estudiantes validos.' })
    return
  }

  guardandoNomina.value = true
  try {
    await api.post(`/virtual-exams/${sesionActual.value.session_id}/roster`, { estudiantes })
    $q.notify({ type: 'positive', message: `Nomina cargada: ${estudiantes.length}` })
    dialogNomina.value = false
    await cargarTodo()
  } finally {
    guardandoNomina.value = false
  }
}

async function abrirDetalle(row) {
  const { data } = await api.get(`/virtual-exams/${row.session_id}`)
  detalle.value = data
  detalleBusqueda.value = ''
  dialogDetalle.value = true
}

async function abrirDetalleDesdeQuery() {
  const sessionId = route.query.session
  if (!sessionId || dialogDetalle.value) return

  const row = filasVirtuales.value.find((item) => Number(item.session_id) === Number(sessionId))
  if (row) {
    await abrirDetalle(row)
  }
}

async function actualizarValidacionEstudiante(row, estado) {
  if (!detalle.value?.id) return

  const key = `roster-${row.id}-${estado}`
  accionEnProceso.value = key
  try {
    await api.post(`/virtual-exams/${detalle.value.id}/roster/${row.id}/status`, { estado })
    const { data } = await api.get(`/virtual-exams/${detalle.value.id}`)
    detalle.value = data
    await cargarSesiones()
    $q.notify({
      type: estado === 'ACEPTADO' ? 'positive' : 'warning',
      message: `Estudiante ${estado.toLowerCase()}.`,
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo actualizar la validacion.',
      caption: error.response?.data?.message || error.message,
    })
  } finally {
    accionEnProceso.value = null
  }
}

async function iniciarSesion(row) {
  const key = accionKey(row, 'EJECUCION')
  accionEnProceso.value = key
  try {
    await api.post(`/virtual-exams/${row.session_id}/start`)
    $q.notify({
      type: 'positive',
      message: 'Examen iniciado. El reloj de 45 minutos esta corriendo.',
    })
    await cargarTodo()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo iniciar.',
      caption: error.response?.data?.message || error.message,
    })
  } finally {
    accionEnProceso.value = null
  }
}

async function cerrarSesion(row) {
  const key = accionKey(row, 'REALIZADO')
  accionEnProceso.value = key
  try {
    await api.post(`/virtual-exams/${row.session_id}/close`)
    $q.notify({ type: 'positive', message: 'Examen cerrado.' })
    await cargarTodo()
  } finally {
    accionEnProceso.value = null
  }
}

async function exportarRemark(row) {
  const response = await api.get(`/virtual-exams/${row.session_id}/export-remark`, {
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `remark_virtual_${row.session_id}.xlsx`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

async function marcarSubido(row) {
  const key = accionKey(row, 'SUBIDO')
  accionEnProceso.value = key
  try {
    await api.post(`/virtual-exams/${row.session_id}/mark-uploaded`)
    $q.notify({ type: 'positive', message: 'Sesion marcada como subida a Remark.' })
    await cargarTodo()
  } finally {
    accionEnProceso.value = null
  }
}

async function reiniciarSesion(row) {
  $q.dialog({
    title: 'Reiniciar proceso virtual',
    message:
      'Se eliminaran ingresos, registros y respuestas de esta sesion virtual. El examen volvera a Programado.',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const key = accionKey(row, 'RESET')
    accionEnProceso.value = key
    try {
      await api.post(`/virtual-exams/${row.session_id}/reset`)
      $q.notify({ type: 'positive', message: 'Proceso virtual reiniciado.' })
      await cargarTodo()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'No se pudo reiniciar el proceso virtual.',
        caption: error.response?.data?.message || error.message,
      })
    } finally {
      accionEnProceso.value = null
    }
  })
}

function estadoColor(estado) {
  return (
    {
      PROGRAMADO: 'blue-grey',
      GENERADO: 'deep-purple-7',
      EJECUCION: 'orange-8',
      REALIZADO: 'green-7',
      SUBIDO: 'teal-7',
    }[estado] || 'grey'
  )
}

function estadoLabel(estado) {
  return estadosVirtuales.find((item) => item.key === estado)?.label || estado
}

function colorIntento(estado) {
  return (
    {
      INGRESADO: 'orange',
      FINALIZADO: 'green',
      AUTO_CERRADO: 'blue-grey',
      RECHAZADO: 'negative',
    }[estado] || 'grey'
  )
}

function colorValidacion(estado) {
  return (
    {
      ACEPTADO: 'green',
      RECHAZADO: 'negative',
      PENDIENTE: 'blue-grey',
    }[estado] || 'blue-grey'
  )
}

function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha'
  const [year, month, day] = String(fecha).split('T')[0].split('-')
  return year && month && day ? `${day}/${month}/${year}` : fecha
}

function formatearHora(hora) {
  if (!hora) return '--:--'
  return String(hora).slice(0, 5)
}
</script>

<style scoped>
.virtual-exams-page {
  background: #f6f8fb;
  color: #0f172a;
}

.virtual-exams-page--embedded {
  min-height: auto;
  padding: 0;
  background: transparent;
}

.page-title {
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 24px;
  font-weight: 800;
}

.page-subtitle,
.section-subtitle {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
}

.section-title {
  font-size: 16px;
  font-weight: 800;
}

.virtual-table-card {
  border-radius: 12px;
  overflow: hidden;
}

.virtual-table :deep(thead th) {
  background: #e2e8f0;
  color: #334155;
  font-weight: 700;
}

.virtual-flow {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.state-step-btn {
  box-shadow: 0 1px 2px rgb(15 23 42 / 12%);
}

.dialog-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #673ab7;
  color: white;
  font-size: 16px;
  font-weight: 700;
}

.section-label {
  color: #334155;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

.versiones-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.bank-cell {
  min-width: 116px;
}

.detail-box {
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #f8fafc;
  padding: 14px;
}

.detail-box span {
  display: block;
  color: #64748b;
  font-size: 12px;
}

.detail-box strong {
  display: block;
  margin-top: 4px;
  font-size: 18px;
}
</style>
