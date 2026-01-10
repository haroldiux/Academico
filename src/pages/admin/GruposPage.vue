<template>
  <q-page class="grupos-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">
          <q-icon name="groups" color="teal" class="q-mr-sm" />
          Gestión de Grupos por Materia
        </h1>
        <p class="page-subtitle">Administra los grupos/paralelos de cada materia por sede y carrera</p>
      </div>
      <div class="header-actions">
        <q-btn unelevated color="teal" icon="add" label="Nuevo Grupo" no-caps @click="openDialog()" />
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <q-select
        v-model="filtros.sede"
        :options="sedesOptions"
        outlined
        dense
        label="Sede"
        emit-value
        map-options
        clearable
        style="min-width: 180px;"
        @update:model-value="onSedeChange"
      />
      <q-select
        v-model="filtros.campus"
        :options="campusFiltrados"
        outlined
        dense
        label="Campus"
        emit-value
        map-options
        clearable
        style="min-width: 200px;"
        :disable="!filtros.sede"
      />
      <q-select
        v-model="filtros.carrera"
        :options="carrerasFiltradas"
        outlined
        dense
        label="Carrera"
        emit-value
        map-options
        clearable
        style="min-width: 220px;"
      />
      <q-select
        v-model="filtros.semestre"
        :options="semestresOptions"
        outlined
        dense
        label="Semestre"
        emit-value
        map-options
        clearable
        style="min-width: 150px;"
      />
      <q-select
        v-model="filtros.gestion"
        :options="gestionesOptions"
        outlined
        dense
        label="Gestión"
        emit-value
        map-options
        style="min-width: 120px;"
      />
    </div>

    <!-- Estadísticas -->
    <div class="stats-row">
      <div class="stat-card">
        <q-icon name="menu_book" size="28px" color="purple" />
        <div class="stat-info">
          <span class="stat-value">{{ materiasFiltradas.length }}</span>
          <span class="stat-label">Materias</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="groups" size="28px" color="teal" />
        <div class="stat-info">
          <span class="stat-value">{{ totalGrupos }}</span>
          <span class="stat-label">Grupos</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="people" size="28px" color="blue" />
        <div class="stat-info">
          <span class="stat-value">{{ totalEstudiantes }}</span>
          <span class="stat-label">Estudiantes</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="person" size="28px" color="green" />
        <div class="stat-info">
          <span class="stat-value">{{ totalDocentes }}</span>
          <span class="stat-label">Docentes</span>
        </div>
      </div>
    </div>

    <!-- Vista por Materias con sus Grupos -->
    <div class="materias-container">
      <div v-for="materia in materiasFiltradas" :key="materia.id" class="materia-section">
        <div class="materia-header">
          <div class="materia-info">
            <q-chip color="primary" text-color="white" size="sm" dense>{{ materia.codigo }}</q-chip>
            <h3 class="materia-nombre">{{ materia.nombre }}</h3>
            <div class="materia-meta">
              <q-chip size="xs" color="purple-2" text-color="purple-9">{{ materia.carrera_nombre }}</q-chip>
              <q-chip size="xs" color="blue-2" text-color="blue-9">{{ materia.sede_nombre }}</q-chip>
              <q-chip size="xs" outline>{{ materia.semestre }}° Sem</q-chip>
            </div>
          </div>
          <q-btn flat color="teal" icon="add" label="Agregar Grupo" size="sm" no-caps @click="agregarGrupoAMateria(materia)" />
        </div>

        <div class="grupos-grid">
          <div v-for="grupo in materia.grupos" :key="grupo.id" class="grupo-card">
            <div class="grupo-header">
              <div class="grupo-badge">
                <span class="grupo-numero">{{ grupo.numero }}</span>
              </div>
              <div class="grupo-info">
                <span class="grupo-title">Grupo {{ grupo.numero }}</span>
                <span class="grupo-campus">{{ grupo.campus_nombre }}</span>
              </div>
              <q-btn flat round dense icon="more_vert" size="sm">
                <q-menu>
                  <q-list style="min-width: 150px">
                    <q-item clickable v-close-popup @click="editarGrupo(grupo)">
                      <q-item-section avatar><q-icon name="edit" size="sm" /></q-item-section>
                      <q-item-section>Editar</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="verHorario(grupo)">
                      <q-item-section avatar><q-icon name="schedule" size="sm" /></q-item-section>
                      <q-item-section>Horario</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable v-close-popup @click="eliminarGrupo(grupo)" class="text-red">
                      <q-item-section avatar><q-icon name="delete" size="sm" color="red" /></q-item-section>
                      <q-item-section>Eliminar</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <div class="grupo-content">
              <div class="info-row">
                <q-icon name="person" size="16px" color="green" />
                <span class="docente-nombre">{{ grupo.docente_nombre || 'Sin asignar' }}</span>
              </div>
              <div class="info-row">
                <q-icon name="people" size="16px" color="blue" />
                <span>{{ grupo.estudiantes }} / {{ grupo.capacidad }} estudiantes</span>
              </div>
              <div class="info-row">
                <q-icon name="room" size="16px" color="orange" />
                <span>{{ grupo.aula || 'Sin aula' }}</span>
              </div>
            </div>

            <q-linear-progress 
              :value="grupo.estudiantes / grupo.capacidad" 
              :color="grupo.estudiantes >= grupo.capacidad ? 'red' : 'green'"
              class="q-mt-sm"
              rounded
            />
          </div>

          <div v-if="!materia.grupos?.length" class="empty-grupos">
            <q-icon name="group_off" size="32px" color="grey-5" />
            <span>Sin grupos asignados</span>
            <q-btn flat color="teal" size="sm" icon="add" label="Crear grupo" no-caps @click="agregarGrupoAMateria(materia)" />
          </div>
        </div>
      </div>

      <div v-if="materiasFiltradas.length === 0" class="empty-state">
        <q-icon name="menu_book" size="80px" color="grey-4" />
        <h3>No hay materias</h3>
        <p>Selecciona una sede y carrera para ver las materias y sus grupos</p>
      </div>
    </div>

    <!-- Dialog Crear/Editar Grupo -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="dialog-card" style="min-width: 550px;">
        <div class="dialog-header">
          <h3>
            <q-icon :name="editMode ? 'edit' : 'add_circle'" class="q-mr-sm" />
            {{ editMode ? 'Editar' : 'Nuevo' }} Grupo
          </h3>
        </div>

        <q-card-section class="q-gutter-md">
          <q-banner v-if="materiaSeleccionada" dense class="bg-purple-1 text-purple-9 q-mb-md">
            <template v-slot:avatar>
              <q-icon name="menu_book" />
            </template>
            <strong>{{ materiaSeleccionada.codigo }}</strong> - {{ materiaSeleccionada.nombre }}
          </q-banner>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-select
                v-model="form.sede_id"
                :options="sedesOptions"
                outlined
                label="Sede *"
                emit-value
                map-options
                @update:model-value="onFormSedeChange"
                :disable="!!materiaSeleccionada"
              />
            </div>
            <div class="col-6">
              <q-select
                v-model="form.campus_id"
                :options="campusFormOptions"
                outlined
                label="Campus *"
                emit-value
                map-options
                :disable="!form.sede_id"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-4">
              <q-input v-model.number="form.numero" outlined type="number" label="Número de Grupo *" min="1" />
            </div>
            <div class="col-4">
              <q-input v-model.number="form.capacidad" outlined type="number" label="Capacidad" min="1" />
            </div>
            <div class="col-4">
              <q-input v-model.number="form.estudiantes" outlined type="number" label="Inscritos" min="0" />
            </div>
          </div>

          <q-select
            v-model="form.docente_id"
            :options="docentesOptions"
            outlined
            label="Docente Asignado"
            emit-value
            map-options
            clearable
          />

          <q-input v-model="form.aula" outlined label="Aula" placeholder="Ej: Aula 301, Lab. A" />

          <q-input v-model="form.horario" outlined label="Horario" placeholder="Ej: Lun-Mie-Vie 8:00-10:00" />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" @click="closeDialog" />
          <q-btn unelevated color="teal" :label="editMode ? 'Guardar' : 'Crear Grupo'" @click="guardarGrupo" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'

