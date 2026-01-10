<template>
  <q-page class="configuracion-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">
          <q-icon name="settings" color="grey" class="q-mr-sm" />
          Configuración del Sistema
        </h1>
        <p class="page-subtitle">Ajustes generales y parámetros del sistema académico</p>
      </div>
    </div>

    <div class="config-layout">
      <!-- Sidebar de navegación -->
      <div class="config-nav">
        <div 
          v-for="section in sections" 
          :key="section.id"
          :class="['nav-item', { active: activeSection === section.id }]"
          @click="activeSection = section.id"
        >
          <q-icon :name="section.icon" size="20px" />
          <span>{{ section.label }}</span>
        </div>
      </div>

      <!-- Contenido -->
      <div class="config-content">
        <!-- Gestión Académica -->
        <div v-if="activeSection === 'academico'" class="config-section">
          <h2 class="section-title">Gestión Académica</h2>
          
          <q-card class="config-card">
            <q-card-section>
              <h3 class="card-title">Gestión Actual</h3>
              <div class="config-row">
                <div class="config-field">
                  <label>Año</label>
                  <q-input v-model.number="config.gestion.anio" outlined dense type="number" />
                </div>
                <div class="config-field">
                  <label>Semestre</label>
                  <q-select v-model="config.gestion.semestre" :options="['I', 'II']" outlined dense />
                </div>
                <div class="config-field">
                  <label>Estado</label>
                  <q-select v-model="config.gestion.estado" :options="['Activa', 'Planificación', 'Cerrada']" outlined dense />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="config-card">
            <q-card-section>
              <h3 class="card-title">Fechas Importantes</h3>
              <div class="config-row">
                <div class="config-field">
                  <label>Inicio de Clases</label>
                  <q-input v-model="config.fechas.inicioClases" outlined dense type="date" />
                </div>
                <div class="config-field">
                  <label>Fin de Clases</label>
                  <q-input v-model="config.fechas.finClases" outlined dense type="date" />
                </div>
              </div>
              <div class="config-row">
                <div class="config-field">
                  <label>Inicio Inscripciones</label>
                  <q-input v-model="config.fechas.inicioInscripciones" outlined dense type="date" />
                </div>
                <div class="config-field">
                  <label>Fin Inscripciones</label>
                  <q-input v-model="config.fechas.finInscripciones" outlined dense type="date" />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="config-card">
            <q-card-section>
              <h3 class="card-title">Parámetros de Evaluación</h3>
              <div class="config-row">
                <div class="config-field">
                  <label>Nota Mínima de Aprobación</label>
                  <q-input v-model.number="config.evaluacion.notaMinima" outlined dense type="number" min="0" max="100" />
                </div>
                <div class="config-field">
                  <label>Escala de Notas</label>
                  <q-select v-model="config.evaluacion.escala" :options="['0-100', '0-10', '1-7']" outlined dense />
                </div>
              </div>
              <q-toggle v-model="config.evaluacion.permitirRecuperacion" label="Permitir exámenes de recuperación" />
            </q-card-section>
          </q-card>
        </div>

        <!-- Notificaciones -->
        <div v-if="activeSection === 'notificaciones'" class="config-section">
          <h2 class="section-title">Notificaciones</h2>
          
          <q-card class="config-card">
            <q-card-section>
              <h3 class="card-title">Canales de Notificación</h3>
              <div class="toggle-list">
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">Notificaciones por Email</span>
                    <span class="toggle-desc">Enviar alertas y recordatorios por correo electrónico</span>
                  </div>
                  <q-toggle v-model="config.notificaciones.email" color="primary" />
                </div>
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">Notificaciones Push</span>
                    <span class="toggle-desc">Alertas en tiempo real en el navegador</span>
                  </div>
                  <q-toggle v-model="config.notificaciones.push" color="primary" />
                </div>
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">Recordatorios de Documentación</span>
                    <span class="toggle-desc">Notificar a docentes sobre documentación pendiente</span>
                  </div>
                  <q-toggle v-model="config.notificaciones.recordatorios" color="primary" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Seguridad -->
        <div v-if="activeSection === 'seguridad'" class="config-section">
          <h2 class="section-title">Seguridad</h2>
          
          <q-card class="config-card">
            <q-card-section>
              <h3 class="card-title">Política de Contraseñas</h3>
              <div class="config-row">
                <div class="config-field">
                  <label>Longitud Mínima</label>
                  <q-input v-model.number="config.seguridad.longitudMinima" outlined dense type="number" min="6" max="20" />
                </div>
                <div class="config-field">
                  <label>Expiración (días)</label>
                  <q-input v-model.number="config.seguridad.expiracionDias" outlined dense type="number" min="0" />
                </div>
              </div>
              <div class="toggle-list q-mt-md">
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">Requerir mayúsculas</span>
                  </div>
                  <q-toggle v-model="config.seguridad.mayusculas" color="primary" />
                </div>
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">Requerir números</span>
                  </div>
                  <q-toggle v-model="config.seguridad.numeros" color="primary" />
                </div>
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">Requerir caracteres especiales</span>
                  </div>
                  <q-toggle v-model="config.seguridad.especiales" color="primary" />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="config-card">
            <q-card-section>
              <h3 class="card-title">Sesiones</h3>
              <div class="config-row">
                <div class="config-field">
                  <label>Tiempo de Inactividad (minutos)</label>
                  <q-input v-model.number="config.seguridad.tiempoInactividad" outlined dense type="number" min="5" />
                </div>
                <div class="config-field">
                  <label>Intentos de Login Máximos</label>
                  <q-input v-model.number="config.seguridad.intentosMaximos" outlined dense type="number" min="3" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Apariencia -->
        <div v-if="activeSection === 'apariencia'" class="config-section">
          <h2 class="section-title">Apariencia</h2>
          
          <q-card class="config-card">
            <q-card-section>
              <h3 class="card-title">Tema</h3>
              <div class="theme-options">
                <div 
                  :class="['theme-option', { active: themeStore.isDark === false }]"
                  @click="themeStore.setDarkMode(false)"
                >
                  <q-icon name="light_mode" size="24px" />
                  <span>Claro</span>
                </div>
                <div 
                  :class="['theme-option', { active: themeStore.isDark === true }]"
                  @click="themeStore.setDarkMode(true)"
                >
                  <q-icon name="dark_mode" size="24px" />
                  <span>Oscuro</span>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="config-card">
            <q-card-section>
              <h3 class="card-title">Personalización</h3>
              <div class="config-row">
                <div class="config-field">
                  <label>Color Principal</label>
                  <q-input v-model="config.apariencia.colorPrimario" outlined dense>
                    <template v-slot:prepend>
                      <div class="color-preview" :style="{ background: config.apariencia.colorPrimario }"></div>
                    </template>
                  </q-input>
                </div>
                <div class="config-field">
                  <label>Logo (URL)</label>
                  <q-input v-model="config.apariencia.logoUrl" outlined dense placeholder="URL del logo" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Respaldos -->
        <div v-if="activeSection === 'respaldos'" class="config-section">
          <h2 class="section-title">Respaldos</h2>
          
          <q-card class="config-card">
            <q-card-section>
              <h3 class="card-title">Respaldo Automático</h3>
              <div class="toggle-list">
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">Habilitar respaldos automáticos</span>
                    <span class="toggle-desc">Crear copias de seguridad automáticamente</span>
                  </div>
                  <q-toggle v-model="config.respaldos.automatico" color="primary" />
                </div>
              </div>
              <div class="config-row q-mt-md" v-if="config.respaldos.automatico">
                <div class="config-field">
                  <label>Frecuencia</label>
                  <q-select v-model="config.respaldos.frecuencia" :options="['Diario', 'Semanal', 'Mensual']" outlined dense />
                </div>
                <div class="config-field">
                  <label>Retención (días)</label>
                  <q-input v-model.number="config.respaldos.retencion" outlined dense type="number" min="7" />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="config-card">
            <q-card-section>
              <h3 class="card-title">Respaldo Manual</h3>
              <p class="text-grey-6 q-mb-md">Última copia: {{ config.respaldos.ultimaCopia }}</p>
              <q-btn unelevated color="primary" icon="backup" label="Crear Respaldo Ahora" no-caps @click="crearRespaldo" />
            </q-card-section>
          </q-card>
        </div>

        <!-- Botón Guardar -->
        <div class="config-actions">
          <q-btn flat label="Cancelar Cambios" @click="resetConfig" />
          <q-btn unelevated color="primary" icon="save" label="Guardar Configuración" no-caps @click="guardarConfig" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useThemeStore } from 'src/stores/theme'

