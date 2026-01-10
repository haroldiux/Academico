<template>
  <q-page class="evaluaciones-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">
          <q-icon name="quiz" color="orange" class="q-mr-sm" />
          Gestión de Evaluaciones
        </h1>
        <p class="page-subtitle">Configura y genera exámenes desde el banco de preguntas</p>
      </div>
      <div class="header-actions">
        <q-btn unelevated color="orange" icon="add" label="Nueva Evaluación" no-caps @click="openDialog()" />
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <q-select
        v-model="filtros.sede"
        :options="sedesOptions"
        outlined
        dense
        label="Sede"
        emit-value
        map-options
        clearable
        style="min-width: 180px;"
      />
      <q-select
        v-model="filtros.carrera"
        :options="carrerasOptions"
        outlined
        dense
        label="Carrera"
        emit-value
        map-options
        clearable
        style="min-width: 220px;"
      />
      <q-select
        v-model="filtros.materia"
        :options="materiasOptions"
        outlined
        dense
        label="Materia"
        emit-value
        map-options
        clearable
        style="min-width: 220px;"
      />
      <q-select
        v-model="filtros.estado"
        :options="estadosOptions"
        outlined
        dense
        label="Estado"
        emit-value
        map-options
        clearable
        style="min-width: 150px;"
      />
    </div>

    <!-- Estadísticas -->
    <div class="stats-row">
      <div class="stat-card">
        <q-icon name="assignment" size="28px" color="orange" />
        <div class="stat-info">
          <span class="stat-value">{{ evaluaciones.length }}</span>
          <span class="stat-label">Evaluaciones</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="check_circle" size="28px" color="green" />
        <div class="stat-info">
          <span class="stat-value">{{ evaluacionesProgramadas }}</span>
          <span class="stat-label">Programadas</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="edit_note" size="28px" color="blue" />
        <div class="stat-info">
          <span class="stat-value">{{ evaluacionesBorrador }}</span>
          <span class="stat-label">Borrador</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="done_all" size="28px" color="purple" />
        <div class="stat-info">
          <span class="stat-value">{{ evaluacionesCompletadas }}</span>
          <span class="stat-label">Completadas</span>
        </div>
      </div>
    </div>

    <!-- Tabla de Evaluaciones -->
    <q-card class="table-card">
      <q-table
        :rows="evaluacionesFiltradas"
        :columns="columns"
        row-key="id"
        flat
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:body-cell-materia="props">
          <q-td :props="props">
            <div class="materia-cell">
              <q-chip size="sm" color="primary" text-color="white" dense>{{ props.row.materia_codigo }}</q-chip>
              <span>{{ props.row.materia_nombre }}</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-tipo="props">
          <q-td :props="props">
            <q-chip 
              :color="getTipoColor(props.row.tipo)" 
              text-color="white"
              size="sm"
              dense
            >
              {{ props.row.tipo }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-chip 
              :color="getEstadoColor(props.row.estado)" 
              :text-color="getEstadoTextColor(props.row.estado)"
              size="sm"
              dense
            >
              <q-icon :name="getEstadoIcon(props.row.estado)" size="14px" class="q-mr-xs" />
              {{ props.row.estado }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-preguntas="props">
          <q-td :props="props">
            <div class="flex items-center gap-2">
              <span class="text-weight-medium">{{ props.row.preguntas_count }}</span>
              <q-linear-progress 
                :value="props.row.preguntas_count / props.row.preguntas_total" 
                color="primary"
                style="width: 60px;"
                rounded
              />
              <span class="text-grey-6">/ {{ props.row.preguntas_total }}</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn flat round dense icon="visibility" size="sm" color="primary" @click="verEvaluacion(props.row)">
              <q-tooltip>Ver detalles</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="edit" size="sm" color="grey" @click="editarEvaluacion(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="auto_awesome" size="sm" color="orange" @click="generarExamen(props.row)">
              <q-tooltip>Generar Examen</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="picture_as_pdf" size="sm" color="red" @click="exportarPDF(props.row)">
              <q-tooltip>Exportar PDF</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Crear/Editar Evaluación -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="dialog-card" style="min-width: 700px; max-width: 90vw;">
        <div class="dialog-header">
          <h3>
            <q-icon :name="editMode ? 'edit' : 'add_circle'" class="q-mr-sm" />
            {{ editMode ? 'Editar' : 'Nueva' }} Evaluación
          </h3>
        </div>

        <q-card-section>
          <q-stepper v-model="step" vertical color="orange" animated>
            <!-- Paso 1: Información Básica -->
            <q-step :name="1" title="Información Básica" icon="info" :done="step > 1">
              <div class="q-gutter-md">
                <q-input v-model="form.nombre" outlined label="Nombre de la Evaluación *" placeholder="Ej: Primer Parcial - Anatomía I" />
                
                <div class="row q-col-gutter-md">
                  <div class="col-6">
                    <q-select
                      v-model="form.carrera_id"
                      :options="carrerasOptions"
                      outlined
                      label="Carrera *"
                      emit-value
                      map-options
                    />
                  </div>
                  <div class="col-6">
                    <q-select
                      v-model="form.materia_id"
                      :options="materiasOptions"
                      outlined
                      label="Materia *"
                      emit-value
                      map-options
                    />
                  </div>
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-4">
                    <q-select
                      v-model="form.tipo"
                      :options="tiposEvaluacion"
                      outlined
                      label="Tipo de Evaluación *"
                      emit-value
                      map-options
                    />
                  </div>
                  <div class="col-4">
                    <q-input v-model="form.fecha" outlined type="date" label="Fecha de Aplicación" />
                  </div>
                  <div class="col-4">
                    <q-input v-model.number="form.duracion" outlined type="number" label="Duración (min)" min="15" />
                  </div>
                </div>
              </div>

              <q-stepper-navigation>
                <q-btn unelevated color="orange" label="Siguiente" @click="step = 2" />
              </q-stepper-navigation>
            </q-step>

            <!-- Paso 2: Configuración de Preguntas -->
            <q-step :name="2" title="Configuración de Preguntas" icon="quiz" :done="step > 2">
              <div class="q-gutter-md">
                <q-banner class="bg-blue-1 text-blue-9 q-mb-md" rounded>
                  <template v-slot:avatar>
                    <q-icon name="info" />
                  </template>
                  Selecciona cuántas preguntas incluir de cada tema y nivel de dificultad.
                </q-banner>

                <div class="row q-col-gutter-md">
                  <div class="col-4">
                    <q-input v-model.number="form.preguntas_total" outlined type="number" label="Total de Preguntas *" min="5" />
                  </div>
                  <div class="col-4">
                    <q-input v-model.number="form.puntos_total" outlined type="number" label="Puntaje Total" />
                  </div>
                  <div class="col-4">
                    <q-select
                      v-model="form.distribucion"
                      :options="distribucionOptions"
                      outlined
                      label="Distribución"
                      emit-value
                      map-options
                    />
                  </div>
                </div>

                <!-- Distribución por Dificultad -->
                <div class="distribucion-card">
                  <h4>Distribución por Dificultad</h4>
                  <div class="distribucion-grid">
                    <div class="distribucion-item">
                      <label>Fácil</label>
                      <q-slider v-model="form.facil" :min="0" :max="100" label color="green" />
                      <span>{{ form.facil }}%</span>
                    </div>
                    <div class="distribucion-item">
                      <label>Medio</label>
                      <q-slider v-model="form.medio" :min="0" :max="100" label color="orange" />
                      <span>{{ form.medio }}%</span>
                    </div>
                    <div class="distribucion-item">
                      <label>Difícil</label>
                      <q-slider v-model="form.dificil" :min="0" :max="100" label color="red" />
                      <span>{{ form.dificil }}%</span>
                    </div>
                  </div>
                </div>

                <!-- Selección de Temas -->
                <div class="temas-card">
                  <h4>Temas a Incluir</h4>
                  <div class="temas-list">
                    <q-checkbox v-for="tema in temasDisponibles" :key="tema.id" v-model="form.temas" :val="tema.id" :label="tema.nombre" />
                  </div>
                </div>
              </div>

              <q-stepper-navigation>
                <q-btn flat label="Atrás" @click="step = 1" class="q-mr-sm" />
                <q-btn unelevated color="orange" label="Siguiente" @click="step = 3" />
              </q-stepper-navigation>
            </q-step>

            <!-- Paso 3: Opciones Adicionales -->
            <q-step :name="3" title="Opciones Adicionales" icon="settings">
              <div class="q-gutter-md">
                <div class="toggle-list">
                  <div class="toggle-item">
                    <div class="toggle-info">
                      <span class="toggle-label">Aleatorizar orden de preguntas</span>
                      <span class="toggle-desc">Las preguntas aparecerán en orden diferente para cada estudiante</span>
                    </div>
                    <q-toggle v-model="form.aleatorizar_preguntas" color="orange" />
                  </div>
                  <div class="toggle-item">
                    <div class="toggle-info">
                      <span class="toggle-label">Aleatorizar opciones de respuesta</span>
                      <span class="toggle-desc">Las opciones de cada pregunta tendrán orden diferente</span>
                    </div>
                    <q-toggle v-model="form.aleatorizar_opciones" color="orange" />
                  </div>
                  <div class="toggle-item">
                    <div class="toggle-info">
                      <span class="toggle-label">Mostrar respuestas correctas al finalizar</span>
                      <span class="toggle-desc">El estudiante verá las respuestas correctas después de enviar</span>
                    </div>
                    <q-toggle v-model="form.mostrar_respuestas" color="orange" />
                  </div>
                  <div class="toggle-item">
                    <div class="toggle-info">
                      <span class="toggle-label">Generar múltiples versiones</span>
                      <span class="toggle-desc">Crear diferentes versiones del examen (A, B, C...)</span>
                    </div>
                    <q-toggle v-model="form.multiples_versiones" color="orange" />
                  </div>
                </div>

                <q-input 
                  v-if="form.multiples_versiones"
                  v-model.number="form.num_versiones" 
                  outlined 
                  type="number" 
                  label="Número de versiones" 
                  min="2" 
                  max="5"
                  style="max-width: 200px;"
                />
              </div>

              <q-stepper-navigation>
                <q-btn flat label="Atrás" @click="step = 2" class="q-mr-sm" />
                <q-btn unelevated color="orange" :label="editMode ? 'Guardar Cambios' : 'Crear Evaluación'" @click="guardarEvaluacion" />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog Vista Previa / Generar Examen -->
    <q-dialog v-model="showGenerarDialog" maximized>
      <q-card class="dialog-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            <q-icon name="auto_awesome" color="orange" class="q-mr-sm" />
            Generar Examen: {{ evaluacionSeleccionada?.nombre }}
          </div>
          <q-space />
          <q-btn flat round dense icon="close" @click="showGenerarDialog = false" />
        </q-card-section>

        <q-card-section>
          <div class="examen-preview">
            <div class="examen-header">
              <h2>UNIVERSIDAD TECNOLÓGICA PRIVADA DE COCHABAMBA</h2>
              <h3>{{ evaluacionSeleccionada?.nombre }}</h3>
              <p>{{ evaluacionSeleccionada?.materia_nombre }} | {{ evaluacionSeleccionada?.tipo }}</p>
              <div class="examen-info">
                <span>Fecha: {{ evaluacionSeleccionada?.fecha }}</span>
                <span>Duración: {{ evaluacionSeleccionada?.duracion }} min</span>
                <span>Puntos: {{ evaluacionSeleccionada?.puntos_total }}</span>
              </div>
            </div>

            <div class="preguntas-preview">
              <div v-for="(pregunta, idx) in preguntasGeneradas" :key="idx" class="pregunta-item">
                <div class="pregunta-numero">{{ idx + 1 }}</div>
                <div class="pregunta-content">
                  <p class="pregunta-texto">{{ pregunta.enunciado }}</p>
                  <div class="opciones">
                    <div v-for="(opcion, oidx) in pregunta.opciones" :key="oidx" class="opcion-item">
                      <span class="opcion-letra">{{ String.fromCharCode(97 + oidx) }})</span>
                      <span>{{ opcion }}</span>
                    </div>
                  </div>
                </div>
                <div class="pregunta-puntos">{{ pregunta.puntos }} pts</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Regenerar" icon="refresh" @click="regenerarPreguntas" />
          <q-btn unelevated color="orange" icon="picture_as_pdf" label="Exportar PDF" @click="exportarPDF(evaluacionSeleccionada)" />
          <q-btn unelevated color="green" icon="check" label="Confirmar y Guardar" @click="confirmarExamen" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'

const $q = useQuasar()
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()

const showDialog = ref(false)
const showGenerarDialog = ref(false)
const editMode = ref(false)
const step = ref(1)
const evaluacionSeleccionada = ref(null)

const filtros = ref({
  sede: null,
  carrera: null,
  materia: null,
  estado: null
})

const form = ref({
  id: null,
  nombre: '',
  carrera_id: null,
  materia_id: null,
  tipo: 'Parcial',
  fecha: '',
  duracion: 90,
  preguntas_total: 20,
  puntos_total: 100,
  distribucion: 'balanceada',
  facil: 30,
  medio: 50,
  dificil: 20,
  temas: [],
  aleatorizar_preguntas: true,
  aleatorizar_opciones: true,
  mostrar_respuestas: false,
  multiples_versiones: false,
  num_versiones: 2
})

// Datos de ejemplo
const evaluaciones = ref([
  { id: 1, nombre: 'Primer Parcial - Anatomía I', materia_id: 101, materia_codigo: 'MED-101', materia_nombre: 'Anatomía I', tipo: 'Parcial', fecha: '2026-03-15', duracion: 90, preguntas_count: 25, preguntas_total: 25, puntos_total: 100, estado: 'Programada' },
  { id: 2, nombre: 'Segundo Parcial - Anatomía I', materia_id: 101, materia_codigo: 'MED-101', materia_nombre: 'Anatomía I', tipo: 'Parcial', fecha: '2026-04-20', duracion: 90, preguntas_count: 15, preguntas_total: 25, puntos_total: 100, estado: 'Borrador' },
  { id: 3, nombre: 'Examen Final - Cálculo I', materia_id: 1, materia_codigo: 'MAT-101', materia_nombre: 'Cálculo I', tipo: 'Final', fecha: '2026-06-25', duracion: 120, preguntas_count: 30, preguntas_total: 30, puntos_total: 100, estado: 'Borrador' },
  { id: 4, nombre: 'Quiz Unidad 1 - Programación I', materia_id: 3, materia_codigo: 'PRG-101', materia_nombre: 'Programación I', tipo: 'Quiz', fecha: '2026-02-10', duracion: 30, preguntas_count: 10, preguntas_total: 10, puntos_total: 20, estado: 'Completada' },
  { id: 5, nombre: 'Práctica - Biología Celular', materia_id: 102, materia_codigo: 'MED-102', materia_nombre: 'Biología Celular', tipo: 'Práctica', fecha: '2026-03-01', duracion: 45, preguntas_count: 15, preguntas_total: 15, puntos_total: 50, estado: 'Completada' }
])

const preguntasGeneradas = ref([
  { enunciado: '¿Cuál es la función principal del hueso temporal?', opciones: ['Proteger el cerebro', 'Soportar el oído medio', 'Articular con la mandíbula', 'Todas las anteriores'], puntos: 4 },
  { enunciado: 'El músculo deltoides se encuentra en:', opciones: ['El hombro', 'El brazo', 'El antebrazo', 'La espalda'], puntos: 4 },
  { enunciado: '¿Cuántos huesos tiene el cráneo de un adulto?', opciones: ['8', '10', '12', '14'], puntos: 4 }
])

const temasDisponibles = ref([
  { id: 1, nombre: 'Sistema Óseo' },
  { id: 2, nombre: 'Sistema Muscular' },
  { id: 3, nombre: 'Sistema Nervioso' },
  { id: 4, nombre: 'Sistema Circulatorio' },
  { id: 5, nombre: 'Sistema Respiratorio' }
])

const columns = [
  { name: 'nombre', label: 'Evaluación', field: 'nombre', align: 'left', sortable: true },
  { name: 'materia', label: 'Materia', field: 'materia_nombre', align: 'left', sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center', sortable: true },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'center', sortable: true },
  { name: 'preguntas', label: 'Preguntas', field: 'preguntas_count', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const sedesOptions = computed(() => 
  sedesStore.sedes.map(s => ({ label: s.nombre, value: s.id }))
)

const carrerasOptions = computed(() => 
  carrerasStore.carreras.map(c => ({ label: c.nombre, value: c.id }))
)

const materiasOptions = [
  { label: 'Anatomía I (MED-101)', value: 101 },
  { label: 'Biología Celular (MED-102)', value: 102 },
  { label: 'Cálculo I (MAT-101)', value: 1 },
  { label: 'Programación I (PRG-101)', value: 3 }
]

const estadosOptions = [
  { label: 'Borrador', value: 'Borrador' },
  { label: 'Programada', value: 'Programada' },
  { label: 'Completada', value: 'Completada' }
]

const tiposEvaluacion = [
  { label: 'Parcial', value: 'Parcial' },
  { label: 'Final', value: 'Final' },
  { label: 'Quiz', value: 'Quiz' },
  { label: 'Práctica', value: 'Práctica' }
]

const distribucionOptions = [
  { label: 'Balanceada', value: 'balanceada' },
  { label: 'Por Tema', value: 'tema' },
  { label: 'Personalizada', value: 'personalizada' }
]

const evaluacionesFiltradas = computed(() => {
  let resultado = evaluaciones.value
  
  if (filtros.value.materia) {
    resultado = resultado.filter(e => e.materia_id === filtros.value.materia)
  }
  if (filtros.value.estado) {
    resultado = resultado.filter(e => e.estado === filtros.value.estado)
  }
  
  return resultado
})

const evaluacionesProgramadas = computed(() => 
  evaluaciones.value.filter(e => e.estado === 'Programada').length
)

const evaluacionesBorrador = computed(() => 
  evaluaciones.value.filter(e => e.estado === 'Borrador').length
)

const evaluacionesCompletadas = computed(() => 
  evaluaciones.value.filter(e => e.estado === 'Completada').length
)

function getTipoColor(tipo) {
  const colores = {
    'Parcial': 'blue',
    'Final': 'purple',
    'Quiz': 'orange',
    'Práctica': 'teal'
  }
  return colores[tipo] || 'grey'
}

function getEstadoColor(estado) {
  const colores = {
    'Borrador': 'grey-3',
    'Programada': 'green-2',
    'Completada': 'purple-2'
  }
  return colores[estado] || 'grey-3'
}

function getEstadoTextColor(estado) {
  const colores = {
    'Borrador': 'grey-7',
    'Programada': 'green-9',
    'Completada': 'purple-9'
  }
  return colores[estado] || 'grey-7'
}

function getEstadoIcon(estado) {
  const icons = {
    'Borrador': 'edit_note',
    'Programada': 'event',
    'Completada': 'check_circle'
  }
  return icons[estado] || 'help'
}

function openDialog() {
  editMode.value = false
  step.value = 1
  form.value = {
    id: null,
    nombre: '',
    carrera_id: null,
    materia_id: null,
    tipo: 'Parcial',
    fecha: '',
    duracion: 90,
    preguntas_total: 20,
    puntos_total: 100,
    distribucion: 'balanceada',
    facil: 30,
    medio: 50,
    dificil: 20,
    temas: [],
    aleatorizar_preguntas: true,
    aleatorizar_opciones: true,
    mostrar_respuestas: false,
    multiples_versiones: false,
    num_versiones: 2
  }
  showDialog.value = true
}

function editarEvaluacion(evaluacion) {
  editMode.value = true
  step.value = 1
  form.value = { ...evaluacion }
  showDialog.value = true
}

function verEvaluacion(evaluacion) {
  evaluacionSeleccionada.value = evaluacion
  showGenerarDialog.value = true
}

function guardarEvaluacion() {
  if (editMode.value) {
    const idx = evaluaciones.value.findIndex(e => e.id === form.value.id)
    if (idx !== -1) {
      evaluaciones.value[idx] = { ...form.value }
    }
  } else {
    const newId = Math.max(...evaluaciones.value.map(e => e.id), 0) + 1
    evaluaciones.value.push({
      ...form.value,
      id: newId,
      materia_codigo: 'NEW-101',
      preguntas_count: 0,
      estado: 'Borrador'
    })
  }
  showDialog.value = false
  $q.notify({ type: 'positive', message: 'Evaluación guardada exitosamente' })
}

function generarExamen(evaluacion) {
  evaluacionSeleccionada.value = evaluacion
  showGenerarDialog.value = true
}

function regenerarPreguntas() {
  $q.notify({ type: 'info', message: 'Preguntas regeneradas' })
}

function confirmarExamen() {
  $q.notify({ type: 'positive', message: 'Examen confirmado y guardado' })
  showGenerarDialog.value = false
}

function exportarPDF(evaluacion) {
  $q.notify({ type: 'positive', message: `Exportando PDF: ${evaluacion.nombre}`, icon: 'picture_as_pdf' })
}
</script>

<style scoped>
.evaluaciones-page {
  padding: 24px;
  background: var(--bg-primary);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.75rem;
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
}

.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: block;
}

.table-card {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.materia-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog-card {
  background: var(--bg-secondary) !important;
  border-radius: 16px !important;
}

.dialog-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  margin: -16px -16px 16px -16px;
  border-radius: 16px 16px 0 0;
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

.distribucion-card, .temas-card {
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 12px;
}

.distribucion-card h4, .temas-card h4 {
  margin: 0 0 16px 0;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.distribucion-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.distribucion-item {
  display: grid;
  grid-template-columns: 80px 1fr 50px;
  align-items: center;
  gap: 12px;
}

.distribucion-item label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.temas-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.toggle-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.toggle-label {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
}

.toggle-desc {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Vista previa del examen */
.examen-preview {
  max-height: 70vh;
  overflow-y: auto;
}

.examen-header {
  text-align: center;
  padding: 24px;
  border-bottom: 2px solid var(--border-color);
  margin-bottom: 24px;
}

.examen-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.examen-header h3 {
  margin: 8px 0;
  font-size: 1.1rem;
  color: var(--primary);
}

.examen-header p {
  margin: 0;
  color: var(--text-secondary);
}

.examen-info {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 12px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.preguntas-preview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pregunta-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 12px;
}

.pregunta-numero {
  width: 32px;
  height: 32px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.pregunta-content {
  flex: 1;
}

.pregunta-texto {
  margin: 0 0 12px 0;
  font-weight: 500;
  color: var(--text-primary);
}

.opciones {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.opcion-item {
  display: flex;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.opcion-letra {
  font-weight: 600;
  color: var(--text-primary);
}

.pregunta-puntos {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--primary);
}

@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .temas-list { grid-template-columns: 1fr; }
}
</style>
