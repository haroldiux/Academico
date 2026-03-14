<template>
  <q-page class="evaluaciones-dashboard">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <q-icon name="quiz" color="orange" class="q-mr-sm" />
          Panel de Evaluaciones
        </h1>
        <p class="page-subtitle">Gestión y control de exámenes del campus</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid q-mb-xl">
      <div class="stat-card stat-card--orange">
        <div class="stat-icon"><q-icon name="pending_actions" size="32px" /></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.pendientes }}</span>
          <span class="stat-label">Pendientes</span>
        </div>
      </div>
      <div class="stat-card stat-card--blue">
        <div class="stat-icon"><q-icon name="hourglass_top" size="32px" /></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.enProceso }}</span>
          <span class="stat-label">En Proceso</span>
        </div>
      </div>
      <div class="stat-card stat-card--green">
        <div class="stat-icon"><q-icon name="assignment_turned_in" size="32px" /></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.entregados }}</span>
          <span class="stat-label">Entregados</span>
        </div>
      </div>
      <div class="stat-card stat-card--purple">
        <div class="stat-icon"><q-icon name="grade" size="32px" /></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.calificados }}</span>
          <span class="stat-label">Calificados</span>
        </div>
      </div>
    </div>

    <!-- Próximos Exámenes -->
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-7">
        <q-card class="info-card">
          <q-card-section>
            <div class="section-title">
              <q-icon name="upcoming" color="orange" class="q-mr-sm" />
              Próximos Exámenes (48h)
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-list separator>
              <q-item v-for="examen in proximosExamenes" :key="examen.id" class="exam-item">
                <q-item-section avatar>
                  <q-avatar :color="getEstadoColor(examen.estado)" text-color="white" size="40px" icon="quiz" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ examen.materia }}</q-item-label>
                  <q-item-label caption>{{ examen.carrera }} • Grupo {{ examen.grupo }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-right">
                    <div class="text-caption text-weight-bold">{{ examen.fecha }}</div>
                    <div class="text-caption text-grey-6">{{ examen.hora }}</div>
                    <q-chip :color="getEstadoColor(examen.estado)" text-color="white" size="xs" dense>
                      {{ examen.estado }}
                    </q-chip>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-actions>
            <q-btn flat color="primary" label="Ver todos los exámenes" icon-right="arrow_forward"
              to="/evaluaciones/rol-examenes" no-caps />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card class="info-card">
          <q-card-section>
            <div class="section-title">
              <q-icon name="school" color="primary" class="q-mr-sm" />
              Mis Carreras Asignadas
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-list>
              <q-item v-for="carrera in carrerasAsignadas" :key="carrera.id">
                <q-item-section avatar>
                  <q-icon name="school" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ carrera.nombre }}</q-item-label>
                  <q-item-label caption>{{ carrera.examenes }} exámenes programados</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="carrera.examenes > 0 ? 'orange' : 'grey-4'"
                    :text-color="carrera.examenes > 0 ? 'white' : 'grey-7'">
                    {{ carrera.examenes }}
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <q-card class="info-card q-mt-md">
          <q-card-section>
            <div class="section-title">
              <q-icon name="info" color="blue" class="q-mr-sm" />
              Accesos Rápidos
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none q-gutter-sm">
            <q-btn unelevated color="primary" icon="list_alt" label="Rol de Exámenes"
              to="/evaluaciones/rol-examenes" no-caps class="full-width" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

// Mock data - se reemplazará con datos reales del backend
const stats = ref({
  pendientes: 12,
  enProceso: 3,
  entregados: 8,
  calificados: 5
})

const proximosExamenes = ref([
  { id: 1, materia: 'Anatomía I', carrera: 'MEDICINA', grupo: 'A', fecha: '14/03/2026', hora: '08:00', estado: 'Pendiente' },
  { id: 2, materia: 'Bioquímica', carrera: 'ENFERMERÍA', grupo: 'B', fecha: '15/03/2026', hora: '10:00', estado: 'Pendiente' },
  { id: 3, materia: 'Fisiología', carrera: 'MEDICINA', grupo: 'A', fecha: '16/03/2026', hora: '14:00', estado: 'En Proceso' },
])

const carrerasAsignadas = ref([
  { id: 1, nombre: 'Medicina', examenes: 5 },
  { id: 2, nombre: 'Enfermería', examenes: 3 },
  { id: 3, nombre: 'Odontología', examenes: 4 },
])

function getEstadoColor(estado) {
  const colors = {
    'Pendiente': 'orange',
    'En Proceso': 'blue',
    'Entregado': 'green',
    'Calificado': 'purple'
  }
  return colors[estado] || 'grey'
}
</script>

<style scoped>
.evaluaciones-dashboard {
  padding: 24px;
  background: var(--bg-primary);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 28px;
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
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--border-color);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-card--orange .stat-icon { color: #f57c00; }
.stat-card--blue .stat-icon { color: #1976d2; }
.stat-card--green .stat-icon { color: #388e3c; }
.stat-card--purple .stat-icon { color: #7b1fa2; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.info-card {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.exam-item {
  border-radius: 8px;
  transition: background 0.15s;
}

.exam-item:hover {
  background: var(--bg-hover);
}
</style>
