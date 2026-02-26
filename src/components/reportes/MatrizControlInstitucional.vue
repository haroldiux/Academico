<template>
  <div class="matriz-control">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Matriz de Control Institucional</div>
      <q-btn color="primary" icon="refresh" label="Actualizar" @click="loadMatriz" flat />
    </div>

    <q-table
      :rows="filteredMatrizData"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat bordered
      class="bg-white q-mt-md"
      :pagination="{ rowsPerPage: 15 }"
    >
      <template v-slot:top-right>
        <div class="row q-gutter-sm items-center">
          <q-select
            v-model="filtroEstado"
            :options="opcionesEstado"
            dense
            outlined
            options-dense
            emit-value
            map-options
            label="Filtrar por Estado"
            style="min-width: 150px"
          >
            <template v-slot:prepend>
              <q-icon name="filter_list" />
            </template>
          </q-select>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar asignatura o docente...">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </template>

      <template v-slot:body-cell-semaforo="props">
        <q-td :props="props" class="text-center">
          <q-chip :color="props.row.semaforo" text-color="white" size="sm" class="text-weight-bold">
            {{ props.row.alertaLabel }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-alertas="props">
        <q-td :props="props">
          <div class="text-negative text-caption" v-if="props.row.alertas !== 'Ninguna'">
            <q-icon name="warning" class="q-mr-xs"/> {{ props.row.alertas }}
          </div>
          <div v-else class="text-grey-6 text-caption">Ninguna</div>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn 
            size="sm" 
            color="indigo" 
            label="Auditar" 
            icon="checklist" 
            @click="openAuditForm(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Audit Form Dialog -->
    <q-dialog v-model="showAuditForm" persistent>
      <AcademicAuditForm 
        :asignatura-id="selectedRow?.id" 
        :asignatura-nombre="selectedRow?.asignatura"
        :docente-id="selectedRow?.docenteId"
        :docente-nombre="selectedRow?.docente"
        @saved="onAuditSaved" 
      />
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import AcademicAuditForm from './AcademicAuditForm.vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  sedeId: { type: Number, default: null },
  carreraId: { type: Number, default: null }
})

const $q = useQuasar()
const loading = ref(false)
const matrizData = ref([])
const filter = ref('')
const filtroEstado = ref('todos')

const showAuditForm = ref(false)
const selectedRow = ref(null)

const opcionesEstado = [
  { label: 'Todos los estados', value: 'todos' },
  { label: 'Normal (Verde)', value: 'verde' },
  { label: 'Atención (Amarillo)', value: 'amarillo' },
  { label: 'Crítico (Rojo)', value: 'rojo' },
  { label: 'Sin Auditar', value: 'gris' }
]

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', sortable: true, align: 'left' },
  { name: 'asignatura', label: 'Asignatura', field: 'asignatura', sortable: true, align: 'left' },
  { name: 'docente', label: 'Docente', field: 'docente', sortable: true, align: 'left' },
  { name: 'carrera', label: 'Carrera', field: 'carrera', sortable: true, align: 'left' },
  { name: 'avancePlaneado', label: 'A. Planeado', field: 'avancePlaneado', sortable: true, align: 'center' },
  { name: 'avanceReal', label: 'A. Real', field: 'avanceReal', sortable: true, align: 'center' },
  { name: 'diferencia', label: 'Diferencia', field: 'diferencia', sortable: true, align: 'center' },
  { name: 'semaforo', label: 'Estado', field: 'semaforo', sortable: true, align: 'center' },
  { name: 'alertas', label: 'Alertas', field: 'alertas', sortable: true, align: 'left' },
  { name: 'acciones_correctivas', label: 'Acciones Dispuestas', field: 'acciones', sortable: true, align: 'left' },
  { name: 'acciones', label: 'Auditar', field: 'acciones', align: 'center' }
]

const filteredMatrizData = computed(() => {
  let result = matrizData.value

  // Apply Search Text
  if (filter.value) {
    const searchTerm = filter.value.toLowerCase()
    result = result.filter(row => 
      (row.asignatura && row.asignatura.toLowerCase().includes(searchTerm)) ||
      (row.docente && row.docente.toLowerCase().includes(searchTerm)) ||
      (row.codigo && row.codigo.toLowerCase().includes(searchTerm))
    )
  }

  // Apply Status Dropdown
  if (filtroEstado.value !== 'todos') {
    result = result.filter(row => row.semaforo === filtroEstado.value)
  }

  return result
})

const loadMatriz = async () => {
  if (!props.sedeId) return
  
  loading.value = true
  try {
    const { data } = await api.get('/reportes/matriz-control', {
      params: {
        sede_id: props.sedeId,
        carrera_id: props.carreraId
      }
    })
    matrizData.value = data
  } catch (error) {
    console.error('Error loading Matriz Control:', error)
    $q.notify({ type: 'negative', message: 'Error cargando matriz de control' })
  } finally {
    loading.value = false
  }
}

const openAuditForm = (row) => {
  selectedRow.value = row
  showAuditForm.value = true
}

const onAuditSaved = () => {
  showAuditForm.value = false
  loadMatriz() // Reload to get updated semaphores and actions
}

onMounted(() => {
  if (props.sedeId) loadMatriz()
})

watch(() => props.sedeId, loadMatriz)
watch(() => props.carreraId, loadMatriz)
</script>