const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()

const showDialog = ref(false)
const editMode = ref(false)
const materiaSeleccionada = ref(null)

const filtros = ref({
  sede: null,
  campus: null,
  carrera: null,
  semestre: null,
  gestion: 2026
})

const form = ref({
  id: null,
  materia_id: null,
  sede_id: null,
  campus_id: null,
  numero: 1,
  docente_id: null,
  capacidad: 40,
  estudiantes: 0,
  aula: '',
  horario: ''
})

// Datos de ejemplo - Materias con sus grupos
const materias = ref([
  // === MEDICINA - COCHABAMBA ===
  { 
    id: 101, 
    codigo: 'MED-101', 
    nombre: 'Anatomía I', 
    carrera_id: 2, 
    carrera_nombre: 'Medicina',
    sede_id: 1,
    sede_nombre: 'Cochabamba',
    semestre: 1,
    grupos: [
      { id: 1, numero: 1, campus_id: 1, campus_nombre: 'Campus Colonial', docente_id: 7, docente_nombre: 'Dr. Luis Vargas', estudiantes: 48, capacidad: 50, aula: 'Anfiteatro A', horario: 'Lun-Mie-Vie 7:00-9:00' },
      { id: 2, numero: 2, campus_id: 1, campus_nombre: 'Campus Colonial', docente_id: 7, docente_nombre: 'Dr. Luis Vargas', estudiantes: 45, capacidad: 50, aula: 'Anfiteatro B', horario: 'Lun-Mie-Vie 9:00-11:00' },
      { id: 3, numero: 3, campus_id: 1, campus_nombre: 'Campus Colonial', docente_id: 11, docente_nombre: 'Dr. Roberto Flores', estudiantes: 42, capacidad: 50, aula: 'Aula 301', horario: 'Mar-Jue 7:00-10:00' },
      { id: 4, numero: 4, campus_id: 1, campus_nombre: 'Campus Colonial', docente_id: 11, docente_nombre: 'Dr. Roberto Flores', estudiantes: 40, capacidad: 50, aula: 'Aula 302', horario: 'Mar-Jue 10:00-13:00' }
    ]
  },
  { 
    id: 102, 
    codigo: 'MED-102', 
    nombre: 'Biología Celular', 
    carrera_id: 2, 
    carrera_nombre: 'Medicina',
    sede_id: 1,
    sede_nombre: 'Cochabamba',
    semestre: 1,
    grupos: [
      { id: 5, numero: 1, campus_id: 1, campus_nombre: 'Campus Colonial', docente_id: 8, docente_nombre: 'Dra. María Sánchez', estudiantes: 48, capacidad: 50, aula: 'Lab. Biología', horario: 'Lun-Mie 14:00-16:00' },
      { id: 6, numero: 2, campus_id: 1, campus_nombre: 'Campus Colonial', docente_id: 8, docente_nombre: 'Dra. María Sánchez', estudiantes: 45, capacidad: 50, aula: 'Lab. Biología', horario: 'Mar-Jue 14:00-16:00' },
      { id: 7, numero: 3, campus_id: 1, campus_nombre: 'Campus Colonial', docente_id: 8, docente_nombre: 'Dra. María Sánchez', estudiantes: 42, capacidad: 50, aula: 'Lab. Biología', horario: 'Vie 8:00-12:00' }
    ]
  },
  // === MEDICINA - IVIRGARZAMA ===
  { 
    id: 103, 
    codigo: 'MED-101', 
    nombre: 'Anatomía I', 
    carrera_id: 2, 
    carrera_nombre: 'Medicina',
    sede_id: 4,
    sede_nombre: 'Ivirgarzama',
    semestre: 1,
    grupos: [
      { id: 8, numero: 1, campus_id: 8, campus_nombre: 'Campus Principal', docente_id: 12, docente_nombre: 'Dr. Juan Quispe', estudiantes: 35, capacidad: 40, aula: 'Aula Principal', horario: 'Lun-Mie-Vie 8:00-10:00' },
      { id: 9, numero: 2, campus_id: 8, campus_nombre: 'Campus Principal', docente_id: 12, docente_nombre: 'Dr. Juan Quispe', estudiantes: 32, capacidad: 40, aula: 'Aula 101', horario: 'Lun-Mie-Vie 10:00-12:00' },
      { id: 10, numero: 3, campus_id: 8, campus_nombre: 'Campus Principal', docente_id: null, docente_nombre: null, estudiantes: 28, capacidad: 40, aula: 'Aula 102', horario: '' }
    ]
  },
  // === MEDICINA - EL ALTO ===
  { 
    id: 104, 
    codigo: 'MED-101', 
    nombre: 'Anatomía I', 
    carrera_id: 2, 
    carrera_nombre: 'Medicina',
    sede_id: 5,
    sede_nombre: 'El Alto',
    semestre: 1,
    grupos: [
      { id: 11, numero: 1, campus_id: 9, campus_nombre: 'Campus Ciudad Satélite', docente_id: 14, docente_nombre: 'Dra. Carmen Huanca', estudiantes: 38, capacidad: 45, aula: 'Anfiteatro 1', horario: 'Lun-Mie-Vie 7:00-9:00' }
    ]
  },
  // === ING. SISTEMAS - COCHABAMBA ===
  { 
    id: 1, 
    codigo: 'MAT-101', 
    nombre: 'Cálculo I', 
    carrera_id: 1, 
    carrera_nombre: 'Ing. de Sistemas',
    sede_id: 1,
    sede_nombre: 'Cochabamba',
    semestre: 1,
    grupos: [
      { id: 12, numero: 1, campus_id: 2, campus_nombre: 'Campus Juan Pablo II', docente_id: 1, docente_nombre: 'Dr. Juan Pérez', estudiantes: 35, capacidad: 40, aula: 'Aula 101', horario: 'Lun-Mie-Vie 7:00-8:30' },
      { id: 13, numero: 2, campus_id: 2, campus_nombre: 'Campus Juan Pablo II', docente_id: 2, docente_nombre: 'Lic. María López', estudiantes: 32, capacidad: 40, aula: 'Aula 102', horario: 'Lun-Mie-Vie 8:30-10:00' },
      { id: 14, numero: 3, campus_id: 2, campus_nombre: 'Campus Juan Pablo II', docente_id: 1, docente_nombre: 'Dr. Juan Pérez', estudiantes: 28, capacidad: 40, aula: 'Aula 201', horario: 'Mar-Jue 7:00-9:00' }
    ]
  },
  { 
    id: 3, 
    codigo: 'PRG-101', 
    nombre: 'Programación I', 
    carrera_id: 1, 
    carrera_nombre: 'Ing. de Sistemas',
    sede_id: 1,
    sede_nombre: 'Cochabamba',
    semestre: 1,
    grupos: [
      { id: 15, numero: 1, campus_id: 2, campus_nombre: 'Campus Juan Pablo II', docente_id: 4, docente_nombre: 'Ing. Pedro García', estudiantes: 35, capacidad: 40, aula: 'Lab. 101', horario: 'Mar-Jue 9:00-11:00' },
      { id: 16, numero: 2, campus_id: 2, campus_nombre: 'Campus Juan Pablo II', docente_id: 4, docente_nombre: 'Ing. Pedro García', estudiantes: 32, capacidad: 40, aula: 'Lab. 102', horario: 'Mar-Jue 11:00-13:00' },
      { id: 17, numero: 3, campus_id: 2, campus_nombre: 'Campus Juan Pablo II', docente_id: 5, docente_nombre: 'Lic. Ana Torres', estudiantes: 28, capacidad: 40, aula: 'Lab. 103', horario: 'Vie 8:00-12:00' }
    ]
  },
  // === ING. SISTEMAS - LA PAZ ===
  { 
    id: 5, 
    codigo: 'MAT-101', 
    nombre: 'Cálculo I', 
    carrera_id: 1, 
    carrera_nombre: 'Ing. de Sistemas',
    sede_id: 2,
    sede_nombre: 'La Paz',
    semestre: 1,
    grupos: [
      { id: 18, numero: 1, campus_id: 4, campus_nombre: 'Campus Central', docente_id: 15, docente_nombre: 'Lic. Fernando Choque', estudiantes: 30, capacidad: 35, aula: 'Aula A', horario: 'Lun-Mie-Vie 8:00-9:30' },
      { id: 19, numero: 2, campus_id: 4, campus_nombre: 'Campus Central', docente_id: 15, docente_nombre: 'Lic. Fernando Choque', estudiantes: 25, capacidad: 35, aula: 'Aula B', horario: 'Lun-Mie-Vie 9:30-11:00' }
    ]
  }
])

