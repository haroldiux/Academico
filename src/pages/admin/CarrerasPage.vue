<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="school" size="36px" color="secondary" class="q-mr-sm" />
          <span class="text-gradient">Gestión de Carreras</span>
        </h4>
        <p class="q-ma-none q-mt-xs" style="color: var(--text-secondary);">
          Administra las carreras por sede
        </p>
      </div>
      <div class="col-auto">
        <q-select
          v-if="authStore.rol === 'SUPER_ADMIN' || authStore.rol === 'ADMIN' || authStore.rol === 'VICERRECTOR_NACIONAL'"
          v-model="sedeSeleccionada"
          :options="opcionesSedes"
          label="Filtrar por Sede"
          outlined
          dense
          style="min-width: 200px;"
        />
      </div>
    </div>

    <!-- Stats -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="stat in estadisticas" :key="stat.label" class="col-12 col-md-3">
        <div class="stat-card">
          <div class="stat-icon" :class="stat.color">
            <q-icon :name="stat.icon" size="24px" />
          </div>
          <p class="stat-label">{{ stat.label }}</p>
          <p class="stat-value">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Carreras Grid -->
    <div class="carreras-grid">
      <div v-for="carrera in carrerasFiltradas" :key="carrera.id" class="carrera-card">
        <div class="carrera-header">
          <div class="carrera-icon" :style="{ background: getCarreraColor(carrera.id) + '20', color: getCarreraColor(carrera.id) }">
            <q-icon name="menu_book" size="24px" />
          </div>
          <q-chip :color="carrera.activo ? 'green' : 'grey'" text-color="white" size="sm">
            {{ carrera.activo ? 'Activa' : 'Inactiva' }}
          </q-chip>
        </div>
        <h3 class="carrera-nombre">{{ carrera.nombre }}</h3>
        <p class="carrera-codigo">{{ carrera.codigo }} • {{ getSedeName(carrera.sede_id) }}</p>
        <div class="carrera-stats">
          <div class="carrera-stat">
            <q-icon name="menu_book" size="16px" />
            <span>{{ getAsignaturasCarrera(carrera.id) }} asignaturas</span>
          </div>
          <div class="carrera-stat">
            <q-icon name="people" size="16px" />
            <span>{{ getDocentesCarrera(carrera.id) }} docentes</span>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'
import { useAuthStore } from 'src/stores/auth'

const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()
const authStore = useAuthStore()

onMounted(() => {
  sedesStore.fetchSedes()
  carrerasStore.fetchCarreras()
  
  // Si es Director Académico o Vicerrector, filtrar por su sede automáticamente
  if (['DIRECCION_ACADEMICA', 'VICERRECTOR_SEDE'].includes(authStore.rol)) {
    // Mock: Asumimos sede ID 1 (Cochabamba) si no está en store
    const sedeId = authStore.sedeId || 1 
    sedeSeleccionada.value = { value: sedeId }
  }
})

const sedeSeleccionada = ref(null)

const opcionesSedes = computed(() => [
  { label: 'Todas las sedes', value: null },
  ...sedesStore.sedes.map(s => ({ label: s.nombre, value: s.id }))
])

const carrerasFiltradas = computed(() => {
  if (!sedeSeleccionada.value?.value) {
    return carrerasStore.carreras
  }
  return carrerasStore.getCarrerasBySede(sedeSeleccionada.value.value)
})

const estadisticas = computed(() => [
  { label: 'Total Carreras', value: carrerasFiltradas.value.length, icon: 'school', color: 'purple' },
  { label: 'Carreras Activas', value: carrerasFiltradas.value.filter(c => c.activo).length, icon: 'check_circle', color: 'green' },
  { label: 'Total Asignaturas', value: carrerasFiltradas.value.length * 45, icon: 'menu_book', color: 'orange' },
  { label: 'Docentes Asignados', value: carrerasFiltradas.value.length * 12, icon: 'people', color: 'blue' }
])

const colores = ['#7C3AED', '#14B8A6', '#F97316', '#3B82F6', '#22C55E', '#EF4444', '#8B5CF6', '#EC4899']

function getCarreraColor(id) {
  return colores[id % colores.length]
}

function getSedeName(sedeId) {
  const sede = sedesStore.getSedeById(sedeId)
  return sede?.nombre || 'Sin sede'
}

function getAsignaturasCarrera() {
  return Math.floor(Math.random() * 20) + 35
}

function getDocentesCarrera() {
  return Math.floor(Math.random() * 10) + 8
}
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(135deg, var(--secondary), var(--primary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.stat-icon.purple { background: rgba(124, 58, 237, 0.15); color: var(--primary); }
.stat-icon.green { background: rgba(34, 197, 94, 0.15); color: var(--accent-green); }
.stat-icon.orange { background: rgba(249, 115, 22, 0.15); color: var(--accent-orange); }
.stat-icon.blue { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }

.stat-label { color: var(--text-secondary); font-size: 0.875rem; margin: 0; }
.stat-value { color: var(--text-primary); font-size: 1.75rem; font-weight: 700; margin: 4px 0 0 0; }

.carreras-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1400px) { .carreras-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 1000px) { .carreras-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .carreras-grid { grid-template-columns: 1fr; } }

.carrera-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s ease;
}

.carrera-card:hover { border-color: var(--primary); transform: translateY(-2px); }

.carrera-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.carrera-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.carrera-nombre { color: var(--text-primary); font-size: 1rem; font-weight: 600; margin: 0 0 4px 0; }
.carrera-codigo { color: var(--text-muted); font-size: 0.75rem; margin: 0 0 16px 0; }
.carrera-stats { display: flex; flex-direction: column; gap: 8px; }
.carrera-stat { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.875rem; }
</style>
