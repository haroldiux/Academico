<template>
  <q-page class="comparacion-asignatura-page q-pa-lg">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title text-gradient">
          <q-icon name="compare_arrows" color="primary" class="q-mr-sm" />
          Comparación de Asignatura
        </h1>
        <div class="header-subtitle">
          <p class="page-subtitle">
            Comparación detallada entre API de Planificación y datos locales
          </p>
          <div class="header-badges q-mt-xs">
            <q-badge color="positive" label="API Externa" class="q-mr-xs" />
            <q-badge color="primary" label="Plan Nuevo (N)" />
          </div>
        </div>
      </div>
      <div class="header-actions">
        <q-btn
          outline
          color="primary"
          icon="arrow_back"
          label="Volver"
          @click="$router.go(-1)"
          no-caps
        />
      </div>
    </div>

    <!-- Información básica -->
    <q-card class="info-card q-mb-md">
      <q-card-section>
        <div class="row items-center">
          <div class="col">
            <div class="text-h6">
              <q-chip
                outline
                color="primary"
                text-color="primary"
                size="md"
                class="text-weight-bold"
              >
                {{ asignaturaData?.codigo }}
              </q-chip>
              {{ asignaturaData?.nombre }}
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">
              <div>Sede: {{ sedeNombre }}</div>
              <div>Carrera: {{ carreraNombre }}</div>
              <div>Gestión: {{ gestion }}</div>
              <div>Semestre: {{ asignaturaData?.semestre }}</div>
            </div>
          </div>
          <div class="col-auto">
            <q-badge
              :color="
                comparacion.existe_en_api && comparacion.existe_en_local ? 'positive' : 'warning'
              "
              :label="
                comparacion.existe_en_api && comparacion.existe_en_local
                  ? 'Coincide'
                  : 'Sin coincidencia completa'
              "
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Comparación lado a lado -->
    <div class="comparison-grid">
      <!-- Columna API Externa -->
      <q-card class="comparison-column">
        <q-card-section>
          <div class="column-header">
            <q-icon name="cloud" size="24px" color="positive" class="q-mr-sm" />
            <span class="text-h6">API de Planificación</span>
            <q-badge
              color="positive"
              :label="comparacion.existe_en_api ? 'Disponible' : 'No disponible'"
              class="q-ml-sm"
            />
          </div>
        </q-card-section>

        <q-card-section v-if="apiData" class="q-pt-none">
          <div class="section">
            <div class="section-title">Docentes con Grupos</div>
            <div v-if="apiData.docentes && apiData.docentes.length">
              <div
                v-for="(docenteStr, idx) in apiData.docentes"
                :key="idx"
                class="docente-item q-mb-sm"
              >
                <div class="docente-nombre">{{ parseDocenteConGrupos(docenteStr).docente }}</div>
                <div v-if="parseDocenteConGrupos(docenteStr).grupos.length" class="grupos-section">
                  <q-chip
                    v-for="(grupo, gIdx) in parseDocenteConGrupos(docenteStr).grupos"
                    :key="gIdx"
                    dense
                    color="positive"
                    text-color="white"
                    size="sm"
                    class="q-mr-xs q-mb-xs"
                  >
                    {{ grupo }}
                  </q-chip>
                </div>
              </div>
            </div>
            <div v-else class="text-grey-7 text-italic">Sin docentes asignados en API</div>
          </div>

          <div class="section q-mt-md">
            <div class="section-title">Información Adicional</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Código:</span>
                <span class="info-value">{{ apiData.codigo }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Semestre:</span>
                <span class="info-value">{{ apiData.semestre }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Plan:</span>
                <span class="info-value">{{ apiData.plan_estudios }}</span>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section v-else class="text-center q-pa-xl">
          <q-icon name="cloud_off" size="4rem" color="grey-5" class="q-mb-md" />
          <div class="text-h6 text-grey-7">Asignatura no encontrada en API</div>
          <div class="text-body2 text-grey-5">
            No se encontró esta asignatura en la API de Planificación externa
          </div>
        </q-card-section>
      </q-card>

      <!-- Columna Datos Locales -->
      <q-card class="comparison-column">
        <q-card-section>
          <div class="column-header">
            <q-icon name="storage" size="24px" color="primary" class="q-mr-sm" />
            <span class="text-h6">Datos Locales</span>
            <q-badge
              color="primary"
              :label="comparacion.existe_en_local ? 'Disponible' : 'No disponible'"
              class="q-ml-sm"
            />
            <div class="column-header-actions">
              <q-btn
                outline
                color="primary"
                icon="folder_open"
                label="Verificar Carpeta"
                size="sm"
                no-caps
                @click="verificarCarpeta"
              >
                <q-tooltip>Verificar si existe la carpeta (asignatura) localmente</q-tooltip>
              </q-btn>
              <q-btn
                outline
                color="teal"
                icon="manage_search"
                label="Encontrar Docentes"
                size="sm"
                no-caps
                :disable="!comparacion.existe_en_api"
                @click="encontrarDocentes"
              >
                <q-tooltip>Buscar docentes en Planning y asignarlos localmente</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>

        <q-card-section v-if="localData" class="q-pt-none">
          <div class="section">
            <div class="section-title">Docentes con Grupos</div>
            <div v-if="localData.docentes && localData.docentes.length">
              <div
                v-for="(docente, idx) in localData.docentes"
                :key="idx"
                class="docente-item q-mb-sm"
              >
                <div class="docente-header row items-center justify-between q-mb-xs">
                  <div class="docente-nombre text-weight-medium">{{ docente.docente }}</div>
                  <q-btn
                    dense
                    flat
                    round
                    icon="add"
                    size="sm"
                    color="primary"
                    @click="abrirDialogoAsignar(docente)"
                    :loading="asignandoGrupo"
                  />
                </div>
                <div v-if="docente.grupos && docente.grupos.length" class="grupos-section">
                  <q-chip
                    v-for="(grupo, gIdx) in docente.grupos"
                    :key="gIdx"
                    dense
                    color="primary"
                    text-color="white"
                    size="sm"
                    class="q-mr-xs q-mb-xs"
                    removable
                    @remove="() => quitarGrupo(docente, grupo)"
                    :loading="quitandoGrupo && quitandoGrupoId === grupo.id"
                  >
                    {{ grupo.nombre }}
                  </q-chip>
                </div>
              </div>
            </div>
            <div v-else class="text-grey-7 text-italic">Sin docentes asignados localmente</div>
          </div>

          <div class="section q-mt-md">
            <div class="section-title">Información Adicional</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Código:</span>
                <span class="info-value">{{ localData.codigo }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Semestre:</span>
                <span class="info-value">{{ localData.semestre }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Plan:</span>
                <span class="info-value">{{ localData.plan_estudios }}</span>
              </div>
              <div class="info-item" v-if="localData.grupos">
                <span class="info-label">Grupos totales:</span>
                <span class="info-value">{{ localData.grupos.length }}</span>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section v-else class="text-center q-pa-xl">
          <q-icon name="folder_off" size="4rem" color="grey-5" class="q-mb-md" />
          <div class="text-h6 text-grey-7">Asignatura no encontrada localmente</div>
          <div class="text-body2 text-grey-5">
            No se encontró esta asignatura en la base de datos local
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Resumen de Comparación -->
    <q-card class="comparison-summary q-mt-md">
      <q-card-section>
        <div class="text-h6">Resumen de Comparación</div>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">Coincidencia en API</div>
            <div class="summary-value">
              <q-badge :color="comparacion.existe_en_api ? 'positive' : 'negative'">
                {{ comparacion.existe_en_api ? 'Sí' : 'No' }}
              </q-badge>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Coincidencia Local</div>
            <div class="summary-value">
              <q-badge :color="comparacion.existe_en_local ? 'positive' : 'negative'">
                {{ comparacion.existe_en_local ? 'Sí' : 'No' }}
              </q-badge>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Coincidencia Nombre</div>
            <div class="summary-value">
              <q-badge :color="comparacion.coincidencia_nombre ? 'positive' : 'warning'">
                {{ comparacion.coincidencia_nombre ? 'Sí' : 'No' }}
              </q-badge>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Coincidencia Semestre</div>
            <div class="summary-value">
              <q-badge :color="comparacion.coincidencia_semestre ? 'positive' : 'warning'">
                {{ comparacion.coincidencia_semestre ? 'Sí' : 'No' }}
              </q-badge>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading -->
    <q-inner-loading :showing="loading">
      <q-spinner size="50px" color="primary" />
    </q-inner-loading>

    <!-- ══════════════════════════════════════════
         DIÁLOGO: VERIFICAR CARPETA
         ══════════════════════════════════════════ -->
    <q-dialog v-model="dialogCarpeta" maximized>
      <q-card>
        <q-bar class="bg-primary text-white">
          <q-icon name="folder_open" />
          <div class="q-ml-sm text-weight-bold">Verificar Carpeta — {{ codigo }}</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>

        <q-card-section v-if="loadingCarpeta" class="text-center q-pa-xl">
          <q-spinner size="48px" color="primary" />
          <div class="q-mt-md text-grey-7">Buscando carpeta localmente...</div>
        </q-card-section>

        <q-card-section
          v-else-if="!loadingCarpeta && carpetasEncontradas.length === 0"
          class="text-center q-pa-xl"
        >
          <q-icon name="folder_off" size="4rem" color="grey-4" />
          <div class="text-h6 text-grey-7 q-mt-md">No se encontró ninguna carpeta</div>
          <div class="text-body2 text-grey-5">
            No existe ninguna asignatura con código <strong>{{ codigo }}</strong> y plan de estudios
            <strong>N</strong> en la base de datos local.
          </div>
        </q-card-section>

        <q-card-section v-else class="q-pa-md">
          <div class="text-subtitle1 text-grey-8 q-mb-md">
            Se encontraron <strong>{{ carpetasEncontradas.length }}</strong> carpeta(s) con el
            código <q-chip dense color="primary" text-color="white" size="sm">{{ codigo }}</q-chip
            >. Selecciona la carpeta correcta:
          </div>

          <div class="row q-col-gutter-md">
            <div v-for="carpeta in carpetasEncontradas" :key="carpeta.id" class="col-12 col-md-6">
              <q-card
                bordered
                flat
                :class="[
                  'cursor-pointer carpeta-card q-pa-sm',
                  carpetaSeleccionada && carpetaSeleccionada.id === carpeta.id
                    ? 'carpeta-seleccionada'
                    : '',
                ]"
                @click="seleccionarCarpeta(carpeta)"
              >
                <!-- Encabezado carpeta -->
                <div class="row items-center q-mb-xs">
                  <q-icon
                    name="folder"
                    size="20px"
                    :color="
                      carpetaSeleccionada && carpetaSeleccionada.id === carpeta.id
                        ? 'primary'
                        : 'grey-6'
                    "
                    class="q-mr-sm"
                  />
                  <div class="text-weight-bold text-body1">{{ carpeta.nombre }}</div>
                  <q-space />
                  <q-chip
                    dense
                    outline
                    :color="
                      carpetaSeleccionada && carpetaSeleccionada.id === carpeta.id
                        ? 'primary'
                        : 'grey'
                    "
                    size="sm"
                  >
                    ID: {{ carpeta.id }}
                  </q-chip>
                  <q-badge
                    v-if="carpeta.eliminada"
                    color="negative"
                    label="Eliminada (soft delete)"
                    class="q-ml-sm"
                  >
                    <q-tooltip
                      >Esta asignatura fue eliminada lógicamente pero sigue en la BD</q-tooltip
                    >
                  </q-badge>
                  <q-icon
                    v-if="carpetaSeleccionada && carpetaSeleccionada.id === carpeta.id"
                    name="check_circle"
                    color="positive"
                    size="20px"
                    class="q-ml-sm"
                  />
                </div>

                <!-- Carreras -->
                <div class="q-mb-xs">
                  <span class="text-caption text-grey-6">Carreras: </span>
                  <q-chip
                    v-for="c in carpeta.carreras"
                    :key="c.id"
                    dense
                    size="xs"
                    color="indigo-1"
                    text-color="indigo-9"
                  >
                    {{ c.nombre }}
                    <span v-if="c.semestre" class="q-ml-xs text-caption"
                      >(Sem. {{ c.semestre }})</span
                    >
                  </q-chip>
                </div>

                <!-- Stats rápidos -->
                <div class="row q-gutter-sm q-mb-sm">
                  <div class="stat-mini">
                    <q-icon name="view_module" size="14px" color="blue-6" />
                    <span>{{ carpeta.unidades_count }} unidad(es)</span>
                  </div>
                  <div class="stat-mini">
                    <q-icon name="topic" size="14px" color="teal-6" />
                    <span>{{ carpeta.temas_count }} tema(s)</span>
                  </div>
                  <div class="stat-mini">
                    <q-icon name="event" size="14px" color="orange-6" />
                    <span>{{ carpeta.cronogramas_count }} cronograma(s)</span>
                  </div>
                  <div class="stat-mini">
                    <q-icon name="person" size="14px" color="green-6" />
                    <span>{{ carpeta.docentes_count }} docente(s)</span>
                  </div>
                </div>

                <!-- Unidades expandibles -->
                <q-expansion-item
                  dense
                  dense-toggle
                  icon="list"
                  label="Ver unidades y temas"
                  header-class="text-caption text-primary q-pa-none"
                  style="font-size: 0.8rem"
                >
                  <div class="q-pl-md q-mt-xs">
                    <div v-for="unidad in carpeta.unidades" :key="unidad.id" class="q-mb-xs">
                      <div class="text-caption text-weight-medium text-grey-8">
                        <q-icon name="chevron_right" size="12px" />
                        {{ unidad.titulo || 'Unidad sin título' }}
                        <q-badge
                          color="blue-2"
                          text-color="blue-9"
                          :label="unidad.temas_count + ' tema(s)'"
                          class="q-ml-xs"
                        />
                      </div>
                      <div class="q-pl-md">
                        <div
                          v-for="tema in unidad.temas"
                          :key="tema.id"
                          class="text-caption text-grey-6"
                        >
                          • {{ tema.titulo }}
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="!carpeta.unidades.length"
                      class="text-caption text-grey-5 text-italic"
                    >
                      Sin unidades registradas
                    </div>
                  </div>
                </q-expansion-item>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <div v-if="carpetaSeleccionada" class="text-caption text-positive q-mr-md">
            <q-icon name="check_circle" /> Carpeta seleccionada:
            <strong>{{ carpetaSeleccionada.nombre }}</strong> (ID: {{ carpetaSeleccionada.id }})
          </div>
          <q-btn flat label="Cerrar" color="grey" v-close-popup />
          <q-btn
            v-if="carpetaSeleccionada"
            unelevated
            color="primary"
            icon="check"
            label="Confirmar selección"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════
         DIÁLOGO: ENCONTRAR DOCENTES
         ══════════════════════════════════════════ -->
    <q-dialog v-model="dialogDocentes" maximized>
      <q-card>
        <q-bar class="bg-teal text-white">
          <q-icon name="manage_search" />
          <div class="q-ml-sm text-weight-bold">Docentes en Planning — {{ codigo }}</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>

        <q-card-section v-if="loadingDocentes" class="text-center q-pa-xl">
          <q-spinner size="48px" color="teal" />
          <div class="q-mt-md text-grey-7">Consultando API de Planning...</div>
        </q-card-section>

        <q-card-section
          v-else-if="!loadingDocentes && docentesPlanningRaw.length === 0"
          class="text-center q-pa-xl"
        >
          <q-icon name="person_off" size="4rem" color="grey-4" />
          <div class="text-h6 text-grey-7 q-mt-md">Sin docentes en Planning</div>
          <div class="text-body2 text-grey-5">
            No se encontraron docentes/grupos para <strong>{{ codigo }}</strong> en la API de
            Planning.
          </div>
        </q-card-section>

        <template v-else>
          <q-card-section class="q-pb-none">
            <div class="row items-center q-mb-sm">
              <div class="text-subtitle1 text-grey-8">
                <strong>{{ docentesPlanningRaw.length }}</strong> docente(s)/grupo(s) encontrados en
                Planning. Selecciona los que deseas registrar localmente:
              </div>
              <q-space />
              <q-btn
                flat
                dense
                no-caps
                size="sm"
                label="Seleccionar todos"
                color="teal"
                @click="seleccionarTodos"
              />
              <q-btn
                flat
                dense
                no-caps
                size="sm"
                label="Quitar selección"
                color="grey"
                @click="deseleccionarTodos"
                class="q-ml-xs"
              />
            </div>
            <div v-if="carpetaSeleccionada" class="text-caption text-positive q-mb-sm">
              <q-icon name="folder" /> Carpeta destino:
              <strong>{{ carpetaSeleccionada.nombre }}</strong> (ID: {{ carpetaSeleccionada.id }})
            </div>
            <div class="text-caption q-mb-sm">
              <div v-if="!carpetaSeleccionada" class="text-warning q-mb-xs">
                <q-icon name="warning" /> No hay carpeta seleccionada. Puedes:
                <ul class="q-pl-md q-my-xs">
                  <li>Ir a "Verificar Carpeta" para seleccionar una asignatura</li>
                  <li>Ingresar manualmente un ID de asignatura destino</li>
                </ul>
              </div>
              <div class="row items-center q-gutter-sm">
                <div class="text-caption text-grey-7">ID de asignatura destino:</div>
                <q-input
                  v-model.number="asignaturaIdManual"
                  type="number"
                  dense
                  outlined
                  placeholder="Ej: 2476"
                  class="col-4"
                  style="min-width: 120px"
                  :rules="[(val) => val > 0 || 'ID debe ser mayor a 0']"
                />
                <div class="text-caption text-grey-6">
                  (Usar este ID si no hay carpeta seleccionada)
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-xs">
            <div class="row q-col-gutter-sm">
              <div
                v-for="item in docentesPlanningRaw"
                :key="item.docente_nombre + item.grupo_nombre"
                class="col-12 col-md-6 col-lg-4"
              >
                <q-card
                  bordered
                  flat
                  :class="[
                    'docente-planning-card',
                    estaSeleccionado(item) ? 'docente-seleccionado' : '',
                  ]"
                  @click="toggleDocenteGrupo(item)"
                >
                  <q-card-section class="q-pa-sm">
                    <!-- Checkbox + nombre -->
                    <div class="row items-start no-wrap q-mb-xs">
                      <q-checkbox
                        :model-value="estaSeleccionado(item)"
                        color="teal"
                        @click.stop="toggleDocenteGrupo(item)"
                        class="q-mr-xs"
                        dense
                      />
                      <div class="col">
                        <div class="text-weight-bold text-body2">{{ item.docente_nombre }}</div>
                        <div class="row items-center q-mt-xs q-gutter-xs">
                          <q-badge
                            color="teal"
                            text-color="white"
                            :label="'Grupo ' + item.grupo_nombre"
                          />
                          <q-badge
                            v-if="item.docente_ci"
                            color="grey-3"
                            text-color="grey-8"
                            :label="'CI: ' + item.docente_ci"
                          />
                          <q-badge
                            :color="item.existe_local ? 'positive' : 'warning'"
                            :label="item.existe_local ? 'Ya existe local' : 'Nuevo'"
                          />
                        </div>
                        <div v-if="item.existe_local" class="text-caption text-grey-6 q-mt-xs">
                          Local: {{ item.docente_local_nombre }}
                        </div>
                      </div>
                    </div>

                    <!-- Horarios -->
                    <div v-if="item.horarios && item.horarios.length" class="q-mt-xs">
                      <div class="text-caption text-grey-6 q-mb-xs">
                        <q-icon name="schedule" size="12px" />
                        {{ item.horarios.length }} horario(s):
                      </div>
                      <div v-for="(h, hi) in item.horarios" :key="hi" class="horario-row">
                        <q-icon name="calendar_today" size="11px" color="teal-6" />
                        <span class="text-caption">
                          {{ h.dia }} {{ h.hora_inicio }}–{{ h.hora_fin }}
                        </span>
                        <q-chip dense size="xs" color="grey-2" text-color="grey-8" class="q-ml-xs">
                          {{ h.tipo_clase }}
                        </q-chip>
                        <span v-if="h.aula" class="text-caption text-grey-5 q-ml-xs"
                          >| {{ h.aula }}</span
                        >
                      </div>
                    </div>
                    <div v-else class="text-caption text-grey-5 text-italic">Sin horarios</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <div class="text-caption text-grey-7 q-mr-md">
              {{ docentesSeleccionados.length }} de {{ docentesPlanningRaw.length }} seleccionados
            </div>
            <q-btn flat label="Cancelar" color="grey" v-close-popup />
            <q-btn
              unelevated
              color="teal"
              icon="download"
              label="Registrar seleccionados"
              :disable="
                docentesSeleccionados.length === 0 || !(carpetaSeleccionada || asignaturaIdManual)
              "
              :loading="registrando"
              @click="registrarDocentesSeleccionados"
            >
              <q-tooltip v-if="!(carpetaSeleccionada || asignaturaIdManual)"
                >Selecciona una carpeta con "Verificar Carpeta" o ingresa un ID manual</q-tooltip
              >
            </q-btn>
          </q-card-actions>
        </template>
      </q-card>
    </q-dialog>

    <!-- Dialogo para asignar grupo -->
    <q-dialog v-model="dialogAsignar">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Asignar grupo a docente</div>
          <div class="text-caption text-grey-7 q-mb-md">
            Asignar un grupo disponible al docente
            {{ docenteParaAsignar ? docenteParaAsignar.docente : '' }}
          </div>
          <q-select
            v-model="grupoParaAsignar"
            :options="gruposDisponibles"
            option-label="nombre"
            label="Seleccionar grupo"
            map-options
            dense
            outlined
            :loading="asignandoGrupo"
          />
          <div v-if="gruposDisponibles.length === 0" class="text-caption text-grey-7 q-mt-xs">
            No hay grupos disponibles para asignar.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            label="Asignar"
            color="primary"
            @click="asignarGrupo"
            :loading="asignandoGrupo"
            :disable="!grupoParaAsignar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

// Parámetros de la URL
const codigo = ref(route.query.codigo || '')
const sedeId = ref(route.query.sede || null)
const carreraId = ref(route.query.carrera || null)
const gestion = ref(route.query.gestion || '1-2026')

// Datos
const loading = ref(false)
const apiData = ref(null)
const localData = ref(null)
const comparacion = ref({
  existe_en_api: false,
  existe_en_local: false,
  coincidencia_nombre: false,
  coincidencia_semestre: false,
})

// Gestión de grupos
const asignandoGrupo = ref(false)
const quitandoGrupo = ref(false)
const quitandoGrupoId = ref(null)
const registrando = ref(false)
const dialogAsignar = ref(false)
const docenteParaAsignar = ref(null)
const grupoParaAsignar = ref(null)

const sedeNombre = ref('')
const carreraNombre = ref('')

// Datos combinados para mostrar información básica
const asignaturaData = computed(() => apiData.value || localData.value)

// Grupos disponibles (sin docente asignado)
const gruposDisponibles = computed(() => {
  if (!localData.value || !localData.value.grupos) return []
  return localData.value.grupos.filter((g) => !g.docente)
})

// Función para parsear docente con grupos (formato API)
function parseDocenteConGrupos(docenteStr) {
  // Formato: "Docente (Grupo1, Grupo2)" o "Docente"
  const match = docenteStr.match(/^(.+?)\s*\((.+)\)$/)
  if (match) {
    const docente = match[1].trim()
    const grupos = match[2]
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean)
    return { docente, grupos }
  }
  return { docente: docenteStr, grupos: [] }
}

// Cargar datos de comparación
async function cargarComparacion() {
  if (!codigo.value || !sedeId.value || !carreraId.value) {
    $q.notify({
      type: 'negative',
      message: 'Faltan parámetros para la comparación',
      position: 'top-right',
    })
    router.go(-1)
    return
  }

  loading.value = true
  try {
    const response = await api.get('/grupos-externo/comparar-asignatura', {
      params: {
        gestion: gestion.value,
        carrera: carreraId.value,
        sede: sedeId.value,
        codigo: codigo.value,
      },
    })

    if (response.data.success) {
      apiData.value = response.data.data.api
      localData.value = response.data.data.local
      comparacion.value = response.data.data.comparacion

      // Cargar nombres de sede y carrera
      await cargarNombresSedeCarrera()
    }
  } catch (error) {
    console.error('Error cargando comparación:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos de comparación',
      position: 'top-right',
    })
  } finally {
    loading.value = false
  }
}

