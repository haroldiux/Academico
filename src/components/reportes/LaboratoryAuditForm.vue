<template>
  <q-card style="min-width: 750px; max-width: 95vw">
    <q-card-section class="row items-center q-pb-none bg-teal text-white">
      <div class="text-h6">
        <q-icon name="biotech" class="q-mr-sm" />
        Auditoría de Simulación, Laboratorio y Prácticas
      </div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="q-pa-md">
      <q-form @submit="onSubmit" class="q-gutter-md">
        <!-- Selección de Clase (Sincronizado) -->
        <div class="row q-col-gutter-sm items-end bg-teal-1 q-pa-sm rounded-borders">
          <div class="col-12 col-md-4">
            <q-select
              v-model="form.docente_id"
              :options="opcionesDocentes"
              label="Seleccionar Docente"
              outlined
              dense
              emit-value
              map-options
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
              outlined
              dense
              emit-value
              map-options
              :disable="!form.docente_id"
            >
              <template v-slot:prepend><q-icon name="menu_book" /></template>
            </q-select>
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="form.grupo"
              :options="['G1', 'G2', 'G3', 'N1']"
              label="Grupo"
              outlined
              dense
              :disable="!form.asignatura_id"
            >
              <template v-slot:prepend><q-icon name="groups" /></template>
            </q-select>
          </div>

          <div class="col-12 col-md-3">
            <q-input v-model="form.fecha" label="Fecha Supervisión" type="date" outlined dense />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="form.hora" label="Hora de Ingreso" type="time" outlined dense />
          </div>
          <div class="col-12 col-md-3">
            <div class="text-caption text-grey-8">Semana / Sesión</div>
            <div class="row no-wrap q-gutter-xs">
              <q-select
                label="Semana"
                v-model="form.semana"
                :options="['S1', 'S2', 'S3', 'S4']"
                outlined
                dense
                class="col"
              />
              <q-input
                label="Sesión"
                v-model="form.sesion"
                type="number"
                outlined
                dense
                class="col"
              />
            </div>
          </div>
          <div class="col-12 col-md-3 text-right">
            <q-badge color="teal" class="q-pa-sm">NIVEL 3: LABORATORIOS</q-badge>
          </div>
        </div>

        <!-- Checklist -->
        <div class="text-subtitle2 text-teal">
          Verificación de Criterios (Lista de Cotejo Institucional)
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-12" v-for="(item, index) in checklist" :key="index">
            <q-item tag="label" v-ripple class="bg-grey-1 rounded-borders border-teal">
              <q-item-section avatar>
                <q-checkbox v-model="item.cumple" color="teal" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ item.label }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="item.cumple">
                <q-icon name="check_circle" color="teal" />
              </q-item-section>
            </q-item>
          </div>
        </div>

        <!-- Evidencias Visuales -->
        <div class="text-subtitle2 text-teal q-mt-md">Evidencias y Registro</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-file
              v-model="form.fotos"
              label="Fotografías in Situ"
              outlined
              dense
              multiple
              accept="image/*"
            >
              <template v-slot:prepend><q-icon name="photo_camera" /></template>
            </q-file>
          </div>
          <div class="col-12 col-md-6">
            <q-card flat bordered class="q-pa-sm text-center">
              <div class="text-caption text-grey-7 q-mb-xs">Registro de Firma del Docente</div>
              <q-btn
                outline
                color="teal"
                icon="history_edu"
                label="Solicitar Firma en Tablet"
                size="sm"
              />
              <q-chip
                v-if="form.firmado"
                color="positive"
                text-color="white"
                label="Firma Registrada"
                icon="verified"
                class="q-mt-sm"
              />
            </q-card>
          </div>
        </div>

        <q-input
          v-model="form.observaciones"
          label="Observaciones de la Práctica"
          type="textarea"
          outlined
          rows="2"
        />

        <div class="row justify-end q-gutter-sm q-mt-md">
          <q-btn label="Cancelar" flat color="grey" v-close-popup />
          <q-btn label="Finalizar Supervisión" color="teal" type="submit" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const emit = defineEmits(['saved'])

const props = defineProps({
  auditData: {
    type: Object,
    default: () => ({}),
  },
})

const checklist = ref([
  { label: 'Uso de equipo de protección personal (Bioseguridad)', cumple: false },
  { label: 'Guía de laboratorio disponible para estudiantes', cumple: false },
  { label: 'Equipos e insumos en estado óptimo', cumple: false },
  { label: 'Procedimiento alineado a la secuencia didáctica', cumple: false },
  { label: 'Limpieza y orden del área de trabajo', cumple: false },
])

const form = ref({
  docente_id: null,
  asignatura_id: null,
  grupo: '',
  fecha: new Date().toISOString().split('T')[0],
  hora: new Date().toTimeString().slice(0, 5),
  semana: 'S4',
  sesion: 1,
  fotos: [],
  firmado: false,
  observaciones: '',
})

// Mock Data (Sincronizado con AcademicAuditForm)
const opcionesDocentes = [
  { label: 'KARINA PAOLA LOPEZ', value: 1 },
  { label: 'HAROLD MARCO ANTONIO ROJAS', value: 2 },
  { label: 'ROBERTO FERNANDEZ VACA', value: 3 },
]

const materiasPorDocente = {
  1: [{ label: 'Bioquímica Aplicada', value: 401 }],
  2: [{ label: 'Microbiología I', value: 501 }],
  3: [{ label: 'Fisiología Humana', value: 601 }],
}

const opcionesMaterias = ref([])

const onDocenteChange = (val) => {
  opcionesMaterias.value = materiasPorDocente[val] || []
  form.value.asignatura_id = null
  form.value.grupo = ''
}

onMounted(() => {
  if (props.auditData.docente_id) {
    form.value.docente_id = props.auditData.docente_id
    onDocenteChange(form.value.docente_id)
  }
})

const onSubmit = () => {
  if (!form.value.docente_id || !form.value.asignatura_id) {
    $q.notify({ type: 'warning', message: 'Seleccione docente y materia del laboratorio' })
    return
  }

  $q.loading.show({ message: 'Sincronizando supervisión de laboratorio...' })
  setTimeout(() => {
    $q.loading.hide()

    const docLabel = opcionesDocentes.find((d) => d.value === form.value.docente_id)?.label
    const matLabel = opcionesMaterias.value.find((m) => m.value === form.value.asignatura_id)?.label

    emit('saved', {
      ...form.value,
      docente: docLabel,
      asignatura: matLabel,
    })
  }, 1200)
}
</script>

<style scoped>
.border-teal {
  border-left: 4px solid var(--q-teal);
}
</style>
