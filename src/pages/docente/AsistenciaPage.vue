<template>
  <q-page class="asistencia-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <q-icon name="fact_check" color="primary" class="q-mr-sm" />
          Llamar Lista
        </h1>
        <p class="page-subtitle">Registro de asistencia por materia y grupo</p>
      </div>
      <div class="header-actions">
        <q-btn unelevated color="green" icon="download" label="Exportar" @click="exportarAsistencia" />
      </div>
    </div>

    <!-- Horarios del Día -->
    <div v-if="horariosDelDia.length > 0" class="horarios-hoy q-mb-lg">
      <h2 class="section-title">
        <q-icon name="today" color="indigo" class="q-mr-sm" />
        Mis Clases Hoy ({{ diaActual }})
      </h2>
      <div class="horarios-cards">
        <div 
          v-for="horario in horariosDelDia" 
          :key="horario.id" 
          class="horario-item"
          :class="{ 'horario-activo': horario.esActivo, 'horario-pasado': horario.yaPaso }"
          @click="seleccionarHorario(horario)"
        >
          <div class="horario-hora">
            <q-icon name="schedule" size="16px" />
            {{ horario.horaInicio }} - {{ horario.horaFin }}
          </div>
          <div class="horario-materia">{{ horario.materiaNombre }}</div>
          <div class="horario-grupo">{{ horario.grupoNombre }}</div>
          <div class="horario-aula">
            <q-icon name="room" size="12px" /> {{ horario.aula }}
          </div>
          <q-chip v-if="horario.esActivo" color="green" text-color="white" size="xs">
            En curso
          </q-chip>
          <q-chip v-else-if="horario.yaPaso" color="grey" text-color="white" size="xs">
            Finalizado
          </q-chip>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section q-mb-lg">
      <q-select
        v-model="filtros.materia"
        :options="materiasOptions"
        label="Materia"
        outlined
        dense
        emit-value
        map-options
        style="min-width: 250px"
        @update:model-value="onMateriaChange"
      />
      <q-select
        v-model="filtros.grupo"
        :options="gruposOptions"
        label="Grupo"
        outlined
        dense
        emit-value
        map-options
        style="min-width: 150px"
        @update:model-value="cargarEstudiantes"
      />
      <q-input
        v-model="filtros.fecha"
        type="date"
        label="Fecha"
        outlined
        dense
        style="min-width: 150px"
      />
      <q-select
        v-if="horariosMateria.length > 0"
        v-model="filtros.sesion"
        :options="horariosMateria"
        label="Sesión/Horario"
        outlined
        dense
        emit-value
        map-options
        style="min-width: 200px"
      />
    </div>

    <!-- Stats -->
    <div class="stats-row q-mb-lg" v-if="estudiantes.length > 0">
      <div class="stat-card">
        <q-icon name="people" size="32px" color="primary" />
        <div class="stat-info">
          <span class="stat-value">{{ estudiantes.length }}</span>
          <span class="stat-label">Total Estudiantes</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="check_circle" size="32px" color="green" />
        <div class="stat-info">
          <span class="stat-value">{{ presentes }}</span>
          <span class="stat-label">Presentes</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="cancel" size="32px" color="red" />
        <div class="stat-info">
          <span class="stat-value">{{ ausentes }}</span>
          <span class="stat-label">Ausentes</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="schedule" size="32px" color="orange" />
        <div class="stat-info">
          <span class="stat-value">{{ tardanzas }}</span>
          <span class="stat-label">Tardanzas</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!filtros.materia && horariosDelDia.length === 0" class="empty-state">
      <q-icon name="event_busy" size="80px" color="grey-4" />
      <p class="text-h6 text-grey-6 q-mt-md">No tienes clases hoy</p>
      <p class="text-caption text-grey-5">Selecciona una materia manualmente</p>
    </div>

    <div v-else-if="!filtros.materia" class="empty-state">
      <q-icon name="touch_app" size="80px" color="grey-4" />
      <p class="text-h6 text-grey-6 q-mt-md">Selecciona una clase arriba</p>
      <p class="text-caption text-grey-5">O usa los filtros para buscar una materia</p>
    </div>

    <!-- Lista de Estudiantes -->
    <q-card v-else-if="estudiantes.length > 0" class="table-card">
      <q-table
        :rows="estudiantesFiltrados"
        :columns="columns"
        row-key="id"
        :pagination="{ rowsPerPage: 20 }"
        flat
        :filter="busqueda"
      >
        <template v-slot:top>
          <div class="table-header">
            <div class="table-title">
              <span class="text-h6">{{ materiaSeleccionada?.nombre }} - {{ grupoSeleccionado?.nombre }}</span>
              <q-chip v-if="filtros.sesion" size="sm" color="indigo" text-color="white">
                {{ horarioSeleccionado?.horaInicio }} - {{ horarioSeleccionado?.horaFin }}
              </q-chip>
            </div>
            <q-space />
            <q-input v-model="busqueda" placeholder="Buscar estudiante..." dense outlined style="min-width: 200px">
              <template v-slot:prepend><q-icon name="search" /></template>
            </q-input>
          </div>
        </template>

        <template v-slot:body-cell-foto="props">
          <q-td :props="props">
            <q-avatar size="36px" color="primary" text-color="white">
              {{ props.row.nombre.charAt(0) }}{{ props.row.apellido.charAt(0) }}
            </q-avatar>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-btn-toggle
              v-model="props.row.estado"
              toggle-color="primary"
              :options="[
                { icon: 'check', value: 'presente', color: 'green' },
                { icon: 'close', value: 'ausente', color: 'red' },
                { icon: 'schedule', value: 'tardanza', color: 'orange' }
              ]"
              dense
              rounded
              size="sm"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-observacion="props">
          <q-td :props="props">
            <q-input
              v-model="props.row.observacion"
              placeholder="Observación..."
              dense
              borderless
              style="width: 150px"
            />
          </q-td>
        </template>
      </q-table>

      <div class="q-pa-md flex justify-end gap-md">
        <q-btn flat color="grey" label="Cancelar" @click="resetear" />
        <q-btn unelevated color="primary" icon="save" label="Guardar Asistencia" @click="guardarAsistencia" />
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAsignaturasStore } from 'src/stores/asignaturas'