// Datos de docentes
const docentes = ref([
  { id: 1, nombre: 'Dr. Juan Pérez' },
  { id: 2, nombre: 'Lic. María López' },
  { id: 3, nombre: 'Ing. Carlos Mendoza' },
  { id: 4, nombre: 'Ing. Pedro García' },
  { id: 5, nombre: 'Lic. Ana Torres' },
  { id: 6, nombre: 'Ing. Roberto Flores' },
  { id: 7, nombre: 'Dr. Luis Vargas' },
  { id: 8, nombre: 'Dra. María Sánchez' },
  { id: 9, nombre: 'Dr. Carlos Rojas' },
  { id: 10, nombre: 'Lic. Pedro Mamani' },
  { id: 11, nombre: 'Dr. Roberto Flores' },
  { id: 12, nombre: 'Dr. Juan Quispe' },
  { id: 13, nombre: 'Lic. Rosa Condori' },
  { id: 14, nombre: 'Dra. Carmen Huanca' },
  { id: 15, nombre: 'Lic. Fernando Choque' },
  { id: 16, nombre: 'Ing. Mario Yujra' }
])

const sedesOptions = computed(() => 
  sedesStore.sedes.map(s => ({ label: s.nombre, value: s.id }))
)

const campusFiltrados = computed(() => {
  if (!filtros.value.sede) return []
  return sedesStore.getCampusBySede(filtros.value.sede).map(c => ({ label: c.nombre, value: c.id }))
})

