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
                     <div class="col-12 col-md-3">
                        <q-input v-model="fechaSeguimiento" type="date" label="Fecha" outlined dense />
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
                                    outlined />
                              </div>
                              <div class="col-12 col-md-6 flex items-center">
                                 <q-checkbox v-model="temaCumplido" label="Tema Cumplido" color="green" size="lg" />
                              </div>
                              <div class="col-12">
                                 <q-input v-model="observacionesClase" label="Observaciones Generales" type="textarea"
                                    outlined rows="3" />
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
                                             color="green" />
                                       </div>
                                    </td>
                                    <td class="q-pa-sm" style="vertical-align: top">
                                       <div v-for="(item, idx) in pedagogico.evaluacion" :key="'eva-' + idx"
                                          class="q-mb-xs">
                                          <q-checkbox v-model="item.cumplido" :label="item.nombre" dense
                                             color="green" />
                                       </div>
                                    </td>
                                    <td class="q-pa-sm" style="vertical-align: top">
                                       <div v-for="(item, idx) in pedagogico.secuencia" :key="'sec-' + idx"
                                          class="q-mb-xs">
                                          <q-checkbox v-model="item.cumplido" :label="item.nombre" dense
                                             color="green" />
                                       </div>
                                    </td>
                                 </tr>
                              </tbody>
                           </q-markup-table>
                        </div>

                        <!-- Sección de Evidencias -->
                        <div class="q-mt-lg">
                           <div class="text-subtitle1 text-weight-bold q-mb-sm">
                              <q-icon name="folder_open" class="q-mr-xs" />
                              Evidencias de la Clase
                           </div>
                           <q-card flat bordered class="q-pa-md">
                              <div class="row q-col-gutter-md">
                                 <!-- Subir Fotos -->
                                 <div class="col-12 col-md-4">
                                    <div class="text-caption text-grey-7 q-mb-sm">Fotografías</div>
                                    <q-file v-model="evidencias.fotos" label="Subir fotos" outlined dense multiple
                                       accept="image/*" max-files="5">
                                       <template v-slot:prepend>
                                          <q-icon name="photo_camera" color="primary" />
                                       </template>
                                    </q-file>
                                    <div v-if="evidencias.fotos.length" class="q-mt-sm">
                                       <q-chip v-for="(foto, idx) in evidencias.fotos" :key="idx" removable
                                          @remove="evidencias.fotos.splice(idx, 1)" size="sm" color="blue-1"
                                          text-color="primary">
                                          {{ foto.name }}
                                       </q-chip>
                                    </div>
                                 </div>

                                 <!-- Links -->
                                 <div class="col-12 col-md-4">
                                    <div class="text-caption text-grey-7 q-mb-sm">Enlaces / Links</div>
                                    <div class="row q-col-gutter-sm">
                                       <div class="col-9">
                                          <q-input v-model="nuevoLink" placeholder="https://..." outlined dense>
                                             <template v-slot:prepend>
                                                <q-icon name="link" color="primary" />
                                             </template>
                                          </q-input>
                                       </div>
                                       <div class="col-3">
                                          <q-btn color="primary" icon="add" unelevated dense class="full-width"
                                             style="height: 40px" @click="agregarLink" />
                                       </div>
                                    </div>
                                    <div v-if="evidencias.links.length" class="q-mt-sm">
                                       <q-chip v-for="(link, idx) in evidencias.links" :key="idx" removable
                                          @remove="evidencias.links.splice(idx, 1)" size="sm" color="green-1"
                                          text-color="green-8" clickable @click="window.open(link, '_blank')">
                                          <q-icon name="link" size="xs" class="q-mr-xs" />
                                          {{ link.substring(0, 30) }}...
                                       </q-chip>
                                    </div>
                                 </div>

                                 <!-- Documentos -->
                                 <div class="col-12 col-md-4">
                                    <div class="text-caption text-grey-7 q-mb-sm">Documentos</div>
                                    <q-file v-model="evidencias.documentos" label="Subir documentos" outlined dense
                                       multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" max-files="5">
                                       <template v-slot:prepend>
                                          <q-icon name="description" color="primary" />
                                       </template>
                                    </q-file>
                                    <div v-if="evidencias.documentos.length" class="q-mt-sm">
                                       <q-chip v-for="(doc, idx) in evidencias.documentos" :key="idx" removable
                                          @remove="evidencias.documentos.splice(idx, 1)" size="sm" color="orange-1"
                                          text-color="orange-8">
                                          <q-icon name="insert_drive_file" size="xs" class="q-mr-xs" />
                                          {{ doc.name }}
                                       </q-chip>
                                    </div>
                                 </div>
                              </div>
                           </q-card>
                        </div>

                        <div class="flex justify-end q-mt-lg">
                           <q-btn color="secondary" icon="save_as" label="Guardar Seguimiento"
                              @click="guardarSeguimiento" />
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
const fechaSeguimiento = ref(new Date().toISOString().split('T')[0])
const loading = ref(false)
const loadingSesiones = ref(false)

// Real Data from Store
const materiasReales = ref([])
const sesiones = ref([])
const sesionActual = ref(null)

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
      actualizarSesionPorFecha()
   } catch (error) {
      console.error('Error fetching sessions:', error)
   } finally {
      loadingSesiones.value = false
   }
}

