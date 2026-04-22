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
          <p class="q-ma-none" style="color: var(--text-secondary)">
            Vista general de asignaturas por semestre
          </p>
          <q-chip
            v-if="authStore.rol === 'DIRECCION_ACADEMICA' || authStore.rol === 'VICERRECTOR_SEDE'"
            color="primary"
            text-color="white"
            size="sm"
            icon="apartment"
          >
            Sede: Cochabamba
          </q-chip>
        </div>
      </div>
      <div class="col-auto">
        <q-btn label="Descargar Malla" icon="download" color="primary" flat />
      </div>
    </div>

    <!-- Banner: director sin carrera asignada -->
    <q-banner
      v-if="sinCarreraAsignada"
      class="bg-warning text-white q-mb-lg"
      rounded
      inline-actions
    >
      <template #avatar>
        <q-icon name="warning" color="white" />
      </template>
      <strong>Tu perfil de director no tiene una carrera asignada.</strong>
      Contacta al administrador del sistema para que asigne tu carrera en la gestión de usuarios. No
      podrás ver asignaturas hasta que se configure correctamente.
    </q-banner>

    <!-- Filters -->
    <div class="row q-col-gutter-md q-mb-lg" v-if="!sinCarreraAsignada">
      <div
        class="col-12 col-md-3"
        v-if="['VICERRECTOR_NACIONAL', 'ADMIN', 'SUPER_ADMIN'].includes(authStore.rol)"
      >
        <q-select
          v-model="filtros.sedeId"
          :options="opcionesSedes"
          label="Sede Académica"
          outlined
          dense
          bg-color="white"
          emit-value
          map-options
        >
          <template v-slot:prepend>
            <q-icon name="apartment" />
          </template>
        </q-select>
      </div>
      <div
        :class="
          ['VICERRECTOR_NACIONAL', 'ADMIN', 'SUPER_ADMIN'].includes(authStore.rol)
            ? 'col-12 col-md-3'
            : 'col-12 col-md-4'
        "
      >
        <q-select
          v-model="filtros.carreraId"
          :options="carrerasOptions"
          label="Carrera"
          outlined
          dense
          bg-color="white"
          emit-value
          map-options
          :disable="carrerasOptions.length === 0"
        >
          <template v-slot:prepend>
            <q-icon name="school" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-4">
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
      <div class="col-12 col-md-3">
        <q-select
          v-model="filtros.planEstudios"
          :options="opcionesPlanes"
          label="Plan Curricular"
          outlined
          dense
          bg-color="white"
          emit-value
          map-options
          clearable
        >
          <template v-slot:prepend><q-icon name="layers" /></template>
        </q-select>
      </div>
      <div class="col-12 col-md-auto q-pt-xs">
        <q-toggle
          v-if="canToggleOcultarSinAsignar"
          v-model="filtros.ocultarSinAsignar"
          label="Ocultar sin asignar"
          color="warning"
          dense
        />
      </div>
    </div>

    <!-- Stats -->
    <div class="row q-col-gutter-md q-mb-lg" v-if="!sinCarreraAsignada">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold text-primary">{{ totalAsignaturas }}</div>
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
                <div class="text-h4 text-weight-bold text-positive">{{ asignadasCount }}</div>
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
                <div class="text-h4 text-weight-bold text-warning">{{ vacantesCount }}</div>
                <div class="text-caption text-grey-7">Vacantes / Por Designar</div>
              </div>
              <q-icon name="person_off" size="40px" color="warning" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Semesters List -->
    <div class="q-gutter-md" v-if="!sinCarreraAsignada">
      <div v-for="semestre in semestresFiltrados" :key="semestre.id">
        <q-expansion-item
          header-class="bg-white text-primary text-weight-bold shadow-1"
          style="border-radius: 8px; overflow: hidden"
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
              <q-item-label caption
                >{{ semestre.asignaturas.length }} asignaturas -
                {{ semestre.horasTotales }} horas</q-item-label
              >
            </q-item-section>
          </template>

          <q-card>
            <q-card-section class="q-pa-md bg-grey-1">
              <q-table
                :rows="semestre.asignaturas"
                :columns="columnasAsignaturas"
                row-key="row_key"
                flat
                bordered
                separator="cell"
                class="bg-white rounded-borders"
                hide-bottom
                :pagination="{ rowsPerPage: 0 }"
              >
                <template v-slot:header="props">
                  <q-tr :props="props">
                    <q-th auto-width />
                    <q-th v-for="col in props.cols" :key="col.name" :props="props">{{
                      col.label
                    }}</q-th>
                  </q-tr>
                </template>

                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td auto-width>
                      <q-btn
                        v-if="props.row.docentes_data && props.row.docentes_data.length > 1"
                        size="sm"
                        color="primary"
                        round
                        dense
                        @click="props.expand = !props.expand"
                        :icon="props.expand ? 'remove' : 'add'"
                      />
                    </q-td>

                    <q-td v-for="col in props.cols" :key="col.name" :props="props">
                      <!-- Columna Código / Horas (Default) -->
                      <template v-if="['codigo', 'horas'].includes(col.name)">
                        {{ col.value }}
                      </template>

                      <!-- Columna Asignatura -->
                      <template v-else-if="col.name === 'asignatura'">
                        <div>{{ props.row.nombre }}</div>
                        <div v-if="props.row.comun_token" class="q-mt-xs">
                          <q-chip
                            size="xs"
                            color="indigo-1"
                            text-color="indigo"
                            icon="merge_type"
                            dense
                          >
                            Materia Común
                            <q-tooltip>Esta asignatura se comparte con otras carreras.</q-tooltip>
                          </q-chip>
                        </div>
                      </template>

                      <!-- Columna Docente -->
                      <template v-else-if="col.name === 'docente'">
                        <div v-if="props.row.docente_nombre" class="row items-center no-wrap">
                          <q-avatar
                            size="28px"
                            color="blue-grey-1"
                            text-color="primary"
                            class="q-mr-sm"
                            icon="person"
                          />
                          <div>
                            <div class="text-weight-medium text-body2">
                              {{ props.row.docente_nombre_mostrar }}
                            </div>
                          </div>
                        </div>
                        <div v-else class="text-grey-5 text-italic">
                          <q-icon name="warning" color="warning" class="q-mr-xs" />
                          Sin asignar
                        </div>
                      </template>

                      <!-- Columna Progreso Documentación Global -->
                      <template v-else-if="col.name === 'progreso'">
                        <div class="progreso-cell">
                          <q-linear-progress
                            :value="(props.row.progreso_mostrar || 0) / 100"
                            :color="getProgresoColor(props.row.progreso_mostrar || 0)"
                            rounded
                            size="10px"
                            class="q-mb-xs"
                            style="min-width: 100px"
                          />
                          <span
                            class="progreso-text"
                            :class="getProgresoClass(props.row.progreso_mostrar || 0)"
                          >
                            {{ props.row.progreso_mostrar || 0 }}%
                            <template v-if="props.row.docentes_data?.length > 1">Global</template>
                          </span>

                          <div
                            class="row q-gutter-xs q-mt-xs justify-center"
                            v-if="props.row.docentes_data?.length <= 1"
                          >
                            <q-icon
                              name="folder"
                              :color="
                                props.row.indicadores_mostrar?.programa_analitico?.color ||
                                'negative'
                              "
                              size="18px"
                            >
                              <q-tooltip
                                >Programa Analítico -
                                {{
                                  props.row.indicadores_mostrar?.programa_analitico?.porcentaje ||
                                  0
                                }}%</q-tooltip
                              >
                            </q-icon>
                            <q-icon
                              name="article"
                              :color="
                                props.row.indicadores_mostrar?.programa_asignatura?.color ||
                                'negative'
                              "
                              size="18px"
                            >
                              <q-tooltip
                                >Programa de Asignatura (PAC) -
                                {{
                                  props.row.indicadores_mostrar?.programa_asignatura?.porcentaje ||
                                  0
                                }}%</q-tooltip
                              >
                            </q-icon>
                            <q-icon
                              name="assignment"
                              :color="
                                props.row.indicadores_mostrar?.plan_clase?.color || 'negative'
                              "
                              size="18px"
                            >
                              <q-tooltip
                                >Plan de Clase -
                                {{
                                  props.row.indicadores_mostrar?.plan_clase?.porcentaje || 0
                                }}%</q-tooltip
                              >
                            </q-icon>
                            <q-icon
                              name="event"
                              :color="
                                props.row.indicadores_mostrar?.cronograma?.color || 'negative'
                              "
                              size="18px"
                            >
                              <q-tooltip
                                >Cronograma -
                                {{
                                  props.row.indicadores_mostrar?.cronograma?.porcentaje || 0
                                }}%</q-tooltip
                              >
                            </q-icon>
                            <q-icon
                              name="help_outline"
                              :color="props.row.indicadores_mostrar?.preguntas?.color || 'negative'"
                              size="18px"
                            >
                              <q-tooltip
                                >Preguntas -
                                {{
                                  props.row.indicadores_mostrar?.preguntas?.porcentaje || 0
                                }}%</q-tooltip
                              >
                            </q-icon>
                            <q-icon
                              v-if="props.row.sede_id !== 1"
                              name="assignment_ind"
                              :color="
                                props.row.indicadores_mostrar?.planificacion_personal?.color ||
                                'negative'
                              "
                              size="18px"
                            >
                              <q-tooltip
                                >Planificación Personal -
                                {{
                                  props.row.indicadores_mostrar?.planificacion_personal
                                    ?.porcentaje || 0
                                }}%</q-tooltip
                              >
                            </q-icon>
                          </div>
                        </div>
                      </template>

                      <!-- Columna Preguntas 1P -->
                      <template v-else-if="col.name === 'preguntas_1p'">
                        <div
                          v-if="props.row.preguntas_1p_stats"
                          class="row q-gutter-xs justify-center"
                        >
                          <q-chip size="xs" color="blue-7" text-color="white" dense>
                            F: {{ props.row.preguntas_1p_stats.faciles }}
                            <q-tooltip>Fáciles (1P)</q-tooltip>
                          </q-chip>
                          <q-chip size="xs" color="orange-8" text-color="white" dense>
                            M: {{ props.row.preguntas_1p_stats.medias }}
                            <q-tooltip>Medias (1P)</q-tooltip>
                          </q-chip>
                          <q-chip size="xs" color="red-7" text-color="white" dense>
                            D: {{ props.row.preguntas_1p_stats.dificiles }}
                            <q-tooltip>Difíciles (1P)</q-tooltip>
                          </q-chip>
                        </div>
                        <div v-else class="text-grey-4">-</div>
                      </template>

                      <!-- Columna Estado -->
                      <template v-else-if="col.name === 'estado'">
                        <q-chip
                          :color="props.row.docente_nombre ? 'positive' : 'warning'"
                          :text-color="props.row.docente_nombre ? 'white' : 'black'"
                          size="sm"
                        >
                          {{ props.row.docente_nombre ? 'Asignada' : 'Vacante' }}
                        </q-chip>
                      </template>

                      <!-- Columna Acciones -->
                      <template v-else-if="col.name === 'acciones'">
                        <q-btn
                          flat
                          round
                          dense
                          icon="visibility"
                          color="primary"
                          size="sm"
                          @click="irADocumentacion(props.row)"
                        >
                          <q-tooltip
                            >Ver Documentación
                            <template v-if="props.row.docentes_data?.length > 1"
                              >Agrupada</template
                            ></q-tooltip
                          >
                        </q-btn>
                        <q-btn
                          v-if="props.row.docentes_data?.length <= 1"
                          flat
                          round
                          dense
                          icon="picture_as_pdf"
                          color="secondary"
                          size="sm"
                          @click="generarCarpeta(props.row)"
                        >
                          <q-tooltip>Generar Carpeta Docente</q-tooltip>
                        </q-btn>
                      </template>
                    </q-td>
                  </q-tr>

                  <!-- Fila Expandible para Docentes -->
                  <q-tr v-show="props.expand" :props="props">
                    <q-td colspan="100%" class="bg-grey-2 q-pa-md">
                      <div class="text-weight-bold q-mb-sm text-primary">
                        Progreso Individual por Docente:
                      </div>
                      <q-list bordered class="bg-white rounded-borders">
                        <q-item
                          v-for="docente in props.row.docentes_data"
                          :key="docente.id"
                          class="q-py-md"
                        >
                          <q-item-section avatar>
                            <q-avatar icon="person" color="blue-grey-1" text-color="primary" />
                          </q-item-section>

                          <q-item-section>
                            <q-item-label class="text-weight-bold">{{
                              docente.nombre
                            }}</q-item-label>
                            <q-item-label caption>{{ docente.descripcion_grupos }}</q-item-label>
                          </q-item-section>

                          <q-item-section>
                            <div class="progreso-cell align-center">
                              <q-linear-progress
                                :value="(docente.progreso_documentacion || 0) / 100"
                                :color="getProgresoColor(docente.progreso_documentacion || 0)"
                                rounded
                                size="8px"
                                class="q-mb-xs"
                                style="min-width: 120px"
                              />
                              <span
                                class="progreso-text"
                                :class="getProgresoClass(docente.progreso_documentacion || 0)"
                              >
                                {{ docente.progreso_documentacion || 0 }}%
                              </span>

                              <div class="row q-gutter-xs q-mt-xs justify-center">
                                <q-icon
                                  name="folder"
                                  :color="
                                    docente.indicadores_documentacion?.programa_analitico?.color ||
                                    'negative'
                                  "
                                  size="18px"
                                >
                                  <q-tooltip
                                    >Programa Analítico -
                                    {{
                                      docente.indicadores_documentacion?.programa_analitico
                                        ?.porcentaje || 0
                                    }}%</q-tooltip
                                  >
                                </q-icon>
                                <q-icon
                                  name="article"
                                  :color="
                                    docente.indicadores_documentacion?.programa_asignatura?.color ||
                                    'negative'
                                  "
                                  size="18px"
                                >
                                  <q-tooltip
                                    >Programa de Asignatura (PAC) -
                                    {{
                                      docente.indicadores_documentacion?.programa_asignatura
                                        ?.porcentaje || 0
                                    }}%</q-tooltip
                                  >
                                </q-icon>
                                <q-icon
                                  name="assignment"
                                  :color="
                                    docente.indicadores_documentacion?.plan_clase?.color ||
                                    'negative'
                                  "
                                  size="18px"
                                >
                                  <q-tooltip
                                    >Plan de Clase -
                                    {{
                                      docente.indicadores_documentacion?.plan_clase?.porcentaje ||
                                      0
                                    }}%</q-tooltip
                                  >
                                </q-icon>
                                <q-icon
                                  name="event"
                                  :color="
                                    docente.indicadores_documentacion?.cronograma?.color ||
                                    'negative'
                                  "
                                  size="18px"
                                >
                                  <q-tooltip
                                    >Cronograma -
                                    {{
                                      docente.indicadores_documentacion?.cronograma?.porcentaje ||
                                      0
                                    }}%</q-tooltip
                                  >
                                </q-icon>
                                <q-icon
                                  name="help_outline"
                                  :color="
                                    docente.indicadores_documentacion?.preguntas?.color ||
                                    'negative'
                                  "
                                  size="18px"
                                >
                                  <q-tooltip
                                    >Preguntas -
                                    {{
                                      docente.indicadores_documentacion?.preguntas?.porcentaje || 0
                                    }}%</q-tooltip
                                  >
                                </q-icon>
                                <q-icon
                                  v-if="props.row.sede_id !== 1"
                                  name="assignment_ind"
                                  :color="
                                    docente.indicadores_documentacion?.planificacion_personal
                                      ?.color || 'negative'
                                  "
                                  size="18px"
                                >
                                  <q-tooltip
                                    >Planificación Personal -
                                    {{
                                      docente.indicadores_documentacion?.planificacion_personal
                                        ?.porcentaje || 0
                                    }}%</q-tooltip
                                  >
                                </q-icon>
                              </div>
                            </div>
                          </q-item-section>

                          <q-item-section>
                            <div
                              class="column items-center"
                              style="gap: 4px"
                              v-if="docente.preguntas_1p_stats"
                            >
                              <div
                                class="text-caption text-grey-7"
                                v-if="docente.preguntas_1p_stats.grupo_teorico"
                              >
                                <q-icon name="class" size="12px" />
                                Grupo:
                                <strong>{{ docente.preguntas_1p_stats.grupo_teorico }}</strong>
                              </div>
                              <div class="row items-center" style="gap: 4px">
                                <span
                                  style="
                                    background: #1565c0;
                                    color: #fff;
                                    font-size: 11px;
                                    font-weight: 600;
                                    padding: 2px 6px;
                                    border-radius: 10px;
                                  "
                                >
                                  F:{{ docente.preguntas_1p_stats.faciles }}
                                </span>
                                <span
                                  style="
                                    background: #e65100;
                                    color: #fff;
                                    font-size: 11px;
                                    font-weight: 600;
                                    padding: 2px 6px;
                                    border-radius: 10px;
                                  "
                                >
                                  M:{{ docente.preguntas_1p_stats.medias }}
                                </span>
                                <span
                                  style="
                                    background: #c62828;
                                    color: #fff;
                                    font-size: 11px;
                                    font-weight: 600;
                                    padding: 2px 6px;
                                    border-radius: 10px;
                                  "
                                >
                                  D:{{ docente.preguntas_1p_stats.dificiles }}
                                </span>
                                <span style="font-size: 11px; font-weight: 700; color: #333">
                                  T:{{ docente.preguntas_1p_stats.total }}
                                </span>
                              </div>
                            </div>
                            <div
                              v-else-if="docente.tiene_grupo_teorico === false"
                              class="text-caption text-grey-4 text-center"
                            >
                              <q-icon name="info" size="12px" class="q-mr-xs" />
                              Solo grupos prácticos
                            </div>
                            <div v-else class="text-caption text-grey-5 text-center">
                              Sin preguntas 1P
                            </div>
                          </q-item-section>

                          <q-item-section side>
                            <div class="row q-gutter-sm">
                              <q-btn
                                flat
                                round
                                dense
                                icon="visibility"
                                color="primary"
                                @click="
                                  irADocumentacion({
                                    ...props.row,
                                    docentes_data: [docente],
                                    docente_nombre: docente.nombre,
                                  })
                                "
                              >
                                <q-tooltip>Ver Documentación Individual</q-tooltip>
                              </q-btn>
                              <q-btn
                                flat
                                round
                                dense
                                icon="picture_as_pdf"
                                color="secondary"
                                @click="
                                  generarCarpeta({
                                    ...props.row,
                                    docentes_data: [docente],
                                    docente_nombre: docente.nombre,
                                  })
                                "
                              >
                                <q-tooltip>Generar Carpeta Individual</q-tooltip>
                              </q-btn>
                            </div>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
    </div>
    <q-dialog v-model="showDocenteDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Seleccionar Docente</div>
          <div class="text-caption">Esta asignatura tiene múltiples docentes.</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-list bordered separator>
            <q-item
              v-for="docente in docentesDialogOptions"
              :key="docente.id"
              clickable
              v-ripple
              @click="seleccionarDocente(docente.id)"
            >
              <q-item-section avatar>
                <q-avatar icon="person" color="primary" text-color="white" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ docente.nombre }}</q-item-label>
                <q-item-label caption>{{ docente.descripcion_grupos }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import asignaturaService from 'src/services/asignaturaService'
import { generarCarpetaDocente } from 'src/services/carpetaDocenteService'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, ROLES } from 'src/stores/auth'
import { useAsignaturasStore } from 'src/stores/asignaturas'
import { useCarrerasStore } from 'src/stores/carreras'
import { useSedesStore } from 'src/stores/sedes'

