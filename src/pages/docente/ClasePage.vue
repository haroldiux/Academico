<template>
  <q-page class="clase-page">
    <div class="page-header q-mb-md row items-center justify-between">
      <div>
        <h1 class="page-title">
          <q-icon name="class" color="primary" class="q-mr-sm" />
          Control de Clase
        </h1>
        <p class="page-subtitle">Gestión de asistencia y seguimiento académico</p>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-btn flat round color="primary" icon="info" @click="mostrarGuia = true">
          <q-tooltip>Guía de uso y offline</q-tooltip>
        </q-btn>
        <div class="column items-center">
          <q-btn
            unelevated
            color="primary"
            icon="download"
            label="Descargar App"
            @click="descargarApk"
          >
            <q-tooltip>Descargar instalador APK para Android</q-tooltip>
          </q-btn>
          <div class="text-caption text-weight-bold text-indigo q-mt-xs">
            Seguimiento desde: 9/3/2026
          </div>
        </div>
      </div>
    </div>

    <q-card class="main-card">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab v-if="false" name="asistencia" label="Asistencia" icon="fact_check" />
        <q-tab name="seguimiento" label="Seguimiento" icon="analytics" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="asistencia" class="q-pa-none">
          <div class="q-pa-md">
            <!-- Selector de Materia y Grupo Hierárquico -->
            <div class="row q-col-gutter-md q-mb-lg items-center">
              <div class="col-12 col-md-5">
                <q-select
                  v-model="materiaSeleccionada"
                  :options="materiasDisponibles"
                  label="Seleccionar Materia"
                  outlined
                  dense
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  :loading="loading"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>
                          {{ scope.opt.label }}
                          <q-badge
                            v-if="scope.opt.esComunAgrupada"
                            color="indigo"
                            label="Común"
                            class="q-ml-xs"
                          />
                        </q-item-label>
                        <q-item-label v-if="scope.opt.esComunAgrupada" caption class="text-indigo">
                          {{ scope.opt.sublabel }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="scope">
                    <div v-if="scope.opt" class="selected-materia">
                      <div class="selected-materia-label">
                        {{ scope.opt.label }}
                        <q-badge
                          v-if="scope.opt.esComunAgrupada"
                          color="indigo"
                          label="Común"
                          class="q-ml-xs"
                        />
                      </div>
                      <div
                        v-if="scope.opt.sublabel"
                        class="selected-materia-sublabel text-caption text-grey-6"
                      >
                        {{ scope.opt.sublabel }}
                      </div>
                    </div>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-5">
                <q-select
                  v-model="grupoSeleccionado"
                  :options="gruposDisponibles"
                  label="Seleccionar Grupo"
                  outlined
                  dense
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  :disable="!materiaSeleccionada"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                        <q-item-label caption>{{ scope.opt.sublabel }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-2">
                <q-chip v-if="grupoSeleccionado" color="primary" text-color="white" icon="schedule">
                  {{ claseSeleccionadaObj?.horario }}
                </q-chip>
              </div>
            </div>

            <div v-if="grupoSeleccionado" class="listas-container">
              <!-- Iterar sobre lo que diga estudiantesVista (pueden ser carreras separadas o una lista unificada) -->
              <div v-for="grupoVista in estudiantesVista" :key="grupoVista.id" class="q-mb-xl">
                <div class="q-mb-sm">
                  <div class="flex items-center text-primary">
                    <q-icon
                      :name="claseSeleccionadaObj.esFusionada ? 'group' : 'school'"
                      class="q-mr-sm"
                    />
                    <span class="text-h6">{{ grupoVista.nombreCarrera }}</span>
                    <q-badge
                      v-if="claseSeleccionadaObj.esFusionada"
                      color="indigo"
                      label="Fusionada"
                      class="q-ml-sm"
                    />
                  </div>
                  <div class="flex items-center text-grey-7 q-mt-xs">
                    <span class="text-caption">{{ grupoVista.materia }}</span>
                    <span v-if="grupoVista.codigos" class="text-caption text-grey-5 q-ml-sm"
                      >• {{ grupoVista.codigos }}</span
                    >
                  </div>
                </div>

                <q-table
                  :rows="grupoVista.estudiantes"
                  :columns="columnsAsistencia"
                  row-key="id"
                  flat
                  bordered
                  hide-pagination
                  :rows-per-page-options="[0]"
                >
                  <template v-slot:header="props">
                    <q-tr :props="props">
                      <q-th v-for="col in props.cols" :key="col.name" :props="props">
                        {{ col.label }}
                      </q-th>
                    </q-tr>
                  </template>
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td key="nombre" :props="props">
                        {{ props.row.nombre }} {{ props.row.apellido }}
                        <div v-if="claseSeleccionadaObj.esFusionada" class="text-caption text-grey">
                          {{ props.row.carreraOrigen }}
                        </div>
                      </q-td>
                      <q-td key="estado" :props="props" auto-width>
                        <div class="q-gutter-xs">
                          <q-btn
                            round
                            size="sm"
                            :color="props.row.estado === 'P' ? 'green' : 'grey-3'"
                            :text-color="props.row.estado === 'P' ? 'white' : 'grey-8'"
                            icon="check"
                            @click="props.row.estado = 'P'"
                            unelevated
                          />
                          <q-btn
                            round
                            size="sm"
                            :color="props.row.estado === 'F' ? 'red' : 'grey-3'"
                            :text-color="props.row.estado === 'F' ? 'white' : 'grey-8'"
                            icon="close"
                            @click="props.row.estado = 'F'"
                            unelevated
                          />
                          <q-btn
                            round
                            size="sm"
                            :color="props.row.estado === 'L' ? 'orange' : 'grey-3'"
                            :text-color="props.row.estado === 'L' ? 'white' : 'grey-8'"
                            icon="schedule"
                            @click="props.row.estado = 'L'"
                            unelevated
                          />
                        </div>
                      </q-td>
                      <q-td key="observacion" :props="props">
                        <q-input
                          v-model="props.row.observacion"
                          dense
                          borderless
                          placeholder="---"
                        />
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </div>

              <div class="flex justify-end q-mt-md">
                <q-btn
                  color="primary"
                  icon="save"
                  label="Guardar Asistencia"
                  @click="guardarAsistencia"
                />
              </div>
            </div>

            <div v-else class="text-center q-pa-xl text-grey-6">
              <q-icon name="touch_app" size="64px" />
              <div class="text-h6">Selecciona una clase para comenzar</div>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="seguimiento">
          <div class="q-pa-md">
            <div class="row q-col-gutter-md q-mb-lg">
              <div class="col-12 col-md-5">
                <q-select
                  v-model="materiaSeleccionada"
                  :options="materiasDisponibles"
                  label="Materia"
                  outlined
                  dense
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>
                          {{ scope.opt.label }}
                          <q-badge
                            v-if="scope.opt.esComunAgrupada"
                            color="indigo"
                            label="Común"
                            class="q-ml-xs"
                          />
                        </q-item-label>
                        <q-item-label v-if="scope.opt.esComunAgrupada" caption class="text-indigo">
                          {{ scope.opt.sublabel }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="scope">
                    <div v-if="scope.opt" class="selected-materia">
                      <div class="selected-materia-label">
                        {{ scope.opt.label }}
                        <q-badge
                          v-if="scope.opt.esComunAgrupada"
                          color="indigo"
                          label="Común"
                          class="q-ml-xs"
                        />
                      </div>
                      <div
                        v-if="scope.opt.sublabel"
                        class="selected-materia-sublabel text-caption text-grey-6"
                      >
                        {{ scope.opt.sublabel }}
                      </div>
                    </div>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-5">
                <q-select
                  v-model="grupoSeleccionado"
                  :options="gruposDisponibles"
                  label="Grupo"
                  outlined
                  dense
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  :disable="!materiaSeleccionada"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                        <q-item-label caption>{{ scope.opt.sublabel }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-2">
                <q-btn-toggle
                  v-model="vistaHistorial"
                  toggle-color="primary"
                  :options="[
                    { label: 'Pendientes', value: false },
                    { label: 'Completadas', value: true },
                  ]"
                  dense
                  unelevated
                  class="full-width"
                />
              </div>

              <!-- Cache status indicator -->
              <div class="col-12 q-mb-xs">
                <q-chip
                  v-if="!isOnline"
                  icon="cloud_off"
                  color="orange-2"
                  text-color="orange-9"
                  size="sm"
                  dense
                >
                  Modo offline
                  <span v-if="cacheStatus.materias"> — materias en caché</span>
                  <span v-else> — sin caché de materias</span>
                </q-chip>

                <q-chip
                  v-else-if="cacheStatus.sesiones"
                  icon="verified"
                  color="green-1"
                  text-color="green-9"
                  size="sm"
                  dense
                >
                  Datos guardados para uso offline
                </q-chip>

                <q-chip
                  v-else-if="materiaSeleccionada && grupoSeleccionado && !loadingSesiones"
                  icon="cloud_off"
                  color="grey-2"
                  text-color="grey-7"
                  size="sm"
                  dense
                >
                  Sin caché offline para este grupo
                </q-chip>
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="fechaSeguimiento"
                  :options="sesionesOptions"
                  :label="
                    vistaHistorial
                      ? 'Seleccionar Sesión Completada'
                      : 'Seleccionar Sesión Pendiente'
                  "
                  outlined
                  dense
                  emit-value
                  map-options
                  :disable="!grupoSeleccionado || loadingSesiones"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        {{ msgNoSessions }}
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <!-- Semáforo de Puntualidad -->
              <div
                v-if="sesionActual && sesionActual.cumplido"
                class="col-auto flex items-center q-ml-sm"
              >
                <q-icon
                  :name="getSemaforoStatus(sesionActual).icon"
                  :color="getSemaforoStatus(sesionActual).color"
                  size="22px"
                >
                  <q-tooltip>{{ getSemaforoStatus(sesionActual).tooltip }}</q-tooltip>
                </q-icon>
              </div>
              <div class="col-12 col-md-3 flex items-center">
                <q-toggle
                  v-model="esExamen"
                  label="Sesión Práctica (con planificación diferente) / Examen"
                  color="red"
                  icon="assignment_late"
                  :disable="esLecturaSola"
                />
              </div>
            </div>

            <!-- Selector de Tipo de Examen -->
            <q-slide-transition>
              <div v-if="esExamen" class="q-mb-md">
                <q-card flat bordered class="bg-red-0 q-pa-sm border-red">
                  <div class="row q-col-gutter-sm items-center">
                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="tipoExamen"
                        :options="tiposExamenOptions"
                        label="Tipo de Examen/Evaluación"
                        outlined
                        dense
                        emit-value
                        map-options
                        placeholder="Seleccionar tipo..."
                        :disable="esLecturaSola"
                        color="red"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="text-caption text-red-9 flex items-center">
                        <q-icon name="info" size="xs" class="q-mr-xs" />
                        En modo sesión especial / examen se simplifica la planificación del día.
                      </div>
                    </div>
                  </div>
                </q-card>
              </div>
            </q-slide-transition>

            <div v-if="sesionActual" class="seguimiento-content">
              <div v-if="loadingSesiones" class="flex justify-center q-pa-xl">
                <q-spinner-dots color="primary" size="40px" />
              </div>
              <template v-else>
                <!-- Planificación del Día -->
                <div class="planificacion-container">
                  <div class="section-header">
                    <q-icon name="event_note" size="24px" color="primary" class="q-mr-sm" />
                    <span class="text-h6 text-weight-bold">Planificación del Día</span>
                    <q-chip
                      v-if="sesionActual.seguimiento_created_at"
                      outline
                      color="blue-7"
                      icon="history"
                      size="sm"
                      class="q-ml-auto"
                    >
                      Registro: {{ formatDateTime(sesionActual.seguimiento_created_at) }}
                    </q-chip>
                  </div>

                  <!-- Planificación del Día (Oculta en Modo Examen) -->
                  <div v-if="!esExamen">
                    <!-- Tema Principal (Solo título) -->
                    <div class="q-mb-md">
                      <div class="text-subtitle1 text-weight-bold text-primary">
                        {{ msgTemaPlanificado }}
                      </div>
                    </div>

                    <!-- Contenidos Planificados -->
                    <div class="row q-col-gutter-md q-mb-md">
                      <!-- (Sección Contenido eliminada por redundancia) -->

                      <div class="col-12 col-md-4">
                        <q-card flat bordered class="content-card">
                          <q-card-section class="q-pa-sm">
                            <div class="content-label">
                              <q-icon name="psychology" size="16px" class="q-mr-xs" />
                              Conceptual
                            </div>
                            <div class="content-text" style="white-space: pre-line">
                              {{ formatContent(conceptualPlanificado) }}
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>

                      <div class="col-12 col-md-4">
                        <q-card flat bordered class="content-card">
                          <q-card-section class="q-pa-sm">
                            <div class="content-label">
                              <q-icon name="build" size="16px" class="q-mr-xs" />
                              Procedimental
                            </div>
                            <div class="content-text" style="white-space: pre-line">
                              {{ formatContent(procedimentalPlanificado) }}
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>

                      <div class="col-12 col-md-4">
                        <q-card flat bordered class="content-card">
                          <q-card-section class="q-pa-sm">
                            <div class="content-label">
                              <q-icon name="favorite" size="16px" class="q-mr-xs" />
                              Actitudinal
                            </div>
                            <div class="content-text" style="white-space: pre-line">
                              {{ formatContent(actitudinalPlanificado) }}
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>

                      <div class="col-12 col-md-6">
                        <q-card flat bordered class="content-card">
                          <q-card-section class="q-pa-sm">
                            <div class="content-label">
                              <q-icon name="checklist" size="16px" class="q-mr-xs" />
                              Criterios de Desempeño
                            </div>
                            <div class="content-text">{{ criteriosPlanificado || '---' }}</div>
                          </q-card-section>
                        </q-card>
                      </div>

                      <div class="col-12 col-md-6">
                        <q-card flat bordered class="content-card">
                          <q-card-section class="q-pa-sm">
                            <div class="content-label">
                              <q-icon name="assessment" size="16px" class="q-mr-xs" />
                              Instrumentos de Evaluación
                            </div>
                            <div class="content-text">{{ instrumentosPlanificado || '---' }}</div>
                          </q-card-section>
                        </q-card>
                      </div>

                      <!-- Contenido Items Seleccionados -->
                      <div v-if="contenidoItemsSeleccionados.length > 0" class="col-12">
                        <q-card flat bordered class="content-card">
                          <q-card-section class="q-pa-sm">
                            <div class="content-label">
                              <q-icon name="checklist_rtl" size="16px" class="q-mr-xs" />
                              Contenido Items Seleccionados
                            </div>
                            <div class="q-mt-xs">
                              <div
                                v-for="(item, idx) in contenidoItemsSeleccionados"
                                :key="idx"
                                class="q-mb-xs flex items-center"
                              >
                                <q-icon
                                  name="check_circle"
                                  color="primary"
                                  size="xs"
                                  class="q-mr-sm"
                                />
                                <span class="text-body2">{{ resolveContentItem(item) }}</span>
                              </div>
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>

                    <!-- Observaciones -->
                    <q-card flat bordered>
                      <q-card-section>
                        <q-input
                          v-model="observacionesClase"
                          label="Observaciones Generales"
                          type="textarea"
                          outlined
                          rows="3"
                          :readonly="esLecturaSola"
                        />
                      </q-card-section>
                    </q-card>

                    <!-- Estado de Cumplimiento Botones -->
                    <div v-if="!esExamen" class="q-mt-lg">
                      <div class="text-subtitle2 q-mb-sm text-grey-8">
                        Estado de Cumplimiento del Tema
                      </div>
                      <div class="row q-gutter-sm">
                        <q-btn
                          :color="estadoCumplimiento === 'TOTAL' ? 'positive' : 'grey-3'"
                          :text-color="estadoCumplimiento === 'TOTAL' ? 'white' : 'grey-8'"
                          label="TOTALMENTE CUMPLIDO"
                          icon="check_circle"
                          @click="estadoCumplimiento = 'TOTAL'"
                          unelevated
                          :disable="esLecturaSola"
                        />
                        <q-btn
                          :color="estadoCumplimiento === 'PARCIAL' ? 'warning' : 'grey-3'"
                          :text-color="estadoCumplimiento === 'PARCIAL' ? 'white' : 'grey-8'"
                          label="PARCIALMENTE CUMPLIDO"
                          icon="timelapse"
                          @click="estadoCumplimiento = 'PARCIAL'"
                          unelevated
                          :disable="esLecturaSola"
                        />
                        <q-btn
                          :color="estadoCumplimiento === 'NO' ? 'negative' : 'grey-3'"
                          :text-color="estadoCumplimiento === 'NO' ? 'white' : 'grey-8'"
                          label="NO CUMPLIDO"
                          icon="cancel"
                          @click="estadoCumplimiento = 'NO'"
                          unelevated
                          :disable="esLecturaSola"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Modo Examen Placeholder -->
                  <div v-else class="q-mb-md">
                    <q-banner dense rounded class="bg-red-1 text-red-9 border-red q-pa-md">
                      <template v-slot:avatar>
                        <q-icon name="assignment" color="red" />
                      </template>
                      <div class="text-weight-bold">Sesión Práctica Especial / Examen</div>
                      <div>
                        Esta sesión está marcada como práctica especial o examen. Los campos de
                        avance temático están ocultos para facilitar el registro de evidencias.
                      </div>
                    </q-banner>
                  </div>
                </div>

                <div v-if="!esExamen" class="q-mt-lg">
                  <div class="text-subtitle1 text-weight-bold q-mb-sm">Detalles Pedagógicos</div>
                  <div class="row q-col-gutter-md">
                    <!-- Estrategias -->
                    <div class="col-12 col-md-4">
                      <q-card flat bordered class="q-pa-sm full-height">
                        <div class="text-weight-bold bg-grey-2 q-pa-xs q-mb-sm text-center">
                          Estrategias
                        </div>
                        <div
                          v-for="(item, idx) in pedagogico.estrategias"
                          :key="'est-' + idx"
                          class="q-mb-xs"
                        >
                          <div
                            v-if="item.isHeader"
                            class="text-weight-bold text-caption q-mt-sm q-mb-xs text-primary"
                          >
                            {{ item.nombre }}
                          </div>
                          <q-checkbox
                            v-else
                            v-model="item.cumplido"
                            :label="item.nombre"
                            dense
                            color="green"
                            :disable="esLecturaSola"
                          />
                        </div>
                      </q-card>
                    </div>

                    <!-- Evaluación -->
                    <div class="col-12 col-md-4">
                      <q-card flat bordered class="q-pa-sm full-height">
                        <div class="text-weight-bold bg-grey-2 q-pa-xs q-mb-sm text-center">
                          Evaluación
                        </div>
                        <div
                          v-for="(item, idx) in pedagogico.evaluacion"
                          :key="'eva-' + idx"
                          class="q-mb-xs"
                        >
                          <div
                            v-if="item.isHeader"
                            class="text-weight-bold text-caption q-mt-sm q-mb-xs text-primary"
                          >
                            {{ item.nombre }}
                          </div>
                          <q-checkbox
                            v-else
                            v-model="item.cumplido"
                            :label="item.nombre"
                            dense
                            color="green"
                            :disable="esLecturaSola"
                          />
                        </div>
                      </q-card>
                    </div>

                    <!-- Secuencia -->
                    <div class="col-12 col-md-4">
                      <q-card flat bordered class="q-pa-sm full-height">
                        <div class="text-weight-bold bg-grey-2 q-pa-xs q-mb-sm text-center">
                          Secuencia
                        </div>
                        <div
                          v-for="(item, idx) in pedagogico.secuencia"
                          :key="'sec-' + idx"
                          class="q-mb-xs"
                        >
                          <div
                            v-if="item.isHeader"
                            class="text-weight-bold text-caption q-mt-sm q-mb-xs text-primary"
                          >
                            {{ item.nombre }}
                          </div>
                          <q-checkbox
                            v-else
                            v-model="item.cumplido"
                            :label="item.nombre"
                            dense
                            color="green"
                            :disable="esLecturaSola"
                          />
                        </div>
                      </q-card>
                    </div>
                  </div>
                </div>

                <!-- Sección de Integración Transversal -->
                <div v-if="!esExamen" class="q-mt-lg">
                  <div class="text-subtitle1 text-weight-bold q-mb-sm">Integración Transversal</div>
                  <q-card flat bordered class="q-pa-md">
                    <div class="row q-col-gutter-md">
                      <!-- Investigación -->
                      <div class="col-12 col-md-4">
                        <q-checkbox
                          v-model="integracionTransversal.investigacion.cumplido"
                          label="Investigación"
                          color="primary"
                          class="text-weight-medium"
                          :disable="esLecturaSola"
                        />
                        <q-slide-transition>
                          <div
                            v-show="integracionTransversal.investigacion.cumplido"
                            class="q-mt-sm"
                          >
                            <!-- Show saved file if exists (string path) -->
                            <div
                              v-if="
                                typeof integracionTransversal.investigacion.evidencia === 'string'
                              "
                              class="q-pa-sm bg-blue-1 rounded-borders"
                            >
                              <div class="text-caption text-grey-7">Evidencia guardada:</div>
                              <a
                                :href="
                                  getStorageUrl(integracionTransversal.investigacion.evidencia)
                                "
                                target="_blank"
                                class="text-primary"
                              >
                                <q-icon name="download" size="xs" /> Ver archivo
                              </a>
                              <!-- Image Preview -->
                              <div
                                v-if="isImage(integracionTransversal.investigacion.evidencia)"
                                class="q-mt-xs"
                              >
                                <q-img
                                  :src="
                                    getStorageUrl(integracionTransversal.investigacion.evidencia)
                                  "
                                  style="
                                    max-width: 200px;
                                    border-radius: 4px;
                                    border: 1px solid #ddd;
                                  "
                                  spinner-color="primary"
                                >
                                  <q-tooltip>Vista previa de evidencia</q-tooltip>
                                </q-img>
                              </div>
                            </div>
                            <!-- File upload input (only if not completed) -->
                            <!-- File upload with camera button -->
                            <div class="row items-center q-col-gutter-xs">
                              <div class="col">
                                <q-file
                                  v-model="integracionTransversal.investigacion.evidencia"
                                  label="Subir evidencia Max 2mb"
                                  outlined
                                  dense
                                  accept="image/*,video/*,.pdf,.doc,.docx"
                                  :disable="esLecturaSola"
                                  max-file-size="2097152"
                                  @rejected="archivoRechazado"
                                  @update:model-value="
                                    comprimirImagenSiNecesario(
                                      integracionTransversal.investigacion,
                                      $event,
                                    )
                                  "
                                >
                                  <template v-slot:prepend
                                    ><q-icon name="science" color="primary"
                                  /></template>
                                  <template
                                    v-slot:append
                                    v-if="
                                      isFileObject(integracionTransversal.investigacion.evidencia)
                                    "
                                  >
                                    <span
                                      :class="
                                        getFileSize(
                                          integracionTransversal.investigacion.evidencia,
                                        ) > 2097152
                                          ? 'text-negative'
                                          : 'text-positive'
                                      "
                                      class="text-caption"
                                    >
                                      {{
                                        formatFileSize(
                                          getFileSize(
                                            integracionTransversal.investigacion.evidencia,
                                          ),
                                        )
                                      }}
                                    </span>
                                  </template>
                                </q-file>
                              </div>
                              <div class="col-auto">
                                <q-btn
                                  round
                                  dense
                                  color="primary"
                                  icon="photo_camera"
                                  @click="tomarFotoIntegracion('investigacion')"
                                  :disable="esLecturaSola"
                                >
                                  <q-tooltip>Tomar Foto</q-tooltip>
                                </q-btn>
                              </div>
                            </div>
                          </div>
                        </q-slide-transition>
                      </div>

                      <!-- Interacción Social -->
                      <div class="col-12 col-md-4">
                        <q-checkbox
                          v-model="integracionTransversal.interaccion.cumplido"
                          label="Interacción Social"
                          color="primary"
                          class="text-weight-medium"
                          :disable="esLecturaSola"
                        />
                        <q-slide-transition>
                          <div v-show="integracionTransversal.interaccion.cumplido" class="q-mt-sm">
                            <!-- Show saved file if exists -->
                            <div
                              v-if="
                                typeof integracionTransversal.interaccion.evidencia === 'string'
                              "
                              class="q-pa-sm bg-blue-1 rounded-borders"
                            >
                              <div class="text-caption text-grey-7">Evidencia guardada:</div>
                              <a
                                :href="getStorageUrl(integracionTransversal.interaccion.evidencia)"
                                target="_blank"
                                class="text-primary"
                              >
                                <q-icon name="download" size="xs" /> Ver archivo
                              </a>
                              <!-- Image Preview -->
                              <div
                                v-if="isImage(integracionTransversal.interaccion.evidencia)"
                                class="q-mt-xs"
                              >
                                <q-img
                                  :src="getStorageUrl(integracionTransversal.interaccion.evidencia)"
                                  style="
                                    max-width: 200px;
                                    border-radius: 4px;
                                    border: 1px solid #ddd;
                                  "
                                  spinner-color="primary"
                                >
                                  <q-tooltip>Vista previa de evidencia</q-tooltip>
                                </q-img>
                              </div>
                            </div>
                            <!-- File upload with camera button -->
                            <div class="row items-center q-col-gutter-xs">
                              <div class="col">
                                <q-file
                                  v-model="integracionTransversal.interaccion.evidencia"
                                  label="Subir evidencia Max 2mb"
                                  outlined
                                  dense
                                  accept="image/*,video/*,.pdf,.doc,.docx"
                                  :disable="esLecturaSola"
                                  max-file-size="2097152"
                                  @rejected="archivoRechazado"
                                  @update:model-value="
                                    comprimirImagenSiNecesario(
                                      integracionTransversal.interaccion,
                                      $event,
                                    )
                                  "
                                >
                                  <template v-slot:prepend
                                    ><q-icon name="groups" color="primary"
                                  /></template>
                                  <template
                                    v-slot:append
                                    v-if="
                                      isFileObject(integracionTransversal.interaccion.evidencia)
                                    "
                                  >
                                    <span
                                      :class="
                                        getFileSize(integracionTransversal.interaccion.evidencia) >
                                        2097152
                                          ? 'text-negative'
                                          : 'text-positive'
                                      "
                                      class="text-caption"
                                    >
                                      {{
                                        formatFileSize(
                                          getFileSize(integracionTransversal.interaccion.evidencia),
                                        )
                                      }}
                                    </span>
                                  </template>
                                </q-file>
                              </div>
                              <div class="col-auto">
                                <q-btn
                                  round
                                  dense
                                  color="primary"
                                  icon="photo_camera"
                                  @click="tomarFotoIntegracion('interaccion')"
                                  :disable="esLecturaSola"
                                >
                                  <q-tooltip>Tomar Foto</q-tooltip>
                                </q-btn>
                              </div>
                            </div>
                          </div>
                        </q-slide-transition>
                      </div>

                      <!-- Internalización -->
                      <div class="col-12 col-md-4">
                        <q-checkbox
                          v-model="integracionTransversal.internalizacion.cumplido"
                          label="Internalización"
                          color="primary"
                          class="text-weight-medium"
                          :disable="esLecturaSola"
                        />
                        <q-slide-transition>
                          <div
                            v-show="integracionTransversal.internalizacion.cumplido"
                            class="q-mt-sm"
                          >
                            <!-- Show saved file if exists -->
                            <div
                              v-if="
                                typeof integracionTransversal.internalizacion.evidencia === 'string'
                              "
                              class="q-pa-sm bg-blue-1 rounded-borders"
                            >
                              <div class="text-caption text-grey-7">Evidencia guardada:</div>
                              <a
                                :href="
                                  getStorageUrl(integracionTransversal.internalizacion.evidencia)
                                "
                                target="_blank"
                                class="text-primary"
                              >
                                <q-icon name="download" size="xs" /> Ver archivo
                              </a>
                              <!-- Image Preview -->
                              <div
                                v-if="isImage(integracionTransversal.internalizacion.evidencia)"
                                class="q-mt-xs"
                              >
                                <q-img
                                  :src="
                                    getStorageUrl(integracionTransversal.internalizacion.evidencia)
                                  "
                                  style="
                                    max-width: 200px;
                                    border-radius: 4px;
                                    border: 1px solid #ddd;
                                  "
                                  spinner-color="primary"
                                >
                                  <q-tooltip>Vista previa de evidencia</q-tooltip>
                                </q-img>
                              </div>
                            </div>
                            <!-- File upload with camera button -->
                            <div class="row items-center q-col-gutter-xs">
                              <div class="col">
                                <q-file
                                  v-model="integracionTransversal.internalizacion.evidencia"
                                  label="Subir evidencia Max 2mb"
                                  outlined
                                  dense
                                  accept="image/*,video/*,.pdf,.doc,.docx"
                                  :disable="esLecturaSola"
                                  max-file-size="2097152"
                                  @rejected="archivoRechazado"
                                  @update:model-value="
                                    comprimirImagenSiNecesario(
                                      integracionTransversal.internalizacion,
                                      $event,
                                    )
                                  "
                                >
                                  <template v-slot:prepend
                                    ><q-icon name="psychology" color="primary"
                                  /></template>
                                  <template
                                    v-slot:append
                                    v-if="
                                      isFileObject(integracionTransversal.internalizacion.evidencia)
                                    "
                                  >
                                    <span
                                      :class="
                                        getFileSize(
                                          integracionTransversal.internalizacion.evidencia,
                                        ) > 2097152
                                          ? 'text-negative'
                                          : 'text-positive'
                                      "
                                      class="text-caption"
                                    >
                                      {{
                                        formatFileSize(
                                          getFileSize(
                                            integracionTransversal.internalizacion.evidencia,
                                          ),
                                        )
                                      }}
                                    </span>
                                  </template>
                                </q-file>
                              </div>
                              <div class="col-auto">
                                <q-btn
                                  round
                                  dense
                                  color="primary"
                                  icon="photo_camera"
                                  @click="tomarFotoIntegracion('internalizacion')"
                                  :disable="esLecturaSola"
                                >
                                  <q-tooltip>Tomar Foto</q-tooltip>
                                </q-btn>
                              </div>
                            </div>
                          </div>
                        </q-slide-transition>
                      </div>
                    </div>
                  </q-card>
                </div>

                <!-- Sección de Evidencias -->
                <div class="q-mt-lg">
                  <div class="text-subtitle1 text-weight-bold q-mb-sm">
                    <q-icon name="folder_open" class="q-mr-xs" />
                    Evidencias de la Clase
                  </div>
                  <q-card flat bordered class="q-pa-md">
                    <div class="col-12">
                      <div class="row q-col-gutter-md">
                        <!-- Aprendizaje Activo -->
                        <div class="col-12 col-md-4">
                          <div class="text-caption text-weight-bold text-indigo q-mb-xs">
                            Foto Max 2mb
                          </div>
                          <!-- Show saved file if exists -->
                          <div
                            v-if="typeof evidencias.aprendizaje_activo === 'string'"
                            class="q-pa-sm bg-blue-1 rounded-borders"
                          >
                            <div class="text-caption text-grey-7">Evidencia guardada:</div>
                            <a
                              :href="getStorageUrl(evidencias.aprendizaje_activo)"
                              target="_blank"
                              class="text-primary"
                            >
                              <q-icon name="download" size="xs" /> Ver archivo
                            </a>
                            <!-- Image Preview -->
                            <div v-if="isImage(evidencias.aprendizaje_activo)" class="q-mt-sm">
                              <q-img
                                :src="getStorageUrl(evidencias.aprendizaje_activo)"
                                style="
                                  max-width: 100%;
                                  height: 150px;
                                  border-radius: 8px;
                                  border: 1px solid #e0e0e0;
                                "
                                fit="contain"
                                class="bg-grey-1"
                                spinner-color="primary"
                              />
                            </div>
                          </div>
                          <!-- File upload -->
                          <div v-else class="row items-center q-col-gutter-sm">
                            <div class="col">
                              <q-file
                                v-model="evidencias.aprendizaje_activo"
                                label="Subir Foto Max 2mb"
                                outlined
                                dense
                                accept="image/*,video/*"
                                :disable="esLecturaSola"
                                max-file-size="2097152"
                                @rejected="archivoRechazado"
                              >
                                <template v-slot:prepend
                                  ><q-icon name="stars" color="indigo"
                                /></template>
                              </q-file>
                            </div>
                            <div class="col-auto">
                              <q-btn
                                round
                                color="primary"
                                icon="photo_camera"
                                @click="tomarFoto('aprendizaje_activo')"
                                :disable="esLecturaSola"
                              >
                                <q-tooltip>Tomar Foto</q-tooltip>
                              </q-btn>
                            </div>
                          </div>
                        </div>
                        <!-- Evaluación Formativa -->
                        <div class="col-12 col-md-4">
                          <div class="text-caption text-weight-bold text-indigo q-mb-xs">
                            Link o enlace
                          </div>
                          <q-input
                            v-model="evidencias.evaluacion_formativa"
                            placeholder="Link o enlace"
                            outlined
                            dense
                            :readonly="esLecturaSola"
                          >
                            <template v-slot:prepend
                              ><q-icon name="assignment_turned_in" color="indigo"
                            /></template>
                            <template
                              v-slot:append
                              v-if="
                                evidencias.evaluacion_formativa?.includes('http') ||
                                evidencias.evaluacion_formativa?.includes('.')
                              "
                            >
                              <q-btn
                                flat
                                round
                                icon="open_in_new"
                                color="primary"
                                @click="openUrl(evidencias.evaluacion_formativa)"
                              />
                            </template>
                          </q-input>
                        </div>
                        <!-- Secuencia Didáctica (Diapositivas) -->
                        <div class="col-12 col-md-4">
                          <div class="text-caption text-weight-bold text-indigo q-mb-xs">
                            Archivo Max 2mb
                          </div>
                          <!-- Show saved file if exists -->
                          <div
                            v-if="typeof evidencias.secuencia_didactica === 'string'"
                            class="q-pa-sm bg-blue-1 rounded-borders"
                          >
                            <div class="text-caption text-grey-7">Evidencia guardada:</div>
                            <a
                              :href="getStorageUrl(evidencias.secuencia_didactica)"
                              target="_blank"
                              class="text-primary"
                            >
                              <q-icon name="download" size="xs" /> Ver archivo
                            </a>
                            <!-- Image Preview -->
                            <div v-if="isImage(evidencias.secuencia_didactica)" class="q-mt-sm">
                              <q-img
                                :src="getStorageUrl(evidencias.secuencia_didactica)"
                                style="
                                  max-width: 100%;
                                  height: 150px;
                                  border-radius: 8px;
                                  border: 1px solid #e0e0e0;
                                "
                                fit="contain"
                                class="bg-grey-1"
                                spinner-color="primary"
                              />
                            </div>
                          </div>
                          <!-- File upload -->
                          <q-file
                            v-else
                            v-model="evidencias.secuencia_didactica"
                            label="Subir Archivo Max 2mb"
                            outlined
                            dense
                            accept=".ppt,.pptx,.pdf,.doc,.docx"
                            :disable="esLecturaSola"
                            max-file-size="2097152"
                            @rejected="archivoRechazado"
                          >
                            <template v-slot:prepend
                              ><q-icon name="presentation_chart_bar" color="indigo"
                            /></template>
                          </q-file>
                        </div>
                      </div>
                    </div>
                  </q-card>
                </div>

                <!-- Georeferencia Status -->
                <div class="q-mt-md">
                  <q-card
                    flat
                    bordered
                    :class="
                      !habilitarGps
                        ? 'bg-grey-1 border-grey'
                        : coordenadas
                          ? 'bg-green-0 border-green'
                          : 'bg-orange-0 border-orange'
                    "
                  >
                    <q-card-section class="q-pa-sm flex items-center justify-between">
                      <div class="flex items-center">
                        <q-icon
                          :name="
                            !habilitarGps
                              ? 'location_off'
                              : coordenadas
                                ? 'location_on'
                                : 'location_searching'
                          "
                          :color="!habilitarGps ? 'grey-6' : coordenadas ? 'positive' : 'warning'"
                          size="sm"
                          class="q-mr-sm"
                        />
                        <div>
                          <div
                            class="text-subtitle2"
                            :class="
                              !habilitarGps
                                ? 'text-grey-8'
                                : coordenadas
                                  ? 'text-green-9'
                                  : 'text-orange-9'
                            "
                          >
                            Georeferencia: {{ msgGeoreferencia }}
                          </div>
                          <div v-if="habilitarGps && coordenadas" class="text-caption text-grey-8">
                            Lat: {{ coordenadas.lat.toFixed(6) }}, Lng:
                            {{ coordenadas.lng.toFixed(6) }}
                            <span class="q-ml-sm">±{{ coordenadas.accuracy.toFixed(1) }}m</span>
                          </div>
                          <div
                            v-else-if="habilitarGps && !coordenadas"
                            class="text-caption text-grey-8 italic"
                          >
                            Se capturará automáticamente al guardar el seguimiento.
                          </div>
                          <div v-else class="text-caption text-grey-8 italic">
                            No se registrará la ubicación para esta sesión.
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center">
                        <q-toggle
                          v-model="habilitarGps"
                          label="Activar GPS"
                          color="primary"
                          class="q-mr-sm"
                          :disable="esLecturaSola"
                        />
                        <q-btn
                          v-if="habilitarGps"
                          flat
                          round
                          :color="coordenadas ? 'positive' : 'primary'"
                          icon="my_location"
                          @click="capturarUbicacion"
                          :loading="capturandoUbicacion"
                          :disable="esLecturaSola"
                        >
                          <q-tooltip>Actualizar ubicación GPS</q-tooltip>
                        </q-btn>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="flex justify-end q-mt-lg">
                  <q-btn
                    color="secondary"
                    icon="save_as"
                    label="Guardar Seguimiento"
                    @click="guardarSeguimiento"
                    :disable="esLecturaSola"
                  />
                </div>
              </template>
            </div>

            <div v-else class="text-center q-pa-xl text-grey-6">
              <template v-if="sesiones.length > 0 && !fechaSeguimiento">
                <q-icon name="playlist_add_check" color="grey-5" size="56px" />
                <div class="text-h6 text-grey-7">Selecciona una sesion</div>
                <div class="text-body2 text-grey-6 q-mt-sm">
                  Elige una sesion pendiente del selector para registrar el seguimiento.
                </div>
              </template>
              <template v-else-if="sesiones.length > 0 && fechaSeguimiento">
                <q-spinner-dots color="primary" size="40px" />
              </template>
              <template v-else-if="materiaSeleccionada && grupoSeleccionado">
                <q-icon name="event_busy" color="orange-4" size="56px" />
                <div class="text-h6 text-grey-7">{{ msgPlanificacionVacia }}</div>
                <div class="text-body2 text-grey-7 q-mt-sm">
                  Para registrar seguimiento, genere el cronograma en
                  <b>Planificacion Semestral</b>.
                </div>
              </template>
              <template v-else>
                <q-icon name="school" color="grey-4" size="56px" />
                <div class="text-h6 text-grey-7">Selecciona materia y grupo</div>
              </template>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <q-dialog v-model="mostrarGuia">
      <q-card style="width: 700px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Guía de Instalación y Uso Offline</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="text-subtitle1 text-primary text-weight-bold q-mb-sm">
            1. Instalación de la App (Android)
          </div>
          <p>
            Al descargar el archivo APK, es posible que Android le solicite permitir la "Instalación
            de aplicaciones de fuentes desconocidas". Siga estos pasos:
          </p>
          <ul class="q-pl-md">
            <li>Abra el archivo descargado <b>planificacion.apk</b>.</li>
            <li>
              Si aparece un bloqueo, vaya a <b>Ajustes</b> y active
              <b>Permitir desde esta fuente</b>.
            </li>
            <li>Complete la instalación y abra la aplicación.</li>
          </ul>

          <div class="text-subtitle1 text-primary text-weight-bold q-mb-sm q-mt-md">
            2. Inicio de Sesión y Modo Offline
          </div>
          <p>Para poder registrar clases sin internet:</p>
          <ul class="q-pl-md">
            <li>Debe iniciar sesión <b>al menos una vez</b> mientras tenga conexión a internet.</li>
            <li>La sesión se mantendrá abierta permanentemente en su dispositivo.</li>
            <li>
              Al entrar a una zona sin señal, la aplicación detectará el estado offline
              automáticamente.
            </li>
          </ul>

          <div class="text-subtitle1 text-primary text-weight-bold q-mb-sm q-mt-md">
            3. Guardado y Sincronización
          </div>
          <ul class="q-pl-md">
            <li>Realice el registro de sus evidencias y asistencia normalmente.</li>
            <li>Al presionar "Guardar", los datos se almacenarán localmente en su teléfono.</li>
            <li>
              Al realizar su primer registro, el sistema le solicitará permisos de <b>Cámara</b> y
              <b>GPS</b>; asegúrese de permitirlos.
            </li>
            <li>
              <b>Importante:</b> Una vez recupere la conexión a internet, los registros pendientes
              se sincronizarán automáticamente con el servidor central.
            </li>
          </ul>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Entendido" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Geolocation } from '@capacitor/geolocation'

const getStorageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path

  let baseUrl = ''
  if (process.env.DEV) {
    baseUrl = 'http://127.0.0.1:8000'
  } else if (
    typeof window !== 'undefined' &&
    window.location.hostname.includes('planificacion.unitepc.edu.bo')
  ) {
    baseUrl = ''
  } else {
    baseUrl = 'https://planificacion.unitepc.edu.bo'
  }

  return `${baseUrl}/storage/${path}`
}

const formatContent = (val) => {
  if (!val) return '---'
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) return parsed.join('\n')
      return val
    } catch {
      return val
    }
  }
  if (Array.isArray(val)) return val.join('\n')
  return val
}

