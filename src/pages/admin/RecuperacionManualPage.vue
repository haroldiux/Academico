<template>
  <q-page padding>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12">
        <div class="text-h5 text-primary q-mb-sm">
          Módulo de Recuperación Manual (Muestreo Selectivo)
        </div>
        <div class="text-subtitle2 text-grey-7">
          Recupere información específica de asignaturas desde bases de datos históricas de forma
          controlada.
        </div>
      </div>
    </div>

    <q-card class="q-mb-md">
      <q-tabs
        v-model="mainTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="backups" icon="storage" label="Recuperación desde Backups" />
        <q-tab name="api" icon="api" label="Registro desde API Planning" />
      </q-tabs>
    </q-card>

    <q-tab-panels v-model="mainTab" animated class="bg-transparent">
      <!-- PANEL 1: BACKUPS (EXISTING STEPPER) -->
      <q-tab-panel name="backups" class="q-pa-none">
        <q-stepper
          v-model="step"
          ref="stepper"
          color="primary"
          animated
          flat
          bordered
          class="rounded-borders shadow-2"
        >
          <!-- ... (same q-step contents as before) ... -->
          <q-step :name="1" title="Seleccionar Origen (Backup)" icon="database" :done="step > 1">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-select
                  v-model="backupSelected"
                  :options="backupsAvailable"
                  label="Base de Datos de Backup"
                  outlined
                  dense
                  emit-value
                  map-options
                  :loading="loadingBackups"
                  class="q-mb-md"
                />
              </div>
              <div class="col-12 col-md-8">
                <q-select
                  v-model="subjectBackup"
                  use-input
                  outlined
                  dense
                  label="Buscar Asignatura en Backup (Sigla o Nombre)"
                  :options="backupOptions"
                  @filter="filterBackupSubjects"
                  @update:model-value="onBackupSelected"
                  option-label="label"
                  hint="Escriba al menos 3 caracteres para buscar"
                >
                  <template v-slot:no-option
                    ><q-item
                      ><q-item-section class="text-grey"
                        >No se encontraron resultados</q-item-section
                      ></q-item
                    ></template
                  >
                </q-select>
              </div>
            </div>
            <div v-if="subjectBackup" class="q-mt-md">
              <q-card flat bordered class="bg-blue-1 border-blue">
                <q-item>
                  <q-item-section avatar><q-icon name="history" color="primary" /></q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">Seleccionado del Backup:</q-item-label>
                    <q-item-label
                      >[{{ subjectBackup.codigo }}] {{ subjectBackup.nombre }} (Plan:
                      {{ subjectBackup.plan_estudios }})</q-item-label
                    >
                  </q-item-section>
                </q-item>
              </q-card>
            </div>
          </q-step>

          <q-step :name="2" title="Seleccionar Destino (Base Actual)" icon="input" :done="step > 2">
            <div class="text-subtitle1 q-mb-md flex items-center">
              <q-icon name="info" color="info" class="q-mr-sm" /> Busque la materia oficial donde
              desea inyectar la información seleccionada:
            </div>
            <q-select
              v-model="subjectCurrent"
              use-input
              outlined
              dense
              label="Buscar Asignatura Actual"
              :options="currentOptions"
              @filter="filterCurrentSubjects"
              option-label="label"
              class="q-mb-lg"
            >
              <template v-slot:no-option
                ><q-item
                  ><q-item-section class="text-grey"
                    >No se encontraron resultados</q-item-section
                  ></q-item
                ></template
              >
            </q-select>
            <div v-if="subjectCurrent" class="q-mt-md">
              <q-card flat bordered class="bg-green-1 border-green">
                <q-item>
                  <q-item-section avatar
                    ><q-icon name="check_circle" color="positive"
                  /></q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">Destino Actual:</q-item-label>
                    <q-item-label
                      >[{{ subjectCurrent.codigo }}] {{ subjectCurrent.nombre }}</q-item-label
                    >
                  </q-item-section>
                </q-item>
              </q-card>
            </div>
          </q-step>

          <q-step :name="3" title="Comparar y Restaurar" icon="restore_page">
            <div v-if="loadingComparison" class="flex flex-center q-pa-xl">
              <q-spinner-dots color="primary" size="40px" />
              <div class="q-ml-md">Cargando contenido detallado...</div>
            </div>
            <div v-else-if="comparisonData">
              <q-banner dense class="bg-amber-1 text-amber-9 rounded-borders q-mb-lg border-amber">
                <template v-slot:avatar><q-icon name="warning" /></template>
                Se restaurará desde el backup <strong>{{ subjectBackup.nombre }}</strong> hacia la
                materia actual <strong>{{ subjectCurrent.nombre }}</strong
                >.
              </q-banner>
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-5">
                  <div class="text-subtitle1 text-weight-bold q-mb-md">Panel de Inyección</div>
                  <q-list bordered separator class="rounded-borders bg-white">
                    <q-item>
                      <q-item-section avatar><q-icon name="info" color="blue" /></q-item-section>
                      <q-item-section
                        ><q-item-label class="text-weight-bold">Datos Generales</q-item-label
                        ><q-item-label caption
                          >Campos teóricos de la asignatura</q-item-label
                        ></q-item-section
                      >
                      <q-item-section side
                        ><q-btn
                          color="orange"
                          label="Inyectar"
                          no-caps
                          unelevated
                          dense
                          class="q-px-sm"
                          @click="restaurar('asignatura', 'Datos Generales')"
                      /></q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar
                        ><q-icon name="account_tree" color="green"
                      /></q-item-section>
                      <q-item-section
                        ><q-item-label class="text-weight-bold">Unidades y Temas</q-item-label
                        ><q-item-label caption
                          >Jerarquía pedagógica completa</q-item-label
                        ></q-item-section
                      >
                      <q-item-section side
                        ><q-btn
                          color="orange"
                          label="Inyectar"
                          no-caps
                          unelevated
                          dense
                          class="q-px-sm"
                          @click="restaurar('unidades_total', 'Unidades y Temas')"
                      /></q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar
                        ><q-icon name="event_available" color="purple"
                      /></q-item-section>
                      <q-item-section
                        ><q-item-label class="text-weight-bold">Cronograma Semestral</q-item-label
                        ><q-item-label caption
                          >Plan de clases sesión a sesión</q-item-label
                        ></q-item-section
                      >
                      <q-item-section side
                        ><q-btn
                          color="orange"
                          label="Inyectar"
                          no-caps
                          unelevated
                          dense
                          class="q-px-sm"
                          @click="restaurar('cronograma_total', 'Cronograma')"
                      /></q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar
                        ><q-icon name="assignment_turned_in" color="teal"
                      /></q-item-section>
                      <q-item-section
                        ><q-item-label class="text-weight-bold">Seguimientos de Clase</q-item-label
                        ><q-item-label caption
                          >Avance de materia por grupos</q-item-label
                        ></q-item-section
                      >
                      <q-item-section side
                        ><q-btn
                          color="orange"
                          label="Inyectar"
                          no-caps
                          unelevated
                          dense
                          class="q-px-sm"
                          @click="restaurar('seguimientos_total', 'Seguimientos')"
                      /></q-item-section>
                    </q-item>
                  </q-list>
                </div>
                <div class="col-12 col-md-7">
                  <div class="text-subtitle1 text-weight-bold q-mb-md">
                    Contenido Detectado en Backup
                  </div>
                  <q-card flat bordered class="rounded-borders bg-grey-1">
                    <q-scroll-area style="height: 500px">
                      <q-list padding>
                        <div
                          v-for="(unidad, uIdx) in comparisonData.unidades"
                          :key="uIdx"
                          class="q-mb-md q-px-md"
                        >
                          <div class="text-weight-bold text-primary flex items-center">
                            <q-icon name="folder" class="q-mr-xs" /> Unidad: {{ unidad.titulo }}
                          </div>
                          <div
                            v-for="(tema, tIdx) in unidad.temas"
                            :key="tIdx"
                            class="q-ml-lg q-mt-xs border-left-grey q-pl-md"
                          >
                            <div class="text-subtitle2">
                              <q-icon name="description" size="xs" color="grey-7" class="q-mr-xs" />
                              {{ tema.titulo }}
                            </div>
                            <div v-if="tema.found_backup" class="q-ml-md q-mt-xs">
                              <div v-if="tema.logros?.length > 0" class="text-caption text-grey-8">
                                <strong>Logros:</strong>
                                {{
                                  tema.logros
                                    .filter((l) => l.found_backup)
                                    .map((l) => l.backup_desc || l.current_desc)
                                    .join(', ')
                                }}
                              </div>
                            </div>
                            <div
                              v-if="tema.planificacion_personal?.found_backup"
                              class="q-ml-md q-mt-xs"
                            >
                              <q-chip size="xs" color="blue-1" text-color="blue" dense icon="person"
                                >Tiene Plan. Personal</q-chip
                              >
                            </div>
                          </div>
                        </div>
                        <q-separator inset class="q-my-md" />
                        <div class="q-px-md">
                          <div class="text-weight-bold text-secondary flex items-center q-mb-sm">
                            <q-icon name="calendar_month" class="q-mr-xs" /> Cronograma ({{
                              comparisonData.cronogramas.length
                            }}
                            sesiones)
                          </div>
                          <div class="row q-col-gutter-xs">
                            <div
                              v-for="c in comparisonData.cronogramas.slice(0, 8)"
                              :key="c.numero_sesion"
                              class="col-3"
                            >
                              <div
                                class="bg-white border-light rounded-borders q-pa-xs text-center"
                              >
                                <div class="text-caption text-weight-bold">
                                  #{{ c.numero_sesion }}
                                </div>
                                <div class="text-caption text-grey-7" style="font-size: 0.7rem">
                                  {{ c.tipo_clase }}
                                </div>
                              </div>
                            </div>
                            <div
                              v-if="comparisonData.cronogramas.length > 8"
                              class="col-12 text-center text-caption text-grey-6 q-mt-xs"
                            >
                              ... y {{ comparisonData.cronogramas.length - 8 }} sesiones más
                            </div>
                          </div>
                        </div>
                        <q-separator inset class="q-my-md" />
                        <div class="q-px-md" v-if="comparisonData.seguimientos">
                          <div class="text-weight-bold text-teal flex items-center q-mb-sm">
                            <q-icon name="fact_check" class="q-mr-xs" /> Seguimientos ({{
                              comparisonData.seguimientos.backup_count
                            }}
                            registros)
                          </div>
                          <div v-if="comparisonData.seguimientos.backup_sample?.length > 0">
                            <div
                              v-for="(seg, sIdx) in comparisonData.seguimientos.backup_sample.slice(
                                0,
                                3,
                              )"
                              :key="sIdx"
                              class="q-mb-sm bg-white q-pa-sm rounded-borders shadow-1 border-left-teal"
                            >
                              <div class="flex justify-between items-center no-wrap">
                                <span class="text-weight-bold text-teal-9">{{ seg.grupo }}</span
                                ><span class="text-caption text-grey-7">{{ seg.fecha }}</span>
                              </div>
                              <div class="text-caption ellipsis">{{ seg.tema }}</div>
                            </div>
                          </div>
                        </div>
                      </q-list>
                    </q-scroll-area>
                  </q-card>
                </div>
              </div>
            </div>
          </q-step>

          <template v-slot:navigation>
            <q-stepper-navigation class="bg-grey-1 q-pa-md border-top">
              <q-btn
                v-if="step > 1"
                flat
                color="primary"
                @click="$refs.stepper.previous()"
                label="Atrás"
                class="q-mr-sm"
                icon="arrow_back"
              />
              <q-btn
                @click="onNext"
                color="primary"
                :label="step === 3 ? 'Finalizar y Limpiar' : 'Continuar'"
                :disable="nextDisabled"
                :icon-right="step < 3 ? 'arrow_forward' : 'check'"
                unelevated
              />
            </q-stepper-navigation>
          </template>
        </q-stepper>
      </q-tab-panel>

      <!-- PANEL 2: API PLANNING -->
      <q-tab-panel name="api" class="q-pa-none">
        <q-card flat bordered class="rounded-borders shadow-2">
          <q-card-section>
            <div class="text-h6 text-primary q-mb-md">
              <q-icon name="manage_search" class="q-mr-sm" /> Registro de Asignatura desde API
              Planning
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-3">
                <q-input v-model="apiFilter.gestion" label="Gestión (Ej: 1-2026)" outlined dense />
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="apiFilter.sede"
                  :options="sedesList"
                  label="Sede"
                  outlined
                  dense
                  map-options
                  emit-value
                  option-label="nombre"
                  option-value="id_api"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="apiFilter.carrera"
                  :options="carrerasList"
                  label="Carrera"
                  outlined
                  dense
                  map-options
                  emit-value
                  option-label="nombre"
                  option-value="sigla"
                  use-input
                  @filter="filterCarrerasAPI"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model="apiFilter.sigla"
                  label="Sigla (Código)"
                  outlined
                  dense
                  @keyup.enter="fetchAPI"
                />
              </div>
            </div>
            <div class="row q-mt-md justify-end">
              <q-btn
                color="primary"
                label="Consultar API Planning"
                icon="search"
                unelevated
                @click="fetchAPI"
                :loading="loadingAPI"
              />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section v-if="apiResult">
            <!-- Asignatura header -->
            <div class="bg-blue-1 border-blue rounded-borders q-pa-md q-mb-md">
              <div class="row items-center justify-between">
                <div class="row items-center">
                  <q-icon name="school" size="md" color="primary" class="q-mr-md" />
                  <div>
                    <div class="text-h6">[{{ apiResult.sigla }}] {{ apiResult.nombre }}</div>
                    <div class="text-caption">
                      Plan: {{ apiResult.plan }} | Carrera: {{ apiResult.carrera }}
                    </div>
                  </div>
                </div>
                <div class="row q-gutter-xs">
                  <q-badge color="green-7" class="q-pa-xs"
                    >{{ gruposRegistrados }} En SIDOPA</q-badge
                  >
                  <q-badge color="blue-7" class="q-pa-xs">{{ gruposNuevos }} Nuevos</q-badge>
                </div>
              </div>
            </div>

            <div class="text-subtitle1 text-weight-bold q-mb-sm">Grupos y Horarios Detectados:</div>
            <q-table
              :rows="apiResult.grupos"
              :columns="apiColumns"
              flat
              bordered
              dense
              :pagination="{ rowsPerPage: 0 }"
              hide-bottom
              class="q-mb-md grupos-table"
            >
              <!-- Status badge column -->
              <template v-slot:body-cell-sidopa_status="props">
                <q-td :props="props" class="text-center">
                  <q-badge
                    :color="props.row.sidopa_status === 'registrado' ? 'green-7' : 'blue-7'"
                    :label="props.row.sidopa_status === 'registrado' ? 'En SIDOPA' : 'Nuevo'"
                  />
                </q-td>
              </template>

              <!-- Docente column with current DB teacher -->
              <template v-slot:body-cell-docente="props">
                <q-td :props="props">
                  <div>{{ props.row.docente }}</div>
                  <div
                    v-if="props.row.sidopa_status === 'registrado' && props.row.docente_actual"
                    class="text-caption text-green-8"
                  >
                    <q-icon name="check_circle" size="xs" /> SIDOPA:
                    {{ props.row.docente_actual.nombre }}
                  </div>
                  <div
                    v-else-if="
                      props.row.sidopa_status === 'registrado' && !props.row.docente_actual
                    "
                    class="text-caption text-grey-6"
                  >
                    <q-icon name="person_off" size="xs" /> Sin docente en SIDOPA
                  </div>
                </q-td>
              </template>

              <!-- Actions column -->
              <template v-slot:body-cell-accion="props">
                <q-td :props="props" class="text-center">
                  <q-btn
                    v-if="props.row.sidopa_status === 'registrado'"
                    flat
                    round
                    dense
                    icon="edit"
                    color="orange"
                    size="sm"
                    @click="abrirEditarDocente(props.row)"
                  >
                    <q-tooltip>Actualizar docente en SIDOPA</q-tooltip>
                  </q-btn>
                  <q-checkbox v-else v-model="props.row._selected" dense color="primary" />
                </q-td>
              </template>
            </q-table>

            <div class="row q-mt-lg justify-between items-center">
              <div class="text-caption text-grey-7">
                <q-icon name="info" /> Los grupos <strong>Nuevos</strong> seleccionados se
                registrarán. Los <strong>En SIDOPA</strong> se actualizan con el ícono ✏️.
              </div>
              <q-btn
                color="green-7"
                label="Registrar Grupos Nuevos en SIDOPA"
                icon="save"
                unelevated
                :disable="gruposSeleccionados === 0"
                @click="confirmarRegistroAPI"
              >
                <q-badge
                  v-if="gruposSeleccionados > 0"
                  floating
                  color="orange"
                  :label="gruposSeleccionados"
                />
              </q-btn>
            </div>
          </q-card-section>

          <q-card-section v-else-if="!loadingAPI" class="text-center q-pa-xl text-grey-6">
            <q-icon name="inbox" size="xl" class="q-mb-sm" />
            <div>Ingrese los filtros y presione buscar para ver los datos de la API Planning.</div>
          </q-card-section>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Dialog: Editar Docente de Grupo Existente -->
    <q-dialog v-model="editDocenteDialog" persistent>
      <q-card style="min-width: 380px">
        <q-card-section class="bg-orange-1">
          <div class="text-h6">
            <q-icon name="edit" class="q-mr-xs" color="orange" /> Actualizar Docente del Grupo
          </div>
          <div v-if="editingGrupo" class="text-caption text-grey-7">
            Grupo {{ editingGrupo.nombre }} ({{ editingGrupo.tipo }})
          </div>
        </q-card-section>

        <q-card-section v-if="editingGrupo">
          <!-- Current API docente as suggestion -->
          <div class="bg-blue-1 rounded-borders q-pa-sm q-mb-md text-caption">
            <strong>Docente en API Planning:</strong> {{ editingGrupo.docente }} (CI:
            {{ editingGrupo.ci || 'N/A' }})
            <q-btn
              flat
              dense
              size="xs"
              color="primary"
              label="Usar este"
              @click="usarDocenteAPI"
              class="q-ml-sm"
            />
          </div>

          <q-input
            v-model="docenteEdit.ci"
            label="CI del Docente"
            outlined
            dense
            class="q-mb-sm"
            placeholder="Ej: 5723850"
          />
          <q-input
            v-model="docenteEdit.nombre"
            label="Nombre Completo del Docente"
            outlined
            dense
            placeholder="Ej: ANDREA OLGA LAGUE GONZALES"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="orange"
            label="Actualizar Docente"
            unelevated
            :loading="savingDocente"
            @click="guardarDocente"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const mainTab = ref('backups')
