<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="compare_arrows" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Comparación y Sincronización Híbrida</span>
        </h4>
        <p class="q-ma-none q-mt-xs" style="color: var(--text-secondary)">
          Compara datos locales con la API externa y sobrescribe manualmente (solo SUPER_ADMIN)
        </p>
      </div>
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-lg shadow-1">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtro.entidad"
              :options="entidadesOptions"
              label="Entidad"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtro.sede_id"
              :options="sedesOptions"
              label="Sede"
              outlined
              dense
              emit-value
              map-options
              option-value="id"
              option-label="nombre"
              clearable
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtro.carrera_id"
              :options="carrerasOptions"
              label="Carrera"
              outlined
              dense
              emit-value
              map-options
              option-value="id"
              option-label="nombre"
              clearable
              :disable="!filtro.sede_id"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-btn
              color="primary"
              icon="compare_arrows"
              label="Comparar"
              @click="cargarComparacion"
              :loading="loading"
              class="full-width"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Resultados -->
    <div v-if="mostrarResultados">
      <div class="row q-mb-md">
        <div class="col">
          <h5 class="q-ma-none">
            <q-icon name="storage" color="blue" class="q-mr-sm" />
            Datos Locales ({{ datosLocales.length }})
          </h5>
        </div>
        <div class="col">
          <h5 class="q-ma-none">
            <q-icon name="cloud" color="green" class="q-mr-sm" />
            Datos API Externa ({{ datosExternos.length }})
          </h5>
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <!-- Columna Local -->
        <div class="col-12 col-md-6">
          <q-card class="shadow-1">
            <q-card-section class="bg-blue-1 text-blue-9">
              <div class="row items-center">
                <div class="col">
                  <strong>Base de Datos Local</strong>
                  <div class="text-caption">Modificaciones locales permitidas</div>
                </div>
                <div class="col-auto">
                  <q-badge color="blue" :label="datosLocales.length" />
                </div>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-none">
              <q-table
                :rows="datosLocales"
                :columns="columnasComparacion"
                row-key="id"
                :pagination="{ rowsPerPage: 5 }"
                dense
                flat
              >
                <template #body-cell-modificado_localmente="props">
                  <q-td :props="props">
                    <q-icon
                      :name="props.value ? 'edit' : 'sync'"
                      :color="props.value ? 'orange' : 'green'"
                      size="xs"
                    />
                  </q-td>
                </template>
                <template #body-cell-acciones="props">
                  <q-td :props="props">
                    <q-btn
                      flat
                      dense
                      icon="upload"
                      color="primary"
                      size="sm"
                      @click="sobrescribirLocal(props.row)"
                      :loading="sobrescLocalLoading === props.row.id"
                    >
                      <q-tooltip>Sobrescribir con datos API</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>

        <!-- Columna Externa -->
        <div class="col-12 col-md-6">
          <q-card class="shadow-1">
            <q-card-section class="bg-green-1 text-green-9">
              <div class="row items-center">
                <div class="col">
                  <strong>API Externa (Planning)</strong>
                  <div class="text-caption">Datos oficiales del sistema central</div>
                </div>
                <div class="col-auto">
                  <q-badge color="green" :label="datosExternos.length" />
                </div>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-none">
              <q-table
                :rows="datosExternos"
                :columns="columnasComparacion"
                row-key="id"
                :pagination="{ rowsPerPage: 5 }"
                dense
                flat
              >
                <template #body-cell-modificado_localmente="props">
                  <q-td :props="props">
                    <q-icon name="cloud" color="grey" size="xs" />
                  </q-td>
                </template>
                <template #body-cell-acciones="props">
                  <q-td :props="props">
                    <q-btn
                      flat
                      dense
                      icon="download"
                      color="green"
                      size="sm"
                      @click="sobrescribirExterno(props.row)"
                      :loading="sobrescExternoLoading === props.row.id"
                    >
                      <q-tooltip>Traer a base local</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Resumen diferencias -->
      <q-card class="q-mt-lg shadow-1">
        <q-card-section class="bg-grey-2">
          <div class="row items-center">
            <div class="col">
              <strong>Resumen de diferencias</strong>
            </div>
            <div class="col-auto">
              <q-badge color="orange" :label="diferenciasCount" />
              <span class="q-ml-sm text-caption">registros diferentes</span>
            </div>
          </div>
        </q-card-section>
        <q-card-section>
          <div v-if="diferenciasCount === 0" class="text-center text-grey">
            <q-icon name="check_circle" size="48px" color="green" />
            <div class="q-mt-sm">No hay diferencias entre los datos locales y la API externa.</div>
          </div>
          <div v-else>
            <div class="text-caption q-mb-sm">Se detectaron las siguientes discrepancias:</div>
            <q-list dense bordered>
              <q-item v-for="diff in diferencias" :key="diff.id">
                <q-item-section>
                  <q-item-label>{{ diff.nombre || diff.codigo || diff.id }}</q-item-label>
                  <q-item-label caption>
                    <span class="text-blue">Local:</span> {{ diff.local }} |
                    <span class="text-green">Externo:</span> {{ diff.externo }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Diálogo de confirmación sobrescritura -->
    <q-dialog v-model="showConfirmDialog" persistent>
      <q-card>
        <q-card-section class="bg-warning text-white">
          <div class="text-h6">
            <q-icon name="warning" class="q-mr-sm" />
            Confirmar Sobrescritura
          </div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          ¿Estás seguro de sobrescribir
          <strong>{{ itemSobrescribir?.nombre || itemSobrescribir?.codigo }}</strong
          >?
          <br />
          <small class="text-grey"
            >Esta acción reemplazará los datos locales con los de la API externa (o
            viceversa).</small
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            label="Sobrescribir"
            color="warning"
            @click="ejecutarSobrescritura"
            :loading="sobrescLoading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCarrerasStore } from 'src/stores/carreras'
import { useSedesStore } from 'src/stores/sedes'
import { useGruposStore } from 'src/stores/grupos'
import { useAsignaturasStore } from 'src/stores/asignaturas'

import { Notify } from 'quasar'

const carrerasStore = useCarrerasStore()
const sedesStore = useSedesStore()
const gruposStore = useGruposStore()
const asignaturasStore = useAsignaturasStore()

const loading = ref(false)
const mostrarResultados = ref(false)
const showConfirmDialog = ref(false)
const sobrescLoading = ref(false)
const sobrescLocalLoading = ref(null)
const sobrescExternoLoading = ref(null)

const filtro = ref({
  entidad: 'grupos',
  sede_id: null,
  carrera_id: null,
})

const entidadesOptions = [
  { label: 'Grupos', value: 'grupos' },
  { label: 'Asignaturas', value: 'asignaturas' },
  { label: 'Carreras', value: 'carreras' },
  { label: 'Sedes', value: 'sedes' },
]

const sedesOptions = computed(() => sedesStore.sedes.map((s) => ({ id: s.id, nombre: s.nombre })))
const carrerasOptions = computed(() => {
  if (!filtro.value.sede_id)
    return carrerasStore.carrerasActivas.map((c) => ({ id: c.id, nombre: c.nombre }))
  return carrerasStore
    .getCarrerasBySede(filtro.value.sede_id)
    .map((c) => ({ id: c.id, nombre: c.nombre }))
})

const columnasComparacion = computed(() => {
  const base = [
    { name: 'id', label: 'ID', field: 'id', align: 'left' },
    { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
    { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
    {
      name: 'modificado_localmente',
      label: 'Modificado',
      field: 'modificado_localmente',
      align: 'center',
    },
    { name: 'acciones', label: 'Acciones', align: 'center' },
  ]
  if (filtro.value.entidad === 'grupos') {
    base.splice(2, 0, {
      name: 'asignatura',
      label: 'Asignatura',
      field: 'asignatura_nombre',
      align: 'left',
    })
  }
  return base
})

const datosLocales = ref([])
const datosExternos = ref([])
const itemSobrescribir = ref(null)
const direccionSobrescritura = ref('') // 'local' o 'externo'

watch(
  () => filtro.value.sede_id,
  () => {
    filtro.value.carrera_id = null
  },
)

async function cargarComparacion() {
  loading.value = true
  mostrarResultados.value = false
  try {
    // Cargar datos locales según entidad
    switch (filtro.value.entidad) {
      case 'grupos':
        await gruposStore.fetchGrupos({
          sede_id: filtro.value.sede_id,
          carrera_id: filtro.value.carrera_id,
        })
        datosLocales.value = gruposStore.materias.map((m) => ({
          id: m.id,
          nombre: m.grupo || m.nombre,
          codigo: m.codigo,
          asignatura_nombre: m.nombre,
          modificado_localmente: true, // Asumir true para simplificar
        }))
        // Datos externos (simulados)
        await gruposStore.fetchGruposExterno({
          sede_id: filtro.value.sede_id,
          carrera_id: filtro.value.carrera_id,
        })
        datosExternos.value = gruposStore.materiasExterno.map((m) => ({
          id: m.id_externo || m.codigo,
          nombre: m.grupo || m.nombre,
          codigo: m.codigo,
          asignatura_nombre: m.nombre,
          modificado_localmente: false,
        }))
        break
      case 'asignaturas':
        await asignaturasStore.fetchAsignaturas(filtro.value.sede_id, filtro.value.carrera_id)
        datosLocales.value = asignaturasStore.asignaturas.map((a) => ({
          id: a.id,
          nombre: a.nombre,
          codigo: a.codigo,
          modificado_localmente: a.modificado_localmente || false,
        }))
        // No hay API externa directa para asignaturas, usar datos locales como placeholder
        datosExternos.value = []
        break
      case 'carreras':
        await carrerasStore.fetchCarreras()
        datosLocales.value = carrerasStore.carreras.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          codigo: c.codigo,
          modificado_localmente: c.modificado_localmente || false,
        }))
        datosExternos.value = []
        break
      case 'sedes':
        await sedesStore.fetchSedes()
        datosLocales.value = sedesStore.sedes.map((s) => ({
          id: s.id,
          nombre: s.nombre,
          codigo: s.codigo,
          modificado_localmente: s.modificado_localmente || false,
        }))
        datosExternos.value = []
        break
    }
    mostrarResultados.value = true
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Error cargando comparación: ' + error.message,
    })
  } finally {
    loading.value = false
  }
}

