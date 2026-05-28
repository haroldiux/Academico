<template>
  <q-page class="reporte-evaluaciones-page q-pa-md">
    <div class="page-header row items-center justify-between q-mb-md">
      <div>
        <h1 class="page-title">
          <q-icon name="query_stats" color="primary" class="q-mr-sm" />
          Reporte Evaluaciones
        </h1>
        <p class="page-subtitle">
          Estadisticas operativas de evaluaciones por alcance, estados y fechas.
        </p>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          flat
          round
          dense
          icon="refresh"
          color="grey-7"
          :loading="loadingReporte"
          @click="cargarReporte"
        >
          <q-tooltip>Actualizar reporte</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          color="teal"
          icon="picture_as_pdf"
          label="Exportar PDF"
          no-caps
          :disable="!hayReporteExportable || loadingReporte"
          @click="exportarPdf"
        />
      </div>
    </div>

    <section class="filters-band q-pa-md q-mb-md">
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-2">
          <q-select
            v-model="filtros.alcance"
            :options="alcanceOptions"
            label="Alcance"
            outlined
            dense
            emit-value
            map-options
            :disable="alcanceOptions.length <= 1"
            @update:model-value="onCambiarAlcance"
          >
            <template #prepend>
              <q-icon name="public" />
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model="filtros.gestion" label="Gestion" outlined dense>
            <template #prepend>
              <q-icon name="event_available" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-3">
          <q-select
            v-model="filtros.sede_id"
            :options="sedesOptions"
            label="Sede"
            outlined
            dense
            emit-value
            map-options
            clearable
            :disable="filtros.alcance === 'nacional' || sedeBloqueada"
            @update:model-value="onCambiarSede"
          >
            <template #prepend>
              <q-icon name="apartment" />
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-3">
          <q-select
            v-model="filtros.carrera_id"
            :options="carrerasOptions"
            label="Carrera"
            outlined
            dense
            emit-value
            map-options
            clearable
            :disable="
              !(filtros.alcance === 'carrera' || puedeFiltrarCarreraDeSede) || carreraBloqueada
            "
          >
            <template #prepend>
              <q-icon name="school" />
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-2">
          <q-select
            v-model="filtros.parcial"
            :options="parcialOptions"
            label="Parcial"
            outlined
            dense
            emit-value
            map-options
            clearable
          >
            <template #prepend>
              <q-icon name="assignment" />
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-3">
          <q-select
            v-model="filtros.estados"
            :options="estadoOptions"
            label="Estados"
            outlined
            dense
            multiple
            emit-value
            map-options
            use-chips
            clearable
          >
            <template #prepend>
              <q-icon name="flag" />
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model="filtros.fecha_inicio" type="date" label="Desde" outlined dense />
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model="filtros.fecha_fin" type="date" label="Hasta" outlined dense />
        </div>
        <div class="col-12 col-md-2">
          <q-select
            v-model="filtros.origen"
            :options="origenOptions"
            label="Fuente"
            outlined
            dense
            emit-value
            map-options
          />
        </div>
        <div class="col-12 col-md-3">
          <q-btn
            class="full-width"
            unelevated
            color="primary"
            icon="analytics"
            label="Generar reporte"
            no-caps
            :loading="loadingReporte"
            @click="cargarReporte"
          />
        </div>
      </div>
    </section>

    <q-banner v-if="reporte" dense class="bg-blue-1 text-blue-10 q-mb-md rounded-borders">
      <template #avatar>
        <q-icon name="info" color="primary" />
      </template>
      Reporte generado para <strong>{{ alcanceLabel }}</strong>
      <span v-if="rangoLabel">, {{ rangoLabel }}</span
      >. La cobertura compara programaciones del rol contra registros operativos generados.
    </q-banner>

    <div class="row q-col-gutter-md q-mb-md">
      <div v-for="item in metricasPrincipales" :key="item.key" class="col-12 col-sm-6 col-lg-3">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="metric-label">{{ item.label }}</div>
            <div class="row items-end justify-between">
              <div class="metric-value" :class="item.className">{{ item.value }}</div>
              <q-icon :name="item.icon" :color="item.color" size="28px" />
            </div>
            <div class="metric-caption">{{ item.caption }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-lg-5">
        <q-card flat bordered>
          <q-card-section>
            <div class="section-title">Estados</div>
            <div class="section-subtitle">Distribucion del flujo operativo</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div v-for="estado in estadosRows" :key="estado.estado" class="state-row">
              <div class="row items-center justify-between q-mb-xs">
                <div class="row items-center">
                  <q-icon :name="getEstadoIcon(estado.estado)" class="q-mr-sm" color="primary" />
                  <span class="text-weight-medium">{{ estado.label }}</span>
                </div>
                <span class="text-weight-bold">{{ estado.total }}</span>
              </div>
              <div class="state-breakdown">
                Rol {{ estado.programados || 0 }} / Manual {{ estado.operativos || 0 }}
              </div>
              <q-linear-progress
                rounded
                size="8px"
                :value="getEstadoProgress(estado.total)"
                color="primary"
                track-color="grey-3"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-7">
        <q-card flat bordered>
          <q-card-section>
            <div class="section-title">Tendencia por fecha</div>
            <div class="section-subtitle">Programados, generados y finalizados en el rango</div>
          </q-card-section>
          <q-table
            flat
            dense
            :rows="fechaRows"
            :columns="fechaColumns"
            row-key="fecha"
            :loading="loadingReporte"
            :rows-per-page-options="[7, 15, 30]"
            no-data-label="No hay datos por fecha para los filtros seleccionados."
          />
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-lg-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="section-title">Resumen por sede</div>
          </q-card-section>
          <q-table
            flat
            dense
            :rows="sedeRows"
            :columns="agrupacionColumns"
            row-key="id"
            :loading="loadingReporte"
            :rows-per-page-options="[5, 10, 20]"
            no-data-label="Sin datos por sede."
          >
            <template #body-cell-avance="props">
              <q-td :props="props">
                <div class="avance-cell">
                  <q-linear-progress
                    rounded
                    size="8px"
                    :value="getAvanceAgrupacion(props.row)"
                    color="teal"
                    track-color="grey-3"
                  />
                  <span>{{ getAvanceAgrupacionLabel(props.row) }}</span>
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card>
      </div>

      <div class="col-12 col-lg-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="section-title">Resumen por carrera</div>
          </q-card-section>
          <q-table
            flat
            dense
            :rows="carreraRows"
            :columns="agrupacionColumns"
            row-key="id"
            :loading="loadingReporte"
            :rows-per-page-options="[5, 10, 20]"
            no-data-label="Sin datos por carrera."
          >
            <template #body-cell-avance="props">
              <q-td :props="props">
                <div class="avance-cell">
                  <q-linear-progress
                    rounded
                    size="8px"
                    :value="getAvanceAgrupacion(props.row)"
                    color="teal"
                    track-color="grey-3"
                  />
                  <span>{{ getAvanceAgrupacionLabel(props.row) }}</span>
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>

    <q-card flat bordered>
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="section-title">Detalle del reporte</div>
          <div class="section-subtitle">
            Maximo 500 registros para consulta y exportacion rapida
          </div>
        </div>
        <q-input
          v-model="busqueda"
          dense
          outlined
          clearable
          placeholder="Buscar materia, docente, carrera, sede o estado"
          style="width: min(420px, 100%)"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>
      <q-table
        flat
        :rows="detalleFiltrado"
        :columns="detalleColumns"
        row-key="row_key"
        :loading="loadingReporte"
        :rows-per-page-options="[10, 25, 50, 100]"
        no-data-label="No hay registros para los filtros seleccionados."
      >
        <template #body-cell-origen="props">
          <q-td :props="props">
            <q-chip
              :color="props.row.origen === 'manual' ? 'deep-purple' : 'blue-grey'"
              text-color="white"
              size="sm"
              dense
            >
              {{ props.row.origen === 'manual' ? 'Operativo' : 'Rol' }}
            </q-chip>
          </q-td>
        </template>
        <template #body-cell-estado="props">
          <q-td :props="props">
            <q-chip :color="getEstadoColor(props.row.estado)" text-color="white" size="sm" dense>
              {{ props.row.estado_label || props.row.estado }}
            </q-chip>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-card flat bordered class="q-mt-md">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="section-title">Banco por asignatura y grupo</div>
          <div class="section-subtitle">
            Preguntas por parcial, fechas de examenes y docentes por sede/carrera.
          </div>
        </div>
        <div class="row q-gutter-sm">
          <q-input
            v-model="busquedaCoberturaBanco"
            dense
            outlined
            clearable
            placeholder="Buscar sede, carrera, materia, grupo o docente"
            style="width: min(420px, 100%)"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn
            flat
            round
            dense
            color="grey-7"
            icon="refresh"
            :loading="loadingCoberturaBanco"
            @click="cargarCoberturaBanco"
          >
            <q-tooltip>Actualizar cobertura de banco</q-tooltip>
          </q-btn>
          <q-btn
            unelevated
            color="teal"
            icon="print"
            label="Imprimir cobertura"
            no-caps
            :disable="!hayCoberturaExportable || loadingCoberturaBanco"
            @click="exportarCoberturaBancoPdf"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <div class="coverage-total-card">
            <div>
              <div class="metric-label">Materias</div>
              <div class="metric-value">{{ coberturaResumen.total_materias || 0 }}</div>
            </div>
            <q-icon name="menu_book" color="primary" size="28px" />
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="coverage-total-card">
            <div>
              <div class="metric-label">Materia-grupos</div>
              <div class="metric-value">{{ coberturaResumen.total_grupos || 0 }}</div>
            </div>
            <q-icon name="groups" color="teal" size="28px" />
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="coverage-total-card">
            <div>
              <div class="metric-label">Preguntas registradas</div>
              <div class="metric-value">{{ coberturaResumen.total_preguntas || 0 }}</div>
            </div>
            <q-icon name="quiz" color="deep-purple" size="28px" />
          </div>
        </div>
      </q-card-section>

      <q-table
        flat
        dense
        :rows="coberturaBancoFiltrado"
        :columns="coberturaBancoColumns"
        row-key="row_key"
        :loading="loadingCoberturaBanco"
        :rows-per-page-options="[10, 25, 50, 100]"
        no-data-label="No hay asignaturas con grupos para los filtros seleccionados."
      >
        <template #body-cell-materia="props">
          <q-td :props="props">
            <div class="text-weight-bold">{{ props.row.codigo }} - {{ props.row.asignatura }}</div>
            <div class="text-caption text-grey-7">
              {{ props.row.sede }} / {{ props.row.carrera }}
              <span v-if="props.row.semestre"> / Sem. {{ props.row.semestre }}</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-docente="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.docente }}</div>
            <div class="text-caption text-grey-7">Grupo {{ props.row.grupo }}</div>
          </q-td>
        </template>

        <template
          v-for="parcial in coberturaParcialKeys"
          :key="parcial"
          #[`body-cell-${parcial}`]="props"
        >
          <q-td :props="props">
            <div class="coverage-partial-cell">
              <q-chip
                dense
                size="sm"
                :color="
                  getCoberturaParcial(props.row, parcial).preguntas > 0 ? 'green-1' : 'grey-2'
                "
                :text-color="
                  getCoberturaParcial(props.row, parcial).preguntas > 0 ? 'green-9' : 'grey-8'
                "
                class="text-weight-bold"
              >
                {{ getCoberturaParcial(props.row, parcial).preguntas || 0 }} preg.
              </q-chip>
              <div class="text-caption text-grey-7 q-mt-xs">
                {{ getCoberturaParcial(props.row, parcial).fecha || 'Sin fecha' }}
              </div>
              <div
                v-if="getCoberturaParcial(props.row, parcial).estado_label"
                class="text-caption text-blue-grey-7"
              >
                {{ getCoberturaParcial(props.row, parcial).estado_label }}
              </div>
            </div>
          </q-td>
        </template>
      </q-table>

      <q-separator />

      <q-card-section>
        <div class="section-title q-mb-sm">Resumen por parcial</div>
        <q-table
          flat
          dense
          :rows="coberturaResumenParciales"
          :columns="coberturaResumenColumns"
          row-key="key"
          :rows-per-page-options="[4]"
          hide-pagination
          no-data-label="Sin resumen de cobertura."
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { date, useQuasar } from 'quasar'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

import { api } from 'boot/axios'
import { ROLES, useAuthStore } from 'src/stores/auth'
import { useCarrerasStore } from 'src/stores/carreras'
import { useSedesStore } from 'src/stores/sedes'

const $q = useQuasar()
const authStore = useAuthStore()
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()

const today = new Date()
const filtros = reactive({
  alcance: 'nacional',
  gestion: '2026-I',
  sede_id: null,
  carrera_id: null,
  parcial: null,
  estados: [],
  origen: 'todos',
  fecha_inicio: date.formatDate(new Date(today.getFullYear(), today.getMonth(), 1), 'YYYY-MM-DD'),
  fecha_fin: date.formatDate(today, 'YYYY-MM-DD'),
})

const reporte = ref(null)
const coberturaBanco = ref(null)
const loadingReporte = ref(false)
const loadingCoberturaBanco = ref(false)
const busqueda = ref('')
const busquedaCoberturaBanco = ref('')

const alcanceOptionsBase = [
  { label: 'Nacional', value: 'nacional' },
  { label: 'Sede', value: 'sede' },
  { label: 'Carrera', value: 'carrera' },
]

const parcialOptions = [
  { label: '1er Parcial', value: '1er Parcial' },
  { label: '2do Parcial', value: '2do Parcial' },
  { label: 'Final', value: 'Final' },
  { label: '2da Instancia', value: '2da Instancia' },
]

const origenOptions = [
  { label: 'Todo', value: 'todos' },
  { label: 'Rol oficial', value: 'rol' },
  { label: 'Operativo', value: 'manual' },
]

const estadoOptions = [
  { label: 'Programado', value: 'PROGRAMADO' },
  { label: 'Generado', value: 'GENERADO' },
  { label: 'Impreso', value: 'IMPRESO' },
  { label: 'Entregado', value: 'ENTREGADO' },
  { label: 'Devuelto', value: 'DEVUELTO' },
  { label: 'Revisado', value: 'REVISADO' },
  { label: 'Subido', value: 'SUBIDO' },
]

const estadoMeta = {
  PROGRAMADO: { icon: 'event_note', color: 'blue-7' },
  GENERADO: { icon: 'auto_awesome', color: 'indigo-7' },
  IMPRESO: { icon: 'print', color: 'green-7' },
  ENTREGADO: { icon: 'inventory_2', color: 'orange-8' },
  DEVUELTO: { icon: 'assignment_returned', color: 'teal-7' },
  REVISADO: { icon: 'fact_check', color: 'deep-purple-7' },
  SUBIDO: { icon: 'cloud_done', color: 'purple-9' },
}

const rolActual = computed(() => authStore.rol)
const esAlcanceGlobal = computed(() =>
  [
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN,
    ROLES.VICERRECTOR_NACIONAL,
    ROLES.RESPONSABLE_EVALUACIONES,
  ].includes(rolActual.value),
)
const esAlcanceCarrera = computed(() => rolActual.value === ROLES.DIRECTOR_CARRERA)
const esAlcanceSede = computed(() =>
  [ROLES.EVALUACIONES, ROLES.VICERRECTOR_SEDE, ROLES.DIRECCION_ACADEMICA].includes(rolActual.value),
)
const puedeFiltrarCarreraDeSede = computed(() =>
  [ROLES.VICERRECTOR_SEDE, ROLES.DIRECCION_ACADEMICA].includes(rolActual.value),
)

const sedeIdsPermitidas = computed(() => {
  if (esAlcanceGlobal.value) return []

  const usuario = authStore.usuarioActual || {}
  const ids = [
    usuario.sede_id,
    usuario.director?.sede_id,
    usuario.director?.sede?.id,
    ...(Array.isArray(usuario.sede_ids) ? usuario.sede_ids : []),
    ...(Array.isArray(usuario.sedes_asignadas)
      ? usuario.sedes_asignadas.map((sede) => sede.id || sede.value)
      : []),
    ...(Array.isArray(usuario.campus_asignados)
      ? usuario.campus_asignados.map((campus) => campus.sede_id)
      : []),
  ]

  return [...new Set(ids.map((id) => Number(id)).filter(Boolean))]
})

const carreraIdsPermitidas = computed(() => {
  if (!esAlcanceCarrera.value) return []

  const usuario = authStore.usuarioActual || {}
  const director = usuario.director || {}
  const ids = [
    usuario.carrera_id,
    director.carrera_id,
    ...(Array.isArray(director.carreras) ? director.carreras.map((carrera) => carrera.id) : []),
  ]

  return [...new Set(ids.map((id) => Number(id)).filter(Boolean))]
})

const alcanceOptions = computed(() => {
  if (esAlcanceCarrera.value) {
    return alcanceOptionsBase.filter((item) => item.value === 'carrera')
  }

  if (esAlcanceSede.value) {
    return alcanceOptionsBase.filter(
      (item) =>
        item.value === 'sede' || (puedeFiltrarCarreraDeSede.value && item.value === 'carrera'),
    )
  }

  return alcanceOptionsBase
})

const sedeBloqueada = computed(() => !esAlcanceGlobal.value && sedeIdsPermitidas.value.length <= 1)
const carreraBloqueada = computed(
  () => esAlcanceCarrera.value && carreraIdsPermitidas.value.length <= 1,
)

const sedesOptions = computed(() =>
  (sedesStore.sedes || [])
    .filter(
      (sede) =>
        esAlcanceGlobal.value || sedeIdsPermitidas.value.includes(Number(sede.id || sede.value)),
    )
    .map((sede) => ({
      label: sede.nombre,
      value: sede.id,
    })),
)

const carrerasOptions = computed(() => {
  const lista = filtros.sede_id
    ? carrerasStore.getCarrerasBySede(filtros.sede_id)
    : carrerasStore.carreras

  return (lista || [])
    .filter(
      (carrera) =>
        !carreraIdsPermitidas.value.length ||
        carreraIdsPermitidas.value.includes(Number(carrera.id)),
    )
    .map((carrera) => ({
      label: carrera.nombre,
      value: carrera.id,
    }))
})

const resumen = computed(() => reporte.value?.resumen || {})
const estadosRows = computed(() => reporte.value?.por_estado || [])
const fechaRows = computed(() => reporte.value?.por_fecha || [])
const sedeRows = computed(() => reporte.value?.por_sede || [])
const carreraRows = computed(() => reporte.value?.por_carrera || [])
const detalleRows = computed(() =>
  (reporte.value?.detalle || []).map((row, index) => ({
    ...row,
    row_key: `${row.origen}-${row.id}-${index}`,
  })),
)
const coberturaResumen = computed(() => coberturaBanco.value?.resumen || {})
const coberturaResumenParciales = computed(() => coberturaResumen.value?.parciales || [])
const coberturaParcialKeys = ['primer', 'segundo', 'final', 'instancia']
const coberturaBancoRows = computed(() =>
  (coberturaBanco.value?.detalle || []).map((row, index) => ({
    ...row,
    row_key: `${row.sede_id}-${row.carrera_id}-${row.asignatura_id}-${row.grupo_id}-${index}`,
  })),
)
const coberturaBancoFiltrado = computed(() => {
  const term = normalizarBusqueda(busquedaCoberturaBanco.value)
  if (!term) return coberturaBancoRows.value

  return coberturaBancoRows.value.filter((row) =>
    [
      row.sede,
      row.carrera,
      row.codigo,
      row.asignatura,
      row.semestre,
      row.grupo,
      row.docente,
      row.total_preguntas,
    ]
      .join(' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .includes(term),
  )
})
const hayCoberturaExportable = computed(() => coberturaBancoRows.value.length > 0)
const hayReporteExportable = computed(() => {
  if (!reporte.value) return false

  return [
    resumen.value.programados_rol,
    resumen.value.registros_operativos,
    resumen.value.generados,
    resumen.value.finalizados,
    estadosRows.value.length,
    fechaRows.value.length,
    sedeRows.value.length,
    carreraRows.value.length,
    detalleRows.value.length,
  ].some((value) => Number(value || 0) > 0)
})

const alcanceLabel = computed(() => {
  if (filtros.alcance === 'nacional') return 'nivel nacional'
  const sede = sedesOptions.value.find((item) => item.value === filtros.sede_id)?.label
  const carrera = carrerasOptions.value.find((item) => item.value === filtros.carrera_id)?.label
  if (filtros.alcance === 'sede') {
    return [sede, carrera].filter(Boolean).join(' / ') || sede || 'sede seleccionada'
  }
  return [sede, carrera].filter(Boolean).join(' / ') || 'carrera seleccionada'
})

const rangoLabel = computed(() => {
  if (!filtros.fecha_inicio && !filtros.fecha_fin) return ''
  if (filtros.fecha_inicio && filtros.fecha_fin) {
    return `${filtros.fecha_inicio} al ${filtros.fecha_fin}`
  }
  return filtros.fecha_inicio ? `desde ${filtros.fecha_inicio}` : `hasta ${filtros.fecha_fin}`
})

const metricasPrincipales = computed(() => [
  {
    key: 'programados',
    label: 'Programados en rol',
    value: resumen.value.programados_rol || 0,
    caption: 'Examenes del rol oficial',
    icon: 'event_note',
    color: 'blue-7',
  },
  {
    key: 'operativos',
    label: 'Registros operativos',
    value: resumen.value.registros_operativos || 0,
    caption: 'Generaciones y seguimiento',
    icon: 'assignment_turned_in',
    color: 'deep-purple',
  },
  {
    key: 'generados',
    label: 'Generados',
    value: `${resumen.value.generados || 0}`,
    caption: `${resumen.value.cobertura_generacion || 0}% de cobertura sobre rol`,
    icon: 'auto_awesome',
    color: 'indigo-7',
  },
  {
    key: 'finalizados',
    label: 'Finalizados',
    value: `${resumen.value.finalizados || 0}`,
    caption: `${resumen.value.avance_finalizacion || 0}% con notas subidas`,
    icon: 'cloud_done',
    color: 'purple-9',
  },
])

const maxEstadoTotal = computed(() =>
  Math.max(...estadosRows.value.map((item) => Number(item.total || 0)), 1),
)

const detalleFiltrado = computed(() => {
  const term = normalizarBusqueda(busqueda.value)

  if (!term) return detalleRows.value

  return detalleRows.value.filter((row) =>
    [
      row.sede,
      row.carrera,
      row.materia_codigo,
      row.materia_nombre,
      row.docente,
      row.parcial,
      row.grupo,
      row.estado_label,
    ]
      .join(' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .includes(term),
  )
})

const fechaColumns = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'programados', label: 'Rol', field: 'programados', align: 'center', sortable: true },
  { name: 'operativos', label: 'Operativos', field: 'operativos', align: 'center', sortable: true },
  { name: 'generados', label: 'Generados', field: 'generados', align: 'center', sortable: true },
  { name: 'finalizados', label: 'Subidos', field: 'finalizados', align: 'center', sortable: true },
]

const agrupacionColumns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'programados', label: 'Rol', field: 'programados', align: 'center', sortable: true },
  { name: 'operativos', label: 'Oper.', field: 'operativos', align: 'center', sortable: true },
  { name: 'generados', label: 'Gen.', field: 'generados', align: 'center', sortable: true },
  { name: 'finalizados', label: 'Sub.', field: 'finalizados', align: 'center', sortable: true },
  { name: 'avance', label: 'Avance', align: 'left' },
]

