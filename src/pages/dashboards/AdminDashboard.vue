<template>
  <q-page class="dashboard-page">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-left">
        <p class="greeting">{{ greeting }}</p>
        <h1 class="page-title">Panel Administrativo</h1>
        <p class="welcome-text">
          <span class="highlight">Directorio UNITEPC</span>
          <q-chip size="sm" color="deep-purple" text-color="white" class="q-ml-sm">
            <q-icon name="admin_panel_settings" size="14px" class="q-mr-xs" />
            Admin
          </q-chip>
        </p>
      </div>
      <div class="header-right">
        <q-btn flat round icon="notifications" class="notification-btn">
          <q-badge color="red" floating rounded>{{ notificaciones }}</q-badge>
        </q-btn>
        <q-btn flat round icon="settings" class="notification-btn" />
      </div>
    </div>

    <!-- Estadísticas Especiales -->
    <div class="special-stats-grid">
      <div class="special-stat-card gradient-purple">
        <div class="stat-header">
          <q-icon name="public" size="28px" />
          <span class="stat-badge">Nacional</span>
        </div>
        <div class="stat-content">
          <span class="stat-big-value">{{ totalSedes }}</span>
          <span class="stat-title">Sedes Activas</span>
        </div>
        <div class="stat-footer">
          <span class="trend positive">↑ 2 nuevas este año</span>
        </div>
      </div>

      <div class="special-stat-card gradient-green">
        <div class="stat-header">
          <q-icon name="school" size="28px" />
          <span class="stat-badge">Académico</span>
        </div>
        <div class="stat-content">
          <span class="stat-big-value">{{ totalCarreras }}</span>
          <span class="stat-title">Carreras</span>
        </div>
        <div class="stat-footer">
          <span class="trend positive">En todas las sedes</span>
        </div>
      </div>

      <div class="special-stat-card gradient-orange">
        <div class="stat-header">
          <q-icon name="menu_book" size="28px" />
          <span class="stat-badge">Documentación</span>
        </div>
        <div class="stat-content">
          <span class="stat-big-value">{{ totalAsignaturas }}</span>
          <span class="stat-title">Asignaturas</span>
        </div>
        <div class="stat-footer">
          <span class="trend neutral">{{ progresoGlobal }}% documentadas</span>
        </div>
      </div>

      <div class="special-stat-card gradient-blue">
        <div class="stat-header">
          <q-icon name="people" size="28px" />
          <span class="stat-badge">Usuarios</span>
        </div>
        <div class="stat-content">
          <span class="stat-big-value">{{ totalUsuarios }}</span>
          <span class="stat-title">Usuarios Activos</span>
        </div>
        <div class="stat-footer">
          <span class="trend positive">↑ +15% este mes</span>
        </div>
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="admin-grid">
      <!-- Panel Principal: Estadísticas por Sede -->
      <div class="admin-card full-width">
        <div class="card-header">
          <div>
            <h2 class="card-title">
              <q-icon name="analytics" color="primary" class="q-mr-sm" />
              Estadísticas por Sede
            </h2>
            <p class="card-subtitle">Comparativo de progreso nacional</p>
          </div>
          <div class="header-actions">
            <q-btn-toggle
              v-model="vistaEstadisticas"
              :options="[
                { value: 'progreso', label: 'Progreso' },
                { value: 'asignaturas', label: 'Asignaturas' },
                { value: 'docentes', label: 'Docentes' }
              ]"
              toggle-color="primary"
              size="sm"
              no-caps
              rounded
            />
          </div>
        </div>

        <div class="sedes-comparison">
          <div v-for="sede in estadisticasSedes" :key="sede.id" class="sede-bar-item">
            <div class="sede-bar-info">
              <span class="sede-name">{{ sede.nombre }}</span>
              <span class="sede-value">
                {{ vistaEstadisticas === 'progreso' ? sede.progreso + '%' : 
                   vistaEstadisticas === 'asignaturas' ? sede.asignaturas : sede.docentes }}
              </span>
            </div>
            <div class="sede-bar-container">
              <div 
                class="sede-bar" 
                :style="{ width: getBarWidth(sede) + '%', background: sede.color }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel: Usuarios por Rol -->
      <div class="admin-card">
        <div class="card-header">
          <h2 class="card-title">
            <q-icon name="badge" color="purple" class="q-mr-sm" />
            Usuarios por Rol
          </h2>
        </div>
        <div class="roles-chart">
          <div v-for="rol in usuariosPorRol" :key="rol.nombre" class="rol-item">
            <div class="rol-icon" :style="{ background: rol.color + '20', color: rol.color }">
              <q-icon :name="rol.icono" size="20px" />
            </div>
            <div class="rol-info">
              <span class="rol-nombre">{{ rol.nombre }}</span>
              <span class="rol-cantidad">{{ rol.cantidad }} usuarios</span>
            </div>
            <div class="rol-percent">{{ rol.porcentaje }}%</div>
          </div>
        </div>
      </div>

      <!-- Panel: Actividad Reciente -->
      <div class="admin-card">
        <div class="card-header">
          <h2 class="card-title">
            <q-icon name="history" color="orange" class="q-mr-sm" />
            Actividad Reciente
          </h2>
        </div>
        <div class="activity-timeline">
          <div v-for="act in actividadReciente" :key="act.id" class="activity-item">
            <div class="activity-dot" :class="'dot-' + act.tipo"></div>
            <div class="activity-content">
              <span class="activity-text">{{ act.texto }}</span>
              <span class="activity-time">{{ act.tiempo }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel: Métricas Clave -->
      <div class="admin-card">
        <div class="card-header">
          <h2 class="card-title">
            <q-icon name="speed" color="green" class="q-mr-sm" />
            Métricas Clave
          </h2>
        </div>
        <div class="metrics-grid">
          <div class="metric-item">
            <q-circular-progress
              :value="tasaCompletitud"
              size="80px"
              :thickness="0.15"
              color="green"
              track-color="grey-8"
            />
            <div class="metric-info">
              <span class="metric-value">{{ tasaCompletitud }}%</span>
              <span class="metric-label">Tasa Completitud</span>
            </div>
          </div>
          <div class="metric-item">
            <q-circular-progress
              :value="tasaCumplimiento"
              size="80px"
              :thickness="0.15"
              color="orange"
              track-color="grey-8"
            />
            <div class="metric-info">
              <span class="metric-value">{{ tasaCumplimiento }}%</span>
              <span class="metric-label">Cumplimiento Plazos</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones Administrativas -->
    <div class="admin-actions-section">
      <h2 class="section-title">Gestión del Sistema</h2>
      <div class="admin-actions-grid">
        <router-link to="/admin/usuarios" class="admin-action-card">
          <div class="action-icon purple">
            <q-icon name="people" size="32px" />
          </div>
          <div class="action-info">
            <span class="action-title">Gestión de Usuarios</span>
            <span class="action-desc">Crear, editar y asignar roles</span>
          </div>
          <q-icon name="chevron_right" size="24px" color="grey-6" />
        </router-link>

        <router-link to="/admin/roles" class="admin-action-card">
          <div class="action-icon green">
            <q-icon name="admin_panel_settings" size="32px" />
          </div>
          <div class="action-info">
            <span class="action-title">Roles y Permisos</span>
            <span class="action-desc">Configurar accesos del sistema</span>
          </div>
          <q-icon name="chevron_right" size="24px" color="grey-6" />
        </router-link>

        <router-link to="/admin/sedes" class="admin-action-card">
          <div class="action-icon orange">
            <q-icon name="location_city" size="32px" />
          </div>
          <div class="action-info">
            <span class="action-title">Gestión de Sedes</span>
            <span class="action-desc">Administrar sedes nacionales</span>
          </div>
          <q-icon name="chevron_right" size="24px" color="grey-6" />
        </router-link>

        <router-link to="/admin/carreras" class="admin-action-card">
          <div class="action-icon blue">
            <q-icon name="school" size="32px" />
          </div>
          <div class="action-info">
            <span class="action-title">Carreras</span>
            <span class="action-desc">Gestionar carreras por sede</span>
          </div>
          <q-icon name="chevron_right" size="24px" color="grey-6" />
        </router-link>

        <div class="admin-action-card" @click="generarReporteGlobal">
          <div class="action-icon cyan">
            <q-icon name="assessment" size="32px" />
          </div>
          <div class="action-info">
            <span class="action-title">Reportes Globales</span>
            <span class="action-desc">Estadísticas completas del sistema</span>
          </div>
          <q-icon name="chevron_right" size="24px" color="grey-6" />
        </div>

        <router-link to="/admin/configuracion" class="admin-action-card">
          <div class="action-icon red">
            <q-icon name="settings" size="32px" />
          </div>
          <div class="action-info">
            <span class="action-title">Configuración</span>
            <span class="action-desc">Parámetros del sistema</span>
          </div>
          <q-icon name="chevron_right" size="24px" color="grey-6" />
        </router-link>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePermisos } from 'src/composables/usePermisos'