const campusFormOptions = computed(() => {
  if (!form.value.sede_id) return []
  return sedesStore.getCampusBySede(form.value.sede_id).map(c => ({ label: c.nombre, value: c.id }))
})

const carrerasFiltradas = computed(() => {
  return carrerasStore.carrerasActivas.map(c => ({ label: c.nombre, value: c.id }))
})

const docentesOptions = computed(() => 
  docentes.value.map(d => ({ label: d.nombre, value: d.id }))
)

const semestresOptions = [
  { label: '1° Semestre', value: 1 },
  { label: '2° Semestre', value: 2 },
  { label: '3° Semestre', value: 3 },
  { label: '4° Semestre', value: 4 },
  { label: '5° Semestre', value: 5 },
  { label: '6° Semestre', value: 6 },
  { label: '7° Semestre', value: 7 },
  { label: '8° Semestre', value: 8 },
  { label: '9° Semestre', value: 9 },
  { label: '10° Semestre', value: 10 }
]

const gestionesOptions = [
  { label: '2026', value: 2026 },
  { label: '2025', value: 2025 },
  { label: '2024', value: 2024 }
]

const materiasFiltradas = computed(() => {
  let resultado = materias.value

  if (filtros.value.sede) {
    resultado = resultado.filter(m => m.sede_id === filtros.value.sede)
  }

  if (filtros.value.carrera) {
    resultado = resultado.filter(m => m.carrera_id === filtros.value.carrera)
  }

  if (filtros.value.semestre) {
    resultado = resultado.filter(m => m.semestre === filtros.value.semestre)
  }

  return resultado
})

