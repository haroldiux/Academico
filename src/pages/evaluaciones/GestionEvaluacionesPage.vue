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
        <div class="header-actions row q-gutter-x-sm">
          <q-btn flat round dense color="grey-7" icon="refresh" @click="cargarDatos">
            <q-tooltip>Actualizar Lista</q-tooltip>
          </q-btn>
          <q-btn
            v-if="puedeVerGeneracionManual"
            unelevated
            rounded
            color="deep-purple-7"
            icon="upload_file"
            label="Generación Manual (Excel)"
            no-caps
            @click="abrirGeneracionManual"
          />
        </div>
      </div>
    </div>

    <!-- Statistics & Printable list button -->
    <div class="row q-col-gutter-sm q-mb-lg items-center">
      <div class="col-12 col-md-2">
        <q-select
          v-model="filtros.sede"
          :options="sedesOptions"
          outlined
          dense
          label="Sede"
          :clearable="!debeLimitarSedes"
          :readonly="esSedeRestringida"
          :loading="loadingOptions.sedes"
          bg-color="white"
        />
      </div>
      <div class="col-12 col-md-2">
        <q-select
          v-model="filtros.carrera"
          :options="carrerasOptions"
          outlined
          dense
          label="Carrera"
          clearable
          :loading="loadingOptions.carreras"
          bg-color="white"
        />
      </div>
      <div class="col-12 col-md-2">
        <q-select
          v-model="filtros.parcial"
          :options="parcialesOptions"
          outlined
          dense
          label="Parcial"
          clearable
          bg-color="white"
        />
      </div>
      <div class="col-12 col-md-4">
        <div class="date-range-controls">
          <q-input
            v-model="filtros.fechaInicio"
            outlined
            dense
            type="date"
            label="Fecha inicio"
            clearable
            bg-color="white"
            class="date-range-input"
          />
          <q-input
            v-model="filtros.fechaFin"
            outlined
            dense
            type="date"
            label="Fecha fin"
            clearable
            bg-color="white"
            class="date-range-input"
          />
          <q-btn unelevated color="blue-7" icon="assessment" @click="dialogStats = true">
            <q-tooltip>Ver Estadisticas del Rango</q-tooltip>
          </q-btn>
          <q-btn unelevated color="deep-purple" icon="print" @click="imprimirListaDiaria">
            <q-tooltip>Imprimir Lista de Seguimiento</q-tooltip>
          </q-btn>
        </div>
      </div>
      <div class="col-12 col-md-2 text-right">
        <q-btn
          flat
          dense
          icon="filter_alt_off"
          label="Limpiar Filtros"
          color="grey-7"
          no-caps
          @click="limpiarFiltros"
        />
      </div>
    </div>

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-md-5 col-lg-4">
        <q-input
          v-model="filtros.busqueda"
          outlined
          dense
          clearable
          debounce="250"
          label="Buscar evaluacion"
          placeholder="Codigo, asignatura o docente"
          bg-color="white"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Tab Selector -->
    <div class="row q-mb-md justify-center">
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey-7 bg-white shadow-1 rounded-borders"
        active-color="deep-purple-7"
        indicator-color="deep-purple-7"
        align="justify"
        style="width: 100%; max-width: 600px"
      >
        <q-tab name="rol" icon="assignment" label="Evaluaciones del Rol" />
        <q-tab
          v-if="puedeVerGeneracionManual"
          name="manual"
          icon="history_edu"
          label="Generaciones Manuales"
        />
      </q-tabs>
    </div>

    <!-- State Buttons Filter (Only for Rol Tab) -->
    <div
      v-if="activeTab === 'rol'"
      class="row q-mb-lg bg-white q-pa-sm rounded-borders shadow-1 items-center justify-center"
    >
      <div class="text-caption text-grey-8 q-mr-md text-weight-bold">ETAPA ACTUAL:</div>
      <div class="row q-gutter-x-xs">
        <q-btn
          unelevated
          rounded
          dense
          no-caps
          :color="filtros.estado.length === 0 ? 'deep-purple' : 'grey-2'"
          :text-color="filtros.estado.length === 0 ? 'white' : 'grey-8'"
          label="Todos"
          class="q-px-md"
          @click="filtros.estado = []"
        />
        <q-btn
          v-for="st in ESTADOS_FLOW"
          :key="st.key"
          unelevated
          rounded
          dense
          no-caps
          :color="filtros.estado.includes(st.key) ? 'deep-purple' : 'grey-2'"
          :text-color="filtros.estado.includes(st.key) ? 'white' : 'grey-8'"
          :label="st.label"
          class="q-px-md"
          @click="toggleEstadoFiltro(st.key)"
        />
      </div>
    </div>

    <!-- Summary Cards (HIDDEN AS PER REQUEST, ACCESSIBLE VIA MODAL) -->
    <!-- <div class="row q-col-gutter-md q-mb-xl">...</div> -->

    <!-- Modal: Estadísticas del Día -->
    <q-dialog v-model="dialogStats" backdrop-filter="blur(4px)">
      <q-card style="width: 500px; max-width: 90vw; border-radius: 16px">
        <q-card-section class="bg-blue-8 text-white row items-center no-wrap">
          <q-icon name="analytics" size="24px" class="q-mr-sm" />
          <div class="text-h6 text-weight-bold">Resumen de Evaluaciones</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="text-subtitle2 text-grey-7 q-mb-md">
            PARA EL RANGO:
            <span class="text-weight-bold text-black">{{ etiquetaRangoFechas }}</span>
          </div>

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
              <div class="text-caption text-grey-8 text-weight-bold q-mb-sm">
                DESGLOSE POR ESTADOS:
              </div>
              <q-list separator bordered class="rounded-borders">
                <q-item v-for="st in statsDesglose" :key="st.key" class="q-py-sm">
                  <q-item-section avatar>
                    <q-icon :name="st.icon" :color="st.color" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ st.label }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge
                      :color="st.color"
                      text-color="white"
                      class="text-weight-bold q-px-md"
                      >{{ st.count }}</q-badge
                    >
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Main Table -->
    <q-card v-if="activeTab === 'rol'" class="table-card" flat bordered>
      <q-table
        :rows="examenesFiltrados"
        :columns="columns"
        row-key="id"
        flat
        dense
        :pagination="{ rowsPerPage: 10 }"
        class="main-table"
      >
        <!-- Materia / Carrera / Grupo -->
        <template v-slot:body-cell-materia="props">
          <q-td :props="props">
            <div class="flex items-center no-wrap">
              <q-chip
                :color="props.row.color_materia || 'blue-8'"
                text-color="white"
                size="sm"
                dense
                class="q-mr-sm materia-codigo-chip"
              >
                {{ props.row.codigo }}
              </q-chip>
              <div>
                <div class="text-weight-bold">{{ props.row.materia }}</div>
                <div class="text-caption text-grey-6">
                  {{ props.row.carrera }} - Sem. {{ props.row.semestre }} - G. {{ props.row.grupo }}
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Docente -->
        <template v-slot:body-cell-docente="props">
          <q-td :props="props">
            <div class="text-weight-medium text-uppercase text-grey-9 text-caption">
              {{ props.row.docente }}
            </div>
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
              <div class="text-weight-bold text-grey-9">
                {{ formatFriendlyDate(props.row.fecha_examen) }}
              </div>
            </div>
            <div class="row items-center no-wrap q-mt-xs">
              <q-icon name="schedule" color="deep-purple-4" size="14px" class="q-mr-xs" />
              <div class="text-caption text-weight-medium text-deep-purple-7">
                {{ props.row.hora }}
              </div>
            </div>
          </q-td>
        </template>

        <!-- Banco de Preguntas (Indicator) -->
        <template v-slot:body-cell-banco="props">
          <q-td :props="props" align="center">
            <template v-if="!examenConCartilla(props.row)">
              <q-chip
                color="grey-2"
                text-color="grey-8"
                size="sm"
                icon="remove_circle_outline"
                class="text-weight-bold"
              >
                NO APLICA
                <q-tooltip>El examen fue marcado como sin cartilla</q-tooltip>
              </q-chip>
            </template>
            <template v-else>
              <div class="banco-disponibilidad">
                <q-chip
                  :color="
                    getBancoDisponibilidad(props.row).dificultad.disponible ? 'green-1' : 'grey-2'
                  "
                  :text-color="
                    getBancoDisponibilidad(props.row).dificultad.disponible ? 'green-9' : 'grey-8'
                  "
                  size="sm"
                  :icon="
                    getBancoDisponibilidad(props.row).dificultad.disponible
                      ? 'check_circle'
                      : 'help_outline'
                  "
                  class="text-weight-bold banco-mini-chip"
                >
                  DIF. {{ getBancoDisponibilidad(props.row).dificultad.resumen }}
                  <q-tooltip>
                    {{ getBancoDisponibilidad(props.row).dificultad.tooltip }}
                  </q-tooltip>
                </q-chip>
                <q-chip
                  v-if="getBancoDisponibilidad(props.row).gruposTipo"
                  :color="
                    getBancoDisponibilidad(props.row).gruposTipo.disponible ? 'green-1' : 'grey-2'
                  "
                  :text-color="
                    getBancoDisponibilidad(props.row).gruposTipo.disponible ? 'green-9' : 'grey-8'
                  "
                  size="sm"
                  :icon="
                    getBancoDisponibilidad(props.row).gruposTipo.disponible
                      ? 'check_circle'
                      : 'help_outline'
                  "
                  class="text-weight-bold banco-mini-chip"
                >
                  TIPOS {{ getBancoDisponibilidad(props.row).gruposTipo.resumen }}
                  <q-tooltip>
                    {{ getBancoDisponibilidad(props.row).gruposTipo.tooltip }}
                  </q-tooltip>
                </q-chip>
              </div>
            </template>
          </q-td>
        </template>

        <!-- Cartilla -->
        <template v-slot:body-cell-cartilla="props">
          <q-td :props="props" align="center">
            <q-chip
              :color="examenConCartilla(props.row) ? 'indigo-1' : 'orange-1'"
              :text-color="examenConCartilla(props.row) ? 'indigo-9' : 'orange-10'"
              size="sm"
              :icon="examenConCartilla(props.row) ? 'fact_check' : 'mail_outline'"
              class="text-weight-bold"
            >
              {{ examenConCartilla(props.row) ? 'CON CARTILLA' : 'SIN CARTILLA' }}
              <q-tooltip>
                {{
                  examenConCartilla(props.row)
                    ? 'Se genera con cartilla de respuestas'
                    : 'Se debe enviar el examen por correo'
                }}
              </q-tooltip>
            </q-chip>
          </q-td>
        </template>

        <!-- Preguntas (Progress Bar) -->
        <template v-slot:body-cell-preguntas="props">
          <q-td :props="props">
            <div class="preguntas-cell">
              <div class="flex justify-between items-center q-mb-xs">
                <span class="text-weight-bold">{{ props.row.total_preguntas }}</span>
                <span class="text-caption text-grey-6"
                  >{{ props.row.distribucion.facil }}F / {{ props.row.distribucion.medio }}M /
                  {{ props.row.distribucion.dificil }}D</span
                >
              </div>
              <div class="distribution-bar">
                <div
                  class="bar-segment facile"
                  :style="{
                    width:
                      (props.row.distribucion.facil / (props.row.total_preguntas || 1)) * 100 + '%',
                  }"
                >
                  <q-tooltip>Fáciles: {{ props.row.distribucion.facil }}</q-tooltip>
                </div>
                <div
                  class="bar-segment medio"
                  :style="{
                    width:
                      (props.row.distribucion.medio / (props.row.total_preguntas || 1)) * 100 + '%',
                  }"
                >
                  <q-tooltip>Medios: {{ props.row.distribucion.medio }}</q-tooltip>
                </div>
                <div
                  class="bar-segment dificil"
                  :style="{
                    width:
                      (props.row.distribucion.dificil / (props.row.total_preguntas || 1)) * 100 +
                      '%',
                  }"
                >
                  <q-tooltip>Difíciles: {{ props.row.distribucion.dificil }}</q-tooltip>
                </div>
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
              <div
                v-for="(st, i) in ESTADOS_FLOW"
                :key="i"
                class="bullet-dot"
                :class="{
                  active: isEstadoActive(props.row.estado, st.key),
                  completed: isEstadoCompleted(props.row.estado, st.key),
                }"
              >
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
            <div
              v-if="puedeVerAcciones && props.row.estado !== 'programados'"
              class="flex items-center justify-center gap-1"
            >
              <!-- Variantes generadas -->
              <template v-if="props.row.variantes && props.row.variantes.length > 0">
                <q-btn
                  flat
                  round
                  dense
                  color="red-8"
                  icon="picture_as_pdf"
                  size="sm"
                  @click="abrirExamenGenerado(props.row)"
                >
                  <q-tooltip>Examen (Consolidado)</q-tooltip>
                </q-btn>
              </template>
              <div v-else class="text-caption text-grey-4 text-xs">Sin variantes</div>

              <q-separator
                vertical
                class="q-mx-xs"
                v-if="
                  props.row.patrones &&
                  props.row.patrones.length > 0 &&
                  [
                    'generados',
                    'impresos',
                    'entregados',
                    'devueltos',
                    'revisados',
                    'subidos',
                  ].includes(props.row.estado)
                "
              />

              <!-- Patrones generados (Visibles desde generado, bloqueados hasta DEVUELTOS) -->
              <template
                v-if="
                  props.row.patrones &&
                  props.row.patrones.length > 0 &&
                  [
                    'generados',
                    'impresos',
                    'entregados',
                    'devueltos',
                    'revisados',
                    'subidos',
                  ].includes(props.row.estado)
                "
              >
                <div class="row no-wrap">
                  <q-btn
                    flat
                    round
                    dense
                    color="teal-7"
                    icon="quiz"
                    size="sm"
                    @click="abrirPatronGenerado(props.row, 'pdf')"
                    v-if="props.row.patrones[0].pdf"
                    :disable="!['devueltos', 'revisados', 'subidos'].includes(props.row.estado)"
                  >
                    <q-tooltip>
                      {{
                        ['devueltos', 'revisados', 'subidos'].includes(props.row.estado)
                          ? 'Respuestas OMR (Consolidado)'
                          : 'Bloqueado hasta estado DEVUELTO'
                      }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    color="green-8"
                    icon="description"
                    size="sm"
                    @click="abrirPatronGenerado(props.row, 'xlsx')"
                    v-if="props.row.patrones[0].xlsx"
                    :disable="!['devueltos', 'revisados', 'subidos'].includes(props.row.estado)"
                  >
                    <q-tooltip>
                      {{
                        ['devueltos', 'revisados', 'subidos'].includes(props.row.estado)
                          ? 'Patrón Excel (Consolidado)'
                          : 'Bloqueado hasta estado DEVUELTO'
                      }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </template>
            </div>
            <div v-else class="text-caption text-grey-4 text-xs">Esperando generación</div>
          </q-td>
        </template>

        <!-- Acciones -->
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" align="center">
            <div v-if="puedeVerAcciones" class="acciones-row justify-center no-wrap">
              <!-- Botón Dinámico Llamativo -->

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
                  :disable="
                    !puedeCambiarEstadoPorTiempo(props.row).permitido ||
                    estaGeneracionEnProceso(props.row)
                  "
                  @click="gestionarEstado(props.row)"
                >
                  <q-tooltip>
                    {{
                      (estaGeneracionEnProceso(props.row)
                        ? 'La generación consolidada sigue en proceso.'
                        : puedeCambiarEstadoPorTiempo(props.row).mensaje) ||
                      'Gestionar etapa de evaluación'
                    }}
                  </q-tooltip>
                </q-btn>
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
                  :disable="!puedeCambiarEstadoPorTiempo(props.row).permitido"
                  @click="avanzarDirecto(props.row)"
                >
                  <q-tooltip>
                    {{
                      puedeCambiarEstadoPorTiempo(props.row).mensaje ||
                      'Avanzar a la siguiente etapa'
                    }}
                  </q-tooltip>
                </q-btn>
              </template>

              <!-- Botón Restaurar (Solo Admins) -->
              <q-btn
                v-if="(esAdmin || esSuperAdmin) && props.row.estado !== 'programados'"
                flat
                dense
                round
                color="red-5"
                icon="restart_alt"
                class="q-ml-sm"
                @click="resetearExamen(props.row)"
              >
                <q-tooltip>Restaurar a Programado (Limpiar generación)</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Manual Generations Table -->
    <q-card v-if="activeTab === 'manual'" class="table-card" flat bordered>
      <q-table
        :rows="manualGenerationsFiltradas"
        :columns="manualColumns"
        row-key="id"
        flat
        :loading="loadingManual"
        no-data-label="No hay registros de generaciones manuales"
      >
        <!-- Materia / Carrera / Grupo -->
        <template v-slot:body-cell-materia="props">
          <q-td :props="props">
            <div class="flex items-center no-wrap">
              <q-chip color="deep-purple-8" text-color="white" size="xs" dense class="q-mr-sm">
                MANUAL
              </q-chip>
              <div>
                <div class="text-weight-bold">{{ props.row.asignatura_nombre }}</div>
                <div class="text-caption text-grey-6">
                  {{ props.row.carrera_nombre }} - G. {{ props.row.grupo }}
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Docente -->
        <template v-slot:body-cell-docente="props">
          <q-td :props="props">
            <div class="text-weight-medium text-uppercase text-grey-9 text-caption">
              {{ props.row.docente_nombre }}
            </div>
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
              <div class="text-weight-bold text-grey-9">
                {{ formatFriendlyDate(props.row.fecha_examen) }}
              </div>
            </div>
            <div class="row items-center no-wrap q-mt-xs">
              <q-icon name="schedule" color="deep-purple-4" size="14px" class="q-mr-xs" />
              <div class="text-caption text-weight-medium text-deep-purple-7">
                {{ props.row.hora }}
              </div>
            </div>
          </q-td>
        </template>

        <!-- Preguntas (Progress Bar) -->
        <template v-slot:body-cell-preguntas="props">
          <q-td :props="props">
            <div class="preguntas-cell">
              <div class="flex justify-between items-center q-mb-xs">
                <span class="text-weight-bold">{{ getManualStats(props.row).total }}</span>
                <span class="text-caption text-grey-6">
                  {{ getManualStats(props.row).facil }}F / {{ getManualStats(props.row).medio }}M /
                  {{ getManualStats(props.row).dificil }}D
                </span>
              </div>
              <div class="distribution-bar">
                <div
                  class="bar-segment facile"
                  :style="{
                    width:
                      (getManualStats(props.row).facil / (getManualStats(props.row).total || 1)) *
                        100 +
                      '%',
                  }"
                >
                  <q-tooltip>Fáciles</q-tooltip>
                </div>
                <div
                  class="bar-segment medio"
                  :style="{
                    width:
                      (getManualStats(props.row).medio / (getManualStats(props.row).total || 1)) *
                        100 +
                      '%',
                  }"
                >
                  <q-tooltip>Medios</q-tooltip>
                </div>
                <div
                  class="bar-segment dificil"
                  :style="{
                    width:
                      (getManualStats(props.row).dificil / (getManualStats(props.row).total || 1)) *
                        100 +
                      '%',
                  }"
                >
                  <q-tooltip>Difíciles</q-tooltip>
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Estado -->
        <template v-slot:body-cell-estado="props">
          <q-td :props="props" align="center">
            <q-btn-group
              rounded
              unelevated
              class="bg-grey-2 border-grey-3 overflow-hidden shadow-1"
            >
              <q-btn
                v-for="est in ['GENERADO', 'ENTREGADO', 'DEVUELTO']"
                :key="est"
                dense
                size="sm"
                :padding="props.row.estado === est ? '4px 12px' : '4px 8px'"
                :color="props.row.estado === est ? getManualActiveColor(est) : 'transparent'"
                :text-color="props.row.estado === est ? 'white' : 'grey-5'"
                :icon="getManualEstadoIcon(est)"
                :disable="estaGeneracionManualEnProceso(props.row)"
                @click="confirmarEstadoManual(props.row, est)"
                class="transition-all"
              >
                <div
                  v-if="props.row.estado === est"
                  class="q-ml-sm text-caption text-weight-bolder"
                  style="font-size: 10px; letter-spacing: 0.05em"
                >
                  {{ est }}
                </div>
                <q-tooltip
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[0, 8]"
                  transition-show="scale"
                  transition-hide="scale"
                  class="bg-grey-9"
                >
                  Cambiar estado a: <b>{{ est }}</b>
                </q-tooltip>
              </q-btn>
            </q-btn-group>
            <div class="q-mt-xs">
              <q-chip
                v-if="getManualJobStatus(props.row)"
                dense
                size="sm"
                :color="getManualJobColor(props.row)"
                text-color="white"
                :icon="estaGeneracionManualEnProceso(props.row) ? 'hourglass_top' : 'task_alt'"
              >
                {{ getManualJobLabel(props.row) }}
                <q-tooltip v-if="props.row.configuracion_json?.job_error">
                  {{ props.row.configuracion_json.job_error }}
                </q-tooltip>
              </q-chip>
            </div>
          </q-td>
        </template>

        <!-- Documentos -->
        <template v-slot:body-cell-documentos="props">
          <q-td :props="props" align="center">
            <div class="flex items-center justify-center gap-1">
              <!-- Examen (Consolidado) -->
              <q-btn
                flat
                round
                dense
                color="red-8"
                icon="picture_as_pdf"
                size="sm"
                :loading="estaGeneracionManualEnProceso(props.row)"
                :disable="estaGeneracionManualEnProceso(props.row)"
                @click="descargarPDFManual(props.row)"
              >
                <q-tooltip>
                  {{
                    estaGeneracionManualEnProceso(props.row)
                      ? 'La generación manual sigue ejecutándose en el servidor'
                      : 'Examen (Consolidado)'
                  }}
                </q-tooltip>
              </q-btn>

              <q-separator
                vertical
                class="q-mx-xs"
                v-if="
                  ['GENERADO', 'ENTREGADO', 'DEVUELTO'].includes(props.row.estado.toUpperCase())
                "
              />

              <!-- Patrón OMR (PDF) -->
              <q-btn
                flat
                round
                dense
                color="teal-7"
                icon="picture_as_pdf"
                size="sm"
                :disable="
                  props.row.estado.toUpperCase() !== 'DEVUELTO' ||
                  estaGeneracionManualEnProceso(props.row)
                "
                @click="descargarPatronPdfManual(props.row)"
                v-if="
                  ['GENERADO', 'ENTREGADO', 'DEVUELTO'].includes(props.row.estado.toUpperCase())
                "
              >
                <q-tooltip>
                  {{
                    props.row.estado.toUpperCase() === 'DEVUELTO'
                      ? 'Patrón OMR (Consolidado)'
                      : 'Bloqueado hasta estado DEVUELTO'
                  }}
                </q-tooltip>
              </q-btn>

              <!-- Patrón Excel (XLSX) -->
              <q-btn
                flat
                round
                dense
                color="green-8"
                icon="backup_table"
                size="sm"
                :disable="
                  props.row.estado.toUpperCase() !== 'DEVUELTO' ||
                  estaGeneracionManualEnProceso(props.row)
                "
                @click="descargarPatronXlsxManual(props.row)"
                v-if="
                  ['GENERADO', 'ENTREGADO', 'DEVUELTO'].includes(props.row.estado.toUpperCase())
                "
              >
                <q-tooltip>
                  {{
                    props.row.estado.toUpperCase() === 'DEVUELTO'
                      ? 'Patrón Excel (Consolidado)'
                      : 'Bloqueado hasta estado DEVUELTO'
                  }}
                </q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <!-- Auditoría -->
        <template v-slot:body-cell-datos_auditoria="props">
          <q-td :props="props">
            <div class="row flex-center no-wrap gap-2">
              <q-avatar size="24px" color="blue-1" text-color="blue-9">
                {{ props.row.user?.name?.charAt(0) }}
                <q-tooltip>Responsable: {{ props.row.user?.name }}</q-tooltip>
              </q-avatar>
              <div
                style="
                  max-width: 150px;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
                class="text-caption italic text-grey"
              >
                "{{ props.row.motivo }}"
                <q-tooltip>{{ props.row.motivo }}</q-tooltip>
              </div>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- UI Modal: Gestión Especializada -->
    <q-dialog v-model="dialogGestion.show" backdrop-filter="blur(4px)">
      <q-card style="width: 700px; max-width: 90vw; border-radius: 20px">
        <q-card-section class="bg-deep-purple text-white q-pa-lg">
          <div class="row items-center no-wrap justify-between">
            <div class="flex items-center no-wrap">
              <q-icon :name="configGestion.icon" size="32px" class="q-mr-md" />
              <div>
                <div class="text-h6 text-weight-bold">{{ configGestion.titulo }}</div>
                <div class="text-subtitle2">
                  {{ dialogGestion.examen?.materia }} - Grupo {{ dialogGestion.examen?.grupo }}
                </div>
              </div>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <!-- CASO 1: PROGRAMADOS (Generación) -->
          <div v-if="dialogGestion.examen?.estado === 'programados'" class="config-generacion">
            <div
              v-if="bancoStats.total > 0"
              class="q-pa-md rounded-borders q-mb-lg flex justify-between items-center bg-indigo-50 border-indigo-200 shadow-1"
            >
              <div class="flex items-center text-indigo-9">
                <q-icon name="help_center" size="24px" class="q-mr-md" />
                <div class="column">
                  <span class="text-weight-bold">Banco Disponible para esta Evaluación</span>
                  <span class="text-caption"
                    >Se encontraron preguntas que coinciden con el Parcial y Grupo.</span
                  >
                </div>
              </div>
              <div class="text-h4 text-indigo-7 text-weight-bolder">
                {{ bancoStats.total }}
              </div>
            </div>

            <q-banner
              v-if="bancoStats.total === 0 && (bancoTotalAsignatura || 0) > 0"
              class="bg-amber-1 text-amber-9 rounded-borders q-mb-lg border-amber"
              dense
              bordered
            >
              <template v-slot:avatar
                ><q-icon name="warning" color="amber-9" size="32px"
              /></template>
              <div class="text-weight-bold">Aviso de Disponibilidad:</div>
              No hay preguntas para este <b>Grupo o Parcial</b>, pero tienes
              <b>{{ bancoTotalAsignatura }}</b> preguntas en total en la asignatura. Verifica que el
              Grupo en el Excel coincida con el del Rol de Examen.
            </q-banner>
            <div class="text-subtitle1 text-weight-bold q-mb-md flex items-center">
              <q-icon name="tune" color="primary" class="q-mr-xs" />
              Parámetros de Generación
            </div>

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-md-8">
                <q-input
                  v-model.number="tempConfig.cantVariantes"
                  outlined
                  label="Cantidad de Variantes (Max 5)"
                  type="number"
                  min="1"
                  max="5"
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
              <div class="col-12">
                <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
                  Conteo requerido por dificultad desde configuración
                </div>
              </div>
              <div class="col-12 col-md-4">
                <q-card flat bordered class="q-pa-sm bg-green-1">
                  <div class="text-caption text-weight-bold text-green-9">Fáciles</div>
                  <q-linear-progress
                    rounded
                    size="8px"
                    color="green"
                    :value="
                      Number(tempConfig.facil || 0)
                        ? Math.min(1, bancoStats.facil / Number(tempConfig.facil || 0))
                        : 0
                    "
                    class="q-my-xs"
                  />
                  <div class="row items-center no-wrap">
                    <q-input
                      v-model.number="tempConfig.facil"
                      borderless
                      dense
                      type="number"
                      color="green"
                      readonly
                      input-class="text-green-10 text-weight-bold"
                      class="difficulty-count-input"
                    />
                    <div class="text-caption text-grey-7 q-ml-xs">disp. {{ bancoStats.facil }}</div>
                  </div>
                </q-card>
              </div>
              <div class="col-12 col-md-4">
                <q-card flat bordered class="q-pa-sm bg-orange-1">
                  <div class="text-caption text-weight-bold text-orange-9">Medios</div>
                  <q-linear-progress
                    rounded
                    size="8px"
                    color="orange"
                    :value="
                      Number(tempConfig.medio || 0)
                        ? Math.min(1, bancoStats.medio / Number(tempConfig.medio || 0))
                        : 0
                    "
                    class="q-my-xs"
                  />
                  <div class="row items-center no-wrap">
                    <q-input
                      v-model.number="tempConfig.medio"
                      borderless
                      dense
                      type="number"
                      color="orange"
                      readonly
                      input-class="text-orange-10 text-weight-bold"
                      class="difficulty-count-input"
                    />
                    <div class="text-caption text-grey-7 q-ml-xs">disp. {{ bancoStats.medio }}</div>
                  </div>
                </q-card>
              </div>
              <div class="col-12 col-md-4">
                <q-card flat bordered class="q-pa-sm bg-red-1">
                  <div class="text-caption text-weight-bold text-red-9">Difíciles</div>
                  <q-linear-progress
                    rounded
                    size="8px"
                    color="red"
                    :value="
                      Number(tempConfig.dificil || 0)
                        ? Math.min(1, bancoStats.dificil / Number(tempConfig.dificil || 0))
                        : 0
                    "
                    class="q-my-xs"
                  />
                  <div class="row items-center no-wrap">
                    <q-input
                      v-model.number="tempConfig.dificil"
                      borderless
                      dense
                      type="number"
                      color="red"
                      readonly
                      input-class="text-red-10 text-weight-bold"
                      class="difficulty-count-input"
                    />
                    <div class="text-caption text-grey-7 q-ml-xs">
                      disp. {{ bancoStats.dificil }}
                    </div>
                  </div>
                </q-card>
              </div>
            </div>

            <div v-if="esSegundoParcialGestion" class="row q-col-gutter-sm q-mt-md">
              <div class="col-12">
                <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
                  Conteo requerido por grupo de tipo para 2do Parcial
                </div>
              </div>
              <div class="col-12 col-md-4">
                <q-card flat bordered class="q-pa-sm bg-green-1">
                  <div class="text-caption text-weight-bold text-green-9">G1 VF + Clave + A/B</div>
                  <q-linear-progress
                    rounded
                    size="8px"
                    color="green"
                    :value="Math.min(1, bancoGrupoTipoStats.g1 / DEFAULT_GRUPOS_TIPO_2P.g1)"
                    class="q-my-xs"
                  />
                  <div class="text-caption text-right text-green-10">
                    {{ bancoGrupoTipoStats.g1 }}
                    <span class="text-grey-7">/ {{ DEFAULT_GRUPOS_TIPO_2P.g1 }}</span>
                  </div>
                </q-card>
              </div>
              <div class="col-12 col-md-4">
                <q-card flat bordered class="q-pa-sm bg-blue-1">
                  <div class="text-caption text-weight-bold text-blue-9">G2 Mejor respuesta</div>
                  <q-linear-progress
                    rounded
                    size="8px"
                    color="blue"
                    :value="Math.min(1, bancoGrupoTipoStats.g2 / DEFAULT_GRUPOS_TIPO_2P.g2)"
                    class="q-my-xs"
                  />
                  <div class="text-caption text-right text-blue-10">
                    {{ bancoGrupoTipoStats.g2 }}
                    <span class="text-grey-7">/ {{ DEFAULT_GRUPOS_TIPO_2P.g2 }}</span>
                  </div>
                </q-card>
              </div>
              <div class="col-12 col-md-4">
                <q-card flat bordered class="q-pa-sm bg-purple-1">
                  <div class="text-caption text-weight-bold text-purple-9">
                    G3 Casos + emparejamiento
                  </div>
                  <q-linear-progress
                    rounded
                    size="8px"
                    color="purple"
                    :value="Math.min(1, bancoGrupoTipoStats.g3 / DEFAULT_GRUPOS_TIPO_2P.g3)"
                    class="q-my-xs"
                  />
                  <div class="text-caption text-right text-purple-10">
                    {{ bancoGrupoTipoStats.g3 }}
                    <span class="text-grey-7">/ {{ DEFAULT_GRUPOS_TIPO_2P.g3 }}</span>
                  </div>
                </q-card>
              </div>
            </div>

            <q-separator class="q-my-md" />
            <div class="row q-mb-sm">
              <div class="text-subtitle2 text-grey-8 flex items-center">
                <q-icon name="print" color="grey-6" class="q-mr-xs" />
                Configuración de Impresión
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="tempConfig.fontFamily"
                  :options="optionsFuente"
                  outlined
                  dense
                  label="Fuente"
                  emit-value
                  map-options
                >
                  <template v-slot:prepend><q-icon name="font_download" size="xs" /></template>
                </q-select>
              </div>
              <div class="col-6 col-md-3">
                <q-select
                  v-model="tempConfig.fontSize"
                  :options="optionsTamanio"
                  outlined
                  dense
                  label="Tamaño"
                >
                  <template v-slot:prepend><q-icon name="format_size" size="xs" /></template>
                </q-select>
              </div>
              <div class="col-6 col-md-3">
                <q-select
                  v-model="tempConfig.lineSpacing"
                  :options="optionsEspaciado"
                  outlined
                  dense
                  label="Espacio"
                  emit-value
                  map-options
                >
                  <template v-slot:prepend
                    ><q-icon name="format_line_spacing" size="xs"
                  /></template>
                </q-select>
              </div>
            </div>

            <div class="total-badge q-mt-sm row justify-end items-center q-gutter-x-sm">
              <q-chip
                v-if="!bancoPuedeGenerar"
                dense
                color="red-1"
                text-color="red-7"
                icon="error_outline"
                label="Banco Insuficiente"
                class="text-weight-bold"
              />
              <q-chip
                label
                outline
                :color="bancoPuedeGenerar ? 'primary' : 'red'"
                class="text-weight-bold"
              >
                TOTAL PREGUNTAS: {{ tempConfig.facil + tempConfig.medio + tempConfig.dificil }}
              </q-chip>
            </div>

            <q-banner class="bg-blue-1 text-blue-9 q-mt-lg rounded-borders row items-center" dense>
              <template v-slot:avatar><q-icon name="verified" /></template>
              Regla aplicada desde nivel:
              <strong class="text-uppercase q-ml-xs">{{ configOrigenActual }}</strong>
              <span class="q-ml-sm" v-if="configOrigenActual !== 'nacional'"
                >( {{ dialogGestion.examen?.sede }}
                {{ configOrigenActual === 'carrera' ? '> ' + dialogGestion.examen?.carrera : '' }}
                )</span
              >
            </q-banner>

            <q-banner
              v-if="!bancoSuficiente"
              class="bg-red-1 text-red-9 q-mt-sm rounded-borders"
              dense
            >
              <template v-slot:avatar><q-icon name="warning" color="red" /></template>
              No existen suficientes preguntas en el banco para cumplir con la distribución
              solicitada por dificultad.
            </q-banner>

            <q-banner
              v-if="esSegundoParcialGestion && !bancoGrupoTipoSuficiente"
              class="bg-red-1 text-red-9 q-mt-sm rounded-borders"
              dense
            >
              <template v-slot:avatar><q-icon name="warning" color="red" /></template>
              No existen suficientes preguntas por grupo de tipo para 2do Parcial.
              {{ resumenFaltantesGrupoTipoBanco }}
            </q-banner>

            <div class="q-mt-lg text-caption text-grey-6 items-center flex">
              <q-avatar size="24px" color="primary" text-color="white" class="q-mr-xs">{{
                authStore.usuarioActual?.nombre?.charAt(0) || 'A'
              }}</q-avatar>
              El usuario
              <strong>{{ authStore.usuarioActual?.nombre || 'Administrador' }}</strong> será
              registrado como el generador.
            </div>
          </div>

          <!-- CASO 2: DEVUELTOS (Patrones) -->
          <div v-else-if="dialogGestion.examen?.estado === 'devueltos'" class="config-patrones">
            <q-banner class="bg-orange-1 text-orange-9 rounded-borders q-mb-xl">
              <template v-slot:avatar
                ><q-icon name="warning" color="orange" size="32px"
              /></template>
              <div class="text-h6 text-weight-bold">¿Generar Patrones de Respuestas?</div>
              Esta acción creará las plantillas de corrección oficial para las variantes
              <strong>{{ dialogGestion.examen?.variantes.join(', ') }}</strong
              >.
            </q-banner>

            <div class="text-center q-pa-lg">
              <q-icon name="fact_check" size="120px" color="orange-2" class="q-mb-md" />
              <p class="text-grey-7">
                Se requiere esta acción para que los docentes puedan proceder con la revisión de
                exámenes.
              </p>
            </div>
          </div>

          <!-- CASO GENERAL -->
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
            :disable="
              !bancoPuedeGenerar ||
              !permisoTiempoDialog.permitido ||
              estaGeneracionEnProceso(dialogGestion.examen)
            "
            @click="ejecutarAccionGestion"
            no-caps
            class="q-px-lg shadow-3"
          >
            <q-tooltip
              v-if="!permisoTiempoDialog.permitido || estaGeneracionEnProceso(dialogGestion.examen)"
            >
              {{
                estaGeneracionEnProceso(dialogGestion.examen)
                  ? 'La generación consolidada sigue ejecutándose en el servidor.'
                  : permisoTiempoDialog.mensaje
              }}
            </q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal: Generación Manual desde Excel -->
    <q-dialog v-model="dialogManual.show" backdrop-filter="blur(4px)" persistent>
      <q-card style="width: 850px; max-width: 95vw; border-radius: 20px" class="shadow-24">
        <q-card-section class="bg-deep-purple-8 text-white q-pa-lg">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-h6 text-weight-bold flex items-center">
                <q-icon name="auto_awesome" class="q-mr-sm" size="24px" />
                Generación Manual (Excel)
              </div>
              <div class="text-caption opacity-80">
                Configure la cabecera del examen y suba su banco de preguntas
              </div>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-lg">
            <!-- Columna Izquierda: Metadatos -->
            <div class="col-12 col-md-6 border-right">
              <div class="text-subtitle1 text-weight-bold q-mb-md text-primary flex items-center">
                <q-icon name="assignment" class="q-mr-xs" />
                Cabecera del Examen
              </div>

              <div class="row q-col-gutter-sm">
                <!-- Sede -->
                <div class="col-12">
                  <q-select
                    v-model="manualConfig.sede"
                    :options="sedesOptions"
                    label="Sede"
                    outlined
                    dense
                    use-input
                    input-debounce="0"
                    behavior="menu"
                  >
                    <template v-slot:prepend><q-icon name="apartment" size="xs" /></template>
                  </q-select>
                </div>

                <!-- Carrera -->
                <div class="col-6">
                  <q-select
                    v-model="manualConfig.carrera_obj"
                    :options="carrerasOptionsManual"
                    label="Seleccionar Carrera"
                    outlined
                    dense
                    :disable="!manualConfig.sede"
                    use-input
                    input-debounce="0"
                    behavior="menu"
                  >
                    <template v-slot:prepend><q-icon name="school" size="xs" /></template>
                  </q-select>
                </div>
                <div class="col-6">
                  <q-input
                    v-model="manualConfig.carrera_texto"
                    label="Nombre Carrera (Final)"
                    outlined
                    dense
                    placeholder="Escriba o ajuste el nombre"
                    bg-color="grey-1"
                  />
                </div>

                <!-- Asignatura -->
                <div class="col-6">
                  <q-select
                    v-model="manualConfig.materia_obj"
                    :options="asignaturasOptionsManualFiltered"
                    label="Seleccionar Materia"
                    outlined
                    dense
                    use-input
                    hide-selected
                    fill-input
                    input-debounce="300"
                    :disable="!manualConfig.carrera_obj"
                    @filter="filterAsignaturas"
                  >
                    <template v-slot:prepend><q-icon name="book" size="xs" /></template>
                  </q-select>
                </div>
                <div class="col-6">
                  <q-input
                    v-model="manualConfig.materia_texto"
                    label="Nombre Materia (Final)"
                    outlined
                    dense
                    placeholder="Escriba o ajuste el nombre"
                    bg-color="grey-1"
                  />
                </div>

                <!-- Docente -->
                <div class="col-6">
                  <q-select
                    v-model="manualConfig.docente_obj"
                    :options="docentesOptionsManual"
                    label="Seleccionar Docente"
                    outlined
                    dense
                    use-input
                    hide-selected
                    fill-input
                    input-debounce="300"
                    @filter="
                      (val, update) => {
                        update(() => {
                          fetchDocentesManual(val)
                        })
                      }
                    "
                  >
                    <template v-slot:prepend><q-icon name="person" size="xs" /></template>
                  </q-select>
                </div>
                <div class="col-6">
                  <q-input
                    v-model="manualConfig.docente_texto"
                    label="Nombre Docente (Final)"
                    outlined
                    dense
                    placeholder="Escriba o ajuste el nombre"
                    bg-color="grey-1"
                  />
                </div>
                <!-- Detalles adicionales -->
                <div class="col-6">
                  <q-input
                    v-model="manualConfig.grupo"
                    label="Grupo"
                    outlined
                    dense
                    placeholder="G-1"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="manualConfig.semestre"
                    label="Semestre"
                    outlined
                    dense
                    placeholder="5to"
                  />
                </div>
                <!-- Hora -->
                <div class="col-6">
                  <q-select
                    v-model="manualConfig.hora"
                    :options="[
                      '6:45',
                      '8:15',
                      '9:45',
                      '11:15',
                      '12:45',
                      '14:15',
                      '15:45',
                      '17:15',
                      '18:45',
                    ]"
                    label="Seleccionar Hora"
                    outlined
                    dense
                    use-input
                    hide-selected
                    fill-input
                  >
                    <template v-slot:prepend><q-icon name="schedule" size="xs" /></template>
                  </q-select>
                </div>
                <div class="col-6">
                  <q-input
                    v-model="manualConfig.hora_texto"
                    label="Hora (Final)"
                    outlined
                    dense
                    placeholder="8:15"
                    bg-color="grey-1"
                  />
                </div>

                <div class="col-4">
                  <q-select
                    v-model="manualConfig.cantVariantes"
                    :options="[1, 2, 3, 4, 5]"
                    label="Cant. Variantes"
                    outlined
                    dense
                  />
                </div>
                <div class="col-4">
                  <q-select
                    v-model="manualConfig.parcial"
                    :options="parcialesOptions"
                    label="Parcial"
                    outlined
                    dense
                  />
                </div>
                <div class="col-4">
                  <q-input
                    v-model="manualConfig.fecha"
                    label="Fecha"
                    type="date"
                    outlined
                    dense
                    stack-label
                  />
                </div>

                <div class="col-12">
                  <q-separator class="q-my-sm" />
                  <div class="row q-mb-xs">
                    <div class="text-caption text-weight-bold text-grey-7 flex items-center">
                      <q-icon name="palette" class="q-mr-xs" />
                      Configuración de Impresión:
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <q-select
                    v-model="manualConfig.formatoHoja"
                    :options="optionsHoja"
                    outlined
                    dense
                    label="Tamaño Hoja"
                    bg-color="blue-50"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="manualConfig.fontFamily"
                    :options="optionsFuente"
                    outlined
                    dense
                    label="Fuente"
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-6">
                  <q-select
                    v-model="manualConfig.fontSize"
                    :options="optionsTamanio"
                    outlined
                    dense
                    label="Tamaño"
                  />
                </div>
                <div class="col-6">
                  <q-select
                    v-model="manualConfig.lineSpacing"
                    :options="optionsEspaciado"
                    outlined
                    dense
                    label="Interlineado"
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="manualConfig.motivo"
                    type="textarea"
                    outlined
                    dense
                    label="Motivo de la generación (Obligatorio)"
                    placeholder="Ej: Examen de rezagado, pérdida de paquete original, etc."
                    bg-color="red-50"
                    rows="2"
                    :rules="[
                      (val) => !!val || 'El motivo es obligatorio para auditar la generación',
                    ]"
                    class="q-mt-sm"
                  >
                    <template v-slot:prepend><q-icon name="info" color="red-8" /></template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Columna Derecha: Archivo y Cantidades -->
            <div class="col-12 col-md-6">
              <div class="text-subtitle1 text-weight-bold q-mb-md text-primary">
                Fuente de Preguntas
              </div>

              <q-file
                v-model="manualFile"
                outlined
                dense
                label="Seleccionar archivo Excel"
                accept=".xlsx, .xls"
                @update:model-value="onExcelUploaded"
                bg-color="orange-1"
                class="q-mb-md"
              >
                <template v-slot:prepend><q-icon name="description" /></template>
              </q-file>

              <div v-if="manualPreguntas.length > 0">
                <q-banner dense class="bg-blue-1 text-blue-9 rounded-borders q-mb-md">
                  Se detectaron <strong>{{ manualPreguntas.length }}</strong> totales en la hoja.
                </q-banner>

                <div class="row q-col-gutter-xs q-mb-md">
                  <div class="col-4">
                    <q-chip
                      :color="
                        manualFaciles.length >= manualDistribucionRequerida.facil
                          ? 'green-1'
                          : 'red-1'
                      "
                      :text-color="
                        manualFaciles.length >= manualDistribucionRequerida.facil
                          ? 'green-9'
                          : 'red-9'
                      "
                      icon="sentiment_satisfied_alt"
                      class="full-width q-ma-none"
                    >
                      <div class="text-caption">
                        Fácil: {{ manualFaciles.length }}/{{ manualDistribucionRequerida.facil }}
                      </div>
                    </q-chip>
                  </div>
                  <div class="col-4">
                    <q-chip
                      :color="
                        manualMedios.length >= manualDistribucionRequerida.medio
                          ? 'green-1'
                          : 'red-1'
                      "
                      :text-color="
                        manualMedios.length >= manualDistribucionRequerida.medio
                          ? 'green-9'
                          : 'red-9'
                      "
                      icon="sentiment_neutral"
                      class="full-width q-ma-none"
                    >
                      <div class="text-caption">
                        Medio: {{ manualMedios.length }}/{{ manualDistribucionRequerida.medio }}
                      </div>
                    </q-chip>
                  </div>
                  <div class="col-4">
                    <q-chip
                      :color="
                        manualDificiles.length >= manualDistribucionRequerida.dificil
                          ? 'green-1'
                          : 'red-1'
                      "
                      :text-color="
                        manualDificiles.length >= manualDistribucionRequerida.dificil
                          ? 'green-9'
                          : 'red-9'
                      "
                      icon="sentiment_very_dissatisfied"
                      class="full-width q-ma-none"
                    >
                      <div class="text-caption">
                        Difícil: {{ manualDificiles.length }}/{{
                          manualDistribucionRequerida.dificil
                        }}
                      </div>
                    </q-chip>
                  </div>
                </div>

                <div class="row q-col-gutter-xs q-mb-md">
                  <div class="col-4">
                    <q-chip
                      :color="
                        manualGrupoTipoStats.g1 >= DEFAULT_GRUPOS_TIPO_2P.g1 ? 'green-1' : 'red-1'
                      "
                      :text-color="
                        manualGrupoTipoStats.g1 >= DEFAULT_GRUPOS_TIPO_2P.g1 ? 'green-9' : 'red-9'
                      "
                      class="full-width q-ma-none"
                    >
                      <div class="text-caption">
                        G1: {{ manualGrupoTipoStats.g1 }}/{{ DEFAULT_GRUPOS_TIPO_2P.g1 }}
                      </div>
                    </q-chip>
                  </div>
                  <div class="col-4">
                    <q-chip
                      :color="
                        manualGrupoTipoStats.g2 >= DEFAULT_GRUPOS_TIPO_2P.g2 ? 'green-1' : 'red-1'
                      "
                      :text-color="
                        manualGrupoTipoStats.g2 >= DEFAULT_GRUPOS_TIPO_2P.g2 ? 'green-9' : 'red-9'
                      "
                      class="full-width q-ma-none"
                    >
                      <div class="text-caption">
                        G2: {{ manualGrupoTipoStats.g2 }}/{{ DEFAULT_GRUPOS_TIPO_2P.g2 }}
                      </div>
                    </q-chip>
                  </div>
                  <div class="col-4">
                    <q-chip
                      :color="
                        manualGrupoTipoStats.g3 >= DEFAULT_GRUPOS_TIPO_2P.g3 ? 'green-1' : 'red-1'
                      "
                      :text-color="
                        manualGrupoTipoStats.g3 >= DEFAULT_GRUPOS_TIPO_2P.g3 ? 'green-9' : 'red-9'
                      "
                      class="full-width q-ma-none"
                    >
                      <div class="text-caption">
                        G3: {{ manualGrupoTipoStats.g3 }}/{{ DEFAULT_GRUPOS_TIPO_2P.g3 }}
                      </div>
                    </q-chip>
                  </div>
                </div>

                <div class="q-pa-sm bg-grey-1 rounded-borders scroll" style="max-height: 120px">
                  <div
                    v-for="(p, i) in manualPreguntas"
                    :key="i"
                    class="text-caption q-mb-xs border-bottom row no-wrap overflow-hidden"
                  >
                    <span class="text-weight-bold q-mr-xs">{{ i + 1 }}.</span>
                    <span class="ellipsis col">{{ p.enunciado?.replace(/<[^>]*>/g, '') }}</span>
                    <q-badge
                      :color="
                        p.dificultad === '1' ? 'green' : p.dificultad === '2' ? 'orange' : 'red'
                      "
                      size="xs"
                      dense
                      class="self-center q-ml-xs"
                    >
                      {{ p.dificultad }}
                    </q-badge>
                  </div>
                </div>
              </div>
              <div v-else-if="manualFile" class="text-center q-pa-lg">
                <q-spinner-dots color="deep-purple" size="2em" />
                <p class="text-caption text-grey-7">Analizando archivo...</p>
              </div>
              <div v-else class="text-center q-pa-xl text-grey-5 border-dashed rounded-borders">
                <q-icon name="upload_file" size="48px" />
                <p>Favor de subir un archivo XLSX</p>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup no-caps />
          <q-btn
            unelevated
            rounded
            color="deep-purple-7"
            label="Generar Paquete Ahora"
            icon="auto_awesome"
            :disable="!manualPuedeGenerar || !manualConfig.materia_texto || !manualConfig.motivo"
            @click="ejecutarGeneracionManual"
            no-caps
            class="q-px-lg shadow-3"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useQuasar, date } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore, ROLES } from 'src/stores/auth'
