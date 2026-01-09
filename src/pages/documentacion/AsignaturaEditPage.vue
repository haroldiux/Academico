<template>
  <q-page class="q-pa-lg">
    <!-- Breadcrumb & Header -->
    <div class="row items-center q-mb-lg animate-in">
      <div class="col">
        <q-breadcrumbs class="q-mb-sm">
          <q-breadcrumbs-el icon="home" to="/" />
          <q-breadcrumbs-el label="Documentación" to="/documentacion" />
          <q-breadcrumbs-el :label="asignatura?.codigo || 'Asignatura'" />
        </q-breadcrumbs>
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="menu_book" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">{{ asignatura?.nombre || 'Cargando...' }}</span>
        </h4>
        <p class="q-ma-none q-mt-xs" style="color: var(--text-secondary);">
          {{ asignatura?.codigo }} - {{ asignatura?.semestre }}° Semestre • {{ asignatura?.carrera }}
        </p>
      </div>
      <div class="col-auto row q-gutter-sm">
        <q-btn
          outline
          color="green"
          icon="picture_as_pdf"
          label="Generar PDF"
          no-caps
        />
        <q-btn
          unelevated
          color="primary"
          icon="save"
          label="Guardar Cambios"
          no-caps
          @click="guardarCambios"
        />
      </div>
    </div>

    <!-- Tabs -->
    <q-card class="card-main">
      <q-tabs
        v-model="tabActual"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
      >
        <q-tab name="datos" icon="description" label="Datos de Asignatura" no-caps />
        <q-tab name="bibliografia" icon="auto_stories" label="Bibliografía" no-caps />
        <q-tab name="unidades" icon="folder_open" label="Unidades de Aprendizaje" no-caps />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tabActual" animated>
        <!-- Tab: Datos de Asignatura -->
        <q-tab-panel name="datos" class="q-pa-lg">
          <div class="text-h6 text-weight-bold q-mb-lg">
            <q-icon name="info" color="primary" class="q-mr-sm" />
            Información General
          </div>

          <q-form class="q-gutter-lg">
            <!-- Datos Básicos -->
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-3">
                <q-input v-model="formDatos.codigo" label="Código" outlined dense readonly>
                  <template v-slot:prepend><q-icon name="tag" color="primary" /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model="formDatos.sigla" label="Sigla" outlined dense>
                  <template v-slot:prepend><q-icon name="label" color="primary" /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model.number="formDatos.semestre" label="Semestre" type="number" outlined dense>
                  <template v-slot:prepend><q-icon name="calendar_month" color="primary" /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model.number="formDatos.creditos" label="Créditos" type="number" outlined dense>
                  <template v-slot:prepend><q-icon name="star" color="primary" /></template>
                </q-input>
              </div>
            </div>

            <q-input v-model="formDatos.nombre" label="Nombre de la Asignatura" outlined dense>
              <template v-slot:prepend><q-icon name="menu_book" color="primary" /></template>
            </q-input>

            <!-- Horas -->
            <div class="text-subtitle1 text-weight-bold q-mt-lg">
              <q-icon name="schedule" color="orange" class="q-mr-sm" />
              Carga Horaria
            </div>
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-4">
                <q-input v-model.number="formDatos.horas_teoricas" label="Horas Teóricas" type="number" outlined dense>
                  <template v-slot:prepend><q-icon name="school" color="blue" /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model.number="formDatos.horas_practicas" label="Horas Prácticas" type="number" outlined dense>
                  <template v-slot:prepend><q-icon name="build" color="green" /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model.number="formDatos.horas_laboratorio" label="Horas de Laboratorio" type="number" outlined dense>
                  <template v-slot:prepend><q-icon name="science" color="purple" /></template>
                </q-input>
              </div>
            </div>

            <!-- Descripción y Objetivos -->
            <div class="text-subtitle1 text-weight-bold q-mt-lg">
              <q-icon name="description" color="cyan" class="q-mr-sm" />
              Descripción y Objetivos
            </div>

            <q-input v-model="formDatos.descripcion" label="Descripción" outlined type="textarea" rows="3">
              <template v-slot:prepend><q-icon name="notes" color="primary" /></template>
            </q-input>

            <q-input v-model="formDatos.objetivo_general" label="Objetivo General" outlined type="textarea" rows="3">
              <template v-slot:prepend><q-icon name="flag" color="green" /></template>
            </q-input>

            <q-input v-model="formDatos.justificacion" label="Justificación" outlined type="textarea" rows="3">
              <template v-slot:prepend><q-icon name="lightbulb" color="amber" /></template>
            </q-input>

            <!-- Metodología -->
            <div class="text-subtitle1 text-weight-bold q-mt-lg">
              <q-icon name="settings" color="indigo" class="q-mr-sm" />
              Metodología y Evaluación
            </div>

            <q-input v-model="formDatos.saberes_previos" label="Saberes Previos" outlined hint="Conocimientos previos necesarios">
              <template v-slot:prepend><q-icon name="psychology" color="orange" /></template>
            </q-input>

            <q-input v-model="formDatos.contenido_minimo" label="Contenido Mínimo" outlined type="textarea" rows="2">
              <template v-slot:prepend><q-icon name="list" color="primary" /></template>
            </q-input>

            <q-input v-model="formDatos.metodologia_ensenanza" label="Metodología de Enseñanza" outlined type="textarea" rows="2">
              <template v-slot:prepend><q-icon name="school" color="purple" /></template>
            </q-input>

            <q-input v-model="formDatos.criterios_evaluacion" label="Criterios de Evaluación" outlined type="textarea" rows="2">
              <template v-slot:prepend><q-icon name="grading" color="red" /></template>
            </q-input>
          </q-form>
        </q-tab-panel>

        <!-- Tab: Bibliografía -->
        <q-tab-panel name="bibliografia" class="q-pa-lg">
          <div class="row items-center justify-between q-mb-lg">
            <div class="text-h6 text-weight-bold">
              <q-icon name="auto_stories" color="primary" class="q-mr-sm" />
              Referencias Bibliográficas
            </div>
            <q-btn unelevated color="primary" icon="add" label="Agregar" no-caps @click="abrirDialogBibliografia()" />
          </div>

          <div v-if="!asignatura?.bibliografias?.length" class="text-center q-pa-xl">
            <q-icon name="menu_book" size="64px" color="grey-5" />
            <p class="text-h6 text-grey-6 q-mt-md">No hay bibliografías registradas</p>
          </div>

          <div v-else class="row q-col-gutter-md">
            <div v-for="biblio in asignatura.bibliografias" :key="biblio.id" class="col-12 col-md-6">
              <q-card flat bordered class="q-pa-md">
                <div class="row items-start no-wrap">
                  <q-avatar :color="biblio.tipo === 'principal' ? 'blue-2' : 'grey-3'" :text-color="biblio.tipo === 'principal' ? 'blue-9' : 'grey-7'" size="48px" class="q-mr-md">
                    <q-icon name="book" />
                  </q-avatar>
                  <div class="col">
                    <div class="text-subtitle1 text-weight-bold">{{ biblio.titulo }}</div>
                    <div class="text-body2" style="color: var(--text-secondary);">{{ biblio.autor }}</div>
                    <div class="text-caption q-mt-xs" style="color: var(--text-secondary);">
                      {{ biblio.editorial }}, {{ biblio.edicion }} ({{ biblio.anio }})
                    </div>
                    <q-chip size="sm" :color="biblio.tipo === 'principal' ? 'blue-2' : 'grey-3'" :text-color="biblio.tipo === 'principal' ? 'blue-9' : 'grey-7'" dense class="q-mt-sm">
                      {{ biblio.tipo === 'principal' ? 'Principal' : 'Complementario' }}
                    </q-chip>
                  </div>
                  <div class="column q-gutter-xs">
                    <q-btn flat round dense icon="edit" size="sm" color="orange" @click="abrirDialogBibliografia(biblio)" />
                    <q-btn flat round dense icon="delete" size="sm" color="red" @click="eliminarBibliografia(biblio)" />
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </q-tab-panel>

        <!-- Tab: Unidades de Aprendizaje -->
        <q-tab-panel name="unidades" class="q-pa-lg">
          <div class="row items-center justify-between q-mb-lg">
            <div class="text-h6 text-weight-bold">
              <q-icon name="folder_open" color="primary" class="q-mr-sm" />
              Unidades de Aprendizaje
            </div>
            <q-chip color="amber-2" text-color="amber-9">
              <q-icon name="cloud_sync" class="q-mr-xs" />
              Datos desde API externa
            </q-chip>
          </div>

          <q-list separator class="unidades-list">
            <q-expansion-item
              v-for="unidad in asignatura?.unidades"
              :key="unidad.id"
              group="unidades"
              class="unidad-item"
            >
              <template v-slot:header>
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" size="42px">
                    {{ unidad.numero }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-subtitle1">{{ unidad.titulo }}</q-item-label>
                  <q-item-label caption>
                    {{ unidad.temas?.length || 0 }} temas • {{ unidad.horas }} horas
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-linear-progress
                    :value="calcularProgresoUnidad(unidad) / 100"
                    :color="calcularProgresoUnidad(unidad) >= 80 ? 'green' : calcularProgresoUnidad(unidad) >= 50 ? 'amber' : 'red'"
                    rounded
                    size="8px"
                    style="width: 100px;"
                  />
                  <span class="text-caption q-mt-xs">{{ calcularProgresoUnidad(unidad) }}% documentado</span>
                </q-item-section>
              </template>

              <!-- Elemento de Competencia -->
              <q-card flat class="q-mx-lg q-my-md competencia-card">
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <q-icon name="emoji_events" color="primary" class="q-mr-sm" />
                    <span class="text-weight-bold text-primary">Elemento de Competencia (Unidad {{ unidad.numero }})</span>
                  </div>
                  <q-input
                    v-model="unidad.elemento_competencia"
                    type="textarea"
                    rows="2"
                    outlined
                    dense
                    placeholder="Describe el elemento de competencia para esta unidad..."
                    @blur="guardarElementoCompetencia(unidad)"
                  />
                </q-card-section>
              </q-card>

              <!-- Lista de Temas -->
              <q-list separator class="q-mx-lg q-mb-md">
                <q-item
                  v-for="tema in unidad.temas"
                  :key="tema.id"
                  clickable
                  @click="irATema(unidad, tema)"
                  class="rounded-borders q-mb-xs tema-item"
                >
                  <q-item-section avatar>
                    <q-avatar color="orange-2" text-color="orange-9" size="36px">
                      <span class="text-weight-bold">{{ unidad.numero }}.{{ tema.numero }}</span>
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ tema.titulo }}</q-item-label>
                    <q-item-label caption>
                      {{ tema.horas }}h •
                      {{ tema.logros_esperados?.length || 0 }} logros •
                      {{ tema.indicadores_logro?.length || 0 }} indicadores
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row items-center q-gutter-sm">
                      <q-chip
                        size="sm"
                        :color="calcularProgresoTema(tema) >= 80 ? 'green-2' : calcularProgresoTema(tema) >= 50 ? 'amber-2' : 'red-2'"
                        :text-color="calcularProgresoTema(tema) >= 80 ? 'green-9' : calcularProgresoTema(tema) >= 50 ? 'amber-9' : 'red-9'"
                        dense
                      >
                        {{ calcularProgresoTema(tema) }}%
                      </q-chip>
                      <q-btn flat round dense icon="edit" color="primary" size="sm" @click.stop="irATema(unidad, tema)">
                        <q-tooltip>Documentar Tema</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </q-list>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Dialog Bibliografía -->
    <q-dialog v-model="dialogBibliografia" persistent>
      <q-card style="width: 550px; max-width: 95vw; border-radius: 16px;">
        <div class="dialog-header">
          <div class="dialog-header-title">
            <q-icon name="auto_stories" size="28px" />
            {{ editandoBiblio ? 'Editar Bibliografía' : 'Nueva Bibliografía' }}
          </div>
        </div>
        <q-card-section class="q-pt-lg">
          <q-form class="q-gutter-md">
            <q-input v-model="formBiblio.titulo" label="Título" outlined dense />
            <q-input v-model="formBiblio.autor" label="Autor(es)" outlined dense />
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input v-model="formBiblio.editorial" label="Editorial" outlined dense />
              </div>
              <div class="col-6">
                <q-input v-model="formBiblio.edicion" label="Edición" outlined dense />
              </div>
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input v-model.number="formBiblio.anio" label="Año" type="number" outlined dense />
              </div>
              <div class="col-6">
                <q-select
                  v-model="formBiblio.tipo"
                  label="Tipo"
                  :options="[{label: 'Principal', value: 'principal'}, {label: 'Complementario', value: 'complementario'}]"
                  emit-value
                  map-options
                  outlined
                  dense
                />
              </div>
            </div>
            <q-input v-model="formBiblio.isbn" label="ISBN" outlined dense />
            <q-input v-model="formBiblio.paginas" label="Páginas (ej: 100-150)" outlined dense />
          </q-form>
        </q-card-section>
        <div class="dialog-actions">
          <q-btn flat label="Cancelar" color="grey" @click="dialogBibliografia = false" no-caps />
          <q-btn unelevated label="Guardar" color="primary" @click="guardarBibliografia" no-caps />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAsignaturasStore } from 'src/stores/asignaturas'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const store = useAsignaturasStore()

