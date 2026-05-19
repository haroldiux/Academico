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

                      <!-- Columna Preguntas 2P -->
                      <template v-else-if="col.name === 'preguntas_2p'">
                        <div v-if="cargandoCampos2P" class="row justify-center">
                          <q-spinner-dots color="primary" size="20px">
                            <q-tooltip>Cargando preguntas 2P</q-tooltip>
                          </q-spinner-dots>
                        </div>
                        <div
                          v-else-if="props.row.preguntas_2p_stats"
                          class="column items-center"
                          style="gap: 4px"
                        >
                          <div class="row q-gutter-xs justify-center">
                            <q-chip size="xs" color="blue-7" text-color="white" dense>
                              F: {{ props.row.preguntas_2p_stats.faciles }}
                              <q-tooltip>
                                <div>Fáciles (2P)</div>
                                <div>
                                  Total:
                                  {{ totalPreguntasEvaluables(props.row.preguntas_2p_stats) }}
                                </div>
                                <div>{{ resumenTiposPregunta(props.row.preguntas_2p_stats) }}</div>
                              </q-tooltip>
                            </q-chip>
                            <q-chip size="xs" color="orange-8" text-color="white" dense>
                              M: {{ props.row.preguntas_2p_stats.medias }}
                              <q-tooltip>
                                <div>Medias (2P)</div>
                                <div>
                                  Total:
                                  {{ totalPreguntasEvaluables(props.row.preguntas_2p_stats) }}
                                </div>
                                <div>{{ resumenTiposPregunta(props.row.preguntas_2p_stats) }}</div>
                              </q-tooltip>
                            </q-chip>
                            <q-chip size="xs" color="red-7" text-color="white" dense>
                              D: {{ props.row.preguntas_2p_stats.dificiles }}
                              <q-tooltip>
                                <div>Difíciles (2P)</div>
                                <div>
                                  Total:
                                  {{ totalPreguntasEvaluables(props.row.preguntas_2p_stats) }}
                                </div>
                                <div>{{ resumenTiposPregunta(props.row.preguntas_2p_stats) }}</div>
                              </q-tooltip>
                            </q-chip>
                          </div>
                          <div class="row q-gutter-xs justify-center">
                            <q-chip size="xs" color="green-7" text-color="white" dense>
                              G1: {{ contarGruposTipoPregunta(props.row.preguntas_2p_stats).g1 }}
                              <q-tooltip>
                                <div>G1 VF simple + VF complejas + A/B</div>
                                <div>
                                  {{ resumenGruposTipoPregunta(props.row.preguntas_2p_stats) }}
                                </div>
                              </q-tooltip>
                            </q-chip>
                            <q-chip size="xs" color="blue-8" text-color="white" dense>
                              G2: {{ contarGruposTipoPregunta(props.row.preguntas_2p_stats).g2 }}
                              <q-tooltip>
                                <div>G2 Mejor respuesta</div>
                                <div>
                                  {{ resumenGruposTipoPregunta(props.row.preguntas_2p_stats) }}
                                </div>
                              </q-tooltip>
                            </q-chip>
                            <q-chip size="xs" color="purple-7" text-color="white" dense>
                              G3: {{ contarGruposTipoPregunta(props.row.preguntas_2p_stats).g3 }}
                              <q-tooltip>
                                <div>G3 Casos/problemas + emparejamiento</div>
                                <div>
                                  {{ resumenGruposTipoPregunta(props.row.preguntas_2p_stats) }}
                                </div>
                              </q-tooltip>
                            </q-chip>
                          </div>
                        </div>
                        <div v-else class="text-grey-4">-</div>
                      </template>

                      <!-- Columna Fecha 2P -->
                      <template v-else-if="col.name === 'fecha_2p'">
                        <div v-if="cargandoCampos2P" class="row justify-center">
                          <q-spinner-dots color="teal-7" size="20px">
                            <q-tooltip>Cargando fecha 2P</q-tooltip>
                          </q-spinner-dots>
                        </div>
                        <div v-else class="column items-center" style="gap: 6px">
                          <q-chip
                            v-if="props.row.fecha_2p"
                            size="sm"
                            color="teal-7"
                            text-color="white"
                            icon="event"
                            dense
                          >
                            {{ formatearFechaHora2P(props.row) }}
                            <q-tooltip>Fecha del 2do Parcial</q-tooltip>
                          </q-chip>
                          <div v-else class="text-grey-4">Sin fecha</div>

                          <div
                            v-if="puedeAlternarCartilla2P(props.row)"
                            class="column items-center"
                            style="gap: 2px"
                          >
                            <q-toggle
                              :model-value="examenConCartilla2P(props.row)"
                              :disable="guardandoCartilla2P(props.row)"
                              checked-icon="menu_book"
                              unchecked-icon="block"
                              color="deep-purple-6"
                              dense
                              keep-color
                              @update:model-value="confirmarCambioCartilla2P(props.row, $event)"
                            />
                            <div
                              class="text-caption text-weight-medium"
                              :class="
                                examenConCartilla2P(props.row) ? 'text-positive' : 'text-negative'
                              "
                            >
                              {{ examenConCartilla2P(props.row) ? 'CON CARTILLA' : 'SIN CARTILLA' }}
                            </div>
                          </div>
                        </div>
                      </template>

                      <!-- Columna Estado Examen 2P -->
                      <template v-else-if="col.name === 'estado_examen_2p'">
                        <div v-if="cargandoCampos2P" class="row justify-center">
                          <q-spinner-dots color="deep-purple-6" size="20px">
                            <q-tooltip>Cargando estado del examen 2P</q-tooltip>
                          </q-spinner-dots>
                        </div>
                        <q-chip
                          v-else-if="props.row.estado_examen_2p"
                          size="sm"
                          :color="colorEstadoExamen2P(props.row.estado_examen_2p)"
                          text-color="white"
                          :icon="iconoEstadoExamen2P(props.row.estado_examen_2p)"
                          dense
                        >
                          {{ formatearEstadoExamen2P(props.row.estado_examen_2p) }}
                          <q-tooltip>Estado del examen 2do Parcial</q-tooltip>
                        </q-chip>
                        <div v-else class="text-grey-4">Sin estado</div>
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
                        <q-btn
                          flat
                          round
                          dense
                          icon="upload_file"
                          color="deep-orange"
                          size="sm"
                          @click="abrirImportacionJson(props.row)"
                        >
                          <q-tooltip>Restaurar desde JSON</q-tooltip>
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
                              v-if="
                                obtenerBancoPreguntas2P(props.row, docente) ||
                                docente.preguntas_2p_stats
                              "
                            >
                              <div
                                class="text-caption text-grey-7"
                                v-if="
                                  (
                                    obtenerBancoPreguntas2P(props.row, docente) ||
                                    docente.preguntas_2p_stats
                                  ).grupo_teorico
                                "
                              >
                                <q-icon name="class" size="12px" />
                                Grupo:
                                <strong>{{
                                  (
                                    obtenerBancoPreguntas2P(props.row, docente) ||
                                    docente.preguntas_2p_stats
                                  ).grupo_teorico
                                }}</strong>
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
                                  F:{{
                                    (
                                      obtenerBancoPreguntas2P(props.row, docente) ||
                                      docente.preguntas_2p_stats
                                    ).faciles
                                  }}
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
                                  M:{{
                                    (
                                      obtenerBancoPreguntas2P(props.row, docente) ||
                                      docente.preguntas_2p_stats
                                    ).medias
                                  }}
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
                                  D:{{
                                    (
                                      obtenerBancoPreguntas2P(props.row, docente) ||
                                      docente.preguntas_2p_stats
                                    ).dificiles
                                  }}
                                </span>
                                <span style="font-size: 11px; font-weight: 700; color: #333">
                                  T:{{
                                    totalPreguntasEvaluables(
                                      obtenerBancoPreguntas2P(props.row, docente) ||
                                        docente.preguntas_2p_stats,
                                    )
                                  }}
                                  <q-tooltip>
                                    {{
                                      resumenTiposPregunta(
                                        obtenerBancoPreguntas2P(props.row, docente) ||
                                          docente.preguntas_2p_stats,
                                      )
                                    }}
                                  </q-tooltip>
                                </span>
                              </div>
                              <div class="row items-center" style="gap: 4px">
                                <span
                                  style="
                                    background: #2e7d32;
                                    color: #fff;
                                    font-size: 11px;
                                    font-weight: 600;
                                    padding: 2px 6px;
                                    border-radius: 10px;
                                  "
                                >
                                  G1:{{
                                    contarGruposTipoPregunta(
                                      obtenerBancoPreguntas2P(props.row, docente) ||
                                        docente.preguntas_2p_stats,
                                    ).g1
                                  }}
                                </span>
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
                                  G2:{{
                                    contarGruposTipoPregunta(
                                      obtenerBancoPreguntas2P(props.row, docente) ||
                                        docente.preguntas_2p_stats,
                                    ).g2
                                  }}
                                </span>
                                <span
                                  style="
                                    background: #7b1fa2;
                                    color: #fff;
                                    font-size: 11px;
                                    font-weight: 600;
                                    padding: 2px 6px;
                                    border-radius: 10px;
                                  "
                                >
                                  G3:{{
                                    contarGruposTipoPregunta(
                                      obtenerBancoPreguntas2P(props.row, docente) ||
                                        docente.preguntas_2p_stats,
                                    ).g3
                                  }}
                                  <q-tooltip>
                                    {{
                                      resumenGruposTipoPregunta(
                                        obtenerBancoPreguntas2P(props.row, docente) ||
                                          docente.preguntas_2p_stats,
                                      )
                                    }}
                                  </q-tooltip>
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
                              Sin preguntas 2P
                            </div>
                          </q-item-section>

                          <q-item-section>
                            <div class="text-caption text-grey-7 text-center">
                              <q-icon name="event" size="14px" class="q-mr-xs" />
                              {{ formatearFechaHoraDocente2P(props.row, docente) }}
                            </div>
                            <div
                              v-if="puedeAlternarCartilla2P(props.row, docente)"
                              class="column items-center q-mt-xs"
                              style="gap: 2px"
                            >
                              <q-toggle
                                :model-value="examenConCartilla2P(props.row, docente)"
                                :disable="guardandoCartilla2P(props.row, docente)"
                                checked-icon="menu_book"
                                unchecked-icon="block"
                                color="deep-purple-6"
                                dense
                                keep-color
                                @update:model-value="
                                  confirmarCambioCartilla2P(props.row, $event, docente)
                                "
                              />
                              <div
                                class="text-caption text-weight-medium"
                                :class="
                                  examenConCartilla2P(props.row, docente)
                                    ? 'text-positive'
                                    : 'text-negative'
                                "
                              >
                                {{
                                  examenConCartilla2P(props.row, docente)
                                    ? 'CON CARTILLA'
                                    : 'SIN CARTILLA'
                                }}
                              </div>
                            </div>
                            <div class="q-mt-xs text-center">
                              <q-chip
                                v-if="obtenerEstadoExamenDocente2P(props.row, docente)"
                                size="xs"
                                :color="
                                  colorEstadoExamen2P(
                                    obtenerEstadoExamenDocente2P(props.row, docente),
                                  )
                                "
                                text-color="white"
                                dense
                              >
                                {{
                                  formatearEstadoExamen2P(
                                    obtenerEstadoExamenDocente2P(props.row, docente),
                                  )
                                }}
                              </q-chip>
                              <span v-else class="text-caption text-grey-4">Sin estado 2P</span>
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
    <input
      ref="jsonFileInput"
      type="file"
      accept=".json,application/json"
      style="display: none"
      @change="handleJsonImport"
    />
  </q-page>