import { usePermisos } from 'src/composables/usePermisos'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {
  assertNoOrphanMacroQuestions,
  buildExamQuestionSelection,
  completeMacroHeaders,
  createExamPdfDocument,
  generateExamPdf,
  mixExamQuestionOptions,
  sortExamQuestionsForPdf,
} from 'src/services/examPdfService'

const $q = useQuasar()
const authStore = useAuthStore()
const {
  puedeEditar,
  esEvaluaciones,
  esResponsableEvaluaciones,
  esDireccionAcademica,
  esVicerrectorSede,
  esAdmin,
  esSuperAdmin,
} = usePermisos()

const puedeVerAcciones = computed(() => {
  return puedeEditar.value || esEvaluaciones.value || esResponsableEvaluaciones.value
})

const puedeVerGeneracionManual = computed(() => {
  if (esDireccionAcademica.value || esVicerrectorSede.value) {
    return false
  }
  return puedeEditar.value || esEvaluaciones.value || esResponsableEvaluaciones.value
})

// ESTADOS DEL PROCESO
const ESTADOS_FLOW = [
  {
    key: 'programados',
    label: 'Programado',
    icon: 'event_note',
    color: 'blue-7',
    action: 'GENERAR',
    hasGestion: true,
    desc: 'Definir variantes y cantidad de preguntas',
  },
  {
    key: 'generados',
    label: 'Generado',
    icon: 'auto_awesome',
    color: 'indigo-7',
    action: 'IMPRIMIR',
    hasGestion: false,
    desc: 'Exámenes generados listos para impresión',
  },
  {
    key: 'impresos',
    label: 'Impreso',
    icon: 'print',
    color: 'green-7',
    action: 'ENTREGAR',
    hasGestion: false,
    desc: 'Material impreso para recojo',
  },
  {
    key: 'entregados',
    label: 'Entregado',
    icon: 'inventory_2',
    color: 'orange-8',
    action: 'GESTIONAR',
    hasGestion: true,
    desc: 'En aula (generar patrones para devolución)',
  },
  {
    key: 'devueltos',
    label: 'Devuelto',
    icon: 'assignment_returned',
    color: 'teal-7',
    action: 'REVISAR',
    hasGestion: false,
    desc: 'Exámenes y patrones devueltos por el docente',
  },
  {
    key: 'revisados',
    label: 'Revisado',
    icon: 'fact_check',
    color: 'deep-purple-7',
    action: 'SUBIR NOTAS',
    hasGestion: false,
    desc: 'Revisión técnica completada',
  },
  {
    key: 'subidos',
    label: 'Subido',
    icon: 'cloud_done',
    color: 'purple-9',
    action: 'FINALIZADO',
    hasGestion: false,
    desc: 'Notas subidas al sistema académico',
  },
]

