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
          <div class="page-subtitle">
            <q-chip size="sm" color="primary" text-color="white">{{ asignatura?.codigo }}</q-chip>
            {{ asignatura?.nombre }} |
            {{ asignatura?.carrera?.nombre || asignatura?.carrera || 'Carrera' }}
          </div>
        </div>
      </div>
      <div class="header-actions">


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
                     <!-- Button Removed -->
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
                      <div v-if="horario.desdeAPI" class="api-badge-container">
                        <q-chip color="blue-2" text-color="blue-9" size="xs" dense class="api-badge">API</q-chip>
                        <q-chip v-if="horario.esComun" color="purple-2" text-color="purple-9" size="xs" dense class="api-badge">Común</q-chip>
                        <q-chip 
                          :color="String(horario.tipoClase).toLowerCase().includes('teor') ? 'indigo-1' : 'green-1'" 
                          :text-color="String(horario.tipoClase).toLowerCase().includes('teor') ? 'indigo-9' : 'green-9'" 
                          size="xs" dense class="api-badge"
                        >
                          {{ horario.tipoClase }}
                        </q-chip>
                      </div>
                      <div class="horario-dia">
                        <q-icon name="event" class="q-mr-xs" />{{ horario.dia }}
                        <span class="text-weight-bold q-ml-sm text-indigo">{{ horario.codigoAsignatura }}</span>
                      </div>
                      <div class="horario-hora">
                        {{ horario.horaInicio }} - {{ horario.horaFin }}
                      </div>
                      <div class="horario-aula">
                        {{ horario.aula }}
                        <span v-if="horario.grupo">(Grupo {{ horario.grupo }})</span>
                      </div>
                      <q-icon name="lock" size="14px" color="blue" class="lock-icon">
                        <q-tooltip>Horario de la API (no editable)</q-tooltip>
                      </q-icon>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Botón Generar -->
            <div class="col-12 text-center">
              <!-- Resumen de Sesiones Oficiales (Desde Horario) -->
              <div v-if="asignatura" class="q-mb-md flex flex-center q-gutter-xl">
                <div class="session-info-box">
                  <div class="text-overline text-blue-9">Sesiones Teóricas</div>
                  <div class="text-h3 text-weight-bold text-blue-7">{{ sesionesSugeridas.teoricas }}</div>
                  <div class="text-caption text-grey-7">Oficiales por semana</div>
                </div>

                <div class="session-info-box">
                  <div class="text-overline text-green-9">Sesiones Prácticas</div>
                  <div class="text-h3 text-weight-bold text-green-7">{{ sesionesSugeridas.practicas }}</div>
                  <div class="text-caption text-grey-7">Oficiales por semana</div>
                </div>
              </div>

              <q-btn unelevated color="indigo" icon="auto_awesome" label="Generar Planificación Automática" size="lg"
                no-caps @click="generarPlanificacion(false)"
                :disable="planificacionGenerada || (sesionesSugeridas.teoricas === 0 && sesionesSugeridas.practicas === 0)"
              >
                <q-tooltip v-if="sesionesSugeridas.teoricas === 0 && sesionesSugeridas.practicas === 0">
                  No se detectaron sesiones en el horario. Contacte al Director si esto es un error.
                </q-tooltip>
              </q-btn>

              <q-banner v-if="planificacionGenerada" class="bg-green-1 text-green-9 q-mt-md inline-block rounded-borders" dense>
                <q-icon name="check_circle" class="q-mr-sm" />
                La planificación ya ha sido generada.
              </q-banner>
            </div>
          </div>
        </q-tab-panel>

        <!-- TAB 2: PLANIFICACIÓN -->
        <q-tab-panel name="planificacion" class="q-pa-lg">
          <!-- Action Buttons Row -->
          <div class="row justify-end q-gutter-sm q-mb-md">
             <q-btn unelevated outline color="red-5" icon="delete_sweep" label="Vaciar cronograma" no-caps
                @click="confirmarVaciar" >
                <q-tooltip>Eliminar todo el contenido actual del cronograma</q-tooltip>
             </q-btn>

             <q-btn unelevated outline color="indigo-5" icon="rebase_edit" label="Reestructurar cronograma con sesiones oficiales" no-caps
                @click="confirmarReestructura" >
                <q-tooltip>Volver a generar la estructura base tras corregir número de sesiones</q-tooltip>
             </q-btn>

             <q-btn unelevated color="orange" icon="upload_file" label="Importar Cronograma Parcial (PAC)" no-caps
                @click="abrirDialogoImportarCronograma" >
                <q-tooltip>Importar avance semestral hasta semena 6 (Excel)</q-tooltip>
             </q-btn>
             
             <q-btn unelevated color="indigo-7" icon="upload_file" label="Importar Cronograma Total" no-caps
                @click="abrirDialogoImportarCronograma" >
                <q-tooltip>Importar avance semestral completo de las 20 semanas (Excel)</q-tooltip>
             </q-btn>
          </div>

          <!-- Resumen -->
          <div class="planificacion-resumen q-mb-lg">
            <div class="resumen-item">
              <q-icon name="folder" size="24px" color="indigo" />
              <span class="resumen-value">{{ unidadesDocumentacion.length }}</span>
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

          <!-- Unidades FLATTENED -->
          <div class="unidades-container q-pb-xl">
            
            <!-- Floating Navigation Buttons (Fixed to Screen) -->
            <q-page-sticky position="right" :offset="[10, 0]" class="z-top">
              <div class="flex column q-gutter-y-sm">
                <q-btn round color="primary" icon="chevron_left" 
                       @click="scrollTable('left')" 
                       glossy size="md">
                  <q-tooltip anchor="center left" self="center right">Desplazar Izquierda</q-tooltip>
                </q-btn>
                       
                <q-btn round color="primary" icon="chevron_right" 
                       @click="scrollTable('right')" 
                       glossy size="md">
                  <q-tooltip anchor="center left" self="center right">Desplazar Derecha</q-tooltip>
                </q-btn>
              </div>
            </q-page-sticky>

            <div class="sesiones-table-container" ref="tableContainerRef" style="overflow-x: auto; max-width: 100%;">
                 <table class="sesiones-table" style="min-width: 1200px;">
                  <thead>
                    <tr>
                      <th style="width: 70px; position: sticky; left: 0; z-index: 2;">SEM</th>
                      <th style="width: 90px; z-index: 1;">SESIÓN</th>
                      <th style="width: 180px;" class="bg-grey-1 text-grey-8">FECHAS / GRUPOS</th>
                      <th style="width: 350px;">TEMAS</th>
                      <th style="width: 450px;">CONTENIDO</th>
                      <th style="width: 300px;">CONCEPTUAL</th>
                      <th style="width: 300px;">PROCEDIMENTAL</th>
                      <th style="width: 300px;">ACTITUDINAL</th>
                      <th style="width: 300px;">CRITERIOS</th>
                      <th style="width: 300px;">INSTRUMENTOS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="sesion in planificacion" :key="sesion.id">
                      <tr :class="getSesionRowClass(sesion)">
                        <td class="cell-semana" 
                            v-if="isFirstSesionOfSemana(planificacion, sesion)"
                            :rowspan="getSemanaRowspan(planificacion, sesion)"
                            style="position: sticky; left: 0; z-index: 1; background: white; border-bottom: 2px solid #ddd;">
                          <div class="semana-content">
                            <span class="semana-numero">{{ sesion.semana }}</span>
                            <span class="semana-fechas">{{ sesion.semanaFechas }}</span>
                          </div>
                        </td>
                        <td class="cell-sesion">
                          <div class="sesion-content">
                            <span class="sesion-numero">SESIÓN {{ sesion.numeroGlobal }}</span>
                            <span class="sesion-fecha">{{ sesion.tipoClase || 'Clase' }}</span>
                          </div>
                        </td>
                        <td class="cell-fechas bg-grey-1">
                          <div v-for="(fg, idx) in getFechasGrupos(sesion)" :key="idx"
                            class="fecha-grupo-row q-pa-xs q-mb-xs rounded-borders"
                            :class="fg.examen ? 'bg-orange-1 text-bold text-orange-9' : ''"
                            style="border: 1px solid transparent;"
                            :style="fg.examen ? 'border-color: #ffe0b2' : ''">
                            <div class="fg-fecha" style="font-size: 0.85em;">
                                {{ fg.fecha }}
                                <q-badge v-if="fg.examen" :color="getExamenColor(fg.examen)" text-color="white" size="sm" dense class="q-ml-xs text-bold">
                                    {{ fg.examen }}
                                </q-badge>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div v-if="sesion.semana <= 17 || sesion.temasSeleccionados?.length > 0">
                            <q-select v-model="sesion.temasSeleccionados" :options="opcionesTemasGlobales" multiple
                               use-input new-value-mode="add-unique" map-options dense outlined
                               class="cell-input" label="Temas" option-value="value" option-label="label"
                               @update:model-value="(val) => onTemaUpdate(val, sesion)">
                               
                               <template v-slot:selected-item="scope">
                                 <div class="custom-chip q-mb-xs">
                                   <div class="custom-chip-text">
                                     {{ scope.opt.label || scope.opt }}
                                   </div>
                                   <q-icon name="cancel" class="custom-chip-icon" @click.stop="scope.removeAtIndex(scope.index)"/>
                                 </div>
                               </template>
                             </q-select>
                           </div>
                           <div v-else class="text-caption text-grey text-center">--</div>
                         </td>
                         <td>
                           <div v-if="sesion.semana <= 17 || sesion.contenido_items_seleccionados?.length > 0 || sesion.contenido">
                             <q-select v-model="sesion.contenido_items_seleccionados"
                               :options="getContenidoItemsOptions(sesion)" multiple map-options
                               dense outlined class="cell-input q-mb-xs" label="Seleccionar Items" option-value="value"
                               option-label="label" :disable="!sesion.temasSeleccionados || sesion.temasSeleccionados.length === 0" 
                               :hint="!sesion.temasSeleccionados || sesion.temasSeleccionados.length === 0 ? 'Seleccione tema(s) primero' : ''" 
                               @update:model-value="marcarModificado(sesion)">
                               
                               <template v-slot:selected-item="scope">
                                 <div class="custom-chip q-mb-xs">
                                   <div class="custom-chip-text">
                                     {{ scope.opt.label || scope.opt }}
                                   </div>
                                   <q-icon name="cancel" class="custom-chip-icon" @click.stop="scope.removeAtIndex(scope.index)"/>
                                 </div>
                               </template>
                             </q-select>
                             
                             <q-input v-model="sesion.contenido" outlined dense type="textarea"
                               autogrow class="cell-input" placeholder="Contenido adicional..."
                               @update:model-value="marcarModificado(sesion)" />
                           </div>
                           <div v-else class="text-caption text-grey text-center">--</div>
                         </td>
                         <td>
                           <q-input v-if="sesion.semana <= 17 || sesion.conceptual" v-model="sesion.conceptual" outlined dense type="textarea"
                             autogrow class="cell-input" placeholder="Contenidos..."
                             @update:model-value="marcarModificado(sesion)" />
                         </td>
                         <td>
                           <q-input v-if="sesion.semana <= 17 || sesion.procedimental" v-model="sesion.procedimental" outlined dense
                             type="textarea" autogrow class="cell-input" placeholder="Habilidades..."
                             @update:model-value="marcarModificado(sesion)" />
                         </td>
                         <td>
                           <q-input v-if="sesion.semana <= 17 || sesion.actitudinal" v-model="sesion.actitudinal" outlined dense
                             type="textarea" autogrow class="cell-input" placeholder="Actitudes..."
                             @update:model-value="marcarModificado(sesion)" />
                         </td>
                         <td>
                           <q-select v-if="sesion.semana <= 17 || sesion.criteriosSeleccionados?.length > 0" v-model="sesion.criteriosSeleccionados" multiple
                              use-chips use-input @new-value="updateCriteriosOptions" 
                              :options="filterCriterios" @filter="filterFnCriterios"
                              outlined dense
                             class="cell-input" placeholder="Criterios..."
                             @update:model-value="marcarModificado(sesion)">
                             <template v-slot:no-option>
                               <q-item>
                                 <q-item-section class="text-grey">
                                   Presione Enter para agregar un criterio personalizado
                                 </q-item-section>
                               </q-item>
                             </template>
                           </q-select>
                         </td>
                         <td>
                           <q-select v-if="sesion.semana <= 17 || sesion.instrumentosSeleccionados?.length > 0" v-model="sesion.instrumentosSeleccionados" multiple
                             use-chips use-input @new-value="updateInstrumentosOptions" 
                             :options="filterInstrumentos" @filter="filterFnInstrumentos"
                             outlined
                             dense class="cell-input" placeholder="Instrumentos..."
                             @update:model-value="marcarModificado(sesion)">
                             <template v-slot:no-option>
                               <q-item>
                                 <q-item-section class="text-grey">
                                   Presione Enter para agregar un instrumento personalizado
                                 </q-item-section>
                               </q-item>
                             </template>
                           </q-select>
                         </td>
                       </tr>
                        <!-- <td class="cell-actions">
                          <q-btn flat round dense icon="delete" size="xs" color="red"
                            @click="eliminarSesion(unidad, sesion)" />
                        </td> -->
                    </template>
                  </tbody>
                </table>
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

            <div v-for="(unidad, uIdx) in planificacionAgrupada" :key="unidad.id" class="preview-unidad">
              <div class="preview-unidad-header">
                  {{ unidad.id === 'finales' ? '' : 'UNIDAD ' + (unidad.numero || (uIdx + 1)) + ':' }} {{ unidad.nombre }}
              </div>
              <div v-if="unidad.elementoCompetencia" class="preview-competencia">
                <strong>ELEMENTO DE COMPETENCIA:</strong>
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
                      <div v-for="(fg, idx) in getFechasGrupos(sesion)" :key="idx" class="fecha-grupo-row">
                        <div class="fg-grupo" style="font-weight: bold; color: #3f51b5;">{{ fg.grupo }}</div>
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

    <!-- Dialog Importar Cronograma (Standardized) -->
    <q-dialog v-model="showImportDialog">
      <q-card style="min-width: 500px;">
        <div class="dialog-header bg-orange">
          <h3><q-icon name="upload_file" class="q-mr-sm" />Importar Cronograma (PAC)</h3>
        </div>

        <q-card-section>
          <q-banner class="bg-blue-1 text-blue-9 q-mb-md" rounded dense>
            <template v-slot:avatar>
              <q-icon name="info" color="blue" />
            </template>
            <strong>Formato del Excel (Requerido):</strong>
            <ul class="q-ma-none q-pl-md text-caption">
              <li>Columna A: Nro Sesión</li>
              <li>Columna B: Semana</li>
              <li>Columna C: Fecha (DD/MM/YYYY)</li>
              <li>Columna D: Contenido (Solo referencia)</li>
              <li>Columna F: Conceptual</li>
              <li>Columna G: Procedimental</li>
              <li>Columna H: Actitudinal</li>
              <li>Columna I: Criterios</li>
              <li>Columna J: Instrumentos</li>
            </ul>
          </q-banner>

          <div class="text-center q-pa-lg upload-zone" @dragover.prevent @drop.prevent="onDropCronograma">
             <input type="file" ref="fileInputCronograma" @change="onFileSelectedCronograma" accept=".xlsx,.xls" style="display: none" />
            
            <div v-if="!selectedFile">
              <q-icon name="cloud_upload" size="64px" color="grey-4" />
              <p class="text-grey-6 q-mt-md">Arrastra el archivo PAC aquí o</p>
              <q-btn outline color="orange" label="Seleccionar Excel" no-caps @click="$refs.fileInputCronograma.click()" />
            </div>

            <div v-else>
              <q-icon name="description" size="48px" color="green" />
              <p class="text-subtitle1 q-mt-sm text-weight-medium">{{ selectedFile.name }}</p>
              <p class="text-caption text-grey-6">{{ (selectedFile.size / 1024).toFixed(2) }} KB</p>

              <q-btn flat color="red" label="Quitar" no-caps icon="close" @click="selectedFile = null" />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="row justify-center items-center">
            <q-toggle
              v-model="soloTeoricas"
              label="Importar solo en sesiones teóricas"
              color="indigo"
              left-label
            />
            <q-icon name="info" color="grey-7" size="sm" class="q-ml-xs cursor-pointer">
              <q-tooltip class="bg-indigo text-white" style="max-width: 250px">
                Usa esta opción si tu asignatura solo tiene planificación teórica en el PAC (por ejemplo, si las prácticas se realizan en clínica, laboratorios especiales, anfiteatro, etc.).
              </q-tooltip>
            </q-icon>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="showImportDialog = false" />
          <q-btn unelevated color="orange" label="Importar Cronograma" icon="upload" no-caps :disable="!selectedFile"
            @click="procesarImportacionCronograma" />
        </q-card-actions>
      </q-card>
    </q-dialog>



    <!-- Dialog Vaciar Cronograma -->
    <q-dialog v-model="showVaciarDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="red" text-color="white" />
          <span class="q-ml-sm text-h6">¿Está seguro de vaciar el cronograma?</span>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <p class="text-caption text-grey-8">Esta acción eliminará todos los temas y contenidos cargados actualmente. No se puede deshacer.</p>
          <p>Para confirmar, escriba <strong>vaciar</strong> a continuación:</p>
          <q-input v-model="confirmacionTexto" dense autofocus @keyup.enter="ejecutarVaciar" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Vaciar" color="red" :disable="confirmacionTexto.toLowerCase() !== 'vaciar'" @click="ejecutarVaciar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Reestructurar Cronograma -->
    <q-dialog v-model="showReestructuraDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar icon="priority_high" color="orange" text-color="white" />
          <span class="q-ml-sm text-h6">¿Reestructurar cronograma?</span>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <p class="text-caption text-grey-8">Se volverá a generar la estructura base de sesiones según los conteos teóricos/prácticos actuales. Las sesiones existentes intentarán preservarse si su número global coincide.</p>
          <p>Para confirmar, escriba <strong>reestructura</strong> a continuación:</p>
          <q-input v-model="confirmacionTexto" dense autofocus @keyup.enter="ejecutarReestructura" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Reestructurar" color="indigo" :disable="confirmacionTexto.toLowerCase() !== 'reestructura'" @click="ejecutarReestructura" />
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
import asignaturaService from 'src/services/asignaturaService'
import { useAuthStore } from 'src/stores/auth'

