<template>
  <q-page class="planificacion-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <q-btn flat round icon="arrow_back" @click="$router.back()" class="q-mr-sm" />
        <div class="header-info">
          <h1 class="page-title">
            <q-icon name="calendar_month" color="indigo" class="q-mr-sm" />
            Horario y Planificación Semestral
          </h1>
          <p class="page-subtitle">
            <q-chip size="sm" color="primary" text-color="white">{{ asignatura?.codigo }}</q-chip>
            {{ asignatura?.nombre }} |
            {{ asignatura?.carrera?.nombre || asignatura?.carrera || 'Carrera' }}
          </p>
        </div>
      </div>
      <div class="header-actions">
        <q-select v-model="grupoSeleccionado" :options="gruposOptions" outlined dense label="Grupo/Materia"
          class="q-mr-sm" style="min-width: 200px" option-label="label" option-value="value"
          @update:model-value="cargarPlanificacion" />

        <q-select v-model="gestionSeleccionada" :options="gestionesOptions" outlined dense label="Gestión" emit-value
          map-options style="min-width: 150px" />
        <q-btn outline color="primary" icon="content_copy" label="Copiar Gestión" no-caps
          @click="showCopiarDialog = true" />
        <q-btn outline color="green" icon="picture_as_pdf" label="Exportar PDF" no-caps @click="exportarPDF" />

        <!-- Auto-save Status Indicator -->
        <transition name="fade">
          <div v-if="saveStatus !== 'idle'" class="auto-save-indicator q-ml-sm">
            <q-chip :color="saveStatus === 'saving' ? 'blue-1' : saveStatus === 'saved' ? 'green-1' : 'red-1'
              " :text-color="saveStatus === 'saving' ? 'blue-8' : saveStatus === 'saved' ? 'green-8' : 'red-8'
                " size="md" dense class="q-px-md">
              <q-spinner-dots v-if="saveStatus === 'saving'" size="14px" class="q-mr-sm" />
              <q-icon v-else-if="saveStatus === 'saved'" name="cloud_done" size="16px" class="q-mr-sm" />
              <q-icon v-else-if="saveStatus === 'error'" name="cloud_off" size="16px" class="q-mr-sm" />
              {{
                saveStatus === 'saving'
                  ? 'Guardando...'
                  : saveStatus === 'saved'
                    ? 'Guardado'
                    : 'Error al guardar'
              }}
            </q-chip>
          </div>
        </transition>
      </div>
    </div>

    <!-- Tabs -->
    <q-card class="main-card">
      <q-tabs v-model="tabActual" dense class="text-grey" active-color="indigo" indicator-color="indigo" align="left">
        <q-tab name="horario" icon="schedule" label="1. Configurar Horario" no-caps />
        <q-tab name="planificacion" icon="view_timeline" label="2. Planificación por Unidades" no-caps
          :disable="!planificacionGenerada" />
        <q-tab name="preview" icon="visibility" label="3. Vista Previa" no-caps :disable="!planificacionGenerada" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tabActual" animated>
        <!-- TAB 1: HORARIO -->
        <q-tab-panel name="horario" class="q-pa-lg">
          <div class="row q-col-gutter-lg">
            <!-- Calendario Académico -->
            <div class="col-12 col-md-3">
              <q-card flat bordered class="config-card">
                <q-card-section>
                  <div class="text-h6 q-mb-md">
                    <q-icon name="event" color="indigo" class="q-mr-sm" />
                    Calendario Académico
                  </div>
                  <div class="q-gutter-md">
                    <q-input v-model="calendario.fechaInicio" outlined dense label="Inicio de Clases" type="date" />
                    <q-input v-model="calendario.fechaFin" outlined dense label="Fin de Clases" type="date" />
                  </div>
                  <q-banner class="bg-blue-1 text-blue-9 q-mt-md" rounded dense>
                    <strong>{{ totalSemanas }} semanas</strong> académicas
                  </q-banner>
                </q-card-section>
              </q-card>
            </div>

            <!-- Períodos de Exámenes -->
            <div class="col-12 col-md-3">
              <q-card flat bordered class="config-card">
                <q-card-section>
                  <div class="text-h6 q-mb-md">
                    <q-icon name="assignment" color="orange" class="q-mr-sm" />
                    Períodos de Exámenes
                  </div>
                  <div class="examenes-grid">
                    <div class="examen-item">
                      <q-chip color="blue-2" text-color="blue-9" size="sm">1er Parcial</q-chip><span>Sem 7-8</span>
                    </div>
                    <div class="examen-item">
                      <q-chip color="orange-2" text-color="orange-9" size="sm">2do Parcial</q-chip><span>Sem
                        14-15</span>
                    </div>
                    <div class="examen-item">
                      <q-chip color="purple-2" text-color="purple-9" size="sm">Final</q-chip><span>Sem 18-19</span>
                    </div>
                    <div class="examen-item">
                      <q-chip color="red-2" text-color="red-9" size="sm">2da Inst.</q-chip><span>Sem 20</span>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Unidades de Aprendizaje -->
            <div class="col-12 col-md-3">
              <q-card flat bordered class="config-card">
                <q-card-section>
                  <div class="text-h6 q-mb-md">
                    <q-icon name="folder" color="purple" class="q-mr-sm" />
                    Unidades de Aprendizaje
                  </div>
                  <div v-if="unidadesDocumentacion.length" class="unidades-preview">
                    <div v-for="unidad in unidadesDocumentacion" :key="unidad.id" class="unidad-preview-item">
                      <q-avatar color="indigo" text-color="white" size="24px">{{
                        unidad.numero
                      }}</q-avatar>
                      <div class="unidad-preview-info">
                        <span class="unidad-preview-titulo">{{ unidad.titulo }}</span>
                        <span class="unidad-preview-temas">{{ unidad.temas?.length || 0 }} temas</span>
                      </div>
                    </div>
                  </div>
                  <q-banner v-else class="bg-orange-1 text-orange-9" rounded dense>
                    <q-icon name="warning" class="q-mr-sm" />
                    No hay unidades en Documentación
                  </q-banner>
                </q-card-section>
              </q-card>
            </div>

            <!-- Exámenes Programados -->
            <div class="col-12 col-md-3">
              <q-card flat bordered class="config-card">
                <q-card-section>
                  <div class="text-h6 q-mb-md">
                    <q-icon name="event_available" color="red" class="q-mr-sm" />
                    Exámenes
                  </div>
                  <div v-if="fechasExamenes.length" class="q-gutter-y-xs">
                    <div v-for="examen in fechasExamenes" :key="examen.id"
                      class="row items-center justify-between q-pa-xs bg-grey-1 rounded-borders">
                      <div class="text-caption text-weight-bold">{{ examen.tipoExamen }}</div>
                      <q-chip size="xs" color="indigo" text-color="white" icon="event">{{
                        examen.fecha
                      }}</q-chip>
                    </div>
                  </div>
                  <div v-else class="text-caption text-grey-6 q-pa-sm text-center">
                    <q-icon name="info" class="q-mr-xs" />
                    Sin fechas generadas
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Horario de Clases -->
            <div class="col-12">
              <q-card flat bordered class="config-card">
                <q-card-section>
                  <div class="row items-center justify-between q-mb-md">
                    <div class="text-h6">
                      <q-icon name="schedule" color="green" class="q-mr-sm" />
                      Horario de Clases Semanal
                    </div>
                    <q-btn unelevated color="green" icon="add" label="Agregar Sesión" no-caps size="sm"
                      @click="agregarHorario" />
                  </div>

                  <div v-if="!horarios.length" class="text-center q-pa-lg">
                    <q-icon name="schedule" size="48px" color="grey-4" />
                    <p class="text-grey-6 q-mt-md">
                      No hay horarios. Agrega las sesiones de clase semanales.
                    </p>
                  </div>

                  <div v-else class="horarios-grid">
                    <div v-for="(horario, idx) in horariosOrdenados" :key="idx" class="horario-card"
                      :class="{ 'horario-api': horario.desdeAPI }">
                      <q-chip v-if="horario.desdeAPI" color="blue-2" text-color="blue-9" size="xs" dense
                        class="api-badge">API</q-chip>
                      <div class="horario-dia">
                        <q-icon name="event" class="q-mr-xs" />{{ horario.dia }}
                      </div>
                      <div class="horario-hora">
                        {{ horario.horaInicio }} - {{ horario.horaFin }}
                      </div>
                      <div class="horario-aula">
                        {{ horario.aula }}
                        <span v-if="horario.grupo">(Grupo {{ horario.grupo }})</span>
                      </div>
                      <q-btn v-if="!horario.desdeAPI" flat round dense icon="close" size="xs" color="red"
                        class="delete-btn" @click="eliminarHorario(horario)" />
                      <q-icon v-else name="lock" size="14px" color="blue" class="lock-icon">
                        <q-tooltip>Horario de la API (no editable)</q-tooltip>
                      </q-icon>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Botón Generar -->
            <div class="col-12 text-center">
              <q-btn unelevated color="indigo" icon="auto_awesome" label="Generar Planificación Automática" size="lg"
                no-caps @click="generarPlanificacion" />
              <p class="text-grey-6 q-mt-sm text-caption">
                Se distribuirán {{ totalTemasDocumentacion }} temas de
                {{ unidadesDocumentacion.length }} unidades en {{ totalSemanas }} semanas
              </p>
            </div>
          </div>
        </q-tab-panel>

        <!-- TAB 2: PLANIFICACIÓN -->
        <q-tab-panel name="planificacion" class="q-pa-lg">
          <!-- Resumen -->
          <div class="planificacion-resumen q-mb-lg">
            <div class="resumen-item">
              <q-icon name="folder" size="24px" color="indigo" />
              <span class="resumen-value">{{ planificacion.length }}</span>
              <span class="resumen-label">Unidades</span>
            </div>
            <div class="resumen-item">
              <q-icon name="event" size="24px" color="green" />
              <span class="resumen-value">{{ totalSesionesGeneradas }}</span>
              <span class="resumen-label">Sesiones</span>
            </div>
            <div class="resumen-item">
              <q-icon name="assignment" size="24px" color="orange" />
              <span class="resumen-value">4</span>
              <span class="resumen-label">Exámenes</span>
            </div>
            <div class="resumen-item">
              <q-icon name="check_circle" size="24px" color="green" />
              <span class="resumen-value">{{ progresoTotal }}%</span>
              <span class="resumen-label">Completado</span>
            </div>
          </div>

          <!-- Unidades -->
          <div class="unidades-container">
            <div v-for="(unidad, uIdx) in planificacion" :key="unidad.id" class="unidad-section">
              <div class="unidad-header" :class="{ collapsed: unidad.collapsed }">
                <div class="unidad-toggle" @click="unidad.collapsed = !unidad.collapsed">
                  <q-icon :name="unidad.collapsed ? 'expand_more' : 'expand_less'" size="24px" />
                </div>
                <div class="unidad-info" @click="editarUnidad(unidad)">
                  <h2 class="unidad-titulo">UNIDAD {{ uIdx + 1 }}: {{ unidad.nombre }}</h2>
                  <p class="unidad-competencia" v-if="!unidad.collapsed">
                    <strong>ELEMENTO DE COMPETENCIA:</strong>
                    {{ unidad.elementoCompetencia || 'Clic para editar...' }}
                  </p>
                </div>
                <div class="unidad-actions">
                  <q-btn flat round dense icon="edit" size="sm" @click.stop="editarUnidad(unidad)">
                    <q-tooltip>Editar Unidad</q-tooltip>
                  </q-btn>
                  <q-btn flat round dense icon="add" size="sm" @click.stop="agregarSesionManual(unidad)">
                    <q-tooltip>Agregar Sesión</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <div v-if="!unidad.collapsed" class="sesiones-table-container">
                <table class="sesiones-table">
                  <thead>
                    <tr>
                      <th style="width: 70px">SEM</th>
                      <th style="width: 70px">SESIÓN</th>
                      <th style="width: 140px" class="bg-grey-1 text-grey-8">FECHAS / GRUPOS</th>
                      <th style="width: 250px">TEMAS</th>
                      <th>CONTENIDO</th>
                      <th>CONCEPTUAL</th>
                      <th>PROCEDIMENTAL</th>
                      <th>ACTITUDINAL</th>
                      <th>CRITERIOS</th>
                      <th>INSTRUMENTOS</th>
                      <th style="width: 50px">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="sesion in unidad.sesiones" :key="sesion.id">
                      <!-- Fila de EXAMEN -->
                      <tr v-if="sesion.esExamen" class="sesion-examen-row">
                        <td class="cell-semana" :rowspan="getSemanaRowspan(unidad, sesion)"
                          v-if="isFirstSesionOfSemana(unidad, sesion)">
                          <div class="semana-content">
                            <span class="semana-numero">{{ sesion.semana }}</span>
                            <span class="semana-fechas">{{ sesion.semanaFechas }}</span>
                            <q-chip v-if="sesion.periodoExamen" :color="getExamenColor(sesion.periodoExamen)"
                              text-color="white" size="xs" dense class="q-mt-xs">
                              {{ sesion.periodoExamen }}
                            </q-chip>
                          </div>
                        </td>
                        <td class="cell-sesion">
                          <div class="sesion-content">
                            <span class="sesion-numero">SESIÓN {{ sesion.numeroGlobal }}</span>
                            <!-- <span class="sesion-dia">{{ sesion.dia }}</span> -->
                            <span class="sesion-fecha">{{ sesion.tipoClase || 'Clase' }}</span>
                          </div>
                        </td>
                        <td class="cell-fechas bg-grey-1">
                          <div v-for="(fg, idx) in getFechasGrupos(sesion.numeroGlobal)" :key="idx"
                            class="fecha-grupo-row">
                            <div class="fg-grupo">{{ fg.grupo }}</div>
                            <div class="fg-fecha">{{ fg.fecha }}</div>
                          </div>
                        </td>
                        <td colspan="6" class="examen-cell">
                          <div class="examen-banner">
                            <q-icon name="assignment" size="24px" class="q-mr-sm" />
                            <span class="examen-titulo">{{ sesion.tipoExamen }}</span>
                          </div>
                        </td>
                        <td class="cell-actions">
                          <q-icon name="lock" size="sm" color="grey-5">
                            <q-tooltip>Sesión reservada para examen</q-tooltip>
                          </q-icon>
                        </td>
                      </tr>
                      <!-- Fila NORMAL -->
                      <tr v-else :class="getSesionRowClass(sesion)">
                        <td class="cell-semana" :rowspan="getSemanaRowspan(unidad, sesion)"
                          v-if="isFirstSesionOfSemana(unidad, sesion)">
                          <div class="semana-content">
                            <span class="semana-numero">{{ sesion.semana }}</span>
                            <span class="semana-fechas">{{ sesion.semanaFechas }}</span>
                            <q-chip v-if="sesion.periodoExamen" :color="getExamenColor(sesion.periodoExamen)"
                              text-color="white" size="xs" dense class="q-mt-xs">
                              {{ sesion.periodoExamen }}
                            </q-chip>
                          </div>
                        </td>
                        <td class="cell-sesion">
                          <div class="sesion-content">
                            <span class="sesion-numero">SESIÓN {{ sesion.numeroGlobal }}</span>
                            <!-- <span class="sesion-dia">{{ sesion.dia }}</span> -->
                            <span class="sesion-fecha">{{ sesion.tipoClase || 'Clase' }}</span>
                          </div>
                        </td>
                        <td class="cell-fechas bg-grey-1">
                          <div v-for="(fg, idx) in getFechasGrupos(sesion.numeroGlobal)" :key="idx"
                            class="fecha-grupo-row">
                            <div class="fg-grupo">{{ fg.grupo }}</div>
                            <div class="fg-fecha">{{ fg.fecha }}</div>
                          </div>
                        </td>
                        <td>
                          <div v-if="sesion.semana <= 17">
                            <q-select v-model="sesion.temasSeleccionados" :options="opcionesTemasGlobales" multiple
                              use-chips use-input new-value-mode="add-unique" emit-value map-options dense outlined
                              class="cell-input" label="Temas" option-value="value" option-label="label"
                              @update:model-value="(val) => onTemaUpdate(val, sesion)" />
                          </div>
                          <div v-else class="text-caption text-grey text-center">--</div>
                        </td>
                        <td>
                          <div v-if="sesion.semana <= 17">
                            <!-- Select múltiple de contenido_items -->
                            <q-select v-model="sesion.contenido_items_seleccionados"
                              :options="getContenidoItemsOptions(sesion)" multiple use-chips emit-value map-options
                              dense outlined class="cell-input" label="Contenido" option-value="value"
                              option-label="label" :disable="!sesion.temasSeleccionados || sesion.temasSeleccionados.length === 0
                                " :hint="!sesion.temasSeleccionados || sesion.temasSeleccionados.length === 0
                                  ? 'Seleccione tema(s) primero'
                                  : ''
                                " @update:model-value="marcarModificado(sesion)" />
                          </div>
                          <div v-else class="text-caption text-grey text-center">--</div>
                        </td>
                        <td>
                          <q-input v-if="sesion.semana <= 17" v-model="sesion.conceptual" outlined dense type="textarea"
                            autogrow class="cell-input" placeholder="Contenidos..."
                            @update:model-value="marcarModificado(sesion)" />
                        </td>
                        <td>
                          <q-input v-if="sesion.semana <= 17" v-model="sesion.procedimental" outlined dense
                            type="textarea" autogrow class="cell-input" placeholder="Habilidades..."
                            @update:model-value="marcarModificado(sesion)" />
                        </td>
                        <td>
                          <q-input v-if="sesion.semana <= 17" v-model="sesion.actitudinal" outlined dense
                            type="textarea" autogrow class="cell-input" placeholder="Actitudes..."
                            @update:model-value="marcarModificado(sesion)" />
                        </td>
                        <td>
                          <q-select v-if="sesion.semana <= 17" v-model="sesion.criteriosSeleccionados" multiple
                            use-chips use-input new-value-mode="add-unique" :options="criteriosOptions" outlined dense
                            class="cell-input" placeholder="Criterios..."
                            @update:model-value="marcarModificado(sesion)" />
                        </td>
                        <td>
                          <q-select v-if="sesion.semana <= 17" v-model="sesion.instrumentosSeleccionados" multiple
                            use-chips use-input new-value-mode="add-unique" :options="instrumentosOptions" outlined
                            dense class="cell-input" placeholder="Instrumentos..."
                            @update:model-value="marcarModificado(sesion)" />
                        </td>
                        <td class="cell-actions">
                          <q-btn flat round dense icon="delete" size="xs" color="red"
                            @click="eliminarSesion(unidad, sesion)" />
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </q-tab-panel>

        <!-- TAB 3: VISTA PREVIA -->
        <q-tab-panel name="preview" class="q-pa-lg">
          <div class="preview-container">
            <div class="preview-header">
              <div class="preview-logo">
                <q-icon name="school" size="48px" color="indigo" />
              </div>
              <div class="preview-title">
                <h2>UNIVERSIDAD TÉCNICA PRIVADA COSMOS</h2>
                <h3>UNITEPC</h3>
              </div>
            </div>

            <div class="preview-info q-mb-lg">
              <div class="info-row">
                <strong>Asignatura:</strong> {{ asignatura?.nombre }}
                <strong class="q-ml-lg">Código:</strong> {{ asignatura?.codigo }}
              </div>
              <div class="info-row">
                <strong>Gestión:</strong> {{ gestionSeleccionada }}
                <strong class="q-ml-lg">Semestre:</strong> {{ asignatura?.semestre }}°
              </div>
            </div>

            <div v-for="(unidad, uIdx) in planificacion" :key="unidad.id" class="preview-unidad">
              <div class="preview-unidad-header">UNIDAD {{ uIdx + 1 }}: {{ unidad.nombre }}</div>
              <div class="preview-competencia">
                <strong>ELEMENTO DE COMPETENCIA {{ uIdx + 1 }}:</strong>
                {{ unidad.elementoCompetencia }}
              </div>
              <table class="preview-table">
                <thead>
                  <tr>
                    <th rowspan="2">SEMANAS</th>
                    <th rowspan="2">SESIONES</th>
                    <th rowspan="2" style="width: 140px">FECHAS / GRUPOS</th>
                    <th rowspan="2">TEMAS</th>
                    <th rowspan="2">CONTENIDO</th>
                    <th colspan="3">APRENDIZAJES</th>
                    <th rowspan="2">CRITERIOS DE DESEMPEÑO</th>
                    <th rowspan="2">INSTRUMENTOS DE EVALUACIÓN</th>
                  </tr>
                  <tr>
                    <th>CONCEPTUAL</th>
                    <th>PROCEDIMENTAL</th>
                    <th>ACTITUDINAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sesion in unidad.sesiones" :key="sesion.id">
                    <td class="text-center">
                      {{ sesion.semana }}<br /><small>{{ sesion.semanaFechas }}</small>
                    </td>
                    <td class="text-center">
                      SESIÓN {{ sesion.numeroGlobal }}<br /><small>{{
                        sesion.tipoClase || 'Clase'
                      }}</small>
                    </td>
                    <td class="cell-fechas bg-grey-1">
                      <div v-for="(fg, idx) in getFechasGrupos(sesion.numeroGlobal)" :key="idx" class="fecha-grupo-row">
                        <div class="fg-grupo">{{ fg.grupo }}</div>
                        <div class="fg-fecha">{{ fg.fecha }}</div>
                      </div>
                    </td>
                    <td>{{ sesion.tema }}</td>
                    <td>
                      <div class="preview-content">{{ resolveContenido(sesion) }}</div>
                    </td>
                    <td>
                      <div class="preview-content">{{ sesion.conceptual }}</div>
                    </td>
                    <td>
                      <div class="preview-content">{{ sesion.procedimental }}</div>
                    </td>
                    <td>
                      <div class="preview-content">{{ sesion.actitudinal }}</div>
                    </td>
                    <td>
                      <div class="preview-content">{{ sesion.criteriosDesempeno }}</div>
                    </td>
                    <td>
                      <div class="preview-content">{{ sesion.instrumentosEvaluacion }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Dialog Horario -->
    <q-dialog v-model="showHorarioDialog">
      <q-card class="dialog-card" style="min-width: 400px">
        <div class="dialog-header bg-green">
          <h3><q-icon name="schedule" class="q-mr-sm" /> Agregar Sesión de Clase</h3>
        </div>
        <q-card-section class="q-gutter-md">
          <q-select v-model="horarioForm.dia" :options="diasOptions" outlined label="Día" emit-value map-options />
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model="horarioForm.horaInicio" outlined label="Hora Inicio" type="time" />
            </div>
            <div class="col-6">
              <q-input v-model="horarioForm.horaFin" outlined label="Hora Fin" type="time" />
            </div>
          </div>
          <q-input v-model="horarioForm.aula" outlined label="Aula" placeholder="Ej: Aula 301" />
        </q-card-section>
        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" @click="showHorarioDialog = false" />
          <q-btn unelevated color="green" label="Agregar" @click="confirmarHorario" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Editar Unidad -->
    <q-dialog v-model="showUnidadDialog" persistent>
      <q-card class="dialog-card" style="min-width: 600px">
        <div class="dialog-header">
          <h3><q-icon name="edit" class="q-mr-sm" /> Editar Unidad</h3>
        </div>
        <q-card-section class="q-gutter-md">
          <q-input v-model="unidadForm.nombre" outlined label="Nombre de la Unidad" />
          <q-input v-model="unidadForm.elementoCompetencia" outlined type="textarea" rows="4"
            label="Elemento de Competencia"
            hint="Describe la competencia que el estudiante desarrollará en esta unidad" />
        </q-card-section>
        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" @click="showUnidadDialog = false" />
          <q-btn unelevated color="indigo" label="Guardar" @click="guardarUnidad" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Copiar Gestión -->
    <q-dialog v-model="showCopiarDialog">
      <q-card class="dialog-card" style="width: 100%; max-width: 400px">
        <div class="dialog-header bg-primary">
          <h3><q-icon name="content_copy" class="q-mr-sm" /> Copiar Planificación</h3>
        </div>
        <q-card-section>
          <p>Selecciona la gestión de origen:</p>
          <q-select v-model="gestionACopiar" :options="gestionesAnteriores" outlined label="Gestión origen" emit-value
            map-options class="q-mb-md" />
          <q-banner class="bg-orange-1 text-orange-9" rounded dense>
            <q-icon name="warning" class="q-mr-sm" />
            Esto reemplazará la planificación actual.
          </q-banner>
        </q-card-section>
        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" @click="showCopiarDialog = false" />
          <q-btn unelevated color="primary" label="Copiar" @click="ejecutarCopia" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAsignaturasStore } from 'src/stores/asignaturas'
