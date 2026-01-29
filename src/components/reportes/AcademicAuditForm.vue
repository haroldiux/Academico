<template>
  <q-card style="min-width: 750px; max-width: 95vw;">
    <q-card-section class="row items-center q-pb-none bg-indigo text-white">
      <div class="text-h6">
        <q-icon name="rule" class="q-mr-sm" />
        NIVEL 3: Auditoría Microcurricular in Situ
      </div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="q-pa-md">
      <q-form @submit="onSubmit" class="q-gutter-md">
        
        <!-- Selección de Clase a Auditar (Imagen A) -->
        <div class="row q-col-gutter-sm items-end bg-grey-1 q-pa-sm rounded-borders">
          <div class="col-12 col-md-4">
            <q-select 
              v-model="form.docente_id" 
              :options="opcionesDocentes" 
              label="Seleccionar Docente" 
              outlined dense emit-value map-options
              @update:model-value="onDocenteChange"
            >
              <template v-slot:prepend><q-icon name="person" /></template>
            </q-select>
          </div>
          <div class="col-12 col-md-4">
            <q-select 
              v-model="form.asignatura_id" 
              :options="opcionesMaterias" 
              label="Elegir Asignatura" 
              outlined dense emit-value map-options
              :disable="!form.docente_id"
              @update:model-value="onMateriaChange"
            >
              <template v-slot:prepend><q-icon name="menu_book" /></template>
            </q-select>
          </div>
          <div class="col-12 col-md-4">
            <q-select 
              v-model="form.grupo" 
              :options="opcionesGrupos" 
              label="Grupo" 
              outlined dense 
              :disable="!form.asignatura_id"
            >
              <template v-slot:prepend><q-icon name="groups" /></template>
            </q-select>
          </div>

          <div class="col-12 col-md-3">
             <q-input v-model="form.fecha" label="Fecha Auditoría" type="date" outlined dense />
          </div>
          <div class="col-12 col-md-3">
             <q-input v-model="form.hora" label="Hora de Ingreso" type="time" outlined dense />
          </div>
          <div class="col-12 col-md-3">
             <q-select 
              v-model="form.semana" 
              :options="['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5']" 
              label="Semana" 
              outlined dense 
             />
          </div>
          <div class="col-12 col-md-3">
             <q-input v-model="form.sesion" label="Sesión / Clase #" type="number" outlined dense />
          </div>
        </div>

        <q-separator />

        <!-- Tabla de Criterios (Imagen A) -->
        <div class="text-subtitle2 text-indigo q-mb-sm">Cumplimiento de Criterios Institucionales</div>
        <q-markup-table flat bordered separator="cell">
          <thead class="bg-indigo-1">
            <tr>
              <th class="text-left">CRITERIO DE EVALUACIÓN</th>
              <th class="text-center" style="width: 150px;">CUMPLIMIENTO</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, key) in criterios" :key="key">
              <td class="text-left">
                <div class="text-weight-bold">{{ item.label }}</div>
                <div class="text-caption text-grey-7" v-if="item.hint">{{ item.hint }}</div>
              </td>
              <td class="text-center">
                <q-btn-toggle
                  v-model="form.cumplimiento[key]"
                  flat
                  toggle-color="indigo"
                  :options="[
                    { label: 'SÍ', value: true, slot: 'si' },
                    { label: 'NO', value: false, slot: 'no' }
                  ]"
                >
                  <template v-slot:si>
                    <q-icon name="check_circle" color="positive" v-if="form.cumplimiento[key] === true" />
                  </template>
                  <template v-slot:no>
                    <q-icon name="cancel" color="negative" v-if="form.cumplimiento[key] === false" />
                  </template>
                </q-btn-toggle>
              </td>
            </tr>
          </tbody>
        </q-markup-table>

        <!-- Observaciones -->
        <q-input
          v-model="form.observaciones"
          label="Observaciones y Recomendaciones Generales"
          type="textarea"
          outlined
          rows="2"
          placeholder="Describa brevemente hallazgos o recomendaciones para el docente..."
        />

        <div class="row justify-end q-gutter-sm">
           <q-badge color="grey-3" text-color="black" class="q-mr-auto q-pa-sm">
              <q-icon name="info" class="q-mr-xs" />
              Esta auditoría impacta en la Matriz de Control Institucional.
           </q-badge>
          <q-btn label="Cancelar" flat color="grey" v-close-popup />
          <q-btn label="Finalizar Auditoría" color="indigo" type="submit" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  auditData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['saved'])