async function cargarNombresSedeCarrera() {
  try {
    // /sedes devuelve { data: [...], stats: {...} }
    const sedesResponse = await api.get('/sedes')
    const sedesArray = Array.isArray(sedesResponse.data)
      ? sedesResponse.data
      : sedesResponse.data?.data || []
    const sede = sedesArray.find(
      (s) => s.id_api === parseInt(sedeId.value) || s.id === parseInt(sedeId.value),
    )
    sedeNombre.value = sede?.nombre || `Sede ${sedeId.value}`

    // /carreras devuelve array directo
    const carrerasResponse = await api.get('/carreras')
    const carrerasArray = Array.isArray(carrerasResponse.data)
      ? carrerasResponse.data
      : carrerasResponse.data?.data || []
    const carrera = carrerasArray.find(
      (c) =>
        c.id === parseInt(carreraId.value) ||
        c.codigo?.toLowerCase() === carreraId.value?.toLowerCase(),
    )
    carreraNombre.value = carrera?.nombre || `Carrera ${carreraId.value}`
  } catch (error) {
    console.error('Error cargando nombres:', error)
    sedeNombre.value = `Sede ${sedeId.value}`
    carreraNombre.value = `Carrera ${carreraId.value}`
  }
}

async function quitarGrupo(docente, grupo) {
  if (
    !confirm(`¿Está seguro de quitar el grupo "${grupo.nombre}" del docente ${docente.docente}?`)
  ) {
    return
  }
  quitandoGrupo.value = true
  quitandoGrupoId.value = grupo.id
  try {
    const response = await api.post('/grupos-externo/quitar-grupo-docente', {
      grupo_id: grupo.id,
    })
    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: response.data.message,
        position: 'top-right',
      })
      await cargarComparacion()
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.message || 'Error al quitar grupo',
        position: 'top-right',
      })
    }
  } catch (error) {
    console.error('Error quitando grupo:', error)
    $q.notify({
      type: 'negative',
      message: 'Error de conexión al quitar grupo',
      position: 'top-right',
    })
  } finally {
    quitandoGrupo.value = false
    quitandoGrupoId.value = null
  }
}