const totalGrupos = computed(() => 
  materiasFiltradas.value.reduce((sum, m) => sum + (m.grupos?.length || 0), 0)
)

const totalEstudiantes = computed(() => 
  materiasFiltradas.value.reduce((sum, m) => 
    sum + (m.grupos?.reduce((gs, g) => gs + g.estudiantes, 0) || 0), 0)
)

const totalDocentes = computed(() => {
  const docentesSet = new Set()
  materiasFiltradas.value.forEach(m => 
    m.grupos?.forEach(g => g.docente_id && docentesSet.add(g.docente_id))
  )
  return docentesSet.size
})

function onSedeChange() {
  filtros.value.campus = null
}

function onFormSedeChange() {
  form.value.campus_id = null
}

function openDialog() {
  editMode.value = false
  materiaSeleccionada.value = null
  form.value = {
    id: null,
    materia_id: null,
    sede_id: null,
    campus_id: null,
    numero: 1,
    docente_id: null,
    capacidad: 40,
    estudiantes: 0,
    aula: '',
    horario: ''
  }
  showDialog.value = true
}

function agregarGrupoAMateria(materia) {
  editMode.value = false
  materiaSeleccionada.value = materia
  form.value = {
    id: null,
    materia_id: materia.id,
    sede_id: materia.sede_id,
    campus_id: null,
    numero: (materia.grupos?.length || 0) + 1,
    docente_id: null,
    capacidad: 40,
    estudiantes: 0,
    aula: '',
    horario: ''
  }
  showDialog.value = true
}

