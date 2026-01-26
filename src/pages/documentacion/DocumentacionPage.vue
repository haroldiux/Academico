<template>
  <q-page class="q-pa-lg">
    <!-- Page Header -->
    <div class="row items-center q-mb-lg animate-in">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="menu_book" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Documentación Académica</span>
        </h4>
        <p class="q-ma-none q-mt-xs" style="color: var(--text-secondary);">
          Gestiona la planificación y documentación de asignaturas
        </p>
      </div>
    </div>

    <!-- Filters (Solo para roles Admin/Directores) -->
    <div v-if="authStore.rol !== 'DOCENTE'" class="row q-col-gutter-md q-mb-lg">
      <!-- Filtro de Sede - Solo para roles con acceso global -->
      <div v-if="!esDirectorCarrera" class="col-12 col-md-3">
        <q-select v-model="filtros.sede" :options="sedesOptions" label="Sede" outlined dense bg-color="white" emit-value
          map-options clearable>
          <template v-slot:prepend>
            <q-icon name="apartment" />
          </template>
        </q-select>
      </div>
      <!-- Filtro de Carrera -->
      <div :class="esDirectorCarrera ? 'col-12 col-md-4' : 'col-12 col-md-3'">
        <q-select v-model="filtros.carrera" :options="carrerasOptions" label="Carrera" outlined dense bg-color="white"
          emit-value map-options clearable :disable="!esDirectorCarrera && !filtros.sede">
          <template v-slot:prepend>
            <q-icon name="school" />
          </template>
        </q-select>
      </div>
      <div :class="esDirectorCarrera ? 'col-12 col-md-8' : 'col-12 col-md-6'">
        <q-input v-model="filtros.search" label="Buscar materia (Nombre o Código)..." outlined dense bg-color="white"
          debounce="300" clearable>
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <!-- Stat: Mis Asignaturas (Siempre visible) -->
      <div :class="authStore.rol === 'DOCENTE' ? 'col-12' : 'col-12 col-sm-6 col-lg-3'">
        <div class="stat-card animate-in" style="animation-delay: 0.1s">
          <div class="stat-icon primary q-mb-md">
            <q-icon name="menu_book" size="28px" />
          </div>
          <div class="stat-value">{{ asignaturasVisibles.length }}</div>
          <div class="stat-label">{{ authStore.rol === 'DOCENTE' ? 'Mis Asignaturas' : 'Total Asignaturas' }}</div>
        </div>
      </div>
      <!-- Stats adicionales (Solo para Admin/Directores) -->
      <template v-if="authStore.rol !== 'DOCENTE'">
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="stat-card animate-in" style="animation-delay: 0.15s">
            <div class="stat-icon success q-mb-md">
              <q-icon name="folder_open" size="28px" />
            </div>
            <div class="stat-value">{{ totalUnidades }}</div>
            <div class="stat-label">Unidades Registradas</div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="stat-card animate-in" style="animation-delay: 0.2s">
            <div class="stat-icon warning q-mb-md">
              <q-icon name="topic" size="28px" />
            </div>
            <div class="stat-value">{{ totalTemas }}</div>
            <div class="stat-label">Temas Definidos</div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="stat-card animate-in" style="animation-delay: 0.25s">
            <div class="stat-icon info q-mb-md">
              <q-icon name="auto_stories" size="28px" />
            </div>
            <div class="stat-value">{{ totalBibliografias }}</div>
            <div class="stat-label">Referencias Bibliográficas</div>
          </div>
        </div>
      </template>
    </div>

    <!-- Asignaturas Grid -->
    <div class="row q-col-gutter-lg">
      <div v-for="(asignatura, index) in asignaturasVisibles" :key="asignatura.id" class="col-12 col-md-6 col-lg-4">
        <q-card class="card-main cursor-pointer animate-in" :style="{ animationDelay: `${0.3 + index * 0.05}s` }"
          @click="irADocumentacion(asignatura.id)">
          <q-card-section>
            <!-- Header -->
            <div class="row items-start no-wrap q-mb-md">
              <q-avatar size="56px" color="primary" text-color="white" class="q-mr-md">
                <q-icon name="menu_book" size="28px" />
              </q-avatar>
              <div class="col">
                <div class="text-h6 text-weight-bold" style="line-height: 1.2;">
                  {{ asignatura.nombre }}
                </div>
                <div class="text-caption" style="color: var(--text-secondary);">
                  <q-chip size="sm" color="blue-1" text-color="blue-9" dense class="q-mr-xs">
                    {{ asignatura.codigo }}
                  </q-chip>
                  <q-chip size="sm" color="grey-3" text-color="grey-8" dense class="q-mr-xs">
                    {{ asignatura.semestre }}° Semestre
                  </q-chip>
                  <q-chip size="sm" color="purple-1" text-color="purple-9" dense v-if="asignatura.sede_nombre">
                    <q-icon name="place" size="12px" class="q-mr-xs" />
                    {{ asignatura.sede_nombre }}
                  </q-chip>
                  <!-- Grupos asignados (para docentes) -->
                  <!-- Grupos asignados (para docentes) -->
                  <q-chip v-if="authStore.rol === 'DOCENTE' && getGruposCount(asignatura.id) > 0"
                    size="sm" color="orange-2" text-color="orange-9" dense icon="groups">
                     {{ getGruposCount(asignatura.id) }} Grupo{{ getGruposCount(asignatura.id) > 1 ? 's' : '' }}
                  </q-chip>
                </div>
                <!-- Docente -->
                <div class="text-caption text-weight-medium text-grey-8 q-mt-xs">
                  <q-icon name="person" size="14px" class="q-mr-xs text-primary" />
                  {{ asignatura.docente_nombre || (authStore.rol === 'DOCENTE' ? 'Tú' : 'Sin asignar') }}
                </div>
                <!-- Aula/Horario (para docentes) -->
                <div v-if="authStore.rol === 'DOCENTE' && asignatura.pivot?.aula"
                  class="text-caption text-grey-6 q-mt-xs">
                  <q-icon name="room" size="12px" class="q-mr-xs" />
                  {{ asignatura.pivot.aula }}
                  <span v-if="asignatura.pivot?.horario" class="q-ml-sm">
                    <q-icon name="schedule" size="12px" class="q-mr-xs" />
                    {{ asignatura.pivot.horario }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Info Grid -->
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-4">
                <div class="text-center q-pa-sm rounded-borders" style="background: var(--primary-50);">
                  <div class="text-h6 text-weight-bold text-primary">{{ asignatura.creditos }}</div>
                  <div class="text-caption" style="color: var(--text-secondary);">Créditos</div>
                </div>
              </div>
              <div class="col-4">
                <div class="text-center q-pa-sm rounded-borders" style="background: #e8f5e9;">
                  <div class="text-h6 text-weight-bold text-green-8">{{ asignatura.unidades?.length || 0 }}</div>
                  <div class="text-caption" style="color: var(--text-secondary);">Unidades</div>
                </div>
              </div>
              <div class="col-4">
                <div class="text-center q-pa-sm rounded-borders" style="background: #fff3e0;">
                  <div class="text-h6 text-weight-bold text-orange-8">{{ getTotalTemasAsignatura(asignatura) }}</div>
                  <div class="text-caption" style="color: var(--text-secondary);">Temas</div>
                </div>
              </div>
            </div>

            <!-- Horas (Solo para Admin/Directores) -->
            <div v-if="authStore.rol !== 'DOCENTE'" class="row q-gutter-sm q-mb-md">
              <q-chip size="sm" icon="schedule" dense outline color="blue-grey">
                {{ asignatura.horas_teoricas }}h Teoría
              </q-chip>
              <q-chip size="sm" icon="build" dense outline color="blue-grey">
                {{ asignatura.horas_practicas }}h Práctica
              </q-chip>
              <q-chip size="sm" icon="science" dense outline color="blue-grey">
                {{ asignatura.horas_laboratorio }}h Lab
              </q-chip>
            </div>

            <!-- Progreso de documentación -->
            <div class="q-mb-sm">
              <div class="row items-center justify-between q-mb-xs">
                <span class="text-caption text-weight-medium" style="color: var(--text-secondary);">
                  Progreso de Documentación
                </span>
                <span class="text-caption text-weight-bold text-primary">
                  {{ calcularProgreso(asignatura) }}%
                </span>
              </div>
              <q-linear-progress :value="calcularProgreso(asignatura) / 100" color="primary" rounded size="8px" />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions>
            <q-btn flat color="primary" icon="edit_document" label="Documentar" no-caps class="full-width"
              @click.stop="irADocumentacion(asignatura.id)" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
    <!-- Diálogo de Selección de Docente -->
    <q-dialog v-model="showDocenteDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Seleccionar Docente</div>
          <div class="text-caption">Esta materia tiene múltiples grupos asignados. Elige qué carpeta deseas ver.</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-list bordered separator>
            <q-item v-for="docente in asignaturaSeleccionada?.docentes_data" :key="docente.id" clickable v-ripple
              @click="seleccionarDocente(docente.id)">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" icon="person" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ docente.nombre }}</q-item-label>
                <q-item-label caption>{{ docente.descripcion_grupos }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey" />
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
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAsignaturasStore } from 'src/stores/asignaturas'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'
import { useAuthStore, ROLES } from 'src/stores/auth'

const router = useRouter()
const asignaturasStore = useAsignaturasStore()
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()
const authStore = useAuthStore()

const asignaturaSeleccionada = ref(null)
const showDocenteDialog = ref(false)

// Computed - Verificar si es Director de Carrera
const esDirectorCarrera = computed(() => authStore.rol === ROLES.DIRECTOR_CARRERA)

// State
const filtros = ref({
  sede: '',
  carrera: '',
  search: ''
})

// Lifecycle
import { onMounted } from 'vue'

onMounted(async () => {
  await Promise.all([
    sedesStore.fetchSedes(),
    carrerasStore.fetchCarreras()
  ])

  // Si es Director de Carrera, auto-configurar su sede y carrera
  if (esDirectorCarrera.value) {
    // La sede del director viene del usuario
    filtros.value.sede = authStore.sedeId || authStore.usuarioActual?.sede_id || ''
    // La carrera del director viene del usuario
    filtros.value.carrera = authStore.carreraId || authStore.usuarioActual?.carrera_id || ''
  }

  await fetchData()
})

async function fetchData() {
  // Si es DOCENTE, cargar detalles completos solo de sus materias asignadas
  if (authStore.rol === 'DOCENTE') {
    const misMateriasBasicas = authStore.usuarioActual?.materias_asignadas || []
    if (misMateriasBasicas.length === 0) {
      asignaturasStore.asignaturas = []
      return
    }

    // Cargar detalles completos desde el servidor para cada materia
    // Preservamos los datos del pivote (grupo, aula, horario) del login
    const materiasConDetalles = []
    for (const materiaBase of misMateriasBasicas) {
      const id = typeof materiaBase === 'object' ? materiaBase.id : materiaBase
      try {
        await asignaturasStore.setAsignaturaActual(id)
        if (asignaturasStore.asignaturaActual) {
          // Combinar detalles del servidor + datos del pivote del login
          materiasConDetalles.push({
            ...asignaturasStore.asignaturaActual,
            pivot: materiaBase.pivot || null  // Preservar grupo, aula, horario
          })
        }
      } catch (e) {
        console.error('Error cargando asignatura', id, e)
      }
    }

    asignaturasStore.asignaturas = materiasConDetalles
    return
  }

  // Para otros roles, carga normal desde API (usando IDs locales)
  await asignaturasStore.fetchAsignaturas(
    filtros.value.sede,
    filtros.value.carrera,
    null, // Fix: semestre param should be null
    filtros.value.search
  )
}

// Watchers
watch(() => filtros.value.sede, () => {
  filtros.value.carrera = '' // Reset carrera when sede changes
  fetchData()
})

watch(() => filtros.value.carrera, () => fetchData())

// Debounce para búsqueda
let searchTimeout
watch(() => filtros.value.search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchData()
  }, 500)
})

