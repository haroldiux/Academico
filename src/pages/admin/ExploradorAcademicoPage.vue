<template>
  <q-page padding class="bg-grey-2">
    <div class="row items-center q-mb-md">
      <q-icon name="apartment" size="md" color="primary" class="q-mr-sm" />
      <div class="text-h5 text-primary text-weight-bold">Explorador Académico - Super Admin</div>
    </div>

    <div class="row q-col-gutter-md" style="height: calc(100vh - 120px)">
      
      <!-- COLUMNA 1: SEDES -->
      <div class="col-12 col-md-3 h-100">
        <q-card class="fit column">
          <q-card-section class="bg-primary text-white q-py-sm">
            <div class="text-subtitle1 text-weight-bold">1. Sedes</div>
          </q-card-section>
          <q-card-section class="col q-pa-none scroll">
            <q-list separator>
              <q-item v-for="sede in sedes" :key="sede.id" clickable v-ripple
                :active="selectedSede?.id === sede.id" active-class="bg-blue-1 text-primary"
                @click="selectSede(sede)">
                <q-item-section avatar>
                  <q-icon name="business" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ sede.nombre }}</q-item-label>
                  <q-item-label caption>{{ sede.ubicacion }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey" />
                </q-item-section>
              </q-item>
              
              <q-item v-if="loadingSedes">
                <q-item-section class="text-center">
                  <q-spinner color="primary" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- COLUMNA 2: CARRERAS -->
      <div class="col-12 col-md-3 h-100">
        <q-card class="fit column" :class="{'bg-grey-1': !selectedSede}">
          <q-card-section class="bg-secondary text-white q-py-sm">
            <div class="text-subtitle1 text-weight-bold">2. Carreras</div>
          </q-card-section>
          
          <q-card-section v-if="!selectedSede" class="col flex flex-center text-grey">
            <div class="text-center">
              <q-icon name="arrow_back" size="md" />
              <div>Seleccione una Sede</div>
            </div>
          </q-card-section>

          <q-card-section v-else class="col q-pa-none scroll">
            <q-list separator>
              <q-item v-for="carrera in carreras" :key="carrera.id" clickable v-ripple
                :active="selectedCarrera?.id === carrera.id" active-class="bg-teal-1 text-secondary"
                @click="selectCarrera(carrera)">
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ carrera.nombre }}</q-item-label>
                  <q-item-label caption>Código: {{ carrera.codigo }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey" />
                </q-item-section>
              </q-item>

              <q-item v-if="loadingCarreras">
                <q-item-section class="text-center">
                  <q-spinner color="secondary" />
                </q-item-section>
              </q-item>
              
              <q-item v-if="!loadingCarreras && carreras.length === 0">
                <q-item-section class="text-center text-grey">
                  No hay carreras en esta sede
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- COLUMNA 3: MATERIAS -->
      <div class="col-12 col-md-6 h-100">
        <q-card class="fit column" :class="{'bg-grey-1': !selectedCarrera}">
          <q-card-section class="bg-deep-purple text-white q-py-sm">
            <div class="text-subtitle1 text-weight-bold">3. Asignaturas (Plan de Estudios)</div>
          </q-card-section>

          <q-card-section v-if="!selectedCarrera" class="col flex flex-center text-grey">
            <div class="text-center">
              <q-icon name="arrow_back" size="md" />
              <div>Seleccione una Carrera</div>
            </div>
          </q-card-section>

          <q-card-section v-else class="col q-pa-none scroll bg-white">
            <q-table
              flat bordered
              :rows="materias"
              :columns="columnsMaterias"
              row-key="id"
              :loading="loadingMaterias"
              :pagination="{ rowsPerPage: 10 }"
            >
              <template v-slot:body-cell-creditos="props">
                <q-td :props="props" class="text-center">
                  <q-badge color="purple" outline>{{ props.value }}</q-badge>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useSedesStore } from 'src/stores/sedes'

// --- COLUMNA 1: SEDES ---
const sedesStore = useSedesStore()
const sedes = ref([])
const loadingSedes = ref(false)
const selectedSede = ref(null)

const loadSedes = async () => {
  loadingSedes.value = true
  try {
    // Intentar cargar del store o API
    if (sedesStore.sedes.length === 0) await sedesStore.fetchSedes()
    sedes.value = sedesStore.sedes
  } catch (e) {
    console.error(e)
  } finally {
    loadingSedes.value = false
  }
}

const selectSede = (sede) => {
  selectedSede.value = sede
  selectedCarrera.value = null
  materias.value = []
  loadCarreras(sede.id)
}

// --- COLUMNA 2: CARRERAS ---
const carreras = ref([])
const loadingCarreras = ref(false)
const selectedCarrera = ref(null)

const loadCarreras = async (sedeId) => {
  loadingCarreras.value = true
  carreras.value = []
  try {
    const response = await api.get('/carreras', { params: { sede_id: sedeId } })
    carreras.value = response.data
  } catch (e) {
    console.error(e)
  } finally {
    loadingCarreras.value = false
  }
}

const selectCarrera = (carrera) => {
  selectedCarrera.value = carrera
  loadMaterias(carrera.id)
}

// --- COLUMNA 3: MATERIAS ---
const materias = ref([])
const loadingMaterias = ref(false)

const columnsMaterias = [
  { name: 'codigo', label: 'CÓDIGO', field: 'codigo', sortable: true, align: 'left' },
  { name: 'nombre', label: 'ASIGNATURA', field: 'nombre', sortable: true, align: 'left' },
  { name: 'semestre', label: 'SEM', field: 'semestre', sortable: true, align: 'center' },
  { name: 'creditos', label: 'CR', field: 'creditos', sortable: true, align: 'center' },
  { name: 'horas_teoricas', label: 'HT', field: 'horas_teoricas', align: 'center' },
  { name: 'horas_practicas', label: 'HP', field: 'horas_practicas', align: 'center' },
]

const loadMaterias = async (carreraId) => {
  loadingMaterias.value = true
  materias.value = []
  try {
    const response = await api.get('/asignaturas', { params: { carrera_id: carreraId } })
    materias.value = response.data
  } catch (e) {
    console.error(e)
  } finally {
    loadingMaterias.value = false
  }
}

onMounted(() => {
  loadSedes()
})
</script>

<style scoped>
.h-100 {
  height: 100%;
}
</style>