const $q = useQuasar()
const themeStore = useThemeStore()

const activeSection = ref('academico')

const sections = [
  { id: 'academico', label: 'Gestión Académica', icon: 'school' },
  { id: 'notificaciones', label: 'Notificaciones', icon: 'notifications' },
  { id: 'seguridad', label: 'Seguridad', icon: 'security' },
  { id: 'apariencia', label: 'Apariencia', icon: 'palette' },
  { id: 'respaldos', label: 'Respaldos', icon: 'backup' }
]

const config = ref({
  gestion: {
    anio: 2026,
    semestre: 'I',
    estado: 'Activa'
  },
  fechas: {
    inicioClases: '2026-02-03',
    finClases: '2026-06-30',
    inicioInscripciones: '2026-01-15',
    finInscripciones: '2026-01-31'
  },
  evaluacion: {
    notaMinima: 51,
    escala: '0-100',
    permitirRecuperacion: true
  },
  notificaciones: {
    email: true,
    push: true,
    recordatorios: true
  },
  seguridad: {
    longitudMinima: 8,
    expiracionDias: 90,
    mayusculas: true,
    numeros: true,
    especiales: false,
    tiempoInactividad: 30,
    intentosMaximos: 5
  },
  apariencia: {
    colorPrimario: '#7c3aed',
    logoUrl: ''
  },
  respaldos: {
    automatico: true,
    frecuencia: 'Diario',
    retencion: 30,
    ultimaCopia: '2026-01-09 23:00:00'
  }
})