const $q = useQuasar()
const asignaturasStore = useAsignaturasStore()

const filtros = ref({
  materia: null,
  grupo: null,
  fecha: new Date().toISOString().split('T')[0],
  sesion: null
})

const busqueda = ref('')

// Días de la semana
const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const diaActual = computed(() => diasSemana[new Date().getDay()])

// Materias del docente (consumir del store)
const materias = computed(() => {
  // Por ahora usamos todas las asignaturas del store
  // En producción filtrar por docente asignado
  return asignaturasStore.asignaturas.map(a => ({
    id: a.id,
    nombre: a.nombre,
    codigo: a.codigo,
    horarios: a.horarios || [],
    grupos: a.grupos || [
      { id: 1, nombre: 'Grupo A', turno: 'Mañana' },
      { id: 2, nombre: 'Grupo B', turno: 'Tarde' }
    ]
  }))
})

// Horarios del día actual (todas las materias)
const horariosDelDia = computed(() => {
  const horarios = []
  const horaActual = new Date().getHours() * 60 + new Date().getMinutes()
  
  materias.value.forEach(materia => {
    const horariosMateria = materia.horarios?.filter(h => h.dia === diaActual.value) || []
    horariosMateria.forEach((h, idx) => {
      const [hIni, mIni] = h.horaInicio.split(':').map(Number)
      const [hFin, mFin] = h.horaFin.split(':').map(Number)
      const minInicio = hIni * 60 + (mIni || 0)
      const minFin = hFin * 60 + (mFin || 0)
      
      horarios.push({
        id: `${materia.id}-${idx}`,
        materiaId: materia.id,
        materiaNombre: materia.nombre,
        grupoId: materia.grupos[0]?.id,
        grupoNombre: materia.grupos[0]?.nombre,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin,
        aula: h.aula || 'Aula por asignar',
        esActivo: horaActual >= minInicio && horaActual <= minFin,
        yaPaso: horaActual > minFin
      })
    })
  })
  
  // Ordenar por hora
  return horarios.sort((a, b) => {
    const [hA] = a.horaInicio.split(':').map(Number)
    const [hB] = b.horaInicio.split(':').map(Number)
    return hA - hB
  })
})