const detalleColumns = [
  { name: 'origen', label: 'Fuente', field: 'origen', align: 'center', sortable: true },
  { name: 'sede', label: 'Sede', field: 'sede', align: 'left', sortable: true },
  { name: 'carrera', label: 'Carrera', field: 'carrera', align: 'left', sortable: true },
  {
    name: 'materia',
    label: 'Materia',
    field: (row) => [row.materia_codigo, row.materia_nombre].filter(Boolean).join(' - '),
    align: 'left',
    sortable: true,
  },
  { name: 'docente', label: 'Docente', field: 'docente', align: 'left', sortable: true },
  { name: 'parcial', label: 'Parcial', field: 'parcial', align: 'center', sortable: true },
  { name: 'grupo', label: 'Grupo', field: 'grupo', align: 'center', sortable: true },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'center', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
]

const coberturaBancoColumns = [
  {
    name: 'materia',
    label: 'Asignatura / Grupo',
    field: (row) => [row.codigo, row.asignatura, row.grupo].filter(Boolean).join(' '),
    align: 'left',
    sortable: true,
  },
  { name: 'docente', label: 'Docente', field: 'docente', align: 'left', sortable: true },
  { name: 'primer', label: '1er Parcial', align: 'center' },
  { name: 'segundo', label: '2do Parcial', align: 'center' },
  { name: 'final', label: 'Final', align: 'center' },
  { name: 'instancia', label: 'Instancia', align: 'center' },
]

