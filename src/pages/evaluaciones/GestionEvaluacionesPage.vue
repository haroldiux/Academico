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
            v-if="puedeEditar"
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
      <div class="col-12 col-md-4 flex items-center no-wrap">
        <q-input
          v-model="filtros.fecha"
          outlined
          dense
          type="date"
          label="Filtrar por Fecha"
          clearable
          bg-color="white"
          class="full-width q-mr-sm"
        />
        <q-btn
          unelevated
          color="blue-7"
          icon="assessment"
          @click="dialogStats = true"
          class="q-mr-xs"
        >
          <q-tooltip>Ver Estadísticas del Día</q-tooltip>
        </q-btn>
        <q-btn unelevated color="deep-purple" icon="print" @click="imprimirListaDiaria">
          <q-tooltip>Imprimir Lista de Seguimiento</q-tooltip>
        </q-btn>
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
        <q-tab v-if="puedeEditar" name="manual" icon="history_edu" label="Generaciones Manuales" />
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
            PARA LA FECHA:
            <span class="text-weight-bold text-black">{{ filtros.fecha || 'TODAS' }}</span>
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
                size="xs"
                dense
                class="q-mr-sm"
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
            <q-chip
              :color="props.row.total_banco > 0 ? 'green-1' : 'grey-2'"
              :text-color="props.row.total_banco > 0 ? 'green-9' : 'grey-8'"
              size="sm"
              :icon="props.row.total_banco > 0 ? 'check_circle' : 'help_outline'"
              class="text-weight-bold"
            >
              {{ props.row.total_banco > 0 ? 'DISPONIBLE' : 'VACÍO' }}
              <q-tooltip v-if="props.row.total_banco > 0">
                Se encontraron {{ props.row.total_banco }} preguntas
              </q-tooltip>
              <q-tooltip v-else> No hay preguntas cargadas </q-tooltip>
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
              v-if="puedeEditar && props.row.estado !== 'programados'"
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
                  type="a"
                  :href="getExamenUrl(props.row.variantes[0])"
                  target="_blank"
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
                  ['devueltos', 'revisados', 'subidos'].includes(props.row.estado)
                "
              />

              <!-- Patrones generados (Restringidos hasta DEVUELTOS) -->
              <template
                v-if="
                  props.row.patrones &&
                  props.row.patrones.length > 0 &&
                  ['devueltos', 'revisados', 'subidos'].includes(props.row.estado)
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
                    type="a"
                    :href="getPatronUrl(props.row.patrones[0], 'pdf')"
                    target="_blank"
                    v-if="props.row.patrones[0].pdf"
                  >
                    <q-tooltip>Respuestas OMR (Consolidado)</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    color="green-8"
                    icon="description"
                    size="sm"
                    type="a"
                    :href="getPatronUrl(props.row.patrones[0], 'xlsx')"
                    target="_blank"
                    v-if="props.row.patrones[0].xlsx"
                  >
                    <q-tooltip>Patrón Excel (Consolidado)</q-tooltip>
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
            <div v-if="puedeEditar" class="acciones-row justify-center no-wrap">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="visibility"
                size="sm"
                @click="verDetalles(props.row)"
              >
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
                <q-btn
                  flat
                  dense
                  icon="check_circle"
                  color="green-8"
                  label="Subido"
                  disable
                  no-caps
                />
              </template>
            </div>
            <div v-else>
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="visibility"
                size="sm"
                @click="verDetalles(props.row)"
              >
                <q-tooltip>Ver detalles</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Manual Generations Table -->
    <q-card v-if="activeTab === 'manual'" class="table-card" flat bordered>
      <q-table
        :rows="manualGenerations"
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
                @click="descargarPDFManual(props.row)"
              >
                <q-tooltip>Examen (Consolidado)</q-tooltip>
              </q-btn>

              <q-separator vertical class="q-mx-xs" v-if="props.row.estado === 'DEVUELTO'" />

              <!-- Patrón OMR (PDF) -->
              <q-btn
                flat
                round
                dense
                color="teal-7"
                icon="picture_as_pdf"
                size="sm"
                :disable="props.row.estado !== 'DEVUELTO'"
                @click="descargarPatronPdfManual(props.row)"
                v-if="props.row.estado === 'DEVUELTO'"
              >
                <q-tooltip>Patrón OMR (Consolidado)</q-tooltip>
              </q-btn>

              <!-- Patrón Excel (XLSX) -->
              <q-btn
                flat
                round
                dense
                color="green-8"
                icon="backup_table"
                size="sm"
                :disable="props.row.estado !== 'DEVUELTO'"
                @click="descargarPatronXlsxManual(props.row)"
                v-if="props.row.estado === 'DEVUELTO'"
              >
                <q-tooltip>Patrón Excel (Consolidado)</q-tooltip>
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
              <div class="col-4">
                <q-input
                  v-model.number="tempConfig.facil"
                  outlined
                  label="Fáciles"
                  type="number"
                  dense
                  color="green"
                  stack-label
                >
                  <template v-slot:append>
                    <div class="text-caption text-grey-6">/ {{ bancoStats.facil }}</div>
                  </template>
                </q-input>
              </div>
              <div class="col-4">
                <q-input
                  v-model.number="tempConfig.medio"
                  outlined
                  label="Medios"
                  type="number"
                  dense
                  color="orange"
                  stack-label
                >
                  <template v-slot:append>
                    <div class="text-caption text-grey-6">/ {{ bancoStats.medio }}</div>
                  </template>
                </q-input>
              </div>
              <div class="col-4">
                <q-input
                  v-model.number="tempConfig.dificil"
                  outlined
                  label="Difíciles"
                  type="number"
                  dense
                  color="red"
                  stack-label
                >
                  <template v-slot:append>
                    <div class="text-caption text-grey-6">/ {{ bancoStats.dificil }}</div>
                  </template>
                </q-input>
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
                v-if="!bancoSuficiente"
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
                :color="bancoSuficiente ? 'primary' : 'red'"
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
              solicitada.
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
            :disable="!bancoSuficiente"
            @click="ejecutarAccionGestion"
            no-caps
            class="q-px-lg shadow-3"
          />
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
                      :color="manualFaciles.length >= 7 ? 'green-1' : 'red-1'"
                      :text-color="manualFaciles.length >= 7 ? 'green-9' : 'red-9'"
                      icon="sentiment_satisfied_alt"
                      class="full-width q-ma-none"
                    >
                      <div class="text-caption">Fácil: {{ manualFaciles.length }}/7</div>
                    </q-chip>
                  </div>
                  <div class="col-4">
                    <q-chip
                      :color="manualMedios.length >= 16 ? 'green-1' : 'red-1'"
                      :text-color="manualMedios.length >= 16 ? 'green-9' : 'red-9'"
                      icon="sentiment_neutral"
                      class="full-width q-ma-none"
                    >
                      <div class="text-caption">Medio: {{ manualMedios.length }}/16</div>
                    </q-chip>
                  </div>
                  <div class="col-4">
                    <q-chip
                      :color="manualDificiles.length >= 7 ? 'green-1' : 'red-1'"
                      :text-color="manualDificiles.length >= 7 ? 'green-9' : 'red-9'"
                      icon="sentiment_very_dissatisfied"
                      class="full-width q-ma-none"
                    >
                      <div class="text-caption">Difícil: {{ manualDificiles.length }}/7</div>
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
            :disable="!manualEsSuficiente || !manualConfig.materia_texto || !manualConfig.motivo"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar, date } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore, ROLES } from 'src/stores/auth'