// Estudiantes mock
const estudiantes = ref([])

const estudiantesBase = [
  { id: 1, codigo: '2024001', nombre: 'Juan', apellido: 'Pérez García', estado: null, observacion: '' },
  { id: 2, codigo: '2024002', nombre: 'María', apellido: 'López Rodríguez', estado: null, observacion: '' },
  { id: 3, codigo: '2024003', nombre: 'Carlos', apellido: 'Martínez Sánchez', estado: null, observacion: '' },
  { id: 4, codigo: '2024004', nombre: 'Ana', apellido: 'González Torres', estado: null, observacion: '' },
  { id: 5, codigo: '2024005', nombre: 'Luis', apellido: 'Hernández Díaz', estado: null, observacion: '' },
  { id: 6, codigo: '2024006', nombre: 'Carmen', apellido: 'Ruiz Moreno', estado: null, observacion: '' },
  { id: 7, codigo: '2024007', nombre: 'Pedro', apellido: 'Jiménez Álvarez', estado: null, observacion: '' },
  { id: 8, codigo: '2024008', nombre: 'Laura', apellido: 'Ramírez Castro', estado: null, observacion: '' },
  { id: 9, codigo: '2024009', nombre: 'Miguel', apellido: 'Vargas Ortiz', estado: null, observacion: '' },
  { id: 10, codigo: '2024010', nombre: 'Sandra', apellido: 'Mendoza Ríos', estado: null, observacion: '' },
  { id: 11, codigo: '2024011', nombre: 'Fernando', apellido: 'Aguilar Peña', estado: null, observacion: '' },
  { id: 12, codigo: '2024012', nombre: 'Patricia', apellido: 'Flores Vega', estado: null, observacion: '' },
  { id: 13, codigo: '2024013', nombre: 'Roberto', apellido: 'Suárez Luna', estado: null, observacion: '' },
  { id: 14, codigo: '2024014', nombre: 'Diana', apellido: 'Medina Campos', estado: null, observacion: '' },
  { id: 15, codigo: '2024015', nombre: 'Andrés', apellido: 'Reyes Molina', estado: null, observacion: '' }
]

const materiasOptions = computed(() => materias.value.map(m => ({ label: `${m.nombre} (${m.codigo})`, value: m.id })))

const materiaSeleccionada = computed(() => materias.value.find(m => m.id === filtros.value.materia))

const gruposOptions = computed(() => {
  if (!materiaSeleccionada.value) return []
  return materiaSeleccionada.value.grupos.map(g => ({ label: `${g.nombre} - ${g.turno}`, value: g.id }))
})

const grupoSeleccionado = computed(() => {
  if (!materiaSeleccionada.value) return null
  return materiaSeleccionada.value.grupos.find(g => g.id === filtros.value.grupo)
})

const horariosMateria = computed(() => {
  if (!materiaSeleccionada.value) return []
  return (materiaSeleccionada.value.horarios || []).map((h, idx) => ({
    label: `${h.dia} ${h.horaInicio}-${h.horaFin} (${h.aula || 'Sin aula'})`,
    value: idx
  }))
})

const horarioSeleccionado = computed(() => {
  if (!materiaSeleccionada.value || filtros.value.sesion === null) return null
  return materiaSeleccionada.value.horarios?.[filtros.value.sesion]
})

