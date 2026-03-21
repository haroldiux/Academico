<template>
  <q-page class="q-pa-lg">
    <!-- Breadcrumb & Header -->
    <!-- Breadcrumb & Header -->
    <div class="row items-center q-mb-lg animate-in q-col-gutter-y-md">
      <div class="col-12 col-md">
        <q-breadcrumbs class="q-mb-sm">
          <q-breadcrumbs-el icon="home" to="/" />
          <q-breadcrumbs-el :label="breadcrumbInfo.label" :to="breadcrumbInfo.to" />
          <q-breadcrumbs-el :label="codigoVisual" />
        </q-breadcrumbs>
        <h4 class="q-ma-none text-weight-bold" style="line-height: 1.2">
          <q-icon name="menu_book" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">{{ asignatura?.nombre || 'Cargando...' }}</span>
          <q-chip
            v-if="asignatura?.estado"
            :color="asignatura.estado === 'APROBADO' ? 'green-2' : 'orange-2'"
            :text-color="asignatura.estado === 'APROBADO' ? 'green-9' : 'orange-9'"
            class="q-ml-sm text-weight-bold"
            dense
          >
            {{ asignatura.estado === 'APROBADO' ? 'APROBADO' : 'EN PROCESO' }}
          </q-chip>
        </h4>
        <p class="q-ma-none q-mt-xs" style="color: var(--text-secondary)">
          {{ codigoVisual }} - {{ asignatura?.semestre }}° Semestre • {{ nombreCarrera }}
        </p>
        <div class="row items-center q-gutter-sm q-mt-sm">
          <q-chip v-if="nombreSede" outline color="orange" icon="business" dense>
            Sede: {{ nombreSede }}
          </q-chip>
          <q-chip v-if="nombreDocenteCarpeta" outline color="primary" icon="person" dense>
            Docente: {{ nombreDocenteCarpeta }}
          </q-chip>
        </div>
      </div>
      <div class="col-12 col-md-auto row q-gutter-sm justify-end">
        <q-btn
          v-if="puedeAprobarCarpeta"
          :label="asignatura?.estado === 'APROBADO' ? 'Reabrir Carpeta' : 'Aprobar Carpeta'"
          :color="asignatura?.estado === 'APROBADO' ? 'orange' : 'green'"
          :icon="asignatura?.estado === 'APROBADO' ? 'lock_open' : 'check_circle'"
          no-caps
          unelevated
          @click="toggleEstadoCarpeta"
        />

        <!-- Herramientas Dropdown -->
        <q-btn-dropdown outline color="indigo" icon="settings" label="Gestión" no-caps disable>
          <q-list>
            <q-item
              clickable
              v-close-popup
              :to="{ path: `/documentacion/${route.params.id}/planificacion`, query: route.query }"
            >
              <q-item-section avatar
                ><q-icon name="calendar_month" color="indigo"
              /></q-item-section>
              <q-item-section>Planificación Semestral</q-item-section>
            </q-item>

            <q-separator />

            <q-item v-if="puedeImportar" clickable v-close-popup @click="abrirDialogoImportar">
              <q-item-section avatar><q-icon name="upload_file" color="teal" /></q-item-section>
              <q-item-section>Importar Word (Prog. Analítico)</q-item-section>
            </q-item>

            <q-item v-if="puedeImportar" clickable v-close-popup @click="abrirDialogoImportarExcel">
              <q-item-section avatar><q-icon name="table_chart" color="green" /></q-item-section>
              <q-item-section>Importar Excel (Prog. Asignatura)</q-item-section>
            </q-item>

            <q-item
              v-if="puedeImportar"
              clickable
              v-close-popup
              @click="abrirDialogoImportarPlanClase"
            >
              <q-item-section avatar><q-icon name="table_view" color="purple" /></q-item-section>
              <q-item-section>Importar Excel (Plan de Clase)</q-item-section>
            </q-item>

            <q-item
              v-if="puedeImportarPersonal"
              clickable
              v-close-popup
              @click="abrirDialogoImportarPersonal"
            >
              <q-item-section avatar><q-icon name="person_add" color="blue" /></q-item-section>
              <q-item-section>Importar Planificación Personal</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="generarCarpetaHtml">
              <q-item-section avatar><q-icon name="auto_stories" color="green" /></q-item-section>
              <q-item-section>Ver Carpeta (HTML)</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- Botón manual deshabilitado - auto-guardado activo -->
        <!--<q-btn unelevated color="primary" icon="save" label="Guardar" no-caps @click="guardarCambios" />-->
      </div>
    </div>

    <!-- Auto-save Status Indicator (Flotante estilo Google Docs) -->
    <transition name="fade">
      <div v-if="saveStatus !== 'idle'" class="auto-save-indicator">
        <q-chip
          :color="saveStatus === 'saving' ? 'blue-1' : saveStatus === 'saved' ? 'green-1' : 'red-1'"
          :text-color="
            saveStatus === 'saving' ? 'blue-8' : saveStatus === 'saved' ? 'green-8' : 'red-8'
          "
          size="sm"
          dense
        >
          <q-spinner-dots v-if="saveStatus === 'saving'" size="14px" class="q-mr-xs" />
          <q-icon
            v-else-if="saveStatus === 'saved'"
            name="cloud_done"
            size="16px"
            class="q-mr-xs"
          />
          <q-icon v-else-if="saveStatus === 'error'" name="cloud_off" size="16px" class="q-mr-xs" />
          {{
            saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'saved' ? 'Guardado' : 'Error'
          }}
        </q-chip>
      </div>
    </transition>

    <!-- Tabs -->
    <q-card class="card-main">
      <!-- Header dinámico según el tab activo -->
      <div
        class="q-pa-md text-center"
        style="background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)"
      >
        <div
          class="text-h5 text-white text-weight-bold"
          v-if="tabActual === 'datos' || tabActual === 'programa' || tabActual === 'bibliografia'"
        >
          PROGRAMA DE ASIGNATURA (PAC)
        </div>
        <div class="text-h5 text-white text-weight-bold" v-else-if="tabActual === 'unidades'">
          PROGRAMA ANALÍTICO
        </div>
      </div>
      <!-- Tabs: solo icono + etiqueta -->
      <q-tabs
        v-model="tabActual"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
      >
        <q-tab
          v-if="authStore.rol !== 'DOCENTE'"
          name="datos"
          icon="description"
          label="Datos de Asignatura"
          no-caps
        />
        <q-tab
          v-if="authStore.rol !== 'DOCENTE'"
          name="programa"
          icon="assignment"
          label="Programa"
          no-caps
        />
        <q-tab
          v-if="authStore.rol !== 'DOCENTE'"
          name="bibliografia"
          icon="auto_stories"
          label="Bibliografía"
          no-caps
        />
        <q-tab
          v-if="authStore.rol !== 'DOCENTE'"
          name="unidades"
          icon="folder_open"
          label="Unidades de Aprendizaje"
          no-caps
        />
        <q-tab
          v-if="authStore.rol !== 'DOCENTE'"
          name="cronograma"
          icon="calendar_month"
          label="Cronograma de Asignatura"
          no-caps
        />
        <q-tab name="banco" icon="help_outline" label="Banco de Preguntas" no-caps />
      </q-tabs>

      <!-- Strip de progreso oculto a solicitud -->
      <!-- <div class="progress-strip" v-if="asignatura?.indicadores_documentacion">
        ... (contenido oculto)
      </div> -->

      <q-separator />

      <q-tab-panels v-model="tabActual" animated>
        <!-- Tab: Datos de Asignatura -->
        <!-- Tab: Datos de Asignatura -->
        <q-tab-panel name="datos" class="q-pa-lg">
          <q-form class="q-gutter-y-lg">
            <!-- 1. Identificación (Card) -->
            <q-card class="section-card q-mb-lg">
              <q-card-section class="q-pa-lg">
                <div class="row items-center q-mb-md">
                  <div class="text-h6 text-primary text-weight-bold">
                    1.- Identificación de la Asignatura
                  </div>
                </div>

                <!-- Row 1: Header Info -->
                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-12 col-md-5">
                    <q-input
                      :model-value="nombreCarrera"
                      label="Carrera"
                      outlined
                      dense
                      readonly
                      bg-color="white"
                    />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input
                      :model-value="codigoVisual"
                      label="Código"
                      outlined
                      dense
                      readonly
                      bg-color="white"
                      input-class="text-weight-bold"
                    />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input
                      :model-value="(asignatura?.semestre || '') + '°'"
                      label="Semestre"
                      outlined
                      dense
                      readonly
                      bg-color="white"
                    />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-select
                      v-model="formDatos.modalidad"
                      :options="['Presencial', 'Semipresencial', 'Virtual']"
                      label="Modalidad"
                      outlined
                      dense
                      bg-color="white"
                      :readonly="!puedeEditarCampo('datos_generales')"
                    />
                  </div>
                </div>

                <!-- Row 2: Main Subject Info -->
                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="formDatos.nombre"
                      label="Asignatura"
                      outlined
                      dense
                      readonly
                      bg-color="white"
                      input-class="text-weight-bold text-uppercase"
                    />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input
                      v-model="formDatos.tipo_curso"
                      label="Tipo de Curso"
                      outlined
                      dense
                      bg-color="white"
                      :readonly="!puedeEditarCampo('datos_generales')"
                    />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input
                      v-model="formDatos.area_desempenio"
                      label="Área de Desempeño"
                      outlined
                      dense
                      bg-color="white"
                      :readonly="!puedeEditarCampo('datos_generales')"
                    />
                  </div>
                </div>

                <!-- Row 3: Metrics & Reqs -->
                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="formDatos.requisitos"
                      label="Pre-requisito"
                      outlined
                      dense
                      bg-color="white"
                      :readonly="!puedeEditarCampo('datos_generales')"
                    />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input
                      v-model="formDatos.creditos"
                      label="Créditos"
                      outlined
                      dense
                      readonly
                      bg-color="white"
                    />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input
                      :model-value="(formDatos.carga_horaria_total || 0) + ' Horas'"
                      label="Carga Total"
                      outlined
                      dense
                      readonly
                      bg-color="white"
                      input-class="text-weight-bold"
                    />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input
                      v-model="formDatos.horas_detalle"
                      label="Teóricas / Prácticas"
                      outlined
                      dense
                      readonly
                      bg-color="white"
                      input-class="text-weight-bold"
                    />
                  </div>
                </div>

                <!-- Row 4: Config Manual (Dense) -->
                <div class="bg-grey-1 q-pa-sm rounded-borders border-all">
                  <div class="row q-col-gutter-sm items-center">
                    <div class="col-12 col-md-2">
                      <div
                        class="text-caption text-weight-bold text-grey-8 text-center"
                        style="line-height: 1.2"
                      >
                        SESIONES<br />SEMANALES
                      </div>
                    </div>
                    <div class="col-6 col-md-2">
                      <q-input
                        v-model.number="formDatos.sesiones_semanales_teoricas"
                        label="Teóricas"
                        type="number"
                        outlined
                        dense
                        bg-color="white"
                        :readonly="!puedeEditarCampo('datos_generales')"
                      />
                    </div>
                    <div class="col-6 col-md-3">
                      <q-input
                        v-model.number="formDatos.sesiones_semanales_practicas"
                        label="Prácticas"
                        type="number"
                        outlined
                        dense
                        bg-color="white"
                        :readonly="!puedeEditarCampo('datos_generales')"
                      />
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- 2. Docente (Card) -->
            <q-card class="section-card q-mb-lg">
              <q-card-section>
                <div class="row items-center q-mb-md">
                  <q-icon name="person" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-h6 text-primary">2.- Docente Responsable</div>
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-8">
                    <q-input
                      :model-value="nombreDocenteCarpeta || 'Por asignar'"
                      label="NOMBRE DEL DOCENTE"
                      outlined
                      dense
                      readonly
                      bg-color="grey-1"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="formDatos.docente_email"
                      label="EMAIL"
                      outlined
                      dense
                      :readonly="!puedeEditarCampo('datos_generales')"
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  <div class="col-12 col-md-8">
                    <q-input
                      v-model="formDatos.docente_formacion"
                      label="FORMACIÓN"
                      outlined
                      dense
                      :readonly="!puedeEditarCampo('datos_generales')"
                      placeholder="Grados académicos..."
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="formDatos.docente_telefono"
                      label="TELÉFONO"
                      outlined
                      dense
                      :readonly="!puedeEditarCampo('datos_generales')"
                      placeholder="Celular / Teléfono"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- 3. Justificación (Card) -->
            <q-card class="section-card q-mb-lg">
              <q-card-section>
                <div class="row items-center q-mb-md">
                  <q-icon name="lightbulb" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-h6 text-primary">3.- Justificación</div>
                </div>
                <q-input
                  v-model="formDatos.justificacion"
                  label="JUSTIFICACIÓN"
                  type="textarea"
                  rows="5"
                  outlined
                  :readonly="!puedeEditarCampo('justificacion')"
                  placeholder="Describa la relevancia de esta asignatura en el plan de estudios..."
                />
              </q-card-section>
            </q-card>

            <!-- 4. Propósito (Card) -->
            <q-card class="section-card q-mb-lg">
              <q-card-section>
                <div class="row items-center q-mb-md">
                  <q-icon name="flag" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-h6 text-primary">4.- Propósito General</div>
                </div>
                <q-input
                  v-model="formDatos.objetivo_general"
                  label="PROPÓSITO GENERAL"
                  type="textarea"
                  rows="4"
                  outlined
                  :readonly="!puedeEditarCampo('objetivo_general')"
                  placeholder="Defina el propósito central y las metas de formación..."
                />
              </q-card-section>
            </q-card>
          </q-form>
        </q-tab-panel>
        <!-- Tab: Programa de Asignatura -->
        <q-tab-panel name="programa" class="q-pa-lg">
          <q-form class="q-gutter-y-xl">
            <!-- 5. Competencias (Card) -->
            <q-card class="section-card q-mb-lg">
              <q-card-section>
                <div class="row items-center q-mb-md">
                  <q-icon name="emoji_events" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-h6 text-primary">5.- Competencias</div>
                </div>
                <div class="row q-col-gutter-lg">
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="formPrograma.competencia_global"
                      label="COMPETENCIA GLOBAL ESPECÍFICA"
                      type="textarea"
                      rows="6"
                      outlined
                      :readonly="!puedeEditarCampo()"
                      placeholder="Describa la competencia global..."
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="formPrograma.competencia_unidad"
                      label="UNIDAD DE COMPETENCIA ESPECÍFICA"
                      type="textarea"
                      rows="6"
                      outlined
                      :readonly="!puedeEditarCampo()"
                      placeholder="Describa la unidad de competencia..."
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- 6. Elementos (Card) -->
            <q-card class="section-card q-mb-lg">
              <q-card-section>
                <div class="row items-center q-mb-md">
                  <q-icon name="list_alt" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-h6 text-primary">6.- Elementos de Competencia</div>
                </div>

                <div v-if="asignatura?.unidades?.length" class="q-gutter-y-md">
                  <div
                    v-for="unidad in asignatura.unidades"
                    :key="unidad.id"
                    class="relative-position"
                  >
                    <q-input
                      v-model="unidad.elemento_competencia"
                      :label="`ELEMENTO DE COMPETENCIA (UNIDAD ${unidad.numero})`"
                      type="textarea"
                      rows="2"
                      outlined
                      :readonly="!puedeEditarCampo()"
                      placeholder="Describa el elemento de competencia de esta unidad..."
                      @blur="guardarElementoCompetencia(unidad)"
                    >
                      <template v-slot:prepend>
                        <q-badge color="primary" text-color="white" :label="unidad.numero" />
                      </template>
                    </q-input>
                  </div>
                </div>
                <div v-else class="text-center q-pa-lg text-grey-7 bg-grey-1 rounded-borders">
                  <q-icon name="info" size="24px" class="q-mb-xs" />
                  <div>Las unidades de aprendizaje definen los elementos de competencia.</div>
                  <div class="text-caption">
                    Configure las unidades en la pestaña correspondiente.
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- 8. Metodología (Card) -->
            <q-card class="section-card q-mb-lg">
              <q-card-section>
                <div class="row items-center q-mb-md">
                  <q-icon name="psychology" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-h6 text-primary">8.- Metodología General</div>
                </div>
                <div class="q-gutter-y-md">
                  <q-input
                    v-model="formPrograma.metodologia_aula"
                    label="EN EL AULA"
                    type="textarea"
                    rows="3"
                    outlined
                    :readonly="!puedeEditarCampo()"
                    placeholder="Describa la metodología en aula..."
                  />

                  <q-input
                    v-model="formPrograma.metodologia_simulacion"
                    label="CENTRO DE SIMULACIÓN Y/O LABORATORIO"
                    type="textarea"
                    rows="2"
                    outlined
                    :readonly="!puedeEditarCampo()"
                    placeholder="Describa la metodología en simulación..."
                  />

                  <q-input
                    v-model="formPrograma.metodologia_hospital"
                    label="HOSPITAL Y CENTROS DE SALUD (Si corresponde)"
                    type="textarea"
                    rows="2"
                    outlined
                    :readonly="!puedeEditarCampo()"
                    placeholder="Describa la metodología en centros de salud..."
                  />
                </div>
              </q-card-section>
            </q-card>

            <!-- 9. Evaluación (Card REFORMULADO) -->
            <q-card class="section-card q-mb-lg">
              <q-card-section>
                <div class="row items-center q-mb-md">
                  <q-icon name="assignment_turned_in" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-h6 text-primary">9.- Sistema de Evaluación</div>
                </div>

                <div class="q-gutter-y-lg">
                  <!-- Bloque 1: Intro -->
                  <q-input
                    v-model="formPrograma.sistema_evaluacion.intro"
                    label="PROCESO EVALUADOR (INTRODUCCIÓN)"
                    type="textarea"
                    rows="3"
                    outlined
                    :readonly="!puedeEditarCampo()"
                    placeholder="El proceso evaluador es único..."
                  />

                  <!-- Bloque 2: Fases (Side-by-side) -->
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="formPrograma.sistema_evaluacion.diagnostica"
                        label="EVALUACIÓN DIAGNÓSTICA"
                        type="textarea"
                        rows="5"
                        outlined
                        :readonly="!puedeEditarCampo()"
                        placeholder="a. La evaluación diagnóstica tiene por objeto..."
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="formPrograma.sistema_evaluacion.formativa"
                        label="EVALUACIÓN FORMATIVA"
                        type="textarea"
                        rows="5"
                        outlined
                        :readonly="!puedeEditarCampo()"
                        placeholder="b. La evaluación formativa permitirá medir..."
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="formPrograma.sistema_evaluacion.sumativa"
                        label="EVALUACIÓN SUMATIVA"
                        type="textarea"
                        rows="5"
                        outlined
                        :readonly="!puedeEditarCampo()"
                        placeholder="c. La evaluación sumativa está estrechamente relacionada..."
                      />
                    </div>
                  </div>

                  <!-- Bloque 3: Ponderación -->
                  <q-input
                    v-model="formPrograma.sistema_evaluacion.ponderacion"
                    label="PARÁMETROS Y PONDERACIÓN"
                    type="textarea"
                    rows="4"
                    outlined
                    :readonly="!puedeEditarCampo()"
                    placeholder="La evaluación considera los siguientes parámetros (Parciales, Examen Final)..."
                  />

                  <!-- Bloque 4: Aspectos Finales -->
                  <q-input
                    v-model="formPrograma.sistema_evaluacion.final"
                    label="ASPECTOS DE EVALUACIÓN FINAL"
                    type="textarea"
                    rows="3"
                    outlined
                    :readonly="!puedeEditarCampo()"
                    placeholder="La evaluación final se desarrollará considerando..."
                  />
                </div>
              </q-card-section>
            </q-card>

            <!-- 12. Criterios (Card REFORMULADO) -->
            <q-card class="section-card q-mb-lg">
              <q-card-section>
                <div class="row items-center q-mb-md">
                  <q-icon name="gavel" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-h6 text-primary">
                    12.- Criterios y Normativa de la Asignatura
                  </div>
                </div>

                <div class="q-gutter-y-md">
                  <q-input
                    v-model="formPrograma.reglamento_normativa.clase"
                    label="REGLAMENTO PARA LAS CLASES"
                    type="textarea"
                    rows="5"
                    outlined
                    :readonly="!puedeEditarCampo()"
                    placeholder="1. El ingreso se realizará de manera puntual..."
                  />

                  <q-input
                    v-model="formPrograma.reglamento_normativa.laboratorio"
                    label="NORMAS DE LABORATORIO / PRÁCTICA"
                    type="textarea"
                    rows="4"
                    outlined
                    :readonly="!puedeEditarCampo()"
                    placeholder="Además, en laboratorio tomar en cuenta: (PRÁCTICA PRESENCIAL)..."
                  />
                </div>
              </q-card-section>
            </q-card>
          </q-form>
        </q-tab-panel>

        <!-- Tab: Bibliografía -->
        <q-tab-panel name="bibliografia" class="q-pa-lg">
          <div class="row items-center justify-between q-mb-lg">
            <div class="text-h6 text-weight-bold">
              <q-icon name="auto_stories" color="primary" class="q-mr-sm" />
              Referencias Bibliográficas
            </div>
            <q-btn
              v-if="puedeEditarPlanificacion"
              unelevated
              color="primary"
              icon="add"
              label="Agregar"
              no-caps
              @click="abrirDialogBibliografia()"
            />
            <q-chip v-else outline color="orange" icon="lock" label="Solo lectura (Sede)" dense />
          </div>

          <div v-if="!asignatura?.bibliografias?.length" class="text-center q-pa-xl">
            <q-icon name="menu_book" size="64px" color="grey-5" />
            <p class="text-h6 text-grey-6 q-mt-md">No hay bibliografías registradas</p>
          </div>

          <div v-else>
            <!-- Bibliografía Básica -->
            <div class="biblio-section q-mb-xl" v-if="bibliografiasBasicas.length">
              <div class="biblio-section__header biblio-section__header--basica q-mb-md">
                <q-icon name="star" size="24px" />
                <span class="text-subtitle1 text-weight-bold">Bibliografía Básica</span>
                <q-badge color="blue" text-color="white" class="q-ml-sm">{{
                  bibliografiasBasicas.length
                }}</q-badge>
              </div>
              <div class="row q-col-gutter-md">
                <div
                  v-for="biblio in bibliografiasBasicas"
                  :key="biblio.id"
                  class="col-12 col-md-6"
                >
                  <div class="biblio-card biblio-card--basica">
                    <div class="biblio-card__content">
                      <div class="biblio-card__title">{{ biblio.titulo }}</div>
                      <div class="biblio-card__author" v-if="biblio.autor">{{ biblio.autor }}</div>
                      <div class="biblio-card__details" v-if="biblio.editorial || biblio.anio">
                        {{ biblio.editorial }}{{ biblio.edicion ? ', ' + biblio.edicion : ''
                        }}{{ biblio.anio ? ' (' + biblio.anio + ')' : '' }}
                      </div>
                    </div>
                    <div class="biblio-card__actions" v-if="puedeEditarPlanificacion">
                      <q-btn
                        flat
                        round
                        dense
                        icon="edit"
                        size="sm"
                        color="orange"
                        @click="abrirDialogBibliografia(biblio)"
                      />
                      <q-btn
                        flat
                        round
                        dense
                        icon="delete"
                        size="sm"
                        color="red"
                        @click="eliminarBibliografia(biblio)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bibliografía Complementaria -->
            <div class="biblio-section" v-if="bibliografiasComplementarias.length">
              <div class="biblio-section__header biblio-section__header--complementaria q-mb-md">
                <q-icon name="library_books" size="24px" />
                <span class="text-subtitle1 text-weight-bold">Bibliografía Complementaria</span>
                <q-badge color="grey" text-color="white" class="q-ml-sm">{{
                  bibliografiasComplementarias.length
                }}</q-badge>
              </div>
              <div class="row q-col-gutter-md">
                <div
                  v-for="biblio in bibliografiasComplementarias"
                  :key="biblio.id"
                  class="col-12 col-md-6"
                >
                  <div class="biblio-card biblio-card--complementaria">
                    <div class="biblio-card__content">
                      <div class="biblio-card__title">{{ biblio.titulo }}</div>
                      <div class="biblio-card__author" v-if="biblio.autor">{{ biblio.autor }}</div>
                      <div class="biblio-card__details" v-if="biblio.editorial || biblio.anio">
                        {{ biblio.editorial }}{{ biblio.edicion ? ', ' + biblio.edicion : ''
                        }}{{ biblio.anio ? ' (' + biblio.anio + ')' : '' }}
                      </div>
                    </div>
                    <div class="biblio-card__actions" v-if="puedeEditarPlanificacion">
                      <q-btn
                        flat
                        round
                        dense
                        icon="edit"
                        size="sm"
                        color="orange"
                        @click="abrirDialogBibliografia(biblio)"
                      />
                      <q-btn
                        flat
                        round
                        dense
                        icon="delete"
                        size="sm"
                        color="red"
                        @click="eliminarBibliografia(biblio)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bibliografía Programa Analítico (API Externa) -->
            <div class="biblio-section q-mt-xl" v-if="bibliografiasProgramaAnalitico.length">
              <div class="biblio-section__header biblio-section__header--api q-mb-md">
                <q-icon name="cloud_download" size="24px" />
                <span class="text-subtitle1 text-weight-bold">Bibliografía Programa Analítico</span>
                <q-badge color="deep-purple" text-color="white" class="q-ml-sm">{{
                  bibliografiasProgramaAnalitico.length
                }}</q-badge>
                <q-chip size="sm" color="amber-2" text-color="amber-9" class="q-ml-auto">
                  <q-icon name="cloud_sync" size="14px" class="q-mr-xs" />
                  API Externa
                </q-chip>
              </div>
              <div class="row q-col-gutter-md">
                <div
                  v-for="biblio in bibliografiasProgramaAnalitico"
                  :key="biblio.id"
                  class="col-12 col-md-6"
                >
                  <div class="biblio-card biblio-card--api">
                    <div class="biblio-card__content">
                      <div class="biblio-card__title">{{ biblio.titulo }}</div>
                      <div
                        class="biblio-card__author"
                        v-if="biblio.autor && biblio.autor !== 'Ver descripción'"
                      >
                        {{ biblio.autor }}
                      </div>
                      <div class="biblio-card__details" v-if="biblio.editorial || biblio.anio">
                        {{ biblio.editorial }}{{ biblio.edicion ? ', ' + biblio.edicion : ''
                        }}{{ biblio.anio && biblio.anio !== 0 ? ' (' + biblio.anio + ')' : '' }}
                      </div>
                      <q-chip
                        size="xs"
                        :color="biblio.tipo?.toUpperCase() === 'BASIC' ? 'blue-2' : 'grey-2'"
                        :text-color="biblio.tipo?.toUpperCase() === 'BASIC' ? 'blue-9' : 'grey-7'"
                        class="q-mt-xs"
                      >
                        {{ biblio.tipo?.toUpperCase() === 'BASIC' ? 'Básica' : 'Complementaria' }}
                      </q-chip>
                    </div>
                    <div class="biblio-card__actions">
                      <q-btn
                        flat
                        round
                        dense
                        icon="visibility"
                        size="sm"
                        color="primary"
                        @click="abrirDialogBibliografia(biblio)"
                      >
                        <q-tooltip>Ver detalles</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
              </div>
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
            <div class="row q-gutter-sm">
              <q-btn
                v-if="puedeEditarPlanificacion"
                unelevated
                color="primary"
                icon="add"
                label="Nueva Unidad"
                no-caps
                @click="abrirDialogoUnidad()"
              />
            </div>
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
                  <q-item-label class="text-weight-bold text-subtitle1">{{
                    unidad.titulo
                  }}</q-item-label>
                  <q-item-label caption>
                    {{ unidad.temas?.length || 0 }} temas • {{ unidad.horas }} horas
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-linear-progress
                    :value="calcularProgresoUnidad(unidad) / 100"
                    :color="
                      calcularProgresoUnidad(unidad) >= 80
                        ? 'green'
                        : calcularProgresoUnidad(unidad) >= 50
                          ? 'amber'
                          : 'red'
                    "
                    rounded
                    size="8px"
                    style="width: 100px"
                  />
                  <span class="text-caption q-mt-xs"
                    >{{ calcularProgresoUnidad(unidad) }}% documentado</span
                  >

                  <div class="row items-center">
                    <q-btn
                      v-if="puedeEditarPlanificacion"
                      flat
                      round
                      dense
                      icon="edit"
                      color="primary"
                      @click.stop="abrirDialogoUnidad(unidad)"
                    >
                      <q-tooltip>Editar Unidad</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="puedeEditarPlanificacion"
                      flat
                      round
                      dense
                      icon="delete"
                      color="red"
                      @click.stop="confirmarEliminarUnidad(unidad)"
                    >
                      <q-tooltip>Eliminar Unidad</q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </template>

              <!-- Elemento de Competencia -->
              <q-card flat class="q-mx-lg q-my-md competencia-card">
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <q-icon name="emoji_events" color="primary" class="q-mr-sm" />
                    <span class="text-weight-bold text-primary"
                      >Elemento de Competencia (Unidad {{ unidad.numero }})</span
                    >
                  </div>
                  <q-input
                    v-model="unidad.elemento_competencia"
                    type="textarea"
                    rows="2"
                    outlined
                    dense
                    placeholder="Describe el elemento de competencia para esta unidad..."
                    @blur="guardarElementoCompetencia(unidad)"
                    :readonly="!puedeEditarPlanificacion"
                  />
                </q-card-section>
              </q-card>

              <!-- Lista de Temas -->
              <q-list separator class="q-mx-lg q-mb-md">
                <q-item
                  v-for="(tema, index) in unidad.temas"
                  :key="tema.id"
                  clickable
                  @click="irATema(unidad, tema)"
                  class="rounded-borders q-mb-xs tema-item"
                >
                  <q-item-section avatar>
                    <q-avatar color="orange-2" text-color="orange-9" size="36px">
                      <span class="text-weight-bold">{{ getTemaGlobalIndex(unidad, tema) }}</span>
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ tema.titulo }}</q-item-label>
                    <!-- Mostrar contenidos debajo del tema con formato •contenido -->
                    <q-item-label
                      caption
                      v-if="tema.contenido_items?.length"
                      class="contenido-lista"
                    >
                      <div
                        v-for="(contenido, idx) in tema.contenido_items"
                        :key="idx"
                        class="text-grey-8"
                      >
                        •{{ contenido }}
                      </div>
                    </q-item-label>
                    <q-item-label caption v-else-if="tema.descripcion">
                      <span class="text-grey-8">•{{ tema.descripcion }}</span>
                    </q-item-label>
                    <q-item-label caption class="q-mt-xs">
                      {{ tema.contenido_items?.length || (tema.descripcion ? 1 : 0) }} puntos de
                      contenido • {{ countLogros(tema) }} logros •
                      {{ countIndicadores(tema) }} indicadores
                      <q-icon
                        v-if="!tema.descripcion && !tema.contenido_items?.length"
                        name="warning"
                        color="orange"
                        size="xs"
                        class="q-ml-sm"
                      >
                        <q-tooltip>Falta Contenido</q-tooltip>
                      </q-icon>
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row items-center q-gutter-sm">
                      <q-chip
                        size="sm"
                        :color="
                          calcularProgresoTema(tema) >= 80
                            ? 'green-2'
                            : calcularProgresoTema(tema) >= 50
                              ? 'amber-2'
                              : 'red-2'
                        "
                        :text-color="
                          calcularProgresoTema(tema) >= 80
                            ? 'green-9'
                            : calcularProgresoTema(tema) >= 50
                              ? 'amber-9'
                              : 'red-9'
                        "
                        dense
                      >
                        {{ calcularProgresoTema(tema) }}%
                      </q-chip>

                      <!-- Reordering Buttons -->
                      <template v-if="puedeEditarPlanificacion">
                        <q-btn
                          flat
                          round
                          dense
                          icon="arrow_upward"
                          color="grey-7"
                          size="sm"
                          @click.stop="moverTema(unidad, tema, 'up')"
                          :disable="index === 0"
                        >
                          <q-tooltip>Subir</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          round
                          dense
                          icon="arrow_downward"
                          color="grey-7"
                          size="sm"
                          @click.stop="moverTema(unidad, tema, 'down')"
                          :disable="index === unidad.temas.length - 1"
                        >
                          <q-tooltip>Bajar</q-tooltip>
                        </q-btn>

                        <q-btn
                          flat
                          round
                          dense
                          icon="edit"
                          color="primary"
                          size="sm"
                          @click.stop="abrirDialogoTema(unidad, tema)"
                        >
                          <q-tooltip>Editar Título</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          round
                          dense
                          icon="delete"
                          color="red"
                          size="sm"
                          @click.stop="confirmarEliminarTema(tema)"
                        >
                          <q-tooltip>Eliminar Tema</q-tooltip>
                        </q-btn>
                      </template>
                    </div>
                  </q-item-section>
                </q-item>

                <div class="row justify-center q-mb-md" v-if="puedeEditarPlanificacion">
                  <q-btn
                    outline
                    color="primary"
                    icon="add"
                    label="Nuevo Tema"
                    size="sm"
                    @click.stop="abrirDialogoTema(unidad)"
                  />
                </div>
              </q-list>
            </q-expansion-item>
          </q-list>
        </q-tab-panel>

        <!-- Tab: Cronograma de Asignatura (redirige automáticamente) -->
        <q-tab-panel name="cronograma" class="q-pa-lg">
          <div class="text-center q-pa-xl">
            <q-spinner-dots color="primary" size="40px" />
            <p class="text-grey-6 q-mt-md">Redirigiendo a Planificación Semestral...</p>
          </div>
        </q-tab-panel>

        <!-- ============================================================ -->
        <!-- Tab: Banco de Preguntas -->
        <!-- ============================================================ -->
        <q-tab-panel name="banco" class="q-pa-none">
          <!-- ── Header principal ── -->
          <div class="banco-header">
            <div>
              <div class="text-h6 text-weight-bold text-white">
                <q-icon name="help_outline" class="q-mr-sm" />Banco de Preguntas
              </div>
            </div>
            <div class="row q-gutter-sm">
              <q-btn
                outline
                color="white"
                icon="download"
                label="Descargar Excel Base"
                no-caps
                @click="descargarFormatoBanco"
              />
              <q-btn
                unelevated
                color="white"
                text-color="deep-purple-9"
                icon="upload_file"
                label="Subir Banco (Excel)"
                no-caps
                @click="showSubirBanco = true"
              />
            </div>
          </div>

          <div class="q-px-lg q-pb-lg">
            <!-- Apartado Estratégico: Fechas de Exámenes (Oculto temporalmente a petición) -->
            <q-card
              v-if="false && examenesAsignatura.length > 0"
              flat
              bordered
              class="q-mb-md border-primary rounded-borders bg-blue-grey-1"
            >
              <q-card-section class="bg-primary text-white q-pa-sm row items-center shadow-1">
                <q-icon name="event" size="20px" class="q-mr-sm" />
                <span class="text-weight-bold text-subtitle2">Fechas de Exámenes Programadas</span>
              </q-card-section>

              <q-card-section class="q-pa-md row q-col-gutter-md justify-center">
                <div
                  v-for="(examen, idx) in examenesAsignatura"
                  :key="idx"
                  class="col-12 col-sm-6 col-md-3"
                >
                  <q-card
                    class="bg-white column justify-between items-center shadow-2 full-height"
                    style="border-radius: 8px"
                  >
                    <q-card-section class="q-pa-sm text-center full-width bg-indigo-1">
                      <div class="text-caption text-indigo-9 text-uppercase text-weight-bolder">
                        {{ examen.tipo_examen }}
                      </div>
                    </q-card-section>
                    <q-separator />
                    <q-card-section class="q-pa-sm text-center full-width">
                      <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-xs">
                        <q-icon name="calendar_today" size="xs" color="indigo-4" class="q-mr-xs" />
                        {{ formatoFecha(examen.fecha) }}
                      </div>
                      <div class="text-caption text-grey-7">
                        <q-icon name="schedule" size="xs" color="grey-5" class="q-mr-xs" />
                        {{ examen.hora_inicio }} - {{ examen.hora_fin }}
                      </div>
                      <div class="text-caption text-orange-9" v-if="examen.semana">
                        Semana {{ examen.semana }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </q-card-section>
              <q-inner-loading :showing="cargandoExamenes" />
            </q-card>

            <q-banner class="bg-amber-1 text-amber-10 q-mb-md border-amber" rounded dense>
              <template v-slot:avatar><q-icon name="warning" color="amber-10" /></template>
              <strong>Método de Registro:</strong> Actualmente las preguntas se registran
              exclusivamente mediante la <strong>importación masiva desde Excel</strong> para
              garantizar el formato oficial.
            </q-banner>

            <q-banner class="bg-indigo-1 text-indigo-9 q-mb-md" rounded dense>
              <template v-slot:avatar><q-icon name="info" /></template>
              1. <strong>Descarga el formato Excel</strong> y procede a completarlo con las
              preguntas adecuadas según tu criterio (15 de dificultad fácil, 30 de dificultad media
              y 15 difíciles). <br />
              2. Una vez que el archivo esté completo, utiliza el botón
              <strong>"Subir Banco"</strong>
              para cargarlo al sistema.
            </q-banner>

            <!-- Resumen del banco -->
            <div class="row justify-end q-mb-md">
              <q-chip color="deep-purple-1" text-color="deep-purple-9" icon="format_list_numbered">
                {{ preguntasFiltradas.length }} preguntas en total
              </q-chip>
            </div>

            <!-- Lista de preguntas -->
            <div
              v-if="preguntasFiltradas.length === 0"
              class="text-center q-pa-xl bg-grey-1 rounded-borders"
            >
              <q-icon name="quiz" size="56px" color="grey-4" />
              <p class="text-h6 text-grey-6 q-mt-md">No hay preguntas registradas</p>
              <p class="text-caption text-grey-5">
                Sube un banco en formato Excel para visualizar las preguntas aquí
              </p>
            </div>

            <div v-else class="q-gutter-sm">
              <q-card
                v-for="(pregunta, idx) in preguntasFiltradas"
                :key="pregunta.id"
                flat
                bordered
                class="pregunta-card"
              >
                <q-card-section>
                  <div class="row items-start">
                    <q-badge color="deep-purple" :label="idx + 1" class="q-mr-sm q-mt-xs" />
                    <div class="col">
                      <div class="row items-center q-gutter-xs q-mb-xs">
                        <q-chip
                          :color="getDificultadColor(pregunta.dificultad)"
                          text-color="white"
                          size="xs"
                          dense
                          >{{
                            {
                              1: 'Fácil',
                              2: 'Medio',
                              3: 'Difícil',
                            }[pregunta.dificultad] || pregunta.dificultad
                          }}</q-chip
                        >
                        <q-chip
                          v-if="pregunta.parcial"
                          :color="getParcialColorBanco(pregunta.parcial)"
                          text-color="white"
                          size="xs"
                          dense
                          >{{ pregunta.parcial }}</q-chip
                        >
                        <q-chip color="teal-7" text-color="white" size="xs" dense>
                          {{ pregunta.tipo?.replace('_', ' ') }}
                        </q-chip>
                        <q-chip
                          v-if="pregunta.grupoTeorico"
                          color="blue-1"
                          text-color="blue-10"
                          size="sm"
                          icon="school"
                          dense
                          class="text-weight-bold"
                        >
                          GT: {{ pregunta.grupoTeorico }}
                        </q-chip>
                        <q-chip
                          v-if="pregunta.grupo"
                          color="amber-2"
                          text-color="orange-10"
                          size="sm"
                          icon="tag"
                          dense
                          class="text-weight-bolder shadow-1"
                        >
                          Ref: {{ pregunta.grupo }}
                        </q-chip>
                        <q-space />
                        <q-btn
                          flat
                          round
                          dense
                          color="primary"
                          icon="edit"
                          size="sm"
                          @click="abrirEditorPregunta(pregunta)"
                        >
                          <q-tooltip>Editar Pregunta</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          round
                          dense
                          color="red"
                          icon="delete"
                          size="sm"
                          @click="confirmarBorrarPregunta(pregunta)"
                        >
                          <q-tooltip>Eliminar Pregunta</q-tooltip>
                        </q-btn>
                      </div>

                      <div
                        class="text-subtitle1 text-weight-bold q-mb-sm"
                        v-html="pregunta.enunciado"
                      ></div>

                      <!-- Imagen de la pregunta -->
                      <div v-if="pregunta.imagen" class="q-mb-md">
                        <q-img
                          :src="`${api.defaults.baseURL.replace('/api', '')}/storage/preguntas/${pregunta.imagen}`"
                          style="max-width: 300px; border-radius: 8px"
                          class="shadow-1"
                        >
                          <template v-slot:error>
                            <div class="absolute-full flex flex-center bg-negative text-white">
                              Error al cargar imagen
                            </div>
                          </template>
                        </q-img>
                      </div>

                      <div class="opciones-grid">
                        <div
                          v-for="(opc, oidx) in Array.isArray(pregunta.opciones)
                            ? pregunta.opciones
                            : []"
                          :key="oidx"
                          class="opcion-item"
                          :class="{
                            'opcion-correcta': esOpcionCorrecta(pregunta, opc.id),
                          }"
                        >
                          <span class="opcion-letra">{{ opc.id }})</span>
                          <span>{{ opc.text }}</span>
                          <q-icon
                            v-if="esOpcionCorrecta(pregunta, opc.id)"
                            name="check_circle"
                            color="green"
                            size="16px"
                            class="q-ml-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- ============================================================ -->
    <!-- DIALOG: Subir Banco de Preguntas -->
    <!-- ============================================================ -->
    <q-dialog v-model="showSubirBanco" persistent>
      <q-card style="min-width: 620px; max-width: 95vw">
        <div
          class="dialog-header row items-center q-pa-md text-white"
          style="background: linear-gradient(135deg, #4527a0, #7b1fa2)"
        >
          <q-icon name="upload_file" class="q-mr-sm" size="24px" />
          <div class="text-h6 text-white">Subir Banco de Preguntas</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup @click="cerrarDialogImportBanco" />
        </div>

        <q-card-section>
          <!-- Paso 1: Seleccionar archivo -->
          <div v-if="!archivoPreviewBanco">
            <q-banner class="bg-indigo-1 text-indigo-9 q-mb-md" rounded dense>
              <template v-slot:avatar><q-icon name="info" /></template>
              Sube el Excel con el formato oficial. Recuerda que solo se admiten preguntas tipo
              <strong>FV, SS, SM, PR, EM y SP</strong>.
            </q-banner>

            <q-select
              v-model="grupoTeoricoSeleccionado"
              :options="gruposTeoricosOptions"
              outlined
              dense
              label="Seleccionar Grupo Teórico"
              class="q-mb-md"
              hint="Las preguntas se asociarán a este grupo"
              :rules="[(val) => !!val || 'El grupo es obligatorio']"
              emit-value
              map-options
            >
              <template v-slot:prepend><q-icon name="groups" /></template>
            </q-select>

            <q-file
              v-model="archivoBancoFile"
              outlined
              label="Seleccionar archivo Excel (.xlsx)"
              accept=".xlsx,.xls"
              :disable="!grupoTeoricoSeleccionado"
              @update:model-value="previsualizarArchivoExcel"
            >
              <template v-slot:prepend><q-icon name="attach_file" /></template>
              <template v-slot:append>
                <q-icon
                  name="close"
                  v-if="archivoBancoFile"
                  class="cursor-pointer"
                  @click.stop.prevent="archivoBancoFile = null"
                />
              </template>
            </q-file>

            <div class="text-caption text-grey-6 q-mt-sm q-gutter-xs">
              <q-icon name="warning" size="14px" />
              No modifiques los encabezados ni el orden de columnas del formato descargado.
            </div>
          </div>

          <!-- Paso 2: Previsualización -->
          <div v-else>
            <!-- Stats -->
            <div class="import-stats q-mb-md font-mono">
              <q-badge color="deep-purple" class="q-pa-sm">
                Total: {{ preguntasImportadas.length }} preguntas
              </q-badge>
              <q-badge color="green-7" class="q-pa-sm q-ml-sm">
                Fáciles: {{ importStats.faciles || 0 }}
              </q-badge>
              <q-badge color="orange-8" class="q-pa-sm q-ml-sm">
                Medias: {{ importStats.medios || 0 }}
              </q-badge>
              <q-badge color="red-8" class="q-pa-sm q-ml-sm">
                Difíciles: {{ importStats.dificiles || 0 }}
              </q-badge>
            </div>

            <!-- Validación de mínimos -->
            <q-banner
              v-if="importStats.total > 0 && !validacionDistribucion"
              class="bg-orange-1 text-orange-10 q-mb-md border-orange"
              rounded
              dense
            >
              <template v-slot:avatar><q-icon name="warning" /></template>
              <div class="text-weight-bold text-caption">No se cumple el mínimo requerido:</div>
              <div class="text-caption">
                15 Fáciles (Faltan: {{ Math.max(0, 15 - importStats.faciles) }}), 30 Medias (Faltan:
                {{ Math.max(0, 30 - importStats.medios) }}), 15 Difíciles (Faltan:
                {{ Math.max(0, 15 - importStats.dificiles) }}).
              </div>
            </q-banner>

            <q-banner
              v-if="importStats.total > 0 && validacionDistribucion"
              class="bg-green-1 text-green-10 q-mb-md"
              rounded
              dense
            >
              <template v-slot:avatar><q-icon name="check_circle" /></template>
              <div class="text-weight-bold text-caption">Distribución válida para importar.</div>
            </q-banner>

            <!-- Errores -->
            <q-banner v-if="importErrores.length > 0" class="bg-red-1 text-red-9 q-mb-md" rounded>
              <template v-slot:avatar><q-icon name="error" /></template>
              <div class="text-weight-bold q-mb-xs">
                {{ importErrores.length }} error(es) en el archivo:
              </div>
              <ul class="q-ma-none q-pl-md">
                <li v-for="(err, i) in importErrores.slice(0, 5)" :key="i" class="text-caption">
                  {{ err }}
                </li>
                <li v-if="importErrores.length > 5" class="text-caption text-weight-bold">
                  ... y {{ importErrores.length - 5 }} más
                </li>
              </ul>
            </q-banner>

            <!-- Previsualización 5 primeras -->
            <div class="text-subtitle2 q-mb-xs">
              <q-icon name="preview" color="indigo" class="q-mr-xs" />
              Vista previa (primeras {{ Math.min(5, preguntasImportadas.length) }}):
            </div>
            <div class="preview-list q-mb-md">
              <div v-for="(p, i) in preguntasImportadas.slice(0, 5)" :key="i" class="preview-item">
                <div class="row items-center q-gutter-xs q-mb-xs">
                  <q-chip :color="getChipColorTipo(p.tipo)" text-color="white" size="xs" dense>
                    {{
                      {
                        opcion_multiple: 'Múltiple',
                        emparejamiento: 'Emparejar',
                        problema: 'Problema',
                        sub_pregunta: 'Subpreg.',
                      }[p.tipo] || p.tipo
                    }}
                  </q-chip>
                  <q-chip
                    v-if="p.grupo || p.grupo_id"
                    color="grey-3"
                    text-color="grey-8"
                    size="xs"
                    dense
                    >{{ p.grupo || p.grupo_id }}</q-chip
                  >
                  <q-chip
                    :color="getDificultadColor(p.dificultad)"
                    text-color="white"
                    size="xs"
                    dense
                    >{{ p.dificultad }}</q-chip
                  >
                  <q-chip color="blue-1" text-color="blue-9" size="xs" dense v-if="p.respuesta">
                    ✓ {{ p.respuesta }}
                  </q-chip>
                </div>
                <div class="text-body2 preview-texto" v-html="p.enunciado"></div>
              </div>
            </div>

            <!-- Aviso de Reemplazo Forzado -->
            <q-separator class="q-mb-md" />
            <q-banner class="bg-red-1 text-red-10" rounded dense>
              <template v-slot:avatar><q-icon name="warning" /></template>
              <div class="text-weight-bold">Aviso Importante</div>
              <div class="text-caption">
                Esta importación <b>reemplazará</b> todo el banco de preguntas actual de la
                asignatura. Cualquier pregunta registrada previamente será eliminada.
              </div>
            </q-banner>

            <q-btn
              flat
              size="sm"
              color="grey"
              icon="swap_horiz"
              label="Cambiar archivo"
              class="q-mt-sm"
              @click="
                () => {
                  archivoPreviewBanco = null
                  archivoBancoFile = null
                  preguntasImportadas = []
                  importErrores = []
                }
              "
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="cerrarDialogImportBanco" />
          <q-btn
            v-if="archivoPreviewBanco"
            unelevated
            color="deep-purple"
            icon="upload"
            :label="`Importar ${preguntasImportadas.length} pregunta(s)`"
            :disable="
              preguntasImportadas.length === 0 ||
              !validacionDistribucion ||
              !grupoTeoricoSeleccionado
            "
            :loading="importandoBanco"
            @click="confirmarImportacionBanco"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ============================================================ -->
    <!-- DIALOG: Configurar Parámetros del Formato -->
    <!-- ============================================================ -->

    <!-- Dialog Bibliografía -->
    <q-dialog v-model="dialogBibliografia" persistent>
      <q-card style="width: 550px; max-width: 95vw; border-radius: 16px">
        <div class="dialog-header">
          <div class="dialog-header-title">
            <q-icon name="auto_stories" size="28px" />
            {{ editandoBiblio ? 'Editar Bibliografía' : 'Nueva Bibliografía' }}
          </div>
        </div>
        <q-card-section class="q-pt-lg">
          <q-form class="q-gutter-y-md">
            <q-input v-model="formBiblio.titulo" label="Título" outlined dense class="full-width" />
            <q-input
              v-model="formBiblio.autor"
              label="Autor(es)"
              outlined
              dense
              class="full-width"
            />

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  v-model="formBiblio.editorial"
                  label="Editorial"
                  outlined
                  dense
                  class="full-width"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="formBiblio.edicion"
                  label="Edición"
                  outlined
                  dense
                  class="full-width"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  v-model.number="formBiblio.anio"
                  label="Año"
                  type="number"
                  outlined
                  dense
                  class="full-width"
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="formBiblio.tipo"
                  label="Tipo"
                  :options="[
                    { label: 'Principal', value: 'principal' },
                    { label: 'Complementario', value: 'complementario' },
                  ]"
                  emit-value
                  map-options
                  outlined
                  dense
                  class="full-width"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="formBiblio.isbn"
                  label="ISBN (Opcional)"
                  outlined
                  dense
                  class="full-width"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="formBiblio.paginas"
                  label="Páginas (ej: 100-150) (Opcional)"
                  outlined
                  dense
                  class="full-width"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
        <div class="dialog-actions">
          <q-btn flat label="Cancelar" color="grey" @click="dialogBibliografia = false" no-caps />
          <q-btn unelevated label="Guardar" color="primary" @click="guardarBibliografia" no-caps />
        </div>
      </q-card>
    </q-dialog>

    <!-- Dialog Importar Word -->
    <q-dialog v-model="dialogImportar">
      <q-card style="width: 100%; max-width: 500px; border-radius: 12px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold row items-center">
            <q-icon name="upload_file" color="teal" class="q-mr-sm" size="28px" />
            Importar Programa Analítico (Formato Oficial Sede Central)
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-banner rounded class="bg-amber-1 text-black q-mb-md">
            <template v-slot:avatar>
              <q-icon name="warning" color="warning" />
            </template>
            <div class="text-weight-bold">¡Atención! Utilice la Plantilla Oficial</div>
            <div>
              Esta función requiere estrictamente el
              <strong>Documento Word Oficial de Programa de Asignatura</strong>
              proporcionado por Sede Central.
              <br />
              <br />
              <strong>Nota:</strong> Otros formatos o documentos modificados estructuralmente no
              serán procesados correctamente.
            </div>
          </q-banner>

          <q-file
            v-model="archivoImportar"
            label="Seleccionar Plantilla Oficial Word (.docx)"
            outlined
            dense
            accept=".docx, .doc"
            counter
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <div class="q-mt-md q-gutter-sm bg-grey-1 q-pa-sm rounded-borders">
            <div class="text-subtitle2 text-weight-bold q-mb-xs">¿Qué desea importar?</div>
            <div class="row">
              <q-checkbox
                class="col-12"
                v-model="importOpciones.unidades"
                label="Programa Analítico (Unidades, Temas y Contenidos)"
                dense
                color="teal"
              />
            </div>
            <div class="text-caption text-grey-7 q-pl-sm">
              * La bibliografía se actualizará automáticamente con el Programa Analítico.
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none q-pb-md q-pr-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup no-caps />
          <q-btn
            unelevated
            label="Procesar Importación"
            color="teal"
            :loading="store.loading"
            :disable="!archivoImportar"
            @click="procesarImportacion"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Importar Excel -->
    <q-dialog v-model="dialogImportarExcel">
      <q-card style="width: 500px; max-width: 95vw; border-radius: 12px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold row items-center">
            <q-icon name="table_chart" color="green" class="q-mr-sm" size="28px" />
            Importar Programa de Asignatura (Excel)
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-banner rounded class="bg-indigo-1 text-black q-mb-md">
            <template v-slot:avatar>
              <q-icon name="info" color="indigo" />
            </template>
            <div class="text-weight-bold">Importación de Metadatos</div>
            <div>
              Esta función carga los datos generales del programa (Justificación, Objetivos,
              Competencias, Metodología, etc.) desde un archivo Excel.
            </div>
          </q-banner>

          <q-file
            v-model="archivoImportarExcel"
            label="Seleccionar Archivo Excel (.xlsx, .xls)"
            outlined
            dense
            accept=".xlsx, .xls"
            counter
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <div class="q-mt-md text-caption text-grey-7 italic">
            * El archivo debe contener las etiquetas exactas en la primera columna (ej: Modalidad,
            Justificación, Propósito General, etc.)
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none q-pb-md q-pr-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup no-caps />
          <q-btn
            unelevated
            label="Subir e Importar"
            color="green"
            :loading="store.loading"
            :disable="!archivoImportarExcel"
            @click="procesarImportacionExcel"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Dialog Importar Plan de Clase -->
    <q-dialog v-model="dialogImportarPlanClase">
      <q-card style="width: 500px; max-width: 95vw; border-radius: 12px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold row items-center">
            <q-icon name="table_view" color="purple" class="q-mr-sm" size="28px" />
            Importar Plan de Clase (Excel)
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-banner rounded class="bg-purple-1 text-black q-mb-md">
            <template v-slot:avatar>
              <q-icon name="info" color="purple" />
            </template>
            <div class="text-weight-bold">Importación de Unidades y Temas</div>
            <div>
              Esta función carga la planificación detallada (unidades, temas, contenidos,
              estrategias) desde un archivo Excel.
            </div>
          </q-banner>

          <q-file
            v-model="archivoImportarPlanClase"
            label="Seleccionar Archivo Excel (.xlsx, .xls)"
            outlined
            dense
            accept=".xlsx, .xls"
            counter
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <div class="q-mt-md text-caption text-grey-7 italic">
            * Se espera que el archivo contenga hojas con el formato de Avance Programático o Plan
            de Clase.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none q-pb-md q-pr-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup no-caps />
          <q-btn
            unelevated
            label="Subir e Importar"
            color="purple"
            :loading="store.loading"
            :disable="!archivoImportarPlanClase"
            @click="procesarImportacionPlanClase"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOG: Editar Pregunta -->
    <q-dialog v-model="dialogEditarPregunta" persistent>
      <q-card style="width: 700px; max-width: 95vw; border-radius: 16px">
        <div class="q-pa-md bg-deep-purple text-white row items-center">
          <q-icon name="edit" size="24px" class="q-mr-sm" />
          <div class="text-h6">Editar Pregunta</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </div>

        <q-card-section class="q-pa-lg scroll" style="max-height: 70vh">
          <q-form ref="formEditarPregRef" class="q-gutter-y-md">
            <!-- Enunciado -->
            <q-input
              v-model="formPregunta.enunciado"
              label="Enunciado de la Pregunta"
              type="textarea"
              outlined
              autogrow
              rows="3"
            />

            <!-- Imagen Actual / Nueva -->
            <div class="row q-col-gutter-md items-center">
              <div class="col-12 col-sm-6">
                <q-file
                  v-model="archivoImagenPregunta"
                  label="Adjuntar/Cambiar Imagen"
                  outlined
                  dense
                  accept="image/*"
                  counter
                >
                  <template v-slot:prepend>
                    <q-icon name="image" />
                  </template>
                </q-file>
              </div>
              <div
                class="col-12 col-sm-6 text-center"
                v-if="formPregunta.imagen || previewImagenEdit"
              >
                <div class="text-caption text-grey-7 q-mb-xs">Previsualización:</div>
                <q-img
                  :src="
                    previewImagenEdit ||
                    `${api.defaults.baseURL.replace('/api', '')}/storage/preguntas/${formPregunta.imagen}`
                  "
                  style="height: 100px; max-width: 150px; border-radius: 4px"
                  fit="contain"
                  class="bg-grey-2"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-select
                  v-model="formPregunta.tipo"
                  label="Tipo de Pregunta"
                  outlined
                  dense
                  :options="[
                    { label: 'Selección Única', value: 'SELECCION_UNICA' },
                    { label: 'Selección Múltiple', value: 'SELECCION_MULTIPLE' },
                    { label: 'Falso/Verdadero', value: 'FALSO_VERDADERO' },
                    { label: 'Problema (PR)', value: 'PR' },
                    { label: 'Emparejamiento (EM)', value: 'EM' },
                    { label: 'Subpregunta (SP)', value: 'SP' },
                  ]"
                  emit-value
                  map-options
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="formPregunta.dificultad"
                  label="Dificultad"
                  outlined
                  dense
                  :options="[
                    { label: 'Fácil', value: '1' },
                    { label: 'Medio', value: '2' },
                    { label: 'Difícil', value: '3' },
                  ]"
                  emit-value
                  map-options
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  v-model="formPregunta.parcial"
                  label="Parcial (1P, 2P, EF, 2I)"
                  outlined
                  dense
                />
              </div>
              <div class="col-6">
                <q-input v-model="formPregunta.grupo" label="Grupo/Referencia" outlined dense />
              </div>
            </div>

            <!-- Opciones (Si aplica) -->
            <div
              v-if="
                ['SELECCION_UNICA', 'SELECCION_MULTIPLE', 'SP', 'FALSO_VERDADERO'].includes(
                  formPregunta.tipo,
                )
              "
            >
              <div class="text-subtitle2 q-mb-sm">Opciones de Respuesta</div>
              <div class="q-gutter-y-xs">
                <div
                  v-for="(op, i) in formPregunta.opciones"
                  :key="i"
                  class="row items-center q-gutter-x-sm"
                >
                  <q-avatar size="sm" color="grey-3" text-color="grey-8" font-size="12px">{{
                    String.fromCharCode(65 + i)
                  }}</q-avatar>
                  <q-input v-model="formPregunta.opciones[i]" dense outlined class="col" />
                  <q-checkbox
                    v-model="formPregunta.respuesta_correcta"
                    :val="String.fromCharCode(65 + i)"
                    label="Correcta"
                    v-if="formPregunta.tipo === 'SELECCION_MULTIPLE'"
                  />
                  <q-radio
                    v-model="formPregunta.respuesta_correcta"
                    :val="String.fromCharCode(65 + i)"
                    label="Correcta"
                    v-else
                  />
                </div>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup no-caps />
          <q-btn
            unelevated
            label="Guardar Cambios"
            color="deep-purple"
            icon="save"
            :loading="guardandoEditPreg"
            @click="guardarEdicionPregunta"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Importar Planificación Personal -->
    <q-dialog v-model="dialogImportarPersonal">
      <q-card style="width: 500px; max-width: 95vw; border-radius: 12px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold row items-center">
            <q-icon name="person_add" color="blue" class="q-mr-sm" size="28px" />
            Importar Planificación Personal
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-banner rounded class="bg-blue-1 text-black q-mb-md">
            <template v-slot:avatar>
              <q-icon name="info" color="blue" />
            </template>
            <div class="text-weight-bold">Importación de Datos Propios</div>
            <div class="q-mt-xs">
              Esta función permite cargar sus estrategias, evaluaciones y secuencia didáctica desde
              Excel.
              <strong>Los datos existentes para sus temas serán actualizados.</strong>
            </div>
          </q-banner>

          <div class="q-mb-md">
            <q-btn
              flat
              color="primary"
              icon="download"
              label="Descargar Plantilla Excel"
              class="full-width"
              @click="descargarPlantillaPersonal"
              no-caps
            />
          </div>

          <q-file
            v-model="archivoImportarPersonal"
            label="Seleccionar Plantilla Completa (.xlsx)"
            outlined
            dense
            accept=".xlsx"
            counter
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <div class="q-mt-md text-caption text-grey-7 italic">
            * El sistema identifica los temas por el número de Unidad y Tema especificado en el
            Excel.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none q-pb-md q-pr-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup no-caps />
          <q-btn
            unelevated
            label="Subir e Importar"
            color="primary"
            :loading="importandoPersonal"
            :disable="!archivoImportarPersonal"
            @click="procesarImportacionPersonal"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Unidad -->
    <q-dialog v-model="dialogUnidad" persistent>
      <q-card style="width: 400px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ editandoUnidad ? 'Editar Unidad' : 'Nueva Unidad' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="guardarUnidad" class="q-gutter-md">
            <q-input
              v-model.number="formUnidad.numero"
              label="Número"
              type="number"
              outlined
              dense
            />
            <q-input v-model="formUnidad.titulo" label="Título" outlined dense autofocus />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Cancelar" color="grey" v-close-popup no-caps />
              <q-btn
                unelevated
                type="submit"
                label="Guardar"
                color="primary"
                :loading="store.loading"
                no-caps
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog Tema -->
    <q-dialog v-model="dialogTema" persistent>
      <q-card style="width: 600px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ editandoTema ? 'Editar Tema' : 'Nuevo Tema' }}</div>
          <div class="text-caption text-grey" v-if="unidadSeleccionada">
            Unidad {{ unidadSeleccionada.numero }}: {{ unidadSeleccionada.titulo }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="guardarTema" class="q-gutter-md">
            <q-input
              v-model="formTema.titulo"
              label="Título del Tema"
              outlined
              dense
              autofocus
              :rules="[(val) => !!val || 'El título es obligatorio']"
            />

            <!-- Lista de Contenidos -->
            <div class="contenido-list">
              <div class="text-subtitle2 q-mb-sm row items-center">
                <q-icon name="list" class="q-mr-xs" color="primary" />
                <span>Contenido del Tema (Lista de Puntos)</span>
                <q-space />
                <q-chip size="sm" color="grey-3" text-color="grey-8">
                  {{ formTema.contenido_items?.length || 0 }} items
                </q-chip>
              </div>

              <div class="text-caption text-grey-7 q-mb-md">
                Agregue los puntos clave o subtemas que se abordarán en este tema.
              </div>

              <!-- Lista de items existentes -->
              <div v-if="formTema.contenido_items?.length" class="q-gutter-sm q-mb-md">
                <div
                  v-for="(item, index) in formTema.contenido_items"
                  :key="index"
                  class="row items-start q-gutter-sm"
                >
                  <q-badge color="primary" :label="index + 1" class="q-mt-sm" />
                  <q-input
                    v-model="formTema.contenido_items[index]"
                    outlined
                    dense
                    class="col"
                    type="textarea"
                    rows="2"
                    autogrow
                    placeholder="Ej: Principios básicos, definiciones..."
                    :rules="[(val) => !!val?.trim() || 'El contenido no puede estar vacío']"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="red"
                    size="sm"
                    class="q-mt-sm"
                    @click="eliminarContenidoItem(index)"
                  >
                    <q-tooltip>Eliminar item</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <div v-else class="text-center q-pa-md bg-grey-1 rounded-borders q-mb-md">
                <q-icon name="info" size="24px" color="grey-5" />
                <div class="text-caption text-grey-7 q-mt-xs">
                  No hay contenidos agregados. Haga clic en "Agregar Punto" para comenzar.
                </div>
              </div>

              <!-- Botón para agregar nuevo item -->
              <q-btn
                outline
                color="primary"
                icon="add"
                label="Agregar Punto"
                size="sm"
                @click="agregarContenidoItem"
                no-caps
              />
            </div>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Cancelar" color="grey" v-close-popup no-caps />
              <q-btn
                unelevated
                type="submit"
                label="Guardar"
                color="primary"
                :loading="store.loading"
                no-caps
                :disable="!formTema.contenido_items?.length"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { watchDebounced } from '@vueuse/core'
import { useQuasar } from 'quasar'
import { useAsignaturasStore } from 'src/stores/asignaturas'
import { useCarrerasStore } from 'src/stores/carreras'
import { useSedesStore } from 'src/stores/sedes'
import { ROLES } from 'src/stores/auth'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'boot/axios'

// Helpers para contar logros e indicadores (consistente con backend/store)
function countLogros(tema) {
  const logros = tema.logros_esperados || tema.logros || []
  return logros.length
}

function countIndicadores(tema) {
  // Si existe array plano
  if (tema.indicadores_logro?.length) return tema.indicadores_logro.length

  // Si no, contar anidados en logros
  const logros = tema.logros_esperados || tema.logros || []
  return logros.reduce((acc, logro) => acc + (logro.indicadores?.length || 0), 0)
}

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const store = useAsignaturasStore()
const carrerasStore = useCarrerasStore()
const sedesStore = useSedesStore()
const authStore = useAuthStore()

// Estado
// Leer el tab inicial desde los query params (para volver al tab correcto desde TemaEditPage)
// Para docentes, forzar siempre el tab "banco" ya que los demás están ocultos
const tabInicial = (() => {
  if (authStore.rol === 'DOCENTE') return 'banco'
  return route.query.tab &&
    ['datos', 'programa', 'bibliografia', 'unidades', 'cronograma'].includes(route.query.tab)
    ? route.query.tab
    : 'datos'
})()
const tabActual = ref(tabInicial)
const asignatura = computed(() => store.asignaturaActual)

// ── Medición real de tabs para alinear el progress-strip ──

// Banco de preguntas real (desde API)
const bancoPreguntasLocal = ref([])
// Exámenes de la asignatura (desde el rol de exámenes general)
const examenesAsignatura = ref([])
const cargandoExamenes = ref(false)

onMounted(() => {
  cargarBancoPreguntas()
  cargarExamenes()
})

// ── Plan de Clase: calculado igual que por-unidad (garantiza coherencia) ──

// Cargar banco cuando cambie la asignatura (reactividad)
watch(
  () => asignatura.value?.id,
  (newId) => {
    if (newId) {
      cargarBancoPreguntas()
      cargarExamenes()
    }
  },
  { immediate: true },
)

// Watcher para redirigir a PlanificacionPage cuando se selecciona el tab cronograma
watch(tabActual, (newTab) => {
  if (newTab === 'cronograma') {
    // Redirigir a la página de planificación
    router.push({
      path: `/documentacion/${route.params.id}/planificacion`,
      query: route.query,
    })
    // Resetear el tab al anterior para evitar estado inconsistente
    tabActual.value = 'unidades'
  }
})

// Estado de auto-guardado
const saveStatus = ref('idle') // 'idle' | 'saving' | 'saved' | 'error'
let dataLoaded = false // Flag para evitar guardar durante carga inicial
let lastSavedSnapshot = '' // Snapshot del último estado guardado

// Opciones de Importación
const importOpciones = ref({
  datos: false,
  unidades: true,
})

// --- CRUD Unidades & Temas ---
const dialogUnidad = ref(false)
const editandoUnidad = ref(false)
const formUnidad = ref({ id: null, titulo: '', numero: 1, horas: 0 })

const dialogTema = ref(false)
const editandoTema = ref(false)
const unidadSeleccionada = ref(null)
const formTema = ref({
  id: null,
  titulo: '',
  contenido_items: [], // Changed from descripcion to array
  horas_teoricas: 0,
  horas_practicas: 0,
})

// Unidades
function abrirDialogoUnidad(unidad = null) {
  editandoUnidad.value = !!unidad
  if (unidad) {
    formUnidad.value = { ...unidad }
  } else {
    // Calcular siguiente numero
    const nextNum = (asignatura.value?.unidades?.length || 0) + 1
    formUnidad.value = { id: null, titulo: '', numero: nextNum, horas: 0 }
  }
  dialogUnidad.value = true
}

async function guardarUnidad() {
  try {
    if (editandoUnidad.value) {
      await store.updateUnidad(formUnidad.value.id, formUnidad.value)
      $q.notify({ type: 'positive', message: 'Unidad actualizada' })
    } else {
      await store.createUnidad(asignatura.value.id, formUnidad.value)
      $q.notify({ type: 'positive', message: 'Unidad creada' })
    }
    dialogUnidad.value = false
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al guardar unidad' })
  }
}

function confirmarEliminarUnidad(unidad) {
  $q.dialog({
    title: 'Eliminar Unidad',
    message: `¿Estás seguro de eliminar la Unidad ${unidad.numero}: ${unidad.titulo}? Se eliminarán también sus temas.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await store.deleteUnidad(unidad.id)
      $q.notify({ type: 'positive', message: 'Unidad eliminada' })
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Error al eliminar unidad' })
    }
  })
}

// Temas
function abrirDialogoTema(unidad, tema = null) {
  unidadSeleccionada.value = unidad
  editandoTema.value = !!tema
  if (tema) {
    // Migración automática de datos antiguos
    if (tema.descripcion && !tema.contenido_items) {
      // Convertir descripcion (texto libre) a array de items
      const items = tema.descripcion
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

      formTema.value = {
        ...tema,
        contenido_items: items.length > 0 ? items : [''],
      }
    } else {
      formTema.value = {
        ...tema,
        contenido_items:
          tema.contenido_items && tema.contenido_items.length > 0
            ? [...tema.contenido_items]
            : [''], // Al menos un item vacío
      }
    }
  } else {
    formTema.value = {
      id: null,
      titulo: '',
      contenido_items: [''], // Iniciar con un item vacío
      horas_teoricas: 0,
      horas_practicas: 0,
    }
  }
  dialogTema.value = true
}

// Funciones para manejar items de contenido
function agregarContenidoItem() {
  formTema.value.contenido_items.push('')
}

function eliminarContenidoItem(index) {
  if (formTema.value.contenido_items.length > 1) {
    formTema.value.contenido_items.splice(index, 1)
  } else {
    $q.notify({
      type: 'warning',
      message: 'Debe haber al menos un punto de contenido',
      icon: 'warning',
    })
  }
}

async function guardarTema() {
  try {
    if (editandoTema.value) {
      // Nota: updateTema en store actualiza titulo y horas
      await store.updateTema(formTema.value.id, formTema.value)
      $q.notify({ type: 'positive', message: 'Tema actualizado' })
    } else {
      await store.createTema(unidadSeleccionada.value.id, formTema.value)
      $q.notify({ type: 'positive', message: 'Tema creado' })
    }
    dialogTema.value = false
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al guardar tema' })
  }
}

function confirmarEliminarTema(tema) {
  if (!tema || !tema.id) {
    console.error('Tema inválido para eliminar:', tema)
    return
  }
  $q.dialog({
    title: 'Eliminar Tema',
    message: `¿Estás seguro de eliminar el tema "${tema.titulo}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await store.deleteTema(tema.id)
      $q.notify({ type: 'positive', message: 'Tema eliminado' })
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Error al eliminar tema' })
    }
  })
}