</template>

<script setup>
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import asignaturaService from 'src/services/asignaturaService'
import { generarCarpetaDocente } from 'src/services/carpetaDocenteService'
import rolExamenesService from 'src/services/rolExamenesService'
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
const jsonFileInput = ref(null)
const jsonImportTarget = ref(null)
const canToggleOcultarSinAsignar = computed(() =>
  [
    ROLES.DIRECTOR_CARRERA,
    ROLES.DIRECCION_ACADEMICA,
    ROLES.VICERRECTOR_SEDE,
    ROLES.VICERRECTOR_NACIONAL,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN,
  ].includes(authStore.rol),
)

const DEFAULT_LOCAL_STATUS = {
  estado: 'pendiente',
  label: 'Sin verificar',
  resumen: 'Aun no se verifico el estado local de esta asignatura.',
  tiene_contenido: false,
  navigation: null,
  stats: {
    unidades: 0,
    temas: 0,
    bibliografias: 0,
    logros: 0,
    planificaciones: 0,
    docentes: 0,
  },
}

const sanitizePlanEstudios = (value) => {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()

  return normalized || null
}

const resolvePlanEstudiosForRestore = (row) =>
  sanitizePlanEstudios(row?.plan_estudios) ||
  sanitizePlanEstudios(filtros.value.planEstudios) ||
  'N'

