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
            <q-tab name="asistencia" label="Asistencia" icon="fact_check" />
            <q-tab name="seguimiento" label="Seguimiento" icon="analytics" />
         </q-tabs>

         <q-separator />

         <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="asistencia" class="q-pa-none">
               <div class="q-pa-md">
                  <!-- Selector de Clase Unificada -->
                  <div class="row q-col-gutter-md q-mb-lg items-center">
                     <div class="col-12 col-md-6">
                        <q-select v-model="claseSeleccionada" :options="clasesUnificadas"
                           label="Seleccionar Clase (Materia Unificada)" outlined dense option-label="nombreDisplay"
                           option-value="id" emit-value map-options :loading="loading">
                           <template v-slot:option="scope">
                              <q-item v-bind="scope.itemProps">
                                 <q-item-section>
                                    <q-item-label>{{ scope.opt.nombreComun }}</q-item-label>
                                    <q-item-label caption>
                                       {{scope.opt.carreras.map(c => c.materia).join(' / ')}}
                                    </q-item-label>
                                 </q-item-section>
                              </q-item>
                           </template>
                           <template v-slot:no-option>
                              <q-item>
                                 <q-item-section class="text-grey">
                                    {{ loading ? 'Cargando materias...' : 'No se encontraron materias asignadas' }}
                                 </q-item-section>
                              </q-item>
                           </template>
                        </q-select>
                     </div>
                     <div class="col-12 col-md-3">
                        <q-chip v-if="claseSeleccionada" color="primary" text-color="white" icon="schedule">
                           {{ claseSeleccionadaObj?.horario }}
                        </q-chip>
                     </div>
                  </div>

                  <div v-if="claseSeleccionada" class="listas-container">
                     <!-- Iterar sobre las carreras de la clase unificada -->
                     <div v-for="carrera in claseSeleccionadaObj.carreras" :key="carrera.id" class="q-mb-xl">
                        <div class="text-h6 q-mb-sm flex items-center text-primary">
                           <q-icon name="school" class="q-mr-sm" />
                           {{ carrera.nombreCarrera }}
                           <span class="text-caption text-grey q-ml-sm">({{ carrera.materia }})</span>
                        </div>

                        <q-table :rows="carrera.estudiantes" :columns="columnsAsistencia" row-key="id" flat bordered
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
                     <div class="col-12 col-md-6">
                        <q-select v-model="claseSeleccionada" :options="clasesUnificadas" label="Seleccionar Clase"
                           outlined dense option-label="nombreDisplay" option-value="id" emit-value map-options />
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
                           :disable="!claseSeleccionada || loadingSesiones"
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

                  <div v-if="claseSeleccionada" class="seguimiento-content">
                     <div v-if="loadingSesiones" class="flex justify-center q-pa-xl">
                        <q-spinner-dots color="primary" size="40px" />
                     </div>
                     <template v-else>
                        <q-card flat bordered class="q-pa-md bg-grey-1">
                           <div class="text-subtitle1 text-weight-bold q-mb-md">Planificación del Día</div>

                           <div class="row q-col-gutter-lg">
                              <div class="col-12 col-md-6">
                                 <q-input v-model="temaPlanificado" label="Tema Planificado (Según Plan de Clase)"
                                    outlined readonly />
                              </div>
                              <div class="col-12 col-md-6 flex items-center">
                                 <q-checkbox v-model="temaCumplido" label="Tema Cumplido" color="green" size="lg" :disable="esLecturaSola" />
                              </div>
                              <div class="col-12">
                                 <q-input v-model="observacionesClase" label="Observaciones Generales" type="textarea"
                                    outlined rows="3" :readonly="esLecturaSola" />
                              </div>
                           </div>
                        </q-card>

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
                                          <q-checkbox v-model="item.cumplido" :label="item.nombre" dense
                                             color="green" :disable="esLecturaSola" />
                                       </div>
                                    </td>
                                    <td class="q-pa-sm" style="vertical-align: top">
                                       <div v-for="(item, idx) in pedagogico.evaluacion" :key="'eva-' + idx"
                                          class="q-mb-xs">
                                          <q-checkbox v-model="item.cumplido" :label="item.nombre" dense
                                             color="green" :disable="esLecturaSola" />
                                       </div>
                                    </td>
                                    <td class="q-pa-sm" style="vertical-align: top">
                                       <div v-for="(item, idx) in pedagogico.secuencia" :key="'sec-' + idx"
                                          class="q-mb-xs">
                                          <q-checkbox v-model="item.cumplido" :label="item.nombre" dense
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