async function moverTema(unidad, tema, direction) {
  try {
    await store.moveTema(unidad.id, tema.id, direction)
    // Optimistic update is handled in store, but success notification is nice
    // $q.notify({ type: 'positive', message: 'Orden actualizado', timeout: 500 })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al mover tema' })
  }
}

// Reglas de Negocio para Edición
const esDirectorOAdmin = computed(() => {
  // CORRECCIÓN CRÍTICA: La propiedad del store es 'usuarioActual', no 'usuario'
  const rol = authStore.rol
  // Lista blanca de roles con permisos de edición TOTAL (siempre pueden editar)
  const rolesPermitidos = [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.DIRECTOR_CARRERA,
    ROLES.VICERRECTOR_SEDE,
    ROLES.VICERRECTOR_NACIONAL,
    ROLES.DIRECCION_ACADEMICA, // Added explicit check
  ]
  return rolesPermitidos.includes(rol)
})

const puedeAprobarCarpeta = computed(() => {
  // Solo Directores y Admins pueden aprobar/reabrir
  return esDirectorOAdmin.value
})

const puedeEditarPlanificacion = computed(() => {
  const rol = authStore.rol
  // const esCocha = usuario?.sede_id === 1 // removed specific sede constraint if desired, or keep logic

  // 1. Si está APROBADO, nadie edita (salvo toggle admins)
  if (asignatura.value?.estado === 'APROBADO') return false

  // 2. Global Admins
  if (
    [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.VICERRECTOR_NACIONAL,
      ROLES.DIRECCION_ACADEMICA,
    ].includes(rol)
  ) {
    return true
  }

  // 3. Roles de Sede / Carrera
  if ([ROLES.DIRECTOR_CARRERA, ROLES.VICERRECTOR_SEDE].includes(rol)) {
    // Validar si el usuario pertenece a la misma sede de la asignatura o carrera
    // Por simplicidad, y como piden arreglar acceso:
    return true
  }

  // 4. Docente
  if (rol === ROLES.DOCENTE) {
    const authSede = Number(authStore.usuarioActual?.sede_id)
    // Los docentes de Cochabamba (Sede 1) pueden editar campos compartidos/planificación general
    if (authSede === 1) return true

    // Resto de sedes: No pueden editar campos compartidos
    return false
  }

  return false
})

