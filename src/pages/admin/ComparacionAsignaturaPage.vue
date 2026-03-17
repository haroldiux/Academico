<template>
  <q-page class="comparacion-asignatura-page q-pa-lg">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title text-gradient">
          <q-icon name="compare_arrows" color="primary" class="q-mr-sm" />
          Comparación de Asignatura
        </h1>
        <div class="header-subtitle">
          <p class="page-subtitle">
            Comparación detallada entre API de Planificación y datos locales
          </p>
          <div class="header-badges q-mt-xs">
            <q-badge color="positive" label="API Externa" class="q-mr-xs" />
            <q-badge color="primary" label="Plan Nuevo (N)" />
          </div>
        </div>
      </div>
      <div class="header-actions">
        <q-btn
          outline
          color="primary"
          icon="arrow_back"
          label="Volver"
          @click="$router.go(-1)"
          no-caps
        />
      </div>
    </div>

    <!-- Información básica -->
    <q-card class="info-card q-mb-md">
      <q-card-section>
        <div class="row items-center">
          <div class="col">
            <div class="text-h6">
              <q-chip
                outline
                color="primary"
                text-color="primary"
                size="md"
                class="text-weight-bold"
              >
                {{ asignaturaData?.codigo }}
              </q-chip>
              {{ asignaturaData?.nombre }}
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">
              <div>Sede: {{ sedeNombre }}</div>
              <div>Carrera: {{ carreraNombre }}</div>
              <div>Gestión: {{ gestion }}</div>
              <div>Semestre: {{ asignaturaData?.semestre }}</div>
            </div>
          </div>
          <div class="col-auto">
            <q-badge
              :color="
                comparacion.existe_en_api && comparacion.existe_en_local ? 'positive' : 'warning'
              "
              :label="
                comparacion.existe_en_api && comparacion.existe_en_local
                  ? 'Coincide'
                  : 'Sin coincidencia completa'
              "
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Comparación lado a lado -->
    <div class="comparison-grid">
      <!-- Columna API Externa -->
      <q-card class="comparison-column">
        <q-card-section>
          <div class="column-header">
            <q-icon name="cloud" size="24px" color="positive" class="q-mr-sm" />
            <span class="text-h6">API de Planificación</span>
            <q-badge
              color="positive"
              :label="comparacion.existe_en_api ? 'Disponible' : 'No disponible'"
              class="q-ml-sm"
            />
          </div>
        </q-card-section>

        <q-card-section v-if="apiData" class="q-pt-none">
          <div class="section">
            <div class="section-title">Docentes con Grupos</div>
            <div v-if="apiData.docentes && apiData.docentes.length">
              <div
                v-for="(docenteStr, idx) in apiData.docentes"
                :key="idx"
                class="docente-item q-mb-sm"
              >
                <div class="docente-nombre">{{ parseDocenteConGrupos(docenteStr).docente }}</div>
                <div v-if="parseDocenteConGrupos(docenteStr).grupos.length" class="grupos-section">
                  <q-chip
                    v-for="(grupo, gIdx) in parseDocenteConGrupos(docenteStr).grupos"
                    :key="gIdx"
                    dense
                    color="positive"
                    text-color="white"
                    size="sm"
                    class="q-mr-xs q-mb-xs"
                  >
                    {{ grupo }}
                  </q-chip>
                </div>
              </div>
            </div>
            <div v-else class="text-grey-7 text-italic">Sin docentes asignados en API</div>
          </div>

          <div class="section q-mt-md">
            <div class="section-title">Información Adicional</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Código:</span>
                <span class="info-value">{{ apiData.codigo }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Semestre:</span>
                <span class="info-value">{{ apiData.semestre }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Plan:</span>
                <span class="info-value">{{ apiData.plan_estudios }}</span>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section v-else class="text-center q-pa-xl">
          <q-icon name="cloud_off" size="4rem" color="grey-5" class="q-mb-md" />
          <div class="text-h6 text-grey-7">Asignatura no encontrada en API</div>
          <div class="text-body2 text-grey-5">
            No se encontró esta asignatura en la API de Planificación externa
          </div>
        </q-card-section>
      </q-card>

      <!-- Columna Datos Locales -->
      <q-card class="comparison-column">
        <q-card-section>
          <div class="column-header">
            <q-icon name="storage" size="24px" color="primary" class="q-mr-sm" />
            <span class="text-h6">Datos Locales</span>
            <q-badge
              color="primary"
              :label="comparacion.existe_en_local ? 'Disponible' : 'No disponible'"
              class="q-ml-sm"
            />
          </div>
        </q-card-section>

        <q-card-section v-if="localData" class="q-pt-none">
          <div class="section">
            <div class="section-title">Docentes con Grupos</div>
            <div v-if="localData.docentes && localData.docentes.length">
              <div
                v-for="(docente, idx) in localData.docentes"
                :key="idx"
                class="docente-item q-mb-sm"
              >
                <div class="docente-header row items-center justify-between q-mb-xs">
                  <div class="docente-nombre text-weight-medium">{{ docente.docente }}</div>
                  <q-btn
                    dense
                    flat
                    round
                    icon="add"
                    size="sm"
                    color="primary"
                    @click="abrirDialogoAsignar(docente)"
                    :loading="asignandoGrupo"
                  />
                </div>
                <div v-if="docente.grupos && docente.grupos.length" class="grupos-section">
                  <q-chip
                    v-for="(grupo, gIdx) in docente.grupos"
                    :key="gIdx"
                    dense
                    color="primary"
                    text-color="white"
                    size="sm"
                    class="q-mr-xs q-mb-xs"
                    removable
                    @remove="() => quitarGrupo(docente, grupo)"
                    :loading="quitandoGrupo && quitandoGrupoId === grupo.id"
                  >
                    {{ grupo.nombre }}
                  </q-chip>
                </div>
              </div>
            </div>
            <div v-else class="text-grey-7 text-italic">Sin docentes asignados localmente</div>
          </div>

          <div class="section q-mt-md">
            <div class="section-title">Información Adicional</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Código:</span>
                <span class="info-value">{{ localData.codigo }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Semestre:</span>
                <span class="info-value">{{ localData.semestre }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Plan:</span>
                <span class="info-value">{{ localData.plan_estudios }}</span>
              </div>
              <div class="info-item" v-if="localData.grupos">
                <span class="info-label">Grupos totales:</span>
                <span class="info-value">{{ localData.grupos.length }}</span>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section v-else class="text-center q-pa-xl">
          <q-icon name="folder_off" size="4rem" color="grey-5" class="q-mb-md" />
          <div class="text-h6 text-grey-7">Asignatura no encontrada localmente</div>
          <div class="text-body2 text-grey-5">
            No se encontró esta asignatura en la base de datos local
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Resumen de Comparación -->
    <q-card class="comparison-summary q-mt-md">
      <q-card-section>
        <div class="text-h6">Resumen de Comparación</div>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">Coincidencia en API</div>
            <div class="summary-value">
              <q-badge :color="comparacion.existe_en_api ? 'positive' : 'negative'">
                {{ comparacion.existe_en_api ? 'Sí' : 'No' }}
              </q-badge>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Coincidencia Local</div>
            <div class="summary-value">
              <q-badge :color="comparacion.existe_en_local ? 'positive' : 'negative'">
                {{ comparacion.existe_en_local ? 'Sí' : 'No' }}
              </q-badge>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Coincidencia Nombre</div>
            <div class="summary-value">
              <q-badge :color="comparacion.coincidencia_nombre ? 'positive' : 'warning'">
                {{ comparacion.coincidencia_nombre ? 'Sí' : 'No' }}
              </q-badge>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Coincidencia Semestre</div>
            <div class="summary-value">
              <q-badge :color="comparacion.coincidencia_semestre ? 'positive' : 'warning'">
                {{ comparacion.coincidencia_semestre ? 'Sí' : 'No' }}
              </q-badge>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading -->
    <q-inner-loading :showing="loading">
      <q-spinner size="50px" color="primary" />
    </q-inner-loading>

    <!-- Dialogo para asignar grupo -->
    <q-dialog v-model="dialogAsignar">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Asignar grupo a docente</div>
          <div class="text-caption text-grey-7 q-mb-md">
            Asignar un grupo disponible al docente
            {{ docenteParaAsignar ? docenteParaAsignar.docente : '' }}
          </div>
          <q-select
            v-model="grupoParaAsignar"
            :options="gruposDisponibles"
            option-label="nombre"
            label="Seleccionar grupo"
            map-options
            dense
            outlined
            :loading="asignandoGrupo"
          />
          <div v-if="gruposDisponibles.length === 0" class="text-caption text-grey-7 q-mt-xs">
            No hay grupos disponibles para asignar.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn label="Asignar" color="primary" @click="asignarGrupo" :loading="asignandoGrupo" :disable="!grupoParaAsignar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

// Parámetros de la URL
const codigo = ref(route.query.codigo || '')
const sedeId = ref(route.query.sede || null)
const carreraId = ref(route.query.carrera || null)
const gestion = ref(route.query.gestion || '1-2026')

// Datos
const loading = ref(false)
const apiData = ref(null)
const localData = ref(null)
const comparacion = ref({
  existe_en_api: false,
  existe_en_local: false,
  coincidencia_nombre: false,
  coincidencia_semestre: false,
})

// Gestión de grupos
const asignandoGrupo = ref(false)
const quitandoGrupo = ref(false)
const quitandoGrupoId = ref(null)
const dialogAsignar = ref(false)
const docenteParaAsignar = ref(null)
const grupoParaAsignar = ref(null)

const sedeNombre = ref('')
const carreraNombre = ref('')

// Datos combinados para mostrar información básica
const asignaturaData = computed(() => apiData.value || localData.value)

// Grupos disponibles (sin docente asignado)
const gruposDisponibles = computed(() => {
  if (!localData.value || !localData.value.grupos) return []
  return localData.value.grupos.filter((g) => !g.docente)
})

// Función para parsear docente con grupos (formato API)
function parseDocenteConGrupos(docenteStr) {
  // Formato: "Docente (Grupo1, Grupo2)" o "Docente"
  const match = docenteStr.match(/^(.+?)\s*\((.+)\)$/)
  if (match) {
    const docente = match[1].trim()
    const grupos = match[2]
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean)
    return { docente, grupos }
  }
  return { docente: docenteStr, grupos: [] }
}

// Cargar datos de comparación
async function cargarComparacion() {
  if (!codigo.value || !sedeId.value || !carreraId.value) {
    $q.notify({
      type: 'negative',
      message: 'Faltan parámetros para la comparación',
      position: 'top-right',
    })
    router.go(-1)
    return
  }

  loading.value = true
  try {
    const response = await api.get('/grupos-externo/comparar-asignatura', {
      params: {
        gestion: gestion.value,
        carrera: carreraId.value,
        sede: sedeId.value,
        codigo: codigo.value,
      },
    })

    if (response.data.success) {
      apiData.value = response.data.data.api
      localData.value = response.data.data.local
      comparacion.value = response.data.data.comparacion

      // Cargar nombres de sede y carrera
      await cargarNombresSedeCarrera()
    }
  } catch (error) {
    console.error('Error cargando comparación:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos de comparación',
      position: 'top-right',
    })
  } finally {
    loading.value = false
  }
}

async function cargarNombresSedeCarrera() {
  try {
    // Cargar sedes
    const sedesResponse = await api.get('/sedes')
    const sede = sedesResponse.data.find(
      (s) => s.id_api === parseInt(sedeId.value) || s.id === parseInt(sedeId.value),
    )
    sedeNombre.value = sede?.nombre || `Sede ${sedeId.value}`

    // Cargar carreras
    const carrerasResponse = await api.get('/carreras')
    const carrera = carrerasResponse.data.find(
      (c) =>
        c.id === parseInt(carreraId.value) ||
        c.codigo?.toLowerCase() === carreraId.value?.toLowerCase(),
    )
    carreraNombre.value = carrera?.nombre || `Carrera ${carreraId.value}`
  } catch (error) {
    console.error('Error cargando nombres:', error)
    sedeNombre.value = `Sede ${sedeId.value}`
    carreraNombre.value = `Carrera ${carreraId.value}`
  }
}

async function quitarGrupo(docente, grupo) {
  if (
    !confirm(`¿Está seguro de quitar el grupo "${grupo.nombre}" del docente ${docente.docente}?`)
  ) {
    return
  }
  quitandoGrupo.value = true
  quitandoGrupoId.value = grupo.id
  try {
    const response = await api.post('/grupos-externo/quitar-grupo-docente', {
      grupo_id: grupo.id,
    })
    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: response.data.message,
        position: 'top-right',
      })
      await cargarComparacion()
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.message || 'Error al quitar grupo',
        position: 'top-right',
      })
    }
  } catch (error) {
    console.error('Error quitando grupo:', error)
    $q.notify({
      type: 'negative',
      message: 'Error de conexión al quitar grupo',
      position: 'top-right',
    })
  } finally {
    quitandoGrupo.value = false
    quitandoGrupoId.value = null
  }
}