const authStore = useAuthStore()
const asignaturasStore = useAsignaturasStore()
const carrerasStore = useCarrerasStore()
const $q = useQuasar()
const router = useRouter()

// State for interaction
const showDocenteDialog = ref(false)
const docentesDialogOptions = ref([])
const asignaturaSeleccionada = ref(null)
const dialogMode = ref('pdf') // 'pdf' | 'nav'
const canToggleOcultarSinAsignar = computed(() =>
  [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(authStore.rol),
)

// Función para ir a documentación (con selección de docente si es materia común)
function irADocumentacion(row) {
  const docentes = row.docentes_data || []
  const baseQuery = {
    sede_id: row.sede_id,
    nombre_sede: row.sede_nombre,
  }

  if (docentes.length === 0) {
    // Sin docentes, ir directamente
    router.push({ path: `/documentacion/${row.id}`, query: baseQuery })
    return
  }

  if (docentes.length === 1) {
    // Un solo docente, ir con su ID y sede
    router.push({
      path: `/documentacion/${row.id}`,
      query: { ...baseQuery, docente_id: docentes[0].id },
    })
    return
  }

  // Múltiples docentes (Materia Común): Mostrar diálogo de selección
  dialogMode.value = 'nav'
  asignaturaSeleccionada.value = row
  docentesDialogOptions.value = docentes
  showDocenteDialog.value = true
}

// Action function
async function generarCarpeta(row) {
  // 1. Check if we have multiple docents
  const docentes = row.docentes_data || []

  if (docentes.length === 0) {
    // If no docent, try to generate generic (might fail if service requires docent linked data)
    // Warning the user
    $q.notify({
      type: 'warning',
      message: 'Esta asignatura no tiene docentes asignados. Se generará una carpeta vacía.',
    })
    await processGenerarPDF(row, null)
    return
  }

  if (docentes.length === 1) {
    // Single docent, proceed directly
    await processGenerarPDF(row, docentes[0].id)
    return
  }

  // Multiple docents: Show dialog
  dialogMode.value = 'pdf'
  asignaturaSeleccionada.value = row
  docentesDialogOptions.value = docentes
  showDocenteDialog.value = true
}

async function seleccionarDocente(docenteId) {
  showDocenteDialog.value = false
  if (!asignaturaSeleccionada.value) return

  if (dialogMode.value === 'nav') {
    // Navegar a documentación con el docente seleccionado y contexto de sede
    router.push({
      path: `/documentacion/${asignaturaSeleccionada.value.id}`,
      query: {
        docente_id: docenteId,
        sede_id: asignaturaSeleccionada.value.sede_id,
        nombre_sede: asignaturaSeleccionada.value.sede_nombre,
      },
    })
  } else {
    // Generar PDF
    await processGenerarPDF(asignaturaSeleccionada.value, docenteId)
  }

  asignaturaSeleccionada.value = null
}

async function processGenerarPDF(rowSummary, docenteId) {
  console.log('Iniciando generación de PDF', rowSummary.id, docenteId)
  $q.loading.show({
    message: 'Generando Carpeta Docente...',
    boxClass: 'bg-grey-2 text-grey-9',
    spinnerColor: 'primary',
  })

  try {
    // 1. Fetch FULL data from backend (bypassing local summary)
    // We reuse asignaturaService directly to avoid state side-effects in store if possible,
    // or just use store but be aware. Let's use service directly.
    const params = {}
    if (docenteId) params.docente_id = docenteId

    // Fetch full detail
    const response = await asignaturaService.getAsignatura(rowSummary.id, params)
    const asignaturaFull = response.data

    // 2. Construct context objects (Carrera, Sede) similar to AsignaturaEditPage
    // The full response usually has 'carrera' object injected or we use row data.
    // AsignaturaController returns 'carrera' object with 'sede' inside.
    const carrera = asignaturaFull.carrera || {
      nombre: rowSummary.carrera_nombre || 'Desconocida',
      id: rowSummary.carrera_id,
    }

    // Ensure sede exists
    const sede = carrera.sede || {
      nombre: rowSummary.sede_nombre || 'Sede Central',
      id: rowSummary.sede_id,
    }

    if (!carrera.sede) carrera.sede = sede // Link them if missing

    // 3. Generate PDF
    generarCarpetaDocente(asignaturaFull, carrera, sede)

    $q.notify({
      type: 'positive',
      message: 'Carpeta generada exitosamente',
    })
  } catch (error) {
    console.error('Error generando PDF:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar la carpeta docente.',
    })
  } finally {
    $q.loading.hide()
  }
}

