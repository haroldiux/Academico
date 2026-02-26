<template>
  <q-card style="min-width: 750px; max-width: 95vw;">
    <q-card-section class="row items-center q-pb-none bg-indigo text-white">
      <div class="text-h6">
        <q-icon name="rule" class="q-mr-sm" />
        Auditoría Microcurricular: {{ asignaturaNombre || 'Cargando...' }}
      </div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="q-pa-md">
      <q-form @submit="onSubmit" class="q-gutter-md">
        <!-- Detalle de la Auditoría -->
        <div class="row q-col-gutter-sm items-end bg-grey-1 q-pa-sm rounded-borders">
          <div class="col-12 col-md-4">
             <q-input :model-value="docenteNombre" label="Docente" outlined dense readonly />
          </div>
          <div class="col-12 col-md-4">
             <q-input :model-value="grupoNombre" label="Grupo" outlined dense readonly />
          </div>
          <div class="col-12 col-md-4">
             <q-input v-model="form.fecha" label="Fecha Auditoría" type="date" outlined dense />
          </div>
          
          <div class="col-12 col-md-4">
             <q-select
              v-model="form.semana"
              :options="opcionesSemanas"
              label="Semana Académica"
              outlined dense
             />
          </div>
          <div class="col-12 col-md-4">
            <q-input
              :model-value="semaforoVisual.label"
              label="Alerta / Semáforo (Automático)"
              outlined dense readonly
              :input-class="'text-weight-bold text-' + semaforoVisual.color"
            >
              <template v-slot:prepend>
                <q-icon name="circle" :color="semaforoVisual.color" />
              </template>
            </q-input>
          </div>
        </div>

        <q-separator />

        <!-- Tabla de Criterios -->
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
          label="Observaciones y Hallazgos"
          type="textarea"
          outlined
          rows="2"
        />

        <q-input
          v-model="form.acciones_correctivas"
          label="Acciones Correctivas Dispuestas (Opcional)"
          type="textarea"
          outlined
          rows="2"
        />

        <div class="row justify-end q-gutter-sm">
           <q-badge color="grey-3" text-color="black" class="q-mr-auto q-pa-sm">
              <q-icon name="info" class="q-mr-xs" />
              Esta auditoría impacta en la Matriz de Control Institucional.
           </q-badge>
          <q-btn label="Cancelar" flat color="grey" v-close-popup />
          <q-btn label="Finalizar Auditoría" color="indigo" type="submit" :loading="saving" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const props = defineProps({
  asignaturaId: { type: Number, required: true },
  asignaturaNombre: { type: String, default: '' },
  docenteId: { type: Number, required: true },
  docenteNombre: { type: String, default: '' },
  grupoNombre: { type: String, default: 'G1' }
})

const emit = defineEmits(['saved'])
const $q = useQuasar()

const saving = ref(false)

const opcionesSemanas = Array.from({length: 20}, (_, i) => `Semana ${i + 1}`)

const criterios = {
  inicioPuntual: { label: 'Inicio puntual de clase', hint: 'Verificar presencia del docente al toque de timbre.' },
  secuencialidad: { label: 'Secuencialidad didáctica', hint: 'Inicio, desarrollo y cierre de la sesión.' },
  metodologias: { label: 'Uso de metodologías activas', hint: 'Participación de estudiantes, trabajo en equipo, etc.' },
  evidenciaMaterial: { label: 'Uso de material didáctico/tecnológico', hint: 'Pizarra, proyector, plataforma Moodle.' },
  asistencia: { label: 'Registro de asistencia al día', hint: 'Revisar si el docente marcó asistencia en el sistema.' }
}

const form = ref({
  fecha: new Date().toISOString().split('T')[0],
  semana: 'Semana 1',
  cumplimiento: {
    inicioPuntual: null,
    secuencialidad: null,
    metodologias: null,
    evidenciaMaterial: null,
    asistencia: null
  },
  observaciones: '',
  acciones_correctivas: ''
})

const calcSemaforo = () => {
  const values = Object.values(form.value.cumplimiento).filter(v => v !== null)
  if (values.length === 0) return 'verde'

  const positivos = values.filter(v => v === true).length
  if (positivos === 5) return 'verde'
  if (positivos >= 3) return 'amarillo'
  return 'rojo'
}

const semaforoVisual = computed(() => {
  const s = calcSemaforo()
  if (s === 'verde') return { label: 'Normal (Verde)', color: 'positive' }
  if (s === 'amarillo') return { label: 'Atención (Amarillo)', color: 'warning' }
  return { label: 'Crítico (Rojo)', color: 'negative' }
})

// Removed manual load since we get it from props

const onSubmit = async () => {
    const faltantes = Object.values(form.value.cumplimiento).some(v => v === null)
    if (faltantes) {
        $q.notify({ type: 'warning', message: 'Complete todos los criterios de evaluación' })
        return
    }

    if (!props.docenteId) {
        $q.notify({ type: 'warning', message: 'No se encontró un docente asignado a esta asignatura.' })
        return
    }

    saving.value = true
    try {
        await api.post('/auditorias', {
            asignatura_id: props.asignaturaId,
            docente_id: props.docenteId,
            semana: form.value.semana,
            tipo: 'Microcurricular',
            criterios: form.value.cumplimiento,
            observaciones: form.value.observaciones,
            acciones_correctivas: form.value.acciones_correctivas,
            semaforo: calcSemaforo()
        })
        
        $q.notify({ type: 'positive', message: 'Auditoría guardada correctamente' })
        emit('saved')
    } catch (e) {
        console.error(e)
        $q.notify({ type: 'negative', message: 'Error al enviar la auditoría' })
    } finally {
        saving.value = false
    }
}
</script>