const coberturaResumenColumns = [
  { name: 'label', label: 'Parcial', field: 'label', align: 'left', sortable: true },
  { name: 'materias', label: 'Materias', field: 'materias', align: 'center', sortable: true },
  {
    name: 'materias_porcentaje',
    label: '% materias',
    field: 'materias_porcentaje',
    align: 'center',
    format: (value) => `${Number(value || 0)}%`,
    sortable: true,
  },
  { name: 'grupos', label: 'Grupos', field: 'grupos', align: 'center', sortable: true },
  {
    name: 'grupos_porcentaje',
    label: '% grupos',
    field: 'grupos_porcentaje',
    align: 'center',
    format: (value) => `${Number(value || 0)}%`,
    sortable: true,
  },
  { name: 'preguntas', label: 'Preguntas', field: 'preguntas', align: 'center', sortable: true },
]

function normalizarBusqueda(value) {
  return value
    ? value
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    : ''
}

function onCambiarAlcance(value) {
  if (value === 'nacional') {
    filtros.sede_id = null
    filtros.carrera_id = null
  }
  if (value === 'sede' && !puedeFiltrarCarreraDeSede.value) {
    filtros.carrera_id = null
  }
}

function onCambiarSede() {
  filtros.carrera_id = null
}

function getEstadoIcon(estado) {
  return estadoMeta[estado]?.icon || 'radio_button_checked'
}

