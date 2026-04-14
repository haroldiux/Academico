<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-primary text-weight-bold">
        Restauracion de Programas Analiticos (API)
      </div>
      <q-space />
    </div>

    <q-card class="bg-white q-mb-lg rounded-borders shadow-2">
      <q-card-section>
        <div class="text-h6 q-mb-sm text-grey-8">1. Origen de datos</div>

        <div class="row q-col-gutter-md items-start">
          <div class="col-12 col-md-4">
            <q-select
              v-model="carreraSeleccionada"
              :options="carrerasOpciones"
              option-value="id"
              option-label="nombre"
              label="Seleccionar carrera"
              outlined
              dense
              emit-value
              map-options
            >
              <template #prepend>
                <q-icon name="school" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-4">
            <q-input v-model="apiUrl" label="URL base API externa" outlined dense>
              <template #prepend>
                <q-icon name="language" />
              </template>
              <template #hint>Ej: http://localhost:8500</template>
            </q-input>
          </div>

          <div class="col-12 col-md-4">
            <q-input v-model="apiToken" label="Token de autenticacion" outlined dense>
              <template #prepend>
                <q-icon name="key" />
              </template>
            </q-input>
          </div>
        </div>

        <div class="row q-col-gutter-md q-mt-sm">
          <div class="col-12 col-md-4">
            <q-banner dense rounded class="bg-blue-1 text-blue-9">
              Sede destino: {{ sedeSeleccionadaId || 'No detectada' }}
            </q-banner>
          </div>
          <div class="col-12 col-md-4">
            <q-banner dense rounded class="bg-grey-2 text-grey-9">
              Plan destino: {{ planEstudiosSeleccionado || 'N' }}
            </q-banner>
          </div>
          <div class="col-12 col-md-4">
            <q-banner dense rounded class="bg-teal-1 text-teal-9">
              {{ carrerasOpciones.length }} carrera(s) habilitada(s)
            </q-banner>
          </div>
        </div>

        <div class="row justify-end q-mt-md">
          <q-btn
            color="primary"
            icon="cloud_download"
            label="Extraer asignaturas"
            :loading="loadingFetch"
            :disable="!carreraSeleccionada || !apiUrl || !apiToken"
            unelevated
            @click="fetchDesdeApi"
          />
        </div>
      </q-card-section>
    </q-card>

    <q-card v-if="asignaturas.length > 0" class="shadow-2 rounded-borders">
      <q-card-section class="bg-grey-1">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md">
            <div class="text-subtitle1 text-weight-bold text-primary">
              2. Asignaturas obtenidas ({{ filteredAsignaturas.length }} de
              {{ asignaturas.length }})
            </div>
          </div>
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchTerm"
              outlined
              dense
              clearable
              debounce="200"
              label="Buscar por sigla o asignatura"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <q-table
        v-model:pagination="tablePagination"
        :rows="filteredAsignaturas"
        :columns="columns"
        row-key="restore_key"
        flat
        bordered
        class="bg-white"
      >
        <template #body-cell-plan_estudios="props">
          <q-td :props="props" class="text-center">
            <q-chip color="orange-1" text-color="orange-9" size="sm">
              {{ props.row.plan_estudios || 'N' }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-estado_local="props">
          <q-td :props="props" class="text-center">
            <q-chip
              :color="getLocalStatusColor(props.row.local_status)"
              :text-color="getLocalStatusTextColor(props.row.local_status)"
              size="sm"
            >
              {{ props.row.local_status.label }}
            </q-chip>
            <q-tooltip class="bg-grey-9 text-body2">
              {{ props.row.local_status.resumen }}
            </q-tooltip>
          </q-td>
        </template>

        <template #body-cell-unidades_count="props">
          <q-td :props="props" class="text-center">
            <q-chip color="blue-1" text-color="blue-8" size="sm" class="text-weight-bold">
              {{ props.row.stats.unidades }} unidades
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-docentes_count="props">
          <q-td :props="props" class="text-center">
            <q-chip v-if="props.row.stats.docentes" color="teal-1" text-color="teal-8" size="sm">
              {{ props.row.stats.docentes }} docentes
            </q-chip>
            <span v-else class="text-grey text-caption">Sin docentes</span>
          </q-td>
        </template>

        <template #body-cell-planificaciones_count="props">
          <q-td :props="props" class="text-center">
            <q-chip color="purple-1" text-color="deep-purple-8" size="sm">
              {{ props.row.stats.planificaciones }} planificaciones
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-acciones="props">
          <q-td :props="props" class="text-center">
            <q-btn
              flat
              round
              color="secondary"
              icon="visibility"
              size="sm"
              @click="verDetalles(props.row)"
            >
              <q-tooltip>Ver detalles</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="accent"
              icon="download"
              size="sm"
              @click="downloadAsignaturaJson(props.row)"
            >
              <q-tooltip>Descargar JSON</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="deep-orange"
              icon="upload_file"
              size="sm"
              @click="abrirImportacionJson(props.row)"
            >
              <q-tooltip>Restaurar desde JSON</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="negative"
              icon="system_update_alt"
              size="sm"
              @click="confirmarRestauracion(props.row)"
            >
              <q-tooltip>Restaurar localmente</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="modalDetalles">
      <q-card style="width: 900px; max-width: 92vw">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">
            {{ asignaturaVisualizada?.nombre }} ({{ asignaturaVisualizada?.codigo }})
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="scroll" style="max-height: 70vh">
          <div v-if="asignaturaVisualizada">
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-auto">
                <q-chip color="orange-1" text-color="orange-9">
                  Plan {{ asignaturaVisualizada.plan_estudios || 'N' }}
                </q-chip>
              </div>
              <div class="col-auto">
                <q-chip color="blue-1" text-color="blue-9">
                  {{ asignaturaVisualizada.stats.unidades }} unidades
                </q-chip>
              </div>
              <div class="col-auto">
                <q-chip color="teal-1" text-color="teal-9">
                  {{ asignaturaVisualizada.stats.temas }} temas
                </q-chip>
              </div>
              <div class="col-auto">
                <q-chip color="purple-1" text-color="deep-purple-8">
                  {{ asignaturaVisualizada.stats.planificaciones }} planificaciones
                </q-chip>
              </div>
              <div class="col-auto">
                <q-chip color="red-1" text-color="red-8">
                  {{ asignaturaVisualizada.stats.docentes }} docentes
                </q-chip>
              </div>
              <div class="col-auto">
                <q-chip
                  :color="getLocalStatusColor(asignaturaVisualizada.local_status)"
                  :text-color="getLocalStatusTextColor(asignaturaVisualizada.local_status)"
                >
                  {{ asignaturaVisualizada.local_status.label }}
                </q-chip>
              </div>
            </div>

            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-4">
                <q-card flat bordered class="detail-card full-height">
                  <q-card-section>
                    <div class="text-subtitle2 text-primary q-mb-sm">Destino de restauracion</div>
                    <div class="detail-label">Codigo</div>
                    <div class="detail-value">
                      {{ asignaturaVisualizada.codigo || 'No disponible' }}
                    </div>
                    <div class="detail-label q-mt-sm">Carrera</div>
                    <div class="detail-value">
                      {{
                        asignaturaVisualizada.carrera?.nombre ||
                        `ID ${asignaturaVisualizada.carrera_id}`
                      }}
                    </div>
                    <div class="detail-label q-mt-sm">Sede</div>
                    <div class="detail-value">
                      {{
                        asignaturaVisualizada.carrera?.sede ||
                        `ID ${asignaturaVisualizada.sede_id || 'N/D'}`
                      }}
                    </div>
                    <div class="detail-label q-mt-sm">Semestre</div>
                    <div class="detail-value">
                      {{ asignaturaVisualizada.semestre || 'No especificado' }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-4">
                <q-card flat bordered class="detail-card full-height">
                  <q-card-section>
                    <div class="text-subtitle2 text-primary q-mb-sm">Impacto de reemplazo</div>
                    <div class="detail-label">Bibliografia general</div>
                    <div class="detail-value">{{ asignaturaVisualizada.bibliografias.length }}</div>
                    <div class="detail-label q-mt-sm">Unidades / Temas</div>
                    <div class="detail-value">
                      {{ asignaturaVisualizada.stats.unidades }} /
                      {{ asignaturaVisualizada.stats.temas }}
                    </div>
                    <div class="detail-label q-mt-sm">Docentes / Planificaciones</div>
                    <div class="detail-value">
                      {{ asignaturaVisualizada.stats.docentes }} /
                      {{ asignaturaVisualizada.stats.planificaciones }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-4">
                <q-card flat bordered class="detail-card full-height bg-red-1">
                  <q-card-section>
                    <div class="text-subtitle2 text-negative q-mb-sm">Advertencia</div>
                    <div class="text-body2">
                      Esta vista muestra lo que se volvera a crear en SIDOPA. Al confirmar, se
                      purgara la estructura local actual de la materia y se reconstruira con la
                      informacion del origen.
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-6">
                <q-card flat bordered class="detail-card full-height">
                  <q-card-section>
                    <div class="text-subtitle2 text-primary q-mb-sm">Resumen pedagogico</div>
                    <div v-if="hasDisplayContent(asignaturaVisualizada.justificacion)">
                      <div class="detail-label">Justificacion</div>
                      <div class="detail-pre">
                        {{ formatDetailText(asignaturaVisualizada.justificacion) }}
                      </div>
                    </div>
                    <div
                      v-if="hasDisplayContent(asignaturaVisualizada.descripcion)"
                      class="q-mt-md"
                    >
                      <div class="detail-label">Descripcion</div>
                      <div class="detail-pre">
                        {{ formatDetailText(asignaturaVisualizada.descripcion) }}
                      </div>
                    </div>
                    <div
                      v-if="hasDisplayContent(asignaturaVisualizada.proposito_general)"
                      class="q-mt-md"
                    >
                      <div class="detail-label">Proposito general</div>
                      <div class="detail-pre">
                        {{ formatDetailText(asignaturaVisualizada.proposito_general) }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-6">
                <q-card flat bordered class="detail-card full-height">
                  <q-card-section>
                    <div class="text-subtitle2 text-primary q-mb-sm">Configuracion academica</div>
                    <div v-if="hasDisplayContent(asignaturaVisualizada.competencia_asignatura)">
                      <div class="detail-label">Competencia de asignatura</div>
                      <div class="detail-pre">
                        {{ formatDetailText(asignaturaVisualizada.competencia_asignatura) }}
                      </div>
                    </div>
                    <div
                      v-if="hasDisplayContent(asignaturaVisualizada.metodologia_general)"
                      class="q-mt-md"
                    >
                      <div class="detail-label">Metodologia general</div>
                      <div class="detail-pre">
                        {{ formatDetailText(asignaturaVisualizada.metodologia_general) }}
                      </div>
                    </div>
                    <div
                      v-if="hasDisplayContent(asignaturaVisualizada.sistema_evaluacion)"
                      class="q-mt-md"
                    >
                      <div class="detail-label">Sistema de evaluacion</div>
                      <div class="detail-pre">
                        {{ formatDetailText(asignaturaVisualizada.sistema_evaluacion) }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-6">
                <q-card flat bordered class="detail-card full-height">
                  <q-card-section>
                    <div class="text-subtitle2 text-primary q-mb-sm">Docentes involucrados</div>
                    <q-list
                      v-if="asignaturaVisualizada.docentes.length"
                      dense
                      bordered
                      separator
                      class="rounded-borders"
                    >
                      <q-item
                        v-for="(docente, docenteIndex) in asignaturaVisualizada.docentes"
                        :key="`docente-${docenteIndex}`"
                      >
                        <q-item-section>
                          <q-item-label>{{
                            docente.nombre_completo || 'Docente sin nombre'
                          }}</q-item-label>
                          <q-item-label caption>
                            {{ docente.email || 'Sin email' }}
                            <span v-if="docente.ci"> | CI: {{ docente.ci }}</span>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                    <div v-else class="text-grey-7">No se reportan docentes en el origen.</div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-6">
                <q-card flat bordered class="detail-card full-height">
                  <q-card-section>
                    <div class="text-subtitle2 text-primary q-mb-sm">Bibliografia general</div>
                    <q-list
                      v-if="asignaturaVisualizada.bibliografias.length"
                      dense
                      bordered
                      separator
                      class="rounded-borders"
                    >
                      <q-item
                        v-for="(
                          bibliografia, bibliografiaIndex
                        ) in asignaturaVisualizada.bibliografias"
                        :key="`bibliografia-${bibliografiaIndex}`"
                      >
                        <q-item-section>
                          <q-item-label>{{ bibliografia.titulo || 'Sin titulo' }}</q-item-label>
                          <q-item-label caption>
                            {{ bibliografia.autor || 'Autor no especificado' }}
                            <span v-if="bibliografia.tipo"> | {{ bibliografia.tipo }}</span>
                            <span v-if="bibliografia.anio"> | {{ bibliografia.anio }}</span>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                    <div v-else class="text-grey-7">No se reporta bibliografia general.</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <div class="text-h6 q-mb-sm text-primary">
              Unidades y temas a restaurar ({{ asignaturaVisualizada.unidades.length }})
            </div>

            <q-expansion-item
              v-for="(unidad, unidadIndex) in asignaturaVisualizada.unidades"
              :key="`${asignaturaVisualizada.restore_key}-unidad-${unidadIndex}`"
              :label="`Unidad ${unidad.numero}: ${unidad.titulo || 'Sin titulo'}`"
              header-class="bg-grey-2"
              class="q-mb-sm shadow-1"
            >
              <q-card>
                <q-card-section>
                  <div class="row q-col-gutter-md q-mb-md">
                    <div class="col-12 col-md-8">
                      <div v-if="hasDisplayContent(unidad.objetivo)">
                        <div class="detail-label">Objetivo de unidad</div>
                        <div class="detail-pre">{{ formatDetailText(unidad.objetivo) }}</div>
                      </div>
                      <div v-if="hasDisplayContent(unidad.contenido_minimo)" class="q-mt-md">
                        <div class="detail-label">Contenido minimo</div>
                        <div class="detail-pre">
                          {{ formatDetailText(unidad.contenido_minimo) }}
                        </div>
                      </div>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-list bordered dense separator class="rounded-borders">
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>Temas</q-item-label>
                            <q-item-label>{{ unidad.temas.length }}</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>Elemento de competencia</q-item-label>
                            <q-item-label>{{
                              unidad.elemento_competencia || 'No especificado'
                            }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                  </div>

                  <q-expansion-item
                    v-for="(tema, temaIndex) in unidad.temas"
                    :key="`${asignaturaVisualizada.restore_key}-tema-${unidadIndex}-${temaIndex}`"
                    :label="`${temaIndex + 1}. ${tema.titulo || 'Tema sin titulo'}`"
                    header-class="bg-blue-1 text-blue-10"
                    class="q-mb-sm"
                    expand-separator
                  >
                    <q-card flat bordered>
                      <q-card-section>
                        <div class="row q-col-gutter-sm q-mb-md">
                          <div class="col-auto">
                            <q-chip size="sm" color="blue-1" text-color="blue-9">
                              {{ tema.logros_esperados.length }} logro(s)
                            </q-chip>
                          </div>
                          <div class="col-auto">
                            <q-chip size="sm" color="teal-1" text-color="teal-9">
                              {{ tema.bibliografias.length }} bibliografia(s)
                            </q-chip>
                          </div>
                          <div class="col-auto">
                            <q-chip size="sm" color="purple-1" text-color="deep-purple-8">
                              {{ tema.planificaciones_personales.length }} planificacion(es)
                            </q-chip>
                          </div>
                          <div class="col-auto">
                            <q-chip size="sm" color="amber-1" text-color="amber-9">
                              {{ hasThemeSequences(tema) ? 'Con secuencia' : 'Sin secuencia' }}
                            </q-chip>
                          </div>
                        </div>

                        <div v-if="hasDisplayContent(tema.resultado_aprendizaje)" class="q-mb-md">
                          <div class="detail-label">Resultado de aprendizaje</div>
                          <div class="detail-pre">
                            {{ formatDetailText(tema.resultado_aprendizaje) }}
                          </div>
                        </div>

                        <div v-if="hasDisplayContent(tema.contenido_items)" class="q-mb-md">
                          <div class="detail-label">Contenidos integrados</div>
                          <div class="detail-pre">
                            {{ formatDetailText(tema.contenido_items) }}
                          </div>
                        </div>

                        <div class="row q-col-gutter-md q-mb-md">
                          <div class="col-12 col-md-4">
                            <q-card flat bordered class="detail-card full-height">
                              <q-card-section>
                                <div class="text-subtitle2 text-primary q-mb-sm">Conceptual</div>
                                <div class="detail-pre">
                                  {{ formatDetailText(tema.contenido_conceptual) }}
                                </div>
                              </q-card-section>
                            </q-card>
                          </div>
                          <div class="col-12 col-md-4">
                            <q-card flat bordered class="detail-card full-height">
                              <q-card-section>
                                <div class="text-subtitle2 text-primary q-mb-sm">Procedimental</div>
                                <div class="detail-pre">
                                  {{ formatDetailText(tema.contenido_procedimental) }}
                                </div>
                              </q-card-section>
                            </q-card>
                          </div>
                          <div class="col-12 col-md-4">
                            <q-card flat bordered class="detail-card full-height">
                              <q-card-section>
                                <div class="text-subtitle2 text-primary q-mb-sm">Actitudinal</div>
                                <div class="detail-pre">
                                  {{ formatDetailText(tema.contenido_actitudinal) }}
                                </div>
                              </q-card-section>
                            </q-card>
                          </div>
                        </div>

                        <div class="row q-col-gutter-md q-mb-md">
                          <div class="col-12 col-md-6">
                            <q-card flat bordered class="detail-card full-height">
                              <q-card-section>
                                <div class="text-subtitle2 text-primary q-mb-sm">
                                  Estrategias base
                                </div>
                                <div class="detail-label">Metodologicas</div>
                                <div class="detail-pre">
                                  {{
                                    formatTemaFieldWithFallback(
                                      tema,
                                      'estrategias_metodologicas',
                                      'Metodologicas',
                                    )
                                  }}
                                </div>
                                <div class="detail-label q-mt-md">Aprendizaje</div>
                                <div class="detail-pre">
                                  {{
                                    formatTemaFieldWithFallback(
                                      tema,
                                      'estrategias_aprendizaje',
                                      'Aprendizaje',
                                    )
                                  }}
                                </div>
                                <div class="detail-label q-mt-md">Recursos</div>
                                <div class="detail-pre">
                                  {{
                                    formatTemaFieldWithFallback(
                                      tema,
                                      'estrategias_recursos',
                                      'Recursos',
                                    )
                                  }}
                                </div>
                              </q-card-section>
                            </q-card>
                          </div>
                          <div class="col-12 col-md-6">
                            <q-card flat bordered class="detail-card full-height">
                              <q-card-section>
                                <div class="text-subtitle2 text-primary q-mb-sm">
                                  Evaluacion base
                                </div>
                                <div class="detail-label">Formativa</div>
                                <div class="detail-pre">
                                  {{
                                    formatTemaFieldWithFallback(
                                      tema,
                                      'evaluacion_formativa',
                                      'Formativa',
                                    )
                                  }}
                                </div>
                                <div class="detail-label q-mt-md">Sumativa</div>
                                <div class="detail-pre">
                                  {{
                                    formatTemaFieldWithFallback(
                                      tema,
                                      'evaluacion_sumativa',
                                      'Sumativa',
                                    )
                                  }}
                                </div>
                              </q-card-section>
                            </q-card>
                          </div>
                        </div>

                        <div class="row q-col-gutter-md q-mb-md">
                          <div class="col-12 col-md-6">
                            <q-card flat bordered class="detail-card full-height">
                              <q-card-section>
                                <div class="text-subtitle2 text-primary q-mb-sm">
                                  Logros e indicadores
                                </div>
                                <q-list
                                  v-if="tema.logros_esperados.length"
                                  dense
                                  bordered
                                  separator
                                  class="rounded-borders"
                                >
                                  <q-item
                                    v-for="(logro, logroIndex) in tema.logros_esperados"
                                    :key="`logro-${logroIndex}`"
                                  >
                                    <q-item-section>
                                      <q-item-label>{{
                                        logro.descripcion || 'Logro sin descripcion'
                                      }}</q-item-label>
                                      <q-item-label caption>
                                        {{ logro.tipo_logro || 'Sin tipo' }}
                                        <span v-if="logro.periodo"> | {{ logro.periodo }}</span>
                                      </q-item-label>
                                      <q-item-label
                                        v-if="logro.indicadores?.length"
                                        caption
                                        class="q-mt-xs"
                                        style="white-space: pre-wrap"
                                      >
                                        {{
                                          logro.indicadores
                                            .map((item) => `• ${item.descripcion}`)
                                            .join('\n')
                                        }}
                                      </q-item-label>
                                    </q-item-section>
                                  </q-item>
                                </q-list>
                                <div v-else class="text-grey-7">Este tema no reporta logros.</div>
                              </q-card-section>
                            </q-card>
                          </div>
                          <div class="col-12 col-md-6">
                            <q-card flat bordered class="detail-card full-height">
                              <q-card-section>
                                <div class="text-subtitle2 text-primary q-mb-sm">
                                  Bibliografia y secuencias
                                </div>
                                <div class="detail-label">Bibliografia vinculada</div>
                                <div class="detail-pre">
                                  {{ formatThemeBibliography(tema.bibliografias) }}
                                </div>
                                <div class="detail-label q-mt-md">Secuencias</div>
                                <div class="detail-pre">
                                  {{ formatThemeSequences(tema) }}
                                </div>
                              </q-card-section>
                            </q-card>
                          </div>
                        </div>

                        <q-card flat bordered class="detail-card">
                          <q-card-section>
                            <div class="text-subtitle2 text-primary q-mb-sm">
                              Planificaciones personales por docente
                            </div>
                            <q-list
                              v-if="tema.planificaciones_personales.length"
                              dense
                              bordered
                              separator
                              class="rounded-borders"
                            >
                              <q-item
                                v-for="(
                                  planificacion, planificacionIndex
                                ) in tema.planificaciones_personales"
                                :key="`planificacion-${planificacionIndex}`"
                              >
                                <q-item-section>
                                  <q-item-label>
                                    {{
                                      planificacion.docente_nombre ||
                                      planificacion.docente_email ||
                                      `Docente ${planificacionIndex + 1}`
                                    }}
                                  </q-item-label>
                                  <q-item-label caption>
                                    {{ planificacion.docente_email || 'Sin email' }}
                                    <span v-if="planificacion.docente_ci">
                                      | CI: {{ planificacion.docente_ci }}
                                    </span>
                                  </q-item-label>
                                  <q-item-label
                                    caption
                                    class="q-mt-xs"
                                    style="white-space: pre-wrap"
                                  >
                                    {{ buildPlanificacionResumen(planificacion) }}
                                  </q-item-label>
                                </q-item-section>
                              </q-item>
                            </q-list>
                            <div v-else class="text-grey-7">
                              Este tema no incluye planificaciones personales en el origen.
                            </div>
                          </q-card-section>
                        </q-card>
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-1">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
          <q-btn
            flat
            color="accent"
            icon="download"
            label="Descargar JSON"
            @click="downloadAsignaturaJson(asignaturaVisualizada)"
          />
          <q-btn
            flat
            color="deep-orange"
            icon="upload_file"
            label="Restaurar desde JSON"
            @click="abrirImportacionJson(asignaturaVisualizada)"
          />
          <q-btn
            color="negative"
            icon="system_update_alt"
            label="Restaurar asignatura"
            @click="confirmarRestauracion(asignaturaVisualizada)"
            v-close-popup
          />
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
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore } from 'src/stores/auth'
import { useCarrerasStore } from 'src/stores/carreras'

const SOURCE_URL_STORAGE_KEY = 'sidopa.restauracion.apiUrl'
const SOURCE_TOKEN_STORAGE_KEY = 'sidopa.restauracion.apiToken'

const $q = useQuasar()
const authStore = useAuthStore()
const carrerasStore = useCarrerasStore()

const carreraSeleccionada = ref(null)
const apiUrl = ref('http://localhost:8500')
const apiToken = ref('unitepc-programas-2026')
const asignaturas = ref([])
const loadingFetch = ref(false)
const modalDetalles = ref(false)
const asignaturaVisualizada = ref(null)
const searchTerm = ref('')
const jsonFileInput = ref(null)
const jsonImportTarget = ref(null)
const tablePagination = ref({
  sortBy: 'codigo',
  descending: false,
  rowsPerPage: 15,
})

const columns = [
  { name: 'codigo', label: 'Sigla', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Asignatura', field: 'nombre', align: 'left', sortable: true },
  { name: 'plan_estudios', label: 'Plan', field: 'plan_estudios', align: 'center', sortable: true },
  { name: 'estado_local', label: 'Estado local', align: 'center' },
  { name: 'unidades_count', label: 'Estructura', align: 'center' },
  { name: 'docentes_count', label: 'Docentes', align: 'center' },
  { name: 'planificaciones_count', label: 'Planificaciones', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' },
]

const carrerasOpciones = computed(() => {
  const director = authStore.usuarioActual?.director

  if (director?.carreras?.length) {
    return director.carreras
  }

  if (director?.carrera) {
    return [director.carrera]
  }

  return carrerasStore.carreras
})

const carreraActual = computed(
  () =>
    carrerasOpciones.value.find(
      (carrera) => Number(carrera.id) === Number(carreraSeleccionada.value),
    ) || null,
)

const normalizeSearchText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const filteredAsignaturas = computed(() => {
  const query = normalizeSearchText(searchTerm.value)

  if (!query) {
    return asignaturas.value
  }

  return asignaturas.value.filter((asignatura) => {
    const codigo = normalizeSearchText(asignatura.codigo)
    const nombre = normalizeSearchText(asignatura.nombre)

    return codigo.includes(query) || nombre.includes(query)
  })
})

const sedeSeleccionadaId = computed(() => {
  const carrera = carreraActual.value

  if (Array.isArray(carrera?.sedes_ids) && carrera.sedes_ids.length) {
    const sedeUsuario = Number(authStore.sedeId || authStore.usuarioActual?.sede_id)
    if (sedeUsuario && carrera.sedes_ids.includes(sedeUsuario)) {
      return sedeUsuario
    }
    return Number(carrera.sedes_ids[0])
  }

  return (
    Number(carrera?.sede_id || authStore.sedeId || authStore.usuarioActual?.sede_id || 0) || null
  )
})

const planEstudiosSeleccionado = computed(
  () => sanitizePlanEstudios(carreraActual.value?.plan_estudios) || 'N',
)

onMounted(async () => {
  const storedUrl = localStorage.getItem(SOURCE_URL_STORAGE_KEY)
  const storedToken = localStorage.getItem(SOURCE_TOKEN_STORAGE_KEY)

  if (storedUrl) {
    apiUrl.value = storedUrl
  }
  if (storedToken) {
    apiToken.value = storedToken
  }

  if (carrerasStore.carreras.length === 0) {
    await carrerasStore.fetchCarreras()
  }
})

watch(
  carrerasOpciones,
  (options) => {
    if (options.length > 0 && !carreraSeleccionada.value) {
      carreraSeleccionada.value = options[0].id
    }
  },
  { immediate: true },
)

watch(apiUrl, (value) => {
  localStorage.setItem(SOURCE_URL_STORAGE_KEY, value || '')
})

watch(apiToken, (value) => {
  localStorage.setItem(SOURCE_TOKEN_STORAGE_KEY, value || '')
})

const sanitizePlanEstudios = (value) => {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
  return normalized || null
}

const stripHtml = (value) =>
  String(value || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()

const formatDetailItems = (value) => {
  if (value === null || value === undefined || value === '') {
    return []
  }

  const parsedValue = tryParseStructuredValue(value)
  if (parsedValue !== value) {
    return formatDetailItems(parsedValue)
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => formatDetailItems(item))
  }

  if (typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => {
      const nested = formatDetailItems(item)
      if (!nested.length) {
        return []
      }

      if (nested.length === 1) {
        return [`${key}: ${nested[0]}`]
      }

      return [`${key}:`, ...nested.map((nestedItem) => `- ${nestedItem}`)]
    })
  }

  return stripHtml(value)
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

const formatDetailText = (value) => {
  const items = formatDetailItems(value)
  return items.length ? items.join('\n') : 'No disponible'
}

const hasDisplayContent = (value) => formatDetailItems(value).length > 0

const formatThemeBibliography = (bibliografias = []) => {
  if (!bibliografias.length) {
    return 'No se reporta bibliografia vinculada.'
  }

  return bibliografias
    .map((bibliografia) => {
      const partes = [
        bibliografia.titulo || 'Sin titulo',
        bibliografia.autor || null,
        bibliografia.pivot?.pagina_desde || bibliografia.pivot?.pagina_hasta
          ? `Pag. ${bibliografia.pivot?.pagina_desde || '?'}-${bibliografia.pivot?.pagina_hasta || '?'}`
          : null,
      ].filter(Boolean)

      return `• ${partes.join(' | ')}`
    })
    .join('\n')
}

const formatDocenteLabel = (planificacion, index) =>
  planificacion.docente_nombre || planificacion.docente_email || `Docente ${index + 1}`

const formatPlanificacionesByField = (planificaciones = [], field, label) => {
  const bloques = planificaciones
    .map((planificacion, index) => {
      const value = planificacion?.[field]
      if (!hasDisplayContent(value)) {
        return null
      }

      return `• ${formatDocenteLabel(planificacion, index)}\n${formatDetailText(value)}`
    })
    .filter(Boolean)

  if (!bloques.length) {
    return `No disponible en ${label?.toLowerCase?.() || 'este bloque'}.`
  }

  return `Tomado desde planificaciones personales:\n\n${bloques.join('\n\n')}`
}

const formatTemaFieldWithFallback = (tema, field, label) => {
  if (hasDisplayContent(tema?.[field])) {
    return formatDetailText(tema[field])
  }

  return formatPlanificacionesByField(tema?.planificaciones_personales || [], field, label)
}

const formatSequenceItems = (secuencias = []) => {
  if (!secuencias.length) {
    return ''
  }

  return secuencias
    .map(
      (secuencia) =>
        `• ${secuencia.momento || 'Momento'}: ${secuencia.descripcion || 'Sin descripcion'} (${secuencia.duracion_minutos || 0} min)`,
    )
    .join('\n')
}

const hasThemeSequences = (tema) => {
  if (Array.isArray(tema?.secuencias) && tema.secuencias.length > 0) {
    return true
  }

  return (tema?.planificaciones_personales || []).some((planificacion) =>
    hasDisplayContent(planificacion?.secuencia_didactica),
  )
}

const formatThemeSequences = (tema) => {
  const baseSequences = formatSequenceItems(tema?.secuencias || [])
  if (baseSequences) {
    return baseSequences
  }

  const bloques = (tema?.planificaciones_personales || [])
    .map((planificacion, index) => {
      if (!hasDisplayContent(planificacion?.secuencia_didactica)) {
        return null
      }

      return `• ${formatDocenteLabel(planificacion, index)}\n${formatDetailText(planificacion.secuencia_didactica)}`
    })
    .filter(Boolean)

  if (!bloques.length) {
    return 'No se reportan secuencias base.'
  }

  return `Tomado desde planificaciones personales:\n\n${bloques.join('\n\n')}`
}

const buildPlanificacionResumen = (planificacion) => {
  const bloques = []

  if (hasDisplayContent(planificacion.estrategias_metodologicas)) {
    bloques.push(`Metodologicas: ${formatDetailText(planificacion.estrategias_metodologicas)}`)
  }

  if (hasDisplayContent(planificacion.estrategias_aprendizaje)) {
    bloques.push(`Aprendizaje: ${formatDetailText(planificacion.estrategias_aprendizaje)}`)
  }

  if (hasDisplayContent(planificacion.estrategias_recursos)) {
    bloques.push(`Recursos: ${formatDetailText(planificacion.estrategias_recursos)}`)
  }

  if (hasDisplayContent(planificacion.evaluacion_formativa)) {
    bloques.push(`Formativa: ${formatDetailText(planificacion.evaluacion_formativa)}`)
  }

  if (hasDisplayContent(planificacion.evaluacion_sumativa)) {
    bloques.push(`Sumativa: ${formatDetailText(planificacion.evaluacion_sumativa)}`)
  }

  if (hasDisplayContent(planificacion.secuencia_didactica)) {
    bloques.push(`Secuencia: ${formatDetailText(planificacion.secuencia_didactica)}`)
  }

  return bloques.length ? bloques.join('\n\n') : 'Sin detalle pedagogico adicional.'
}

const DEFAULT_LOCAL_STATUS = {
  estado: 'pendiente',
  label: 'Sin verificar',
  resumen: 'Aun no se verifico el estado local de esta asignatura.',
  tiene_contenido: false,
  stats: {
    pac_campos: 0,
    unidades: 0,
    temas: 0,
    bibliografias: 0,
    logros: 0,
    planificaciones: 0,
    secuencias: 0,
  },
}

const getLocalStatusColor = (status = DEFAULT_LOCAL_STATUS) => {
  if (status.estado === 'restaurada') {
    return 'positive'
  }

  if (status.estado === 'base_vacia') {
    return 'grey-4'
  }

  if (status.estado === 'ambigua') {
    return 'warning'
  }

  if (status.estado === 'no_encontrada') {
    return 'negative'
  }

  return 'blue-grey-2'
}

const getLocalStatusTextColor = (status = DEFAULT_LOCAL_STATUS) =>
  ['grey-4', 'blue-grey-2'].includes(getLocalStatusColor(status)) ? 'grey-9' : 'white'

const buildExportPayload = (asignatura) => {
  if (!asignatura) {
    return null
  }

  return {
    codigo: asignatura.codigo,
    nombre: asignatura.nombre,
    sigla: asignatura.sigla || asignatura.codigo,
    carrera_id: asignatura.carrera_id || carreraSeleccionada.value,
    sede_id: asignatura.sede_id || sedeSeleccionadaId.value,
    plan_estudios:
      sanitizePlanEstudios(asignatura.plan_estudios) || planEstudiosSeleccionado.value || 'N',
    semestre: asignatura.semestre || null,
    descripcion: asignatura.descripcion || null,
    justificacion: asignatura.justificacion || null,
    proposito_general: asignatura.proposito_general || null,
    metodologia_general: asignatura.metodologia_general || null,
    sistema_evaluacion: asignatura.sistema_evaluacion || null,
    contenido_minimo: asignatura.contenido_minimo || null,
    requisitos: asignatura.requisitos || null,
    competencia_asignatura: asignatura.competencia_asignatura || null,
    competencia_global_especifica: asignatura.competencia_global_especifica || null,
    elementos_competencia: asignatura.elementos_competencia || null,
    docentes: asignatura.docentes || [],
    bibliografias: asignatura.bibliografias || [],
    unidades: asignatura.unidades || [],
    meta_exportacion: {
      exportado_en: new Date().toISOString(),
      origen: 'sidopa-restauracion-programas',
      materia_origen: {
        codigo: asignatura.codigo,
        nombre: asignatura.nombre,
        carrera_id: asignatura.carrera_id || carreraSeleccionada.value,
        sede_id: asignatura.sede_id || sedeSeleccionadaId.value,
        plan_estudios:
          sanitizePlanEstudios(asignatura.plan_estudios) || planEstudiosSeleccionado.value || 'N',
      },
    },
  }
}

const downloadAsignaturaJson = (asignatura) => {
  const exportPayload = buildExportPayload(asignatura)

  if (!exportPayload) {
    return
  }

  const fileName = `${exportPayload.codigo || 'asignatura'}-${exportPayload.plan_estudios || 'N'}.json`
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: `Se descargo el JSON de ${exportPayload.nombre}.`,
  })
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

const buildImportedRestorePayload = (targetAsignatura, importedPayload) => {
  const importedAsignatura = normalizeAsignatura(importedPayload)

  return {
    ...importedAsignatura,
    restore_key: targetAsignatura.restore_key,
    codigo: targetAsignatura.codigo,
    nombre: targetAsignatura.nombre,
    sigla: targetAsignatura.sigla || targetAsignatura.codigo,
    carrera_id: targetAsignatura.carrera_id || carreraSeleccionada.value,
    sede_id: targetAsignatura.sede_id || sedeSeleccionadaId.value,
    plan_estudios:
      sanitizePlanEstudios(targetAsignatura.plan_estudios) || planEstudiosSeleccionado.value || 'N',
    semestre: targetAsignatura.semestre || importedAsignatura.semestre || null,
    local_status: targetAsignatura.local_status || { ...DEFAULT_LOCAL_STATUS },
    imported_from: {
      codigo: importedAsignatura.codigo,
      nombre: importedAsignatura.nombre,
      plan_estudios: importedAsignatura.plan_estudios,
    },
  }
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

const normalizeAsignatura = (asignatura = {}, index = 0) => {
  const unidades = Array.isArray(asignatura.unidades)
    ? asignatura.unidades.map(normalizeUnidad)
    : []
  const temas = unidades.flatMap((unidad) => unidad.temas)
  const planificaciones = temas.reduce(
    (total, tema) => total + tema.planificaciones_personales.length,
    0,
  )

  const normalized = {
    ...asignatura,
    carrera_id: asignatura.carrera_id || carreraSeleccionada.value,
    sede_id: asignatura.sede_id || sedeSeleccionadaId.value,
    plan_estudios:
      sanitizePlanEstudios(asignatura.plan_estudios) || planEstudiosSeleccionado.value || 'N',
    docentes: Array.isArray(asignatura.docentes) ? asignatura.docentes : [],
    bibliografias: Array.isArray(asignatura.bibliografias) ? asignatura.bibliografias : [],
    unidades,
  }

  normalized.restore_key = [
    normalized.codigo || 'sin-codigo',
    normalized.plan_estudios || 'N',
    normalized.carrera_id || 'sin-carrera',
    normalized.sede_id || 'sin-sede',
    index,
  ].join('-')

  normalized.stats = {
    unidades: unidades.length,
    temas: temas.length,
    docentes: normalized.docentes.length,
    planificaciones,
  }
  normalized.local_status = normalized.local_status || { ...DEFAULT_LOCAL_STATUS }

  return normalized
}

const extractAsignaturasFromResponse = (payload) => {
  if (Array.isArray(payload?.data?.asignaturas)) {
    return payload.data.asignaturas
  }

  if (Array.isArray(payload?.asignaturas)) {
    return payload.asignaturas
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload)) {
    return payload
  }

  return []
}

const hydrateLocalStatus = async (items) => {
  if (!items.length) {
    return items
  }

  try {
    const response = await api.post('/restauracion/estado-asignaturas', {
      asignaturas: items.map((item) => ({
        restore_key: item.restore_key,
        codigo: item.codigo,
        carrera_id: item.carrera_id || carreraSeleccionada.value,
        sede_id: item.sede_id || sedeSeleccionadaId.value,
        plan_estudios:
          sanitizePlanEstudios(item.plan_estudios) || planEstudiosSeleccionado.value || 'N',
      })),
    })

    const statusMap = new Map(
      (response.data?.data || []).map((status) => [status.restore_key, status]),
    )

    return items.map((item) => ({
      ...item,
      local_status: statusMap.get(item.restore_key) || { ...DEFAULT_LOCAL_STATUS },
    }))
  } catch (error) {
    console.error('Error fetching local restore status:', error)
    $q.notify({
      type: 'warning',
      message: 'Se cargaron las asignaturas del origen, pero no se pudo verificar su estado local.',
    })

    return items.map((item) => ({
      ...item,
      local_status: { ...DEFAULT_LOCAL_STATUS },
    }))
  }
}

const fetchDesdeApi = async () => {
  if (!apiUrl.value || !carreraSeleccionada.value) {
    return
  }

  loadingFetch.value = true
  asignaturas.value = []

  try {
    const params = new URLSearchParams({
      carrera_id: String(carreraSeleccionada.value),
      token: apiToken.value,
    })

    if (sedeSeleccionadaId.value) {
      params.set('sede_id', String(sedeSeleccionadaId.value))
    }

    const urlRequest = `${apiUrl.value.replace(/\/$/, '')}/api/export/documentacion-carrera?${params.toString()}`
    const response = await fetch(urlRequest, {
      headers: apiToken.value ? { Authorization: `Bearer ${apiToken.value}` } : {},
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const payload = await response.json()
    const extraidas = extractAsignaturasFromResponse(payload).map((item, index) =>
      normalizeAsignatura(item, index),
    )

    if (extraidas.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'La respuesta del origen no contiene asignaturas en un formato compatible.',
      })
      return
    }

    asignaturas.value = await hydrateLocalStatus(extraidas)
    $q.notify({
      type: 'positive',
      message: `Se extrajeron ${extraidas.length} asignatura(s) desde el origen.`,
    })
  } catch (error) {
    console.error('Error fetching API:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo conectar a la API externa. Verifica la URL, el token o la sede.',
    })
  } finally {
    loadingFetch.value = false
  }
}

const verDetalles = (asignatura) => {
  asignaturaVisualizada.value = asignatura
  modalDetalles.value = true
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

    const restorePayload = buildImportedRestorePayload(targetAsignatura, importedAsignatura)

    $q.dialog({
      title: 'Confirmar restauracion desde JSON',
      message: `
        <p>Se aplicara el contenido del archivo sobre <b>${targetAsignatura.nombre}</b>.</p>
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
      restaurarAsignaturaLocal(restorePayload)
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

const buildRestorePayload = (asignatura) => ({
  ...asignatura,
  carrera_id: asignatura.carrera_id || carreraSeleccionada.value,
  sede_id: asignatura.sede_id || sedeSeleccionadaId.value,
  plan_estudios:
    sanitizePlanEstudios(asignatura.plan_estudios) || planEstudiosSeleccionado.value || 'N',
})

const confirmarRestauracion = (asignatura) => {
  if (!asignatura) {
    return
  }

  $q.dialog({
    title: 'Confirmar sobreescritura local',
    message: `
      <p class="text-weight-bold text-negative">Atencion</p>
      Esta accion reemplazara completamente la estructura local de <b>${asignatura.nombre}</b>.
      <br><br>
      Estado actual detectado: <b>${asignatura.local_status?.label || 'Sin verificar'}</b>.
      <br><br>
      Se restaurara usando el plan <b>${asignatura.plan_estudios || 'N'}</b> para la carrera <b>${asignatura.carrera_id}</b>
      y la sede <b>${asignatura.sede_id || 'N/D'}</b>.
      <br><br>
      ¿Deseas proceder?
    `,
    html: true,
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey-8',
    },
    ok: {
      label: 'Si, restaurar',
      color: 'negative',
      unelevated: true,
    },
    persistent: true,
  }).onOk(() => {
    restaurarAsignaturaLocal(buildRestorePayload(asignatura))
  })
}

const restaurarAsignaturaLocal = async (payload) => {
  $q.loading.show({
    message: `Inyectando programa analitico de: ${payload.nombre}...`,
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

    asignaturas.value = await hydrateLocalStatus(asignaturas.value)
    if (asignaturaVisualizada.value?.restore_key === payload.restore_key) {
      asignaturaVisualizada.value =
        asignaturas.value.find((item) => item.restore_key === payload.restore_key) ||
        asignaturaVisualizada.value
    }
  } catch (error) {
    console.error('RESTORE ERROR:', error)
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
</script>

<style scoped>
.scroll {
  overflow-y: auto;
}

.detail-card {
  border-radius: 12px;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #5f6b7a;
}

.detail-value {
  font-size: 0.98rem;
  color: #1f2937;
}

.detail-pre {
  white-space: pre-wrap;
  line-height: 1.5;
  color: #27364a;
}
</style>