// ────────────────────────────────────────────────
// BOTÓN 1: VERIFICAR CARPETA
// ────────────────────────────────────────────────
const dialogCarpeta = ref(false)
const loadingCarpeta = ref(false)
const carpetasEncontradas = ref([])
const carpetaSeleccionada = ref(null)

async function verificarCarpeta() {
  loadingCarpeta.value = true
  carpetasEncontradas.value = []
  carpetaSeleccionada.value = null
  dialogCarpeta.value = true
  try {
    const response = await api.get('/grupos-externo/buscar-carpeta', {
      params: { codigo: codigo.value },
    })
    if (response.data.success) {
      carpetasEncontradas.value = response.data.data || []
    }
  } catch (error) {
    console.error('Error verificando carpeta:', error)
    $q.notify({ type: 'negative', message: 'Error al buscar carpeta', position: 'top-right' })
  } finally {
    loadingCarpeta.value = false
  }
}

function seleccionarCarpeta(carpeta) {
  carpetaSeleccionada.value = carpeta
  asignaturaIdManual.value = null
}

// ────────────────────────────────────────────────
// BOTÓN 2: ENCONTRAR DOCENTES
// ────────────────────────────────────────────────
const dialogDocentes = ref(false)
const loadingDocentes = ref(false)
const docentesPlanningRaw = ref([])
const docentesSeleccionados = ref([])
const sedeIdInterno = ref(null)
const carreraIdInterno = ref(null)
const asignaturaIdManual = ref(null)