const buildRestoreKey = (row) =>
  [
    row?.codigo || 'sin-codigo',
    resolvePlanEstudiosForRestore(row),
    Number(row?.carrera_id || filtros.value.carreraId) || 'sin-carrera',
    Number(row?.sede_id || filtros.value.sedeId) || 'sin-sede',
  ].join('-')

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
    await generarCarpetaDocente(asignaturaFull, carrera, sede)

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

const abrirImportacionJson = (asignatura) => {
  if (!asignatura) {
    return
  }

  jsonImportTarget.value = asignatura

  if (jsonFileInput.value) {
    jsonFileInput.value.value = null
    jsonFileInput.value.click()
  }
}

const readJsonFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result || '{}')))
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('No se pudo leer el archivo JSON.'))
    reader.readAsText(file, 'utf-8')
  })

const resolveAsignaturaFromJson = (payload) => {
  if (!payload) {
    return null
  }

  if (Array.isArray(payload)) {
    return payload[0] || null
  }

  if (Array.isArray(payload?.data?.asignaturas)) {
    return payload.data.asignaturas[0] || null
  }

  if (Array.isArray(payload?.asignaturas)) {
    return payload.asignaturas[0] || null
  }

  if (Array.isArray(payload?.data)) {
    return payload.data[0] || null
  }

  if (payload.codigo || payload.unidades || payload.bibliografias) {
    return payload
  }

  return null
}

const tryParseStructuredValue = (value) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  if (!trimmed || !['[', '{'].includes(trimmed[0])) {
    return value
  }

  try {
    return JSON.parse(trimmed)
  } catch {
    return value
  }
}

const normalizePlanificacion = (planificacion = {}) => ({
  ...planificacion,
  estrategias_recursos: tryParseStructuredValue(planificacion.estrategias_recursos),
  evaluacion_formativa: tryParseStructuredValue(planificacion.evaluacion_formativa),
  evaluacion_sumativa: tryParseStructuredValue(planificacion.evaluacion_sumativa),
  secuencia_didactica: tryParseStructuredValue(planificacion.secuencia_didactica),
})

const normalizeTema = (tema = {}) => ({
  ...tema,
  contenido_items: tryParseStructuredValue(tema.contenido_items),
  contenido_conceptual: tryParseStructuredValue(tema.contenido_conceptual),
  contenido_procedimental: tryParseStructuredValue(tema.contenido_procedimental),
  contenido_actitudinal: tryParseStructuredValue(tema.contenido_actitudinal),
  estrategias_recursos: tryParseStructuredValue(tema.estrategias_recursos),
  evaluacion_formativa: tryParseStructuredValue(tema.evaluacion_formativa),
  evaluacion_sumativa: tryParseStructuredValue(tema.evaluacion_sumativa),
  logros_esperados: Array.isArray(tema.logros_esperados) ? tema.logros_esperados : [],
  bibliografias: Array.isArray(tema.bibliografias) ? tema.bibliografias : [],
  planificaciones_personales: Array.isArray(tema.planificaciones_personales)
    ? tema.planificaciones_personales.map(normalizePlanificacion)
    : [],
  secuencias: Array.isArray(tema.secuencias) ? tema.secuencias : [],
})

const normalizeUnidad = (unidad = {}) => ({
  ...unidad,
  temas: Array.isArray(unidad.temas) ? unidad.temas.map(normalizeTema) : [],
})

const normalizeAsignaturaImportada = (asignatura = {}) => ({
  ...asignatura,
  docentes: Array.isArray(asignatura.docentes) ? asignatura.docentes : [],
  bibliografias: Array.isArray(asignatura.bibliografias) ? asignatura.bibliografias : [],
  unidades: Array.isArray(asignatura.unidades) ? asignatura.unidades.map(normalizeUnidad) : [],
})

const buildContenidoExistenteWarning = (status = DEFAULT_LOCAL_STATUS) => {
  if (!status?.tiene_contenido) {
    return ''
  }

  return `
    <p class="text-weight-bold text-negative q-mb-sm">Advertencia</p>
    <p class="text-negative">
      La asignatura destino ya tiene contenido local.
      Ese contenido se borrara antes de restaurar la nueva estructura.
    </p>
  `
}

const obtenerEstadoRestauracion = async (row) => {
  const restoreKey = buildRestoreKey(row)

  try {
    const response = await api.post('/restauracion/estado-asignaturas', {
      asignaturas: [
        {
          restore_key: restoreKey,
          asignatura_id: Number(row?.id) || null,
          codigo: row?.codigo,
          carrera_id: Number(row?.carrera_id || filtros.value.carreraId) || null,
          sede_id: Number(row?.sede_id || filtros.value.sedeId) || null,
          plan_estudios: resolvePlanEstudiosForRestore(row),
        },
      ],
    })

    return (
      response.data?.data?.[0] || {
        ...DEFAULT_LOCAL_STATUS,
        restore_key: restoreKey,
        asignatura_id: Number(row?.id) || null,
      }
    )
  } catch (error) {
    console.error('Error verificando estado local de restauracion:', error)
    $q.notify({
      type: 'warning',
      message: 'No se pudo verificar el estado local de la asignatura destino.',
    })

    return {
      ...DEFAULT_LOCAL_STATUS,
      restore_key: restoreKey,
      asignatura_id: Number(row?.id) || null,
    }
  }
}

