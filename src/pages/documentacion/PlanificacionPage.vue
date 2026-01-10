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
            {{ asignatura?.nombre }} | {{ asignatura?.carrera || 'Carrera' }}
          </p>
        </div>
      </div>
      <div class="header-actions">
        <q-select
          v-model="gestionSeleccionada"
          :options="gestionesOptions"
          outlined
          dense
          label="Gestión"
          emit-value
          map-options
          style="min-width: 150px;"
        />
        <q-btn outline color="primary" icon="content_copy" label="Copiar Gestión" no-caps @click="showCopiarDialog = true" />
        <q-btn outline color="green" icon="picture_as_pdf" label="Exportar PDF" no-caps @click="exportarPDF" />
        <q-btn unelevated color="indigo" icon="save" label="Guardar" no-caps @click="guardarTodo" :loading="guardando" />
      </div>
    </div>

    <!-- Tabs -->
    <q-card class="main-card">
      <q-tabs v-model="tabActual" dense class="text-grey" active-color="indigo" indicator-color="indigo" align="left">
        <q-tab name="horario" icon="schedule" label="1. Configurar Horario" no-caps />
        <q-tab name="planificacion" icon="view_timeline" label="2. Planificación por Unidades" no-caps :disable="!planificacionGenerada" />
        <q-tab name="preview" icon="visibility" label="3. Vista Previa" no-caps :disable="!planificacionGenerada" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tabActual" animated>
        <!-- TAB 1: HORARIO -->
        <q-tab-panel name="horario" class="q-pa-lg">
          <div class="row q-col-gutter-lg">
            <!-- Calendario Académico -->
            <div class="col-12 col-md-4">
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
            <div class="col-12 col-md-4">
              <q-card flat bordered class="config-card">
                <q-card-section>
                  <div class="text-h6 q-mb-md">
                    <q-icon name="assignment" color="orange" class="q-mr-sm" />
                    Períodos de Exámenes
                  </div>
                  <div class="examenes-grid">
                    <div class="examen-item"><q-chip color="blue-2" text-color="blue-9" size="sm">1er Parcial</q-chip><span>Sem 7-8</span></div>
                    <div class="examen-item"><q-chip color="orange-2" text-color="orange-9" size="sm">2do Parcial</q-chip><span>Sem 14-15</span></div>
                    <div class="examen-item"><q-chip color="purple-2" text-color="purple-9" size="sm">Final</q-chip><span>Sem 18-19</span></div>
                    <div class="examen-item"><q-chip color="red-2" text-color="red-9" size="sm">2da Inst.</q-chip><span>Sem 20</span></div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Unidades de Aprendizaje -->
            <div class="col-12 col-md-4">
              <q-card flat bordered class="config-card">
                <q-card-section>
                  <div class="text-h6 q-mb-md">
                    <q-icon name="folder" color="purple" class="q-mr-sm" />
                    Unidades de Aprendizaje
                  </div>
                  <div v-if="unidadesDocumentacion.length" class="unidades-preview">
                    <div v-for="unidad in unidadesDocumentacion" :key="unidad.id" class="unidad-preview-item">
                      <q-avatar color="indigo" text-color="white" size="24px">{{ unidad.numero }}</q-avatar>
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

            <!-- Horario de Clases -->
            <div class="col-12">
              <q-card flat bordered class="config-card">
                <q-card-section>
                  <div class="row items-center justify-between q-mb-md">
                    <div class="text-h6">
                      <q-icon name="schedule" color="green" class="q-mr-sm" />
                      Horario de Clases Semanal
                    </div>
                    <q-btn unelevated color="green" icon="add" label="Agregar Sesión" no-caps size="sm" @click="agregarHorario" />
                  </div>

                  <div v-if="!horarios.length" class="text-center q-pa-lg">
                    <q-icon name="schedule" size="48px" color="grey-4" />
                    <p class="text-grey-6 q-mt-md">No hay horarios. Agrega las sesiones de clase semanales.</p>
                  </div>

                  <div v-else class="horarios-grid">
                    <div v-for="(horario, idx) in horarios" :key="idx" class="horario-card">
                      <div class="horario-dia"><q-icon name="event" class="q-mr-xs" />{{ horario.dia }}</div>
                      <div class="horario-hora">{{ horario.horaInicio }} - {{ horario.horaFin }}</div>
                      <div class="horario-aula">{{ horario.aula }}</div>
                      <q-btn flat round dense icon="close" size="xs" color="red" class="delete-btn" @click="eliminarHorario(idx)" />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Botón Generar -->
            <div class="col-12 text-center">
              <q-btn 
                unelevated 
                color="indigo" 
                icon="auto_awesome" 
                label="Generar Planificación Automática" 
                size="lg"
                no-caps
                :disable="!horarios.length || !unidadesDocumentacion.length"
                @click="generarPlanificacion"
              />
              <p class="text-grey-6 q-mt-sm text-caption">
                Se distribuirán {{ totalTemasDocumentacion }} temas de {{ unidadesDocumentacion.length }} unidades en {{ totalSemanas }} semanas
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
                    <strong>ELEMENTO DE COMPETENCIA:</strong> {{ unidad.elementoCompetencia || 'Clic para editar...' }}
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
                      <th style="width:70px">SEM</th>
                      <th style="width:70px">SESIÓN</th>
                      <th style="width:150px">TEMAS</th>
                      <th>CONCEPTUAL</th>
                      <th>PROCEDIMENTAL</th>
                      <th>ACTITUDINAL</th>
                      <th>CRITERIOS</th>
                      <th>INSTRUMENTOS</th>
                      <th style="width:40px"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="sesion in unidad.sesiones" :key="sesion.id" :class="getSesionRowClass(sesion)">
                      <td class="cell-semana" :rowspan="getSemanaRowspan(unidad, sesion)" v-if="isFirstSesionOfSemana(unidad, sesion)">
                        <div class="semana-content">
                          <span class="semana-numero">{{ sesion.semana }}</span>
                          <span class="semana-fechas">{{ sesion.semanaFechas }}</span>
                          <q-chip v-if="sesion.periodoExamen" :color="getExamenColor(sesion.periodoExamen)" text-color="white" size="xs" dense class="q-mt-xs">
                            {{ sesion.periodoExamen }}
                          </q-chip>
                        </div>
                      </td>
                      <td class="cell-sesion">
                        <div class="sesion-content">
                          <span class="sesion-numero">{{ sesion.numeroGlobal }}°</span>
                          <span class="sesion-dia">{{ sesion.dia }}</span>
                          <span class="sesion-fecha">{{ sesion.fecha }}</span>
                        </div>
                      </td>
                      <td><q-input v-model="sesion.tema" outlined dense autogrow class="cell-input" placeholder="Tema..." @update:model-value="marcarModificado(sesion)" /></td>
                      <td><q-input v-model="sesion.conceptual" outlined dense type="textarea" autogrow class="cell-input" placeholder="Contenidos..." @update:model-value="marcarModificado(sesion)" /></td>
                      <td><q-input v-model="sesion.procedimental" outlined dense type="textarea" autogrow class="cell-input" placeholder="Habilidades..." @update:model-value="marcarModificado(sesion)" /></td>
                      <td><q-input v-model="sesion.actitudinal" outlined dense type="textarea" autogrow class="cell-input" placeholder="Actitudes..." @update:model-value="marcarModificado(sesion)" /></td>
                      <td><q-input v-model="sesion.criteriosDesempeno" outlined dense type="textarea" autogrow class="cell-input" placeholder="Criterios..." @update:model-value="marcarModificado(sesion)" /></td>
                      <td><q-input v-model="sesion.instrumentosEvaluacion" outlined dense type="textarea" autogrow class="cell-input" placeholder="Instrumentos..." @update:model-value="marcarModificado(sesion)" /></td>
                      <td class="cell-actions">
                        <q-btn flat round dense icon="delete" size="xs" color="red" @click="eliminarSesion(unidad, sesion)" />
                      </td>
                    </tr>
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
              <div class="preview-unidad-header">
                UNIDAD {{ uIdx + 1 }}: {{ unidad.nombre }}
              </div>
              <div class="preview-competencia">
                <strong>ELEMENTO DE COMPETENCIA {{ uIdx + 1 }}:</strong> {{ unidad.elementoCompetencia }}
              </div>
              <table class="preview-table">
                <thead>
                  <tr>
                    <th rowspan="2">SEMANAS</th>
                    <th rowspan="2">SESIONES</th>
                    <th rowspan="2">TEMAS</th>
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
                    <td class="text-center">{{ sesion.semana }}<br><small>{{ sesion.semanaFechas }}</small></td>
                    <td class="text-center">{{ sesion.numeroGlobal }}°<br><small>{{ sesion.dia }}<br>{{ sesion.fecha }}</small></td>
                    <td>{{ sesion.tema }}</td>
                    <td><div class="preview-content">{{ sesion.conceptual }}</div></td>
                    <td><div class="preview-content">{{ sesion.procedimental }}</div></td>
                    <td><div class="preview-content">{{ sesion.actitudinal }}</div></td>
                    <td><div class="preview-content">{{ sesion.criteriosDesempeno }}</div></td>
                    <td><div class="preview-content">{{ sesion.instrumentosEvaluacion }}</div></td>
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
      <q-card class="dialog-card" style="min-width: 400px;">
        <div class="dialog-header bg-green">
          <h3><q-icon name="schedule" class="q-mr-sm" /> Agregar Sesión de Clase</h3>
        </div>
        <q-card-section class="q-gutter-md">
          <q-select v-model="horarioForm.dia" :options="diasOptions" outlined label="Día" emit-value map-options />
          <div class="row q-col-gutter-md">
            <div class="col-6"><q-input v-model="horarioForm.horaInicio" outlined label="Hora Inicio" type="time" /></div>
            <div class="col-6"><q-input v-model="horarioForm.horaFin" outlined label="Hora Fin" type="time" /></div>
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
      <q-card class="dialog-card" style="min-width: 600px;">
        <div class="dialog-header">
          <h3><q-icon name="edit" class="q-mr-sm" /> Editar Unidad</h3>
        </div>
        <q-card-section class="q-gutter-md">
          <q-input v-model="unidadForm.nombre" outlined label="Nombre de la Unidad" />
          <q-input v-model="unidadForm.elementoCompetencia" outlined type="textarea" rows="4" label="Elemento de Competencia" hint="Describe la competencia que el estudiante desarrollará en esta unidad" />
        </q-card-section>
        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" @click="showUnidadDialog = false" />
          <q-btn unelevated color="indigo" label="Guardar" @click="guardarUnidad" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Copiar Gestión -->
    <q-dialog v-model="showCopiarDialog">
      <q-card class="dialog-card" style="min-width: 400px;">
        <div class="dialog-header bg-primary">
          <h3><q-icon name="content_copy" class="q-mr-sm" /> Copiar Planificación</h3>
        </div>
        <q-card-section>
          <p>Selecciona la gestión de origen:</p>
          <q-select v-model="gestionACopiar" :options="gestionesAnteriores" outlined label="Gestión origen" emit-value map-options class="q-mb-md" />
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAsignaturasStore } from 'src/stores/asignaturas'

