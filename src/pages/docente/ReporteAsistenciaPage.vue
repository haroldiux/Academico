<template>
  <q-page class="q-pa-lg page-reporte-asistencia">
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="assessment" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Reporte de Asistencias por Asignatura</span>
        </h4>
        <p class="q-ma-none q-mt-xs text-grey-6">
          Vista general de asistencia de estudiantes por clase
        </p>
      </div>
    </div>

    <!-- Filtros -->
    <q-card class="card-filtros q-mb-lg">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-5">
            <q-select
              v-model="asignaturaSeleccionada"
              :options="asignaturas"
              option-value="id"
              option-label="nombre"
              label="Asignatura"
              outlined
              dense
              emit-value
              map-options
              class="select-dark"
            >
              <template v-slot:prepend>
                <q-icon name="menu_book" color="primary" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="grupoSeleccionado"
              :options="grupos"
              option-value="id"
              option-label="nombre"
              label="Grupo"
              outlined
              dense
              emit-value
              map-options
              class="select-dark"
            >
              <template v-slot:prepend>
                <q-icon name="groups" color="teal" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-4">
            <div class="row q-gutter-sm">
              <q-btn
                unelevated
                color="primary"
                icon="search"
                label="Generar Reporte"
                no-caps
                @click="generarReporte"
              />
              <q-btn
                outline
                color="green"
                icon="picture_as_pdf"
                label="Exportar PDF"
                no-caps
                @click="exportarPDF"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Leyenda -->
    <div class="row q-mb-md q-gutter-md leyenda">
      <div class="leyenda-item">
        <span class="estado-badge estado-p">P</span>
        <span>Presente</span>
      </div>
      <div class="leyenda-item">
        <span class="estado-badge estado-t">T</span>
        <span>Tardanza</span>
      </div>
      <div class="leyenda-item">
        <span class="estado-badge estado-f">F</span>
        <span>Falta</span>
      </div>
      <div class="leyenda-item">
        <span class="estado-badge estado-fj">Fj</span>
        <span>Falta Justificada</span>
      </div>
    </div>

    <!-- Tabla Grid de Asistencia -->
    <q-card class="card-tabla">
      <q-card-section class="q-pa-none">
        <div class="tabla-scroll">
          <table class="tabla-asistencia">
            <thead>
              <tr>
                <th class="col-estudiante sticky-col">Estudiante</th>
                <th 
                  v-for="clase in clases" 
                  :key="clase.id"
                  class="col-clase"
                >
                  <div class="clase-header">
                    <span class="clase-num">Clase {{ clase.numero }}</span>
                    <span class="clase-fecha">{{ clase.fecha }}</span>
                  </div>
                </th>
                <th class="col-stats">% Asist.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="estudiante in estudiantes" :key="estudiante.id">
                <td class="col-estudiante sticky-col">
                  <div class="estudiante-info">
                    <q-avatar size="32px" color="primary" text-color="white">
                      {{ estudiante.iniciales }}
                    </q-avatar>
                    <span class="estudiante-nombre">{{ estudiante.apellidos }} {{ estudiante.nombres }}</span>
                  </div>
                </td>
                <td 
                  v-for="clase in clases" 
                  :key="clase.id"
                  class="col-clase"
                  @click="cambiarEstado(estudiante.id, clase.id)"
                >
                  <span 
                    :class="['estado-badge', `estado-${getEstado(estudiante.id, clase.id).toLowerCase()}`]"
                  >
                    {{ getEstado(estudiante.id, clase.id) }}
                  </span>
                </td>
                <td class="col-stats">
                  <q-badge 
                    :color="getPorcentajeColor(calcularPorcentaje(estudiante.id))"
                    :label="`${calcularPorcentaje(estudiante.id)}%`"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </q-card-section>
    </q-card>

    <!-- Estadísticas Resumen -->
    <div class="row q-col-gutter-md q-mt-lg">
      <div class="col-12 col-md-3">
        <q-card class="stat-card stat-total">
          <q-card-section class="text-center">
            <div class="stat-value">{{ estadisticas.totalClases }}</div>
            <div class="stat-label">Clases Registradas</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="stat-card stat-presentes">
          <q-card-section class="text-center">
            <div class="stat-value">{{ estadisticas.promedioAsistencia }}%</div>
            <div class="stat-label">Promedio Asistencia</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="stat-card stat-estudiantes">
          <q-card-section class="text-center">
            <div class="stat-value">{{ estadisticas.totalEstudiantes }}</div>
            <div class="stat-label">Total Estudiantes</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="stat-card stat-riesgo">
          <q-card-section class="text-center">
            <div class="stat-value">{{ estadisticas.estudiantesRiesgo }}</div>
            <div class="stat-label">En Riesgo (&lt;70%)</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Datos
