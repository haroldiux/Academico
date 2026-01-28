<template>
  <q-page class="docentes-page">
    <!-- Header -->
    <div class="page-header q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h4 class="text-h4 text-weight-bold q-mb-xs">Gestión de Docentes</h4>
          <div class="row items-center q-gutter-sm">
            <p class="text-grey-7 q-mb-none">Docentes asignados a tu carrera</p>
            <q-chip v-if="authStore.rol === 'DIRECCION_ACADEMICA' || authStore.rol === 'VICERRECTOR_SEDE'"
              color="primary" text-color="white" size="sm" icon="apartment">
              Sede: Cochabamba
            </q-chip>
          </div>
        </div>
        <q-btn color="primary" icon="download" label="Exportar Lista" @click="exportarLista" />
      </div>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-4" v-if="authStore.rol !== 'DIRECTOR_CARRERA'">
            <q-select v-model="filtros.carrera" :options="carrerasOptions" label="Carrera" emit-value map-options
              outlined dense />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model="filtros.buscar" label="Buscar docente..." outlined dense clearable>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <q-select v-model="filtros.estado" :options="estadoOptions" label="Estado" emit-value map-options outlined
              dense />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Métricas -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-primary">{{ metricas.totalDocentes }}</div>
                <div class="text-caption text-grey-7">Total Docentes</div>
              </div>
              <q-icon name="people" size="40px" color="primary" />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-positive">{{ metricas.alDia }}</div>
                <div class="text-caption text-grey-7">Al Día</div>
              </div>
              <q-icon name="check_circle" size="40px" color="positive" />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-warning">{{ metricas.conRetraso }}</div>
                <div class="text-caption text-grey-7">Con Retraso</div>
              </div>
              <q-icon name="warning" size="40px" color="warning" />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-negative">{{ metricas.sinDocumentacion }}</div>
                <div class="text-caption text-grey-7">Sin Documentación</div>
              </div>
              <q-icon name="description" size="40px" color="negative" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Lista de Docentes (Expandible con detalle por materia) -->
    <q-card flat bordered>
      <q-list separator>
        <q-expansion-item v-for="docente in docentesFiltrados" :key="docente.id" group="docentes"
          header-class="bg-white">
          <template v-slot:header>
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white" size="42px">
                {{ docente.iniciales }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ docente.nombre }}</q-item-label>
              <q-item-label caption>CI: {{ docente.ci }} • {{ docente.materiasData.length }} materias
                asignadas</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row q-gutter-sm items-center">
                <q-chip :color="getEstadoGeneralColor(docente)" text-color="white" size="sm">
                  {{ getEstadoGeneral(docente) }}
                </q-chip>
                <q-btn flat round dense icon="assessment" color="primary" @click.stop="generarReporteDocente(docente)">
                  <q-tooltip>Generar Reporte Completo</q-tooltip>
                </q-btn>
                <q-btn flat round dense icon="email" color="grey" @click.stop="contactarDocente(docente)">
                  <q-tooltip>Contactar</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </template>

          <!-- Detalle por Materia -->
          <q-card class="bg-grey-1" flat bordered>
            <q-card-section class="q-pa-md">
              <q-table :rows="docente.materiasData" :columns="columnasMateria" row-key="codigo" flat bordered
                separator="cell" dense hide-bottom class="bg-white rounded-borders">
                <!-- Columna Materia -->
                <template v-slot:body-cell-materia="props">
                  <q-td :props="props">
                    <div>
                      <div class="text-weight-medium">{{ props.row.nombre }}</div>
                      <div class="text-caption text-grey-6">{{ props.row.codigo }} • Grupo {{ props.row.grupo }}</div>
                    </div>
                  </q-td>
                </template>

                <!-- Columna Avance Temas -->
                <template v-slot:body-cell-avanceTemas="props">
                  <q-td :props="props">
                    <div class="row items-center no-wrap justify-center" style="min-width: 120px;">
                      <q-linear-progress :value="props.row.avanceTemas / 100"
                        :color="getColorPorcentaje(props.row.avanceTemas)" class="q-mr-sm" rounded size="8px"
                        style="width: 60px;" />
                      <span class="text-caption">{{ props.row.avanceTemas }}%</span>
                    </div>
                  </q-td>
                </template>

                <!-- Columna Asistencia -->
                <template v-slot:body-cell-asistencia="props">
                  <q-td :props="props">
                    <q-chip :color="getColorPorcentaje(props.row.asistencia)"
                      :text-color="getTextColor(getColorPorcentaje(props.row.asistencia))" size="sm">
                      {{ props.row.asistencia }}%
                    </q-chip>
                  </q-td>
                </template>

                <!-- Columna Documentación -->
                <template v-slot:body-cell-documentacion="props">
                  <q-td :props="props">
                    <div class="row q-gutter-xs justify-center">
                      <q-icon name="description" :color="props.row.pac ? 'positive' : 'negative'" size="20px">
                        <q-tooltip>PAC: {{ props.row.pac ? 'Entregado' : 'Pendiente' }}</q-tooltip>
                      </q-icon>
                      <q-icon name="class" :color="props.row.planClase ? 'positive' : 'negative'" size="20px">
                        <q-tooltip>Plan de Clase: {{ props.row.planClase ? 'Entregado' : 'Pendiente' }}</q-tooltip>
                      </q-icon>
                      <q-icon name="book" :color="props.row.syllabus ? 'positive' : 'negative'" size="20px">
                        <q-tooltip>Syllabus: {{ props.row.syllabus ? 'Entregado' : 'Pendiente' }}</q-tooltip>
                      </q-icon>
                    </div>
                  </q-td>
                </template>

                <!-- Columna Estado -->
                <template v-slot:body-cell-estado="props">
                  <q-td :props="props">
                    <q-chip :color="getColorEstado(props.row.estado)"
                      :text-color="getTextColor(getColorEstado(props.row.estado))" size="sm">
                      {{ props.row.estado }}
                    </q-chip>
                  </q-td>
                </template>

                <!-- Columna Acciones -->
                <template v-slot:body-cell-acciones="props">
                  <q-td :props="props">
                    <q-btn flat round dense icon="visibility" color="primary" size="sm"
                      @click="verDetalleMateria(docente, props.row)">
                      <q-tooltip>Ver Detalle</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="download" color="grey" size="sm"
                      @click="descargarReporteMateria(docente, props.row)">
                      <q-tooltip>Descargar Reporte</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </q-card>

    <!-- Dialog Detalle Materia -->
    <q-dialog v-model="dialogDetalle" persistent>
      <q-card style="width: 600px; max-width: 90vw;">
        <q-bar class="bg-primary text-white">
          <q-icon name="menu_book" />
          <div class="q-ml-sm">Detalle de Materia</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>

        <q-card-section v-if="detalleSeleccionado">
          <div class="row items-center q-mb-lg">
            <q-avatar color="primary" text-color="white" size="56px" icon="menu_book" class="q-mr-md" />
            <div>
              <div class="text-h6 text-weight-bold">{{ detalleSeleccionado.materia.nombre }}</div>
              <div class="text-caption text-grey-6">
                {{ detalleSeleccionado.materia.codigo }} • Grupo {{ detalleSeleccionado.materia.grupo }} •
                Docente: {{ detalleSeleccionado.docente.nombre }}
              </div>
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <div class="text-subtitle2 text-weight-bold q-mb-sm">Seguimiento de la Materia</div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <div class="text-caption text-grey-6">Avance de Temas</div>
              <q-linear-progress :value="detalleSeleccionado.materia.avanceTemas / 100"
                :color="getColorPorcentaje(detalleSeleccionado.materia.avanceTemas)" class="q-mb-xs" rounded
                size="12px" />
              <div class="text-body2 text-weight-bold">{{ detalleSeleccionado.materia.avanceTemas }}%</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Asistencia Promedio</div>
              <q-linear-progress :value="detalleSeleccionado.materia.asistencia / 100"
                :color="getColorPorcentaje(detalleSeleccionado.materia.asistencia)" class="q-mb-xs" rounded
                size="12px" />
              <div class="text-body2 text-weight-bold">{{ detalleSeleccionado.materia.asistencia }}%</div>
            </div>
          </div>

          <div class="text-subtitle2 text-weight-bold q-mb-sm">Estado de Documentación</div>
          <q-list dense bordered class="rounded-borders">
            <q-item>
              <q-item-section avatar>
                <q-icon :name="detalleSeleccionado.materia.pac ? 'check_circle' : 'cancel'"
                  :color="detalleSeleccionado.materia.pac ? 'positive' : 'negative'" />
              </q-item-section>
              <q-item-section>
                <q-item-label>PAC (Plan Analítico de Contenidos)</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip :color="detalleSeleccionado.materia.pac ? 'positive' : 'negative'" text-color="white" size="sm">
                  {{ detalleSeleccionado.materia.pac ? 'Entregado' : 'Pendiente' }}
                </q-chip>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon :name="detalleSeleccionado.materia.planClase ? 'check_circle' : 'cancel'"
                  :color="detalleSeleccionado.materia.planClase ? 'positive' : 'negative'" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Plan de Clase</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip :color="detalleSeleccionado.materia.planClase ? 'positive' : 'negative'" text-color="white"
                  size="sm">
                  {{ detalleSeleccionado.materia.planClase ? 'Entregado' : 'Pendiente' }}
                </q-chip>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon :name="detalleSeleccionado.materia.syllabus ? 'check_circle' : 'cancel'"
                  :color="detalleSeleccionado.materia.syllabus ? 'positive' : 'negative'" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Syllabus</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip :color="detalleSeleccionado.materia.syllabus ? 'positive' : 'negative'" text-color="white"
                  size="sm">
                  {{ detalleSeleccionado.materia.syllabus ? 'Entregado' : 'Pendiente' }}
                </q-chip>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="text-subtitle2 text-weight-bold q-mt-md q-mb-sm">Estado General</div>
          <q-chip :color="getColorEstado(detalleSeleccionado.materia.estado)"
            :text-color="getTextColor(getColorEstado(detalleSeleccionado.materia.estado))" size="md" icon="info">
            {{ detalleSeleccionado.materia.estado }}
          </q-chip>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
          <q-btn color="primary" icon="download" label="Descargar Reporte" @click="descargarReporteDetalle" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useDocentesStore } from 'src/stores/docentes'

