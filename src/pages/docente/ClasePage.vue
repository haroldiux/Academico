<template>
   <q-page class="clase-page">
      <div class="page-header q-mb-md">
         <div>
            <h1 class="page-title">
               <q-icon name="class" color="primary" class="q-mr-sm" />
               Control de Clase
            </h1>
            <p class="page-subtitle">Gestión de asistencia y seguimiento académico</p>
         </div>
      </div>

      <q-card class="main-card">
         <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify"
            narrow-indicator>
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
                        <q-select v-model="materiaSeleccionada" :options="materiasDisponibles"
                           label="Seleccionar Materia" outlined dense option-label="label"
                           option-value="value" emit-value map-options :loading="loading" />
                     </div>
                     <div class="col-12 col-md-5">
                        <q-select v-model="grupoSeleccionado" :options="gruposDisponibles"
                           label="Seleccionar Grupo" outlined dense option-label="label"
                           option-value="value" emit-value map-options :disable="!materiaSeleccionada">
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
                        <div class="text-h6 q-mb-sm flex items-center text-primary">
                           <q-icon :name="claseSeleccionadaObj.esFusionada ? 'group' : 'school'" class="q-mr-sm" />
                           {{ grupoVista.nombreCarrera }}
                           <span class="text-caption text-grey q-ml-sm">({{ grupoVista.materia }})</span>
                           <q-badge v-if="claseSeleccionadaObj.esFusionada" color="indigo" label="Fusionada" class="q-ml-sm" />
                        </div>

                        <q-table :rows="grupoVista.estudiantes" :columns="columnsAsistencia" row-key="id" flat bordered
                           hide-pagination :rows-per-page-options="[0]">
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
                                       <q-btn round size="sm" :color="props.row.estado === 'P' ? 'green' : 'grey-3'"
                                          :text-color="props.row.estado === 'P' ? 'white' : 'grey-8'" icon="check"
                                          @click="props.row.estado = 'P'" unelevated />
                                       <q-btn round size="sm" :color="props.row.estado === 'F' ? 'red' : 'grey-3'"
                                          :text-color="props.row.estado === 'F' ? 'white' : 'grey-8'" icon="close"
                                          @click="props.row.estado = 'F'" unelevated />
                                       <q-btn round size="sm" :color="props.row.estado === 'L' ? 'orange' : 'grey-3'"
                                          :text-color="props.row.estado === 'L' ? 'white' : 'grey-8'" icon="schedule"
                                          @click="props.row.estado = 'L'" unelevated />
                                    </div>
                                 </q-td>
                                 <q-td key="observacion" :props="props">
                                    <q-input v-model="props.row.observacion" dense borderless placeholder="---" />
                                 </q-td>
                              </q-tr>
                           </template>
                        </q-table>
                     </div>

                     <div class="flex justify-end q-mt-md">
                        <q-btn color="primary" icon="save" label="Guardar Asistencia" @click="guardarAsistencia" />
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
                        <q-select v-model="materiaSeleccionada" :options="materiasDisponibles" label="Materia"
                           outlined dense option-label="label" option-value="value" emit-value map-options />
                     </div>
                     <div class="col-12 col-md-5">
                        <q-select v-model="grupoSeleccionado" :options="gruposDisponibles" label="Grupo"
                           outlined dense option-label="label" option-value="value" emit-value map-options
                           :disable="!materiaSeleccionada">
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
                              {label: 'Pendientes', value: false},
                              {label: 'Completadas', value: true}
                           ]"
                           dense
                           unelevated
                           class="full-width"
                        />
                     </div>
                     <div class="col-12 col-md-4">
                        <q-select
                           v-model="fechaSeguimiento"
                           :options="sesionesOptions"
                           :label="vistaHistorial ? 'Seleccionar Sesión Completada' : 'Seleccionar Sesión Pendiente'"
                           outlined
                           dense
                           emit-value
                           map-options
                           :disable="!grupoSeleccionado || loadingSesiones"
                        >
                           <template v-slot:no-option>
                              <q-item>
                                 <q-item-section class="text-grey">
                                    {{ vistaHistorial ? 'No hay clases completadas' : 'No hay clases pendientes' }}
                                 </q-item-section>
                              </q-item>
                           </template>
                        </q-select>
                     </div>
                  </div>

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
                           </div>

                           <!-- Tema Principal (Solo título) -->
                           <div class="q-mb-md">
                              <div class="text-subtitle1 text-weight-bold text-primary">{{ temaPlanificado || 'Sin tema asignado' }}</div>
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
                                       <div class="content-text">{{ conceptualPlanificado || '---' }}</div>
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
                                       <div class="content-text">{{ procedimentalPlanificado || '---' }}</div>
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
                                       <div class="content-text">{{ actitudinalPlanificado || '---' }}</div>
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
                                          <q-chip
                                             v-for="(item, idx) in contenidoItemsSeleccionados"
                                             :key="idx"
                                             size="sm"
                                             color="primary"
                                             text-color="white"
                                             icon="check_circle"
                                          >
                                             {{ resolveContentItem(item) }}
                                          </q-chip>
                                       </div>
                                    </q-card-section>
                                 </q-card>
                              </div>
                           </div>

                           <!-- Observaciones -->
                           <q-card flat bordered>
                              <q-card-section>
                                 <q-input v-model="observacionesClase" label="Observaciones Generales" type="textarea"
                                    outlined rows="3" :readonly="esLecturaSola" />
                              </q-card-section>
                           </q-card>

                           <!-- Estado de Cumplimiento Botones -->
                           <div class="q-mt-lg">
                              <div class="text-subtitle2 q-mb-sm text-grey-8">Estado de Cumplimiento del Tema</div>
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

                        <div class="q-mt-lg">
                           <div class="text-subtitle1 text-weight-bold q-mb-sm">Detalles Pedagógicos</div>
                           <q-markup-table flat bordered separator="cell">
                              <thead>
                                 <tr>
                                    <th class="text-left bg-grey-2">Estrategias</th>
                                    <th class="text-left bg-grey-2">Evaluación</th>
                                    <th class="text-left bg-grey-2">Secuencia</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr>
                                    <td class="q-pa-sm" style="vertical-align: top">
                                       <div v-for="(item, idx) in pedagogico.estrategias" :key="'est-' + idx"
                                          class="q-mb-xs">
                                          <div v-if="item.isHeader" class="text-weight-bold text-caption q-mt-sm q-mb-xs text-primary">{{ item.nombre }}</div>
                                          <q-checkbox v-else v-model="item.cumplido" :label="item.nombre" dense
                                             color="green" :disable="esLecturaSola" />
                                       </div>
                                    </td>
                                    <td class="q-pa-sm" style="vertical-align: top">
                                       <div v-for="(item, idx) in pedagogico.evaluacion" :key="'eva-' + idx"
                                          class="q-mb-xs">
                                          <div v-if="item.isHeader" class="text-weight-bold text-caption q-mt-sm q-mb-xs text-primary">{{ item.nombre }}</div>
                                          <q-checkbox v-else v-model="item.cumplido" :label="item.nombre" dense
                                             color="green" :disable="esLecturaSola" />
                                       </div>
                                    </td>
                                    <td class="q-pa-sm" style="vertical-align: top">
                                       <div v-for="(item, idx) in pedagogico.secuencia" :key="'sec-' + idx"
                                          class="q-mb-xs">
                                          <div v-if="item.isHeader" class="text-weight-bold text-caption q-mt-sm q-mb-xs text-primary">{{ item.nombre }}</div>
                                          <q-checkbox v-else v-model="item.cumplido" :label="item.nombre" dense
                                             color="green" :disable="esLecturaSola" />
                                       </div>
                                    </td>
                                 </tr>
                              </tbody>
                           </q-markup-table>
                        </div>

                        <!-- Sección de Integración Transversal -->
                        <div class="q-mt-lg">
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
                                       <div v-show="integracionTransversal.investigacion.cumplido" class="q-mt-sm">
                                          <!-- Show saved file if exists (string path) -->
                                          <div v-if="typeof integracionTransversal.investigacion.evidencia === 'string'" class="q-pa-sm bg-blue-1 rounded-borders">
                                             <div class="text-caption text-grey-7">Evidencia guardada:</div>
                                             <a :href="`/storage/${integracionTransversal.investigacion.evidencia}`" target="_blank" class="text-primary">
                                                <q-icon name="download" size="xs" /> Ver archivo
                                             </a>
                                          </div>
                                          <!-- File upload input (only if not completed) -->
                                          <q-file 
                                             v-else
                                             v-model="integracionTransversal.investigacion.evidencia" 
                                             label="Subir evidencia" 
                                             outlined 
                                             dense
                                             accept="image/*,video/*,.pdf,.doc,.docx"
                                             :disable="esLecturaSola"
                                          >
                                             <template v-slot:prepend>
                                                <q-icon name="science" color="primary" />
                                             </template>
                                          </q-file>
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
                                          <div v-if="typeof integracionTransversal.interaccion.evidencia === 'string'" class="q-pa-sm bg-blue-1 rounded-borders">
                                             <div class="text-caption text-grey-7">Evidencia guardada:</div>
                                             <a :href="`/storage/${integracionTransversal.interaccion.evidencia}`" target="_blank" class="text-primary">
                                                <q-icon name="download" size="xs" /> Ver archivo
                                             </a>
                                          </div>
                                          <!-- File upload input -->
                                          <q-file 
                                             v-else
                                             v-model="integracionTransversal.interaccion.evidencia" 
                                             label="Subir evidencia" 
                                             outlined 
                                             dense
                                             accept="image/*,video/*,.pdf,.doc,.docx"
                                             :disable="esLecturaSola"
                                          >
                                             <template v-slot:prepend>
                                                <q-icon name="groups" color="primary" />
                                             </template>
                                          </q-file>
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
                                       <div v-show="integracionTransversal.internalizacion.cumplido" class="q-mt-sm">
                                          <!-- Show saved file if exists -->
                                          <div v-if="typeof integracionTransversal.internalizacion.evidencia === 'string'" class="q-pa-sm bg-blue-1 rounded-borders">
                                             <div class="text-caption text-grey-7">Evidencia guardada:</div>
                                             <a :href="`/storage/${integracionTransversal.internalizacion.evidencia}`" target="_blank" class="text-primary">
                                                <q-icon name="download" size="xs" /> Ver archivo
                                             </a>
                                          </div>
                                          <!-- File upload input -->
                                          <q-file 
                                             v-else
                                             v-model="integracionTransversal.internalizacion.evidencia" 
                                             label="Subir evidencia" 
                                             outlined 
                                             dense
                                             accept="image/*,video/*,.pdf,.doc,.docx"
                                             :disable="esLecturaSola"
                                          >
                                             <template v-slot:prepend>
                                                <q-icon name="psychology" color="primary" />
                                             </template>
                                          </q-file>
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
                                             <div class="text-caption text-weight-bold text-indigo q-mb-xs">Evidencia Aprendizaje Activo (Foto/Video)</div>
                                             <!-- Show saved file if exists -->
                                             <div v-if="typeof evidencias.aprendizaje_activo === 'string'" class="q-pa-sm bg-blue-1 rounded-borders">
                                                <div class="text-caption text-grey-7">Evidencia guardada:</div>
                                                <a :href="`/storage/${evidencias.aprendizaje_activo}`" target="_blank" class="text-primary">
                                                   <q-icon name="download" size="xs" /> Ver archivo
                                                </a>
                                             </div>
                                             <!-- File upload -->
                                             <q-file v-else v-model="evidencias.aprendizaje_activo" label="Subir evidencia" outlined dense accept="image/*,video/*" :disable="esLecturaSola">
                                                 <template v-slot:prepend><q-icon name="stars" color="indigo" /></template>
                                             </q-file>
                                         </div>
                                         <!-- Evaluación Formativa -->
                                         <div class="col-12 col-md-4">
                                             <div class="text-caption text-weight-bold text-indigo q-mb-xs">Evaluación Formativa (Link/Evidencia)</div>
                                             <q-input v-model="evidencias.evaluacion_formativa" placeholder="Link o Archivo" outlined dense :readonly="esLecturaSola">
                                                 <template v-slot:prepend><q-icon name="assignment_turned_in" color="indigo" /></template>
                                             </q-input>
                                         </div>
                                         <!-- Secuencia Didáctica (Diapositivas) -->
                                         <div class="col-12 col-md-4">
                                             <div class="text-caption text-weight-bold text-indigo q-mb-xs">Secuencia Didáctica / Diapositivas</div>
                                             <!-- Show saved file if exists -->
                                             <div v-if="typeof evidencias.secuencia_didactica === 'string'" class="q-pa-sm bg-blue-1 rounded-borders">
                                                <div class="text-caption text-grey-7">Evidencia guardada:</div>
                                                <a :href="`/storage/${evidencias.secuencia_didactica}`" target="_blank" class="text-primary">
                                                   <q-icon name="download" size="xs" /> Ver archivo
                                                </a>
                                             </div>
                                             <!-- File upload -->
                                             <q-file v-else v-model="evidencias.secuencia_didactica" label="Subir Archivos" outlined dense accept=".ppt,.pptx,.pdf,.doc,.docx" :disable="esLecturaSola">
                                                 <template v-slot:prepend><q-icon name="presentation_chart_bar" color="indigo" /></template>
                                             </q-file>
                                         </div>
                                     </div>
                                 </div>
                            </q-card>
                        </div>
                        
                        <div class="flex justify-end q-mt-lg">
                           <q-btn color="secondary" icon="save_as" label="Guardar Seguimiento"
                              @click="guardarSeguimiento" :disable="esLecturaSola" />
                        </div>
                     </template>
                  </div>

                  <div v-else class="text-center q-pa-xl text-grey-6">
                     <q-icon name="playlist_add_check" size="64px" />
                     <div class="text-h6">Selecciona una clase para ver el seguimiento</div>
                  </div>

               </div>
            </q-tab-panel>
         </q-tab-panels>
      </q-card>
   </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useGruposStore } from 'src/stores/grupos'
