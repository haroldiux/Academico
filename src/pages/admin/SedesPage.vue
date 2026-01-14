<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="location_city" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Gestión de Sedes</span>
        </h4>
        <p class="q-ma-none q-mt-xs" style="color: var(--text-secondary);">
          Administra las sedes de UNITEPC a nivel nacional
        </p>
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

    <!-- Sedes Grid -->
    <div class="sedes-grid">
      <div v-for="sede in sedesStore.sedes" :key="sede.id" class="sede-card">
        <div class="sede-header">
          <div class="sede-avatar">{{ sede.codigo }}</div>
          <div class="sede-info">
            <h3 class="sede-nombre">{{ sede.nombre }}</h3>
            <span class="sede-codigo">Código: {{ sede.codigo }}</span>
          </div>
          <q-chip :color="sede.activo ? 'green' : 'grey'" text-color="white" size="sm">
            {{ sede.activo ? 'Activo' : 'Inactivo' }}
          </q-chip>
        </div>
        <div class="sede-stats">
          <div class="sede-stat">
            <span class="stat-num">{{ getCarrerasSede(sede.id) }}</span>
            <span class="stat-label">Carreras</span>
          </div>
          <div class="sede-stat">
            <span class="stat-num">{{ getDocentesSede(sede.id) }}</span>
            <span class="stat-label">Docentes</span>
          </div>
          <div class="sede-stat">
            <span class="stat-num">{{ getProgresoSede(sede.id) }}%</span>
            <span class="stat-label">Progreso</span>
          </div>
        </div>
        <q-linear-progress
          :value="getProgresoSede(sede.id) / 100"
          :color="getProgresoSede(sede.id) >= 70 ? 'green' : 'orange'"
          rounded size="6px"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'

const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()

onMounted(() => {
  sedesStore.fetchSedes()
  carrerasStore.fetchCarreras() // Para tener contadores reales si ya existen
})

const estadisticas = ref([
  { label: 'Total Sedes', value: 9, icon: 'location_city', color: 'purple' },
  { label: 'Sedes Activas', value: 9, icon: 'check_circle', color: 'green' },
  { label: 'Total Carreras', value: 72, icon: 'school', color: 'orange' },
  { label: 'Total Docentes', value: 890, icon: 'people', color: 'blue' }
])

function getCarrerasSede(sedeId) {
  return carrerasStore.getCarrerasBySede(sedeId).length
}

function getDocentesSede(sedeId) {
  const docentes = { 1: 180, 2: 150, 3: 165, 4: 95, 5: 110, 6: 70, 7: 80, 8: 55, 9: 45 }
  return docentes[sedeId] || 0
}

function getProgresoSede(sedeId) {
  const progresos = { 1: 78, 2: 72, 3: 68, 4: 82, 5: 75, 6: 65, 7: 70, 8: 58, 9: 52 }
  return progresos[sedeId] || 0
}
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
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

.stat-icon.purple { background: rgba(124, 58, 237, 0.15); color: var(--primary); }
.stat-icon.green { background: rgba(34, 197, 94, 0.15); color: var(--accent-green); }
.stat-icon.orange { background: rgba(249, 115, 22, 0.15); color: var(--accent-orange); }
.stat-icon.blue { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }

.stat-label { color: var(--text-secondary); font-size: 0.875rem; margin: 0; }
.stat-value { color: var(--text-primary); font-size: 1.75rem; font-weight: 700; margin: 4px 0 0 0; }

.sedes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 1200px) { .sedes-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .sedes-grid { grid-template-columns: 1fr; } }

.sede-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s ease;
}

.sede-card:hover { border-color: var(--primary); }

.sede-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.sede-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}
.sede-info { flex: 1; }
.sede-nombre { color: var(--text-primary); font-size: 1.125rem; font-weight: 600; margin: 0; }
.sede-codigo { color: var(--text-muted); font-size: 0.75rem; }

.sede-stats { display: flex; justify-content: space-around; margin-bottom: 16px; }
.sede-stat { text-align: center; }
.sede-stat .stat-num { display: block; font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
.sede-stat .stat-label { font-size: 0.75rem; color: var(--text-muted); }
</style>