const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }
  return array
}

const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const normalizeTipo = (t) => {
  const s = removeAccents(String(t || ''))
    .toUpperCase()
    .trim()
  if (
    ['PR', 'PROBLEMA', 'PROBLEMA O CASO', 'ITEMS AGRUPADOS POR CASO CLINICO O PROBLEMA'].includes(s)
  )
    return 'PROBLEMA'
  if (['EM', 'EMPAREJAMIENTO', 'EMPAREJAMIENTO AMPLIADO'].includes(s)) return 'EMPAREJAMIENTO'
  if (
    [
      'OPCION_EMPAREJAMIENTO',
      'OPCION EMPAREJAMIENTO',
      'OPCION DE EMPAREJAMIENTO',
      'OPCION EMPAREJAMIENTO AMPLIADO',
      'OPCION DE EMPAREJAMIENTO AMPLIADO',
    ].includes(s)
  )
    return 'OPCION_EMPAREJAMIENTO'
  if (
    ['SP', 'SUBPREGUNTA', 'SUBPROBLEMA', 'SUB PROBLEMA', 'SUBITEM DE CASO O PROBLEMA'].includes(s)
  )
    return 'SUBPROBLEMA'
  if (['PREGUNTA_CON_CLAVE', 'PREGUNTA CON CLAVE', 'VERDADERO O FALSO COMPLEJAS'].includes(s))
    return 'PREGUNTA_CON_CLAVE'
  if (
    ['SU', 'SS', 'SELECCION_UNICA', 'SELECCION_SIMPLE', 'SELECCION DE LA MEJOR RESPUESTA'].includes(
      s,
    )
  )
    return 'SELECCION_UNICA'
  if (
    [
      'SM',
      'SELECCION_MULTIPLE',
      'RESPUESTA_COMPUESTA',
      'RESPUESTA COMPUESTA',
      'RESPUESTA A/B/AMBAS/NINGUNA',
    ].includes(s)
  )
    return 'SELECCION_MULTIPLE'
  if (
    [
      'FV',
      'FALSO_VERDADERO',
      'FALSO O VERDADERO',
      'VERDADERO O FALSO',
      'VERDADERO O FALSO SIMPLE',
    ].includes(s)
  )
    return 'FALSO_VERDADERO'
  return s
}

const PARCIAL_2DO = '2do Parcial'
const DEFAULT_DISTRIBUCION_2P = { facil: 7, medio: 16, dificil: 7 }
const DEFAULT_GRUPOS_TIPO_2P = { g1: 15, g2: 30, g3: 15 }

const esSegundoParcialValor = (parcial) => {
  const value = removeAccents(String(parcial || '')).toLowerCase()
  return (
    value.includes('2do') ||
    value.includes('segundo') ||
    value.includes('2p') ||
    value.includes('2 parcial')
  )
}

const obtenerDistribucionConfigurada = (configuracion, parcial) => {
  const parciales = Array.isArray(configuracion?.parciales) ? configuracion.parciales : []
  const parcialKey = removeAccents(String(parcial || '')).toLowerCase()
  const confParcial = parciales.find((p) => {
    const nombre = removeAccents(String(p.nombre || '')).toLowerCase()
    return (
      (nombre.includes('1') && parcialKey.includes('1')) ||
      (nombre.includes('2') && parcialKey.includes('2')) ||
      (nombre.includes('final') && parcialKey.includes('final')) ||
      (nombre.includes('instancia') && parcialKey.includes('instancia'))
    )
  })
  const distribucion = confParcial?.distribucion || null
  if (!distribucion) return null

  const resultado = {
    facil: Number(distribucion.facil || 0),
    medio: Number(distribucion.medio || 0),
    dificil: Number(distribucion.dificil || 0),
  }

  return resultado.facil + resultado.medio + resultado.dificil > 0 ? resultado : null
}

const grupoTipoPregunta = (pregunta) => {
  const tipo = normalizeTipo(pregunta?.tipo)
  if (
    ['FALSO_VERDADERO', 'PREGUNTA_CON_CLAVE', 'SELECCION_MULTIPLE', 'RESPUESTA_COMPUESTA'].includes(
      tipo,
    )
  )
    return 'g1'
  if (['SELECCION_UNICA', 'SELECCION_SIMPLE'].includes(tipo)) return 'g2'
  if (['SUBPROBLEMA', 'OPCION_EMPAREJAMIENTO'].includes(tipo)) return 'g3'
  return null
}

const toNumber = (value) => {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}

const sumarConteo = (conteo = {}) =>
  Object.values(conteo || {}).reduce((total, value) => total + toNumber(value), 0)

const normalizarConteoGrupoTipo = (conteo = {}) => ({
  g1: toNumber(conteo?.g1 ?? conteo?.G1),
  g2: toNumber(conteo?.g2 ?? conteo?.G2),
  g3: toNumber(conteo?.g3 ?? conteo?.G3),
})

const contarGruposTipoDesdePorTipo = (porTipo = {}) => {
  const stats = { g1: 0, g2: 0, g3: 0 }
  Object.entries(porTipo || {}).forEach(([tipo, total]) => {
    const grupo = grupoTipoPregunta({ tipo })
    if (grupo) stats[grupo] += toNumber(total)
  })
  return stats
}

const elegirMayorConteoGrupoTipo = (...candidatos) =>
  candidatos
    .map((conteo) => normalizarConteoGrupoTipo(conteo || {}))
    .reduce((mejor, actual) => (sumarConteo(actual) > sumarConteo(mejor) ? actual : mejor), {
      g1: 0,
      g2: 0,
      g3: 0,
    })

const normalizarBancoStatsFila = (row = {}) => {
  const stats = row.banco_stats || row.stats || {}
  const porTipo = row.banco_por_tipo || row.por_tipo || stats.por_tipo || stats.porTipo || {}
  const porGrupoTipo = elegirMayorConteoGrupoTipo(
    { g1: row.banco_g1, g2: row.banco_g2, g3: row.banco_g3 },
    row.banco_por_grupo_tipo,
    row.por_grupo_tipo,
    stats.por_grupo_tipo,
    stats.porGrupoTipo,
    contarGruposTipoDesdePorTipo(porTipo),
  )
  const dificultad = {
    facil: toNumber(row.banco_facil ?? row.banco_faciles ?? stats.facil ?? stats.faciles),
    medio: toNumber(
      row.banco_medio ?? row.banco_media ?? row.banco_medias ?? stats.medio ?? stats.medias,
    ),
    dificil: toNumber(row.banco_dificil ?? row.banco_dificiles ?? stats.dificil ?? stats.dificiles),
  }
  const total = Math.max(
    toNumber(row.total_banco ?? row.banco_total ?? stats.total),
    sumarConteo(dificultad),
    sumarConteo(porGrupoTipo),
  )

  return {
    total,
    ...dificultad,
    ...porGrupoTipo,
    porTipo,
    porGrupoTipo,
  }
}

const getBancoDisponibilidad = (row) => {
  const stats = normalizarBancoStatsFila(row)
  const distribucion = row?.distribucion || {}
  const requerida = {
    facil: Number(distribucion.facil || DEFAULT_DISTRIBUCION_2P.facil),
    medio: Number(distribucion.medio || DEFAULT_DISTRIBUCION_2P.medio),
    dificil: Number(distribucion.dificil || DEFAULT_DISTRIBUCION_2P.dificil),
  }
  const tieneConteoDificultad = stats.facil + stats.medio + stats.dificil > 0
  const dificultadDisponible = tieneConteoDificultad
    ? stats.facil >= requerida.facil &&
      stats.medio >= requerida.medio &&
      stats.dificil >= requerida.dificil
    : stats.total > 0

  const disponibilidad = {
    dificultad: {
      disponible: dificultadDisponible,
      etiqueta: dificultadDisponible ? 'DISP.' : 'VACIO',
      resumen: tieneConteoDificultad
        ? `${stats.facil}/${stats.medio}/${stats.dificil}`
        : String(stats.total),
      tooltip: tieneConteoDificultad
        ? `Dificultad: ${stats.facil}/${requerida.facil} F, ${stats.medio}/${requerida.medio} M, ${stats.dificil}/${requerida.dificil} D`
        : `Se encontraron ${stats.total} preguntas`,
    },
    gruposTipo: null,
  }

  if (esSegundoParcialValor(row?.tipo_examen || row?.parcial)) {
    const gruposDisponible =
      stats.g1 >= DEFAULT_GRUPOS_TIPO_2P.g1 &&
      stats.g2 >= DEFAULT_GRUPOS_TIPO_2P.g2 &&
      stats.g3 >= DEFAULT_GRUPOS_TIPO_2P.g3

    disponibilidad.gruposTipo = {
      disponible: gruposDisponible,
      etiqueta: gruposDisponible ? 'DISP.' : 'VACIO',
      resumen: `${stats.g1}/${stats.g2}/${stats.g3}`,
      tooltip: `Tipos: ${stats.g1}/${DEFAULT_GRUPOS_TIPO_2P.g1} G1, ${stats.g2}/${DEFAULT_GRUPOS_TIPO_2P.g2} G2, ${stats.g3}/${DEFAULT_GRUPOS_TIPO_2P.g3} G3`,
    }
  }

  return disponibilidad
}

const obtenerFechaHoy = () => date.formatDate(Date.now(), 'YYYY-MM-DD')

const filtros = ref({
  sede: null,
  carrera: null,
  parcial: PARCIAL_2DO,
  fechaInicio: obtenerFechaHoy(),
  fechaFin: obtenerFechaHoy(),
  estado: [],
  busqueda: '',
})

const rangoFechasFiltro = computed(() => {
  const fechaInicio = filtros.value.fechaInicio || null
  const fechaFin = filtros.value.fechaFin || null

  if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
    return { fechaInicio: fechaFin, fechaFin: fechaInicio }
  }

  return { fechaInicio, fechaFin }
})

const etiquetaRangoFechas = computed(() => {
  const { fechaInicio, fechaFin } = rangoFechasFiltro.value

  if (fechaInicio && fechaFin) {
    return fechaInicio === fechaFin ? fechaInicio : `${fechaInicio} a ${fechaFin}`
  }

  if (fechaInicio) return `Desde ${fechaInicio}`
  if (fechaFin) return `Hasta ${fechaFin}`

  return 'TODAS'
})

const tiemposConfigEvaluacion = ref({
  minutos_antes_entrega: 15,
  horas_antes_generacion: 48,
  horas_post_patron: 0,
  alerta_horas_antes: 24,
})

const rolRespetaVentanasTiempo = computed(
  () =>
    esEvaluaciones.value &&
    !esResponsableEvaluaciones.value &&
    !esAdmin.value &&
    !esSuperAdmin.value,
)

const sedesOptions = ref([])
const carrerasOptions = ref([])
const parcialesOptions = ['1er Parcial', '2do Parcial', 'Final', '2da Instancia']
const optionsHoja = ['Oficio (8.5" x 13")', 'Carta', 'Oficio']
const optionsFuente = [
  { label: 'Arial / Helvetica', value: 'helvetica' },
  { label: 'Times New Roman', value: 'times' },
]
const optionsTamanio = [8, 9, 10, 11, 12, 13, 14]
const optionsEspaciado = [
  { label: 'Muy Compacto (0.85)', value: 0.85 },
  { label: 'Compacto (0.95)', value: 0.95 },
  { label: 'Simple', value: 1.0 },
  { label: 'Relajado (1.2)', value: 1.2 },
  { label: 'Doble (1.5)', value: 1.5 },
]
const loadingOptions = ref({ sedes: false, carreras: false })

const sedesAsignadasUsuario = computed(() => {
  const usuario = authStore.usuarioActual || {}
  const sedes = Array.isArray(usuario.sedes_asignadas) ? usuario.sedes_asignadas : []
  const fromSedes = sedes
    .map((sede) => ({
      label: sede.nombre || sede.label,
      value: Number(sede.id || sede.value),
    }))
    .filter((sede) => sede.value)
  const fromCampus = Array.isArray(usuario.campus_asignados)
    ? usuario.campus_asignados
        .map((campus) => ({
          label: campus.sede || campus.sede_nombre,
          value: Number(campus.sede_id),
        }))
        .filter((sede) => sede.value)
    : []
  const base = usuario.sede_id
    ? [{ label: usuario.sede?.nombre || usuario.sede_nombre, value: Number(usuario.sede_id) }]
    : []
  const unique = new Map()

  ;[...fromSedes, ...fromCampus, ...base].forEach((sede) => {
    if (!sede.value || unique.has(sede.value)) return
    unique.set(sede.value, {
      label: sede.label || `Sede ${sede.value}`,
      value: sede.value,
    })
  })

  return [...unique.values()]
})

const sedeIdsAsignadasUsuario = computed(() =>
  sedesAsignadasUsuario.value.map((sede) => Number(sede.value)).filter(Boolean),
)

const debeLimitarSedes = computed(() => {
  return authStore.rol === ROLES.EVALUACIONES || authStore.alcance === 'sede'
})

const esSedeRestringida = computed(() => {
  return debeLimitarSedes.value && sedesOptions.value.length <= 1
})

const fetchSedes = async () => {
  loadingOptions.value.sedes = true
  try {
    const response = await api.get('/sedes')
    const rawSedes = response.data.data || response.data || []
    const allSedes = rawSedes.map((s) => ({ label: s.nombre, value: s.id }))
    const sedesAsignadasIds = sedeIdsAsignadasUsuario.value

    // Si es Vicerrector Sede o Director Académico, mostrar SOLO su sede
    if (debeLimitarSedes.value && sedesAsignadasIds.length) {
      sedesOptions.value = allSedes.filter((s) => sedesAsignadasIds.includes(Number(s.value)))
    } else if (
      [ROLES.VICERRECTOR_SEDE, ROLES.DIRECCION_ACADEMICA].includes(authStore.rol) &&
      authStore.usuarioActual?.sede_id
    ) {
      const userSedeId = Number(authStore.usuarioActual.sede_id)
      sedesOptions.value = allSedes.filter((s) => Number(s.value) === userSedeId)
    } else {
      sedesOptions.value = allSedes
    }

    // Si es restringido, pre-seleccionar su sede
    const currentSedeId = authStore.usuarioActual?.sede_id
    if (debeLimitarSedes.value) {
      const sedeUsuario =
        sedesOptions.value.find((s) => Number(s.value) === Number(currentSedeId)) ||
        sedesOptions.value[0]
      filtros.value.sede = sedeUsuario || null
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
    carrerasOptions.value = response.data.map((c) => ({ label: c.nombre, value: c.id }))
  } catch (error) {
    console.error('Error carreras:', error)
  } finally {
    loadingOptions.value.carreras = false
  }
}

const fetchCarrerasPorCampusIds = async (campusIds) => {
  const ids = [...new Set((campusIds || []).map(Number).filter(Boolean))]
  if (!ids.length) {
    carrerasOptions.value = []
    return
  }

  loadingOptions.value.carreras = true
  try {
    const responses = await Promise.all(
      ids.map((campusId) => api.get(`/campus/${campusId}/carreras`)),
    )
    const carreras = responses.flatMap((response) => response.data || [])
    const uniqueById = new Map(carreras.map((carrera) => [carrera.id, carrera]))
    carrerasOptions.value = [...uniqueById.values()].map((c) => ({ label: c.nombre, value: c.id }))
  } catch (error) {
    console.error('Error carreras por campus:', error)
  } finally {
    loadingOptions.value.carreras = false
  }
}

const normalizarGestionTiempos = (gestion = '2026-I') => {
  const value = String(gestion || '2026-I')
    .trim()
    .toUpperCase()
  const gestionAnioPrimero = value.match(/^(\d{4})-(I|II|1|2)$/)
  if (gestionAnioPrimero) {
    return ['II', '2'].includes(gestionAnioPrimero[2])
      ? `2/${gestionAnioPrimero[1]}`
      : `1/${gestionAnioPrimero[1]}`
  }

  const gestionPeriodoPrimero = value.match(/^(I|II|1|2)-(\d{4})$/)
  if (gestionPeriodoPrimero) {
    return ['II', '2'].includes(gestionPeriodoPrimero[1])
      ? `2/${gestionPeriodoPrimero[2]}`
      : `1/${gestionPeriodoPrimero[2]}`
  }

  return value
}

const cargarTiemposEvaluacion = async () => {
  try {
    const { data } = await api.get('/evaluaciones/tiempos', {
      params: { gestion: normalizarGestionTiempos('2026-I') },
    })
    if (data.success && data.configuracion) {
      tiemposConfigEvaluacion.value = { ...tiemposConfigEvaluacion.value, ...data.configuracion }
    }
  } catch (error) {
    console.error('Error cargando tiempos de evaluacion:', error)
  }
}

const obtenerFechaHoraExamen = (examen, usarHoraFin = false) => {
  const fecha = examen?.fecha_examen || examen?.fecha
  const hora = usarHoraFin
    ? examen?.hora_fin || examen?.hora || examen?.hora_inicio || '00:00'
    : examen?.hora || examen?.hora_inicio || '00:00'

  if (!fecha) return null

  const normalizada = `${String(fecha).substring(0, 10)}T${String(hora).substring(0, 5)}:00`
  const fechaHora = new Date(normalizada)

  return Number.isNaN(fechaHora.getTime()) ? null : fechaHora
}

const sumarHoras = (fechaHora, horas) => {
  const resultado = new Date(fechaHora)
  resultado.setHours(resultado.getHours() + Number(horas || 0))
  return resultado
}

const sumarMinutos = (fechaHora, minutos) => {
  const resultado = new Date(fechaHora)
  resultado.setMinutes(resultado.getMinutes() + Number(minutos || 0))
  return resultado
}

const formatearFechaHoraBloqueo = (fechaHora) => date.formatDate(fechaHora, 'DD/MM/YYYY HH:mm')

const obtenerSiguienteEstado = (estado) => {
  const currentIndex = ESTADOS_FLOW.findIndex((item) => item.key === estado)
  return currentIndex >= 0 ? ESTADOS_FLOW[currentIndex + 1]?.key : null
}

const puedeCambiarEstadoPorTiempo = (examen, estadoDestino = null) => {
  if (!examen || !rolRespetaVentanasTiempo.value) {
    return { permitido: true, mensaje: '' }
  }

  const siguienteEstado = estadoDestino || obtenerSiguienteEstado(examen.estado)
  const fechaHoraExamen = obtenerFechaHoraExamen(examen)
  const ahora = new Date()

  if (!fechaHoraExamen || !siguienteEstado) {
    return { permitido: true, mensaje: '' }
  }

  if (siguienteEstado === 'generados') {
    const inicio = sumarHoras(
      fechaHoraExamen,
      -tiemposConfigEvaluacion.value.horas_antes_generacion,
    )
    if (ahora < inicio) {
      return {
        permitido: false,
        mensaje: `Generación habilitada desde ${formatearFechaHoraBloqueo(inicio)}.`,
      }
    }
  }

  if (siguienteEstado === 'entregados') {
    const inicio = sumarMinutos(
      fechaHoraExamen,
      -tiemposConfigEvaluacion.value.minutos_antes_entrega,
    )
    if (ahora < inicio) {
      return {
        permitido: false,
        mensaje: `Entrega habilitada desde ${formatearFechaHoraBloqueo(inicio)}.`,
      }
    }
  }

  if (siguienteEstado === 'devueltos') {
    const entrega =
      examen.timestamps?.entregados ||
      obtenerFechaHoraExamen(examen, true)?.toISOString() ||
      fechaHoraExamen.toISOString()
    const inicio = sumarHoras(new Date(entrega), tiemposConfigEvaluacion.value.horas_post_patron)
    if (ahora < inicio) {
      return {
        permitido: false,
        mensaje: `Patrón habilitado desde ${formatearFechaHoraBloqueo(inicio)}.`,
      }
    }
  }

  return { permitido: true, mensaje: '' }
}

const permisoTiempoDialog = computed(() => puedeCambiarEstadoPorTiempo(dialogGestion.value.examen))

const notificarBloqueoPorTiempo = (examen) => {
  const permiso = puedeCambiarEstadoPorTiempo(examen)
  if (permiso.permitido) return false

  $q.notify({
    type: 'warning',
    message: permiso.mensaje,
    caption: 'Solo Responsable de Evaluaciones o Administrador puede omitir esta ventana.',
    icon: 'schedule',
  })
  return true
}

watch(
  () => filtros.value.sede,
  (newSede) => {
    filtros.value.carrera = null
    if (newSede) {
      const userSedeId = Number(authStore.usuarioActual?.sede_id)
      const selectedSedeId = Number(newSede.value)
      const campusIds = Array.isArray(authStore.usuarioActual?.campus_asignados)
        ? authStore.usuarioActual.campus_asignados
            .filter((campus) => Number(campus.sede_id) === selectedSedeId)
            .map((campus) => campus.id)
        : []

      // Si la sede seleccionada es la del usuario y tiene campus asignado, cargar por campus
      if (campusIds.length) {
        fetchCarrerasPorCampusIds(campusIds)
      } else if (authStore.usuarioActual?.campus_id && selectedSedeId === userSedeId) {
        fetchCarreras(null, authStore.usuarioActual.campus_id)
      } else {
        fetchCarreras(selectedSedeId)
      }
    } else {
      carrerasOptions.value = []
    }
  },
)

onMounted(async () => {
  // Asegurar que tenemos los últimos datos del usuario (con relaciones campus/sede)
  if (authStore.isAuthenticated) {
    await authStore.fetchUser()
  }
  await fetchSedes()
  await cargarTiemposEvaluacion()
  await cargarManualGenerations()

  // Pre-cargar carreras de la sede del usuario para el diálogo manual (Warm Cache)
  const userSedeId = authStore.usuarioActual?.sede_id
  if (userSedeId) {
    fetchCarrerasParaManual(userSedeId)
  }

  cargarDatos()
})

onBeforeUnmount(() => {
  clearGenerationPoller()
})

const dialogGestion = ref({
  show: false,
  examen: null,
})

const dialogStats = ref(false)

const tempConfig = ref({
  cantVariantes: 1,
  facil: 10,
  medio: 10,
  dificil: 5,
  formatoHoja: 'Oficio (8.5" x 13")',
  fontFamily: 'helvetica',
  fontSize: 11,
  lineSpacing: 0.85,
  aleatorizarSecciones: true,
})

const configOrigenActual = ref('nacional')
const bancoStats = ref({ facil: 0, medio: 0, dificil: 0, total: 0 })
const bancoTotalAsignatura = ref(0)
const bancoPorTipo = ref({})
const bancoPorGrupoTipo = ref({})

const aplicarDistribucionConfigurada = (distribucion) => {
  tempConfig.value.facil = Number(distribucion?.facil || DEFAULT_DISTRIBUCION_2P.facil)
  tempConfig.value.medio = Number(distribucion?.medio || DEFAULT_DISTRIBUCION_2P.medio)
  tempConfig.value.dificil = Number(distribucion?.dificil || DEFAULT_DISTRIBUCION_2P.dificil)
}

const bancoGrupoTipoStats = computed(() => {
  const totalEvaluable = Number(bancoStats.value?.total || 0)
  const statsPlano = {
    g1: Number(bancoStats.value?.g1 || 0),
    g2: Number(bancoStats.value?.g2 || 0),
    g3: Number(bancoStats.value?.g3 || 0),
  }

  if (
    statsPlano.g1 + statsPlano.g2 + statsPlano.g3 > 0 &&
    (!totalEvaluable || statsPlano.g1 + statsPlano.g2 + statsPlano.g3 === totalEvaluable)
  ) {
    return statsPlano
  }

  const statsApi = {
    g1: Number(bancoPorGrupoTipo.value?.g1 || 0),
    g2: Number(bancoPorGrupoTipo.value?.g2 || 0),
    g3: Number(bancoPorGrupoTipo.value?.g3 || 0),
  }

  if (
    statsApi.g1 + statsApi.g2 + statsApi.g3 > 0 &&
    (!totalEvaluable || statsApi.g1 + statsApi.g2 + statsApi.g3 === totalEvaluable)
  ) {
    return statsApi
  }

  return contarGruposTipoDesdePorTipo(bancoPorTipo.value)
})

const tiposNoEvaluablesGrupo2P = ['EMPAREJAMIENTO', 'PROBLEMA']

const contarGruposTipoDesdePreguntas = (preguntas = []) => {
  const porTipo = {}
  const porGrupoTipo = { g1: 0, g2: 0, g3: 0 }

  preguntas.forEach((pregunta) => {
    const tipo = normalizeTipo(pregunta?.tipo)
    if (!tipo || tiposNoEvaluablesGrupo2P.includes(tipo)) return

    porTipo[tipo] = toNumber(porTipo[tipo]) + 1

    const grupo = grupoTipoPregunta({ tipo })
    if (grupo) {
      porGrupoTipo[grupo] += 1
    }
  })

  return { porTipo, porGrupoTipo }
}

const normalizarStatsBanco2P = (data, preguntas = []) => {
  const stats = data?.stats || {}
  let porTipo = data?.por_tipo || stats.por_tipo || {}
  let porGrupoTipo = elegirMayorConteoGrupoTipo(
    data?.por_grupo_tipo,
    stats.por_grupo_tipo,
    contarGruposTipoDesdePorTipo(porTipo),
  )
  const gruposCalculados = elegirMayorConteoGrupoTipo(
    { g1: stats.g1, g2: stats.g2, g3: stats.g3 },
    porGrupoTipo,
  )

  const totalEvaluable = toNumber(stats.total)
  const totalGruposTipo = gruposCalculados.g1 + gruposCalculados.g2 + gruposCalculados.g3
  if (preguntas.length && totalGruposTipo !== totalEvaluable) {
    const conteoPreguntas = contarGruposTipoDesdePreguntas(preguntas)
    porTipo = conteoPreguntas.porTipo
    porGrupoTipo = conteoPreguntas.porGrupoTipo
    gruposCalculados.g1 = porGrupoTipo.g1
    gruposCalculados.g2 = porGrupoTipo.g2
    gruposCalculados.g3 = porGrupoTipo.g3
  }

  return {
    stats: {
      ...stats,
      g1: gruposCalculados.g1,
      g2: gruposCalculados.g2,
      g3: gruposCalculados.g3,
    },
    porTipo,
    porGrupoTipo,
  }
}

const limpiarParamsBanco = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  )