const step = ref(1)
const backupsAvailable = ref([])
const backupSelected = ref(null)
const loadingBackups = ref(false)

const subjectBackup = ref(null)
const backupOptions = ref([])

const subjectCurrent = ref(null)
const currentOptions = ref([])

const loadingComparison = ref(false)
const comparisonData = ref(null)

const nextDisabled = computed(() => {
  if (step.value === 1) return !subjectBackup.value || !backupSelected.value
  if (step.value === 2) return !subjectCurrent.value
  return false
})

async function onNext() {
  if (step.value === 3) {
    step.value = 1
    subjectBackup.value = null
    subjectCurrent.value = null
    comparisonData.value = null
    return
  }

  if (step.value === 2) {
    fetchComparison()
  }

  step.value++
}

async function fetchComparison() {
  loadingComparison.value = true
  try {
    const res = await api.post('/backups/compare', {
      backup_db: backupSelected.value,
      current_id: subjectCurrent.value.id,
      backup_id: subjectBackup.value.id,
    })
    comparisonData.value = res.data
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: 'Error comparando datos' })
  } finally {
    loadingComparison.value = false
  }
}

async function restaurar(type, label) {
  $q.dialog({
    title: 'Confirmar Restauración',
    message: `¿Está seguro de inyectar ${label}? Se sobrescribirán los datos actuales de la asignatura seleccionada. Esta acción no se puede deshacer de forma automática.`,
    cancel: true,
    persistent: true,
    ok: { label: 'Inyectar Datos', color: 'orange', unelevated: true },
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Procesando inyección masiva...' })
      await api.post('/backups/restore', {
        type,
        target_id: subjectCurrent.value.id,
        backup_id: subjectBackup.value.id,
        backup_db: backupSelected.value,
      })
      $q.notify({
        color: 'positive',
        message: 'Inyección completada exitosamente',
        icon: 'check_circle',
        position: 'top',
      })
      fetchComparison()
    } catch (err) {
      console.error(err)
      $q.notify({ color: 'negative', message: 'Error en restauración selectiva' })
    } finally {
      $q.loading.hide()
    }
  })
}

