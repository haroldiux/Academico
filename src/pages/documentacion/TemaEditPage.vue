<template>
  <q-page class="q-pa-lg">
    <!-- Breadcrumb & Header -->
    <div class="row items-center q-mb-lg animate-in">
      <div class="col">
        <q-breadcrumbs class="q-mb-sm">
          <q-breadcrumbs-el icon="home" to="/" />
          <q-breadcrumbs-el label="Documentación" to="/documentacion" />
          <q-breadcrumbs-el :label="asignatura?.codigo" :to="`/documentacion/${asignatura?.id}`" />
          <q-breadcrumbs-el :label="tema?.titulo || 'Tema'" />
        </q-breadcrumbs>
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="topic" size="36px" color="orange" class="q-mr-sm" />
          <span class="text-gradient">{{ tema?.titulo || 'Cargando...' }}</span>
        </h4>
        <p class="q-ma-none q-mt-xs" style="color: var(--text-secondary);">
          Unidad {{ unidad?.numero }}: {{ unidad?.titulo }} • {{ tema?.horas }} horas
        </p>
      </div>
      <div class="col-auto row q-gutter-sm">
        <q-chip
          :color="progresoTotal >= 80 ? 'green-2' : progresoTotal >= 50 ? 'amber-2' : 'red-2'"
          :text-color="progresoTotal >= 80 ? 'green-9' : progresoTotal >= 50 ? 'amber-9' : 'red-9'"
          size="lg"
        >
          <q-icon name="assignment_turned_in" class="q-mr-xs" />
          {{ progresoTotal }}% Completado
        </q-chip>
        <q-btn outline color="green" icon="picture_as_pdf" label="Generar PDF" no-caps />
        <q-btn unelevated color="primary" icon="save" label="Guardar Cambios" no-caps @click="guardarCambios" />
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <q-card class="card-main">
          <q-tabs v-model="tabActual" dense class="text-grey" active-color="primary" indicator-color="primary" align="left">
            <q-tab name="aprendizaje" no-caps>
              <div class="row items-center q-gutter-sm">
                <q-icon name="school" />
                <span>Resultados</span>
                <q-chip size="xs" color="purple-2" text-color="purple-9" dense class="q-ml-xs">Compartido</q-chip>
                <q-badge :color="progresoResultados >= 100 ? 'green' : progresoResultados >= 50 ? 'amber' : 'red'" text-color="white">
                  {{ progresoResultados }}%
                </q-badge>
              </div>
            </q-tab>
            <q-tab name="contenidos" no-caps>
              <div class="row items-center q-gutter-sm">
                <q-icon name="list_alt" />
                <span>Contenidos</span>
                <q-chip size="xs" color="purple-2" text-color="purple-9" dense class="q-ml-xs">Compartido</q-chip>
                <q-badge :color="progresoContenidos >= 100 ? 'green' : progresoContenidos >= 50 ? 'amber' : 'red'" text-color="white">
                  {{ progresoContenidos }}%
                </q-badge>
              </div>
            </q-tab>
            <q-tab name="estrategias" no-caps>
              <div class="row items-center q-gutter-sm">
                <q-icon name="psychology" />
                <span>Estrategias</span>
                <q-chip size="xs" color="teal-2" text-color="teal-9" dense class="q-ml-xs">Personal</q-chip>
                <q-badge :color="progresoEstrategias >= 100 ? 'green' : progresoEstrategias >= 50 ? 'amber' : 'red'" text-color="white">
                  {{ progresoEstrategias }}%
                </q-badge>
              </div>
            </q-tab>
            <q-tab name="evaluacion" no-caps>
              <div class="row items-center q-gutter-sm">
                <q-icon name="grading" />
                <span>Evaluación</span>
                <q-chip size="xs" color="teal-2" text-color="teal-9" dense class="q-ml-xs">Personal</q-chip>
                <q-badge :color="progresoEvaluacion >= 100 ? 'green' : progresoEvaluacion >= 50 ? 'amber' : 'red'" text-color="white">
                  {{ progresoEvaluacion }}%
                </q-badge>
              </div>
            </q-tab>
            <q-tab name="secuencia" no-caps>
              <div class="row items-center q-gutter-sm">
                <q-icon name="timeline" />
                <span>Secuencia</span>
                <q-chip size="xs" color="teal-2" text-color="teal-9" dense class="q-ml-xs">Personal</q-chip>
                <q-badge :color="progresoSecuencia >= 100 ? 'green' : progresoSecuencia >= 50 ? 'amber' : 'red'" text-color="white">
                  {{ progresoSecuencia }}%
                </q-badge>
              </div>
            </q-tab>
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tabActual" animated class="bg-transparent">
            <!-- Tab: Resultados de Aprendizaje -->
            <q-tab-panel name="aprendizaje" class="q-pa-lg">
              <!-- Banner de campo compartido -->
              <q-banner class="bg-purple-1 text-purple-9 q-mb-md rounded-borders" dense>
                <template v-slot:avatar>
                  <q-icon name="groups" color="purple" />
                </template>
                <span class="text-weight-medium">Campo Compartido (Materia)</span>
                <span class="q-ml-sm text-caption">Estos datos son visibles para todos los docentes de esta materia.</span>
                <template v-slot:action v-if="!puedeEditarCompartido">
                  <q-chip color="orange" text-color="white" size="sm" icon="lock">Solo lectura (Sede)</q-chip>
                </template>
              </q-banner>

              <!-- Barra de progreso -->
              <div class="q-mb-lg">
                <div class="row items-center justify-between q-mb-xs">
                  <span class="text-caption text-weight-medium" style="color: var(--text-secondary);">Progreso de esta sección</span>
                  <span class="text-caption text-weight-bold" :class="progresoResultados >= 100 ? 'text-green' : 'text-orange'">{{ progresoResultados }}%</span>
                </div>
                <q-linear-progress :value="progresoResultados / 100" :color="progresoResultados >= 100 ? 'green' : 'orange'" rounded size="8px" />
              </div>

              <!-- Resultado de Aprendizaje -->
              <div class="q-mb-xl">
                <div class="row items-center q-mb-md">
                  <q-icon name="emoji_events" color="amber" size="28px" class="q-mr-sm" />
                  <span class="text-h6 text-weight-bold">Resultado de Aprendizaje</span>
                </div>
                <q-input v-model="formTema.resultado_aprendizaje" outlined type="textarea" rows="3"
                  placeholder="Describe el resultado de aprendizaje esperado..."
                  hint="El estudiante al finalizar este tema será capaz de..."
                  :readonly="!puedeEditarCompartido" />
              </div>

              <!-- Logros Esperados con Indicadores anidados -->
              <div>
                <div class="row items-center justify-between q-mb-md">
                  <div class="row items-center">
                    <q-icon name="flag" color="green" size="28px" class="q-mr-sm" />
                    <span class="text-h6 text-weight-bold">Logros Esperados e Indicadores</span>
                  </div>
                  <q-btn v-if="puedeEditarCompartido" unelevated color="green" icon="add" label="Agregar Logro" size="sm" no-caps @click="dialogLogro = true" />
                </div>
                <p class="text-body2 q-mb-md" style="color: var(--text-secondary);">
                  Cada logro esperado puede tener múltiples indicadores que evidencian su cumplimiento.
                </p>

                <div v-if="!formTema.logros_esperados?.length" class="text-center q-pa-lg bg-grey-1 rounded-borders">
                  <q-icon name="flag" size="48px" color="grey-4" />
                  <p class="text-body2 text-grey-6 q-mt-sm">No hay logros esperados definidos</p>
                </div>

                <!-- Lista de Logros con Indicadores anidados -->
                <div v-else class="q-gutter-md">
                  <q-card v-for="logro in formTema.logros_esperados" :key="logro.id" flat bordered class="logro-card">
                    <q-card-section class="bg-green-1">
                      <div class="row items-center no-wrap">
                        <q-avatar color="green" text-color="white" size="36px" class="q-mr-md">
                          <span class="text-weight-bold text-caption">{{ logro.codigo }}</span>
                        </q-avatar>
                        <div class="col">
                          <q-input v-model="logro.descripcion" dense borderless class="text-body1 text-weight-medium"
                            placeholder="Descripción del logro..." :readonly="!puedeEditarCompartido" />
                        </div>
                        <!-- Selector de Parcial -->
                        <q-btn-toggle
                          v-model="logro.parcial"
                          push
                          glossy
                          toggle-color="primary"
                          :options="[
                            {label: '1°', value: 1},
                            {label: '2°', value: 2}
                          ]"
                          dense
                          size="sm"
                          class="q-mr-sm"
                        >
                          <q-tooltip>Parcial al que pertenece este logro</q-tooltip>
                        </q-btn-toggle>
                        <q-btn
                          flat
                          round
                          dense
                          icon="quiz"
                          color="purple"
                          size="sm"
                          @click="irBancoPreguntas(logro)"
                        >
                          <q-badge v-if="logro.mis_preguntas_count" floating color="teal" :label="logro.mis_preguntas_count" />
                          <q-tooltip>Banco de Preguntas ({{ logro.mis_preguntas_count || 0 }} mías)</q-tooltip>
                        </q-btn>
                        <q-btn v-if="puedeEditarCompartido" flat round dense icon="delete" color="red" size="sm" @click="eliminarLogro(logro)" />
                      </div>
                    </q-card-section>

                    <!-- Indicadores del Logro -->
                    <q-card-section class="q-pt-sm">
                      <div class="row items-center justify-between q-mb-sm">
                        <span class="text-caption text-weight-bold text-blue-grey-7">
                          <q-icon name="check_circle" color="blue" class="q-mr-xs" />
                          Indicadores de este logro
                        </span>
                        <q-btn v-if="puedeEditarCompartido" flat dense color="blue" icon="add" label="Indicador" size="sm" no-caps @click="abrirDialogIndicador(logro)" />
                      </div>

                      <div v-if="!logro.indicadores?.length" class="text-center q-pa-sm bg-grey-1 rounded-borders">
                        <span class="text-caption text-grey-6">Sin indicadores. Agrega cómo se evidencia este logro.</span>
                      </div>

                      <q-list v-else dense separator>
                        <q-item v-for="indicador in logro.indicadores" :key="indicador.id" class="q-pl-md">
                          <q-item-section avatar>
                            <q-chip size="sm" color="blue-2" text-color="blue-9" dense>{{ indicador.codigo }}</q-chip>
                          </q-item-section>
                          <q-item-section>
                            <q-input v-model="indicador.descripcion" dense borderless placeholder="El estudiante demuestra el logro cuando..." :readonly="!puedeEditarCompartido" />
                          </q-item-section>
                          <q-item-section side>
                            <q-btn v-if="puedeEditarCompartido" flat round dense icon="close" size="xs" color="red" @click="eliminarIndicador(logro, indicador)" />
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- Tab: Contenidos -->
            <q-tab-panel name="contenidos" class="q-pa-lg">
              <!-- Banner de campo compartido -->
              <q-banner class="bg-purple-1 text-purple-9 q-mb-md rounded-borders" dense>
                <template v-slot:avatar>
                  <q-icon name="groups" color="purple" />
                </template>
                <span class="text-weight-medium">Campo Compartido (Materia)</span>
                <span class="q-ml-sm text-caption">Los contenidos y bibliografía son comunes para todos los docentes.</span>
                <template v-slot:action v-if="!puedeEditarCompartido">
                  <q-chip color="orange" text-color="white" size="sm" icon="lock">Solo lectura (Sede)</q-chip>
                </template>
              </q-banner>

              <div class="q-mb-lg">
                <div class="row items-center justify-between q-mb-xs">
                  <span class="text-caption text-weight-medium" style="color: var(--text-secondary);">Progreso de esta sección</span>
                  <span class="text-caption text-weight-bold" :class="progresoContenidos >= 100 ? 'text-green' : 'text-orange'">{{ progresoContenidos }}%</span>
                </div>
                <q-linear-progress :value="progresoContenidos / 100" :color="progresoContenidos >= 100 ? 'green' : 'orange'" rounded size="8px" />
              </div>

              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-4">
                  <q-card flat bordered class="full-height">
                    <q-card-section class="bg-blue-1">
                      <q-icon name="lightbulb" color="blue" size="24px" class="q-mr-sm" />
                      <span class="text-subtitle1 text-weight-bold text-blue-9">Conceptual</span>
                      <p class="text-caption q-mb-none text-blue-7">Saber (conocimientos)</p>
                    </q-card-section>
                    <q-card-section>
                      <q-list dense>
                        <q-item v-for="(item, idx) in formTema.contenidos.conceptual" :key="idx" class="q-pa-xs">
                          <q-item-section avatar><q-icon name="circle" size="8px" color="blue" /></q-item-section>
                          <q-item-section><q-input v-model="formTema.contenidos.conceptual[idx]" dense borderless :readonly="!puedeEditarCompartido" /></q-item-section>
                          <q-item-section side><q-btn v-if="puedeEditarCompartido" flat round dense icon="close" size="xs" color="red" @click="formTema.contenidos.conceptual.splice(idx, 1)" /></q-item-section>
                        </q-item>
                      </q-list>
                      <q-btn v-if="puedeEditarCompartido" flat color="blue" icon="add" label="Agregar" size="sm" class="q-mt-sm full-width" @click="formTema.contenidos.conceptual.push('')" no-caps />
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-4">
                  <q-card flat bordered class="full-height">
                    <q-card-section class="bg-green-1">
                      <q-icon name="build" color="green" size="24px" class="q-mr-sm" />
                      <span class="text-subtitle1 text-weight-bold text-green-9">Procedimental</span>
                      <p class="text-caption q-mb-none text-green-7">Saber hacer (habilidades)</p>
                    </q-card-section>
                    <q-card-section>
                      <q-list dense>
                        <q-item v-for="(item, idx) in formTema.contenidos.procedimental" :key="idx" class="q-pa-xs">
                          <q-item-section avatar><q-icon name="circle" size="8px" color="green" /></q-item-section>
                          <q-item-section><q-input v-model="formTema.contenidos.procedimental[idx]" dense borderless :readonly="!puedeEditarCompartido" /></q-item-section>
                          <q-item-section side><q-btn v-if="puedeEditarCompartido" flat round dense icon="close" size="xs" color="red" @click="formTema.contenidos.procedimental.splice(idx, 1)" /></q-item-section>
                        </q-item>
                      </q-list>
                      <q-btn v-if="puedeEditarCompartido" flat color="green" icon="add" label="Agregar" size="sm" class="q-mt-sm full-width" @click="formTema.contenidos.procedimental.push('')" no-caps />
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-4">
                  <q-card flat bordered class="full-height">
                    <q-card-section class="bg-purple-1">
                      <q-icon name="favorite" color="purple" size="24px" class="q-mr-sm" />
                      <span class="text-subtitle1 text-weight-bold text-purple-9">Actitudinal</span>
                      <p class="text-caption q-mb-none text-purple-7">Saber ser (actitudes)</p>
                    </q-card-section>
                    <q-card-section>
                      <q-list dense>
                        <q-item v-for="(item, idx) in formTema.contenidos.actitudinal" :key="idx" class="q-pa-xs">
                          <q-item-section avatar><q-icon name="circle" size="8px" color="purple" /></q-item-section>
                          <q-item-section><q-input v-model="formTema.contenidos.actitudinal[idx]" dense borderless :readonly="!puedeEditarCompartido" /></q-item-section>
                          <q-item-section side><q-btn v-if="puedeEditarCompartido" flat round dense icon="close" size="xs" color="red" @click="formTema.contenidos.actitudinal.splice(idx, 1)" /></q-item-section>
                        </q-item>
                      </q-list>
                      <q-btn v-if="puedeEditarCompartido" flat color="purple" icon="add" label="Agregar" size="sm" class="q-mt-sm full-width" @click="formTema.contenidos.actitudinal.push('')" no-caps />
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- Referencias Bibliográficas del Tema -->
              <div class="q-mt-xl">
                <div class="row items-center justify-between q-mb-md">
                  <div class="row items-center">
                    <q-icon name="menu_book" color="primary" size="28px" class="q-mr-sm" />
                    <span class="text-h6 text-weight-bold">Referencias Bibliográficas</span>
                  </div>
                  <q-btn v-if="puedeEditarCompartido" unelevated color="primary" icon="add" label="Agregar Referencia" size="sm" no-caps @click="agregarReferenciaBiblio" />
                </div>
                <p class="text-body2 q-mb-md" style="color: var(--text-secondary);">
                  Selecciona las bibliografías y las páginas donde se encuentra el contenido de este tema.
                </p>

                <div v-if="!formTema.referencias_bibliograficas?.length" class="text-center q-pa-lg bg-grey-1 rounded-borders">
                  <q-icon name="menu_book" size="48px" color="grey-4" />
                  <p class="text-body2 text-grey-6 q-mt-sm">No hay referencias bibliográficas asignadas a este tema</p>
                </div>

                <div v-else class="row q-col-gutter-md">
                  <div v-for="(ref, idx) in formTema.referencias_bibliograficas" :key="idx" class="col-12 col-md-6">
                    <q-card flat bordered class="q-pa-sm">
                      <div class="row items-center q-gutter-sm">
                        <q-avatar color="primary" text-color="white" size="36px">
                          <q-icon name="book" />
                        </q-avatar>
                        <div class="col">
                          <q-select
                            v-model="ref.bibliografia_id"
                            :options="opcionesBibliografias"
                            label="Bibliografía"
                            dense
                            outlined
                            emit-value
                            map-options
                            class="q-mb-xs"
                            :readonly="!puedeEditarCompartido"
                          />
                          <div class="row q-gutter-sm">
                            <q-input
                              v-model="ref.pagina_desde"
                              label="Pág. desde"
                              dense
                              outlined
                              type="number"
                              class="col"
                              style="max-width: 100px;"
                              :readonly="!puedeEditarCompartido"
                            />
                            <q-input
                              v-model="ref.pagina_hasta"
                              label="Pág. hasta"
                              dense
                              outlined
                              type="number"
                              class="col"
                              style="max-width: 100px;"
                              :readonly="!puedeEditarCompartido"
                            />
                          </div>
                        </div>
                        <q-btn v-if="puedeEditarCompartido" flat round dense icon="delete" color="red" size="sm" @click="formTema.referencias_bibliograficas.splice(idx, 1)" />
                      </div>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <!-- Tab: Estrategias -->
            <q-tab-panel name="estrategias" class="q-pa-lg">
              <!-- Banner de campo personal -->
              <q-banner class="bg-teal-1 text-teal-9 q-mb-md rounded-borders" dense>
                <template v-slot:avatar>
                  <q-icon name="person" color="teal" />
                </template>
                <span class="text-weight-medium">Campo Personal (Docente)</span>
                <span class="q-ml-sm text-caption">Estas estrategias son tu configuración personal para esta materia.</span>
                <template v-slot:action v-if="esSoloLectura">
                  <q-chip color="orange" text-color="white" size="sm" icon="visibility">Solo lectura</q-chip>
                </template>
              </q-banner>

              <div class="q-mb-lg">
                <div class="row items-center justify-between q-mb-xs">
                  <span class="text-caption text-weight-medium" style="color: var(--text-secondary);">Progreso de esta sección</span>
                  <span class="text-caption text-weight-bold" :class="progresoEstrategias >= 100 ? 'text-green' : 'text-orange'">{{ progresoEstrategias }}%</span>
                </div>
                <q-linear-progress :value="progresoEstrategias / 100" :color="progresoEstrategias >= 100 ? 'green' : 'orange'" rounded size="8px" />
              </div>

              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-4">
                  <q-card flat bordered class="full-height">
                    <q-card-section class="bg-indigo-1">
                      <q-icon name="school" color="indigo" size="24px" class="q-mr-sm" />
                      <span class="text-subtitle1 text-weight-bold text-indigo-9">Metodológicas (Docente)</span>
                    </q-card-section>
                    <q-card-section>
                      <q-input v-model="formTema.estrategias.metodologicas" type="textarea" rows="8" outlined placeholder="Estrategias de enseñanza..." />
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-4">
                  <q-card flat bordered class="full-height">
                    <q-card-section class="bg-teal-1">
                      <q-icon name="person" color="teal" size="24px" class="q-mr-sm" />
                      <span class="text-subtitle1 text-weight-bold text-teal-9">Aprendizaje (Estudiante)</span>
                    </q-card-section>
                    <q-card-section>
                      <q-input v-model="formTema.estrategias.aprendizaje" type="textarea" rows="8" outlined placeholder="Actividades del estudiante..." />
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-4">
                  <q-card flat bordered class="full-height">
                    <q-card-section class="bg-orange-1">
                      <q-icon name="inventory_2" color="orange" size="24px" class="q-mr-sm" />
                      <span class="text-subtitle1 text-weight-bold text-orange-9">Recursos</span>
                    </q-card-section>
                    <q-card-section>
                      <q-list dense>
                        <q-item v-for="(item, idx) in formTema.estrategias.recursos" :key="idx" class="q-pa-xs">
                          <q-item-section avatar><q-icon name="check" size="16px" color="orange" /></q-item-section>
                          <q-item-section><q-input v-model="formTema.estrategias.recursos[idx]" dense borderless /></q-item-section>
                          <q-item-section side><q-btn flat round dense icon="close" size="xs" color="red" @click="formTema.estrategias.recursos.splice(idx, 1)" /></q-item-section>
                        </q-item>
                      </q-list>
                      <q-btn flat color="orange" icon="add" label="Agregar" size="sm" class="q-mt-sm full-width" @click="formTema.estrategias.recursos.push('')" no-caps />
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- Tab: Evaluación con selección múltiple -->
            <q-tab-panel name="evaluacion" class="q-pa-lg">
              <!-- Banner de campo personal -->
              <q-banner class="bg-teal-1 text-teal-9 q-mb-md rounded-borders" dense>
                <template v-slot:avatar>
                  <q-icon name="person" color="teal" />
                </template>
                <span class="text-weight-medium">Campo Personal (Docente)</span>
                <span class="q-ml-sm text-caption">Define tu propia metodología de evaluación formativa y sumativa.</span>
                <template v-slot:action v-if="esSoloLectura">
                  <q-chip color="orange" text-color="white" size="sm" icon="visibility">Solo lectura</q-chip>
                </template>
              </q-banner>

              <div class="q-mb-lg">
                <div class="row items-center justify-between q-mb-xs">
                  <span class="text-caption text-weight-medium" style="color: var(--text-secondary);">Progreso de esta sección</span>
                  <span class="text-caption text-weight-bold" :class="progresoEvaluacion >= 100 ? 'text-green' : 'text-orange'">{{ progresoEvaluacion }}%</span>
                </div>
                <q-linear-progress :value="progresoEvaluacion / 100" :color="progresoEvaluacion >= 100 ? 'green' : 'orange'" rounded size="8px" />
              </div>

              <div class="row q-col-gutter-lg">
                <!-- Evaluación Formativa -->
                <div class="col-12 col-md-6">
                  <q-card flat bordered>
                    <q-card-section class="bg-cyan-1">
                      <q-icon name="assignment" color="cyan" size="24px" class="q-mr-sm" />
                      <span class="text-subtitle1 text-weight-bold text-cyan-9">Evaluación Formativa</span>
                      <p class="text-caption q-mb-none text-cyan-7">Evaluación continua durante el proceso</p>
                    </q-card-section>
                    <q-card-section class="q-gutter-md">
                      <q-select
                        v-model="formTema.evaluacion.formativa.actividades"
                        :options="store.opcionesEvaluacionFormativa"
                        label="Actividades y Técnicas"
                        outlined
                        dense
                        multiple
                        use-chips
                        emit-value
                        hint="Seleccione una o más actividades"
                      />
                      <q-select
                        v-model="formTema.evaluacion.formativa.instrumentos"
                        :options="store.opcionesInstrumentosFormativa"
                        label="Instrumentos"
                        outlined
                        dense
                        multiple
                        use-chips
                        emit-value
                      />
                      <q-select
                        v-model="formTema.evaluacion.formativa.evidencias"
                        :options="store.opcionesEvidenciasFormativa"
                        label="Evidencias"
                        outlined
                        dense
                        multiple
                        use-chips
                        emit-value
                      />
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Evaluación Sumativa -->
                <div class="col-12 col-md-6">
                  <q-card flat bordered>
                    <q-card-section class="bg-red-1">
                      <q-icon name="grading" color="red" size="24px" class="q-mr-sm" />
                      <span class="text-subtitle1 text-weight-bold text-red-9">Evaluación Sumativa</span>
                      <p class="text-caption q-mb-none text-red-7">Evaluación al final del tema</p>
                    </q-card-section>
                    <q-card-section class="q-gutter-md">
                      <q-select
                        v-model="formTema.evaluacion.sumativa.actividades"
                        :options="store.opcionesEvaluacionSumativa"
                        label="Actividades y Técnicas"
                        outlined
                        dense
                        multiple
                        use-chips
                        emit-value
                        hint="Seleccione una o más actividades"
                      />
                      <q-select
                        v-model="formTema.evaluacion.sumativa.instrumentos"
                        :options="store.opcionesInstrumentosSumativa"
                        label="Instrumentos"
                        outlined
                        dense
                        multiple
                        use-chips
                        emit-value
                      />
                      <q-select
                        v-model="formTema.evaluacion.sumativa.evidencias"
                        :options="store.opcionesEvidenciasSumativa"
                        label="Evidencias"
                        outlined
                        dense
                        multiple
                        use-chips
                        emit-value
                      />
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- Tab: Secuencia Didáctica -->
            <q-tab-panel name="secuencia" class="q-pa-lg">
              <!-- Banner de campo personal -->
              <q-banner class="bg-teal-1 text-teal-9 q-mb-md rounded-borders" dense>
                <template v-slot:avatar>
                  <q-icon name="person" color="teal" />
                </template>
                <span class="text-weight-medium">Campo Personal (Docente)</span>
                <span class="q-ml-sm text-caption">Organiza los momentos de tu clase según tu metodología.</span>
                <template v-slot:action v-if="esSoloLectura">
                  <q-chip color="orange" text-color="white" size="sm" icon="visibility">Solo lectura</q-chip>
                </template>
              </q-banner>

              <div class="q-mb-lg">
                <div class="row items-center justify-between q-mb-xs">
                  <span class="text-caption text-weight-medium" style="color: var(--text-secondary);">Progreso de esta sección</span>
                  <span class="text-caption text-weight-bold" :class="progresoSecuencia >= 100 ? 'text-green' : 'text-orange'">{{ progresoSecuencia }}%</span>
                </div>
                <q-linear-progress :value="progresoSecuencia / 100" :color="progresoSecuencia >= 100 ? 'green' : 'orange'" rounded size="8px" />
              </div>

              <div class="row items-center justify-between q-mb-lg">
                <span class="text-h6 text-weight-bold"><q-icon name="timeline" color="primary" class="q-mr-sm" />Secuencia Didáctica</span>
                <q-btn unelevated color="primary" icon="add" label="Agregar Momento" size="sm" no-caps @click="abrirDialogSecuencia()" />
              </div>

              <div v-if="!formTema.secuencia_didactica?.length" class="text-center q-pa-xl bg-grey-1 rounded-borders">
                <q-icon name="timeline" size="64px" color="grey-4" />
                <p class="text-h6 text-grey-6 q-mt-md">No hay secuencia definida</p>
                <p class="text-body2 text-grey-5">Define: Introducción, Desarrollo, Cierre</p>
              </div>

              <div v-else class="q-gutter-md">
                <q-card v-for="(momento, idx) in formTema.secuencia_didactica" :key="momento.id" flat bordered class="momento-card">
                  <q-card-section horizontal :class="getMomentoClass(momento.momento)">
                    <q-card-section class="col-auto flex flex-center" style="min-width: 250px; max-width: 250px;">
                      <div class="text-center full-width q-px-sm">
                        <q-icon :name="getMomentoIcon(momento.momento)" size="32px" />
                        <div class="text-weight-bold q-mt-xs" :class="momento.momento.length > 30 ? 'text-caption' : 'text-subtitle1'" style="line-height: 1.2;">{{ momento.momento }}</div>
                        <q-chip clickable ripple :color="getMomentoColor(momento.momento)" text-color="white" dense size="sm" class="q-mt-sm">
                          <q-icon name="schedule" size="10px" class="q-mr-xs" />
                          {{ momento.duracion }} min
                          <q-icon name="edit" size="10px" class="q-ml-xs" style="opacity: 0.7;" />

                          <q-tooltip>Clic para cambiar duración</q-tooltip>
                          <q-popup-edit v-model.number="momento.duracion" auto-save v-slot="scope" anchor="top middle" self="bottom middle">
                            <q-input v-model.number="scope.value" dense autofocus borderless type="number" style="width: 60px" @keyup.enter="scope.set" />
                          </q-popup-edit>
                        </q-chip>
                      </div>
                    </q-card-section>
                    <q-separator vertical />
                    <q-card-section class="col">
                      <q-input v-model="momento.actividad" type="textarea" rows="3" borderless placeholder="Actividades..." />
                    </q-card-section>
                    <q-card-section class="col-auto flex items-start">
                      <div class="column q-gutter-xs">
                        <q-btn flat round dense icon="edit" size="sm" color="orange" @click="abrirDialogSecuencia(momento)" />
                        <q-btn flat round dense icon="delete" size="sm" color="red" @click="eliminarSecuencia(momento)" />
                        <q-btn v-if="idx > 0" flat round dense icon="arrow_upward" size="sm" color="grey" @click="moverSecuencia(idx, -1)" />
                        <q-btn v-if="idx < formTema.secuencia_didactica.length - 1" flat round dense icon="arrow_downward" size="sm" color="grey" @click="moverSecuencia(idx, 1)" />
                      </div>
                    </q-card-section>
                  </q-card-section>
                </q-card>
              </div>

              <div v-if="formTema.secuencia_didactica?.length" class="q-mt-lg text-right">
                <q-chip color="primary" text-color="white" size="lg">
                  <q-icon name="schedule" class="q-mr-sm" />Tiempo Total: {{ tiempoTotal }} min
                </q-chip>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>

    <!-- Dialog: Nuevo Logro -->
    <q-dialog v-model="dialogLogro" persistent>
      <q-card style="width: 500px; max-width: 95vw; border-radius: 16px;">
        <div class="dialog-header" style="background: linear-gradient(135deg, #43a047, #66bb6a);">
          <div class="dialog-header-title"><q-icon name="flag" size="28px" />Nuevo Logro Esperado</div>
        </div>
        <q-card-section class="q-pt-lg">
          <q-input v-model="nuevoLogro" outlined type="textarea" rows="3" label="Descripción del Logro" placeholder="El estudiante..." hint="Qué se espera que logre el estudiante" />
        </q-card-section>
        <div class="dialog-actions">
          <q-btn flat label="Cancelar" color="grey" @click="dialogLogro = false; nuevoLogro = ''" no-caps />
          <q-btn unelevated label="Agregar" color="green" @click="agregarLogro" no-caps />
        </div>
      </q-card>
    </q-dialog>

    <!-- Dialog: Nuevo Indicador -->
    <q-dialog v-model="dialogIndicador" persistent>
      <q-card style="width: 500px; max-width: 95vw; border-radius: 16px;">
        <div class="dialog-header" style="background: linear-gradient(135deg, #1976d2, #42a5f5);">
          <div class="dialog-header-title"><q-icon name="check_circle" size="28px" />Nuevo Indicador para {{ logroSeleccionado?.codigo }}</div>
        </div>
        <q-card-section class="q-pt-lg">
          <q-input v-model="nuevoIndicador" outlined type="textarea" rows="3" label="Descripción del Indicador" placeholder="El estudiante demuestra el logro cuando..." hint="Cómo se evidencia que se alcanzó el logro" />
        </q-card-section>
        <div class="dialog-actions">
          <q-btn flat label="Cancelar" color="grey" @click="dialogIndicador = false; nuevoIndicador = ''" no-caps />
          <q-btn unelevated label="Agregar" color="primary" @click="agregarIndicador" no-caps />
        </div>
      </q-card>
    </q-dialog>

    <!-- Dialog: Secuencia -->
    <q-dialog v-model="dialogSecuencia" persistent>
      <q-card style="width: 550px; max-width: 95vw; border-radius: 16px;">
        <div class="dialog-header">
          <div class="dialog-header-title"><q-icon name="timeline" size="28px" />{{ editandoSecuencia ? 'Editar' : 'Nuevo' }} Momento</div>
        </div>
        <q-card-section class="q-pt-lg q-gutter-md">
          <q-select v-model="formSecuencia.momento" outlined dense label="Momento" :options="opcionesMomento" emit-value map-options />
          <q-input v-model.number="formSecuencia.duracion" outlined dense type="number" label="Duración (min)" min="1" />
          <q-input v-model="formSecuencia.actividad" outlined type="textarea" rows="4" label="Actividades" />
        </q-card-section>
        <div class="dialog-actions">
          <q-btn flat label="Cancelar" color="grey" @click="dialogSecuencia = false" no-caps />
          <q-btn unelevated label="Guardar" color="primary" @click="guardarSecuencia" no-caps />
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
import { useAuthStore } from 'src/stores/auth'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const store = useAsignaturasStore()
const authStore = useAuthStore()