function puedeEditarCampo() {
  if (asignatura.value?.estado === 'APROBADO') return false

  // Reutilizar la lógica centralizada
  return puedeEditarPlanificacion.value
}

async function toggleEstadoCarpeta() {
  if (!asignatura.value) return
  const nuevoEstado = asignatura.value.estado === 'APROBADO' ? 'EN_PROCESO' : 'APROBADO'
  try {
    await store.cambiarEstado(asignatura.value.id, nuevoEstado)
    $q.notify({
      type: 'positive',
      message: `Carpeta ${nuevoEstado === 'APROBADO' ? 'Aprobada' : 'Reabierta'}`,
    })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' })
  }
}

const nombreDocenteCarpeta = computed(() => {
  if (!asignatura.value || !asignatura.value.docentes || asignatura.value.docentes.length === 0)
    return null

  // 1. Si hay un ID en la URL (seleccionado previamente)
  const docenteIdParam = route.query.docente_id
  if (docenteIdParam) {
    const docente = asignatura.value.docentes.find((d) => d.id == docenteIdParam)
    if (docente) return docente.nombre_completo
  }

  // 2. Si solo hay un docente asignado
  if (asignatura.value.docentes.length === 1) {
    return asignatura.value.docentes[0].nombre_completo
  }

  // 3. Si soy docente (rol), mostrar MI nombre con lógica robusta
  if (authStore.rol === 'DOCENTE') {
    const myDocenteId = authStore.usuarioActual?.docente?.id || authStore.usuarioActual?.docente_id
    const myUserId = authStore.usuarioActual?.id

    // Intento 1: Buscar por ID de docente
    let me = asignatura.value.docentes.find((d) => d.id == myDocenteId)

    // Intento 2: Buscar por ID de usuario (si el objeto docente tiene user_id)
    if (!me && myUserId) {
      me = asignatura.value.docentes.find((d) => d.user_id == myUserId || d.usuario_id == myUserId)
    }

    // Intento 3: Si no encuentro match pero SOY docente, asumimos que soy yo (Fallback visual)
    if (me) return me.nombre_completo

    // Fallback Agresivo: Si soy docente y tengo acceso a esta pagina, mostrar mi nombre del store
    // aunque no esté explícitamente en el array de 'docentes' de la asignatura (casos de sync retardo)
    if (authStore.nombreCompleto) return authStore.nombreCompleto
  }

  // 4. Si hay varios, intentar filtrar por sede del usuario actual (show first match)
  if (authStore.usuarioActual?.sede_id) {
    const matches = asignatura.value.docentes.filter(
      (d) => d.sede_id == authStore.usuarioActual.sede_id,
    )
    if (matches.length > 0) return matches[0].nombre_completo
  }

  // 5. Fallback: mostrar el primer docente disponible
  return asignatura.value.docentes[0].nombre_completo
})