// Estado
const tabActual = ref('unidades')
const asignatura = computed(() => store.asignaturaActual)

// Forms
const formDatos = ref({})
const formBiblio = ref({})
const dialogBibliografia = ref(false)
const editandoBiblio = ref(false)
const biblioSeleccionada = ref(null)

// Lifecycle
onMounted(() => {
  const id = parseInt(route.params.id)
  store.setAsignaturaActual(id)
  if (asignatura.value) {
    cargarFormDatos()
  }
})

watch(asignatura, (newVal) => {
  if (newVal) cargarFormDatos()
})

// Methods
function cargarFormDatos() {
  formDatos.value = {
    codigo: asignatura.value.codigo,
    sigla: asignatura.value.sigla,
    nombre: asignatura.value.nombre,
    semestre: asignatura.value.semestre,
    creditos: asignatura.value.creditos,
    horas_teoricas: asignatura.value.horas_teoricas,
    horas_practicas: asignatura.value.horas_practicas,
    horas_laboratorio: asignatura.value.horas_laboratorio,
    descripcion: asignatura.value.descripcion,
    objetivo_general: asignatura.value.objetivo_general,
    justificacion: asignatura.value.justificacion,
    saberes_previos: asignatura.value.saberes_previos,
    contenido_minimo: asignatura.value.contenido_minimo,
    metodologia_ensenanza: asignatura.value.metodologia_ensenanza,
    criterios_evaluacion: asignatura.value.criterios_evaluacion
  }
}

