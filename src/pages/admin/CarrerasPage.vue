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
        <q-select v-model="sedeSeleccionada" :options="opcionesSedes" label="Filtrar por Sede" outlined dense
          style="width: 100%; max-width: 200px; min-width: 150px;" />
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
      <div 
        v-for="carrera in carrerasFiltradas" 
        :key="carrera.id" 
        class="carrera-card clickable"
        @click="navegarACarrera(carrera)"
      >
        <div class="carrera-header">
          <div class="carrera-icon"
            :style="{ background: getCarreraColor(carrera.id) + '20', color: getCarreraColor(carrera.id) }">
            <q-icon name="menu_book" size="24px" />
          </div>
          <q-chip :color="carrera.activo ? 'green-2' : 'grey-2'" :text-color="carrera.activo ? 'green-9' : 'grey-9'"
            size="sm">
            {{ carrera.activo ? 'Activa' : 'Inactiva' }}
          </q-chip>
        </div>
        <h3 class="carrera-nombre">{{ carrera.nombre }}</h3>
        <p class="carrera-codigo">{{ carrera.codigo }} • {{ getSedeName(carrera.sede_id) }}</p>
        
        <!-- Barra de Progreso de Documentación -->
        <div class="carrera-progreso">
          <div class="progreso-header">
            <span class="progreso-label">Documentación</span>
            <span class="progreso-value" :class="getProgresoClass(carrera.progreso_documentacion || 0)">
              {{ carrera.progreso_documentacion || 0 }}%
            </span>
          </div>
          <q-linear-progress
            :value="(carrera.progreso_documentacion || 0) / 100"
            :color="getProgresoColor(carrera.progreso_documentacion || 0)"
            rounded
            size="8px"
            class="progreso-bar"
          />
        </div>
        
        <div class="carrera-stats">
          <div class="carrera-stat">
            <q-icon name="menu_book" size="16px" />
            <span>{{ carrera.asignaturas_count || 0 }} asignaturas</span>
          </div>
          <div class="carrera-stat">
            <q-icon name="people" size="16px" />
            <span>{{ carrera.docentes_count || 0 }} docentes</span>
          </div>
        </div>
        
        <!-- Indicador de click -->
        <div class="carrera-action">
          <q-icon name="chevron_right" size="20px" color="grey-5" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'

const router = useRouter()
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()

onMounted(() => {
  sedesStore.fetchSedes()
  carrerasStore.fetchCarreras()
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
  { label: 'Total Asignaturas', value: carrerasFiltradas.value.reduce((s, c) => s + (c.asignaturas_count || 0), 0), icon: 'menu_book', color: 'orange' },
  { label: 'Docentes Asignados', value: carrerasFiltradas.value.reduce((s, c) => s + (c.docentes_count || 0), 0), icon: 'people', color: 'blue' }
])

const colores = ['#7C3AED', '#14B8A6', '#F97316', '#3B82F6', '#22C55E', '#EF4444', '#8B5CF6', '#EC4899']

function getCarreraColor(id) {
  return colores[id % colores.length]
}

function getSedeName(sedeId) {
  const sede = sedesStore.getSedeById(sedeId)
  return sede?.nombre || 'Sin sede'
}

// Navegación a la carrera seleccionada
function navegarACarrera(carrera) {
  router.push({
    path: '/director/reportes',
    query: {
      tab: 'materias',
      carrera: carrera.id,
      sede: carrera.sede_id
    }
  })
}

// Funciones de progreso
function getProgresoColor(progreso) {
  if (progreso >= 80) return 'green'
  if (progreso >= 50) return 'orange'
  if (progreso >= 30) return 'amber'
  return 'red'
}

function getProgresoClass(progreso) {
  if (progreso >= 80) return 'text-green'
  if (progreso >= 50) return 'text-orange'
  return 'text-red'
}
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(135deg, var(--secondary), var(--primary));
  -webkit-background-clip: text;
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

.stat-icon.purple {
  background: rgba(124, 58, 237, 0.15);
  color: var(--primary);
}

.stat-icon.green {
  background: rgba(34, 197, 94, 0.15);
  color: var(--accent-green);
}

.stat-icon.orange {
  background: rgba(249, 115, 22, 0.15);
  color: var(--accent-orange);
}

.stat-icon.blue {
  background: rgba(59, 130, 246, 0.15);
  color: var(--accent-blue);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.stat-value {
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: 700;
  margin: 4px 0 0 0;
}

.carreras-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1400px) {
  .carreras-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1000px) {
  .carreras-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .carreras-grid {
    grid-template-columns: 1fr;
  }
}

.carrera-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s ease;
}

.carrera-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.carrera-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.carrera-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carrera-nombre {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.carrera-codigo {
  color: var(--text-muted);
  font-size: 0.75rem;
  margin: 0 0 16px 0;
}

.carrera-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.carrera-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Clickable card styles */
.carrera-card.clickable {
  cursor: pointer;
  position: relative;
}

.carrera-card.clickable:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.carrera-action {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.carrera-card.clickable:hover .carrera-action {
  opacity: 1;
}

/* Progress bar styles */
.carrera-progreso {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 8px;
}

.progreso-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progreso-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.progreso-value {
  font-size: 0.875rem;
  font-weight: 600;
}

.progreso-value.text-green { color: var(--accent-green); }
.progreso-value.text-orange { color: var(--accent-orange); }
.progreso-value.text-red { color: #ef4444; }

.progreso-bar {
  background: rgba(0, 0, 0, 0.1);
}
</style>