// Computed Options
const sedesOptions = computed(() => {
  return sedesStore.sedes.map(s => ({ label: s.nombre, value: s.id }))
})

const carrerasOptions = computed(() => {
  let list = carrerasStore.carreras
  if (filtros.value.sede) {
    list = list.filter(c => c.sede_id === filtros.value.sede)
  }
  return list.map(c => ({ label: c.nombre, value: c.id }))
})

// Computed Asignaturas Visibles (Filtered by Role)
const asignaturasVisibles = computed(() => {
  // Si es DOCENTE, solo mostramos las que tiene asignadas
  if (authStore.rol === ROLES.DOCENTE) {
    if (!authStore.usuarioActual?.materias_asignadas?.length) return []
    const misIds = authStore.usuarioActual.materias_asignadas.map(m => m.id)
    return asignaturasStore.asignaturas.filter(a => misIds.includes(a.id))
  }
  // Si no, mostramos todas (Admin, Directores, etc.)
  return asignaturasStore.asignaturas
})

// Computed Stats (based on visibles)
const totalUnidades = computed(() => {
  return asignaturasVisibles.value.reduce((sum, a) => sum + (a.unidades?.length || 0), 0)
})

const totalTemas = computed(() => {
  return asignaturasVisibles.value.reduce((sum, a) => {
    return sum + (a.unidades?.reduce((s, u) => s + (u.temas?.length || 0), 0) || 0)
  }, 0)
})