const nombreSede = computed(() => {
  // 0. Prioridad Total: Query Param (Pasado desde el listado)
  if (route.query.nombre_sede) return route.query.nombre_sede
  const querySedeId = route.query.sede_id
  if (querySedeId) {
    const s = sedesStore.sedes.find((x) => x.id == querySedeId)
    if (s) return s.nombre
  }

  // 1. Prioridad: Sede resuelta por el Backend (Contextual: Docente + Asignatura)
  // El backend inyecta 'sede_nombre' basándose en el docente_id de la petición
  if (asignatura.value?.sede_nombre) return asignatura.value.sede_nombre

  // 2. Si es DOCENTE, priorizar SU Sede asignada (Contexto Físico)
  if (authStore.rol === 'DOCENTE' && authStore.usuarioActual?.docente?.sede?.nombre) {
    return authStore.usuarioActual.docente.sede.nombre
  }

  if (!asignatura.value) return null

  // 1. Relación correcta: Array de Carreras (Sync)
  if (asignatura.value.carreras?.length > 0) {
    // Intentar buscar la carrera que coincida con la sede del usuario (si es docente)
    if (authStore.rol === 'DOCENTE') {
      const docenteSedeId = authStore.sedeId
      const carreraSede = asignatura.value.carreras.find((c) => c.sede_id == docenteSedeId)
      if (carreraSede?.sede?.nombre) return carreraSede.sede.nombre
    }

    const c = asignatura.value.carreras[0]
    if (c.sede?.nombre) return c.sede.nombre
    if (c.sede_id) {
      const s = sedesStore.sedes.find((x) => x.id == c.sede_id)
      return s ? s.nombre : null
    }
  }

  // 2. Legacy fallback
  if (asignatura.value.carrera?.sede?.nombre) return asignatura.value.carrera.sede.nombre
  if (asignatura.value.sede?.nombre) return asignatura.value.sede.nombre

  return null
})