const tab = ref('asistencia')
const claseSeleccionada = ref(null)
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
      const response = await gruposStore.fetchGrupos({
         gestion: '1-2026' // Por ahora fijo, puede venir de config
      })
      materiasReales.value = response.data || []
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

// Lógica de Unificación de Clases (Materia + Grupo + Horario)
const clasesUnificadas = computed(() => {
   const unificadas = []
   let idCounter = 1

   materiasReales.value.forEach(materia => {
      materia.grupos.forEach(descGrupo => {
         // Clave de unificación: Nombre Materia + Nombre Grupo + Horario (Dia/Hora)
         const horarioStr = `${descGrupo.dia} ${descGrupo.hora_inicio}-${descGrupo.hora_fin}`
         const key = `${materia.nombre}-${descGrupo.grupo}-${horarioStr}`

         let unificada = unificadas.find(u => u.key === key)

         if (!unificada) {
            unificada = {
               id: idCounter++,
               key: key,
               nombreComun: `${materia.nombre} (${descGrupo.grupo})`,
               horario: horarioStr,
               nombreDisplay: `${materia.nombre} (${descGrupo.grupo}) - ${horarioStr}`,
               carreras: []
            }
            unificadas.push(unificada)
         }

         // Agregar esta carrera/materia específica a la clase unificada
         unificada.carreras.push({
            id: materia.id,
            nombreCarrera: materia.carrera,
            materia: materia.nombre,
            // Mocking students for now as discussed
            estudiantes: generateMockStudents(materia.id + descGrupo.grupo)
         })
      })
   })

   return unificadas
})

// Toggle between pending and completed sessions
const vistaHistorial = ref(false)

