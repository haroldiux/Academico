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

    <!-- Grid de Docentes (Cards) -->
    <div class="row q-col-gutter-md">
      <div v-for="docente in docentesFiltrados" :key="docente.id" class="col-12 col-sm-6 col-md-3 col-lg-3">
        <q-card flat bordered class="docente-card full-height">
          <q-card-section>
            <div class="row items-start no-wrap">
              <q-avatar color="green-5" text-color="white" size="48px" class="q-mr-md shadow-1">
                {{ docente.iniciales }}
              </q-avatar>
              <div class="col overflow-hidden">
                <div class="text-subtitle1 text-weight-bold ellipsis">{{ docente.nombre_completo }}</div>
                <div class="row q-gutter-xs q-mt-xs">
                  <q-badge color="green-1" text-color="green-8" label="Activo" />
                  <q-badge color="blue-1" text-color="blue-8" :label="docente.tipo_dedicacion || 'TIEMPO_PARCIAL'" />
                </div>
              </div>
              <q-btn flat round dense icon="more_vert" color="grey-7">
                <q-menu>
                  <q-list style="min-width: 150px">
                    <q-item clickable v-close-popup @click="contactarDocente(docente)">
                      <q-item-section avatar><q-icon name="email" size="xs" /></q-item-section>
                      <q-item-section>Contactar</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="generarReporteDocente(docente)">
                      <q-item-section avatar><q-icon name="assessment" size="xs" /></q-item-section>
                      <q-item-section>Reporte</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-py-sm bg-grey-1">
            <div class="row text-center">
              <div class="col">
                <div class="text-h6 text-weight-bold">{{ docente.materias_count || 0 }}</div>
                <div class="text-caption text-grey-7" style="font-size: 10px;">Materias</div>
              </div>
              <div class="col">
                <div class="text-h6 text-weight-bold">{{ docente.grupos ? docente.grupos.length : 0 }}</div>
                <div class="text-caption text-grey-7" style="font-size: 10px;">Grupos</div>
              </div>
              <div class="col">
                <div class="text-h6 text-weight-bold">{{ docente.horas_semanales || 40 }}</div>
                <div class="text-caption text-grey-7" style="font-size: 10px;">Hrs/Sem</div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pt-sm" style="min-height: 80px;">
            <div class="text-caption text-grey-6 q-mb-xs">Materias Asignadas</div>
            <div v-if="docente.materiasData && docente.materiasData.length > 0" class="row q-gutter-xs">
              <q-chip v-for="materia in docente.materiasData.slice(0, 3)" :key="materia.codigo" 
                dense size="xs" color="purple-1" text-color="purple-9" :label="materia.nombre" 
                class="ellipsis" style="max-width: 100%;" />
              <q-chip v-if="docente.materiasData.length > 3" dense size="xs" color="grey-2" text-color="grey-8">
                +{{ docente.materiasData.length - 3 }} más
              </q-chip>
            </div>
            <div v-else class="text-caption text-grey-5 text-italic">
              Sin materias asignadas
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none q-pb-sm">
             <div class="row items-center text-caption text-grey-6">
               <q-icon name="fingerprint" size="14px" class="q-mr-xs" />
               <span class="q-mr-md">{{ docente.ci }}</span>
               <q-icon name="place" size="14px" class="q-mr-xs" />
               <span>{{ docente.sede_nombre }}</span>
             </div>
          </q-card-section>
          
          <!-- Botón flotante acción principal -->
          <q-btn absolute top-right fab-mini flat icon="visibility" color="grey-5" class="absolute-bottom-right q-ma-sm" 
            @click="verDetalleMateria(docente, docente.materiasData[0])" 
            v-if="docente.materiasData.length > 0" >
             <q-tooltip>Ver Detalle</q-tooltip>
          </q-btn>

        </q-card>
      </div>
    </div>

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
                Docente: {{ detalleSeleccionado.docente.nombre_completo }}
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
import { useQuasar, exportFile } from 'quasar'
import { useAuthStore, ROLES } from 'src/stores/auth'
import { useDocentesStore } from 'src/stores/docentes'
import { useCarrerasStore } from 'src/stores/carreras'