const nombreCarrera = computed(() => {
  if (!asignatura.value) return 'N/A'

  // 1. Relación correcta: Array de Carreras (Sync)
  if (asignatura.value.carreras?.length > 0) {
    return asignatura.value.carreras[0].nombre
  }

  // 2. Legacy fallback
  if (asignatura.value.carrera?.nombre) return asignatura.value.carrera.nombre
  if (typeof asignatura.value.carrera === 'string') return asignatura.value.carrera

  return 'N/A'
})

// Computed for Visual Code (Stripping Technical Suffixes)
// Converts "OPT-101-CBA-SON" -> "OPT-101" for display
const codigoVisual = computed(() => {
  if (!asignatura.value?.codigo) return 'Asignatura'
  // Regex to remove -XXX-YYYY suffixes (e.g. -CBA-CARSON)
  // Matches a hyphen followed by 3 uppercase letters, followed by another hyphen and alphanumeric
  return asignatura.value.codigo.replace(/-[A-Z]{3}-[A-Z0-9-]+$/, '')
})

// Computed para bibliografías separadas por tipo
// Bibliografías del Word (tipos en español)
const bibliografiasBasicas = computed(() => {
  if (!asignatura.value?.bibliografias) return []
  return asignatura.value.bibliografias.filter((b) => {
    if (!b.tipo) return false
    const tipo = b.tipo.toUpperCase()
    return tipo === 'BASICA' || tipo === 'PRINCIPAL'
  })
})

const bibliografiasComplementarias = computed(() => {
  if (!asignatura.value?.bibliografias) return []
  return asignatura.value.bibliografias.filter((b) => {
    if (!b.tipo) return false
    const tipo = b.tipo.toUpperCase()
    return tipo === 'COMPLEMENTARIA' || tipo === 'COMPLEMENTARIO'
  })
})

// Bibliografías de la API Externa (Programa Analítico - tipos en inglés)
const bibliografiasProgramaAnalitico = computed(() => {
  if (!asignatura.value?.bibliografias) return []
  return asignatura.value.bibliografias.filter((b) => {
    if (!b.tipo) return false
    const tipo = b.tipo.toUpperCase()
    return tipo === 'BASIC' || tipo === 'COMPLEMENTARY'
  })
})

// Forms
const datosOriginales = ref({})
const formDatos = ref({})

// --- Cálculo Automático Reactivado (Basado en Horas y Sesiones) ---
watch(
  () => [
    formDatos.value.sesiones_semanales_teoricas,
    formDatos.value.sesiones_semanales_practicas,
    formDatos.value.horas_teoricas,
    formDatos.value.horas_practicas,
  ],
  ([teoricasSem, practicasSem, hTeo, hPrac]) => {
    // 1. Calculate Total Weekly Sessions
    formDatos.value.sesiones_semanales = (Number(teoricasSem) || 0) + (Number(practicasSem) || 0)

    // 2. Update Carga Horaria Total
    // Formula: (HT * 20) + (HP * 20)
    const ht = Number(hTeo) || 0
    const hp = Number(hPrac) || 0
    formDatos.value.carga_horaria_total = ht * 20 + hp * 20

    // 3. Format visual detail (Grey Box in Row 5)
    let detalle = ''
    if (ht > 0) detalle += `${ht} T`
    if (hp > 0) {
      if (detalle) detalle += ' / '
      detalle += `${hp} P`
    }
    formDatos.value.horas_detalle = detalle
  },
  { immediate: true },
)
const formPrograma = ref({
  competencia_global: '',
  competencia_unidad: '',
  elementos_competencia: [],
  metodologia_aula: '',
  metodologia_simulacion: '',
  metodologia_hospital: '',
  reglamento_normativa: [],
  sistema_evaluacion: '',
})
const formBiblio = ref({})
const dialogBibliografia = ref(false)
const editandoBiblio = ref(false)
const biblioSeleccionada = ref(null)

// Importación
const dialogImportar = ref(false)
const archivoImportar = ref(null)
const dialogImportarExcel = ref(false)
const archivoImportarExcel = ref(null)
const dialogImportarPlanClase = ref(false)
const archivoImportarPlanClase = ref(null)

const dialogImportarPersonal = ref(false)
const archivoImportarPersonal = ref(null)
const importandoPersonal = ref(false)

const puedeImportar = computed(() => {
  // 1. Debe ser Cochabamba (Sede 1)
  // Verificamos la asignatura actual
  let esSedeCochabamba = false

  // Check main 'carrera' object
  if (asignatura.value?.carrera?.sede_id == 1) esSedeCochabamba = true

  // Check 'carreras' array
  if (asignatura.value?.carreras?.some((c) => c.sede_id == 1)) esSedeCochabamba = true

  // Check direct prop
  if (asignatura.value?.sede_id == 1) esSedeCochabamba = true

  if (!esSedeCochabamba) return false

  // 2. Roles permitidos: Director/Admin o Docente de Cochabamba
  // Convert auth sede_id to number for comparison
  const authSede = Number(authStore.usuarioActual?.sede_id)
  const esDocenteCochabamba = authSede === 1

  return esDirectorOAdmin.value || esDocenteCochabamba
})

const puedeImportarPersonal = computed(() => {
  // Permitir a Directores/Admins de cualquier sede
  if (esDirectorOAdmin.value) return true

  // Permitir a docentes si están asignados a la asignatura (independiente de sede)
  if (authStore.rol === ROLES.DOCENTE) {
    const myDocenteId = authStore.usuarioActual?.docente?.id || authStore.usuarioActual?.docente_id
    const esAsignado = asignatura.value?.docentes?.some((d) => d.id == myDocenteId)
    return esAsignado || false
  }

  return false
})

function abrirDialogoImportar() {
  archivoImportar.value = null
  dialogImportar.value = true
}

async function procesarImportacion() {
  if (!archivoImportar.value) return

  try {
    // Word refined: Only units and themes
    const opcionesEnvio = {
      datos: false,
      unidades: true,
      bibliografia: false,
    }

    await store.importarWord(asignatura.value.id, archivoImportar.value, opcionesEnvio)
    $q.notify({
      type: 'positive',
      message: 'Programa Analítico importado con éxito.',
      icon: 'check_circle',
    })
    dialogImportar.value = false
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Error al importar Word: ' + (err.response?.data?.error || err.message),
      position: 'top',
    })
  }
}

function abrirDialogoImportarExcel() {
  archivoImportarExcel.value = null
  dialogImportarExcel.value = true
}

async function procesarImportacionExcel() {
  if (!archivoImportarExcel.value) return

  try {
    await store.importarExcel(asignatura.value.id, archivoImportarExcel.value)
    // Force refresh of form data from updated store
    cargarFormDatos()

    $q.notify({
      type: 'positive',
      message: 'Programa de Asignatura actualizado desde Excel.',
      icon: 'check_circle',
    })
    dialogImportarExcel.value = false
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Error al importar Excel: ' + (err.response?.data?.error || err.message),
      position: 'top',
    })
  }
}

function abrirDialogoImportarPlanClase() {
  archivoImportarPlanClase.value = null
  dialogImportarPlanClase.value = true
}

async function procesarImportacionPlanClase() {
  if (!archivoImportarPlanClase.value) return

  try {
    await store.importarPlanClase(asignatura.value.id, archivoImportarPlanClase.value)
    cargarFormDatos()

    $q.notify({
      type: 'positive',
      message: 'Plan de Clase importado con éxito (Unidades y Temas actualizados).',
      icon: 'check_circle',
    })
    dialogImportarPlanClase.value = false
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Error al importar Plan de Clase: ' + (err.response?.data?.error || err.message),
      position: 'top',
    })
  }
}

function abrirDialogoImportarPersonal() {
  archivoImportarPersonal.value = null
  dialogImportarPersonal.value = true
}