function getEstadoColor(estado) {
  return estadoMeta[estado]?.color || 'grey-7'
}

function getEstadoProgress(valor) {
  return Number(valor || 0) / maxEstadoTotal.value
}

function getAvanceAgrupacion(row) {
  const base = Number(row.programados || row.operativos || 0)
  if (!base) return 0
  return Math.min(Number(row.finalizados || 0) / base, 1)
}

function getAvanceAgrupacionLabel(row) {
  return `${Math.round(getAvanceAgrupacion(row) * 100)}%`
}

function buildParams() {
  return {
    gestion: filtros.gestion || undefined,
    sede_id: filtros.alcance !== 'nacional' ? filtros.sede_id || undefined : undefined,
    carrera_id:
      filtros.alcance === 'carrera' || puedeFiltrarCarreraDeSede.value
        ? filtros.carrera_id || undefined
        : undefined,
    parcial: filtros.parcial || undefined,
    fecha_inicio: filtros.fecha_inicio || undefined,
    fecha_fin: filtros.fecha_fin || undefined,
    estado: filtros.estados?.length ? filtros.estados.join(',') : undefined,
    origen: filtros.origen || 'todos',
  }
}

function buildCoberturaBancoParams() {
  return {
    gestion: filtros.gestion || undefined,
    sede_id: filtros.alcance !== 'nacional' ? filtros.sede_id || undefined : undefined,
    carrera_id:
      filtros.alcance === 'carrera' || puedeFiltrarCarreraDeSede.value
        ? filtros.carrera_id || undefined
        : undefined,
    fecha_inicio: filtros.fecha_inicio || undefined,
    fecha_fin: filtros.fecha_fin || undefined,
  }
}