import { usePermisos } from 'src/composables/usePermisos'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

const $q = useQuasar()
const authStore = useAuthStore()
const { puedeEditar } = usePermisos()

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
  const s = String(t || '')
    .toUpperCase()
    .trim()
  if (['PR', 'PROBLEMA'].includes(s)) return 'PROBLEMA'
  if (['EM', 'EMPAREJAMIENTO'].includes(s)) return 'EMPAREJAMIENTO'
  if (['SP', 'SUBPREGUNTA', 'SUBPROBLEMA'].includes(s)) return 'SUBPROBLEMA'
  if (['SU', 'SS', 'SELECCION_UNICA'].includes(s)) return 'SELECCION_UNICA'
  if (['SM', 'SELECCION_MULTIPLE'].includes(s)) return 'SELECCION_MULTIPLE'
  if (['FV', 'FALSO_VERDADERO', 'FALSO O VERDADERO'].includes(s)) return 'FALSO_VERDADERO'
  return s
}

const filtros = ref({
  sede: null,
  carrera: null,
  parcial: '1er Parcial',
  fecha: date.formatDate(Date.now(), 'YYYY-MM-DD'),
  estado: [],
})

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

const esSedeRestringida = computed(() => {
  return authStore.rol === ROLES.EVALUACIONES || authStore.alcance === 'sede'
})

