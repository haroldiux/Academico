<template>
  <q-page class="q-pa-lg">
    <!-- Page Header -->
    <div class="row items-center q-mb-lg animate-in">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="menu_book" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Plan de Estudios</span>
        </h4>
        <div class="row items-center q-gutter-sm q-mt-xs">
          <p class="q-ma-none" style="color: var(--text-secondary);">
            Vista general de asignaturas por semestre
          </p>
          <q-chip v-if="authStore.rol === 'DIRECCION_ACADEMICA' || authStore.rol === 'VICERRECTOR_SEDE'" 
                  color="primary" text-color="white" size="sm" icon="apartment">
            Sede: Cochabamba
          </q-chip>
        </div>
      </div>
      <div class="col-auto">
        <q-btn label="Descargar Malla" icon="download" color="primary" flat />
      </div>
    </div>

    <!-- Filters -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-select
          v-model="filtros.carrera"
          :options="carrerasOptions"
          label="Carrera"
          outlined
          dense
          bg-color="white"
          emit-value
          map-options
          :disable="authStore.rol === 'DIRECTOR_CARRERA'"
        >
          <template v-slot:prepend>
            <q-icon name="school" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-8">
        <q-input
          v-model="filtros.buscar"
          label="Buscar asignatura..."
          outlined
          dense
          bg-color="white"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Stats -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-primary">54</div>
                <div class="text-caption text-grey-7">Total Asignaturas</div>
              </div>
              <q-icon name="library_books" size="40px" color="primary" opacity="0.2" />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-positive">48</div>
                <div class="text-caption text-grey-7">Asignadas con Docente</div>
              </div>
              <q-icon name="person_add" size="40px" color="positive" />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-warning">6</div>
                <div class="text-caption text-grey-7">Vacantes / Por Designar</div>
              </div>
              <q-icon name="person_off" size="40px" color="warning" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Semesters List -->
    <div class="q-gutter-md">
      <div v-for="semestre in semestresFiltrados" :key="semestre.id">
        <q-expansion-item
          header-class="bg-white text-primary text-weight-bold shadow-1"
          style="border-radius: 8px; overflow: hidden;"
          default-opened
        >
          <template v-slot:header>
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white" size="32px" font-size="14px">
                {{ semestre.numero }}°
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6">{{ semestre.nombre }}</q-item-label>
              <q-item-label caption>{{ semestre.asignaturas.length }} asignaturas - {{ semestre.horasTotales }} horas</q-item-label>
            </q-item-section>
          </template>

          <q-card>
            <q-card-section class="q-pa-md bg-grey-1">
              <q-table
                :rows="semestre.asignaturas"
                :columns="columnasAsignaturas"
                row-key="codigo"
                flat
                bordered
                separator="cell"
                class="bg-white rounded-borders"
                hide-bottom
                :pagination="{ rowsPerPage: 0 }"
              >
                <!-- Columna Docente -->
                <template v-slot:body-cell-docente="props">
                  <q-td :props="props">
                    <div v-if="props.row.docente" class="row items-center no-wrap">
                      <q-avatar size="28px" color="blue-grey-1" text-color="primary" class="q-mr-sm">
                        {{ props.row.docente.iniciales }}
                      </q-avatar>
                      <div>
                        <div class="text-weight-medium text-body2">{{ props.row.docente.nombre }}</div>
                      </div>
                    </div>
                    <div v-else class="text-grey-5 text-italic">
                      <q-icon name="warning" color="warning" class="q-mr-xs" />
                      Sin asignar
                    </div>
                  </q-td>
                </template>

                <!-- Columna Estado -->
                <template v-slot:body-cell-estado="props">
                  <q-td :props="props">
                    <q-chip
                      :color="props.row.docente ? 'positive' : 'warning'"
                      :text-color="props.row.docente ? 'white' : 'black'"
                      size="sm"
                    >
                      {{ props.row.docente ? 'Asignada' : 'Vacante' }}
                    </q-chip>
                  </q-td>
                </template>

                <!-- Columna Acciones -->
                <template v-slot:body-cell-acciones="props">
                  <q-td :props="props">
                    <q-btn flat round dense icon="visibility" color="primary" size="sm" :to="`/documentacion?materia=${props.row.id}`">
                      <q-tooltip>Ver Documentación</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="assignment" color="secondary" size="sm">
                      <q-tooltip>Ver Sílabo</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()