const $q = useQuasar()

const criterios = {
  inicioPuntual: { label: 'Inicio puntual de clase', hint: 'Verificar presencia del docente al toque de timbre.' },
  secuencialidad: { label: 'Secuencialidad didáctica', hint: 'Inicio, desarrollo y cierre de la sesión.' },
  metodologias: { label: 'Uso de metodologías activas', hint: 'Participación de estudiantes, trabajo en equipo, etc.' },
  evidenciaMaterial: { label: 'Uso de material didáctico/tecnológico', hint: 'Pizarra, proyector, plataforma Moodle.' },
  asistencia: { label: 'Registro de asistencia al día', hint: 'Revisar si el docente marcó asistencia en el sistema.' }
}

const form = ref({
  docente_id: null,
  asignatura_id: null,
  grupo: '',
  fecha: new Date().toISOString().split('T')[0],
  hora: new Date().toTimeString().slice(0,5),
  semana: 'Semana 4',
  sesion: 1,
  cumplimiento: {
    inicioPuntual: null,
    secuencialidad: null,
    metodologias: null,
    evidenciaMaterial: null,
    asistencia: null
  },
  observaciones: ''
})

// Mock Data para el Prototipo
const opcionesDocentes = [
  { label: 'KARINA PAOLA LOPEZ', value: 1 },
  { label: 'HAROLD MARCO ANTONIO ROJAS', value: 2 },
  { label: 'ROBERTO FERNANDEZ VACA', value: 3 }
]

const materiasPorDocente = {
  1: [{ label: 'Álgebra I', value: 101 }, { label: 'Cálculo I', value: 102 }],
  2: [{ label: 'Programación II', value: 201 }, { label: 'Base de Datos I', value: 202 }],
  3: [{ label: 'Anatomía Humana', value: 301 }]
}

const opcionesMaterias = ref([])
const opcionesGrupos = ['G1', 'G2', 'G3', 'N1']

const onDocenteChange = (val) => {
  opcionesMaterias.value = materiasPorDocente[val] || []
  form.value.asignatura_id = null
  form.value.grupo = ''
}

const onMateriaChange = (val) => {
  form.value.grupo = 'G1' // Auto-default for prototype
}

onMounted(() => {
  if (props.auditData.docente_id) {
    form.value.docente_id = props.auditData.docente_id
    onDocenteChange(form.value.docente_id)
    form.value.asignatura_id = props.auditData.asignatura_id
    form.value.grupo = props.auditData.grupo
  }
})

const onSubmit = () => {
    if (!form.value.docente_id || !form.value.asignatura_id || !form.value.grupo) {
        $q.notify({ type: 'warning', message: 'Seleccione docente, asignatura y grupo' })
        return
    }

    const faltantes = Object.values(form.value.cumplimiento).some(v => v === null)
    if (faltantes) {
        $q.notify({ type: 'warning', message: 'Complete todos los criterios de evaluación' })
        return
    }

    $q.loading.show({ message: 'Sincronizando auditoría institucional...' })
    setTimeout(() => {
        $q.loading.hide()
        
        // Find labels for readable event
        const docLabel = opcionesDocentes.find(d => d.value === form.value.docente_id)?.label
        const matLabel = opcionesMaterias.value.find(m => m.value === form.value.asignatura_id)?.label

        emit('saved', {
            ...form.value,
            docente: docLabel,
            asignatura: matLabel
        })
    }, 1200)
}
</script>