function descargarPlantillaPersonal() {
  const url = store.getTemplatePersonalUrl(asignatura.value.id)
  window.open(url, '_blank')
}

async function procesarImportacionPersonal() {
  if (!archivoImportarPersonal.value) return

  importandoPersonal.value = true
  try {
    const res = await store.importarPersonal(asignatura.value.id, archivoImportarPersonal.value)

    // Mostrar estadísticas si están disponibles
    const stats = res.data?.stats
    const msg = stats
      ? `Proceso finalizado. Actualizados: ${stats.updated}, Errores: ${stats.errors}`
      : 'Planificación personal importada con éxito.'

    $q.notify({
      type: stats?.errors > 0 ? 'warning' : 'positive',
      message: msg,
      icon: stats?.errors > 0 ? 'warning' : 'check_circle',
      multiLine: true,
      actions: [{ label: 'Cerrar', color: 'white' }],
    })

    if (res.data?.errors?.length > 0) {
      console.warn('Errores de importación:', res.data.errors)
    }

    dialogImportarPersonal.value = false
  } catch (err) {
    $q.notify({
      type: 'negative',
      message:
        'Error al importar Planificación Personal: ' + (err.response?.data?.error || err.message),
      position: 'top',
    })
  } finally {
    importandoPersonal.value = false
  }
}

const breadcrumbInfo = computed(() => {
  const rol = authStore.rol
  const rolesDirectivos = [
    'DIRECTOR_CARRERA',
    'DIRECCION_ACADEMICA',
    'VICERRECTOR_SEDE',
    'VICERRECTOR_NACIONAL',
    'ADMIN',
    'SUPER ADMIN',
  ]

  if (rolesDirectivos.includes(rol)) {
    return {
      label: 'Plan de Estudios',
      to: '/director/asignaturas',
    }
  }

  return {
    label: 'Documentación',
    to: '/documentacion',
  }
})

// Lifecycle
onMounted(() => {
  const id = parseInt(route.params.id)
  const params = {}
  if (route.query.docente_id) params.docente_id = route.query.docente_id
  store.setAsignaturaActual(id, params)
  if (asignatura.value) {
    cargarFormDatos()
  }

  // Watch for query param changes
  watch(
    () => route.query.docente_id,
    (newId) => {
      const id = parseInt(route.params.id)
      const params = {}
      if (newId) params.docente_id = newId
      store.setAsignaturaActual(id, params)
    },
  )

  // Garantizar que existen sedes cargadas para resolver IDs si es necesario
  if (sedesStore.sedes.length === 0) {
    sedesStore.fetchSedes()
  }

  // Garantizar que existen carreras cargadas para resolver IDs (Fix N/A)
  if (carrerasStore.carreras.length === 0) {
    carrerasStore.fetchCarreras()
  }
})

watch(asignatura, (newVal) => {
  // Only update fields if we are NOT currently editing (to avoid overwrite)
  // Or check if ID changed (navigation)
  if (newVal && (!formDatos.value.codigo || formDatos.value.codigo !== newVal.codigo)) {
    cargarFormDatos()
  }
})

// Methods
function cargarFormDatos() {
  // USER REQUEST REVERT: Sessions are independent and manual.
  // We initialize them strictly from DB or 0.
  let sTeoricas = Number(asignatura.value.sesiones_semanales_teoricas) || 0
  let sPracticas = Number(asignatura.value.sesiones_semanales_practicas) || 0

  // No inference from hours/credits.

  // Values from DB/API
  // hTeoricas and hPracticas removed as they are no longer used for inference

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
    criterios_evaluacion: asignatura.value.criterios_evaluacion,
    // Nuevos campos
    area_desempenio: asignatura.value.area_desempenio || '',
    tipo_curso: asignatura.value.tipo_curso || '',
    modalidad: asignatura.value.modalidad || 'Presencial',
    carga_horaria_total: asignatura.value.carga_horaria_total || 0,
    requisitos: asignatura.value.requisitos || '',
    horas_detalle: '', // Se autocalcula o carga abajo
    sesiones_semanales: sTeoricas + sPracticas,
    sesiones_semanales_teoricas: sTeoricas,
    sesiones_semanales_practicas: sPracticas,
    // Docente info
    docente_formacion: asignatura.value.docente_formacion || '',
    docente_telefono: asignatura.value.docente_telefono || '',
    docente_email: asignatura.value.docente_email || '',
  }

  // Lógica para priorizar datos del DOCENTE actual (Perfil) sobre los datos guardados en la asignatura
  // Esto evita que un docente vea los datos de otro si comparten la materia
  if (authStore.rol === 'DOCENTE') {
    const u = authStore.usuarioActual
    if (u) {
      // Email: Priorizar email del usuario
      if (u.email) formDatos.value.docente_email = u.email

      // Telefono: Prioridad -> User.telefono (Perfil) -> Docente.celular -> Asignatura (Guardado)
      const telAuth = u.telefono
      const telDoc = u.docente?.celular
      const telAsig = asignatura.value.docente_telefono

      formDatos.value.docente_telefono = telAuth || telDoc || telAsig

      // Formacion: Priorizar perfil
      formDatos.value.docente_formacion = u.docente?.formacion || asignatura.value.docente_formacion
    }
  }

  // Recalcular Carga Horaria Total y Detalle inmediatamente al cargar
  const ht = Number(asignatura.value.horas_teoricas) || 0
  const hp = Number(asignatura.value.horas_practicas) || 0

  formDatos.value.carga_horaria_total = ht * 20 + hp * 20

  let detalle = ''
  if (ht > 0) detalle += `${ht} T`
  if (hp > 0) {
    if (detalle) detalle += ' / '
    detalle += `${hp} P`
  }
  formDatos.value.horas_detalle = detalle

  datosOriginales.value = JSON.parse(JSON.stringify(formDatos.value))

  // Cargar datos del programa
  // Cargar metodología estructurada
  const met = asignatura.value.metodologia_general || {}

  // Cargar elementos de competencia estructurados
  let elementosArray = []
  const elementosRaw = asignatura.value.elementos_competencia
  if (elementosRaw) {
    if (Array.isArray(elementosRaw)) {
      elementosArray = elementosRaw
    } else if (typeof elementosRaw === 'string') {
      elementosArray = elementosRaw
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
    }
  }
  // Si no hay elementos, inicializar con uno vacío para la UI
  if (elementosArray.length === 0) elementosArray = ['']

  formPrograma.value = {
    competencia_global: asignatura.value.competencia_global_especifica || '',
    competencia_unidad: asignatura.value.competencia_asignatura || '',
    elementos_competencia: elementosArray,
    metodologia_aula: met.aula || '',
    metodologia_simulacion: met.simulacion || '',
    metodologia_hospital: met.hospital || '',
    reglamento_normativa: {
      clase:
        typeof asignatura.value.reglamento_normativa === 'object' &&
        !Array.isArray(asignatura.value.reglamento_normativa)
          ? asignatura.value.reglamento_normativa?.clase || ''
          : Array.isArray(asignatura.value.reglamento_normativa)
            ? asignatura.value.reglamento_normativa.join('\n')
            : asignatura.value.reglamento_normativa || '',
      laboratorio: asignatura.value.reglamento_normativa?.laboratorio || '',
    },
    sistema_evaluacion: {
      intro:
        typeof asignatura.value.sistema_evaluacion === 'object'
          ? asignatura.value.sistema_evaluacion?.intro || ''
          : asignatura.value.sistema_evaluacion || '',
      diagnostica: asignatura.value.sistema_evaluacion?.diagnostica || '',
      formativa: asignatura.value.sistema_evaluacion?.formativa || '',
      sumativa: asignatura.value.sistema_evaluacion?.sumativa || '',
      ponderacion: asignatura.value.sistema_evaluacion?.ponderacion || '',
      final: asignatura.value.sistema_evaluacion?.final || '',
    },
  }

  // Inicializar snapshot DESPUÉS de cargar todos los datos
  lastSavedSnapshot = JSON.stringify({ datos: formDatos.value, programa: formPrograma.value })
  // Marcar datos como cargados (habilitar auto-guardado)
  dataLoaded = true
}

// Auto-guardado estilo Google Docs - solo guarda si hay cambios reales
watchDebounced(
  () => JSON.stringify({ datos: formDatos.value, programa: formPrograma.value }),
  async (newValue) => {
    if (!dataLoaded) return // No guardar durante la carga inicial
    if (!asignatura.value?.id) return

    // Comparar con el último snapshot guardado
    if (newValue === lastSavedSnapshot) return // Sin cambios reales

    saveStatus.value = 'saving'
    try {
      await guardadoInterno()
      lastSavedSnapshot = newValue // Actualizar snapshot después de guardar
      saveStatus.value = 'saved'
      // Ocultar el indicador "Guardado" después de 3 segundos
      setTimeout(() => {
        if (saveStatus.value === 'saved') saveStatus.value = 'idle'
      }, 3000)
    } catch (error) {
      console.error('Error al auto-guardar:', error)
      saveStatus.value = 'error'
    }
  },
  { debounce: 2000, maxWait: 10000 },
)

// Función interna de guardado (sin notificaciones)
async function guardadoInterno() {
  // Sync Elementos de Competencia from Units
  if (asignatura.value?.unidades) {
    formPrograma.value.elementos_competencia = asignatura.value.unidades
      .sort((a, b) => a.numero - b.numero)
      .map((u) => u.elemento_competencia || '')
  }

  // Estructurar la metodología para el backend
  const metodologia_general = {
    aula: formPrograma.value.metodologia_aula,
    simulacion: formPrograma.value.metodologia_simulacion,
    hospital: formPrograma.value.metodologia_hospital,
  }

  // Combinar datos de ambos formularios
  const datosCompletos = {
    ...formDatos.value,
    ...formPrograma.value,
    metodologia_general,
    metodologia_ensenanza: metodologia_general,
    competencia_asignatura: formPrograma.value.competencia_unidad,
    criterios_evaluacion: formPrograma.value.sistema_evaluacion,
  }

  // 1. Guardar en la Asignatura (Base de datos compartida)
  // Nota: Esto actualiza los campos docente_email, etc. en la tabla asignatura.
  // Sin embargo, cada docente carga visualmente SU info desde el perfil.
  await store.updateAsignatura(asignatura.value.id, datosCompletos)

  // 2. ACTUALIZAR PERFIL DEL DOCENTE (Datos Personales)
  // Si el usuario es docente, guardamos estos cambios también en su perfil personal
  // para que persistan como SUS datos de contacto preferidos.
  if (authStore.rol === 'DOCENTE' && authStore.usuarioActual) {
    const perfilUpdate = {
      email: formDatos.value.docente_email, // Actualizar email de contacto
      // Asumimos que el backend acepta 'docente' object nested o campos planos
      // Ajustar según la estructura de updateProfile en auth store
      telefono: formDatos.value.docente_telefono,
      formacion: formDatos.value.docente_formacion,
    }

    // Intentar actualizar perfil silenciosamente (sin bloquear)
    try {
      await authStore.updateProfile(perfilUpdate)
    } catch (e) {
      console.warn('No se pudo actualizar el perfil personal del docente:', e)
      // No lanzamos error para no detener el guardado principal
    }
  }
}

// Función de guardado manual (backup, disponible para uso futuro)
// eslint-disable-next-line no-unused-vars
async function guardarCambios() {
  saveStatus.value = 'saving'
  try {
    await guardadoInterno()
    saveStatus.value = 'saved'
    setTimeout(() => {
      if (saveStatus.value === 'saved') saveStatus.value = 'idle'
    }, 2000)
  } catch (e) {
    console.error(e)
    saveStatus.value = 'error'
  }
}

function calcularProgresoTema(tema) {
  return store.calcularProgresoTema(tema)
}

function calcularProgresoUnidad(unidad) {
  if (!unidad.temas?.length) return 0
  const total = unidad.temas.reduce((sum, t) => sum + calcularProgresoTema(t), 0)
  return Math.round(total / unidad.temas.length)
}

function getTemaGlobalIndex(unidad, tema) {
  if (!asignatura.value || !asignatura.value.unidades) return 0
  let contador = 0
  // Recorrer unidades ordenadas
  for (const u of asignatura.value.unidades) {
    if (!u.temas) continue
    for (const t of u.temas) {
      contador++
      if (u.id === unidad.id && t.id === tema.id) {
        return contador
      }
    }
  }
  return 0
}

function guardarElementoCompetencia(unidad) {
  // Update unit with new element competence data
  store
    .updateUnidad(unidad.id, { elemento_competencia: unidad.elemento_competencia })
    .then(() => {
      // Optional: Notify success small toast?
      // $q.notify({ type: 'positive', message: 'Elemento guardado', position: 'top', timeout: 500 })
    })
    .catch((err) => {
      $q.notify({ type: 'negative', message: 'Error guardando elemento: ' + err.message })
    })
}

function irATema(unidad, tema) {
  router.push({
    path: `/documentacion/${asignatura.value.id}/unidad/${unidad.id}/tema/${tema.id}`,
    query: route.query, // Sincronía: Preservar docente_id para que el Director vea los datos correctos
  })
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

// Generación de PDFs (Legacy/Otros)
function generarCarpetaHtml() {
  const asig = asignatura.value // Access ref value
  if (!asig) {
    $q.notify({ type: 'warning', message: 'No hay datos de asignatura cargados.' })
    return
  }

  console.log('Generando Carpeta HTML. Datos:', asig)

  let grupoId = null

  // ESTRATEGIA DE BÚSQUEDA DE GRUPO

  // 1. Si hay docentes asignados, suelen tener el grupo en el pivot o estructura
  if (asig.docentes && asig.docentes.length > 0) {
    // Intentar buscar el primer docente con grupo_id en pivot
    const docConGrupo = asig.docentes.find((d) => d.pivot && d.pivot.grupo_id)
    if (docConGrupo) {
      grupoId = docConGrupo.pivot.grupo_id
    }
    // Si no hay pivot, probar si el objeto docente tiene array 'grupos'
    else if (asig.docentes[0].grupos && asig.docentes[0].grupos.length > 0) {
      grupoId = asig.docentes[0].grupos[0].id
    }
  }

  // 2. Si no, buscar en array directo de grupos de la asignatura (si existiera)
  if (!grupoId && asig.grupos && asig.grupos.length > 0) {
    grupoId = asig.grupos[0].id
  }

  // 3. FALLBACK: Buscar en horarios_data (Estructura calculada por Controller)
  if (!grupoId && asig.horarios_data && asig.horarios_data.length > 0) {
    grupoId = asig.horarios_data[0].id
  }

  if (grupoId) {
    const routeData = router.resolve({
      name: 'docente-carpeta',
      params: { id: grupoId },
    })
    window.open(routeData.href, '_blank')
  } else {
    $q.notify({
      type: 'warning',
      message: 'No se encontró un grupo asociado para esta asignatura/docente.',
      caption: 'Verifique que la asignatura tenga un grupo y docente asignado.',
      timeout: 5000,
    })
  }
}

// Importar Cronograma (PAC)

// ============================================================
// BANCO DE PREGUNTAS - CONFIGURACIÓN Y MOCK
// ============================================================

const showSubirBanco = ref(false)

// Exámenes de la asignatura (desde el rol de exámenes general)

// Edición de Preguntas
const dialogEditarPregunta = ref(false)
const formPregunta = ref({
  id: null,
  enunciado: '',
  tipo: '',
  opciones: [],
  respuesta_correcta: null,
  dificultad: '1',
  parcial: '',
  grupo: '',
  imagen: null,
})
const archivoImagenPregunta = ref(null)
const guardandoEditPreg = ref(false)
const previewImagenEdit = ref(null)

watch(archivoImagenPregunta, (file) => {
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => (previewImagenEdit.value = e.target.result)
    reader.readAsDataURL(file)
  } else {
    previewImagenEdit.value = null
  }
})

function abrirEditorPregunta(pregunta) {
  formPregunta.value = {
    ...pregunta,
    opciones: Array.isArray(pregunta.opciones) ? [...pregunta.opciones] : ['', '', '', '', ''],
  }
  archivoImagenPregunta.value = null
  previewImagenEdit.value = null
  dialogEditarPregunta.value = true
}