const asignaturaSeleccionada = ref(1)
const grupoSeleccionado = ref(1)

const asignaturas = ref([
  { id: 1, nombre: 'CÁLCULO I' },
  { id: 2, nombre: 'Ingeniería de Software I' },
  { id: 3, nombre: 'Base de Datos I' }
])

const grupos = ref([
  { id: 1, nombre: 'Grupo 1' },
  { id: 2, nombre: 'Grupo 2' }
])

// Mock: Clases del semestre
const clases = ref([
  { id: 1, numero: 1, fecha: '13/01' },
  { id: 2, numero: 2, fecha: '15/01' },
  { id: 3, numero: 3, fecha: '17/01' },
  { id: 4, numero: 4, fecha: '20/01' },
  { id: 5, numero: 5, fecha: '22/01' },
  { id: 6, numero: 6, fecha: '24/01' },
  { id: 7, numero: 7, fecha: '27/01' },
  { id: 8, numero: 8, fecha: '29/01' },
  { id: 9, numero: 9, fecha: '31/01' },
  { id: 10, numero: 10, fecha: '03/02' },
  { id: 11, numero: 11, fecha: '05/02' },
  { id: 12, numero: 12, fecha: '07/02' },
  { id: 13, numero: 13, fecha: '10/02' },
  { id: 14, numero: 14, fecha: '12/02' },
  { id: 15, numero: 15, fecha: '14/02' }
])

// Mock: Estudiantes
const estudiantes = ref([
  { id: 1, nombres: 'ADANEYLA DANIELA', apellidos: 'RIOS CRUZ', iniciales: 'RC' },
  { id: 2, nombres: 'ALEJANDRO', apellidos: 'MENECES MONTAÑO', iniciales: 'MM' },
  { id: 3, nombres: 'BENJAMIN FREDDY', apellidos: 'TRUJILLO LLANOS', iniciales: 'TL' },
  { id: 4, nombres: 'DAYSI ALEJANDRA', apellidos: 'TARQUI VILLAVICENCIO', iniciales: 'TV' },
  { id: 5, nombres: 'EVER', apellidos: 'ROCHA NUÑEZ', iniciales: 'RN' },
  { id: 6, nombres: 'JHON DEYVI', apellidos: 'GUTIERREZ SANTOS', iniciales: 'GS' },
  { id: 7, nombres: 'MARIA FERNANDA', apellidos: 'LOPEZ GARCIA', iniciales: 'LG' },
  { id: 8, nombres: 'CARLOS ALBERTO', apellidos: 'MARTINEZ PEREZ', iniciales: 'MP' }
])

// Mock: Asistencias (estudianteId -> claseId -> estado)
const asistencias = ref({
  1: { 1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'T', 7: 'P', 8: 'P', 9: 'P', 10: 'P', 11: 'P', 12: 'P', 13: 'P', 14: 'P', 15: 'P' },
  2: { 1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'P', 8: 'P', 9: 'P', 10: 'P', 11: 'P', 12: 'P', 13: 'P', 14: 'P', 15: 'P' },
  3: { 1: 'P', 2: 'P', 3: 'T', 4: 'P', 5: 'P', 6: 'P', 7: 'F', 8: 'P', 9: 'P', 10: 'P', 11: 'T', 12: 'P', 13: 'P', 14: 'P', 15: 'P' },
  4: { 1: 'F', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'P', 8: 'P', 9: 'Fj', 10: 'P', 11: 'P', 12: 'P', 13: 'P', 14: 'P', 15: 'P' },
  5: { 1: 'P', 2: 'Fj', 3: 'Fj', 4: 'P', 5: 'P', 6: 'P', 7: 'P', 8: 'P', 9: 'P', 10: 'P', 11: 'P', 12: 'F', 13: 'P', 14: 'P', 15: 'P' },
  6: { 1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'P', 8: 'P', 9: 'P', 10: 'P', 11: 'P', 12: 'P', 13: 'P', 14: 'P', 15: 'P' },
  7: { 1: 'P', 2: 'P', 3: 'P', 4: 'F', 5: 'F', 6: 'F', 7: 'P', 8: 'P', 9: 'P', 10: 'P', 11: 'P', 12: 'P', 13: 'P', 14: 'P', 15: 'P' },
  8: { 1: 'F', 2: 'F', 3: 'F', 4: 'F', 5: 'P', 6: 'P', 7: 'P', 8: 'P', 9: 'P', 10: 'P', 11: 'P', 12: 'P', 13: 'P', 14: 'P', 15: 'P' }
})