const tabActual = ref('aprendizaje')
const asignatura = ref(null)
const unidad = ref(null)
const tema = ref(null)

// ==========================================
// PERMISOS
// ==========================================
const ROLES_SOLO_LECTURA = ['DIRECCION_ACADEMICA', 'VICERRECTOR_SEDE', 'VICERRECTOR_NACIONAL']

// Verifica si es solo lectura
const esSoloLectura = computed(() => {
  const userRol = authStore.rol
  return ROLES_SOLO_LECTURA.includes(userRol)

})

const puedeEditarCompartido = computed(() => {
  if (esSoloLectura.value) return false
  const user = authStore.usuarioActual
  if (!user) return false

  // Global Admins
  if (['SUPER ADMIN', 'SUPER_ADMIN', 'ADMIN', 'VICERRECTOR_NACIONAL'].includes(user.rol)) return true

  // Cocha Only (Sede ID 1)
  // Directores y Docentes de Cocha pueden editar
  if (user.sede_id === 1) {
      return ['DIRECTOR_CARRERA', 'DIRECTOR CARRERA', 'DOCENTE'].includes(user.rol)
  }

  return false
})

const formTema = ref({
  resultado_aprendizaje: '',
  logros_esperados: [],
  contenidos: { conceptual: [], procedimental: [], actitudinal: [] },
  estrategias: { metodologicas: '', aprendizaje: '', recursos: [] },
  evaluacion: {
    formativa: { actividades: [], instrumentos: [], evidencias: [] },
    sumativa: { actividades: [], instrumentos: [], evidencias: [] }
  },
  secuencia_didactica: [],
  referencias_bibliograficas: [] // { bibliografia_id, pagina_desde, pagina_hasta }
})