const buildImportedRestorePayload = (targetAsignatura, importedPayload, localStatus) => {
  const importedAsignatura = normalizeAsignaturaImportada(importedPayload)

  return {
    ...importedAsignatura,
    restore_key: buildRestoreKey(targetAsignatura),
    asignatura_id: Number(targetAsignatura?.id) || localStatus?.asignatura_id || null,
    codigo: targetAsignatura.codigo,
    nombre: targetAsignatura.nombre,
    sigla: targetAsignatura.sigla || targetAsignatura.codigo,
    carrera_id: Number(targetAsignatura?.carrera_id || filtros.value.carreraId) || null,
    sede_id: Number(targetAsignatura?.sede_id || filtros.value.sedeId) || null,
    plan_estudios: resolvePlanEstudiosForRestore(targetAsignatura),
    semestre: targetAsignatura?.semestre || importedAsignatura?.semestre || null,
    local_status: localStatus || { ...DEFAULT_LOCAL_STATUS },
    imported_from: {
      codigo: importedAsignatura?.codigo,
      nombre: importedAsignatura?.nombre,
      plan_estudios: importedAsignatura?.plan_estudios,
    },
  }
}

const restaurarAsignaturaDesdeJson = async (payload) => {
  $q.loading.show({
    message: `Restaurando contenido sobre: ${payload.nombre}...`,
  })

  try {
    const response = await api.post('/restauracion/asignatura', payload)
    const stats = response.data?.stats || {}
    const detalle = [
      stats.unidades_restauradas ? `${stats.unidades_restauradas} unidades` : null,
      stats.temas_restaurados ? `${stats.temas_restaurados} temas` : null,
      stats.planificaciones_restauradas !== undefined
        ? `${stats.planificaciones_restauradas} planificaciones enlazadas`
        : null,
      stats.planificaciones_omitidas
        ? `${stats.planificaciones_omitidas} planificaciones omitidas`
        : null,
    ]
      .filter(Boolean)
      .join(' | ')

    $q.notify({
      type: response.data?.status === 'success' ? 'positive' : 'warning',
      message: [response.data?.message || 'Restauracion completada.', detalle]
        .filter(Boolean)
        .join(' '),
      timeout: 5000,
    })

    await cargarAsignaturas()
  } catch (error) {
    console.error('RESTORE JSON ERROR:', error)
    const message = error.response?.data?.message || error.message
    $q.notify({
      type: 'negative',
      message: `Fallo la restauracion: ${message}`,
      timeout: 5000,
    })
  } finally {
    $q.loading.hide()
  }
}