async function encontrarDocentes() {
  loadingDocentes.value = true
  docentesPlanningRaw.value = []
  docentesSeleccionados.value = []
  sedeIdInterno.value = null
  carreraIdInterno.value = null
  asignaturaIdManual.value = null
  dialogDocentes.value = true
  try {
    const response = await api.get('/grupos-externo/detalle-con-horarios', {
      params: {
        gestion: gestion.value,
        carrera: carreraId.value,
        sede: sedeId.value,
        codigo: codigo.value,
      },
    })
    if (response.data.success && response.data.encontrado) {
      docentesPlanningRaw.value = response.data.data || []
      sedeIdInterno.value = response.data.sede_id ? parseInt(response.data.sede_id) : null
      carreraIdInterno.value = response.data.carrera_id ? parseInt(response.data.carrera_id) : null
    } else {
      $q.notify({
        type: 'warning',
        message: response.data.message || 'No se encontraron docentes en Planning',
        position: 'top-right',
      })
    }
  } catch (error) {
    console.error('Error buscando docentes en Planning:', error)
    $q.notify({ type: 'negative', message: 'Error al consultar Planning', position: 'top-right' })
  } finally {
    loadingDocentes.value = false
  }
}

function toggleDocenteGrupo(item) {
  const key = item.docente_nombre + '|||' + item.grupo_nombre
  const idx = docentesSeleccionados.value.indexOf(key)
  if (idx === -1) {
    docentesSeleccionados.value.push(key)
  } else {
    docentesSeleccionados.value.splice(idx, 1)
  }
}

