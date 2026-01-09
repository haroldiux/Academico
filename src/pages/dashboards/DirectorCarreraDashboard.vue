<template>
  <q-page class="dashboard-page">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-left">
        <p class="greeting">{{ greeting }}</p>
        <h1 class="page-title">Panel Director de Carrera</h1>
        <p class="welcome-text">
          <span class="highlight">{{ carreraActual?.nombre || 'Carrera' }}</span>
          <q-chip size="sm" color="secondary" text-color="white" class="q-ml-sm">
            {{ sedeActual?.nombre || 'Sede' }}
          </q-chip>
        </p>
      </div>
      <div class="header-right">
        <q-btn flat round icon="notifications" class="notification-btn">
          <q-badge color="red" floating rounded>{{ notificaciones }}</q-badge>
        </q-btn>
        <q-btn unelevated class="primary-btn" to="/documentacion">
          <q-icon name="visibility" size="18px" class="q-mr-xs" />
          Ver Asignaturas
        </q-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon purple">
          <q-icon name="menu_book" size="24px" />
        </div>
        <p class="stat-label">Total Asignaturas</p>
        <div class="stat-value-row">
          <span class="stat-value">{{ totalAsignaturas }}</span>
          <span class="stat-trend neutral">De la carrera</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <q-icon name="people" size="24px" />
        </div>
        <p class="stat-label">Docentes Activos</p>
        <div class="stat-value-row">
          <span class="stat-value">{{ docentesActivos }}</span>
          <span class="stat-trend positive">Asignados</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">
          <q-icon name="assignment" size="24px" />
        </div>
        <p class="stat-label">Documentación Pendiente</p>
        <div class="stat-value-row">
          <span class="stat-value">{{ documentacionPendiente }}</span>
          <span class="stat-trend" :class="documentacionPendiente > 5 ? 'negative' : 'neutral'">
            {{ documentacionPendiente > 5 ? 'Atención' : 'Normal' }}
          </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon blue">
          <q-icon name="trending_up" size="24px" />
        </div>
        <p class="stat-label">Progreso Carrera</p>
        <div class="stat-value-row">
          <span class="stat-value">{{ progresoCarrera }}%</span>
          <span class="stat-trend" :class="progresoCarrera >= 70 ? 'positive' : 'neutral'">
            {{ progresoCarrera >= 70 ? 'Excelente' : 'En progreso' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="content-grid">
      <!-- Asignaturas por Semestre -->
      <div class="main-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">
              <q-icon name="school" color="primary" class="q-mr-sm" />
              Asignaturas de la Carrera
            </h2>
            <p class="card-subtitle">Organizadas por semestre</p>
          </div>
          <q-btn flat class="view-all-btn" to="/documentacion" no-caps>
            Ver todas
            <q-icon name="chevron_right" size="18px" />
          </q-btn>
        </div>

        <!-- Semestres -->
        <div class="semestres-grid">
          <div v-for="sem in semestres" :key="sem.numero" class="semestre-card">
            <div class="semestre-header">
              <span class="semestre-numero">{{ sem.numero }}°</span>
              <span class="semestre-label">Semestre</span>
            </div>
            <div class="semestre-stats">
              <div class="semestre-stat">
                <span class="stat-num">{{ sem.asignaturas }}</span>
                <span class="stat-desc">Materias</span>
              </div>
              <div class="semestre-stat">
                <span class="stat-num" :class="sem.progreso >= 80 ? 'text-green' : 'text-orange'">{{ sem.progreso }}%</span>
                <span class="stat-desc">Progreso</span>
              </div>
            </div>
            <q-linear-progress 
              :value="sem.progreso / 100" 
              :color="sem.progreso >= 80 ? 'green' : sem.progreso >= 50 ? 'orange' : 'red'" 
              rounded 
              size="6px" 
              class="q-mt-sm"
            />
          </div>
        </div>
      </div>

      <!-- Resumen y Docentes -->
      <div class="side-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Docentes</h2>
            <p class="card-subtitle">Estado de documentación</p>
          </div>
        </div>

        <div class="docentes-list">
          <div v-for="docente in docentesCarrera.slice(0, 5)" :key="docente.id" class="docente-item">
            <q-avatar size="36px" color="primary" text-color="white">
              {{ docente.avatar }}
            </q-avatar>
            <div class="docente-info">
              <span class="docente-nombre">{{ docente.nombre }}</span>
              <span class="docente-materias">{{ docente.materias }} materias</span>
            </div>
            <q-circular-progress
              :value="docente.progreso"
              size="32px"
              :thickness="0.2"
              :color="docente.progreso >= 80 ? 'green' : docente.progreso >= 50 ? 'orange' : 'red'"
              track-color="grey-8"
            />
          </div>
        </div>

        <q-btn flat color="primary" class="full-width q-mt-md" no-caps>
          Ver todos los docentes
          <q-icon name="chevron_right" size="18px" class="q-ml-xs" />
        </q-btn>
      </div>
    </div>

    <!-- Acciones y Reportes -->
    <div class="quick-access-section">
      <h2 class="section-title">Acciones Rápidas</h2>
      <div class="quick-access-grid">
        <router-link to="/documentacion" class="quick-access-card">
          <div class="quick-icon purple">
            <q-icon name="menu_book" size="28px" />
          </div>
          <span class="quick-label">Ver Asignaturas</span>
        </router-link>

        <div class="quick-access-card" @click="generarReporte">
          <div class="quick-icon green">
            <q-icon name="assessment" size="28px" />
          </div>
          <span class="quick-label">Generar Reporte</span>
        </div>

        <router-link to="/docentes" class="quick-access-card">
          <div class="quick-icon orange">
            <q-icon name="people" size="28px" />
          </div>
          <span class="quick-label">Gestionar Docentes</span>
        </router-link>

        <div class="quick-access-card" @click="exportarPDFs">
          <div class="quick-icon blue">
            <q-icon name="picture_as_pdf" size="28px" />
          </div>
          <span class="quick-label">Exportar PDFs</span>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePermisos } from 'src/composables/usePermisos'

const { asignaturasFiltradas, sedeActual, carreraActual } = usePermisos()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
})