const openUrl = (url) => {
  if (!url) return
  const target = url.startsWith('http') ? url : `https://${url}`
  window.open(target, '_blank')
}

const resolveContentItem = (key) => {
  if (!key) return ''

  // Case 1: Already an object with a label or name
  if (typeof key === 'object') {
    return key.label || key.nombre || key.titulo || JSON.stringify(key)
  }

  // Case 2: String that might be JSON
  if (typeof key === 'string' && (key.startsWith('{') || key.startsWith('['))) {
    try {
      const parsed = JSON.parse(key)
      return parsed.label || parsed.nombre || parsed.titulo || key
    } catch {
      // ignore
    }
  }

  // Case 3: Format "temaId:itemIndex"
  if (typeof key === 'string' && key.includes(':')) {
    const parts = key.split(':')
    if (parts.length >= 2) {
      const temaId = parseInt(parts[0])
      const itemIndex = parseInt(parts[1])
      if (!isNaN(temaId) && !isNaN(itemIndex) && sesionActual.value) {
        const sesion = sesionActual.value
        // Search in main theme and secondary themes
        const todosLosTemas = [
          ...(Array.isArray(sesion.temas) ? sesion.temas : []),
          ...(sesion.tema ? [sesion.tema] : []),
        ]
        const tema = todosLosTemas.find((t) => t && t.id == temaId)
        if (tema) {
          const contenidoItems = tema.contenido_items || []
          if (itemIndex >= 0 && itemIndex < contenidoItems.length) {
            const item = contenidoItems[itemIndex]
            return typeof item === 'string' ? item : item?.nombre || item?.titulo || key
          }
        }
      }
    }
  }

  return key
}