const route = useRoute()
const $q = useQuasar()
const authStore = useAuthStore()
const asignaturasStore = useAsignaturasStore()
const rolExamenesStore = useRolExamenesStore()


const tabActual = ref('horario')
const gestionSeleccionada = ref('2026-I')
const showCopiarDialog = ref(false)
const planificacionGenerada = ref(false)
// const guardando = ref(false) // Ya no se usa guardando manual, usamos saveStatus
const saveStatus = ref('idle') // 'idle' | 'saving' | 'saved' | 'error'
let dataLoaded = false
let lastSavedSnapshot = ''

const gestionACopiar = ref(null)
const showVaciarDialog = ref(false)
const showReestructuraDialog = ref(false)
const confirmacionTexto = ref('')
const tableContainerRef = ref(null)

// Computed para extraer fechas de exámenes de la planificación generada o del rol oficial
const fechasExamenes = computed(() => {
    // 1. Prioridad: Rol de Exámenes Oficial (cargado desde Admin)
  if (examenesRol.value.length > 0) {
    let oficiales = [...examenesRol.value]

    // Mostrar todos los exámenes de la materia, sin filtrar por grupo seleccionado
    // ya que se eliminó el selector.
    
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





const gestionesAnteriores = [
  { label: 'Gestión 2025-II', value: '2025-II' },
  { label: 'Gestión 2025-I', value: '2025-I' },
]



const asignatura = computed(() => asignaturasStore.asignaturaActual)

// Horarios desde API externa
const horariosAPI = ref([])

// Exámenes cargados del rol (Director de Carrera)
const examenesRol = ref([])

// La función saveAsignaturaConfig fue removida ya que los inputs de sesiones fueron eliminados.
// El sistema ahora calcula las sesiones automáticamente del horario.

onMounted(async () => {
  const id = parseInt(route.params.id)

  // Extract params
  const params = {}
  if (route.query.docente_id) params.docente_id = route.query.docente_id
  if (route.query.carrera_id) params.carrera_id = route.query.carrera_id
  if (route.query.sede_id) params.sede_id = route.query.sede_id

  // IMPORTANTE: Esperar a que se cargue la asignatura antes de buscar horarios
  await asignaturasStore.setAsignaturaActual(id, params)

  // REMOVED: Auto-select first group. We want to show ALL schedules by default.
  // activeGroupId.value = ... 

  // 1. Cargar horarios (Prioridad: Necesario para calcular fechas de planificación)
  await cargarHorariosAsignatura()

  // 2. Cargar planificación (Depende de horarios para asignar fechas)
  await cargarPlanificacion()

  // Cargar rol de exámenes para esta materia
  await cargarExamenesRol()
})

async function cargarPlanificacion() {
  // REMOVED: Dependency on activeGroupId. We load Master Plan (group_id = null)
  let targetGrupoId = null 
  // The 'ALL' option is removed, so this block is no longer needed.
  // if (targetGrupoId === 'ALL') {
  //   if (asignatura.value?.horarios_data?.length > 0) {
  //     targetGrupoId = asignatura.value.horarios_data[0].id
  //   } else {
  //     return // No hay grupos, nada que cargar
  //   }
  // }

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

          // Convertir arrays a strings para los q-input (textareas)
          sesionView.conceptual = Array.isArray(db.contenido_conceptual)
            ? db.contenido_conceptual.join('\n')
            : db.contenido_conceptual || ''

          sesionView.procedimental = Array.isArray(db.contenido_procedimental)
            ? db.contenido_procedimental.join('\n')
            : db.contenido_procedimental || ''

          sesionView.actitudinal = Array.isArray(db.contenido_actitudinal)
            ? db.contenido_actitudinal.join('\n')
            : db.contenido_actitudinal || ''

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
          // Cargar contenido manual desde observaciones
          sesionView.contenido = db.observaciones || ''
        }
      })

      planificacionGenerada.value = true

      // SORT: Since we now have chronological numbering, we just sort by numeroGlobal
      planificacionSesiones.value.sort((a, b) => a.numeroGlobal - b.numeroGlobal)

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


const unidadesDocumentacion = computed(() => asignatura.value?.unidades || [])

const calendario = ref({ fechaInicio: '2026-02-09', fechaFin: '2026-06-27' })
const totalSemanas = computed(() => 20)
const horarios = ref([])

/**
 * Cargar horarios desde los datos locales de la asignatura (pivote docentes)
 */
// Watch para actualizar horarios al cambiar de grupo
// Watch removed - horarios updated in onMounted or when asignatura changes

/**
 * Actualizar horarios basados en el grupo seleccionado
 */
function actualizarHorariosDesdeGrupo() {
  if (!asignatura.value?.horarios_data) {
    horarios.value = []
    return
  }

  // const targetId = activeGroupId.value // REMOVED
  const todosLosHorarios = []

  asignatura.value.horarios_data.forEach((grupoData) => {
    // REMOVED: Filtering by group. Show ALL.
    // if (targetId && grupoData.id !== targetId) return


    if (grupoData.horarios && grupoData.horarios.length > 0) {
      const horariosGrupo = grupoData.horarios.map((h) => ({
        dia: h.dia,
        horaInicio: h.hora_inicio?.substring(0, 5),
        horaFin: h.hora_fin?.substring(0, 5),
        aula: h.aula || 'Sin Aula',
        grupo: grupoData.grupo,
        tipoClase: grupoData.tipo || (h.tipo === 'T' ? 'Teórica' : 'Práctica'),
        desdeAPI: true,
        docente: grupoData.docente_nombre,
        id: h.id,
        id_horario_api: h.id_horario_api,
        asignatura_id: grupoData.asignatura_id,
        carrera_id: grupoData.carrera_id,
        sede_id: grupoData.sede_id,
        grupo_id: grupoData.id,
        codigoAsignatura: asignatura.value?.codigo,
        esComun: !!asignatura.value?.comun_token || !!asignatura.value?.comun_tipo,
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
  actualizarHorariosDesdeGrupo()
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

const planificacionSesiones = ref([])
const planificacion = computed(() => {
  // Las sesiones ya vienen numeradas y ordenadas cronológicamente en la lista plana.
  // Solo aseguramos un orden estable por número global.
  return [...planificacionSesiones.value].sort((a, b) => a.numeroGlobal - b.numeroGlobal)
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

  // Combinar etiquetas seleccionadas con contenido manual
  const combined = [...selectedLabels]
  if (sesion.contenido && typeof sesion.contenido === 'string' && sesion.contenido.trim()) {
      // Evitar duplicados si el manual es igual a alguna etiqueta (opcional)
      if (!combined.includes(sesion.contenido.trim())) {
          combined.push(sesion.contenido.trim())
      }
  }

  return combined.join('\n')
}

// Lista global de todos los temas de todas las unidades
const opcionesTemasGlobales = computed(() => {
  const opciones = []
  let globalIndex = 1
  unidadesDocumentacion.value.forEach((u) => {
    ; (u.temas || []).forEach((t) => {
      const titulo = typeof t === 'string' ? t : t.titulo || t.nombre || ''
      opciones.push({
        label: `${globalIndex}. ${titulo}`,
        value: t.id || titulo,
        unidad_id: u.id,
        unidad_nombre: u.titulo,
      })
      globalIndex++
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

const totalSesionesGeneradas = computed(() => planificacion.value.length)

const sesionesSugeridas = computed(() => {
  if (!horarios.value.length) return { teoricas: 0, practicas: 0 }
  
  const esTeorico = (t) => {
      if (!t) return false
      const s = String(t).toUpperCase()
      return s.includes('TEORICA') || s.includes('TEÓRICA') || s.includes('TEORICO') || s === 'T'
  }
  const esPractico = (t) => {
      if (!t) return false
      const s = String(t).toUpperCase()
      return s.includes('PRACTICA') || s.includes('PRÁCTICA') || s.includes('PRACTICO') || s === 'P'
  }

  // Opción 1: Contar BLOQUES ÚNICOS (Mismo día y misma hora de inicio)
  // Esto funciona si todos los grupos de teoría ocurren al mismo tiempo.
  // Pero qué si hay Grupo A (Lun 8) y Grupo B (Mar 10) de teoría?
  // Lo mejor es ver cuántos bloques de cada tipo tiene CADA grupo y tomar el MÁXIMO
  // (Asumiendo que todos los grupos llevan la misma carga horaria).
  
  const conteosPorGrupo = {}
  horarios.value.forEach(h => {
    const gid = h.grupo_id || 'default'
    if (!conteosPorGrupo[gid]) conteosPorGrupo[gid] = { t: 0, p: 0 }
    
    if (esTeorico(h.tipoClase)) {
        conteosPorGrupo[gid].t++
    } else if (esPractico(h.tipoClase)) {
        conteosPorGrupo[gid].p++
    }
  })

  // Tomamos el MÁXIMO de sesiones de cualquier grupo.
  // Ejemplo: Si el docente tiene 3 grupos que se reunen 1 vez/semana, el máximo es 1.
  const gruposList = Object.values(conteosPorGrupo)
  if (gruposList.length === 0) return { teoricas: 0, practicas: 0 }

  return {
    teoricas: Math.max(...gruposList.map(g => g.t)),
    practicas: Math.max(...gruposList.map(g => g.p))
  }
})

const progresoTotal = computed(() => {
  if (!totalSesionesGeneradas.value) return 0
  const completadas = planificacion.value.filter((s) => s.tema && s.conceptual && s.procedimental).length
  return Math.round((completadas / totalSesionesGeneradas.value) * 100)
})

const planificacionAgrupada = computed(() => {
    if (!planificacion.value.length) return []
    
    // Agrupar las sesiones planas por su unidad_id
    const grupos = {}
    
    // Obtener info de unidades para los nombres
    const infoUnidades = {}
    unidadesDocumentacion.value.forEach(u => {
        infoUnidades[u.id] = { 
            nombre: u.titulo || u.nombre, 
            elementoCompetencia: u.elemento_competencia || u.elementoCompetencia,
            numero: u.numero
        }
    })

    planificacion.value.forEach(s => {
        const uid = s.unidad_id || 'otras'
        if (!grupos[uid]) {
            grupos[uid] = {
                id: uid,
                nombre: infoUnidades[uid]?.nombre || 'Otras Sesiones / Exámenes',
                elementoCompetencia: infoUnidades[uid]?.elementoCompetencia || '',
                numero: infoUnidades[uid]?.numero || '',
                sesiones: []
            }
        }
        grupos[uid].sesiones.push(s)
    })

    // Retornar como array ordenado por el ID de unidad (o el orden de las unidades originales)
    // Para mantener el orden académico:
    const resultado = []
    unidadesDocumentacion.value.forEach(u => {
        if (grupos[u.id]) resultado.push(grupos[u.id])
    })
    
    // Agregar exámenes / otros al final
    if (grupos['finales']) resultado.push(grupos['finales'])
    if (grupos['otras'] && !resultado.find(r => r.id === 'otras')) resultado.push(grupos['otras'])

    return resultado
})



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

// Mapeo detallado de exámenes por fecha
const fechasExamenMap = computed(() => {
  const map = {}
  if (examenesRol.value && examenesRol.value.length > 0) {
    examenesRol.value.forEach((ex) => {
      const raw = ex.fecha_examen || ex.fecha
      if (raw) {
        // Robusto: split por T o espacio para obtener solo YYYY-MM-DD
        const dateOnly = raw.includes('T') ? raw.split('T')[0] : raw.split(' ')[0]
        map[dateOnly] = ex.tipo_examen || ex.tipo
      }
    })
  }
  return map
})

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
  
  const todasLasSesiones = []
  let sesionGlobal = 1

  // Determinar número de sesiones por tipo basado en el cálculo automático (Sugeridos)
  const numTeoricas = sesionesSugeridas.value.teoricas
  const numPracticas = sesionesSugeridas.value.practicas
  
  // Validar si hay configuración
  if (numTeoricas === 0 && numPracticas === 0) {
      return []
  }

  // Obtener estado actual para PRESERVAR datos
  const estadoActual = planificacionSesiones.value || []

  for (let semana = 1; semana <= totalSemanas.value; semana++) {
    const fechaSemanaInicio = new Date(mondayOfFirstWeek)
    fechaSemanaInicio.setDate(mondayOfFirstWeek.getDate() + (semana - 1) * 7)
    const fechaSemanaInicioStr = formatDate(fechaSemanaInicio)

    const sesionesSemana = []

    // 1. Identificar e identificar slots del horario que sean del tipo correcto
    const isTeorico = (t) => {
        if (!t) return false
        const s = t.toUpperCase()
        return s.includes('TEORICA') || s.includes('TEÓRICA') || s.includes('TEORICO') || s === 'T'
    }
    const isPractico = (t) => {
        if (!t) return false
        const s = t.toUpperCase()
        return s.includes('PRACTICA') || s.includes('PRÁCTICA') || s.includes('PRACTICO') || s === 'P'
    }

    // Tomamos los slots ordenados del horario pero limitamos a la cantidad oficial por semana
    const tSlots = (horariosOrdenados.value || []).filter(h => isTeorico(h.tipoClase)).slice(0, numTeoricas)
    const pSlots = (horariosOrdenados.value || []).filter(h => isPractico(h.tipoClase)).slice(0, numPracticas)
    const combinedWeeklySlots = [...tSlots, ...pSlots].sort(sortHorariosDiaHora)

    let tCounter = 1
    let pCounter = 1

    combinedWeeklySlots.forEach((slot) => {
        const numG = sesionGlobal++
        const isTheory = isTeorico(slot.tipoClase)
        const currentIndice = isTheory ? tCounter++ : pCounter++
        
        const existing = estadoActual.find(s => s.numeroGlobal === numG)
        
        // Calcular fecha específica para este slot
        let fechaCalculada = ''
        const d = new Date(fechaSemanaInicio)
        d.setDate(fechaSemanaInicio.getDate() + (getNroDia(slot.dia) - 1))
        fechaCalculada = d.toISOString().split('T')[0]

        const tipoDisplay = isTheory ? 'Teórica' : 'Práctica'
        const sBase = crearSesionBase(numG, semana, fechaSemanaInicioStr, tipoDisplay, currentIndice)
        sBase.fecha = fechaCalculada
        
        // PRESERVAR: Si ya existe y tiene contenido, mantenerlo
        if (existing && (existing.tema || existing.conceptual || existing.temasSeleccionados?.length > 0)) {
            Object.assign(sBase, {
                tema: existing.tema,
                tema_id: existing.tema_id,
                temasSeleccionados: existing.temasSeleccionados,
                conceptual: existing.conceptual,
                procedimental: existing.procedimental,
                actitudinal: existing.actitudinal,
                criteriosDesempeno: existing.criteriosDesempeno,
                instrumentosEvaluacion: existing.instrumentosEvaluacion,
                criteriosSeleccionados: existing.criteriosSeleccionados,
                instrumentosSeleccionados: existing.instrumentosSeleccionados,
                contenido_items_seleccionados: existing.contenido_items_seleccionados,
                contenido: existing.contenido,
                unidad_id: existing.unidad_id,
            })
        }
        sesionesSemana.push(sBase)
    })

    // 2. Marcar la Sesión de Examen (A pedido del usuario, no bloqueamos la fila)
    // Se ha movido la lógica de resaltado visual a getSesionRowClass para mayor precisión con el Rol oficial.

    todasLasSesiones.push(...sesionesSemana)
  }


  // No automatic topic distribution as requested by the user.
  // The schedule will be generated empty, preserving only exams.

  return todasLasSesiones
}

function crearSesionBase(id, semana, semanaFechas, tipo, indiceTipo) {
    // Intentar deducir si es semana de examen basándose en la fecha APROXIMADA
    // Como ahora generamos abstractamente, la fecha exacta depende del grupo.
    // Usaremos la fecha del Lunes de la semana como referencia para buscar exámenes.
    // La detección de examen ahora se hace dinámicamente en getFechasGrupos para mayor precisión
    const esExamen = false
    const nombreExamen = null

    return {
        id: id,
        numeroGlobal: id,
        semana: semana,
        semanaFechas: semanaFechas,
        dia: '', // Se calculará dinámicamente en la vista "Fechas / Grupos"
        fecha: '', // Se calculará dinámicamente
        tipoClase: tipo,
        indiceTipo: indiceTipo, // 1st Theory, 2nd Theory... para mapear con slots
        esExamen: esExamen,
        tipoExamen: nombreExamen,
        periodoExamen: nombreExamen || (esExamen ? 'Examen' : null),
        grupo_id: null,
        tema: '', // Libre por defecto
        conceptual: '',
        procedimental: '',
        actitudinal: '',
        criteriosDesempeno: '',
        instrumentosEvaluacion: esExamen ? 'Examen escrito' : '',
        temasSeleccionados: [],
        criteriosSeleccionados: [],
        instrumentosSeleccionados: esExamen ? ['Examen escrito'] : [],
        contenido_items_seleccionados: [],
        modificado: false,
        bloqueado: false, // Permitir edición siempre
        unidad_id: 'finales' // Default, se sobreescribe
    }
}

function confirmarVaciar() {
  confirmacionTexto.value = ''
  showVaciarDialog.value = true
}

function confirmarReestructura() {
  confirmacionTexto.value = ''
  showReestructuraDialog.value = true
}

async function ejecutarVaciar() {
  if (confirmacionTexto.value.toLowerCase() !== 'vaciar') return
  
  $q.loading.show({ message: 'Vaciando cronograma...' })
  try {
    planificacionSesiones.value.forEach(s => {
      s.tema = s.esExamen ? s.tipoExamen : ''
      s.tema_id = null
      s.temasSeleccionados = []
      s.conceptual = ''
      s.procedimental = ''
      s.actitudinal = ''
      s.criteriosDesempeno = ''
      s.instrumentosEvaluacion = s.esExamen ? 'Examen escrito' : ''
      s.criteriosSeleccionados = []
      s.instrumentosSeleccionados = s.esExamen ? ['Examen escrito'] : []
      s.contenido_items_seleccionados = []
      s.contenido = ''
      s.modificado = true
      // No quitar unidad_id para que no se pierda la agrupación visual si ya tiene una asignada
    })
    
    await guardarTodo(true)
    showVaciarDialog.value = false
    $q.notify({ type: 'positive', message: 'Cronograma vaciado correctamente' })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al vaciar cronograma' })
  } finally {
    $q.loading.hide()
  }
}

async function ejecutarReestructura() {
  if (confirmacionTexto.value.toLowerCase() !== 'reestructura') return
  
  try {
    // Generar de nuevo usando la lógica actualizada (que preserva contenidos si existen)
    await ejecutarGeneracionPlanificacion(false)
    showReestructuraDialog.value = false
  } catch (err) {
    console.error(err)
  }
}

async function generarPlanificacion(silent = false) {
  if (!silent) {
    const teoricas = sesionesSugeridas.value.teoricas
    const practicas = sesionesSugeridas.value.practicas
    
    return new Promise((resolve) => {
      $q.dialog({
        title: 'Confirmar Generación',
        message: `Se generarán <b>${teoricas} sesiones teóricas</b> y <b>${practicas} sesiones prácticas</b> semanales basadas en el horario oficial.<br><br>
                  <i>Nota: Esta estructura se calcula automáticamente a partir de los horarios de clases asignados.</i><br><br>
                  ¿Desea continuar con la generación de la planificación?`,
        html: true,
        cancel: 'Cancelar',
        ok: {
          label: 'Generar Planificación',
          color: 'primary'
        },
        persistent: true
      }).onOk(async () => {
        await ejecutarGeneracionPlanificacion(silent)
        resolve()
      }).onCancel(() => {
        resolve()
      })
    })
  } else {
    return ejecutarGeneracionPlanificacion(silent)
  }
}

async function ejecutarGeneracionPlanificacion(silent = false) {
  if (!silent) $q.loading.show({ message: 'Generando y persistiendo cronograma...' })

  try {
    // 1. Calcular propuesta usando la nueva función pura
    const propuestas = calcularPropuestaPlanificacion()

    // 2. Aplicar a la reactividad (ya vienen ordenadas de calcularPropuestaPlanificacion)
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

function isFirstSesionOfSemana(list, sesion) {
  const idx = list.findIndex((s) => s.id === sesion.id)
  if (idx === 0) return true
  return list[idx].semana !== list[idx - 1].semana
}

function scrollTable(direction) {
  if (tableContainerRef.value) {
    const scrollAmount = 400; // Pixels to scroll per click
    tableContainerRef.value.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }
}

function getSemanaRowspan(list, sesion) {
  return list.filter((s) => s.semana === sesion.semana).length
}

function getExamenColor(periodo) {
  if (periodo.includes('1er')) return 'blue'
  if (periodo.includes('2do')) return 'orange'
  if (periodo.includes('Final')) return 'purple'
  return 'red'
}

function getSesionRowClass(sesion) {
  const fg = getFechasGrupos(sesion)
  if (fg.some((f) => f.examen)) return 'sesion-examen'
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
    for (const rawVal of sesion.temasSeleccionados) {
      // rawVal puede ser un número, un string o un objeto {value, label, unidad_id}
      // dependiendo de si el q-select usa emit-value o no
      const temaId = rawVal !== null && typeof rawVal === 'object' ? rawVal.value : rawVal
      const tema = unidad.temas?.find((t) => t.id == temaId)
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




async function ejecutarCopia() {
  if (!gestionACopiar.value) {
    $q.notify({ type: 'warning', message: 'Seleccione una gestión de origen', icon: 'warning' })
    return
  }

  $q.loading.show({ message: 'Copiando planificación...' })
  try {
    // 0. Autoseleccionar grupo si no hay uno seleccionado
    // REMOVED: No group selection needed for Master Plan copy
    
    // const grupoId = activeGroupId.value; // REMOVED

    const response = await planificacionSemestralService.copiarPlanificacion(route.params.id, {
      gestion_origen: gestionACopiar.value,
      grupo_id: null, // Copy to Master Plan
      docente_id: authStore.user?.docente?.id // Send docent ID for personalized fetching
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
    // Determine target group ID - NOW OPTIONAL (Masters enabled)
    // If no group selected, we save to MASTER (grupo_id = null)
    let targetGrupoId = null // FORCE MASTER PLAN

    const sesiones = []
    planificacionSesiones.value.forEach((sesion) => {
      // Sincronizar arrays a strings antes de guardar
      if (Array.isArray(sesion.temasSeleccionados))
        sesion.tema = sesion.temasSeleccionados.join(', ')
      if (Array.isArray(sesion.criteriosSeleccionados))
        sesion.criteriosDesempeno = sesion.criteriosSeleccionados.join(', ')
      if (Array.isArray(sesion.instrumentosSeleccionados))
        sesion.instrumentosEvaluacion = sesion.instrumentosSeleccionados.join(', ')

      // Helper to extract numeric ID from either a plain number or a q-select option object
      const extractTemaId = (v) => {
        if (v === null || v === undefined) return null
        if (typeof v === 'object') return typeof v.value === 'number' ? v.value : null
        return typeof v === 'number' ? v : null
      }
      const temasIds = Array.isArray(sesion.temasSeleccionados)
        ? sesion.temasSeleccionados.map(extractTemaId).filter((id) => id !== null)
        : []

      // Preparar para el backend
      const sDB = {
        ...sesion,
        contenido_conceptual: sesion.conceptual,
        contenido_procedimental: sesion.procedimental,
        contenido_actitudinal: sesion.actitudinal,
        numero_sesion: sesion.numeroGlobal,
        tema_id:
          sesion.tema_id ||
          (temasIds.length > 0 ? temasIds[0] : null),
        temas_ids: temasIds,
        contenido_items_seleccionados: sesion.contenido_items_seleccionados || [],
        observaciones: sesion.contenido || '', // Guardar contenido manual en observaciones
        tipoClase: sesion.tipoClase // Send type explicitly (Teórica/Práctica)
      }

      // REMOVED: Date saving logic from here. Dates are now projected on the fly or saved via Execution.
      // We DO NOT save calculated dates to Master.
      // If a group is selected, we could save execution dates, but for now we follow the new "Projection" paradigm.
      // IF the user explicitly WANTS to save dates (e.g. manual override), we would add it here.
      // For now, let's keep sDB.fecha clean for Master.

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

// Opciones recomendadas (ahora reactivas para añadir nuevos valores)
const criteriosOptions = ref([
  'Analiza componentes',
  'Diseña soluciones',
  'Implementa servicios',
  'Evalúa rendimiento',
  'Documenta procesos',
])
const instrumentosOptions = ref([
  'Lista de cotejo',
  'Rúbrica de evaluación',
  'Prueba escrita',
  'Defensa oral',
  'Informe de laboratorio',
])

const filterCriterios = ref([...criteriosOptions.value])
const filterInstrumentos = ref([...instrumentosOptions.value])

function filterFnCriterios(val, update) {
  update(() => {
    const needle = val.toLowerCase()
    let results = criteriosOptions.value.filter(v => v.toLowerCase().indexOf(needle) > -1)
    if (val && !criteriosOptions.value.some(v => v.toLowerCase() === val.toLowerCase())) {
        results.unshift(val)
    }
    filterCriterios.value = results
  })
}

function filterFnInstrumentos(val, update) {
  update(() => {
    const needle = val.toLowerCase()
    let results = instrumentosOptions.value.filter(v => v.toLowerCase().indexOf(needle) > -1)
    if (val && !instrumentosOptions.value.some(v => v.toLowerCase() === val.toLowerCase())) {
        results.unshift(val)
    }
    filterInstrumentos.value = results
  })
}

function updateCriteriosOptions(val, done) {
  if (val.length > 0) {
    if (!criteriosOptions.value.some(v => v.toLowerCase() === val.toLowerCase())) {
      criteriosOptions.value.push(val)
    }
    done(val, 'add-unique')
  }
}

function updateInstrumentosOptions(val, done) {
  if (val.length > 0) {
    if (!instrumentosOptions.value.some(v => v.toLowerCase() === val.toLowerCase())) {
      instrumentosOptions.value.push(val)
    }
    done(val, 'add-unique')
  }
}

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

// Calculo mapeado de fechas abstractas a grupales
function calcularFechasTodosLosGrupos() {
  const map = {}
  
  if (!asignatura.value?.horarios_data) return

  // Usamos el mismo lunes de inicio
  const fechaInicioStr = calendario.value.fechaInicio + 'T12:00:00'
  const inputFecha = new Date(fechaInicioStr)
  const day = inputFecha.getDay() || 7
  const mondayOfFirstWeek = new Date(inputFecha)
  if (day !== 1) mondayOfFirstWeek.setDate(inputFecha.getDate() - day + 1)
  mondayOfFirstWeek.setHours(0, 0, 0, 0)
  
  // Agrupar horarios por grupo y ordenarlos
  const gruposConHorarios = asignatura.value.horarios_data.map(g => {
      // Usar el campo 'tipo' si existe, fallback a detección por nombre de grupo
      // Normalizar comprobación de tipo (TEORICO, Teórica, T, etc)
      let esTeorico = false
      if (g.tipo) {
          const t = g.tipo.toUpperCase()
          esTeorico = t === 'TEÓRICA' || t === 'TEORICA' || t === 'TEORICO' || t === 'T'
      } else {
          esTeorico = !isNaN(g.grupo) && g.grupo.toString().trim() !== ''
      }
      
      return {
          grupo: g.grupo,
          esTeorico: esTeorico,
          horarios: (g.horarios || []).sort(sortHorariosDiaHora)
      }
  })

  // Pre-calcular fechas para 20 semanas
  // sesionID = numeroGlobal
  if (!planificacion.value) return 
  
  planificacion.value.forEach(sesion => {
      // Calculamos fechas para todas las sesiones

      const sem = sesion.semana
      const tipo = sesion.tipoClase // 'Teórica' o 'Práctica'
      const indice = sesion.indiceTipo || 1 // 1, 2...
      
      const inicioSem = new Date(mondayOfFirstWeek)
      inicioSem.setDate(mondayOfFirstWeek.getDate() + (sem - 1) * 7)

      const fechasGrupo = []

      gruposConHorarios.forEach(gData => {
          // Filtrar por tipo coincidente
          const grupoIsTheory = gData.esTeorico
          const sessionIsTheory = (tipo === 'Teórica')
          
          if (grupoIsTheory !== sessionIsTheory) return

          const listaHorarios = gData.horarios
          // Si el grupo tiene suficiente horarios
          if (listaHorarios && listaHorarios.length >= indice) {
              const h = listaHorarios[indice - 1]
              
              // Calcular fecha exacta
              const diaNum = getNroDia(h.dia)
              const dIndex = diaNum >= 1 && diaNum <= 7 ? diaNum - 1 : 0
              const fSesion = new Date(inicioSem)
              fSesion.setDate(inicioSem.getDate() + dIndex)
              
              // Format: G->1, 9/2/2026 8:15
              const dStr = `${String(fSesion.getDate())}/${String(fSesion.getMonth() + 1)}/${fSesion.getFullYear()}`
              const timeStr = h.hora_inicio ? h.hora_inicio.substring(0, 5) : ''
              
              // Calcular fecha exacta YYYY-MM-DD local para matchear con el mapa
              const year = fSesion.getFullYear()
              const month = String(fSesion.getMonth() + 1).padStart(2, '0')
              const dayStr = String(fSesion.getDate()).padStart(2, '0')
              const fechaKey = `${year}-${month}-${dayStr}`
              const nombreExamen = fechasExamenMap.value[fechaKey]

              fechasGrupo.push({
                  grupo: gData.grupo,
                  fecha: `G->${gData.grupo}, ${h.dia?.substring(0, 2) || ''} ${dStr} ${timeStr}`,
                  examen: nombreExamen
              })
          }
      })
      
      map[sesion.numeroGlobal] = fechasGrupo
  })

  fechasGlobales.value = map
}

function sortHorariosDiaHora(a, b) {
    const diaA = getNroDia(a.dia)
    const diaB = getNroDia(b.dia)
    if (diaA !== diaB) return diaA - diaB
    return (a.hora_inicio || '').localeCompare(b.hora_inicio || '')
}

function getFechasGrupos(sesion) {
  // Si es objeto sesion completo
  const id = sesion.numeroGlobal || sesion
  return fechasGlobales.value[id] || []
}

// Recalcular al montar o cambiar
watch(
  [() => asignatura.value, horarios, planificacionSesiones, examenesRol, fechasExamenMap],
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
  { debounce: 800, maxWait: 5000, deep: true },
)

onMounted(() => {
  calcularFechasTodosLosGrupos()
})



// Importar Cronograma (Excel) - Ported from AsignaturaEditPage
// Import logic
const showImportDialog = ref(false)
const selectedFile = ref(null)
const soloTeoricas = ref(false) // Desactivado por defecto

function abrirDialogoImportarCronograma() {
  selectedFile.value = null
  showImportDialog.value = true
}

function onFileSelectedCronograma(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

function onDropCronograma(event) {
  const file = event.dataTransfer.files[0]
  if (file) {
    selectedFile.value = file
  }
}

async function procesarImportacionCronograma() {
  if (!selectedFile.value) return

  $q.loading.show({ message: 'Importando y guardando Cronograma...' })
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('solo_teoricas', soloTeoricas.value ? '1' : '0')
    
    // Enviar grupo_id si está seleccionado
    // REMOVED: Always import to Master Plan
    // if (activeGroupId.value) { ... }

    // Call service
    const response = await asignaturaService.importarCronograma(route.params.id, formData)

    // Alert success
    $q.dialog({
      title: 'Cronograma Importado',
      message: response.data.message,
      ok: 'Entendido'
    }).onDismiss(() => {
      // Recargar planificación para ver los cambios
      cargarPlanificacion()
      showImportDialog.value = false
      selectedFile.value = null
    })

  } catch (error) {
    console.error('Error importando cronograma:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.error || 'Error al importar cronograma'
    })
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

.horario-card .session-info-box {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px 32px;
  min-width: 200px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.session-info-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.api-badge-container {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 4px;
}

.api-badge {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  width: 100%;
  display: block;
}

.sesiones-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
  table-layout: fixed; /* Re-enabled to enforce strict widths */
}

.sesiones-table th {
  background: #4338ca;
  color: white;
  padding: 8px 4px;
  text-align: center;
  font-size: 0.6rem;
  text-transform: uppercase;
  word-wrap: break-word;
}

.sesiones-table td {
  border: 1px solid var(--border-color);
  padding: 4px;
  vertical-align: top;
  word-wrap: break-word;
  overflow: hidden; /* Prevent content from pushing width */
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
  padding: 8px;
  vertical-align: top;
}

.dialog-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #4338ca, #3730a3);
  color: white;
  margin: -16px -16px 16px -16px;
}

.dialog-header.bg-green {
  background: linear-gradient(135deg, #10b981, #059669);
}

.dialog-header.bg-primary {
  background: linear-gradient(135deg, #1976d2, #1565c0);
}

.dialog-header.bg-orange {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
}

.dialog-actions {
  padding: 16px 24px;
}

.upload-zone {
  border: 2px dashed #ccc;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.upload-zone:hover {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
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

/* Sobrevivir truncado (ellipsis) en chips dentros de q-select en la tabla */
.sesiones-table .q-chip,
.sesiones-table .q-chip .ellipsis {
  height: auto !important;
  white-space: normal !important;
  text-overflow: clip !important;
  overflow: visible !important;
  word-wrap: break-word !important;
  word-break: break-word !important;
  padding-top: 4px;
  padding-bottom: 4px;
  max-width: 100% !important;
  width: 100% !important;
}

.sesiones-table .q-chip__content {
  white-space: normal !important;
  display: flex !important;
  align-items: center;
  line-height: 1.2;
  text-overflow: clip !important;
  overflow: visible !important;
  flex-wrap: wrap;
  width: 100% !important;
  justify-content: space-between;
}

/* Estilos de custom chips para solucionar problemas con Quasar */
.custom-chip {
  background-color: #f5f5f5; /* equivalente a grey-2 aprox */
  color: black;
  border-radius: 12px;
  font-size: 11px;
  line-height: 1.2;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  width: fit-content;
  border: 1px solid #ccc;
  word-break: break-all; /* Fallback for very long text without spaces */
  word-break: break-word;
  white-space: normal;
  overflow-wrap: break-word;
}
.custom-chip-text {
  flex: 1;
  min-width: 0;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
}
.custom-chip-icon {
  font-size: 16px;
  margin-left: 6px;
  color: #757575; /* grey-6 */
  cursor: pointer;
  flex-shrink: 0;
}
.custom-chip-icon:hover {
  color: #c62828;
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