const dialogLogro = ref(false)
const dialogIndicador = ref(false)
const dialogSecuencia = ref(false)
const editandoSecuencia = ref(false)
const secuenciaSeleccionada = ref(null)
const logroSeleccionado = ref(null)
const nuevoLogro = ref('')
const nuevoIndicador = ref('')
const formSecuencia = ref({ momento: 'INTRODUCCIÓN', actividad: '', duracion: 10 })

const opcionesMomento = [
  { label: 'INTRODUCCION', value: 'INTRODUCCION' },
  { label: 'RESULTADOS DE APRENDIZAJE/LOGROS ESPERADOS', value: 'RESULTADOS DE APRENDIZAJE/LOGROS ESPERADOS' },
  { label: 'CONTENIDOS DE LA CLASE', value: 'CONTENIDOS DE LA CLASE' },
  { label: 'CUERPO DE CONTENIDOS', value: 'CUERPO DE CONTENIDOS' },
  { label: 'CONCLUSION O CIERRE', value: 'CONCLUSION O CIERRE' }
]



// Computed que fuerzan reactividad usando JSON.stringify
const progresoResultados = computed(() => {
  JSON.stringify(formTema.value.logros_esperados)
  return calcularProgresoLocal('resultados')
})

const progresoContenidos = computed(() => {
  JSON.stringify(formTema.value.contenidos)
  return calcularProgresoLocal('contenidos')
})

