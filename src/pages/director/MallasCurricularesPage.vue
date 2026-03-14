<template>
  <q-page padding>
    <div class="row q-col-gutter-sm items-center q-mb-md">
      <div class="col-12 col-md-auto">
        <h4 class="text-h4 q-my-none text-primary">Mallas Curriculares</h4>
        <div class="text-subtitle2 text-grey-7">Consulta de Planes de Estudio (Oficiales)</div>
      </div>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-sm items-center">
        <!-- Selector de Sede -->
        <div class="col-12 col-sm-4">
          <q-select
            v-model="filtro.sede"
            :options="sedesOptions"
            option-value="id"
            option-label="nombre"
            label="Sede"
            outlined
            dense
            clearable
            emit-value
            map-options
            @update:model-value="onSedeChange"
          />
        </div>

        <!-- Selector de Carrera -->
        <div class="col-12 col-sm-6">
          <q-select
            v-model="filtro.carrera"
            :options="carrerasOptions"
            option-value="id"
            option-label="nombre"
            label="Carrera"
            outlined
            dense
            clearable
            emit-value
            map-options
            :disable="!filtro.sede"
          />
        </div>

        <!-- Selector de Plan -->
        <div class="col-12 col-sm-2">
          <q-select
            v-model="filtro.plan"
            :options="planesOptions"
            option-value="value"
            option-label="label"
            label="Plan"
            outlined
            dense
            emit-value
            map-options
          />
        </div>

        <!-- Botón Consultar -->
        <div class="col-12 col-sm-2 text-right">
          <q-btn
            color="primary"
            icon="search"
            label="Consultar"
            @click="fetchMallas"
            :disable="!filtro.sede || !filtro.carrera"
            :loading="loading"
            class="full-width"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Contenedor Principal (Tabs por Plan) -->
    <q-card flat bordered v-if="hasData">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab 
          v-for="(materias, planName) in mallasData" 
          :key="planName" 
          :name="planName" 
          :label="planName" 
        />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel v-for="(materias, planName) in mallasData" :key="planName" :name="planName" class="q-pa-none">
          <q-table
            :rows="materias"
            :columns="columns"
            row-key="codigo"
            flat
            bordered
            :rows-per-page-options="[0]"
            hide-pagination
            class="sticky-header-table"
          >
            <!-- Badge Customizado para Semestre -->
            <template v-slot:body-cell-semestre="props">
              <q-td :props="props">
                <q-badge color="accent" :label="props.row.semestre || 'N/A'" />
              </q-td>
            </template>

            <!-- Docente -->
            <template v-slot:body-cell-docentes="props">
              <q-td :props="props">
                <span v-if="props.row.docentes" class="text-body2">{{ props.row.docentes }}</span>
                <q-chip v-else dense color="grey-3" text-color="grey-6" size="sm" icon="person_off">No asignado</q-chip>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Estado Vacío -->
    <q-card flat bordered v-else-if="searched && !hasData" class="q-mt-md text-center q-pa-xl">
      <q-icon name="warning" size="4rem" color="warning" class="q-mb-md" />
      <div class="text-h6 text-grey-8">No se encontraron asignaturas.</div>
      <div class="text-body2 text-grey-6">Verifica que esta carrera contenga materias en la sede seleccionada, o corre el comando de extracción.</div>
    </q-card>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { useSedesStore } from 'stores/sedes'
import { useCarrerasStore } from 'stores/carreras'

const $q = useQuasar()
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()

const filtro = ref({
  sede: null,
  carrera: null,
  plan: null  // null = Todos, 'N' = Plan Nuevo, 'A' = Plan Antiguo
})

const planesOptions = [
  { label: 'Todos los planes', value: null },
  { label: 'Plan Nuevo (N)',   value: 'N'  },
  { label: 'Plan Antiguo (A)', value: 'A'  },
]

const loading = ref(false)
const searched = ref(false)
const mallasData = ref({})
const tab = ref('')

const columns = [
  { name: 'codigo', label: 'CÓDIGO', field: 'codigo', align: 'left', sortable: true, style: 'font-weight: bold; width: 100px;' },
  { name: 'nombre', label: 'ASIGNATURA', field: 'nombre', align: 'left', sortable: true },
  { name: 'semestre', label: 'SEMESTRE', field: 'semestre', align: 'center', sortable: true, style: 'width: 120px;' },
  { name: 'docentes', label: 'DOCENTE', field: 'docentes', align: 'left', sortable: true }
]

const sedesOptions = computed(() => sedesStore.sedes)

const carrerasOptions = computed(() => {
  if (!filtro.value.sede) return []
  return carrerasStore.carreras.filter(c => {
    return c.sede_id === filtro.value.sede || 
           (c.sedes_ids && c.sedes_ids.includes(filtro.value.sede))
  }).sort((a, b) => a.nombre.localeCompare(b.nombre))
})

const hasData = computed(() => Object.keys(mallasData.value).length > 0)

onMounted(async () => {
  if (sedesStore.sedes.length === 0) await sedesStore.fetchSedes()
  if (carrerasStore.carreras.length === 0) await carrerasStore.fetchCarreras()
})

const onSedeChange = () => {
  filtro.value.carrera = null
  mallasData.value = {}
  searched.value = false
}

const fetchMallas = async () => {
  if (!filtro.value.sede || !filtro.value.carrera) return

  loading.value = true
  searched.value = true
  mallasData.value = {}
  
  try {
    const response = await api.get('/mallas-curriculares', {
      params: {
        sede_id:      filtro.value.sede,
        carrera_id:   filtro.value.carrera,
        plan_estudios: filtro.value.plan || undefined
      }
    })

    if (response.data.success) {
      mallasData.value = response.data.data

      // Select the matching plan tab or first available
      const planes = Object.keys(mallasData.value)
      if (filtro.value.plan === 'N' && planes.includes('Plan Nuevo (N)')) {
        tab.value = 'Plan Nuevo (N)'
      } else if (filtro.value.plan === 'A' && planes.includes('Plan Antiguo (A)')) {
        tab.value = 'Plan Antiguo (A)'
      } else if (planes.length > 0) {
        tab.value = planes[0]
      }
    }
  } catch (error) {
    console.error('Error fetching mallas curriculares:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las mallas curriculares',
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.sticky-header-table {
  height: calc(100vh - 350px);
}

.sticky-header-table :deep(thead tr th) {
  position: sticky;
  z-index: 1;
  background-color: #f5f5f5;
  top: 0;
}
</style>