const isImage = (path) => {
  if (!path || typeof path !== 'string') return false
  const ext = path.split('.').pop().toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)
}

/**
 * Formatea el tamaño de un archivo en KB o MB legible
 */
const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Helper accesible en el template para verificar si un valor es un File objeto
 * (instanceof File no está expuesto en el scope de Vue templates con script setup)
 */
const isFileObject = (val) => val instanceof File

/**
 * Helper para obtener el tamaño de un File con validación
 */
const getFileSize = (val) => (val instanceof File ? val.size : 0)

/**
 * Comprime automáticamente una imagen si supera 2MB (solo para imágenes de galería)
 * @param {Object} targetObj - El objeto reactivo que tiene la propiedad 'evidencia'
 * @param {File} file - El archivo seleccionado
 */
const comprimirImagenSiNecesario = async (targetObj, file) => {
  if (!file || !(file instanceof File)) return
  // Solo comprimir imágenes
  if (!file.type.startsWith('image/')) return
  // Si ya está dentro del límite, no comprimir
  if (file.size <= 2 * 1024 * 1024) return

  try {
    // Leer como dataURL y comprimir con canvas
    const bitmap = await createImageBitmap(file)
    const canvas = document.createElement('canvas')
    // Reducir dimensiones si es necesario (máx 1920px)
    const maxDim = 1920
    let { width, height } = bitmap
    if (width > maxDim || height > maxDim) {
      const ratio = Math.min(maxDim / width, maxDim / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
    }
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0, width, height)

    // Comprimir a JPEG 0.8
    const compressed = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8))
    if (compressed && compressed.size < file.size) {
      // Crear nuevo File con el mismo nombre
      const newFile = new File([compressed], file.name.replace(/\.[^.]+$/, '.jpg'), {
        type: 'image/jpeg',
      })
      targetObj.evidencia = newFile
      console.log(
        `Imagen comprimida: ${formatFileSize(file.size)} → ${formatFileSize(newFile.size)}`,
      )
    }
  } catch (e) {
    console.warn('No se pudo comprimir la imagen:', e)
  }
}