// =========================================================================
// API PLANNING LOGIC
// =========================================================================

const loadingAPI = ref(false)
const apiFilter = ref({
  gestion: '1-2026',
  sede: 1,
  carrera: '',
  sigla: '',
})

const sedesList = ref([])
const carrerasListFull = ref([])
const carrerasList = ref([])
const apiResult = ref(null)

const apiColumns = [
  { name: 'nombre', label: 'Grupo', field: 'nombre', align: 'left', sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left' },
  { name: 'docente', label: 'Docente (API / SIDOPA)', field: 'docente', align: 'left' },
  { name: 'dia', label: 'Día', field: 'dia', align: 'left' },
  {
    name: 'horario',
    label: 'Horario',
    field: (row) => `${row.inicio} - ${row.fin}`,
    align: 'left',
  },
  { name: 'aula', label: 'Aula', field: 'aula', align: 'left' },
  { name: 'sidopa_status', label: 'Status', field: 'sidopa_status', align: 'center' },
  { name: 'accion', label: 'Acc.', field: 'sidopa_grupo_id', align: 'center' },
]

const gruposRegistrados = computed(() =>
  apiResult.value
    ? apiResult.value.grupos.filter((g) => g.sidopa_status === 'registrado').length
    : 0,
)
const gruposNuevos = computed(() =>
  apiResult.value ? apiResult.value.grupos.filter((g) => g.sidopa_status === 'nuevo').length : 0,
)
const gruposSeleccionados = computed(() =>
  apiResult.value
    ? apiResult.value.grupos.filter((g) => g.sidopa_status === 'nuevo' && g._selected).length
    : 0,
)

// Dialog state for editing docente
const editDocenteDialog = ref(false)
const editingGrupo = ref(null)
const docenteEdit = ref({ ci: '', nombre: '' })
const savingDocente = ref(false)

function abrirEditarDocente(grupo) {
  editingGrupo.value = grupo
  // Pre-fill with current SIDOPA docente if available, else API docente
  if (grupo.docente_actual) {
    docenteEdit.value = { ci: grupo.docente_actual.ci, nombre: grupo.docente_actual.nombre }
  } else {
    docenteEdit.value = { ci: grupo.ci || '', nombre: grupo.docente || '' }
  }
  editDocenteDialog.value = true
}

function usarDocenteAPI() {
  if (editingGrupo.value) {
    docenteEdit.value = {
      ci: editingGrupo.value.ci || '',
      nombre: editingGrupo.value.docente || '',
    }
  }
}

async function guardarDocente() {
  if (!docenteEdit.value.ci || !docenteEdit.value.nombre) {
    return $q.notify({ color: 'warning', message: 'Ingrese CI y nombre del docente' })
  }
  savingDocente.value = true
  try {
    const res = await api.put('/manual-registration/docente', {
      grupo_id: editingGrupo.value.sidopa_grupo_id,
      ci: docenteEdit.value.ci,
      nombre: docenteEdit.value.nombre.toUpperCase(),
    })
    // Update local state
    editingGrupo.value.docente_actual = res.data.docente
    $q.notify({
      color: 'positive',
      message: 'Docente actualizado correctamente',
      icon: 'check_circle',
    })
    editDocenteDialog.value = false
  } catch (err) {
    console.error(err)
    $q.notify({
      color: 'negative',
      message: err.response?.data?.error || 'Error al actualizar docente',
    })
  } finally {
    savingDocente.value = false
  }
}

onMounted(async () => {
  fetchBackups()
  fetchSedes()
  fetchCarreras()
})

async function fetchBackups() {
  loadingBackups.value = true
  try {
    const res = await api.get('/backups/list')
    backupsAvailable.value = res.data.backups
    if (backupsAvailable.value.length > 0) backupSelected.value = backupsAvailable.value[0]
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: 'Error cargando backups' })
  } finally {
    loadingBackups.value = false
  }
}