const $q = useQuasar()
const authStore = useAuthStore()
const docentesStore = useDocentesStore()

// Filtros
const filtros = ref({
  carrera: null,
  buscar: '',
  estado: 'todos'
})

// Dialogs
const dialogDetalle = ref(false)
const detalleSeleccionado = ref(null)

// Opciones
const carrerasOptions = computed(() => {
  if (authStore.rol === 'DIRECTOR_CARRERA' && authStore.usuarioActual?.director?.carrera) {
    return [{
      label: authStore.usuarioActual.director.carrera.nombre,
      value: authStore.usuarioActual.director.carrera.id
    }]
  }
  // For Admin/Vicerrector, could fetch all. For now simple or mock fallback if needed, but better use real.
  // Assuming authStore has accessible careers list or similar.
  // If not, we might default to Current User's Context.
  return [{ label: 'Mi Carrera', value: authStore.usuarioActual?.director?.carrera_id }]
})

const estadoOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Al día', value: 'al_dia' },
  { label: 'Con retraso', value: 'retraso' },
  { label: 'Sin documentación', value: 'sin_doc' }
]

// Métricas
const metricas = ref({
  totalDocentes: 0,
  alDia: 0,
  conRetraso: 0,
  sinDocumentacion: 0
})

// Loading State
const loading = ref(false)