function editarGrupo(grupo) {
  editMode.value = true
  const materia = materias.value.find(m => m.grupos?.some(g => g.id === grupo.id))
  materiaSeleccionada.value = materia
  form.value = {
    id: grupo.id,
    materia_id: materia?.id,
    sede_id: materia?.sede_id,
    campus_id: grupo.campus_id,
    numero: grupo.numero,
    docente_id: grupo.docente_id,
    capacidad: grupo.capacidad,
    estudiantes: grupo.estudiantes,
    aula: grupo.aula,
    horario: grupo.horario
  }
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  materiaSeleccionada.value = null
}

function guardarGrupo() {
  if (materiaSeleccionada.value) {
    const materia = materias.value.find(m => m.id === materiaSeleccionada.value.id)
    if (materia) {
      const campus = sedesStore.getCampusById(form.value.campus_id)
      const docente = docentes.value.find(d => d.id === form.value.docente_id)
      
      if (editMode.value) {
        const grupoIdx = materia.grupos.findIndex(g => g.id === form.value.id)
        if (grupoIdx !== -1) {
          materia.grupos[grupoIdx] = {
            ...materia.grupos[grupoIdx],
            campus_id: form.value.campus_id,
            campus_nombre: campus?.nombre,
            numero: form.value.numero,
            docente_id: form.value.docente_id,
            docente_nombre: docente?.nombre,
            capacidad: form.value.capacidad,
            estudiantes: form.value.estudiantes,
            aula: form.value.aula,
            horario: form.value.horario
          }
        }
      } else {
        const newId = Math.max(...materias.value.flatMap(m => m.grupos?.map(g => g.id) || [0]), 0) + 1
        materia.grupos = materia.grupos || []
        materia.grupos.push({
          id: newId,
          numero: form.value.numero,
          campus_id: form.value.campus_id,
          campus_nombre: campus?.nombre,
          docente_id: form.value.docente_id,
          docente_nombre: docente?.nombre,
          capacidad: form.value.capacidad,
          estudiantes: form.value.estudiantes,
          aula: form.value.aula,
          horario: form.value.horario
        })
      }
    }
  }
  closeDialog()
}

function verHorario(grupo) {
  console.log('Ver horario de grupo:', grupo)
}

function eliminarGrupo(grupo) {
  if (confirm(`¿Estás seguro de eliminar el Grupo ${grupo.numero}?`)) {
    materias.value.forEach(m => {
      if (m.grupos) {
        m.grupos = m.grupos.filter(g => g.id !== grupo.id)
      }
    })
  }
}
</script>

<style scoped>
.grupos-page {
  padding: 24px;
  background: var(--bg-primary);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.filters-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: block;
}

.materias-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.materia-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
}

.materia-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.materia-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.materia-nombre {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.materia-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.grupos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.grupo-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
}

.grupo-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.grupo-badge {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grupo-numero {
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
}

.grupo-info {
  flex: 1;
}

.grupo-title {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
}

.grupo-campus {
  display: block;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.grupo-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.docente-nombre {
  font-weight: 500;
  color: var(--text-primary);
}

.empty-grupos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  gap: 8px;
  color: var(--text-muted);
  border: 2px dashed var(--border-color);
  border-radius: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.empty-state h3 {
  color: var(--text-primary);
  margin: 16px 0 8px;
}

.empty-state p {
  color: var(--text-muted);
}

.dialog-card {
  background: var(--bg-secondary) !important;
  border-radius: 16px !important;
}

.dialog-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  color: white;
  margin: -16px -16px 16px -16px;
  border-radius: 16px 16px 0 0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
}

.dialog-actions {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 1024px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .stats-row { grid-template-columns: 1fr; }
  .grupos-grid { grid-template-columns: 1fr; }
}
</style>
