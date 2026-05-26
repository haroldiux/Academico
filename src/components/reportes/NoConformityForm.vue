<template>
  <q-card style="min-width: 650px; max-width: 95vw">
    <q-card-section class="row items-center q-pb-none bg-red text-white">
      <div class="text-h6">
        <q-icon name="report_problem" class="q-mr-sm" />
        Registro de No Conformidad - Nivel 4
      </div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="q-pa-md">
      <q-banner dense class="bg-red-1 text-red-9 q-mb-md rounded-borders">
        <template v-slot:avatar><q-icon name="warning" /></template>
        Este registro se activa ante <b>incumplimientos reincidentes</b> (2 semanas consecutivas en
        Rojo) o hallazgos graves en auditorías.
      </q-banner>

      <q-form @submit="onSubmit" class="q-gutter-md">
        <!-- Info General -->
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.asignatura"
              label="Asignatura"
              readonly
              outlined
              dense
              bg-color="grey-1"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.carrera"
              label="Carrera"
              readonly
              outlined
              dense
              bg-color="grey-1"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.docente"
              label="Docente Responsable"
              readonly
              outlined
              dense
              bg-color="grey-1"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.fecha" label="Fecha de Registro" type="date" outlined dense />
          </div>
        </div>

        <q-separator />

        <!-- Detalles de la No Conformidad -->
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <q-input
              v-model="form.descripcion"
              label="Descripción del Incumplimiento"
              placeholder="Especifique qué criterios no se cumplieron y por qué es reincidente..."
              type="textarea"
              outlined
              rows="3"
              required
            />
          </div>
          <div class="col-12">
            <q-input
              v-model="form.planAccion"
              label="Plan de Acción Correctiva (PAC)"
              placeholder="Actividades a realizar para corregir la situación..."
              type="textarea"
              outlined
              rows="3"
              required
            />
          </div>
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.medida"
              :options="opcionesMedidas"
              label="Medida Administrativa"
              outlined
              dense
              emit-value
              map-options
            >
              <template v-slot:prepend><q-icon name="gavel" /></template>
            </q-select>
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.fechaSeguimiento"
              label="Fecha de Próximo Seguimiento"
              type="date"
              outlined
              dense
            />
          </div>
        </div>

        <div class="row justify-end q-gutter-sm q-mt-md">
          <div class="col-grow">
            <q-checkbox
              v-model="form.notificarDocente"
              label="Notificar formalmente al Docente"
              color="red"
            />
          </div>
          <q-btn label="Cancelar" flat color="grey" v-close-popup />
          <q-btn label="Emitir No Conformidad" color="red" type="submit" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  ncData: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['saved'])
const $q = useQuasar()

const opcionesMedidas = [
  { label: 'Llamado de atención verbal', value: 'verbal' },
  { label: 'Memorándum de advertencia', value: 'memo' },
  { label: 'Capacitación obligatoria en planificación', value: 'capacitacion' },
  { label: 'Suspensión temporal', value: 'suspension' },
  { label: 'Elevación a consejo facultativo', value: 'consejo' },
]

const form = ref({
  asignatura: '',
  carrera: '',
  docente: '',
  fecha: new Date().toISOString().split('T')[0],
  descripcion: '',
  planAccion: '',
  medida: 'verbal',
  fechaSeguimiento: '',
  notificarDocente: true,
})

onMounted(() => {
  if (props.ncData.asignatura) {
    form.value.asignatura = props.ncData.asignatura
    form.value.carrera = props.ncData.carrera || 'N/A'
    form.value.docente = props.ncData.docente || 'N/A'
    if (props.ncData.descripcion) form.value.descripcion = props.ncData.descripcion
    if (props.ncData.plan) form.value.planAccion = props.ncData.plan
  }
})

const onSubmit = () => {
  $q.loading.show({ message: 'Procesando registro de No Conformidad institucional...' })
  setTimeout(() => {
    $q.loading.hide()
    $q.notify({
      type: 'negative',
      message: 'No Conformidad emitida y notificada al docente',
      icon: 'gavel',
      position: 'top',
    })
    emit('saved', form.value)
  }, 1500)
}
</script>
