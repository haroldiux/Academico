<template>
  <q-card style="min-width: 900px; max-width: 90vw;">
    <q-card-section class="row items-center q-pb-none bg-primary text-white">
      <div class="text-h6">
        <q-icon name="assessment" class="q-mr-sm" />
        Informe de Cumplimiento Micro-curricular Semanal
      </div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="q-pa-md">
      <q-form @submit="onSubmit">
        
        <!-- Header Info Grid -->
        <div class="row q-col-gutter-sm q-mb-lg header-grid">
           <div class="col-12 col-md-4">
              <q-select 
                v-model="form.docente_id" 
                :options="docentesOptions" 
                label="DOCENTE" 
                outlined dense 
                emit-value map-options 
                :rules="[val => !!val || 'Requerido']" 
                @update:model-value="onDocenteChange" 
                class="bg-grey-1"
              />
           </div>
           <div class="col-12 col-md-4">
              <q-select 
                v-model="form.asignatura_id" 
                :options="asignaturasOptions" 
                label="ASIGNATURA" 
                outlined dense 
                emit-value map-options 
                :rules="[val => !!val || 'Requerido']" 
                :disable="!form.docente_id"
                class="bg-grey-1"
              />
           </div>
           <div class="col-12 col-md-4">
               <q-input 
                  v-model="form.carrera_nombre" 
                  label="CARRERA" 
                  outlined dense 
                  readonly 
                  class="bg-grey-2" 
                  hint="Auto-generado"
               />
           </div>
           <div class="col-12 col-md-4">
              <q-input 
                 v-model="form.semana_inicio" 
                 label="SEMANA (Inicio)" 
                 type="date" 
                 outlined dense
                 :rules="[val => !!val || 'Requerido']" 
                 class="bg-grey-1"
              />
           </div>
        </div>

        <!-- Auditoría de Sesiones (NUEVO - Prototipo Estructurado) -->
        <div class="audit-section q-mb-lg">
             <div class="row items-center q-mb-sm">
                <q-icon name="visibility" color="primary" size="sm" class="q-mr-xs" />
                <div class="text-subtitle1 text-weight-bold">Auditoría de Sesiones (Semana Activa)</div>
             </div>
             
             <q-banner v-if="loading" class="bg-grey-2">
                 <template v-slot:avatar><q-spinner-dots color="primary" /></template>
                 Analizando datos del docente para esta semana...
             </q-banner>

             <q-list v-else bordered separator class="rounded-borders bg-white">
                 <q-item v-for="sesion in sesionesAuditoria" :key="sesion.id">
                     <q-item-section avatar>
                         <q-icon :name="sesion.cumplido ? 'check_circle' : 'warning'" :color="sesion.cumplido ? 'positive' : 'negative'" />
                     </q-item-section>
                     <q-item-section>
                         <q-item-label class="text-weight-bold">{{ sesion.fecha }} - {{ sesion.tema }}</q-item-label>
                         <q-item-label caption>Unidad: {{ sesion.unidad }}</q-item-label>
                     </q-item-section>
                     <q-item-section side>
                         <div class="row q-gutter-xs">
                             <q-badge :color="sesion.estrategias ? 'blue' : 'grey'" label="Estrategias" />
                             <q-badge :color="sesion.evaluacion ? 'orange' : 'grey'" label="Evaluación" />
                             <q-badge :color="sesion.secuencia ? 'purple' : 'grey'" label="Secuencia" />
                         </div>
                     </q-item-section>
                 </q-item>
                 <q-item v-if="!sesionesAuditoria.length">
                     <q-item-section class="text-center text-grey italic">No se encontraron sesiones registradas para esta semana.</q-item-section>
                 </q-item>
             </q-list>
             
             <div class="text-caption text-grey-7 q-mt-xs">
                 * El cumplimiento Si/No se autocompleta basado en que todas las sesiones tengan sus apartados completos.
             </div>
        </div>

        <!-- Compliance Table -->
        <div class="table-container q-mb-lg">
            <table class="report-table">
                <thead>
                    <tr>
                        <th rowspan="2" class="text-center bg-blue-grey-1">CRITERIO</th>
                        <th colspan="2" class="text-center bg-blue-grey-1">CUMPLIMIENTO</th>
                        <th colspan="3" class="text-center bg-blue-grey-1">ESCALA DE ALERTA</th>
                    </tr>
                    <tr>
                        <th class="text-center bg-grey-2" style="width: 60px">Si</th>
                        <th class="text-center bg-grey-2" style="width: 60px">No</th>
                        <th class="text-center text-white bg-negative" style="width: 80px">Rojo</th>
                        <th class="text-center text-black bg-warning" style="width: 80px">Amarillo</th>
                        <th class="text-center text-white bg-positive" style="width: 80px">Verde</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(label, key) in criteriosMap" :key="key">
                        <td class="q-pa-sm">{{ label }}</td>
                        <td class="text-center">
                            <q-radio v-model="form.criterios[key]" :val="true" dense color="primary" />
                        </td>
                        <td class="text-center">
                            <q-radio v-model="form.criterios[key]" :val="false" dense color="red" />
                        </td>
                        <!-- Empty cells for Alert Scale visualization (merged visually usually, strictly structured here) -->
                        <!-- We will just highlight the relevant cell based on total score logic later? 
                             Or keep them empty as per the form sheet structure -->
                        <td class="bg-grey-1"></td>
                        <td class="bg-grey-1"></td>
                        <td class="bg-grey-1"></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Live Alert Status -->
        <div class="row items-center justify-end q-mb-md q-gutter-sm">
             <div class="text-subtitle2">Estado Actual:</div>
             <q-chip 
                :color="alertaColor" 
                text-color="white" 
                :icon="alertaIcon"
                :label="computedAlerta" 
                size="lg"
             />
        </div>

        <q-separator class="q-mb-md" />

        <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
                <q-input 
                    v-model="form.observaciones_generales" 
                    label="Recomendaciones del Director" 
                    type="textarea" 
                    outlined 
                    rows="3" 
                    placeholder="Escriba aquí las recomendaciones basadas en los resultados de cumplimiento..."
                />
            </div>
            <div class="col-12 col-md-6">
                <q-input 
                    v-model="form.acciones_mejora" 
                    label="Acciones de Mejora (Correctivo)" 
                    type="textarea" 
                    outlined 
                    rows="3" 
                    placeholder="Escriba las acciones que el docente tomará para mejorar su desempeño..."
                    bg-color="yellow-1"
                >
                    <template v-slot:prepend>
                        <q-icon name="trending_up" color="warning" />
                    </template>
                </q-input>
            </div>
        </div>

        <div class="row justify-end q-mt-md">
          <q-btn label="Cancelar" color="grey" flat v-close-popup />
          <q-btn label="Generar Informe" type="submit" color="primary" :loading="loading" icon="print">
             <q-tooltip>Guardar y Generar Reporte</q-tooltip>
          </q-btn>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useReportesStore } from 'src/stores/reportes'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'boot/axios'