const { sedesFiltradas, carrerasFiltradas, asignaturasFiltradas } = usePermisos()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
})

const notificaciones = ref(18)
const totalSedes = computed(() => sedesFiltradas.value.length || 9)
const totalCarreras = computed(() => carrerasFiltradas.value.length || 72)
const totalAsignaturas = computed(() => asignaturasFiltradas.value.length || 2850)
const totalUsuarios = ref(1245)
const progresoGlobal = ref(71)
const tasaCompletitud = ref(78)
const tasaCumplimiento = ref(65)

const vistaEstadisticas = ref('progreso')

const estadisticasSedes = ref([
  { id: 1, nombre: 'Cochabamba', progreso: 78, asignaturas: 420, docentes: 180, color: '#7C3AED' },
  { id: 2, nombre: 'La Paz', progreso: 72, asignaturas: 380, docentes: 150, color: '#14B8A6' },
  { id: 3, nombre: 'Santa Cruz', progreso: 68, asignaturas: 360, docentes: 165, color: '#F97316' },
  { id: 4, nombre: 'Oruro', progreso: 82, asignaturas: 220, docentes: 95, color: '#3B82F6' },
  { id: 5, nombre: 'Sucre', progreso: 75, asignaturas: 280, docentes: 110, color: '#22C55E' },
  { id: 6, nombre: 'Potosí', progreso: 65, asignaturas: 180, docentes: 70, color: '#EF4444' },
  { id: 7, nombre: 'Tarija', progreso: 70, asignaturas: 200, docentes: 80, color: '#8B5CF6' },
  { id: 8, nombre: 'Trinidad', progreso: 58, asignaturas: 150, docentes: 55, color: '#EC4899' },
  { id: 9, nombre: 'Cobija', progreso: 52, asignaturas: 120, docentes: 45, color: '#06B6D4' }
])

