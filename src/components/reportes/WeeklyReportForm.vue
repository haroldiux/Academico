<template>
  <div class="weekly-report-form q-pa-md">
    <div v-if="loading" class="row justify-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="!report" class="text-center text-grey q-pa-lg">
      <q-icon name="warning" size="3em" />
      <div>No se pudo cargar el informe o no hay clases en esta semana.</div>
    </div>

    <div v-else>
      <!-- Header Info -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-6">
          <q-input readonly v-model="report.docente_nombre" label="Docente" dense outlined bg-color="grey-2" />
        </div>
        <div class="col-12 col-md-6">
          <q-input readonly v-model="report.asignatura_nombre" label="Asignatura" dense outlined bg-color="grey-2" />
        </div>
        <div class="col-12 col-md-6">
          <q-input readonly v-model="report.semana_inicio" label="Semana Inicio" dense outlined bg-color="grey-2" />
        </div>
        <div class="col-12 col-md-6">
          <div class="text-subtitle2">Escala de Alerta Calculada:</div>
          <q-chip :color="alertColor" text-color="white" icon="warning">
            {{ report.escala_alerta }} ({{ report.cumplimiento_porcentaje }}%)
          </q-chip>
        </div>
      </div>

      <!-- Criteria Table -->
      <div v-if="hasCriteria">
        <q-markup-table flat bordered dense class="q-mb-md">
          <thead>
            <tr class="bg-primary text-white">
              <th class="text-left">Criterio</th>
              <th class="text-center" style="width: 100px">Cumple</th>
              <th class="text-left">Observación / Evidencia</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, key) in report.criterios" :key="key">
              <td class="text-weight-medium">{{ key }}</td>
              <td class="text-center">
                <q-toggle v-model="data.cumple" color="positive" @update:model-value="recalculateAlert" />
              </td>
              <td>
                <q-input v-model="data.obs" dense borderless autogrow placeholder="Agregar observación..." />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>
      <div v-else class="q-banner bg-red-1 text-red q-pa-md q-mb-md rounded-borders">
        <q-icon name="error" size="sm" />
        No se ha registrado planificación (Cronograma) para esta semana. El informe se guardará como <strong>ROJO</strong>.
      </div>

      <!-- General Observations -->
      <q-input
        v-model="report.observaciones"
        label="Observaciones Generales del Director"
        type="textarea"
        outlined
        rows="3"
        class="q-mb-md"
      />

      <!-- Actions -->
      <div class="row justify-end q-gutter-sm">
        <q-btn flat label="Cancelar" v-close-popup color="grey" />
        <q-btn label="Guardar Informe" color="primary" icon="save" @click="saveReport" :loading="saving" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

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

const hasCriteria = computed(() => {
  return report.value && report.value.criterios && (
    Array.isArray(report.value.criterios) ? report.value.criterios.length > 0 : Object.keys(report.value.criterios).length > 0
  )
})

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
  max-width: 900px;
  margin: 0 auto;
}
</style>
