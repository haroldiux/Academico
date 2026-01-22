<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="map" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Mapa de Sedes</span>
        </h4>
        <p class="q-ma-none q-mt-xs" style="color: var(--text-secondary);">
          Visualización geográfica del progreso por departamento
        </p>
      </div>
      <div class="col-auto">
        <q-btn-toggle
          v-model="viewMode"
          toggle-color="primary"
          :options="[
            { label: 'Mapa', value: 'map', icon: 'map' },
            { label: 'Lista', value: 'list', icon: 'list' }
          ]"
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

    <!-- Tabs de Tipo de Reporte -->
    <div class="row q-mb-lg">
      <div class="col-12">
        <q-tabs
          v-model="selectedReportType"
          dense
          class="text-grey-7 bg-white rounded-borders shadow-1"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="doc" icon="description" label="Documentación" />
          <q-tab name="seg" icon="analytics" label="Seguimiento Docente" />
          <q-tab name="ast" icon="how_to_reg" label="Asistencia Estudiantes" />
        </q-tabs>
      </div>
    </div>

    <!-- Vista Mapa -->
    <div v-if="viewMode === 'map'" class="map-section">
      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-7">
          <q-card flat bordered class="map-card">
            <q-card-section>
              <BoliviaMapSVG 
                :sedes-data="sedesPorDepartamento" 
                :title="getReportLabel(selectedReportType)"
                @select-department="onSelectDepartment"
                @select-sede="onSelectSede"
              />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-5">
          <q-card flat bordered class="h-full">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">
                <q-icon name="list" class="q-mr-sm" />
                Resumen por Departamento
              </div>
              <q-list separator>
                <q-item v-for="(sedes, deptId) in deptsConSedes" :key="deptId" 
                        clickable @click="handleDeptClick(deptId, sedes)">
                  <q-item-section avatar>
                    <q-avatar :color="getAvatarColor(getAvgProgress(sedes))" text-color="white" size="40px">
                      {{ getDeptAbbr(deptId) }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ getDeptName(deptId) }}</q-item-label>
                    <q-item-label caption>{{ sedes.length }} sede(s)</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-chip :color="getAvatarColor(getAvgProgress(sedes))" text-color="white" dense size="sm">
                      {{ getAvgProgress(sedes) }}%
                    </q-chip>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Vista Lista (Grid original) -->
    <div v-else class="sedes-grid">
      <div v-for="sede in sedesStore.sedes" :key="sede.id" class="sede-card" @click="irASede(sede)">
        <div class="sede-header">
          <div class="sede-avatar">{{ sede.codigo }}</div>
          <div class="sede-info">
            <h3 class="sede-nombre">{{ sede.nombre }}</h3>
            <span class="sede-codigo">Código: {{ sede.codigo }}</span>
          </div>
          <q-chip :color="sede.activo ? 'green-2' : 'grey-2'" :text-color="sede.activo ? 'green-9' : 'grey-9'" size="sm">
            {{ sede.activo ? 'Activo' : 'Inactivo' }}
          </q-chip>
        </div>
        <div class="sede-stats">
          <div class="sede-stat">
            <span class="stat-num">{{ sede.carreras_count || 0 }}</span>
            <span class="stat-label">Carreras</span>
          </div>
          <div class="sede-stat">
            <span class="stat-num">{{ sede.docentes_count || 0 }}</span>
            <span class="stat-label">Docentes</span>
          </div>
          <div class="sede-stat">
            <span class="stat-num">{{ getProgresoSede(sede.id) }}%</span>
            <span class="stat-label">Progreso</span>
          </div>
        </div>
        <q-linear-progress :value="getProgresoSede(sede.id) / 100"
          :color="getProgresoSede(sede.id) >= 70 ? 'green' : 'orange'" rounded size="6px" />
      </div>
    </div>

    <!-- Modal para seleccionar sede cuando hay múltiples -->
    <q-dialog v-model="showSedeSelector">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="apartment" class="q-mr-sm" />
            {{ selectedDepartment?.name }}
          </div>
          <div class="text-caption">Seleccione una sede para ver reportes</div>
        </q-card-section>

        <q-tabs v-model="selectedSedeTab" class="text-grey" active-color="primary" indicator-color="primary">
          <q-tab v-for="sede in selectedDepartment?.sedes" :key="sede.id" :name="sede.id" :label="sede.nombre" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="selectedSedeTab" animated>
          <q-tab-panel v-for="sede in selectedDepartment?.sedes" :key="sede.id" :name="sede.id">
            <div class="text-center q-pa-md">
              <q-avatar size="80px" :color="getAvatarColor(sede.progreso)" text-color="white" class="q-mb-md">
                {{ sede.codigo }}
              </q-avatar>
              <div class="text-h6">{{ sede.nombre }}</div>
              <div class="text-caption text-grey q-mb-md">{{ sede.carreras || 0 }} carreras • {{ sede.docentes || 0 }} docentes</div>
              <q-linear-progress :value="sede.progreso / 100" :color="getAvatarColor(sede.progreso)" rounded size="10px" class="q-mb-md" />
              <div class="text-h4 text-weight-bold" :class="'text-' + getAvatarColor(sede.progreso)">{{ sede.progreso }}%</div>
            </div>
          </q-tab-panel>
        </q-tab-panels>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Ver Reportes" @click="navigateToSelectedSede" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'