const progresoEstrategias = computed(() => {
  JSON.stringify(formTema.value.estrategias)
  return calcularProgresoLocal('estrategias')
})

const progresoEvaluacion = computed(() => {
  JSON.stringify(formTema.value.evaluacion)
  return calcularProgresoLocal('evaluacion')
})

const progresoSecuencia = computed(() => {
  JSON.stringify(formTema.value.secuencia_didactica)
  return calcularProgresoLocal('secuencia')
})

const progresoTotal = computed(() => {
  return Math.round((progresoResultados.value + progresoContenidos.value + progresoEstrategias.value + progresoEvaluacion.value + progresoSecuencia.value) / 5)
})

const tiempoTotal = computed(() => formTema.value.secuencia_didactica?.reduce((s, m) => s + (m.duracion || 0), 0) || 0)

// Opciones de bibliografías disponibles para selección
const opcionesBibliografias = computed(() => {
  if (!asignatura.value?.bibliografias) return []
  return asignatura.value.bibliografias.map(b => ({
    label: `${b.autor} - ${b.titulo} (${b.anio})`,
    value: b.id
  }))
})

// Función local para calcular progreso
function calcularProgresoLocal(seccion) {
  const tema = formTema.value

  if (seccion === 'resultados') {
    // Mínimo requerido: 1 resultado + 1 logro + 1 indicador = 3 campos base
    let totalCampos = 3
    let camposLlenos = 0

    // 1. Resultado de aprendizaje (requerido)
    if (tema.resultado_aprendizaje?.trim()) camposLlenos++

    // 2. Al menos 1 logro requerido
    const logros = tema.logros_esperados || []
    if (logros.length > 0 && logros.some(l => l.descripcion?.trim())) {
      camposLlenos++
    }

    // 3. Al menos 1 indicador requerido (en cualquier logro)
    const tieneIndicador = logros.some(l => l.indicadores?.some(i => i.descripcion?.trim()))
    if (tieneIndicador) camposLlenos++

    // Campos extra: logros adicionales y sus indicadores
    if (logros.length > 1) {
      logros.slice(1).forEach(logro => {
        totalCampos++
        if (logro.descripcion?.trim()) camposLlenos++
      })
    }
    // Indicadores adicionales
    logros.forEach(logro => {
      const indicadores = logro.indicadores || []
      if (indicadores.length > 1) {
        indicadores.slice(1).forEach(ind => {
          totalCampos++
          if (ind.descripcion?.trim()) camposLlenos++
        })
      }
    })

    return Math.round((camposLlenos / totalCampos) * 100)
  }

  if (seccion === 'contenidos') {
    // Siempre esperamos al menos 1 de cada tipo
    const conceptual = tema.contenidos?.conceptual || []
    const procedimental = tema.contenidos?.procedimental || []
    const actitudinal = tema.contenidos?.actitudinal || []

    // Mínimo 1 de cada tipo = 3 campos base
    let totalCampos = 3
    let camposLlenos = 0

    // Conceptual: al menos 1 requerido
    if (conceptual.length > 0 && conceptual.some(item => item?.trim())) {
      camposLlenos++
    }
    // Agregar campos extra si hay más de 1
    if (conceptual.length > 1) {
      conceptual.slice(1).forEach(item => { totalCampos++; if (item?.trim()) camposLlenos++ })
    }

    // Procedimental: al menos 1 requerido
    if (procedimental.length > 0 && procedimental.some(item => item?.trim())) {
      camposLlenos++
    }
    if (procedimental.length > 1) {
      procedimental.slice(1).forEach(item => { totalCampos++; if (item?.trim()) camposLlenos++ })
    }

    // Actitudinal: al menos 1 requerido
    if (actitudinal.length > 0 && actitudinal.some(item => item?.trim())) {
      camposLlenos++
    }
    if (actitudinal.length > 1) {
      actitudinal.slice(1).forEach(item => { totalCampos++; if (item?.trim()) camposLlenos++ })
    }

    return Math.round((camposLlenos / totalCampos) * 100)
  }

  if (seccion === 'estrategias') {
    // Mínimo: metodológicas + aprendizaje + al menos 1 recurso = 3 campos base
    let totalCampos = 3
    let camposLlenos = 0

    // 1. Metodológicas (requerido)
    if (tema.estrategias?.metodologicas?.trim()) camposLlenos++

    // 2. Aprendizaje (requerido)
    if (tema.estrategias?.aprendizaje?.trim()) camposLlenos++

    // 3. Al menos 1 recurso requerido
    const recursos = tema.estrategias?.recursos || []
    if (recursos.length > 0 && recursos.some(r => r?.trim())) {
      camposLlenos++
    }

    // Recursos adicionales
    if (recursos.length > 1) {
      recursos.slice(1).forEach(rec => { totalCampos++; if (rec?.trim()) camposLlenos++ })
    }

    return Math.round((camposLlenos / totalCampos) * 100)
  }

  if (seccion === 'evaluacion') {
    let totalCampos = 6, camposLlenos = 0
    if (tema.evaluacion?.formativa?.actividades?.length > 0) camposLlenos++
    if (tema.evaluacion?.formativa?.instrumentos?.length > 0) camposLlenos++
    if (tema.evaluacion?.formativa?.evidencias?.length > 0) camposLlenos++
    if (tema.evaluacion?.sumativa?.actividades?.length > 0) camposLlenos++
    if (tema.evaluacion?.sumativa?.instrumentos?.length > 0) camposLlenos++
    if (tema.evaluacion?.sumativa?.evidencias?.length > 0) camposLlenos++
    return Math.round((camposLlenos / totalCampos) * 100)
  }

  if (seccion === 'secuencia') {
    // Mínimo 3 momentos: Introducción, Desarrollo, Cierre
    const secuencia = tema.secuencia_didactica || []
    let totalCampos = 3 // Mínimo requerido
    let camposLlenos = 0

    // Contar momentos con actividad definida
    secuencia.forEach(momento => {
      if (momento.actividad?.trim()) camposLlenos++
    })

    // Si hay más de 3 momentos, agregar los extras
    if (secuencia.length > 3) {
      totalCampos = secuencia.length
    }

    // Limitar a 100%
    return Math.min(100, Math.round((camposLlenos / totalCampos) * 100))
  }

  return 0
}