async function filterBackupSubjects(val, update) {
  if (val.length < 3)
    return update(() => {
      backupOptions.value = []
    })

  try {
    const res = await api.get(`/backups/search?backup_db=${backupSelected.value}&q=${val}`)
    update(() => {
      backupOptions.value = res.data.map((s) => ({
        ...s,
        label: `[${s.codigo}] ${s.nombre} (${s.plan_estudios || 'N'})`,
      }))
    })
  } catch (err) {
    console.error(err)
  }
}

async function filterCurrentSubjects(val, update) {
  if (val.length < 3)
    return update(() => {
      currentOptions.value = []
    })

  try {
    const res = await api.get(`/backups/search-current?q=${val}`)
    update(() => {
      currentOptions.value = res.data.map((s) => ({
        ...s,
        label: `[${s.codigo}] ${s.nombre}`,
      }))
    })
  } catch (err) {
    console.error(err)
  }
}

function onBackupSelected(val) {
  if (val && !subjectCurrent.value) {
    api
      .get(`/backups/search-current?q=${val.codigo.split('-').slice(0, 2).join('-')}`)
      .then((res) => {
        // Intento de búsqueda inteligente por coincidencia parcial de sigla
        const match = res.data.find((s) => s.codigo.includes(val.codigo.split('-')[0]))
        if (match) {
          subjectCurrent.value = { ...match, label: `[${match.codigo}] ${match.nombre}` }
        }
      })
  }
}

