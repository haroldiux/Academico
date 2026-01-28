<template>
  <q-page class="q-pa-lg">
    <!-- Breadcrumb & Header -->
    <div class="row items-center q-mb-lg animate-in">
      <div class="col">
        <q-breadcrumbs class="q-mb-sm">
          <q-breadcrumbs-el icon="home" to="/" />
          <q-breadcrumbs-el :label="breadcrumbInfo.label" :to="breadcrumbInfo.to" />
          <q-breadcrumbs-el :label="asignatura?.codigo || 'Asignatura'" />
        </q-breadcrumbs>
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="menu_book" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">{{ asignatura?.nombre || 'Cargando...' }}</span>
          <q-chip v-if="asignatura?.estado" :color="asignatura.estado === 'APROBADO' ? 'green-2' : 'orange-2'"
            :text-color="asignatura.estado === 'APROBADO' ? 'green-9' : 'orange-9'" class="q-ml-sm text-weight-bold"
            dense>
            {{ asignatura.estado === 'APROBADO' ? 'APROBADO' : 'EN PROCESO' }}
          </q-chip>
        </h4>
        <p class="q-ma-none q-mt-xs" style="color: var(--text-secondary);">
          {{ asignatura?.codigo }} - {{ asignatura?.semestre }}° Semestre • {{ nombreCarrera }}
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
      <div class="col-auto row q-gutter-sm">
        <q-btn v-if="puedeAprobarCarpeta"
          :label="asignatura?.estado === 'APROBADO' ? 'Reabrir Carpeta' : 'Aprobar Carpeta'"
          :color="asignatura?.estado === 'APROBADO' ? 'orange' : 'green'"
          :icon="asignatura?.estado === 'APROBADO' ? 'lock_open' : 'check_circle'" no-caps unelevated
          @click="toggleEstadoCarpeta" />

        <q-btn outline color="indigo" icon="calendar_month" label="Planificación Semestral" no-caps
          :to="`/documentacion/${route.params.id}/planificacion`" />
        <q-btn v-if="puedeImportar" outline color="teal" icon="upload_file" label="Importar Word" no-caps
          @click="abrirDialogoImportar">
          <q-tooltip>Importar contenido desde Documento Word (Sede Central)</q-tooltip>
        </q-btn>
        <q-btn outline color="green" icon="picture_as_pdf" label="Generar PDF" no-caps>
          <q-menu>
            <q-list style="min-width: 220px">
              <q-item-label header class="text-weight-bold">Generación de PDFs</q-item-label>
              <q-separator />
              <q-item clickable v-close-popup @click="generarPDF('carpetaDocente')">
                <q-item-section avatar><q-icon name="folder" color="purple" /></q-item-section>
                <q-item-section>
                  <q-item-label>Carpeta Docente Completa</q-item-label>
                  <q-item-label caption>Todas las secciones</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator spaced />
              <q-item clickable v-close-popup @click="generarPDF('planClase')">
                <q-item-section avatar><q-icon name="class" color="blue" /></q-item-section>
                <q-item-section>Plan de Clase Teórico</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="generarPDF('programa')">
                <q-item-section avatar><q-icon name="description" color="green" /></q-item-section>
                <q-item-section>Programa de Asignatura</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn unelevated color="primary" icon="save" label="Guardar Cambios" no-caps @click="guardarCambios" />
      </div>
    </div>

    <!-- Tabs -->
    <q-card class="card-main">
      <q-tabs v-model="tabActual" dense class="text-grey" active-color="primary" indicator-color="primary" align="left">
        <q-tab name="datos" icon="description" label="Datos de Asignatura" no-caps />
        <q-tab name="programa" icon="assignment" label="Programa" no-caps />
        <q-tab name="bibliografia" icon="auto_stories" label="Bibliografía" no-caps />
        <q-tab name="unidades" icon="folder_open" label="Unidades de Aprendizaje" no-caps />
      </q-tabs>

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
                  <div class="text-h6 text-primary text-weight-bold">1.- Identificación de la Asignatura</div>
                </div>

                <!-- Row 1: Header Info -->
                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-12 col-md-5">
                    <q-input :model-value="nombreCarrera" label="Carrera" outlined dense readonly bg-color="white" />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input v-model="formDatos.codigo" label="Código" outlined dense readonly bg-color="white"
                      input-class="text-weight-bold" />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input :model-value="(asignatura?.semestre || '') + '°'" label="Semestre" outlined dense readonly
                      bg-color="white" />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-select v-model="formDatos.modalidad" :options="['Presencial', 'Semipresencial', 'Virtual']"
                      label="Modalidad" outlined dense bg-color="white"
                      :readonly="!puedeEditarCampo('datos_generales')" />
                  </div>
                </div>

                <!-- Row 2: Main Subject Info -->
                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-12 col-md-6">
                    <q-input v-model="formDatos.nombre" label="Asignatura" outlined dense readonly bg-color="white"
                      input-class="text-weight-bold text-uppercase" />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input v-model="formDatos.tipo_curso" label="Tipo de Curso" outlined dense bg-color="white"
                      :readonly="!puedeEditarCampo('datos_generales')" />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input v-model="formDatos.area_desempenio" label="Área de Desempeño" outlined dense
                      bg-color="white" :readonly="!puedeEditarCampo('datos_generales')" />
                  </div>
                </div>

                <!-- Row 3: Metrics & Reqs -->
                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-12 col-md-4">
                    <q-input v-model="formDatos.requisitos" label="Pre-requisito" outlined dense bg-color="white"
                      :readonly="!puedeEditarCampo('datos_generales')" />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input v-model="formDatos.creditos" label="Créditos" outlined dense readonly bg-color="white" />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input :model-value="(formDatos.carga_horaria_total || 0) + ' Horas'" label="Carga Total" outlined
                      dense readonly bg-color="white" input-class="text-weight-bold" />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input v-model="formDatos.horas_detalle" label="Teóricas / Prácticas" outlined dense readonly
                      bg-color="white" input-class="text-weight-bold" />
                  </div>
                </div>

                <!-- Row 4: Config Manual (Dense) -->
                <div class="bg-grey-1 q-pa-sm rounded-borders border-all">
                  <div class="row q-col-gutter-sm items-center">
                    <div class="col-12 col-md-2">
                      <div class="text-caption text-weight-bold text-grey-8 text-center" style="line-height: 1.2">
                        SESIONES<br>SEMANALES
                      </div>
                    </div>
                    <div class="col-6 col-md-2">
                      <q-input v-model.number="formDatos.sesiones_semanales_teoricas" label="Teóricas" type="number"
                        outlined dense bg-color="white" :readonly="!puedeEditarCampo('datos_generales')" />
                    </div>
                    <div class="col-6 col-md-3">
                      <q-input v-model.number="formDatos.sesiones_semanales_practicas" label="Prácticas" type="number"
                        outlined dense bg-color="white" :readonly="!puedeEditarCampo('datos_generales')" />
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
                    <q-input :model-value="nombreDocenteCarpeta || 'Por asignar'" label="NOMBRE DEL DOCENTE" outlined
                      dense readonly bg-color="grey-1" />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input v-model="formDatos.docente_email" label="EMAIL" outlined dense
                      :readonly="!puedeEditarCampo('datos_generales')" placeholder="email@ejemplo.com" />
                  </div>
                  <div class="col-12 col-md-8">
                    <q-input v-model="formDatos.docente_formacion" label="FORMACIÓN" outlined dense
                      :readonly="!puedeEditarCampo('datos_generales')" placeholder="Grados académicos..." />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input v-model="formDatos.docente_telefono" label="TELÉFONO" outlined dense
                      :readonly="!puedeEditarCampo('datos_generales')" placeholder="Celular / Teléfono" />
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
                <q-input v-model="formDatos.justificacion" label="JUSTIFICACIÓN" type="textarea" rows="5" outlined
                  :readonly="!puedeEditarCampo('justificacion')"
                  placeholder="Describa la relevancia de esta asignatura en el plan de estudios..." />
              </q-card-section>
            </q-card>

            <!-- 4. Propósito (Card) -->
            <q-card class="section-card q-mb-lg">
              <q-card-section>
                <div class="row items-center q-mb-md">
                  <q-icon name="flag" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-h6 text-primary">4.- Propósito General</div>
                </div>
                <q-input v-model="formDatos.objetivo_general" label="PROPÓSITO GENERAL" type="textarea" rows="4"
                  outlined :readonly="!puedeEditarCampo('objetivo_general')"
                  placeholder="Defina el propósito central y las metas de formación..." />
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
                    <q-input v-model="formPrograma.competencia_global" label="COMPETENCIA GLOBAL ESPECÍFICA"
                      type="textarea" rows="6" outlined :readonly="!puedeEditarCampo()"
                      placeholder="Describa la competencia global..." />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input v-model="formPrograma.competencia_unidad" label="UNIDAD DE COMPETENCIA ESPECÍFICA"
                      type="textarea" rows="6" outlined :readonly="!puedeEditarCampo()"
                      placeholder="Describa la unidad de competencia..." />
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
                  <div v-for="unidad in asignatura.unidades" :key="unidad.id" class="relative-position">
                    <q-input v-model="unidad.elemento_competencia"
                      :label="`ELEMENTO DE COMPETENCIA (UNIDAD ${unidad.numero})`" type="textarea" rows="2" outlined
                      :readonly="!puedeEditarCampo()"
                      placeholder="Describa el elemento de competencia de esta unidad..."
                      @blur="guardarElementoCompetencia(unidad)">
                      <template v-slot:prepend>
                        <q-badge color="primary" text-color="white" :label="unidad.numero" />
                      </template>
                    </q-input>
                  </div>
                </div>
                <div v-else class="text-center q-pa-lg text-grey-7 bg-grey-1 rounded-borders">
                  <q-icon name="info" size="24px" class="q-mb-xs" />
                  <div>Las unidades de aprendizaje definen los elementos de competencia.</div>
                  <div class="text-caption">Configure las unidades en la pestaña correspondiente.</div>
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
                  <q-input v-model="formPrograma.metodologia_aula" label="EN EL AULA" type="textarea" rows="3" outlined
                    :readonly="!puedeEditarCampo()" placeholder="Describa la metodología en aula..." />

                  <q-input v-model="formPrograma.metodologia_simulacion" label="CENTRO DE SIMULACIÓN (Si corresponde)"
                    type="textarea" rows="2" outlined :readonly="!puedeEditarCampo()"
                    placeholder="Describa la metodología en simulación..." />

                  <q-input v-model="formPrograma.metodologia_hospital"
                    label="HOSPITAL Y CENTROS DE SALUD (Si corresponde)" type="textarea" rows="2" outlined
                    :readonly="!puedeEditarCampo()" placeholder="Describa la metodología en centros de salud..." />
                </div>
              </q-card-section>
            </q-card>

            <!-- 9. Evaluación (Card) -->
            <q-card class="section-card q-mb-lg">
              <q-card-section>
                <div class="row items-center q-mb-md">
                  <q-icon name="assignment_turned_in" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-h6 text-primary">9.- Sistema de Evaluación</div>
                </div>
                <q-input v-model="formPrograma.sistema_evaluacion" label="CRITERIOS DE EVALUACIÓN" type="textarea"
                  rows="6" outlined :readonly="!puedeEditarCampo()"
                  placeholder="Describa el sistema y criterios de evaluación..." />
              </q-card-section>
            </q-card>

            <!-- 12. Criterios (Card) -->
            <q-card class="section-card q-mb-lg">
              <q-card-section>
                <div class="row items-center justify-between q-mb-md">
                  <div class="row items-center">
                    <q-icon name="gavel" color="primary" size="24px" class="q-mr-sm" />
                    <div class="text-h6 text-primary">12.- Criterios y Normativa</div>
                  </div>
                  <q-btn v-if="puedeEditarCampo()" unelevated color="primary" icon="add" label="Agregar Regla" size="sm"
                    no-caps @click="agregarRegla" />
                </div>

                <div class="q-gutter-y-md">
                  <div v-for="(regla, index) in formPrograma.reglamento_normativa" :key="index"
                    class="relative-position">
                    <q-input v-model="formPrograma.reglamento_normativa[index]" :label="`REGLA ${index + 1}`" outlined
                      dense :readonly="!puedeEditarCampo()" placeholder="Escriba la regla...">
                      <template v-slot:append v-if="puedeEditarCampo()">
                        <q-btn round dense flat icon="delete" color="red" @click="quitarRegla(index)" />
                      </template>
                    </q-input>
                  </div>
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
            <q-btn unelevated color="primary" icon="add" label="Agregar" no-caps @click="abrirDialogBibliografia()" />
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
                <q-badge color="blue" text-color="white" class="q-ml-sm">{{ bibliografiasBasicas.length }}</q-badge>
              </div>
              <div class="row q-col-gutter-md">
                <div v-for="biblio in bibliografiasBasicas" :key="biblio.id" class="col-12 col-md-6">
                  <div class="biblio-card biblio-card--basica">
                    <div class="biblio-card__content">
                      <div class="biblio-card__title">{{ biblio.titulo }}</div>
                      <div class="biblio-card__author" v-if="biblio.autor">{{ biblio.autor }}</div>
                      <div class="biblio-card__details" v-if="biblio.editorial || biblio.anio">
                        {{ biblio.editorial }}{{ biblio.edicion ? ', ' + biblio.edicion : '' }}{{ biblio.anio ? ' ('
                          +
                          biblio.anio + ')' : '' }}
                      </div>
                    </div>
                    <div class="biblio-card__actions">
                      <q-btn flat round dense icon="edit" size="sm" color="orange"
                        @click="abrirDialogBibliografia(biblio)" />
                      <q-btn flat round dense icon="delete" size="sm" color="red"
                        @click="eliminarBibliografia(biblio)" />
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
                <q-badge color="grey" text-color="white" class="q-ml-sm">{{ bibliografiasComplementarias.length
                }}</q-badge>
              </div>
              <div class="row q-col-gutter-md">
                <div v-for="biblio in bibliografiasComplementarias" :key="biblio.id" class="col-12 col-md-6">
                  <div class="biblio-card biblio-card--complementaria">
                    <div class="biblio-card__content">
                      <div class="biblio-card__title">{{ biblio.titulo }}</div>
                      <div class="biblio-card__author" v-if="biblio.autor">{{ biblio.autor }}</div>
                      <div class="biblio-card__details" v-if="biblio.editorial || biblio.anio">
                        {{ biblio.editorial }}{{ biblio.edicion ? ', ' + biblio.edicion : '' }}{{ biblio.anio ? ' ('
                          +
                          biblio.anio + ')' : '' }}
                      </div>
                    </div>
                    <div class="biblio-card__actions">
                      <q-btn flat round dense icon="edit" size="sm" color="orange"
                        @click="abrirDialogBibliografia(biblio)" />
                      <q-btn flat round dense icon="delete" size="sm" color="red"
                        @click="eliminarBibliografia(biblio)" />
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
                <div v-for="biblio in bibliografiasProgramaAnalitico" :key="biblio.id" class="col-12 col-md-6">
                  <div class="biblio-card biblio-card--api">
                    <div class="biblio-card__content">
                      <div class="biblio-card__title">{{ biblio.titulo }}</div>
                      <div class="biblio-card__author" v-if="biblio.autor && biblio.autor !== 'Ver descripción'">{{
                        biblio.autor
                      }}</div>
                      <div class="biblio-card__details" v-if="biblio.editorial || biblio.anio">
                        {{ biblio.editorial }}{{ biblio.edicion ? ', ' + biblio.edicion : '' }}{{ biblio.anio &&
                          biblio.anio !==
                          0 ? ' (' + biblio.anio + ')' : '' }}
                      </div>
                      <q-chip size="xs" :color="biblio.tipo?.toUpperCase() === 'BASIC' ? 'blue-2' : 'grey-2'"
                        :text-color="biblio.tipo?.toUpperCase() === 'BASIC' ? 'blue-9' : 'grey-7'" class="q-mt-xs">
                        {{ biblio.tipo?.toUpperCase() === 'BASIC' ? 'Básica' : 'Complementaria' }}
                      </q-chip>
                    </div>
                    <div class="biblio-card__actions">
                      <q-btn flat round dense icon="visibility" size="sm" color="primary"
                        @click="abrirDialogBibliografia(biblio)">
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
              <q-btn v-if="puedeEditarPlanificacion" unelevated color="primary" icon="add" label="Nueva Unidad" no-caps
                @click="abrirDialogoUnidad()" />
            </div>
          </div>

          <q-list separator class="unidades-list">
            <q-expansion-item v-for="unidad in asignatura?.unidades" :key="unidad.id" group="unidades"
              class="unidad-item">
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
                  <q-linear-progress :value="calcularProgresoUnidad(unidad) / 100"
                    :color="calcularProgresoUnidad(unidad) >= 80 ? 'green' : calcularProgresoUnidad(unidad) >= 50 ? 'amber' : 'red'"
                    rounded size="8px" style="width: 100px;" />
                  <span class="text-caption q-mt-xs">{{ calcularProgresoUnidad(unidad) }}% documentado</span>

                  <div class="row items-center">
                    <q-btn v-if="puedeEditarPlanificacion" flat round dense icon="edit" color="primary"
                      @click.stop="abrirDialogoUnidad(unidad)">
                      <q-tooltip>Editar Unidad</q-tooltip>
                    </q-btn>
                    <q-btn v-if="puedeEditarPlanificacion" flat round dense icon="delete" color="red"
                      @click.stop="confirmarEliminarUnidad(unidad)">
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
                    <span class="text-weight-bold text-primary">Elemento de Competencia (Unidad {{ unidad.numero
                    }})</span>
                  </div>
                  <q-input v-model="unidad.elemento_competencia" type="textarea" rows="2" outlined dense
                    placeholder="Describe el elemento de competencia para esta unidad..."
                    @blur="guardarElementoCompetencia(unidad)" :readonly="!puedeEditarPlanificacion" />
                </q-card-section>
              </q-card>

              <!-- Lista de Temas -->
              <q-list separator class="q-mx-lg q-mb-md">
                <q-item v-for="(tema, index) in unidad.temas" :key="tema.id" clickable @click="irATema(unidad, tema)"
                  class="rounded-borders q-mb-xs tema-item">
                  <q-item-section avatar>
                    <q-avatar color="orange-2" text-color="orange-9" size="36px">
                      <span class="text-weight-bold">{{ getTemaGlobalIndex(unidad, tema) }}</span>
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ tema.titulo }}</q-item-label>
                    <q-item-label caption>
                      {{ countLogros(tema) }} logros •
                      {{ countIndicadores(tema) }} indicadores
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row items-center q-gutter-sm">
                      <q-chip size="sm"
                        :color="calcularProgresoTema(tema) >= 80 ? 'green-2' : calcularProgresoTema(tema) >= 50 ? 'amber-2' : 'red-2'"
                        :text-color="calcularProgresoTema(tema) >= 80 ? 'green-9' : calcularProgresoTema(tema) >= 50 ? 'amber-9' : 'red-9'"
                        dense>
                        {{ calcularProgresoTema(tema) }}%
                      </q-chip>

                      <!-- Reordering Buttons -->
                      <template v-if="puedeEditarPlanificacion">
                        <q-btn flat round dense icon="arrow_upward" color="grey-7" size="sm"
                          @click.stop="moverTema(unidad, tema, 'up')" :disable="index === 0">
                          <q-tooltip>Subir</q-tooltip>
                        </q-btn>
                        <q-btn flat round dense icon="arrow_downward" color="grey-7" size="sm"
                          @click.stop="moverTema(unidad, tema, 'down')" :disable="index === unidad.temas.length - 1">
                          <q-tooltip>Bajar</q-tooltip>
                        </q-btn>

                        <q-btn flat round dense icon="edit" color="primary" size="sm"
                          @click.stop="abrirDialogoTema(unidad, tema)">
                          <q-tooltip>Editar Título</q-tooltip>
                        </q-btn>
                        <q-btn flat round dense icon="delete" color="red" size="sm"
                          @click.stop="confirmarEliminarTema(tema)">
                          <q-tooltip>Eliminar Tema</q-tooltip>
                        </q-btn>
                      </template>
                    </div>
                  </q-item-section>
                </q-item>

                <div class="row justify-center q-mb-md" v-if="puedeEditarPlanificacion">
                  <q-btn outline color="primary" icon="add" label="Nuevo Tema" size="sm"
                    @click.stop="abrirDialogoTema(unidad)" />
                </div>
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
          <q-form class="q-gutter-y-md">
            <q-input v-model="formBiblio.titulo" label="Título" outlined dense class="full-width" />
            <q-input v-model="formBiblio.autor" label="Autor(es)" outlined dense class="full-width" />

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input v-model="formBiblio.editorial" label="Editorial" outlined dense class="full-width" />
              </div>
              <div class="col-6">
                <q-input v-model="formBiblio.edicion" label="Edición" outlined dense class="full-width" />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input v-model.number="formBiblio.anio" label="Año" type="number" outlined dense class="full-width" />
              </div>
              <div class="col-6">
                <q-select v-model="formBiblio.tipo" label="Tipo"
                  :options="[{ label: 'Principal', value: 'principal' }, { label: 'Complementario', value: 'complementario' }]"
                  emit-value map-options outlined dense class="full-width" />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input v-model="formBiblio.isbn" label="ISBN (Opcional)" outlined dense class="full-width" />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input v-model="formBiblio.paginas" label="Páginas (ej: 100-150) (Opcional)" outlined dense
                  class="full-width" />
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
      <q-card style="width: 500px; max-width: 95vw; border-radius: 12px;">
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
              Esta función requiere estrictamente el <strong>Documento Word Oficial de Programa de Asignatura</strong>
              proporcionado por Sede Central.
              <br />
              <br />
              <strong>Nota:</strong> Otros formatos o documentos modificados estructuralmente no serán procesados
              correctamente.
            </div>
          </q-banner>

          <q-file v-model="archivoImportar" label="Seleccionar Plantilla Oficial Word (.docx)" outlined dense
            accept=".docx, .doc" counter>
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <div class="q-mt-md q-gutter-sm bg-grey-1 q-pa-sm rounded-borders">
            <div class="text-subtitle2 text-weight-bold q-mb-xs">¿Qué desea importar?</div>
            <div class="row">
              <q-checkbox class="col-12" v-model="importOpciones.datos"
                label="Plan de Clases (Justificación, Objetivos, Metodología)" dense color="teal" />
              <q-checkbox class="col-12" v-model="importOpciones.unidades"
                label="Plan Analítico (Unidades, Temas y Contenidos)" dense color="teal" />
            </div>
            <div class="text-caption text-grey-7 q-pl-sm">
              * La bibliografía se actualizará automáticamente con el Plan de Clases.
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none q-pb-md q-pr-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup no-caps />
          <q-btn unelevated label="Procesar Importación" color="teal" :loading="store.loading"
            :disable="!archivoImportar" @click="procesarImportacion" no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Dialog Unidad -->
    <q-dialog v-model="dialogUnidad" persistent>
      <q-card style="width: 400px; max-width: 95vw;">
        <q-card-section>
          <div class="text-h6">{{ editandoUnidad ? 'Editar Unidad' : 'Nueva Unidad' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="guardarUnidad" class="q-gutter-md">
            <q-input v-model.number="formUnidad.numero" label="Número" type="number" outlined dense
              :readonly="editandoUnidad" />
            <q-input v-model="formUnidad.titulo" label="Título" outlined dense autofocus />
            <q-input v-model.number="formUnidad.horas" label="Horas (Referencial)" type="number" outlined dense />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Cancelar" color="grey" v-close-popup no-caps />
              <q-btn unelevated type="submit" label="Guardar" color="primary" :loading="store.loading" no-caps />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog Tema -->
    <q-dialog v-model="dialogTema" persistent>
      <q-card style="width: 500px; max-width: 95vw;">
        <q-card-section>
          <div class="text-h6">{{ editandoTema ? 'Editar Tema' : 'Nuevo Tema' }}</div>
          <div class="text-caption text-grey" v-if="unidadSeleccionada">
            Unidad {{ unidadSeleccionada.numero }}: {{ unidadSeleccionada.titulo }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="guardarTema" class="q-gutter-md">
            <q-input v-model="formTema.titulo" label="Título del Tema" outlined dense autofocus />
            <!-- Horas removed as per request -->

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Cancelar" color="grey" v-close-popup no-caps />
              <q-btn unelevated type="submit" label="Guardar" color="primary" :loading="store.loading" no-caps />
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
import { useQuasar } from 'quasar'
import { useAsignaturasStore } from 'src/stores/asignaturas'
import { useCarrerasStore } from 'src/stores/carreras'
import { useSedesStore } from 'src/stores/sedes'
import { ROLES } from 'src/stores/auth'
import { useAuthStore } from 'src/stores/auth'
import { generarPlanDeClase, generarProgramaAsignatura } from 'src/services/pdfService'
import { generarCarpetaDocente } from 'src/services/carpetaDocenteService'

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
const tabActual = ref('datos')
const asignatura = computed(() => store.asignaturaActual)


// Opciones de Importación
const importOpciones = ref({
  datos: true,
  unidades: true
})



// --- CRUD Unidades & Temas ---
const dialogUnidad = ref(false)
const editandoUnidad = ref(false)
const formUnidad = ref({ id: null, titulo: '', numero: 1, horas: 0 })

const dialogTema = ref(false)
const editandoTema = ref(false)
const unidadSeleccionada = ref(null)
const formTema = ref({ id: null, titulo: '', horas_teoricas: 0, horas_practicas: 0 })

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
    persistent: true
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
    formTema.value = { ...tema }
  } else {
    formTema.value = { id: null, titulo: '', horas_teoricas: 0, horas_practicas: 0 }
  }
  dialogTema.value = true
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
    console.error("Tema inválido para eliminar:", tema)
    return
  }
  $q.dialog({
    title: 'Eliminar Tema',
    message: `¿Estás seguro de eliminar el tema "${tema.titulo}"?`,
    cancel: true,
    persistent: true
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
    ROLES.DIRECCION_ACADEMICA // Added explicit check
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
  if ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VICERRECTOR_NACIONAL, ROLES.DIRECCION_ACADEMICA].includes(rol)) {
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
    // Validar asignación? Por ahora true si no está aprobado
    return true
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
    $q.notify({ type: 'positive', message: `Carpeta ${nuevoEstado === 'APROBADO' ? 'Aprobada' : 'Reabierta'}` })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' })
  }
}