import planificacionSemestralService from 'src/services/planificacionSemestralService'

const $q = useQuasar()
const gruposStore = useGruposStore()

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

// Computed: Check if current session is completed (read-only mode)
const esLecturaSola = computed(() => {
   const cumplido = sesionActual.value?.cumplido
   const result = cumplido === true || cumplido === 1 || cumplido === '1' || cumplido === 'true'
   console.log('esLecturaSola computed - cumplido:', cumplido, 'type:', typeof cumplido, 'result:', result)
   return result
})

const fetchData = async () => {
   loading.value = true
   try {
      console.log('fetchData - calling fetchGrupos')
      const response = await gruposStore.fetchGrupos({
         gestion: '1-2026'
      })
      console.log('fetchData - response received:', response)
      materiasReales.value = (response && response.data) ? response.data : []
   } catch (error) {
      console.error('Error fetching real data:', error)
      $q.notify({
         type: 'negative',
         message: 'Error al cargar las materias'
      })
   } finally {
      loading.value = false
   }
}

// 1. Materias únicas disponibles
const materiasDisponibles = computed(() => {
   return materiasReales.value.map(m => ({
      label: `${m.nombre} (${m.codigo})`,
      value: m.id,
      ...m
   }))
})

// 2. Grupos consolidados para la materia seleccionada
const gruposDisponibles = computed(() => {
   if (!materiaSeleccionada.value) return []
   
   const materia = materiasDisponibles.value.find(m => m.id === materiaSeleccionada.value)
   if (!materia || !materia.grupos) return []

   // Consolidar por grupo_id
   const gruposMap = {}
   
   materia.grupos.forEach(g => {
      if (!gruposMap[g.grupo_id]) {
         gruposMap[g.grupo_id] = {
            id: g.grupo_id,
            nombre: g.grupo,
            tipo: g.tipo_clase,
            horarios: []
         }
      }
      if (g.dia !== '-') {
         gruposMap[g.grupo_id].horarios.push(`${g.dia} ${g.hora_inicio}-${g.hora_fin}`)
      }
   })

   return Object.values(gruposMap).map(g => ({
      label: `Grupo ${g.nombre} - ${g.tipo}`,
      sublabel: g.horarios.length > 0 ? g.horarios.join(', ') : 'Sin horario definido',
      value: g.id,
      ...g
   }))
})