async function fetchSedes() {
  try {
    const res = await api.get('/sedes')
    // Sede 1 is CBA, usually has id_api = 1 or similar
    const data = res.data.data || res.data // handle both cases
    sedesList.value = data.map((s) => ({
      ...s,
      id_api: s.id, // Fallback to ID if id_api is missing in API model
    }))
    if (sedesList.value.length > 0) apiFilter.value.sede = sedesList.value[0].id_api
  } catch (err) {
    console.error(err)
  }
}

async function fetchCarreras() {
  try {
    const res = await api.get('/carreras')
    carrerasListFull.value = res.data
    carrerasList.value = res.data
  } catch (err) {
    console.error(err)
  }
}

function filterCarrerasAPI(val, update) {
  if (val === '') {
    update(() => {
      carrerasList.value = carrerasListFull.value
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    carrerasList.value = carrerasListFull.value.filter(
      (v) =>
        v.nombre.toLowerCase().indexOf(needle) > -1 || v.sigla.toLowerCase().indexOf(needle) > -1,
    )
  })
}

async function fetchAPI() {
  if (!apiFilter.value.sigla) return $q.notify('Ingrese una sigla')

  loadingAPI.value = true
  apiResult.value = null

  // Normalizar filtros
  apiFilter.value.sigla = apiFilter.value.sigla.toUpperCase().trim()
  apiFilter.value.carrera = (apiFilter.value.carrera || '').toUpperCase().trim()

  try {
    const res = await api.get('/manual-registration/fetch', { params: apiFilter.value })
    if (res.data.data === null || (res.data.data && res.data.data.length === 0)) {
      $q.notify({ color: 'warning', message: res.data.message || 'No se encontraron resultados' })
    } else {
      // Marcar todos los grupos nuevos como seleccionados por defecto
      if (res.data.grupos) {
        res.data.grupos = res.data.grupos.map((g) => ({
          ...g,
          _selected: g.sidopa_status === 'nuevo',
        }))
      }
      apiResult.value = res.data
    }
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: 'Error consultando API Planning' })
  } finally {
    loadingAPI.value = false
  }
}