// Filtros
const filtros = ref({
  sedeId: ['ADMIN', 'SUPER_ADMIN', 'VICERRECTOR_NACIONAL'].includes(authStore.rol)
    ? null
    : authStore.usuarioActual?.director?.sede_id || authStore.sedeId,
  carreraId: null,
  buscar: '',
  ocultarSinAsignar: canToggleOcultarSinAsignar.value,
  planEstudios: null, // null = todos, 'N' = Plan Nuevo, 'A' = Plan Antiguo
})

const opcionesPlanes = [
  { label: 'Plan Nuevo (N)', value: 'N' },
  { label: 'Plan Antiguo (A)', value: 'A' },
]

// Opciones de Sedes (solo para roles que necesitan selector de sede)
const sedesStore = useSedesStore()
const opcionesSedes = computed(() => {
  return sedesStore.sedes.map((s) => ({
    label: s.nombre,
    value: s.id,
  }))
})

// Opciones de Carreras (Dinámicas)
const carrerasOptions = computed(() => {
  // Para Vicerrectorado Nacional, Admin, Super Admin: Mostrar carreras de la sede seleccionada
  if (['VICERRECTOR_NACIONAL', 'ADMIN', 'SUPER_ADMIN'].includes(authStore.rol)) {
    if (!filtros.value.sedeId) return []
    return carrerasStore.getCarrerasBySede(filtros.value.sedeId).map((c) => ({
      label: c.nombre,
      value: c.id,
    }))
  }

  // Para Vicerrector Sede o Direccion Academica: Mostrar todas las carreras de su sede
  if (authStore.rol === ROLES.VICERRECTOR_SEDE || authStore.rol === ROLES.DIRECCION_ACADEMICA) {
    // Obtener sede del usuario
    const sedeId = authStore.sedeId || authStore.usuarioActual?.sede_id

    if (!sedeId) {
      // Si no hay sede asignada, mostrar todas las carreras
      return carrerasStore.carreras.map((c) => ({
        label: c.nombre,
        value: c.id,
      }))
    }

    // Mostrar carreras de la sede del usuario
    return carrerasStore.getCarrerasBySede(sedeId).map((c) => ({
      label: c.nombre,
      value: c.id,
    }))
  }

  // Para Director: Mostrar su(s) carrera(s) asignada(s)
  const director = authStore.usuarioActual?.director
  if (!director) return []

  // Opción 1: Director con múltiples carreras
  if (director.carreras && director.carreras.length > 0) {
    return director.carreras.map((c) => ({
      label: c.nombre,
      value: c.id,
    }))
  }

  // Opción 2: Director de una sola carrera (fallback)
  if (director.carrera) {
    return [{ label: director.carrera.nombre, value: director.carrera.id }]
  }

  return []
})

