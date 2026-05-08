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
        <q-btn-dropdown
          outline
          color="indigo"
          icon="settings"
          label="Gestión"
          no-caps
          :disable="!esDirectorOAdmin"
        >
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

            <q-item clickable v-close-popup @click="descargarProgramaAnaliticoDesdeGestion">
              <q-item-section avatar><q-icon name="description" color="primary" /></q-item-section>
              <q-item-section>Descargar Programa Analítico</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="generarCarpetaHtml">
              <q-item-section avatar><q-icon name="auto_stories" color="green" /></q-item-section>
              <q-item-section>Ver Carpeta (HTML)</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- Botón manual deshabilitado: el auto-guardado está activo -->
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
          PROGRAMA ANALITICO
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
        <q-tab
          v-if="authStore.rol === ROLES.DOCENTE"
          name="banco"
          icon="help_outline"
          label="Banco de Preguntas"
          no-caps
        />
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
                      label="Area de Desempeno"
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
                      label="COMPETENCIA GLOBAL ESPECIFICA"
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
                      label="UNIDAD DE COMPETENCIA ESPECIFICA"
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
                    Configure las unidades en la pestaÒ�� �"Ò� â����Ò�â��šÒ�a�±a correspondiente.
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- 8. MetodologÒ�� �"Ò� â����Ò�â��šÒ�a�­a (Card) -->
            <q-card class="section-card q-mb-lg">
              <q-card-section>
                <div class="row items-center q-mb-md">
                  <q-icon name="psychology" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-h6 text-primary">
                    8.- MetodologÒ�� �"Ò� â����Ò�â��šÒ�a�­a General
                  </div>
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
                    label="PARAMETROS Y PONDERACION"
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
                    label="NORMAS DE LABORATORIO / PRACTICA"
                    type="textarea"
                    rows="4"
                    outlined
                    :readonly="!puedeEditarCampo()"
                    placeholder="Ademas, en laboratorio tomar en cuenta: (PRACTICA PRESENCIAL)..."
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
                      <div class="biblio-card__title">{{ textoBibliografia(biblio) }}</div>
                      <div class="biblio-card__author" v-if="!biblio.descripcion && biblio.autor">
                        {{ biblio.autor }}
                      </div>
                      <div
                        class="biblio-card__details"
                        v-if="!biblio.descripcion && (biblio.editorial || biblio.anio)"
                      >
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
                      <div class="biblio-card__title">{{ textoBibliografia(biblio) }}</div>
                      <div class="biblio-card__author" v-if="!biblio.descripcion && biblio.autor">
                        {{ biblio.autor }}
                      </div>
                      <div
                        class="biblio-card__details"
                        v-if="!biblio.descripcion && (biblio.editorial || biblio.anio)"
                      >
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

            <!-- BibliografÒ�� �"Ò� â����Ò�â��šÒ�a�­a Programa AnalÒ�� �"Ò� â����Ò�â��šÒ�a�­tico (API Externa) -->
            <div class="biblio-section q-mt-xl" v-if="bibliografiasProgramaAnalitico.length">
              <div class="biblio-section__header biblio-section__header--api q-mb-md">
                <q-icon name="cloud_download" size="24px" />
                <span class="text-subtitle1 text-weight-bold"
                  >BibliografÒ�� �"Ò� â����Ò�â��šÒ�a�­a Programa AnalÒ�� �"Ò�
                  â����Ò�â��šÒ�a�­tico</span
                >
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
                    {{ unidad.temas?.length || 0 }} temas Ò�� �"Ò�a�¢Ò��¢Ò¢â�a¬�&¡Ò�a�¬Ò�â��šÒ�a�¢
                    {{ unidad.horas }} horas
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
                    <!-- Mostrar contenidos debajo del tema con formato Ò�� �"Ò�a�¢Ò��¢Ò¢â�a¬�&¡Ò�a�¬Ò�â��šÒ�a�¢contenido -->
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
                        Ò�� �"Ò�a�¢Ò��¢Ò¢â�a¬�&¡Ò�a�¬Ò�â��šÒ�a�¢{{ contenido }}
                      </div>
                    </q-item-label>
                    <q-item-label caption v-else-if="tema.descripcion">
                      <span class="text-grey-8"
                        >Ò�� �"Ò�a�¢Ò��¢Ò¢â�a¬�&¡Ò�a�¬Ò�â��šÒ�a�¢{{ tema.descripcion }}</span
                      >
                    </q-item-label>
                    <q-item-label caption class="q-mt-xs">
                      {{ tema.contenido_items?.length || (tema.descripcion ? 1 : 0) }} puntos de
                      contenido Ò�� �"Ò�a�¢Ò��¢Ò¢â�a¬�&¡Ò�a�¬Ò�â��šÒ�a�¢
                      {{ countLogros(tema) }} logros Ò�� �"Ò�a�¢Ò��¢Ò¢â�a¬�&¡Ò�a�¬Ò�â��šÒ�a�¢
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
                          <q-tooltip>Editar TÒ�� �"Ò� â����Ò�â��šÒ�a�­tulo</q-tooltip>
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

        <!-- Tab: Cronograma de Asignatura (redirige automÒ�� �"Ò� â����Ò�â��šÒ�a�¡ticamente) -->
        <q-tab-panel name="cronograma" class="q-pa-lg">
          <div class="text-center q-pa-xl">
            <q-spinner-dots color="primary" size="40px" />
            <p class="text-grey-6 q-mt-md">
              Redirigiendo a PlanificaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n Semestral...
            </p>
          </div>
        </q-tab-panel>

        <!-- ============================================================ -->
        <!-- Tab: Banco de Preguntas -->
        <!-- ============================================================ -->
        <q-tab-panel name="banco" class="q-pa-none">
          <div class="q-px-lg q-pt-lg">
            <q-card flat bordered class="q-mb-md bg-blue-grey-1">
              <q-card-section class="row q-col-gutter-md items-end">
                <div class="col-12 col-lg-7">
                  <div class="text-caption text-weight-bold text-primary q-mb-sm">
                    Selecciona el parcial que gobernará este banco
                  </div>
                  <q-btn-toggle
                    v-model="filtroBancoParcialSeleccionado"
                    unelevated
                    no-caps
                    spread
                    toggle-color="deep-purple"
                    color="white"
                    text-color="primary"
                    :options="parcialOptions"
                    class="full-width banco-parcial-toggle"
                  />
                </div>

                <div class="col-12 col-lg-5">
                  <q-select
                    v-model="filtroBancoGrupoSeleccionado"
                    :options="gruposTeoricosOptions"
                    outlined
                    dense
                    emit-value
                    map-options
                    label="Seleccionar Grupo Teórico"
                    :hint="
                      filtroBancoParcialSeleccionado === '2P'
                        ? 'En 2do Parcial el registro se gestionará de forma individual por grupo'
                        : 'Debes elegir el grupo y el parcial antes de ver o gestionar las preguntas'
                    "
                  >
                    <template v-slot:prepend><q-icon name="groups" /></template>
                  </q-select>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <template v-if="puedeVisualizarBanco">
            <!-- ---- Header principal ---- -->
            <div class="banco-header">
              <div>
                <div class="text-h6 text-weight-bold text-white">
                  <q-icon name="help_outline" class="q-mr-sm" />Banco de Preguntas
                </div>
              </div>
              <div class="banco-actions row items-center q-gutter-sm">
                <span v-if="mostrarAccionesExcelBanco" class="banco-action-tooltip-anchor">
                  <q-btn
                    round
                    unelevated
                    icon="download"
                    class="banco-action-btn banco-action-btn--download"
                    :aria-label="`Descargar Excel Base ${getParcialLabelBanco(filtroBancoParcialSeleccionado)}`"
                    @click="descargarFormatoBanco"
                  />
                  <q-tooltip
                    class="banco-action-tooltip"
                    anchor="top middle"
                    self="bottom middle"
                    :offset="[0, 12]"
                  >
                    <div class="banco-action-tooltip__title">
                      Descargar Excel Base
                      {{ getParcialLabelBanco(filtroBancoParcialSeleccionado) }}
                    </div>
                    <div class="banco-action-tooltip__caption">
                      Obtiene el formato oficial para el parcial y grupo seleccionado.
                    </div>
                  </q-tooltip>
                </span>
                <span v-if="mostrarBotonValidarBanco" class="banco-action-tooltip-anchor">
                  <q-btn
                    round
                    unelevated
                    icon="fact_check"
                    class="banco-action-btn banco-action-btn--validate"
                    aria-label="Validar Banco"
                    @click="validarBancoCompleto"
                  />
                  <q-tooltip
                    class="banco-action-tooltip"
                    anchor="top middle"
                    self="bottom middle"
                    :offset="[0, 12]"
                  >
                    <div class="banco-action-tooltip__title">Validar Banco</div>
                    <div class="banco-action-tooltip__caption">
                      Revisa estructura, conteos y reglas antes de generar el examen.
                    </div>
                  </q-tooltip>
                </span>
                <span class="banco-action-tooltip-anchor">
                  <q-btn
                    round
                    unelevated
                    icon="preview"
                    class="banco-action-btn banco-action-btn--preview"
                    aria-label="Previsualizar Examen"
                    :disable="!puedePrevisualizarExamenBanco"
                    :loading="previsualizandoExamenBanco"
                    @click="previsualizarExamenBanco"
                  />
                  <q-tooltip
                    class="banco-action-tooltip"
                    anchor="top middle"
                    self="bottom middle"
                    :offset="[0, 12]"
                  >
                    <div class="banco-action-tooltip__title">Previsualizar Examen</div>
                    <div class="banco-action-tooltip__caption">
                      Genera un PDF de ejemplo con el banco actual.
                    </div>
                    <div
                      v-if="puedePrevisualizarExamenBanco && !bancoCumpleRequisitosGeneracion"
                      class="banco-action-tooltip__warning"
                    >
                      Vista de prueba con banco incompleto: {{ faltantesGeneracionLabel }}
                    </div>
                    <div
                      v-else-if="!puedePrevisualizarExamenBanco"
                      class="banco-action-tooltip__warning"
                    >
                      Agrega al menos una pregunta evaluable para previsualizar.
                    </div>
                  </q-tooltip>
                </span>
                <span v-if="mostrarAccionesExcelBanco" class="banco-action-tooltip-anchor">
                  <q-btn
                    round
                    unelevated
                    icon="upload_file"
                    class="banco-action-btn banco-action-btn--upload"
                    aria-label="Subir Banco Excel"
                    @click="showSubirBanco = true"
                  />
                  <q-tooltip
                    class="banco-action-tooltip"
                    anchor="top middle"
                    self="bottom middle"
                    :offset="[0, 12]"
                  >
                    <div class="banco-action-tooltip__title">Subir Banco Excel</div>
                    <div class="banco-action-tooltip__caption">
                      Importa preguntas desde el formato base para este banco.
                    </div>
                  </q-tooltip>
                </span>
                <span class="banco-action-tooltip-anchor">
                  <q-btn
                    round
                    unelevated
                    icon="delete_forever"
                    class="banco-action-btn banco-action-btn--delete"
                    aria-label="Eliminar banco actual"
                    :disable="!puedeEliminarBancoFiltrado"
                    @click="confirmarEliminarBancoFiltrado"
                  />
                  <q-tooltip
                    class="banco-action-tooltip"
                    anchor="top middle"
                    self="bottom middle"
                    :offset="[0, 12]"
                  >
                    <div class="banco-action-tooltip__title">Eliminar banco actual</div>
                    <div class="banco-action-tooltip__caption">
                      Borra las preguntas del parcial y grupo seleccionado.
                    </div>
                    <div
                      v-if="preguntasFiltradas.length === 0"
                      class="banco-action-tooltip__warning"
                    >
                      No hay preguntas cargadas para {{ filtroBancoDescripcion }}.
                    </div>
                    <div
                      v-else-if="grupoBancoActualBloqueado"
                      class="banco-action-tooltip__warning"
                    >
                      Este grupo ya tiene un examen generado para este parcial.
                    </div>
                  </q-tooltip>
                </span>
                <span v-if="puedeMostrarRegistroManualBanco" class="banco-action-tooltip-anchor">
                  <q-btn
                    round
                    unelevated
                    icon="add_circle"
                    class="banco-action-btn banco-action-btn--register"
                    aria-label="Registrar nuevas preguntas"
                    :disable="registroManualBancoBloqueado"
                    @click="abrirRegistroManualPregunta"
                  />
                  <q-tooltip
                    class="banco-action-tooltip"
                    anchor="top middle"
                    self="bottom middle"
                    :offset="[0, 12]"
                  >
                    <div class="banco-action-tooltip__title">Registrar nuevas preguntas</div>
                    <div class="banco-action-tooltip__caption">
                      Agrega preguntas manuales al banco seleccionado.
                    </div>
                    <div v-if="registroManualBancoBloqueado" class="banco-action-tooltip__warning">
                      Debes seleccionar un grupo teorico para registrar preguntas.
                    </div>
                  </q-tooltip>
                </span>
                <q-btn
                  v-if="false"
                  unelevated
                  color="teal-3"
                  text-color="teal-10"
                  icon="add_circle"
                  label="Registrar nuevas preguntas"
                  no-caps
                  :disable="registroManualBancoBloqueado"
                  @click="abrirRegistroManualPregunta"
                >
                  <q-tooltip v-if="registroManualBancoBloqueado">
                    Debes seleccionar un grupo teórico para registrar preguntas.
                  </q-tooltip>
                </q-btn>
              </div>
            </div>

            <div class="q-px-lg q-pb-lg">
              <!-- Banner: Grupos bloqueados -->
              <q-banner
                v-if="gruposBloqueados.size > 0 && !importacionAcumulativaSegundoParcial"
                class="bg-orange-1 text-orange-10 q-mb-md"
                rounded
                dense
              >
                <template v-slot:avatar><q-icon name="lock" color="orange-9" /></template>
                <strong>Banco parcialmente bloqueado:</strong>
                Los grupos
                <strong>{{ [...gruposBloqueados].map((g) => 'Grupo ' + g).join(', ') }}</strong>
                ya tienen un examen generado (Rol o Manual) para este parcial. No es posible
                importar, editar ni eliminar sus preguntas, pero si registrar nuevas preguntas
                manualmente.
              </q-banner>

              <q-banner
                v-else-if="gruposBloqueados.size > 0"
                class="bg-teal-1 text-teal-10 q-mb-md"
                rounded
                dense
              >
                <template v-slot:avatar><q-icon name="info" color="teal-9" /></template>
                <strong>2do Parcial acumulativo:</strong>
                Los grupos
                <strong>{{ [...gruposBloqueados].map((g) => 'Grupo ' + g).join(', ') }}</strong>
                ya tienen un examen generado para este parcial, pero la carga del banco sigue
                habilitada. Las nuevas preguntas se agregaran sin reemplazar el banco y se omitiran
                duplicados por enunciado.
              </q-banner>

              <!-- Apartado EstratÒ�� �"Ò� â����Ò�â��šÒ�a�©gico: Fechas de ExÒ�� �"Ò� â����Ò�â��šÒ�a�¡menes (Oculto temporalmente a peticiÒ�� �"Ò� â����Ò�â��šÒ�a�³n) -->
              <q-card
                v-if="examenesAsignatura.length > 0"
                flat
                bordered
                class="q-mb-md border-primary rounded-borders bg-blue-grey-1"
              >
                <q-card-section
                  class="bg-primary text-white q-py-xs q-px-sm row items-center shadow-1"
                >
                  <q-icon name="event" size="16px" class="q-mr-sm" />
                  <span class="text-weight-bold text-caption">Fechas de Exámenes Programadas</span>
                </q-card-section>

                <q-card-section class="q-pa-sm row q-col-gutter-sm justify-center">
                  <div
                    v-for="(examen, idx) in examenesAsignatura"
                    :key="idx"
                    class="col-12 col-sm-6 col-md-3"
                  >
                    <q-card
                      class="bg-white column justify-between items-center shadow-2 full-height"
                      style="border-radius: 8px"
                    >
                      <q-card-section
                        class="q-pa-sm text-center full-width"
                        :class="
                          examen.tipo_examen === '1er Parcial' || examen.tipo_examen === '1P'
                            ? 'bg-deep-purple-1 text-deep-purple-9'
                            : 'bg-indigo-1 text-indigo-9'
                        "
                      >
                        <div class="text-caption text-uppercase text-weight-bolder">
                          {{ examen.tipo_examen }}
                        </div>
                      </q-card-section>
                      <q-separator />
                      <q-card-section class="q-pa-xs text-center full-width">
                        <div class="text-caption text-weight-bold text-grey-9">
                          <q-icon
                            name="calendar_today"
                            size="12px"
                            color="indigo-4"
                            class="q-mr-xs"
                          />
                          {{ formatoFecha(examen.fecha) }}
                        </div>
                        <div style="font-size: 10px" class="text-grey-7">
                          <q-icon name="schedule" size="10px" color="grey-5" class="q-mr-xs" />
                          {{ examen.hora_inicio }} - {{ examen.hora_fin }}
                        </div>
                        <div
                          class="row justify-center q-gutter-x-sm q-mt-xs"
                          style="font-size: 10px"
                        >
                          <div class="text-orange-9" v-if="examen.semana">
                            Semana {{ examen.semana }}
                          </div>
                          <div v-if="examen.grupo" class="text-teal-9 text-weight-bolder">
                            <q-icon name="groups" size="10px" class="q-mr-xs" />Grp
                            {{ examen.grupo }}
                          </div>
                          <div v-else class="text-grey-8 text-weight-bolder">
                            <q-icon name="groups" size="10px" class="q-mr-xs" />General
                          </div>
                        </div>

                        <!-- Documentos de Examen Devuelto -->
                        <div
                          v-if="['devuelto', 'devueltos'].includes(examen.estado?.toLowerCase())"
                          class="q-mt-sm"
                        >
                          <q-separator class="q-mb-xs" />
                          <div
                            class="text-deep-orange-9 text-weight-bold q-mb-xs"
                            style="font-size: 10px"
                          >
                            Examen Devuelto
                          </div>
                          <div class="row justify-center q-gutter-x-sm">
                            <q-btn
                              v-if="getPrimerExamen(examen)"
                              flat
                              round
                              dense
                              color="primary"
                              icon="description"
                              size="sm"
                              @click="abrirDocumento(getPrimerExamen(examen), 'examenes')"
                            >
                              <q-tooltip>Descargar Examen</q-tooltip>
                            </q-btn>

                            <q-btn
                              v-if="getPrimerPatron(examen)"
                              flat
                              round
                              dense
                              color="teal"
                              icon="fact_check"
                              size="sm"
                              @click="abrirDocumento(getPrimerPatron(examen), 'patrones')"
                            >
                              <q-tooltip>Descargar Patrón</q-tooltip>
                            </q-btn>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </q-card-section>
                <q-inner-loading :showing="cargandoExamenes" />
              </q-card>

              <q-banner class="bg-amber-1 text-amber-10 q-mb-md border-amber" rounded dense>
                <template v-slot:avatar><q-icon name="warning" color="amber-10" /></template>
                <strong>Metodo de registro:</strong> Actualmente las preguntas se registran
                directamente desde el sistema para centralizar la validacion y revision del banco.
              </q-banner>

              <q-banner class="bg-indigo-1 text-indigo-9 q-mb-md" rounded dense>
                <template v-slot:avatar><q-icon name="info" /></template>
                1. Selecciona el parcial y grupo teorico correspondiente. <br />
                2. Usa el boton <strong>"Registrar pregunta"</strong> para cargar las preguntas
                desde el sistema y valida el avance con los conteos del banco.
              </q-banner>

              <q-banner
                v-if="false"
                class="bg-amber-1 text-amber-10 q-mb-md border-amber"
                rounded
                dense
              >
                <template v-slot:avatar><q-icon name="warning" color="amber-10" /></template>
                <strong>Método de Registro:</strong> Actualmente las preguntas se registran
                exclusivamente mediante la <strong>importación masiva desde Excel</strong> para
                garantizar el formato oficial.
              </q-banner>

              <q-banner v-if="false" class="bg-indigo-1 text-indigo-9 q-mb-md" rounded dense>
                <template v-slot:avatar><q-icon name="info" /></template>
                1. <strong>Descarga el formato Excel</strong> y procede a completarlo con las
                preguntas adecuadas según tu criterio (15 de dificultad fácil, 30 de dificultad
                media y 15 difíciles). <br />
                2. Una vez que el archivo esté completo, utiliza el botón
                <strong>"Subir Banco"</strong>
                para cargarlo al sistema.
              </q-banner>

              <!-- Resumen del banco -->
              <div v-if="puedeVisualizarBanco" class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-xl-4">
                  <q-card flat bordered class="bg-deep-purple-1 text-deep-purple-9 full-height">
                    <q-card-section>
                      <div class="text-caption text-weight-bold">Banco activo</div>
                      <div class="text-h6 text-weight-bold q-mt-xs">
                        {{ filtroBancoDescripcion }}
                      </div>
                      <div class="text-caption q-mt-sm">
                        {{ totalPreguntasContables }} preguntas evaluables registradas
                      </div>
                      <div
                        v-if="filtroBancoParcialSeleccionado === '2P'"
                        class="text-caption text-orange-9 text-weight-medium q-mt-sm"
                      >
                        En 2do Parcial el registro y la revisión se gestionan por grupo.
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12 col-xl-4">
                  <q-card flat bordered class="bg-green-1 text-green-10 full-height">
                    <q-card-section>
                      <div class="text-caption text-weight-bold q-mb-sm">Conteo por dificultad</div>
                      <div class="q-gutter-y-sm">
                        <div
                          v-for="dificultadInfo in conteoBancoPorDificultadItems"
                          :key="dificultadInfo.key"
                          class="conteo-progress"
                        >
                          <div class="row items-center justify-between q-mb-xs">
                            <span class="text-caption text-weight-medium">
                              {{ dificultadInfo.label }}
                            </span>
                            <span class="text-caption text-weight-bold">
                              {{ dificultadInfo.total }}/{{ dificultadInfo.requerido }}
                            </span>
                          </div>
                          <q-linear-progress
                            rounded
                            size="12px"
                            :value="dificultadInfo.progreso"
                            :color="dificultadInfo.color"
                            track-color="grey-4"
                            class="conteo-progress__bar"
                          />
                        </div>
                      </div>
                      <div class="text-caption q-mt-sm text-weight-medium">
                        {{
                          bancoCumpleDificultad ? 'Distribución completa' : faltantesDificultadLabel
                        }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12 col-xl-4">
                  <q-card flat bordered class="bg-cyan-1 text-cyan-10 full-height">
                    <q-card-section>
                      <div class="text-caption text-weight-bold q-mb-sm">
                        Conteo por grupo de tipo
                      </div>
                      <div class="q-gutter-y-sm">
                        <div
                          v-for="grupoInfo in conteoBancoPorGrupoTipo"
                          :key="grupoInfo.key"
                          class="conteo-progress"
                        >
                          <div class="row items-center justify-between q-mb-xs">
                            <span class="text-caption text-weight-medium">
                              {{ grupoInfo.label }}
                            </span>
                            <span class="text-caption text-weight-bold">
                              {{ grupoInfo.total }}/{{ grupoInfo.requerido }}
                            </span>
                          </div>
                          <q-linear-progress
                            rounded
                            size="12px"
                            :value="grupoInfo.progreso"
                            :color="grupoInfo.color"
                            track-color="grey-4"
                            class="conteo-progress__bar"
                          />
                        </div>
                      </div>
                      <div class="text-caption q-mt-sm text-weight-medium">
                        {{
                          bancoCumpleGrupoTipo
                            ? 'Grupos de tipo completos'
                            : faltantesGrupoTipoLabel
                        }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- Lista de preguntas -->
              <div
                v-if="!puedeVisualizarBanco"
                class="text-center q-pa-xl bg-grey-1 rounded-borders"
              >
                <q-icon name="filter_alt" size="56px" color="grey-5" />
                <p class="text-h6 text-grey-7 q-mt-md">Selecciona el parcial y el grupo</p>
                <p class="text-caption text-grey-6 q-mb-sm">
                  El banco se visualizará cuando elijas ambos filtros.
                </p>
                <p class="text-caption text-grey-6 q-mb-none">
                  Después podrás revisar las preguntas registradas para esa combinación.
                </p>
              </div>

              <div
                v-else-if="preguntasFiltradas.length === 0"
                class="text-center q-pa-xl bg-grey-1 rounded-borders"
              >
                <q-icon name="quiz" size="56px" color="grey-4" />
                <p class="text-h6 text-grey-6 q-mt-md">No hay preguntas registradas</p>
                <p class="text-caption text-grey-5">
                  No se encontraron preguntas para {{ filtroBancoDescripcion }}.
                </p>
              </div>

              <div v-else class="q-gutter-sm">
                <q-card
                  v-for="pregunta in preguntasConNumeracion"
                  :key="pregunta.id"
                  flat
                  bordered
                  class="pregunta-card"
                >
                  <q-card-section>
                    <div class="row items-start">
                      <q-badge
                        v-if="pregunta.numeroVisual"
                        color="deep-purple"
                        :label="pregunta.numeroVisual"
                        class="q-mr-sm q-mt-xs"
                      />
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
                            >{{ getParcialLabelBanco(pregunta.parcial) }}</q-chip
                          >
                          <q-chip
                            :color="
                              getTipoColorBanco(
                                pregunta.tipo,
                                pregunta,
                                gruposCabeceraBancoMap.value,
                              )
                            "
                            text-color="white"
                            size="xs"
                            dense
                          >
                            {{
                              getTipoLabelBanco(
                                pregunta.tipo,
                                pregunta,
                                gruposCabeceraBancoMap.value,
                              )
                            }}
                          </q-chip>
                          <q-chip
                            v-if="obtenerGrupoTeoricoPregunta(pregunta)"
                            color="blue-1"
                            text-color="blue-10"
                            size="sm"
                            icon="school"
                            dense
                            class="text-weight-bold"
                          >
                            GT: {{ obtenerGrupoTeoricoPregunta(pregunta) }}
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
                          <template
                            v-if="
                              !gruposBloqueados.has(
                                normalizeGroupName(obtenerGrupoTeoricoPregunta(pregunta)),
                              )
                            "
                          >
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
                          </template>
                          <q-icon v-else name="lock" color="orange-7" size="sm">
                            <q-tooltip>Grupo bloqueado: examen ya generado</q-tooltip>
                          </q-icon>
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
          </template>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- ============================================================ -->

    <!-- DIALOG: Reporte de Validación de Banco -->
    <q-dialog v-model="showDialogValidacion" persistent>
      <q-card style="min-width: 700px; max-width: 95vw; max-height: 80vh" class="column no-wrap">
        <q-toolbar class="bg-deep-purple text-white shadow-1">
          <q-toolbar-title>Reporte de Validación Técnica</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-md bg-grey-1">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-card flat bordered class="text-center q-pa-sm bg-white">
                <div class="text-h4 text-weight-bold">{{ reporteValidacion.total }}</div>
                <div class="text-caption text-grey-7">Total Preguntas</div>
              </q-card>
            </div>
            <div class="col-12 col-md-4">
              <q-card flat bordered class="text-center q-pa-sm bg-green-1">
                <div class="text-h4 text-weight-bold text-green-9">
                  {{ reporteValidacion.validas }}
                </div>
                <div class="text-caption text-green-7">Sin Errores</div>
              </q-card>
            </div>
            <div class="col-12 col-md-4">
              <q-card
                flat
                bordered
                class="text-center q-pa-sm"
                :class="reporteValidacion.errores.length > 0 ? 'bg-red-1' : 'bg-grey-1'"
              >
                <div
                  class="text-h4 text-weight-bold"
                  :class="reporteValidacion.errores.length > 0 ? 'text-red-9' : 'text-grey-7'"
                >
                  {{ reporteValidacion.errores.length }}
                </div>
                <div
                  class="text-caption"
                  :class="reporteValidacion.errores.length > 0 ? 'text-red-7' : 'text-grey-7'"
                >
                  Con Observaciones
                </div>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="col scroll q-pa-none">
          <div v-if="reporteValidacion.errores.length === 0" class="text-center q-pa-xl">
            <q-icon name="verified" color="green" size="64px" />
            <div class="text-h6 text-green q-mt-md">¡Todo está correcto!</div>
            <p class="text-grey-7">
              El banco de preguntas cumple con todos los requisitos técnicos para la impresión.
            </p>
          </div>

          <q-list v-else bordered separator>
            <q-item v-for="(err, i) in reporteValidacion.errores" :key="i" class="q-py-md">
              <q-item-section avatar top>
                <q-avatar color="red-1" text-color="red" icon="error_outline" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-indigo-9">
                  Pregunta #{{ err.numero }}
                  <small class="text-grey-6 q-ml-sm">[{{ err.tipo }}]</small>
                </q-item-label>
                <q-item-label caption class="q-mb-sm">
                  <div v-html="err.enunciado"></div>
                </q-item-label>

                <div class="q-gutter-y-xs">
                  <div
                    v-for="(msg, mi) in err.mensajes"
                    :key="mi"
                    class="row items-center text-red text-caption"
                  >
                    <q-icon name="circle" size="6px" class="q-mr-xs" />
                    {{ msg }}
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="bg-grey-1 q-pa-md">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
              <strong
                >Verdadero o Falso Simple, Verdadero o Falso Complejas, Respuesta A/B/Ambas/Ninguna,
                Selección de la mejor respuesta, Emparejamiento Ampliado, Opción de Emparejamiento,
                Ítems agrupados por caso clínico o problema y Subítem</strong
              >.
            </q-banner>

            <q-card flat bordered class="bg-indigo-1 q-mb-md">
              <q-card-section class="row q-col-gutter-sm items-center">
                <div class="col-12 col-md-6">
                  <div class="text-caption text-indigo-8 text-weight-bold">Parcial activo</div>
                  <q-chip color="deep-purple" text-color="white" icon="event_note">
                    {{ getParcialLabelBanco(parcialSeleccionado) }}
                  </q-chip>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-caption text-indigo-8 text-weight-bold">Grupo activo</div>
                  <q-chip
                    :color="grupoTeoricoSeleccionado ? 'teal' : 'grey-6'"
                    text-color="white"
                    icon="groups"
                  >
                    {{
                      grupoTeoricoSeleccionado
                        ? `Grupo ${grupoTeoricoSeleccionado}`
                        : 'Sin grupo seleccionado'
                    }}
                  </q-chip>
                </div>
              </q-card-section>
            </q-card>

            <div class="row items-center q-mb-md bg-grey-1 q-pa-sm rounded-borders border-dashed">
              <div class="col">
                <div class="text-weight-bold text-deep-purple-9">Cartilla de Respuestas</div>
                <div class="text-caption text-grey-7">Generar hoja óptica automática</div>
              </div>
              <div class="col-auto">
                <q-btn-toggle
                  v-model="conCartilla"
                  toggle-color="deep-purple"
                  flat
                  stretch
                  :options="[
                    { label: 'Con Cartilla', value: true },
                    { label: 'Sin Cartilla', value: false },
                  ]"
                />
              </div>
            </div>

            <!-- Advertencia Sin Cartilla -->
            <transition
              appear
              enter-active-class="animated fadeIn"
              leave-active-class="animated fadeOut"
            >
              <q-banner
                v-if="!conCartilla"
                class="bg-deep-orange-1 text-deep-orange-10 q-mb-md border-deep-orange"
                rounded
                dense
              >
                <template v-slot:avatar>
                  <q-icon name="mail_outline" color="deep-orange-10" />
                </template>
                <div class="text-weight-bold">AVISO IMPORTANTE:</div>
                <div class="text-caption" style="line-height: 1.4">
                  Al marcar <strong>"Sin Cartilla"</strong>, el sistema NO generará la hoja óptica.
                  <strong>Se debe enviar el documento de evaluación</strong>
                  al correo de evaluaciones correspondiente a la sede
                  <strong>{{ nombreSede }}</strong
                  >. <br /><br />
                  <strong>Incluir en el correo:</strong><br />
                  • Carrera:
                  {{ asignatura?.carreras?.[0]?.nombre || 'No especificada' }}<br />
                  • Asignatura:
                  {{ asignatura?.nombre }} ({{ asignatura?.sigla }})<br />
                  • Grupo:
                  {{ grupoTeoricoSeleccionado }}<br />
                  • Docente:
                  {{ authStore.usuarioActual?.docente?.nombre_completo || authStore.nombreCompleto
                  }}<br />
                  • Fecha y hora del examen programado.
                </div>
              </q-banner>
            </transition>

            <!-- Aviso de bloqueo por grupo -->
            <q-banner
              v-if="grupoTeoricoSeleccionado && grupoImportacionBloqueado"
              class="bg-red-1 text-red-10 q-mb-md"
              rounded
              dense
            >
              <template v-slot:avatar><q-icon name="lock" color="red-10" /></template>
              <strong>Importación bloqueada:</strong> El
              <strong>Grupo {{ grupoTeoricoSeleccionado }}</strong> ya tiene un examen en estado
              <em>Generado o superior</em>. No es posible reemplazar el banco de preguntas.
            </q-banner>

            <div v-if="conCartilla">
              <q-file
                v-model="archivoBancoFile"
                outlined
                label="Seleccionar archivo Excel (.xlsx)"
                accept=".xlsx,.xls"
                :disable="!grupoTeoricoSeleccionado || grupoImportacionBloqueado"
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
          </div>

          <!-- Paso 2: Previsualización -->
          <div v-else>
            <!-- Stats -->
            <div class="import-stats q-mb-md font-mono">
              <q-badge color="deep-purple" class="q-pa-sm">
                Total: {{ importStats.total }} preguntas
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
            <!-- Validacion de minimos -->
            <q-banner
              v-if="importStats.total > 0 && !validacionDistribucion"
              class="bg-orange-1 text-orange-10 q-mb-md border-orange"
              rounded
              dense
            >
              <template v-slot:avatar><q-icon name="warning" /></template>
              <div v-if="importacionAcumulativaSegundoParcial" class="text-caption">
                En 2do Parcial puedes cargar bancos parciales, pero este archivo no contiene
                preguntas válidas para agregar.
              </div>
              <template v-else>
                <div class="text-weight-bold text-caption">No se cumple el mínimo requerido:</div>
                <div class="text-caption">
                  15 Fáciles (Faltan: {{ Math.max(0, 15 - importStats.faciles) }}), 30 Medias
                  (Faltan: {{ Math.max(0, 30 - importStats.medios) }}), 15 Difíciles (Faltan:
                  {{ Math.max(0, 15 - importStats.dificiles) }}).
                </div>
              </template>
            </q-banner>
            <q-banner
              v-if="importStats.total > 0 && validacionDistribucion"
              class="bg-green-1 text-green-10 q-mb-md"
              rounded
              dense
            >
              <template v-slot:avatar><q-icon name="check_circle" /></template>
              <div
                v-if="importacionAcumulativaSegundoParcial"
                class="text-weight-bold text-caption"
              >
                Archivo valido para agregar al banco acumulativo de 2do Parcial.
              </div>
              <div v-else class="text-weight-bold text-caption">
                Distribución válida para importar.
              </div>
            </q-banner>
            <!-- Errores Detalles -->
            <div v-if="importErroresNormalizados.length > 0" class="q-mb-md">
              <div class="text-subtitle2 text-red q-mb-xs flex items-center">
                <q-icon name="error" class="q-mr-xs" />
                {{ importErroresNormalizados.length }} error(es) en el archivo:
              </div>
              <q-scroll-area
                style="height: 300px; border: 1px solid #ffcdd2"
                class="bg-red-0 rounded-borders"
              >
                <q-list separator class="bg-red-1">
                  <q-item v-for="(err, i) in importErroresNormalizados" :key="i" class="q-py-sm">
                    <q-item-section>
                      <q-item-label class="text-weight-bold text-red-9">
                        Fila {{ err.fila }}
                        <small class="text-grey-7">[{{ err.tipo?.toUpperCase() }}]</small>
                      </q-item-label>
                      <q-item-label caption class="text-grey-7 ellipsis" style="max-width: 400px">
                        <div v-html="err.enunciado" />
                      </q-item-label>
                      <div class="q-mt-xs">
                        <div
                          v-for="(msg, midx) in err.mensajes"
                          :key="midx"
                          class="text-caption text-red-8 flex items-center"
                        >
                          <q-icon name="arrow_right" size="16px" /> {{ msg }}
                        </div>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-scroll-area>
            </div>

            <!-- Previsualización 5 primeras -->
            <div class="text-subtitle2 q-mb-xs">
              <q-icon name="preview" color="indigo" class="q-mr-xs" />
              Vista previa (primeras {{ Math.min(5, preguntasImportadas.length) }}):
            </div>
            <div class="preview-list q-mb-md">
              <div v-for="(p, i) in preguntasImportadas.slice(0, 5)" :key="i" class="preview-item">
                <div class="row items-center q-gutter-xs q-mb-xs">
                  <q-chip :color="getChipColorTipo(p.tipo)" text-color="white" size="xs" dense>
                    {{ getTipoLabelBanco(p.tipo, p) }}
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
                    Respuesta:
                    {{ p.respuesta }}
                  </q-chip>
                </div>
                <div class="text-body2 preview-texto" v-html="p.enunciado"></div>
              </div>
            </div>
            <!-- Aviso de Reemplazo Forzado -->
            <q-separator class="q-mb-md" />
            <q-banner
              v-if="importacionAcumulativaSegundoParcial"
              class="bg-teal-1 text-teal-10"
              rounded
              dense
            >
              <template v-slot:avatar><q-icon name="library_add" /></template>
              <div class="text-weight-bold">Importación acumulativa</div>
              <div class="text-caption">
                En 2do Parcial este archivo se <b>agregará</b> al banco actual del grupo y parcial.
                Las preguntas duplicadas por enunciado no se volverán a registrar.
              </div>
            </q-banner>
            <q-banner v-else class="bg-red-1 text-red-10" rounded dense>
              <template v-slot:avatar><q-icon name="warning" /></template>
              <div class="text-weight-bold">Aviso Importante</div>
              <div class="text-caption">
                Esta importación <b>reemplazará</b> todo el banco de preguntas actual de la
                asignatura para el grupo y parcial seleccionados. Cualquier pregunta registrada
                previamente será eliminada.
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
          <q-btn flat label="Cancelar" @click="cerrarDialogImportBanco" no-caps />
          <q-btn
            v-if="!conCartilla && !archivoPreviewBanco"
            unelevated
            color="deep-orange"
            icon="save"
            label="Guardar Preferencia Sin Cartilla"
            :loading="importandoBanco"
            no-caps
            @click="confirmarConfiguracionSinCartilla"
          />
          <q-btn
            v-if="conCartilla && !archivoPreviewBanco"
            flat
            color="primary"
            icon="settings_backup_restore"
            label="Restablecer a Con Cartilla"
            :loading="importandoBanco"
            no-caps
            @click="guardarConfiguracionSinCartillaTrue"
          />
          <q-btn
            v-if="archivoPreviewBanco"
            unelevated
            color="deep-purple"
            icon="upload"
            :label="`Importar ${preguntasImportadas.length} pregunta(s)`"
            :disable="
              preguntasImportadas.length === 0 ||
              importErroresNormalizados.length > 0 ||
              !validacionDistribucion ||
              !grupoTeoricoSeleccionado
            "
            :loading="importandoBanco"
            no-caps
            @click="confirmarImportacionBanco"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ============================================================ -->
    <!-- DIALOG: Configurar ParÒ�� �"Ò� â����Ò�â��šÒ�a�¡metros del Formato -->
    <!-- ============================================================ -->

    <!-- Dialog BibliografÒ�� �"Ò� â����Ò�â��šÒ�a�­a -->
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
            <q-input
              v-model="formBiblio.descripcion"
              label="Referencia bibliográfica"
              type="textarea"
              outlined
              autogrow
              class="full-width"
            />

            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-select
                  v-model="formBiblio.tipo"
                  label="Tipo"
                  :options="[
                    { label: 'Básica / Oficial', value: 'BASICA' },
                    { label: 'Complementaria', value: 'COMPLEMENTARIA' },
                  ]"
                  emit-value
                  map-options
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
            Importar Programa AnalÒ�� �"Ò� â����Ò�â��šÒ�a�­tico (Formato Oficial Sede Central)
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-banner rounded class="bg-amber-1 text-black q-mb-md">
            <template v-slot:avatar>
              <q-icon name="warning" color="warning" />
            </template>
            <div class="text-weight-bold">
              Ò�� �"Ò¢â�a¬�&¡Ò�â��šÒ�a�¡AtenciÒ�� �"Ò� â����Ò�â��šÒ�a�³n! Utilice la Plantilla
              Oficial
            </div>
            <div>
              Esta funciÒ�� �"Ò� â����Ò�â��šÒ�a�³n requiere estrictamente el
              <strong>Documento Word Oficial de Programa de Asignatura</strong>
              proporcionado por Sede Central.
              <br />
              <br />
              <strong>Nota:</strong> Otros formatos o documentos modificados estructuralmente no
              serÒ�� �"Ò� â����Ò�â��šÒ�a�¡n procesados correctamente.
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
            <div class="text-weight-bold">ImportaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n de Metadatos</div>
            <div>
              Esta funciÒ�� �"Ò� â����Ò�â��šÒ�a�³n carga los datos generales del programa
              (JustificaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n, Objetivos, Competencias, MetodologÒ�� �"Ò�
              â����Ò�â��šÒ�a�­a, etc.) desde un archivo Excel.
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
            JustificaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n, PropÒ�� �"Ò� â����Ò�â��šÒ�a�³sito General, etc.)
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
            <div class="text-weight-bold">
              ImportaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n de Unidades y Temas
            </div>
            <div>
              Esta funciÒ�� �"Ò� â����Ò�â��šÒ�a�³n carga la planificaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n
              detallada (unidades, temas, contenidos, estrategias) desde un archivo Excel.
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
            * Se espera que el archivo contenga hojas con el formato de Avance ProgramÒ�� �"Ò�
            â����Ò�â��šÒ�a�¡tico o Plan de Clase.
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
          <q-icon
            :name="modoRegistroPregunta === 'create' ? 'add_circle' : 'edit'"
            size="24px"
            class="q-mr-sm"
          />
          <div class="text-h6">
            {{ modoRegistroPregunta === 'create' ? 'Registrar Nueva Pregunta' : 'Editar Pregunta' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </div>

        <q-card-section class="q-pa-lg scroll" style="max-height: 70vh">
          <q-form ref="formEditarPregRef" class="q-gutter-y-md">
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
                  max-file-size="5242880"
                  hint="Tamaño máximo: 5 MB"
                  @rejected="onArchivoImagenPreguntaRejected"
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
                  style="height: 140px; max-width: 240px; border-radius: 4px"
                  fit="contain"
                  class="bg-grey-2"
                />
              </div>
            </div>

            <q-banner
              v-if="modoRegistroPregunta === 'create' && descripcionRegistroManualPregunta"
              class="bg-blue-1 text-blue-10 rounded-borders"
            >
              <template v-slot:avatar>
                <q-icon name="info" color="blue-9" />
              </template>
              <div class="text-body2">
                {{ descripcionRegistroManualPregunta }}
              </div>
              <template v-slot:action>
                <q-btn
                  flat
                  dense
                  no-caps
                  color="blue-10"
                  icon="visibility"
                  label="Ver ejemplo"
                  @click.stop="abrirEjemploTipoPregunta"
                />
              </template>
            </q-banner>

            <div class="row q-col-gutter-md items-start">
              <div class="col-12">
                <q-select
                  v-model="formPregunta.tipo"
                  label="Tipo de Pregunta"
                  outlined
                  dense
                  :options="tiposPreguntaRegistroManualOptions"
                  emit-value
                  map-options
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formPregunta.parcial"
                  label="Parcial Activo"
                  outlined
                  dense
                  readonly
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  :model-value="formPregunta.grupoTeorico || filtroBancoGrupoSeleccionado"
                  label="Grupo Teórico"
                  outlined
                  dense
                  readonly
                />
              </div>
              <div
                class="col-12 col-md-4"
                v-if="modoRegistroPregunta === 'create' && registroManualEsMacro"
              >
                <q-input
                  v-model="formPregunta.grupo"
                  label="Grupo de referencia"
                  outlined
                  dense
                  readonly
                />
              </div>
            </div>

            <div
              v-if="
                modoRegistroPregunta === 'create' &&
                [
                  'FALSO_VERDADERO',
                  'RESPUESTA_COMPUESTA',
                  'PREGUNTA_CON_CLAVE',
                  'SELECCION_SIMPLE',
                ].includes(tipoRegistroPregunta)
              "
              class="q-gutter-y-md"
            >
              <div v-if="registroManualRequiereDificultadSimple" class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="text-caption text-weight-medium text-grey-8 q-mb-sm">Dificultad</div>
                  <q-btn-toggle
                    v-model="formPregunta.dificultad"
                    :options="dificultadPreguntaOptions"
                    unelevated
                    no-caps
                    spread
                    toggle-color="deep-purple"
                    color="grey-2"
                    text-color="grey-8"
                    class="full-width"
                  />
                </div>
              </div>

              <q-input
                v-if="tipoRegistroPregunta !== 'RESPUESTA_COMPUESTA'"
                v-model="formPregunta.enunciado"
                :label="
                  tipoRegistroPregunta === 'RESPUESTA_COMPUESTA'
                    ? 'Enunciado / instrucción general'
                    : 'Enunciado de la pregunta'
                "
                type="textarea"
                outlined
                autogrow
                rows="6"
              />

              <div v-if="tipoRegistroPregunta === 'FALSO_VERDADERO'">
                <div class="text-subtitle2 q-mb-sm">Respuesta correcta</div>
                <q-option-group
                  v-model="formPregunta.respuesta_correcta"
                  :options="respuestaVerdaderoFalsoOptions"
                  color="deep-purple"
                  inline
                />
              </div>

              <div v-else-if="tipoRegistroPregunta === 'RESPUESTA_COMPUESTA'" class="q-gutter-y-sm">
                <q-input
                  v-model="formPregunta.premisas[0]"
                  label="Premisa 1"
                  type="textarea"
                  outlined
                  autogrow
                  rows="2"
                />
                <q-input
                  v-model="formPregunta.premisas[1]"
                  label="Premisa 2"
                  type="textarea"
                  outlined
                  autogrow
                  rows="2"
                />
                <div class="text-subtitle2 q-mb-sm">Respuesta correcta</div>
                <q-option-group
                  v-model="formPregunta.respuesta_correcta"
                  :options="respuestaCompuestaOptions"
                  color="deep-purple"
                />
              </div>

              <div v-else-if="tipoRegistroPregunta === 'PREGUNTA_CON_CLAVE'" class="q-gutter-y-sm">
                <div class="text-subtitle2">Incisos base</div>
                <q-input
                  v-for="(inciso, index) in formPregunta.incisosClave"
                  :key="`inciso-clave-${index}`"
                  v-model="formPregunta.incisosClave[index]"
                  :label="`Inciso ${index + 1}`"
                  type="textarea"
                  outlined
                  autogrow
                  rows="2"
                />
                <q-banner class="bg-indigo-1 text-indigo-10 rounded-borders">
                  <strong>Combinaciones fijas:</strong>
                  A: 1, 2 y 3 verdaderas. B: 1 y 3 verdaderas. C: 2 y 4 verdaderas. D: solo 4
                  verdadera. E: todas verdaderas.
                </q-banner>
                <div class="text-subtitle2 q-mb-sm">Respuesta correcta</div>
                <q-option-group
                  v-model="formPregunta.respuesta_correcta"
                  :options="respuestaPreguntaClaveOptions"
                  color="deep-purple"
                />
              </div>

              <div v-else-if="tipoRegistroPregunta === 'SELECCION_SIMPLE'" class="q-gutter-y-sm">
                <div class="text-subtitle2">Incisos de respuesta</div>
                <div
                  v-for="(op, i) in formPregunta.opciones"
                  :key="`opcion-simple-${i}`"
                  class="row items-center q-gutter-x-sm"
                >
                  <q-avatar size="sm" color="grey-3" text-color="grey-8" font-size="12px">{{
                    String.fromCharCode(65 + i)
                  }}</q-avatar>
                  <q-input v-model="formPregunta.opciones[i]" dense outlined class="col" />
                </div>
                <div class="text-subtitle2 q-mb-sm">Respuesta correcta</div>
                <q-option-group
                  v-model="formPregunta.respuesta_correcta"
                  :options="respuestaLetrasOptions"
                  color="deep-purple"
                  inline
                />
              </div>
            </div>

            <div
              v-else-if="
                modoRegistroPregunta === 'create' && tipoRegistroPregunta === 'EMPAREJAMIENTO'
              "
              class="q-gutter-y-md"
            >
              <q-input
                v-model="formPregunta.enunciado"
                label="Enunciado general del emparejamiento ampliado"
                type="textarea"
                outlined
                autogrow
                rows="8"
              />

              <div class="row q-col-gutter-md items-end">
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="formPregunta.cantidadClavesEmparejamiento"
                    :options="cantidadClavesEmparejamientoOptions"
                    label="Cantidad de opciones"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12 col-md-8">
                  <q-banner class="bg-teal-1 text-teal-10 rounded-borders">
                    Puedes trabajar con <strong>2 a 5 opciones</strong> y con
                    <strong>2 a 5 opciones ligadas</strong>. Las respuestas pueden repetirse; no se
                    exige una relación 1 a 1.
                  </q-banner>
                </div>
              </div>

              <div class="text-subtitle2">
                Opciones del emparejamiento ({{ clavesEmparejamientoActivas.length }})
              </div>
              <div class="row q-col-gutter-md">
                <div
                  v-for="clave in clavesEmparejamientoActivas"
                  :key="`termino-emp-${clave.id}`"
                  class="col-12"
                >
                  <q-input
                    v-model="formPregunta.terminosEmparejamiento[clave.index]"
                    :label="`Opción ${clave.id}`"
                    outlined
                    dense
                  />
                </div>
              </div>

              <div class="row items-center">
                <div class="text-subtitle2">Enunciados del emparejamiento ampliado</div>
                <q-space />
                <q-btn
                  flat
                  color="teal-8"
                  icon="add"
                  label="Agregar enunciado"
                  no-caps
                  :disable="formPregunta.preguntasLigadas.length >= 5"
                  @click="agregarPreguntaLigadaRegistro"
                />
              </div>

              <q-card
                v-for="(preguntaLigada, index) in formPregunta.preguntasLigadas"
                :key="`emp-ligada-${index}`"
                flat
                bordered
                class="q-pa-md"
              >
                <div class="row items-center q-mb-md">
                  <div class="text-subtitle2">Enunciado {{ index + 1 }}</div>
                  <q-space />
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    :disable="formPregunta.preguntasLigadas.length <= 2"
                    @click="eliminarPreguntaLigadaRegistro(index)"
                  />
                </div>

                <div class="q-gutter-y-sm">
                  <q-input
                    v-model="preguntaLigada.enunciado"
                    label="Texto del enunciado"
                    type="textarea"
                    outlined
                    autogrow
                    rows="4"
                  />
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <div class="text-caption text-weight-medium text-grey-8 q-mb-sm">
                        Dificultad
                      </div>
                      <q-btn-toggle
                        v-model="preguntaLigada.dificultad"
                        :options="dificultadPreguntaOptions"
                        unelevated
                        no-caps
                        spread
                        toggle-color="teal"
                        color="grey-2"
                        text-color="grey-8"
                        class="full-width"
                      />
                    </div>
                  </div>
                  <div class="text-subtitle2 q-mb-sm">Respuesta correcta</div>
                  <q-option-group
                    v-model="preguntaLigada.respuesta_correcta"
                    :options="respuestaEmparejamientoOptions"
                    color="deep-purple"
                    inline
                  />
                </div>
              </q-card>
            </div>

            <div
              v-else-if="modoRegistroPregunta === 'create' && tipoRegistroPregunta === 'PROBLEMA'"
              class="q-gutter-y-md"
            >
              <q-input
                v-model="formPregunta.enunciado"
                label="Enunciado general del caso clínico o problema"
                type="textarea"
                outlined
                autogrow
                rows="10"
              />

              <div class="row items-center">
                <div class="text-subtitle2">Subproblemas ligados</div>
                <q-space />
                <q-btn
                  flat
                  color="deep-purple-8"
                  icon="add"
                  label="Agregar subproblema"
                  no-caps
                  @click="agregarPreguntaLigadaRegistro"
                />
              </div>

              <q-card
                v-for="(preguntaLigada, index) in formPregunta.preguntasLigadas"
                :key="`subproblema-${index}`"
                flat
                bordered
                class="q-pa-md"
              >
                <div class="row items-center q-mb-md">
                  <div class="text-subtitle2">Subproblema {{ index + 1 }}</div>
                  <q-space />
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    :disable="formPregunta.preguntasLigadas.length === 1"
                    @click="eliminarPreguntaLigadaRegistro(index)"
                  />
                </div>

                <div class="q-gutter-y-sm">
                  <q-input
                    v-model="preguntaLigada.enunciado"
                    label="Enunciado del subproblema"
                    type="textarea"
                    outlined
                    autogrow
                    rows="2"
                  />
                  <div
                    v-for="(op, opIndex) in preguntaLigada.opciones"
                    :key="`sub-op-${index}-${opIndex}`"
                    class="row items-center q-gutter-x-sm"
                  >
                    <q-avatar size="sm" color="grey-3" text-color="grey-8" font-size="12px">{{
                      String.fromCharCode(65 + opIndex)
                    }}</q-avatar>
                    <q-input
                      v-model="preguntaLigada.opciones[opIndex]"
                      dense
                      outlined
                      class="col"
                    />
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <div class="text-caption text-weight-medium text-grey-8 q-mb-sm">
                        Dificultad
                      </div>
                      <q-btn-toggle
                        v-model="preguntaLigada.dificultad"
                        :options="dificultadPreguntaOptions"
                        unelevated
                        no-caps
                        spread
                        toggle-color="deep-purple"
                        color="grey-2"
                        text-color="grey-8"
                        class="full-width"
                      />
                    </div>
                  </div>
                  <div class="text-subtitle2 q-mb-sm">Respuesta correcta</div>
                  <q-option-group
                    v-model="preguntaLigada.respuesta_correcta"
                    :options="respuestaLetrasOptions"
                    color="deep-purple"
                    inline
                  />
                </div>
              </q-card>
            </div>

            <q-banner
              v-else-if="modoRegistroPregunta === 'create' && registroManualEsTipoLigado"
              class="bg-orange-1 text-orange-10 rounded-borders"
            >
              <template v-slot:avatar>
                <q-icon name="warning" color="orange-9" />
              </template>
              Este tipo se registra desde su estructura principal:
              <strong>
                {{
                  tipoRegistroPregunta === 'OPCION_EMPAREJAMIENTO'
                    ? getTipoLabelBanco('EMPAREJAMIENTO')
                    : getTipoLabelBanco('PROBLEMA')
                }}
              </strong>
            </q-banner>

            <div v-else>
              <q-input
                v-model="formPregunta.enunciado"
                label="Enunciado de la Pregunta"
                type="textarea"
                outlined
                autogrow
                rows="6"
              />

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="text-caption text-weight-medium text-grey-8 q-mb-sm">Dificultad</div>
                  <q-btn-toggle
                    v-model="formPregunta.dificultad"
                    :options="dificultadPreguntaOptions"
                    unelevated
                    no-caps
                    spread
                    toggle-color="deep-purple"
                    color="grey-2"
                    text-color="grey-8"
                    class="full-width"
                  />
                </div>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-input
                    v-model="formPregunta.parcial"
                    label="Parcial Activo"
                    outlined
                    dense
                    readonly
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="formPregunta.grupo"
                    label="Grupo / Referencia"
                    outlined
                    dense
                    :readonly="filtroBancoParcialSeleccionado === '2P'"
                  />
                </div>
              </div>

              <div
                v-if="
                  [
                    'PREGUNTA_CON_CLAVE',
                    'SELECCION_SIMPLE',
                    'RESPUESTA_COMPUESTA',
                    'SUBPROBLEMA',
                    'FALSO_VERDADERO',
                  ].includes(normalizarTipoPregunta(formPregunta.tipo, formPregunta))
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
                    <q-radio
                      v-model="formPregunta.respuesta_correcta"
                      :val="String.fromCharCode(65 + i)"
                      label="Correcta"
                    />
                  </div>
                </div>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup no-caps />
          <q-btn
            flat
            color="indigo-8"
            icon="picture_as_pdf"
            label="Previsualizar PDF"
            no-caps
            :loading="previsualizandoRegistroPregunta"
            @click="previsualizarRegistroPreguntaPdf"
          />
          <q-btn
            unelevated
            :label="modoRegistroPregunta === 'create' ? 'Registrar Pregunta' : 'Guardar Cambios'"
            color="deep-purple"
            icon="save"
            :loading="guardandoEditPreg"
            @click="guardarPreguntaBanco"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="ejemploTipoPreguntaVisible">
      <q-card style="width: 760px; max-width: 96vw; border-radius: 18px">
        <q-card-section class="row items-center bg-blue-9 text-white">
          <q-icon name="visibility" size="24px" class="q-mr-sm" />
          <div class="text-h6">Ejemplo del tipo de pregunta</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="bg-blue-1 text-blue-10">
          <q-chip color="deep-purple" text-color="white">
            {{ ejemploTipoPregunta.tipoLabel }}
          </q-chip>
        </q-card-section>

        <q-separator />

        <q-card-section class="scroll q-pa-lg" style="max-height: 70vh">
          <div class="preview-paper">
            <div class="preview-section-title">{{ ejemploTipoPregunta.tipoHeading }}</div>
            <div
              v-for="(linea, index) in ejemploTipoPregunta.instrucciones"
              :key="`ejemplo-inst-${index}`"
              class="preview-instruction-line"
            >
              {{ linea }}
            </div>

            <div class="preview-question-block">
              <div
                v-for="(linea, index) in ejemploTipoPregunta.lineas"
                :key="`ejemplo-linea-${index}`"
                :class="linea.cssClass"
              >
                {{ linea.text }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Cerrar" color="blue-9" v-close-popup no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="previewRegistroPreguntaVisible">
      <q-card style="width: 860px; max-width: 96vw; border-radius: 18px">
        <q-card-section class="row items-center bg-indigo-9 text-white">
          <q-icon name="preview" size="24px" class="q-mr-sm" />
          <div class="text-h6">Vista previa de la pregunta</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="bg-indigo-1 text-indigo-10">
          <div class="row q-col-gutter-sm items-center">
            <div class="col-auto">
              <q-chip color="deep-purple" text-color="white">
                {{ previewRegistroPregunta.tipoLabel }}
              </q-chip>
            </div>
            <div class="col-auto">
              <q-chip color="teal" text-color="white">
                {{ getParcialLabelBanco(previewRegistroPregunta.parcial) }}
              </q-chip>
            </div>
            <div class="col-auto">
              <q-chip color="blue-1" text-color="blue-10">
                Grupo {{ previewRegistroPregunta.grupoTeorico || 'Sin grupo' }}
              </q-chip>
            </div>
            <div class="col-auto" v-if="previewRegistroPregunta.grupoReferencia">
              <q-chip color="amber-2" text-color="orange-10">
                Ref: {{ previewRegistroPregunta.grupoReferencia }}
              </q-chip>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="scroll q-pa-lg" style="max-height: 72vh">
          <div class="preview-paper">
            <div class="preview-section-title">{{ previewRegistroPregunta.tipoHeading }}</div>
            <div
              v-for="(linea, index) in previewRegistroPregunta.instrucciones"
              :key="`inst-${index}`"
              class="preview-instruction-line"
            >
              {{ linea }}
            </div>

            <div v-if="previewRegistroPregunta.imageSrc" class="q-mt-md text-center">
              <q-img
                :src="previewRegistroPregunta.imageSrc"
                fit="contain"
                style="max-height: 220px; max-width: 100%; border-radius: 8px"
                class="bg-grey-2"
              />
            </div>

            <div
              v-if="previewRegistroPregunta.tipo === 'FALSO_VERDADERO'"
              class="preview-question-block"
            >
              <div class="preview-question-line">
                1. ____ {{ previewRegistroPregunta.enunciado || 'Enunciado pendiente...' }}
              </div>
              <div class="preview-answer-note">
                Respuesta marcada: {{ previewRegistroPregunta.respuestaLabel }}
              </div>
            </div>

            <div
              v-else-if="previewRegistroPregunta.tipo === 'SELECCION_SIMPLE'"
              class="preview-question-block"
            >
              <div class="preview-question-line">
                1. {{ previewRegistroPregunta.enunciado || 'Enunciado pendiente...' }}
              </div>
              <div
                v-for="(opcion, index) in previewRegistroPregunta.opciones"
                :key="`preview-op-simple-${index}`"
                class="preview-option-line"
              >
                {{ opcion.id }}. {{ opcion.text || 'Opción pendiente...' }}
              </div>
              <div class="preview-answer-note">
                Respuesta marcada: {{ previewRegistroPregunta.respuestaLabel }}
              </div>
            </div>

            <div
              v-else-if="previewRegistroPregunta.tipo === 'PREGUNTA_CON_CLAVE'"
              class="preview-question-block"
            >
              <div class="preview-question-line">
                1. ____ {{ previewRegistroPregunta.enunciado || 'Enunciado pendiente...' }}
              </div>
              <div
                v-for="(inciso, index) in previewRegistroPregunta.incisos"
                :key="`preview-inciso-${index}`"
                class="preview-detail-line"
              >
                {{ index + 1 }}. {{ inciso || 'Inciso pendiente...' }}
              </div>
              <div class="preview-answer-note">
                Respuesta marcada: {{ previewRegistroPregunta.respuestaLabel }}
              </div>
            </div>

            <div
              v-else-if="previewRegistroPregunta.tipo === 'RESPUESTA_COMPUESTA'"
              class="preview-question-block"
            >
              <div class="preview-detail-line">
                I. {{ previewRegistroPregunta.premisas[0] || 'Premisa I pendiente...' }}
              </div>
              <div class="preview-detail-line">
                II. {{ previewRegistroPregunta.premisas[1] || 'Premisa II pendiente...' }}
              </div>
              <div class="preview-answer-note">
                Respuesta marcada: {{ previewRegistroPregunta.respuestaLabel }}
              </div>
            </div>

            <div
              v-else-if="previewRegistroPregunta.tipo === 'EMPAREJAMIENTO'"
              class="preview-question-block"
            >
              <div class="preview-question-line">
                {{
                  previewRegistroPregunta.enunciado ||
                  'De la lista de opciones, seleccione la respuesta correcta para cada enunciado'
                }}
              </div>
              <div
                v-for="(clave, index) in previewRegistroPregunta.claves"
                :key="`preview-clave-${index}`"
                class="preview-detail-line"
              >
                {{ clave.id }}. {{ clave.text || 'Opción pendiente...' }}
              </div>
              <div
                v-for="(ligada, index) in previewRegistroPregunta.preguntasLigadas"
                :key="`preview-emp-${index}`"
                class="preview-question-block q-mt-md"
              >
                <div class="preview-question-line">
                  {{ index + 1 }}. ____
                  {{ ligada.enunciado || 'Opción emparejamiento pendiente...' }}
                </div>
                <div class="preview-answer-note">
                  Dificultad: {{ ligada.dificultadLabel }} | Respuesta: {{ ligada.respuestaLabel }}
                </div>
              </div>
            </div>

            <div
              v-else-if="previewRegistroPregunta.tipo === 'PROBLEMA'"
              class="preview-question-block"
            >
              <div class="preview-question-line">
                CASO: {{ previewRegistroPregunta.enunciado || 'Caso pendiente...' }}
              </div>
              <div
                v-for="(ligada, index) in previewRegistroPregunta.preguntasLigadas"
                :key="`preview-sub-${index}`"
                class="preview-question-block q-mt-md"
              >
                <div class="preview-question-line">
                  {{ index + 1 }}. {{ ligada.enunciado || 'Subproblema pendiente...' }}
                </div>
                <div
                  v-for="(opcion, opIndex) in ligada.opciones"
                  :key="`preview-sub-op-${index}-${opIndex}`"
                  class="preview-option-line"
                >
                  {{ opcion.id }}.
                  {{ opcion.text || 'Opción pendiente...' }}
                </div>
                <div class="preview-answer-note">
                  Dificultad: {{ ligada.dificultadLabel }} | Respuesta: {{ ligada.respuestaLabel }}
                </div>
              </div>
            </div>

            <div v-else class="preview-question-block">
              <div class="preview-question-line">
                {{ previewRegistroPregunta.enunciado || 'Completa la pregunta para visualizarla.' }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Cerrar" color="indigo-8" v-close-popup no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Importar PlanificaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n Personal -->
    <q-dialog v-model="dialogImportarPersonal">
      <q-card style="width: 500px; max-width: 95vw; border-radius: 12px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold row items-center">
            <q-icon name="person_add" color="blue" class="q-mr-sm" size="28px" />
            Importar PlanificaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n Personal
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-banner rounded class="bg-blue-1 text-black q-mb-md">
            <template v-slot:avatar>
              <q-icon name="info" color="blue" />
            </template>
            <div class="text-weight-bold">ImportaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n de Datos Propios</div>
            <div class="q-mt-xs">
              Esta funciÒ�� �"Ò� â����Ò�â��šÒ�a�³n permite cargar sus estrategias, evaluaciones y
              secuencia didÒ�� �"Ò� â����Ò�â��šÒ�a�¡ctica desde Excel.
              <strong
                >Los datos existentes para sus temas serÒ�� �"Ò� â����Ò�â��šÒ�a�¡n
                actualizados.</strong
              >
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
            * El sistema identifica los temas por el nÒ�� �"Ò� â����Ò�â��šÒ�a�ºmero de Unidad y Tema
            especificado en el Excel.
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

              <!-- BotÒ�� �"Ò� â����Ò�â��šÒ�a�³n para agregar nuevo item -->
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
import { jsPDF } from 'jspdf'
import { useQuasar } from 'quasar'
import { useAsignaturasStore } from 'src/stores/asignaturas'
import { useCarrerasStore } from 'src/stores/carreras'
import { useSedesStore } from 'src/stores/sedes'
import { ROLES } from 'src/stores/auth'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'boot/axios'
import { generarProgramaAnaliticoPDF } from 'src/services/carpetaDocenteService'
import {
  EXAM_PDF_DEFAULT_CONFIG,
  createExamPdfDocument,
  generateExamPdf,
  mixExamQuestionOptions,
  sortExamQuestionsForPdf,
} from 'src/services/examPdfService'

// Helpers para contar logros e indicadores (consistente con backend/store)
function normalizeGroupName(name) {
  if (!name) return ''
  return String(name)
    .trim()
    .toUpperCase()
    .replace(/^(GRUPO|G-?)\s*/i, '')
}

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
const descargandoProgramaAnalitico = ref(false)

// Estado
// Leer el tab inicial desde los query params (para volver al tab correcto desde TemaEditPage)
// Para docentes, forzar siempre el tab "banco" ya que los demÒ�� �"Ò� â����Ò�â��šÒ�a�¡s estÒ�� �"Ò� â����Ò�â��šÒ�a�¡n ocultos
const tabInicial = (() => {
  if (authStore.rol === 'DOCENTE') return 'banco'
  return route.query.tab &&
    ['datos', 'programa', 'bibliografia', 'unidades', 'cronograma'].includes(route.query.tab)
    ? route.query.tab
    : 'datos'
})()
const tabActual = ref(tabInicial)
const asignatura = computed(() => store.asignaturaActual)

// ---- Medicion real de tabs para alinear el progress-strip ----

// Banco de preguntas real (desde API)
const bancoPreguntasLocal = ref([])
// ExÒ�� �"Ò� â����Ò�â��šÒ�a�¡menes de la asignatura (desde el rol de exÒ�� �"Ò� â����Ò�â��šÒ�a�¡menes general)
const examenesAsignatura = ref([])
const cargandoExamenes = ref(false)

// Generaciones manuales (para controlar el bloqueo del banco por grupo)
const generacionesManuales = ref([])

const parcialBancoActualNormalizado = computed(() =>
  normalizarParcialBanco(filtroBancoParcialSeleccionado.value || parcialSeleccionado.value || ''),
)

const importacionAcumulativaSegundoParcial = computed(
  () => parcialBancoActualNormalizado.value === '2P',
)

// Set de nombres de grupo (normalizados) que ya tienen un examen generado
const gruposBloqueados = computed(() => {
  const bloqueados = new Set()
  const parcialActual = parcialBancoActualNormalizado.value

  if (!parcialActual) {
    return bloqueados
  }

  // 1. Manuales del parcial activo
  generacionesManuales.value.forEach((gen) => {
    const parcialGeneracion = normalizarParcialBanco(gen.parcial || gen.tipo_examen || '')
    if (gen.grupo && parcialGeneracion === parcialActual) {
      bloqueados.add(normalizeGroupName(gen.grupo))
    }
  })

  // 2. Rol Regular del parcial activo (cualquier estado != programados bloquea)
  examenesAsignatura.value.forEach((exam) => {
    const parcialExamen = normalizarParcialBanco(exam.tipo_examen || exam.parcial || '')
    if (
      exam.estado &&
      exam.estado !== 'programados' &&
      exam.grupo &&
      parcialExamen === parcialActual
    ) {
      bloqueados.add(normalizeGroupName(exam.grupo))
    }
  })

  return bloqueados
})

const grupoImportacionBloqueado = computed(() => {
  if (!grupoTeoricoSeleccionado.value || importacionAcumulativaSegundoParcial.value) {
    return false
  }

  return gruposBloqueados.value.has(normalizeGroupName(grupoTeoricoSeleccionado.value))
})

onMounted(() => {
  cargarBancoPreguntas()
  cargarExamenes()
  cargarGeneracionesManuales()
})

// ---- Plan de Clase: calculado igual que por-unidad (garantiza coherencia) ----

// Cargar banco cuando cambie la asignatura (reactividad)
watch(
  () => asignatura.value?.id,
  (newId) => {
    if (newId) {
      cargarBancoPreguntas()
      cargarExamenes()
      cargarGeneracionesManuales()
    }
  },
)

// Watcher para redirigir a PlanificacionPage cuando se selecciona el tab cronograma
watch(tabActual, (newTab) => {
  if (newTab === 'cronograma') {
    // Redirigir a la pÒ�� �"Ò� â����Ò�â��šÒ�a�¡gina de planificaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n
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
let lastSavedSnapshot = '' // Snapshot del Ò�� �"Ò� â����Ò�â��šÒ�a�ºltimo estado guardado

// Opciones de ImportaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n
const importOpciones = ref({
  datos: false,
  unidades: true,
})

// Reporte de validacin
const showDialogValidacion = ref(false)
const reporteValidacion = ref({
  total: 0,
  validas: 0,
  errores: [],
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

// Reglas de Negocio para EdiciÒ�� �"Ò� â����Ò�â��šÒ�a�³n
const esDirectorOAdmin = computed(() => {
  // CORRECCION CRITICA: La propiedad del store es 'usuarioActual', no 'usuario'
  const rol = authStore.rol
  // Lista blanca de roles con permisos de ediciÒ�� �"Ò� â����Ò�â��šÒ�a�³n TOTAL (siempre pueden editar)
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

  // 1. Si estÒ�� �"Ò� â����Ò�â��šÒ�a�¡ APROBADO, nadie edita (salvo toggle admins)
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
    // Los docentes de Cochabamba (Sede 1) pueden editar campos compartidos/planificaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n general
    if (authSede === 1) return true

    // Resto de sedes: No pueden editar campos compartidos
    return false
  }

  return false
})

function puedeEditarCampo() {
  if (asignatura.value?.estado === 'APROBADO') return false

  // Reutilizar la lÒ�� �"Ò� â����Ò�â��šÒ�a�³gica centralizada
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

  // 3. Si soy docente (rol), mostrar MI nombre con lÒ�� �"Ò� â����Ò�â��šÒ�a�³gica robusta
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
    // aunque no estÒ�� �"Ò� â����Ò�â��šÒ�a�© explÒ�� �"Ò� â����Ò�â��šÒ�a�­citamente en el array de 'docentes' de la asignatura (casos de sync retardo)
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
  // El backend inyecta 'sede_nombre' basÒ�� �"Ò� â����Ò�â��šÒ�a�¡ndose en el docente_id de la peticiÒ�� �"Ò� â����Ò�â��šÒ�a�³n
  if (asignatura.value?.sede_nombre) return asignatura.value.sede_nombre

  // 2. Si es DOCENTE, priorizar SU Sede asignada (Contexto FÒ�� �"Ò� â����Ò�â��šÒ�a�­sico)
  if (authStore.rol === 'DOCENTE' && authStore.usuarioActual?.docente?.sede?.nombre) {
    return authStore.usuarioActual.docente.sede.nombre
  }

  if (!asignatura.value) return null

  // 1. RelaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n correcta: Array de Carreras (Sync)
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

  // 1. RelaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n correcta: Array de Carreras (Sync)
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

// Computed para bibliografÒ�� �"Ò� â����Ò�â��šÒ�a�­as separadas por tipo
// BibliografÒ�� �"Ò� â����Ò�â��šÒ�a�­as del Word (tipos en espaÒ�� �"Ò� â����Ò�â��šÒ�a�±ol)
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

// BibliografÒ�� �"Ò� â����Ò�â��šÒ�a�­as de la API Externa (Programa AnalÒ�� �"Ò� â����Ò�â��šÒ�a�­tico - tipos en inglÒ�� �"Ò� â����Ò�â��šÒ�a�©s)
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

// --- CÒ�� �"Ò� â����Ò�â��šÒ�a�¡lculo AutomÒ�� �"Ò� â����Ò�â��šÒ�a�¡tico Reactivado (Basado en Horas y Sesiones) ---
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

// ImportaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n
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

  // Permitir a docentes si estÒ�� �"Ò� â����Ò�â��šÒ�a�¡n asignados a la asignatura (independiente de sede)
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
    const opcionesEnvio = {
      datos: false,
      unidades: true,
      bibliografia: true,
    }

    await store.importarWord(asignatura.value.id, archivoImportar.value, opcionesEnvio)
    $q.notify({
      type: 'positive',
      message:
        'Programa AnalÒ�� �"Ò� â����Ò�â��šÒ�a�­tico importado con Ò�� �"Ò� â����Ò�â��šÒ�a�©xito.',
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
      message:
        'Plan de Clase importado con Ò�� �"Ò� â����Ò�â��šÒ�a�©xito (Unidades y Temas actualizados).',
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

    // Mostrar estadÒ�� �"Ò� â����Ò�â��šÒ�a�­sticas si estÒ�� �"Ò� â����Ò�â��šÒ�a�¡n disponibles
    const stats = res.data?.stats
    const msg = stats
      ? `Proceso finalizado. Actualizados: ${stats.updated}, Errores: ${stats.errors}`
      : 'PlanificaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n personal importada con Ò�� �"Ò� â����Ò�â��šÒ�a�©xito.'

    $q.notify({
      type: stats?.errors > 0 ? 'warning' : 'positive',
      message: msg,
      icon: stats?.errors > 0 ? 'warning' : 'check_circle',
      multiLine: true,
      actions: [{ label: 'Cerrar', color: 'white' }],
    })

    if (res.data?.errors?.length > 0) {
      console.warn('Errores de importaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n:', res.data.errors)
    }

    dialogImportarPersonal.value = false
  } catch (err) {
    $q.notify({
      type: 'negative',
      message:
        'Error al importar PlanificaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n Personal: ' +
        (err.response?.data?.error || err.message),
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

// Refs para ImportaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n (movidas arriba para evitar ReferenceError en watches)
const archivoBancoFile = ref(null)
const archivoPreviewBanco = ref(null)
const grupoTeoricoSeleccionado = ref(null)
const filtroBancoGrupoSeleccionado = ref(null)
const preguntasImportadas = ref([])
const importErrores = ref([])
const importErroresNormalizados = computed(() =>
  importErrores.value.map((error) => {
    if (typeof error === 'string') {
      return {
        fila: '-',
        tipo: '-',
        enunciado: 'Sin datos',
        mensajes: [normalizarTextoMojibake(error)],
      }
    }

    return {
      fila: error?.fila ?? '-',
      tipo: normalizarTextoMojibake(error?.tipo || '-'),
      enunciado: normalizarTextoMojibake(error?.enunciado || 'Sin datos'),
      mensajes: (Array.isArray(error?.mensajes) ? error.mensajes : [error?.mensajes])
        .filter(Boolean)
        .map((mensaje) => normalizarTextoMojibake(mensaje)),
    }
  }),
)
const importandoBanco = ref(false)
const modoImportacion = ref('reemplazar')
const conCartilla = ref(true)
const parcialSeleccionado = ref('1P')
const filtroBancoParcialSeleccionado = ref('2P')
const mostrarAccionesExcelBanco = computed(
  () => !!filtroBancoParcialSeleccionado.value && !!filtroBancoGrupoSeleccionado.value,
)
const mostrarBotonValidarBanco = false
const parcialOptions = [
  { label: '1er Parcial', value: '1P', disable: true },
  { label: '2do Parcial', value: '2P' },
  { label: 'Examen Final', value: 'EF', disable: true },
  { label: '2da Instancia', value: '2I', disable: true },
]

const tipoPreguntaExcelLabels = {
  FALSO_VERDADERO: 'Verdadero o Falso Simple',
  PREGUNTA_CON_CLAVE: 'Verdadero o Falso Complejas',
  RESPUESTA_COMPUESTA: 'Respuesta A/B/Ambas/Ninguna',
  SELECCION_SIMPLE: 'Selección de la mejor respuesta',
  EMPAREJAMIENTO: 'Emparejamiento Ampliado',
  OPCION_EMPAREJAMIENTO: 'Opción de Emparejamiento Ampliado',
  PROBLEMA: 'Ítems agrupados por caso clínico o problema',
  SUBPROBLEMA: 'Subítem de caso o problema',
}

const tiposPreguntaOptions = [
  {
    label: 'Verdadero o Falso Simple',
    value: 'FALSO_VERDADERO',
    aliases: [
      'FV',
      'FALSO_VERDADERO',
      'FALSO O VERDADERO',
      'VERDADERO O FALSO',
      tipoPreguntaExcelLabels.FALSO_VERDADERO,
    ],
  },
  {
    label: 'Respuesta A/B/Ambas/Ninguna',
    value: 'RESPUESTA_COMPUESTA',
    aliases: [
      'SM',
      'SELECCION_MULTIPLE',
      'RESPUESTA COMPUESTA',
      'RESPUESTA_COMPUESTA',
      tipoPreguntaExcelLabels.RESPUESTA_COMPUESTA,
    ],
  },
  {
    label: 'Verdadero o Falso Complejas',
    value: 'PREGUNTA_CON_CLAVE',
    aliases: [
      'PREGUNTA CON CLAVE',
      'PREGUNTA_CON_CLAVE',
      tipoPreguntaExcelLabels.PREGUNTA_CON_CLAVE,
    ],
  },
  {
    label: 'Selección de la mejor respuesta',
    value: 'SELECCION_SIMPLE',
    aliases: [
      'SS',
      'SU',
      'SELECCION_UNICA',
      'SELECCION SIMPLE',
      'SELECCION_SIMPLE',
      'SELECCIÓN DE LA MEJOR RESPUESTA',
      tipoPreguntaExcelLabels.SELECCION_SIMPLE,
    ],
  },
  {
    label: 'Emparejamiento Ampliado',
    value: 'EMPAREJAMIENTO',
    aliases: ['EM', 'EMPAREJAMIENTO', tipoPreguntaExcelLabels.EMPAREJAMIENTO],
  },
  {
    label: 'Opción de Emparejamiento Ampliado',
    value: 'OPCION_EMPAREJAMIENTO',
    aliases: [
      'OPCION EMPAREJAMIENTO',
      'OPCION_EMPAREJAMIENTO',
      'OPCION DE EMPAREJAMIENTO AMPLIADO',
      'OPCIÓN DE EMPAREJAMIENTO AMPLIADO',
      tipoPreguntaExcelLabels.OPCION_EMPAREJAMIENTO,
    ],
  },
  {
    label: 'Ítems agrupados por caso clínico o problema',
    value: 'PROBLEMA',
    aliases: [
      'PR',
      'PROBLEMA',
      'PROBLEMA O CASO',
      'ITEMS AGRUPADOS POR CASO CLINICO O PROBLEMA',
      'ÍTEMS AGRUPADOS POR CASO CLÍNICO O PROBLEMA',
      'ÍTEMS AGRUPADOS POR CASO CLÍNICO O PROBLEMA',
      tipoPreguntaExcelLabels.PROBLEMA,
    ],
  },
  {
    label: 'Subítem de caso o problema',
    value: 'SUBPROBLEMA',
    aliases: [
      'SP',
      'SUBPREGUNTA',
      'SUBPROBLEMA',
      'SUB PROBLEMA',
      'SUBITEM DE CASO O PROBLEMA',
      'SUBÍTEM DE CASO O PROBLEMA',
      tipoPreguntaExcelLabels.SUBPROBLEMA,
    ],
  },
]

const tipoPreguntaLabelMap = tiposPreguntaOptions.reduce((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {})

const tiposPreguntaRegistroManualOptions = tiposPreguntaOptions.filter(
  (option) => !['OPCION_EMPAREJAMIENTO', 'SUBPROBLEMA'].includes(option.value),
)

const normalizarTipoAliasKey = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()

const tipoPreguntaAliasMap = tiposPreguntaOptions.reduce((acc, option) => {
  option.aliases.forEach((alias) => {
    acc[String(alias).trim().toUpperCase()] = option.value
    acc[normalizarTipoAliasKey(alias)] = option.value
  })
  return acc
}, {})

function normalizarTipoPregunta(tipo, pregunta = null, gruposCabeceraMap = null) {
  const tipoEntrada = String(tipo || '')
    .trim()
    .toUpperCase()
  const tipoEntradaKey = normalizarTipoAliasKey(tipo)
  const tipoNormalizado =
    tipoPreguntaAliasMap[tipoEntrada] ||
    tipoPreguntaAliasMap[tipoEntradaKey] ||
    String(tipo || '')
      .trim()
      .toUpperCase()

  if (['SP', 'SUBPREGUNTA'].includes(tipoEntradaKey)) {
    const grupoNormalizado = normalizarTipoAliasKey(pregunta?.grupo || '')
    const tipoCabecera =
      gruposCabeceraMap?.get(grupoNormalizado) ||
      tipoPreguntaAliasMap[normalizarTipoAliasKey(pregunta?.tipoCabecera || '')]

    if (tipoCabecera === 'EMPAREJAMIENTO') {
      return 'OPCION_EMPAREJAMIENTO'
    }

    return 'SUBPROBLEMA'
  }

  if (tipoNormalizado === 'EM') return 'EMPAREJAMIENTO'
  if (tipoNormalizado === 'PR') return 'PROBLEMA'
  if (tipoNormalizado === 'SS' || tipoNormalizado === 'SU') return 'SELECCION_SIMPLE'
  if (tipoNormalizado === 'SM') return 'RESPUESTA_COMPUESTA'

  return tipoNormalizado
}

const importStats = ref({
  total: 0,
  faciles: 0,
  medios: 0,
  dificiles: 0,
})

watch(asignatura, (newVal) => {
  // Only update fields if we are NOT currently editing (to avoid overwrite)
  // Or check if ID changed (navigation)
  if (newVal && (!formDatos.value.codigo || formDatos.value.codigo !== newVal.codigo)) {
    cargarFormDatos()
  }
})

// Si se cambia a "Sin Cartilla", limpiar cualquier archivo seleccionado
watch(conCartilla, (val) => {
  if (!val) {
    archivoBancoFile.value = null
    archivoPreviewBanco.value = null
    preguntasImportadas.value = []
    importErrores.value = []
  }
})

watch(
  [filtroBancoParcialSeleccionado, filtroBancoGrupoSeleccionado],
  ([parcial, grupo]) => {
    parcialSeleccionado.value = parcial || '2P'
    grupoTeoricoSeleccionado.value = grupo || null
  },
  { immediate: true },
)

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

  // LÒ�� �"Ò� â����Ò�â��šÒ�a�³gica para priorizar datos del DOCENTE actual (Perfil) sobre los datos guardados en la asignatura
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
  // Cargar metodologÒ�� �"Ò� â����Ò�â��šÒ�a�­a estructurada
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
  // Si no hay elementos, inicializar con uno vacÒ�� �"Ò� â����Ò�â��šÒ�a�­o para la UI
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

  // Inicializar snapshot DESPUÒ�� �"Ò� â����Ò��¢Ò¢â��š�¬Ò�a�°S de cargar todos los datos
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

    // Comparar con el Ò�� �"Ò� â����Ò�â��šÒ�a�ºltimo snapshot guardado
    if (newValue === lastSavedSnapshot) return // Sin cambios reales

    saveStatus.value = 'saving'
    try {
      await guardadoInterno()
      lastSavedSnapshot = newValue // Actualizar snapshot despuÒ�� �"Ò� â����Ò�â��šÒ�a�©s de guardar
      saveStatus.value = 'saved'
      // Ocultar el indicador "Guardado" despuÒ�� �"Ò� â����Ò�â��šÒ�a�©s de 3 segundos
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

// FunciÒ�� �"Ò� â����Ò�â��šÒ�a�³n interna de guardado (sin notificaciones)
async function guardadoInterno() {
  // Sync Elementos de Competencia from Units
  if (asignatura.value?.unidades) {
    formPrograma.value.elementos_competencia = asignatura.value.unidades
      .sort((a, b) => a.numero - b.numero)
      .map((u) => u.elemento_competencia || '')
  }

  // Estructurar la metodologÒ�� �"Ò� â����Ò�â��šÒ�a�­a para el backend
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
  // Si el usuario es docente, guardamos estos cambios tambiÒ�� �"Ò� â����Ò�â��šÒ�a�©n en su perfil personal
  // para que persistan como SUS datos de contacto preferidos.
  if (authStore.rol === 'DOCENTE' && authStore.usuarioActual) {
    const perfilUpdate = {
      email: formDatos.value.docente_email, // Actualizar email de contacto
      // Asumimos que el backend acepta 'docente' object nested o campos planos
      // Ajustar segÒ�� �"Ò� â����Ò�â��šÒ�a�ºn la estructura de updateProfile en auth store
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

// FunciÒ�� �"Ò� â����Ò�â��šÒ�a�³n de guardado manual (backup, disponible para uso futuro)
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
    query: route.query, // SincronÒ�� �"Ò� â����Ò�â��šÒ�a�­a: Preservar docente_id para que el Director vea los datos correctos
  })
}

// BibliografÒ�� �"Ò� â����Ò�â��šÒ�a�­a
function abrirDialogBibliografia(biblio = null) {
  if (biblio) {
    editandoBiblio.value = true
    biblioSeleccionada.value = biblio
    formBiblio.value = {
      ...biblio,
      descripcion: textoBibliografia(biblio),
    }
  } else {
    editandoBiblio.value = false
    biblioSeleccionada.value = null
    formBiblio.value = { descripcion: '', tipo: 'COMPLEMENTARIA' }
  }
  dialogBibliografia.value = true
}

function guardarBibliografia() {
  const descripcion = String(formBiblio.value.descripcion || '').trim()
  if (!descripcion) {
    $q.notify({
      type: 'warning',
      message: 'Ingrese la referencia bibliográfica completa.',
      position: 'top',
    })
    return
  }

  const payload = {
    descripcion,
    tipo: formBiblio.value.tipo || 'COMPLEMENTARIA',
  }

  if (editandoBiblio.value) {
    store.updateBibliografia(asignatura.value.id, biblioSeleccionada.value.id, payload)
  } else {
    store.addBibliografia(asignatura.value.id, payload)
  }
  dialogBibliografia.value = false
  $q.notify({
    type: 'positive',
    message: 'BibliografÒ�� �"Ò� â����Ò�â��šÒ�a�­a guardada',
    position: 'top',
  })
}

function textoBibliografia(biblio) {
  if (!biblio) return ''
  if (biblio.descripcion) return biblio.descripcion

  return [biblio.autor, biblio.titulo, biblio.editorial, biblio.edicion, biblio.anio]
    .filter(Boolean)
    .join('. ')
}

function eliminarBibliografia(biblio) {
  store.deleteBibliografia(asignatura.value.id, biblio.id)
  $q.notify({
    type: 'info',
    message: 'BibliografÒ�� �"Ò� â����Ò�â��šÒ�a�­a eliminada',
    position: 'top',
  })
}

// GeneraciÒ�� �"Ò� â����Ò�â��šÒ�a�³n de PDFs (Legacy/Otros)
function resolverGrupoIdAsignatura(asig) {
  if (!asig) return null

  let grupoId = null

  // 1. Si hay docentes asignados, suelen tener el grupo en el pivot o estructura
  if (asig.docentes && asig.docentes.length > 0) {
    const docConGrupo = asig.docentes.find((d) => d.pivot && d.pivot.grupo_id)
    if (docConGrupo) {
      grupoId = docConGrupo.pivot.grupo_id
    } else if (asig.docentes[0].grupos && asig.docentes[0].grupos.length > 0) {
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

  return grupoId
}

function generarCarpetaHtml() {
  const asig = asignatura.value // Access ref value
  if (!asig) {
    $q.notify({ type: 'warning', message: 'No hay datos de asignatura cargados.' })
    return
  }

  console.log('Generando Carpeta HTML. Datos:', asig)
  const grupoId = resolverGrupoIdAsignatura(asig)

  if (grupoId) {
    const routeData = router.resolve({
      name: 'docente-carpeta',
      params: { id: grupoId },
    })
    window.open(routeData.href, '_blank')
  } else {
    $q.notify({
      type: 'warning',
      message:
        'No se encontrÒ�� �"Ò� â����Ò�â��šÒ�a�³ un grupo asociado para esta asignatura/docente.',
      caption: 'Verifique que la asignatura tenga un grupo y docente asignado.',
      timeout: 5000,
    })
  }
}

async function descargarProgramaAnaliticoDesdeGestion() {
  const asig = asignatura.value
  if (!asig) {
    $q.notify({ type: 'warning', message: 'No hay datos de asignatura cargados.' })
    return
  }

  const grupoId = resolverGrupoIdAsignatura(asig)
  if (!grupoId) {
    $q.notify({
      type: 'warning',
      message:
        'No se encontrÒ�� �"Ò� â����Ò�â��šÒ�a�³ un grupo asociado para esta asignatura/docente.',
      caption: 'Verifique que la asignatura tenga un grupo y docente asignado.',
      timeout: 5000,
    })
    return
  }

  descargandoProgramaAnalitico.value = true
  try {
    const { data } = await api.get(`/grupos/${grupoId}`)
    await generarProgramaAnaliticoPDF(data, data.carrera_obj || data.carrera || null, {
      gestion: data.gestion,
      grupo: data.grupo,
    })
  } catch (error) {
    console.error(
      'Error generando Programa AnalÒ�� �"Ò� â����Ò�â��šÒ�a�­tico desde GestiÒ�� �"Ò� â����Ò�â��šÒ�a�³n:',
      error,
    )
    $q.notify({
      type: 'negative',
      message: 'No se pudo descargar el Programa AnalÒ�� �"Ò� â����Ò�â��šÒ�a�­tico.',
      caption: error.response?.data?.message || error.message,
      timeout: 5000,
    })
  } finally {
    descargandoProgramaAnalitico.value = false
  }
}

// Importar Cronograma (PAC)

// ============================================================
// BANCO DE PREGUNTAS - CONFIGURACIÒ�� �"Ò� â����Ò��¢Ò¢â��š�¬Ò⬦â���N Y MOCK
// ============================================================

const showSubirBanco = ref(false)
const previsualizandoExamenBanco = ref(false)

// ExÒ�� �"Ò� â����Ò�â��šÒ�a�¡menes de la asignatura (desde el rol de exÒ�� �"Ò� â����Ò�â��šÒ�a�¡menes general)

// EdiciÒ�� �"Ò� â����Ò�â��šÒ�a�³n de Preguntas
const dialogEditarPregunta = ref(false)
const modoRegistroPregunta = ref('edit')
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const dificultadPreguntaOptions = [
  { label: 'Fácil', value: '1' },
  { label: 'Medio', value: '2' },
  { label: 'Difícil', value: '3' },
]
const respuestaVerdaderoFalsoOptions = [
  { label: 'A. Verdadero', value: 'A' },
  { label: 'B. Falso', value: 'B' },
]
const respuestaCompuestaOptions = [
  { label: 'A. Si la primera es verdadera', value: 'A' },
  { label: 'B. Si la segunda es verdadera', value: 'B' },
  { label: 'C. Si ambas son verdaderas', value: 'C' },
  { label: 'D. Si ninguna es verdadera', value: 'D' },
]
const respuestaPreguntaClaveOptions = [
  { label: 'A. 1, 2 y 3 son verdaderas', value: 'A' },
  { label: 'B. 1 y 3 son verdaderas', value: 'B' },
  { label: 'C. 2 y 4 son verdaderas', value: 'C' },
  { label: 'D. Solo 4 es verdadera', value: 'D' },
  { label: 'E. Todas son verdaderas', value: 'E' },
]
const respuestaLetrasOptions = ['A', 'B', 'C', 'D', 'E'].map((letter) => ({
  label: `${letter}.`,
  value: letter,
}))
const formPregunta = ref({
  id: null,
  enunciado: '',
  tipo: '',
  opciones: [],
  respuesta_correcta: null,
  dificultad: '1',
  parcial: '',
  grupo: '',
  grupoTeorico: '',
  logro_esperado_id: null,
  asignatura_id: null,
  sede_id: null,
  imagen: null,
  premisas: ['', ''],
  incisosClave: ['', '', '', ''],
  cantidadClavesEmparejamiento: 2,
  terminosEmparejamiento: ['', '', '', '', ''],
  preguntasLigadas: [],
})
const archivoImagenPregunta = ref(null)
const guardandoEditPreg = ref(false)
const previewImagenEdit = ref(null)
const previsualizandoRegistroPregunta = ref(false)
const previewRegistroPreguntaVisible = ref(false)
const ejemploTipoPreguntaVisible = ref(false)
const DEFAULT_EMPAREJAMIENTO_ENUNCIADO =
  'De la lista de opciones, seleccione la respuesta correcta para cada enunciado'

const MOJIBAKE_FALLBACK_REPLACEMENTS = [
  ['F�cil', 'Fácil'],
  ['Dif�cil', 'Difícil'],
  ['Te�rico', 'Teórico'],
  ['relaci�n', 'relación'],
  ['t�rmino', 'término'],
  ['instrucci�n', 'instrucción'],
  ['previsualizaci�n', 'previsualización'],
  ['informaci�n', 'información'],
  ['selecci�n', 'selección'],
  ['Selecci�n', 'Selección'],
  ['opci�n', 'opción'],
  ['Opci�n', 'Opción'],
  ['est�n', 'están'],
  ['est�', 'está'],
  ['seg�n', 'según'],
  ['v�lida', 'válida'],
  ['v�lido', 'válido'],
  ['hu�rfana', 'huérfana'],
  ['hu�rfano', 'huérfano'],
  ['impresi�n', 'impresión'],
  ['visualizaci�n', 'visualización'],
  ['importaci�n', 'importación'],
  ['configuraci�n', 'configuración'],
  ['combinaci�n', 'combinación'],
  ['despu�s', 'después'],
  ['m�nimo', 'mínimo'],
  ['v�lidas', 'válidas'],
  ['cl�nico', 'clínico'],
  ['cl�nica', 'clínica'],
  ['diagn�stico', 'diagnóstico'],
  ['diagn�stica', 'diagnóstica'],
  ['presi�n', 'presión'],
  ['sist�lica', 'sistólica'],
  ['diast�lica', 'diastólica'],
  ['activaci�n', 'activación'],
  ['parasimp�tica', 'parasimpática'],
  ['simp�tica', 'simpática'],
  ['contracci�n', 'contracción'],
  ['relajaci�n', 'relajación'],
  ['informaci�n', 'información'],
  ['est�n', 'están'],
  ['m�s', 'más'],
  ['n�useas', 'náuseas'],
  ['pedi�trico', 'pediátrico'],
  ['radiograf�a', 'radiografía'],
  ['ecograf�a', 'ecografía'],
  ['�ptico', 'óptico'],
  ['raqu�deo', 'raquídeo'],
  ['hipertensi�n', 'hipertensión'],
  ['fibrilaci�n', 'fibrilación'],
  ['cefalea', 'cefalea'],
  ['Cu�les', 'Cuáles'],
  ['cu�les', 'cuáles'],
  ['Qu�', 'Qué'],
  ['qu�', 'qué'],
  ['est�', 'está'],
  ['única', 'única'],
]

function mojibakeScore(texto) {
  return (String(texto || '').match(/[ÃÂâÒ�]/g) || []).length
}

function decodeLatin1Utf8(texto) {
  try {
    const bytes = Uint8Array.from(
      Array.from(String(texto || '')),
      (char) => char.charCodeAt(0) & 0xff,
    )
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  } catch {
    return String(texto || '')
  }
}

function normalizarTextoMojibake(texto) {
  let value = String(texto ?? '')

  if (!value) return ''

  MOJIBAKE_FALLBACK_REPLACEMENTS.forEach(([from, to]) => {
    value = value.replaceAll(from, to)
  })

  for (let intento = 0; intento < 2; intento++) {
    if (!/[ÃÂâ]/.test(value)) break
    const decoded = decodeLatin1Utf8(value)
    if (mojibakeScore(decoded) < mojibakeScore(value)) {
      value = decoded
    } else {
      break
    }
  }

  return value
}

function sanitizarEstructuraMojibake(value) {
  if (typeof value === 'string') {
    return normalizarTextoMojibake(value)
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizarEstructuraMojibake(item))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizarEstructuraMojibake(item)]),
    )
  }

  return value
}

const buildPreguntaLigada = (tipo = 'OPCION_EMPAREJAMIENTO') => ({
  tipo,
  enunciado: '',
  opciones: tipo === 'SUBPROBLEMA' ? ['', '', '', '', ''] : [],
  respuesta_correcta: tipo === 'OPCION_EMPAREJAMIENTO' ? 'A' : '',
  dificultad: '1',
})

const buildGrupoReferenciaIncremental = (tipo) => {
  const prefix = tipo === 'EMPAREJAMIENTO' ? 'EMP' : 'CASO'
  const label = tipo === 'EMPAREJAMIENTO' ? 'Emp' : 'Caso'
  const gruposExistentes = (bancoPreguntasLocal.value || [])
    .map((pregunta) =>
      String(pregunta.grupo || '')
        .trim()
        .toUpperCase(),
    )
    .filter(Boolean)

  let max = 0
  gruposExistentes.forEach((grupo) => {
    const match = grupo.match(new RegExp(`^${prefix}\\s*(\\d+)$`))
    if (match) {
      max = Math.max(max, Number(match[1] || 0))
    }
  })

  return `${label} ${max + 1}`
}

const buildEmptyPreguntaForm = () => ({
  id: null,
  enunciado: '',
  tipo: 'SELECCION_SIMPLE',
  opciones: ['', '', '', '', ''],
  respuesta_correcta: '',
  dificultad: '1',
  parcial: normalizarParcialBanco(filtroBancoParcialSeleccionado.value || '2P'),
  grupo: filtroBancoGrupoSeleccionado.value || '',
  grupoTeorico: filtroBancoGrupoSeleccionado.value || '',
  logro_esperado_id: logrosBancoOptions.value[0]?.value || null,
  asignatura_id: asignatura.value?.id || null,
  sede_id: route.query.sede_id || authStore.usuarioActual?.sede_id || null,
  imagen: null,
  premisas: ['', ''],
  incisosClave: ['', '', '', ''],
  cantidadClavesEmparejamiento: 2,
  terminosEmparejamiento: ['', '', '', '', ''],
  preguntasLigadas: [],
})

const usaOpcionesTipoPregunta = (tipo, pregunta = null) =>
  [
    'PREGUNTA_CON_CLAVE',
    'SELECCION_SIMPLE',
    'RESPUESTA_COMPUESTA',
    'SUBPROBLEMA',
    'FALSO_VERDADERO',
  ].includes(normalizarTipoPregunta(tipo, pregunta))

const buildOpcionesVaciasParaTipoPregunta = (tipo, pregunta = null) => {
  const tipoNormalizado = normalizarTipoPregunta(tipo, pregunta)

  if (tipoNormalizado === 'FALSO_VERDADERO') {
    return ['Verdadero', 'Falso']
  }

  if (tipoNormalizado === 'RESPUESTA_COMPUESTA') {
    return respuestaCompuestaOptions.map((option) => option.label)
  }

  if (tipoNormalizado === 'PREGUNTA_CON_CLAVE') {
    return respuestaPreguntaClaveOptions.map((option) => option.label)
  }

  if (usaOpcionesTipoPregunta(tipoNormalizado, pregunta)) {
    return ['', '', '', '', '']
  }

  return []
}

const puedeMostrarRegistroManualBanco = computed(
  () =>
    filtroBancoParcialSeleccionado.value === '2P' &&
    !!filtroBancoGrupoSeleccionado.value &&
    !!asignatura.value?.id,
)

const registroManualBancoBloqueado = computed(() => !filtroBancoGrupoSeleccionado.value)

const tipoRegistroPregunta = computed(() =>
  normalizarTipoPregunta(formPregunta.value.tipo, formPregunta.value),
)

const registroManualEsTipoLigado = computed(() =>
  ['OPCION_EMPAREJAMIENTO', 'SUBPROBLEMA'].includes(tipoRegistroPregunta.value),
)

const registroManualEsMacro = computed(() =>
  ['EMPAREJAMIENTO', 'PROBLEMA'].includes(tipoRegistroPregunta.value),
)

const registroManualRequiereDificultadSimple = computed(
  () =>
    !registroManualEsMacro.value &&
    !registroManualEsTipoLigado.value &&
    ['FALSO_VERDADERO', 'RESPUESTA_COMPUESTA', 'PREGUNTA_CON_CLAVE', 'SELECCION_SIMPLE'].includes(
      tipoRegistroPregunta.value,
    ),
)

const descripcionRegistroManualPregunta = computed(() => {
  const descriptions = {
    FALSO_VERDADERO: 'Completa una afirmación y marca A si es Verdadero o B si es Falso.',
    RESPUESTA_COMPUESTA:
      'Registra solo las dos premisas. La respuesta correcta se elige entre A, B, C o D: primera, segunda, ambas o ninguna.',
    PREGUNTA_CON_CLAVE:
      'Registra un enunciado y cuatro incisos tipo verdadero/falso complejas. Las respuestas usan las combinaciones fijas A-E.',
    SELECCION_SIMPLE:
      'Registra un enunciado con cinco alternativas y selecciona la mejor respuesta.',
    EMPAREJAMIENTO:
      'Registra primero el encabezado del emparejamiento ampliado con 2 a 5 opciones y luego completa entre 2 y 5 enunciados ligados.',
    OPCION_EMPAREJAMIENTO:
      'Las opciones emparejadas se registran desde el tipo Emparejamiento Ampliado completo.',
    PROBLEMA:
      'Primero registra el caso clínico o problema y luego completa sus ítems agrupados con opciones y respuesta correcta.',
    SUBPROBLEMA:
      'Los subítems se registran desde el tipo Ítems agrupados por caso clínico o problema.',
  }

  return descriptions[tipoRegistroPregunta.value] || ''
})

const ejemploTipoPregunta = computed(() => {
  const tipo = tipoRegistroPregunta.value
  const ejemplos = {
    FALSO_VERDADERO: {
      tipoHeading: 'Preguntas de respuesta verdadero o falso simples',
      instrucciones: [
        'Instrucciones: A si el enunciado es verdadero o B si el enunciado es falso.',
      ],
      lineas: [
        {
          cssClass: 'preview-question-line',
          text: '1. ____ El agua hierve a 100 grados Celsius al nivel del mar.',
        },
        { cssClass: 'preview-option-line', text: 'A. Verdadero' },
        { cssClass: 'preview-option-line', text: 'B. Falso' },
        { cssClass: 'preview-answer-note', text: 'Respuesta correcta: A. Verdadero' },
      ],
    },
    RESPUESTA_COMPUESTA: {
      tipoHeading: 'Preguntas de respuesta A/B/Ambas/Ninguna',
      instrucciones: [
        'Instrucciones: Las siguientes preguntas están compuestas de dos premisas. Responda con A si la primera es verdadera, B si la segunda es verdadera, C si ambas son verdaderas o D si ninguna es verdadera.',
      ],
      lineas: [
        {
          cssClass: 'preview-detail-line',
          text: 'I. La Tierra gira alrededor del Sol.',
        },
        {
          cssClass: 'preview-detail-line',
          text: 'II. La Luna produce luz propia como una estrella.',
        },
        { cssClass: 'preview-option-title', text: 'Opciones de respuesta:' },
        { cssClass: 'preview-option-line', text: 'A. Si la primera es verdadera' },
        { cssClass: 'preview-option-line', text: 'B. Si la segunda es verdadera' },
        { cssClass: 'preview-option-line', text: 'C. Si ambas son verdaderas' },
        { cssClass: 'preview-option-line', text: 'D. Si ninguna es verdadera' },
        {
          cssClass: 'preview-answer-note',
          text: 'Respuesta correcta: A. Si la primera es verdadera',
        },
      ],
    },
    PREGUNTA_CON_CLAVE: {
      tipoHeading: 'Preguntas de respuesta verdadero o falso complejas',
      instrucciones: [
        'Instrucciones: Seleccione todas las respuestas correctas de acuerdo con la siguiente clave:',
        'A: 1, 2 y 3 son verdaderas. B: 1 y 3 son verdaderas. C: 2 y 4 son verdaderas. D: solo 4 es verdadera. E: todas son verdaderas.',
      ],
      lineas: [
        {
          cssClass: 'preview-question-line',
          text: '1. ____ Seleccione los incisos verdaderos sobre conocimientos generales.',
        },
        {
          cssClass: 'preview-detail-line',
          text: '1. El planeta Tierra tiene un satélite natural llamado Luna.',
        },
        {
          cssClass: 'preview-detail-line',
          text: '2. Los seres humanos respiran oxígeno.',
        },
        {
          cssClass: 'preview-detail-line',
          text: '3. Una semana tiene siete días.',
        },
        {
          cssClass: 'preview-detail-line',
          text: '4. El océano Atlántico es un continente.',
        },
        {
          cssClass: 'preview-answer-note',
          text: 'Respuesta correcta: A. 1, 2 y 3 son verdaderas',
        },
      ],
    },
    SELECCION_SIMPLE: {
      tipoHeading: 'Preguntas de selección de la mejor respuesta',
      instrucciones: [
        'Instrucciones: Lea el caso clínico o situación, revise la pregunta y seleccione la mejor respuesta entre las cinco opciones.',
      ],
      lineas: [
        {
          cssClass: 'preview-question-line',
          text: '1. Una persona quiere conservar mejor los alimentos frescos por varios días. ¿Cuál es la mejor acción?',
        },
        {
          cssClass: 'preview-option-line',
          text: 'A. Dejarlos al sol durante la tarde',
        },
        {
          cssClass: 'preview-option-line',
          text: 'B. Guardarlos en refrigeración cuando corresponda',
        },
        { cssClass: 'preview-option-line', text: 'C. Mezclarlos con tierra seca' },
        { cssClass: 'preview-option-line', text: 'D. Dejarlos cerca de una fuente de calor' },
        {
          cssClass: 'preview-option-line',
          text: 'E. Guardarlos en una bolsa abierta junto a la basura',
        },
        {
          cssClass: 'preview-answer-note',
          text: 'Respuesta correcta: B. Guardarlos en refrigeración cuando corresponda',
        },
      ],
    },
    EMPAREJAMIENTO: {
      tipoHeading: 'Preguntas de Emparejamiento Ampliado',
      instrucciones: [
        'Instrucciones: De la lista de opciones, seleccione la respuesta correcta para cada enunciado.',
      ],
      lineas: [
        {
          cssClass: 'preview-question-line',
          text: 'De la lista de opciones, seleccione la respuesta correcta para cada enunciado',
        },
        { cssClass: 'preview-detail-line', text: 'A. Continente' },
        { cssClass: 'preview-detail-line', text: 'B. Océano' },
        { cssClass: 'preview-detail-line', text: 'C. Planeta' },
        { cssClass: 'preview-detail-line', text: 'D. Satélite natural' },
        {
          cssClass: 'preview-question-line',
          text: '1. ____ Gran masa de agua salada que cubre parte de la superficie terrestre.',
        },
        { cssClass: 'preview-answer-note', text: 'Respuesta correcta: B. Océano' },
        {
          cssClass: 'preview-question-line',
          text: '2. ____ Cuerpo celeste que gira alrededor de un planeta.',
        },
        { cssClass: 'preview-answer-note', text: 'Respuesta correcta: D. Satélite natural' },
      ],
    },
    PROBLEMA: {
      tipoHeading: 'Preguntas de ítems agrupados por caso clínico o problema',
      instrucciones: [
        'Instrucciones: El siguiente caso clínico o problema tendrá varias preguntas. Seleccione las respuestas correctas.',
      ],
      lineas: [
        {
          cssClass: 'preview-question-line',
          text: 'CASO: Una familia organiza un viaje corto de fin de semana. Quiere salir temprano, llevar alimentos que no se dañen rápido y evitar olvidar documentos importantes.',
        },
        {
          cssClass: 'preview-question-line',
          text: '1. ¿Qué acción ayuda mejor a evitar olvidos antes de salir?',
        },
        {
          cssClass: 'preview-option-line',
          text: 'A. Preparar una lista de documentos, ropa y alimentos necesarios',
        },
        {
          cssClass: 'preview-option-line',
          text: 'B. Empacar al azar justo antes de subir al auto',
        },
        {
          cssClass: 'preview-option-line',
          text: 'C. Dejar los documentos en casa para viajar ligero',
        },
        {
          cssClass: 'preview-option-line',
          text: 'D. Comprar alimentos perecederos sin refrigeración',
        },
        { cssClass: 'preview-option-line', text: 'E. Salir sin revisar la hora de partida' },
        {
          cssClass: 'preview-answer-note',
          text: 'Respuesta correcta: A. Preparar una lista de documentos, ropa y alimentos necesarios',
        },
        {
          cssClass: 'preview-question-line',
          text: '2. ¿Qué tipo de alimento conviene priorizar si no habrá refrigeración durante varias horas?',
        },
        { cssClass: 'preview-option-line', text: 'A. Helado' },
        {
          cssClass: 'preview-option-line',
          text: 'B. Galletas, frutos secos o alimentos no perecederos',
        },
        { cssClass: 'preview-option-line', text: 'C. Pescado crudo' },
        { cssClass: 'preview-option-line', text: 'D. Leche abierta' },
        { cssClass: 'preview-option-line', text: 'E. Carne fresca sin conservar' },
        {
          cssClass: 'preview-answer-note',
          text: 'Respuesta correcta: B. Galletas, frutos secos o alimentos no perecederos',
        },
      ],
    },
  }

  return {
    tipo,
    tipoLabel: getTipoLabelBanco(tipo),
    ...(ejemplos[tipo] || {
      tipoHeading: getTipoLabelBanco(tipo),
      instrucciones: ['Este tipo se registra como parte de una estructura mayor.'],
      lineas: [
        {
          cssClass: 'preview-question-line',
          text: 'Ejemplo disponible desde el tipo principal correspondiente.',
        },
      ],
    }),
  }
})

function abrirEjemploTipoPregunta() {
  ejemploTipoPreguntaVisible.value = true
}

const cantidadClavesEmparejamientoOptions = [2, 3, 4, 5].map((value) => ({
  label: `${value} opciones`,
  value,
}))

const clavesEmparejamientoActivas = computed(() => {
  const cantidad = Math.min(
    5,
    Math.max(2, Number(formPregunta.value.cantidadClavesEmparejamiento || 2)),
  )

  return (formPregunta.value.terminosEmparejamiento || [])
    .slice(0, cantidad)
    .map((text, index) => ({
      id: String.fromCharCode(65 + index),
      text: normalizarTextoMojibake(String(text || '').trim()),
      index,
    }))
})

const clavesEmparejamientoCompletas = computed(() =>
  clavesEmparejamientoActivas.value.filter((clave) => clave.text),
)

const respuestaEmparejamientoOptions = computed(() =>
  clavesEmparejamientoCompletas.value.map((clave) => ({
    label: clave.text ? `${clave.id}. ${clave.text}` : `${clave.id}.`,
    value: clave.id,
  })),
)

function getRespuestaPreviewLabel(tipo, respuesta) {
  const valor = String(respuesta || '')
    .trim()
    .toUpperCase()

  if (!valor) return 'Sin respuesta seleccionada'

  if (tipo === 'FALSO_VERDADERO') {
    return valor === 'A' ? 'A. Verdadero' : valor === 'B' ? 'B. Falso' : valor
  }

  if (tipo === 'RESPUESTA_COMPUESTA') {
    return respuestaCompuestaOptions.find((option) => option.value === valor)?.label || valor
  }

  if (tipo === 'PREGUNTA_CON_CLAVE') {
    return respuestaPreguntaClaveOptions.find((option) => option.value === valor)?.label || valor
  }

  return valor
}

function getDificultadPreviewLabel(dificultad) {
  return (
    {
      1: 'Fácil',
      2: 'Medio',
      3: 'Difícil',
    }[String(dificultad || '').trim()] || 'Sin dificultad'
  )
}

const previewRegistroPregunta = computed(() => {
  const tipo = tipoRegistroPregunta.value
  const baseInstrucciones = {
    FALSO_VERDADERO: [
      'Instrucciones: A si el enunciado es verdadero o B si el enunciado es falso.',
    ],
    SELECCION_SIMPLE: [
      'Instrucciones: Lea el caso clínico o situación, revise la pregunta y seleccione la mejor respuesta entre las cinco opciones.',
    ],
    PREGUNTA_CON_CLAVE: [
      'Instrucciones: Seleccione todas las respuestas correctas de acuerdo con la siguiente clave:',
      'A: 1, 2 y 3 son verdaderas. B: 1 y 3 son verdaderas. C: 2 y 4 son verdaderas. D: solo 4 es verdadera. E: todas son verdaderas.',
    ],
    RESPUESTA_COMPUESTA: [
      'Instrucciones: Las siguientes preguntas están compuestas de dos premisas. Responda con:',
      'A: si la primera es verdadera. B: si la segunda es verdadera.',
      'C: si ambas son verdaderas. D: si ninguna es verdadera.',
    ],
    EMPAREJAMIENTO: [
      'Instrucciones: De la lista de opciones, seleccione la respuesta correcta para cada enunciado.',
    ],
    PROBLEMA: [
      'Instrucciones: El siguiente caso clínico o problema tendrá varias preguntas. Seleccione las respuestas correctas.',
    ],
  }

  const previewHeadings = {
    FALSO_VERDADERO: 'Preguntas de respuesta verdadero o falso simples',
    SELECCION_SIMPLE: 'Preguntas de selección de la mejor respuesta',
    PREGUNTA_CON_CLAVE: 'Preguntas de respuesta verdadero o falso complejas',
    RESPUESTA_COMPUESTA: 'Preguntas de respuesta A/B/Ambas/Ninguna',
    EMPAREJAMIENTO: 'Preguntas de Emparejamiento Ampliado',
    PROBLEMA: 'Preguntas de ítems agrupados por caso clínico o problema',
    SUBPROBLEMA: 'Subítem de caso clínico o problema',
  }
  const previewInstrucciones = {
    SELECCION_SIMPLE: [
      'Instrucciones: Lea el caso clínico o situación, revise la pregunta y seleccione la mejor respuesta entre las cinco opciones.',
    ],
    RESPUESTA_COMPUESTA: [
      'Instrucciones: Las siguientes preguntas están compuestas de dos premisas. Responda con:',
      'A: si la primera es verdadera. B: si la segunda es verdadera.',
      'C: si ambas son verdaderas. D: si ninguna es verdadera.',
    ],
    PROBLEMA: [
      'Instrucciones: El siguiente caso clínico o problema tendrá varias preguntas. Seleccione las respuestas correctas.',
    ],
  }

  return {
    tipo,
    tipoLabel: getTipoLabelBanco(tipo),
    tipoHeading: previewHeadings[tipo] || getTipoLabelBanco(tipo),
    instrucciones: previewInstrucciones[tipo] || baseInstrucciones[tipo] || [],
    parcial: formPregunta.value.parcial || filtroBancoParcialSeleccionado.value || '2P',
    grupoTeorico: formPregunta.value.grupoTeorico || filtroBancoGrupoSeleccionado.value || '',
    grupoReferencia: formPregunta.value.grupo || '',
    enunciado: normalizarTextoMojibake(String(formPregunta.value.enunciado || '').trim()),
    imageSrc:
      previewImagenEdit.value ||
      (formPregunta.value.imagen
        ? `${api.defaults.baseURL.replace('/api', '')}/storage/preguntas/${formPregunta.value.imagen}`
        : ''),
    opciones: mapOpcionesRegistro(formPregunta.value.opciones || []),
    incisos: (formPregunta.value.incisosClave || []).map((item) =>
      normalizarTextoMojibake(String(item || '').trim()),
    ),
    premisas: (formPregunta.value.premisas || []).map((item) =>
      normalizarTextoMojibake(String(item || '').trim()),
    ),
    claves: clavesEmparejamientoCompletas.value,
    respuestaLabel: getRespuestaPreviewLabel(tipo, formPregunta.value.respuesta_correcta),
    preguntasLigadas: (formPregunta.value.preguntasLigadas || []).map((item) => ({
      enunciado: normalizarTextoMojibake(String(item.enunciado || '').trim()),
      opciones: mapOpcionesRegistro(item.opciones || []),
      dificultadLabel: getDificultadPreviewLabel(item.dificultad),
      respuestaLabel:
        respuestaEmparejamientoOptions.value.find(
          (option) =>
            option.value ===
            String(item.respuesta_correcta || '')
              .trim()
              .toUpperCase(),
        )?.label || getRespuestaPreviewLabel(item.tipo, item.respuesta_correcta),
    })),
  }
})

function normalizarTextoPreviewPdf(texto) {
  return normalizarTextoMojibake(String(texto || ''))
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function obtenerImagenPreviewPdf(imageSrc) {
  if (!imageSrc) return null
  if (String(imageSrc).startsWith('data:')) return imageSrc

  try {
    const response = await fetch(imageSrc)
    const blob = await response.blob()

    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.warn('No se pudo cargar la imagen para la previsualización PDF:', error)
    return null
  }
}

function agregarTextoPreviewPdf(doc, texto, x, y, maxWidth, opciones = {}) {
  const { fontSize = 11, fontStyle = 'normal', lineGap = 5.5, indent = 0 } = opciones

  const contenido = normalizarTextoPreviewPdf(texto) || ' '
  doc.setFont('helvetica', fontStyle)
  doc.setFontSize(fontSize)
  const lineas = doc.splitTextToSize(contenido, maxWidth - indent)
  doc.text(lineas, x + indent, y)
  return y + lineas.length * lineGap
}

async function previsualizarRegistroPreguntaPdf() {
  previsualizandoRegistroPregunta.value = true

  try {
    const preview = previewRegistroPregunta.value
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    })
    const margin = 18
    const pageHeight = doc.internal.pageSize.getHeight()
    const pageWidth = doc.internal.pageSize.getWidth()
    const maxWidth = pageWidth - margin * 2
    let currentY = margin

    const ensureSpace = (altoNecesario = 12) => {
      if (currentY + altoNecesario <= pageHeight - margin) return
      doc.addPage()
      currentY = margin
    }

    ensureSpace(16)
    currentY = agregarTextoPreviewPdf(doc, preview.tipoHeading, margin, currentY, maxWidth, {
      fontSize: 13,
      fontStyle: 'bold',
      lineGap: 6.2,
    })
    currentY += 2
    ;(preview.instrucciones || []).forEach((linea) => {
      ensureSpace(10)
      currentY = agregarTextoPreviewPdf(doc, linea, margin, currentY, maxWidth, {
        fontSize: 10.5,
        lineGap: 5.2,
      })
    })

    if (preview.instrucciones?.length) {
      currentY += 4
    }

    const imageData = await obtenerImagenPreviewPdf(preview.imageSrc)
    if (imageData) {
      try {
        const imageProps = doc.getImageProperties(imageData)
        let imageWidth = maxWidth * 0.72
        let imageHeight = (imageProps.height * imageWidth) / imageProps.width

        if (imageHeight > 70) {
          imageHeight = 70
          imageWidth = (imageProps.width * imageHeight) / imageProps.height
        }

        ensureSpace(imageHeight + 8)
        doc.addImage(
          imageData,
          imageData.includes('image/png') ? 'PNG' : 'JPEG',
          margin + (maxWidth - imageWidth) / 2,
          currentY,
          imageWidth,
          imageHeight,
        )
        currentY += imageHeight + 6
      } catch (error) {
        console.warn('No se pudo insertar la imagen en la previsualización PDF:', error)
      }
    }

    const enunciado = preview.enunciado || 'Enunciado pendiente...'

    if (preview.tipo === 'FALSO_VERDADERO') {
      ensureSpace(14)
      currentY = agregarTextoPreviewPdf(doc, `1. ____ ${enunciado}`, margin, currentY, maxWidth, {
        lineGap: 5.8,
      })
    } else if (preview.tipo === 'SELECCION_SIMPLE') {
      ensureSpace(14)
      currentY = agregarTextoPreviewPdf(doc, `1. ${enunciado}`, margin, currentY, maxWidth, {
        lineGap: 5.8,
      })
      ;(preview.opciones || []).forEach((opcion) => {
        ensureSpace(10)
        currentY = agregarTextoPreviewPdf(
          doc,
          `${opcion.id}. ${opcion.text || 'Opción pendiente...'}`,
          margin,
          currentY,
          maxWidth,
          { indent: 8, lineGap: 5.4 },
        )
      })
    } else if (preview.tipo === 'PREGUNTA_CON_CLAVE') {
      ensureSpace(14)
      currentY = agregarTextoPreviewPdf(doc, `1. ____ ${enunciado}`, margin, currentY, maxWidth, {
        lineGap: 5.8,
      })
      ;(preview.incisos || []).forEach((inciso, index) => {
        ensureSpace(10)
        currentY = agregarTextoPreviewPdf(
          doc,
          `${index + 1}. ${inciso || 'Inciso pendiente...'}`,
          margin,
          currentY,
          maxWidth,
          { indent: 8, lineGap: 5.4 },
        )
      })
    } else if (preview.tipo === 'RESPUESTA_COMPUESTA') {
      ensureSpace(14)
      currentY = agregarTextoPreviewPdf(doc, '1. ____', margin, currentY, maxWidth, {
        lineGap: 5.8,
      })
      currentY = agregarTextoPreviewPdf(
        doc,
        `I. ${preview.premisas[0] || 'Premisa I pendiente...'}`,
        margin,
        currentY,
        maxWidth,
        {
          indent: 8,
          lineGap: 5.4,
        },
      )
      currentY = agregarTextoPreviewPdf(
        doc,
        `II. ${preview.premisas[1] || 'Premisa II pendiente...'}`,
        margin,
        currentY,
        maxWidth,
        {
          indent: 8,
          lineGap: 5.4,
        },
      )
    } else if (preview.tipo === 'EMPAREJAMIENTO') {
      ensureSpace(14)
      currentY = agregarTextoPreviewPdf(
        doc,
        preview.enunciado ||
          'De la lista de opciones, seleccione la respuesta correcta para cada enunciado',
        margin,
        currentY,
        maxWidth,
        { lineGap: 5.8 },
      )
      ;(preview.claves || []).forEach((clave) => {
        ensureSpace(10)
        currentY = agregarTextoPreviewPdf(
          doc,
          `${clave.id}. ${clave.text || 'Opción pendiente...'}`,
          margin,
          currentY,
          maxWidth,
          { indent: 8, lineGap: 5.4 },
        )
      })
      currentY += 2
      ;(preview.preguntasLigadas || []).forEach((ligada, index) => {
        ensureSpace(10)
        currentY = agregarTextoPreviewPdf(
          doc,
          `${index + 1}. ____ ${ligada.enunciado || 'Opción emparejamiento pendiente...'}`,
          margin,
          currentY,
          maxWidth,
          { indent: 8, lineGap: 5.4 },
        )
      })
    } else if (preview.tipo === 'PROBLEMA') {
      ensureSpace(14)
      currentY = agregarTextoPreviewPdf(doc, `CASO: ${enunciado}`, margin, currentY, maxWidth, {
        lineGap: 5.8,
      })
      ;(preview.preguntasLigadas || []).forEach((ligada, index) => {
        ensureSpace(12)
        currentY = agregarTextoPreviewPdf(
          doc,
          `${index + 1}. ${ligada.enunciado || 'Subproblema pendiente...'}`,
          margin,
          currentY,
          maxWidth,
          { indent: 8, lineGap: 5.4 },
        )
        ;(ligada.opciones || []).forEach((opcion) => {
          ensureSpace(10)
          currentY = agregarTextoPreviewPdf(
            doc,
            `${opcion.id}. ${opcion.text || 'Opción pendiente...'}`,
            margin,
            currentY,
            maxWidth,
            { indent: 15, lineGap: 5.2 },
          )
        })
      })
    } else {
      ensureSpace(14)
      currentY = agregarTextoPreviewPdf(doc, enunciado, margin, currentY, maxWidth, {
        lineGap: 5.8,
      })
    }

    window.open(doc.output('bloburl'), '_blank')
  } catch (error) {
    console.error('Error al previsualizar la pregunta en PDF:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo generar la previsualización PDF de la pregunta.',
      caption: error.response?.data?.message || error.message,
      timeout: 5000,
    })
  } finally {
    previsualizandoRegistroPregunta.value = false
  }
}

const logrosBancoOptions = computed(() => {
  const options = []

  ;(asignatura.value?.unidades || []).forEach((unidad) => {
    ;(unidad.temas || []).forEach((tema) => {
      const logros = tema.logros_esperados || tema.logros || []

      logros.forEach((logro) => {
        if (!logro?.id) return

        options.push({
          label: `U${unidad.numero || '?'} • ${tema.titulo || 'Tema'} • ${logro.descripcion || 'Logro'}`,
          value: logro.id,
        })
      })
    })
  })

  return options
})

watch(archivoImagenPregunta, (file) => {
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => (previewImagenEdit.value = e.target.result)
    reader.readAsDataURL(file)
  } else {
    previewImagenEdit.value = null
  }
})

function onArchivoImagenPreguntaRejected() {
  $q.notify({
    type: 'warning',
    message: `La imagen supera el tamaño permitido de ${Math.round(
      MAX_IMAGE_SIZE_BYTES / 1024 / 1024,
    )} MB.`,
  })
}

watch(
  () => formPregunta.value.cantidadClavesEmparejamiento,
  (cantidadActual) => {
    if (tipoRegistroPregunta.value !== 'EMPAREJAMIENTO') {
      return
    }

    const cantidad = Math.min(5, Math.max(2, Number(cantidadActual || 2)))

    formPregunta.value.terminosEmparejamiento = [
      ...(formPregunta.value.terminosEmparejamiento || []),
    ]
    while (formPregunta.value.terminosEmparejamiento.length < 5) {
      formPregunta.value.terminosEmparejamiento.push('')
    }

    const respuestasValidas = Array.from({ length: cantidad }, (_, index) =>
      String.fromCharCode(65 + index),
    )

    ;(formPregunta.value.preguntasLigadas || []).forEach((item) => {
      if (
        !respuestasValidas.includes(
          String(item.respuesta_correcta || '')
            .trim()
            .toUpperCase(),
        )
      ) {
        item.respuesta_correcta = respuestasValidas[0] || ''
      }
    })
  },
  { immediate: true },
)

watch(
  () => respuestaEmparejamientoOptions.value.map((option) => option.value).join('|'),
  () => {
    if (tipoRegistroPregunta.value !== 'EMPAREJAMIENTO') {
      return
    }

    const respuestasValidas = respuestaEmparejamientoOptions.value.map((option) => option.value)
    ;(formPregunta.value.preguntasLigadas || []).forEach((item) => {
      const respuestaActual = String(item.respuesta_correcta || '')
        .trim()
        .toUpperCase()

      if (!respuestasValidas.includes(respuestaActual)) {
        item.respuesta_correcta = respuestasValidas[0] || ''
      }
    })
  },
)

watch(
  () => formPregunta.value.tipo,
  (tipoActual) => {
    const tipoNormalizado = normalizarTipoPregunta(tipoActual, formPregunta.value)

    if (modoRegistroPregunta.value === 'create') {
      formPregunta.value.opciones = buildOpcionesVaciasParaTipoPregunta(
        tipoNormalizado,
        formPregunta.value,
      )
      formPregunta.value.respuesta_correcta =
        {
          FALSO_VERDADERO: 'A',
          RESPUESTA_COMPUESTA: 'A',
          PREGUNTA_CON_CLAVE: 'A',
        }[tipoNormalizado] || ''

      if (tipoNormalizado === 'EMPAREJAMIENTO') {
        if (!String(formPregunta.value.enunciado || '').trim()) {
          formPregunta.value.enunciado = DEFAULT_EMPAREJAMIENTO_ENUNCIADO
        }
        formPregunta.value.cantidadClavesEmparejamiento = 2
        formPregunta.value.grupo = buildGrupoReferenciaIncremental(tipoNormalizado)
        formPregunta.value.preguntasLigadas = [
          buildPreguntaLigada('OPCION_EMPAREJAMIENTO'),
          buildPreguntaLigada('OPCION_EMPAREJAMIENTO'),
        ]
      } else if (tipoNormalizado === 'PROBLEMA') {
        formPregunta.value.grupo = buildGrupoReferenciaIncremental(tipoNormalizado)
        formPregunta.value.preguntasLigadas = [buildPreguntaLigada('SUBPROBLEMA')]
      } else {
        formPregunta.value.preguntasLigadas = []
      }

      if (!['EMPAREJAMIENTO', 'PROBLEMA'].includes(tipoNormalizado)) {
        formPregunta.value.grupo = ''
      }

      return
    }

    const usaOpciones = usaOpcionesTipoPregunta(tipoNormalizado, formPregunta.value)
    const opcionesActuales = Array.isArray(formPregunta.value.opciones)
      ? [...formPregunta.value.opciones]
      : []

    if (usaOpciones) {
      const opcionesBase = buildOpcionesVaciasParaTipoPregunta(tipoNormalizado, formPregunta.value)
      formPregunta.value.opciones = opcionesBase.map(
        (valor, indice) => opcionesActuales[indice] || valor,
      )
    } else {
      formPregunta.value.opciones = []
    }

    if (Array.isArray(formPregunta.value.respuesta_correcta)) {
      formPregunta.value.respuesta_correcta = formPregunta.value.respuesta_correcta[0] || ''
    } else if (formPregunta.value.respuesta_correcta == null) {
      formPregunta.value.respuesta_correcta = ''
    }
  },
)

function abrirRegistroManualPregunta() {
  if (!puedeMostrarRegistroManualBanco.value) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona 2do Parcial y un grupo teórico antes de registrar preguntas.',
    })
    return
  }

  modoRegistroPregunta.value = 'create'
  formPregunta.value = buildEmptyPreguntaForm()
  formPregunta.value.opciones = buildOpcionesVaciasParaTipoPregunta(
    formPregunta.value.tipo,
    formPregunta.value,
  )
  archivoImagenPregunta.value = null
  previewImagenEdit.value = null
  previewRegistroPreguntaVisible.value = false
  dialogEditarPregunta.value = true
}

function confirmarEliminarBancoFiltrado() {
  if (!puedeEliminarBancoFiltrado.value) {
    return
  }

  $q.dialog({
    title: 'Eliminar preguntas del banco',
    message: `Se eliminarán todas las preguntas registradas para <strong>${filtroBancoDescripcion.value}</strong>.<br><br>Escribe <strong>eliminar</strong> para confirmar esta acción.`,
    html: true,
    prompt: {
      model: '',
      type: 'text',
      isValid: (value) =>
        String(value || '')
          .trim()
          .toLowerCase() === 'eliminar',
      attrs: {
        autofocus: true,
        placeholder: 'eliminar',
      },
    },
    cancel: {
      label: 'Cancelar',
      flat: true,
      noCaps: true,
    },
    ok: {
      label: 'Eliminar preguntas',
      color: 'negative',
      unelevated: true,
      noCaps: true,
    },
    persistent: true,
  }).onOk(() => {
    eliminarBancoFiltrado()
  })
}

async function eliminarBancoFiltrado() {
  try {
    const response = await api.post('/banco-preguntas/bulk-delete', {
      asignatura_id: route.params.id,
      grupo_teorico: filtroBancoGrupoSeleccionado.value,
      parcial: filtroBancoParcialSeleccionado.value,
    })

    const deleted = Number(response.data?.deleted || 0)

    $q.notify({
      type: deleted > 0 ? 'positive' : 'info',
      message:
        deleted > 0
          ? `Se eliminaron ${deleted} pregunta(s) de ${filtroBancoDescripcion.value}.`
          : `No se encontraron preguntas para eliminar en ${filtroBancoDescripcion.value}.`,
      icon: deleted > 0 ? 'delete_forever' : 'info',
    })

    await cargarBancoPreguntas()
  } catch (error) {
    console.error('Error al eliminar preguntas del banco filtrado:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo eliminar el banco filtrado.',
      caption: error.response?.data?.message || error.response?.data?.error || error.message,
      icon: 'error',
    })
  }
}

function abrirEditorPregunta(pregunta) {
  modoRegistroPregunta.value = 'edit'
  const preguntaSanitizada = sanitizarEstructuraMojibake(pregunta)
  const tipoNormalizado = normalizarTipoPregunta(
    preguntaSanitizada.tipo,
    preguntaSanitizada,
    gruposCabeceraBancoMap.value,
  )
  const opcionesOriginales = Array.isArray(preguntaSanitizada.opciones)
    ? preguntaSanitizada.opciones.map((o) => (typeof o === 'object' && o !== null ? o.text : o))
    : ['', '', '', '', '']

  formPregunta.value = {
    ...preguntaSanitizada,
    tipo: tipoNormalizado,
    parcial: normalizarParcialBanco(
      preguntaSanitizada.parcial || filtroBancoParcialSeleccionado.value,
    ),
    grupo: preguntaSanitizada.grupo || '',
    grupoTeorico:
      obtenerGrupoTeoricoPregunta(preguntaSanitizada) || filtroBancoGrupoSeleccionado.value || '',
    logro_esperado_id: preguntaSanitizada.logro_esperado_id || null,
    asignatura_id: preguntaSanitizada.asignatura_id || asignatura.value?.id || null,
    sede_id:
      preguntaSanitizada.sede_id || route.query.sede_id || authStore.usuarioActual?.sede_id || null,
    opciones:
      tipoNormalizado === 'OPCION_EMPAREJAMIENTO' ||
      ['EMPAREJAMIENTO', 'PROBLEMA'].includes(tipoNormalizado)
        ? ['', '', '', '', '']
        : opcionesOriginales,
  }
  archivoImagenPregunta.value = null
  previewImagenEdit.value = null
  previewRegistroPreguntaVisible.value = false
  dialogEditarPregunta.value = true
}

function agregarPreguntaLigadaRegistro() {
  if (tipoRegistroPregunta.value === 'EMPAREJAMIENTO') {
    if ((formPregunta.value.preguntasLigadas || []).length >= 5) {
      return
    }

    const nuevaPregunta = buildPreguntaLigada('OPCION_EMPAREJAMIENTO')
    nuevaPregunta.respuesta_correcta = respuestaEmparejamientoOptions.value[0]?.value || 'A'
    formPregunta.value.preguntasLigadas.push(nuevaPregunta)
    return
  }

  if (tipoRegistroPregunta.value === 'PROBLEMA') {
    formPregunta.value.preguntasLigadas.push(buildPreguntaLigada('SUBPROBLEMA'))
  }
}

function eliminarPreguntaLigadaRegistro(index) {
  if (
    tipoRegistroPregunta.value === 'EMPAREJAMIENTO' &&
    (formPregunta.value.preguntasLigadas || []).length <= 2
  ) {
    return
  }

  formPregunta.value.preguntasLigadas.splice(index, 1)
}

function construirEnunciadoRegistroManual() {
  const tipo = tipoRegistroPregunta.value
  const enunciadoBase = String(formPregunta.value.enunciado || '').trim()

  if (tipo === 'RESPUESTA_COMPUESTA') {
    const premisas = (formPregunta.value.premisas || [])
      .map((premisa, index) => `${index + 1}. ${String(premisa || '').trim()}`)
      .join('<br>')
    return premisas
  }

  if (tipo === 'PREGUNTA_CON_CLAVE') {
    const incisos = (formPregunta.value.incisosClave || [])
      .map((inciso, index) => `${index + 1}. ${String(inciso || '').trim()}`)
      .join('<br>')
    return [enunciadoBase, incisos].filter(Boolean).join('<br>')
  }

  if (tipo === 'EMPAREJAMIENTO') {
    const claves = clavesEmparejamientoCompletas.value
      .map((clave) => `${clave.id}. ${clave.text}`)
      .join('<br>')
    return [enunciadoBase, claves].filter(Boolean).join('<br>')
  }

  return enunciadoBase
}

function mapOpcionesRegistro(opciones = []) {
  return opciones
    .map((text, index) => ({
      id: String.fromCharCode(65 + index),
      text: normalizarTextoMojibake(String(text || '').trim()),
    }))
    .filter((option) => option.text.length > 0)
}

function construirPayloadBaseRegistro() {
  return {
    asignatura_id: formPregunta.value.asignatura_id || asignatura.value?.id || '',
    sede_id: formPregunta.value.sede_id || route.query.sede_id || '',
    grupoTeorico: formPregunta.value.grupoTeorico || filtroBancoGrupoSeleccionado.value || '',
    parcial: formPregunta.value.parcial || '',
    logro_esperado_id: formPregunta.value.logro_esperado_id || '',
  }
}

function validarRegistroManualPregunta() {
  const tipo = tipoRegistroPregunta.value

  if (tipo !== 'RESPUESTA_COMPUESTA' && !String(formPregunta.value.enunciado || '').trim()) {
    return 'Debes registrar el enunciado principal.'
  }

  if (registroManualEsTipoLigado.value) {
    return 'Este tipo se registra desde su estructura completa principal.'
  }

  if (tipo === 'RESPUESTA_COMPUESTA') {
    if ((formPregunta.value.premisas || []).some((premisa) => !String(premisa || '').trim())) {
      return 'Debes completar las dos premisas de la respuesta A/B/Ambas/Ninguna.'
    }
  }

  if (tipo === 'PREGUNTA_CON_CLAVE') {
    if ((formPregunta.value.incisosClave || []).some((inciso) => !String(inciso || '').trim())) {
      return 'Debes completar los 4 incisos de verdadero o falso complejas.'
    }
  }

  if (tipo === 'SELECCION_SIMPLE') {
    if ((formPregunta.value.opciones || []).some((opcion) => !String(opcion || '').trim())) {
      return 'Debes completar las 5 opciones de la selección de la mejor respuesta.'
    }
  }

  if (tipo === 'EMPAREJAMIENTO') {
    const clavesActivas = clavesEmparejamientoActivas.value
    const clavesCompletas = clavesEmparejamientoCompletas.value
    const primeraClaveVaciaIndex = clavesActivas.findIndex((clave) => !clave.text)
    const hayClavePosteriorCompletada =
      primeraClaveVaciaIndex >= 0 &&
      clavesActivas.slice(primeraClaveVaciaIndex + 1).some((clave) => clave.text)

    if (hayClavePosteriorCompletada) {
      return 'Completa las opciones del emparejamiento ampliado en orden, sin saltar letras intermedias.'
    }

    if (clavesCompletas.length < 2 || clavesCompletas.length > 5) {
      return 'Debes completar entre 2 y 5 opciones para el emparejamiento ampliado.'
    }

    const preguntasLigadas = formPregunta.value.preguntasLigadas || []
    if (preguntasLigadas.length < 2 || preguntasLigadas.length > 5) {
      return 'Debes registrar entre 2 y 5 opciones de emparejamiento.'
    }

    const respuestasValidas = clavesCompletas.map((clave) => clave.id)
    const filaIncompleta = preguntasLigadas.some(
      (item) =>
        !String(item.enunciado || '').trim() ||
        !String(item.respuesta_correcta || '').trim() ||
        !String(item.dificultad || '').trim() ||
        !respuestasValidas.includes(
          String(item.respuesta_correcta || '')
            .trim()
            .toUpperCase(),
        ),
    )
    if (filaIncompleta) {
      return 'Debes completar cada enunciado del emparejamiento con dificultad y una respuesta válida según las opciones activas.'
    }
  }

  if (tipo === 'PROBLEMA') {
    if (!(formPregunta.value.preguntasLigadas || []).length) {
      return 'Debes registrar al menos un subítem.'
    }

    const filaIncompleta = formPregunta.value.preguntasLigadas.some(
      (item) =>
        !String(item.enunciado || '').trim() ||
        (item.opciones || []).some((opcion) => !String(opcion || '').trim()) ||
        !String(item.respuesta_correcta || '').trim() ||
        !String(item.dificultad || '').trim(),
    )
    if (filaIncompleta) {
      return 'Debes completar todos los subítems con opciones, dificultad y respuesta.'
    }
  }

  if (
    ['FALSO_VERDADERO', 'RESPUESTA_COMPUESTA', 'PREGUNTA_CON_CLAVE', 'SELECCION_SIMPLE'].includes(
      tipo,
    ) &&
    !String(formPregunta.value.respuesta_correcta || '').trim()
  ) {
    return 'Debes seleccionar la respuesta correcta.'
  }

  return null
}

function construirPayloadsRegistroManual() {
  const tipo = tipoRegistroPregunta.value
  const basePayload = construirPayloadBaseRegistro()

  if (tipo === 'EMPAREJAMIENTO') {
    const grupo = formPregunta.value.grupo || buildGrupoReferenciaIncremental(tipo)
    const payloads = [
      {
        ...basePayload,
        enunciado: construirEnunciadoRegistroManual(),
        tipo,
        grupo,
        opciones: [],
        respuesta_correcta: [],
        dificultad: '',
      },
    ]

    ;(formPregunta.value.preguntasLigadas || []).forEach((item) => {
      payloads.push({
        ...basePayload,
        enunciado: String(item.enunciado || '').trim(),
        tipo: 'OPCION_EMPAREJAMIENTO',
        grupo,
        opciones: [],
        respuesta_correcta: item.respuesta_correcta || '',
        dificultad: item.dificultad || '',
      })
    })

    return payloads
  }

  if (tipo === 'PROBLEMA') {
    const grupo = formPregunta.value.grupo || buildGrupoReferenciaIncremental(tipo)
    const payloads = [
      {
        ...basePayload,
        enunciado: construirEnunciadoRegistroManual(),
        tipo,
        grupo,
        opciones: [],
        respuesta_correcta: [],
        dificultad: '',
      },
    ]

    ;(formPregunta.value.preguntasLigadas || []).forEach((item) => {
      payloads.push({
        ...basePayload,
        enunciado: String(item.enunciado || '').trim(),
        tipo: 'SUBPROBLEMA',
        grupo,
        opciones: mapOpcionesRegistro(item.opciones || []),
        respuesta_correcta: item.respuesta_correcta || '',
        dificultad: item.dificultad || '',
      })
    })

    return payloads
  }

  return [
    {
      ...basePayload,
      enunciado: construirEnunciadoRegistroManual(),
      tipo,
      grupo: '',
      opciones: mapOpcionesRegistro(formPregunta.value.opciones || []),
      respuesta_correcta: formPregunta.value.respuesta_correcta || '',
      dificultad: formPregunta.value.dificultad || '',
    },
  ]
}

async function persistirPreguntaPayload(payload, imageFile = null, preguntaId = null) {
  const fd = new FormData()
  fd.append('enunciado', payload.enunciado || '')
  fd.append('tipo', payload.tipo || '')
  fd.append('asignatura_id', payload.asignatura_id || '')
  fd.append('sede_id', payload.sede_id || '')
  fd.append('grupoTeorico', payload.grupoTeorico || '')
  fd.append('parcial', payload.parcial || '')
  fd.append('grupo', payload.grupo || '')
  fd.append('logro_esperado_id', payload.logro_esperado_id || '')
  fd.append('dificultad', payload.dificultad || '')
  fd.append('opciones', JSON.stringify(payload.opciones || []))
  fd.append(
    'respuesta_correcta',
    Array.isArray(payload.respuesta_correcta)
      ? JSON.stringify(payload.respuesta_correcta)
      : payload.respuesta_correcta || '',
  )

  if (imageFile) {
    fd.append('image_file', imageFile)
  }

  if (preguntaId) {
    await api.post(`/banco-preguntas/${preguntaId}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return
  }

  await api.post('/banco-preguntas', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

async function guardarPreguntaBanco() {
  guardandoEditPreg.value = true
  try {
    if (modoRegistroPregunta.value === 'create') {
      const mensajeValidacion = validarRegistroManualPregunta()

      if (mensajeValidacion) {
        $q.notify({
          type: 'warning',
          message: mensajeValidacion,
        })
        return
      }

      const payloads = construirPayloadsRegistroManual()
      const duplicadoEnLote = buscarDuplicadoEnPayloadsRegistro(payloads)

      if (duplicadoEnLote) {
        $q.notify({
          type: 'warning',
          message:
            'Se detectÒ�� �"Ò� â����Ò�â��šÒ�a�³ una pregunta duplicada dentro del mismo registro para 2do Parcial. Revisa el enunciado.',
        })
        return
      }

      const duplicadoExistente = payloads.find((payload) => buscarDuplicadoBancoExistente(payload))

      if (duplicadoExistente) {
        $q.notify({
          type: 'warning',
          message:
            'Ya existe una pregunta con el mismo enunciado en este grupo y parcial de 2do Parcial.',
        })
        return
      }

      for (let index = 0; index < payloads.length; index += 1) {
        await persistirPreguntaPayload(
          payloads[index],
          index === 0 ? archivoImagenPregunta.value : null,
          null,
        )
      }

      $q.notify({
        type: 'positive',
        message:
          payloads.length > 1
            ? 'Estructura de preguntas registrada correctamente'
            : 'Pregunta registrada correctamente',
      })
      dialogEditarPregunta.value = false
      await cargarBancoPreguntas()
      return
    }

    if (!String(formPregunta.value.enunciado || '').trim()) {
      $q.notify({
        type: 'warning',
        message: 'Debes registrar el enunciado de la pregunta.',
      })
      return
    }

    const tipoNormalizado = normalizarTipoPregunta(formPregunta.value.tipo, formPregunta.value)
    const opcionesMapeadas = usaOpcionesTipoPregunta(tipoNormalizado, formPregunta.value)
      ? mapOpcionesRegistro(formPregunta.value.opciones || [])
      : []

    const payloadActualizado = {
      enunciado: formPregunta.value.enunciado,
      tipo: tipoNormalizado,
      asignatura_id: formPregunta.value.asignatura_id || asignatura.value?.id || '',
      sede_id: formPregunta.value.sede_id || route.query.sede_id || '',
      grupoTeorico: formPregunta.value.grupoTeorico || filtroBancoGrupoSeleccionado.value || '',
      parcial: formPregunta.value.parcial || '',
      grupo: formPregunta.value.grupo || '',
      logro_esperado_id: formPregunta.value.logro_esperado_id || '',
      dificultad: formPregunta.value.dificultad || '',
      opciones: opcionesMapeadas,
      respuesta_correcta: formPregunta.value.respuesta_correcta || '',
    }

    const duplicadoExistente = buscarDuplicadoBancoExistente(
      payloadActualizado,
      formPregunta.value.id,
    )

    if (duplicadoExistente) {
      $q.notify({
        type: 'warning',
        message:
          'Ya existe otra pregunta con el mismo enunciado en este grupo y parcial de 2do Parcial.',
      })
      return
    }

    await persistirPreguntaPayload(
      payloadActualizado,
      archivoImagenPregunta.value,
      formPregunta.value.id,
    )

    $q.notify({
      type: 'positive',
      message:
        modoRegistroPregunta.value === 'create'
          ? 'Pregunta registrada correctamente'
          : 'Pregunta actualizada',
    })
    dialogEditarPregunta.value = false
    await cargarBancoPreguntas()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        (modoRegistroPregunta.value === 'create'
          ? 'Error al registrar la pregunta'
          : 'Error al actualizar pregunta'),
    })
  } finally {
    guardandoEditPreg.value = false
  }
}

function formatoFecha(fechaIso) {
  if (!fechaIso) return ''
  // Manejar formatos ISO 2026-03-23T04... o 2026-03-23 04...
  const soloFecha = fechaIso.includes('T') ? fechaIso.split('T')[0] : fechaIso.split(' ')[0]
  const partes = soloFecha.split('-')
  if (partes.length === 3) {
    const [y, m, d] = partes
    return `${d}/${m}/${y}`
  }
  return soloFecha
}

async function cargarExamenes() {
  if (!asignatura.value?.codigo) return
  cargandoExamenes.value = true
  try {
    let url = `/rol-examenes/materia/${asignatura.value.codigo}`
    const queryParams = []

    // 1. Carrera ID
    let carreraId =
      asignatura.value?.carreras?.[0]?.id ||
      asignatura.value?.carrera_id ||
      asignatura.value?.carrera?.id
    if (carreraId) queryParams.push(`carrera_id=${carreraId}`)

    // 2. Sede ID (Sugerido por el usuario para mayor precisiÒ�� �"Ò� â����Ò�â��šÒ�a�³n)
    const sedeId =
      route.query.sede_id ||
      asignatura.value?.sede_id ||
      asignatura.value?.carreras?.[0]?.sede_id ||
      authStore.usuarioActual?.sede_id
    if (sedeId) queryParams.push(`sede_id=${sedeId}`)

    // 3. Docente ID (Opcional, para filtrar por el dueÒ�� �"Ò� â����Ò�â��šÒ�a�±o de la carpeta)
    const docenteId =
      route.query.docente_id ||
      authStore.usuarioActual?.docente?.id ||
      authStore.usuarioActual?.docente_id
    if (docenteId) queryParams.push(`docente_id=${docenteId}`)

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`
    }

    const { data } = await api.get(url)
    // El endpoint devuelve { data: [...] }
    examenesAsignatura.value = Array.isArray(data.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : []
  } catch (error) {
    console.error('Error al cargar exÒ�� �"Ò� â����Ò�â��šÒ�a�¡menes:', error)
  } finally {
    cargandoExamenes.value = false
  }
}

function abrirDocumento(filename, folder = 'examenes') {
  if (!filename) return
  // Si comienza con http o /, es una ruta absoluta o relativa al servidor
  if (filename.startsWith('http') || filename.startsWith('/')) {
    window.open(filename, '_blank')
    return
  }
  const baseUrl = api.defaults.baseURL.replace('/api', '')
  window.open(`${baseUrl}/storage/${folder}/${filename}`, '_blank')
}

function getPrimerExamen(examen) {
  // 1. Soporte para campos directos o anidados
  if (examen.archivo_examen) return examen.archivo_examen
  if (examen.generacion_manual?.archivo_examen) return examen.generacion_manual.archivo_examen

  // 2. Buscar en el ref de generacionesManuales (fallback frontend)
  if (generacionesManuales.value?.length > 0) {
    const examenParcial = String(examen.tipo_examen || '')
      .trim()
      .toUpperCase()
    const manual = generacionesManuales.value.find((m) => {
      const gMatch = normalizeGroupName(m.grupo) === normalizeGroupName(examen.grupo)
      const mParcial = String(m.parcial || '')
        .trim()
        .toUpperCase()
      // Coincidencia exacta o mapeo 1P/1er Parcial
      const pMatch =
        mParcial === examenParcial ||
        (mParcial === '1ER PARCIAL' && examenParcial === '1P') ||
        (mParcial === '1P' && examenParcial === '1ER PARCIAL')
      return gMatch && pMatch
    })
    if (manual?.archivo_examen) return manual.archivo_examen
  }

  const v = examen.variantes || examen.documento_examen_json
  if (!v) return null

  if (Array.isArray(v) && v.length > 0) {
    return typeof v[0] === 'string' ? v[0] : v[0].archivo || null
  }

  if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
    return typeof v === 'string' ? v : v.archivo || null
  }
  return null
}

function getPrimerPatron(examen) {
  // 1. Soporte para campos directos o anidados (solo PDF solicitado)
  let foundFile = examen.archivo_patron_pdf || examen.generacion_manual?.archivo_patron_pdf

  // 2. Buscar en el ref de generacionesManuales (fallback frontend)
  if (!foundFile && generacionesManuales.value?.length > 0) {
    const examenParcial = String(examen.tipo_examen || '')
      .trim()
      .toUpperCase()
    const manual = generacionesManuales.value.find((m) => {
      const gMatch = normalizeGroupName(m.grupo) === normalizeGroupName(examen.grupo)
      const mParcial = String(m.parcial || '')
        .trim()
        .toUpperCase()
      const pMatch =
        mParcial === examenParcial ||
        (mParcial === '1ER PARCIAL' && examenParcial === '1P') ||
        (mParcial === '1P' && examenParcial === '1ER PARCIAL')
      return gMatch && pMatch
    })
    if (manual?.archivo_patron_pdf) foundFile = manual.archivo_patron_pdf
  }

  if (foundFile) return foundFile

  const json = examen.patrones || examen.patron_respuestas_json
  if (!json) return null

  if (Array.isArray(json) && json.length > 0) {
    const item = json[0]
    if (typeof item === 'string') {
      return item.toLowerCase().endsWith('.pdf') ? item : null
    }
    return item.pdf || null // Preferir PDF
  }

  if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
    const keys = Object.keys(json)
    if (keys.length > 0) {
      const p = json[keys[0]]
      if (typeof p === 'string') {
        return p.toLowerCase().endsWith('.pdf') ? p : null
      }
      return p?.pdf || null
    }
  }
  return null
}

function getTipoLabelBanco(tipo, pregunta = null, gruposCabeceraMap = null) {
  const tipoNormalizado = normalizarTipoPregunta(tipo, pregunta, gruposCabeceraMap)
  return tipoPreguntaLabelMap[tipoNormalizado] || tipoNormalizado.replaceAll('_', ' ')
}

function getTipoColorBanco(tipo, pregunta = null, gruposCabeceraMap = null) {
  const tipoNormalizado = normalizarTipoPregunta(tipo, pregunta, gruposCabeceraMap)

  return (
    {
      FALSO_VERDADERO: 'green',
      RESPUESTA_COMPUESTA: 'deep-orange',
      PREGUNTA_CON_CLAVE: 'indigo',
      SELECCION_SIMPLE: 'blue',
      EMPAREJAMIENTO: 'teal',
      OPCION_EMPAREJAMIENTO: 'cyan-8',
      PROBLEMA: 'orange',
      SUBPROBLEMA: 'purple',
    }[tipoNormalizado] || 'grey'
  )
}

function obtenerGrupoTeoricoPregunta(pregunta) {
  return pregunta?.grupoTeorico || pregunta?.grupo_teorico || ''
}

function normalizarParcialBanco(parcial) {
  const parcialNormalizado = String(parcial || '')
    .trim()
    .toUpperCase()

  const equivalencias = {
    '1P': '1P',
    '1ER PARCIAL': '1P',
    '2P': '2P',
    '2DO PARCIAL': '2P',
    EF: 'EF',
    FINAL: 'EF',
    'EXAMEN FINAL': 'EF',
    '2I': '2I',
    '2DA INSTANCIA': '2I',
  }

  return equivalencias[parcialNormalizado] || parcialNormalizado
}

function getParcialLabelBanco(parcial) {
  const parcialNormalizado = normalizarParcialBanco(parcial)

  return (
    {
      '1P': '1er Parcial',
      '2P': '2do Parcial',
      EF: 'Examen Final',
      '2I': '2da Instancia',
    }[parcialNormalizado] || parcial
  )
}

function normalizarEnunciadoBanco(texto) {
  return String(texto || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
}

function construirClaveDuplicadoBanco(payload) {
  return [
    normalizarEnunciadoBanco(payload.enunciado),
    normalizeGroupName(payload.grupoTeorico || payload.grupo_teorico || ''),
    normalizarParcialBanco(payload.parcial),
    String(payload.grupo || '')
      .trim()
      .toUpperCase(),
  ].join('||')
}

function buscarDuplicadoBancoExistente(payload, preguntaIdExcluir = null) {
  if (normalizarParcialBanco(payload.parcial) !== '2P') {
    return null
  }

  const claveObjetivo = construirClaveDuplicadoBanco(payload)

  return (bancoPreguntasLocal.value || []).find((pregunta) => {
    if (preguntaIdExcluir && Number(pregunta.id) === Number(preguntaIdExcluir)) {
      return false
    }

    const clavePregunta = construirClaveDuplicadoBanco({
      enunciado: pregunta.enunciado || '',
      tipo: pregunta.tipo || '',
      grupoTeorico: obtenerGrupoTeoricoPregunta(pregunta) || '',
      parcial: pregunta.parcial || '',
      grupo: pregunta.grupo || '',
    })

    return clavePregunta === claveObjetivo
  })
}

function buscarDuplicadoEnPayloadsRegistro(payloads) {
  const claves = new Set()

  for (const payload of payloads) {
    if (normalizarParcialBanco(payload.parcial) !== '2P') {
      continue
    }

    const clave = construirClaveDuplicadoBanco(payload)
    if (claves.has(clave)) {
      return payload
    }
    claves.add(clave)
  }

  return null
}

function agregarErrorImportacion(erroresListado, fila, pregunta, mensaje) {
  const existeFila = erroresListado.find((error) => error.fila === fila)

  if (existeFila) {
    if (!existeFila.mensajes.includes(mensaje)) {
      existeFila.mensajes.push(mensaje)
    }
    return
  }

  erroresListado.push({
    fila,
    tipo: pregunta?.tipo || '-',
    enunciado: pregunta?.enunciado || 'Sin datos',
    mensajes: [mensaje],
  })
}

function validarDuplicadosImportacion(preguntas, erroresListado) {
  const clavesLote = new Map()

  preguntas.forEach((pregunta) => {
    const payload = {
      ...pregunta,
      grupoTeorico:
        pregunta.grupoTeorico ||
        grupoTeoricoSeleccionado.value ||
        filtroBancoGrupoSeleccionado.value ||
        '',
      parcial:
        pregunta.parcial ||
        parcialSeleccionado.value ||
        filtroBancoParcialSeleccionado.value ||
        '2P',
    }
    const clave = construirClaveDuplicadoBanco(payload)
    const fila = pregunta.filaExcel || '-'

    if (!normalizarEnunciadoBanco(payload.enunciado)) {
      return
    }

    if (clavesLote.has(clave)) {
      agregarErrorImportacion(
        erroresListado,
        fila,
        pregunta,
        `Pregunta duplicada dentro del Excel. Coincide con la fila ${clavesLote.get(clave)} por enunciado, grupo y parcial.`,
      )
    } else {
      clavesLote.set(clave, fila)
    }

    const duplicadoExistente = buscarDuplicadoBancoExistente(payload)
    if (duplicadoExistente) {
      agregarErrorImportacion(
        erroresListado,
        fila,
        pregunta,
        'Ya existe una pregunta con el mismo enunciado en este grupo y parcial. No se puede importar duplicada.',
      )
    }
  })
}

const puedeVisualizarBanco = computed(
  () => !!filtroBancoParcialSeleccionado.value && !!filtroBancoGrupoSeleccionado.value,
)

const puedePrevisualizarExamenBanco = computed(
  () => puedeVisualizarBanco.value && totalPreguntasContables.value > 0,
)

const grupoBancoActualBloqueado = computed(() => {
  if (!filtroBancoGrupoSeleccionado.value || importacionAcumulativaSegundoParcial.value) {
    return false
  }

  return gruposBloqueados.value.has(normalizeGroupName(filtroBancoGrupoSeleccionado.value))
})

const puedeEliminarBancoFiltrado = computed(
  () =>
    puedeVisualizarBanco.value &&
    preguntasFiltradas.value.length > 0 &&
    !grupoBancoActualBloqueado.value,
)

const filtroBancoDescripcion = computed(() => {
  const parcial = getParcialLabelBanco(filtroBancoParcialSeleccionado.value || '')
  const grupo = filtroBancoGrupoSeleccionado.value
    ? `Grupo ${filtroBancoGrupoSeleccionado.value}`
    : ''

  return [parcial, grupo].filter(Boolean).join(' - ')
})

const gruposCabeceraBancoMap = computed(() => {
  const map = new Map()

  ;(preguntasFiltradas.value || []).forEach((pregunta) => {
    const tipoNormalizado = normalizarTipoPregunta(pregunta.tipo, pregunta)
    const grupoNormalizado = String(pregunta.grupo || '')
      .trim()
      .toUpperCase()

    if (['EMPAREJAMIENTO', 'PROBLEMA'].includes(tipoNormalizado) && grupoNormalizado) {
      map.set(grupoNormalizado, tipoNormalizado)
    }
  })

  return map
})

const preguntasFiltradas = computed(() => {
  if (!puedeVisualizarBanco.value) {
    return []
  }

  const parcialSeleccionadoNormalizado = normalizarParcialBanco(
    filtroBancoParcialSeleccionado.value,
  )
  const grupoSeleccionadoNormalizado = normalizeGroupName(filtroBancoGrupoSeleccionado.value)

  return (bancoPreguntasLocal.value || []).filter((pregunta) => {
    const grupoPregunta = normalizeGroupName(obtenerGrupoTeoricoPregunta(pregunta))
    const parcialPregunta = normalizarParcialBanco(pregunta.parcial)

    return (
      grupoPregunta === grupoSeleccionadoNormalizado &&
      parcialPregunta === parcialSeleccionadoNormalizado
    )
  })
})

const totalPreguntasContables = computed(() => {
  return preguntasFiltradas.value.filter((p) => obtenerTipoContableBanco(p)).length
})

const conteoBancoPorDificultad = computed(() => {
  return preguntasFiltradas.value.reduce(
    (acc, pregunta) => {
      if (!obtenerTipoContableBanco(pregunta)) {
        return acc
      }

      const dificultad = String(pregunta.dificultad || '')
        .trim()
        .toUpperCase()

      if (['1', 'FACIL'].includes(dificultad)) acc.faciles++
      else if (['2', 'MEDIO', 'MEDIA'].includes(dificultad)) acc.medios++
      else if (['3', 'DIFICIL'].includes(dificultad)) acc.dificiles++
      return acc
    },
    { faciles: 0, medios: 0, dificiles: 0 },
  )
})

const REQUISITOS_BANCO_DIFICULTAD = {
  faciles: 15,
  medios: 30,
  dificiles: 15,
}

const REQUISITOS_BANCO_DIFICULTAD_ITEMS = [
  {
    key: 'faciles',
    label: 'Fáciles',
    faltanteLabel: 'Fácil',
    requerido: REQUISITOS_BANCO_DIFICULTAD.faciles,
    color: 'green-7',
  },
  {
    key: 'medios',
    label: 'Medias',
    faltanteLabel: 'Medio',
    requerido: REQUISITOS_BANCO_DIFICULTAD.medios,
    color: 'orange-8',
  },
  {
    key: 'dificiles',
    label: 'Difíciles',
    faltanteLabel: 'Difícil',
    requerido: REQUISITOS_BANCO_DIFICULTAD.dificiles,
    color: 'red-8',
  },
]

const REQUISITOS_BANCO_GRUPO_TIPO = [
  {
    key: 'g1',
    label: 'G1 VF simple + VF complejas + A/B',
    requerido: 15,
    color: 'green-7',
    tipos: ['FALSO_VERDADERO', 'PREGUNTA_CON_CLAVE', 'RESPUESTA_COMPUESTA'],
  },
  {
    key: 'g2',
    label: 'G2 Mejor respuesta',
    requerido: 30,
    color: 'blue-7',
    tipos: ['SELECCION_SIMPLE'],
  },
  {
    key: 'g3',
    label: 'G3 Casos/problemas + emparejamiento',
    requerido: 15,
    color: 'purple-7',
    tipos: ['SUBPROBLEMA', 'OPCION_EMPAREJAMIENTO'],
  },
]

function obtenerTipoContableBanco(pregunta, gruposCabeceraMap = gruposCabeceraBancoMap.value) {
  const tipoNormalizado = normalizarTipoPregunta(pregunta?.tipo, pregunta, gruposCabeceraMap)

  return ['EMPAREJAMIENTO', 'PROBLEMA'].includes(tipoNormalizado) ? null : tipoNormalizado
}

const conteoBancoPorDificultadItems = computed(() =>
  REQUISITOS_BANCO_DIFICULTAD_ITEMS.map((item) => {
    const total = conteoBancoPorDificultad.value[item.key] || 0

    return {
      ...item,
      total,
      progreso: Math.min(total / item.requerido, 1),
      cumple: total >= item.requerido,
    }
  }),
)

const bancoCumpleDificultad = computed(() =>
  conteoBancoPorDificultadItems.value.every((dificultad) => dificultad.cumple),
)

const faltantesDificultadLabel = computed(() => {
  return conteoBancoPorDificultadItems.value
    .map((dificultad) => {
      const faltante = Math.max(0, dificultad.requerido - dificultad.total)
      return faltante > 0 ? `${dificultad.faltanteLabel} falta ${faltante}` : null
    })
    .filter(Boolean)
    .join(' · ')
})

const conteoBancoPorGrupoTipo = computed(() => {
  const conteos = REQUISITOS_BANCO_GRUPO_TIPO.reduce((acc, grupo) => {
    acc[grupo.key] = 0
    return acc
  }, {})

  preguntasFiltradas.value.forEach((pregunta) => {
    const tipoNormalizado = obtenerTipoContableBanco(pregunta)
    const grupo = REQUISITOS_BANCO_GRUPO_TIPO.find((item) => item.tipos.includes(tipoNormalizado))

    if (grupo) {
      conteos[grupo.key]++
    }
  })

  return REQUISITOS_BANCO_GRUPO_TIPO.map((grupo) => ({
    ...grupo,
    total: conteos[grupo.key] || 0,
    progreso: Math.min((conteos[grupo.key] || 0) / grupo.requerido, 1),
    cumple: (conteos[grupo.key] || 0) >= grupo.requerido,
  }))
})

const bancoCumpleGrupoTipo = computed(() =>
  conteoBancoPorGrupoTipo.value.every((grupo) => grupo.cumple),
)

const faltantesGrupoTipoLabel = computed(() =>
  conteoBancoPorGrupoTipo.value
    .map((grupo) => {
      const faltante = Math.max(0, grupo.requerido - grupo.total)
      return faltante > 0 ? `${grupo.key.toUpperCase()} falta ${faltante}` : null
    })
    .filter(Boolean)
    .join(' · '),
)

const faltantesGeneracionLabel = computed(() =>
  [faltantesDificultadLabel.value, faltantesGrupoTipoLabel.value].filter(Boolean).join(' / '),
)

const bancoCumpleRequisitosGeneracion = computed(
  () => bancoCumpleDificultad.value && bancoCumpleGrupoTipo.value,
)

const preguntasConNumeracion = computed(() => {
  let count = 0
  return preguntasFiltradas.value.map((p) => {
    let num = null

    if (obtenerTipoContableBanco(p)) {
      count++
      num = count
    }
    return { ...p, numeroVisual: num }
  })
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
    bancoPreguntasLocal.value = sanitizarEstructuraMojibake(data.preguntas || data)
  } catch (error) {
    console.error('Error al cargar banco de preguntas:', error)
  }
}

/**
 * FunciÒ�� �"Ò� â����Ò�â��šÒ�a�³n de validaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n unificada para una sola pregunta
 * @param {Object} p Pregunta a validar
 * @param {Map} gruposCabeceraMap Map de [grupo -> tipo] para saber si es EM o PR
 * @returns {Array} Lista de mensajes de error/observaciones
 */
function validarIntegridadPregunta(p, gruposCabeceraMap = new Map()) {
  const fallos = []
  const tipo = normalizarTipoPregunta(p.tipo, p, gruposCabeceraMap)
  const opciones = Array.isArray(p.opciones) ? p.opciones : []
  const respuesta = p.respuesta_correcta || p.respuesta
  const enunciado = String(p.enunciado || '').toLowerCase()
  const grupoNormalizado = String(p.grupo || '')
    .trim()
    .toUpperCase()

  // 1. Validar Respuestas Obligatorias
  if (
    [
      'RESPUESTA_COMPUESTA',
      'PREGUNTA_CON_CLAVE',
      'SELECCION_SIMPLE',
      'FALSO_VERDADERO',
      'OPCION_EMPAREJAMIENTO',
      'SUBPROBLEMA',
    ].includes(tipo)
  ) {
    if (
      respuesta === null ||
      respuesta === undefined ||
      respuesta === '' ||
      (Array.isArray(respuesta) && respuesta.length === 0)
    ) {
      fallos.push('Falta definir la respuesta correcta.')
    }
  }

  const tipoCabecera = grupoNormalizado ? gruposCabeceraMap.get(grupoNormalizado) : null
  const esGrupoEmparejamiento = tipoCabecera === 'EMPAREJAMIENTO'

  if (tipo === 'PREGUNTA_CON_CLAVE' && opciones.length !== 4) {
    fallos.push(
      `Pregunta con Clave debe tener exactamente 4 incisos (actualmente: ${opciones.length}).`,
    )
  }

  if (['SELECCION_SIMPLE', 'SUBPROBLEMA'].includes(tipo) && opciones.length !== 5) {
    fallos.push(`Debe tener exactamente 5 opciones (actualmente: ${opciones.length}).`)
  }

  if (tipo === 'RESPUESTA_COMPUESTA' && opciones.length !== 4) {
    fallos.push(
      `Respuesta Compuesta debe tener exactamente 4 opciones fijas (actualmente: ${opciones.length}).`,
    )
  }

  if (tipo === 'FALSO_VERDADERO' && opciones.length !== 2) {
    fallos.push('Verdadero o Falso debe tener exactamente 2 opciones.')
  }

  if (tipo === 'OPCION_EMPAREJAMIENTO' && opciones.length > 0) {
    fallos.push('Opción Emparejamiento no debe tener opciones complementarias cargadas.')
  }

  if (esGrupoEmparejamiento && tipo === 'SUBPROBLEMA') {
    fallos.push(
      'Las preguntas hijas de Emparejamiento deben registrarse como Opción Emparejamiento.',
    )
  }

  // 3. Respuesta compuesta: una sola clave entre A y D
  if (tipo === 'RESPUESTA_COMPUESTA') {
    const respuestaNormalizada = Array.isArray(respuesta)
      ? normalizarRespuestaExcelBanco(respuesta[0] || '')
      : normalizarRespuestaExcelBanco(respuesta)

    if (!['A', 'B', 'C', 'D'].includes(respuestaNormalizada)) {
      fallos.push('Respuesta Compuesta debe tener una única respuesta válida entre A, B, C o D.')
    }
  }

  if (tipo === 'PREGUNTA_CON_CLAVE') {
    const respuestaNormalizada = Array.isArray(respuesta)
      ? normalizarRespuestaExcelBanco(respuesta[0] || '')
      : normalizarRespuestaExcelBanco(respuesta)

    if (!['A', 'B', 'C', 'D', 'E'].includes(respuestaNormalizada)) {
      fallos.push('Pregunta con Clave debe tener una respuesta valida entre A, B, C, D o E.')
    }
  }

  // 3.1 Hijos huérfanos
  if (['OPCION_EMPAREJAMIENTO', 'SUBPROBLEMA'].includes(tipo)) {
    if (!grupoNormalizado) {
      fallos.push(`${getTipoLabelBanco(tipo)} requiere una referencia de grupo.`)
    } else if (gruposCabeceraMap.size > 0 && !gruposCabeceraMap.has(grupoNormalizado)) {
      fallos.push(
        `${getTipoLabelBanco(tipo)} está huérfana: no existe Emparejamiento o Problema con la referencia "${p.grupo}".`,
      )
    }
  }

  // 4. Cabeceras sin dificultad
  if (['PROBLEMA', 'EMPAREJAMIENTO'].includes(tipo)) {
    if (p.dificultad && p.dificultad !== 0 && p.dificultad !== '') {
      fallos.push(`Tipo ${getTipoLabelBanco(tipo)} no debe tener nivel de dificultad asignado.`)
    }

    // Validar incisos en EM (deshabilitado por requerimiento de usuario)
    /*
    if (['EM', 'EMPAREJAMIENTO'].includes(tipo)) {
      const textBusqueda = enunciado.toUpperCase()
      const incisosPosibles = ['A.', 'B.', 'C.', 'D.', 'E.', 'F.', 'G.']
      const encontrados = incisosPosibles.filter(inc => textBusqueda.includes(inc))

      if (encontrados.length < 2) {
        fallos.push('Emparejamiento (EM) debe contener al menos 2 incisos (A., B., ...) en su enunciado.')
      } else {
        for (let i = 0; i < encontrados.length; i++) {
          if (!textBusqueda.includes(incisosPosibles[i])) {
            fallos.push(`Secuencia de incisos incompleta en EM: falta el inciso ${incisosPosibles[i]}`)
            break
          }
        }
      }
    }
    */
  }

  // 5. Verificación de etiquetas (no subíndices, potencias, etc.)
  const tagsProhibidos = ['<sub>', '<sup>', '<math>', '<font>', 'style=']
  const tieneTags = tagsProhibidos.some((tag) => enunciado.includes(tag))
  if (tieneTags) {
    fallos.push(
      'El enunciado contiene etiquetas no permitidas para impresión (subíndices, potencias o estilos).',
    )
  }

  return fallos
}

function validarBancoCompleto() {
  if (!puedeVisualizarBanco.value) {
    $q.notify({
      type: 'warning',
      message: 'Seleccione el parcial y el grupo antes de validar el banco.',
    })
    return
  }

  // Usamos el computed que ya tiene la numeraciÒ�� �"Ò� â����Ò�â��šÒ�a�³n visual correcta (omitiendo EM/PR)
  // y nos aseguramos de que sea un array usable por forEach
  const preguntasParaValidar = preguntasFiltradas.value

  if (preguntasParaValidar.length === 0) {
    $q.notify({ type: 'warning', message: 'No hay preguntas para validar.' })
    return
  }

  const errores = []
  let validas = 0

  // 0. Mapeo de cabeceras de grupos (EM / PR)
  const gruposCabeceraMap = new Map()
  preguntasParaValidar.forEach((p) => {
    const t = normalizarTipoPregunta(p.tipo, p)
    const g = String(p.grupo || '')
      .trim()
      .toUpperCase()
    if (['EMPAREJAMIENTO', 'PROBLEMA'].includes(t) && g) {
      gruposCabeceraMap.set(g, t)
    }
  })

  // Usamos preguntasConNumeracion para que el reporte coincida con la tabla del docente
  preguntasConNumeracion.value.forEach((p) => {
    const fallos = validarIntegridadPregunta(p, gruposCabeceraMap)

    if (fallos.length > 0) {
      errores.push({
        // numeroVisual es null para EM/PR, usamos el tipo como identificador
        numero: p.numeroVisual || `[${getTipoLabelBanco(p.tipo, p, gruposCabeceraMap)}]`,
        tipo: getTipoLabelBanco(p.tipo, p, gruposCabeceraMap),
        enunciado: p.enunciado,
        mensajes: fallos,
      })
    } else {
      validas++
    }
  })

  reporteValidacion.value = {
    total: preguntasParaValidar.length,
    validas,
    errores,
  }

  showDialogValidacion.value = true
}

function obtenerExamenProgramadoBancoActivo() {
  const parcialActivo = normalizarParcialBanco(filtroBancoParcialSeleccionado.value)
  const grupoActivo = normalizeGroupName(filtroBancoGrupoSeleccionado.value)

  return (examenesAsignatura.value || []).find((examen) => {
    const parcialExamen = normalizarParcialBanco(examen.tipo_examen || examen.parcial || '')
    const grupoExamen = normalizeGroupName(examen.grupo)

    return parcialExamen === parcialActivo && grupoExamen === grupoActivo
  })
}

function construirPreguntasPreviewExamenBanco() {
  const preguntasBase = JSON.parse(JSON.stringify(preguntasFiltradas.value || []))
  const preguntasMezcladas = mixExamQuestionOptions(preguntasBase)

  return sortExamQuestionsForPdf(preguntasMezcladas, {
    aleatorizarSecciones: false,
    preservarOrdenOriginalBloques: true,
  })
}

async function previsualizarExamenBanco() {
  if (!puedePrevisualizarExamenBanco.value) {
    $q.notify({
      type: 'warning',
      message: !puedeVisualizarBanco.value
        ? 'Selecciona un parcial y un grupo para previsualizar.'
        : 'Agrega al menos una pregunta evaluable para previsualizar el examen.',
    })
    return
  }

  previsualizandoExamenBanco.value = true

  try {
    const examenProgramado = obtenerExamenProgramadoBancoActivo()
    const preguntasPreview = construirPreguntasPreviewExamenBanco()

    if (!preguntasPreview.length) {
      $q.notify({
        type: 'warning',
        message:
          'No hay preguntas disponibles para generar la previsualizaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n del examen.',
      })
      return
    }

    const configPreview = {
      ...EXAM_PDF_DEFAULT_CONFIG,
      aleatorizarSecciones: true,
    }
    const metadataExamen = {
      codigo: codigoVisual.value || asignatura.value?.sigla || 'EXAM',
      materia: asignatura.value?.nombre || 'Asignatura',
      docente: nombreDocenteCarpeta.value || authStore.nombreCompleto || 'Docente',
      grupo: filtroBancoGrupoSeleccionado.value || '',
      sede: nombreSede.value || '',
      carrera: nombreCarrera.value || '',
      parcial: getParcialLabelBanco(filtroBancoParcialSeleccionado.value),
      fecha_examen: examenProgramado?.fecha || new Date().toISOString(),
      semestre: asignatura.value?.semestre || '',
      hora:
        examenProgramado?.hora ||
        [examenProgramado?.hora_inicio, examenProgramado?.hora_fin].filter(Boolean).join(' - '),
    }

    const doc = createExamPdfDocument(configPreview)
    await generateExamPdf(doc, metadataExamen, configPreview, 'A', preguntasPreview)
    window.open(doc.output('bloburl'), '_blank')
  } catch (error) {
    console.error('Error al previsualizar el examen del banco:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo generar la previsualizaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n del examen.',
      caption: error.response?.data?.message || error.message,
      timeout: 5000,
    })
  } finally {
    previsualizandoExamenBanco.value = false
  }
}

async function cargarGeneracionesManuales() {
  if (!asignatura.value?.id) return
  try {
    const dId =
      route.query.docente_id ||
      authStore.usuarioActual?.docente?.id ||
      authStore.usuarioActual?.docente_id
    let url = `/generaciones-manuales?asignatura_id=${asignatura.value.id}`
    if (dId) url += `&docente_id=${dId}`
    const { data } = await api.get(url)
    generacionesManuales.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error al cargar generaciones manuales:', e)
    generacionesManuales.value = []
  }
}

function esOpcionCorrecta(pregunta, letra) {
  const resp = pregunta.respuesta_correcta
  if (Array.isArray(resp)) {
    return resp.includes(letra)
  }
  return resp === letra
}

// eslint-disable-next-line no-unused-vars
async function descargarFormatoBancoLegacy() {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.default.Workbook()
  const parcialActivo = normalizarParcialBanco(filtroBancoParcialSeleccionado.value || '2P')
  const parcialActivoLabel = getParcialLabelBanco(parcialActivo)
  const tiposExcelPermitidos = tiposPreguntaOptions.map((tipo) => tipo.label)

  // ---- HOJA 1: INSTRUCCIONES ----
  const wsInst = workbook.addWorksheet('Instrucciones')
  wsInst.getColumn(1).width = 40
  wsInst.getColumn(2).width = 80

  const titleRow = wsInst.addRow(['BANCO DE PREGUNTAS - GUIA OFICIAL'])
  titleRow.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } }
  titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4527A0' } }

  wsInst.addRow([])

  const addGuideHeader = (text) => {
    const r = wsInst.addRow([text])
    r.font = { bold: true, size: 12 }
    r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EAF6' } }
  }

  const redFont = { color: { argb: 'FFFF0000' }, bold: true }

  addGuideHeader('1. CÒ�� �"Ò� â����Ò��¢Ò¢â��š�¬Ò⬦â���DIGOS DE PREGUNTA (Columna TIPO)')
  wsInst.addRow(['VERDADERO O FALSO', 'Marque A para Verdadero o B para Falso.'])
  wsInst.addRow([
    'PREGUNTA CON CLAVE',
    'Pregunta objetiva con 5 opciones y una sola respuesta correcta.',
  ])
  wsInst.addRow([
    'SELECCION SIMPLE',
    'Pregunta objetiva con 5 opciones y una sola respuesta correcta.',
  ])
  const rowSM1 = wsInst.addRow([
    'RESPUESTA COMPUESTA',
    'Debe tener 5 opciones y exactamente 2 respuestas correctas.',
  ])
  rowSM1.getCell(2).font = redFont
  const rowPR1 = wsInst.addRow([
    'PROBLEMA O CASO',
    'Solo llenar el enunciado. No lleva dificultad ni respuesta directa.',
  ])
  rowPR1.getCell(2).font = redFont
  wsInst.addRow([
    'SUB PROBLEMA',
    'Pregunta hija de un Problema o Caso. Lleva 5 opciones y una respuesta correcta.',
  ])
  const rowEM1 = wsInst.addRow([
    'EMPAREJAMIENTO',
    'Solo llenar el enunciado. No lleva dificultad ni respuesta directa.',
  ])
  rowEM1.getCell(2).font = redFont
  wsInst.addRow([
    'OPCION EMPAREJAMIENTO',
    'Pregunta hija de un Emparejamiento. No lleva opciones en columnas, solo referencia de grupo y respuesta.',
  ])
  wsInst.addRow([])

  addGuideHeader('2. RESPUESTAS VALIDAS')
  wsInst.addRow(['Pregunta con Clave / Selección Simple', 'Pon una sola letra: A, B, C, D o E.'])
  wsInst.addRow(['Emparejamiento', 'Déjalo completamente en blanco.'])
  const rowSM2 = wsInst.addRow([
    'Respuesta Compuesta',
    'Debes poner exactamente las 2 letras correspondientes, por ejemplo: A,B.',
  ])
  rowSM2.getCell(2).font = redFont
  wsInst.addRow(['Verdadero o Falso', 'A para Verdadero, B para Falso.'])
  wsInst.addRow([
    'Opción Emparejamiento',
    'Usa la letra correcta según las claves definidas en el encabezado del emparejamiento.',
  ])
  const rowPR2 = wsInst.addRow(['Problema o Caso', 'Déjalo completamente en blanco.'])
  rowPR2.getCell(2).font = redFont
  wsInst.addRow(['Sub Problema', 'Pon una sola letra: A, B, C, D o E.'])
  wsInst.addRow([])

  addGuideHeader('3. CONFIGURACIÓN DEL EXAMEN')
  const rowDif = wsInst.addRow([
    'Dificultad (Nivel)',
    '1 (Facil), 2 (Medio), 3 (Dificil) - PR y EM NO LLEVAN (DEJAR VACIO)',
  ])
  rowDif.getCell(1).font = redFont
  rowDif.getCell(2).font = redFont
  wsInst.addRow(['Parcial activo', `${parcialActivo} (${parcialActivoLabel})`])
  if (parcialActivo === '2P') {
    wsInst.addRow([
      'Registro por grupo',
      'En 2do Parcial el banco se organiza y se valida individualmente por grupo teórico.',
    ])
  }
  wsInst.addRow([])

  addGuideHeader('NOTAS IMPORTANTES')
  const note = wsInst.addRow(['- No elimine columnas ni cambie el nombre de la hoja "Banco".'])
  note.font = { italic: true, color: { argb: 'FFC62828' } }
  const noteSM = wsInst.addRow([
    '- IMPORTANTE: Las preguntas SM (Respuesta Compuesta) deben tener SOLAMENTE 2 respuestas marcadas en el formato A,B cuando corresponda.',
  ])
  noteSM.font = redFont
  const notePREM = wsInst.addRow([
    '- IMPORTANTE: Problema o Caso y Emparejamiento son encabezados y NO DEBEN TENER DIFICULTAD (dejar la celda de dificultad vacía).',
  ])
  notePREM.font = redFont

  // ---- HOJA 2: BANCO ----
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

  // Generar 15 FÒ�� �"Ò� â����Ò�â��šÒ�a�¡ciles (Verde)
  for (let i = 0; i < 15; i++) {
    addPreguntaRow('1', parcialActivo, 'FFC6EFCE')
  }

  // Generar 30 Medias (Amarillo)
  for (let i = 0; i < 30; i++) {
    addPreguntaRow('2', parcialActivo, 'FFFFEB9C')
  }

  // Generar 15 DifÒ�� �"Ò� â����Ò�â��šÒ�a�­ciles (Rojo)
  for (let i = 0; i < 15; i++) {
    addPreguntaRow('3', parcialActivo, 'FFFFC7CE')
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
      formulae: [`"${tiposExcelPermitidos.join(',')}"`],
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
  rowF.getCell(9).value = 'Total Faciles:'
  rowF.getCell(9).font = { bold: true }
  rowF.getCell(10).value = { formula: 'COUNTIF(J2:J61, 1)' }

  const rowM = wsBanco.getRow(64)
  rowM.getCell(9).value = 'Total Medias:'
  rowM.getCell(9).font = { bold: true }
  rowM.getCell(10).value = { formula: 'COUNTIF(J2:J61, 2)' }

  const rowD = wsBanco.getRow(65)
  rowD.getCell(9).value = 'Total DifÒ�� �"Ò� â����Ò�â��šÒ�a�­ciles:'
  rowD.getCell(9).font = { bold: true }
  rowD.getCell(10).value = { formula: 'COUNTIF(J2:J61, 3)' }

  // ---- HOJA 3: EJEMPLO (PRECARGADA) ----
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
    // Rellenamos opciones si existen (mÒ�� �"Ò� â����Ò�â��šÒ�a�¡ximo 5)
    for (let i = 0; i < Math.min(ops.length, 5); i++) {
      rowData[3 + i] = ops[i]
    }
    const row = wsEj.addRow(rowData)
    row.getCell(1).font = { bold: true }
  }

  // Ejemplos FV
  addEjRow(
    tipoPreguntaExcelLabels.FALSO_VERDADERO,
    '1',
    parcialActivo,
    'Bolivia cuenta con una salida soberana al OcÒ�� �"Ò� â����Ò�â��šÒ�a�©ano PacÒ�� �"Ò� â����Ò�â��šÒ�a�­fico.',
    'B',
    ['Verdadero', 'Falso'],
  )
  addEjRow(
    tipoPreguntaExcelLabels.FALSO_VERDADERO,
    '1',
    parcialActivo,
    'La capital constitucional de Bolivia es Sucre.',
    'A',
    ['Verdadero', 'Falso'],
  )

  // Ejemplos de pregunta objetiva
  addEjRow(
    tipoPreguntaExcelLabels.PREGUNTA_CON_CLAVE,
    '2',
    parcialActivo,
    '¿Cuál es el símbolo químico del oro en la tabla periódica?',
    'B',
    ['Ag', 'Au', 'Fe', 'Cu', 'Pb'],
  )
  addEjRow(
    'SELECCION SIMPLE',
    '2',
    parcialActivo,
    '¿Cuál es el planeta más grande de nuestro sistema solar?',
    'C',
    ['Marte', 'Tierra', 'Júpiter', 'Saturno', 'Venus'],
  )

  // Ejemplos Respuesta Compuesta
  addEjRow(
    'RESPUESTA COMPUESTA',
    '3',
    parcialActivo,
    '¿Cuáles de los siguientes son elementos que componen el núcleo atómico?',
    'A,B',
    ['Protones', 'Neutrones', 'Electrones', 'Fotones', 'Neutrinos'],
  )
  addEjRow(
    'RESPUESTA COMPUESTA',
    '3',
    parcialActivo,
    '¿Cuáles son los principales componentes del agua pura?',
    'A,B',
    ['Hidrógeno', 'Oxígeno', 'Nitrógeno', 'Carbono', 'Helio'],
  )

  // Ejemplos Problema y Sub Problema
  addEjRow(
    'PROBLEMA O CASO',
    '',
    parcialActivo,
    'CASO CLÍNICO O PROBLEMA\nUna mujer de 58 años, inconsciente, es llevada al Servicio de Urgencia después de sufrir un colapso en un centro de compras local. Su familia informa que ella se sentía bien en la mañana pero que desarrolló una cefalea de intensidad creciente. Tiene antecedentes de hipertensión arterial y fibrilación auricular, por lo que recibe medicamentos antihipertensivos y anticoagulantes orales. Al examen físico: presión arterial 220/130 mmHg. Presenta apnea alternada con hiperpnea y responde solo a estímulos dolorosos con extensión postural de brazo y pierna derecha. El fondo de ojo muestra edema de papila que compromete el disco óptico izquierdo. Las pupilas son 3.0/7.0 (derecha/izquierda) sin reacción a la luz en la izquierda y con una preferencia de mirada a izquierda. Presenta hiperreflexia difusa, mayor en lado derecho y signo de Babinski bilateral.',
    '',
    [],
    'Caso 1',
  )
  addEjRow(
    'SUB PROBLEMA',
    '3',
    parcialActivo,
    '¿Con cuál de las siguientes estructuras del lado izquierdo que presente una lesión es más consistente la presencia de una pupila izquierda no reactiva y dilatada?',
    'D',
    ['Nervio óptico', 'Tracto óptico', 'Protuberancia', 'Nervio oculomotor', 'Colículo superior'],
    'Caso 1',
  )
  addEjRow(
    'SUB PROBLEMA',
    '3',
    parcialActivo,
    '¿Con una lesión en cuál de las siguientes áreas del cerebro izquierdo es más consistente la postura en extensión del brazo derecho?',
    'E',
    ['Telencéfalo', 'Diencéfalo', 'Protuberancia', 'Bulbo raquídeo', 'Cerebro medio'],
    'Caso 1',
  )

  // Ejemplos Emparejamiento y Opción Emparejamiento
  addEjRow(
    'EMPAREJAMIENTO',
    '',
    parcialActivo,
    'EMPAREJAMIENTO: Relacione cada término con el concepto correcto.\nA. Bit\nB. Byte\nC. Binario',
    '',
    [],
    'Emp 1',
  )
  addEjRow(
    'OPCION EMPAREJAMIENTO',
    '2',
    parcialActivo,
    'Unidad mínima de información que puede tomar el valor 0 o 1.',
    'A',
    [],
    'Emp 1',
  )
  addEjRow('OPCION EMPAREJAMIENTO', '2', parcialActivo, 'Conjunto de 8 bits.', 'B', [], 'Emp 1')
  addEjRow(
    'OPCION EMPAREJAMIENTO',
    '2',
    parcialActivo,
    'Sistema de numeración de base 2.',
    'C',
    [],
    'Emp 1',
  )
  addEjRow(
    'OPCION EMPAREJAMIENTO',
    '2',
    parcialActivo,
    'Valor posible en lógica digital que vuelve a corresponder a la clave Bit.',
    'A',
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
  link.download = `formato_banco_preguntas_${asignatura.value?.sigla || 'asig'}_${parcialActivo}.xlsx`
  link.click()

  $q.notify({ type: 'positive', message: 'Excel generado exitosamente', icon: 'check_circle' })
}

// ============================================================
// IMPORTACION BANCO DE PREGUNTAS - REFS Y LOGICA
// ============================================================
// ============================================================
// IMPORTACION BANCO DE PREGUNTAS - REFS Y LOGICA
// ============================================================
async function descargarFormatoBanco() {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.default.Workbook()
  const parcialActivo = normalizarParcialBanco(filtroBancoParcialSeleccionado.value || '1P')
  const parcialActivoLabel = getParcialLabelBanco(parcialActivo)
  const excelTipos = tipoPreguntaExcelLabels
  const tiposExcelPermitidos = [
    excelTipos.FALSO_VERDADERO,
    excelTipos.RESPUESTA_COMPUESTA,
    excelTipos.PREGUNTA_CON_CLAVE,
    excelTipos.SELECCION_SIMPLE,
    excelTipos.EMPAREJAMIENTO,
    excelTipos.OPCION_EMPAREJAMIENTO,
    excelTipos.PROBLEMA,
    excelTipos.SUBPROBLEMA,
  ]
  const opcionesRespuestaCompuestaExcel = [
    'A. Si la primera es verdadera',
    'B. Si la segunda es verdadera',
    'C. Si ambas son verdaderas',
    'D. Si ninguna es verdadera',
  ]
  const enunciadoEmparejamientoExcel =
    'De la lista de opciones, seleccione la respuesta correcta para cada enunciado'
  const respuestasPreguntaClaveExcel = [
    'A: 1, 2 y 3 son verdaderas',
    'B: 1 y 3 son verdaderas',
    'C: 2 y 4 son verdaderas',
    'D: Solo 4 es verdadera',
    'E: Todas son verdaderas',
  ]
  const filasBancoDesde = 2
  const filasBancoHasta = 61
  const tiposRequierenGrupo = [
    excelTipos.PROBLEMA,
    excelTipos.SUBPROBLEMA,
    excelTipos.EMPAREJAMIENTO,
    excelTipos.OPCION_EMPAREJAMIENTO,
  ]
  const tiposRequierenRespuesta = [
    excelTipos.FALSO_VERDADERO,
    excelTipos.RESPUESTA_COMPUESTA,
    excelTipos.PREGUNTA_CON_CLAVE,
    excelTipos.SELECCION_SIMPLE,
    excelTipos.SUBPROBLEMA,
    excelTipos.OPCION_EMPAREJAMIENTO,
  ]
  const tiposRequierenDificultad = [...tiposRequierenRespuesta]
  const tiposSinRespuestaYDificultad = [excelTipos.PROBLEMA, excelTipos.EMPAREJAMIENTO]
  const rangoTiposBanco = `$A$${filasBancoDesde}:$A$${filasBancoHasta}`

  const excelOr = (cellRef, values) =>
    `OR(${values.map((value) => `${cellRef}="${value}"`).join(',')})`
  const excelRespuestaLetraEn = (cellRef, letras) =>
    `OR(${letras.map((letra) => `LEFT(TRIM(${cellRef}),1)="${letra}"`).join(',')})`
  const countByTiposFormula = (tipos) =>
    tipos.map((tipo) => `COUNTIF(${rangoTiposBanco},"${tipo}")`).join('+')

  const buildOptionValidationFormula = (rowNumber, columnLetter, allowedRangeName) => {
    const cellRef = `$${columnLetter}${rowNumber}`
    return `IF(ISNUMBER(MATCH($A${rowNumber},${allowedRangeName},0)),TRUE,LEN(TRIM(${cellRef}))=0)`
  }

  const toExcelColumn = (columnNumber) => {
    let column = ''
    let number = columnNumber

    while (number > 0) {
      const remainder = (number - 1) % 26
      column = String.fromCharCode(65 + remainder) + column
      number = Math.floor((number - 1) / 26)
    }

    return column
  }
  const observacionesHelperColumns = Array.from({ length: 24 }, (_, index) =>
    toExcelColumn(13 + index),
  )

  const buildObservacionesChecks = (rowNumber) => {
    const tipoRef = `$A${rowNumber}`
    const grupoRef = `$B${rowNumber}`
    const enunciadoRef = `$C${rowNumber}`
    const opcionARef = `$D${rowNumber}`
    const opcionBRef = `$E${rowNumber}`
    const opcionCRef = `$F${rowNumber}`
    const opcionDRef = `$G${rowNumber}`
    const respuestaRef = `$I${rowNumber}`
    const dificultadRef = `$J${rowNumber}`
    const parcialRef = `$K${rowNumber}`
    const tiposGrupoFormula = excelOr(tipoRef, tiposRequierenGrupo)
    const tiposRespuestaFormula = excelOr(tipoRef, tiposRequierenRespuesta)
    const tiposDificultadFormula = excelOr(tipoRef, tiposRequierenDificultad)
    const tiposSinRespuestaFormula = excelOr(tipoRef, tiposSinRespuestaYDificultad)
    const respuestaABFormula = excelRespuestaLetraEn(respuestaRef, ['A', 'B'])
    const respuestaABCDFormula = excelRespuestaLetraEn(respuestaRef, ['A', 'B', 'C', 'D'])
    const respuestaABCDEFormula = excelRespuestaLetraEn(respuestaRef, ['A', 'B', 'C', 'D', 'E'])
    const filledOptionsFormula = (fromColumn = 'D', toColumn = 'H') =>
      `COUNTIF($${fromColumn}${rowNumber}:$${toColumn}${rowNumber},"?*")`

    const checks = [
      { condition: `TRIM(${enunciadoRef})=""`, message: 'enunciado' },
      { condition: `TRIM(${parcialRef})=""`, message: 'parcial' },
      {
        condition: `AND(TRIM(${parcialRef})<>"",TRIM(${parcialRef})<>"${parcialActivo}")`,
        message: `parcial distinto a ${parcialActivo}`,
      },
      { condition: `AND(${tiposGrupoFormula},TRIM(${grupoRef})="")`, message: 'grupo' },
      {
        condition: `AND(${tiposRespuestaFormula},TRIM(${respuestaRef})="")`,
        message: 'respuesta_correcta',
      },
      {
        condition: `AND(${tiposDificultadFormula},TRIM(${dificultadRef})="")`,
        message: 'dificultad',
      },
      {
        condition: `AND(${tiposSinRespuestaFormula},TRIM(${respuestaRef})<>"")`,
        message: 'respuesta debe ir vacia',
      },
      {
        condition: `AND(${tiposSinRespuestaFormula},TRIM(${dificultadRef})<>"")`,
        message: 'dificultad debe ir vacia',
      },
      {
        condition: `AND(${tipoRef}="${excelTipos.FALSO_VERDADERO}",OR(${filledOptionsFormula('D', 'E')}<2,${filledOptionsFormula('F', 'H')}>0))`,
        message: 'incisos A-B',
      },
      {
        condition: `AND(${tipoRef}="${excelTipos.FALSO_VERDADERO}",TRIM(${respuestaRef})<>"",NOT(${respuestaABFormula}))`,
        message: 'respuesta A-B',
      },
      {
        condition: `AND(${tipoRef}="${excelTipos.RESPUESTA_COMPUESTA}",${filledOptionsFormula('D', 'G')}<4)`,
        message: 'opciones A-D',
      },
      {
        condition: `AND(${tipoRef}="${excelTipos.RESPUESTA_COMPUESTA}",${filledOptionsFormula('H', 'H')}>0)`,
        message: 'opcion E deshabilitada',
      },
      {
        condition: `AND(${tipoRef}="${excelTipos.RESPUESTA_COMPUESTA}",TRIM(${respuestaRef})<>"",NOT(${respuestaABCDFormula}))`,
        message: 'respuesta A-D',
      },
      {
        condition: `AND(${tipoRef}="${excelTipos.PREGUNTA_CON_CLAVE}",OR(LEN(TRIM(SUBSTITUTE(${opcionARef},"1.","")))=0,LEN(TRIM(SUBSTITUTE(${opcionBRef},"2.","")))=0,LEN(TRIM(SUBSTITUTE(${opcionCRef},"3.","")))=0,LEN(TRIM(SUBSTITUTE(${opcionDRef},"4.","")))=0))`,
        message: 'incisos 1-4',
      },
      {
        condition: `AND(${tipoRef}="${excelTipos.PREGUNTA_CON_CLAVE}",${filledOptionsFormula('H', 'H')}>0)`,
        message: 'opcion E deshabilitada',
      },
      {
        condition: `AND(${tipoRef}="${excelTipos.PREGUNTA_CON_CLAVE}",TRIM(${respuestaRef})<>"",NOT(${respuestaABCDEFormula}))`,
        message: 'respuesta A-E',
      },
      {
        condition: `AND(OR(${tipoRef}="${excelTipos.SELECCION_SIMPLE}",${tipoRef}="${excelTipos.SUBPROBLEMA}"),${filledOptionsFormula()}<5)`,
        message: 'incisos A-E',
      },
      {
        condition: `AND(OR(${tipoRef}="${excelTipos.SELECCION_SIMPLE}",${tipoRef}="${excelTipos.SUBPROBLEMA}"),TRIM(${respuestaRef})<>"",NOT(${respuestaABCDEFormula}))`,
        message: 'respuesta A-E',
      },
      {
        condition: `AND(OR(${tipoRef}="${excelTipos.PROBLEMA}",${tipoRef}="${excelTipos.OPCION_EMPAREJAMIENTO}"),${filledOptionsFormula()}>0)`,
        message: 'sin incisos',
      },
      {
        condition: `AND(${tipoRef}="${excelTipos.EMPAREJAMIENTO}",${filledOptionsFormula()}<2)`,
        message: 'minimo 2 claves',
      },
      {
        condition: `AND(${tipoRef}="${excelTipos.OPCION_EMPAREJAMIENTO}",NOT(${respuestaABCDEFormula}))`,
        message: 'respuesta A-E',
      },
    ]
    return checks
  }

  const buildObservacionesHelperFormula = (rowNumber, check, index) => {
    const safeMessage = check.message.replace(/"/g, '""')

    if (index === 0) {
      return `IF(${check.condition},"${safeMessage}","")`
    }

    const firstColumn = observacionesHelperColumns[0]
    const previousColumn = observacionesHelperColumns[index - 1]
    return `IF(${check.condition},IF(COUNTIF($${firstColumn}${rowNumber}:$${previousColumn}${rowNumber},"?*")>0,", ","")&"${safeMessage}","")`
  }

  const buildObservacionesFormula = (rowNumber, helperColumns) => {
    const helperRange = `$${helperColumns[0]}${rowNumber}:$${helperColumns[helperColumns.length - 1]}${rowNumber}`
    const helperConcat = helperColumns.map((column) => `$${column}${rowNumber}`).join('&')

    return `IF(TRIM($A${rowNumber})="","",IF(COUNTIF(${helperRange},"?*")=0,"OK","Falta revisar: "&${helperConcat}))`
  }

  workbook.creator = 'Codex'
  workbook.lastModifiedBy = 'Codex'
  workbook.created = new Date()
  workbook.modified = new Date()
  workbook.calcProperties.fullCalcOnLoad = true

  const wsValidaciones = workbook.addWorksheet('VALIDACIONES')
  wsValidaciones.state = 'veryHidden'

  const fillValidationColumn = (column, values) => {
    values.forEach((value, index) => {
      wsValidaciones.getCell(`${column}${index + 1}`).value = value
    })
  }
  const fillValidationPairs = (firstColumn, secondColumn, pairs) => {
    pairs.forEach(([firstValue, secondValue], index) => {
      const rowNumber = index + 1
      wsValidaciones.getCell(`${firstColumn}${rowNumber}`).value = firstValue
      wsValidaciones.getCell(`${secondColumn}${rowNumber}`).value = secondValue
    })
  }

  fillValidationColumn('A', tiposExcelPermitidos)
  fillValidationColumn('B', ['A', 'B'])
  fillValidationColumn('C', ['A', 'B', 'C', 'D'])
  fillValidationColumn('D', ['A', 'B', 'C', 'D', 'E'])
  fillValidationColumn('E', [''])
  fillValidationColumn('F', ['1', '2', '3'])
  fillValidationColumn('G', [parcialActivo])
  fillValidationColumn('H', respuestasPreguntaClaveExcel)
  wsValidaciones.getCell('I1').value = enunciadoEmparejamientoExcel

  const mapaRespuestaPorTipo = [
    [excelTipos.FALSO_VERDADERO, 'RESP_VF'],
    [excelTipos.RESPUESTA_COMPUESTA, 'RESP_ABCD'],
    [excelTipos.PREGUNTA_CON_CLAVE, 'RESP_CLAVE'],
    [excelTipos.SELECCION_SIMPLE, 'RESP_ABCDE'],
    [excelTipos.SUBPROBLEMA, 'RESP_ABCDE'],
    [excelTipos.OPCION_EMPAREJAMIENTO, 'RESP_ABCDE'],
  ]
  const tiposOpcionesPorColumna = {
    D: [
      excelTipos.FALSO_VERDADERO,
      excelTipos.RESPUESTA_COMPUESTA,
      excelTipos.PREGUNTA_CON_CLAVE,
      excelTipos.SELECCION_SIMPLE,
      excelTipos.SUBPROBLEMA,
      excelTipos.EMPAREJAMIENTO,
    ],
    E: [
      excelTipos.FALSO_VERDADERO,
      excelTipos.RESPUESTA_COMPUESTA,
      excelTipos.PREGUNTA_CON_CLAVE,
      excelTipos.SELECCION_SIMPLE,
      excelTipos.SUBPROBLEMA,
      excelTipos.EMPAREJAMIENTO,
    ],
    F: [
      excelTipos.RESPUESTA_COMPUESTA,
      excelTipos.PREGUNTA_CON_CLAVE,
      excelTipos.SELECCION_SIMPLE,
      excelTipos.SUBPROBLEMA,
      excelTipos.EMPAREJAMIENTO,
    ],
    G: [
      excelTipos.RESPUESTA_COMPUESTA,
      excelTipos.PREGUNTA_CON_CLAVE,
      excelTipos.SELECCION_SIMPLE,
      excelTipos.SUBPROBLEMA,
      excelTipos.EMPAREJAMIENTO,
    ],
    H: [excelTipos.SELECCION_SIMPLE, excelTipos.SUBPROBLEMA, excelTipos.EMPAREJAMIENTO],
  }

  fillValidationPairs('J', 'K', mapaRespuestaPorTipo)
  fillValidationColumn('L', tiposRequierenGrupo)
  fillValidationColumn('M', tiposSinRespuestaYDificultad)
  fillValidationColumn('N', tiposOpcionesPorColumna.D)
  fillValidationColumn('O', tiposOpcionesPorColumna.E)
  fillValidationColumn('P', tiposOpcionesPorColumna.F)
  fillValidationColumn('Q', tiposOpcionesPorColumna.G)
  fillValidationColumn('R', tiposOpcionesPorColumna.H)

  workbook.definedNames.add('VALIDACIONES!$A$1:$A$8', 'LISTA_TIPOS_2P')
  workbook.definedNames.add('VALIDACIONES!$B$1:$B$2', 'RESP_VF')
  workbook.definedNames.add('VALIDACIONES!$C$1:$C$4', 'RESP_ABCD')
  workbook.definedNames.add('VALIDACIONES!$D$1:$D$5', 'RESP_ABCDE')
  workbook.definedNames.add('VALIDACIONES!$E$1', 'RESP_VACIA')
  workbook.definedNames.add('VALIDACIONES!$F$1:$F$3', 'DIFICULTADES_123')
  workbook.definedNames.add('VALIDACIONES!$G$1', 'PARCIAL_ACTIVO_BANCO')
  workbook.definedNames.add('VALIDACIONES!$H$1:$H$5', 'RESP_CLAVE')
  workbook.definedNames.add(
    `VALIDACIONES!$J$1:$K$${mapaRespuestaPorTipo.length}`,
    'MAPA_RESPUESTA_TIPO',
  )
  workbook.definedNames.add(
    `VALIDACIONES!$L$1:$L$${tiposRequierenGrupo.length}`,
    'TIPOS_REQUIEREN_GRUPO',
  )
  workbook.definedNames.add(
    `VALIDACIONES!$M$1:$M$${tiposSinRespuestaYDificultad.length}`,
    'TIPOS_SIN_DIFICULTAD',
  )
  workbook.definedNames.add(
    `VALIDACIONES!$N$1:$N$${tiposOpcionesPorColumna.D.length}`,
    'TIPOS_OPCION_D',
  )
  workbook.definedNames.add(
    `VALIDACIONES!$O$1:$O$${tiposOpcionesPorColumna.E.length}`,
    'TIPOS_OPCION_E',
  )
  workbook.definedNames.add(
    `VALIDACIONES!$P$1:$P$${tiposOpcionesPorColumna.F.length}`,
    'TIPOS_OPCION_F',
  )
  workbook.definedNames.add(
    `VALIDACIONES!$Q$1:$Q$${tiposOpcionesPorColumna.G.length}`,
    'TIPOS_OPCION_G',
  )
  workbook.definedNames.add(
    `VALIDACIONES!$R$1:$R$${tiposOpcionesPorColumna.H.length}`,
    'TIPOS_OPCION_H',
  )

  const wsInst = workbook.addWorksheet('Instrucciones')
  wsInst.getColumn(1).width = 40
  wsInst.getColumn(2).width = 80

  const titleRow = wsInst.addRow(['BANCO DE PREGUNTAS - GUIA OFICIAL'])
  titleRow.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } }
  titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4527A0' } }

  wsInst.addRow([])

  const addGuideHeader = (text) => {
    const row = wsInst.addRow([text])
    row.font = { bold: true, size: 12 }
    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EAF6' } }
  }

  const redFont = { color: { argb: 'FFFF0000' }, bold: true }

  addGuideHeader('1. CODIGOS DE PREGUNTA (Columna TIPO)')
  wsInst.addRow([
    excelTipos.FALSO_VERDADERO,
    'opcion_a, opcion_b y respuesta_correcta se preparan automaticamente. Cambie la respuesta si el enunciado es falso.',
  ])
  wsInst.addRow([
    excelTipos.PREGUNTA_CON_CLAVE,
    'Use opcion_a a opcion_d para los incisos 1-4; opcion_e queda deshabilitada. La respuesta usa la lista A-E.',
  ])
  wsInst.addRow([
    excelTipos.SELECCION_SIMPLE,
    'Pregunta objetiva con 5 opciones donde se selecciona la mejor respuesta.',
  ])
  const rowSM1 = wsInst.addRow([
    excelTipos.RESPUESTA_COMPUESTA,
    'Use el enunciado solo con las premisas I. y II.; opcion_a a opcion_d se preparan automaticamente y la respuesta_correcta va entre A y D.',
  ])
  rowSM1.getCell(2).font = redFont
  const rowPR1 = wsInst.addRow([
    excelTipos.PROBLEMA,
    'Solo llenar grupo y enunciado. No lleva opciones, dificultad ni respuesta directa.',
  ])
  rowPR1.getCell(2).font = redFont
  wsInst.addRow([
    excelTipos.SUBPROBLEMA,
    'Pregunta hija de un caso clinico o problema. Lleva 5 opciones y una respuesta correcta.',
  ])
  const rowEM1 = wsInst.addRow([
    excelTipos.EMPAREJAMIENTO,
    'El enunciado se prepara automaticamente. Llene grupo y de 2 a 5 claves en opcion_a a opcion_e. No lleva dificultad ni respuesta directa.',
  ])
  rowEM1.getCell(2).font = redFont
  wsInst.addRow([
    excelTipos.OPCION_EMPAREJAMIENTO,
    'Pregunta hija de un Emparejamiento. No lleva opciones en columnas, solo grupo, enunciado, dificultad y respuesta.',
  ])
  wsInst.addRow([])

  addGuideHeader('2. RESPUESTAS VALIDAS')
  wsInst.addRow([
    excelTipos.PREGUNTA_CON_CLAVE,
    'Use una de las combinaciones fijas: A: 1, 2, 3 correctas; B: 1 y 3 correctas; C: 2 y 4 correctas; D: Solo 4 es correcta; E: Todas son correctas.',
  ])
  wsInst.addRow([
    `${excelTipos.SELECCION_SIMPLE} / ${excelTipos.SUBPROBLEMA}`,
    'Use una sola letra: A, B, C, D o E.',
  ])
  wsInst.addRow([
    `${excelTipos.EMPAREJAMIENTO} / ${excelTipos.PROBLEMA}`,
    'Deje respuesta_correcta vacia.',
  ])
  const rowSM2 = wsInst.addRow([
    excelTipos.RESPUESTA_COMPUESTA,
    'La respuesta_correcta solo puede ser A, B, C o D.',
  ])
  rowSM2.getCell(2).font = redFont
  wsInst.addRow([excelTipos.FALSO_VERDADERO, 'A para Verdadero, B para Falso.'])
  wsInst.addRow([
    excelTipos.OPCION_EMPAREJAMIENTO,
    'Use la letra correcta segun las opciones activas definidas en el encabezado del emparejamiento.',
  ])
  const rowPR2 = wsInst.addRow([excelTipos.PROBLEMA, 'No debe llevar respuesta_correcta.'])
  rowPR2.getCell(2).font = redFont
  wsInst.addRow([])

  addGuideHeader('3. CONFIGURACION DEL EXAMEN')
  const rowDif = wsInst.addRow([
    'Dificultad (Nivel)',
    '1 (Facil), 2 (Medio), 3 (Dificil). Casos/problemas y Emparejamiento Ampliado no llevan dificultad.',
  ])
  rowDif.getCell(1).font = redFont
  rowDif.getCell(2).font = redFont
  wsInst.addRow(['Parcial activo', `${parcialActivo} (${parcialActivoLabel})`])
  if (parcialActivo === '2P') {
    wsInst.addRow([
      'Registro por grupo',
      'En 2do Parcial el banco se organiza y se valida individualmente por grupo teorico.',
    ])
  }
  wsInst.addRow([
    'Columna observaciones',
    'La columna L se completa automaticamente y te dira si la fila esta OK o que campos faltan/revisar.',
  ])
  wsInst.addRow([])

  addGuideHeader('NOTAS IMPORTANTES')
  const note = wsInst.addRow(['- No elimine columnas ni cambie el nombre de la hoja "Banco".'])
  note.font = { italic: true, color: { argb: 'FFC62828' } }
  const noteSM = wsInst.addRow([
    '- IMPORTANTE: Respuesta A/B/Ambas/Ninguna usa solo las premisas I. y II. en enunciado; opcion_a a opcion_d lleva las respuestas fijas y opcion_e no se usa.',
  ])
  noteSM.font = redFont
  const notePC = wsInst.addRow([
    '- IMPORTANTE: Verdadero o Falso Complejas usa solo los incisos 1, 2, 3 y 4 en opcion_a a opcion_d. No llene opcion_e.',
  ])
  notePC.font = redFont
  const notePREM = wsInst.addRow([
    '- IMPORTANTE: Casos/problemas y Emparejamiento Ampliado son encabezados y no deben tener dificultad.',
  ])
  notePREM.font = redFont
  const noteObs = wsInst.addRow([
    '- IMPORTANTE: Si la columna L no indica "OK", corrige esa fila antes de importar.',
  ])
  noteObs.font = redFont
  wsInst.addRow([
    '- Conteo por grupos de tipo: Grupo 1 = VF simple + VF complejas + A/B/Ambas/Ninguna. Grupo 2 = mejor respuesta. Grupo 3 = casos/problemas y emparejamiento ampliado.',
  ])

  const wsBanco = workbook.addWorksheet('Banco')
  wsBanco.views = [{ state: 'frozen', ySplit: 1 }]
  wsBanco.autoFilter = 'A1:L1'

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
    'observaciones',
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
    const row = wsBanco.addRow(['', grupo, '', '', '', '', '', '', '', dif, parcial, ''])
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
    row.height = 24
  }

  for (let i = 0; i < 15; i++) addPreguntaRow('1', parcialActivo, 'FFC6EFCE')
  for (let i = 0; i < 30; i++) addPreguntaRow('2', parcialActivo, 'FFFFEB9C')
  for (let i = 0; i < 15; i++) addPreguntaRow('3', parcialActivo, 'FFFFC7CE')

  wsBanco.columns = [
    { width: 24 },
    { width: 18 },
    { width: 60, style: { alignment: { wrapText: true, vertical: 'top' } } },
    { width: 25, style: { alignment: { wrapText: true, vertical: 'top' } } },
    { width: 25, style: { alignment: { wrapText: true, vertical: 'top' } } },
    { width: 25, style: { alignment: { wrapText: true, vertical: 'top' } } },
    { width: 25, style: { alignment: { wrapText: true, vertical: 'top' } } },
    { width: 25, style: { alignment: { wrapText: true, vertical: 'top' } } },
    { width: 20 },
    { width: 12 },
    { width: 12 },
    { width: 46, style: { alignment: { wrapText: true, vertical: 'top' } } },
  ]
  observacionesHelperColumns.forEach((columnLetter, index) => {
    const column = wsBanco.getColumn(columnLetter)
    column.hidden = true
    column.width = 3
    wsBanco.getCell(`${columnLetter}1`).value = `_obs_${index + 1}`
  })

  for (let i = filasBancoDesde; i <= filasBancoHasta; i++) {
    wsBanco.getCell(`C${i}`).value = {
      formula: `IF($A${i}="${excelTipos.EMPAREJAMIENTO}",VALIDACIONES!$I$1,IF($A${i}="${excelTipos.RESPUESTA_COMPUESTA}","I. "&CHAR(10)&"II. ",""))`,
      result: '',
    }
    wsBanco.getCell(`C${i}`).alignment = { wrapText: true, vertical: 'top' }
    wsBanco.getCell(`D${i}`).value = {
      formula: `IF($A${i}="${excelTipos.FALSO_VERDADERO}","Verdadero",IF($A${i}="${excelTipos.RESPUESTA_COMPUESTA}","${opcionesRespuestaCompuestaExcel[0]}",""))`,
      result: '',
    }
    wsBanco.getCell(`E${i}`).value = {
      formula: `IF($A${i}="${excelTipos.FALSO_VERDADERO}","Falso",IF($A${i}="${excelTipos.RESPUESTA_COMPUESTA}","${opcionesRespuestaCompuestaExcel[1]}",""))`,
      result: '',
    }
    wsBanco.getCell(`F${i}`).value = {
      formula: `IF($A${i}="${excelTipos.RESPUESTA_COMPUESTA}","${opcionesRespuestaCompuestaExcel[2]}","")`,
      result: '',
    }
    wsBanco.getCell(`G${i}`).value = {
      formula: `IF($A${i}="${excelTipos.RESPUESTA_COMPUESTA}","${opcionesRespuestaCompuestaExcel[3]}","")`,
      result: '',
    }
    wsBanco.getCell(`I${i}`).value = {
      formula: `IF($A${i}="${excelTipos.FALSO_VERDADERO}","A","")`,
      result: '',
    }

    wsBanco.getCell(`A${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['LISTA_TIPOS_2P'],
      showInputMessage: true,
      promptTitle: 'Tipo de pregunta',
      prompt:
        'Seleccione el tipo desde la lista. La columna L indicara que estructura corresponde completar.',
      showErrorMessage: true,
      errorTitle: 'Tipo no valido',
      error: 'Seleccione un tipo desde la lista del formato oficial.',
    }
    wsBanco.getCell(`C${i}`).dataValidation = {
      type: 'custom',
      allowBlank: true,
      formulae: ['TRUE'],
      showInputMessage: true,
      promptTitle: 'Ayuda para enunciado',
      prompt:
        'Emparejamiento Ampliado se completa con el texto base. Respuesta A/B/Ambas/Ninguna usa solo I. y II. Verdadero o Falso Complejas usa solo el enunciado general.',
    }
    wsBanco.getCell(`B${i}`).dataValidation = {
      type: 'custom',
      allowBlank: true,
      formulae: [
        `IF(ISNUMBER(MATCH($A${i},TIPOS_REQUIEREN_GRUPO,0)),LEN(TRIM($B${i}))>0,LEN(TRIM($B${i}))=0)`,
      ],
      showErrorMessage: true,
      errorTitle: 'Grupo invalido',
      error:
        'El grupo solo se llena en casos/problemas, subitems, emparejamiento ampliado y opciones de emparejamiento.',
    }
    wsBanco.getCell(`I${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`INDIRECT(IFERROR(VLOOKUP($A${i},MAPA_RESPUESTA_TIPO,2,FALSE),"RESP_VACIA"))`],
      showErrorMessage: true,
      errorTitle: 'Respuesta invalida',
      error: 'Seleccione una respuesta valida segun el tipo de pregunta.',
      showInputMessage: true,
      promptTitle: 'Ayuda para respuesta',
      prompt:
        'Verdadero/Falso Simple inicia en A y puede cambiarse a B. Respuesta A/B/Ambas/Ninguna usa A-D. Verdadero/Falso Complejas usa combinaciones A-E.',
    }
    wsBanco.getCell(`J${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [
        `INDIRECT(IF(ISNUMBER(MATCH($A${i},TIPOS_SIN_DIFICULTAD,0)),"RESP_VACIA","DIFICULTADES_123"))`,
      ],
      showErrorMessage: true,
      errorTitle: 'Dificultad invalida',
      error: 'Use 1, 2 o 3. Casos/problemas y Emparejamiento Ampliado no llevan dificultad.',
    }
    wsBanco.getCell(`K${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['PARCIAL_ACTIVO_BANCO'],
      showErrorMessage: true,
      errorTitle: 'Parcial invalido',
      error: `Use unicamente ${parcialActivo} para este formato.`,
    }
    ;[
      ['D', 'TIPOS_OPCION_D'],
      ['E', 'TIPOS_OPCION_E'],
      ['F', 'TIPOS_OPCION_F'],
      ['G', 'TIPOS_OPCION_G'],
      ['H', 'TIPOS_OPCION_H'],
    ].forEach(([columnLetter, allowedRangeName]) => {
      wsBanco.getCell(`${columnLetter}${i}`).dataValidation = {
        type: 'custom',
        allowBlank: true,
        formulae: [buildOptionValidationFormula(i, columnLetter, allowedRangeName)],
        showInputMessage: true,
        promptTitle: 'Ayuda para incisos',
        prompt:
          'VF simple y Respuesta A/B/Ambas/Ninguna se preparan automaticamente. VF complejas usa 1. a 4. Mejor respuesta y subitem usan A-E.',
        showErrorMessage: true,
        errorTitle: 'Inciso no permitido',
        error:
          'Ese inciso no corresponde al tipo seleccionado. Revise la columna L para ver que falta o sobra.',
      }
    })

    const observacionesChecks = buildObservacionesChecks(i)
    const helperColumns = observacionesHelperColumns.slice(0, observacionesChecks.length)
    observacionesChecks.forEach((check, index) => {
      const helperCell = wsBanco.getCell(`${helperColumns[index]}${i}`)
      helperCell.value = {
        formula: buildObservacionesHelperFormula(i, check, index),
        result: '',
      }
    })

    const observacionesCell = wsBanco.getCell(`L${i}`)
    observacionesCell.value = {
      formula: buildObservacionesFormula(i, helperColumns),
      result: '',
    }
    observacionesCell.font = { bold: true }
  }

  const rowF = wsBanco.getRow(63)
  rowF.getCell(9).value = 'Total Faciles:'
  rowF.getCell(9).font = { bold: true }
  rowF.getCell(10).value = { formula: 'COUNTIF(J2:J61, 1)' }

  const rowM = wsBanco.getRow(64)
  rowM.getCell(9).value = 'Total Medias:'
  rowM.getCell(9).font = { bold: true }
  rowM.getCell(10).value = { formula: 'COUNTIF(J2:J61, 2)' }

  const rowD = wsBanco.getRow(65)
  rowD.getCell(9).value = 'Total Dificiles:'
  rowD.getCell(9).font = { bold: true }
  rowD.getCell(10).value = { formula: 'COUNTIF(J2:J61, 3)' }

  const rowGrupo1 = wsBanco.getRow(67)
  rowGrupo1.getCell(9).value = 'Grupo 1 (VF simple + complejas + A/B):'
  rowGrupo1.getCell(9).font = { bold: true }
  rowGrupo1.getCell(10).value = {
    formula: countByTiposFormula([
      excelTipos.FALSO_VERDADERO,
      excelTipos.PREGUNTA_CON_CLAVE,
      excelTipos.RESPUESTA_COMPUESTA,
    ]),
  }

  const rowGrupo2 = wsBanco.getRow(68)
  rowGrupo2.getCell(9).value = 'Grupo 2 (Mejor respuesta):'
  rowGrupo2.getCell(9).font = { bold: true }
  rowGrupo2.getCell(10).value = { formula: countByTiposFormula([excelTipos.SELECCION_SIMPLE]) }

  const rowGrupo3 = wsBanco.getRow(69)
  rowGrupo3.getCell(9).value = 'Grupo 3 (Casos/problemas y emp.):'
  rowGrupo3.getCell(9).font = { bold: true }
  rowGrupo3.getCell(10).value = {
    formula: countByTiposFormula([excelTipos.SUBPROBLEMA, excelTipos.OPCION_EMPAREJAMIENTO]),
  }

  wsBanco.getCell('A71').value = 'NOTAS DE CARGA'
  wsBanco.getCell('A71').font = { bold: true }
  wsBanco.getCell('A72').value =
    '1. La columna L te dira si la fila esta OK o que campos faltan/revisar.'
  wsBanco.getCell('A73').value =
    '2. Casos/problemas y Emparejamiento Ampliado usan grupo y enunciado, pero no respuesta_correcta ni dificultad.'
  wsBanco.getCell('A74').value =
    '3. Emparejamiento Ampliado puede usar de 2 a 5 claves en opcion_a a opcion_e.'
  wsBanco.getCell('A75').value =
    '4. En Verdadero o Falso Simple, opcion_a, opcion_b y respuesta_correcta se preparan automaticamente.'
  wsBanco.getCell('A76').value =
    `5. En Respuesta A/B/Ambas/Ninguna, escriba solo I. y II. en el enunciado; opcion_a a opcion_d se preparan con: ${opcionesRespuestaCompuestaExcel.join(' | ')}.`
  wsBanco.getCell('A77').value =
    '6. En Verdadero o Falso Complejas, escriba 1. a 4. en opcion_a a opcion_d; opcion_e queda deshabilitada.'
  wsBanco.getCell('A78').value =
    `7. En Emparejamiento Ampliado, el enunciado se prepara con: ${enunciadoEmparejamientoExcel}`
  wsBanco.getCell('A79').value =
    `8. Este formato esta preparado para ${parcialActivo} (${parcialActivoLabel}).`
  wsBanco.getCell('A80').value =
    '9. Los grupos de conteo por tipo no consideran casos/problemas ni emparejamientos porque funcionan como cabeceras.'

  const disabledCellStyle = {
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    },
    font: {
      color: { argb: 'FF616161' },
    },
  }

  wsBanco.addConditionalFormatting({
    ref: `D${filasBancoDesde}:H${filasBancoHasta}`,
    rules: [
      {
        type: 'expression',
        formulae: [`OR($A2="${excelTipos.PROBLEMA}",$A2="${excelTipos.OPCION_EMPAREJAMIENTO}")`],
        style: disabledCellStyle,
      },
    ],
  })
  wsBanco.addConditionalFormatting({
    ref: `F${filasBancoDesde}:H${filasBancoHasta}`,
    rules: [
      {
        type: 'expression',
        formulae: [`$A2="${excelTipos.FALSO_VERDADERO}"`],
        style: disabledCellStyle,
      },
    ],
  })
  wsBanco.addConditionalFormatting({
    ref: `H${filasBancoDesde}:H${filasBancoHasta}`,
    rules: [
      {
        type: 'expression',
        formulae: [
          `OR($A2="${excelTipos.RESPUESTA_COMPUESTA}",$A2="${excelTipos.PREGUNTA_CON_CLAVE}")`,
        ],
        style: disabledCellStyle,
      },
    ],
  })
  wsBanco.addConditionalFormatting({
    ref: `I${filasBancoDesde}:J${filasBancoHasta}`,
    rules: [
      {
        type: 'expression',
        formulae: [`OR($A2="${excelTipos.PROBLEMA}",$A2="${excelTipos.EMPAREJAMIENTO}")`],
        style: disabledCellStyle,
      },
    ],
  })
  wsBanco.addConditionalFormatting({
    ref: `L${filasBancoDesde}:L${filasBancoHasta}`,
    rules: [
      {
        type: 'expression',
        formulae: ['LEFT($L2,2)="OK"'],
        style: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFC6EFCE' },
          },
          font: {
            color: { argb: 'FF1B5E20' },
            bold: true,
          },
        },
      },
      {
        type: 'expression',
        formulae: ['AND($L2<>"",LEFT($L2,2)<>"OK")'],
        style: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFCE4D6' },
          },
          font: {
            color: { argb: 'FFC62828' },
            bold: true,
          },
        },
      },
    ],
  })

  const wsEj = workbook.addWorksheet('Ejemplo')
  const ejHeaderRow = wsEj.addRow(headers)
  ejHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006064' } }
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  })

  const addEjRow = (tipo, dif, parc, enun, r, ops = [], grupo = '', obs = 'OK') => {
    const rowData = [tipo, grupo, enun, '', '', '', '', '', r, dif, parc, obs]
    for (let i = 0; i < Math.min(ops.length, 5); i++) {
      rowData[3 + i] = ops[i]
    }
    const row = wsEj.addRow(rowData)
    row.getCell(1).font = { bold: true }
    row.getCell(3).alignment = { wrapText: true, vertical: 'top' }
    if (String(enun || '').includes('\n')) {
      row.height = 36
    }
  }

  addEjRow(
    excelTipos.FALSO_VERDADERO,
    '1',
    parcialActivo,
    'El agua hierve a 100 grados Celsius al nivel del mar.',
    'A',
    ['Verdadero', 'Falso'],
  )
  addEjRow(
    excelTipos.FALSO_VERDADERO,
    '1',
    parcialActivo,
    'La Antartida es el continente mas calido del planeta.',
    'B',
    ['Verdadero', 'Falso'],
  )
  addEjRow(
    excelTipos.PREGUNTA_CON_CLAVE,
    '2',
    parcialActivo,
    'Seleccione los incisos correctos sobre geografia mundial.',
    respuestasPreguntaClaveExcel[0],
    [
      '1. Asia es el continente con mayor superficie.',
      '2. El rio Nilo se encuentra en Africa.',
      '3. Brasil esta ubicado en America del Sur.',
      '4. Australia forma parte de Europa.',
    ],
  )
  addEjRow(
    excelTipos.PREGUNTA_CON_CLAVE,
    '2',
    parcialActivo,
    'Seleccione los incisos correctos sobre ciencias naturales.',
    respuestasPreguntaClaveExcel[2],
    [
      '1. Los mamiferos respiran por branquias durante toda su vida.',
      '2. La fotosintesis permite a las plantas producir glucosa.',
      '3. El oxigeno es necesario para la respiracion celular aerobia.',
      '4. El agua puede encontrarse en estado solido, liquido y gaseoso.',
    ],
  )
  addEjRow(
    excelTipos.SELECCION_SIMPLE,
    '2',
    parcialActivo,
    'Cual es el planeta mas cercano al Sol?',
    'B',
    ['Venus', 'Mercurio', 'Marte', 'Jupiter', 'Saturno'],
  )
  addEjRow(
    excelTipos.SELECCION_SIMPLE,
    '2',
    parcialActivo,
    'Que organo bombea la sangre en el cuerpo humano?',
    'C',
    ['Pulmon', 'Higado', 'Corazon', 'Estomago', 'Rinon'],
  )
  addEjRow(
    excelTipos.RESPUESTA_COMPUESTA,
    '3',
    parcialActivo,
    'I. La capital de Bolivia es Sucre.' + '\nII. La sede de gobierno de Bolivia esta en La Paz.',
    'C',
    opcionesRespuestaCompuestaExcel,
  )
  addEjRow(
    excelTipos.RESPUESTA_COMPUESTA,
    '3',
    parcialActivo,
    'I. La Tierra gira alrededor del Sol.' + '\nII. La Luna es una estrella con luz propia.',
    'A',
    opcionesRespuestaCompuestaExcel,
  )
  addEjRow(
    excelTipos.PROBLEMA,
    '',
    parcialActivo,
    'Caso de lectura 1: En una ciudad se organiza una campana para reducir residuos. El equipo municipal instalara puntos de reciclaje, separara materiales y comunicara horarios de recoleccion a los vecinos.',
    '',
    [],
    'CASO-GEN1',
  )
  addEjRow(
    excelTipos.SUBPROBLEMA,
    '2',
    parcialActivo,
    'Cual es una accion inicial adecuada para que la campana funcione?',
    'A',
    [
      'Definir puntos de reciclaje visibles y accesibles',
      'Ocultar los horarios de recoleccion',
      'Mezclar todos los residuos en una sola bolsa',
      'Eliminar la comunicacion con los vecinos',
      'Suspender la separacion de materiales',
    ],
    'CASO-GEN1',
  )
  addEjRow(
    excelTipos.SUBPROBLEMA,
    '2',
    parcialActivo,
    'Que tipo de residuo corresponde separar en un contenedor para papel y carton?',
    'C',
    [
      'Restos de comida',
      'Botellas de vidrio',
      'Cajas de carton limpias',
      'Pilas usadas',
      'Aceite de cocina',
    ],
    'CASO-GEN1',
  )
  addEjRow(
    excelTipos.EMPAREJAMIENTO,
    '',
    parcialActivo,
    'De la lista de opciones, seleccione la respuesta correcta para cada enunciado',
    '',
    ['Sol', 'Luna'],
    'EMP-GEN1',
  )
  addEjRow(
    excelTipos.OPCION_EMPAREJAMIENTO,
    '1',
    parcialActivo,
    'Estrella ubicada en el centro del sistema solar.',
    'A',
    [],
    'EMP-GEN1',
  )
  addEjRow(
    excelTipos.OPCION_EMPAREJAMIENTO,
    '1',
    parcialActivo,
    'Satelite natural de la Tierra.',
    'B',
    [],
    'EMP-GEN1',
  )
  addEjRow(
    excelTipos.EMPAREJAMIENTO,
    '',
    parcialActivo,
    'De la lista de opciones, seleccione la respuesta correcta para cada enunciado',
    '',
    ['Evaporacion', 'Condensacion', 'Precipitacion', 'Infiltracion'],
    'EMP-GEN2',
  )
  addEjRow(
    excelTipos.OPCION_EMPAREJAMIENTO,
    '2',
    parcialActivo,
    'Proceso por el cual el vapor de agua se transforma en gotas.',
    'B',
    [],
    'EMP-GEN2',
  )
  addEjRow(
    excelTipos.OPCION_EMPAREJAMIENTO,
    '2',
    parcialActivo,
    'Caida de agua desde las nubes hacia la superficie.',
    'C',
    [],
    'EMP-GEN2',
  )

  wsEj.columns = wsBanco.columns
  wsEj.views = [{ state: 'frozen', ySplit: 1 }]

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = `formato_banco_preguntas_${asignatura.value?.sigla || 'asig'}_${parcialActivo}.xlsx`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'Excel generado exitosamente', icon: 'check_circle' })
}