const fetchSedes = async () => {
  loadingOptions.value.sedes = true
  try {
    const response = await api.get('/sedes')
    const rawSedes = response.data.data || []
    const allSedes = rawSedes.map((s) => ({ label: s.nombre, value: s.id }))

    // Si es Vicerrector Sede o Director Académico, mostrar SOLO su sede
    if (
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
    if (esSedeRestringida.value && currentSedeId) {
      const sedeUsuario = sedesOptions.value.find((s) => Number(s.value) === Number(currentSedeId))
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
    carrerasOptions.value = response.data.map((c) => ({ label: c.nombre, value: c.id }))
  } catch (error) {
    console.error('Error carreras:', error)
  } finally {
    loadingOptions.value.carreras = false
  }
}

watch(
  () => filtros.value.sede,
  (newSede) => {
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
  },
)

onMounted(async () => {
  // Asegurar que tenemos los últimos datos del usuario (con relaciones campus/sede)
  if (authStore.isAuthenticated) {
    await authStore.fetchUser()
  }
  await fetchSedes()
  await cargarManualGenerations()

  // Pre-cargar carreras de la sede del usuario para el diálogo manual (Warm Cache)
  const userSedeId = authStore.usuarioActual?.sede_id
  if (userSedeId) {
    fetchCarrerasParaManual(userSedeId)
  }

  cargarDatos()
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

const bancoSuficiente = computed(() => {
  if (dialogGestion.value.examen?.estado !== 'programados') return true
  return (
    (tempConfig.value.facil || 0) <= (bancoStats.value.facil || 0) &&
    (tempConfig.value.medio || 0) <= (bancoStats.value.medio || 0) &&
    (tempConfig.value.dificil || 0) <= (bancoStats.value.dificil || 0)
  )
})

const activeTab = ref('rol')
const examenesList = ref([])
const manualGenerations = ref([])
const loadingManual = ref(false)

// ESTADO PARA GENERACION MANUAL (EXCEL)
const dialogManual = ref({ show: false })
const manualFile = ref(null)
const manualPreguntas = ref([])

const manualFaciles = computed(() => manualPreguntas.value.filter((p) => p.dificultad === '1'))
const manualMedios = computed(() => manualPreguntas.value.filter((p) => p.dificultad === '2'))
const manualDificiles = computed(() => manualPreguntas.value.filter((p) => p.dificultad === '3'))
const manualEsSuficiente = computed(
  () =>
    manualFaciles.value.length >= 7 &&
    manualMedios.value.length >= 16 &&
    manualDificiles.value.length >= 7,
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
  parcial: '1er Parcial',
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
  filtros.value = {
    sede: esSedeRestringida.value
      ? sedesOptions.value.find((s) => Number(s.value) === Number(authStore.usuarioActual?.sede_id))
      : null,
    carrera: null,
    parcial: '1er Parcial',
    fecha: date.formatDate(Date.now(), 'YYYY-MM-DD'),
    estado: [],
  }
}

const abrirGeneracionManual = () => {
  manualFile.value = null
  manualPreguntas.value = []

  // Pre-selección inteligente basada en el perfil del usuario
  const userSedeId = authStore.usuarioActual?.sede_id
  const initialSede = userSedeId
    ? sedesOptions.value.find((s) => Number(s.value) === Number(userSedeId))
    : sedesOptions.value.length > 0
      ? sedesOptions.value[0]
      : null

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
    parcial: '1er Parcial',
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
  }

  // Cargar carreras inmediatamente si ya tenemos sede
  if (initialSede) {
    fetchCarrerasParaManual(initialSede.value)
  }

  fetchDocentesManual()
  dialogManual.value.show = true
}

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
      const mapped = jsonData
        .map((row, idx) => {
          const upperRow = {}
          Object.keys(row).forEach((k) => {
            // Normalizar: quitar acentos, espacios a _, todo a UPPER
            const normalizedKey = String(k)
              .toUpperCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/\s+/g, '_')
              .trim()
            upperRow[normalizedKey] = row[k]
          })

          // Estandarizar tipos para que activen los encabezados del PDF
          let tipoRaw = String(upperRow.TIPO || 'SU')
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
          let tipoFinal = tipoRaw
          if (['SU', 'SS', 'SELECCION_UNICA'].includes(tipoRaw)) tipoFinal = 'SELECCION_UNICA'
          else if (['SM', 'SELECCION_MULTIPLE'].includes(tipoRaw)) tipoFinal = 'SELECCION_MULTIPLE'
          else if (['FV', 'FALSO_VERDADERO', 'FALSO O VERDADERO'].includes(tipoRaw))
            tipoFinal = 'FALSO_VERDADERO'
          else if (['PR', 'PROBLEMA'].includes(tipoRaw)) tipoFinal = 'PROBLEMA'
          else if (['EM', 'EMPAREJAMIENTO'].includes(tipoRaw)) tipoFinal = 'EMPAREJAMIENTO'
          else if (['SP', 'SUBPREGUNTA', 'SUBPROBLEMA'].includes(tipoRaw)) tipoFinal = 'SUBPREGUNTA'

          return {
            idx: idx + 2, // Fila en Excel
            id: `m-${idx}-${Date.now()}`,
            enunciado: String(upperRow.ENUNCIADO || '').trim(),
            tipo: tipoFinal,
            grupo: String(upperRow.GRUPO || '').trim(),
            dificultad: upperRow.DIFICULTAD ? String(upperRow.DIFICULTAD).trim() : '',
            opciones: (() => {
              let ops = [
                { id: 'A', text: upperRow.A ?? upperRow.OPCION_A ?? null },
                { id: 'B', text: upperRow.B ?? upperRow.OPCION_B ?? null },
                { id: 'C', text: upperRow.C ?? upperRow.OPCION_C ?? null },
                { id: 'D', text: upperRow.D ?? upperRow.OPCION_D ?? null },
                { id: 'E', text: upperRow.E ?? upperRow.OPCION_E ?? null },
              ]
              if (tipoFinal === 'FALSO_VERDADERO') {
                if (!ops[0].text) ops[0].text = 'Verdadero'
                if (!ops[1].text) ops[1].text = 'Falso'
                return ops.slice(0, 2)
              }
              return ops.filter((o) => o.text !== null && o.text !== undefined && o.text !== '')
            })(),
            respuesta_correcta: String(
              upperRow.RESPUESTA_CORRECTA ??
                upperRow.RESPUESTA_CORRECT ??
                upperRow.RESPUESTA ??
                upperRow.CORRECTA ??
                '',
            )
              .toUpperCase()
              .split(';')
              .map((r) => r.trim())
              .filter((r) => r),
          }
        })
        .filter((p) => p.enunciado)

      // --- VALIDACIÓN DE FORMATO ---
      const errors = []
      const invalidGroups = new Set()

      mapped.forEach((p) => {
        let isInvalid = false
        let reason = ''
        const isHeaderType = ['PROBLEMA', 'EMPAREJAMIENTO'].includes(p.tipo)

        if (isHeaderType) {
          if (p.dificultad !== '') {
            isInvalid = true
            reason = 'Tipos PR/EM no deben tener dificultad asignada'
          }
          if (p.respuesta_correcta.length > 0) {
            isInvalid = true
            reason = 'Tipos PR/EM no deben tener respuesta asignada'
          }
        } else {
          if (!['1', '2', '3'].includes(p.dificultad)) {
            isInvalid = true
            reason = 'Falta dificultad (1, 2 o 3) o es inválida'
          }
          if (p.respuesta_correcta.length === 0) {
            isInvalid = true
            reason = 'Falta respuesta correcta'
          }
          if (p.tipo === 'SELECCION_MULTIPLE' && p.respuesta_correcta.length < 2) {
            isInvalid = true
            reason = 'SM requiere al menos 2 respuestas correctas'
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
    const params = {
      sede_id: filtros.value.sede?.value || null,
      carrera_id: filtros.value.carrera?.value || null,
      fecha: filtros.value.fecha || null,
    }
    const response = await api.get('/generaciones-manuales', { params })
    manualGenerations.value = response.data
  } catch (error) {
    console.error('Error al cargar generaciones manuales:', error)
  } finally {
    loadingManual.value = false
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

  if (faciles.length < 7 || medios.length < 16 || dificiles.length < 7) {
    $q.notify({
      type: 'negative',
      message: `Preguntas insuficientes para 7/16/7. Disponibles -> Fácil: ${faciles.length}, Medio: ${medios.length}, Difícil: ${dificiles.length}`,
      timeout: 6000,
    })
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
      facil: 7,
      medio: 16,
      dificil: 7,
    }

    const variantesLetters = ['A', 'B', 'C', 'D', 'E'].slice(0, manualConfig.value.cantVariantes)
    const examenesPDF = new jsPDF({
      format: manualConfig.value.formatoHoja === 'Carta' ? 'letter' : [216, 330],
    })
    const patronesPDF = new jsPDF()
    const variantesAudit = []
    const xBlobs = [] // Para guardar los Excel y descargarlos solo si la auditoría es exitosa
    const resultadosVariantes = []

    for (let i = 0; i < variantesLetters.length; i++) {
      const letra = variantesLetters[i]
      const seleccion = obtenerSeleccion7167(manualPreguntas.value, config)
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

      const sorted = mezcladas.sort((a, b) => {
        if (a.grupo && b.grupo && a.grupo === b.grupo) return 0
        let ta = a._parentTipo || normalizeTipo(a.tipo)
        let tb = b._parentTipo || normalizeTipo(b.tipo)
        return localOrder.indexOf(ta) - localOrder.indexOf(tb)
      })

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

      await generarExamenPDF(examenesPDF, fakeExamen, config, letra, sorted)
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
    const params = {
      gestion: '2026-I',
      sede_id: filtros.value.sede.value,
      fecha: filtros.value.fecha,
      estado: filtros.value.estado.length > 0 ? filtros.value.estado.join(',') : undefined,
    }

    if (filtros.value.carrera) {
      params.carrera_id = filtros.value.carrera.value
    }

    const response = await api.get('/rol-examenes', { params })

    // Transformar datos del backend al formato del componente
    examenesList.value = response.data.data.map((e) => ({
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
    { name: 'banco', label: 'BANCO', align: 'center', sortable: true },
    { name: 'preguntas', label: 'PREGUNTAS', align: 'left' },
    { name: 'estado', label: 'ESTADO', align: 'center' },
  ]

  if (puedeEditar.value) {
    base.push({ name: 'documentos', label: 'DOCUMENTOS', align: 'center' })
    base.push({ name: 'acciones', label: 'ACCIONES', align: 'center' })
  }

  return base
})

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

const examenesFiltrados = computed(() => {
  let list = [...examenesList.value]

  if (filtros.value.estado && filtros.value.estado.length > 0) {
    list = list.filter((e) => filtros.value.estado.includes(e.estado))
  }

  if (filtros.value.parcial) list = list.filter((e) => e.parcial === filtros.value.parcial)

  return list.sort((a, b) => a.hora.localeCompare(b.hora))
})

// Función para imprimir PDF consolidada
function imprimirListaDiaria() {
  if (examenesFiltrados.value.length === 0) {
    $q.notify({
      message: 'No hay evaluaciones para imprimir en la fecha seleccionada',
      color: 'orange',
    })
    return
  }
  // ... (mismo código jsPDF pero usando examenesFiltrados del backend)
  const doc = new jsPDF({
    orientation: 'landscape',
    format: [216, 330], // Oficio 8.5x13 pulgadas
  })
  const fecha = filtros.value.fecha || 'Sin fecha'
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
  doc.text(`FECHA: ${fecha}`, 120, 30)
  doc.text(`PARCIAL: ${filtros.value.parcial || 'TODOS'}`, 210, 30)

  const tableData = examenesFiltrados.value.map((e) => [
    e.hora,
    `[${e.codigo}] ${e.materia}\n(G: ${e.grupo})`,
    e.docente,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ])
  autoTable(doc, {
    startY: 38,
    head: [
      [
        'HORA',
        'MATERIA / GRUPO',
        'DOCENTE',
        'H. RECOJO',
        'CANT.',
        'FIRMA',
        'H. DEV.',
        'CANT.',
        'FIRMA',
        'OBSERVACIONES',
      ],
    ],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [45, 23, 102], fontSize: 8, halign: 'center', valign: 'middle' },
    styles: { fontSize: 7, valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 13, halign: 'center' }, // HORA
      1: { cellWidth: 70 }, // MATERIA / GRUPO
      2: { cellWidth: 58 }, // DOCENTE
      3: { cellWidth: 16, halign: 'center' }, // H. RECOJO
      4: { cellWidth: 11, halign: 'center' }, // CANT.
      5: { cellWidth: 28 }, // FIRMA
      6: { cellWidth: 16, halign: 'center' }, // H. DEV.
      7: { cellWidth: 11, halign: 'center' }, // CANT.
      8: { cellWidth: 28 }, // FIRMA
      9: { cellWidth: 51 }, // OBSERVACIONES
    },
  })
  doc.save(`Seguimiento_Evaluaciones_${fecha}.pdf`)
}

const configGestion = computed(() => {
  const estado = dialogGestion.value.examen?.estado
  if (estado === 'programados')
    return {
      titulo: 'Parametrización de Generación',
      icon: 'settings_suggest',
      actionLabel: 'Generar Variantes Ahora',
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
  dialogGestion.value.examen = examen
  if (examen.estado === 'programados') {
    // Valores por defecto iniciales (fallback hard)
    tempConfig.value = {
      cantVariantes: examen.variantes.length || 1,
      facil: examen.distribucion.facil || 10,
      medio: examen.distribucion.medio || 10,
      dificil: examen.distribucion.dificil || 5,
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
        // Buscar el parcial correspondiente en la configuración
        const partialKey = examen.tipo_examen || examen.parcial
        const confParcial = data.configuracion.parciales.find((p) => {
          const pName = String(p.nombre || '').toLowerCase()
          const pKey = String(partialKey || '').toLowerCase()
          return (
            (pName.includes('1') && pKey.includes('1')) ||
            (pName.includes('2') && pKey.includes('2')) ||
            (pName.includes('final') && pKey.includes('final')) ||
            (pName.includes('instancia') && pKey.includes('instancia'))
          )
        })

        // Solo sobreescribir si el examen NO tiene configuración guardada (todos en 0)
        const tieneConfigGuardada =
          examen.distribucion &&
          (examen.distribucion.facil > 0 ||
            examen.distribucion.medio > 0 ||
            examen.distribucion.dificil > 0)

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
          grupo: examen.grupo,
        },
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

  const seleccionarDePool = (pool, meta) => {
    const headers = pool.filter((p) =>
      ['PR', 'EM', 'PROBLEMA', 'EMPAREJAMIENTO'].includes(p.tipo?.toUpperCase()),
    )
    const subpreguntas = todas.filter((p) =>
      ['SP', 'SUBPREGUNTA', 'SUBPROBLEMA'].includes(p.tipo?.toUpperCase()),
    )

    const macroGrupos = headers
      .map((h) => ({
        header: h,
        children: subpreguntas.filter((sp) => sp.grupo?.trim() === h.grupo?.trim() && h.grupo),
      }))
      .filter((mg) => mg.children.length > 0)

    const individuales = pool
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
            'PROBLEMA',
            'EMPAREJAMIENTO',
          ].includes(p.tipo?.toUpperCase()) &&
          !['SP', 'SUBPREGUNTA', 'SUBPROBLEMA'].includes(p.tipo?.toUpperCase()),
      )
      .filter((p) => !headers.some((h) => h.id === p.id))

    let seleccionFinal = []
    let contados = 0

    const macrosShuffled = shuffle([...macroGrupos])
    for (const mg of macrosShuffled) {
      if (contados + mg.children.length <= meta) {
        const header = JSON.parse(JSON.stringify(mg.header))
        seleccionFinal.push(header)
        const children = JSON.parse(JSON.stringify(shuffle([...mg.children])))
        // Inyectar herencia para que el sort las mantenga juntas
        children.forEach((c) => {
          c._parentTipo = normalizeTipo(header.tipo)
        })
        seleccionFinal.push(...children)
        contados += mg.children.length
      }
    }

    const faltantes = meta - contados
    if (faltantes > 0) {
      const extras = shuffle([...individuales]).slice(0, faltantes)
      seleccionFinal.push(...JSON.parse(JSON.stringify(extras)))
    }
    return seleccionFinal
  }

  return [
    ...seleccionarDePool(poolF, metaFacil),
    ...seleccionarDePool(poolM, metaMedio),
    ...seleccionarDePool(poolD, metaDificil),
  ]
}

const mezclarIncisos7167 = (preguntas) => {
  return preguntas.map((p) => {
    const tipoNormalizado = String(p.tipo ?? '').toUpperCase()
    if (
      ['FALSO_VERDADERO', 'FV'].includes(tipoNormalizado) ||
      !p.opciones ||
      p.opciones.length === 0
    ) {
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

  // Validación de disponibilidad en el banco (solo para generación de variantes)
  if (examen.estado === 'programados' && !bancoSuficiente.value) {
    $q.notify({
      type: 'negative',
      message: 'No hay suficientes preguntas en el banco para la distribución solicitada.',
      icon: 'warning',
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
              parcial: examen.parcial,
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
        const formatoPapel = tempConfig.value.formatoHoja === 'Carta' ? 'letter' : [216, 330]
        const mergedExamenesDoc = new jsPDF({ format: formatoPapel })
        const mergedPatronesDoc = new jsPDF()

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
        }

        const todas = Array.isArray(bancoPreguntas)
          ? bancoPreguntas
          : bancoPreguntas.preguntas || []
        const resultadosVariantes = []

        for (let i = 0; i < variantes.length; i++) {
          const letra = variantes[i]
          const seleccion = obtenerSeleccion7167(todas, payload.config_generacion)
          const mezcladas = mezclarIncisos7167(seleccion)

          const ordenBase = [
            'PROBLEMA',
            'EMPAREJAMIENTO',
            'SUBPROBLEMA',
            'SELECCION_UNICA',
            'SELECCION_MULTIPLE',
            'FALSO_VERDADERO',
          ]
          let finalOrder = [...ordenBase]

          if (payload.config_generacion.aleatorizarSecciones) {
            const principales = [
              'PROBLEMA',
              'EMPAREJAMIENTO',
              'SELECCION_UNICA',
              'SELECCION_MULTIPLE',
              'FALSO_VERDADERO',
            ]
            const shuffled = shuffle([...principales])
            finalOrder = []
            shuffled.forEach((t) => {
              finalOrder.push(t)
              if (t === 'PROBLEMA' || t === 'EMPAREJAMIENTO') finalOrder.push('SUBPROBLEMA')
            })
          }

          const sorted = mezcladas.sort((a, b) => {
            if (a.grupo && b.grupo && a.grupo === b.grupo) return 0

            let ta = a._parentTipo || normalizeTipo(a.tipo)
            let tb = b._parentTipo || normalizeTipo(b.tipo)

            return finalOrder.indexOf(ta) - finalOrder.indexOf(tb)
          })

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
          await generarExamenPDF(
            mergedExamenesDoc,
            examen,
            payload.config_generacion,
            letra,
            sorted,
          )
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
      $q.notify({ type: 'negative', message: 'Error al actualizar el estado' })
    }
  })
}

const avanzarDirecto = (examen) => {
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
  const doc = new jsPDF({ format: formatoPapel })
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
  const doc = new jsPDF()
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

const generarPatronPDF = async (pdfDoc, letra, preguntas = [], examenInput = null) => {
  const doc = pdfDoc || new jsPDF()
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
    (p) => !['PR', 'EM', 'PROBLEMA', 'EMPAREJAMIENTO'].includes(p.tipo?.toUpperCase()),
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
        if (ans === 'VERDADERO' || ans === 'V' || ans === 'TRUE') ans = 'A'
        else if (ans === 'FALSO' || ans === 'F' || ans === 'FALSE') ans = 'B'
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

const generarPatronXLSXConsolidado = (resultadosVariantes, customName) => {
  const headerRow = ['Variante', 'ID_Pregunta']
  for (let i = 1; i <= 100; i++) headerRow.push(`P${i}`)

  const dataRows = []

  for (const res of resultadosVariantes) {
    const preguntasReales = res.sorted.filter(
      (p) => !['PR', 'EM', 'PROBLEMA', 'EMPAREJAMIENTO'].includes(p.tipo?.toUpperCase()),
    )
    const dataRow = [res.letra, 'Respuesta']

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
          if (ans === 'VERDADERO' || ans === 'V' || ans === 'TRUE') ans = 'A'
          else if (ans === 'FALSO' || ans === 'F' || ans === 'FALSE') ans = 'B'
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
      orientation: 'p',
      unit: 'mm',
      format: paperFormat,
    })

  // CONFIGURACIÓN DE IMPRESIÓN PERSONALIZADA
  const baseFont = config.fontFamily || 'helvetica'
  const baseSize = config.fontSize || 11
  const spacingMult = config.lineSpacing || 1.1 // Ligeramente más compacto
  const lineHeight = baseSize * 0.42 * spacingMult // Factor corregido para escala mm
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
    return String(t || '')
      .replace(/<[^>]*>/g, '') // Eliminar HTML
      .replace(/&nbsp;/g, ' ') // Convertir espacios HTML a normales
      .replace(/&quot;/g, '"')
      .replace(/[\u00A0\u1680\u180e\u2000-\u200b\u202f\u205f\u3000\ufeff]/g, ' ') // Solo escapes, sin literales
      .replace(/\s+/g, ' ') // Colapsar múltiples espacios
      .trim()
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
          content: 'NOMBRE ESTUDIANTE:',
          styles: {
            fontStyle: 'bold',
            minCellHeight: 10,
            cellWidth: (pageWidth - margin * 2) * 0.65,
          },
        },
        {
          content: 'CÓDIGO:',
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
      'SELECCIÓN ÚNICA: Lea atentamente cada pregunta y elija la única respuesta que considere correcta entre las opciones presentadas.',
    SELECCION_MULTIPLE:
      'SELECCIÓN MÚLTIPLE: Analice el enunciado y marque todas las opciones que den una respuesta válida. Tenga en cuenta que puede haber más de una respuesta correcta.',
    FALSO_VERDADERO:
      'FALSO O VERDADERO: Para cada afirmación, indique si el contenido es Verdadero marcando la opción (A) o Falso marcando la opción (B).',
    PROBLEMA:
      'PROBLEMAS Y CASOS: Lea detenidamente el caso planteado y resuelva cada una de las preguntas que se presentan a continuación.',
    EMPAREJAMIENTO:
      'EMPAREJAMIENTO: Relacione cada término con su concepto o definición correcta, seleccionando la letra que corresponda en cada espacio.',
  }

  let ultimoTipo = null

  // RENDER PREGUNTAS
  for (let i = 0; i < preguntas.length; i++) {
    const p = preguntas[i]
    let tipoActual = normalizeTipo(p.tipo)
    // Encabezado de sección (Solo para tipos principales)
    const tiposPrincipales = [
      'SELECCION_UNICA',
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
        .filter((x) => ['PR', 'EM', 'PROBLEMA', 'EMPAREJAMIENTO'].includes(x.tipo?.toUpperCase()))
        .length

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
        normalizeTipo(preguntas[j].tipo) === 'SUBPROBLEMA' &&
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

    if (tipoActual === 'SUBPROBLEMA') estimatedHeight += 4
    estimatedHeight += esHeader ? 0.5 : 2
    if (p.imagen) estimatedHeight += 47 // Altura típica max de imagen + padding

    if (opciones.length > 0) {
      for (const opc of opciones) {
        let textToShow = cleanText(opc.text)
        if (['FALSO_VERDADERO', 'FV'].includes(tipoActualNoNormalizado)) {
          const lower = textToShow.toLowerCase()
          if (lower === 'true' || lower === '') {
            if (opc.id === 'A') textToShow = 'Verdadero'
            if (opc.id === 'B') textToShow = 'Falso'
          }
          if (lower === 'false' || lower === 'falsa') textToShow = 'Falso'
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
        .filter((x) =>
          ['PR', 'EM', 'PROBLEMA', 'EMPAREJAMIENTO'].includes(x.tipo?.toUpperCase()),
        ).length
      const realNum = i + 1 - headersAntes
      doc.text(`${realNum}. `, margin, currentY)
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

    currentY += esHeader ? 0.5 : 2 // Casi nada de espacio extra si es el header del caso

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

    if (opciones.length > 0) {
      doc.setFontSize(baseSize - 1)
      doc.setFont(baseFont, 'normal') // Asegurar fuente normal
      for (const opc of opciones) {
        let textToShow = cleanText(opc.text)
        if (['FALSO_VERDADERO', 'FV'].includes(tipoActualNoNormalizado)) {
          const lower = textToShow.toLowerCase()
          if (lower === 'true' || lower === '') {
            if (opc.id === 'A') textToShow = 'Verdadero'
            if (opc.id === 'B') textToShow = 'Falso'
          }
          if (lower === 'false' || lower === 'falsa') textToShow = 'Falso'
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
    currentY += esHeader ? 0 : 5 // Si es header, la siguiente pregunta viene pegada
  }

  const cleanSede = String(examen.sede || '').replace(/\s/g, '')
  const cleanParcial = String(examen.parcial || '').replace(/\s/g, '')
  const rawFilename = `${examen.codigo || 'EXAM'}_${cleanSede}_G${examen.grupo || ''}_${cleanParcial}_Var${letra}.pdf`
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
.gestion-eval-page {
  padding: 40px;
  background-color: #f8fafc;
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
.table-card {
  border-radius: 16px;
  background: white;
  border: 1px solid #edf2f7;
}
.main-table :deep(thead th) {
  font-weight: 700;
  color: #64748b;
  background: #f8fafc;
  padding: 16px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
</style>