const estudiantesFiltrados = computed(() => estudiantes.value)

const presentes = computed(() => estudiantes.value.filter(e => e.estado === 'presente').length)
const ausentes = computed(() => estudiantes.value.filter(e => e.estado === 'ausente').length)
const tardanzas = computed(() => estudiantes.value.filter(e => e.estado === 'tardanza').length)

const columns = [
  { name: 'foto', label: '', field: 'foto', align: 'center', style: 'width: 50px' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: row => `${row.nombre} ${row.apellido}`, align: 'left', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'observacion', label: 'Observación', field: 'observacion', align: 'left' }
]

function seleccionarHorario(horario) {
  filtros.value.materia = horario.materiaId
  filtros.value.grupo = horario.grupoId
  cargarEstudiantes()
}

function onMateriaChange() {
  filtros.value.grupo = null
  filtros.value.sesion = null
  estudiantes.value = []
}

function cargarEstudiantes() {
  if (filtros.value.materia && filtros.value.grupo) {
    estudiantes.value = estudiantesBase.map(e => ({ ...e, estado: null, observacion: '' }))
  }
}

function resetear() {
  estudiantes.value.forEach(e => {
    e.estado = null
    e.observacion = ''
  })
}

function guardarAsistencia() {
  const sinMarcar = estudiantes.value.filter(e => !e.estado).length
  if (sinMarcar > 0) {
    $q.dialog({
      title: 'Estudiantes sin marcar',
      message: `Hay ${sinMarcar} estudiantes sin estado de asistencia. ¿Desea continuar?`,
      cancel: true,
      persistent: true
    }).onOk(() => {
      ejecutarGuardado()
    })
  } else {
    ejecutarGuardado()
  }
}

function ejecutarGuardado() {
  $q.notify({ type: 'positive', message: 'Asistencia guardada correctamente', icon: 'check_circle' })
}

function exportarAsistencia() {
  $q.notify({ type: 'info', message: 'Exportando asistencia...', icon: 'download' })
}
</script>

<style scoped>
.asistencia-page { padding: 24px; background: var(--bg-primary); min-height: 100vh; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); margin: 0; display: flex; align-items: center; }
.page-subtitle { color: var(--text-secondary); margin: 4px 0 0 0; }
.header-actions { display: flex; gap: 12px; }

.section-title { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin: 0 0 16px 0; display: flex; align-items: center; }

.horarios-hoy { padding: 20px; background: var(--bg-secondary); border-radius: 16px; border: 1px solid var(--border-color); }
.horarios-cards { display: flex; gap: 16px; flex-wrap: wrap; }
.horario-item { 
  background: var(--bg-tertiary); 
  border: 2px solid var(--border-color); 
  border-radius: 12px; 
  padding: 16px; 
  min-width: 180px;
  cursor: pointer;
  transition: all 0.2s;
}
.horario-item:hover { border-color: var(--primary); transform: translateY(-2px); }
.horario-item.horario-activo { border-color: #10b981; background: rgba(16, 185, 129, 0.1); }
.horario-item.horario-pasado { opacity: 0.6; }
.horario-hora { font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 4px; }
.horario-materia { font-weight: 600; color: var(--text-primary); margin-top: 4px; }
.horario-grupo { font-size: 0.85rem; color: var(--text-secondary); }
.horario-aula { font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; margin-top: 4px; }

.filters-section { display: flex; gap: 12px; flex-wrap: wrap; }

.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; }
.stat-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; }
.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
.stat-label { font-size: 0.8rem; color: var(--text-muted); }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; background: var(--bg-secondary); border-radius: 16px; border: 1px solid var(--border-color); }

.table-card { background: var(--bg-secondary) !important; border: 1px solid var(--border-color); border-radius: 16px; }
.table-header { display: flex; align-items: center; width: 100%; padding: 8px 0; }
.table-title { display: flex; align-items: center; gap: 12px; }
</style>