onMounted(() => cargarDatos())
watch(() => route.params, () => cargarDatos())

async function cargarDatos() {
  const aId = parseInt(route.params.id)
  const uId = parseInt(route.params.unidadId)
  const tId = parseInt(route.params.temaId)
  asignatura.value = await store.getAsignaturaById(aId)
  if (asignatura.value) {
    unidad.value = asignatura.value.unidades.find(u => u.id === uId)
    if (unidad.value) {
      tema.value = unidad.value.temas.find(t => t.id === tId)
      if (tema.value) {
        formTema.value = {
          resultado_aprendizaje: tema.value.resultado_aprendizaje || '',
          logros_esperados: (tema.value.logros_esperados || tema.value.logros || []).map((l, index) => ({
            ...l,
            codigo: l.codigo || `LE.${index + 1}`, // Generate UI code if missing
            // Map indicadores with codes too
            indicadores: (l.indicadores || []).map((ind, iIdx) => ({
                ...ind,
                codigo: ind.codigo || `IND.${index + 1}.${iIdx + 1}`
            })),
            parcial: l.periodo === '2do Parcial' ? 2 : (parseInt(l.periodo) || 1) // Map backend period to frontend partial ID
          })),
          contenidos: {
            conceptual: [...(tema.value.contenidos?.conceptual || tema.value.contenido_conceptual || [])],
            procedimental: [...(tema.value.contenidos?.procedimental || tema.value.contenido_procedimental || [])],
            actitudinal: [...(tema.value.contenidos?.actitudinal || tema.value.contenido_actitudinal || [])]
          },
          estrategias: {
            metodologicas: tema.value.planificacion_personal?.estrategias_metodologicas || tema.value.estrategias?.metodologicas || tema.value.estrategias_metodologicas || '',
            aprendizaje: tema.value.planificacion_personal?.estrategias_aprendizaje || tema.value.estrategias?.aprendizaje || tema.value.estrategias_aprendizaje || '',
            recursos: [...(tema.value.planificacion_personal?.estrategias_recursos || tema.value.estrategias?.recursos || tema.value.estrategias_recursos || [])]
          },
          evaluacion: {
            formativa: {
              actividades: [...(tema.value.planificacion_personal?.evaluacion_formativa?.actividades || tema.value.evaluacion?.formativa?.actividades || tema.value.evaluacion_formativa?.actividades || [])],
              instrumentos: [...(tema.value.planificacion_personal?.evaluacion_formativa?.instrumentos || tema.value.evaluacion?.formativa?.instrumentos || tema.value.evaluacion_formativa?.instrumentos || [])],
              evidencias: [...(tema.value.planificacion_personal?.evaluacion_formativa?.evidencias || tema.value.evaluacion?.formativa?.evidencias || tema.value.evaluacion_formativa?.evidencias || [])]
            },
            sumativa: {
              actividades: [...(tema.value.planificacion_personal?.evaluacion_sumativa?.actividades || tema.value.evaluacion?.sumativa?.actividades || tema.value.evaluacion_sumativa?.actividades || [])],
              instrumentos: [...(tema.value.planificacion_personal?.evaluacion_sumativa?.instrumentos || tema.value.evaluacion?.sumativa?.instrumentos || tema.value.evaluacion_sumativa?.instrumentos || [])],
              evidencias: [...(tema.value.planificacion_personal?.evaluacion_sumativa?.evidencias || tema.value.evaluacion?.sumativa?.evidencias || tema.value.evaluacion_sumativa?.evidencias || [])]
            }
          },
          secuencia_didactica: tema.value.planificacion_personal?.secuencia_didactica
            ? JSON.parse(JSON.stringify(tema.value.planificacion_personal.secuencia_didactica))
            : (tema.value.secuencia_didactica && tema.value.secuencia_didactica.length > 0
                ? JSON.parse(JSON.stringify(tema.value.secuencia_didactica))
                : []),

          referencias_bibliograficas: tema.value.referencias_bibliograficas
             ? JSON.parse(JSON.stringify(tema.value.referencias_bibliograficas))
             : (tema.value.bibliografias ? tema.value.bibliografias.map(b => ({
                 bibliografia_id: b.id,
                 pagina_desde: b.pivot?.pagina_desde || '',
                 pagina_hasta: b.pivot?.pagina_hasta || '',
                 // Optional: keep title/author for display if needed
                 titulo: b.titulo,
                 autor: b.autor
             })) : [])
        }

        // Pre-populate sequence if empty
        if (formTema.value.secuencia_didactica.length === 0) {
          const defaults = [
            { momento: 'INTRODUCCION', duracion: 10 },
            { momento: 'RESULTADOS DE APRENDIZAJE/LOGROS ESPERADOS', duracion: 10 },
            { momento: 'CONTENIDOS DE LA CLASE', duracion: 10 },
            { momento: 'CUERPO DE CONTENIDOS', duracion: 40 },
            { momento: 'CONCLUSION O CIERRE', duracion: 10 }
          ]
          formTema.value.secuencia_didactica = defaults.map((d, i) => ({
            id: Date.now() + i,
            momento: d.momento,
            actividad: '',
            duracion: d.duracion
          }))
        }
      }
    }
  }
}