const crearParamsBancoStats = (examen) =>
  limpiarParamsBanco({
    asignatura_id: examen?.asignatura_id,
    docente_id: examen?.docente_id,
    sede_id: examen?.sede_id,
    parcial: examen?.tipo_examen || examen?.parcial,
    grupo: examen?.grupo,
  })

const cargarStatsBancoExamen = async (examen, incluirDetalle = false) => {
  const params = crearParamsBancoStats(examen)
  if (!params.asignatura_id) return null

  const { data } = await api.get('/banco-preguntas/stats', { params })
  if (!data?.success) return null

  let resumenBanco = normalizarStatsBanco2P(data)
  const totalBanco = toNumber(resumenBanco.stats.total)
  const totalGrupos = resumenBanco.stats.g1 + resumenBanco.stats.g2 + resumenBanco.stats.g3
  const sinDetalleTipos = !Object.keys(resumenBanco.porTipo || {}).length || totalGrupos === 0

  if (incluirDetalle && totalBanco > 0 && sinDetalleTipos) {
    const detalleParams = limpiarParamsBanco({
      ...params,
      grupoTeorico: examen?.grupo,
      all_docentes: true,
    })
    const bancoDetalle = await api.get('/banco-preguntas', { params: detalleParams })
    const preguntas = bancoDetalle.data?.preguntas || bancoDetalle.data || []
    resumenBanco = normalizarStatsBanco2P(data, Array.isArray(preguntas) ? preguntas : [])
  }

  return {
    ...resumenBanco,
    totalAsignatura: toNumber(data.total_asignatura),
    conCartilla: data.con_cartilla,
  }
}

const aplicarStatsBancoFila = (examen, resumenBanco) => {
  if (!resumenBanco?.stats) return examen

  const stats = resumenBanco.stats
  return {
    ...examen,
    total_banco: toNumber(stats.total),
    banco_facil: toNumber(stats.facil),
    banco_medio: toNumber(stats.medio),
    banco_dificil: toNumber(stats.dificil),
    banco_g1: toNumber(stats.g1),
    banco_g2: toNumber(stats.g2),
    banco_g3: toNumber(stats.g3),
    banco_por_tipo: resumenBanco.porTipo || {},
    banco_por_grupo_tipo: resumenBanco.porGrupoTipo || {},
    banco_stats: {
      ...stats,
      por_tipo: resumenBanco.porTipo || {},
      por_grupo_tipo: resumenBanco.porGrupoTipo || {},
    },
    con_cartilla: resumenBanco.conCartilla ?? examen.con_cartilla,
  }
}

const requiereStatsBancoRemotas = (examen) => {
  if (!examenConCartilla(examen) || !examen?.asignatura_id) return false

  const stats = normalizarBancoStatsFila(examen)
  if (stats.total <= 0) return false

  const sinDificultad = stats.facil + stats.medio + stats.dificil === 0
  if (sinDificultad) return true

  if (!esSegundoParcialValor(examen?.tipo_examen || examen?.parcial)) return false

  const totalGrupos = stats.g1 + stats.g2 + stats.g3
  const tieneDetalleTipos =
    Object.keys(stats.porTipo || {}).length > 0 || sumarConteo(stats.porGrupoTipo) > 0

  return totalGrupos === 0 || !tieneDetalleTipos
}

const enriquecerStatsBancoExamenes = async (examenes) => {
  const pendientes = examenes.filter(requiereStatsBancoRemotas)
  if (!pendientes.length) return examenes

  const resultados = await Promise.allSettled(
    pendientes.map(async (examen) => ({
      id: examen.id,
      resumenBanco: await cargarStatsBancoExamen(examen, true),
    })),
  )

  const statsPorId = new Map()
  resultados.forEach((resultado) => {
    if (resultado.status === 'fulfilled' && resultado.value.resumenBanco) {
      statsPorId.set(resultado.value.id, resultado.value.resumenBanco)
    }
  })

  return examenes.map((examen) =>
    statsPorId.has(examen.id) ? aplicarStatsBancoFila(examen, statsPorId.get(examen.id)) : examen,
  )
}

const esSegundoParcialGestion = computed(() =>
  esSegundoParcialValor(
    dialogGestion.value.examen?.tipo_examen || dialogGestion.value.examen?.parcial,
  ),
)

const bancoSuficiente = computed(() => {
  if (dialogGestion.value.examen?.estado !== 'programados') return true
  return (
    (tempConfig.value.facil || 0) <= (bancoStats.value.facil || 0) &&
    (tempConfig.value.medio || 0) <= (bancoStats.value.medio || 0) &&
    (tempConfig.value.dificil || 0) <= (bancoStats.value.dificil || 0)
  )
})

const bancoGrupoTipoSuficiente = computed(() => {
  if (dialogGestion.value.examen?.estado !== 'programados') return true
  if (!esSegundoParcialGestion.value) return true

  return (
    bancoGrupoTipoStats.value.g1 >= DEFAULT_GRUPOS_TIPO_2P.g1 &&
    bancoGrupoTipoStats.value.g2 >= DEFAULT_GRUPOS_TIPO_2P.g2 &&
    bancoGrupoTipoStats.value.g3 >= DEFAULT_GRUPOS_TIPO_2P.g3
  )
})

const bancoPuedeGenerar = computed(() => bancoSuficiente.value && bancoGrupoTipoSuficiente.value)

const resumenFaltantesGrupoTipoBanco = computed(() => {
  const faltantes = []
  if (bancoGrupoTipoStats.value.g1 < DEFAULT_GRUPOS_TIPO_2P.g1) {
    faltantes.push(`G1 falta ${DEFAULT_GRUPOS_TIPO_2P.g1 - bancoGrupoTipoStats.value.g1}`)
  }
  if (bancoGrupoTipoStats.value.g2 < DEFAULT_GRUPOS_TIPO_2P.g2) {
    faltantes.push(`G2 falta ${DEFAULT_GRUPOS_TIPO_2P.g2 - bancoGrupoTipoStats.value.g2}`)
  }
  if (bancoGrupoTipoStats.value.g3 < DEFAULT_GRUPOS_TIPO_2P.g3) {
    faltantes.push(`G3 falta ${DEFAULT_GRUPOS_TIPO_2P.g3 - bancoGrupoTipoStats.value.g3}`)
  }

  return faltantes.join(' | ')
})

const activeTab = ref('rol')
const examenesList = ref([])
const manualGenerations = ref([])
const loadingManual = ref(false)
const generationPoller = ref(null)

const clearGenerationPoller = () => {
  if (generationPoller.value) {
    clearTimeout(generationPoller.value)
    generationPoller.value = null
  }
}

const monitorExamGeneration = (examId) => {
  clearGenerationPoller()

  const tick = async () => {
    try {
      await cargarDatos()
      const exam = examenesList.value.find((item) => item.id === examId)
      const jobStatus = exam?.distribucion?.job_status

      if (jobStatus === 'queued' || jobStatus === 'processing') {
        generationPoller.value = setTimeout(tick, 8000)
        return
      }

      if (jobStatus === 'completed') {
        $q.notify({
          type: 'positive',
          message: 'El PDF consolidado ya está listo para descarga.',
          icon: 'task_alt',
        })
        return
      }

      if (jobStatus === 'failed') {
        $q.notify({
          type: 'negative',
          message: exam?.distribucion?.job_error || 'La generación en servidor falló.',
          icon: 'error',
        })
      }
    } catch (error) {
      console.error('Error monitoreando generación de examen:', error)
    }
  }

  generationPoller.value = setTimeout(tick, 8000)
}

const estaGeneracionEnProceso = (exam) => {
  const status = exam?.distribucion?.job_status
  return status === 'queued' || status === 'processing'
}

const getManualJobStatus = (row) => row?.configuracion_json?.job_status || null

const estaGeneracionManualEnProceso = (row) => {
  const status = getManualJobStatus(row)
  return status === 'queued' || status === 'processing'
}

const getManualJobLabel = (row) =>
  ({
    queued: 'En cola',
    processing: 'Generando',
    completed: 'Listo',
    failed: 'Falló',
  })[getManualJobStatus(row)] || ''

const getManualJobColor = (row) =>
  ({
    queued: 'amber-8',
    processing: 'blue-7',
    completed: 'green-7',
    failed: 'red-7',
  })[getManualJobStatus(row)] || 'grey-7'

const monitorManualGeneration = (generationId) => {
  clearGenerationPoller()

  const tick = async () => {
    try {
      await cargarManualGenerations()
      const generation = manualGenerations.value.find((item) => item.id === generationId)
      const jobStatus = getManualJobStatus(generation)

      if (jobStatus === 'queued' || jobStatus === 'processing') {
        generationPoller.value = setTimeout(tick, 8000)
        return
      }

      if (jobStatus === 'completed') {
        $q.notify({
          type: 'positive',
          message: 'La generación manual ya está lista para descarga.',
          icon: 'task_alt',
        })
        return
      }

      if (jobStatus === 'failed') {
        $q.notify({
          type: 'negative',
          message:
            generation?.configuracion_json?.job_error || 'La generación manual en servidor falló.',
          icon: 'error',
          timeout: 7000,
        })
      }
    } catch (error) {
      console.error('Error monitoreando generación manual:', error)
    }
  }

  generationPoller.value = setTimeout(tick, 8000)
}

// ESTADO PARA GENERACION MANUAL (EXCEL)
const dialogManual = ref({ show: false })
const manualFile = ref(null)
const manualPreguntas = ref([])
const manualDistribucionConfigurada = ref(null)

const manualFaciles = computed(() => manualPreguntas.value.filter((p) => p.dificultad === '1'))
const manualMedios = computed(() => manualPreguntas.value.filter((p) => p.dificultad === '2'))
const manualDificiles = computed(() => manualPreguntas.value.filter((p) => p.dificultad === '3'))
const manualDistribucionRequerida = computed(
  () => manualDistribucionConfigurada.value || DEFAULT_DISTRIBUCION_2P,
)
const manualEsSuficiente = computed(() => {
  const requerida = manualDistribucionRequerida.value
  return (
    manualFaciles.value.length >= requerida.facil &&
    manualMedios.value.length >= requerida.medio &&
    manualDificiles.value.length >= requerida.dificil
  )
})
const manualGrupoTipoStats = computed(
  () => contarGruposTipoDesdePreguntas(manualPreguntas.value).porGrupoTipo,
)
const manualGrupoTipoSuficiente = computed(
  () =>
    manualGrupoTipoStats.value.g1 >= DEFAULT_GRUPOS_TIPO_2P.g1 &&
    manualGrupoTipoStats.value.g2 >= DEFAULT_GRUPOS_TIPO_2P.g2 &&
    manualGrupoTipoStats.value.g3 >= DEFAULT_GRUPOS_TIPO_2P.g3,
)
const manualPuedeGenerar = computed(
  () => manualEsSuficiente.value && manualGrupoTipoSuficiente.value,
)

const manualConfig = ref({
  sede: null,
  carrera_obj: null,
  carrera_texto: '',
  materia_obj: null,
  materia_texto: '',
  materia_codigo: 'MANUAL',
  docente_obj: null,
  docente_texto: '',
  grupo: '1',
  parcial: PARCIAL_2DO,
  fecha: new Date().toISOString().split('T')[0],
  formatoHoja: 'Oficio (8.5" x 13")',
  semestre: '',
  hora: '',
  hora_texto: '',
  cantVariantes: 1,
  fontFamily: 'helvetica',
  fontSize: 11,
  lineSpacing: 0.85,
  aleatorizarSecciones: true,
  motivo: '',
})
const carrerasOptionsManual = ref([])
const carrerasCache = new Map() // Caché para acelerar selección
const asignaturasOptionsManual = ref([])
const asignaturasOptionsManualFiltered = ref([])
const docentesOptionsManual = ref([])

watch(
  () => manualConfig.value.sede,
  (newSede) => {
    manualConfig.value.carrera_obj = null
    manualConfig.value.carrera_texto = ''
    if (newSede) {
      fetchCarrerasParaManual(newSede.value || newSede)
    } else {
      carrerasOptionsManual.value = []
    }
  },
)

watch(
  () => manualConfig.value.carrera_obj,
  (newCarrera) => {
    manualConfig.value.materia_obj = null
    manualConfig.value.materia_texto = ''
    manualConfig.value.docente_obj = null
    manualConfig.value.docente_texto = ''
    if (newCarrera) {
      manualConfig.value.carrera_texto = newCarrera.label.toUpperCase()
      const cid = newCarrera.value || newCarrera
      fetchAsignaturasManual(cid)
      fetchDocentesManual('')
    } else {
      asignaturasOptionsManual.value = []
    }
  },
)

watch(
  () => [manualConfig.value.sede, manualConfig.value.carrera_obj, manualConfig.value.parcial],
  () => {
    fetchConfigEvaluacionManual()
  },
)

watch(
  () => manualConfig.value.materia_obj,
  (newVal) => {
    if (newVal && typeof newVal === 'object') {
      manualConfig.value.materia_texto = newVal.nombre.toUpperCase()
      manualConfig.value.materia_codigo = newVal.codigo
      if (newVal.semestre) {
        manualConfig.value.semestre = newVal.semestre
      }
      // Cargar docentes específicos de esta materia
      fetchDocentesManual('')
    }
  },
)

watch(
  () => manualConfig.value.docente_obj,
  (newVal) => {
    if (newVal && typeof newVal === 'object') {
      manualConfig.value.docente_texto = newVal.label.toUpperCase()
    }
  },
)

watch(
  () => manualConfig.value.hora,
  (newVal) => {
    if (newVal) {
      manualConfig.value.hora_texto = newVal
    }
  },
)

const fetchConfigEvaluacionManual = async () => {
  const sedeId = manualConfig.value.sede?.value || manualConfig.value.sede
  const carreraId = manualConfig.value.carrera_obj?.value || manualConfig.value.carrera_obj

  if (!sedeId || !carreraId) {
    manualDistribucionConfigurada.value = null
    return
  }

  try {
    const { data } = await api.get('/evaluaciones/config', {
      params: {
        nivel: 'carrera',
        sede_id: sedeId,
        carrera_id: carreraId,
      },
    })
    const distribucion = obtenerDistribucionConfigurada(
      data?.configuracion,
      manualConfig.value.parcial,
    )
    manualDistribucionConfigurada.value = distribucion || null
  } catch (error) {
    console.error('Error cargando config manual:', error)
    manualDistribucionConfigurada.value = null
  }
}

const fetchCarrerasParaManual = async (sedeId) => {
  if (carrerasCache.has(sedeId)) {
    carrerasOptionsManual.value = carrerasCache.get(sedeId)
    // Auto-seleccionar si solo hay una
    if (carrerasOptionsManual.value.length === 1 && !manualConfig.value.carrera_obj) {
      manualConfig.value.carrera_obj = carrerasOptionsManual.value[0]
    }
    return
  }
  try {
    const response = await api.get(`/sedes/${sedeId}/carreras`)
    const data = response.data.map((c) => ({ label: c.nombre, value: c.id }))
    carrerasCache.set(sedeId, data)
    carrerasOptionsManual.value = data

    // Auto-seleccionar si solo hay una
    if (data.length === 1 && !manualConfig.value.carrera_obj) {
      manualConfig.value.carrera_obj = data[0]
    }
  } catch (error) {
    console.error('Error carreras manual:', error)
  }
}

const fetchAsignaturasManual = async (carreraId) => {
  try {
    const response = await api.get(`/asignaturas`, {
      params: {
        carrera_id: carreraId,
        sede_id: manualConfig.value.sede?.value || manualConfig.value.sede,
      },
    })
    const rawData = response.data || []

    // Unificar agresivamente por código y nombre (normalizado sin acentos)
    const uniqueMap = new Map()
    rawData.forEach((a) => {
      const cleanCodigo = (a.codigo || '').trim().toUpperCase()
      const cleanNombre = removeAccents(a.nombre || '')
        .trim()
        .toUpperCase()
      const key = `${cleanCodigo}-${cleanNombre}`
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          label: `[${cleanCodigo}] ${a.nombre.trim().toUpperCase()}`,
          value: a.id,
          nombre: a.nombre.trim().toUpperCase(),
          codigo: cleanCodigo,
          semestre: a.semestre,
        })
      }
    })

    asignaturasOptionsManual.value = Array.from(uniqueMap.values()).sort((a, b) =>
      (a.codigo || '').localeCompare(b.codigo || ''),
    )

    asignaturasOptionsManualFiltered.value = [...asignaturasOptionsManual.value]
  } catch (error) {
    console.error('Error asignaturas manual:', error)
  }
}

const filterAsignaturas = (val, update) => {
  update(() => {
    if (val === '') {
      asignaturasOptionsManualFiltered.value = [...asignaturasOptionsManual.value]
      return
    }
    const needle = val.toLowerCase()
    asignaturasOptionsManualFiltered.value = asignaturasOptionsManual.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    )
  })
}

const fetchDocentesManual = async (q = '') => {
  try {
    const params = { q, per_page: 50 }
    const sid = manualConfig.value.sede?.value || manualConfig.value.sede
    const cid = manualConfig.value.carrera_obj?.value || manualConfig.value.carrera_obj
    const aid = manualConfig.value.materia_obj?.value || null

    if (sid) params.sede_id = sid
    if (cid) params.carrera_id = cid
    if (aid) params.asignatura_id = aid

    let response = await api.get('/docentes', { params })
    let raw = Array.isArray(response.data) ? response.data : response.data.data || []

    // Fallback: si no hay docentes para la materia, traer todos los de la carrera
    if (raw.length === 0 && aid) {
      delete params.asignatura_id
      const resp2 = await api.get('/docentes', { params })
      raw = Array.isArray(resp2.data) ? resp2.data : resp2.data.data || []
    }

    // Unificar docentes por nombre completo para evitar duplicados
    const uniqueMap = new Map()
    raw.forEach((d) => {
      const name = (d.nombre_completo || d.nombre || '').trim().toUpperCase()
      if (name && !uniqueMap.has(name)) {
        uniqueMap.set(name, { label: d.nombre_completo || d.nombre.toUpperCase(), value: d.id })
      }
    })

    docentesOptionsManual.value = Array.from(uniqueMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    )
  } catch (error) {
    console.error('Error docentes manual:', error)
  }
}

const toggleEstadoFiltro = (key) => {
  const index = filtros.value.estado.indexOf(key)
  if (index > -1) {
    filtros.value.estado.splice(index, 1)
  } else {
    filtros.value.estado.push(key)
  }
}

const limpiarFiltros = () => {
  const sedeInicial = debeLimitarSedes.value
    ? sedesOptions.value.find(
        (s) => Number(s.value) === Number(authStore.usuarioActual?.sede_id),
      ) || sedesOptions.value[0]
    : null

  filtros.value = {
    sede: sedeInicial || null,
    carrera: null,
    parcial: PARCIAL_2DO,
    fechaInicio: obtenerFechaHoy(),
    fechaFin: obtenerFechaHoy(),
    estado: [],
    busqueda: '',
  }
}

const abrirGeneracionManual = () => {
  manualFile.value = null
  manualPreguntas.value = []
  manualDistribucionConfigurada.value = null

  // Pre-selección inteligente basada en el perfil del usuario
  const userSedeId = authStore.usuarioActual?.sede_id
  const initialSede =
    filtros.value.sede ||
    (userSedeId ? sedesOptions.value.find((s) => Number(s.value) === Number(userSedeId)) : null) ||
    sedesOptions.value[0] ||
    null

  manualConfig.value = {
    sede: initialSede,
    carrera_obj: null,
    carrera_texto: '',
    materia_obj: null,
    materia_texto: '',
    materia_codigo: 'MANUAL',
    docente_obj: null,
    docente_texto: '',
    grupo: '1',
    parcial: PARCIAL_2DO,
    fecha: date.formatDate(Date.now(), 'YYYY-MM-DD'),
    formatoHoja: 'Oficio (8.5" x 13")',
    semestre: '',
    hora: '',
    hora_texto: '',
    cantVariantes: 1,
    fontFamily: 'helvetica',
    fontSize: 11,
    lineSpacing: 0.85,
    aleatorizarSecciones: true,
    motivo: '',
  }

  // Cargar carreras inmediatamente si ya tenemos sede
  if (initialSede) {
    fetchCarrerasParaManual(initialSede.value)
  }

  fetchDocentesManual()
  dialogManual.value.show = true
}

const normalizeManualCellKey = (value) =>
  removeAccents(String(value || ''))
    .toUpperCase()
    .replace(/[._\-/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeManualHeaderKey = (value) =>
  removeAccents(String(value || ''))
    .toUpperCase()
    .replace(/[.\-/]+/g, '_')
    .replace(/\s+/g, '_')
    .trim()

const getManualRowValue = (row, keys) => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') return row[key]
  }
  return ''
}

const normalizarParcialManual = (value) => {
  const key = normalizeManualCellKey(value)
  if (!key) return ''
  if (key.includes('2') || key.includes('SEGUNDO') || key.includes('2P')) return PARCIAL_2DO
  if (key.includes('1') || key.includes('PRIMER') || key.includes('1P')) return '1er Parcial'
  if (key.includes('FINAL')) return 'Final'
  return String(value || '').trim()
}

