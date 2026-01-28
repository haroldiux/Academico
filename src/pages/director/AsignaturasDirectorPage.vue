<template>
  <q-page class="q-pa-lg">
    <!-- Page Header -->
    <div class="row items-center q-mb-lg animate-in">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="menu_book" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Plan de Estudios</span>
        </h4>
        <div class="row items-center q-gutter-sm q-mt-xs">
          <p class="q-ma-none" style="color: var(--text-secondary);">
            Vista general de asignaturas por semestre
          </p>
          <q-chip v-if="authStore.rol === 'DIRECCION_ACADEMICA' || authStore.rol === 'VICERRECTOR_SEDE'" color="primary"
            text-color="white" size="sm" icon="apartment">
            Sede: Cochabamba
          </q-chip>
        </div>
      </div>
      <div class="col-auto">
        <q-btn label="Descargar Malla" icon="download" color="primary" flat />
      </div>
    </div>

    <!-- Filters -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-select v-model="filtros.carreraId" :options="carrerasOptions" label="Carrera" outlined dense bg-color="white"
          emit-value map-options :disable="carrerasOptions.length <= 1">
          <template v-slot:prepend>
            <q-icon name="school" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-8">
        <q-input v-model="filtros.buscar" label="Buscar asignatura..." outlined dense bg-color="white" clearable>
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Stats -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-primary">{{ totalAsignaturas }}</div>
                <div class="text-caption text-grey-7">Total Asignaturas</div>
              </div>
              <q-icon name="library_books" size="40px" color="primary" opacity="0.2" />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-positive">{{ asignadasCount }}</div>
                <div class="text-caption text-grey-7">Asignadas con Docente</div>
              </div>
              <q-icon name="person_add" size="40px" color="positive" />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-warning">{{ vacantesCount }}</div>
                <div class="text-caption text-grey-7">Vacantes / Por Designar</div>
              </div>
              <q-icon name="person_off" size="40px" color="warning" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Semesters List -->
    <div class="q-gutter-md">
      <div v-for="semestre in semestresFiltrados" :key="semestre.id">
        <q-expansion-item header-class="bg-white text-primary text-weight-bold shadow-1"
          style="border-radius: 8px; overflow: hidden;" default-opened>
          <template v-slot:header>
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white" size="32px" font-size="14px">
                {{ semestre.numero }}°
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6">{{ semestre.nombre }}</q-item-label>
              <q-item-label caption>{{ semestre.asignaturas.length }} asignaturas - {{ semestre.horasTotales }}
                horas</q-item-label>
            </q-item-section>
          </template>

          <q-card>
            <q-card-section class="q-pa-md bg-grey-1">
              <q-table :rows="semestre.asignaturas" :columns="columnasAsignaturas" row-key="codigo" flat bordered
                separator="cell" class="bg-white rounded-borders" hide-bottom :pagination="{ rowsPerPage: 0 }">
                <!-- Columna Asignatura con Indicadores -->
                <template v-slot:body-cell-asignatura="props">
                  <q-td :props="props">
                    <div>{{ props.row.nombre }}</div>
                    <div v-if="props.row.comun_token" class="q-mt-xs">
                      <q-chip size="xs" color="indigo-1" text-color="indigo" icon="merge_type" dense>
                        Materia Común
                        <q-tooltip>Esta asignatura se comparte con otras carreras.</q-tooltip>
                      </q-chip>
                    </div>
                  </q-td>
                </template>
                <!-- Columna Docente -->
                <template v-slot:body-cell-docente="props">
                  <q-td :props="props">
                    <div v-if="props.row.docente_nombre" class="row items-center no-wrap">
                      <q-avatar size="28px" color="blue-grey-1" text-color="primary" class="q-mr-sm" icon="person" />
                      <div>
                        <div class="text-weight-medium text-body2">{{ props.row.docente_nombre }}</div>
                      </div>
                    </div>
                    <div v-else class="text-grey-5 text-italic">
                      <q-icon name="warning" color="warning" class="q-mr-xs" />
                      Sin asignar
                    </div>
                  </q-td>
                </template>

                <!-- Columna Estado -->
                <template v-slot:body-cell-estado="props">
                  <q-td :props="props">
                    <q-chip :color="props.row.docente_nombre ? 'positive' : 'warning'"
                      :text-color="props.row.docente_nombre ? 'white' : 'black'" size="sm">
                      {{ props.row.docente_nombre ? 'Asignada' : 'Vacante' }}
                    </q-chip>
                  </q-td>
                </template>

                <!-- Columna Acciones -->
                <template v-slot:body-cell-acciones="props">
                  <q-td :props="props">
                    <q-btn flat round dense icon="visibility" color="primary" size="sm"
                      :to="`/documentacion/${props.row.id}${(props.row.docentes_data && props.row.docentes_data.length === 1) ? '?docente_id=' + props.row.docentes_data[0].id : ''}`">
                      <q-tooltip>Ver Documentación</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="picture_as_pdf" color="secondary" size="sm"
                      @click="generarCarpeta(props.row)">
                      <q-tooltip>Generar Carpeta Docente</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
    </div>
    <q-dialog v-model="showDocenteDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Seleccionar Docente</div>
          <div class="text-caption">Esta asignatura tiene múltiples docentes. Seleccione uno para generar la carpeta.
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-list bordered separator>
            <q-item v-for="docente in docentesDialogOptions" :key="docente.id" clickable v-ripple
              @click="seleccionarDocente(docente.id)">
              <q-item-section avatar>
                <q-avatar icon="person" color="primary" text-color="white" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ docente.nombre }}</q-item-label>
                <q-item-label caption>{{ docente.descripcion_grupos }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import asignaturaService from 'src/services/asignaturaService'
import { generarCarpetaDocente } from 'src/services/carpetaDocenteService'
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useAsignaturasStore } from 'src/stores/asignaturas'