async function guardarEdicionPregunta() {
  guardandoEditPreg.value = true
  try {
    const fd = new FormData()
    fd.append('enunciado', formPregunta.value.enunciado)
    fd.append('tipo', formPregunta.value.tipo)
    fd.append('opciones', JSON.stringify(formPregunta.value.opciones))
    fd.append(
      'respuesta_correcta',
      Array.isArray(formPregunta.value.respuesta_correcta)
        ? JSON.stringify(formPregunta.value.respuesta_correcta)
        : formPregunta.value.respuesta_correcta,
    )
    fd.append('dificultad', formPregunta.value.dificultad)
    fd.append('parcial', formPregunta.value.parcial || '')
    fd.append('grupo', formPregunta.value.grupo || '')
    fd.append('logro_esperado_id', formPregunta.value.logro_esperado_id)

    if (archivoImagenPregunta.value) {
      fd.append('image_file', archivoImagenPregunta.value)
    }

    await api.post(`/banco-preguntas/${formPregunta.value.id}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    $q.notify({ type: 'positive', message: 'Pregunta actualizada' })
    dialogEditarPregunta.value = false
    await cargarBancoPreguntas()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al actualizar pregunta' })
  } finally {
    guardandoEditPreg.value = false
  }
}

function formatoFecha(fechaIso) {
  if (!fechaIso) return ''
  const val = fechaIso.split(' ')[0] // si viene con hora
  const [y, m, d] = val.split('-')
  if (d && m && y) return `${d}/${m}/${y}`
  return val
}

async function cargarExamenes() {
  if (!asignatura.value?.codigo) return
  cargandoExamenes.value = true
  try {
    let url = `/rol-examenes/materia/${asignatura.value.codigo}`
    let carreraId =
      asignatura.value?.carreras?.[0]?.id ||
      asignatura.value?.carrera_id ||
      asignatura.value?.carrera?.id
    if (carreraId) {
      url += `?carrera_id=${carreraId}`
    }
    const { data } = await api.get(url)
    // El endpoint devuelve { data: [...] }
    examenesAsignatura.value = Array.isArray(data.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : []
  } catch (error) {
    console.error('Error al cargar exámenes:', error)
  } finally {
    cargandoExamenes.value = false
  }
}

const preguntasFiltradas = computed(() => {
  return bancoPreguntasLocal.value
})

async function cargarBancoPreguntas() {
  if (!asignatura.value?.id) return

  // Inyectar docente_id de la carpeta o del usuario logueado
  const dId =
    route.query.docente_id ||
    authStore.usuarioActual?.docente?.id ||
    authStore.usuarioActual?.docente_id

  try {
    let url = `/banco-preguntas?asignatura_id=${asignatura.value.id}`
    if (dId) {
      url += `&docente_id=${dId}`
    }

    const { data } = await api.get(url)
    bancoPreguntasLocal.value = data.preguntas || data
  } catch (error) {
    console.error('Error al cargar banco de preguntas:', error)
  }
}

function esOpcionCorrecta(pregunta, letra) {
  const resp = pregunta.respuesta_correcta
  if (Array.isArray(resp)) {
    return resp.includes(letra)
  }
  return resp === letra
}

function confirmarBorrarPregunta(pregunta) {
  $q.dialog({
    title: 'Eliminar Pregunta',
    message: `¿Eliminar esta pregunta del banco?: "${pregunta.enunciado.substring(0, 60)}..."`,
    ok: { label: 'Eliminar', color: 'red', unelevated: true },
    cancel: { label: 'Cancelar', flat: true },
  }).onOk(async () => {
    try {
      await api.delete(`/banco-preguntas/${pregunta.id}`)
      await cargarBancoPreguntas()
      $q.notify({ type: 'warning', message: 'Pregunta eliminada del banco' })
    } catch {
      $q.notify({ type: 'negative', message: 'Error al eliminar pregunta' })
    }
  })
}

async function descargarFormatoBanco() {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.default.Workbook()

  // ── HOJA 1: INSTRUCCIONES ──
  const wsInst = workbook.addWorksheet('Instrucciones')
  wsInst.getColumn(1).width = 40
  wsInst.getColumn(2).width = 80

  const titleRow = wsInst.addRow(['BANCO DE PREGUNTAS — GUÍA OFICIAL'])
  titleRow.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } }
  titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4527A0' } }

  wsInst.addRow([])

  const addGuideHeader = (text) => {
    const r = wsInst.addRow([text])
    r.font = { bold: true, size: 12 }
    r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EAF6' } }
  }

  const redFont = { color: { argb: 'FFFF0000' }, bold: true }

  addGuideHeader('1. CÓDIGOS DE PREGUNTA (Columna TIPO)')
  wsInst.addRow(['FV', 'Falso y Verdadero'])
  wsInst.addRow(['SS', 'Selección Simple - Solo 1 respuesta correcta'])
  const rowSM1 = wsInst.addRow([
    'SM',
    'Selección Múltiple - SOLO 2 OPCIONES (Ambas deben ser correctas)',
  ])
  rowSM1.getCell(2).font = redFont
  const rowPR1 = wsInst.addRow([
    'PR',
    'Problema o Caso Clínico (Solo llenar el Enunciado. NO LLEVA DIFICULTAD)',
  ])
  rowPR1.getCell(2).font = redFont
  wsInst.addRow(['SP', 'Subpregunta de un PR o EM (Llenar igual que Selección Simple)'])
  const rowEM1 = wsInst.addRow([
    'EM',
    'Emparejamiento (Solo llenar el Enunciado. NO LLEVA DIFICULTAD)',
  ])
  rowEM1.getCell(2).font = redFont
  wsInst.addRow([])

  addGuideHeader('2. RESPUESTAS VÁLIDAS')
  wsInst.addRow(['Opciones (SS)', 'Pon una sola letra: A, B, C, D o E.'])
  wsInst.addRow(['Emparejamiento (EM)', 'Déjalo completamente en blanco.'])
  const rowSM2 = wsInst.addRow([
    'Opciones (SM)',
    'Debes poner exactamente las 2 letras correspondientes, por ejemplo: A,B.',
  ])
  rowSM2.getCell(2).font = redFont
  wsInst.addRow(['Falso/Verdadero (FV)', 'A para Verdadero, B para Falso.'])
  const rowPR2 = wsInst.addRow(['Problemas (PR)', 'Déjalo completamente en blanco.'])
  rowPR2.getCell(2).font = redFont
  wsInst.addRow(['Opciones (SP)', 'Pon una sola letra: A, B, C, D o E.'])
  wsInst.addRow([])

  addGuideHeader('3. CONFIGURACIÓN DEL EXAMEN')
  const rowDif = wsInst.addRow([
    'Dificultad (Nivel)',
    '1 (Fácil), 2 (Medio), 3 (Difícil) — PR y EM NO LLEVAN (DEJAR VACÍO)',
  ])
  rowDif.getCell(1).font = redFont
  rowDif.getCell(2).font = redFont
  wsInst.addRow(['Parciales', '1P (1° Parcial), 2P (2° Parcial), EF (Final), 2I (2da Instancia)'])
  wsInst.addRow([])

  addGuideHeader('⚠️ NOTAS IMPORTANTES')
  const note = wsInst.addRow(['- No elimine columnas ni cambie el nombre de la hoja "Banco".'])
  note.font = { italic: true, color: { argb: 'FFC62828' } }
  const noteSM = wsInst.addRow([
    '- IMPORTANTE: Las preguntas SM (Selección Múltiple) deben tener SOLAMENTE 2 OPCIONES y ambas deben ser marcadas como correctas (ej: A,B).',
  ])
  noteSM.font = redFont
  const notePREM = wsInst.addRow([
    '- IMPORTANTE: Los tipos PR y EM son encabezados y NO DEBEN TENER DIFICULTAD (dejar la celda de dificultad vacía).',
  ])
  notePREM.font = redFont

  // ── HOJA 2: BANCO ──
  const wsBanco = workbook.addWorksheet('Banco')

  // Cabeceras
  const headers = [
    'tipo',
    'grupo',
    'enunciado',
    'opcion_a',
    'opcion_b',
    'opcion_c',
    'opcion_d',
    'opcion_e',
    'respuesta_correcta',
    'dificultad',
    'parcial',
  ]
  const headerRow = wsBanco.addRow(headers)

  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4527A0' } }
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    }
  })

  const addPreguntaRow = (dif, parcial, color, grupo = '') => {
    // Columnas: tipo, grupo, enunciado, op_a, op_b, op_c, op_d, op_e, respuesta_correcta, dificultad, parcial
    const row = wsBanco.addRow(['', grupo, '', '', '', '', '', '', '', dif, parcial])
    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color },
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    })
  }

  // Generar 15 Fáciles (Verde)
  for (let i = 0; i < 15; i++) {
    addPreguntaRow('1', '1P', 'FFC6EFCE')
  }

  // Generar 30 Medias (Amarillo)
  for (let i = 0; i < 30; i++) {
    addPreguntaRow('2', '1P', 'FFFFEB9C')
  }

  // Generar 15 Difíciles (Rojo)
  for (let i = 0; i < 15; i++) {
    addPreguntaRow('3', '1P', 'FFFFC7CE')
  }

  wsBanco.columns = [
    { width: 10 },
    { width: 15 },
    { width: 60, style: { alignment: { wrapText: true, vertical: 'top' } } },
    { width: 25, style: { alignment: { wrapText: true, vertical: 'top' } } },
    { width: 25, style: { alignment: { wrapText: true, vertical: 'top' } } },
    { width: 25, style: { alignment: { wrapText: true, vertical: 'top' } } },
    { width: 25, style: { alignment: { wrapText: true, vertical: 'top' } } },
    { width: 25, style: { alignment: { wrapText: true, vertical: 'top' } } },
    { width: 20 },
    { width: 12 },
    { width: 12 },
  ]

  // Add Data Validation and Totals
  for (let i = 2; i <= 61; i++) {
    wsBanco.getCell(`A${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"FV,SS,SM,PR,SP,EM"'],
    }
    wsBanco.getCell(`J${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"1,2,3"'],
    }
    wsBanco.getCell(`K${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"1P,2P,EF,2I"'],
    }
  }

  const rowF = wsBanco.getRow(63)
  rowF.getCell(9).value = 'Total Fáciles:'
  rowF.getCell(9).font = { bold: true }
  rowF.getCell(10).value = { formula: 'COUNTIF(J2:J61, 1)' }

  const rowM = wsBanco.getRow(64)
  rowM.getCell(9).value = 'Total Medias:'
  rowM.getCell(9).font = { bold: true }
  rowM.getCell(10).value = { formula: 'COUNTIF(J2:J61, 2)' }

  const rowD = wsBanco.getRow(65)
  rowD.getCell(9).value = 'Total Difíciles:'
  rowD.getCell(9).font = { bold: true }
  rowD.getCell(10).value = { formula: 'COUNTIF(J2:J61, 3)' }

  // ── HOJA 3: EJEMPLO (PRECARGADA) ──
  const wsEj = workbook.addWorksheet('Ejemplo')
  const ejHeaderRow = wsEj.addRow(headers)
  ejHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006064' } } // Color diferente (Teal oscuro)
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  })

  const addEjRow = (tipo, dif, parc, enun, r, ops = [], grupo = '') => {
    // Columnas: tipo(1), grupo(2), enunciado(3), op_a(4), op_b(5), op_c(6), op_d(7), op_e(8), r_corr(9), dif(10), parc(11)
    const rowData = [tipo, grupo, enun, '', '', '', '', '', r, dif, parc]
    // Rellenamos opciones si existen (máximo 5)
    for (let i = 0; i < Math.min(ops.length, 5); i++) {
      rowData[3 + i] = ops[i]
    }
    const row = wsEj.addRow(rowData)
    row.getCell(1).font = { bold: true }
  }

  // Ejemplos FV
  addEjRow('FV', '1', '1P', 'Bolivia cuenta con una salida soberana al Océano Pacífico.', 'B', [
    'Verdadero',
    'Falso',
  ])
  addEjRow('FV', '1', '1P', 'La capital constitucional de Bolivia es Sucre.', 'A', [
    'Verdadero',
    'Falso',
  ])

  // Ejemplos SS
  addEjRow('SS', '2', '1P', '¿Cuál es el símbolo químico del Oro en la tabla periódica?', 'B', [
    'Ag',
    'Au',
    'Fe',
    'Cu',
    'Pb',
  ])
  addEjRow('SS', '2', '1P', '¿Cuál es el planeta más grande de nuestro sistema solar?', 'C', [
    'Marte',
    'Tierra',
    'Júpiter',
    'Saturno',
    'Venus',
  ])

  // Ejemplos SM
  addEjRow(
    'SM',
    '3',
    '1P',
    '¿Cuáles de los siguientes son elementos que componen el núcleo atómico?',
    'A,B',
    ['Protones', 'Neutrones'],
  )
  addEjRow('SM', '3', '1P', '¿Cuáles son los principales componentes del agua pura?', 'A,B', [
    'Hidrógeno',
    'Oxígeno',
  ])

  // Ejemplos PR y SP (Caso Clínico)
  addEjRow(
    'PR',
    '',
    '1P',
    'CASO CLINICO O PROBLEMA\nUna mujer de 58 años, inconsciente, es llevada al Servicio de Urgencia después de sufrir un colapso en un centro de compras local. Su familia informa que ella se sentía bien en la mañana pero que desarrolló una cefalea de intensidad creciente. Tiene antecedentes de hipertensión arterial y fibrilación auricular, por lo que recibe medicamentos antihipertensivos y anticoagulantes orales. Al examen físico: presión arterial 220/130 mmHg. Presenta apnea alternada con hiperpnea y responde solo a estímulos dolorosos con extensión postural de brazo y pierna derecha. El fondo de ojo muestra edema de papila que compromete el disco óptico izquierdo. Las pupilas son 3.0/7.0 (derecha/izquierda) sin reacción a la luz en la izquierda y con una preferencia de mirada a izquierda. Presenta hiperreflexia difusa, mayor en lado derecho y signo de Babinski bilateral.',
    '',
    [],
    'Caso 1',
  )
  addEjRow(
    'SP',
    '3',
    '1P',
    '¿Con cuál de las siguientes estructuras del lado izquierdo que presente una lesión es más consistente la presencia de una pupila izquierda no reactiva y dilatada?',
    'D',
    ['Nervio óptico', 'Tracto óptico', 'Protuberancia', 'Nervio oculomotor', 'Colículo superior'],
    'Caso 1',
  )
  addEjRow(
    'SP',
    '3',
    '1P',
    '¿Con una lesión en cuál de las siguientes áreas del cerebro izquierdo es más consistente la postura en extensión del brazo derecho?',
    'E',
    ['Telencéfalo', 'Diencéfalo', 'Protuberancia', 'Bulbo raquídeo', 'Cerebro medio'],
    'Caso 1',
  )

  // Ejemplos EM y SP (Emparejamiento)
  addEjRow(
    'EM',
    '',
    '1P',
    'EMPAREJAMIENTO: Relacione el concepto con su definición correcta:\nA. Metodología\nB. Método\nC. Técnica\nD. Ciencia\nE. Conocimiento Empírico',
    '',
    [],
    'Emp 1',
  )
  addEjRow(
    'SP',
    '2',
    '1P',
    'Herramientas y procedimientos prácticos para recolectar datos.',
    'A',
    [],
    'Emp 1',
  )
  addEjRow(
    'SP',
    '2',
    '1P',
    'Conocimiento que se obtiene mediante la práctica diaria y la percepción personal.',
    'B',
    [],
    'Emp 1',
  )
  addEjRow(
    'SP',
    '2',
    '1P',
    'El estudio de los pasos y estrategias que se siguen en una investigación.',
    'C',
    [],
    'Emp 1',
  )
  addEjRow(
    'SP',
    '2',
    '1P',
    'El camino lógico o plan estructurado para alcanzar un objetivo de conocimiento.',
    'D',
    [],
    'Emp 1',
  )
  addEjRow(
    'SP',
    '2',
    '1P',
    'Sistema de saberes organizados, objetivos y verificables sobre la realidad.',
    'E',
    [],
    'Emp 1',
  )

  wsEj.columns = wsBanco.columns

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `formato_banco_preguntas_${asignatura.value?.sigla || 'asig'}.xlsx`
  link.click()

  $q.notify({ type: 'positive', message: 'Excel generado exitosamente', icon: 'check_circle' })
}

// ============================================================
// IMPORTACIÓN BANCO DE PREGUNTAS — REFS Y LÓGICA
// ============================================================
const archivoBancoFile = ref(null)
const archivoPreviewBanco = ref(null)
const grupoTeoricoSeleccionado = ref(null)
const preguntasImportadas = ref([])
const importErrores = ref([])
const importandoBanco = ref(false)
const modoImportacion = ref('reemplazar')
const importStats = ref({
  total: 0,
  faciles: 0,
  medios: 0,
  dificiles: 0,
})

const validacionDistribucion = computed(() => {
  const countF = importStats.value.faciles || 0
  const countM = importStats.value.medios || 0
  const countD = importStats.value.dificiles || 0
  return preguntasImportadas.value.length >= 60 && countF >= 15 && countM >= 30 && countD >= 15
})

const gruposTeoricosOptions = computed(() => {
  if (!asignatura.value || !asignatura.value.grupos) return []

  // Normalizar el filtro de tipo (la DB usa TEORICO pero el código a veces usa TEORICA)
  let grupos = asignatura.value.grupos.filter(
    (g) => g.tipo === 'TEORICA' || g.tipo === 'TEORICO' || g.tipo === 'TEO',
  )

  // Filtrar por docente si el rol es DOCENTE o si somos directivos viendo una carpeta específica
  const dIdRequest = route.query.docente_id
  const myDocenteId = authStore.usuarioActual?.docente?.id || authStore.usuarioActual?.docente_id
  const targetDocenteId = dIdRequest || (authStore.rol === 'DOCENTE' ? myDocenteId : null)

  if (targetDocenteId) {
    grupos = grupos.filter((g) => Number(g.docente_id) === Number(targetDocenteId))
  }

  return grupos.map((g) => ({
    label: `Grupo ${g.nombre}`,
    value: g.nombre, // Usamos el nombre del grupo
  }))
})

// Mapping de columnas del Excel (orden igual que el formato descargado)
const COLS = {
  tipo: 0,
  grupo: 1,
  enunciado: 2,
  opcion_a: 3,
  opcion_b: 4,
  opcion_c: 5,
  opcion_d: 6,
  opcion_e: 7,
  respuesta_correcta: 8,
  dificultad: 9,
  parcial: 10,
  unidad: 11,
  puntaje: 12,
}