const normalizarTipoManualExcel = (value) => {
  const key = normalizeManualCellKey(value)
  if (!key) return ''
  if (['FV', 'FALSO VERDADERO', 'VERDADERO O FALSO', 'VERDADERO O FALSO SIMPLE'].includes(key))
    return 'FALSO_VERDADERO'
  if (
    [
      'VF COMPLEJAS',
      'VERDADERO O FALSO COMPLEJAS',
      'PREGUNTA CON CLAVE',
      'PREGUNTA_CON_CLAVE',
    ].includes(key)
  )
    return 'PREGUNTA_CON_CLAVE'
  if (
    [
      'RESPUESTA COMPUESTA',
      'RESPUESTA_COMPUESTA',
      'RESPUESTA A B AMBAS NINGUNA',
      'RESPUESTA A/B/AMBAS/NINGUNA',
      'A B AMBAS NINGUNA',
    ].includes(key)
  )
    return 'RESPUESTA_COMPUESTA'
  if (
    [
      'SU',
      'SS',
      'SELECCION UNICA',
      'SELECCION_UNICA',
      'SELECCION SIMPLE',
      'SELECCION_SIMPLE',
      'SELECCION DE LA MEJOR RESPUESTA',
      'MEJOR RESPUESTA',
    ].includes(key)
  )
    return 'SELECCION_SIMPLE'
  if (
    ['PR', 'PROBLEMA', 'PROBLEMA O CASO', 'ITEMS AGRUPADOS POR CASO CLINICO O PROBLEMA'].includes(
      key,
    )
  )
    return 'PROBLEMA'
  if (
    ['SP', 'SUBPREGUNTA', 'SUBPROBLEMA', 'SUB PROBLEMA', 'SUBITEM DE CASO O PROBLEMA'].includes(key)
  )
    return 'SUBPROBLEMA'
  if (['EM', 'EMPAREJAMIENTO', 'EMPAREJAMIENTO AMPLIADO'].includes(key)) return 'EMPAREJAMIENTO'
  if (
    [
      'OPCION EMPAREJAMIENTO',
      'OPCION_EMPAREJAMIENTO',
      'OPCION DE EMPAREJAMIENTO',
      'OPCION EMPAREJAMIENTO AMPLIADO',
      'OPCION DE EMPAREJAMIENTO AMPLIADO',
    ].includes(key)
  )
    return 'OPCION_EMPAREJAMIENTO'
  return key.replace(/\s+/g, '_')
}

const normalizarDificultadManual = (value) => {
  const key = normalizeManualCellKey(value)
  if (['1', 'F', 'FACIL'].includes(key)) return '1'
  if (['2', 'M', 'MEDIO', 'MEDIA'].includes(key)) return '2'
  if (['3', 'D', 'DIFICIL'].includes(key)) return '3'
  return key
}

const parseRespuestaManual = (value) =>
  String(value ?? '')
    .toUpperCase()
    .split(/[;,]/)
    .map((r) => r.trim())
    .filter(Boolean)

const onExcelUploaded = (file) => {
  if (!file) {
    manualPreguntas.value = []
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })

      // Buscar hoja 'Banco' o 'Preguntas'. Si no está, usar la primera que no sea 'Instrucciones'
      let wsName = workbook.SheetNames.find((n) =>
        ['BANCO', 'PREGUNTAS', 'DATA'].includes(n.toUpperCase().trim()),
      )
      if (!wsName) {
        wsName =
          workbook.SheetNames.find((n) => n.toUpperCase().trim() !== 'INSTRUCCIONES') ||
          workbook.SheetNames[0]
      }

      const ws = workbook.Sheets[wsName]
      const jsonData = XLSX.utils.sheet_to_json(ws, { defval: '' })
      const parcialSeleccionado = normalizarParcialManual(manualConfig.value.parcial)
      const mapped = jsonData
        .map((row, idx) => {
          const upperRow = {}
          Object.keys(row).forEach((k) => {
            upperRow[normalizeManualHeaderKey(k)] = row[k]
          })

          const tipoFinal = normalizarTipoManualExcel(getManualRowValue(upperRow, ['TIPO']))
          const dificultad = normalizarDificultadManual(
            getManualRowValue(upperRow, ['DIFICULTAD', 'NIVEL_DIFICULTAD']),
          )
          const parcialFila = normalizarParcialManual(
            getManualRowValue(upperRow, ['PARCIAL', 'TIPO_EXAMEN']),
          )
          const enunciado = String(
            getManualRowValue(upperRow, ['ENUNCIADO', 'PREGUNTA', 'TEXTO', 'DESCRIPCION']),
          ).trim()
          const grupo = String(
            getManualRowValue(upperRow, ['GRUPO', 'CODIGO_GRUPO', 'CODIGO_CASO', 'CASO']),
          ).trim()
          const opciones = [
            { id: 'A', text: getManualRowValue(upperRow, ['A', 'OPCION_A', 'INCISO_A']) },
            { id: 'B', text: getManualRowValue(upperRow, ['B', 'OPCION_B', 'INCISO_B']) },
            { id: 'C', text: getManualRowValue(upperRow, ['C', 'OPCION_C', 'INCISO_C']) },
            { id: 'D', text: getManualRowValue(upperRow, ['D', 'OPCION_D', 'INCISO_D']) },
            { id: 'E', text: getManualRowValue(upperRow, ['E', 'OPCION_E', 'INCISO_E']) },
          ]
            .map((option) => ({ ...option, text: String(option.text || '').trim() }))
            .filter((option) => option.text)

          return {
            idx: idx + 2, // Fila en Excel
            id: `m-${idx}-${Date.now()}`,
            enunciado,
            tipo: tipoFinal,
            grupo,
            dificultad,
            parcial: parcialFila || parcialSeleccionado,
            opciones:
              tipoFinal === 'FALSO_VERDADERO'
                ? [
                    { id: 'A', text: 'Verdadero' },
                    { id: 'B', text: 'Falso' },
                  ]
                : opciones,
            respuesta_correcta: parseRespuestaManual(
              getManualRowValue(upperRow, [
                'RESPUESTA_CORRECTA',
                'RESPUESTA_CORRECT',
                'RESPUESTA',
                'CORRECTA',
              ]),
            ),
          }
        })
        .filter((p) => p.enunciado)

      // --- VALIDACIÓN DE FORMATO ---
      const errors = []
      const invalidGroups = new Set()
      const headersPorGrupo = mapped.reduce((acc, p) => {
        const tipo = normalizarTipoManualExcel(p.tipo)
        if (['PROBLEMA', 'EMPAREJAMIENTO'].includes(tipo) && p.grupo) {
          acc.set(`${tipo}:${p.grupo}`, p)
        }
        return acc
      }, new Map())
      const tiposValidos2P = new Set([
        'FALSO_VERDADERO',
        'PREGUNTA_CON_CLAVE',
        'RESPUESTA_COMPUESTA',
        'SELECCION_SIMPLE',
        'PROBLEMA',
        'SUBPROBLEMA',
        'EMPAREJAMIENTO',
        'OPCION_EMPAREJAMIENTO',
      ])

      mapped.forEach((p) => {
        let isInvalid = false
        let reason = ''
        const tipo = normalizarTipoManualExcel(p.tipo)
        const isHeaderType = ['PROBLEMA', 'EMPAREJAMIENTO'].includes(tipo)

        if (!tipo || !tiposValidos2P.has(tipo)) {
          isInvalid = true
          reason = 'Tipo de pregunta no reconocido para el formato actual'
        } else if (p.parcial && normalizarParcialManual(p.parcial) !== parcialSeleccionado) {
          isInvalid = true
          reason = `La fila corresponde a ${p.parcial}, pero el parcial seleccionado es ${manualConfig.value.parcial}`
        } else if (isHeaderType) {
          if (!p.grupo) {
            isInvalid = true
            reason = 'Los encabezados de caso/emparejamiento requieren grupo'
          } else if (p.dificultad !== '') {
            isInvalid = true
            reason = 'Tipos PR/EM no deben tener dificultad asignada'
          } else if (p.respuesta_correcta.length > 0) {
            isInvalid = true
            reason = 'Tipos PR/EM no deben tener respuesta asignada'
          } else if (tipo === 'EMPAREJAMIENTO' && p.opciones.length < 2) {
            isInvalid = true
            reason = 'Emparejamiento requiere al menos dos opciones/terminos'
          }
        } else {
          if (!['1', '2', '3'].includes(p.dificultad)) {
            isInvalid = true
            reason = 'Falta dificultad (1, 2 o 3) o es inválida'
          } else if (p.respuesta_correcta.length === 0) {
            isInvalid = true
            reason = 'Falta respuesta correcta'
          } else if (['SELECCION_SIMPLE', 'SUBPROBLEMA'].includes(tipo) && p.opciones.length < 5) {
            isInvalid = true
            reason = 'La pregunta requiere cinco opciones de respuesta'
          } else if (tipo === 'PREGUNTA_CON_CLAVE' && p.opciones.length < 4) {
            isInvalid = true
            reason = 'Verdadero o falso complejas requiere cuatro incisos'
          } else if (
            tipo === 'SUBPROBLEMA' &&
            (!p.grupo || !headersPorGrupo.has(`PROBLEMA:${p.grupo}`))
          ) {
            isInvalid = true
            reason = 'Subitem de caso requiere un PROBLEMA con el mismo grupo'
          } else if (
            tipo === 'OPCION_EMPAREJAMIENTO' &&
            (!p.grupo || !headersPorGrupo.has(`EMPAREJAMIENTO:${p.grupo}`))
          ) {
            isInvalid = true
            reason = 'Opcion de emparejamiento requiere un EMPAREJAMIENTO con el mismo grupo'
          }
        }

        if (isInvalid) {
          errors.push({ fila: p.idx, enunciado: p.enunciado, motivo: reason, grupo: p.grupo })
          if (p.grupo) invalidGroups.add(p.grupo)
        }
      })

      // Filtrado: Excluir inválidas y sus grupos
      const filtered = mapped.filter((p) => {
        const selfInvalid = errors.some((e) => e.fila === p.idx)
        if (selfInvalid) return false
        if (p.grupo && invalidGroups.has(p.grupo)) return false
        return true
      })

      if (errors.length > 0) {
        const errorMsg = errors
          .map(
            (e) =>
              `<li><b>Fila ${e.fila}:</b> ${e.motivo} (${e.enunciado.substring(0, 40)}...)</li>`,
          )
          .join('')
        $q.dialog({
          title: '<span class="text-red-7 text-weight-bold">Preguntas Ignoradas</span>',
          message: `Se detectaron <b>${errors.length}</b> errores de formato. Estas preguntas y sus grupos no serán tomados en cuenta para el examen:<br><br><ul class="q-pl-md" style="max-height: 200px; overflow-y: auto">${errorMsg}</ul>`,
          html: true,
          ok: { label: 'Entendido', color: 'red-7', unelevated: true, rounded: true },
        })
      }

      if (filtered.length === 0) {
        $q.notify({
          type: 'warning',
          message: `No quedaron preguntas válidas después del filtrado en la hoja "${wsName}".`,
          icon: 'warning',
          timeout: 5000,
        })
        manualFile.value = null
      }

      manualPreguntas.value = filtered
    } catch (err) {
      console.error('Error al procesar Excel:', err)
      $q.notify({ type: 'negative', message: 'El archivo Excel no pudo ser procesado' })
      manualFile.value = null
      manualPreguntas.value = []
    }
  }
  reader.onerror = () => {
    $q.notify({ type: 'negative', message: 'Error de lectura de archivo' })
    manualFile.value = null
    manualPreguntas.value = []
  }
  reader.readAsArrayBuffer(file)
}

const cargarManualGenerations = async () => {
  loadingManual.value = true
  try {
    const { fechaInicio, fechaFin } = rangoFechasFiltro.value
    const params = {
      sede_id: filtros.value.sede?.value || null,
      carrera_id: filtros.value.carrera?.value || null,
      fecha_inicio: fechaInicio || undefined,
      fecha_fin: fechaFin || undefined,
    }
    const response = await api.get('/generaciones-manuales', { params })
    manualGenerations.value = response.data
  } catch (error) {
    console.error('Error al cargar generaciones manuales:', error)
  } finally {
    loadingManual.value = false
  }
}

const buildManualQuestionsPayloadForQueue = () =>
  manualPreguntas.value.map((pregunta) => ({
    idx: pregunta.idx,
    id: pregunta.id,
    enunciado: pregunta.enunciado,
    tipo: pregunta.tipo,
    grupo: pregunta.grupo,
    dificultad: pregunta.dificultad,
    parcial: pregunta.parcial,
    opciones: Array.isArray(pregunta.opciones) ? pregunta.opciones : [],
    respuesta_correcta: pregunta.respuesta_correcta,
  }))

const ejecutarGeneracionManualEnCola = async (requerida) => {
  $q.loading.show({ message: 'Enviando generación manual a la cola del servidor...' })

  try {
    const resolvedSede = manualConfig.value.sede?.label || manualConfig.value.sede || '-'
    const resolvedCarrera = manualConfig.value.carrera_texto || '-'
    const resolvedMateria = manualConfig.value.materia_texto || '-'
    const resolvedCodigo = manualConfig.value.materia_codigo || 'MANUAL'
    const resolvedDocente = manualConfig.value.docente_texto || '-'
    const resolvedHora = manualConfig.value.hora_texto || '-'
    const questions = buildManualQuestionsPayloadForQueue()

    const configGeneracion = {
      formatoHoja: manualConfig.value.formatoHoja,
      fontFamily: manualConfig.value.fontFamily,
      fontSize: manualConfig.value.fontSize,
      lineSpacing: manualConfig.value.lineSpacing,
      aleatorizarSecciones: manualConfig.value.aleatorizarSecciones,
      facil: requerida.facil,
      medio: requerida.medio,
      dificil: requerida.dificil,
      total: requerida.facil + requerida.medio + requerida.dificil,
      cantVariantes: manualConfig.value.cantVariantes,
      materia_codigo: resolvedCodigo,
      semestre: manualConfig.value.semestre || '',
      questions,
    }

    const payloadAuditoria = {
      sede_id: manualConfig.value.sede?.value || null,
      carrera_id: manualConfig.value.carrera_obj?.value || null,
      asignatura_id: manualConfig.value.materia_obj?.value || null,
      docente_id: manualConfig.value.docente_obj?.value || null,
      sede_nombre: resolvedSede,
      carrera_nombre: resolvedCarrera,
      asignatura_nombre: resolvedMateria,
      docente_nombre: resolvedDocente,
      parcial: manualConfig.value.parcial,
      grupo: manualConfig.value.grupo,
      hora: resolvedHora,
      cant_variantes: manualConfig.value.cantVariantes,
      fecha_examen: manualConfig.value.fecha,
      motivo: manualConfig.value.motivo,
      patron_respuestas_json: [],
      configuracion_json: configGeneracion,
    }

    const resAudit = await api.post('/generaciones-manuales', payloadAuditoria)
    const auditId = resAudit.data.id

    await api.post(`/generaciones-manuales/${auditId}/generate-package`, {
      questions,
      config: configGeneracion,
    })

    await cargarManualGenerations()
    monitorManualGeneration(auditId)

    $q.notify({
      type: 'positive',
      message: 'La generación manual fue enviada a la cola del servidor.',
      caption: 'Puedes cerrar esta ventana; los documentos aparecerán cuando el worker termine.',
      icon: 'hourglass_top',
      timeout: 7000,
    })

    dialogManual.value.show = false
    manualConfig.value.motivo = ''
  } catch (error) {
    console.error('Error al enviar generación manual a cola:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'No se pudo enviar la generación manual a cola.',
      caption: error.response?.data?.error || error.message,
      timeout: 8000,
    })
  } finally {
    $q.loading.hide()
  }
}

