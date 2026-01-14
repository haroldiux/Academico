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

    <!-- Filters -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-select
          v-model="filtros.sede"
          :options="sedesOptions"
          label="Sede"
          outlined
          dense
          bg-color="white"
          emit-value
          map-options
          clearable
        >
            <template v-slot:prepend>
                <q-icon name="apartment" />
            </template>
        </q-select>
      </div>
      <div class="col-12 col-md-3">
         <q-select
          v-model="filtros.carrera"
          :options="carrerasOptions"
          label="Carrera"
          outlined
          dense
          bg-color="white"
          emit-value
          map-options
          clearable
          :disable="!filtros.sede"
        >
            <template v-slot:prepend>
                <q-icon name="school" />
            </template>
        </q-select>
      </div>
       <div class="col-12 col-md-6">
        <q-input
          v-model="filtros.search"
          label="Buscar materia (Nombre o Código)..."
          outlined
          dense
          bg-color="white"
          debounce="300"
          clearable
        >
            <template v-slot:prepend>
                <q-icon name="search" />
            </template>
        </q-input>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="stat-card animate-in" style="animation-delay: 0.1s">
          <div class="stat-icon primary q-mb-md">
            <q-icon name="menu_book" size="28px" />
          </div>
          <div class="stat-value">{{ asignaturasStore.totalAsignaturas }}</div>
          <div class="stat-label">Total Asignaturas</div>
        </div>
      </div>
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
    </div>

    <!-- Asignaturas Grid -->
    <div class="row q-col-gutter-lg">
      <div
        v-for="(asignatura, index) in asignaturasStore.asignaturas"
        :key="asignatura.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card
          class="card-main cursor-pointer animate-in"
          :style="{ animationDelay: `${0.3 + index * 0.05}s` }"
          @click="irADocumentacion(asignatura.id)"
        >
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
                  <q-chip size="sm" color="grey-3" text-color="grey-8" dense>
                    {{ asignatura.semestre }}° Semestre
                  </q-chip>
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

            <!-- Horas -->
            <div class="row q-gutter-sm q-mb-md">
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
              <q-linear-progress
                :value="calcularProgreso(asignatura) / 100"
                color="primary"
                rounded
                size="8px"
              />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions>
            <q-btn
              flat
              color="primary"
              icon="edit_document"
              label="Documentar"
              no-caps
              class="full-width"
              @click.stop="irADocumentacion(asignatura.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAsignaturasStore } from 'src/stores/asignaturas'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'

const router = useRouter()
const asignaturasStore = useAsignaturasStore()
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()

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
    carrerasStore.fetchCarreras(),
    fetchData()
  ])
})

async function fetchData() {
    // Si hay sede seleccionada, usamos el código de la sede (ej: 'CBA') si lo tuviera, o el ID
    // Ojo: El backend espera 'branch_code', que es string (ej 'CBA').
    // Si nuestro select de sedes devuelve ID, necesitamos buscar el código.
    // Asumiremos por ahora que el filtro Sede devuelve el objeto o el ID.
    // Vamos a buscar el código si es un ID.

    let branchCode = null
    if (filtros.value.sede) {
        const s = sedesStore.sedes.find(x => x.id === filtros.value.sede)
        branchCode = s ? s.codigo : null
    }

    let careerCode = null
    if (filtros.value.carrera) {
        const c = carrerasStore.carreras.find(x => x.id === filtros.value.carrera)
        careerCode = c ? c.codigo : null
    }

    await asignaturasStore.fetchAsignaturas(
        branchCode,
        careerCode,
        true,
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

// Computed
const totalUnidades = computed(() => {
  return asignaturasStore.asignaturas.reduce((sum, a) => sum + (a.unidades?.length || 0), 0)
})

const totalTemas = computed(() => {
  return asignaturasStore.asignaturas.reduce((sum, a) => {
    return sum + (a.unidades?.reduce((s, u) => s + (u.temas?.length || 0), 0) || 0)
  }, 0)
})

const totalBibliografias = computed(() => {
  return asignaturasStore.asignaturas.reduce((sum, a) => sum + (a.bibliografias?.length || 0), 0)
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

function irADocumentacion(id) {
  router.push(`/documentacion/${id}`)
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

.stat-icon.primary { background: rgba(124, 58, 237, 0.15); color: var(--primary-light); }
.stat-icon.success { background: rgba(34, 197, 94, 0.15); color: var(--accent-green); }
.stat-icon.warning { background: rgba(249, 115, 22, 0.15); color: var(--accent-orange); }
.stat-icon.info { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }

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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