/**
 * Tomar foto para las secciones de integración transversal
 * @param {string} campo - 'investigacion' | 'interaccion' | 'internalizacion'
 */
const tomarFotoIntegracion = async (campo) => {
  try {
    const { Camera } = await import('@capacitor/camera')
    const photo = await Camera.getPhoto({
      quality: 60,
      allowEditing: false,
      resultType: 'dataUrl',
      source: 'CAMERA',
    })
    if (photo.dataUrl) {
      const res = await fetch(photo.dataUrl)
      const blob = await res.blob()
      const file = new File([blob], `integracion_${campo}_${Date.now()}.jpg`, {
        type: 'image/jpeg',
      })
      integracionTransversal.value[campo].evidencia = file
    }
  } catch (err) {
    if (err?.message?.includes('cancelled') || err?.message?.includes('cancel')) return
    // Fallback para navegador web
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (file) {
        await comprimirImagenSiNecesario(integracionTransversal.value[campo], file)
        if (!(integracionTransversal.value[campo].evidencia instanceof File)) {
          integracionTransversal.value[campo].evidencia = file
        }
      }
    }
    input.click()
  }
}

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  const date = new Date(dateTimeStr)
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

import { useGruposStore } from 'src/stores/grupos'
import { useSyncStore } from 'src/stores/sync'
import { useOnline } from '@vueuse/core'
import { useQuasar } from 'quasar'
import planificacionSemestralService from 'src/services/planificacionSemestralService'
import { offlineStorage } from 'src/services/offlineStorage'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Filesystem, Directory } from '@capacitor/filesystem'
import imageCompression from 'browser-image-compression'

const gruposStore = useGruposStore()
const syncStore = useSyncStore()
const isOnline = useOnline()
const $q = useQuasar()

const tab = ref('seguimiento')
const materiaSeleccionada = ref(null)
const grupoSeleccionado = ref(null)
const fechaSeguimiento = ref(null)
const loading = ref(false)
const loadingSesiones = ref(false)

// Real Data from Store
const materiasReales = ref([])
const sesiones = ref([])
const sesionActual = ref(null)

// --- Missing Reactive Variables ---
const temaPlanificado = ref('')
const contenidoPlanificado = ref('')
const conceptualPlanificado = ref('')
const procedimentalPlanificado = ref('')
const actitudinalPlanificado = ref('')
const criteriosPlanificado = ref('')
const instrumentosPlanificado = ref('')
const contenidoItemsSeleccionados = ref([])

const pedagogico = ref({
  estrategias: [],
  evaluacion: [],
  secuencia: [],
  integracion: '',
})

const evidencias = ref({
  aprendizaje_activo: null,
  evaluacion_formativa: null,
  secuencia_didactica: null,
})

const integracionTransversal = ref({
  investigacion: { cumplido: false, evidencia: null },
  interaccion: { cumplido: false, evidencia: null },
  internalizacion: { cumplido: false, evidencia: null },
})

const temaCumplido = ref(false)
const estadoCumplimiento = ref(null)
const observacionesClase = ref('')

// --- Modo Examen & Georeferencia ---
const esExamen = ref(false)
const tipoExamen = ref(null)
const coordenadas = ref(null)
const capturandoUbicacion = ref(false)

