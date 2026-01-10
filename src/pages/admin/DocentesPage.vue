<template>
  <q-page class="docentes-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">
          <q-icon name="school" color="green" class="q-mr-sm" />
          Gestión de Docentes
        </h1>
        <p class="page-subtitle">Administra el personal docente y sus asignaciones</p>
      </div>
      <div class="header-actions">
        <q-btn outline color="primary" icon="download" label="Exportar" no-caps />
        <q-btn unelevated color="green" icon="person_add" label="Nuevo Docente" no-caps @click="openDialog()" />
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
        style="min-width: 200px;"
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
        style="min-width: 250px;"
        :disable="!filtros.sede"
      />
      <q-select
        v-model="filtros.estado"
        :options="estadosOptions"
        outlined
        dense
        label="Estado"
        emit-value
        map-options
        clearable
        style="min-width: 150px;"
      />
      <q-input
        v-model="filtros.busqueda"
        outlined
        dense
        placeholder="Buscar docente..."
        class="search-input"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- Estadísticas -->
    <div class="stats-row">
      <div class="stat-card">
        <q-icon name="school" size="28px" color="green" />
        <div class="stat-info">
          <span class="stat-value">{{ docentesFiltrados.length }}</span>
          <span class="stat-label">Docentes</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="check_circle" size="28px" color="blue" />
        <div class="stat-info">
          <span class="stat-value">{{ docentesActivos }}</span>
          <span class="stat-label">Activos</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="menu_book" size="28px" color="purple" />
        <div class="stat-info">
          <span class="stat-value">{{ totalMaterias }}</span>
          <span class="stat-label">Materias Asignadas</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="groups" size="28px" color="orange" />
        <div class="stat-info">
          <span class="stat-value">{{ totalGrupos }}</span>
          <span class="stat-label">Grupos Atendidos</span>
        </div>
      </div>
    </div>

    <!-- Grid de Docentes -->
    <div class="docentes-grid">
      <div v-for="docente in docentesFiltrados" :key="docente.id" class="docente-card">
        <div class="docente-header">
          <q-avatar size="60px" :color="docente.activo ? 'green' : 'grey'" text-color="white" class="docente-avatar">
            {{ docente.iniciales }}
          </q-avatar>
          <div class="docente-info">
            <h3 class="docente-nombre">{{ docente.titulo }} {{ docente.nombre }}</h3>
            <p class="docente-email">{{ docente.email }}</p>
            <div class="docente-badges">
              <q-chip 
                :color="docente.activo ? 'green-2' : 'grey-3'" 
                :text-color="docente.activo ? 'green-9' : 'grey-7'"
                size="sm" 
                dense
              >
                {{ docente.activo ? 'Activo' : 'Inactivo' }}
              </q-chip>
              <q-chip color="blue-2" text-color="blue-9" size="sm" dense>
                {{ docente.tipo }}
              </q-chip>
            </div>
          </div>
          <q-btn flat round dense icon="more_vert" size="sm">
            <q-menu>
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup @click="openDialog(docente)">
                  <q-item-section avatar><q-icon name="edit" size="sm" /></q-item-section>
                  <q-item-section>Editar</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="verCargaHoraria(docente)">
                  <q-item-section avatar><q-icon name="schedule" size="sm" /></q-item-section>
                  <q-item-section>Carga Horaria</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="verHistorial(docente)">
                  <q-item-section avatar><q-icon name="history" size="sm" /></q-item-section>
                  <q-item-section>Historial</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="toggleEstado(docente)">
                  <q-item-section avatar>
                    <q-icon :name="docente.activo ? 'block' : 'check_circle'" size="sm" :color="docente.activo ? 'orange' : 'green'" />
                  </q-item-section>
                  <q-item-section>{{ docente.activo ? 'Desactivar' : 'Activar' }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <q-separator class="q-my-md" />

        <div class="docente-stats">
          <div class="stat-box">
            <span class="stat-number">{{ docente.materias?.length || 0 }}</span>
            <span class="stat-text">Materias</span>
          </div>
          <div class="stat-box">
            <span class="stat-number">{{ docente.grupos?.length || 0 }}</span>
            <span class="stat-text">Grupos</span>
          </div>
          <div class="stat-box">
            <span class="stat-number">{{ docente.horas_semanales || 0 }}</span>
            <span class="stat-text">Hrs/Sem</span>
          </div>
        </div>

        <div class="docente-materias q-mt-md">
          <p class="section-title">Materias Asignadas</p>
          <div class="materias-chips">
            <q-chip 
              v-for="materia in docente.materias?.slice(0, 3)" 
              :key="materia"
              size="sm"
              color="purple-2"
              text-color="purple-9"
              dense
            >
              {{ materia }}
            </q-chip>
            <q-chip 
              v-if="docente.materias?.length > 3"
              size="sm"
              color="grey-3"
              text-color="grey-7"
              dense
            >
              +{{ docente.materias.length - 3 }} más
            </q-chip>
            <span v-if="!docente.materias?.length" class="text-grey-5 text-caption">
              Sin materias asignadas
            </span>
          </div>
        </div>

        <div class="docente-contact q-mt-md">
          <div class="contact-item">
            <q-icon name="phone" size="14px" color="grey-6" />
            <span>{{ docente.telefono || 'No registrado' }}</span>
          </div>
          <div class="contact-item">
            <q-icon name="location_on" size="14px" color="grey-6" />
            <span>{{ docente.sede_nombre || 'Sin asignar' }}</span>
          </div>
        </div>
      </div>

      <div v-if="docentesFiltrados.length === 0" class="empty-state">
        <q-icon name="school" size="80px" color="grey-4" />
        <h3>No hay docentes</h3>
        <p>Registra un nuevo docente para comenzar</p>
        <q-btn unelevated color="green" icon="person_add" label="Nuevo Docente" no-caps @click="openDialog()" />
      </div>
    </div>

    <!-- Dialog Crear/Editar Docente -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="dialog-card" style="min-width: 650px;">
        <div class="dialog-header" style="background: linear-gradient(135deg, #22c55e, #16a34a);">
          <h3>
            <q-icon :name="editMode ? 'edit' : 'person_add'" class="q-mr-sm" />
            {{ editMode ? 'Editar' : 'Nuevo' }} Docente
          </h3>
        </div>

        <q-card-section>
          <q-tabs v-model="formTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="left">
            <q-tab name="personal" label="Datos Personales" no-caps />
            <q-tab name="academico" label="Información Académica" no-caps />
            <q-tab name="contacto" label="Contacto" no-caps />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="formTab" animated class="q-pt-md">
            <q-tab-panel name="personal" class="q-gutter-md q-pa-none q-pt-md">
              <div class="row q-col-gutter-md">
                <div class="col-3">
                  <q-select
                    v-model="form.titulo"
                    :options="titulosOptions"
                    outlined
                    label="Título"
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-9">
                  <q-input v-model="form.nombre" outlined label="Nombre Completo *" />
                </div>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-input v-model="form.ci" outlined label="CI *" />
                </div>
                <div class="col-6">
                  <q-input v-model="form.fecha_nacimiento" outlined type="date" label="Fecha de Nacimiento" />
                </div>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-select
                    v-model="form.genero"
                    :options="generosOptions"
                    outlined
                    label="Género"
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-6">
                  <q-select
                    v-model="form.estado_civil"
                    :options="estadoCivilOptions"
                    outlined
                    label="Estado Civil"
                    emit-value
                    map-options
                  />
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="academico" class="q-gutter-md q-pa-none q-pt-md">
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-select
                    v-model="form.tipo"
                    :options="tiposDocenteOptions"
                    outlined
                    label="Tipo de Contrato *"
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-6">
                  <q-select
                    v-model="form.grado_academico"
                    :options="gradosAcademicosOptions"
                    outlined
                    label="Grado Académico"
                    emit-value
                    map-options
                  />
                </div>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-select
                    v-model="form.sede_id"
                    :options="sedesOptions"
                    outlined
                    label="Sede *"
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-6">
                  <q-select
                    v-model="form.carreras"
                    :options="carrerasOptions"
                    outlined
                    label="Carreras"
                    emit-value
                    map-options
                    multiple
                    use-chips
                  />
                </div>
              </div>

              <q-input v-model="form.especialidad" outlined label="Especialidad" placeholder="Ej: Inteligencia Artificial, Bases de Datos" />

              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-input v-model="form.fecha_ingreso" outlined type="date" label="Fecha de Ingreso" />
                </div>
                <div class="col-6">
                  <q-input v-model.number="form.horas_semanales" outlined type="number" label="Horas Semanales Máx." min="0" />
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="contacto" class="q-gutter-md q-pa-none q-pt-md">
              <q-input v-model="form.email" outlined type="email" label="Correo Electrónico *" />

              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-input v-model="form.telefono" outlined label="Teléfono" />
                </div>
                <div class="col-6">
                  <q-input v-model="form.celular" outlined label="Celular" />
                </div>
              </div>

              <q-input v-model="form.direccion" outlined type="textarea" rows="2" label="Dirección" />
            </q-tab-panel>
          </q-tab-panels>

          <q-toggle v-model="form.activo" label="Docente activo" class="q-mt-md" />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" @click="closeDialog" />
          <q-btn unelevated color="green" :label="editMode ? 'Guardar Cambios' : 'Registrar Docente'" @click="guardarDocente" />
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
const formTab = ref('personal')

const filtros = ref({
  sede: null,
  carrera: null,
  estado: null,
  busqueda: ''
})

const form = ref({
  id: null,
  titulo: 'Lic.',
  nombre: '',
  ci: '',
  fecha_nacimiento: '',
  genero: null,
  estado_civil: null,
  tipo: 'Tiempo Completo',
  grado_academico: null,
  sede_id: null,
  carreras: [],
  especialidad: '',
  fecha_ingreso: '',
  horas_semanales: 40,
  email: '',
  telefono: '',
  celular: '',
  direccion: '',
  activo: true
})

// Datos de ejemplo
const docentes = ref([
  { id: 1, titulo: 'Dr.', nombre: 'Juan Pérez Mendoza', iniciales: 'JP', email: 'jperez@unitepc.edu.bo', telefono: '4-4256789', tipo: 'Tiempo Completo', sede_id: 1, sede_nombre: 'Cochabamba', materias: ['Cálculo I', 'Cálculo II', 'Álgebra'], grupos: ['1A', '1B', '2A'], horas_semanales: 40, activo: true },
  { id: 2, titulo: 'Lic.', nombre: 'María López García', iniciales: 'ML', email: 'mlopez@unitepc.edu.bo', telefono: '4-4256790', tipo: 'Tiempo Completo', sede_id: 1, sede_nombre: 'Cochabamba', materias: ['Cálculo I'], grupos: ['1B'], horas_semanales: 20, activo: true },
  { id: 3, titulo: 'Ing.', nombre: 'Carlos Mendoza Ríos', iniciales: 'CM', email: 'cmendoza@unitepc.edu.bo', telefono: '4-4256791', tipo: 'Tiempo Completo', sede_id: 1, sede_nombre: 'Cochabamba', materias: ['Física I', 'Física II'], grupos: ['1A', '1B'], horas_semanales: 35, activo: true },
  { id: 4, titulo: 'Ing.', nombre: 'Pedro García Flores', iniciales: 'PG', email: 'pgarcia@unitepc.edu.bo', telefono: '4-4256792', tipo: 'Tiempo Completo', sede_id: 1, sede_nombre: 'Cochabamba', materias: ['Programación I', 'Programación II', 'Base de Datos'], grupos: ['1A', '2A', '2B'], horas_semanales: 40, activo: true },
  { id: 5, titulo: 'Lic.', nombre: 'Ana Torres Vargas', iniciales: 'AT', email: 'atorres@unitepc.edu.bo', telefono: '4-4256793', tipo: 'Medio Tiempo', sede_id: 1, sede_nombre: 'Cochabamba', materias: ['Programación II'], grupos: ['2B'], horas_semanales: 20, activo: true },
  { id: 6, titulo: 'Ing.', nombre: 'Roberto Flores Mamani', iniciales: 'RF', email: 'rflores@unitepc.edu.bo', telefono: '4-4256794', tipo: 'Tiempo Completo', sede_id: 1, sede_nombre: 'Cochabamba', materias: ['Base de Datos I'], grupos: ['3A'], horas_semanales: 30, activo: true },
  { id: 7, titulo: 'Dr.', nombre: 'Luis Vargas Condori', iniciales: 'LV', email: 'lvargas@unitepc.edu.bo', telefono: '2-2345678', tipo: 'Tiempo Completo', sede_id: 2, sede_nombre: 'La Paz', materias: ['Anatomía I', 'Anatomía II'], grupos: ['1A'], horas_semanales: 40, activo: true },
  { id: 8, titulo: 'Lic.', nombre: 'Carmen Quispe Huanca', iniciales: 'CQ', email: 'cquispe@unitepc.edu.bo', telefono: '3-3456789', tipo: 'Por Horas', sede_id: 3, sede_nombre: 'Santa Cruz', materias: [], grupos: [], horas_semanales: 0, activo: false }
])

const sedesOptions = computed(() => 
  sedesStore.sedes.map(s => ({ label: s.nombre, value: s.id }))
)

const carrerasFiltradas = computed(() => {
  if (!filtros.value.sede) return []
  return carrerasStore.getCarrerasBySede(filtros.value.sede).map(c => ({ label: c.nombre, value: c.id }))
})

const carrerasOptions = computed(() => 
  carrerasStore.carreras.map(c => ({ label: c.nombre, value: c.id }))
)

const estadosOptions = [
  { label: 'Activo', value: true },
  { label: 'Inactivo', value: false }
]

const titulosOptions = [
  { label: 'Lic.', value: 'Lic.' },
  { label: 'Ing.', value: 'Ing.' },
  { label: 'Dr.', value: 'Dr.' },
  { label: 'Dra.', value: 'Dra.' },
  { label: 'Msc.', value: 'Msc.' },
  { label: 'PhD.', value: 'PhD.' }
]

const generosOptions = [
  { label: 'Masculino', value: 'M' },
  { label: 'Femenino', value: 'F' }
]

const estadoCivilOptions = [
  { label: 'Soltero/a', value: 'soltero' },
  { label: 'Casado/a', value: 'casado' },
  { label: 'Divorciado/a', value: 'divorciado' },
  { label: 'Viudo/a', value: 'viudo' }
]

const tiposDocenteOptions = [
  { label: 'Tiempo Completo', value: 'Tiempo Completo' },
  { label: 'Medio Tiempo', value: 'Medio Tiempo' },
  { label: 'Por Horas', value: 'Por Horas' },
  { label: 'Invitado', value: 'Invitado' }
]

const gradosAcademicosOptions = [
  { label: 'Licenciatura', value: 'licenciatura' },
  { label: 'Maestría', value: 'maestria' },
  { label: 'Doctorado', value: 'doctorado' },
  { label: 'Post-Doctorado', value: 'postdoctorado' }
]

const docentesFiltrados = computed(() => {
  let resultado = docentes.value

  if (filtros.value.sede) {
    resultado = resultado.filter(d => d.sede_id === filtros.value.sede)
  }

  if (filtros.value.estado !== null) {
    resultado = resultado.filter(d => d.activo === filtros.value.estado)
  }

  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter(d => 
      d.nombre.toLowerCase().includes(busqueda) || 
      d.email.toLowerCase().includes(busqueda)
    )
  }

  return resultado
})