function confirmarRegistroAPI() {
  // Only send NEW groups that are selected
  const selectedItems = apiResult.value.grupos
    .filter((g) => g.sidopa_status === 'nuevo' && g._selected)
    .map((g) => g.raw)

  if (selectedItems.length === 0) {
    return $q.notify({
      color: 'warning',
      message: 'No hay grupos nuevos seleccionados para registrar',
    })
  }

  $q.dialog({
    title: 'Confirmar Registro',
    message: `¿Desea registrar ${selectedItems.length} grupo(s) nuevo(s) de [${apiResult.value.sigla}] en SIDOPA?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Sí, Registrar', color: 'positive', unelevated: true },
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Registrando grupos nuevos...' })
      const res = await api.post('/manual-registration/store', { items: selectedItems })

      $q.notify({
        color: 'positive',
        message: 'Registro completado exitosamente',
        caption: `Grupos creados: ${res.data.stats.grupos}`,
        icon: 'check_circle',
      })
      // Refresh the results to show updated statuses
      fetchAPI()
    } catch (err) {
      console.error(err)
      $q.notify({ color: 'negative', message: 'Error durante el registro' })
    } finally {
      $q.loading.hide()
    }
  })
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
.white-space-pre {
  white-space: pre-wrap;
}
.border-blue {
  border: 1px solid rgba(25, 118, 210, 0.3);
}
.border-green {
  border: 1px solid rgba(46, 125, 50, 0.3);
}
.border-amber {
  border: 1px solid rgba(255, 143, 0, 0.3);
}
.border-light {
  border: 1px solid #ddd;
}
.border-top {
  border-top: 1px solid #eee;
}
.border-left-grey {
  border-left: 2px solid #ddd;
}
.border-left-teal {
  border-left: 4px solid teal;
}
</style>