// Detectar si el director no tiene carrera asignada
// Solo aplica para rol DIRECTOR_CARRERA, no para admin/vicerrector
const sinCarreraAsignada = computed(() => {
  const rolesConAccesoTotal = [
    'VICERRECTOR_NACIONAL',
    'ADMIN',
    'SUPER_ADMIN',
    'VICERRECTOR_SEDE',
    'DIRECCION_ACADEMICA',
  ]
  if (rolesConAccesoTotal.includes(authStore.rol)) return false
  if (authStore.rol !== 'DIRECTOR_CARRERA') return false
  return carrerasOptions.value.length === 0
})

// Cargar datos
async function cargarAsignaturas() {
  if (!filtros.value.carreraId) return

  // Usar la sede de los filtros (manual para Nacional, automática para los demás)
  const sedeId = filtros.value.sedeId

  await asignaturasStore.fetchAsignaturas(
    sedeId,
    filtros.value.carreraId,
    null, // Todos los semestres
    filtros.value.buscar, // Búsqueda backend (opcional, o filtrar en frontend)
  )
}

onMounted(async () => {
  // Cargar sedes si es nacional, admin o super admin
  if (
    ['VICERRECTOR_NACIONAL', 'ADMIN', 'SUPER_ADMIN'].includes(authStore.rol) &&
    sedesStore.sedes.length === 0
  ) {
    await sedesStore.fetchSedes()
  }

  // Cargar carreras primero
  if (carrerasStore.carreras.length === 0) {
    await carrerasStore.fetchCarreras()
  }

  // Si es nacional/admin, pre-seleccionar la primera sede
  if (
    ['VICERRECTOR_NACIONAL', 'ADMIN', 'SUPER_ADMIN'].includes(authStore.rol) &&
    opcionesSedes.value.length > 0 &&
    !filtros.value.sedeId
  ) {
    filtros.value.sedeId = opcionesSedes.value[0].value
  }

  // Pre-seleccionar la primera carrera disponible
  if (carrerasOptions.value.length > 0) {
    filtros.value.carreraId = carrerasOptions.value[0].value
    cargarAsignaturas()
  } else if (sinCarreraAsignada.value) {
    // Limpiar cualquier dato previo en el store para no mostrar asignaturas de otro usuario
    asignaturasStore.asignaturas = []
  }
})