import BoliviaMapSVG from 'src/components/BoliviaMapSVG.vue'

const router = useRouter()
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()

const viewMode = ref('map')
const showSedeSelector = ref(false)
const selectedDepartment = ref(null)
const selectedSedeTab = ref(null)
const selectedReportType = ref('doc')

// Mapeo de departamentos
const departmentNames = {
  pando: 'Pando',
  beni: 'Beni',
  la_paz: 'La Paz',
  cochabamba: 'Cochabamba',
  oruro: 'Oruro',
  potosi: 'Potosí',
  santa_cruz: 'Santa Cruz',
  chuquisaca: 'Chuquisaca',
  tarija: 'Tarija'
}

const departmentAbbrs = {
  pando: 'PND', beni: 'BNI', la_paz: 'LPZ', cochabamba: 'CBB',
  oruro: 'ORU', potosi: 'PTS', santa_cruz: 'SCZ', chuquisaca: 'SUC', tarija: 'TJA'
}

// Mock: Mapeo de sedes por departamento
const sedesPorDepartamento = computed(() => {
  const mapping = {
    pando: [],
    beni: [],
    la_paz: [],
    cochabamba: [],
    oruro: [],
    potosi: [],
    santa_cruz: [],
    chuquisaca: [],
    tarija: []
  }
  
  // Mapear sedes del store a departamentos
  sedesStore.sedes.forEach(sede => {
    const deptId = getDepartmentForSede(sede.nombre)
    if (deptId && mapping[deptId]) {
      mapping[deptId].push({
        ...sede,
        progreso: getProgresoSede(sede.id, selectedReportType.value)
      })
    }
  })
  
  return mapping
})

const deptsConSedes = computed(() => {
  const result = {}
  Object.entries(sedesPorDepartamento.value).forEach(([id, sedes]) => {
    if (sedes.length > 0) {
      result[id] = sedes
    }
  })
  return result
})

function getDepartmentForSede(sedeName) {
  const name = sedeName.toLowerCase()
  if (name.includes('cochabamba') || name.includes('cercado') || name.includes('ivirga')) return 'cochabamba'
  if (name.includes('la paz') || name.includes('el alto')) return 'la_paz'
  if (name.includes('santa cruz')) return 'santa_cruz'
  if (name.includes('oruro')) return 'oruro'
  if (name.includes('potosí') || name.includes('potosi')) return 'potosi'
  if (name.includes('sucre') || name.includes('chuquisaca')) return 'chuquisaca'
  if (name.includes('tarija')) return 'tarija'
  if (name.includes('trinidad') || name.includes('beni')) return 'beni'
  if (name.includes('cobija') || name.includes('pando')) return 'pando'
  if (name.includes('guaya')) return 'beni'
  if (name.includes('puerto') || name.includes('quija')) return 'santa_cruz'
  return null
}