function guardarCambios() {
  store.updateAsignatura(asignatura.value.id, formDatos.value)
  $q.notify({ type: 'positive', message: 'Cambios guardados', icon: 'check_circle', position: 'top' })
}

function calcularProgresoTema(tema) {
  return store.calcularProgresoTema(tema)
}

function calcularProgresoUnidad(unidad) {
  if (!unidad.temas?.length) return 0
  const total = unidad.temas.reduce((sum, t) => sum + calcularProgresoTema(t), 0)
  return Math.round(total / unidad.temas.length)
}

function guardarElementoCompetencia(unidad) {
  store.updateElementoCompetencia(asignatura.value.id, unidad.id, unidad.elemento_competencia)
}

function irATema(unidad, tema) {
  router.push(`/documentacion/${asignatura.value.id}/unidad/${unidad.id}/tema/${tema.id}`)
}

// Bibliografía
function abrirDialogBibliografia(biblio = null) {
  if (biblio) {
    editandoBiblio.value = true
    biblioSeleccionada.value = biblio
    formBiblio.value = { ...biblio }
  } else {
    editandoBiblio.value = false
    biblioSeleccionada.value = null
    formBiblio.value = { tipo: 'complementario', anio: new Date().getFullYear() }
  }
  dialogBibliografia.value = true
}