import { useRolExamenesStore } from 'src/stores/rolExamenes'
import planificacionSemestralService from 'src/services/planificacionSemestralService'

const route = useRoute()
const $q = useQuasar()
const asignaturasStore = useAsignaturasStore()
const rolExamenesStore = useRolExamenesStore()

const guardando = ref(false)
const tabActual = ref('horario')
const gestionSeleccionada = ref('2026-I')
const showHorarioDialog = ref(false)
const showUnidadDialog = ref(false)
const showCopiarDialog = ref(false)
const planificacionGenerada = ref(false)
// const guardando = ref(false) // Ya no se usa guardando manual, usamos saveStatus
const saveStatus = ref('idle') // 'idle' | 'saving' | 'saved' | 'error'
let dataLoaded = false
let lastSavedSnapshot = ''

const gestionACopiar = ref(null)
const unidadEditando = ref(null)
const grupoSeleccionado = ref(null) // { label, value, tipo }

// Computed para extraer fechas de exámenes de la planificación generada o del rol oficial
const fechasExamenes = computed(() => {
  // 1. Prioridad: Rol de Exámenes Oficial (cargado desde Admin)
  if (examenesRol.value.length > 0) {
    let oficiales = examenesRol.value

    // Filtrar por grupo si no es "ALL" y si el objeto tiene propiedad 'grupo'
    // Ojo: el string de grupo puede variar ("1", "Grupo 1"). Haremos un match simple.
    if (grupoSeleccionado.value && grupoSeleccionado.value.value !== 'ALL') {
      // Intentar filtrar. Si no hay propiedad grupo, mostramos todo.
      // Asumimos que `experiencia` nos dirá si existe campo grupo.
      // En la captura se ve columna "Grupo".
      oficiales = oficiales.filter(
        (e) =>
          e.grupo == grupoSeleccionado.value.nombre || e.grupo == grupoSeleccionado.value.value,
      )
    }

    // Si después del filtro nos quedamos sin nada (quizás por mismatch de string),
    // podríamos optar por mostrar todos o nada. Mostremos todos los de la materia como fallback o nada.
    // Mejor mostrar los filtrados si match, si no hubo match exacto quizas el user quiere ver algo.
    // Pero "Grupo 1" vs "1".
    // Vamos a mapear y retornar.

    // Ordenar por fecha antes de formatear
    oficiales.sort(
      (a, b) => new Date(a.fecha_examen || a.fecha) - new Date(b.fecha_examen || b.fecha),
    )

    // Map to display format
    return oficiales.map((e) => {
      const rawDate = e.fecha_examen || e.fecha
      let formattedDate = 'Sin fecha'
      if (rawDate && typeof rawDate === 'string') {
        // Asegurar que solo tomamos la parte de la fecha (YYYY-MM-DD)
        // manejando formatos ISO como "2026-03-24T00:00:00.000Z"
        const datePart = rawDate.split('T')[0]
        const parts = datePart.split('-')

        if (parts.length === 3) {
          formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`
        } else {
          formattedDate = datePart
        }
      }
      return {
        id: e.id,
        tipoExamen: e.tipo_examen || e.tipo,
        fecha: formattedDate,
      }
    })
  }

  // 2. Si no hay rol oficial, NO MOSTRAR NADA (A pedido del usuario)
  return []
})

const gestionesOptions = [
  { label: 'Gestión 2026-I', value: '2026-I' },
  { label: 'Gestión 2025-II', value: '2025-II' },
  { label: 'Gestión 2025-I', value: '2025-I' },
]

const gruposOptions = computed(() => {
  // Solo mostramos una opción general, no por grupos individuales
  return [
    {
      label: 'PLANIFICACIÓN GENERAL',
      value: 'ALL',
      tipo: 'TEORICO-PRACTICO',
    },
  ]
})

const gestionesAnteriores = [
  { label: 'Gestión 2025-II', value: '2025-II' },
  { label: 'Gestión 2025-I', value: '2025-I' },
]

const diasOptions = [
  { label: 'Lunes', value: 'Lunes' },
  { label: 'Martes', value: 'Martes' },
  { label: 'Miércoles', value: 'Miércoles' },
  { label: 'Jueves', value: 'Jueves' },
  { label: 'Viernes', value: 'Viernes' },
  { label: 'Sábado', value: 'Sábado' },
]

const asignatura = computed(() => asignaturasStore.asignaturaActual)

// Horarios desde API externa
const horariosAPI = ref([])

// Exámenes cargados del rol (Director de Carrera)
const examenesRol = ref([])

onMounted(async () => {
  const id = parseInt(route.params.id)

  // Extract params
  const params = {}
  if (route.query.docente_id) params.docente_id = route.query.docente_id

  // IMPORTANTE: Esperar a que se cargue la asignatura antes de buscar horarios
  await asignaturasStore.setAsignaturaActual(id, params)

  // Auto-seleccionar primer grupo si existe (o la opción GENERAL por defecto)
  if (gruposOptions.value.length > 0) {
    grupoSeleccionado.value = gruposOptions.value[0]
  }

  // Cargar planificación
  await cargarPlanificacion()

  // Cargar horarios desde datos locales
  // Nota: Al setear grupoSeleccionado arriba, el watcher ya disparó actualizarHorariosDesdeGrupo
  // Pero por seguridad lo llamamos si hiciera falta, aunque podría ser redundante.
  await cargarHorariosAsignatura()

  // Cargar rol de exámenes para esta materia
  await cargarExamenesRol()
})

async function cargarPlanificacion() {
  if (!grupoSeleccionado.value) return

  let targetGrupoId = grupoSeleccionado.value.value
  if (targetGrupoId === 'ALL') {
    if (asignatura.value?.horarios_data?.length > 0) {
      targetGrupoId = asignatura.value.horarios_data[0].id
    } else {
      return // No hay grupos, nada que cargar
    }
  }

  try {
    const params = { grupo_id: targetGrupoId }
    if (route.query.docente_id) params.docente_id = route.query.docente_id

    const response = await planificacionSemestralService.getPlanificacion(route.params.id, params)

    // Si viene planificacion, mapearla
    if (response.data.planificacion && response.data.planificacion.length > 0) {
      // Necesitamos reconstruir la estructura de unidades -> sesiones
      // Esto es complejo porque la API devuelve lista plana de cronogramas
      // Pero la vista espera "Unidades" con "Sesiones" dentro.
      // Reutilizaremos la lógica de "generar" pero poblando con datos existentes?
      // O mejor: mapear lo que llega a la estructura de la vista.

      // Estrategia:
      // 1. Obtener unidades base (documentacion)
      // 2. Mapear sesiones por numero_sesion
      const cronogramasDB = response.data.planificacion

      // Agrupar sesiones por semana/unidad para reconstruir la vista?
      // La vista actual agrupa por UNIDAD.
      // Pero el cronograma es plano.
      // ¿Cómo sabe qué sesión pertenece a qué unidad?
      // El cronograma no tiene unidad_id guardado (tiene tema_id, pero no unidad_id directo, aunque se puede inferir).
      // En `generarPlanificacion`, asignamos sesiones a unidades secuencialmente.
      // Si no guardamos esa relación, es difícil reconstruirla EXACTAMENTE igual.
      // PERO, `savePlanificacion` guarda TODO el array.
      // Si guardamos, el backend lo guarda plano.

      // Revisando `generarPlanificacion`:
      // Asigna sesiones a `planificacion.value` que es un array de UNIDADES.

      // Si el backend solo devuelve cronogramas planos, PERDEMOS la agrupación por unidad visualmente
      // a menos que la recalculemos o guardemos metadatos.

      // 1. Calcular estructura base sin guardar
      planificacionSesiones.value = calcularPropuestaPlanificacion()

      // Ahora inyectar datos reales sobre planificacionSesiones
      cronogramasDB.forEach((db) => {
        const sesionView = planificacionSesiones.value.find(
          (s) => s.numeroGlobal === db.numero_sesion,
        )
        if (sesionView) {
          // 1. Manejo de Temas (Prioridad IDs para el select)
          if (db.temas && db.temas.length > 0) {
            sesionView.temasSeleccionados = db.temas.map((t) => t.id)
            sesionView.tema_id = db.tema_id || db.temas[0].id
          } else if (db.tema_id) {
            sesionView.temasSeleccionados = [db.tema_id]
            sesionView.tema_id = db.tema_id
          } else {
            // Texto plano como fallback (retrocompatibilidad)
            const temaStr = String(db.tema || '')
            sesionView.temasSeleccionados = temaStr
              ? temaStr
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s)
              : []
            sesionView.tema_id = null
          }

          // Mapeo visual para columnas que no usan el select
          sesionView.tema = db.tema?.titulo || db.tema?.nombre || db.tema || db.tema_id || ''

          // IMPORTANTE: Si tiene un tema asociado, actualizar su unidad_id basándose en ese tema
          if (db.tema?.unidad_id) {
            sesionView.unidad_id = db.tema.unidad_id
          }

          sesionView.conceptual = db.contenido_conceptual || ''
          sesionView.procedimental = db.contenido_procedimental || ''
          sesionView.actitudinal = db.contenido_actitudinal || ''

          sesionView.criteriosDesempeno = db.criterios_desempeno
          sesionView.criteriosSeleccionados = db.criterios_desempeno
            ? typeof db.criterios_desempeno === 'string'
              ? db.criterios_desempeno.split(', ')
              : db.criterios_desempeno
            : []

          sesionView.instrumentosEvaluacion = db.instrumentos_evaluacion
          sesionView.instrumentosSeleccionados = db.instrumentos_evaluacion
            ? typeof db.instrumentos_evaluacion === 'string'
              ? db.instrumentos_evaluacion.split(', ')
              : db.instrumentos_evaluacion
            : []
          sesionView.contenido_items_seleccionados = db.contenido_items_seleccionados || []
        }
      })

      planificacionGenerada.value = true

      // Inicializar snapshot para auto-guardado
      // IMPORTANTE: Serializar lo mismo que observaremos en el watcher
      const stateToWatch = {
        sesiones: planificacionSesiones.value,
        config: {
          fechaInicio: calendario.value.fechaInicio,
          fechaFin: calendario.value.fechaFin,
          horarios: horarios.value,
        },
      }
      lastSavedSnapshot = JSON.stringify(stateToWatch)
      dataLoaded = true

      $q.notify({ type: 'info', message: 'Planificación cargada', icon: 'cloud_download' })
    }
  } catch (err) {
    console.error('Error cargando planificación', err)
  }
}

/**
 * Cargar exámenes del rol subido por el Director
 */
async function cargarExamenesRol() {
  try {
    await rolExamenesStore.cargarExamenes({
      gestion: gestionSeleccionada.value,
    })

    // Filtrar exámenes de la materia actual
    const codigoMateria = asignatura.value?.codigo
    if (codigoMateria) {
      examenesRol.value = rolExamenesStore.examenes.filter(
        (e) => e.materia_codigo === codigoMateria,
      )

      if (examenesRol.value.length > 0) {
        $q.notify({
          type: 'info',
          message: `Se cargaron ${examenesRol.value.length} exámenes del rol`,
          icon: 'assignment',
        })
      }
    }
  } catch {
    console.log('[Exámenes] No hay rol de exámenes cargado, usando semanas por defecto')
  }
}

/**
 * Computed: Semanas con exámenes (dinámico desde rol o por defecto)
 */
const semanasExamen = computed(() => {
  // Si hay exámenes cargados del rol, usarlos
  if (examenesRol.value.length > 0) {
    const map = {}
    examenesRol.value.forEach((ex) => {
      map[ex.semana] = ex.tipo_examen.toUpperCase()
    })
    return map
  }

  // Semanas por defecto si no hay rol
  return {
    8: 'EXAMEN PRIMER PARCIAL',
    15: 'EXAMEN SEGUNDO PARCIAL',
    19: 'EXAMEN FINAL',
    20: '2DA INSTANCIA',
  }
})

const unidadesDocumentacion = computed(() => asignatura.value?.unidades || [])
const totalTemasDocumentacion = computed(() =>
  unidadesDocumentacion.value.reduce((sum, u) => sum + (u.temas?.length || 0), 0),
)

const calendario = ref({ fechaInicio: '2026-02-09', fechaFin: '2026-06-27' })
const totalSemanas = computed(() => 20)

const horarios = ref([])
const horarioForm = ref({ dia: 'Martes', horaInicio: '07:00', horaFin: '09:00', aula: '' })

/**
 * Cargar horarios desde los datos locales de la asignatura (pivote docentes)
 */
// Watch para actualizar horarios al cambiar de grupo
watch(grupoSeleccionado, (val) => {
  if (val) {
    actualizarHorariosDesdeGrupo()
  } else {
    horarios.value = []
  }
})

/**
 * Actualizar horarios basados en el grupo seleccionado
 */
function actualizarHorariosDesdeGrupo() {
  if (!asignatura.value?.horarios_data) {
    horarios.value = []
    return
  }

  // Cargar TODOS los horarios de TODOS los grupos (Vista Agregada)
  const todosLosHorarios = []

  asignatura.value.horarios_data.forEach((grupoData) => {
    if (grupoData.horarios && grupoData.horarios.length > 0) {
      const horariosGrupo = grupoData.horarios.map((h) => ({
        dia: h.dia,
        horaInicio: h.hora_inicio?.substring(0, 5),
        horaFin: h.hora_fin?.substring(0, 5),
        // Mostrar nombre del grupo en el aula si es necesario
        aula: h.aula || 'Sin Aula',
        grupo: grupoData.grupo, // Para mostrar "Grupo 1" en la tarjeta
        tipoClase: grupoData.tipo,
        desdeAPI: true,
        docente: grupoData.docente_nombre,
      }))
      todosLosHorarios.push(...horariosGrupo)
    }
  })

  // Ordenar por día y hora

  todosLosHorarios.sort((a, b) => {
    const diaA = getNroDia(a.dia)
    const diaB = getNroDia(b.dia)
    if (diaA !== diaB) return diaA - diaB
    return a.horaInicio.localeCompare(b.horaInicio)
  })

  asignarHorarios(todosLosHorarios)
}

/**
 * Cargar horarios iniciales (wrapper para compatibilidad con onMounted)
 */
async function cargarHorariosAsignatura() {
  // Esperar a asignatura
  if (!asignatura.value) return

  // Si hay grupo seleccionado, actualizar
  if (grupoSeleccionado.value) {
    actualizarHorariosDesdeGrupo()
  }
}

function asignarHorarios(nuevosHorarios) {
  // Deduplicar horarios si es necesario o mostrarlos todos
  horariosAPI.value = nuevosHorarios

  // Actualizar vista
  horarios.value = [...horariosAPI.value]

  if (horarios.value.length > 0) {
    $q.notify({
      type: 'info',
      message: `Se cargaron ${horarios.value.length} sesiones de clase`,
      icon: 'schedule',
    })
  }
}

const unidadForm = ref({ nombre: '', elementoCompetencia: '' })

const planificacionSesiones = ref([])
const planificacion = computed(() => {
  // Reconstruir la estructura Unidades -> Sesiones para el template
  // pero de forma dinámica basada en el unidad_id de cada sesión.
  if (!unidadesDocumentacion.value) return []

  return unidadesDocumentacion.value
    .map((u) => {
      return {
        id: u.id,
        nombre: u.titulo.toUpperCase(),
        elementoCompetencia: u.elemento_competencia || '',
        temas: u.temas || [],
        collapsed: false,
        sesiones: planificacionSesiones.value
          .filter((s) => s.unidad_id === u.id)
          .sort((a, b) => a.numeroGlobal - b.numeroGlobal)
          .filter((s) => s.unidad_id === u.id)
          .sort((a, b) => a.numeroGlobal - b.numeroGlobal),
      }
    })
    .concat(
      planificacionSesiones.value.some((s) => s.unidad_id === 'finales')
        ? [
          {
            id: 'finales',
            nombre: 'EXÁMENES FINALES Y SEGUNDA INSTANCIA',
            elementoCompetencia: 'Evaluación de resultados de aprendizaje.',
            temas: [],
            collapsed: false,
            sesiones: planificacionSesiones.value
              .filter((s) => s.unidad_id === 'finales')
              .sort((a, b) => a.numeroGlobal - b.numeroGlobal),
          },
        ]
        : [],
    )
})

function resolveContenido(sesion) {
  // Si no hay items seleccionados, retornar lo que haya en texto manual
  if (!sesion.contenido_items_seleccionados || sesion.contenido_items_seleccionados.length === 0) {
    return sesion.contenido || ''
  }

  // Obtener las opciones disponibles para esta sesión (basado en temas seleccionados)
  const options = getContenidoItemsOptions(sesion)

  // Mapear los valores seleccionados a sus etiquetas
  const selectedLabels = sesion.contenido_items_seleccionados
    .map((val) => {
      const opt = options.find((o) => o.value === val)
      // Limpiar la etiqueta si tiene prefijos redundantes (opcional)
      return opt ? opt.label.split(' - ').slice(1).join(' - ') : ''
    })
    .filter((l) => l)

  return selectedLabels.join('\n')
}

// Lista global de todos los temas de todas las unidades
const opcionesTemasGlobales = computed(() => {
  const opciones = []
  unidadesDocumentacion.value.forEach((u) => {
    ; (u.temas || []).forEach((t) => {
      const titulo = typeof t === 'string' ? t : t.titulo || t.nombre || ''
      opciones.push({
        label: titulo,
        value: t.id || titulo,
        unidad_id: u.id,
        unidad_nombre: u.titulo,
      })
    })
  })
  return opciones
})

// Lista de todos los horarios ordenados por día y hora
const horariosOrdenados = computed(() => {
  return [...horarios.value].sort((a, b) => {
    const diaA = getNroDia(a.dia)
    const diaB = getNroDia(b.dia)
    if (diaA !== diaB) return diaA - diaB
    return (a.horaInicio || '').localeCompare(b.horaInicio || '')
  })
})

const totalSesionesGeneradas = computed(() =>
  planificacion.value.reduce((sum, u) => sum + (u.sesiones?.length || 0), 0),
)

const progresoTotal = computed(() => {
  if (!totalSesionesGeneradas.value) return 0
  let completadas = 0
  planificacion.value.forEach((u) => {
    u.sesiones?.forEach((s) => {
      if (s.tema && s.conceptual && s.procedimental) completadas++
    })
  })
  return Math.round((completadas / totalSesionesGeneradas.value) * 100)
})

function agregarHorario() {
  horarioForm.value = { dia: 'Martes', horaInicio: '07:00', horaFin: '09:00', aula: '' }
  showHorarioDialog.value = true
}

function confirmarHorario() {
  const nuevoHorario = { ...horarioForm.value, desdeAPI: false }
  horarios.value.push(nuevoHorario)
  showHorarioDialog.value = false
  $q.notify({ type: 'positive', message: 'Sesión agregada', icon: 'check' })
}

function eliminarHorario(horario) {
  if (horario.desdeAPI) {
    $q.notify({
      type: 'warning',
      message: 'Este horario viene de la API y no puede eliminarse',
      icon: 'warning',
    })
    return
  }
  const idx = horarios.value.indexOf(horario)
  if (idx !== -1) {
    horarios.value.splice(idx, 1)
  }
}

// Helper para normalizar días (API sin tildes vs App con tildes)
const getNroDia = (diaStr) => {
  if (!diaStr) return 99
  // Normalizar: minúsculas y sin tildes (miercoles, sabado)
  const d = diaStr
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const map = {
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
    domingo: 7,
  }
  return map[d] || 99
}

/**
 * Función PURA que calcula la propuesta de planificación basada en horarios y fechas.
 * No tiene efectos secundarios (no guarda en DB, no cambia pestañas).
 */
function calcularPropuestaPlanificacion() {
  // Ajustar fecha de inicio al Lunes de esa semana
  const inputFecha = new Date(calendario.value.fechaInicio + 'T12:00:00')
  const day = inputFecha.getDay() || 7
  const mondayOfFirstWeek = new Date(inputFecha)
  if (day !== 1) mondayOfFirstWeek.setDate(inputFecha.getDate() - day + 1)
  mondayOfFirstWeek.setHours(0, 0, 0, 0)

  const unidades = unidadesDocumentacion.value
  const SEMANAS_EXAMEN = semanasExamen.value
  const todasLasSesiones = []
  let sesionGlobal = 1

  // Determinar ID de grupo para las sesiones
  let targetGrupoId = grupoSeleccionado.value?.value
  if (targetGrupoId === 'ALL' && asignatura.value?.horarios_data?.length > 0) {
    targetGrupoId = asignatura.value.horarios_data[0].id
  }

  // Preparar mapa de exámenes
  const fechasExamenMap = {}
  if (examenesRol.value.length > 0) {
    let examenesRelevantes = examenesRol.value
    if (grupoSeleccionado.value && grupoSeleccionado.value.value !== 'ALL') {
      examenesRelevantes = examenesRelevantes.filter(
        (e) =>
          e.grupo == grupoSeleccionado.value.nombre || e.grupo == grupoSeleccionado.value.value,
      )
    }
    examenesRelevantes.forEach((ex) => {
      const raw = ex.fecha_examen || ex.fecha
      if (raw) fechasExamenMap[raw.split('T')[0]] = ex.tipo_examen || ex.tipo
    })
  }

  // Bucle de generación (20 semanas) usando horarios ordenados
  for (let semana = 1; semana <= totalSemanas.value; semana++) {
    const fechaSemanaInicio = new Date(mondayOfFirstWeek)
    fechaSemanaInicio.setDate(mondayOfFirstWeek.getDate() + (semana - 1) * 7)

    horariosOrdenados.value.forEach((horario, sesionEnSemana) => {
      const diaNum = getNroDia(horario.dia)
      const diaIndex = diaNum >= 1 && diaNum <= 7 ? diaNum - 1 : 0
      const fechaSesion = new Date(fechaSemanaInicio)
      fechaSesion.setDate(fechaSemanaInicio.getDate() + diaIndex)

      const y = fechaSesion.getFullYear()
      const m = String(fechaSesion.getMonth() + 1).padStart(2, '0')
      const d = String(fechaSesion.getDate()).padStart(2, '0')
      const fechaSesionIso = `${y}-${m}-${d}`

      let esExamen = false
      let nombreExamen = null

      if (fechasExamenMap[fechaSesionIso]) {
        esExamen = true
        nombreExamen = fechasExamenMap[fechaSesionIso]
      } else if (Object.keys(fechasExamenMap).length === 0) {
        const esUltimaSesionSemana = sesionEnSemana === horariosOrdenados.value.length - 1
        if (esUltimaSesionSemana && SEMANAS_EXAMEN[semana]) {
          esExamen = true
          nombreExamen = SEMANAS_EXAMEN[semana]
        }
      }

      todasLasSesiones.push({
        id: sesionGlobal,
        numeroGlobal: sesionGlobal,
        semana,
        semanaFechas: formatDate(fechaSemanaInicio),
        dia: horario.dia,
        fecha: fechaSesionIso,
        tipoClase:
          !isNaN(horario.grupo) && horario.grupo.toString().trim() !== '' ? 'Teórica' : 'Práctica',
        esExamen: esExamen,
        tipoExamen: nombreExamen,
        periodoExamen: nombreExamen || (esExamen ? 'Examen' : null),
        grupo_id: targetGrupoId,
        tema: esExamen ? nombreExamen : '',
        conceptual: '',
        procedimental: '',
        actitudinal: '',
        criteriosDesempeno: '',
        instrumentosEvaluacion: esExamen ? 'Examen escrito' : '',
        temasSeleccionados: [],
        criteriosSeleccionados: [],
        instrumentosSeleccionados: esExamen ? ['Examen escrito'] : [],
        modificado: false,
        bloqueado: esExamen || semana >= 18,
      })
      sesionGlobal++
    })
  }

  const sesionesParaContenido = todasLasSesiones.filter((s) => !s.esExamen && s.semana <= 17)
  const sesionesPorUnidad = Math.floor(sesionesParaContenido.length / unidades.length)
  const sesionesExtra = sesionesParaContenido.length % unidades.length

  let indiceSesion = 0
  const nuevasSesiones = []

  unidades.forEach((unidad, uIdx) => {
    const cantidadSesiones = sesionesPorUnidad + (uIdx < sesionesExtra ? 1 : 0)
    const temasUnidad = unidad.temas || []
    const sesionesPorTema =
      temasUnidad.length > 0 ? Math.ceil(cantidadSesiones / temasUnidad.length) : cantidadSesiones

    for (let i = 0; i < cantidadSesiones && indiceSesion < sesionesParaContenido.length; i++) {
      const sesionBase = sesionesParaContenido[indiceSesion]
      const temaIdx = Math.floor(i / sesionesPorTema)
      const temaOriginal = temasUnidad[temaIdx]

      nuevasSesiones.push({
        ...sesionBase,
        unidad_id: unidad.id,
        tema: temaOriginal?.titulo || '',
        tema_id: temaOriginal?.id || null,
        temasSeleccionados: temaOriginal?.id
          ? [temaOriginal.id]
          : temaOriginal?.titulo
            ? [temaOriginal.titulo]
            : [],
        conceptual: Array.isArray(temaOriginal?.contenido_conceptual)
          ? temaOriginal.contenido_conceptual.join('\n')
          : temaOriginal?.contenido_conceptual || '',
        procedimental: Array.isArray(temaOriginal?.contenido_procedimental)
          ? temaOriginal.contenido_procedimental.join('\n')
          : temaOriginal?.contenido_procedimental || '',
        actitudinal: Array.isArray(temaOriginal?.contenido_actitudinal)
          ? temaOriginal.contenido_actitudinal.join('\n')
          : temaOriginal?.contenido_actitudinal || '',
        criteriosDesempeno: '',
        criteriosSeleccionados: [],
        instrumentosEvaluacion: '',
        instrumentosSeleccionados: [],
        contenido_items_seleccionados: [], // Inicializar array vacío para items seleccionables
      })
      indiceSesion++
    }
  })

  // Agregar restantes (exámenes y semanas 18-20)
  const idsAsignados = new Set(nuevasSesiones.map((s) => s.numeroGlobal))
  todasLasSesiones.forEach((s) => {
    if (!idsAsignados.has(s.numeroGlobal)) {
      let unidadId = 'finales'
      if (s.semana <= 17) {
        // Buscar la unidad por el número de sesión (más fiable que la semana)
        const sesionPrevia = nuevasSesiones.filter((ns) => ns.numeroGlobal < s.numeroGlobal).pop()
        unidadId = sesionPrevia?.unidad_id || unidades[0]?.id || 'finales'
      }
      nuevasSesiones.push({ ...s, unidad_id: unidadId })
    }
  })

  return nuevasSesiones.sort((a, b) => a.numeroGlobal - b.numeroGlobal)
}

async function generarPlanificacion(silent = false) {
  if (!silent) $q.loading.show({ message: 'Generando y persistiendo cronograma...' })

  try {
    // 1. Calcular propuesta usando la nueva función pura
    const propuestas = calcularPropuestaPlanificacion()

    // 2. Aplicar a la reactividad
    planificacionSesiones.value = propuestas

    // 3. Persistir en DB
    await guardarTodo(true)

    // 4. Cambiar UI
    planificacionGenerada.value = true
    if (!silent) {
      tabActual.value = 'planificacion'
      $q.notify({
        type: 'positive',
        message: 'Planificación generada y guardada',
        icon: 'check_circle',
      })
    }
  } catch (err) {
    console.error('Error en generación/guardado:', err)
    if (!silent) $q.notify({ type: 'negative', message: 'Error en generación' })
  } finally {
    if (!silent) $q.loading.hide()
  }
}

function formatDate(date) {
  const d = new Date(date)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`
}

function isFirstSesionOfSemana(unidad, sesion) {
  const idx = unidad.sesiones.findIndex((s) => s.id === sesion.id)
  if (idx === 0) return true
  return unidad.sesiones[idx].semana !== unidad.sesiones[idx - 1].semana
}

function getSemanaRowspan(unidad, sesion) {
  return unidad.sesiones.filter((s) => s.semana === sesion.semana).length
}

function getExamenColor(periodo) {
  if (periodo.includes('1er')) return 'blue'
  if (periodo.includes('2do')) return 'orange'
  if (periodo.includes('Final')) return 'purple'
  return 'red'
}

function getSesionRowClass(sesion) {
  if (sesion.periodoExamen) return 'sesion-examen'
  if (sesion.modificado) return 'sesion-modificada'
  return ''
}

function marcarModificado(sesion) {
  sesion.modificado = true
}

// Funciones para manejar contenido_items seleccionables
function getTemasSeleccionados(sesion) {
  if (!sesion.temasSeleccionados || sesion.temasSeleccionados.length === 0) {
    return []
  }

  const temas = []
  // Buscar los temas completos en las unidades de la DOCUMENTACIÓN (asignatura)
  for (const unidad of asignatura.value?.unidades || []) {
    for (const temaId of sesion.temasSeleccionados) {
      const tema = unidad.temas?.find((t) => t.id === temaId)
      if (tema && !temas.find((t) => t.id === tema.id)) {
        temas.push(tema)
      }
    }
  }

  return temas
}

// Generar opciones para el select de contenido_items
function getContenidoItemsOptions(sesion) {
  const temas = getTemasSeleccionados(sesion)
  const options = []

  for (const tema of temas) {
    if (tema.contenido_items && tema.contenido_items.length > 0) {
      tema.contenido_items.forEach((item, index) => {
        options.push({
          value: `${tema.id}:${index}`,
          label: `${tema.titulo} - ${index + 1}. ${item}`,
          temaId: tema.id,
          itemIndex: index,
        })
      })
    }
  }

  return options
}

function editarUnidad(unidad) {
  unidadEditando.value = unidad
  unidadForm.value = { nombre: unidad.nombre, elementoCompetencia: unidad.elementoCompetencia }
  showUnidadDialog.value = true
}

function guardarUnidad() {
  if (unidadEditando.value) {
    unidadEditando.value.nombre = unidadForm.value.nombre.toUpperCase()
    unidadEditando.value.elementoCompetencia = unidadForm.value.elementoCompetencia
  }
  showUnidadDialog.value = false
  $q.notify({ type: 'positive', message: 'Unidad actualizada', icon: 'check' })
}

function agregarSesionManual(unidad) {
  const lastSesion = unidad.sesiones[unidad.sesiones.length - 1]
  const newId = Math.max(...planificacionSesiones.value.map((s) => s.id), 0) + 1

  planificacionSesiones.value.push({
    id: newId,
    numeroGlobal: newId,
    unidad_id: unidad.id,
    semana: lastSesion?.semana || 1,
    semanaFechas: lastSesion?.semanaFechas || '',
    dia: lastSesion?.dia || 'Martes',
    fecha: lastSesion?.fecha || '',
    periodoExamen: null,
    tema: '',
    temasSeleccionados: [],
    contenido: '',
    contenido_items_seleccionados: [], // Array de "temaId:itemIndex"
    conceptual: '',
    procedimental: '',
    actitudinal: '',
    criteriosDesempeno: '',
    criteriosSeleccionados: [],
    instrumentosEvaluacion: '',
    instrumentosSeleccionados: [],
    modificado: true,
  })
  $q.notify({ type: 'positive', message: 'Sesión agregada', icon: 'add' })
}

import pdfService from 'src/services/pdfService'

function eliminarSesion(unidad, sesion) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar esta sesión?',
    cancel: true,
  }).onOk(() => {
    unidad.sesiones = unidad.sesiones.filter((s) => s.id !== sesion.id)
  })
}

async function ejecutarCopia() {
  if (!gestionACopiar.value) {
    $q.notify({ type: 'warning', message: 'Seleccione una gestión de origen', icon: 'warning' })
    return
  }

  $q.loading.show({ message: 'Copiando planificación...' })
  try {
    const response = await planificacionSemestralService.copiarPlanificacion(route.params.id, {
      gestion_origen: gestionACopiar.value,
    })

    // Recargar todo
    await cargarPlanificacion()
    showCopiarDialog.value = false
    $q.notify({
      type: 'positive',
      message: response.data.message || 'Planificación copiada con éxito',
      icon: 'content_copy',
    })
  } catch (err) {
    console.error('Error copiando:', err)
    $q.notify({ type: 'negative', message: 'Error al copiar planificación', icon: 'error' })
  } finally {
    $q.loading.hide()
  }
}

async function guardarTodo(silent = false) {
  // if (!silent) guardando.value = true
  try {
    // Si estamos en modo 'ALL', buscamos un ID de grupo válido para asociar (provisorio)
    let targetGrupoId = grupoSeleccionado.value?.value

    if (targetGrupoId === 'ALL') {
      if (asignatura.value?.horarios_data?.length > 0) {
        targetGrupoId = asignatura.value.horarios_data[0].id
      } else {
        if (!silent)
          $q.notify({
            type: 'warning',
            message: 'No hay grupos asociados para guardar la planificación',
            icon: 'warning',
          })
        guardando.value = false
        return
      }
    }

    if (!targetGrupoId) {
      if (!silent) $q.notify({ type: 'warning', message: 'Seleccione un grupo', icon: 'warning' })
      return
    }

    const sesiones = []
    planificacionSesiones.value.forEach((sesion) => {
      // Sincronizar arrays a strings antes de guardar
      if (Array.isArray(sesion.temasSeleccionados))
        sesion.tema = sesion.temasSeleccionados.join(', ')
      if (Array.isArray(sesion.criteriosSeleccionados))
        sesion.criteriosDesempeno = sesion.criteriosSeleccionados.join(', ')
      if (Array.isArray(sesion.instrumentosSeleccionados))
        sesion.instrumentosEvaluacion = sesion.instrumentosSeleccionados.join(', ')

      // Preparar para el backend
      const sDB = {
        ...sesion,
        contenido_conceptual: sesion.conceptual,
        contenido_procedimental: sesion.procedimental,
        contenido_actitudinal: sesion.actitudinal,
        numero_sesion: sesion.numeroGlobal,
        tema_id:
          sesion.tema_id ||
          (Array.isArray(sesion.temasSeleccionados) &&
            typeof sesion.temasSeleccionados[0] === 'number'
            ? sesion.temasSeleccionados[0]
            : null),
        temas_ids: Array.isArray(sesion.temasSeleccionados)
          ? sesion.temasSeleccionados.filter((v) => typeof v === 'number')
          : [],
        contenido_items_seleccionados: sesion.contenido_items_seleccionados || [],
      }

      sDB.grupo_id = targetGrupoId
      sesiones.push(sDB)
    })

    await planificacionSemestralService.savePlanificacion(route.params.id, {
      sesiones,
      grupo_id: targetGrupoId,
    })

    // También guardar configuración de fechas
    await planificacionSemestralService.saveConfig(route.params.id, {
      fecha_inicio_clases: calendario.value.fechaInicio,
      fecha_fin_clases: calendario.value.fechaFin,
      gestion_academica: gestionSeleccionada.value,
    })

    if (!silent)
      $q.notify({ type: 'positive', message: 'Planificación guardada exitosamente', icon: 'save' })
  } catch (err) {
    console.error('Error guardando:', err)
    if (!silent)
      $q.notify({ type: 'negative', message: 'Error guardando planificación', icon: 'error' })
    throw err
  } finally {
    // if (!silent) guardando.value = false
  }
}

// Opciones recomendadas
const criteriosOptions = [
  'Analiza componentes',
  'Diseña soluciones',
  'Implementa servicios',
  'Evalúa rendimiento',
  'Documenta procesos',
]
const instrumentosOptions = [
  'Lista de cotejo',
  'Rúbrica de evaluación',
  'Prueba escrita',
  'Defensa oral',
  'Informe de laboratorio',
]

// Calculo de fechas para todos los grupos
const fechasGlobales = ref({})

function onTemaUpdate(val, sesion) {
  if (!val) val = []

  // Sincronizar tema label (opcional)
  const labels = []
  val.forEach((v) => {
    if (typeof v === 'number') {
      const opt = opcionesTemasGlobales.value.find((o) => o.value === v)
      if (opt) labels.push(opt.label)
    } else {
      labels.push(v)
    }
  })
  sesion.tema = labels.join(', ')

  // Actualizar tema_id (primer seleccionado como principal para compatibilidad)
  sesion.tema_id = val.find((v) => typeof v === 'number') || null

  marcarModificado(sesion)

  // Si se seleccionó un tema que existe en mis opciones,
  // mover la sesión a la unidad de ese tema (usando el último seleccionado)
  if (val.length > 0) {
    const ultimoValor = val[val.length - 1]
    const opcion = opcionesTemasGlobales.value.find((o) => o.value === ultimoValor)
    if (opcion && opcion.unidad_id) {
      sesion.unidad_id = opcion.unidad_id
    }
  }
}

function calcularFechasTodosLosGrupos() {
  const map = {}
  if (!horarios.value || horarios.value.length === 0) return

  // Usamos el mismo lunes de inicio
  const fechaInicioStr = calendario.value.fechaInicio + 'T12:00:00'
  const inputFecha = new Date(fechaInicioStr)
  const day = inputFecha.getDay() || 7
  const mondayOfFirstWeek = new Date(inputFecha)
  if (day !== 1) mondayOfFirstWeek.setDate(inputFecha.getDate() - day + 1)
  mondayOfFirstWeek.setHours(0, 0, 0, 0)

  // El mapa DEBE coincidir con el bucle de generarPlanificacion
  let sesionIdx = 1
  for (let sem = 1; sem <= 20; sem++) {
    const inicioSem = new Date(mondayOfFirstWeek)
    inicioSem.setDate(mondayOfFirstWeek.getDate() + (sem - 1) * 7)

    horarios.value.forEach((h) => {
      const diaNum = getNroDia(h.dia)
      const dIndex = diaNum >= 1 && diaNum <= 7 ? diaNum - 1 : 0
      const fSesion = new Date(inicioSem)
      fSesion.setDate(inicioSem.getDate() + dIndex)

      // En la vista general, cada sesión global corresponde a UN horario específico
      // pero queremos mostrar la fecha para ese horario.
      map[sesionIdx] = [
        {
          grupo: h.grupo || 'G',
          fecha: formatDate(fSesion),
        },
      ]
      sesionIdx++
    })
  }
  fechasGlobales.value = map
}

function getFechasGrupos(nroSesion) {
  return fechasGlobales.value[nroSesion] || []
}

// Recalcular al montar o cambiar
watch(
  [() => asignatura.value, horarios],
  () => {
    calcularFechasTodosLosGrupos()
  },
  { deep: true },
)

/**
 * Auto-guardado
 */
watchDebounced(
  () => {
    return {
      sesiones: planificacionSesiones.value,
      config: {
        fechaInicio: calendario.value.fechaInicio,
        fechaFin: calendario.value.fechaFin,
        horarios: horarios.value,
      },
    }
  },
  async (newValue) => {
    if (!dataLoaded) return
    if (!planificacionGenerada.value) return

    const currentSnapshot = JSON.stringify(newValue)
    if (currentSnapshot === lastSavedSnapshot) return // Sin cambios reales

    saveStatus.value = 'saving'
    try {
      await guardarTodo(true) // Guardado silencioso

      lastSavedSnapshot = currentSnapshot
      saveStatus.value = 'saved'

      setTimeout(() => {
        if (saveStatus.value === 'saved') saveStatus.value = 'idle'
      }, 3000)
    } catch (error) {
      console.error('Error auto-guardando:', error)
      saveStatus.value = 'error'
    }
  },
  { debounce: 2000, maxWait: 10000, deep: true },
)

onMounted(() => {
  calcularFechasTodosLosGrupos()
})

function exportarPDF() {
  if (!planificacionGenerada.value) {
    $q.notify({ type: 'warning', message: 'Primero genere la planificación', icon: 'warning' })
    return
  }

  $q.loading.show({ message: 'Generando PDF...' })
  try {
    // Preparar objeto asignatura enriquecido con la planificación actual para el PDF
    // El servicio pdfService espera 'unidades' con 'temas', pero nuestra planificación
    // tiene una estructura ligeramente diferente (unidades con sesiones).
    // Debemos adaptar los datos para que el reporte salga bonito, o crear un reporte específico.
    // USaremos generarPlanDeClase pero le pasaremos los datos "reales" de la planificación grid.

    const asignaturaParaPDF = {
      ...asignatura.value,
      // Sobreescribimos unidades con la info de la planificación actual (sesiones distribuidas)
      unidades: planificacion.value.map((p) => ({
        numero: p.id, // Ojo: id puede no ser numero secuencial
        titulo: p.nombre,
        elemento_competencia: p.elementoCompetencia,
        temas: p.sesiones
          .filter((s) => !s.esExamen)
          .map((s, idx) => ({
            numero: idx + 1,
            titulo: s.tema,
            resultados_aprendizaje: s.criteriosDesempeno, // Mapeo aproximado
            contenidos: {
              conceptual: [
                ...(resolveContenido(s) ? resolveContenido(s).split('\n') : []),
                ...(s.conceptual ? s.conceptual.split('\n') : []),
              ],
              procedimental: s.procedimental ? s.procedimental.split('\n') : [],
              actitudinal: s.actitudinal ? s.actitudinal.split('\n') : [],
            },
            estrategias: {
              metodologicas: '', // No está en grid explícito
              aprendizaje: '',
              recursos: [],
            },
            evaluacion: {
              formativa: { actividades: [], instrumentos: [s.instrumentosEvaluacion || ''] },
              sumativa: { actividades: [], instrumentos: [] },
            },
          })),
      })),
    }

    pdfService.generarPlanDeClase(asignaturaParaPDF, { fecha: new Date().toLocaleDateString() })
    $q.notify({ type: 'positive', message: 'PDF generado', icon: 'download' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error generando PDF', icon: 'error' })
  } finally {
    $q.loading.hide()
  }
}
</script>

<style scoped>
.planificacion-page {
  padding: 24px;
  background: var(--bg-primary);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
}

.page-subtitle {
  color: var(--text-secondary);
  margin: 4px 0 0 0;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.main-card {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.config-card {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
  border-radius: 12px;
  height: 100%;
}

.examenes-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.examen-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unidades-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.unidad-preview-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: var(--bg-hover);
  border-radius: 8px;
}

.unidad-preview-info {
  display: flex;
  flex-direction: column;
}

.unidad-preview-titulo {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-primary);
}

.unidad-preview-temas {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.horarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.horario-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  position: relative;
}

.horario-card.horario-api {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.horario-card .delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
}

.horario-card .lock-icon {
  position: absolute;
  top: 8px;
  right: 8px;
}

.horario-card .api-badge {
  position: absolute;
  top: -6px;
  left: 8px;
}

.horario-dia {
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  padding-top: 8px;
}

.horario-hora {
  font-size: 0.9rem;
  color: var(--primary);
}

.horario-aula {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.planificacion-resumen {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  flex-wrap: wrap;
}

.resumen-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.resumen-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.resumen-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.unidades-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.unidad-section {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
}

.unidad-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #4338ca, #3730a3);
  color: white;
}

.unidad-toggle {
  cursor: pointer;
}

.unidad-info {
  flex: 1;
  cursor: pointer;
}

.unidad-titulo {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.unidad-competencia {
  margin: 8px 0 0;
  font-size: 0.8rem;
  opacity: 0.9;
}

.unidad-actions {
  display: flex;
  gap: 4px;
}

.unidad-actions .q-btn {
  color: white;
  opacity: 0.8;
}

.unidad-actions .q-btn:hover {
  opacity: 1;
}

.sesiones-table-container {
  padding: 16px;
  overflow-x: auto;
}

.sesiones-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
}

.sesiones-table th {
  background: #4338ca;
  color: white;
  padding: 8px 4px;
  text-align: center;
  font-size: 0.6rem;
  text-transform: uppercase;
}

.sesiones-table td {
  border: 1px solid var(--border-color);
  padding: 4px;
  vertical-align: top;
}

.sesion-examen td {
  background: rgba(251, 191, 36, 0.1);
}

.sesion-modificada td {
  background: rgba(16, 185, 129, 0.1);
}

.cell-semana {
  background: var(--bg-hover);
  text-align: center;
  min-width: 60px;
}

.semana-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.semana-numero {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary);
}

.semana-fechas {
  font-size: 0.6rem;
  color: var(--text-muted);
}

.cell-sesion {
  background: var(--bg-hover);
  text-align: center;
  min-width: 50px;
}

.sesion-content {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sesion-numero {
  font-weight: 700;
  color: var(--primary);
  font-size: 0.9rem;
}

.sesion-dia {
  font-size: 0.65rem;
  color: var(--text-secondary);
}

.sesion-fecha {
  font-size: 0.6rem;
  color: var(--text-muted);
}

.cell-input :deep(.q-field__control) {
  min-height: 24px;
}

.cell-input :deep(textarea) {
  font-size: 0.65rem;
  line-height: 1.2;
}

.cell-actions {
  text-align: center;
  vertical-align: middle;
}

.fecha-grupo-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  border-bottom: 1px dashed #e0e0e0;
  padding: 2px 4px;
}

.fecha-grupo-row:last-child {
  border-bottom: none;
}

.fg-grupo {
  font-weight: 700;
  color: var(--primary);
  margin-right: 6px;
}

.fg-fecha {
  color: var(--text-secondary);
}

/* Filas de Examen */
.sesion-examen-row td {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1));
}

.examen-cell {
  text-align: center;
  vertical-align: middle;
  padding: 16px !important;
}

.examen-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d97706;
  font-weight: 700;
  font-size: 0.9rem;
}

.examen-titulo {
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Preview */
.preview-container {
  background: white;
  color: #333;
  padding: 40px;
  border-radius: 8px;
  max-width: 1200px;
  margin: 0 auto;
}

.preview-header {
  text-align: center;
  margin-bottom: 24px;
  border-bottom: 2px solid #4338ca;
  padding-bottom: 16px;
}

.preview-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #4338ca;
}

.preview-header h3 {
  margin: 4px 0 0;
  font-size: 1.5rem;
  color: #333;
}

.preview-info {
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 8px;
}

.info-row {
  margin: 4px 0;
}

.preview-unidad {
  margin-bottom: 32px;
}

.preview-unidad-header {
  background: #4338ca;
  color: white;
  padding: 12px 16px;
  font-weight: bold;
}

.preview-competencia {
  background: #f5f5f5;
  padding: 12px 16px;
  font-size: 0.85rem;
  border: 1px solid #ddd;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
  margin-top: -1px;
}

.preview-table th {
  background: #6366f1;
  color: white;
  padding: 8px 4px;
  border: 1px solid #4338ca;
}

.preview-table td {
  border: 1px solid #ddd;
  padding: 8px 4px;
  vertical-align: top;
}

.preview-content {
  white-space: pre-wrap;
  font-size: 0.7rem;
}

/* Dialog */
.dialog-card {
  background: var(--bg-secondary) !important;
  border-radius: 16px !important;
}

.dialog-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #4338ca, #3730a3);
  color: white;
  margin: -16px -16px 16px -16px;
  border-radius: 16px 16px 0 0;
}

.dialog-header.bg-green {
  background: linear-gradient(135deg, #10b981, #059669);
}

.dialog-header.bg-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
}

.dialog-actions {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}

/* Estilos para contenido_items seleccionables */
.contenido-items-container {
  padding: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.tema-contenido-group {
  margin-bottom: 8px;
}

.contenido-item-checkbox {
  display: block;
  margin-bottom: 4px;
  padding: 2px 0;
}

.contenido-item-checkbox :deep(.q-checkbox__label) {
  font-size: 12px;
  line-height: 1.4;
}



/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