// Lógica de Unificación de Clases (MANTENIDA para compatibilidad de vista de estudiantes si es necesario, pero simplificada)
const claseSeleccionadaObj = computed(() => {
   if (!materiaSeleccionada.value || !grupoSeleccionado.value) return null
   
   const materia = materiasDisponibles.value.find(m => m.id === materiaSeleccionada.value)
   const grupo = gruposDisponibles.value.find(g => g.id === grupoSeleccionado.value)
   
   if (!materia || !grupo) return null

   return {
      id: materia.id,
      nombreComun: materia.nombre,
      grupoNombre: grupo.nombre,
      horario: grupo.sublabel,
      esFusionada: materia.comun_token && materia.comun_tipo === 'fusionada',
      carreras: [{
         id: materia.id,
         nombreCarrera: materia.carrera,
         materia: materia.nombre,
         estudiantes: generateMockStudents(materia.id + grupo.id)
      }]
   }
})

// Toggle between pending and completed sessions
const vistaHistorial = ref(false)

// Computed options based on vistaHistorial toggle
const sesionesOptions = computed(() => {
   const today = new Date().toISOString().split('T')[0]
   const filtered = sesiones.value.filter(s => {
      const isCumplido = s.cumplido === true || s.cumplido === 1 || s.cumplido === '1' || s.cumplido === 'true'
      
      if (vistaHistorial.value) {
         return isCumplido
      } else {
         // Pendientes: No cumplidas Y (fecha <= hoy o sin fecha)
         return !isCumplido && (!s.fecha || s.fecha <= today)
      }
   })
   
   console.log('sesionesOptions - vistaHistorial:', vistaHistorial.value, 'filtered count:', filtered.length, 'total:', sesiones.value.length)
   
   return filtered.map(s => {
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
          
          // Add completion indicator for completed sessions
          if (vistaHistorial.value) {
             label = '✓ ' + label
          }
          
          return {
             label: label,
             value: s.fecha,
             // Extra data if needed
             sesionId: s.id
          }
      })
})