function guardarCambios() {
  if (!asignatura.value || !unidad.value || !tema.value) return
  store.updateTema(tema.value.id, formTema.value)
  $q.notify({ type: 'positive', message: 'Cambios guardados exitosamente', icon: 'check_circle', position: 'top' })
}

function agregarReferenciaBiblio() {
  if (!formTema.value.referencias_bibliograficas) {
    formTema.value.referencias_bibliograficas = []
  }
  formTema.value.referencias_bibliograficas.push({
    bibliografia_id: null,
    pagina_desde: null,
    pagina_hasta: null
  })
}

function agregarLogro() {
  if (!nuevoLogro.value.trim()) return
  const num = formTema.value.logros_esperados.length + 1
  formTema.value.logros_esperados.push({ id: Date.now(), codigo: `LE.${num}`, descripcion: nuevoLogro.value, indicadores: [] })
  nuevoLogro.value = ''
  dialogLogro.value = false
}

function eliminarLogro(logro) {
  formTema.value.logros_esperados = formTema.value.logros_esperados.filter(l => l.id !== logro.id)
  formTema.value.logros_esperados.forEach((l, i) => { l.codigo = `LE.${i + 1}` })
}

function irBancoPreguntas(logro) {
  const aId = asignatura.value?.id
  const tId = tema.value?.id
  router.push(`/preguntas/${aId}/${tId}/${logro.id}`)
}