const ejecutarGeneracionManual = async () => {
  if (!manualPreguntas.value.length) {
    $q.notify({ type: 'warning', message: 'No hay preguntas detectadas' })
    return
  }

  const faciles = manualPreguntas.value.filter((p) => p.dificultad === '1')
  const medios = manualPreguntas.value.filter((p) => p.dificultad === '2')
  const dificiles = manualPreguntas.value.filter((p) => p.dificultad === '3')
  const requerida = manualDistribucionRequerida.value

  if (
    faciles.length < requerida.facil ||
    medios.length < requerida.medio ||
    dificiles.length < requerida.dificil
  ) {
    $q.notify({
      type: 'negative',
      message: `Preguntas insuficientes para 7/16/7. Disponibles -> Fácil: ${faciles.length}, Medio: ${medios.length}, Difícil: ${dificiles.length}`,
      timeout: 6000,
    })
    return
  }

  if (!manualGrupoTipoSuficiente.value) {
    $q.notify({
      type: 'negative',
      message: `Preguntas insuficientes por grupo de tipo. G1: ${manualGrupoTipoStats.value.g1}/${DEFAULT_GRUPOS_TIPO_2P.g1}, G2: ${manualGrupoTipoStats.value.g2}/${DEFAULT_GRUPOS_TIPO_2P.g2}, G3: ${manualGrupoTipoStats.value.g3}/${DEFAULT_GRUPOS_TIPO_2P.g3}`,
      timeout: 7000,
    })
    return
  }

  const usarGeneracionManualEnCola = process.env.QUEUE_MANUAL_GENERATION !== 'false'
  if (usarGeneracionManualEnCola) {
    await ejecutarGeneracionManualEnCola(requerida)
    return
  }

  $q.loading.show({ message: 'Generando variantes y registrando auditoría...' })

  try {
    const resolvedSede = manualConfig.value.sede?.label || manualConfig.value.sede || '-'
    const resolvedCarrera = manualConfig.value.carrera_texto || '-'
    const resolvedMateria = manualConfig.value.materia_texto || '-'
    const resolvedCodigo = manualConfig.value.materia_codigo || 'MANUAL'
    const resolvedDocente = manualConfig.value.docente_texto || '-'
    const resolvedHora = manualConfig.value.hora_texto || '-'

    const fakeExamen = {
      materia: String(resolvedMateria || ''),
      docente: String(resolvedDocente || ''),
      grupo: String(manualConfig.value.grupo || ''),
      sede: String(resolvedSede || ''),
      carrera: String(resolvedCarrera || ''),
      parcial: String(manualConfig.value.parcial || ''),
      fecha_examen: manualConfig.value.fecha,
      semestre: String(manualConfig.value.semestre || ''),
      hora: String(resolvedHora || ''),
      ...manualConfig.value,
      codigo: resolvedCodigo,
      variantes: ['A', 'B', 'C', 'D', 'E'].slice(0, manualConfig.value.cantVariantes),
    }

    const config = {
      formatoHoja: manualConfig.value.formatoHoja,
      fontFamily: manualConfig.value.fontFamily,
      fontSize: manualConfig.value.fontSize,
      lineSpacing: manualConfig.value.lineSpacing,
      facil: requerida.facil,
      medio: requerida.medio,
      dificil: requerida.dificil,
      total: requerida.facil + requerida.medio + requerida.dificil,
      aleatorizarSecciones: manualConfig.value.aleatorizarSecciones,
    }

    const variantesLetters = ['A', 'B', 'C', 'D', 'E'].slice(0, manualConfig.value.cantVariantes)
    const esSegundoParcialManual = esSegundoParcialValor(manualConfig.value.parcial)
    const examenesPDF = esSegundoParcialManual
      ? createExamPdfDocument(config)
      : new jsPDF({
          compression: true,
          putOnlyUsedFonts: true,
          precision: 3,
          format: manualConfig.value.formatoHoja === 'Carta' ? 'letter' : [216, 330],
        })
    const patronesPDF = new jsPDF({ compression: true, putOnlyUsedFonts: true, precision: 3 })
    const variantesAudit = []
    const xBlobs = [] // Para guardar los Excel y descargarlos solo si la auditoría es exitosa
    const resultadosVariantes = []

    for (let i = 0; i < variantesLetters.length; i++) {
      const letra = variantesLetters[i]
      const seleccion = esSegundoParcialManual
        ? buildExamQuestionSelection(manualPreguntas.value, config)
        : obtenerSeleccion7167(manualPreguntas.value, config)

      if (!seleccion) {
        $q.notify({
          type: 'negative',
          message: 'No se pudo armar una variante que cumpla la distribucion por dificultad.',
          icon: 'warning',
        })
        return
      }

      const seleccionConCabeceras = esSegundoParcialManual
        ? completeMacroHeaders(seleccion, manualPreguntas.value)
        : seleccion
      const sorted = esSegundoParcialManual
        ? sortExamQuestionsForPdf(
            mixExamQuestionOptions(JSON.parse(JSON.stringify(seleccionConCabeceras))),
            config,
          )
        : (() => {
            const mezcladas = mezclarIncisos7167(seleccion)
            const ordenBase = [
              'PROBLEMA',
              'EMPAREJAMIENTO',
              'SUBPROBLEMA',
              'SELECCION_UNICA',
              'SELECCION_MULTIPLE',
              'FALSO_VERDADERO',
            ]
            let localOrder = [...ordenBase]

            if (manualConfig.value.aleatorizarSecciones) {
              const principales = [
                'PROBLEMA',
                'EMPAREJAMIENTO',
                'SELECCION_UNICA',
                'SELECCION_MULTIPLE',
                'FALSO_VERDADERO',
              ]
              const shuffled = shuffle([...principales])
              localOrder = []
              shuffled.forEach((t) => {
                localOrder.push(t)
                if (t === 'PROBLEMA' || t === 'EMPAREJAMIENTO') localOrder.push('SUBPROBLEMA')
              })
            }

            return mezcladas.sort((a, b) => {
              if (a.grupo && b.grupo && a.grupo === b.grupo) return 0
              const ta = a._parentTipo || normalizeTipo(a.tipo)
              const tb = b._parentTipo || normalizeTipo(b.tipo)
              return localOrder.indexOf(ta) - localOrder.indexOf(tb)
            })
          })()

      if (esSegundoParcialManual) {
        assertNoOrphanMacroQuestions(sorted)
      }

      variantesAudit.push({
        letra: letra,
        preguntas: sorted.map((p) => ({
          idx: p.idx,
          enunciado: p.enunciado,
          tipo: p.tipo,
          respuesta_correcta: p.respuesta_correcta,
          opciones: p.opciones,
          dificultad: p.dificultad,
          grupo: p.grupo,
        })),
      })

      if (i > 0) {
        // Garantizar que cada variante comience en página impar (anverso)
        const numPages = examenesPDF.internal.getNumberOfPages
          ? examenesPDF.internal.getNumberOfPages()
          : examenesPDF.internal.pages.length - 1
        if (numPages % 2 !== 0) {
          examenesPDF.addPage()
          examenesPDF.setFontSize(10)
          examenesPDF.setTextColor(150)
          examenesPDF.text('PÁGINA EN BLANCO', 105, 150, { align: 'center' })
        }
        examenesPDF.addPage()

        const patPages = patronesPDF.internal.getNumberOfPages
          ? patronesPDF.internal.getNumberOfPages()
          : patronesPDF.internal.pages.length - 1
        if (patPages % 2 !== 0) {
          // Si el frente es impar, el próximo patrón debería empezar en impar tmb idealmente o dejar el patron uno en cada hoja normal
          // Opcional: ajustar patrones también si se necesita, pero lo dejamos simple añadiendo 1 hoja.
        }
        patronesPDF.addPage()
      }

      if (esSegundoParcialManual) {
        await generateExamPdf(examenesPDF, fakeExamen, config, letra, sorted)
      } else {
        await generarExamenPDF(examenesPDF, fakeExamen, config, letra, sorted)
      }
      await generarPatronPDF(patronesPDF, letra, sorted, fakeExamen)

      resultadosVariantes.push({ letra, sorted })
    }

    // Configurar Nombres
    const codN = String(resolvedCodigo || 'EXAM').replace(/\s/g, '')
    const sedeN = String(resolvedSede || '').replace(/\s/g, '')
    const gruN = String(manualConfig.value.grupo || '1').replace(/\s/g, '')
    const parN = String(manualConfig.value.parcial || '').replace(/\s/g, '')
    const varsN = variantesLetters.join('')
    const baseNM = `${codN}_${sedeN}_G${gruN}_${parN}_Var${varsN}`

    // Generar 1 solo Excel consolidado
    const { blob: xBlob, filename: xName } = generarPatronXLSXConsolidado(
      resultadosVariantes,
      `${baseNM}_Remark.xlsx`,
      resolvedCodigo,
    )
    xBlobs.push({ blob: xBlob, name: xName })

    // --- REGISTRO DE AUDITORÍA (BLOQUEANTE) ---
    try {
      const payloadAuditoria = {
        sede_id: manualConfig.value.sede?.value || null,
        carrera_id: manualConfig.value.carrera_obj?.value || null,
        asignatura_id: manualConfig.value.materia_obj?.value || null,
        docente_id: manualConfig.value.docente_obj?.value || null,
        sede_nombre: resolvedSede,
        carrera_nombre: resolvedCarrera,
        asignatura_nombre: resolvedMateria,
        docente_nombre: resolvedDocente,
        parcial: manualConfig.value.parcial,
        grupo: manualConfig.value.grupo,
        hora: resolvedHora,
        cant_variantes: manualConfig.value.cantVariantes,
        fecha_examen: manualConfig.value.fecha,
        motivo: manualConfig.value.motivo,
        patron_respuestas_json: variantesAudit,
        configuracion_json: {
          formatoHoja: manualConfig.value.formatoHoja,
          fontFamily: manualConfig.value.fontFamily,
          fontSize: manualConfig.value.fontSize,
          lineSpacing: manualConfig.value.lineSpacing,
          aleatorizarSecciones: manualConfig.value.aleatorizarSecciones,
        },
      }
      const resAudit = await api.post('/generaciones-manuales', payloadAuditoria)
      const auditId = resAudit.data.id

      // --- SUBIDA DE ARCHIVOS FÍSICOS AL STORAGE ---
      $q.loading.show({ message: 'Subiendo archivos generados al servidor...' })
      const fd = new FormData()

      const exBlob = examenesPDF.output('blob')
      const patBlob = patronesPDF.output('blob')

      fd.append('examen_pdf', exBlob, `${baseNM}_Examen.pdf`)
      fd.append('patron_pdf', patBlob, `${baseNM}_Patron.pdf`)
      xBlobs.forEach((x, i) => {
        fd.append(`patrones_xlsx[${i}]`, x.blob, x.name)
      })

      await api.post(`/generaciones-manuales/${auditId}/upload-archivos`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      cargarManualGenerations()
    } catch (auditErr) {
      console.error(
        'Error al registrar auditoría o subir archivos:',
        auditErr,
        auditErr.response?.data,
      )
      const errorMsg = auditErr.response?.data?.message || auditErr.message || 'Error desconocido'
      const detail = auditErr.response?.data
        ? JSON.stringify(auditErr.response.data)
        : 'Sin response data'

      $q.notify({
        type: 'negative',
        message: `Fallo [${auditErr.response?.status || 'X'}]: ${errorMsg}`,
        caption: detail,
        timeout: 10000,
        html: true,
      })
      return
    }

    $q.notify({
      type: 'positive',
      message: 'Paquete de examen generado y registrado en sistema exitosamente',
      icon: 'done_all',
    })

    dialogManual.value.show = false
    manualConfig.value.motivo = '' // Limpiar motivo para la próxima
  } catch (error) {
    console.error('Error en generación manual:', error)
    $q.notify({ type: 'negative', message: 'Error crítico al procesar archivos' })
  } finally {
    $q.loading.hide()
  }
}

const cargarDatos = async () => {
  if (!filtros.value.sede) return

  $q.loading.show({ message: 'Cargando evaluaciones...' })
  try {
    const { fechaInicio, fechaFin } = rangoFechasFiltro.value
    const params = {
      gestion: '2026-I',
      sede_id: filtros.value.sede.value,
      fecha_inicio: fechaInicio || undefined,
      fecha_fin: fechaFin || undefined,
      estado: filtros.value.estado.length > 0 ? filtros.value.estado.join(',') : undefined,
    }

    if (filtros.value.carrera) {
      params.carrera_id = filtros.value.carrera.value
    }

    const response = await api.get('/rol-examenes', { params })

    // Transformar datos del backend al formato del componente
    const examenes = response.data.data.map((e) => ({
      ...e,
      id: e.id,
      codigo: e.materia_codigo,
      materia: e.materia,
      carrera: e.carrera || 'Carrera',
      sede: e.sede || 'Sede',
      semestre: e.semestre || '-',
      grupo: e.grupo || '-',
      docente: e.docente || 'POR ASIGNAR',
      parcial: e.tipo_examen || e.parcial,
      fecha_examen: e.fecha,
      hora: e.hora_inicio?.substring(0, 5) || '00:00',
      total_preguntas: e.config_generacion?.total || 0,
      distribucion: e.config_generacion || { facil: 0, medio: 0, dificil: 0, total: 0 },
      banco_por_tipo: e.banco_por_tipo || e.por_tipo || e.banco_stats?.por_tipo || {},
      banco_por_grupo_tipo:
        e.banco_por_grupo_tipo || e.por_grupo_tipo || e.banco_stats?.por_grupo_tipo || {},
      banco_stats: normalizarBancoStatsFila(e),
      estado: e.estado || 'programados',
      sede_id: e.sede_id,
      carrera_id: e.carrera_id,
      asignatura_id: e.asignatura_id,
      docente_id: e.docente_id,
      variantes: e.variantes || [],
      patrones: e.patrones || [],
      timestamps: e.timestamps_proceso || { programados: e.created_at },
      color_materia: 'blue-8',
    }))
    examenesList.value = await enriquecerStatsBancoExamenes(examenes)
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar las evaluaciones' })
  } finally {
    $q.loading.hide()
  }
}

// Observadores para recarga automática
watch(
  [
    () => filtros.value.sede,
    () => filtros.value.carrera,
    () => filtros.value.fechaInicio,
    () => filtros.value.fechaFin,
  ],
  () => {
    cargarDatos()
    cargarManualGenerations()
  },
)

const columns = computed(() => {
  const base = [
    { name: 'materia', label: 'MATERIA / GRUPO', field: 'materia', align: 'left', sortable: true },
    { name: 'docente', label: 'DOCENTE', field: 'docente', align: 'left', sortable: true },
    { name: 'parcial', label: 'PARCIAL', field: 'parcial', align: 'center' },
    {
      name: 'fecha',
      label: 'FECHA / HORA',
      field: (row) => row.fecha_examen + ' ' + row.hora,
      align: 'left',
      sortable: true,
    },
    { name: 'cartilla', label: 'CARTILLA', align: 'center', sortable: true },
    { name: 'banco', label: 'BANCO', align: 'center', sortable: true },
    { name: 'preguntas', label: 'PREGUNTAS', align: 'left' },
    { name: 'estado', label: 'ESTADO', align: 'center' },
  ]

  if (puedeVerAcciones.value) {
    base.push({ name: 'documentos', label: 'DOCUMENTOS', align: 'center' })
    base.push({ name: 'acciones', label: 'ACCIONES', align: 'center' })
  }

  return base
})

function examenConCartilla(examen) {
  return Number(examen?.con_cartilla ?? 1) !== 0
}

const statsDesglose = computed(() => {
  return ESTADOS_FLOW.map((st) => {
    const estilo = getEstadoEstilo(st.key)
    return {
      key: st.key,
      label: st.label,
      icon: st.icon,
      color: estilo.textColor.split('-')[0],
      count: examenesList.value.filter((e) => e.estado === st.key).length,
    }
  })
})

const normalizarBusqueda = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

const textoBusquedaEvaluacion = (evaluacion) =>
  normalizarBusqueda(
    [
      evaluacion.codigo,
      evaluacion.materia_codigo,
      evaluacion.asignatura_codigo,
      evaluacion.materia,
      evaluacion.materia_nombre,
      evaluacion.asignatura_nombre,
      evaluacion.docente,
      evaluacion.docente_nombre,
    ]
      .filter(Boolean)
      .join(' '),
  )

const filtrarPorBusqueda = (list) => {
  const busqueda = normalizarBusqueda(filtros.value.busqueda)
  if (!busqueda) return list

  const tokens = busqueda.split(' ')
  return list.filter((evaluacion) => {
    const texto = textoBusquedaEvaluacion(evaluacion)
    return tokens.every((token) => texto.includes(token))
  })
}

const examenesFiltrados = computed(() => {
  let list = [...examenesList.value]

  if (filtros.value.estado && filtros.value.estado.length > 0) {
    list = list.filter((e) => filtros.value.estado.includes(e.estado))
  }

  if (filtros.value.parcial) list = list.filter((e) => e.parcial === filtros.value.parcial)

  list = filtrarPorBusqueda(list)

  return list.sort((a, b) => a.hora.localeCompare(b.hora))
})

const manualGenerationsFiltradas = computed(() => filtrarPorBusqueda([...manualGenerations.value]))

// Función para imprimir PDF consolidada
function imprimirListaDiaria() {
  if (examenesFiltrados.value.length === 0) {
    $q.notify({
      message: 'No hay evaluaciones para imprimir en el rango seleccionado',
      color: 'orange',
    })
    return
  }
  // ... (mismo código jsPDF pero usando examenesFiltrados del backend)
  const doc = new jsPDF({
    compression: true,
    putOnlyUsedFonts: true,
    precision: 3,
    orientation: 'landscape',
    format: [216, 330], // Oficio 8.5x13 pulgadas
  })
  const rangoFechas = etiquetaRangoFechas.value
  const sedeObj = filtros.value.sede
  const sedeName = sedeObj
    ? typeof sedeObj === 'string'
      ? sedeObj
      : sedeObj.label
    : 'Todas las Sedes'

  doc.setFillColor(45, 23, 102)
  doc.rect(0, 0, 330, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.text('REPORTE DIARIO DE SEGUIMIENTO DE EVALUACIONES (CONTROL DE RECEPCIÓN)', 14, 13)

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`CAMPUS: ${sedeName.toUpperCase()}`, 14, 30)
  doc.text(`RANGO: ${rangoFechas}`, 120, 30)
  doc.text(`PARCIAL: ${filtros.value.parcial || 'TODOS'}`, 210, 30)

  const reportColumns = [
    { header: 'HORA', dataKey: 'hora' },
    { header: 'MATERIA / GRUPO', dataKey: 'materia' },
    { header: 'DOCENTE', dataKey: 'docente' },
    { header: 'CARTILLA', dataKey: 'cartilla' },
    { header: 'H. RECOJO', dataKey: 'hRecojo' },
    { header: 'CANT.', dataKey: 'cantRecojo' },
    { header: 'FIRMA', dataKey: 'firmaRecojo' },
    { header: 'H. DEV.', dataKey: 'hDev' },
    { header: 'CANT.', dataKey: 'cantDev' },
    { header: 'FIRMA', dataKey: 'firmaDev' },
    { header: 'OBSERVACIONES', dataKey: 'observaciones' },
  ]

  const tableData = examenesFiltrados.value.map((e) => ({
    hora: e.hora,
    materia: `[${e.codigo}] ${e.materia}\n(G: ${e.grupo})`,
    docente: e.docente,
    cartilla: examenConCartilla(e) ? 'CON\nCARTILLA' : 'SIN\nCARTILLA',
    hRecojo: '',
    cantRecojo: '',
    firmaRecojo: '',
    hDev: '',
    cantDev: '',
    firmaDev: '',
    observaciones: '',
  }))

  autoTable(doc, {
    startY: 38,
    margin: { left: 14, right: 14 },
    tableWidth: 302,
    columns: reportColumns,
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [45, 23, 102],
      textColor: [255, 255, 255],
      fontSize: 8,
      halign: 'center',
      valign: 'middle',
    },
    styles: {
      fontSize: 7,
      valign: 'middle',
      lineColor: [118, 118, 118],
      lineWidth: 0.18,
    },
    bodyStyles: {
      textColor: [25, 25, 25],
      lineColor: [118, 118, 118],
      lineWidth: 0.18,
    },
    tableLineColor: [70, 70, 70],
    tableLineWidth: 0.3,
    columnStyles: {
      hora: { cellWidth: 13, halign: 'center' },
      materia: { cellWidth: 63 },
      docente: { cellWidth: 48 },
      cartilla: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      hRecojo: { cellWidth: 16, halign: 'center' },
      cantRecojo: { cellWidth: 11, halign: 'center' },
      firmaRecojo: { cellWidth: 27 },
      hDev: { cellWidth: 16, halign: 'center' },
      cantDev: { cellWidth: 11, halign: 'center' },
      firmaDev: { cellWidth: 27 },
      observaciones: { cellWidth: 52 },
    },
    didParseCell: (data) => {
      if (
        data.section === 'body' &&
        ['hora', 'materia', 'docente', 'cartilla'].includes(data.column.dataKey)
      ) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.textColor = [0, 0, 0]
      }
    },
  })

  doc.save(`Seguimiento_Evaluaciones_${rangoFechas.replace(/\s+/g, '_')}.pdf`)
}

const configGestion = computed(() => {
  const estado = dialogGestion.value.examen?.estado
  const jobStatus = dialogGestion.value.examen?.distribucion?.job_status
  if (estado === 'programados')
    return {
      titulo: 'Parametrización de Generación',
      icon: 'settings_suggest',
      actionLabel:
        jobStatus === 'queued' || jobStatus === 'processing'
          ? 'Generación en Proceso'
          : 'Generar Variantes Ahora',
      actionIcon: 'auto_awesome',
    }
  if (estado === 'entregados')
    return {
      titulo: 'Recepción y Generación de Patrones',
      icon: 'fact_check',
      actionLabel: 'Generar Patrones y Devolver',
      actionIcon: 'done_all',
    }
  return {
    titulo: 'Avance de Etapa',
    icon: 'arrow_forward',
    actionLabel: 'Confirmar Avance',
    actionIcon: 'check',
    descripcion: '¿Deseas pasar este examen a la siguiente etapa del proceso?',
  }
})

const gestionarEstado = async (examen) => {
  if (notificarBloqueoPorTiempo(examen)) {
    return
  }

  dialogGestion.value.examen = examen
  if (examen.estado === 'programados') {
    const esSegundoParcial = esSegundoParcialValor(examen.tipo_examen || examen.parcial)
    // Valores por defecto iniciales (fallback hard)
    tempConfig.value = {
      cantVariantes: examen.variantes.length || 1,
      facil: examen.distribucion.facil || (esSegundoParcial ? DEFAULT_DISTRIBUCION_2P.facil : 7),
      medio: examen.distribucion.medio || (esSegundoParcial ? DEFAULT_DISTRIBUCION_2P.medio : 16),
      dificil:
        examen.distribucion.dificil || (esSegundoParcial ? DEFAULT_DISTRIBUCION_2P.dificil : 7),
      formatoHoja: examen.distribucion.formatoHoja || 'Oficio (8.5" x 13")',
      fontFamily: examen.distribucion.fontFamily || 'helvetica',
      fontSize: examen.distribucion.fontSize || 11,
      lineSpacing: examen.distribucion.lineSpacing || 1.0,
      aleatorizarSecciones: true,
    }

    // Intentar cargar configuración efectiva del backend
    try {
      const { data } = await api.get('/evaluaciones/config', {
        params: {
          nivel: 'carrera',
          sede_id: examen.sede_id,
          carrera_id: examen.carrera_id,
        },
      })
      if (data.success && data.configuracion) {
        configOrigenActual.value = data.nivel_hallado || 'nacional'
        const distribucionConfigurada = obtenerDistribucionConfigurada(
          data.configuracion,
          examen.tipo_examen || examen.parcial,
        )

        if (distribucionConfigurada) {
          aplicarDistribucionConfigurada(distribucionConfigurada)
        }
      }
    } catch (err) {
      console.error('Error cargando config efectiva:', err)
    }

    if (
      tempConfig.value.facil === 10 &&
      tempConfig.value.medio === 10 &&
      tempConfig.value.dificil === 5
    ) {
      tempConfig.value.facil = 7
      tempConfig.value.medio = 16
      tempConfig.value.dificil = 7
    }

    // Cargar estadísticas del banco de preguntas
    try {
      bancoStats.value = { facil: 0, medio: 0, dificil: 0, total: 0, g1: 0, g2: 0, g3: 0 }
      bancoTotalAsignatura.value = 0
      bancoPorTipo.value = {}
      bancoPorGrupoTipo.value = {}
      const resumenBanco = await cargarStatsBancoExamen(examen, true)
      if (resumenBanco) {
        bancoStats.value = resumenBanco.stats
        bancoPorTipo.value = resumenBanco.porTipo
        bancoPorGrupoTipo.value = resumenBanco.porGrupoTipo
        bancoTotalAsignatura.value = resumenBanco.totalAsignatura || 0
      }
    } catch (err) {
      console.error('Error cargando estadísticas del banco:', err)
    }
  }
  dialogGestion.value.show = true
}

// ==========================================
// CORE: MOTOR DE SELECCIÓN Y GENERACIÓN UNIFICADO
// ==========================================

const obtenerSeleccion7167 = (todas, config) => {
  const metaFacil = parseInt(config.facil) || 7
  const metaMedio = parseInt(config.medio) || 16
  const metaDificil = parseInt(config.dificil) || 7

  const obtenerPool = (nivel) => {
    return todas.filter((p) => {
      const d = String(p.nivel_dificultad || p.dificultad || '1').toUpperCase()
      if (nivel === '1') return ['1', 'FACIL'].includes(d)
      if (nivel === '2') return ['2', 'MEDIO'].includes(d)
      if (nivel === '3') return ['3', 'DIFICIL'].includes(d)
      return false
    })
  }

  const poolF = obtenerPool('1')
  const poolM = obtenerPool('2')
  const poolD = obtenerPool('3')

  const usedIds = new Set()

  const seleccionarDePool = (pool, meta) => {
    if (meta <= 0) return []
    const availablePool = pool.filter((p) => !usedIds.has(p.id))

    const headers = availablePool.filter((p) =>
      ['PROBLEMA', 'EMPAREJAMIENTO'].includes(normalizeTipo(p.tipo)),
    )

    const macroGrupos = headers
      .map((h) => ({
        header: h,
        parentType: normalizeTipo(h.tipo),
        children: todas.filter((candidate) => {
          const candidateType = normalizeTipo(candidate.tipo)
          const isProblemChild =
            normalizeTipo(h.tipo) === 'PROBLEMA' && candidateType === 'SUBPROBLEMA'
          const isMatchingChild =
            normalizeTipo(h.tipo) === 'EMPAREJAMIENTO' && candidateType === 'OPCION_EMPAREJAMIENTO'

          return (
            (isProblemChild || isMatchingChild) &&
            candidate.grupo?.trim() === h.grupo?.trim() &&
            h.grupo &&
            !usedIds.has(candidate.id)
          )
        }),
      }))
      .filter((mg) => mg.children.length > 0)

    const individuales = availablePool
      .filter(
        (p) =>
          [
            'SU',
            'SM',
            'FV',
            'SS',
            'SM',
            'FV',
            'SELECCION_UNICA',
            'SELECCION_MULTIPLE',
            'FALSO_VERDADERO',
          ].includes(p.tipo?.toUpperCase()) &&
          !['SP', 'SUBPREGUNTA', 'SUBPROBLEMA', 'OPCION_EMPAREJAMIENTO'].includes(
            p.tipo?.toUpperCase(),
          ),
      )
      .filter((p) => !headers.some((h) => h.id === p.id))

    let mejorMacros = []
    let mejorSuma = -1

    for (let i = 0; i < 100; i++) {
      let suma = 0
      let seleccion = []
      const macrosShuffled = shuffle([...macroGrupos])
      for (const mg of macrosShuffled) {
        if (suma + mg.children.length <= meta) {
          seleccion.push(mg)
          suma += mg.children.length
        }
        if (suma === meta) break
      }

      if (suma === meta || meta - suma <= individuales.length) {
        mejorMacros = seleccion
        mejorSuma = suma
        break
      }

      if (suma > mejorSuma) {
        mejorSuma = suma
        mejorMacros = seleccion
      }
    }

    let seleccionFinal = []
    let contados = 0

    for (const mg of mejorMacros) {
      usedIds.add(mg.header.id)
      const header = JSON.parse(JSON.stringify(mg.header))
      seleccionFinal.push(header)
      const children = JSON.parse(
        JSON.stringify(
          mg.parentType === 'EMPAREJAMIENTO' ? shuffle([...mg.children]) : [...mg.children],
        ),
      )
      // Inyectar herencia para que el sort las mantenga juntas
      children.forEach((c) => {
        usedIds.add(c.id)
        c._parentTipo = normalizeTipo(header.tipo)
      })
      seleccionFinal.push(...children)
      contados += children.length
    }

    const faltantes = meta - contados
    if (faltantes > 0) {
      const extras = shuffle([...individuales]).slice(0, faltantes)
      extras.forEach((e) => usedIds.add(e.id))
      seleccionFinal.push(...JSON.parse(JSON.stringify(extras)))
    }
    return seleccionFinal
  }

  const selF = seleccionarDePool(poolF, metaFacil)
  const selM = seleccionarDePool(poolM, metaMedio)
  const selD = seleccionarDePool(poolD, metaDificil)
  const seleccionGlobal = [...selF, ...selM, ...selD]

  const contarReales = (seleccion) => {
    return seleccion.filter(
      (p) => !['PR', 'EM', 'PROBLEMA', 'EMPAREJAMIENTO'].includes(p.tipo?.toUpperCase()),
    ).length
  }

  const metaTotal = metaFacil + metaMedio + metaDificil
  const contadosGlobal = contarReales(seleccionGlobal)
  const faltantesTotales = metaTotal - contadosGlobal

  if (faltantesTotales > 0) {
    // Relleno global en caso de incompatibilidad matemática de subpreguntas
    const selExtra = seleccionarDePool(todas, faltantesTotales)
    seleccionGlobal.push(...selExtra)
  }

  return seleccionGlobal
}

const mezclarIncisos7167 = (preguntas) => {
  return preguntas.map((p) => {
    const tipoNormalizado = String(p.tipo ?? '').toUpperCase()
    if (['FALSO_VERDADERO', 'FV'].includes(tipoNormalizado)) {
      // Normalización forzada: A=Verdadero, B=Falso
      const rawAns = Array.isArray(p.respuesta_correcta)
        ? p.respuesta_correcta[0]
        : p.respuesta_correcta
      const ansStr = String(rawAns || '').toUpperCase()
      const esVerdadero =
        ansStr === 'VERDADERO' || ansStr === 'V' || ansStr === 'TRUE' || ansStr === 'A'

      p.opciones = [
        { id: 'A', text: 'Verdadero' },
        { id: 'B', text: 'Falso' },
      ]
      p.respuesta_correcta = esVerdadero ? 'A' : 'B'
      return p
    }

    if (['RESPUESTA_COMPUESTA', 'PREGUNTA_CON_CLAVE'].includes(tipoNormalizado)) {
      p.respuesta_correcta = Array.isArray(p.respuesta_correcta)
        ? String(p.respuesta_correcta[0] || '').toUpperCase()
        : String(p.respuesta_correcta || '').toUpperCase()
      return p
    }

    if (!p.opciones || p.opciones.length === 0) {
      return p
    }

    const rCorrectasOrig = Array.isArray(p.respuesta_correcta)
      ? p.respuesta_correcta
      : [p.respuesta_correcta]
    const textosCorrectos = p.opciones
      .filter((o) => rCorrectasOrig.includes(o.id))
      .map((o) => o.text)

    const nuevasOpciones = shuffle([...p.opciones])
    const abcd = 'ABCDEFGHIJ'.split('')
    let nuevasRCorrectas = []

    p.opciones = nuevasOpciones.map((o, idx) => {
      const newId = abcd[idx] || (idx + 1).toString()
      if (textosCorrectos.includes(o.text)) {
        nuevasRCorrectas.push(newId)
      }
      return { ...o, id: newId }
    })

    p.respuesta_correcta = Array.isArray(p.respuesta_correcta)
      ? nuevasRCorrectas
      : nuevasRCorrectas[0] || p.respuesta_correcta

    return p
  })
}