const usuariosPorRol = ref([
  { nombre: 'Docentes', cantidad: 890, porcentaje: 72, icono: 'person', color: '#7C3AED' },
  { nombre: 'Dir. Carrera', cantidad: 72, porcentaje: 6, icono: 'supervisor_account', color: '#14B8A6' },
  { nombre: 'Dir. Académica', cantidad: 18, porcentaje: 1.5, icono: 'business', color: '#F97316' },
  { nombre: 'Vicerrectores', cantidad: 12, porcentaje: 1, icono: 'stars', color: '#3B82F6' },
  { nombre: 'Administradores', cantidad: 8, porcentaje: 0.5, icono: 'admin_panel_settings', color: '#EF4444' }
])

const actividadReciente = ref([
  { id: 1, tipo: 'success', texto: 'Usuario creado: Ing. Juan Pérez', tiempo: 'Hace 5 min' },
  { id: 2, tipo: 'info', texto: 'Rol actualizado: Director Carrera', tiempo: 'Hace 15 min' },
  { id: 3, tipo: 'warning', texto: 'Sede Cobija: 10 asignaturas pendientes', tiempo: 'Hace 1 hora' },
  { id: 4, tipo: 'success', texto: 'Reporte generado: Estadísticas Q4', tiempo: 'Hace 2 horas' },
  { id: 5, tipo: 'info', texto: 'Backup completado exitosamente', tiempo: 'Hace 3 horas' }
])

function getBarWidth(sede) {
  const maxValues = {
    progreso: 100,
    asignaturas: 500,
    docentes: 200
  }
  const value = vistaEstadisticas.value === 'progreso' ? sede.progreso :
                vistaEstadisticas.value === 'asignaturas' ? sede.asignaturas : sede.docentes
  return (value / maxValues[vistaEstadisticas.value]) * 100
}

function generarReporteGlobal() {
  console.log('Generando reporte global...')
}
</script>

<style scoped>
.dashboard-page { padding: 24px; background: var(--bg-primary); min-height: 100vh; }
.dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
.greeting { color: var(--text-muted); font-size: 0.875rem; margin: 0 0 4px 0; }
.page-title { color: var(--text-primary); font-size: 2rem; font-weight: 700; margin: 0 0 8px 0; }
.welcome-text { color: var(--text-secondary); font-size: 0.875rem; margin: 0; }
.highlight { color: var(--primary); font-weight: 600; }
.header-right { display: flex; align-items: center; gap: 8px; }
.notification-btn { color: var(--text-secondary); }

/* Special Stats Grid */
.special-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
@media (max-width: 1200px) { .special-stats-grid { grid-template-columns: repeat(2, 1fr); } }