const authStore = useAuthStore()
const asignaturasStore = useAsignaturasStore()
const $q = useQuasar()

// State for interaction
const showDocenteDialog = ref(false)
const docentesDialogOptions = ref([])
const asignaturaSeleccionada = ref(null)

// Action function
async function generarCarpeta(row) {
  // 1. Check if we have multiple docents
  const docentes = row.docentes_data || []

  if (docentes.length === 0) {
    // If no docent, try to generate generic (might fail if service requires docent linked data)
    // Warning the user
    $q.notify({
      type: 'warning',
      message: 'Esta asignatura no tiene docentes asignados. Se generará una carpeta vacía.'
    })
    await processGenerarPDF(row, null)
    return
  }

  if (docentes.length === 1) {
    // Single docent, proceed directly
    await processGenerarPDF(row, docentes[0].id)
    return
  }

  // Multiple docents: Show dialog
  asignaturaSeleccionada.value = row
  docentesDialogOptions.value = docentes
  showDocenteDialog.value = true
}

async function seleccionarDocente(docenteId) {
  showDocenteDialog.value = false
  if (asignaturaSeleccionada.value) {
    await processGenerarPDF(asignaturaSeleccionada.value, docenteId)
    asignaturaSeleccionada.value = null
  }
}

async function processGenerarPDF(rowSummary, docenteId) {
  console.log('Iniciando generación de PDF', rowSummary.id, docenteId)
  $q.loading.show({
    message: 'Generando Carpeta Docente...',
    boxClass: 'bg-grey-2 text-grey-9',
    spinnerColor: 'primary'
  })

  try {
    // 1. Fetch FULL data from backend (bypassing local summary)
    // We reuse asignaturaService directly to avoid state side-effects in store if possible,
    // or just use store but be aware. Let's use service directly.
    const params = {}
    if (docenteId) params.docente_id = docenteId

    // Fetch full detail
    const response = await asignaturaService.getAsignatura(rowSummary.id, params)
    const asignaturaFull = response.data

    // 2. Construct context objects (Carrera, Sede) similar to AsignaturaEditPage
    // The full response usually has 'carrera' object injected or we use row data.
    // AsignaturaController returns 'carrera' object with 'sede' inside.
    const carrera = asignaturaFull.carrera || {
      nombre: rowSummary.carrera_nombre || 'Desconocida',
      id: rowSummary.carrera_id
    }

    // Ensure sede exists
    const sede = carrera.sede || {
      nombre: rowSummary.sede_nombre || 'Sede Central',
      id: rowSummary.sede_id
    }

    if (!carrera.sede) carrera.sede = sede // Link them if missing

    // 3. Generate PDF
    generarCarpetaDocente(asignaturaFull, carrera, sede)

    $q.notify({
      type: 'positive',
      message: 'Carpeta generada exitosamente'
    })

  } catch (error) {
    console.error('Error generando PDF:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar la carpeta docente.'
    })
  } finally {
    $q.loading.hide()
  }
}