const ejecutarAccionGestion = async () => {
  const examen = dialogGestion.value.examen
  if (!examen) return
  if (notificarBloqueoPorTiempo(examen)) return

  // Validación de disponibilidad en el banco (solo para generación de variantes)
  if (examen.estado === 'programados' && !bancoSuficiente.value) {
    $q.notify({
      type: 'negative',
      message:
        'No hay suficientes preguntas en el banco para la distribución por dificultad solicitada.',
      icon: 'warning',
    })
    return
  }

  if (examen.estado === 'programados' && !bancoGrupoTipoSuficiente.value) {
    $q.notify({
      type: 'negative',
      message: `No hay suficientes preguntas por grupo de tipo para 2do Parcial. ${resumenFaltantesGrupoTipoBanco.value}`,
      icon: 'warning',
      timeout: 7000,
    })
    return
  }

  const currentIndex = ESTADOS_FLOW.findIndex((e) => e.key === examen.estado)
  const nextKey = ESTADOS_FLOW[currentIndex + 1].key

  const msg =
    nextKey === 'devueltos'
      ? `¿Deseas procesar la generacion de patron(es) y pasar al estado: ${nextKey.toUpperCase()}?`
      : `¿Deseas procesar la generacion de examen(es) y pasar al estado: ${nextKey.toUpperCase()}?`

  $q.dialog({
    title: 'Confirmar Acción',
    message: msg,
    ok: { label: 'Sí, Procesar', color: 'deep-purple', unelevated: true },
    cancel: { label: 'Cancelar', flat: true },
    persistent: true,
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
              parcial: examen.tipo_examen || examen.parcial,
              all_docentes: true,
            },
          })
          bancoPreguntas = resp.data.preguntas || resp.data
        } catch (err) {
          console.error('Error al obtener banco:', err)
          $q.notify({ type: 'negative', message: 'No se pudo obtener el banco de preguntas' })
          $q.loading.hide()
          return
        }
        $q.loading.hide()
        const variantes = ['A', 'B', 'C', 'D', 'E'].slice(0, tempConfig.value.cantVariantes)
        const esSegundoParcialActual = esSegundoParcialValor(examen.tipo_examen || examen.parcial)

        payload.config_generacion = {
          facil: tempConfig.value.facil,
          medio: tempConfig.value.medio,
          dificil: tempConfig.value.dificil,
          total: tempConfig.value.facil + tempConfig.value.medio + tempConfig.value.dificil,
          formatoHoja: tempConfig.value.formatoHoja,
          fontFamily: tempConfig.value.fontFamily,
          fontSize: tempConfig.value.fontSize,
          lineSpacing: tempConfig.value.lineSpacing,
          aleatorizarSecciones: tempConfig.value.aleatorizarSecciones,
          gruposTipoReferencial: esSegundoParcialActual ? { ...bancoGrupoTipoStats.value } : null,
        }

        if (esSegundoParcialActual) {
          $q.loading.show({ message: 'Enviando la generación consolidada al servidor...' })
          await api.post(`/rol-examenes/${examen.id}/generate-package`, {
            cantVariantes: tempConfig.value.cantVariantes,
            facil: tempConfig.value.facil,
            medio: tempConfig.value.medio,
            dificil: tempConfig.value.dificil,
            formatoHoja: tempConfig.value.formatoHoja,
            fontFamily: tempConfig.value.fontFamily,
            fontSize: tempConfig.value.fontSize,
            lineSpacing: tempConfig.value.lineSpacing,
            aleatorizarSecciones: tempConfig.value.aleatorizarSecciones,
          })

          $q.loading.hide()
          $q.notify({
            type: 'info',
            message: 'La generación quedó en cola. El examen se consolidará en un solo PDF.',
            icon: 'hourglass_top',
          })
          dialogGestion.value.show = false
          await cargarDatos()
          monitorExamGeneration(examen.id)
          return
        }

        const formatoPapel = tempConfig.value.formatoHoja === 'Carta' ? 'letter' : [216, 330]
        const mergedExamenesDoc = esSegundoParcialActual
          ? createExamPdfDocument(payload.config_generacion)
          : new jsPDF({
              compression: true,
              putOnlyUsedFonts: true,
              precision: 3,
              format: formatoPapel,
            })
        const mergedPatronesDoc = new jsPDF({
          compression: true,
          putOnlyUsedFonts: true,
          precision: 3,
        })

        const todas = Array.isArray(bancoPreguntas)
          ? bancoPreguntas
          : bancoPreguntas.preguntas || []
        const resultadosVariantes = []

        for (let i = 0; i < variantes.length; i++) {
          const letra = variantes[i]
          const seleccion = esSegundoParcialActual
            ? buildExamQuestionSelection(todas, payload.config_generacion)
            : obtenerSeleccion7167(todas, payload.config_generacion)

          if (!seleccion) {
            $q.notify({
              type: 'negative',
              message: 'No se pudo armar una variante que cumpla la distribución por dificultad.',
              icon: 'warning',
            })
            $q.loading.hide()
            return
          }

          const sorted = esSegundoParcialActual
            ? sortExamQuestionsForPdf(
                mixExamQuestionOptions(JSON.parse(JSON.stringify(seleccion))),
                payload.config_generacion,
              )
            : (() => {
                const mezcladas = mezclarIncisos7167(seleccion)
                const ordenBase = [
                  'PROBLEMA',
                  'SUBPROBLEMA',
                  'EMPAREJAMIENTO',
                  'OPCION_EMPAREJAMIENTO',
                  'SELECCION_UNICA',
                  'PREGUNTA_CON_CLAVE',
                  'SELECCION_MULTIPLE',
                  'FALSO_VERDADERO',
                ]
                let finalOrder = [...ordenBase]

                if (payload.config_generacion.aleatorizarSecciones) {
                  const principales = [
                    'PROBLEMA',
                    'EMPAREJAMIENTO',
                    'SELECCION_UNICA',
                    'PREGUNTA_CON_CLAVE',
                    'SELECCION_MULTIPLE',
                    'FALSO_VERDADERO',
                  ]
                  const shuffled = shuffle([...principales])
                  finalOrder = []
                  shuffled.forEach((t) => {
                    finalOrder.push(t)
                    if (t === 'PROBLEMA') finalOrder.push('SUBPROBLEMA')
                    if (t === 'EMPAREJAMIENTO') finalOrder.push('OPCION_EMPAREJAMIENTO')
                  })
                }

                return mezcladas.sort((a, b) => {
                  if (a.grupo && b.grupo && a.grupo === b.grupo) return 0

                  const ta = a._parentTipo || normalizeTipo(a.tipo)
                  const tb = b._parentTipo || normalizeTipo(b.tipo)

                  const orderA = finalOrder.indexOf(ta)
                  const orderB = finalOrder.indexOf(tb)
                  return (
                    (orderA === -1 ? finalOrder.length : orderA) -
                    (orderB === -1 ? finalOrder.length : orderB)
                  )
                })
              })()

          if (i > 0) {
            // Garantizar que cada variante comience en página impar (anverso)
            const numPages = mergedExamenesDoc.internal.getNumberOfPages
              ? mergedExamenesDoc.internal.getNumberOfPages()
              : mergedExamenesDoc.internal.pages.length - 1
            if (numPages % 2 !== 0) {
              mergedExamenesDoc.addPage()
              mergedExamenesDoc.setFontSize(10)
              mergedExamenesDoc.setTextColor(150)
              mergedExamenesDoc.text('PÁGINA EN BLANCO', 105, 150, { align: 'center' })
            }
            mergedExamenesDoc.addPage()
            mergedPatronesDoc.addPage()
          }

          // Generar contenido en documentos compartidos
          if (esSegundoParcialActual) {
            await generateExamPdf(
              mergedExamenesDoc,
              examen,
              payload.config_generacion,
              letra,
              sorted,
            )
          } else {
            await generarExamenPDF(
              mergedExamenesDoc,
              examen,
              payload.config_generacion,
              letra,
              sorted,
            )
          }
          await generarPatronPDF(mergedPatronesDoc, letra, sorted, examen)

          resultadosVariantes.push({ letra, sorted })
        }

        const varsJoined = resultadosVariantes.map((r) => r.letra).join('')
        const nCod = String(examen.codigo || 'EXAM').replace(/\s/g, '')
        const nSede = String(examen.sede || '').replace(/\s/g, '')
        const nGru = String(examen.grupo || '1').replace(/\s/g, '')
        const nPar = String(examen.parcial || '').replace(/\s/g, '')
        const baseN = `${nCod}_${nSede}_G${nGru}_${nPar}_Var${varsJoined}`

        const finalExName = `${baseN}_Examen.pdf`
        const finalPatOMRName = `${baseN}_Patron.pdf`
        const finalXLSXName = `${baseN}_Remark.xlsx`

        // Generar XLSX Consolidado
        const { blob: xBlob, filename: xName } = generarPatronXLSXConsolidado(
          resultadosVariantes,
          finalXLSXName,
          examen.codigo,
        )

        // 1. Preparar Blobs consolidados
        const finalExBlob = mergedExamenesDoc.output('blob')
        const finalPatOMRBlob = mergedPatronesDoc.output('blob')

        $q.loading.show({ message: 'Subiendo documentos consolidados...' })

        for (const res of resultadosVariantes) {
          try {
            // Subir Examen (Consolidado) para cada variante para que el link funcione
            const fdEx = new FormData()
            fdEx.append('archivo', finalExBlob, finalExName)
            fdEx.append('variante', res.letra)
            fdEx.append('filename', finalExName)
            await api.post(`/rol-examenes/${examen.id}/upload-examen`, fdEx, {
              headers: { 'Content-Type': 'multipart/form-data' },
            })

            // Subir Patron OMR (Consolidado)
            const fPatronPDF = new FormData()
            fPatronPDF.append('archivo', finalPatOMRBlob, finalPatOMRName)
            fPatronPDF.append('variante', res.letra)
            fPatronPDF.append('tipo', 'pdf')
            fPatronPDF.append('filename', finalPatOMRName)
            await api.post(`/rol-examenes/${examen.id}/upload-patron`, fPatronPDF)

            // Subir Patron XLSX (Consolidado)
            const fPatronXLSX = new FormData()
            fPatronXLSX.append('archivo', xBlob, xName)
            fPatronXLSX.append('variante', res.letra)
            fPatronXLSX.append('tipo', 'xlsx')
            fPatronXLSX.append('filename', xName)
            await api.post(`/rol-examenes/${examen.id}/upload-patron`, fPatronXLSX)
          } catch (uploadErr) {
            console.error(`Error subiendo archivos variante ${res.letra}:`, uploadErr)
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
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Error al actualizar el estado',
      })
    }
  })
}

const avanzarDirecto = (examen) => {
  if (notificarBloqueoPorTiempo(examen)) {
    return
  }

  const currentIndex = ESTADOS_FLOW.findIndex((e) => e.key === examen.estado)
  const nextKey = ESTADOS_FLOW[currentIndex + 1].key

  $q.dialog({
    title: 'Avanzar Etapa',
    message: `¿Pasar a ${nextKey.toUpperCase()} directamente?`,
    ok: { label: 'Avanzar', color: 'teal', unelevated: true },
    cancel: true,
  }).onOk(async () => {
    try {
      const ts = { ...examen.timestamps, [nextKey]: new Date().toISOString() }
      await api.put(`/rol-examenes/${examen.id}`, { estado: nextKey, timestamps_proceso: ts })
      $q.notify({ message: 'Etapa actualizada', color: 'positive' })
      cargarDatos()
    } catch (e) {
      console.error('Error de conexión al avanzar etapa:', e)
      $q.notify({
        message: e.response?.data?.message || 'Error de conexión',
        color: 'negative',
      })
    }
  })
}

/**
 * Resetea un examen a estado 'programados' (SOLO PARA ADMINS)
 */
const resetearExamen = (examen) => {
  $q.dialog({
    title: '<span class="text-red-9 text-weight-bold">ADVERTENCIA DE SEGURIDAD</span>',
    message: `¿Deseas restaurar el examen <strong>[${examen.codigo}] ${examen.materia}</strong> al estado PROGRAMADO? <br><br> <div class="q-pa-sm bg-red-1 text-red-9 rounded-borders"><b>IMPORTANTE:</b> Esto eliminará permanentemente las variantes y patrones generados.</div>`,
    html: true,
    ok: { label: 'Restaurar a Programado', color: 'red-9', unelevated: true, noCaps: true },
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    persistent: true,
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Restaurando evaluación...' })
      const { data } = await api.put(`/rol-examenes/${examen.id}`, {
        estado: 'programados',
      })
      if (data) {
        $q.notify({
          type: 'positive',
          message: 'Examen restaurado exitosamente',
        })
        cargarDatos()
      }
    } catch (error) {
      console.error('Error al restaurar examen:', error)
      const msg = error.response?.data?.message || 'No se pudo restaurar el examen'
      $q.notify({ type: 'negative', message: msg })
    } finally {
      $q.loading.hide()
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
  const map = {
    programados: { color: 'blue-1', textColor: 'blue-9' },
    generados: { color: 'purple-1', textColor: 'purple-9' },
    impresos: { color: 'cyan-1', textColor: 'cyan-9' },
    entregados: { color: 'indigo-1', textColor: 'indigo-9' },
    devueltos: { color: 'orange-1', textColor: 'orange-9' },
    revisados: { color: 'green-1', textColor: 'green-9' },
    subidos: { color: 'teal-1', textColor: 'teal-9' },
  }
  return map[estado] || { color: 'grey-2', textColor: 'grey-8' }
}
const isEstadoActive = (curr, target) => curr === target
const isEstadoCompleted = (curr, target) =>
  ESTADOS_FLOW.findIndex((e) => e.key === target) < ESTADOS_FLOW.findIndex((e) => e.key === curr)
const tieneGestion = (e) => ['programados', 'entregados'].includes(e)

// --- GESTIÓN DE GENERACIONES MANUALES ---
const manualColumns = [
  {
    name: 'materia',
    label: 'MATERIA / GRUPO',
    align: 'left',
    field: 'asignatura_nombre',
    sortable: true,
  },
  { name: 'docente', label: 'DOCENTE', align: 'left', field: 'docente_nombre', sortable: true },
  { name: 'parcial', label: 'PARCIAL', align: 'center', field: 'parcial', sortable: true },
  { name: 'fecha', label: 'FECHA / HORA', align: 'left', sortable: true },
  { name: 'preguntas', label: 'PREGUNTAS', align: 'left' },
  { name: 'estado', label: 'ESTADO', align: 'center', field: 'estado', sortable: true },
  { name: 'documentos', label: 'DOCUMENTOS', align: 'center' },
  { name: 'datos_auditoria', label: 'AUDITORÍA', align: 'left' },
]

const getManualStats = (row) => {
  if (!row.patron_respuestas_json || row.patron_respuestas_json.length === 0) {
    const preguntasConfiguradas = row.configuracion_json?.questions || []
    if (preguntasConfiguradas.length > 0) {
      const f = preguntasConfiguradas.filter((p) => String(p.dificultad) === '1').length
      const m = preguntasConfiguradas.filter((p) => String(p.dificultad) === '2').length
      const d = preguntasConfiguradas.filter((p) => String(p.dificultad) === '3').length
      return { total: f + m + d, facil: f, medio: m, dificil: d }
    }
    return { total: 0, facil: 0, medio: 0, dificil: 0 }
  }
  const preguntas = row.patron_respuestas_json[0].preguntas || []
  const f = preguntas.filter((p) => String(p.dificultad) === '1').length
  const m = preguntas.filter((p) => String(p.dificultad) === '2').length
  const d = preguntas.filter((p) => String(p.dificultad) === '3').length
  const t = f + m + d
  return { total: t, facil: f, medio: m, dificil: d }
}

const actualizarEstadoManual = async (id, nuevoEstado) => {
  try {
    await api.put(`/generaciones-manuales/${id}/estado`, { estado: nuevoEstado })
    $q.notify({ type: 'positive', message: `Estado actualizado a ${nuevoEstado}` })
    cargarManualGenerations()
  } catch (err) {
    console.error('Error actualizando:', err)
    $q.notify({ type: 'negative', message: 'Error actualizando estado' })
  }
}

const confirmarEstadoManual = (row, nuevoEstado) => {
  if (row.estado === nuevoEstado) return

  if (estaGeneracionManualEnProceso(row)) {
    $q.notify({
      type: 'warning',
      message: 'Espera a que termine la generación en cola antes de cambiar el estado.',
    })
    return
  }

  let message = `¿Confirmar el cambio de estado de "${row.estado}" a "${nuevoEstado}"?`
  if (nuevoEstado === 'DEVUELTO') {
    message +=
      '<br><br><span class="text-red text-weight-bold">Aviso: Cambiar a DEVUELTO liberará los Patrones de Respuesta para este examen.</span>'
  }

  $q.dialog({
    title: 'Confirmar Cambio de Estado',
    message: message,
    html: true,
    persistent: true,
    ok: { label: 'Confirmar', color: 'primary' },
    cancel: { label: 'Cancelar', flat: true },
  }).onOk(() => {
    actualizarEstadoManual(row.id, nuevoEstado)
  })
}

const getManualActiveColor = (est) => {
  if (est === 'GENERADO') return 'blue-7'
  if (est === 'ENTREGADO') return 'indigo-7'
  if (est === 'DEVUELTO') return 'teal-7'
  return 'grey-7'
}

const getManualEstadoIcon = (est) => {
  if (est === 'GENERADO') return 'auto_awesome'
  if (est === 'ENTREGADO') return 'inventory_2'
  if (est === 'DEVUELTO') return 'assignment_returned'
  return 'help_outline'
}

const descargarArchivoAPI = async (url, nombreSugerido, openInNewTab = false) => {
  try {
    const response = await api.get(url, { responseType: 'blob' })
    let filename = nombreSugerido
    const contentDisposition =
      response.headers['content-disposition'] || response.headers['Content-Disposition']
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";]+)"?/)
      if (match && match[1]) filename = match[1]
    }

    // Forzar el MIME type correcto para que el navegador lo muestre en lugar de descargar si es PDF
    const isPdf = filename.toLowerCase().endsWith('.pdf')
    const blobType = isPdf ? 'application/pdf' : response.data.type
    const blob = new Blob([response.data], { type: blobType })

    const downloadUrl = window.URL.createObjectURL(blob)

    if (openInNewTab && isPdf) {
      window.open(downloadUrl, '_blank')
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 10000)
    } else {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
    }
  } catch (error) {
    let msgError = 'Error de red o permisos al descargar el archivo.'

    if (error.response) {
      console.error('Status:', error.response.status)
      if (error.response.status === 404) {
        msgError = 'El archivo físico no se encontró en el servidor.'
      }

      // Intentar leer el mensaje de error del backend si existe (aunque es blob)
      if (error.response.data instanceof Blob) {
        const text = await error.response.data.text()
        console.error('Error desde Backend:', text)
        try {
          const json = JSON.parse(text)
          if (json.message) msgError = json.message
        } catch {
          // ignorar error de parseo
        }
      }
    } else {
      console.error('Error de Axios:', error.message)
    }

    $q.notify({ type: 'negative', message: msgError })
  }
}

const descargarPDFManual = async (row) => {
  if (row.archivo_examen) {
    $q.loading.show({ message: 'Abriendo Examen...' })
    await descargarArchivoAPI(
      `/generaciones-manuales/${row.id}/download-examen`,
      row.archivo_examen,
      true,
    )
    $q.loading.hide()
    return
  }

  // Fallback si es antiguo y no tenía el PDF subido
  $q.notify({ message: 'Reconstruyendo PDF antiguo...', color: 'info' })
  const examenDoc = {
    materia: row.asignatura_nombre,
    docente: row.docente_nombre,
    sede: row.sede_nombre,
    carrera: row.carrera_nombre,
    parcial: row.parcial,
    gestion: row.gestion,
    grupo: row.grupo,
    fecha: row.fecha_examen,
    hora: row.hora,
  }
  const config = row.configuracion_json || {}
  const variantesData = row.patron_respuestas_json || []
  const formatoPapel = config.formatoHoja === 'Carta' ? 'letter' : [216, 330]
  const doc = new jsPDF({
    compression: true,
    putOnlyUsedFonts: true,
    precision: 3,
    format: formatoPapel,
  })
  variantesData.forEach(async (v, i) => {
    if (i > 0) doc.addPage()
    await generarExamenPDF(doc, examenDoc, config, v.letra, v.preguntas)
  })
  window.open(doc.output('bloburl'), '_blank')
}

const descargarPatronPdfManual = async (row) => {
  if (row.estado !== 'DEVUELTO') {
    return
  }
  if (row.archivo_patron_pdf) {
    $q.loading.show({ message: 'Abriendo Patrón PDF...' })
    await descargarArchivoAPI(
      `/generaciones-manuales/${row.id}/download-patron-pdf`,
      row.archivo_patron_pdf,
      true,
    )
    $q.loading.hide()
    return
  }

  // Fallback
  const doc = new jsPDF({ compression: true, putOnlyUsedFonts: true, precision: 3 })
  const variantesData = row.patron_respuestas_json || []
  variantesData.forEach((v, i) => {
    if (i > 0) doc.addPage()
    generarPatronPDF(doc, v.letra, v.preguntas, {
      materia: row.asignatura_nombre,
      parcial: row.parcial,
    })
  })
  window.open(doc.output('bloburl'), '_blank')
}

const descargarPatronXlsxManual = async (row) => {
  if (row.estado !== 'DEVUELTO') {
    return
  }
  if (row.archivos_patron_xlsx && row.archivos_patron_xlsx.length > 0) {
    $q.loading.show({ message: 'Descargando Patrón Excel...' })
    const nombreXlsx =
      typeof row.archivos_patron_xlsx[0] === 'string' ? row.archivos_patron_xlsx[0] : 'Patron.xlsx'
    await descargarArchivoAPI(
      `/generaciones-manuales/${row.id}/download-patron-xlsx`,
      nombreXlsx,
      false,
    )
    $q.loading.hide()
  }
}
const formatTimestamp = (ts) =>
  ts
    ? new Date(ts).toLocaleString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

const getExamenUrl = (row, v) => {
  const filename = typeof v === 'string' ? null : v.archivo
  if (!filename) return 'javascript:void(0)'
  const baseUrl = api.defaults.baseURL.replace('/api', '')
  if (typeof v === 'object' && v?.path) {
    return `${baseUrl}/api/rol-examenes/${row.id}/download-examen?file=${encodeURIComponent(filename)}`
  }
  return `${baseUrl}/storage/examenes/${filename}`
}

const getPatronUrl = (row, p, tipo) => {
  const filename = typeof p === 'string' ? null : p[tipo]
  if (!filename) return 'javascript:void(0)'
  const baseUrl = api.defaults.baseURL.replace('/api', '')
  const managedPath = tipo === 'pdf' ? p?.pdf_path : p?.xlsx_path
  if (typeof p === 'object' && managedPath) {
    return `${baseUrl}/api/rol-examenes/${row.id}/download-patron?tipo=${tipo}&file=${encodeURIComponent(filename)}`
  }
  return `${baseUrl}/storage/patrones/${filename}`
}

const abrirExamenGenerado = async (row) => {
  const variant = row?.variantes?.[0]
  if (!variant || typeof variant === 'string' || !variant.archivo) return

  if (variant.path) {
    await descargarArchivoAPI(
      `/rol-examenes/${row.id}/download-examen?file=${encodeURIComponent(variant.archivo)}`,
      variant.archivo,
      true,
    )
    return
  }

  window.open(getExamenUrl(row, variant), '_blank')
}

const abrirPatronGenerado = async (row, tipo) => {
  const pattern = row?.patrones?.[0]
  if (!pattern || typeof pattern === 'string' || !pattern[tipo]) return

  const managedPath = tipo === 'pdf' ? pattern.pdf_path : pattern.xlsx_path
  if (managedPath) {
    await descargarArchivoAPI(
      `/rol-examenes/${row.id}/download-patron?tipo=${tipo}&file=${encodeURIComponent(pattern[tipo])}`,
      pattern[tipo],
      tipo === 'pdf',
    )
    return
  }

  window.open(getPatronUrl(row, pattern, tipo), tipo === 'pdf' ? '_blank' : '_self')
}

