<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row items-center q-mb-md">
      <div class="col">
        <h1 class="text-h5 q-my-none text-weight-bold">Monitoreo de Carreras</h1>
        <div class="text-caption text-grey-7">
          Control y monitoreo del avance real de documentación por carrera
        </div>
      </div>
      <div class="col-auto">
        <q-select
          v-model="sedeSeleccionada"
          :options="sedesOptions"
          label="Sede"
          dense
          outlined
          emit-value
          map-options
          style="min-width: 200px"
          @update:model-value="cargarDatos"
        />
      </div>
    </div>

    <div v-if="loading" class="flex flex-center q-py-xl">
      <q-spinner size="50px" color="primary" />
    </div>

    <template v-else-if="datosSede">
      <!-- KPIs de Resumen -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-3">
          <q-card class="bg-white">
            <q-card-section>
              <div class="text-caption text-grey">Total Carreras</div>
              <div class="text-h4 text-weight-bold text-primary">
                {{ datosSede.carreras.length }}
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card class="bg-white">
            <q-card-section>
              <div class="text-caption text-grey">Total Materias</div>
              <div class="text-h4 text-weight-bold">{{ totalMaterias }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card class="bg-green-1">
            <q-card-section>
              <div class="text-caption text-grey">Completas (100%)</div>
              <div class="text-h4 text-weight-bold text-positive">{{ totalCompletas }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card class="bg-orange-1">
            <q-card-section>
              <div class="text-caption text-grey">Con Bajo Avance (&lt;50%)</div>
              <div class="text-h4 text-weight-bold text-warning">{{ totalBajoAvance }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Lista de Carreras -->
      <q-card v-for="carrera in datosSede.carreras" :key="carrera.carrera.id" class="q-mb-md">
        <q-card-section class="row items-center q-pb-none">
          <div class="col">
            <div class="text-subtitle1 text-weight-bold">
              {{ carrera.carrera.codigo }} - {{ carrera.carrera.nombre }}
            </div>
            <div class="text-caption text-grey">{{ carrera.total_materias }} materias</div>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              round
              :icon="carreraExpandida === carrera.carrera.id ? 'expand_less' : 'expand_more'"
              @click="toggleCarrera(carrera.carrera.id)"
            />
          </div>
        </q-card-section>

        <!-- Resumen de la carrera -->
        <q-card-section class="row q-col-gutter-sm q-pt-none">
          <div class="col-4">
            <div class="text-center">
              <div class="text-h6 text-positive">{{ carrera.completas.count }}</div>
              <div class="text-caption">Completas (100%)</div>
            </div>
          </div>
          <div class="col-4">
            <div class="text-center">
              <div class="text-h6 text-blue">{{ carrera.avance_alto.count }}</div>
              <div class="text-caption">Con Avance (50-99%)</div>
            </div>
          </div>
          <div class="col-4">
            <div class="text-center">
              <div class="text-h6 text-warning">{{ carrera.avance_bajo.count }}</div>
              <div class="text-caption">Bajo Avance (&lt;50%)</div>
            </div>
          </div>
        </q-card-section>

        <!-- Detalle de materias -->
        <q-slide-transition>
          <div v-show="carreraExpandida === carrera.carrera.id">
            <q-separator />
            <q-card-section>
              <q-tabs
                v-model="tabDetalle"
                dense
                class="text-grey"
                active-color="primary"
                indicator-color="primary"
                align="justify"
              >
                <q-tab name="completas" :label="`Completas (${carrera.completas.count})`" />
                <q-tab name="avance_alto" :label="`Con Avance (${carrera.avance_alto.count})`" />
                <q-tab name="avance_bajo" :label="`Bajo Avance (${carrera.avance_bajo.count})`" />
              </q-tabs>

              <q-tab-panels v-model="tabDetalle" animated>
                <q-tab-panel name="completas">
                  <MateriasListado :materias="carrera.completas.materias" tipo="completas" />
                </q-tab-panel>
                <q-tab-panel name="avance_alto">
                  <MateriasListado :materias="carrera.avance_alto.materias" tipo="avance_alto" />
                </q-tab-panel>
                <q-tab-panel name="avance_bajo">
                  <MateriasListado :materias="carrera.avance_bajo.materias" tipo="avance_bajo" />
                </q-tab-panel>
              </q-tab-panels>
            </q-card-section>
          </div>
        </q-slide-transition>
      </q-card>
    </template>

    <div v-else class="text-center q-py-xl text-grey">
      <q-icon name="school" size="64px" />
      <div class="q-mt-md">Seleccione una sede para ver el monitoreo</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useSedesStore } from 'src/stores/sedes'
import reporteService from 'src/services/reporteService'
import MateriasListado from 'components/reportes/MateriasListadoMonitoreo.vue'

const authStore = useAuthStore()
const sedesStore = useSedesStore()

const loading = ref(false)
const datosSede = ref(null)
const sedeSeleccionada = ref(null)
const tabDetalle = ref('completas')
const carreraExpandida = ref(null)

const sedesOptions = computed(() => {
  return sedesStore.sedes.map((s) => ({ label: s.nombre, value: s.id }))
})

const totalMaterias = computed(() => {
  if (!datosSede.value) return 0
  return datosSede.value.carreras.reduce((sum, c) => sum + c.total_materias, 0)
})

const totalCompletas = computed(() => {
  if (!datosSede.value) return 0
  return datosSede.value.carreras.reduce((sum, c) => sum + c.completas.count, 0)
})

const totalBajoAvance = computed(() => {
  if (!datosSede.value) return 0
  return datosSede.value.carreras.reduce((sum, c) => sum + c.avance_bajo.count, 0)
})

onMounted(async () => {
  if (sedesStore.sedes.length === 0) {
    await sedesStore.fetchSedes()
  }

  // Determinar sede inicial
  const user = authStore.user
  if (user?.roles?.includes('VICERRECTOR_SEDE') && user.sede_id) {
    sedeSeleccionada.value = user.sede_id
  } else if (sedesStore.sedes.length > 0) {
    sedeSeleccionada.value = sedesStore.sedes[0].id
  }

  if (sedeSeleccionada.value) {
    cargarDatos()
  }
})

async function cargarDatos() {
  if (!sedeSeleccionada.value) return

  loading.value = true
  try {
    const response = await reporteService.getMonitoreoCarreras({
      sede_id: sedeSeleccionada.value,
    })
    datosSede.value = response.data
  } catch (error) {
    console.error('Error cargando monitoreo:', error)
    datosSede.value = null
  } finally {
    loading.value = false
  }
}

function toggleCarrera(carreraId) {
  carreraExpandida.value = carreraExpandida.value === carreraId ? null : carreraId
}
</script>