function estaSeleccionado(item) {
  return docentesSeleccionados.value.includes(item.docente_nombre + '|||' + item.grupo_nombre)
}

function seleccionarTodos() {
  docentesSeleccionados.value = docentesPlanningRaw.value.map(
    (d) => d.docente_nombre + '|||' + d.grupo_nombre,
  )
}

function deseleccionarTodos() {
  docentesSeleccionados.value = []
}

function getDocentesParaMigrar() {
  return docentesPlanningRaw.value.filter((d) =>
    docentesSeleccionados.value.includes(d.docente_nombre + '|||' + d.grupo_nombre),
  )
}

function abrirDialogoAsignar(docente) {
  docenteParaAsignar.value = docente
  grupoParaAsignar.value = null
  dialogAsignar.value = true
}

async function asignarGrupo() {
  if (!docenteParaAsignar.value || !grupoParaAsignar.value) {
    $q.notify({
      type: 'warning',
      message: 'Seleccione un grupo para asignar',
      position: 'top-right',
    })
    return
  }
  asignandoGrupo.value = true
  try {
    const response = await api.post('/grupos-externo/asignar-grupo-docente', {
      grupo_id: grupoParaAsignar.value.id,
      docente_id: docenteParaAsignar.value.docente_id,
    })
    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: response.data.message,
        position: 'top-right',
      })
      dialogAsignar.value = false
      await cargarComparacion()
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.message || 'Error al asignar grupo',
        position: 'top-right',
      })
    }
  } catch (error) {
    console.error('Error asignando grupo:', error)
    $q.notify({
      type: 'negative',
      message: 'Error de conexión al asignar grupo',
      position: 'top-right',
    })
  } finally {
    asignandoGrupo.value = false
  }
}