// Keep old computed for backward compatibility
const sesionesPendientesOptions = computed(() => {
   return sesionesOptions.value
})

const fetchSesiones = async () => {
   if (!materiaSeleccionada.value || !grupoSeleccionado.value) return

   loadingSesiones.value = true
   try {
      // 1. Fetch Planificación (Hybrid: Master + Execution)
      const response = await planificacionSemestralService.getPlanificacion(materiaSeleccionada.value, {
          grupo_id: grupoSeleccionado.value
      })
      
      let rawSesiones = response.data.planificacion || []
      const config = response.data.config || {}
      const horarios = response.data.horarios || []
      
      // 1. Determine Group Type
      let esGrupoTeorico = false
      // Use loose comparison (==) for IDs to handle string/number mismatch
      const horariosGrupo = horarios.filter(h => h.grupo_id == grupoSeleccionado.value)
      const grupoDef = gruposDisponibles.value.find(g => g.id == grupoSeleccionado.value)
      
      if (grupoDef && grupoDef.tipo) {
           const t = grupoDef.tipo.toUpperCase()
           esGrupoTeorico = ['TEORICA', 'TEÓRICA', 'TEORICO', 'T'].includes(t)
      } else if (horariosGrupo.find(h => h.tipo)) {
           const t = horariosGrupo.find(h => h.tipo).tipo.toUpperCase()
           esGrupoTeorico = ['TEORICA', 'TEÓRICA', 'TEORICO', 'T'].includes(t)
      }

      // 2. Filter Sessions
      let filteredSesiones = rawSesiones.filter(s => {
          if (s.tipo_clase) {
               const tipoSesion = s.tipo_clase.toUpperCase()
               const isSesionTeorica = ['TEORICA', 'TEÓRICA', 'TEORICO', 'T'].includes(tipoSesion)
               
               if ((grupoDef && grupoDef.tipo) || (horariosGrupo.find(h => h.tipo))) {
                   return esGrupoTeorico === isSesionTeorica
               }
          }
          return true
      })

      // 3. Project Dates
      if (config.fecha_inicio_clases && horariosGrupo.length > 0) {
          const parts = config.fecha_inicio_clases.split('-')
          // Note: Month is 0-indexed in JS Date
          const startDate = new Date(parts[0], parts[1]-1, parts[2])
          
          const daysMap = { 'LUNES': 1, 'MARTES': 2, 'MIERCOLES': 3, 'MIÉRCOLES': 3, 'JUEVES': 4, 'VIERNES': 5, 'SABADO': 6, 'SÁBADO': 6, 'DOMINGO': 0 }
          
          const groupDays = horariosGrupo
              .map(h => {
                  if (!h.dia) return undefined
                  // Normalize: UpperCase and remove special chars if needed, but generic map should catch it
                  let d = h.dia.toUpperCase()
                  // Handle "Lunes" -> "LUNES"
                  return daysMap[d]
              })
              .filter(d => d !== undefined)
              .sort((a,b) => a - b)

          console.log('StartDate:', startDate, 'GroupDays:', groupDays)

          if (groupDays.length > 0) {
              let currentDate = new Date(startDate)
              const sessionsToDate = [...filteredSesiones].sort((a,b) => a.numero_sesion - b.numero_sesion)
              let currentSessionIndex = 0
              
              // Find first valid class day >= startDate
              while(!groupDays.includes(currentDate.getDay())) {
                   currentDate.setDate(currentDate.getDate() + 1)
              }

              for (let i = 0; i < 365; i++) {
                  if (currentSessionIndex >= sessionsToDate.length) break;
                  
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
          $q.notify({ type: 'warning', message: 'Configure la fecha de inicio de clases para ver las fechas proyectadas' })
      }

      sesiones.value = filteredSesiones
      
      // Auto-select logic
      if (sesionesPendientesOptions.value.length > 0) {
          // Try to select today's session if exists
          const today = new Date().toISOString().split('T')[0]
          const todaySession = sesionesPendientesOptions.value.find(o => o.value === today)
          fechaSeguimiento.value = todaySession ? todaySession.value : sesionesPendientesOptions.value[0].value
      } else {
          fechaSeguimiento.value = null
      }
      
      actualizarSesionPorFecha()
   } catch (error) {
      console.error('Error fetching sessions:', error)
      $q.notify({ type: 'negative', message: 'Error al cargar las sesiones' })
   } finally {
      loadingSesiones.value = false
   }
}

const actualizarSesionPorFecha = () => {
   if (!sesiones.value.length || !fechaSeguimiento.value) {
       sesionActual.value = null
       return
   }

   // Find session for the current date
   const found = sesiones.value.find(s => s.fecha === fechaSeguimiento.value)
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
             return planItems.map(pItem => {
                 // Find matching saved item (loose match by name/content)
                 // content match: ignore prefix like "Recurso: " for matching if saved didn't have it?
                 // Or just simpler: find item where saved name contains pItem name or vice versa?
                 // Let's try exact match or "saved name is contained in plan name" (since we added prefixes)
                 const match = (savedItems || []).find(s => 
                     s.nombre === pItem.nombre || 
                     pItem.nombre.includes(s.nombre) || 
                     s.nombre.includes(pItem.nombre)
                 )
                 return {
                     ...pItem,
                     cumplido: match ? match.cumplido : false
                 }
             })
         }

         pedagogico.value.estrategias = mergeItems(fromPlan.estrategias, saved.estrategias)
         pedagogico.value.evaluacion = mergeItems(fromPlan.evaluacion, saved.evaluacion)
         pedagogico.value.secuencia = mergeItems(fromPlan.secuencia, saved.secuencia)
         
         // If plan items were empty but saved had something, keep saved (fallback)
         if (fromPlan.estrategias.length === 0 && saved.estrategias?.length > 0) pedagogico.value.estrategias = saved.estrategias
         if (fromPlan.evaluacion.length === 0 && saved.evaluacion?.length > 0) pedagogico.value.evaluacion = saved.evaluacion
         if (fromPlan.secuencia.length === 0 && saved.secuencia?.length > 0) pedagogico.value.secuencia = saved.secuencia
         // Load estado cumplimiento from pedagogico or map from old boolean
         estadoCumplimiento.value = saved.estado_cumplimiento || (saved.tema_cumplido ? 'TOTAL' : null)
         temaCumplido.value = saved.tema_cumplido || false
         
         if(saved.integracion) {
             pedagogico.value.integracion = saved.integracion
         } else {
             resetIntegracion()
         }
         
         // Load Evidences if saved inside pedagogico
         if (saved.evidencias) {
             evidencias.value = saved.evidencias
         } else {
             resetEvidencias()
         }
         
         // Load Integración Transversal (new simplified structure)
         if (saved.integracionTransversal) {
             integracionTransversal.value = saved.integracionTransversal
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

// Helper to extract pedagogical data from a Topic/Planning object
const extractFromTopic = (planning) => {
    const result = { estrategias: [], evaluacion: [], secuencia: [] }
    if (!planning) return result

     // ESTRATEGIAS
     // 1. Metodología Docente
     if (planning.estrategias_metodologicas && typeof planning.estrategias_metodologicas === 'string') {
        result.estrategias.push({ nombre: 'METODOLOGÍA (DOCENTE)', isHeader: true })
        result.estrategias.push({ nombre: planning.estrategias_metodologicas, cumplido: false })
     }
     
     // 2. Estrategias de Aprendizaje (Estudiante)
     if (planning.estrategias_aprendizaje && typeof planning.estrategias_aprendizaje === 'string') {
        result.estrategias.push({ nombre: 'APRENDIZAJE (ESTUDIANTE)', isHeader: true })
        result.estrategias.push({ nombre: planning.estrategias_aprendizaje, cumplido: false })
     }

     // 3. Recursos
     if (Array.isArray(planning.estrategias_recursos) && planning.estrategias_recursos.length > 0) {
        result.estrategias.push({ nombre: 'RECURSOS', isHeader: true })
        planning.estrategias_recursos.forEach(r => {
            result.estrategias.push({ nombre: r, cumplido: false })
        })
     }

     // Fallback / Legacy (if nothing above found)
     if (result.estrategias.length === 0) {
         if (typeof planning.estrategias_recursos === 'string') {
             try {
                 const parsed = JSON.parse(planning.estrategias_recursos)
                 if (Array.isArray(parsed)) {
                     result.estrategias.push({ nombre: 'RECURSOS', isHeader: true })
                     parsed.forEach(r => result.estrategias.push({ nombre: r, cumplido: false }))
                 }
             } catch(e) {
                 console.error('Error parsing estrategias_recursos fallback:', e)
             }
         }
     }

     // EVALUACION
     const extractEval = (obj, typeName) => {
        if (obj) {
            // Handle if it's a string (JSON)
            if (typeof obj === 'string') {
                try { obj = JSON.parse(obj) } catch(error) { console.error(error); return }
            }
            
            const hasContent = (Array.isArray(obj.actividades) && obj.actividades.length > 0) || 
                               (Array.isArray(obj.instrumentos) && obj.instrumentos.length > 0) ||
                               (Array.isArray(obj.evidencias) && obj.evidencias.length > 0);
                               
            if (hasContent) {
                result.evaluacion.push({ nombre: typeName.toUpperCase(), isHeader: true })
                
                if (Array.isArray(obj.actividades)) {
                   obj.actividades.forEach(a => result.evaluacion.push({ nombre: `Actividad: ${a}`, cumplido: false }))
                }
                if (Array.isArray(obj.instrumentos)) {
                   obj.instrumentos.forEach(i => result.evaluacion.push({ nombre: `Instrumento: ${i}`, cumplido: false }))
                }
                if (Array.isArray(obj.evidencias)) {
                   obj.evidencias.forEach(e => result.evaluacion.push({ nombre: `Evidencia: ${e}`, cumplido: false }))
                }
            }
        }
     }
     extractEval(planning.evaluacion_formativa, 'Evaluación Formativa')
     extractEval(planning.evaluacion_sumativa, 'Evaluación Sumativa')

     // SECUENCIA
     if (Array.isArray(planning.secuencia_didactica)) {
        // Group by momento
        const grupos = {}
        planning.secuencia_didactica.forEach(s => {
            const momento = s.momento || 'GENERAL'
            if (!grupos[momento]) grupos[momento] = []
            grupos[momento].push(s)
        })
        
        // Define order if possible
        const order = ['Inicio', 'Desarrollo', 'Cierre']
        
        // Add specific groups in order
        order.forEach(m => {
            if (grupos[m]) {
                result.secuencia.push({ nombre: m.toUpperCase(), isHeader: true })
                grupos[m].forEach(s => {
                     result.secuencia.push({ nombre: s.actividad, cumplido: false })
                })
                delete grupos[m]
            }
        })
        // Add remaining groups
        Object.keys(grupos).forEach(m => {
            result.secuencia.push({ nombre: m.toUpperCase(), isHeader: true })
            grupos[m].forEach(s => {
                 result.secuencia.push({ nombre: s.actividad, cumplido: false })
            })
        })

     } else if (typeof planning.secuencia_didactica === 'string') {
         // Try parse
         try {
             const parsed = JSON.parse(planning.secuencia_didactica)
             if (Array.isArray(parsed)) {
                 result.secuencia.push({ nombre: 'SECUENCIA', isHeader: true })
                  parsed.forEach(s => {
                     result.secuencia.push({ nombre: `${s.momento || ''}: ${s.actividad}`, cumplido: false })
                  })
             }
         } catch(error) { console.error(error) }
     } else if (planning.secuencias && Array.isArray(planning.secuencias)) {
        // Direct relation fallback items
        planning.secuencias.forEach(s => {
            result.secuencia.push({ nombre: `${s.momento}: ${s.descripcion}`, cumplido: false })
        })
     }
     
     return result
}

const resetIntegracionTransversalDefault = () => {
   integracionTransversal.value = {
      investigacion: { cumplido: false, evidencia: null },
      interaccion: { cumplido: false, evidencia: null },
      internalizacion: { cumplido: false, evidencia: null }
   }
}

const resetPedagogico = () => {
   pedagogico.value.estrategias = [
      { nombre: 'Clase Magistral', cumplido: false },
      { nombre: 'Participación Activa', cumplido: false }
   ]
   pedagogico.value.evaluacion = [
      { nombre: 'Evaluación continua', cumplido: false }
   ]
   pedagogico.value.secuencia = [
      { nombre: 'Inicio', cumplido: false },
      { nombre: 'Desarrollo', cumplido: false },
      { nombre: 'Cierre', cumplido: false }
   ]
}

const resetIntegracion = () => {
    pedagogico.value.integracion = {
      investigacion: [
         { nombre: 'Verificación de investigación', cumplido: false },
         { nombre: 'Análisis crítico', cumplido: false }
      ],
      interaccion: [
         { nombre: 'Interacción social', cumplido: false },
         { nombre: 'Trabajo en equipo', cumplido: false }
      ],
      internalizacion: [
         { nombre: 'Internalización de valores', cumplido: false },
         { nombre: 'Aplicación ética', cumplido: false }
      ]
   }
}

const resetEvidencias = () => {
   evidencias.value = {
      aprendizaje_activo: null,
      evaluacion_formativa: '',
      secuencia_didactica: null
   }
}

watch(materiaSeleccionada, () => {
   grupoSeleccionado.value = null
   sesiones.value = []
   fechaSeguimiento.value = null
})

watch(grupoSeleccionado, () => {
   if (grupoSeleccionado.value) {
      fetchSesiones()
   } else {
      sesiones.value = []
      fechaSeguimiento.value = null
   }
})

watch(fechaSeguimiento, () => {
   actualizarSesionPorFecha()
})

// Watch for toggle changes to auto-select first available session
watch(vistaHistorial, () => {
   if (sesionesOptions.value.length > 0) {
      fechaSeguimiento.value = sesionesOptions.value[0].value
   } else {
      fechaSeguimiento.value = null
   }
})

const generateMockStudents = (seed) => {
   const students = []
   const baseNombres = ['Juan', 'Maria', 'Carlos', 'Ana', 'Luis', 'Carmen', 'Pedro', 'Laura', 'Miguel', 'Sandra']
   const baseApellidos = ['Perez', 'Gomez', 'Lopez', 'Torres', 'Ruiz', 'Vargas', 'Mendoza', 'Flores', 'Reyes', 'Rios']

   // Stable random-ish count based on seed
   const count = 10 + (seed % 15)

   for (let i = 0; i < count; i++) {
      students.push({
         id: `${seed}-${i}`,
         nombre: baseNombres[(seed + i) % 10],
         apellido: baseApellidos[(seed * i) % 10],
         estado: 'P',
         observacion: ''
      })
   }
   return students
}

// Eliminada duplicidad de computed claseSeleccionadaObj

const estudiantesVista = computed(() => {
   const obj = claseSeleccionadaObj.value
   if (!obj) return []

   if (obj.esFusionada) {
      // Unificar todos los estudiantes en un solo listado
      const todosEstudiantes = []
      obj.carreras.forEach(c => {
         c.estudiantes.forEach(e => {
            todosEstudiantes.push({
               ...e,
               carreraOrigen: c.nombreCarrera
            })
         })
      })
      
      // Ordenar por apellido/nombre opcionalmente
      todosEstudiantes.sort((a, b) => {
         const nameA = `${a.apellido} ${a.nombre}`.toLowerCase()
         const nameB = `${b.apellido} ${b.nombre}`.toLowerCase()
         return nameA.localeCompare(nameB)
      })

      return [{
         id: 'fusionada',
         nombreCarrera: 'Lista Unificada de Estudiantes',
         materia: obj.nombreComun,
         estudiantes: todosEstudiantes
      }]
   }

   return obj.carreras
})

// Resolver texto del item de contenido (FORMATO: temaId:index)
const resolveContentItem = (itemVal) => {
   if (!itemVal || !itemVal.includes(':')) return itemVal
   
   const [temaId, itemIndex] = itemVal.split(':')
   const index = parseInt(itemIndex)
   
   // Buscar en el tema de la sesión actual
   let tema = null
   
   if (sesionActual.value) {
       // Caso 1: Tema directo en la sesión
       if (sesionActual.value.tema && sesionActual.value.tema.id == temaId) {
           tema = sesionActual.value.tema
       } 
       // Caso 2: Temas múltiples (si existieran)
       else if (sesionActual.value.temas) {
           tema = sesionActual.value.temas.find(t => t.id == temaId)
       }
   }
   
   if (tema && tema.contenido_items && Array.isArray(tema.contenido_items) && tema.contenido_items[index]) {
       const contentText = tema.contenido_items[index]
       // Get topic title, truncated if necessary
       const topicTitle = tema.titulo 
           ? (tema.titulo.length > 20 ? tema.titulo.substring(0, 20) + '...' : tema.titulo) 
           : 'Tema'
           
       const displayText = `${topicTitle}: ${contentText}`
       
       return displayText.length > 70 ? displayText.substring(0, 70) + '...' : displayText
   }
   
   return itemVal // Fallback si no se encuentra
}

const temaSeleccionado = ref(null)
watch(temaSeleccionado, (val) => {
   if (val) temaPlanificado.value = val.titulo
})

// Asistencia
const columnsAsistencia = [
   { name: 'nombre', label: 'Estudiante', align: 'left', field: 'nombre', sortable: true },
   { name: 'estado', label: 'Asistencia', align: 'center', field: 'estado' },
   { name: 'observacion', label: 'Observación', align: 'left', field: 'observacion' }
]

const guardarAsistencia = () => {
   $q.notify({
      type: 'positive',
      message: 'Asistencia guardada correctamente para todas las carreras',
      icon: 'check_circle'
   })
}

// Seguimiento
const temaPlanificado = ref('')
const contenidoPlanificado = ref('')
const conceptualPlanificado = ref('')
const procedimentalPlanificado = ref('')
const actitudinalPlanificado = ref('')
const criteriosPlanificado = ref('')
const instrumentosPlanificado = ref('')
const contenidoItemsSeleccionados = ref([])
const observacionesClase = ref('')
const temaCumplido = ref(false)
const estadoCumplimiento = ref(null)

const pedagogico = ref({
   estrategias: [],
   evaluacion: [],
   secuencia: [],
   integracion: {}
})

// Evidencias (Simplified)
const evidencias = ref({
   aprendizaje_activo: null,
   evaluacion_formativa: '',
   secuencia_didactica: null
})

// Integración Transversal (Simplified)
const integracionTransversal = ref({
   investigacion: { cumplido: false, evidencia: null },
   interaccion: { cumplido: false, evidencia: null },
   internalizacion: { cumplido: false, evidencia: null }
})

const guardarSeguimiento = async () => {
   if (!sesionActual.value) {
      $q.notify({ type: 'warning', message: 'No hay una sesión de planificación para esta fecha' })
      return
   }

   try {
      // Create FormData to handle file uploads
      const formData = new FormData()
      
      // Add basic fields
      // Validar si el estado es TOTAL o PARCIAL para marcar como "cumplido" general
      const isCumplido = estadoCumplimiento.value === 'TOTAL' || estadoCumplimiento.value === 'PARCIAL'
      formData.append('tema_cumplido', isCumplido ? 'true' : 'false')
      formData.append('observaciones', observacionesClase.value || '')
      
      console.log('Saving session with tema_cumplido:', isCumplido, 'estado:', estadoCumplimiento.value)
      
      // Add pedagogical details (non-file data)
      const pedagogicoData = {
         estrategias: pedagogico.value.estrategias,
         evaluacion: pedagogico.value.evaluacion,
         secuencia: pedagogico.value.secuencia,
         integracion: pedagogico.value.integracion,
         estado_cumplimiento: estadoCumplimiento.value // Save the specific status
      }
      
      // Add integración transversal status (without files)
      const integracionData = {
         investigacion: { cumplido: integracionTransversal.value.investigacion.cumplido },
         interaccion: { cumplido: integracionTransversal.value.interaccion.cumplido },
         internalizacion: { cumplido: integracionTransversal.value.internalizacion.cumplido }
      }
      
      formData.append('pedagogico', JSON.stringify(pedagogicoData))
      formData.append('integracion_transversal', JSON.stringify(integracionData))
      
      // Add evidence files
      if (evidencias.value.aprendizaje_activo) {
         formData.append('evidencia_aprendizaje', evidencias.value.aprendizaje_activo)
      }
      if (evidencias.value.evaluacion_formativa) {
         formData.append('evidencia_evaluacion', evidencias.value.evaluacion_formativa)
      }
      if (evidencias.value.secuencia_didactica) {
         formData.append('evidencia_secuencia', evidencias.value.secuencia_didactica)
      }
      
      // Add integración transversal evidence files
      if (integracionTransversal.value.investigacion.evidencia) {
         formData.append('evidencia_investigacion', integracionTransversal.value.investigacion.evidencia)
      }
      if (integracionTransversal.value.interaccion.evidencia) {
         formData.append('evidencia_interaccion', integracionTransversal.value.interaccion.evidencia)
      }
      if (integracionTransversal.value.internalizacion.evidencia) {
         formData.append('evidencia_internalizacion', integracionTransversal.value.internalizacion.evidencia)
      }

      await planificacionSemestralService.saveSeguimiento(sesionActual.value.id, formData)

      $q.notify({
         type: 'positive',
         message: 'Seguimiento de clase actualizado correctamente',
         icon: 'save'
      })
      
      if (!estadoCumplimiento.value) {
          $q.notify({
             type: 'warning',
             message: 'Recuerda seleccionar el estado de cumplimiento (Total, Parcial o No)'
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
      await new Promise(resolve => setTimeout(resolve, 100))
      // Re-select the same session in completed view
      fechaSeguimiento.value = currentSessionDate
      
      console.log('Final state - vistaHistorial:', vistaHistorial.value, 'fechaSeguimiento:', fechaSeguimiento.value)
   } catch (error) {
      console.error('Error saving follow-up:', error)
      $q.notify({
         type: 'negative',
         message: 'Error al guardar el seguimiento'
      })
   }
}

onMounted(() => {
   fetchData()
})
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
   box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* Planificación del Día Styles */
.planificacion-container {
   background: white;
   border-radius: 12px;
   padding: 24px;
   box-shadow: 0 2px 8px rgba(0,0,0,0.06);
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
   color: rgba(255,255,255,0.9);
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
   box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
</style>