const generarPatronPDF = async (pdfDoc, letra, preguntas = [], examenInput = null) => {
  const doc = pdfDoc || new jsPDF({ compression: true, putOnlyUsedFonts: true, precision: 3 })
  const examen = examenInput || {
    materia: 'MATERIA',
    docente: 'DOCENTE',
    carrera: 'CARRERA',
    sede: 'SEDE',
    grupo: 'G1',
    parcial: '1er PARCIAL',
    codigo: '0000',
  }
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
  doc.text('"TÚ ESTÁS AQUÍ PORQUE FORMAS PARTE DE NUESTRA HISTORIA"', pageWidth / 2, margin + 19, {
    align: 'center',
  })

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
      const bx = x + idx * 7
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
    { k: 'Grupo:', v: `Grupo ${examen.grupo || ''}` },
  ]
  fields.forEach((f, idx) => {
    const fy = currentY + 15 + idx * 6
    doc.text(String(f.k || ''), margin, fy)
    doc.setFont('helvetica', 'normal')
    doc.text(String(f.v ?? ''), margin + 20, fy)
    doc.setFont('helvetica', 'bold')
  })

  doc.text('FECHA:', pageWidth - margin - 45, currentY + 21)
  doc.setFont('helvetica', 'normal')
  const fechaStr = examen.fecha_examen
    ? new Date(examen.fecha_examen).toISOString().split('T')[0]
    : '-'
  doc.text(String(fechaStr), pageWidth - margin - 30, currentY + 21)

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
      const bx = x + 8 + idx * 7
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
  const preguntasReales = preguntas.filter(
    (p) => !['PROBLEMA', 'EMPAREJAMIENTO'].includes(normalizeTipo(p.tipo)),
  )
  const totalFilas = 100
  const qPerCol = 25

  for (let i = 0; i < totalFilas; i++) {
    const p = preguntasReales[i] || null
    const colIndex = Math.floor(i / qPerCol)
    const rowIndex = i % qPerCol

    const x = margin + colIndex * colWidth
    const y = startYGrid + rowIndex * 7

    // Normalize answer
    let ans = ''
    if (p) {
      let rawAns = p.respuesta_correcta
      if (Array.isArray(rawAns)) rawAns = rawAns.join('')
      ans = String(rawAns || '')
        .toUpperCase()
        .replace(/["']/g, '')

      const tipo = String(p.tipo || '').toUpperCase()
      if (['FALSO_VERDADERO', 'FALSO O VERDADERO', 'FV'].includes(tipo)) {
        // En el patrón, ya vienen normalizadas por mezclarIncisos7167
        // pero por seguridad reforzamos el mapeo lógico
        if (ans === 'VERDADERO' || ans === 'V' || ans === 'TRUE' || ans === 'A') ans = 'A'
        else if (ans === 'FALSO' || ans === 'F' || ans === 'FALSE' || ans === 'B') ans = 'B'
      }
    }

    drawOMRLine(i + 1, ans, x, y)

    // Bottom line deco
    doc.setDrawColor(230, 230, 230)
    doc.setLineWidth(0.1)
    doc.line(x, y + 3.5, x + colWidth - 5, y + 3.5)
  }

  const cleanSede = String(examen.sede || '').replace(/\s/g, '')
  const cleanParcial = String(examen.parcial || '').replace(/\s/g, '')
  const rawFilename = `${examen.codigo || 'EXAM'}_${cleanSede}_G${examen.grupo || ''}_${cleanParcial}_PatronVar${letra}.pdf`
  const blob = doc.output('blob')
  return { blob, filename: rawFilename }
}

const generarPatronXLSXConsolidado = (resultadosVariantes, customName, codigoAsignatura = '') => {
  const codigo = String(codigoAsignatura || 'EXAM').trim()
  const headerRow = ['Codigo', 'Variante', 'ID_Pregunta']
  for (let i = 1; i <= 100; i++) headerRow.push(`P${i}`)

  const dataRows = []

  for (const res of resultadosVariantes) {
    const preguntasReales = res.sorted.filter(
      (p) => !['PROBLEMA', 'EMPAREJAMIENTO'].includes(normalizeTipo(p.tipo)),
    )
    const dataRow = [codigo, res.letra, 'Respuesta']

    for (let i = 0; i < 100; i++) {
      const p = preguntasReales[i] || null
      let ans = ''
      if (p) {
        let rawAns = p.respuesta_correcta
        if (Array.isArray(rawAns)) {
          if (rawAns.length > 1) {
            ans = `(${rawAns.join(',')})`
          } else if (rawAns.length === 1) {
            ans = String(rawAns[0] || '').toUpperCase()
          }
        } else {
          ans = String(rawAns || '')
            .toUpperCase()
            .replace(/["']/g, '')
          if (ans.includes(',') || ans.includes(';')) {
            ans = `(${ans.replace(/;/g, ',')})`
          }
        }
        const tipo = String(p.tipo || '').toUpperCase()
        if (['FALSO_VERDADERO', 'FALSO O VERDADERO', 'FV'].includes(tipo)) {
          if (ans === 'VERDADERO' || ans === 'V' || ans === 'TRUE' || ans === 'A') ans = 'A'
          else if (ans === 'FALSO' || ans === 'F' || ans === 'FALSE' || ans === 'B') ans = 'B'
        }
      }
      dataRow.push(ans)
    }
    dataRows.push(dataRow)
  }

  const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, `Patrones`)

  const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbOut], { type: 'application/octet-stream' })
  const filename = customName || `Patrones_Consolidados.xlsx`

  return { blob, filename }
}

const generarExamenPDF = async (pdfDoc, examen, config, letra = 'A', preguntas = []) => {
  const formatMap = {
    Carta: 'letter',
    Oficio: 'legal',
    'Oficio (8.5" x 13")': [215.9, 330.2],
  }
  const paperFormat = formatMap[config.formatoHoja] || [215.9, 330.2]

  const doc =
    pdfDoc ||
    new jsPDF({
      compression: true,
      putOnlyUsedFonts: true,
      precision: 3,
      orientation: 'p',
      unit: 'mm',
      format: paperFormat,
    })

  // CONFIGURACIÓN DE IMPRESIÓN PERSONALIZADA
  const baseFont = config.fontFamily || 'helvetica'
  const baseSize = config.fontSize || 11
  const spacingMult = config.lineSpacing || 1.1 // Ligeramente más compacto
  const lineHeight = baseSize * 0.42 * spacingMult // Factor corregido para escala mm
  // Sincronizar interlineado de jsPDF con nuestro cálculo manual (Factor 1.1905 = 0.42mm/pt)
  doc.setLineHeightFactor(1.1905 * spacingMult)
  const sectionFontSize = Math.max(9, baseSize - 1)
  const metaFontSize = Math.max(8, baseSize - 2)

  doc.setFont(baseFont)

  const margin = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - margin * 2

  const formatFecha = (f) => {
    if (!f) return '-'
    const d = new Date(f)
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const cleanText = (t) => {
    return (
      String(t || '')
        .replace(/<[^>]*>/g, '') // Eliminar HTML
        .replace(/&nbsp;/g, ' ') // Convertir espacios HTML a normales
        .replace(/&quot;/g, '"')
        .replace(/&rsquo;/g, "'")
        .replace(/&lsquo;/g, "'")
        .replace(/&rdquo;/g, '"')
        .replace(/&ldquo;/g, '"')
        .replace(/&ndash;/g, '-')
        .replace(/&mdash;/g, '-')
        // Reemplazo específico para caracteres que rompen jsPDF (estándar Helvetica)
        .replace(/ƒ/g, 'f')
        .replace(/…/g, '...')
        // Limpiar cualquier carácter fuera del rango Latin-1 (que suelen romper el layout de jsPDF)
        .replace(/[^\x20-\x7E\xA0-\xFF\s]/g, ' ')
        .replace(/[\u00A0\u1680\u180e\u2000-\u200b\u202f\u205f\u3000\ufeff]/g, ' ')
        .replace(/\s+/g, ' ') // Colapsar múltiples espacios
        .trim()
    )
  }

  const stripIncisoPrefix = (text) => cleanText(text).replace(/^([IVX]+|\d+|[A-Z])[.):]\s+/i, '')

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
    styles: {
      fontSize: 11,
      font: baseFont,
      textColor: [0, 0, 0],
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
    },
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
            minCellHeight: 20,
          },
        },
        {
          content: 'UNIVERSIDAD TECNICA PRIVADA COSMOS\nGESTION I-2026',
          styles: { halign: 'center', fontSize: 13, fontStyle: 'bold' },
        },
        { content: '', rowSpan: 2, styles: { cellWidth: 35 } },
      ],
      [
        {
          content: `EVALUACION TEÓRICA ${examen.parcial.toUpperCase()}`,
          styles: { halign: 'center', fontStyle: 'bold' },
        },
      ],
    ],
    didDrawCell: (data) => {
      if (
        data.section === 'body' &&
        data.column.index === 0 &&
        data.row.index === 0 &&
        logoBase64
      ) {
        const padding = 2
        doc.addImage(
          logoBase64,
          'PNG',
          data.cell.x + padding,
          data.cell.y + padding,
          data.cell.width - padding * 2,
          data.cell.height - padding * 2,
        )
      }
    },
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
    tableWidth: pageWidth - margin * 2,
    theme: 'grid',
    styles: {
      fontSize: metaFontSize,
      cellPadding: 2.5,
      lineWidth: 0.15,
      lineColor: [0, 0, 0],
      font: baseFont,
    },
    body: [
      [
        {
          content: 'NOMBRE:',
          styles: {
            fontStyle: 'bold',
            minCellHeight: 10,
            cellWidth: (pageWidth - margin * 2) * 0.65,
          },
        },
        {
          content: 'CODIGO:',
          styles: { fontStyle: 'bold', cellWidth: (pageWidth - margin * 2) * 0.35 },
        },
      ],
      [
        { content: `CARRERA: ${String(examen.carrera || '')}`, styles: { fontStyle: 'bold' } },
        { content: `GRUPO: ${String(examen.grupo || '')}`, styles: { fontStyle: 'bold' } },
      ],
      [
        { content: `DOCENTE: ${String(examen.docente || '')}`, styles: { fontStyle: 'bold' } },
        {
          content: `TIPO DE EXAMEN: ${String(examen.parcial || '')} - VAR ${letra}`,
          styles: { fontStyle: 'bold' },
        },
      ],
      [
        { content: `MATERIA: ${String(examen.materia || '')}`, styles: { fontStyle: 'bold' } },
        { content: `FECHA: ${formatFecha(examen.fecha_examen)}`, styles: { fontStyle: 'bold' } },
      ],
      [
        { content: `SEMESTRE: ${String(examen.semestre || '')}`, styles: { fontStyle: 'bold' } },
        { content: `HORA: ${String(examen.hora || '')}`, styles: { fontStyle: 'bold' } },
      ],
      [
        {
          content:
            'IMPORTANTE: Completar obligatoriamente NOMBRE, CODIGO y marcar el TIPO/VARIANTE en la cartilla.',
          colSpan: 2,
          styles: {
            fontStyle: 'bold',
            halign: 'center',
            fontSize: Math.max(7, metaFontSize - 1),
            textColor: [180, 40, 40],
            fillColor: [255, 245, 245],
          },
        },
      ],
    ],
  })

  // Efecto de margen doble minimalista (borde exterior más grueso)
  const tableHeight = doc.lastAutoTable.finalY - startYTable
  doc.setLineWidth(0.4)
  doc.rect(margin, startYTable, contentWidth, tableHeight)

  let currentY = doc.lastAutoTable.finalY + 10

  // AGRUPAR POR TIPO PARA RENDERIZAR SECCIONES
  const descripciones = {
    SELECCION_UNICA:
      'SELECCIÓN DE LA MEJOR RESPUESTA: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.',
    PREGUNTA_CON_CLAVE:
      'VERDADERO O FALSO COMPLEJAS: Seleccione la respuesta correcta de acuerdo a la clave indicada.',
    SELECCION_MULTIPLE:
      'SELECCIÓN MÚLTIPLE: Analice el enunciado y marque todas las opciones que den una respuesta válida. Tenga en cuenta que puede haber más de una respuesta correcta.',
    FALSO_VERDADERO:
      'VERDADERO O FALSO: Para cada afirmación, indique si el contenido es Verdadero marcando la opción (A) o Falso marcando la opción (B).',
    PROBLEMA:
      'PROBLEMAS Y CASOS: Lea detenidamente el caso planteado y resuelva cada una de las preguntas que se presentan a continuación.',
    EMPAREJAMIENTO:
      'EMPAREJAMIENTO: Relacione cada término con su concepto o definición correcta, seleccionando la letra que corresponda en cada espacio.',
  }

  let ultimoTipo = null
  let problemCount = 0

  // RENDER PREGUNTAS
  for (let i = 0; i < preguntas.length; i++) {
    const p = preguntas[i]
    let tipoActual = normalizeTipo(p.tipo)
    // Encabezado de sección (Solo para tipos principales)
    const tiposPrincipales = [
      'SELECCION_UNICA',
      'PREGUNTA_CON_CLAVE',
      'SELECCION_MULTIPLE',
      'FALSO_VERDADERO',
      'PROBLEMA',
      'EMPAREJAMIENTO',
    ]
    if (tipoActual !== ultimoTipo && tiposPrincipales.includes(tipoActual)) {
      const descText = descripciones[tipoActual] || `SECCIÓN: ${tipoActual.replace('_', ' ')}`
      const descLines = doc.splitTextToSize(descText, contentWidth - 4)
      const rectH = descLines.length * 4.5 + 4

      if (currentY + rectH > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage()
        currentY = margin
      }

      // Diseño Minimalista Moderno (Doble Línea)
      doc.setDrawColor(40, 40, 40)

      // Línea superior gruesa
      doc.setLineWidth(0.8)
      doc.line(margin, currentY, margin + contentWidth, currentY)

      doc.setFontSize(sectionFontSize)
      doc.setFont(baseFont, 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text(descLines, margin, currentY + 5)

      // Línea inferior fina
      doc.setLineWidth(0.2)
      doc.line(margin, currentY + rectH, margin + contentWidth, currentY + rectH)

      currentY += rectH + (tipoActual === 'PROBLEMA' ? 8 : 10) // Mayor separación para evitar solapamiento
      ultimoTipo = tipoActual
    }

    // Check for page break
    if (currentY > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage()
      doc.setFont(baseFont) // Re-asegurar fuente tras salto
      currentY = margin
    }
    // RENDER PREGUNTA ACTUAL
    const enumTextBase =
      i +
      1 -
      preguntas
        .slice(0, i)
        .filter((x) => ['PROBLEMA', 'EMPAREJAMIENTO'].includes(normalizeTipo(x.tipo))).length

    // CASO ESPECIAL: EMPAREJAMIENTO (TABLA 2 COLUMNAS)
    if (tipoActual === 'EMPAREJAMIENTO') {
      doc.setFontSize(baseSize)
      doc.setFont(baseFont, 'bold')
      let cleanEnunciado = (p.enunciado || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .trim()
      if (cleanEnunciado.toUpperCase().startsWith('EMPAREJAMIENTO:')) {
        cleanEnunciado = cleanEnunciado.substring(16).trim()
      }
      const enunciadoLines = doc.splitTextToSize(cleanEnunciado, contentWidth - 10)

      // Buscar subpreguntas
      let matchingSubs = []
      let j = i + 1
      while (
        j < preguntas.length &&
        normalizeTipo(preguntas[j].tipo) === 'OPCION_EMPAREJAMIENTO' &&
        preguntas[j].grupo === p.grupo
      ) {
        matchingSubs.push(preguntas[j])
        j++
      }

      // PREESTIMACIÓN DE EMPAREJAMIENTO COMPLETO
      let estH = enunciadoLines.length * lineHeight + 4
      const ops = p.opciones || []
      estH += ops.length * (lineHeight + 0.5) + 4
      for (const sub of matchingSubs) {
        let subText = sub.enunciado?.replace(/<[^>]*>/g, '').trim() + ' (      )'
        const subLines = doc.splitTextToSize(subText, contentWidth - 20)
        estH += subLines.length * lineHeight + 4
      }
      estH += 5

      const maxPageHeight = doc.internal.pageSize.getHeight() - 25
      if (currentY + estH > maxPageHeight && estH < maxPageHeight - margin) {
        doc.addPage()
        doc.setFont(baseFont)
        currentY = margin
        doc.setFontSize(baseSize)
        doc.setFont(baseFont, 'bold')
      }

      doc.text(enunciadoLines, margin + 8, currentY) // Alineado con preguntas normales
      currentY += enunciadoLines.length * lineHeight + 4

      // Opciones (A, B, C...)
      doc.setFont(baseFont, 'normal')
      doc.setFontSize(baseSize - 2)
      for (const op of ops) {
        if (currentY > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage()
          currentY = margin
          doc.setFont(baseFont)
        }
        doc.text(`${op.id}) ${op.text}`, margin + 15, currentY)
        currentY += lineHeight + 0.5
      }
      currentY += 4

      // Render Sub-preguntas (Como preguntas normales con paréntesis al final)
      doc.setFontSize(baseSize)
      for (let r = 0; r < matchingSubs.length; r++) {
        const sub = matchingSubs[r]
        const numReal = enumTextBase + r

        if (currentY > doc.internal.pageSize.getHeight() - 25) {
          doc.addPage()
          currentY = margin
          doc.setFont(baseFont)
        }

        doc.setFont(baseFont, 'bold')
        doc.text(`${numReal}. `, margin + 10, currentY)

        doc.setFont(baseFont, 'normal')
        let subText = sub.enunciado?.replace(/<[^>]*>/g, '').trim() + ' (      )'
        const subLines = doc.splitTextToSize(subText, contentWidth - 20)
        doc.text(subLines, margin + 18, currentY)
        currentY += subLines.length * lineHeight + 4
      }

      currentY += 5
      i = j - 1 // Saltar subpreguntas
      continue
    }

    let cleanEnunciado = cleanText(p.enunciado)
    // Eliminar prefijos redundantes
    if (cleanEnunciado.toUpperCase().startsWith('EMPAREJAMIENTO:')) {
      cleanEnunciado = cleanEnunciado.substring(16).trim()
    }
    if (cleanEnunciado.toUpperCase().startsWith('PROBLEMA:')) {
      cleanEnunciado = cleanEnunciado.substring(9).trim()
    }
    const enunciadoLines = doc.splitTextToSize(cleanEnunciado, contentWidth - 12)

    // --- PREDECIR ALTURA TOTAL DE LA PREGUNTA ---
    let estimatedHeight = enunciadoLines.length * lineHeight
    const opciones = Array.isArray(p.opciones) ? p.opciones : []
    let tipoActualNoNormalizado = p.tipo?.toUpperCase()
    const esHeader = ['PR', 'PROBLEMA'].includes(p.tipo?.toUpperCase())
    const incisosPreguntaClave =
      tipoActual === 'PREGUNTA_CON_CLAVE'
        ? opciones
            .map((opc) =>
              typeof opc === 'string'
                ? stripIncisoPrefix(opc)
                : stripIncisoPrefix(opc?.text || opc?.label || opc?.enunciado || ''),
            )
            .filter(Boolean)
        : []

    if (tipoActual === 'SUBPROBLEMA') estimatedHeight += 4
    estimatedHeight += esHeader ? 0.5 : 2
    if (p.imagen) estimatedHeight += 47 // Altura típica max de imagen + padding

    if (incisosPreguntaClave.length > 0) {
      incisosPreguntaClave.forEach((inciso, index) => {
        const incisoText = `${index + 1}. ${inciso}`
        const incisoLines = doc.splitTextToSize(incisoText, contentWidth - 22)
        estimatedHeight += incisoLines.length * lineHeight + 1
      })
    } else if (opciones.length > 0) {
      for (const opc of opciones) {
        let textToShow = cleanText(opc.text)
        if (['FALSO_VERDADERO', 'FV'].includes(tipoActualNoNormalizado)) {
          if (opc.id === 'A') textToShow = 'Verdadero'
          else if (opc.id === 'B') textToShow = 'Falso'
        }
        const opcText = `${opc.id || ''}) ${textToShow}`
        const opcLines = doc.splitTextToSize(opcText, contentWidth - 22)
        estimatedHeight += opcLines.length * lineHeight + 1
      }
    }
    estimatedHeight += esHeader ? 0 : 5

    // Si la pregunta no cabe en esta página, pero SÍ cabría en una página vacía, saltamos de página antes de imprimirla
    const maxPageHeight = doc.internal.pageSize.getHeight() - 25
    if (currentY + estimatedHeight > maxPageHeight && estimatedHeight < maxPageHeight - margin) {
      doc.addPage()
      currentY = margin
    }
    // ---------------------------------------------

    doc.setFontSize(baseSize)
    doc.setFont(baseFont, 'bold')

    // Solo numeramos si NO es un encabezado PROBLEMA
    if (!esHeader) {
      const headersAntes = preguntas
        .slice(0, i)
        .filter((x) => ['PROBLEMA', 'EMPAREJAMIENTO'].includes(normalizeTipo(x.tipo))).length
      const realNum = i + 1 - headersAntes
      doc.text(`${realNum}. `, margin, currentY)
    } else {
      // Título distintivo para el caso clínico
      problemCount++
      doc.setFontSize(baseSize + 1)
      doc.setFont(baseFont, 'bold')
      doc.text(`CASO Nº ${problemCount}:`, margin, currentY)
      currentY += 6
      doc.setFontSize(baseSize)
    }

    doc.setFont(baseFont, 'normal')

    doc.text(enunciadoLines, margin + 8, currentY)
    currentY += enunciadoLines.length * lineHeight

    // Instrucción para Subpreguntas (PR)
    if (tipoActual === 'SUBPROBLEMA') {
      doc.setFontSize(metaFontSize)
      doc.setFont(baseFont, 'italic')
      doc.text('(Seleccione un solo inciso)', margin + 8, currentY + 2.5)
      currentY += 4
      doc.setFont(baseFont, 'normal')
    }

    // Espacios adicionales de seguridad
    currentY += esHeader ? 2 : 2 // 2mm tras un caso clínico/problema

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

          if (currentY + imgH > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage()
            currentY = margin
          }

          doc.addImage(imgData, 'JPEG', (pageWidth - imgW) / 2, currentY, imgW, imgH)
          currentY += imgH + 2
        } else {
          // DIAGNÓSTICO: Si falla la carga, dibujar un cuadro rojo
          doc.setDrawColor(255, 0, 0)
          doc.rect((pageWidth - 20) / 2, currentY, 20, 10)
          doc.text('ERR_IMG', (pageWidth - 20) / 2 + 2, currentY + 7)
          currentY += 15
        }
      } catch (e) {
        console.error('Error cargando imagen en PDF:', e)
        doc.text('CATCH_IMG_ERR', margin, currentY)
        currentY += 10
      }
    }

    // Opciones

    if (incisosPreguntaClave.length > 0) {
      doc.setFontSize(baseSize - 1)
      doc.setFont(baseFont, 'normal')
      for (let incisoIndex = 0; incisoIndex < incisosPreguntaClave.length; incisoIndex++) {
        const incisoText = `${incisoIndex + 1}. ${incisosPreguntaClave[incisoIndex]}`
        const incisoLines = doc.splitTextToSize(incisoText, contentWidth - 22)
        if (currentY + incisoLines.length * lineHeight > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage()
          currentY = margin
          doc.setFont(baseFont)
        }
        doc.text(incisoLines, margin + 12, currentY)
        currentY += incisoLines.length * lineHeight + 1
      }
    } else if (opciones.length > 0) {
      doc.setFontSize(baseSize - 1)
      doc.setFont(baseFont, 'normal') // Asegurar fuente normal
      for (const opc of opciones) {
        let textToShow = cleanText(opc.text)
        if (['FALSO_VERDADERO', 'FV'].includes(tipoActualNoNormalizado)) {
          if (opc.id === 'A') textToShow = 'Verdadero'
          else if (opc.id === 'B') textToShow = 'Falso'
        }
        const opcText = `${opc.id || ''}) ${textToShow}`
        // Margen de seguridad mayor para opciones (22mm de reserva a la derecha)
        const opcLines = doc.splitTextToSize(opcText, contentWidth - 22)
        if (currentY + opcLines.length * lineHeight > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage()
          currentY = margin
          doc.setFont(baseFont)
        }
        doc.text(opcLines, margin + 12, currentY)
        currentY += opcLines.length * lineHeight + 1
      }
    }
    currentY += esHeader ? 2 : 5 // Más espacio tras un caso clínico para separar de la 1er pregunta
  }

  const cleanSede = String(examen.sede || '').replace(/\s/g, '')
  const cleanParcial = String(examen.parcial || '').replace(/\s/g, '')
  const rawFilename = `${examen.codigo || 'EXAM'}_${cleanSede}_G${examen.grupo || ''}_${cleanParcial}_Var${letra}.pdf`
  const blob = doc.output('blob')
  return { blob, filename: rawFilename }
}

async function compressImage(blob, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(blob)
  })
}

async function fetchImageAsBase64(url) {
  try {
    const response = await api.get(url, { responseType: 'blob' })
    let blob = response.data

    // Comprimir solo imágenes (JPEG/PNG)
    if (blob.type.startsWith('image/')) {
      blob = await compressImage(blob)
    }

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
.gestion-eval-page {
  padding: 40px;
  background-color: #e2e8f0;
  min-height: 100vh;
}
.page-title {
  color: #1e293b;
  letter-spacing: -0.025em;
}
.stat-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
.icon-box {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.date-range-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
.date-range-input {
  flex: 1 1 0;
  min-width: 0;
}
.table-card {
  border-radius: 16px;
  background: white;
  border: 1px solid #94a3b8;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.1);
  overflow: hidden;
}
.main-table :deep(thead th) {
  font-weight: 700;
  color: #334155;
  background: #e2e8f0;
  padding: 16px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #94a3b8;
}
.main-table :deep(tbody td) {
  border-bottom: 1px solid #cbd5e1;
}
.main-table :deep(tbody tr:hover td) {
  background: #f8fafc;
}
.materia-codigo-chip {
  min-height: 20px;
  padding: 0 7px;
  font-size: 10px;
  font-weight: 800;
}
.banco-disponibilidad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.banco-disponibilidad :deep(.q-chip) {
  margin: 0;
}
.banco-mini-chip {
  min-width: 82px;
  justify-content: center;
}
.preguntas-cell {
  width: 140px;
}
.distribution-bar {
  height: 6px;
  width: 100%;
  background: #e2e8f0;
  border-radius: 3px;
  display: flex;
  overflow: hidden;
}
.bar-segment {
  height: 100%;
  transition: width 0.3s ease;
}
.bar-segment.facile {
  background: #10b981;
}
.bar-segment.medio {
  background: #f59e0b;
}
.bar-segment.dificil {
  background: #ef4444;
}
.progreso-bullets {
  display: flex;
  gap: 4px;
}
.bullet-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #e2e8f0;
  transition: all 0.3s ease;
}
.bullet-dot.active {
  background: #6366f1;
  transform: scale(1.4);
}
.bullet-dot.completed {
  background: #94a3b8;
}
.action-btn-main {
  font-weight: 700;
  letter-spacing: 0.02em;
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 8px;
}
.action-btn-main:hover {
  transform: translateY(-1px);
}
.total-badge .q-chip {
  height: 28px;
}
.difficulty-count-input {
  max-width: 56px;
}
.difficulty-count-input :deep(input) {
  padding: 0;
  font-size: 15px;
}

@media (max-width: 1023px) {
  .date-range-controls {
    flex-wrap: wrap;
  }

  .date-range-input {
    flex-basis: calc(50% - 3px);
  }
}
</style>