const route = useRoute()
const $q = useQuasar()
const asignaturasStore = useAsignaturasStore()

const tabActual = ref('horario')
const gestionSeleccionada = ref('2026-I')
const showHorarioDialog = ref(false)
const showUnidadDialog = ref(false)
const showCopiarDialog = ref(false)
const planificacionGenerada = ref(false)
const guardando = ref(false)
const gestionACopiar = ref(null)
const unidadEditando = ref(null)

const gestionesOptions = [
  { label: 'Gestión 2026-I', value: '2026-I' },
  { label: 'Gestión 2025-II', value: '2025-II' },
  { label: 'Gestión 2025-I', value: '2025-I' }
]

const gestionesAnteriores = [
  { label: 'Gestión 2025-II', value: '2025-II' },
  { label: 'Gestión 2025-I', value: '2025-I' }
]

const diasOptions = [
  { label: 'Lunes', value: 'Lunes' },
  { label: 'Martes', value: 'Martes' },
  { label: 'Miércoles', value: 'Miércoles' },
  { label: 'Jueves', value: 'Jueves' },
  { label: 'Viernes', value: 'Viernes' },
  { label: 'Sábado', value: 'Sábado' }
]

const asignatura = computed(() => asignaturasStore.asignaturaActual)

onMounted(() => {
  const id = parseInt(route.params.id)
  asignaturasStore.setAsignaturaActual(id)
})