// Funciones
function getEstado(estudianteId, claseId) {
  return asistencias.value[estudianteId]?.[claseId] || '-'
}

function cambiarEstado(estudianteId, claseId) {
  const estados = ['P', 'T', 'F', 'Fj']
  const estadoActual = getEstado(estudianteId, claseId)
  const indexActual = estados.indexOf(estadoActual)
  const nuevoIndex = (indexActual + 1) % estados.length
  
  if (!asistencias.value[estudianteId]) {
    asistencias.value[estudianteId] = {}
  }
  asistencias.value[estudianteId][claseId] = estados[nuevoIndex]
}

function calcularPorcentaje(estudianteId) {
  const registro = asistencias.value[estudianteId] || {}
  const totalClases = clases.value.length
  let presentes = 0
  
  Object.values(registro).forEach(estado => {
    if (estado === 'P' || estado === 'T') presentes++
  })
  
  return Math.round((presentes / totalClases) * 100)
}

function getPorcentajeColor(porcentaje) {
  if (porcentaje >= 90) return 'green'
  if (porcentaje >= 70) return 'orange'
  return 'red'
}

// Estadísticas computadas
const estadisticas = computed(() => {
  const totalEstudiantes = estudiantes.value.length
  const totalClases = clases.value.length
  
  let sumaPorc = 0
  let enRiesgo = 0
  
  estudiantes.value.forEach(est => {
    const porc = calcularPorcentaje(est.id)
    sumaPorc += porc
    if (porc < 70) enRiesgo++
  })
  
  return {
    totalClases,
    totalEstudiantes,
    promedioAsistencia: Math.round(sumaPorc / totalEstudiantes),
    estudiantesRiesgo: enRiesgo
  }
})

function generarReporte() {
  $q.notify({
    type: 'positive',
    message: 'Reporte generado exitosamente',
    icon: 'check_circle',
    position: 'top'
  })
}

function exportarPDF() {
  $q.notify({
    type: 'info',
    message: 'Exportando reporte a PDF...',
    icon: 'picture_as_pdf',
    position: 'top'
  })
}
</script>

<style scoped>
.page-reporte-asistencia {
  background: var(--bg-primary);
  min-height: 100vh;
}

.text-gradient {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Cards */
.card-filtros,
.card-tabla {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 16px !important;
}

/* Select dark */
.select-dark :deep(.q-field__control) {
  background: var(--bg-tertiary);
}

/* Leyenda */
.leyenda {
  display: flex;
  flex-wrap: wrap;
}

.leyenda-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 13px;
}

/* Tabla de asistencia */
.tabla-scroll {
  overflow-x: auto;
  max-width: 100%;
}

.tabla-asistencia {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 900px;
}

.tabla-asistencia th,
.tabla-asistencia td {
  padding: 12px 8px;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
}

.tabla-asistencia th {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 12px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tabla-asistencia tbody tr:hover {
  background: rgba(67, 56, 202, 0.05);
}

/* Columna estudiante sticky */
.sticky-col {
  position: sticky;
  left: 0;
  background: var(--bg-secondary);
  z-index: 5;
  min-width: 220px;
  text-align: left !important;
}

.tabla-asistencia th.sticky-col {
  z-index: 15;
  background: var(--bg-tertiary);
}

.estudiante-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.estudiante-nombre {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
}

/* Clase header */
.clase-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.clase-num {
  font-weight: 600;
  font-size: 11px;
}

.clase-fecha {
  font-size: 10px;
  color: var(--text-muted);
}

.col-clase {
  min-width: 55px;
  cursor: pointer;
  transition: background 0.2s;
}

.col-clase:hover {
  background: rgba(67, 56, 202, 0.1);
}

.col-stats {
  min-width: 70px;
}

/* Estados */
.estado-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 11px;
  transition: transform 0.2s;
}

.estado-badge:hover {
  transform: scale(1.1);
}

.estado-p {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.estado-t {
  background: rgba(234, 179, 8, 0.2);
  color: #eab308;
}

.estado-f {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.estado-fj {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

/* Stat cards */
.stat-card {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 12px !important;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.stat-total .stat-value { color: var(--primary-light); }
.stat-presentes .stat-value { color: #22c55e; }
.stat-estudiantes .stat-value { color: #14b8a6; }
.stat-riesgo .stat-value { color: #ef4444; }
</style>