function abrirDialogIndicador(logro) {
  logroSeleccionado.value = logro
  nuevoIndicador.value = ''
  dialogIndicador.value = true
}

function agregarIndicador() {
  if (!nuevoIndicador.value.trim() || !logroSeleccionado.value) return
  // Safety check for codigo, defaulting to just index if missing
  const codigoLogro = logroSeleccionado.value.codigo || 'LE.1'
  const logroNum = codigoLogro.replace('LE.', '')
  const indNum = (logroSeleccionado.value.indicadores?.length || 0) + 1
  if (!logroSeleccionado.value.indicadores) logroSeleccionado.value.indicadores = []
  logroSeleccionado.value.indicadores.push({ id: Date.now(), codigo: `IND.${logroNum}.${indNum}`, descripcion: nuevoIndicador.value })
  nuevoIndicador.value = ''
  dialogIndicador.value = false
}

function eliminarIndicador(logro, indicador) {
  logro.indicadores = logro.indicadores.filter(i => i.id !== indicador.id)
  const logroNum = logro.codigo.replace('LE.', '')
  logro.indicadores.forEach((i, idx) => { i.codigo = `IND.${logroNum}.${idx + 1}` })
}

function abrirDialogSecuencia(sec = null) {
  if (sec) {
    editandoSecuencia.value = true
    secuenciaSeleccionada.value = sec
    formSecuencia.value = { ...sec }
  } else {
    editandoSecuencia.value = false
    secuenciaSeleccionada.value = null
    formSecuencia.value = { momento: 'INTRODUCCIÓN', actividad: '', duracion: 10 }
  }
  dialogSecuencia.value = true
}

