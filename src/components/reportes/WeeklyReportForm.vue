<template>
  <div class="weekly-report-form">
    <div v-if="loading" class="row justify-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="!report" class="text-center text-grey q-pa-lg">
      <q-icon name="warning" size="3em" />
      <div class="text-h6 q-mt-md">No se pudo cargar el informe</div>
      <div>Verifique que existan horarios/cronogramas para esta semana.</div>
    </div>

    <div v-else class="q-pa-none">
       <!-- Header Document Style -->
       <div class="row items-center q-mb-md q-pb-sm border-bottom-primary">
          <div class="col">
             <div class="text-h6 text-primary text-weight-bold">NIVEL 2: CONTROL DEL DIRECTOR DE CARRERA</div>
             <div class="text-caption text-grey-8">Verificación técnica de cumplimiento micro-curricular semanal</div>
          </div>
          <div class="col-auto">
             <q-chip :color="alertColor" text-color="white" icon="assessment" class="text-weight-bold">
                {{ report.escala_alerta }} ({{ report.cumplimiento_porcentaje }}%)
             </q-chip>
          </div>
       </div>

       <!-- Metadata Grid -->
       <div class="bg-grey-1 q-pa-md rounded-borders q-mb-lg border-light">
          <div class="row q-col-gutter-lg">
             <div class="col-12 col-md-4">
                <div class="text-caption text-grey-8 text-uppercase">Docente</div>
                <div class="text-subtitle2 text-weight-medium">{{ report.docente_nombre }}</div>
             </div>
             <div class="col-12 col-md-4">
                <div class="text-caption text-grey-8 text-uppercase">Asignatura</div>
                <div class="text-subtitle2 text-weight-medium">{{ report.asignatura_nombre }}</div>
             </div>
             <div class="col-12 col-md-4">
                <div class="text-caption text-grey-8 text-uppercase">Semana</div>
                <div class="text-subtitle2 text-weight-medium">{{ weekRangeLabel }}</div>
             </div>
          </div>
       </div>

       <!-- Criteria Table -->
      <div v-if="hasCriteria"> 
        <q-markup-table flat bordered class="criteria-table q-mb-lg">
          <thead>
            <tr>
              <th class="text-left bg-grey-2 text-weight-bold" style="width: 35%">ELEMENTO VERIFICADO</th>
              <th class="text-center bg-grey-2 text-weight-bold" style="width: 15%">CUMPLIMIENTO</th>
              <th class="text-left bg-grey-2 text-weight-bold">OBSERVACIÓN / EVIDENCIA</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, key) in report.criterios" :key="key">
              <td class="vertical-top">
                 <div class="text-weight-bold text-primary">{{ key }}</div>
                 <div class="text-caption text-grey-8">{{ getCriteriaDescription(key) }}</div>
              </td>
              <td class="text-center vertical-top">
                 <q-btn-toggle
                    v-model="data.cumple"
                    spread
                    no-caps
                    rounded
                    unelevated
                    toggle-color="positive"
                    :options="[
                      {label: 'Sí', value: true},
                      {label: 'No', value: false}
                    ]"
                    @update:model-value="recalculateAlert"
                 />
              </td>
              <td class="vertical-top">
                 <q-input 
                    v-model="data.obs" 
                    dense outlined 
                    autogrow 
                    placeholder="Ingrese observación justificativa..." 
                    class="full-width"
                 />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>

      <div v-else class="q-banner bg-red-1 text-red-9 q-pa-md q-mb-lg rounded-borders border-red">
        <q-icon name="error" size="sm" class="q-mr-sm" />
        <strong>Sin Planificación:</strong> No se ha registrado cronograma para esta semana. El informe se guardará como <strong>ROJO</strong>.
      </div>
 
       <!-- General Observations -->
       <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm text-grey-9">Conclusiones / Recomendaciones del Director</div>
          <q-input
            v-model="report.observaciones"
            type="textarea"
            outlined
            rows="3"
            placeholder="Ingrese conclusiones generales o recomendaciones para el docente..."
            bg-color="white"
          />
       </div>

       <!-- Footer Info -->
       <div class="q-mt-lg text-caption text-grey-6 text-center">
          Escala de Alerta: 
          <span class="text-positive text-weight-bold">Verde (90-100%)</span> • 
          <span class="text-warning text-weight-bold">Amarillo (70-89%)</span> • 
          <span class="text-negative text-weight-bold">Rojo (0-69%)</span>
       </div>

      <!-- Actions -->
      <div class="row justify-end q-gutter-sm q-mt-md">
        <q-btn flat label="Cancelar" v-close-popup color="grey-8" />
        <q-btn label="Guardar y Firmar Informe" color="primary"  icon="save" @click="saveReport" :loading="saving" />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, date } from 'quasar'