const handleJsonImport = async (event) => {
  const file = event.target?.files?.[0]
  const targetAsignatura = jsonImportTarget.value

  if (!file || !targetAsignatura) {
    return
  }

  try {
    const payload = await readJsonFile(file)
    const importedAsignatura = resolveAsignaturaFromJson(payload)

    if (!importedAsignatura) {
      throw new Error('El archivo no contiene una asignatura valida para restauracion.')
    }

    const localStatus = await obtenerEstadoRestauracion(targetAsignatura)
    const restorePayload = buildImportedRestorePayload(
      targetAsignatura,
      importedAsignatura,
      localStatus,
    )

    $q.dialog({
      title: 'Confirmar restauracion desde JSON',
      message: `
        <p>Se aplicara el contenido del archivo sobre <b>${targetAsignatura.nombre}</b>.</p>
        ${buildContenidoExistenteWarning(localStatus)}
        <p class="q-mb-none">
          Origen del archivo: <b>${restorePayload.imported_from?.nombre || 'Sin nombre'}</b>
          (${restorePayload.imported_from?.codigo || 'Sin codigo'})
        </p>
      `,
      html: true,
      cancel: {
        label: 'Cancelar',
        flat: true,
        color: 'grey-8',
      },
      ok: {
        label: 'Si, restaurar desde JSON',
        color: 'deep-orange',
        unelevated: true,
      },
      persistent: true,
    }).onOk(() => {
      restaurarAsignaturaDesdeJson(restorePayload)
    })
  } catch (error) {
    console.error('JSON IMPORT ERROR:', error)
    $q.notify({
      type: 'negative',
      message: `No se pudo importar el JSON: ${error.message}`,
      timeout: 5000,
    })
  } finally {
    jsonImportTarget.value = null
    if (jsonFileInput.value) {
      jsonFileInput.value.value = null
    }
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

const rolExamenes2PMap = ref({})
const bancoPreguntas2PMap = ref({})
const cargandoCampos2P = ref(false)
const guardandoCartilla2PMap = ref({})

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

  cargandoCampos2P.value = true
  bancoPreguntas2PMap.value = {}
  rolExamenes2PMap.value = {}

  try {
    await asignaturasStore.fetchAsignaturas(
      sedeId,
      filtros.value.carreraId,
      null, // Todos los semestres
      filtros.value.buscar, // Búsqueda backend (opcional, o filtrar en frontend)
    )
    await Promise.all([
      cargarRolExamenes2P(sedeId, filtros.value.carreraId),
      cargarBancoPreguntas2P(),
    ])
  } finally {
    cargandoCampos2P.value = false
  }
}

async function cargarRolExamenes2P(sedeId, carreraId) {
  if (!sedeId || !carreraId) {
    rolExamenes2PMap.value = {}
    return
  }

  try {
    const response = await rolExamenesService.getRolExamenes({
      sede_id: sedeId,
      carrera_id: carreraId,
      gestion: '2026-I',
    })
    const examenes = response.data?.data || response.data || []

    rolExamenes2PMap.value = examenes
      .filter((examen) => examen.tipo_examen === '2do Parcial')
      .reduce((map, examen) => {
        if (examen.materia_codigo) {
          const codigo = normalizarCodigoMateria(examen.materia_codigo)
          map[codigo] = examen

          if (examen.grupo) {
            map[crearRolExamen2PKey(codigo, examen.grupo)] = examen
          }
        }
        return map
      }, {})
  } catch (error) {
    console.error('Error cargando rol de examenes 2P:', error)
    rolExamenes2PMap.value = {}
  }
}

async function cargarBancoPreguntas2P() {
  const solicitudes = []

  asignaturasStore.asignaturas.forEach((asignatura) => {
    if (!asignatura.docentes_data?.length) return

    asignatura.docentes_data.forEach((docente) => {
      const grupoTeorico = docente.grupo_teorico_nombre || docente.preguntas_2p_stats?.grupo_teorico
      if (!docente.id || !grupoTeorico) return

      const sedeId = docente.sede_id || asignatura.sede_id
      const key = crearBancoPreguntas2PKey(asignatura.id, docente.id, sedeId, grupoTeorico)
      solicitudes.push(
        api
          .get('/banco-preguntas/stats', {
            params: {
              asignatura_id: asignatura.id,
              docente_id: docente.id,
              sede_id: sedeId,
              grupo: grupoTeorico,
              parcial: '2do Parcial',
            },
          })
          .then(async (response) => {
            let resumenBanco = normalizarStatsBancoPreguntas2P(response.data, grupoTeorico)

            if (
              Number(resumenBanco.total || 0) > 0 &&
              resumenBanco.g1 + resumenBanco.g2 + resumenBanco.g3 !==
                Number(resumenBanco.total || 0)
            ) {
              const bancoDetalle = await api.get('/banco-preguntas', {
                params: {
                  asignatura_id: asignatura.id,
                  docente_id: docente.id,
                  sede_id: sedeId,
                  grupoTeorico: grupoTeorico,
                  parcial: '2do Parcial',
                  all_docentes: true,
                },
              })
              const preguntas = bancoDetalle.data?.preguntas || bancoDetalle.data || []
              resumenBanco = normalizarStatsBancoPreguntas2P(
                response.data,
                grupoTeorico,
                Array.isArray(preguntas) ? preguntas : [],
              )
            }

            return {
              key,
              stats: resumenBanco,
            }
          })
          .catch((error) => {
            console.error('Error cargando preguntas 2P:', error)
            return null
          }),
      )
    })
  })

  const resultados = await Promise.all(solicitudes)
  bancoPreguntas2PMap.value = resultados.filter(Boolean).reduce((map, item) => {
    map[item.key] = item.stats
    return map
  }, {})
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
    name: 'preguntas_2p',
    label: 'Preguntas 2P',
    field: 'preguntas_2p_stats',
    align: 'center',
    style: 'width: 185px',
  },
  {
    name: 'fecha_2p',
    label: 'Fecha 2P',
    field: 'fecha_2p',
    align: 'center',
    style: 'width: 120px',
  },
  {
    name: 'estado_examen_2p',
    label: 'Estado Examen 2P',
    field: 'estado_examen_2p',
    align: 'center',
    style: 'width: 145px',
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', style: 'width: 100px' },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center',
    style: 'width: 140px',
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

    let preguntas2pMostrar = obtenerBancoPreguntas2P(asig) || asig.preguntas_2p_stats
    const rolExamen2P = obtenerRolExamen2P(asig)
    let fecha2pMostrar = rolExamen2P?.fecha || asig.fecha_2p
    let horaInicio2pMostrar = rolExamen2P?.hora_inicio || asig.hora_inicio_2p
    let horaFin2pMostrar = rolExamen2P?.hora_fin || asig.hora_fin_2p
    let estadoExamen2pMostrar =
      rolExamen2P?.estado || asig.estado_examen_2p || asig.estado_rol_examen_2p

    if (asig.docentes_data && asig.docentes_data.length === 1) {
      const docenteUnico = asig.docentes_data[0]
      const rolExamenDocente2P = obtenerRolExamen2P(asig, docenteUnico) || rolExamen2P
      progresoMostrar = docenteUnico.progreso_documentacion
      indicadoresMostrar = docenteUnico.indicadores_documentacion
      preguntas2pMostrar =
        obtenerBancoPreguntas2P(asig, docenteUnico) || docenteUnico.preguntas_2p_stats
      fecha2pMostrar = rolExamenDocente2P?.fecha || docenteUnico.fecha_2p
      horaInicio2pMostrar = rolExamenDocente2P?.hora_inicio || docenteUnico.hora_inicio_2p
      horaFin2pMostrar = rolExamenDocente2P?.hora_fin || docenteUnico.hora_fin_2p
      estadoExamen2pMostrar =
        rolExamenDocente2P?.estado ||
        docenteUnico.estado_examen_2p ||
        docenteUnico.estado_rol_examen_2p
    }

    grupos[sem].asignaturas.push({
      ...asig,
      row_key: asig.id, // Llave única para la tabla
      progreso_mostrar: progresoMostrar,
      indicadores_mostrar: indicadoresMostrar,
      preguntas_2p_stats: preguntas2pMostrar,
      fecha_2p: fecha2pMostrar,
      hora_inicio_2p: horaInicio2pMostrar,
      hora_fin_2p: horaFin2pMostrar,
      estado_examen_2p: estadoExamen2pMostrar,
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

function normalizarCodigoMateria(codigo) {
  return String(codigo || '')
    .trim()
    .toUpperCase()
}

function normalizarGrupoRolExamen(grupo) {
  return String(grupo || '')
    .trim()
    .toUpperCase()
    .replace(/^GRUPO\s*/, '')
    .replace(/^G[-.\s]*/, '')
}

function crearRolExamen2PKey(codigo, grupo) {
  return `${normalizarCodigoMateria(codigo)}|${normalizarGrupoRolExamen(grupo)}`
}

function obtenerGrupoDocente2P(docente) {
  return (
    docente?.grupo_teorico_nombre || docente?.grupo || docente?.preguntas_2p_stats?.grupo_teorico
  )
}

function obtenerRolExamen2P(asignatura, docente = null) {
  const codigo = normalizarCodigoMateria(asignatura.codigo)
  const grupo = obtenerGrupoDocente2P(docente)

  if (grupo) {
    return rolExamenes2PMap.value[crearRolExamen2PKey(codigo, grupo)] || null
  }

  return rolExamenes2PMap.value[codigo] || null
}

function crearBancoPreguntas2PKey(asignaturaId, docenteId, sedeId, grupoTeorico) {
  return [asignaturaId, docenteId, sedeId, String(grupoTeorico || '').trim()].join('|')
}

function obtenerBancoPreguntas2P(asignatura, docente = null) {
  const docenteData = docente || asignatura.docentes_data?.[0]
  const grupoTeorico =
    docenteData?.grupo_teorico_nombre || docenteData?.preguntas_2p_stats?.grupo_teorico
  if (!docenteData?.id || !grupoTeorico) return null

  const sedeId = docenteData.sede_id || asignatura.sede_id
  return (
    bancoPreguntas2PMap.value[
      crearBancoPreguntas2PKey(asignatura.id, docenteData.id, sedeId, grupoTeorico)
    ] || null
  )
}

function obtenerContextoCartilla2P(asignatura, docente = null) {
  const docenteData =
    docente || (asignatura.docentes_data?.length === 1 ? asignatura.docentes_data[0] : null)
  const grupoTeorico =
    docenteData?.grupo_teorico_nombre ||
    docenteData?.grupo ||
    docenteData?.preguntas_2p_stats?.grupo_teorico

  if (!docenteData?.id || !grupoTeorico) return null

  const sedeId = docenteData.sede_id || asignatura.sede_id
  const rolExamen2P = obtenerRolExamen2P(asignatura, docenteData)

  return {
    asignaturaId: asignatura.id,
    asignaturaNombre: asignatura.nombre,
    sedeId,
    docenteId: docenteData.id,
    docenteNombre: docenteData.nombre_completo || docenteData.nombre || asignatura.docente_nombre,
    grupoTeorico: String(grupoTeorico).trim(),
    estadoExamen:
      rolExamen2P?.estado || docenteData.estado_examen_2p || docenteData.estado_rol_examen_2p,
    key: crearBancoPreguntas2PKey(asignatura.id, docenteData.id, sedeId, grupoTeorico),
    stats: obtenerBancoPreguntas2P(asignatura, docenteData) || null,
  }
}

function puedeAlternarCartilla2P(asignatura, docente = null) {
  const contexto = obtenerContextoCartilla2P(asignatura, docente)
  if (!contexto?.sedeId) return false

  return ['programado', 'programados'].includes(normalizarEstadoExamen2P(contexto.estadoExamen))
}

function examenConCartilla2P(asignatura, docente = null) {
  return obtenerContextoCartilla2P(asignatura, docente)?.stats?.con_cartilla !== false
}

function guardandoCartilla2P(asignatura, docente = null) {
  const key = obtenerContextoCartilla2P(asignatura, docente)?.key
  return key ? Boolean(guardandoCartilla2PMap.value[key]) : false
}

async function confirmarCambioCartilla2P(asignatura, nuevoValor, docente = null) {
  const contexto = obtenerContextoCartilla2P(asignatura, docente)

  if (!contexto) {
    $q.notify({
      type: 'warning',
      message: 'No se encontró el grupo teórico del 2do Parcial para cambiar la cartilla.',
    })
    return
  }

  if (!puedeAlternarCartilla2P(asignatura, docente)) {
    $q.notify({
      type: 'warning',
      message: 'La cartilla solo puede cambiarse mientras el examen estÃ¡ en estado Programado.',
      caption: `Estado actual: ${formatearEstadoExamen2P(contexto.estadoExamen)}`,
      icon: 'lock',
    })
    return
  }

  const estadoDestino = nuevoValor ? 'CON CARTILLA' : 'SIN CARTILLA'
  const mensajeBase = `Se cambiará el estado del banco 2P del grupo <strong>${contexto.grupoTeorico}</strong> a <strong>${estadoDestino}</strong>.`
  const mensaje = nuevoValor
    ? `${mensajeBase}<br><br>¿Deseas continuar?`
    : `${mensajeBase}<br><br>Al confirmar, se eliminarán las preguntas del banco para ese grupo y parcial. ¿Deseas continuar?`

  $q.dialog({
    title: 'Confirmar cambio de cartilla',
    message: mensaje,
    html: true,
    persistent: true,
    ok: {
      label: 'Confirmar',
      color: nuevoValor ? 'primary' : 'negative',
      unelevated: true,
      noCaps: true,
    },
    cancel: {
      label: 'Cancelar',
      flat: true,
      noCaps: true,
    },
  }).onOk(() => {
    guardarCambioCartilla2P(contexto, nuevoValor)
  })
}

async function guardarCambioCartilla2P(contexto, nuevoValor) {
  guardandoCartilla2PMap.value = {
    ...guardandoCartilla2PMap.value,
    [contexto.key]: true,
  }

  try {
    await api.post('/banco-preguntas/save-config', {
      asignatura_id: contexto.asignaturaId,
      sede_id: contexto.sedeId,
      docente_id: contexto.docenteId,
      grupo_teorico: contexto.grupoTeorico,
      parcial: '2do Parcial',
      con_cartilla: nuevoValor,
    })

    await cargarBancoPreguntas2P()

    $q.notify({
      type: 'positive',
      message: nuevoValor
        ? `Banco 2P del grupo ${contexto.grupoTeorico} restablecido a Con Cartilla.`
        : `Banco 2P del grupo ${contexto.grupoTeorico} cambiado a Sin Cartilla.`,
      icon: 'check_circle',
    })
  } catch (error) {
    console.error('Error al cambiar estado de cartilla 2P:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo cambiar el estado de cartilla',
      caption: error.response?.data?.message || error.response?.data?.error || error.message,
      icon: 'error',
    })
  } finally {
    const siguienteEstado = { ...guardandoCartilla2PMap.value }
    delete siguienteEstado[contexto.key]
    guardandoCartilla2PMap.value = siguienteEstado
  }
}

function formatearFechaCorta(fecha) {
  if (!fecha) return 'Sin fecha'

  const [year, month, day] = String(fecha).split('T')[0].split('-')
  if (!year || !month || !day) return fecha

  return `${day}/${month}/${year}`
}

function formatearHoraCorta(hora) {
  if (!hora) return ''

  return String(hora).slice(0, 5)
}

function formatearFechaHora2P(item) {
  const fecha = formatearFechaCorta(item.fecha_2p)
  const horaInicio = formatearHoraCorta(item.hora_inicio_2p)
  const horaFin = formatearHoraCorta(item.hora_fin_2p)

  if (horaInicio && horaFin) return `${fecha} ${horaInicio}-${horaFin}`
  if (horaInicio) return `${fecha} ${horaInicio}`

  return fecha
}

function obtenerDetalleExamenDocente2P(asignatura, docente) {
  const rolExamen2P = obtenerRolExamen2P(asignatura, docente)

  return {
    fecha_2p: rolExamen2P?.fecha || docente?.fecha_2p,
    hora_inicio_2p: rolExamen2P?.hora_inicio || docente?.hora_inicio_2p,
    hora_fin_2p: rolExamen2P?.hora_fin || docente?.hora_fin_2p,
    estado_examen_2p:
      rolExamen2P?.estado || docente?.estado_examen_2p || docente?.estado_rol_examen_2p,
  }
}

function formatearFechaHoraDocente2P(asignatura, docente) {
  const detalle = obtenerDetalleExamenDocente2P(asignatura, docente)

  return detalle.fecha_2p ? formatearFechaHora2P(detalle) : 'Sin fecha 2P'
}

function obtenerEstadoExamenDocente2P(asignatura, docente) {
  return obtenerDetalleExamenDocente2P(asignatura, docente).estado_examen_2p
}

function normalizarEstadoExamen2P(estado) {
  return String(estado || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function formatearEstadoExamen2P(estado) {
  const normalizado = normalizarEstadoExamen2P(estado)
  const etiquetas = {
    programado: 'Programado',
    programados: 'Programado',
    generado: 'Generado',
    generados: 'Generado',
    impreso: 'Impreso',
    impresos: 'Impreso',
    entregado: 'Entregado',
    entregados: 'Entregado',
    devuelto: 'Devuelto',
    devueltos: 'Devuelto',
    revisado: 'Revisado',
    revisados: 'Revisado',
    subido: 'Subido',
    subidos: 'Subido',
  }

  if (etiquetas[normalizado]) return etiquetas[normalizado]

  return String(estado || 'Sin estado')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function colorEstadoExamen2P(estado) {
  const normalizado = normalizarEstadoExamen2P(estado)

  if (['programado', 'programados'].includes(normalizado)) return 'blue-7'
  if (['generado', 'generados'].includes(normalizado)) return 'deep-purple-6'
  if (['impreso', 'impresos'].includes(normalizado)) return 'orange-8'
  if (['entregado', 'entregados'].includes(normalizado)) return 'teal-7'
  if (['devuelto', 'devueltos'].includes(normalizado)) return 'red-7'
  if (['revisado', 'revisados'].includes(normalizado)) return 'green-7'
  if (['subido', 'subidos'].includes(normalizado)) return 'indigo-7'

  return 'grey-7'
}

function iconoEstadoExamen2P(estado) {
  const normalizado = normalizarEstadoExamen2P(estado)

  if (['programado', 'programados'].includes(normalizado)) return 'schedule'
  if (['generado', 'generados'].includes(normalizado)) return 'auto_awesome'
  if (['impreso', 'impresos'].includes(normalizado)) return 'print'
  if (['entregado', 'entregados'].includes(normalizado)) return 'assignment_turned_in'
  if (['devuelto', 'devueltos'].includes(normalizado)) return 'assignment_return'
  if (['revisado', 'revisados'].includes(normalizado)) return 'verified'
  if (['subido', 'subidos'].includes(normalizado)) return 'cloud_done'

  return 'info'
}

function normalizarTipoPregunta2P(tipo) {
  const valor = String(tipo || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()

  if (
    [
      'FV',
      'FALSO_VERDADERO',
      'FALSO O VERDADERO',
      'VERDADERO O FALSO',
      'VERDADERO O FALSO SIMPLE',
    ].includes(valor)
  ) {
    return 'FALSO_VERDADERO'
  }

  if (
    ['PR', 'PROBLEMA', 'PROBLEMA O CASO', 'ITEMS AGRUPADOS POR CASO CLINICO O PROBLEMA'].includes(
      valor,
    )
  ) {
    return 'PROBLEMA'
  }

  if (['EM', 'EMPAREJAMIENTO', 'EMPAREJAMIENTO AMPLIADO'].includes(valor)) {
    return 'EMPAREJAMIENTO'
  }

  if (
    [
      'PREGUNTA_CON_CLAVE',
      'PREGUNTA CON CLAVE',
      'VERDADERO O FALSO COMPLEJAS',
      'VF COMPLEJAS',
    ].includes(valor)
  ) {
    return 'PREGUNTA_CON_CLAVE'
  }

  if (
    [
      'SM',
      'SELECCION_MULTIPLE',
      'RESPUESTA_COMPUESTA',
      'RESPUESTA COMPUESTA',
      'RESPUESTA A/B/AMBAS/NINGUNA',
    ].includes(valor)
  ) {
    return 'SELECCION_MULTIPLE'
  }

  if (
    ['SU', 'SS', 'SELECCION_UNICA', 'SELECCION_SIMPLE', 'SELECCION DE LA MEJOR RESPUESTA'].includes(
      valor,
    )
  ) {
    return 'SELECCION_UNICA'
  }

  if (
    [
      'SP',
      'SUBPREGUNTA',
      'SUBPROBLEMA',
      'SUB PROBLEMA',
      'SUBITEM',
      'SUBITEM DE CASO O PROBLEMA',
    ].includes(valor)
  ) {
    return 'SUBPROBLEMA'
  }

  if (
    ['OPCION_EMPAREJAMIENTO', 'OPCION EMPAREJAMIENTO', 'OPCION DE EMPAREJAMIENTO'].includes(valor)
  ) {
    return 'OPCION_EMPAREJAMIENTO'
  }

  return valor
}

function grupoTipoPregunta2P(tipo) {
  const tipoNormalizado = normalizarTipoPregunta2P(tipo)
  if (
    ['FALSO_VERDADERO', 'PREGUNTA_CON_CLAVE', 'SELECCION_MULTIPLE', 'RESPUESTA_COMPUESTA'].includes(
      tipoNormalizado,
    )
  ) {
    return 'g1'
  }
  if (['SELECCION_UNICA', 'SELECCION_SIMPLE'].includes(tipoNormalizado)) return 'g2'
  if (['SUBPROBLEMA', 'OPCION_EMPAREJAMIENTO'].includes(tipoNormalizado)) return 'g3'
  return null
}

function contarGruposTipoDesdePreguntas2P(preguntas = []) {
  const porTipo = {}
  const porGrupoTipo = { g1: 0, g2: 0, g3: 0 }

  preguntas.forEach((pregunta) => {
    const tipo = normalizarTipoPregunta2P(pregunta?.tipo)
    if (!tipo || ['EMPAREJAMIENTO', 'PROBLEMA'].includes(tipo)) return

    porTipo[tipo] = (porTipo[tipo] || 0) + 1

    const grupo = grupoTipoPregunta2P(tipo)
    if (grupo) {
      porGrupoTipo[grupo] += 1
    }
  })

  return { porTipo, porGrupoTipo }
}

function normalizarStatsBancoPreguntas2P(data, grupoTeorico, preguntas = []) {
  const stats = data?.stats || {}
  let porTipo = data?.por_tipo || stats.por_tipo || {}
  let porGrupoTipo = data?.por_grupo_tipo || stats.por_grupo_tipo || {}
  const resumen = {
    faciles: Number(stats.facil || stats.faciles || 0),
    medias: Number(stats.medio || stats.medias || 0),
    dificiles: Number(stats.dificil || stats.dificiles || 0),
    total: Number(stats.total || 0),
    por_tipo: porTipo,
    por_grupo_tipo: porGrupoTipo,
    g1: Number(stats.g1 || porGrupoTipo.g1 || 0),
    g2: Number(stats.g2 || porGrupoTipo.g2 || 0),
    g3: Number(stats.g3 || porGrupoTipo.g3 || 0),
    grupo_teorico: grupoTeorico,
    con_cartilla: data?.con_cartilla !== false,
  }

  const totalGruposTipo = resumen.g1 + resumen.g2 + resumen.g3
  if (preguntas.length && totalGruposTipo !== resumen.total) {
    const conteoPreguntas = contarGruposTipoDesdePreguntas2P(preguntas)
    porTipo = conteoPreguntas.porTipo
    porGrupoTipo = conteoPreguntas.porGrupoTipo

    resumen.por_tipo = porTipo
    resumen.por_grupo_tipo = porGrupoTipo
    resumen.g1 = porGrupoTipo.g1
    resumen.g2 = porGrupoTipo.g2
    resumen.g3 = porGrupoTipo.g3
  }

  return resumen
}

function contarGruposTipoPregunta(stats) {
  const totalEvaluable = Number(stats?.total || 0)
  const conteoPlano = {
    g1: Number(stats?.g1 || 0),
    g2: Number(stats?.g2 || 0),
    g3: Number(stats?.g3 || 0),
  }

  if (
    conteoPlano.g1 + conteoPlano.g2 + conteoPlano.g3 > 0 &&
    (!totalEvaluable || conteoPlano.g1 + conteoPlano.g2 + conteoPlano.g3 === totalEvaluable)
  ) {
    return conteoPlano
  }

  if (stats?.por_grupo_tipo && Object.keys(stats.por_grupo_tipo).length) {
    const conteoApi = {
      g1: Number(stats.por_grupo_tipo.g1 || 0),
      g2: Number(stats.por_grupo_tipo.g2 || 0),
      g3: Number(stats.por_grupo_tipo.g3 || 0),
    }

    if (
      conteoApi.g1 + conteoApi.g2 + conteoApi.g3 > 0 &&
      (!totalEvaluable || conteoApi.g1 + conteoApi.g2 + conteoApi.g3 === totalEvaluable)
    ) {
      return conteoApi
    }
  }

  const conteo = { g1: 0, g2: 0, g3: 0 }
  Object.entries(stats?.por_tipo || {}).forEach(([tipo, total]) => {
    const grupo = grupoTipoPregunta2P(tipo)
    if (grupo) conteo[grupo] += Number(total || 0)
  })

  return conteo
}

function resumenGruposTipoPregunta(stats) {
  const conteo = contarGruposTipoPregunta(stats)

  return `G1: ${conteo.g1} | G2: ${conteo.g2} | G3: ${conteo.g3}`
}

function resumenTiposPregunta(stats) {
  const porTipo = stats?.por_tipo || {}
  const resumen = Object.entries(porTipo)
    .filter(([, total]) => Number(total) > 0)
    .map(([tipo, total]) => `${formatearTipoPregunta(tipo)}: ${total}`)

  return resumen.length ? resumen.join(' | ') : 'Sin detalle por tipo'
}

function totalPreguntasEvaluables(stats) {
  return Number(stats?.faciles || 0) + Number(stats?.medias || 0) + Number(stats?.dificiles || 0)
}

function formatearTipoPregunta(tipo) {
  return String(tipo || 'SIN_TIPO')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
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