const TIPOS_VALIDOS = ['fv', 'ss', 'sm', 'pr', 'em', 'sp']
const DIFICULTAD_MAP = { 1: '1', 2: '2', 3: '3' }
const PARCIAL_MAP = {
  '1p': '1er Parcial',
  '2p': '2do Parcial',
  ef: 'Final',
  '2i': '2da Instancia',
  '1P': '1er Parcial',
  '2P': '2do Parcial',
  EF: 'Final',
  '2I': '2da Instancia',
}

function previsualizarArchivoExcel(file) {
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    import('xlsx').then((XLSX) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: 'array' })

        // Buscar la hoja "Banco" o usar la primera
        const sheetName = wb.SheetNames.includes('Banco') ? 'Banco' : wb.SheetNames[0]
        const ws = wb.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

        // Encontrar fila de encabezado e identificar dinámicamente el orden
        let headerRowIdx = -1
        let colsMap = { ...COLS }
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const rowLower = rows[i].map((c) =>
            String(c || '')
              .toLowerCase()
              .trim(),
          )
          if (rowLower.includes('tipo') && rowLower.includes('enunciado')) {
            headerRowIdx = i
            rowLower.forEach((colName, idx) => {
              if (colName === 'tipo') colsMap.tipo = idx
              else if (colName === 'grupo') colsMap.grupo = idx
              else if (colName === 'enunciado') colsMap.enunciado = idx
              else if (colName.includes('opcion') || colName.includes('opción')) {
                if (colName.endsWith('a')) colsMap.opcion_a = idx
                else if (colName.endsWith('b')) colsMap.opcion_b = idx
                else if (colName.endsWith('c')) colsMap.opcion_c = idx
                else if (colName.endsWith('d')) colsMap.opcion_d = idx
                else if (colName.endsWith('e')) colsMap.opcion_e = idx
              } else if (colName.includes('respuesta')) colsMap.respuesta_correcta = idx
              else if (colName.includes('dificultad')) colsMap.dificultad = idx
              else if (colName.includes('parcial')) colsMap.parcial = idx
            })
            break
          }
        }

        if (headerRowIdx === -1) {
          importErrores.value = [
            'No se encontró la fila de encabezados con "tipo". Usa el formato descargado.',
          ]
          archivoPreviewBanco.value = file.name
          preguntasImportadas.value = []
          return
        }

        const dataRows = rows.slice(headerRowIdx + 1)
        const errores = []
        const preguntas = []

        dataRows.forEach((row, idx) => {
          const lineNum = headerRowIdx + idx + 2 // número de fila real en Excel
          const tipo = String(row[colsMap.tipo] || '')
            .toLowerCase()
            .trim()

          // Ignorar filas vacías
          if (!tipo || !row[colsMap.enunciado]) return

          // Validar tipo
          if (!TIPOS_VALIDOS.includes(tipo)) {
            errores.push(
              `Fila ${lineNum}: tipo "${tipo}" no válido. Use: ${TIPOS_VALIDOS.join(', ')}`,
            )
            return
          }

          const enunciadoRaw = String(row[colsMap.enunciado] || '').trim()
          const enunciado = enunciadoRaw.replace(/\r\n|\n/g, '<br>')

          const respuesta = String(row[colsMap.respuesta_correcta] || '')
            .trim()
            .toUpperCase()
          const dificultadRaw = String(row[colsMap.dificultad] || '')
            .trim()
            .toLowerCase()
          const dificultad = DIFICULTAD_MAP[dificultadRaw] || dificultadRaw
          const parcialRaw = String(row[colsMap.parcial] || '')
            .trim()
            .toLowerCase()
          const parcial = PARCIAL_MAP[parcialRaw] || parcialRaw
          const grupoRaw = String(row[colsMap.grupo] || '').trim()

          // Validar campos requeridos por tipo
          if (['ss', 'sm', 'fv', 'sp'].includes(tipo)) {
            if (!respuesta) {
              errores.push(`Fila ${lineNum}: tipo "${tipo}" requiere respuesta_correcta.`)
              return
            }
            if (tipo === 'sm') {
              // SM debe tener exactamente 2 respuestas (ej: A,B o AB)
              const letters = respuesta.replace(/[^A-E]/g, '')
              if (letters.length !== 2) {
                errores.push(
                  `Fila ${lineNum}: Selección Múltiple (SM) DEBE tener exactamente 2 respuestas correctas (ej: A,B).`,
                )
                return
              }
            } else {
              // SS, FV, SP deben tener solo 1 letra
              if (!['A', 'B', 'C', 'D', 'E'].includes(respuesta) && respuesta.length > 1) {
                errores.push(`Fila ${lineNum}: tipo "${tipo}" solo acepta una letra (A-E).`)
                return
              }
            }
          }

          preguntas.push({
            id: Date.now() + idx + Math.random(),
            tipo,
            enunciado,
            grupo: grupoRaw || null,
            opciones: [
              String(row[colsMap.opcion_a] || '')
                .replace(/\r\n|\n/g, '<br>')
                .trim(),
              String(row[colsMap.opcion_b] || '')
                .replace(/\r\n|\n/g, '<br>')
                .trim(),
              String(row[colsMap.opcion_c] || '')
                .replace(/\r\n|\n/g, '<br>')
                .trim(),
              String(row[colsMap.opcion_d] || '')
                .replace(/\r\n|\n/g, '<br>')
                .trim(),
              String(row[colsMap.opcion_e] || '')
                .replace(/\r\n|\n/g, '<br>')
                .trim(),
            ],
            respuesta,
            dificultad: ['pr', 'em'].includes(tipo) ? '' : dificultad || '1',
            parcial: parcial || '1P',
          })
        })

        // Calcular stats por dificultad
        const stats = { total: preguntas.length, faciles: 0, medios: 0, dificiles: 0 }
        preguntas.forEach((p) => {
          if (p.dificultad === '1') stats.faciles++
          else if (p.dificultad === '2') stats.medios++
          else if (p.dificultad === '3') stats.dificiles++
        })

        preguntasImportadas.value = preguntas
        importErrores.value = errores
        importStats.value = stats
        archivoPreviewBanco.value = file.name

        if (preguntas.length === 0 && errores.length === 0) {
          importErrores.value = [
            'El archivo no tiene filas de datos válidas después del encabezado.',
          ]
        }
      } catch (err) {
        importErrores.value = [`Error al leer el archivo: ${err.message}`]
        archivoPreviewBanco.value = file.name
        preguntasImportadas.value = []
      }
    })
  }
  reader.readAsArrayBuffer(file)
}

async function confirmarImportacionBanco() {
  if (
    preguntasImportadas.value.length === 0 ||
    !archivoBancoFile.value ||
    !grupoTeoricoSeleccionado.value
  )
    return
  importandoBanco.value = true

  try {
    const formData = new FormData()
    formData.append('file', archivoBancoFile.value)
    formData.append('asignatura_id', route.params.id)

    // Inyectar docente_id de la carpeta o del usuario logueado
    const dId =
      route.query.docente_id ||
      authStore.usuarioActual?.docente?.id ||
      authStore.usuarioActual?.docente_id
    if (dId) {
      formData.append('docente_id', dId)
    }
    formData.append('sede_id', authStore.usuarioActual?.sede_id || '')
    formData.append('grupoTeorico', grupoTeoricoSeleccionado.value || '')

    if (modoImportacion.value === 'reemplazar') {
      formData.append('modo', 'reemplazar') // El backend puede manejar esto para limpiar antes de insertar
    }

    const response = await api.post('/banco-preguntas/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: response.data.message || 'Banco actualizado correctamente',
        icon: 'cloud_done',
      })

      // Opcional: Recargar preguntas desde el servidor si existe un index
      await cargarBancoPreguntas()

      // Por ahora, para feedback inmediato, actualizamos el local mock con lo que procesó el backend
      // o simplemente limpiamos y cerramos
      store.setAsignaturaActual(asignatura.value.id) // Refrescar asignatura/datos

      cerrarDialogImportBanco()
    } else {
      throw new Error(response.data.error || 'Error desconocido en el servidor')
    }
  } catch (error) {
    console.error('Error al importar banco:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo completar la importación',
      caption: error.response?.data?.error || error.message,
      icon: 'error',
    })
  } finally {
    importandoBanco.value = false
  }
}

function cerrarDialogImportBanco() {
  showSubirBanco.value = false
  archivoBancoFile.value = null
  archivoPreviewBanco.value = null
  preguntasImportadas.value = []
  importErrores.value = []
  importStats.value = { total: 0, faciles: 0, medios: 0, dificiles: 0 }
}

function getChipColorTipo(tipo) {
  return (
    { fv: 'green', ss: 'blue', em: 'teal', sm: 'red', pr: 'orange', sp: 'deep-orange' }[tipo] ||
    'grey'
  )
}

function getDificultadColor(dificultad) {
  return { 1: 'green', 2: 'orange', 3: 'red' }[dificultad] || 'grey'
}

function getParcialColorBanco(parcial) {
  const map = {
    '1er Parcial': 'blue',
    '2do Parcial': 'orange',
    Final: 'purple',
    '2da Instancia': 'red',
    '1P': 'blue',
    '2P': 'orange',
    EF: 'purple',
    '2I': 'red',
  }
  return map[parcial] || 'grey'
}
</script>

<style scoped>
/* Premium Card Style */
.section-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  background: white;
  border: 1px solid #f1f5f9;
}

/* Modern Input Styling Override */
:deep(.q-field--outlined .q-field__control) {
  border-radius: 8px !important;
  background: #f8fafc;
  /* Subtle grey background for inputs */
}

:deep(.q-field--outlined .q-field__control:hover) {
  background: #ffffff;
  border-color: var(--q-primary);
}

:deep(.q-field--outlined.q-field--focused .q-field__control) {
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

/* Helpers */
.doc-input-container {
  padding: 0 12px;
  background: #f1f5f9;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  height: 40px;
  /* Match standard input height */
  color: #334155;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Clean Cell Helper (if still used) */
.clean-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Override QInput padding to look professional */
:deep(.q-field__native),
:deep(.q-field__input) {
  font-weight: 500;
  color: #1e293b;
}

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
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* Field Cards - Modern styled input containers */
.field-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 0;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.field-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #7b1fa2;
}

.premium-header {
  background: linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%);
  color: white;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.premium-title {
  font-weight: 700;
  letter-spacing: 0.5px;
  font-size: 1rem;
}

.premium-section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 40px 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f1f5f9;
}

.premium-section-title .text-h6 {
  color: #1e293b;
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: -0.025em;
}

.premium-section-title .icon-box {
  background: #f1f5f9;
  padding: 8px;
  border-radius: 10px;
  color: #7b1fa2;
}

.field-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(var(--primary-rgb, 99, 102, 241), 0.08), transparent);
  border-bottom: 1px solid var(--border-color);
}

.field-card__title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.field-card__hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-left: auto;
}

.field-card__input {
  padding: 0;
}

.field-card__input :deep(.q-field__control) {
  border-radius: 0 !important;
  border: none !important;
  background: transparent !important;
}

.field-card__input :deep(.q-field__control::before),
.field-card__input :deep(.q-field__control::after) {
  border: none !important;
}

/* Color variations */
.field-card--blue {
  border-left-color: #3b82f6;
}

.field-card--blue .field-card__header {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), transparent);
}

.field-card--blue .field-card__header .q-icon {
  color: #3b82f6;
}

.field-card--green {
  border-left-color: #10b981;
}

.field-card--green .field-card__header {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), transparent);
}

.field-card--green .field-card__header .q-icon {
  color: #10b981;
}

.field-card--amber {
  border-left-color: #f59e0b;
}

.field-card--amber .field-card__header {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), transparent);
}

.field-card--amber .field-card__header .q-icon {
  color: #f59e0b;
}

.field-card--orange {
  border-left-color: #f97316;
}

.field-card--orange .field-card__header {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), transparent);
}

.field-card--orange .field-card__header .q-icon {
  color: #f97316;
}

.field-card--purple {
  border-left-color: #8b5cf6;
}

.field-card--purple .field-card__header {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.12), transparent);
}

.field-card--purple .field-card__header .q-icon {
  color: #8b5cf6;
}

.field-card--teal {
  border-left-color: #14b8a6;
}

.field-card--teal .field-card__header {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.12), transparent);
}

.field-card--teal .field-card__header .q-icon {
  color: #14b8a6;
}

.field-card--red {
  border-left-color: #ef4444;
}

.field-card--red .field-card__header {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), transparent);
}

.field-card--red .field-card__header .q-icon {
  color: #ef4444;
}

.field-card--indigo {
  border-left-color: #6366f1;
}

.field-card--indigo .field-card__header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), transparent);
}

.field-card--indigo .field-card__header .q-icon {
  color: #6366f1;
}

/* Bibliography Sections */
.biblio-section__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
}

.biblio-section__header--basica {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05));
  border-left: 4px solid #3b82f6;
}

.biblio-section__header--basica .q-icon {
  color: #3b82f6;
}

.biblio-section__header--complementaria {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.15), rgba(107, 114, 128, 0.05));
  border-left: 4px solid #6b7280;
}

.biblio-section__header--complementaria .q-icon {
  color: #6b7280;
}

.biblio-section__header--api {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05));
  border-left: 4px solid #8b5cf6;
}

.biblio-section__header--api .q-icon {
  color: #8b5cf6;
}

.biblio-card--api {
  border-left: 4px solid #8b5cf6;
}

/* Bibliography Cards */
.biblio-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.biblio-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--primary);
}

.biblio-card--basica {
  border-left: 4px solid #3b82f6;
}

.biblio-card--complementaria {
  border-left: 4px solid #6b7280;
}

.biblio-card__content {
  flex: 1;
}

.biblio-card__title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 4px;
}

.biblio-card__author {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.biblio-card__details {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.biblio-card__actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Field Card Body for formatted display */
.field-card__body {
  padding: 16px;
  position: relative;
  min-height: 60px;
}

.field-card__body .edit-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.field-card__body:hover .edit-btn {
  opacity: 1;
}

/* Formatted Text */
.formatted-text {
  line-height: 1.6;
  color: var(--text-primary);
}

.formatted-paragraph {
  margin: 0 0 8px 0;
  font-size: 0.95rem;
}

.formatted-paragraph:last-child {
  margin-bottom: 0;
}

/* Elementos de Competencia List */
.ec-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ec-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-hover);
  border-radius: 10px;
  border-left: 4px solid #14b8a6;
  transition: all 0.2s ease;
}

.ec-item:hover {
  background: rgba(20, 184, 166, 0.1);
  transform: translateX(4px);
}

.ec-number {
  font-weight: 700;
  font-size: 0.85rem;
  color: #14b8a6;
  min-width: 50px;
  flex-shrink: 0;
}

.ec-content {
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-primary);
}

/* Auto-save indicator flotante estilo Google Docs */
.auto-save-indicator {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ============================================================
   Banco de Preguntas
   ============================================================ */
.pregunta-card {
  border-radius: 10px;
  transition: box-shadow 0.2s;
}

.pregunta-card:hover {
  box-shadow: 0 4px 16px rgba(123, 31, 162, 0.12);
}

.opciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 4px;
  margin-top: 6px;
}

.opcion-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  padding: 4px 8px;
  border-radius: 6px;
  color: var(--text-secondary);
}

.opcion-letra {
  font-weight: 700;
  color: var(--text-muted);
  min-width: 18px;
}

.opcion-correcta {
  background: rgba(76, 175, 80, 0.1);
  color: #2e7d32;
  font-weight: 600;
}

.opcion-correcta .opcion-letra {
  color: #1b5e20;
}

/* ── Importación Banco de Preguntas ── */
.import-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;
  padding: 2px 0;
}

.preview-item {
  background: var(--bg-tertiary, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  padding: 10px 12px;
}

/* ── Parametrización Banco de Preguntas ── */
.banco-header {
  background: linear-gradient(135deg, #4527a0, #7b1fa2);
  padding: 20px 24px;
  border-radius: 0 0 16px 16px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(123, 31, 162, 0.2);
}

.config-section-label {
  font-weight: 700;
  font-size: 0.95rem;
  color: #4527a0;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-block {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  height: 100%;
  transition: all 0.3s ease;
}

.config-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.config-block__title {
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.config-block__min {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 12px;
}

.config-block__total {
  margin-top: 10px;
  font-weight: 800;
  font-size: 1.1rem;
  text-align: right;
  color: #334155;
}

.config-block--facil {
  border-left: 5px solid #4caf50;
}

.config-block--facil .config-block__title {
  color: #2e7d32;
}

.config-block--media {
  border-left: 5px solid #ff9800;
}

.config-block--media .config-block__title {
  color: #ef6c00;
}

.config-block--dificil {
  border-left: 5px solid #f44336;
}

.config-block--dificil .config-block__title {
  color: #c62828;
}

.config-block--emparejar {
  border-left: 5px solid #009688;
}

.config-block--emparejar .config-block__title {
  color: #00695c;
}

.config-block--problema {
  border-left: 5px solid #ff5722;
}

.config-block--problema .config-block__title {
  color: #d84315;
}

.config-block--subpreg {
  border-left: 5px solid #9c27b0;
}

.config-block--subpreg .config-block__title {
  color: #6a1b9a;
}

/* force reload */
</style>