.special-stat-card { border-radius: 16px; padding: 20px; color: white; position: relative; overflow: hidden; }
.special-stat-card::before { content: ''; position: absolute; top: -50%; right: -50%; width: 100%; height: 100%; background: rgba(255,255,255,0.1); border-radius: 50%; }
.gradient-purple { background: linear-gradient(135deg, #7C3AED, #5B21B6); }
.gradient-green { background: linear-gradient(135deg, #22C55E, #16A34A); }
.gradient-orange { background: linear-gradient(135deg, #F97316, #EA580C); }
.gradient-blue { background: linear-gradient(135deg, #3B82F6, #2563EB); }

.stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.stat-badge { font-size: 0.625rem; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 10px; }
.stat-content { margin-bottom: 12px; }
.stat-big-value { display: block; font-size: 2.5rem; font-weight: 700; line-height: 1; }
.stat-title { display: block; font-size: 0.875rem; opacity: 0.9; margin-top: 4px; }
.stat-footer .trend { font-size: 0.75rem; opacity: 0.8; }
.stat-footer .trend.positive { color: #D1FAE5; }
.stat-footer .trend.neutral { color: rgba(255,255,255,0.7); }

/* Admin Grid */
.admin-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 32px; }
.admin-card.full-width { grid-column: span 2; }
@media (max-width: 1024px) { .admin-grid { grid-template-columns: 1fr; } .admin-card.full-width { grid-column: span 1; } }

.admin-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.card-title { color: var(--text-primary); font-size: 1rem; font-weight: 600; margin: 0; display: flex; align-items: center; }
.card-subtitle { color: var(--text-muted); font-size: 0.875rem; margin: 4px 0 0 0; }

/* Sedes Comparison */
.sedes-comparison { display: flex; flex-direction: column; gap: 12px; }
.sede-bar-item { display: flex; flex-direction: column; gap: 6px; }
.sede-bar-info { display: flex; justify-content: space-between; }
.sede-name { font-size: 0.875rem; color: var(--text-primary); }
.sede-value { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
.sede-bar-container { height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden; }
.sede-bar { height: 100%; border-radius: 4px; transition: width 0.5s ease; }

/* Roles Chart */
.roles-chart { display: flex; flex-direction: column; gap: 12px; }
.rol-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--bg-tertiary); border-radius: 10px; }
.rol-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.rol-info { flex: 1; }
.rol-nombre { display: block; font-size: 0.875rem; font-weight: 500; color: var(--text-primary); }
.rol-cantidad { font-size: 0.75rem; color: var(--text-muted); }
.rol-percent { font-weight: 700; color: var(--text-secondary); font-size: 0.875rem; }

/* Activity Timeline */
.activity-timeline { display: flex; flex-direction: column; gap: 12px; }
.activity-item { display: flex; align-items: flex-start; gap: 12px; }
.activity-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.activity-dot.dot-success { background: var(--accent-green); }
.activity-dot.dot-info { background: var(--accent-blue); }
.activity-dot.dot-warning { background: var(--accent-orange); }
.activity-content { flex: 1; }
.activity-text { display: block; font-size: 0.875rem; color: var(--text-primary); }
.activity-time { font-size: 0.75rem; color: var(--text-muted); }

/* Metrics Grid */
.metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.metric-item { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 16px; background: var(--bg-tertiary); border-radius: 12px; }
.metric-info { margin-top: 12px; }
.metric-value { display: block; font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
.metric-label { font-size: 0.75rem; color: var(--text-muted); }

/* Admin Actions Section */
.admin-actions-section { margin-top: 8px; }
.section-title { color: var(--text-primary); font-size: 1.125rem; font-weight: 600; margin: 0 0 16px 0; }
.admin-actions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
@media (max-width: 1100px) { .admin-actions-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 700px) { .admin-actions-grid { grid-template-columns: 1fr; } }

.admin-action-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; cursor: pointer; text-decoration: none; transition: all 0.2s ease; }
.admin-action-card:hover { border-color: var(--primary); transform: translateY(-2px); }
.action-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.action-icon.purple { background: rgba(124, 58, 237, 0.15); color: var(--primary-light); }
.action-icon.green { background: rgba(34, 197, 94, 0.15); color: var(--accent-green); }
.action-icon.orange { background: rgba(249, 115, 22, 0.15); color: var(--accent-orange); }
.action-icon.blue { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }
.action-icon.cyan { background: rgba(20, 184, 166, 0.15); color: var(--secondary); }
.action-icon.red { background: rgba(239, 68, 68, 0.15); color: var(--accent-red); }
.action-info { flex: 1; }
.action-title { display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
.action-desc { font-size: 0.75rem; color: var(--text-muted); }
</style>