const totalAsignaturas = computed(() => asignaturasFiltradas.value.length)
const docentesActivos = ref(8)
const notificaciones = ref(5)
const documentacionPendiente = ref(12)
const progresoCarrera = ref(68)

const semestres = ref([
  { numero: 1, asignaturas: 6, progreso: 85 },
  { numero: 2, asignaturas: 6, progreso: 78 },
  { numero: 3, asignaturas: 5, progreso: 65 },
  { numero: 4, asignaturas: 5, progreso: 72 },
  { numero: 5, asignaturas: 5, progreso: 55 }
])

const docentesCarrera = ref([
  { id: 1, nombre: 'Ing. Pedro García', avatar: 'PG', materias: 3, progreso: 85 },
  { id: 2, nombre: 'Lic. Ana Torres', avatar: 'AT', materias: 2, progreso: 72 },
  { id: 3, nombre: 'Ing. Carlos Rojas', avatar: 'CR', materias: 4, progreso: 45 },
  { id: 4, nombre: 'Lic. María López', avatar: 'ML', materias: 2, progreso: 90 },
  { id: 5, nombre: 'Ing. Luis Vargas', avatar: 'LV', materias: 3, progreso: 60 }
])

function generarReporte() {
  console.log('Generando reporte de carrera...')
}

function exportarPDFs() {
  console.log('Exportando PDFs...')
}
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
  background: var(--bg-primary);
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.greeting {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0 0 4px 0;
}

.page-title {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.welcome-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.highlight {
  color: var(--primary);
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-btn {
  color: var(--text-secondary);
}

.primary-btn {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark)) !important;
  color: white !important;
  padding: 10px 20px;
  border-radius: 10px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

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
  margin-bottom: 16px;
}

.stat-icon.purple { background: rgba(124, 58, 237, 0.15); color: var(--primary-light); }
.stat-icon.green { background: rgba(34, 197, 94, 0.15); color: var(--accent-green); }
.stat-icon.orange { background: rgba(249, 115, 22, 0.15); color: var(--accent-orange); }
.stat-icon.blue { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0 0 8px 0;
}

.stat-value-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.stat-value {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-trend {
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-trend.positive { color: var(--accent-green); }
.stat-trend.negative { color: var(--accent-red); }
.stat-trend.neutral { color: var(--text-secondary); }

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

@media (max-width: 1024px) {
  .content-grid { grid-template-columns: 1fr; }
}

.main-card, .side-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.card-title {
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
}

.card-subtitle {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0;
}

.view-all-btn {
  color: var(--primary) !important;
}

/* Semestres Grid */
.semestres-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

@media (max-width: 1200px) {
  .semestres-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 600px) {
  .semestres-grid { grid-template-columns: repeat(2, 1fr); }
}

.semestre-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.semestre-header {
  margin-bottom: 12px;
}

.semestre-numero {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}

.semestre-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.semestre-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 8px;
}

.semestre-stat {
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-num.text-green { color: var(--accent-green); }
.stat-num.text-orange { color: var(--accent-orange); }

.stat-desc {
  font-size: 0.625rem;
  color: var(--text-muted);
}

/* Docentes List */
.docentes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.docente-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 10px;
}

.docente-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.docente-nombre {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.docente-materias {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Quick Access */
.quick-access-section {
  margin-top: 8px;
}

.section-title {
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 900px) {
  .quick-access-grid { grid-template-columns: repeat(2, 1fr); }
}

.quick-access-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}

.quick-access-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.quick-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.quick-icon.purple { background: rgba(124, 58, 237, 0.15); color: var(--primary-light); }
.quick-icon.green { background: rgba(34, 197, 94, 0.15); color: var(--accent-green); }
.quick-icon.orange { background: rgba(249, 115, 22, 0.15); color: var(--accent-orange); }
.quick-icon.blue { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }

.quick-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