const $q = useQuasar()
const authStore = useAuthStore()
const docentesStore = useDocentesStore()
const carrerasStore = useCarrerasStore()

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
  // Para Vicerrector Sede
  if (authStore.rol === ROLES.VICERRECTOR_SEDE) {
    return carrerasStore.getCarrerasBySede(authStore.sedeId).map(c => ({
      label: c.nombre,
      value: c.id
    }))
  }

  if (authStore.rol === 'DIRECTOR_CARRERA' && authStore.usuarioActual?.director?.carrera) {
    return [{
      label: authStore.usuarioActual.director.carrera.nombre,
      value: authStore.usuarioActual.director.carrera.id
    }]
  }
  // Fallback for others (Admin) - assuming they might want similar specific access or just current context
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


// Docentes computed from STORE instead of mock
const docentesFiltrados = computed(() => {
  let lista = docentesStore.docentes || []

  return lista.filter(d => {
    // Filtro por búsqueda
    if (filtros.value.buscar) {
      const buscar = filtros.value.buscar.toLowerCase()
      // Backend provides 'nombre' as nombre_completo
      if (!d.nombre_completo?.toLowerCase().includes(buscar) && !(d.ci || '').includes(buscar)) {
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



// Acciones
const verDetalleMateria = (docente, materia) => {
  detalleSeleccionado.value = { docente, materia }
  dialogDetalle.value = true
}



const descargarReporteDetalle = () => {
  if (detalleSeleccionado.value) {
    const m = detalleSeleccionado.value.materia
    const d = detalleSeleccionado.value.docente

    // Formato CSV Key-Value con BOM
    const content = [
      '\uFEFFCampo;Valor',
      `Reporte;Seguimiento Académico`,
      `Materia;${m.nombre} (${m.codigo})`,
      `Docente;${d.nombre_completo || d.nombre}`,
      `Grupo;${m.grupo}`,
      `Avance de Temas;${m.avanceTemas}%`,
      `Asistencia Promedio;${m.asistencia}%`,
      `Estado PAC;${m.pac ? 'Entregado' : 'Pendiente'}`,
      `Estado Plan de Clase;${m.planClase ? 'Entregado' : 'Pendiente'}`,
      `Estado Syllabus;${m.syllabus ? 'Entregado' : 'Pendiente'}`,
      `Estado General;${m.estado}`,
      `Fecha Generación;${new Date().toLocaleString()}`
    ].join('\r\n')

    const status = exportFile(
      `Reporte_${m.codigo}_${d.ci}.csv`,
      content,
      'text/csv'
    )

    if (status) {
      $q.notify({
        type: 'positive',
        message: 'Reporte descargado correctamente (CSV)',
        icon: 'check_circle'
      })
      dialogDetalle.value = false
    } else {
      $q.notify({
        type: 'negative',
        message: 'Error al generar descarga',
        icon: 'warning'
      })
    }
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



// ... existing imports

const exportarLista = () => {
  // BOM for Excel support of special characters (accents, etc)
  const header = '\uFEFFNombre;CI;Sede;Materias;Grupos;Estado'
  const rows = docentesFiltrados.value.map(d => 
    `${d.nombre_completo};${d.ci};${d.sede_nombre};${d.materias_count};${d.grupos?.length || 0};${getEstadoGeneral(d)}`
  )
  
  const content = [header, ...rows].join('\r\n')

  const status = exportFile(
    'lista-docentes.csv',
    content,
    'text/csv'
  )

  if (!status) {
    $q.notify({
      type: 'negative',
      message: 'El navegador denegó la descarga',
      icon: 'warning'
    })
  }
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