// Watchers
watch(
  () => filtros.value.sedeId,
  () => {
    // Al cambiar de sede, limpiar carrera y recargar si hay carreras disponibles
    filtros.value.carreraId = null
    if (carrerasOptions.value.length > 0) {
      filtros.value.carreraId = carrerasOptions.value[0].value
    }
  },
)
watch(
  () => filtros.value.carreraId,
  () => {
    cargarAsignaturas()
  },
)

// Debounce para búsqueda si queremos búsqueda backend,
// pero como la lista no es gigante, el filtrado frontend computed es más fluido para UX.
// Mantenemos búsqueda Frontend sobre los datos cargados.

// Columnas
const columnasAsignaturas = [
  {
    name: 'codigo',
    label: 'Código',
    field: 'codigo',
    align: 'left',
    sortable: true,
    style: 'width: 100px',
  },
  { name: 'asignatura', label: 'Asignatura', field: 'nombre', align: 'left', sortable: true },
  {
    name: 'horas',
    label: 'Horas',
    field: 'horas_teoricas',
    align: 'center',
    format: (val, row) => (row.horas_teoricas || 0) * 20 + (row.horas_practicas || 0) * 20,
    style: 'width: 80px',
  }, // Suma x20
  { name: 'docente', label: 'Docente Principal', field: 'docente_nombre', align: 'left' },
  {
    name: 'progreso',
    label: 'Progreso Doc.',
    field: 'progreso_documentacion',
    align: 'center',
    sortable: true,
    style: 'width: 180px',
  },
  {
    name: 'preguntas_1p',
    label: 'Preguntas 1P',
    field: 'preguntas_1p_stats',
    align: 'center',
    style: 'width: 150px',
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', style: 'width: 100px' },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center',
    style: 'width: 100px',
  },
]