// Function to fetch data
const cargarDatos = async () => {
  loading.value = true
  try {
    const carreraId = filtros.value.carrera || authStore.usuarioActual?.director?.carrera_id;

    const params = {
      sede_id: authStore.sedeId, // Or derive from user
      carrera_id: carreraId
    }

    const res = await docentesStore.fetchDocentes(params)

    if (res && res.metricas) {
      metricas.value = res.metricas
    } else {
      // Fallback calculation if backend doesn't return exactly what we want or to be safe
      // (Though backend was updated to return 'metricas')
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Init Filters
  if (authStore.rol === 'DIRECTOR_CARRERA') {
    filtros.value.carrera = authStore.usuarioActual?.director?.carrera_id
  }
  cargarDatos()
})

// Watch filters to reload if needed (mainly for server side filtering like career, but we filter others client side)
watch(() => filtros.value.carrera, () => {
  cargarDatos()
})


// Columnas de la tabla de materias
const columnasMateria = [
  { name: 'materia', label: 'Materia', field: 'nombre', align: 'left' },
  { name: 'avanceTemas', label: 'Avance Temas', field: 'avanceTemas', align: 'center' },
  { name: 'asistencia', label: 'Asistencia', field: 'asistencia', align: 'center' },
  { name: 'documentacion', label: 'Documentación', field: 'documentacion', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// Docentes computed from STORE instead of mock
const docentesFiltrados = computed(() => {
  let lista = docentesStore.docentes || []

  return lista.filter(d => {
    // Filtro por búsqueda
    if (filtros.value.buscar) {
      const buscar = filtros.value.buscar.toLowerCase()
      // Backend provides 'nombre' as nombre_completo
      if (!d.nombre.toLowerCase().includes(buscar) && !(d.ci || '').includes(buscar)) {
        return false
      }
    }

    // Filtro por estado (basado en el estado general del docente)
    const estadoGeneral = getEstadoGeneral(d)
    if (filtros.value.estado === 'al_dia' && estadoGeneral !== 'Al día') return false
    if (filtros.value.estado === 'retraso' && !['Con retraso', 'Atrasado'].includes(estadoGeneral)) return false
    if (filtros.value.estado === 'sin_doc' && estadoGeneral !== 'Sin documentación') return false

    return true
  })
})

// Funciones auxiliares
const getColorPorcentaje = (porcentaje) => {
  if (porcentaje >= 85) return 'positive'
  if (porcentaje >= 70) return 'info'
  if (porcentaje >= 50) return 'warning'
  return 'negative'
}

const getColorEstado = (estado) => {
  if (estado === 'Al día') return 'positive'
  if (estado === 'Con retraso' || estado === 'Atrasado') return 'warning'
  return 'negative'
}

const getTextColor = (color) => {
  return ['warning', 'info'].includes(color) ? 'black' : 'white'
}

// Calcular estado general del docente basado en sus materias
const getEstadoGeneral = (docente) => {
  // If backend provides it, use it. Otherwise calculate.
  if (docente.estado_general) return docente.estado_general

  const estados = (docente.materiasData || []).map(m => m.estado)
  if (estados.includes('Sin documentación')) return 'Sin documentación'
  if (estados.includes('Atrasado')) return 'Atrasado'
  if (estados.includes('Con retraso')) return 'Con retraso'
  return 'Al día'
}

const getEstadoGeneralColor = (docente) => {
  return getColorEstado(getEstadoGeneral(docente))
}

// Acciones
const verDetalleMateria = (docente, materia) => {
  detalleSeleccionado.value = { docente, materia }
  dialogDetalle.value = true
}

const descargarReporteMateria = (docente, materia) => {
  $q.notify({
    type: 'positive',
    message: `Descargando reporte de ${materia.nombre} - ${docente.nombre}...`,
    icon: 'download'
  })
}

const descargarReporteDetalle = () => {
  if (detalleSeleccionado.value) {
    $q.notify({
      type: 'positive',
      message: `Reporte descargado`,
      icon: 'check'
    })
    dialogDetalle.value = false
  }
}

const generarReporteDocente = (docente) => {
  $q.notify({
    type: 'info',
    message: `Generando reporte completo de ${docente.nombre}...`,
    icon: 'assessment'
  })
}

const contactarDocente = (docente) => {
  $q.notify({
    type: 'info',
    message: `Contactando a ${docente.nombre}...`,
    icon: 'email'
  })
}

const exportarLista = () => {
  $q.notify({
    type: 'positive',
    message: 'Lista de docentes exportada',
    icon: 'download'
  })
}
</script>

<style scoped>
.docentes-page {
  padding: 24px;
  background-color: #f5f7fa;
}

.metric-card {
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