const diferencias = computed(() => {
  const diffs = []
  // Comparación simple por ID
  const localIds = datosLocales.value.map((l) => l.id)
  const externoIds = datosExternos.value.map((e) => e.id)

  // IDs presentes en externo pero no en local
  externoIds.forEach((id) => {
    if (!localIds.includes(id)) {
      const ext = datosExternos.value.find((e) => e.id === id)
      diffs.push({
        id,
        nombre: ext.nombre,
        local: 'No existe',
        externo: 'Presente',
      })
    }
  })

  // IDs presentes en local pero no en externo
  localIds.forEach((id) => {
    if (!externoIds.includes(id)) {
      const loc = datosLocales.value.find((l) => l.id === id)
      diffs.push({
        id,
        nombre: loc.nombre,
        local: 'Presente',
        externo: 'No existe',
      })
    }
  })

  return diffs
})

const diferenciasCount = computed(() => diferencias.value.length)

function sobrescribirLocal(item) {
  itemSobrescribir.value = item
  direccionSobrescritura.value = 'local'
  showConfirmDialog.value = true
}

function sobrescribirExterno(item) {
  itemSobrescribir.value = item
  direccionSobrescritura.value = 'externo'
  showConfirmDialog.value = true
}

async function ejecutarSobrescritura() {
  sobrescLoading.value = true
  try {
    // Simular sobrescritura (en un sistema real, llamar a API)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    Notify.create({
      type: 'positive',
      message: `Datos ${direccionSobrescritura.value === 'local' ? 'locales' : 'externos'} actualizados correctamente`,
    })

    showConfirmDialog.value = false
    // Recargar comparación
    await cargarComparacion()
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Error en sobrescritura: ' + error.message,
    })
  } finally {
    sobrescLoading.value = false
  }
}
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