// Computed: Estadísticas
const totalAsignaturas = computed(() => asignaturasStore.asignaturas.length)
const asignadasCount = computed(
  () => asignaturasStore.asignaturas.filter((a) => a.docentes && a.docentes.length > 0).length,
)
const vacantesCount = computed(() => totalAsignaturas.value - asignadasCount.value)

// ComputedPrincipal: Semestres Agrupados
const semestresFiltrados = computed(() => {
  const busqueda = filtros.value.buscar.toLowerCase()
  let lista = asignaturasStore.asignaturas

  // 1. Filtrado por búsqueda
  if (busqueda) {
    lista = lista.filter(
      (a) =>
        a.nombre.toLowerCase().includes(busqueda) ||
        a.codigo.toLowerCase().includes(busqueda) ||
        (a.docente_nombre && a.docente_nombre.toLowerCase().includes(busqueda)),
    )
  }

  // 2. Filtro por Plan Curricular (N / A)
  if (filtros.value.planEstudios) {
    lista = lista.filter((a) => (a.plan_estudios || 'N') === filtros.value.planEstudios)
  }

  // 3. Filtro: ocultar sin docente asignado o con nombre inválido (ej. 'A A A')
  if (!canToggleOcultarSinAsignar.value || filtros.value.ocultarSinAsignar) {
    lista = lista.filter((a) => {
      const tieneDocente = a.docentes_data && a.docentes_data.length > 0
      if (!tieneDocente) return false
      // Excluir nombres que son solo letras sueltas: 'A A A', 'B B', etc.
      const nombre = (a.docente_nombre || '').trim()
      const esPlaceholder = nombre.length > 0 && nombre.split(' ').every((w) => w.length <= 1)
      return !esPlaceholder
    })
  }

  // 2. Agrupación por Semestre
  // Estructura deseada: [{ id: 1, nombre: 'Primer Semestre', asignaturas: [...] }, ...]
  const grupos = {}

  lista.forEach((asig) => {
    const sem = asig.semestre || 0
    if (!grupos[sem]) {
      grupos[sem] = {
        id: sem,
        numero: sem,
        nombre: getNemotecnicoSemestre(sem),
        horasTotales: 0,
        asignaturas: [],
      }
    }

    // Sumar horas
    grupos[sem].horasTotales += (asig.horas_teoricas || 0) * 20 + (asig.horas_practicas || 0) * 20

    let progresoMostrar = asig.progreso_documentacion
    let indicadoresMostrar = asig.indicadores_documentacion
    let docenteNombreMostrar =
      asig.docentes_data?.length > 1
        ? `Varios Docentes (${asig.docentes_data.length})`
        : asig.docente_nombre

    let preguntas1pMostrar = asig.preguntas_1p_stats

    if (asig.docentes_data && asig.docentes_data.length === 1) {
      progresoMostrar = asig.docentes_data[0].progreso_documentacion
      indicadoresMostrar = asig.docentes_data[0].indicadores_documentacion
      preguntas1pMostrar = asig.docentes_data[0].preguntas_1p_stats
    }

    grupos[sem].asignaturas.push({
      ...asig,
      row_key: asig.id, // Llave única para la tabla
      progreso_mostrar: progresoMostrar,
      indicadores_mostrar: indicadoresMostrar,
      preguntas_1p_stats: preguntas1pMostrar,
      docente_nombre_mostrar: docenteNombreMostrar,
    })
  })

  // Convertir objeto a array y ordenar
  return Object.values(grupos).sort((a, b) => a.numero - b.numero)
})

// Helper para nombres de semestre
function getNemotecnicoSemestre(n) {
  const maps = [
    'Cero',
    'Primer',
    'Segundo',
    'Tercer',
    'Cuarto',
    'Quinto',
    'Sexto',
    'Séptimo',
    'Octavo',
    'Noveno',
    'Décimo',
  ]
  return (maps[n] || n) + ' Semestre'
}

// Funciones de progreso para documentación
function getProgresoColor(progreso) {
  if (progreso >= 80) return 'green'
  if (progreso >= 50) return 'orange'
  if (progreso >= 30) return 'amber'
  return 'red'
}

function getProgresoClass(progreso) {
  if (progreso >= 80) return 'text-green'
  if (progreso >= 50) return 'text-orange'
  return 'text-red'
}
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

/* Estilos de progreso de documentación */
.progreso-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.progreso-text {
  font-size: 0.75rem;
  font-weight: 600;
}

.progreso-text.text-green {
  color: #22c55e;
}
.progreso-text.text-orange {
  color: #f97316;
}
.progreso-text.text-red {
  color: #ef4444;
}
</style>