const unidadesDocumentacion = computed(() => asignatura.value?.unidades || [])
const totalTemasDocumentacion = computed(() => unidadesDocumentacion.value.reduce((sum, u) => sum + (u.temas?.length || 0), 0))

const calendario = ref({ fechaInicio: '2026-02-09', fechaFin: '2026-06-27' })
const totalSemanas = computed(() => 20)

const horarios = ref([])
const horarioForm = ref({ dia: 'Martes', horaInicio: '07:00', horaFin: '09:00', aula: '' })

const unidadForm = ref({ nombre: '', elementoCompetencia: '' })

const planificacion = ref([])

const totalSesionesGeneradas = computed(() => planificacion.value.reduce((sum, u) => sum + (u.sesiones?.length || 0), 0))

const progresoTotal = computed(() => {
  if (!totalSesionesGeneradas.value) return 0
  let completadas = 0
  planificacion.value.forEach(u => {
    u.sesiones?.forEach(s => {
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
  horarios.value.push({ ...horarioForm.value })
  horarios.value.sort((a, b) => diasOptions.findIndex(d => d.value === a.dia) - diasOptions.findIndex(d => d.value === b.dia))
  showHorarioDialog.value = false
  $q.notify({ type: 'positive', message: 'Sesión agregada', icon: 'check' })
}

function eliminarHorario(idx) {
  horarios.value.splice(idx, 1)
}

function generarPlanificacion() {
  const fechaInicio = new Date(calendario.value.fechaInicio)
  const sesionesTotal = horarios.value.length * totalSemanas.value
  const unidades = unidadesDocumentacion.value
  
  const sesionesPorUnidad = Math.floor(sesionesTotal / unidades.length)
  const sesionesExtra = sesionesTotal % unidades.length
  
  let sesionGlobal = 1
  let semanaActual = 1
  let sesionEnSemana = 0
  
  planificacion.value = unidades.map((unidad, uIdx) => {
    const cantidadSesiones = sesionesPorUnidad + (uIdx < sesionesExtra ? 1 : 0)
    const sesiones = []
    const temasUnidad = unidad.temas || []
    const sesionesPorTema = temasUnidad.length > 0 ? Math.ceil(cantidadSesiones / temasUnidad.length) : cantidadSesiones
    
    for (let i = 0; i < cantidadSesiones; i++) {
      const horarioIdx = sesionEnSemana % horarios.value.length
      const horario = horarios.value[horarioIdx]
      
      const fechaSemanaInicio = new Date(fechaInicio)
      fechaSemanaInicio.setDate(fechaInicio.getDate() + (semanaActual - 1) * 7)
      const diaIndex = diasOptions.findIndex(d => d.value === horario.dia)
      const fechaSesion = new Date(fechaSemanaInicio)
      fechaSesion.setDate(fechaSemanaInicio.getDate() + diaIndex)
      
      let periodoExamen = null
      if (semanaActual === 7 || semanaActual === 8) periodoExamen = '1er Parcial'
      else if (semanaActual === 14 || semanaActual === 15) periodoExamen = '2do Parcial'
      else if (semanaActual === 18 || semanaActual === 19) periodoExamen = 'Final'
      else if (semanaActual === 20) periodoExamen = '2da Instancia'
      
      const temaIdx = Math.floor(i / sesionesPorTema)
      const temaOriginal = temasUnidad[temaIdx]
      
      sesiones.push({
        id: sesionGlobal,
        numeroGlobal: sesionGlobal,
        semana: semanaActual,
        semanaFechas: formatDate(fechaSemanaInicio),
        dia: horario.dia,
        fecha: formatDate(fechaSesion),
        periodoExamen,
        tema: temaOriginal?.titulo || '',
        conceptual: temaOriginal?.contenidos?.conceptual?.map(c => '- ' + c).join('\n') || '',
        procedimental: temaOriginal?.contenidos?.procedimental?.map(c => '- ' + c).join('\n') || '',
        actitudinal: temaOriginal?.contenidos?.actitudinal?.map(c => '- ' + c).join('\n') || '',
        criteriosDesempeno: temaOriginal?.logros_esperados?.map(l => '- ' + l.descripcion).join('\n') || '',
        instrumentosEvaluacion: '',
        modificado: false
      })
      
      sesionGlobal++
      sesionEnSemana++
      
      if (sesionEnSemana >= horarios.value.length) {
        semanaActual++
        sesionEnSemana = 0
      }
    }
    
    return {
      id: unidad.id,
      nombre: unidad.titulo.toUpperCase(),
      elementoCompetencia: unidad.elemento_competencia || '',
      collapsed: false,
      sesiones
    }
  })
  
  planificacionGenerada.value = true
  tabActual.value = 'planificacion'
  $q.notify({ type: 'positive', message: `Planificación generada: ${totalSesionesGeneradas.value} sesiones en ${unidades.length} unidades`, icon: 'check_circle' })
}

function formatDate(date) {
  const d = new Date(date)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`
}

function isFirstSesionOfSemana(unidad, sesion) {
  const idx = unidad.sesiones.findIndex(s => s.id === sesion.id)
  if (idx === 0) return true
  return unidad.sesiones[idx].semana !== unidad.sesiones[idx - 1].semana
}

function getSemanaRowspan(unidad, sesion) {
  return unidad.sesiones.filter(s => s.semana === sesion.semana).length
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
  const newId = Math.max(...planificacion.value.flatMap(u => u.sesiones.map(s => s.id)), 0) + 1
  
  unidad.sesiones.push({
    id: newId,
    numeroGlobal: newId,
    semana: lastSesion?.semana || 1,
    semanaFechas: lastSesion?.semanaFechas || '',
    dia: lastSesion?.dia || 'Martes',
    fecha: lastSesion?.fecha || '',
    periodoExamen: null,
    tema: '',
    conceptual: '',
    procedimental: '',
    actitudinal: '',
    criteriosDesempeno: '',
    instrumentosEvaluacion: '',
    modificado: true
  })
  $q.notify({ type: 'positive', message: 'Sesión agregada', icon: 'add' })
}

function eliminarSesion(unidad, sesion) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar esta sesión?',
    cancel: true
  }).onOk(() => {
    unidad.sesiones = unidad.sesiones.filter(s => s.id !== sesion.id)
  })
}

function ejecutarCopia() {
  showCopiarDialog.value = false
  $q.notify({ type: 'positive', message: `Planificación copiada de ${gestionACopiar.value}`, icon: 'content_copy' })
}

function guardarTodo() {
  guardando.value = true
  setTimeout(() => {
    guardando.value = false
    $q.notify({ type: 'positive', message: 'Planificación guardada exitosamente', icon: 'save' })
  }, 1000)
}

function exportarPDF() {
  $q.notify({ type: 'positive', message: 'Generando PDF...', icon: 'picture_as_pdf', timeout: 2000 })
  setTimeout(() => {
    $q.notify({ type: 'positive', message: 'PDF generado exitosamente', icon: 'check_circle' })
  }, 2000)
}
</script>

<style scoped>
.planificacion-page { padding: 24px; background: var(--bg-primary); min-height: 100vh; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.header-left { display: flex; align-items: center; }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin: 0; display: flex; align-items: center; }
.page-subtitle { color: var(--text-secondary); margin: 4px 0 0 0; font-size: 0.875rem; display: flex; align-items: center; gap: 8px; }
.header-actions { display: flex; gap: 12px; flex-wrap: wrap; }

.main-card { background: var(--bg-secondary) !important; border: 1px solid var(--border-color); border-radius: 16px; }
.config-card { background: var(--bg-tertiary) !important; border-color: var(--border-color) !important; border-radius: 12px; height: 100%; }

.examenes-grid { display: flex; flex-direction: column; gap: 8px; }
.examen-item { display: flex; justify-content: space-between; align-items: center; }

.unidades-preview { display: flex; flex-direction: column; gap: 8px; }
.unidad-preview-item { display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--bg-hover); border-radius: 8px; }
.unidad-preview-info { display: flex; flex-direction: column; }
.unidad-preview-titulo { font-size: 0.8rem; font-weight: 500; color: var(--text-primary); }
.unidad-preview-temas { font-size: 0.7rem; color: var(--text-muted); }

.horarios-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.horario-card { display: flex; flex-direction: column; gap: 4px; padding: 16px; background: var(--bg-hover); border: 1px solid var(--border-color); border-radius: 10px; position: relative; }
.horario-card .delete-btn { position: absolute; top: 4px; right: 4px; }
.horario-dia { font-weight: 700; color: var(--text-primary); display: flex; align-items: center; }
.horario-hora { font-size: 0.9rem; color: var(--primary); }
.horario-aula { font-size: 0.8rem; color: var(--text-muted); }

.planificacion-resumen { display: flex; gap: 24px; padding: 16px; background: var(--bg-tertiary); border-radius: 12px; flex-wrap: wrap; }
.resumen-item { display: flex; align-items: center; gap: 12px; }
.resumen-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
.resumen-label { font-size: 0.8rem; color: var(--text-muted); }

.unidades-container { display: flex; flex-direction: column; gap: 24px; }
.unidad-section { background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 16px; overflow: hidden; }
.unidad-header { display: flex; align-items: flex-start; gap: 12px; padding: 20px; background: linear-gradient(135deg, #4338ca, #3730a3); color: white; }
.unidad-toggle { cursor: pointer; }
.unidad-info { flex: 1; cursor: pointer; }
.unidad-titulo { margin: 0; font-size: 1rem; font-weight: 700; }
.unidad-competencia { margin: 8px 0 0; font-size: 0.8rem; opacity: 0.9; }
.unidad-actions { display: flex; gap: 4px; }
.unidad-actions .q-btn { color: white; opacity: 0.8; }
.unidad-actions .q-btn:hover { opacity: 1; }

.sesiones-table-container { padding: 16px; overflow-x: auto; }
.sesiones-table { width: 100%; border-collapse: collapse; font-size: 0.75rem; }
.sesiones-table th { background: #4338ca; color: white; padding: 8px 4px; text-align: center; font-size: 0.6rem; text-transform: uppercase; }
.sesiones-table td { border: 1px solid var(--border-color); padding: 4px; vertical-align: top; }
.sesion-examen td { background: rgba(251, 191, 36, 0.1); }
.sesion-modificada td { background: rgba(16, 185, 129, 0.1); }
.cell-semana { background: var(--bg-hover); text-align: center; min-width: 60px; }
.semana-content { display: flex; flex-direction: column; gap: 2px; }
.semana-numero { font-size: 1.1rem; font-weight: 700; color: var(--primary); }
.semana-fechas { font-size: 0.6rem; color: var(--text-muted); }
.cell-sesion { background: var(--bg-hover); text-align: center; min-width: 50px; }
.sesion-content { display: flex; flex-direction: column; gap: 1px; }
.sesion-numero { font-weight: 700; color: var(--primary); font-size: 0.9rem; }
.sesion-dia { font-size: 0.65rem; color: var(--text-secondary); }
.sesion-fecha { font-size: 0.6rem; color: var(--text-muted); }
.cell-input :deep(.q-field__control) { min-height: 24px; }
.cell-input :deep(textarea) { font-size: 0.65rem; line-height: 1.2; }
.cell-actions { text-align: center; vertical-align: middle; }

/* Preview */
.preview-container { background: white; color: #333; padding: 40px; border-radius: 8px; max-width: 1200px; margin: 0 auto; }
.preview-header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #4338ca; padding-bottom: 16px; }
.preview-header h2 { margin: 0; font-size: 1.25rem; color: #4338ca; }
.preview-header h3 { margin: 4px 0 0; font-size: 1.5rem; color: #333; }
.preview-info { background: #f5f5f5; padding: 12px 16px; border-radius: 8px; }
.info-row { margin: 4px 0; }
.preview-unidad { margin-bottom: 32px; }
.preview-unidad-header { background: #4338ca; color: white; padding: 12px 16px; font-weight: bold; }
.preview-competencia { background: #f5f5f5; padding: 12px 16px; font-size: 0.85rem; border: 1px solid #ddd; }
.preview-table { width: 100%; border-collapse: collapse; font-size: 0.75rem; margin-top: -1px; }
.preview-table th { background: #6366f1; color: white; padding: 8px 4px; border: 1px solid #4338ca; }
.preview-table td { border: 1px solid #ddd; padding: 8px 4px; vertical-align: top; }
.preview-content { white-space: pre-wrap; font-size: 0.7rem; }

/* Dialog */
.dialog-card { background: var(--bg-secondary) !important; border-radius: 16px !important; }
.dialog-header { padding: 20px 24px; background: linear-gradient(135deg, #4338ca, #3730a3); color: white; margin: -16px -16px 16px -16px; border-radius: 16px 16px 0 0; }
.dialog-header.bg-green { background: linear-gradient(135deg, #10b981, #059669); }
.dialog-header.bg-primary { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.dialog-header h3 { margin: 0; font-size: 1.25rem; display: flex; align-items: center; }
.dialog-actions { padding: 16px 24px; border-top: 1px solid var(--border-color); }
</style>