function guardarConfig() {
  $q.notify({
    type: 'positive',
    message: 'Configuración guardada exitosamente',
    icon: 'check_circle'
  })
}

function resetConfig() {
  $q.notify({
    type: 'info',
    message: 'Cambios descartados',
    icon: 'undo'
  })
}

function crearRespaldo() {
  $q.notify({
    type: 'positive',
    message: 'Respaldo creado exitosamente',
    icon: 'backup'
  })
  config.value.respaldos.ultimaCopia = new Date().toLocaleString()
}
</script>

<style scoped>
.configuracion-page {
  padding: 24px;
  background: var(--bg-primary);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
}

.page-subtitle {
  color: var(--text-secondary);
  margin: 4px 0 0 0;
  font-size: 0.875rem;
}

.config-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 24px;
}

/* Navigation */
.config-nav {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 16px;
  height: fit-content;
  position: sticky;
  top: 24px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--primary);
  color: white;
}

/* Content */
.config-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.config-card {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.card-title {
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.config-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.config-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.config-field label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
}

/* Toggle List */
.toggle-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.toggle-item:last-child {
  border-bottom: none;
}

.toggle-label {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
}

.toggle-desc {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Theme Options */
.theme-options {
  display: flex;
  gap: 16px;
}

.theme-option {
  flex: 1;
  padding: 24px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-option:hover {
  border-color: var(--primary);
}

.theme-option.active {
  border-color: var(--primary);
  background: rgba(124, 58, 237, 0.1);
}

.theme-option span {
  display: block;
  margin-top: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 6px;
}

/* Actions */
.config-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 900px) {
  .config-layout {
    grid-template-columns: 1fr;
  }
  
  .config-nav {
    position: static;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .nav-item {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
}
</style>