function aplicarAlcanceUsuario() {
  if (esAlcanceCarrera.value) {
    filtros.alcance = 'carrera'
    filtros.sede_id = sedeIdsPermitidas.value[0] || authStore.usuarioActual?.sede_id || null
    filtros.carrera_id =
      carreraIdsPermitidas.value[0] || authStore.usuarioActual?.carrera_id || null
    return
  }

  if (esAlcanceSede.value) {
    filtros.alcance = 'sede'
    filtros.sede_id = sedeIdsPermitidas.value[0] || authStore.usuarioActual?.sede_id || null
    filtros.carrera_id = null
  }
}

async function cargarReporte() {
  if (filtros.alcance === 'sede' && !filtros.sede_id) {
    $q.notify({ type: 'warning', message: 'Selecciona una sede para generar el reporte.' })
    return
  }

  if (filtros.alcance === 'carrera' && (!filtros.sede_id || !filtros.carrera_id)) {
    $q.notify({ type: 'warning', message: 'Selecciona sede y carrera para generar el reporte.' })
    return
  }

  loadingReporte.value = true
  try {
    const { data } = await api.get('/reportes/evaluaciones', { params: buildParams() })
    reporte.value = data
    await cargarCoberturaBanco()
  } catch (error) {
    console.error('Error cargando reporte de evaluaciones:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo generar el reporte de evaluaciones.',
      caption: error.response?.data?.message || error.message,
    })
  } finally {
    loadingReporte.value = false
  }
}