const totalBibliografias = computed(() => {
  return asignaturasVisibles.value.reduce((sum, a) => sum + (a.bibliografias?.length || 0), 0)
})

// Methods
function getTotalTemasAsignatura(asignatura) {
  return asignatura.unidades?.reduce((sum, u) => sum + (u.temas?.length || 0), 0) || 0
}

function calcularProgreso(asignatura) {
  let total = 0
  let completado = 0

  // Datos básicos (peso 20%)
  const camposRequeridos = ['nombre', 'codigo', 'objetivo_general', 'justificacion', 'metodologia_ensenanza']
  const camposCompletos = camposRequeridos.filter(c => asignatura[c]?.length > 0).length
  total += 20
  completado += (camposCompletos / camposRequeridos.length) * 20

  // Bibliografía (peso 20%)
  total += 20
  if (asignatura.bibliografias?.length >= 2) completado += 20
  else if (asignatura.bibliografias?.length >= 1) completado += 10

  // Unidades (peso 20%)
  total += 20
  if (asignatura.unidades?.length >= 3) completado += 20
  else if (asignatura.unidades?.length >= 1) completado += 10

  // Temas (peso 20%)
  total += 20
  const temas = getTotalTemasAsignatura(asignatura)
  if (temas >= 5) completado += 20
  else if (temas >= 2) completado += 10

  // Logros e indicadores (peso 20%)
  total += 20
  const logros = asignatura.unidades?.reduce((s, u) => {
    return s + (u.temas?.reduce((st, t) => st + (t.logros?.length || 0), 0) || 0)
  }, 0) || 0
  if (logros >= 5) completado += 20
  else if (logros >= 2) completado += 10

    return Math.round((completado / total) * 100)
}