const tiposExamenOptions = [
  { label: '1er Parcial', value: '1ER_PARCIAL' },
  { label: '2do Parcial', value: '2DO_PARCIAL' },
  { label: 'Examen Final', value: 'FINAL' },
  { label: '2da Instancia', value: '2DA_INSTANCIA' },
  { label: 'Práctica (Clínica, Anfiteatro, Lab, Otros)', value: 'PRACTICA_ESPECIAL' },
]

const capturarUbicacion = async () => {
  if (capturandoUbicacion.value) return
  capturandoUbicacion.value = true
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    })
    coordenadas.value = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: new Date().toISOString(),
    }
    console.log('Ubicación capturada:', coordenadas.value)
  } catch (error) {
    console.error('Error al capturar ubicación:', error)
    $q.notify({
      type: 'warning',
      message: 'No se pudo obtener la ubicación precisa. Verifique su GPS.',
      icon: 'location_off',
    })
  } finally {
    capturandoUbicacion.value = false
  }
}

// --- Asistencia & UI Helpers ---
const habilitarGps = ref(true)

const columnsAsistencia = [
  {
    name: 'nombre',
    label: 'Estudiante',
    field: (row) => `${row.nombre || ''} ${row.apellido || ''}`,
    align: 'left',
    sortable: true,
  },
  { name: 'estado', label: 'Asistencia', align: 'center' },
  { name: 'observacion', label: 'Observación', align: 'left' },
]

// Mensajes UI para evitar interpolaciones de texto largas en la plantilla
const msgNoSessions = computed(() => {
  if (sesiones.value.length === 0)
    return 'Debe generar y completar el Cronograma desde Planificación Semestral antes de registrar seguimiento'
  return vistaHistorial.value ? 'No hay clases completadas' : 'No hay clases pendientes'
})

const msgGeoreferencia = computed(() => {
  if (!habilitarGps.value) return 'Desactivada'
  return coordenadas.value ? 'Ubicación registrada' : 'Pendiente de capturar'
})

const msgPlanificacionVacia = computed(() => {
  if (sesiones.value.length === 0)
    return 'Primero debe generar el Cronograma en Planificación Semestral'
  return 'Selecciona una clase para ver el seguimiento'
})

const msgTemaPlanificado = computed(() => temaPlanificado.value || 'Sin tema asignado')

const estudiantesVista = computed(() => {
  if (!claseSeleccionadaObj.value) return []
  return claseSeleccionadaObj.value.carreras || []
})

function generateMockStudents() {
  // Mock constant for demonstration/fallback
  return [
    {
      id: 101,
      nombre: 'Ana',
      apellido: 'García',
      estado: 'P',
      observacion: '',
      carreraOrigen: 'Sistemas',
    },
    {
      id: 102,
      nombre: 'Luis',
      apellido: 'Pérez',
      estado: 'P',
      observacion: '',
      carreraOrigen: 'Sistemas',
    },
    {
      id: 103,
      nombre: 'Marta',
      apellido: 'Sánchez',
      estado: 'P',
      observacion: '',
      carreraOrigen: 'Sistemas',
    },
  ]
}

// --- Reset & Extraction Helpers ---
const resetPedagogico = () => {
  pedagogico.value = {
    estrategias: [],
    evaluacion: [],
    secuencia: [],
    integracion: '',
  }
}
const resetIntegracion = () => {
  pedagogico.value.integracion = ''
}
const resetEvidencias = () => {
  evidencias.value = {
    aprendizaje_activo: null,
    evaluacion_formativa: null,
    secuencia_didactica: null,
  }
}
const resetIntegracionTransversalDefault = () => {
  integracionTransversal.value = {
    investigacion: { cumplido: false, evidencia: null },
    interaccion: { cumplido: false, evidencia: null },
    internalizacion: { cumplido: false, evidencia: null },
  }
}

const extractFromTopic = (topic) => {
  if (!topic) return { estrategias: [], evaluacion: [], secuencia: [] }

  // --- Estrategias ---
  // planificacion_personal has: estrategias_recursos (array), estrategias_metodologicas (string)
  // Tema base may also have those fields, or a generic 'estrategias' (array of strings or objects)
  const estrategiasItems = []
  const rawRecursos = topic.estrategias_recursos || topic.estrategias || []
  if (Array.isArray(rawRecursos)) {
    rawRecursos.forEach((i) => {
      const nombre = typeof i === 'string' ? i : i.nombre || ''
      if (nombre) estrategiasItems.push({ nombre, cumplido: false })
    })
  }
  // Add metodologicas as a single item if present and estrategiasItems is still empty
  if (estrategiasItems.length === 0 && topic.estrategias_metodologicas) {
    estrategiasItems.push({
      nombre: 'Metodología: ' + topic.estrategias_metodologicas.substring(0, 60),
      cumplido: false,
    })
  }

  // --- Evaluación ---
  // planificacion_personal has: evaluacion_formativa: {actividades, instrumentos, evidencias}
  //                             evaluacion_sumativa: {actividades, instrumentos, evidencias}
  const evaluacionItems = []
  const evalSources = [
    topic.evaluacion_formativa,
    topic.evaluacion_sumativa,
    // Fallback: generic 'evaluacion' field (legacy or tema base)
    ...(Array.isArray(topic.evaluacion) ? [{ actividades: topic.evaluacion }] : []),
  ]
  evalSources.forEach((eval_) => {
    if (!eval_) return
    if (Array.isArray(eval_)) {
      // plain array of strings or objects
      eval_.forEach((i) => {
        const nombre = typeof i === 'string' ? i : i.nombre || ''
        if (nombre) evaluacionItems.push({ nombre, cumplido: false })
      })
    } else if (eval_.actividades && Array.isArray(eval_.actividades)) {
      eval_.actividades.forEach((act) => {
        const nombre = typeof act === 'string' ? act : act.nombre || ''
        if (nombre) evaluacionItems.push({ nombre, cumplido: false })
      })
    }
  })

  // --- Secuencia Didáctica ---
  // planificacion_personal.secuencia_didactica is an array of {momento, actividad, duracion_minutos}
  const secuenciaItems = []
  const rawSec = topic.secuencia_didactica || []
  if (Array.isArray(rawSec)) {
    rawSec.forEach((i) => {
      let nombre = ''
      if (typeof i === 'string') {
        nombre = i
      } else if (i.nombre) {
        nombre = i.nombre
      } else if (i.momento || i.actividad) {
        nombre = i.momento ? i.momento : ''
        if (i.actividad) nombre += (nombre ? ': ' : '') + i.actividad.substring(0, 60)
      }
      if (nombre) secuenciaItems.push({ nombre, cumplido: false })
    })
  }

  return {
    estrategias: estrategiasItems,
    evaluacion: evaluacionItems,
    secuencia: secuenciaItems,
  }
}

const tomarFoto = async (campo) => {
  try {
    const image = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    })

    if (image.base64String) {
      $q.loading.show({ message: 'Procesando imagen...' })

      // Convert base64 → Blob directly (no fetch needed)
      const byteChars = atob(image.base64String)
      const byteArr = new Uint8Array(byteChars.length)
      for (let i = 0; i < byteChars.length; i++) {
        byteArr[i] = byteChars.charCodeAt(i)
      }
      const blob = new Blob([byteArr], { type: 'image/jpeg' })

      // Compress to max 2MB
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      }
      const compressedBlob = await imageCompression(blob, options)
      $q.loading.hide()

      const finalFile = new File([compressedBlob], `evidencia_${Date.now()}.jpg`, {
        type: 'image/jpeg',
      })

      if (campo === 'aprendizaje_activo') {
        evidencias.value.aprendizaje_activo = finalFile
      }
      $q.notify({ type: 'positive', message: 'Foto capturada correctamente', icon: 'photo_camera' })
    }
  } catch (error) {
    $q.loading.hide()
    const msg = error?.message || ''
    if (!msg.includes('cancelled') && !msg.includes('cancel')) {
      console.error('Error al capturar imagen:', error)
      $q.notify({
        type: 'negative',
        message: `Error cámara: ${msg || 'Permiso denegado o no disponible'}`,
      })
    }
  }
}

const archivoRechazado = (rejectedEntries) => {
  rejectedEntries.forEach((entry) => {
    if (entry.failedPropValidation === 'max-file-size') {
      $q.notify({
        type: 'negative',
        message: 'El archivo excede el límite de 2MB',
        icon: 'warning',
      })
    }
  })
}