async function cargarCoberturaBanco() {
  if (filtros.alcance === 'sede' && !filtros.sede_id) {
    $q.notify({ type: 'warning', message: 'Selecciona una sede para generar la cobertura.' })
    return
  }

  if (filtros.alcance === 'carrera' && (!filtros.sede_id || !filtros.carrera_id)) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona sede y carrera para generar la cobertura.',
    })
    return
  }

  loadingCoberturaBanco.value = true
  try {
    const { data } = await api.get('/reportes/evaluaciones/cobertura-banco', {
      params: buildCoberturaBancoParams(),
    })
    coberturaBanco.value = data
  } catch (error) {
    console.error('Error cargando cobertura de banco:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo generar la cobertura de banco.',
      caption: error.response?.data?.message || error.message,
    })
  } finally {
    loadingCoberturaBanco.value = false
  }
}

function getCoberturaParcial(row, parcial) {
  return (
    row?.parciales?.[parcial] || {
      label: parcial,
      preguntas: 0,
      fecha: null,
      hora: null,
      estado_label: null,
    }
  )
}

function formatCoberturaParcialPdf(row, parcial) {
  const item = getCoberturaParcial(row, parcial)
  const fecha = item.fecha || 'Sin fecha'
  const hora = item.hora ? ` ${item.hora}` : ''
  const estado = item.estado_label ? `\n${item.estado_label}` : ''
  return `${Number(item.preguntas || 0)} preg.\n${fecha}${hora}${estado}`
}

function pdfValue(value) {
  return String(value ?? '').trim() || '-'
}

function pdfPercent(value) {
  return `${Number(value || 0)}%`
}