function getGruposCount(asignaturaId) {
  // Access groups from auth store directly
  const grupos = authStore.usuarioActual?.grupos || []
  // Filter by asignatura_id
  return grupos.filter(g => g.asignatura_id == asignaturaId).length
}

function irADocumentacion(id) {
  // Buscar asignatura
  const asignatura = asignaturasStore.asignaturas.find(a => a.id === id)
  if (!asignatura) return

  const rolActual = authStore.rol

  // CASO 1: Es DOCENTE -> Navega directo a su propia "carpeta"
  if (rolActual === ROLES.DOCENTE) {
    // Verificar si está asignado (aunque el filtro visual ya lo hace)
    // Pasamos su propio ID para filtrar en la vista destino
    // Ojo: authStore.usuarioActual.id es el ID de usuario, necesitamos el ID de DOCENTE asociado.
    // Usualmente el ID de usuario se mapea a docente.
    // Si la estructura del store tiene 'id' como id de usuario, necesitamos saber cual es el id de docente.
    // Asumiremos por ahora que authStore.usuarioActual.id se puede usar para filtrar
    // o que el backend lo maneja.
    // Dado que la vista PlanificacionPage no filtra por docenteID en la URL,
    // tal vez necesitemos pasarlo.
    // EN este requerimiento: "EL DOCENTE UNICAMENTE VA A VER SU CARPETRA"

    router.push(`/documentacion/${id}`)
    return
  }

  // CASO 2: DIRECTORES/ADMIN -> Lógica de Selección
  const docentes = asignatura.docentes_data || []

  if (docentes.length === 0) {
    // Sin docente asignado -> Entrar modo genérico (o mostrar alerta)
    router.push(`/documentacion/${id}`)
  } else if (docentes.length === 1) {
    // Un solo docente -> Entrar directo seleccionando a ese docente
    // Pasamos query param para que la siguiente vista sepa a quien filtrar
    // O bien, la siguiente vista muestra todo si no se filtra.
    // El usuario pidió: "SI LA AMTERIA TIENE SOLO UNN DOCENTE QUE ACCEDA DIRECTAMENTE"
    // Asumiremos que quiere ver la carpeta DE ESE docente.
    router.push({ path: `/documentacion/${id}`, query: { docente_id: docentes[0].id } })
  } else {
    // Múltiples docentes -> Mostrar diálogo
    asignaturaSeleccionada.value = asignatura
    showDocenteDialog.value = true
  }
}