const props = defineProps({
  grupoId: {
    type: Number,
    required: true
  },
  fechaInicio: {
    type: String, // YYYY-MM-DD
    required: true
  }
})

const emit = defineEmits(['saved'])
const $q = useQuasar()

const loading = ref(true)
const saving = ref(false)
const report = ref(null)

const alertColor = computed(() => {
  if (!report.value) return 'grey'
  switch (report.value.escala_alerta) {
    case 'VERDE': return 'positive'
    case 'AMARILLO': return 'warning'
    case 'ROJO': return 'negative'
    default: return 'grey'
  }
})

const weekRangeLabel = computed(() => {
   if (!report.value || !report.value.semana_inicio) return '-'
   const start = new Date(report.value.semana_inicio + 'T00:00:00') // Force local time avoid timezone shifts
   const end = date.addToDate(start, { days: 5 }) // Mon-Sat
   return `${date.formatDate(start, 'DD/MM')} - ${date.formatDate(end, 'DD/MM/YYYY')}`
})

const hasCriteria = computed(() => {
  return report.value && report.value.criterios && (
    Array.isArray(report.value.criterios) ? report.value.criterios.length > 0 : Object.keys(report.value.criterios).length > 0
  )
})

const getCriteriaDescription = (key) => {
   const details = {
      'Tema impartido': 'Debe coincidir con la microcurrícula.',
      'Actividades formativas': 'Alineadas al enfoque por competencias.',
      'Secuencia didáctica': 'Inicio, desarrollo, cierre y resultados.',
      'Plataforma virtual': 'Revisión de actividades en plataforma.',
      'Evidencias': 'Debe ser reales y verificables (Asistencia/Archivos).',
      'Evaluaciones': 'Coherencia entre preguntas y resultados de aprendizaje.',
      'Integración transversal': 'Investigación, interacción social o internacionalización.'
   }
   return details[key] || 'Verificación técnica.'
}

const fetchDraft = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/reportes/semanal/draft', {
      params: {
        grupo_id: props.grupoId,
        fecha_inicio: props.fechaInicio
      }
    })
    
    if (data.draft === null && data.message) {
      $q.notify({ type: 'warning', message: data.message })
      report.value = null
    } else {
      report.value = data.report
      // Ensure criteria is object for reactivity if array comes in
      if (Array.isArray(report.value.criterios) && report.value.criterios.length === 0) {
         // keep logic handling empty
      }
    }
  } catch (error) {
    console.error('Error fetching draft:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar borrador del informe' })
  } finally {
    loading.value = false
  }
}

const recalculateAlert = () => {
  if (!report.value) return
  
  if (!hasCriteria.value) {
    report.value.cumplimiento_porcentaje = 0
    report.value.escala_alerta = 'ROJO'
    return
  }
  
  const criteriaKeys = Object.keys(report.value.criterios)
  const yesCount = criteriaKeys.filter(k => report.value.criterios[k].cumple).length
  const percentage = Math.round((yesCount / criteriaKeys.length) * 100)
  
  report.value.cumplimiento_porcentaje = percentage
  
  if (percentage < 70) report.value.escala_alerta = 'ROJO'
  else if (percentage < 90) report.value.escala_alerta = 'AMARILLO'
  else report.value.escala_alerta = 'VERDE'
}

const saveReport = async () => {
  saving.value = true
  try {
    await api.post('/reportes/semanal', report.value)
    $q.notify({ type: 'positive', message: 'Informe guardado correctamente' })
    emit('saved')
  } catch (error) {
    console.error('Error saving report:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar el informe' })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchDraft()
})
</script>

<style scoped>
.weekly-report-form {
  max-width: 950px;
  margin: 0 auto;
}
.border-bottom-primary {
   border-bottom: 2px solid var(--q-primary);
}
.border-light {
   border: 1px solid #e0e0e0;
}
.border-red {
   border: 1px solid #ffcdd2;
}
.criteria-table th {
   font-size: 0.75rem;
   letter-spacing: 0.5px;
}
</style>