const actualizarSesionPorFecha = () => {
   if (!sesiones.value.length) return

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

      temaCumplido.value = found.cumplido || false
      observacionesClase.value = found.observaciones || ''

      // 2. Pedagogical Details Mapping (Strategies, Evaluation, Sequence)
      // If we have saved tracking data in the session, use it!
      if (found.pedagogico && typeof found.pedagogico === 'object') {
         pedagogico.value = JSON.parse(JSON.stringify(found.pedagogico))
         return
      }

      // We look for planningPersonal first, then shared fields on Tema
      const planning = found.tema?.planificacion_personal || found.tema

      if (planning) {
         // ESTRATEGIAS: map recursos array or split text
         let estrategias = []
         if (Array.isArray(planning.estrategias_recursos)) {
            estrategias = planning.estrategias_recursos.map(r => ({ nombre: r, cumplido: false }))
         }
         // Add text categories if present
         if (planning.estrategias_metodologicas && typeof planning.estrategias_metodologicas === 'string') {
            estrategias.unshift({ nombre: `Metodología: ${planning.estrategias_metodologicas.substring(0, 50)}...`, cumplido: false })
         }

         pedagogico.value.estrategias = estrategias.length ? estrategias : [
            { nombre: 'Lluvia de ideas', cumplido: false },
            { nombre: 'Trabajo grupal', cumplido: false }
         ]

         // EVALUACION: map from formativa/sumativa objects (actividades, instrumentos, evidencias)
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

         pedagogico.value.evaluacion = evaluaciones.length ? evaluaciones : [
            { nombre: 'Participación en clase', cumplido: false },
            { nombre: 'Prueba rápida', cumplido: false }
         ]

         // SECUENCIA: map from secuencia_didactica array
         if (Array.isArray(planning.secuencia_didactica)) {
            pedagogico.value.secuencia = planning.secuencia_didactica.map(s => ({
               nombre: `${s.momento}: ${s.actividad?.substring(0, 60)}...`,
               cumplido: false
            }))
         } else {
            // Check if it's the old Tema structure or fallback
            pedagogico.value.secuencia = [
               { nombre: 'Introducción', cumplido: false },
               { nombre: 'Desarrollo', cumplido: false },
               { nombre: 'Cierre', cumplido: false }
            ]
         }
      } else {
         // Fallback to defaults if no topic/planning
         resetPedagogico()
      }
   } else {
      sesionActual.value = null
      temaPlanificado.value = ''
      temaCumplido.value = false
      observacionesClase.value = ''
      resetPedagogico()
   }
}

const resetPedagogico = () => {
   pedagogico.value.estrategias = [
      { nombre: 'Lluvia de ideas', cumplido: false },
      { nombre: 'Trabajo grupal', cumplido: false },
      { nombre: 'Exposición magistral', cumplido: false },
      { nombre: 'Casos prácticos', cumplido: false }
   ]
   pedagogico.value.evaluacion = [
      { nombre: 'Participación en clase', cumplido: false },
      { nombre: 'Prueba rápida', cumplido: false },
      { nombre: 'Trabajo en grupo', cumplido: false }
   ]
   pedagogico.value.secuencia = [
      { nombre: 'Introducción', cumplido: false },
      { nombre: 'Resultados de aprendizaje / Logros esperados', cumplido: false },
      { nombre: 'Contenidos de la clase', cumplido: false },
      { nombre: 'Cuerpo de contenidos', cumplido: false },
      { nombre: 'Conclusión o cierre', cumplido: false }
   ]
}

watch(claseSeleccionada, () => {
   if (claseSeleccionada.value) {
      fetchSesiones()
   }
})

watch(fechaSeguimiento, () => {
   actualizarSesionPorFecha()
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

// Mocks for prototype structure
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
   estrategias: [
      { nombre: 'Lluvia de ideas', cumplido: false },
      { nombre: 'Trabajo grupal', cumplido: false },
      { nombre: 'Exposición magistral', cumplido: false },
      { nombre: 'Casos prácticos', cumplido: false }
   ],
   evaluacion: [
      { nombre: 'Participación en clase', cumplido: false },
      { nombre: 'Prueba rápida', cumplido: false },
      { nombre: 'Trabajo en grupo', cumplido: false }
   ],
   secuencia: [
      { nombre: 'Introducción', cumplido: false },
      { nombre: 'Resultados de aprendizaje / Logros esperados', cumplido: false },
      { nombre: 'Contenidos de la clase', cumplido: false },
      { nombre: 'Cuerpo de contenidos', cumplido: false },
      { nombre: 'Conclusión o cierre', cumplido: false }
   ]
})

// Evidencias
const evidencias = ref({
   fotos: [],
   links: [],
   documentos: []
})
const nuevoLink = ref('')

const agregarLink = () => {
   if (nuevoLink.value && nuevoLink.value.trim()) {
      evidencias.value.links.push(nuevoLink.value.trim())
      nuevoLink.value = ''
   }
}

const guardarSeguimiento = async () => {
   if (!sesionActual.value) {
      $q.notify({ type: 'warning', message: 'No hay una sesión de planificación para esta fecha' })
      return
   }

   try {
      await planificacionSemestralService.saveSeguimiento(sesionActual.value.id, {
         cumplido: temaCumplido.value,
         observaciones: observacionesClase.value,
         pedagogico: pedagogico.value // Includes checkboxes states
      })

      $q.notify({
         type: 'positive',
         message: 'Seguimiento de clase actualizado correctamente',
         icon: 'save'
      })

      // Refresh data to ensure sync
      fetchSesiones()
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