// Filtros
const filtros = ref({
  carreraId: null, // ID real
  buscar: ''
})

// Opciones de Carreras (Dinámicas)
const carrerasOptions = computed(() => {
  const director = authStore.usuarioActual?.director
  if (!director) return []

  // Opción 1: Director de una sola carrera (relación belongsTo)
  if (director.carrera) {
    return [{ label: director.carrera.nombre, value: director.carrera.id }]
  }

  // Opción 2: Director de múltiples carreras (si implementaste hasMany 'carreras')
  // Por ahora asumiendo que el backend podría mandarlo, o fallback a lo básico
  return []
})

// Cargar datos
async function cargarAsignaturas() {
  if (!filtros.value.carreraId) return

  // Usar la sede del director (o del usuario actual)
  const sedeId = authStore.usuarioActual?.director?.sede_id || authStore.sedeId

  await asignaturasStore.fetchAsignaturas(
    sedeId,
    filtros.value.carreraId,
    null, // Todos los semestres
    filtros.value.buscar // Búsqueda backend (opcional, o filtrar en frontend)
  )
}

// Inicialización
onMounted(() => {
  // Pre-seleccionar la primera carrera disponible
  if (carrerasOptions.value.length > 0) {
    filtros.value.carreraId = carrerasOptions.value[0].value
    cargarAsignaturas()
  }
})

// Watchers
watch(() => filtros.value.carreraId, () => {
  cargarAsignaturas()
})

// Debounce para búsqueda si queremos búsqueda backend,
// pero como la lista no es gigante, el filtrado frontend computed es más fluido para UX.
// Mantenemos búsqueda Frontend sobre los datos cargados.

// Columnas
const columnasAsignaturas = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true, style: 'width: 100px' },
  { name: 'asignatura', label: 'Asignatura', field: 'nombre', align: 'left', sortable: true },
  { name: 'horas', label: 'Horas', field: 'horas_teoricas', align: 'center', format: (val, row) => ((row.horas_teoricas || 0) * 20) + ((row.horas_practicas || 0) * 20), style: 'width: 80px' }, // Suma x20
  { name: 'docente', label: 'Docente Principal', field: 'docente_nombre', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', style: 'width: 100px' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center', style: 'width: 100px' }
]

// Computed: Estadísticas
const totalAsignaturas = computed(() => asignaturasStore.asignaturas.length)
const asignadasCount = computed(() => asignaturasStore.asignaturas.filter(a => a.docentes && a.docentes.length > 0).length)
const vacantesCount = computed(() => totalAsignaturas.value - asignadasCount.value)

// ComputedPrincipal: Semestres Agrupados
const semestresFiltrados = computed(() => {
  const busqueda = filtros.value.buscar.toLowerCase()
  let lista = asignaturasStore.asignaturas

  // 1. Filtrado por búsqueda
  if (busqueda) {
    lista = lista.filter(a =>
      a.nombre.toLowerCase().includes(busqueda) ||
      a.codigo.toLowerCase().includes(busqueda) ||
      (a.docente_nombre && a.docente_nombre.toLowerCase().includes(busqueda))
    )
  }

  // 2. Agrupación por Semestre
  // Estructura deseada: [{ id: 1, nombre: 'Primer Semestre', asignaturas: [...] }, ...]
  const grupos = {}

  lista.forEach(asig => {
    const sem = asig.semestre || 0
    if (!grupos[sem]) {
      grupos[sem] = {
        id: sem,
        numero: sem,
        nombre: getNemotecnicoSemestre(sem),
        horasTotales: 0,
        asignaturas: []
      }
    }
    grupos[sem].asignaturas.push(asig)
    grupos[sem].horasTotales += ((asig.horas_teoricas || 0) * 20) + ((asig.horas_practicas || 0) * 20)
  })

  // Convertir objeto a array y ordenar
  return Object.values(grupos).sort((a, b) => a.numero - b.numero)
})

// Helper para nombres de semestre
function getNemotecnicoSemestre(n) {
  const maps = ['Cero', 'Primer', 'Segundo', 'Tercer', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo']
  return (maps[n] || n) + ' Semestre'
}
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(45deg, var(--q-primary), var(--q-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.metric-card {
  transition: transform 0.2s;
}

.metric-card:hover {
  transform: translateY(-2px);
}
</style>