function seleccionarDocente(docenteId) {
  if (asignaturaSeleccionada.value) {
    router.push({
      path: `/documentacion/${asignaturaSeleccionada.value.id}`,
      query: { docente_id: docenteId }
    })
    showDocenteDialog.value = false
    asignaturaSeleccionada.value = null
  }
}
</script>



<style scoped>
.q-page {
  background: var(--bg-primary);
  min-height: 100vh;
}

.text-gradient {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Stat Cards */
.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.primary {
  background: rgba(124, 58, 237, 0.15);
  color: var(--primary-light);
}

.stat-icon.success {
  background: rgba(34, 197, 94, 0.15);
  color: var(--accent-green);
}

.stat-icon.warning {
  background: rgba(249, 115, 22, 0.15);
  color: var(--accent-orange);
}

.stat-icon.info {
  background: rgba(59, 130, 246, 0.15);
  color: var(--accent-blue);
}

.stat-value {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Asignatura Cards */
.card-main {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 16px !important;
  transition: all 0.2s ease;
}

.card-main:hover {
  border-color: var(--primary) !important;
  transform: translateY(-4px);
  box-shadow: 0 8px 32px var(--shadow-color) !important;
}

/* Info boxes inside cards */
.card-main :deep(.rounded-borders) {
  background: var(--bg-tertiary) !important;
}

.card-main :deep(.text-primary) {
  color: var(--primary-light) !important;
}

.card-main :deep(.text-green-8) {
  color: var(--accent-green) !important;
}

.card-main :deep(.text-orange-8) {
  color: var(--accent-orange) !important;
}

/* Chips */
.card-main :deep(.q-chip) {
  background: var(--bg-tertiary) !important;
  color: var(--text-secondary) !important;
}

/* Progress bar */
.card-main :deep(.q-linear-progress) {
  background: var(--bg-tertiary) !important;
}

/* Animations */
.animate-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