// Filtros
const filtros = ref({
  carrera: 'todas',
  buscar: ''
})

const carrerasOptions = [
  { label: 'Todas las carreras', value: 'todas' },
  { label: 'Medicina', value: 'medicina' },
  { label: 'Odontología', value: 'odontologia' }
]

onMounted(() => {
  if (authStore.rol === 'DIRECTOR_CARRERA') {
    filtros.value.carrera = 'medicina' // Mock: En producción usar authStore.carreraId
  }
})

// Columnas
const columnasAsignaturas = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true, style: 'width: 100px' },
  { name: 'asignatura', label: 'Asignatura', field: 'nombre', align: 'left', sortable: true },
  { name: 'horas', label: 'Horas', field: 'horas', align: 'center', style: 'width: 80px' },
  { name: 'docente', label: 'Docente Principal', field: 'docente', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', style: 'width: 100px' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center', style: 'width: 100px' }
]

// Datos Mock
const semestresData = ref([
  {
    id: 1,
    numero: 1,
    nombre: 'Primer Semestre',
    horasTotales: 120, // Suma ficticia
    asignaturas: [
      { id: 101, codigo: 'MED-111', nombre: 'Anatomía Humana I', horas: 80, docente: { nombre: 'Andrea Sonia Salinas Gil', iniciales: 'AS' } },
      { id: 102, codigo: 'MED-112', nombre: 'Histología Humana I', horas: 60, docente: { nombre: 'Carmen Daniela Davalos Zelada', iniciales: 'CD' } },
      { id: 103, codigo: 'MED-113', nombre: 'Genética y Embriología', horas: 60, docente: { nombre: 'Carlos René Seleme Trigo', iniciales: 'CS' } },
      { id: 104, codigo: 'MED-114', nombre: 'Bioestadística', horas: 40, docente: { nombre: 'María Elena Fernández López', iniciales: 'MF' } },
      { id: 105, codigo: 'MED-115', nombre: 'Inglés Médico I', horas: 40, docente: null } // Vacante
    ]
  },
  {
    id: 2,
    numero: 2,
    nombre: 'Segundo Semestre',
    horasTotales: 140,
    asignaturas: [
      { id: 201, codigo: 'MED-121', nombre: 'Anatomía Humana II', horas: 80, docente: { nombre: 'Andrea Sonia Salinas Gil', iniciales: 'AS' } },
      { id: 202, codigo: 'MED-122', nombre: 'Histología Humana II', horas: 60, docente: { nombre: 'Carmen Daniela Davalos Zelada', iniciales: 'CD' } },
      { id: 203, codigo: 'MED-123', nombre: 'Salud Pública I', horas: 40, docente: null }
    ]
  },
  {
    id: 3,
    numero: 3,
    nombre: 'Tercer Semestre',
    horasTotales: 100,
    asignaturas: [
      { id: 301, codigo: 'MED-213', nombre: 'Fisiología', horas: 80, docente: { nombre: 'Pamela Katherine Gutierrez', iniciales: 'PG' } },
      { id: 302, codigo: 'MED-214', nombre: 'Parasitología', horas: 60, docente: { nombre: 'Roberto Ángel Martínez', iniciales: 'RM' } }
    ]
  }
])

// Computed para filtrado
const semestresFiltrados = computed(() => {
  const busqueda = filtros.value.buscar.toLowerCase()
  
  if (!busqueda) return semestresData.value

  // Filtrar semestres que contengan asignaturas que coincidan con la búsqueda
  return semestresData.value.map(semestre => {
    const asignaturasFiltradas = semestre.asignaturas.filter(a => 
      a.nombre.toLowerCase().includes(busqueda) || 
      a.codigo.toLowerCase().includes(busqueda) ||
      (a.docente && a.docente.nombre.toLowerCase().includes(busqueda))
    )
    
    // Devolvemos el semestre con SOLO las asignaturas filtradas, si tiene alguna
    if (asignaturasFiltradas.length > 0) {
      return {
        ...semestre,
        asignaturas: asignaturasFiltradas
      }
    }
    return null
  }).filter(s => s !== null) // Eliminar semestres vacíos
})

</script>

<style scoped>
.text-gradient {
  background: linear-gradient(45deg, var(--q-primary), var(--q-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.metric-card {
  transition: transform 0.2s;
}
.metric-card:hover {
  transform: translateY(-2px);
}
</style>