const docentesActivos = computed(() => 
  docentesFiltrados.value.filter(d => d.activo).length
)

const totalMaterias = computed(() => 
  docentesFiltrados.value.reduce((sum, d) => sum + (d.materias?.length || 0), 0)
)

const totalGrupos = computed(() => 
  docentesFiltrados.value.reduce((sum, d) => sum + (d.grupos?.length || 0), 0)
)

function openDialog(docente = null) {
  formTab.value = 'personal'
  if (docente) {
    editMode.value = true
    form.value = { ...docente }
  } else {
    editMode.value = false
    form.value = {
      id: null,
      titulo: 'Lic.',
      nombre: '',
      ci: '',
      fecha_nacimiento: '',
      genero: null,
      estado_civil: null,
      tipo: 'Tiempo Completo',
      grado_academico: null,
      sede_id: null,
      carreras: [],
      especialidad: '',
      fecha_ingreso: '',
      horas_semanales: 40,
      email: '',
      telefono: '',
      celular: '',
      direccion: '',
      activo: true
    }
  }
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
}

function guardarDocente() {
  if (editMode.value) {
    const idx = docentes.value.findIndex(d => d.id === form.value.id)
    if (idx !== -1) {
      docentes.value[idx] = { ...docentes.value[idx], ...form.value }
    }
  } else {
    const newId = Math.max(...docentes.value.map(d => d.id), 0) + 1
    const sede = sedesStore.sedes.find(s => s.id === form.value.sede_id)
    const iniciales = form.value.nombre.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase()
    docentes.value.push({ 
      ...form.value, 
      id: newId,
      iniciales,
      sede_nombre: sede?.nombre || '',
      materias: [],
      grupos: []
    })
  }
  closeDialog()
}