onMounted(() => {
  sedesStore.fetchSedes()
  carrerasStore.fetchCarreras()
})

const estadisticas = computed(() => [
  { label: 'Total Sedes', value: sedesStore.stats.total_sedes, icon: 'location_city', color: 'purple' },
  { label: 'Sedes Activas', value: sedesStore.stats.sedes_activas, icon: 'check_circle', color: 'green' },
  { label: 'Total Carreras', value: sedesStore.stats.total_carreras, icon: 'school', color: 'orange' },
  { label: 'Total Docentes', value: sedesStore.stats.total_docentes, icon: 'people', color: 'blue' }
])

function getProgresoSede(sedeId, type = 'doc') {
  // Generar variaciones según el tipo para demostración
  const variations = {
    'doc': { 1: 78, 2: 72, 3: 68, 4: 82, 5: 75, 6: 65, 7: 70, 8: 58, 9: 52, 10: 82, 11: 75, 12: 65 },
    'seg': { 1: 65, 2: 80, 3: 55, 4: 70, 5: 92, 6: 85, 7: 60, 8: 45, 9: 78, 10: 65, 11: 88, 12: 72 },
    'ast': { 1: 90, 2: 85, 3: 88, 4: 95, 5: 82, 6: 78, 7: 85, 8: 72, 9: 80, 10: 92, 11: 85, 12: 90 }
  }
  
  const dataset = variations[type] || variations['doc']
  return dataset[sedeId] || 70
}

function getReportLabel(type) {
  const labels = {
    'doc': 'Progreso en Documentación',
    'seg': 'Seguimiento Docente',
    'ast': 'Asistencia de Estudiantes'
  }
  return labels[type] || ''
}

function getAvgProgress(sedes) {
  if (!sedes || sedes.length === 0) return 0
  const total = sedes.reduce((sum, s) => sum + (s.progreso || 0), 0)
  return Math.round(total / sedes.length)
}

function getAvatarColor(progress) {
  if (progress >= 80) return 'positive'
  if (progress >= 60) return 'warning'
  return 'negative'
}

function getDeptName(deptId) { return departmentNames[deptId] || deptId }
function getDeptAbbr(deptId) { return departmentAbbrs[deptId] || '?' }

function handleDeptClick(deptId, sedes) {
  if (sedes.length === 1) {
    irASede(sedes[0])
  } else if (sedes.length > 1) {
    selectedDepartment.value = { id: deptId, name: getDeptName(deptId), sedes }
    selectedSedeTab.value = sedes[0].id
    showSedeSelector.value = true
  }
}

function onSelectDepartment(dept) {
  selectedDepartment.value = dept
  selectedSedeTab.value = dept.sedes[0]?.id
  showSedeSelector.value = true
}

function onSelectSede(sede) {
  irASede(sede)
}

function navigateToSelectedSede() {
  const sede = selectedDepartment.value?.sedes.find(s => s.id === selectedSedeTab.value)
  if (sede) {
    showSedeSelector.value = false
    irASede(sede)
  }
}

function irASede(sede) {
  router.push({ 
    path: '/vicerrector/reportes', 
    query: { sedeId: sede.id, sedeName: sede.nombre } 
  })
}
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
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

.sedes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 1200px) {
  .sedes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .sedes-grid {
    grid-template-columns: 1fr;
  }
}

.sede-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.sede-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.sede-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

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

.sede-info {
  flex: 1;
}

.sede-nombre {
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.sede-codigo {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.sede-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
}

.sede-stat {
  text-align: center;
}

.sede-stat .stat-num {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.sede-stat .stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