const nombreDocenteCarpeta = computed(() => {
  if (!asignatura.value || !asignatura.value.docentes) return null

  // 1. Si hay un ID en la URL (seleccionado previamente)
  const docenteIdParam = route.query.docente_id
  if (docenteIdParam) {
    const docente = asignatura.value.docentes.find(d => d.id == docenteIdParam)
    return docente ? docente.nombre_completo : null
  }

  // 2. Si solo hay un docente asignado
  if (asignatura.value.docentes.length === 1) {
    return asignatura.value.docentes[0].nombre_completo
  }

  // 3. Si soy docente (rol), mostrar mi nombre
  // (Opcional, pero cubierto por el filtro previo normalmente)

  return null
})

const nombreSede = computed(() => {
  if (!asignatura.value) return null

  // 1. Relación correcta: Array de Carreras (Sync)
  if (asignatura.value.carreras?.length > 0) {
    const c = asignatura.value.carreras[0]
    if (c.sede?.nombre) return c.sede.nombre
    if (c.sede_id) {
      const s = sedesStore.sedes.find(x => x.id == c.sede_id)
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

// Computed para bibliografías separadas por tipo
// Bibliografías del Word (tipos en español)
const bibliografiasBasicas = computed(() => {
  if (!asignatura.value?.bibliografias) return []
  return asignatura.value.bibliografias.filter(b => {
    if (!b.tipo) return false
    const tipo = b.tipo.toUpperCase()
    return tipo === 'BASICA' || tipo === 'PRINCIPAL'
  })
})

const bibliografiasComplementarias = computed(() => {
  if (!asignatura.value?.bibliografias) return []
  return asignatura.value.bibliografias.filter(b => {
    if (!b.tipo) return false
    const tipo = b.tipo.toUpperCase()
    return tipo === 'COMPLEMENTARIA' || tipo === 'COMPLEMENTARIO'
  })
})

// Bibliografías de la API Externa (Programa Analítico - tipos en inglés)
const bibliografiasProgramaAnalitico = computed(() => {
  if (!asignatura.value?.bibliografias) return []
  return asignatura.value.bibliografias.filter(b => {
    if (!b.tipo) return false
    const tipo = b.tipo.toUpperCase()
    return tipo === 'BASIC' || tipo === 'COMPLEMENTARY'
  })
})

// Forms
const datosOriginales = ref({})
const formDatos = ref({})

// --- Cálculo Automático Reactivado (Basado en Horas y Sesiones) ---
watch(() => [
  formDatos.value.sesiones_semanales_teoricas,
  formDatos.value.sesiones_semanales_practicas,
  formDatos.value.horas_teoricas,
  formDatos.value.horas_practicas
], ([teoricasSem, practicasSem, hTeo, hPrac]) => {
  // 1. Calculate Total Weekly Sessions
  formDatos.value.sesiones_semanales = (Number(teoricasSem) || 0) + (Number(practicasSem) || 0)

  // 2. Update Carga Horaria Total
  // Formula: (HT * 20) + (HP * 20)
  const ht = Number(hTeo) || 0
  const hp = Number(hPrac) || 0
  formDatos.value.carga_horaria_total = (ht * 20) + (hp * 20)

  // 3. Format visual detail (Grey Box in Row 5)
  let detalle = ''
  if (ht > 0) detalle += `${ht} T`
  if (hp > 0) {
    if (detalle) detalle += ' / '
    detalle += `${hp} P`
  }
  formDatos.value.horas_detalle = detalle
}, { immediate: true })
const formPrograma = ref({
  competencia_global: '',
  competencia_unidad: '',
  elementos_competencia: [],
  metodologia_aula: '',
  metodologia_simulacion: '',
  metodologia_hospital: '',
  reglamento_normativa: [],
  sistema_evaluacion: ''
})
const formBiblio = ref({})
const dialogBibliografia = ref(false)
const editandoBiblio = ref(false)
const biblioSeleccionada = ref(null)





// Importación
const dialogImportar = ref(false)
const archivoImportar = ref(null)

const puedeImportar = computed(() => {
  // 1. Debe ser Cochabamba (Sede 1)
  // Verificamos la asignatura actual
  let esSedeCochabamba = false

  // Check main 'carrera' object
  if (asignatura.value?.carrera?.sede_id == 1) esSedeCochabamba = true

  // Check 'carreras' array
  if (asignatura.value?.carreras?.some(c => c.sede_id == 1)) esSedeCochabamba = true

  // Check direct prop
  if (asignatura.value?.sede_id == 1) esSedeCochabamba = true

  if (!esSedeCochabamba) return false

  // 2. Roles permitidos: Director/Admin o Docente de Cochabamba
  // Convert auth sede_id to number for comparison
  const authSede = Number(authStore.usuarioActual?.sede_id)
  const esDocenteCochabamba = authSede === 1

  return esDirectorOAdmin.value || esDocenteCochabamba
})

function abrirDialogoImportar() {
  archivoImportar.value = null
  dialogImportar.value = true
}

async function procesarImportacion() {
  if (!archivoImportar.value) return

  try {
    // Vincular bibliografía al Plan de Clases (datos) O al Plan Analítico (unidades)
    // El usuario indicó que la bibliografía está en ambos y debe importarse.
    const opcionesEnvio = {
      ...importOpciones.value,
      bibliografia: importOpciones.value.datos || importOpciones.value.unidades
    }

    await store.importarWord(asignatura.value.id, archivoImportar.value, opcionesEnvio)
    // El store ya actualiza el estado local y recarga si es necesario
    $q.notify({
      type: 'positive',
      message: 'Importación completada con éxito. Revisa los campos.',
      icon: 'check_circle',
      timeout: 5000,
      position: 'top'
    })
    dialogImportar.value = false
  } catch (err) {
    // Error notification handled by store or global handler usually, but here manual:
    $q.notify({
      type: 'negative',
      message: 'Error al importar: ' + (err.response?.data?.error || err.message),
      position: 'top'
    })
  }
}

const breadcrumbInfo = computed(() => {
  const rol = authStore.rol
  const rolesDirectivos = ['DIRECTOR_CARRERA', 'DIRECCION_ACADEMICA', 'VICERRECTOR_SEDE', 'VICERRECTOR_NACIONAL', 'ADMIN', 'SUPER ADMIN']

  if (rolesDirectivos.includes(rol)) {
    return {
      label: 'Plan de Estudios',
      to: '/director/asignaturas'
    }
  }

  return {
    label: 'Documentación',
    to: '/documentacion'
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
  watch(() => route.query.docente_id, (newId) => {
    const id = parseInt(route.params.id)
    const params = {}
    if (newId) params.docente_id = newId
    store.setAsignaturaActual(id, params)
  })

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
    sesiones_semanales: (sTeoricas + sPracticas),
    sesiones_semanales_teoricas: sTeoricas,
    sesiones_semanales_practicas: sPracticas,
    // Docente info
    docente_formacion: asignatura.value.docente_formacion || '',
    docente_telefono: asignatura.value.docente_telefono || '',
    docente_email: asignatura.value.docente_email || ''
  }

  // Recalcular Carga Horaria Total y Detalle inmediatamente al cargar
  const ht = Number(asignatura.value.horas_teoricas) || 0
  const hp = Number(asignatura.value.horas_practicas) || 0

  formDatos.value.carga_horaria_total = (ht * 20) + (hp * 20)

  let detalle = ''
  if (ht > 0) detalle += `${ht} T`
  if (hp > 0) {
    if (detalle) detalle += ' / '
    detalle += `${hp} P`
  }
  formDatos.value.horas_detalle = detalle

  // Guardar copia de datos originales para validar permisos de edición
  datosOriginales.value = JSON.parse(JSON.stringify(formDatos.value))
  // Cargar datos del programa
  // Convertir reglamento_normativa de string a array de reglas
  let reglamentoArray = []
  const reglamentoRaw = asignatura.value.reglamento_normativa
  if (reglamentoRaw) {
    if (Array.isArray(reglamentoRaw)) {
      reglamentoArray = reglamentoRaw
    } else if (typeof reglamentoRaw === 'string') {
      // Dividir por saltos de línea y limpiar bullets
      reglamentoArray = reglamentoRaw.split('\n')
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(line => line.length > 0)
    }
  }

  // Cargar metodología estructurada
  const met = asignatura.value.metodologia_general || {}

  // Cargar elementos de competencia estructurados
  let elementosArray = []
  const elementosRaw = asignatura.value.elementos_competencia
  if (elementosRaw) {
    if (Array.isArray(elementosRaw)) {
      elementosArray = elementosRaw
    } else if (typeof elementosRaw === 'string') {
      elementosArray = elementosRaw.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
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
    reglamento_normativa: reglamentoArray,
    sistema_evaluacion: asignatura.value.sistema_evaluacion || ''
  }
}

function agregarRegla() {
  formPrograma.value.reglamento_normativa.push('')
}

function quitarRegla(index) {
  formPrograma.value.reglamento_normativa.splice(index, 1)
}


function guardarCambios() {
  // Sync Elementos de Competencia from Units
  if (asignatura.value?.unidades) {
    formPrograma.value.elementos_competencia = asignatura.value.unidades
      .sort((a, b) => a.numero - b.numero)
      .map(u => u.elemento_competencia || '')
  }

  // Estructurar la metodología para el backend
  const metodologia_general = {
    aula: formPrograma.value.metodologia_aula,
    simulacion: formPrograma.value.metodologia_simulacion,
    hospital: formPrograma.value.metodologia_hospital
  }

  // Combinar datos de ambos formularios
  const datosCompletos = {
    ...formDatos.value,
    ...formPrograma.value,
    metodologia_general,
    // Mapeo inverso para campos heredados
    metodologia_ensenanza: metodologia_general, // Alias para el backend
    competencia_asignatura: formPrograma.value.competencia_unidad,
    criterios_evaluacion: formPrograma.value.sistema_evaluacion
  }

  store.updateAsignatura(asignatura.value.id, datosCompletos)
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
  store.updateUnidad(unidad.id, { elemento_competencia: unidad.elemento_competencia })
    .then(() => {
      // Optional: Notify success small toast?
      // $q.notify({ type: 'positive', message: 'Elemento guardado', position: 'top', timeout: 500 })
    })
    .catch(err => {
      $q.notify({ type: 'negative', message: 'Error guardando elemento: ' + err.message })
    })
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

// Generación de PDFs
function generarPDF(tipo) {
  if (!asignatura.value) {
    $q.notify({ type: 'negative', message: 'No hay asignatura cargada', position: 'top' })
    return
  }

  try {
    if (tipo === 'carpetaDocente') {
      // Obtener datos de carrera (puede ser objeto o string)
      const carreraNombreAsig = typeof asignatura.value.carrera === 'object'
        ? asignatura.value.carrera?.nombre
        : asignatura.value.carrera

      const carrera = carrerasStore.carreras.find(c => c.nombre === carreraNombreAsig) || {
        nombre: carreraNombreAsig || 'Ingeniería de Sistemas',
        codigo: 'SIS',
        area: 'Ciencias Exactas y Tecnología',
        mision: 'Formar profesionales de excelencia.',
        vision: 'Ser líderes en formación profesional.',
        perfil_profesional: 'El profesional está preparado para desempeñarse en su área.'
      }
      const sede = sedesStore.sedes.find(s => s.id === 1) || { nombre: 'Cochabamba' }

      generarCarpetaDocente(asignatura.value, carrera, sede)
      $q.notify({ type: 'positive', message: 'Carpeta Docente generada exitosamente', icon: 'folder', position: 'top' })
    } else if (tipo === 'planClase') {
      generarPlanDeClase(asignatura.value)
      $q.notify({ type: 'positive', message: 'Plan de Clase generado exitosamente', icon: 'picture_as_pdf', position: 'top' })
    } else if (tipo === 'programa') {
      generarProgramaAsignatura(asignatura.value)
      $q.notify({ type: 'positive', message: 'Programa de Asignatura generado exitosamente', icon: 'picture_as_pdf', position: 'top' })
    }
  } catch (error) {
    console.error('Error generando PDF:', error)
    $q.notify({ type: 'negative', message: 'Error al generar el PDF: ' + error.message, position: 'top' })
  }
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
</style>