// Computed options based on vistaHistorial toggle
const sesionesOptions = computed(() => {
   const filtered = sesiones.value.filter(s => {
      const isCumplido = s.cumplido === true || s.cumplido === 1 || s.cumplido === '1' || s.cumplido === 'true'
      return vistaHistorial.value ? isCumplido : !isCumplido
   })
   
   console.log('sesionesOptions - vistaHistorial:', vistaHistorial.value, 'filtered count:', filtered.length, 'total:', sesiones.value.length)
   
   return filtered.map(s => {
           // Format date for display: DD/MM/YYYY
           let fechaDisplay = s.fecha
           if (s.fecha && s.fecha.includes('-')) {
              const [y, m, d] = s.fecha.split('-')
              fechaDisplay = `${d}/${m}/${y}`
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
   if (!claseSeleccionada.value) return

   const unificada = clasesUnificadas.value.find(u => u.id === claseSeleccionada.value)
   if (!unificada || !unificada.carreras.length) return

   loadingSesiones.value = true
   // Pick first carrera to get planning (assuming all carreras in a unified class share planning)
   const mainCarreraId = unificada.carreras[0].id

   try {
      const response = await planificacionSemestralService.getPlanificacion(mainCarreraId)
      sesiones.value = response.data.planificacion || []
      
      // DEBUG: Log first session to see pedagogico structure
      if (sesiones.value.length > 0) {
         console.log('DEBUG - Primera sesión completa:', JSON.stringify(sesiones.value[0], null, 2))
         console.log('DEBUG - Pedagogico contenido:', JSON.stringify(sesiones.value[0].pedagogico, null, 2))
         console.log('DEBUG - Tiene tema?:', !!sesiones.value[0].tema)
         if (sesiones.value[0].tema) {
            console.log('DEBUG - Tema:', JSON.stringify(sesiones.value[0].tema, null, 2))
         }
      }
      
      // Auto-select first pending date if available
      if (sesionesPendientesOptions.value.length > 0) {
          fechaSeguimiento.value = sesionesPendientesOptions.value[0].value
      } else {
          fechaSeguimiento.value = null
      }
      
      actualizarSesionPorFecha()
   } catch (error) {
      console.error('Error fetching sessions:', error)
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

      // Load tema_cumplido from pedagogico (pedagogical information)
      // cronograma.cumplido indicates if follow-up was saved, not if topic was covered
      temaCumplido.value = false  // Default
      
      observacionesClase.value = found.observaciones || ''

      // 2. Pedagogical Details Mapping
      // Includes pedagogical + integration + evidences
      if (found.pedagogico && typeof found.pedagogico === 'object') {
         const saved = JSON.parse(JSON.stringify(found.pedagogico))
         
         // Load tema_cumplido from pedagogico
         if (saved.tema_cumplido !== undefined) {
            temaCumplido.value = !!(saved.tema_cumplido)
            console.log('Loading tema_cumplido from pedagogico:', saved.tema_cumplido, 'converted to:', temaCumplido.value)
         }
         
         pedagogico.value.estrategias = saved.estrategias || []
         pedagogico.value.evaluacion = saved.evaluacion || []
         pedagogico.value.secuencia = saved.secuencia || []
         
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
             // Reset to defaults
             integracionTransversal.value = {
                investigacion: { cumplido: false, evidencia: null },
                interaccion: { cumplido: false, evidencia: null },
                internalizacion: { cumplido: false, evidencia: null }
             }
         }

      } else {
         // Load from Planning (Tema)
         const planning = found.tema?.planificacion_personal || found.tema

         if (planning) {
             // ESTRATEGIAS
             let estrategias = []
             if (Array.isArray(planning.estrategias_recursos)) {
                estrategias = planning.estrategias_recursos.map(r => ({ nombre: r, cumplido: false }))
             }
             if (planning.estrategias_metodologicas && typeof planning.estrategias_metodologicas === 'string') {
                estrategias.unshift({ nombre: `Metodología: ${planning.estrategias_metodologicas.substring(0, 50)}...`, cumplido: false })
             }
             pedagogico.value.estrategias = estrategias

             // EVALUACION
             let evaluaciones = []
             const extractEval = (obj, prefix) => {
                if (obj && Array.isArray(obj.actividades)) {
                   obj.actividades.forEach(a => evaluaciones.push({ nombre: `${prefix}: ${a}`, cumplido: false }))
                }
                if (obj && Array.isArray(obj.instrumentos)) {
                   obj.instrumentos.forEach(i => evaluaciones.push({ nombre: `Inst: ${i}`, cumplido: false }))
                }
             }
             extractEval(planning.evaluacion_formativa, 'Form')
             extractEval(planning.evaluacion_sumativa, 'Sum')
             pedagogico.value.evaluacion = evaluaciones

             // SECUENCIA
             if (Array.isArray(planning.secuencia_didactica)) {
                pedagogico.value.secuencia = planning.secuencia_didactica.map(s => ({
                   nombre: `${s.momento}: ${s.actividad?.substring(0, 60)}...`,
                   cumplido: false
                }))
             } else {
                pedagogico.value.secuencia = [
                   { nombre: 'Introducción / Inicio', cumplido: false },
                   { nombre: 'Desarrollo del contenido', cumplido: false },
                   { nombre: 'Cierre / Conclusión', cumplido: false }
                ]
             }
         } else {
             resetPedagogico()
         }
         resetIntegracion()
         resetEvidencias()
      }
   } else {
      sesionActual.value = null
      temaPlanificado.value = ''
      temaCumplido.value = false
      observacionesClase.value = ''
      resetPedagogico()
      resetIntegracion()
      resetEvidencias()
   }
}

const resetPedagogico = () => {
   pedagogico.value.estrategias = [
      { nombre: 'Lluvia de ideas', cumplido: false },
      { nombre: 'Trabajo grupal', cumplido: false },
      { nombre: 'Exposición magistral', cumplido: false }
   ]
   pedagogico.value.evaluacion = [
      { nombre: 'Participación en clase', cumplido: false },
      { nombre: 'Prueba rápida', cumplido: false }
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

watch(claseSeleccionada, () => {
   if (claseSeleccionada.value) {
      fetchSesiones()
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

const claseSeleccionadaObj = computed(() => {
   return clasesUnificadas.value.find(c => c.id === claseSeleccionada.value)
})

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
const temaCumplido = ref(false)
const observacionesClase = ref('')

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
      // tema_cumplido is pedagogical information, not session completion status
      formData.append('tema_cumplido', temaCumplido.value ? 'true' : 'false')
      formData.append('observaciones', observacionesClase.value || '')
      
      console.log('Saving session with tema_cumplido:', temaCumplido.value)
      
      // Add pedagogical details (non-file data)
      const pedagogicoData = {
         estrategias: pedagogico.value.estrategias,
         evaluacion: pedagogico.value.evaluacion,
         secuencia: pedagogico.value.secuencia,
         integracion: pedagogico.value.integracion
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
   padding: 24px;
   background-color: #f5f7fa;
}

.page-title {
   font-size: 1.8rem;
   font-weight: 700;
   color: #1e293b;
   margin: 0;
   display: flex;
   align-items: center;
}

.page-subtitle {
   color: #64748b;
   margin: 4px 0 0 0;
}

.main-card {
   border-radius: 12px;
   border: 1px solid #e2e8f0;
   box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.nota-info {
   font-size: 0.85rem;
   color: #64748b;
   margin-top: 4px;
}
</style>