async function registrarDocentesSeleccionados() {
  const asignaturaId = carpetaSeleccionada.value?.id || asignaturaIdManual.value
  if (!asignaturaId || asignaturaId <= 0) {
    $q.notify({
      type: 'warning',
      message: carpetaSeleccionada.value
        ? 'ID de asignatura inválido'
        : 'Selecciona una carpeta con "Verificar Carpeta" o ingresa un ID manual válido',
      position: 'top-right',
    })
    return
  }
  if (docentesSeleccionados.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona al menos un docente/grupo para registrar',
      position: 'top-right',
    })
    return
  }

  if (!sedeIdInterno.value || !carreraIdInterno.value) {
    $q.notify({
      type: 'warning',
      message: 'No se encontraron IDs internos de sede/carrera. Vuelve a buscar docentes.',
      position: 'top-right',
    })
    return
  }

  registrando.value = true
  const items = getDocentesParaMigrar().map((item) => ({
    docente_nombre: item.docente_nombre,
    docente_ci: item.docente_ci,
    grupo_nombre: item.grupo_nombre,
    horarios: item.horarios.map((h) => ({
      id_horario_api: h.id_horario_api,
      tipo_clase: h.tipo_clase,
      dia: h.dia,
      hora_inicio: h.hora_inicio,
      hora_fin: h.hora_fin,
      aula: h.aula,
      bloque: h.bloque,
    })),
  }))

  try {
    const response = await api.post('/grupos-externo/importar-desde-planning', {
      asignatura_id: asignaturaId,
      sede_id: sedeIdInterno.value,
      carrera_id: carreraIdInterno.value,
      gestion: gestion.value,
      items,
    })
    if (response.data.success) {
      const res = response.data.data
      const summary = []
      if (res.docentes_creados > 0) summary.push(`${res.docentes_creados} docente(s) nuevos`)
      if (res.docentes_existentes > 0)
        summary.push(`${res.docentes_existentes} docente(s) existentes`)
      if (res.grupos_creados > 0) summary.push(`${res.grupos_creados} grupo(s) creados`)
      if (res.grupos_actualizados > 0)
        summary.push(`${res.grupos_actualizados} grupo(s) actualizados`)
      if (res.horarios_creados > 0) summary.push(`${res.horarios_creados} horario(s) creados`)
      const detail = summary.length ? ` (${summary.join(', ')})` : ''
      $q.notify({
        type: 'positive',
        message: response.data.message + detail,
        position: 'top-right',
      })
      // Cerrar diálogo y recargar comparación
      dialogDocentes.value = false
      await cargarComparacion()
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.message || 'Error al registrar',
        position: 'top-right',
      })
    }
  } catch (error) {
    console.error('Error registrando docentes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error de conexión al registrar docentes',
      position: 'top-right',
    })
  } finally {
    registrando.value = false
  }
}