const validacionDistribucion = computed(() => {
  if (importacionAcumulativaSegundoParcial.value) {
    return importStats.value.total > 0
  }

  const countF = importStats.value.faciles || 0
  const countM = importStats.value.medios || 0
  const countD = importStats.value.dificiles || 0
  return importStats.value.total >= 60 && countF >= 15 && countM >= 30 && countD >= 15
})

const gruposTeoricosOptions = computed(() => {
  if (!asignatura.value || !asignatura.value.grupos) return []

  // Normalizar el filtro de tipo (la DB usa TEORICO pero el cÒ�� �"Ò� â����Ò�â��šÒ�a�³digo a veces usa TEORICA)
  let grupos = asignatura.value.grupos.filter(
    (g) => g.tipo === 'TEORICA' || g.tipo === 'TEORICO' || g.tipo === 'TEO',
  )

  // Filtrar por docente si el rol es DOCENTE o si somos directivos viendo una carpeta especÒ�� �"Ò� â����Ò�â��šÒ�a�­fica
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

const TIPOS_VALIDOS = [
  ...new Set(
    tiposPreguntaOptions.flatMap((tipo) =>
      tipo.aliases.flatMap((alias) => [
        String(alias).toLowerCase().trim(),
        normalizarTipoAliasKey(alias).toLowerCase(),
      ]),
    ),
  ),
]
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

function normalizarRespuestaExcelBanco(valor) {
  const respuesta = normalizarTextoMojibake(String(valor || ''))
    .trim()
    .toUpperCase()
  const match = respuesta.match(/^([A-E])(?:\s*[:.)-]|\b)/)
  return match ? match[1] : respuesta
}

function previsualizarArchivoExcel(file) {
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    import('xlsx').then(async (XLSX) => {
      try {
        await cargarBancoPreguntas()

        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: 'array' })

        // Buscar la hoja "Banco" o usar la primera
        const sheetName = wb.SheetNames.includes('Banco') ? 'Banco' : wb.SheetNames[0]
        const ws = wb.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

        // Encontrar fila de encabezado e identificar dinÒ�� �"Ò� â����Ò�â��šÒ�a�¡micamente el orden
        let headerRowIdx = -1
        let colsMap = { ...COLS }
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const rowLower = rows[i].map((c) =>
            normalizarTextoMojibake(String(c || ''))
              .toLowerCase()
              .trim(),
          )
          if (rowLower.includes('tipo') && rowLower.includes('enunciado')) {
            headerRowIdx = i
            rowLower.forEach((colName, idx) => {
              if (colName === 'tipo') colsMap.tipo = idx
              else if (colName === 'grupo') colsMap.grupo = idx
              else if (colName === 'enunciado') colsMap.enunciado = idx
              else if (
                colName.includes('opcion') ||
                colName.includes('opciÒ�� �"Ò� â����Ò�â��šÒ�a�³n')
              ) {
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
            'No se encontrÒ�� �"Ò� â����Ò�â��šÒ�a�³ la fila de encabezados con "tipo". Usa el formato descargado.',
          ]
          importErrores.value = [
            {
              fila: '-',
              tipo: '-',
              enunciado: 'Sin encabezados',
              mensajes: [
                'No se encontró la fila de encabezados con las columnas "tipo" y "enunciado". Usa el formato base descargado.',
              ],
            },
          ]
          archivoPreviewBanco.value = file.name
          preguntasImportadas.value = []
          return
        }

        const dataRows = rows.slice(headerRowIdx + 1)
        const erroresListado = [] // Cambiado de array de strings a array de objetos
        const preguntas = []

        dataRows.forEach((row, idx) => {
          const lineNum = headerRowIdx + idx + 2 // nmero de fila real en Excel
          const tipoEntrada = normalizarTextoMojibake(String(row[colsMap.tipo] || ''))
            .toLowerCase()
            .trim()
          const tipoEntradaKey = normalizarTipoAliasKey(tipoEntrada).toLowerCase()
          const tipo = normalizarTipoPregunta(tipoEntrada)

          // Ignorar filas vacÒ�� �"Ò� â����Ò�â��šÒ�a�­as
          if (!tipoEntrada || !row[colsMap.enunciado]) return

          const filaErrores = []

          // Validar tipo
          if (!TIPOS_VALIDOS.includes(tipoEntrada) && !TIPOS_VALIDOS.includes(tipoEntradaKey)) {
            filaErrores.push(
              `Tipo "${tipo}" no vÒ�� �"Ò� â����Ò�â��šÒ�a�¡lido. Use: ${TIPOS_VALIDOS.join(', ')}`,
            )
          }

          if (filaErrores.length > 0 && !TIPOS_VALIDOS.includes(tipoEntradaKey)) {
            filaErrores[filaErrores.length - 1] =
              `Tipo "${tipoEntrada}" no válido. Selecciona un tipo desde la lista del formato base.`
          }

          const enunciadoRaw = normalizarTextoMojibake(String(row[colsMap.enunciado] || '').trim())
          const enunciado = enunciadoRaw.replace(/\r\n|\n/g, '<br>')

          const respuesta = normalizarRespuestaExcelBanco(row[colsMap.respuesta_correcta])
          const dificultadRaw = normalizarTextoMojibake(String(row[colsMap.dificultad] || ''))
            .trim()
            .toLowerCase()
          const dificultad = DIFICULTAD_MAP[dificultadRaw] || dificultadRaw
          const parcialRaw = normalizarTextoMojibake(String(row[colsMap.parcial] || ''))
            .trim()
            .toLowerCase()
          const parcial = PARCIAL_MAP[parcialRaw] || parcialRaw
          const grupoRaw = normalizarTextoMojibake(String(row[colsMap.grupo] || '').trim())

          // Validar campos requeridos bsicos (no unificados an solo para frenar parsing)
          if (
            [
              'SELECCION_SIMPLE',
              'RESPUESTA_COMPUESTA',
              'PREGUNTA_CON_CLAVE',
              'FALSO_VERDADERO',
              'SUBPROBLEMA',
              'OPCION_EMPAREJAMIENTO',
            ].includes(tipo)
          ) {
            if (!respuesta) filaErrores.push(`Requiere respuesta_correcta.`)
            if (!dificultadRaw) filaErrores.push(`Requiere nivel de dificultad (1, 2 o 3).`)
          } else if (['EMPAREJAMIENTO', 'PROBLEMA'].includes(tipo)) {
            if (respuesta) filaErrores.push(`NO debe tener respuesta_correcta.`)
            if (dificultadRaw) filaErrores.push(`NO debe tener dificultad asignada.`)
          }

          const getOp = (key) =>
            normalizarTextoMojibake(String(row[colsMap[key]] || ''))
              .replace(/\r\n|\n/g, '<br>')
              .trim()
          const op_a = getOp('opcion_a')
          const op_b = getOp('opcion_b')
          const op_c = getOp('opcion_c')
          const op_d = getOp('opcion_d')
          const op_e = getOp('opcion_e')

          const pObj = {
            id: Date.now() + idx + Math.random(),
            tipo,
            enunciado,
            grupo: grupoRaw || null,
            grupoTeorico:
              grupoTeoricoSeleccionado.value || filtroBancoGrupoSeleccionado.value || '',
            opciones: [op_a, op_b, op_c, op_d, op_e].filter((o) => o !== ''),
            respuesta,
            dificultad: ['PROBLEMA', 'EMPAREJAMIENTO'].includes(tipo) ? '' : dificultad || '1',
            parcial: normalizarParcialBanco(
              parcial || parcialSeleccionado.value || filtroBancoParcialSeleccionado.value || '2P',
            ),
            filaExcel: lineNum,
          }

          preguntas.push(pObj)

          if (filaErrores.length > 0) {
            erroresListado.push({
              fila: lineNum,
              tipo: pObj.tipo,
              enunciado: pObj.enunciado,
              mensajes: filaErrores,
            })
          }
        })

        // ValidaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n unificada de integridad tÒ�� �"Ò� â����Ò�â��šÒ�a�©cnica (despuÒ�� �"Ò� â����Ò�â��šÒ�a�©s de colectar cabeceras)
        const gruposHeadersMap = new Map()
        preguntas.forEach((p) => {
          const t = normalizarTipoPregunta(p.tipo, p)
          const g = String(p.grupo || '')
            .trim()
            .toUpperCase()
          if (['EMPAREJAMIENTO', 'PROBLEMA'].includes(t) && g) {
            gruposHeadersMap.set(g, t)
          }
        })

        preguntas.forEach((p, idxValid) => {
          const fallosTecnicos = validarIntegridadPregunta(p, gruposHeadersMap)
          if (fallosTecnicos.length > 0) {
            const lineNum = p.filaExcel || headerRowIdx + idxValid + 1 + 1
            const existeFila = erroresListado.find((e) => e.fila === lineNum)
            if (existeFila) {
              existeFila.mensajes.push(...fallosTecnicos)
            } else {
              erroresListado.push({
                fila: lineNum,
                tipo: p.tipo,
                enunciado: p.enunciado,
                mensajes: fallosTecnicos,
              })
            }
          }
        })

        validarDuplicadosImportacion(preguntas, erroresListado)

        // Calcular stats
        const preguntasReales = preguntas.filter(
          (p) => !['EMPAREJAMIENTO', 'PROBLEMA'].includes(normalizarTipoPregunta(p.tipo, p)),
        )
        const stats = { total: preguntasReales.length, faciles: 0, medios: 0, dificiles: 0 }
        preguntasReales.forEach((p) => {
          if (p.dificultad === '1') stats.faciles++
          else if (p.dificultad === '2') stats.medios++
          else if (p.dificultad === '3') stats.dificiles++
        })

        preguntasImportadas.value = preguntas
        importErrores.value = erroresListado
        importStats.value = stats
        archivoPreviewBanco.value = file.name

        if (preguntas.length === 0 && erroresListado.length === 0) {
          importErrores.value = [
            {
              fila: '-',
              tipo: '-',
              enunciado: 'Sin datos',
              mensajes: [
                'El archivo no tiene filas de datos vÒ�� �"Ò� â����Ò�â��šÒ�a�¡lidas despuÒ�� �"Ò� â����Ò�â��šÒ�a�©s del encabezado.',
              ],
            },
          ]
          importErrores.value = [
            {
              fila: '-',
              tipo: '-',
              enunciado: 'Sin datos',
              mensajes: [
                'El archivo no tiene filas de datos válidas después del encabezado. Revisa que las filas tengan tipo y enunciado.',
              ],
            },
          ]
        }
      } catch (err) {
        importErrores.value = [
          {
            fila: '-',
            tipo: '-',
            enunciado: 'Error de lectura',
            mensajes: [`No se pudo leer el archivo: ${err.message}`],
          },
        ]
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

  if (importErroresNormalizados.value.length > 0) {
    $q.notify({
      type: 'warning',
      message: 'Corrige los errores detectados antes de importar el banco.',
    })
    return
  }

  await cargarBancoPreguntas()

  const erroresDuplicados = []
  validarDuplicadosImportacion(preguntasImportadas.value, erroresDuplicados)
  if (erroresDuplicados.length > 0) {
    importErrores.value = erroresDuplicados
    $q.notify({
      type: 'warning',
      message:
        'El archivo contiene preguntas duplicadas. Revisa la vista previa antes de importar.',
    })
    return
  }

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
    formData.append('con_cartilla', conCartilla.value ? '1' : '0')
    const parcialImportacion = normalizarParcialBanco(
      filtroBancoParcialSeleccionado.value || parcialSeleccionado.value || '2P',
    )
    formData.append('parcial', parcialImportacion)

    if (!importacionAcumulativaSegundoParcial.value && modoImportacion.value === 'reemplazar') {
      formData.append('modo', 'reemplazar') // El backend puede manejar esto para limpiar antes de insertar
    } else {
      formData.append('modo', 'agregar')
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

      // Por ahora, para feedback inmediato, actualizamos el local mock con lo que procesÒ�� �"Ò� â����Ò�â��šÒ�a�³ el backend
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
      message: 'No se pudo completar la importaciÒ�� �"Ò� â����Ò�â��šÒ�a�³n',
      caption: error.response?.data?.error || error.message,
      icon: 'error',
    })
  } finally {
    importandoBanco.value = false
  }
}

async function confirmarConfiguracionSinCartilla() {
  if (!grupoTeoricoSeleccionado.value) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar un grupo teÒ�� �"Ò� â����Ò�â��šÒ�a�³rico',
      icon: 'warning',
    })
    return
  }

  // Verificar si hay preguntas que se borrarÒ�� �"Ò� â����Ò�â��šÒ�a�¡n
  const preguntasGrupo = (store.bancoPreguntas || []).filter(
    (p) =>
      p.grupoTeorico === grupoTeoricoSeleccionado.value &&
      p.parcial === (parcialSeleccionado.value || '1P'),
  )

  if (preguntasGrupo.length > 0) {
    $q.dialog({
      title: '<span class="text-negative">Confirmar Accion</span>',
      message: `Se han detectado <strong>${preguntasGrupo.length} preguntas</strong> en el banco para este grupo y parcial. Al marcar "Sin Cartilla", estas preguntas serán <strong>eliminadas permanentemente</strong>. ¿Desea continuar?`,
      html: true,
      persistent: true,
      ok: {
        label: 'SÒ�� �"Ò� â����Ò�â��šÒ�a�­, borrar y guardar',
        color: 'negative',
        unelevated: true,
        noCaps: true,
      },
      cancel: { label: 'Cancelar', flat: true, noCaps: true },
    }).onOk(() => {
      ejecutarGuardarConfiguracion(false)
    })
  } else {
    ejecutarGuardarConfiguracion(false)
  }
}