function toggleEstado(docente) {
  docente.activo = !docente.activo
}

function verCargaHoraria(docente) {
  console.log('Ver carga horaria:', docente)
}

function verHistorial(docente) {
  console.log('Ver historial:', docente)
}
</script>

<style scoped>
.docentes-page {
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

.header-actions {
  display: flex;
  gap: 12px;
}

.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
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

.docentes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

.docente-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s ease;
}

.docente-card:hover {
  border-color: var(--primary);
}

.docente-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.docente-avatar {
  font-size: 1.25rem;
  font-weight: 600;
}

.docente-info {
  flex: 1;
}

.docente-nombre {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.docente-email {
  margin: 2px 0 8px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.docente-badges {
  display: flex;
  gap: 8px;
}

.docente-stats {
  display: flex;
  gap: 16px;
}

.stat-box {
  flex: 1;
  text-align: center;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 8px;
}

.stat-number {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-text {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0 0 8px 0;
}

.materias-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.docente-contact {
  display: flex;
  gap: 16px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.empty-state {
  grid-column: 1 / -1;
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
  margin-bottom: 24px;
}

.dialog-card {
  background: var(--bg-secondary) !important;
  border-radius: 16px !important;
}

.dialog-header {
  padding: 20px 24px;
  color: white;
  margin: -16px -16px 0 -16px;
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
  .docentes-grid { grid-template-columns: 1fr; }
}
</style>