function guardarBibliografia() {
  if (editandoBiblio.value) {
    store.updateBibliografia(asignatura.value.id, biblioSeleccionada.value.id, formBiblio.value)
  } else {
    store.addBibliografia(asignatura.value.id, formBiblio.value)
  }
  dialogBibliografia.value = false
  $q.notify({ type: 'positive', message: 'Bibliografía guardada', position: 'top' })
}

function eliminarBibliografia(biblio) {
  store.deleteBibliografia(asignatura.value.id, biblio.id)
  $q.notify({ type: 'info', message: 'Bibliografía eliminada', position: 'top' })
}
</script>

<style scoped>
.q-page {
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
.card-main {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 16px !important;
}

/* Tabs */
.card-main :deep(.q-tabs) {
  background: var(--bg-tertiary);
}

.card-main :deep(.q-tab) {
  color: var(--text-secondary);
}

.card-main :deep(.q-tab--active) {
  color: var(--primary-light);
}

/* Tab Panels */
.card-main :deep(.q-tab-panel) {
  background: transparent;
}

/* Form inputs */
.card-main :deep(.q-field__control) {
  background: var(--bg-tertiary);
}

.card-main :deep(.q-field__native),
.card-main :deep(.q-field__input) {
  color: var(--text-primary) !important;
}

/* Expansion items */
.card-main :deep(.q-expansion-item) {
  background: var(--bg-tertiary) !important;
  border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid var(--border-color) !important;
}

.card-main :deep(.q-expansion-item__container) {
  background: transparent !important;
}

.card-main :deep(.q-expansion-item .q-item) {
  background: transparent !important;
  color: var(--text-primary);
}

/* List items */
.card-main :deep(.q-list) {
  background: transparent !important;
}

.card-main :deep(.q-item) {
  background: var(--bg-tertiary) !important;
  color: var(--text-primary);
  border-radius: 8px;
  margin-bottom: 4px;
}

.card-main :deep(.q-item:hover) {
  background: var(--bg-hover) !important;
}

.card-main :deep(.q-item__label) {
  color: var(--text-primary);
}

.card-main :deep(.q-item__label--caption) {
  color: var(--text-muted);
}

/* Element competency card */
.card-main :deep(.q-card) {
  background: var(--bg-tertiary) !important;
  border: 1px solid var(--border-color) !important;
}

/* Linear progress */
.card-main :deep(.q-linear-progress) {
  background: var(--bg-hover) !important;
}

/* Separator */
.card-main :deep(.q-separator) {
  background: var(--border-color) !important;
}

/* Avatar */
.card-main :deep(.q-avatar) {
  font-weight: 600;
}

/* Bibliografía cards */
.card-main :deep(.q-card.flat.bordered) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

/* Dialog */
.dialog-header {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  padding: 20px 24px;
  margin: -16px -16px 0 -16px;
  border-radius: 16px 16px 0 0;
}

.dialog-header-title {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}

/* Animations */
.animate-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Unidades List */
.unidades-list {
  background: transparent !important;
}

.unidad-item {
  background: var(--bg-tertiary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 12px !important;
  margin-bottom: 12px !important;
}

.unidad-item :deep(.q-expansion-item__toggle-icon) {
  color: var(--text-secondary);
}

.unidad-item :deep(.q-item) {
  background: transparent !important;
}

.unidad-item :deep(.q-item__label) {
  color: var(--text-primary);
}

.unidad-item :deep(.q-item__label--caption) {
  color: var(--text-muted);
}

/* Competencia Card */
.competencia-card {
  background: rgba(124, 58, 237, 0.1) !important;
  border: 1px solid rgba(124, 58, 237, 0.2) !important;
}

/* Tema Item */
.tema-item {
  background: var(--bg-hover) !important;
  border: 1px solid var(--border-color) !important;
}

.tema-item:hover {
  background: var(--bg-tertiary) !important;
  border-color: var(--primary) !important;
}
</style>