async function guardarConfiguracionSinCartillaTrue() {
  if (!grupoTeoricoSeleccionado.value) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar un grupo teÒ�� �"Ò� â����Ò�â��šÒ�a�³rico',
      icon: 'warning',
    })
    return
  }
  ejecutarGuardarConfiguracion(true)
}

async function ejecutarGuardarConfiguracion(valorConCartilla) {
  importandoBanco.value = true
  try {
    const payload = {
      asignatura_id: route.params.id,
      grupo_teorico: grupoTeoricoSeleccionado.value,
      parcial: parcialSeleccionado.value || '1P',
      con_cartilla: valorConCartilla,
    }

    const response = await api.post('/banco-preguntas/save-config', payload)

    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: valorConCartilla
          ? 'Preferencia restablecida a "Con Cartilla".'
          : 'Preferencia "Sin Cartilla" guardada. El banco de preguntas ha sido vaciado.',
        icon: 'check_circle',
      })
      cerrarDialogImportBanco()
      await cargarBancoPreguntas() // Recargar para ver que se borraron
    }
  } catch (error) {
    console.error('Error al guardar preferencia:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo guardar la preferencia',
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
  parcialSeleccionado.value = filtroBancoParcialSeleccionado.value || '2P'
  grupoTeoricoSeleccionado.value = filtroBancoGrupoSeleccionado.value || null
}

function getChipColorTipo(tipo) {
  return getTipoColorBanco(tipo)
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

/* BibliografÒ�� �"Ò� â����Ò�â��šÒ�a�­a cards */
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

.conteo-progress {
  width: 100%;
}

.conteo-progress__bar {
  overflow: hidden;
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

/* ---- Importacion Banco de Preguntas ---- */
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

.preview-paper {
  background: #fff;
  border: 1px solid #dbe4f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.preview-section-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e3a8a;
  letter-spacing: 0.02em;
  margin-bottom: 10px;
}

.preview-instruction-line {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #334155;
  margin-bottom: 4px;
}

.preview-question-block {
  margin-top: 18px;
}

.preview-question-line {
  font-size: 1rem;
  line-height: 1.7;
  color: #0f172a;
}

.preview-option-line {
  font-size: 0.97rem;
  line-height: 1.6;
  color: #334155;
  margin-left: 24px;
  margin-top: 4px;
}

.preview-option-title {
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.5;
  color: #1e3a8a;
  margin-left: 24px;
  margin-top: 12px;
}

.preview-detail-line {
  font-size: 0.97rem;
  line-height: 1.7;
  color: #334155;
  margin-left: 24px;
  margin-top: 4px;
}

.preview-answer-note {
  margin-top: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #475569;
}

/* ---- Parametrizacion Banco de Preguntas ---- */
.banco-header {
  background: linear-gradient(135deg, #4527a0, #7b1fa2);
  padding: 20px 24px;
  border-radius: 0 0 16px 16px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  box-shadow: 0 4px 20px rgba(123, 31, 162, 0.2);
}

.banco-actions {
  gap: 10px;
}

.banco-action-tooltip-anchor {
  display: inline-flex;
}

.banco-action-btn {
  width: 42px;
  height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #fff;
  box-shadow: 0 12px 24px rgba(20, 13, 64, 0.24);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.banco-action-btn:not(.disabled):hover {
  transform: translateY(-2px);
  filter: brightness(1.06) saturate(1.12);
  box-shadow: 0 16px 30px rgba(20, 13, 64, 0.34);
}

.banco-action-btn--download {
  background: #2563eb;
  color: #fff;
}

.banco-action-btn--validate {
  background: #f59e0b;
  color: #fff;
}

.banco-action-btn--preview {
  background: #0891b2;
  color: #fff;
}

.banco-action-btn--upload {
  background: #7c3aed;
  color: #fff;
}

.banco-action-btn--delete {
  background: #dc2626;
  color: #fff;
}

.banco-action-btn--register {
  background: #059669;
  color: #fff;
}

:deep(.banco-action-tooltip) {
  max-width: 280px;
  padding: 10px 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #111827, #312e81);
  color: #fff;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.34);
}

:deep(.banco-action-tooltip__title) {
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.01em;
}

:deep(.banco-action-tooltip__caption) {
  margin-top: 3px;
  font-size: 0.74rem;
  line-height: 1.35;
  opacity: 0.88;
}

:deep(.banco-action-tooltip__warning) {
  margin-top: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.35;
  color: #fde68a;
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