onMounted(() => {
  cargarComparacion()
})
</script>

<style scoped>
.comparacion-asignatura-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-info .page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.text-gradient {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  margin: 4px 0 0;
  color: #6c757d;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.info-card {
  border-radius: 8px;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

@media (max-width: 992px) {
  .comparison-grid {
    grid-template-columns: 1fr;
  }
}

.comparison-column {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.column-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.column-header-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.section {
  margin-bottom: 16px;
}

.section-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
}

.docente-item {
  border-left: 3px solid #1976d2;
  padding-left: 12px;
}

.docente-nombre {
  font-weight: 500;
  margin-bottom: 4px;
}

.grupos-section {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-label {
  font-weight: 500;
  color: #6c757d;
}

.info-value {
  font-weight: 600;
}

.comparison-summary {
  border-radius: 8px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.summary-label {
  font-weight: 500;
}

.summary-value {
  font-weight: 600;
}

/* ── Diálogo Verificar Carpeta ── */
.carpeta-card {
  border: 2px solid transparent;
  border-radius: 8px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.carpeta-card:hover {
  border-color: #1976d2;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}
.carpeta-seleccionada {
  border-color: #1976d2 !important;
  background: #e3f2fd;
  box-shadow: 0 2px 12px rgba(25, 118, 210, 0.25);
}

.stat-mini {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  color: #555;
  background: #f5f5f5;
  border-radius: 4px;
  padding: 2px 6px;
}

/* ── Diálogo Encontrar Docentes ── */
.docente-planning-card {
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.docente-planning-card:hover {
  border-color: #00897b;
  background: #f1faf9;
}
.docente-seleccionado {
  border-color: #00897b !important;
  background: #e0f2f1;
}

.horario-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  margin-bottom: 2px;
}
</style>