function exportarPdf() {
  if (!hayReporteExportable.value) {
    $q.notify({ type: 'warning', message: 'Genera un reporte con datos antes de exportar.' })
    return
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const generatedAt = date.formatDate(new Date(), 'DD/MM/YYYY HH:mm')
  const sede =
    filtros.alcance === 'nacional' ? 'Nacional' : alcanceLabel.value.split(' / ')[0] || '-'
  const carrera =
    filtros.carrera_id && alcanceLabel.value.includes(' / ')
      ? alcanceLabel.value.split(' / ')[1] || '-'
      : 'Todas'
  const rango = rangoLabel.value || 'Sin rango de fechas'
  const parcial = filtros.parcial || 'Todos'
  const fuente = origenOptions.find((item) => item.value === filtros.origen)?.label || 'Todo'
  const estados = filtros.estados?.length
    ? filtros.estados
        .map((estado) => estadoOptions.find((item) => item.value === estado)?.label || estado)
        .join(', ')
    : 'Todos'
  const detalleExportable = detalleFiltrado.value

  const drawFooter = () => {
    doc.setFontSize(7)
    doc.setTextColor(100)
    doc.text(`Pagina ${doc.internal.getNumberOfPages()}`, pageWidth - 14, pageHeight - 7, {
      align: 'right',
    })
  }

  const addSectionTitle = (title, spacing = 7) => {
    let y = (doc.lastAutoTable?.finalY || 20) + spacing
    if (y > pageHeight - 20) {
      doc.addPage()
      y = 16
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    doc.text(title, 14, y)
    return y + 3
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('REPORTE DE EVALUACIONES', 14, 14)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generado: ${generatedAt}`, pageWidth - 14, 14, { align: 'right' })

  autoTable(doc, {
    startY: 20,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 1.5 },
    body: [
      ['Alcance', alcanceLabel.value, 'Gestion', filtros.gestion || '-'],
      ['Sede', sede, 'Carrera', carrera],
      ['Rango de fechas', rango, 'Parcial', parcial],
      ['Fuente', fuente, 'Estados', estados],
      ['Registros de detalle', detalleExportable.length, 'Generado por', authStore.nombreCompleto],
    ],
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 28 },
      1: { cellWidth: 115 },
      2: { fontStyle: 'bold', cellWidth: 32 },
      3: { cellWidth: 70 },
    },
  })

  const resumenStartY = addSectionTitle('Resumen general', 5)
  autoTable(doc, {
    startY: resumenStartY,
    head: [
      [
        'Programados en rol',
        'Registros operativos',
        'Generados',
        'Finalizados',
        'Cobertura',
        'Avance',
      ],
    ],
    body: [
      [
        resumen.value.programados_rol || 0,
        resumen.value.registros_operativos || 0,
        resumen.value.generados || 0,
        resumen.value.finalizados || 0,
        pdfPercent(resumen.value.cobertura_generacion),
        pdfPercent(resumen.value.avance_finalizacion),
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [21, 101, 192], textColor: 255, fontSize: 8 },
    styles: { fontSize: 8, halign: 'center' },
    didDrawPage: drawFooter,
  })

  const estadosStartY = addSectionTitle('Distribucion por estado')
  autoTable(doc, {
    startY: estadosStartY,
    head: [['Estado', 'Rol', 'Manual', 'Total']],
    body: estadosRows.value.map((row) => [
      pdfValue(row.label || row.estado),
      row.programados || 0,
      row.operativos || 0,
      row.total || 0,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7.4, cellPadding: 1.5 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' },
    },
    didDrawPage: drawFooter,
  })

  const tendenciaStartY = addSectionTitle('Tendencia por fecha')
  autoTable(doc, {
    startY: tendenciaStartY,
    head: [['Fecha', 'Rol', 'Operativos', 'Generados', 'Subidos']],
    body: fechaRows.value.map((row) => [
      pdfValue(row.fecha),
      row.programados || 0,
      row.operativos || 0,
      row.generados || 0,
      row.finalizados || 0,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7.2, cellPadding: 1.4 },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 28, halign: 'center' },
      3: { cellWidth: 28, halign: 'center' },
      4: { cellWidth: 28, halign: 'center' },
    },
    didDrawPage: drawFooter,
  })

  const sedeStartY = addSectionTitle('Resumen por sede')
  autoTable(doc, {
    startY: sedeStartY,
    head: [['Sede', 'Rol', 'Operativos', 'Generados', 'Subidos', 'Avance']],
    body: sedeRows.value.map((row) => [
      pdfValue(row.nombre),
      row.programados || 0,
      row.operativos || 0,
      row.generados || 0,
      row.finalizados || 0,
      getAvanceAgrupacionLabel(row),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [5, 150, 105], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7.2, cellPadding: 1.4 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 28, halign: 'center' },
      3: { cellWidth: 28, halign: 'center' },
      4: { cellWidth: 28, halign: 'center' },
      5: { cellWidth: 24, halign: 'center' },
    },
    didDrawPage: drawFooter,
  })

  const carreraStartY = addSectionTitle('Resumen por carrera')
  autoTable(doc, {
    startY: carreraStartY,
    head: [['Carrera', 'Rol', 'Operativos', 'Generados', 'Subidos', 'Avance']],
    body: carreraRows.value.map((row) => [
      pdfValue(row.nombre),
      row.programados || 0,
      row.operativos || 0,
      row.generados || 0,
      row.finalizados || 0,
      getAvanceAgrupacionLabel(row),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [124, 58, 237], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 1.3, overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 95 },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 28, halign: 'center' },
      3: { cellWidth: 28, halign: 'center' },
      4: { cellWidth: 28, halign: 'center' },
      5: { cellWidth: 24, halign: 'center' },
    },
    didDrawPage: drawFooter,
  })

  if (detalleExportable.length) {
    const detalleStartY = addSectionTitle('Detalle del reporte')
    autoTable(doc, {
      startY: detalleStartY,
      head: [
        ['Fuente', 'Sede', 'Carrera', 'Materia', 'Docente', 'Parcial', 'Grupo', 'Fecha', 'Estado'],
      ],
      body: detalleExportable.map((row) => [
        row.origen === 'manual' ? 'Manual' : 'Rol',
        pdfValue(row.sede),
        pdfValue(row.carrera),
        pdfValue([row.materia_codigo, row.materia_nombre].filter(Boolean).join(' - ')),
        pdfValue(row.docente),
        pdfValue(row.parcial),
        pdfValue(row.grupo),
        pdfValue(row.fecha),
        pdfValue(row.estado_label || row.estado),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 7 },
      styles: { fontSize: 6.6, cellPadding: 1.4, overflow: 'linebreak', valign: 'middle' },
      columnStyles: {
        0: { cellWidth: 14, halign: 'center' },
        1: { cellWidth: 24 },
        2: { cellWidth: 42 },
        3: { cellWidth: 56 },
        4: { cellWidth: 44 },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 13, halign: 'center' },
        7: { cellWidth: 20, halign: 'center' },
        8: { cellWidth: 20, halign: 'center' },
      },
      didDrawPage: drawFooter,
    })
  }

  const fileDate = date.formatDate(new Date(), 'YYYYMMDD_HHmm')
  doc.save(`reporte_evaluaciones_${fileDate}.pdf`)
}

function exportarCoberturaBancoPdf() {
  if (!hayCoberturaExportable.value) {
    $q.notify({ type: 'warning', message: 'Genera la cobertura con datos antes de imprimir.' })
    return
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [215.9, 330.2] })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const generatedAt = date.formatDate(new Date(), 'DD/MM/YYYY HH:mm')
  const sede =
    filtros.alcance === 'nacional' ? 'Todas las sedes' : alcanceLabel.value.split(' / ')[0] || '-'
  const carrera =
    filtros.carrera_id && alcanceLabel.value.includes(' / ')
      ? alcanceLabel.value.split(' / ')[1] || '-'
      : 'Todas las carreras'
  const rows = coberturaBancoRows.value

  const drawFooter = () => {
    doc.setFontSize(7)
    doc.setTextColor(100)
    doc.text(`Pagina ${doc.internal.getNumberOfPages()}`, pageWidth - 14, pageHeight - 7, {
      align: 'right',
    })
    doc.text(`Fecha de impresion: ${generatedAt}`, 14, pageHeight - 7)
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('COBERTURA DE BANCO POR ASIGNATURA Y GRUPO', 14, 14)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Fecha de impresion: ${generatedAt}`, pageWidth - 14, 14, { align: 'right' })

  autoTable(doc, {
    startY: 20,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 1.5 },
    body: [
      ['Gestion', filtros.gestion || '-', 'Alcance', alcanceLabel.value],
      ['Sede', sede, 'Carrera', carrera],
      ['Rango de fechas', rangoLabel.value || 'Sin rango de fechas', 'Registros', rows.length],
      [
        'Totales',
        `${coberturaResumen.value.total_materias || 0} materias / ${
          coberturaResumen.value.total_grupos || 0
        } grupos`,
        'Preguntas',
        coberturaResumen.value.total_preguntas || 0,
      ],
    ],
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 28 },
      1: { cellWidth: 115 },
      2: { fontStyle: 'bold', cellWidth: 32 },
      3: { cellWidth: 70 },
    },
  })

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY || 24) + 5,
    head: [['Sede', 'Carrera', 'Asignatura', 'Grupo', 'Docente', '1er', '2do', 'Final', 'Inst.']],
    body: rows.map((row) => [
      pdfValue(row.sede),
      pdfValue(row.carrera),
      pdfValue([row.codigo, row.asignatura].filter(Boolean).join(' - ')),
      pdfValue(row.grupo),
      pdfValue(row.docente),
      formatCoberturaParcialPdf(row, 'primer'),
      formatCoberturaParcialPdf(row, 'segundo'),
      formatCoberturaParcialPdf(row, 'final'),
      formatCoberturaParcialPdf(row, 'instancia'),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontSize: 6.8 },
    styles: { fontSize: 6.2, cellPadding: 1.2, overflow: 'linebreak', valign: 'top' },
    columnStyles: {
      0: { cellWidth: 23 },
      1: { cellWidth: 38 },
      2: { cellWidth: 54 },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 42 },
      5: { cellWidth: 26, halign: 'center' },
      6: { cellWidth: 26, halign: 'center' },
      7: { cellWidth: 26, halign: 'center' },
      8: { cellWidth: 26, halign: 'center' },
    },
    didDrawPage: drawFooter,
  })

  let resumenStartY = (doc.lastAutoTable?.finalY || 20) + 8
  if (resumenStartY > pageHeight - 45) {
    doc.addPage()
    resumenStartY = 16
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  doc.text('Resumen final de cobertura', 14, resumenStartY)

  autoTable(doc, {
    startY: resumenStartY + 4,
    head: [['Parcial', 'Materias', '% materias', 'Grupos', '% grupos', 'Preguntas']],
    body: coberturaResumenParciales.value.map((row) => [
      pdfValue(row.label),
      row.materias || 0,
      pdfPercent(row.materias_porcentaje),
      row.grupos || 0,
      pdfPercent(row.grupos_porcentaje),
      row.preguntas || 0,
    ]),
    foot: [
      [
        'Total',
        coberturaResumen.value.total_materias || 0,
        '100%',
        coberturaResumen.value.total_grupos || 0,
        '100%',
        coberturaResumen.value.total_preguntas || 0,
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 8 },
    footStyles: { fillColor: [226, 232, 240], textColor: [15, 23, 42], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 1.5, halign: 'center' },
    columnStyles: {
      0: { halign: 'left' },
    },
    didDrawPage: drawFooter,
  })

  const fileDate = date.formatDate(new Date(), 'YYYYMMDD_HHmm')
  doc.save(`cobertura_banco_${fileDate}.pdf`)
}

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await authStore.fetchUser()
  }
  await Promise.all([sedesStore.fetchSedes(), carrerasStore.fetchCarreras()])
  aplicarAlcanceUsuario()
  cargarReporte()
})
</script>

<style scoped>
.reporte-evaluaciones-page {
  background: #f6f8fb;
  color: #0f172a;
}

.page-title {
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0;
}

.page-subtitle {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 13px;
}

.filters-band {
  width: 100%;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #ffffff;
}

.metric-card {
  min-height: 116px;
  border-radius: 8px;
}

.metric-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.metric-value {
  margin-top: 6px;
  color: #0f172a;
  font-size: 30px;
  font-weight: 850;
  line-height: 1;
}

.metric-caption {
  margin-top: 8px;
  color: #64748b;
  font-size: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 800;
}

.section-subtitle {
  color: #64748b;
  font-size: 12px;
}

.state-row {
  margin-bottom: 14px;
}

.state-breakdown {
  margin-bottom: 4px;
  color: #64748b;
  font-size: 11px;
}

.avance-cell {
  display: grid;
  grid-template-columns: minmax(80px, 1fr) 38px;
  align-items: center;
  gap: 8px;
  min-width: 130px;
  color: #334155;
  font-size: 12px;
}

.coverage-total-card {
  display: flex;
  min-height: 86px;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #f8fafc;
  padding: 14px 16px;
}

.coverage-partial-cell {
  min-width: 112px;
  line-height: 1.25;
}
</style>