function guardarSecuencia() {
  if (editandoSecuencia.value && secuenciaSeleccionada.value) {
    const idx = formTema.value.secuencia_didactica.findIndex(s => s.id === secuenciaSeleccionada.value.id)
    if (idx !== -1) formTema.value.secuencia_didactica[idx] = { ...formSecuencia.value }
  } else {
    formTema.value.secuencia_didactica.push({ id: Date.now(), ...formSecuencia.value })
  }
  dialogSecuencia.value = false
}

function eliminarSecuencia(sec) {
  formTema.value.secuencia_didactica = formTema.value.secuencia_didactica.filter(s => s.id !== sec.id)
}

function moverSecuencia(idx, dir) {
  const newIdx = idx + dir
  const temp = formTema.value.secuencia_didactica[idx]
  formTema.value.secuencia_didactica[idx] = formTema.value.secuencia_didactica[newIdx]
  formTema.value.secuencia_didactica[newIdx] = temp
}

function getMomentoClass(m) {
  const map = {
    'INTRODUCCION': 'bg-green-1',
    'RESULTADOS DE APRENDIZAJE/LOGROS ESPERADOS': 'bg-purple-1',
    'CONTENIDOS DE LA CLASE': 'bg-orange-1',
    'CUERPO DE CONTENIDOS': 'bg-blue-1',
    'CONCLUSION O CIERRE': 'bg-red-1'
  }
  return map[m] || 'bg-grey-1'
}
function getMomentoIcon(m) {
  const map = {
    'INTRODUCCION': 'play_circle',
    'RESULTADOS DE APRENDIZAJE/LOGROS ESPERADOS': 'emoji_events',
    'CONTENIDOS DE LA CLASE': 'list_alt',
    'CUERPO DE CONTENIDOS': 'school',
    'CONCLUSION O CIERRE': 'check_circle'
  }
  return map[m] || 'circle'
}
function getMomentoColor(m) {
  const map = {
    'INTRODUCCION': 'green',
    'RESULTADOS DE APRENDIZAJE/LOGROS ESPERADOS': 'purple',
    'CONTENIDOS DE LA CLASE': 'orange',
    'CUERPO DE CONTENIDOS': 'blue',
    'CONCLUSION O CIERRE': 'red'
  }
  return map[m] || 'grey'
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

/* Override Quasar color backgrounds */
.card-main :deep(.bg-green-1),
.card-main :deep(.bg-blue-1),
.card-main :deep(.bg-grey-1),
.card-main :deep(.bg-amber-1),
.card-main :deep(.bg-purple-1),
.card-main :deep(.bg-orange-1),
.card-main :deep(.bg-red-1),
.card-main :deep(.bg-teal-1) {
  background: var(--bg-tertiary) !important;
}

/* Logro Cards */
.logro-card {
  background: var(--bg-tertiary) !important;
  border: 1px solid var(--border-color) !important;
  transition: all 0.3s ease;
}

.logro-card:hover {
  border-color: var(--primary) !important;
  box-shadow: 0 4px 20px var(--shadow-color);
}

.logro-card :deep(.bg-green-1) {
  background: rgba(34, 197, 94, 0.15) !important;
  border-bottom: 1px solid var(--border-color);
}

.logro-card :deep(.q-item) {
  background: transparent !important;
}

/* Content Cards (Conceptual, Procedimental, Actitudinal) */
.card-main :deep(.q-card.flat.bordered) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

.card-main :deep(.q-card .q-card-section.bg-blue-1) {
  background: rgba(59, 130, 246, 0.15) !important;
  border-bottom: 1px solid var(--border-color);
}

.card-main :deep(.q-card .q-card-section.bg-amber-1),
.card-main :deep(.q-card .q-card-section.bg-orange-1) {
  background: rgba(249, 115, 22, 0.15) !important;
  border-bottom: 1px solid var(--border-color);
}

.card-main :deep(.q-card .q-card-section.bg-purple-1) {
  background: rgba(124, 58, 237, 0.15) !important;
  border-bottom: 1px solid var(--border-color);
}

.card-main :deep(.q-card .q-card-section.bg-pink-1),
.card-main :deep(.q-card .q-card-section.bg-red-1) {
  background: rgba(239, 68, 68, 0.15) !important;
  border-bottom: 1px solid var(--border-color);
}

/* List items */
.card-main :deep(.q-list) {
  background: transparent !important;
}

.card-main :deep(.q-item) {
  background: transparent !important;
  color: var(--text-primary);
}

.card-main :deep(.q-item__label) {
  color: var(--text-primary);
}

/* Momento card */
.momento-card {
  background: var(--bg-tertiary) !important;
  border: 1px solid var(--border-color) !important;
  transition: all 0.3s ease;
}

.momento-card:hover {
  border-color: var(--primary) !important;
  box-shadow: 0 4px 20px var(--shadow-color);
}

/* Section Cards */
.section-card {
  background: var(--bg-tertiary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 12px !important;
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

/* Progress bars */
:deep(.q-linear-progress) {
  background: var(--bg-hover) !important;
}

/* Separators */
:deep(.q-separator) {
  background: var(--border-color) !important;
}

/* Empty state boxes */
.card-main :deep(.rounded-borders.bg-grey-1) {
  background: var(--bg-tertiary) !important;
  border: 1px dashed var(--border-color);
}

/* Text colors */
.card-main :deep(.text-grey-6) {
  color: var(--text-muted) !important;
}

.card-main :deep(.text-blue-grey-7) {
  color: var(--text-secondary) !important;
}
</style>