const props = defineProps({
  reportData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['saved'])
const reportesStore = useReportesStore()
const authStore = useAuthStore()

const loading = ref(false)
const docentesOptions = ref([])
const asignaturasOptions = ref([])
const sesionesAuditoria = ref([])

const criteriosMap = {
  temaImpartido: 'Tema impartido coincide con lo micro-curricular',
  actividadesFormativas: 'Actividades Formativas (Aula / Casa)',
  secuenciaDidactica: 'Secuencia Didáctica (Inicio, Desarrollo, Cierre)',
  plataformaVirtual: 'Uso de Plataforma Virtual Moodle',
  evidencias: 'Evidencias (reales y verificables)',
  evaluaciones: 'Evaluaciones (coherencia con banco de preguntas)',
  integracionTransversal: 'Integración transversal / investigación / interacción'
}

const form = ref({
  id: null,
  semana_inicio: '',
  docente_id: null,
  asignatura_id: null,
  carrera_nombre: '', 
  criterios: {
    temaImpartido: false,
    actividadesFormativas: false,
    secuenciaDidactica: false,
    plataformaVirtual: false,
    evidencias: false,
    evaluaciones: false,
    integracionTransversal: false
  },
  observaciones_generales: '',
  acciones_mejora: ''
})

// Load Docentes and handle Edit Mode
onMounted(async () => {
    // 1. Populate options
    const materias = reportesStore.reporteMaterias
    const uniqueDocentes = new Map()
    materias.forEach(m => {
        m.docentes.forEach(d => {
            if (!uniqueDocentes.has(d.id)) {
                uniqueDocentes.set(d.id, { label: d.nombre, value: d.id })
            }
        })
    })
    docentesOptions.value = Array.from(uniqueDocentes.values()).sort((a, b) => a.label.localeCompare(b.label))

    // 2. Handle Edit Mode
    if (props.reportData) {
        form.value = {
            id: props.reportData.id,
            semana_inicio: props.reportData.semana_inicio,
            docente_id: props.reportData.docente_id,
            asignatura_id: props.reportData.asignatura_id,
            carrera_nombre: props.reportData.carrera?.nombre || 'Consultando...',
            criterios: { ...props.reportData.criterios },
            observaciones_generales: props.reportData.observaciones_generales || '',
            acciones_mejora: props.reportData.acciones_mejora || ''
        }
        // Truncate semana_inicio to YYYY-MM-DD if it has time
        if (form.value.semana_inicio.includes('T')) {
            form.value.semana_inicio = form.value.semana_inicio.split('T')[0]
        }
        
        // Trigger options update for the selected docente
        onDocenteChange(form.value.docente_id)
    }
})

const onDocenteChange = (docanteId) => {
  if (!props.reportData) {
      form.value.asignatura_id = null
      form.value.carrera_nombre = ''
  }
  asignaturasOptions.value = []
  
  if (!docanteId) return

  const materias = reportesStore.reporteMaterias
  const relevantMaterias = materias.filter(m => 
      m.docentes.some(d => d.id === docanteId)
  )

  asignaturasOptions.value = relevantMaterias.map(m => ({
      label: m.nombre + ' (' + m.codigo + ')',
      value: m.id,
      carrera: m.carrera
  })).sort((a, b) => a.label.localeCompare(b.label))

  if (props.reportData && form.value.carrera_nombre === 'Consultando...') {
       const asig = relevantMaterias.find(m => m.id === form.value.asignatura_id)
       if (asig) form.value.carrera_nombre = asig.carrera?.nombre || 'S/N'
  }
}

const checkStatus = async () => {
  if (form.value.id) return // Don't auto-check if editing existing report
  if (!form.value.docente_id || !form.value.asignatura_id || !form.value.semana_inicio) return

  const selectedAsig = asignaturasOptions.value.find(a => a.value === form.value.asignatura_id)
  if (selectedAsig) {
      form.value.carrera_nombre = selectedAsig.carrera?.nombre || "Ingeniería de Sistemas"
  }

  loading.value = true
  try {
    // Simulating delay for prototype effect
    await new Promise(r => setTimeout(r, 800))

    // Mock Audit Sessions based on selected teacher/week
    sesionesAuditoria.value = [
      { id: 1, fecha: '2026-01-26', tema: 'Introducción a Algoritmos', unidad: 'Unidad I', cumplido: true, estrategias: true, evaluacion: true, secuencia: true },
      { id: 2, fecha: '2026-01-28', tema: 'Variables y Tipos', unidad: 'Unidad I', cumplido: true, estrategias: true, evaluacion: false, secuencia: true }
    ]

    // Auto-fill criteria logically based on mock
    form.value.criterios.temaImpartido = true
    form.value.criterios.actividadesFormativas = true
    form.value.criterios.evaluaciones = false // One session is missing eval
    form.value.criterios.secuenciaDidactica = true
    form.value.criterios.evidencias = true
    form.value.criterios.plataformaVirtual = true
    form.value.criterios.integracionTransversal = false

  } catch (e) {
    console.error('Error checking status', e)
  } finally {
    loading.value = false
  }
}

watch(
  () => [form.value.docente_id, form.value.asignatura_id, form.value.semana_inicio],
  () => {
     if (!form.value.id) checkStatus()
  }
)

const computedAlerta = computed(() => {
  const total = Object.keys(criteriosMap).length
  const checked = Object.values(form.value.criterios).filter(v => v).length
  
  if (checked === total) return 'VERDE'
  if (checked >= total - 2) return 'AMARILLO'
  return 'ROJO'
})

const alertaColor = computed(() => {
  if (computedAlerta.value === 'VERDE') return 'positive'
  if (computedAlerta.value === 'AMARILLO') return 'warning'
  return 'negative'
})

const alertaIcon = computed(() => {
  if (computedAlerta.value === 'VERDE') return 'check_circle'
  if (computedAlerta.value === 'AMARILLO') return 'warning'
  return 'error'
})

const onSubmit = async () => {
  loading.value = true
  try {
    const payload = {
      ...form.value,
      alerta: computedAlerta.value,
      sede_id: authStore.sedeId || 1,
      carrera_id: authStore.usuarioActual?.director?.carrera_id || 1
    }
    
    if (form.value.id) {
        await reportesStore.updateSeguimientoSemanal(form.value.id, payload)
    } else {
        await reportesStore.createSeguimientoSemanal(payload)
    }
    emit('saved')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.report-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ccc;
}
.report-table th, .report-table td {
  border: 1px solid #bdc3c7;
}
</style>