function abrirDialogoAsignar(docente) {
  docenteParaAsignar.value = docente
  grupoParaAsignar.value = null
  dialogAsignar.value = true
}

async function asignarGrupo() {
  if (!docenteParaAsignar.value || !grupoParaAsignar.value) {
    $q.notify({
      type: 'warning',
      message: 'Seleccione un grupo para asignar',
      position: 'top-right',
    })
    return
  }
  asignandoGrupo.value = true
  try {
    const response = await api.post('/grupos-externo/asignar-grupo-docente', {
      grupo_id: grupoParaAsignar.value.id,
      docente_id: docenteParaAsignar.value.docente_id,
    })
    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: response.data.message,
        position: 'top-right',
      })
      dialogAsignar.value = false
      await cargarComparacion()
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.message || 'Error al asignar grupo',
        position: 'top-right',
      })
    }
  } catch (error) {
    console.error('Error asignando grupo:', error)
    $q.notify({
      type: 'negative',
      message: 'Error de conexión al asignar grupo',
      position: 'top-right',
    })
  } finally {
    asignandoGrupo.value = false
  }
}

onMounted(() => {
  cargarComparacion()
})
</script>

<style scoped>
.comparacion-asignatura-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-info .page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.text-gradient {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  margin: 4px 0 0;
  color: #6c757d;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.info-card {
  border-radius: 8px;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

@media (max-width: 992px) {
  .comparison-grid {
    grid-template-columns: 1fr;
  }
}

.comparison-column {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.column-header {
  display: flex;
  align-items: center;
}

.section {
  margin-bottom: 16px;
}

.section-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
}

.docente-item {
  border-left: 3px solid #1976d2;
  padding-left: 12px;
}

.docente-nombre {
  font-weight: 500;
  margin-bottom: 4px;
}

.grupos-section {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-label {
  font-weight: 500;
  color: #6c757d;
}

.info-value {
  font-weight: 600;
}

.comparison-summary {
  border-radius: 8px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.summary-label {
  font-weight: 500;
}

.summary-value {
  font-weight: 600;
}
</style>