const saveFileOffline = async (fileObj, prefix) => {
  if (!fileObj || typeof fileObj === 'string') return fileObj

  const base64Data = await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve(reader.result.split(',')[1])
    }
    reader.readAsDataURL(fileObj)
  })

  const fileName = `${prefix}_${Date.now()}_${fileObj.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: Directory.Data,
  })

  return {
    path: fileName,
    type: fileObj.type,
    name: fileObj.name,
  }
}

// Computed: Check if current session is completed (read-only mode)
const esLecturaSola = computed(() => {
  const cumplido = sesionActual.value?.cumplido
  const result = !!sesionActual.value?.seguimiento_id
  console.log(
    'esLecturaSola computed - cumplido:',
    cumplido,
    'type:',
    typeof cumplido,
    'result:',
    result,
  )
  return result
})

const SESIONES_CACHE_KEY = (asigId, grupoId) => `clase_sesiones_${asigId}_${grupoId}`
const MATERIAS_CACHE_KEY = 'clase_materias_cache'

// Cache status as reactive ref (offlineStorage is async, so can't be a computed)
const cacheStatus = ref({ materias: false, sesiones: false })

async function refreshCacheStatus() {
  const tieneMateriasCache = await offlineStorage.has(MATERIAS_CACHE_KEY)
  let tieneSesionesCache = false
  if (materiaSeleccionada.value && grupoSeleccionado.value) {
    const key = SESIONES_CACHE_KEY(materiaSeleccionada.value, grupoSeleccionado.value)
    tieneSesionesCache = await offlineStorage.has(key)
  }
  cacheStatus.value = { materias: tieneMateriasCache, sesiones: tieneSesionesCache }
}

const fetchData = async () => {
  loading.value = true

  try {
    if (!isOnline.value) {
      // OFFLINE: read from native storage (SharedPreferences on Android)
      const cached = await offlineStorage.get(MATERIAS_CACHE_KEY)
      if (cached && cached.length > 0) {
        materiasReales.value = cached
        $q.notify({
          type: 'info',
          message: 'Modo offline — mostrando materias cacheadas',
          icon: 'cloud_off',
          timeout: 2000,
        })
      } else {
        $q.notify({
          type: 'warning',
          message: 'Sin conexión y sin datos en caché. Abre la app con internet al menos una vez.',
          timeout: 5000,
        })
      }
      return
    }

    const response = await gruposStore.fetchGrupos({ gestion: '1-2026' })
    const materias = response && response.data ? response.data : []
    materiasReales.value = materias

    // Save to native storage for reliable offline access
    if (materias.length > 0) {
      await offlineStorage.set(MATERIAS_CACHE_KEY, materias)
      await refreshCacheStatus()
    }
  } catch (error) {
    console.error('Error fetching real data:', error)
    // API failed — try native storage cache
    const cached = await offlineStorage.get(MATERIAS_CACHE_KEY)
    if (cached && cached.length > 0) {
      materiasReales.value = cached
      $q.notify({
        type: 'warning',
        message: 'Sin conexión — mostrando materias cacheadas',
        icon: 'cloud_off',
        timeout: 3000,
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Error al cargar las materias. Sin caché disponible.',
      })
    }
  } finally {
    loading.value = false
  }
}

// 1. Materias únicas disponibles
// Si varias materias comparten comun_token, se muestran como UNA SOLA entrada
// con un badge que indica las carreras vinculadas.
const materiasDisponibles = computed(() => {
  const materias = materiasReales.value
  const result = []
  const tokensSeen = new Set()

  materias.forEach((m) => {
    if (m.comun_token) {
      if (tokensSeen.has(m.comun_token)) return
      tokensSeen.add(m.comun_token)

      const vinculadas = materias.filter((x) => x.comun_token === m.comun_token)
      if (vinculadas.length > 1) {
        const codigos = vinculadas.map((x) => x.codigo).join(' · ')
        result.push({
          label: m.nombre,
          sublabel: `Común: ${codigos}`,
          codigos: codigos,
          value: m.id,
          esComunAgrupada: true,
          comunToken: m.comun_token,
          materiasVinculadas: vinculadas,
          ...m,
        })
        return
      }
    }
    result.push({
      label: `${m.nombre} (${m.codigo})`,
      sublabel: null,
      codigos: m.codigo,
      value: m.id,
      esComunAgrupada: false,
      ...m,
    })
  })

  return result
})

// 2. Grupos consolidados para la materia seleccionada
const gruposDisponibles = computed(() => {
  if (!materiaSeleccionada.value) return []

  const materia = materiasDisponibles.value.find((m) => m.id === materiaSeleccionada.value)
  if (!materia || !materia.grupos) return []

  // Consolidar por grupo_id
  const gruposMap = {}

  materia.grupos.forEach((g) => {
    if (!gruposMap[g.grupo_id]) {
      gruposMap[g.grupo_id] = {
        id: g.grupo_id,
        nombre: g.grupo,
        tipo: g.tipo_clase,
        horarios: [],
      }
    }
    if (g.dia !== '-') {
      gruposMap[g.grupo_id].horarios.push(`${g.dia} ${g.hora_inicio}-${g.hora_fin}`)
    }
  })

  return Object.values(gruposMap).map((g) => ({
    label: `Grupo ${g.nombre} - ${g.tipo}`,
    sublabel: g.horarios.length > 0 ? g.horarios.join(', ') : 'Sin horario definido',
    value: g.id,
    ...g,
  }))
})

// Lógica de Unificación de Clases (MANTENIDA para compatibilidad de vista de estudiantes si es necesario, pero simplificada)
const claseSeleccionadaObj = computed(() => {
  if (!materiaSeleccionada.value || !grupoSeleccionado.value) return null

  const materia = materiasDisponibles.value.find((m) => m.id === materiaSeleccionada.value)
  const grupo = gruposDisponibles.value.find((g) => g.id === grupoSeleccionado.value)

  if (!materia || !grupo) return null

  return {
    id: materia.id,
    nombreComun: materia.nombre,
    grupoNombre: grupo.nombre,
    horario: grupo.sublabel,
    esFusionada: materia.comun_token && materia.comun_tipo === 'fusionada',
    carreras: [
      {
        id: materia.id,
        nombreCarrera: materia.carrera,
        materia: materia.nombre,
        codigos: materia.codigos,
        estudiantes: generateMockStudents(materia.id + grupo.id),
      },
    ],
  }
})

// Toggle between pending and completed sessions
const vistaHistorial = ref(false)

// Store current group's horarios for semáforo calculation
const horariosGrupoActual = ref([])

/**
 * Semáforo de Puntualidad
 * Compara seguimiento.created_at con la fecha/hora programada de la sesión
 * @returns {Object} { color, icon, tooltip }
 */
function getSemaforoStatus(sesion) {
  if (!sesion.cumplido || !sesion.seguimiento_created_at) {
    return { color: 'grey-4', icon: 'radio_button_unchecked', tooltip: 'Pendiente' }
  }

  const createdAt = new Date(sesion.seguimiento_created_at)
  const fechaSesion = sesion.fecha // YYYY-MM-DD
  if (!fechaSesion) {
    return { color: 'blue', icon: 'help', tooltip: 'Sin fecha programada' }
  }

  // CORRECCIÓN: Usar hora local del servidor (Bolivia UTC-4) para evitar desfases
  // El string de seguimiento_created_at puede venir en UTC del servidor
  // Usamos toLocaleDateString con 'sv-SE' para obtener YYYY-MM-DD en horario local
  const createdDateStr = createdAt.toLocaleDateString('sv-SE')

  // RED: saved AFTER the scheduled day
  if (createdDateStr > fechaSesion) {
    const diasRetraso = Math.floor((new Date(createdDateStr) - new Date(fechaSesion)) / 86400000)
    return { color: 'red', icon: 'circle', tooltip: `Registrado ${diasRetraso} día(s) después` }
  }

  // Same day - check time range
  if (createdDateStr === fechaSesion) {
    // Try to find the horario time range for this session
    const horario = horariosGrupoActual.value.find((h) => {
      if (!h.hora_inicio) return false
      // Match by day of week
      const daysMap = {
        LUNES: 1,
        MARTES: 2,
        MIERCOLES: 3,
        MIÉRCOLES: 3,
        JUEVES: 4,
        VIERNES: 5,
        SABADO: 6,
        SÁBADO: 6,
        DOMINGO: 0,
      }
      const sessionDay = new Date(fechaSesion + 'T12:00:00').getDay()
      const horarioDay = daysMap[(h.dia || '').toUpperCase()]
      return horarioDay === sessionDay
    })

    if (horario && horario.hora_inicio && horario.hora_fin) {
      // Usar hora local (no getHours que es UTC en algunos entornos)
      const hours = createdAt.getHours()
      const minutes = createdAt.getMinutes()
      const createdTime = hours * 60 + minutes

      const [hI, mI] = horario.hora_inicio.split(':').map(Number)
      const [hF, mF] = horario.hora_fin.split(':').map(Number)
      // 30 min antes como tolerancia de inicio + 60 min de gracia al final
      const startMin = hI * 60 + (mI || 0) - 30
      const endMin = hF * 60 + (mF || 0) + 60

      if (createdTime >= startMin && createdTime <= endMin) {
        return { color: 'green', icon: 'circle', tooltip: 'Registrado durante la clase ✓' }
      }
      // Fuera del rango de horario - amarillo (no rojo, puede haber diferencias)
      return {
        color: 'amber',
        icon: 'circle',
        tooltip: 'Registrado el mismo día (fuera de horario)',
      }
    }

    // Sin horario disponible para el día: no marcar en rojo, marcar verde
    return { color: 'green', icon: 'circle', tooltip: 'Registrado el mismo día ✓' }
  }

  // Created BEFORE the scheduled day (early registration)
  return { color: 'green', icon: 'circle', tooltip: 'Registrado anticipadamente ✓' }
}

// Computed options based on vistaHistorial toggle
const sesionesOptions = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const filtered = sesiones.value.filter((s) => {
    const isCumplido = !!s.seguimiento_id

    // Filtro de fecha mínima: Mostrar solo a partir del 09/03/2026
    const minDate = '2026-03-09'
    if (s.fecha && s.fecha < minDate) return false

    if (vistaHistorial.value) {
      return isCumplido && !!s.fecha // Completadas: solo las que tienen fecha
    } else {
      // Pendientes: No cumplidas Y con fecha (excluir sesiones sin fecha) Y fecha <= hoy
      return !isCumplido && !!s.fecha && s.fecha <= today
    }
  })

  console.log(
    'sesionesOptions - vistaHistorial:',
    vistaHistorial.value,
    'filtered count:',
    filtered.length,
    'total:',
    sesiones.value.length,
  )

  return filtered.map((s) => {
    // Format date for display: DD/MM/YYYY
    let fechaDisplay = 'Sin fecha'
    if (s.fecha) {
      if (s.fecha.includes('-')) {
        const [y, m, d] = s.fecha.split('-')
        fechaDisplay = `${d}/${m}/${y}`
      } else {
        fechaDisplay = s.fecha
      }
    }

    let label = `${fechaDisplay} - Sesión ${s.numero_sesion}`
    // Try to get a meaningful title
    if (s.tema && s.tema.titulo) {
      label += ` - ${s.tema.titulo.substring(0, 40)}...`
    } else if (s.observaciones) {
      label += ` - ${s.observaciones}`
    } else {
      label += ' - (Sin tema asignado)'
    }

    // Add semáforo indicator for completed sessions
    if (vistaHistorial.value) {
      const sem = getSemaforoStatus(s)
      const emoji =
        sem.color === 'green'
          ? '🟢'
          : sem.color === 'amber'
            ? '🟡'
            : sem.color === 'red'
              ? '🔴'
              : '⚪'
      label = emoji + ' ' + label
      if (s.seguimiento_created_at) {
        label += ` (${formatDateTime(s.seguimiento_created_at)})`
      }
    }

    return {
      label: label,
      value: s.id, // Usar ID único en lugar de fecha (puede haber varias sesiones el mismo día)
      sesionFecha: s.fecha,
    }
  })
})

// Keep old computed for backward compatibility
const sesionesPendientesOptions = computed(() => {
  return sesionesOptions.value
})

const fetchSesiones = async () => {
  if (!materiaSeleccionada.value || !grupoSeleccionado.value) return

  const cacheKey = SESIONES_CACHE_KEY(materiaSeleccionada.value, grupoSeleccionado.value)
  loadingSesiones.value = true

  // OFFLINE: load from localStorage cache immediately
  if (!isOnline.value) {
    try {
      const cached = await offlineStorage.get(cacheKey)
      if (cached) {
        sesiones.value = cached.sesiones || []
        horariosGrupoActual.value = cached.horarios || []
        $q.notify({
          type: 'info',
          message: 'Modo offline — mostrando sesiones cacheadas',
          icon: 'cloud_off',
          timeout: 2000,
        })
        if (sesionesPendientesOptions.value.length > 0) {
          const today = new Date().toISOString().split('T')[0]
          const todaySession = sesionesPendientesOptions.value.find((o) => o.sesionFecha === today)
          fechaSeguimiento.value = todaySession
            ? todaySession.value
            : sesionesPendientesOptions.value[0].value
        }
        actualizarSesionPorFecha()
      } else {
        $q.notify({
          type: 'warning',
          message:
            'Sin conexión y sin caché de sesiones. Abre la app con internet al menos una vez.',
          timeout: 4000,
        })
      }
    } catch (e) {
      console.error('Error reading sessions cache:', e)
    } finally {
      loadingSesiones.value = false
    }
    return
  }

  try {
    // 1. Fetch Planificación (Hybrid: Master + Execution)
    const response = await planificacionSemestralService.getPlanificacion(
      materiaSeleccionada.value,
      {
        grupo_id: grupoSeleccionado.value,
      },
    )

    let rawSesiones = response.data.planificacion || []
    const config = response.data.config || {}
    const horarios = response.data.horarios || []

    // 1. Determine Group Type
    let esGrupoTeorico = false
    // Use loose comparison (==) for IDs to handle string/number mismatch
    const horariosGrupo = horarios.filter((h) => h.grupo_id == grupoSeleccionado.value)
    horariosGrupoActual.value = horariosGrupo // Save for semáforo
    const grupoDef = gruposDisponibles.value.find((g) => g.id == grupoSeleccionado.value)

    if (grupoDef && grupoDef.tipo) {
      const t = grupoDef.tipo.toUpperCase()
      esGrupoTeorico = ['TEORICA', 'TEÓRICA', 'TEORICO', 'T'].includes(t)
    } else if (horariosGrupo.find((h) => h.tipo)) {
      const t = horariosGrupo.find((h) => h.tipo).toUpperCase()
      esGrupoTeorico = ['TEORICA', 'TEÓRICA', 'TEORICO', 'T'].includes(t)
    }

    // 2. Filter Sessions
    let filteredSesiones = rawSesiones.filter((s) => {
      if (s.tipo_clase) {
        const tipoSesion = s.tipo_clase.toUpperCase()
        const isSesionTeorica = ['TEORICA', 'TEÓRICA', 'TEORICO', 'T'].includes(tipoSesion)

        if ((grupoDef && grupoDef.tipo) || horariosGrupo.find((h) => h.tipo)) {
          return esGrupoTeorico === isSesionTeorica
        }
      }
      return true
    })

    // 3. Project Dates
    if (config.fecha_inicio_clases && horariosGrupo.length > 0) {
      const parts = config.fecha_inicio_clases.split('-')
      // Note: Month is 0-indexed in JS Date
      const startDate = new Date(parts[0], parts[1] - 1, parts[2])

      const daysMap = {
        LUNES: 1,
        MARTES: 2,
        MIERCOLES: 3,
        MIÉRCOLES: 3,
        JUEVES: 4,
        VIERNES: 5,
        SABADO: 6,
        SÁBADO: 6,
        DOMINGO: 0,
      }

      const groupDays = horariosGrupo
        .map((h) => {
          if (!h.dia) return undefined
          // Normalize: UpperCase and remove special chars if needed, but generic map should catch it
          let d = h.dia.toUpperCase()
          // Handle "Lunes" -> "LUNES"
          return daysMap[d]
        })
        .filter((d) => d !== undefined)
        .sort((a, b) => a - b)

      console.log('StartDate:', startDate, 'GroupDays:', groupDays)

      if (groupDays.length > 0) {
        let currentDate = new Date(startDate)
        const sessionsToDate = [...filteredSesiones].sort(
          (a, b) => a.numero_sesion - b.numero_sesion,
        )
        let currentSessionIndex = 0

        // Find first valid class day >= startDate
        while (!groupDays.includes(currentDate.getDay())) {
          currentDate.setDate(currentDate.getDate() + 1)
        }

        for (let i = 0; i < 365; i++) {
          if (currentSessionIndex >= sessionsToDate.length) break

          const dayOfWeek = currentDate.getDay()
          if (groupDays.includes(dayOfWeek)) {
            const session = sessionsToDate[currentSessionIndex]
            if (!session.fecha) {
              const y = currentDate.getFullYear()
              const m = String(currentDate.getMonth() + 1).padStart(2, '0')
              const d = String(currentDate.getDate()).padStart(2, '0')
              session.fecha = `${y}-${m}-${d}`
              session.isCalculated = true
            }
            currentSessionIndex++
          }
          currentDate.setDate(currentDate.getDate() + 1)
        }
      }
    } else if (!config.fecha_inicio_clases) {
      console.warn('Falta fecha_inicio_clases en configuración de asignatura')
      $q.notify({
        type: 'warning',
        message: 'Configure la fecha de inicio de clases para ver las fechas proyectadas',
      })
    }

    sesiones.value = filteredSesiones

    // OFFLINE CACHE: guardar solo campos esenciales para minimizar el uso de storage
    try {
      const sesionesParaCache = filteredSesiones.map((s) => ({
        id: s.id,
        fecha: s.fecha,
        numero_sesion: s.numero_sesion,
        seguimiento_id: s.seguimiento_id,
        cumplido: s.cumplido,
        cronograma_id: s.cronograma_id,
        tema: s.tema ? { id: s.tema.id, titulo: s.tema.titulo } : null,
        contenido_conceptual: s.contenido_conceptual,
        contenido_procedimental: s.contenido_procedimental,
        contenido_actitudinal: s.contenido_actitudinal,
        criterios_desempeno: s.criterios_desempeno,
        instrumentos_evaluacion: s.instrumentos_evaluacion,
        contenido_items_seleccionados: s.contenido_items_seleccionados,
        pedagogico: s.pedagogico,
        observaciones: s.observaciones,
        seguimiento_created_at: s.seguimiento_created_at,
        isCalculated: s.isCalculated,
      }))
      await offlineStorage.set(cacheKey, {
        sesiones: sesionesParaCache,
        horarios: horarios,
        savedAt: new Date().toISOString(),
      })
    } catch (storageErr) {
      // Si falla por cuota, solo notificar con advertencia suave (no bloquea la funcionalidad online)
      console.warn(
        'No se pudo guardar caché offline (cuota de storage superada):',
        storageErr?.message,
      )
      $q.notify({
        type: 'warning',
        message: 'Sin caché offline disponible para este grupo (datos muy grandes).',
        caption: 'Solo funcionará con conexión a internet.',
        icon: 'cloud_off',
        timeout: 4000,
      })
    }
    await refreshCacheStatus()
    // Auto-select logic
    if (sesionesPendientesOptions.value.length > 0) {
      // Try to select today's session if exists
      const today = new Date().toISOString().split('T')[0]
      const todaySession = sesionesPendientesOptions.value.find((o) => o.sesionFecha === today)
      fechaSeguimiento.value = todaySession
        ? todaySession.value
        : sesionesPendientesOptions.value[0].value
    } else {
      fechaSeguimiento.value = null
    }

    actualizarSesionPorFecha()
  } catch (error) {
    console.error('Error fetching sessions:', error)
    // Fallback to native storage cache if API fails
    try {
      const cached = await offlineStorage.get(cacheKey)
      if (cached) {
        sesiones.value = cached.sesiones || []
        horariosGrupoActual.value = cached.horarios || []
        $q.notify({
          type: 'warning',
          message: 'Sin conexión — mostrando sesiones cacheadas',
          icon: 'cloud_off',
          timeout: 3000,
        })
        if (sesionesPendientesOptions.value.length > 0) {
          const today = new Date().toISOString().split('T')[0]
          const todaySession = sesionesPendientesOptions.value.find((o) => o.sesionFecha === today)
          fechaSeguimiento.value = todaySession
            ? todaySession.value
            : sesionesPendientesOptions.value[0].value
        }
        actualizarSesionPorFecha()
      } else {
        const errDetails = error?.message || error?.toString() || 'Error desconocido'
        $q.notify({
          type: 'negative',
          message: `Error al cargar las sesiones (${errDetails}). Sin caché disponible.`,
          timeout: 8000,
        })
      }
    } catch {
      $q.notify({ type: 'negative', message: 'Error al cargar las sesiones' })
    }
  } finally {
    loadingSesiones.value = false
  }
}

const actualizarSesionPorFecha = () => {
  if (!sesiones.value.length || !fechaSeguimiento.value) {
    sesionActual.value = null
    return
  }

  // Find session by unique ID (not by fecha, there can be multiple sessions on the same day)
  const found = sesiones.value.find((s) => s.id === fechaSeguimiento.value)
  if (found) {
    sesionActual.value = found

    // 1. Tema Title Mapping
    if (found.tema) {
      temaPlanificado.value = found.tema.titulo
    } else {
      temaPlanificado.value = found.contenido_conceptual || 'Sin título de tema'
    }

    // 2. Load cronograma fields (readonly display)
    contenidoPlanificado.value = found.contenido || ''
    conceptualPlanificado.value = found.contenido_conceptual || ''
    procedimentalPlanificado.value = found.contenido_procedimental || ''
    actitudinalPlanificado.value = found.contenido_actitudinal || ''
    criteriosPlanificado.value = found.criterios_desempeno || ''
    instrumentosPlanificado.value = found.instrumentos_evaluacion || ''

    // Load content items selected
    contenidoItemsSeleccionados.value = found.contenido_items_seleccionados || []

    // Load Exam Mode & Georeference from pedagogico
    const savedPedagogico = found.pedagogico || {}
    esExamen.value = savedPedagogico.es_examen || false
    tipoExamen.value = savedPedagogico.tipo_examen || null
    coordenadas.value = savedPedagogico.georeferencia || null

    observacionesClase.value = found.observaciones || ''

    // 3. Pedagogical Details Mapping
    // Logic:
    // A. If saved (and has data), use saved.
    // B. If not saved (or saved is empty/default defaults), try to load from Topic (PlanificacionPersonal).

    let useSaved = false
    if (found.pedagogico && typeof found.pedagogico === 'object') {
      // Check if it has meaningful data or just empty/default structure
      // If the backend sent resolved defaults, use them.
      useSaved = true
    }

    if (useSaved) {
      const saved = JSON.parse(JSON.stringify(found.pedagogico))

      // MERGE STRATEGY: Load definitions from Plan (Topic), apply status from Saved.
      // This ensures formatting (prefixes) and new items are visible, while keeping progress.

      const planning = found.tema?.planificacion_personal || found.tema
      const fromPlan = extractFromTopic(planning)

      // Helper to merge: baseItems (plan) + savedItems (status)
      const mergeItems = (planItems, savedItems) => {
        if (!planItems || planItems.length === 0) {
          // If plan is empty, maybe we rely on saved items (legacy support)
          return savedItems || []
        }
        return planItems.map((pItem) => {
          // Find matching saved item (loose match by name/content)
          // content match: ignore prefix like "Recurso: " for matching if saved didn't have it?
          // Or just simpler: find item where saved name contains pItem name or vice versa?
          // Let's try exact match or "saved name is contained in plan name" (since we added prefixes)
          const match = (savedItems || []).find(
            (s) =>
              s.nombre === pItem.nombre ||
              pItem.nombre.includes(s.nombre) ||
              s.nombre.includes(pItem.nombre),
          )
          return {
            ...pItem,
            cumplido: match ? match.cumplido : false,
          }
        })
      }

      pedagogico.value.estrategias = mergeItems(fromPlan.estrategias, saved.estrategias)
      pedagogico.value.evaluacion = mergeItems(fromPlan.evaluacion, saved.evaluacion)
      pedagogico.value.secuencia = mergeItems(fromPlan.secuencia, saved.secuencia)

      // If plan items were empty but saved had something, keep saved (fallback)
      if (fromPlan.estrategias.length === 0 && saved.estrategias?.length > 0)
        pedagogico.value.estrategias = saved.estrategias
      if (fromPlan.evaluacion.length === 0 && saved.evaluacion?.length > 0)
        pedagogico.value.evaluacion = saved.evaluacion
      if (fromPlan.secuencia.length === 0 && saved.secuencia?.length > 0)
        pedagogico.value.secuencia = saved.secuencia
      // Load estado cumplimiento from pedagogico or map from old boolean
      estadoCumplimiento.value = saved.estado_cumplimiento || (saved.tema_cumplido ? 'TOTAL' : null)
      temaCumplido.value = saved.tema_cumplido || false

      if (saved.integracion) {
        pedagogico.value.integracion = saved.integracion
      } else {
        resetIntegracion()
      }

      // Load Evidences (prefer top-level if exists, fallback to pedagogico)
      if (found.evidencias) {
        evidencias.value = JSON.parse(JSON.stringify(found.evidencias))
      } else if (saved.evidencias) {
        evidencias.value = JSON.parse(JSON.stringify(saved.evidencias))
      } else {
        resetEvidencias()
      }

      // Load Integración Transversal (prefer top-level if exists)
      const integracionSaved = found.integracion_transversal || saved.integracionTransversal
      if (integracionSaved) {
        integracionTransversal.value = JSON.parse(JSON.stringify(integracionSaved))
      } else {
        resetIntegracionTransversalDefault()
      }
    } else {
      // Load directly from Planning (Tema)
      const planning = found.tema?.planificacion_personal || found.tema

      if (planning) {
        const extracted = extractFromTopic(planning)
        pedagogico.value.estrategias = extracted.estrategias
        pedagogico.value.evaluacion = extracted.evaluacion
        pedagogico.value.secuencia = extracted.secuencia
      } else {
        resetPedagogico()
      }
      resetIntegracion()
      resetEvidencias()
      resetIntegracionTransversalDefault()
      temaCumplido.value = false
      estadoCumplimiento.value = null
    }
  } else {
    sesionActual.value = null
    temaPlanificado.value = ''
    contenidoPlanificado.value = ''
    conceptualPlanificado.value = ''
    procedimentalPlanificado.value = ''
    actitudinalPlanificado.value = ''
    criteriosPlanificado.value = ''
    instrumentosPlanificado.value = ''
    observacionesClase.value = ''
    resetPedagogico()
    resetIntegracion()
    resetEvidencias()
    resetIntegracionTransversalDefault()
    temaCumplido.value = false
    estadoCumplimiento.value = null
  }
}

const guardarSeguimiento = async () => {
  if (!esExamen.value && !estadoCumplimiento.value) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar el Estado de Cumplimiento (Total, Parcial o No)',
    })
    return
  }

  if (!sesionActual.value) {
    $q.notify({ type: 'warning', message: 'No hay una sesión de planificación para esta fecha' })
    return
  }

  try {
    // Logic for OFFLINE mode
    if (!isOnline.value) {
      $q.loading.show({ message: 'Guardando registro offline...' })

      const off_aprendizaje_activo = await saveFileOffline(
        evidencias.value.aprendizaje_activo,
        'ev_apr',
      )
      const off_evaluacion_formativa = await saveFileOffline(
        evidencias.value.evaluacion_formativa,
        'ev_eval',
      )
      const off_secuencia_didactica = await saveFileOffline(
        evidencias.value.secuencia_didactica,
        'ev_sec',
      )
      const off_inv = await saveFileOffline(
        integracionTransversal.value.investigacion.evidencia,
        'int_inv',
      )
      const off_inter = await saveFileOffline(
        integracionTransversal.value.interaccion.evidencia,
        'int_inter',
      )
      const off_inter_n = await saveFileOffline(
        integracionTransversal.value.internalizacion.evidencia,
        'int_intern',
      )

      const followupData = {
        cronograma_id: sesionActual.value.cronograma_id || sesionActual.value.id,
        grupo_id: grupoSeleccionado.value,
        asignatura_id: materiaSeleccionada.value,
        numero_sesion: sesionActual.value.numero_sesion,
        fecha: sesionActual.value.fecha || new Date().toISOString().split('T')[0],
        tema_cumplido:
          estadoCumplimiento.value === 'TOTAL' || estadoCumplimiento.value === 'PARCIAL',
        estado_cumplimiento: estadoCumplimiento.value,
        observaciones: observacionesClase.value || '',
        pedagogico: {
          estrategias: pedagogico.value.estrategias,
          evaluacion: pedagogico.value.evaluacion,
          secuencia: pedagogico.value.secuencia,
          integracion: pedagogico.value.integracion,
          estado_cumplimiento: estadoCumplimiento.value,
          es_examen: esExamen.value,
          tipo_examen: tipoExamen.value,
          georeferencia: habilitarGps.value ? coordenadas.value || null : null,
        },
        integracion_transversal: {
          investigacion: {
            cumplido: integracionTransversal.value.investigacion.cumplido,
            evidencia: off_inv,
          },
          interaccion: {
            cumplido: integracionTransversal.value.interaccion.cumplido,
            evidencia: off_inter,
          },
          internalizacion: {
            cumplido: integracionTransversal.value.internalizacion.cumplido,
            evidencia: off_inter_n,
          },
        },
        evidencias_offline: {
          aprendizaje_activo: off_aprendizaje_activo,
          evaluacion_formativa: off_evaluacion_formativa,
          secuencia_didactica: off_secuencia_didactica,
        },
      }

      syncStore.addPendingFollowup(followupData)
      $q.loading.hide()

      // Visual updates same as online
      vistaHistorial.value = true
      if (sesionActual.value) sesionActual.value.cumplido = true

      // Local storage update for the session list (optimistic)
      const sIdx = sesiones.value.findIndex((s) => s.id === followupData.cronograma_id)
      if (sIdx !== -1) {
        sesiones.value[sIdx].seguimiento_id = 'temp-' + Date.now()
        sesiones.value[sIdx].cumplido = true
        console.log('Optimistic update for session list offline')
      }

      $q.notify({
        type: 'info',
        message: 'Seguimiento guardado localmente. Se sincronizará cuando haya conexión.',
        icon: 'cloud_off',
      })

      // Refresh data to ensure sync
      await fetchSesiones()

      // Re-select the same session in completed view
      const currentSessionDate = fechaSeguimiento.value
      await new Promise((resolve) => setTimeout(resolve, 100)) // Wait for next tick
      fechaSeguimiento.value = currentSessionDate

      return
    }

    // Logic for ONLINE mode
    const formData = new FormData()
    const isCumplido =
      estadoCumplimiento.value === 'TOTAL' || estadoCumplimiento.value === 'PARCIAL'
    formData.append('tema_cumplido', isCumplido ? 'true' : 'false')
    formData.append('observaciones', observacionesClase.value || '')

    console.log(
      'Saving seguimiento - cronograma_id:',
      sesionActual.value.cronograma_id || sesionActual.value.id,
      'grupo_id:',
      grupoSeleccionado.value,
      'estado:',
      estadoCumplimiento.value,
    )

    // Send identifiers for the seguimientos table
    formData.append(
      'cronograma_id',
      sesionActual.value.cronograma_id || sesionActual.value.id || '',
    )
    formData.append('grupo_id', grupoSeleccionado.value || '')
    formData.append('asignatura_id', materiaSeleccionada.value || '')
    formData.append('numero_sesion', sesionActual.value.numero_sesion || '')
    formData.append('fecha', sesionActual.value.fecha || '')
    formData.append('estado_cumplimiento', estadoCumplimiento.value || 'NO')

    const pedagogicoData = {
      estrategias: pedagogico.value.estrategias,
      evaluacion: pedagogico.value.evaluacion,
      secuencia: pedagogico.value.secuencia,
      integracion: pedagogico.value.integracion,
      estado_cumplimiento: estadoCumplimiento.value,
      es_examen: esExamen.value,
      tipo_examen: tipoExamen.value,
    }

    // Capturar ubicación si no existe y si el GPS está habilitado por el docente
    if (habilitarGps.value) {
      if (!coordenadas.value) {
        await capturarUbicacion()
      }
      pedagogicoData.georeferencia = coordenadas.value
    } else {
      pedagogicoData.georeferencia = null
    }

    // Add integración transversal status (without files)
    const integracionData = {
      investigacion: {
        cumplido: integracionTransversal.value.investigacion.cumplido,
        evidencia:
          typeof integracionTransversal.value.investigacion.evidencia === 'string'
            ? integracionTransversal.value.investigacion.evidencia
            : null,
      },
      interaccion: {
        cumplido: integracionTransversal.value.interaccion.cumplido,
        evidencia:
          typeof integracionTransversal.value.interaccion.evidencia === 'string'
            ? integracionTransversal.value.interaccion.evidencia
            : null,
      },
      internalizacion: {
        cumplido: integracionTransversal.value.internalizacion.cumplido,
        evidencia:
          typeof integracionTransversal.value.internalizacion.evidencia === 'string'
            ? integracionTransversal.value.internalizacion.evidencia
            : null,
      },
    }

    formData.append('pedagogico', JSON.stringify(pedagogicoData))
    formData.append('integracion_transversal', JSON.stringify(integracionData))

    // Add existing evidence paths to preserve them in backend
    // Add existing evidence paths to preserve them in backend
    const existingEvidencias = {}
    if (typeof evidencias.value?.aprendizaje_activo === 'string')
      existingEvidencias.aprendizaje_activo = evidencias.value.aprendizaje_activo
    if (typeof evidencias.value?.evaluacion_formativa === 'string')
      existingEvidencias.evaluacion_formativa = evidencias.value.evaluacion_formativa
    if (typeof evidencias.value?.secuencia_didactica === 'string')
      existingEvidencias.secuencia_didactica = evidencias.value.secuencia_didactica
    formData.append('evidencias', JSON.stringify(existingEvidencias))

    // Add evidence files
    if (
      evidencias.value.aprendizaje_activo &&
      typeof evidencias.value.aprendizaje_activo !== 'string'
    ) {
      formData.append('evidencia_aprendizaje', evidencias.value.aprendizaje_activo)
    }
    if (
      evidencias.value.evaluacion_formativa &&
      typeof evidencias.value.evaluacion_formativa !== 'string'
    ) {
      formData.append('evidencia_evaluacion', evidencias.value.evaluacion_formativa)
    }
    if (
      evidencias.value.secuencia_didactica &&
      typeof evidencias.value.secuencia_didactica !== 'string'
    ) {
      formData.append('evidencia_secuencia', evidencias.value.secuencia_didactica)
    }

    // Add integración transversal evidence files
    if (
      integracionTransversal.value.investigacion.evidencia &&
      typeof integracionTransversal.value.investigacion.evidencia !== 'string'
    ) {
      formData.append(
        'evidencia_investigacion',
        integracionTransversal.value.investigacion.evidencia,
      )
    }
    if (
      integracionTransversal.value.interaccion.evidencia &&
      typeof integracionTransversal.value.interaccion.evidencia !== 'string'
    ) {
      formData.append('evidencia_interaccion', integracionTransversal.value.interaccion.evidencia)
    }
    if (
      integracionTransversal.value.internalizacion.evidencia &&
      typeof integracionTransversal.value.internalizacion.evidencia !== 'string'
    ) {
      formData.append(
        'evidencia_internalizacion',
        integracionTransversal.value.internalizacion.evidencia,
      )
    }

    await planificacionSemestralService.saveSeguimiento(formData)

    // Mostrar diálogo de éxito prominente
    $q.dialog({
      title: '✅ ¡Seguimiento Registrado!',
      message: `El seguimiento de la sesión ha sido guardado correctamente en el sistema.`,
      html: true,
      ok: {
        label: 'Entendido',
        color: 'positive',
        unelevated: true,
        size: 'md',
      },
      persistent: false,
    })

    if (!estadoCumplimiento.value) {
      $q.notify({
        type: 'warning',
        message: 'Recuerda seleccionar el estado de cumplimiento (Total, Parcial o No)',
      })
    }

    // Store current session date before reload
    const currentSessionDate = fechaSeguimiento.value

    console.log('Before reload - currentSessionDate:', currentSessionDate)

    // Refresh data to ensure sync
    await fetchSesiones()

    console.log('After reload - sessions:', sesiones.value.length)

    // Update sesionActual.cumplido to trigger readonly mode immediately
    // Sessions are always marked as completed when follow-up is saved
    if (sesionActual.value) {
      sesionActual.value.cumplido = true
      console.log('Updated sesionActual.cumplido to: true, esLecturaSola:', esLecturaSola.value)
    }

    // Always switch to completed view since session is now completed
    console.log('Switching to completed view')
    vistaHistorial.value = true
    // Wait for next tick to ensure sesionesOptions is updated
    await new Promise((resolve) => setTimeout(resolve, 100))
    // Re-select the same session in completed view
    fechaSeguimiento.value = currentSessionDate

    console.log(
      'Final state - vistaHistorial:',
      vistaHistorial.value,
      'fechaSeguimiento:',
      fechaSeguimiento.value,
    )
  } catch (error) {
    console.error('Error saving follow-up:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al guardar el seguimiento',
    })
  }
}

const guardarAsistencia = () => {
  $q.notify({
    type: 'info',
    message: 'Asistencia guardada localmente',
  })
}

// --- Watchers for interactivity ---
watch(materiaSeleccionada, () => {
  grupoSeleccionado.value = null
  sesiones.value = []
  fechaSeguimiento.value = null
})

watch(grupoSeleccionado, async (newVal) => {
  if (newVal) {
    fetchSesiones()
    await refreshCacheStatus()
  } else {
    sesiones.value = []
    fechaSeguimiento.value = null
    await refreshCacheStatus()
  }
})

watch(fechaSeguimiento, () => {
  actualizarSesionPorFecha()
})

watch(vistaHistorial, () => {
  // Reset selection when switching views to avoid "session not found" errors
  if (sesionesOptions.value.length > 0) {
    fechaSeguimiento.value = sesionesOptions.value[0].value
  } else {
    fechaSeguimiento.value = null
  }
})

onMounted(async () => {
  await fetchData()
  await refreshCacheStatus()
})

const mostrarGuia = ref(false)
const descargarApk = () => {
  // Priorizar el origen actual, pero asegurar que sea el de producción si no es localhost
  let baseUrl = window.location.origin

  // Si estamos en la App (Capacitor) o el navegador no reporta el dominio correcto
  if (baseUrl.includes('localhost')) {
    // Si el puerto es el de Vite (5173 o similar) pero la API está en 8000
    if (!baseUrl.includes(':8000')) {
      baseUrl = 'http://localhost:8000'
    }
  } else if (baseUrl.includes('unitepc.edu.bo')) {
    // Estamos en el servidor oficial
    baseUrl = 'https://planificacion.unitepc.edu.bo'
  } else {
    // Fallback seguro al servidor de producción si no estamos en local
    baseUrl = 'https://planificacion.unitepc.edu.bo'
  }

  window.open(`${baseUrl}/descargas/planificacion.apk`, '_blank')
}
</script>

<style scoped>
.clase-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1976d2;
  margin: 0;
  display: flex;
  align-items: center;
}

.page-subtitle {
  color: #666;
  margin: 8px 0 0 0;
  font-size: 0.95rem;
}

.main-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Planificación del Día Styles */
.planificacion-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0e0e0;
}

.info-card {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  border: none !important;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.info-card .text-caption {
  color: rgba(255, 255, 255, 0.9);
}

.info-card .text-body1 {
  color: white;
  font-size: 1.1rem;
}

.content-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
  height: 100%;
  background: #fafafa;
}

.content-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.content-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #546e7a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.content-text {
  min-height: 40px;
  color: #424242;
  white-space: pre-wrap;
  line-height: 1.5;
  font-size: 0.95rem;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .planificacion-container {
    padding: 16px;
  }
}

.selected-materia {
  line-height: 1.2;
}
.selected-materia-label {
  font-weight: 500;
}
.selected-materia-sublabel {
  margin-top: 2px;
  line-height: 1.1;
  opacity: 0.8;
}
</style>
