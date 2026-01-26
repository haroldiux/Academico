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
          :icon="asignatura?.estado === 'APROBADO' ? 'lock_open' : 'check_circle'"
          no-caps unelevated @click="toggleEstadoCarpeta" />

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
        <q-tab-panel name="datos" class="q-pa-lg">
          <div class="text-h6 text-weight-bold q-mb-lg">
            <q-icon name="info" color="primary" class="q-mr-sm" />
            Información General
          </div>

          <q-form class="q-gutter-lg">
            <!-- Datos Básicos -->
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-4">
                <q-input v-model="formDatos.codigo" label="Código" outlined dense readonly>
                  <template v-slot:prepend><q-icon name="tag" color="primary" /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model.number="formDatos.semestre" label="Semestre" type="number" outlined dense readonly>
                  <template v-slot:prepend><q-icon name="calendar_month" color="primary" /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model.number="formDatos.creditos" label="Créditos" type="number" outlined dense readonly>
                  <template v-slot:prepend><q-icon name="star" color="primary" /></template>
                </q-input>
              </div>
            </div>

            <q-input v-model="formDatos.nombre" label="Nombre de la Asignatura" outlined dense readonly>
              <template v-slot:prepend><q-icon name="menu_book" color="primary" /></template>
            </q-input>

            <!-- Horas -->
            <div class="text-subtitle1 text-weight-bold q-mt-lg">
              <q-icon name="schedule" color="orange" class="q-mr-sm" />
              Carga Horaria
            </div>
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <q-input v-model.number="formDatos.horas_teoricas" label="Horas Teóricas" type="number" outlined dense
                  readonly>
                  <template v-slot:prepend><q-icon name="school" color="blue" /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model.number="formDatos.horas_practicas" label="Horas Prácticas" type="number" outlined dense
                  readonly>
                  <template v-slot:prepend><q-icon name="build" color="green" /></template>
                </q-input>
              </div>
            </div>

            <!-- Descripción y Objetivos -->
            <div class="text-subtitle1 text-weight-bold q-mt-lg q-mb-md">
              <q-icon name="description" color="cyan" class="q-mr-sm" />
              Descripción y Objetivos
            </div>

            <!-- Campo: Descripción -->
            <div class="field-card field-card--blue q-mb-md">
              <div class="field-card__header">
                <q-icon name="notes" size="20px" />
                <span class="field-card__title">Descripción</span>
              </div>
              <q-input v-model="formDatos.descripcion" outlined type="textarea" rows="3" class="field-card__input"
                :readonly="!puedeEditarCampo('descripcion')" />
            </div>

            <!-- Campo: Objetivo General -->
            <div class="field-card field-card--green q-mb-md">
              <div class="field-card__header">
                <q-icon name="flag" size="20px" />
                <span class="field-card__title">Objetivo General</span>
              </div>
              <q-input v-model="formDatos.objetivo_general" outlined type="textarea" autogrow class="field-card__input"
                :readonly="!puedeEditarCampo('objetivo_general')" />
            </div>

            <!-- Campo: Justificación -->
            <div class="field-card field-card--amber q-mb-md">
              <div class="field-card__header">
                <q-icon name="lightbulb" size="20px" />
                <span class="field-card__title">Justificación</span>
              </div>
              <q-input v-model="formDatos.justificacion" outlined type="textarea" autogrow class="field-card__input"
                :readonly="!puedeEditarCampo('justificacion')" />
            </div>

            <!-- Metodología -->
            <div class="text-subtitle1 text-weight-bold q-mt-xl q-mb-md">
              <q-icon name="settings" color="indigo" class="q-mr-sm" />
              Metodología y Evaluación
            </div>

            <!-- Campo: Saberes Previos -->
            <div class="field-card field-card--orange q-mb-md">
              <div class="field-card__header">
                <q-icon name="psychology" size="20px" />
                <span class="field-card__title">Saberes Previos</span>
                <span class="field-card__hint">Conocimientos previos necesarios</span>
              </div>
              <q-input v-model="formDatos.saberes_previos" outlined class="field-card__input"
                :readonly="!puedeEditarCampo('saberes_previos')" />
            </div>

            <!-- Campo: Contenido Mínimo -->
            <div class="field-card field-card--purple q-mb-md">
              <div class="field-card__header">
                <q-icon name="list" size="20px" />
                <span class="field-card__title">Contenido Mínimo</span>
              </div>
              <q-input v-model="formDatos.contenido_minimo" outlined type="textarea" autogrow class="field-card__input"
                :readonly="!puedeEditarCampo('contenido_minimo')" />
            </div>

            <!-- Campo: Metodología de Enseñanza -->
            <div class="field-card field-card--teal q-mb-md">
              <div class="field-card__header">
                <q-icon name="school" size="20px" />
                <span class="field-card__title">Metodología de Enseñanza</span>
              </div>
              <q-input v-model="formDatos.metodologia_ensenanza" outlined type="textarea" autogrow
                class="field-card__input" :readonly="!puedeEditarCampo('metodologia_ensenanza')" />
            </div>

            <!-- Campo: Criterios de Evaluación -->
            <div class="field-card field-card--red q-mb-md">
              <div class="field-card__header">
                <q-icon name="grading" size="20px" />
                <span class="field-card__title">Criterios de Evaluación</span>
              </div>
              <q-input v-model="formDatos.criterios_evaluacion" outlined type="textarea" autogrow
                class="field-card__input" :readonly="!puedeEditarCampo('criterios_evaluacion')" />
            </div>
          </q-form>
        </q-tab-panel>

        <!-- Tab: Programa de Asignatura -->
        <q-tab-panel name="programa" class="q-pa-lg">
          <div class="text-h6 text-weight-bold q-mb-lg">
            <q-icon name="assignment" color="purple" class="q-mr-sm" />
            Programa de Asignatura
          </div>

          <q-form class="q-gutter-lg">
            <!-- Competencias -->
            <div class="text-subtitle1 text-weight-bold">
              <q-icon name="emoji_events" color="amber" class="q-mr-sm" />
              Competencias
            </div>

            <q-input v-model="formPrograma.competencia_global" label="Competencia Global Específica" outlined
              type="textarea" rows="4" hint="Describe la competencia global específica de la asignatura">
              <template v-slot:prepend><q-icon name="public" color="blue" /></template>
            </q-input>
            <!-- Campo: Competencia de la Asignatura -->
            <div class="field-card field-card--green q-mb-md">
              <div class="field-card__header">
                <q-icon name="school" size="20px" />
                <span class="field-card__title">Competencia de la Asignatura</span>
                <span class="field-card__hint">Describe la competencia específica</span>
              </div>
              <div class="field-card__body" v-if="formPrograma.competencia_asignatura && !editandoCompetencia">
                <div class="formatted-text" v-html="formatearTextoMultilinea(formPrograma.competencia_asignatura)">
                </div>
                <q-btn flat dense icon="edit" size="sm" color="orange" class="edit-btn"
                  @click="editandoCompetencia = true" v-if="puedeEditarCampo('')" />
              </div>
              <q-input v-else v-model="formPrograma.competencia_asignatura" outlined type="textarea" rows="4"
                class="field-card__input" @blur="editandoCompetencia = false" />
            </div>

            <!-- Campo: Elementos de Competencia -->
            <div class="field-card field-card--teal q-mb-md">
              <div class="field-card__header">
                <q-icon name="list_alt" size="20px" />
                <span class="field-card__title">Elementos de Competencia</span>
                <span class="field-card__hint">Lista de elementos extraídos</span>
              </div>
              <div class="field-card__body" v-if="formPrograma.elementos_competencia && !editandoElementos">
                <div class="formatted-list" v-html="formatearElementosCompetencia(formPrograma.elementos_competencia)">
                </div>
                <q-btn flat dense icon="edit" size="sm" color="orange" class="edit-btn"
                  @click="editandoElementos = true" v-if="puedeEditarCampo('')" />
              </div>
              <q-input v-else v-model="formPrograma.elementos_competencia" outlined type="textarea" rows="6"
                class="field-card__input" @blur="editandoElementos = false" />
            </div>

            <!-- Reglamento -->
            <div class="text-subtitle1 text-weight-bold q-mt-lg">
              <q-icon name="gavel" color="red" class="q-mr-sm" />
              Reglamento y Normativa
            </div>

            <div class="q-gutter-sm">
              <div v-for="(regla, index) in formPrograma.reglamento_normativa" :key="index"
                class="row items-center q-gutter-sm">
                <q-input v-model="formPrograma.reglamento_normativa[index]" outlined dense class="col"
                  :placeholder="'Regla ' + (index + 1)" />
                <q-btn flat round dense icon="delete" color="red" @click="quitarRegla(index)" />
              </div>
              <q-btn flat icon="add" label="Agregar regla" color="primary" no-caps @click="agregarRegla" />
            </div>

            <!-- Organización y Calendario -->
            <div class="text-subtitle1 text-weight-bold q-mt-lg">
              <q-icon name="calendar_month" color="indigo" class="q-mr-sm" />
              Organización y Calendario
            </div>

            <q-input v-model="formPrograma.organizacion_calendario" label="Organización y Calendario Académico" outlined
              type="textarea" rows="4" hint="Describe la organización del calendario académico de la asignatura">
              <template v-slot:prepend><q-icon name="event" color="indigo" /></template>
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
                        {{ biblio.editorial }}{{ biblio.edicion ? ', ' + biblio.edicion : '' }}{{ biblio.anio ? ' (' +
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
                        {{ biblio.editorial }}{{ biblio.edicion ? ', ' + biblio.edicion : '' }}{{ biblio.anio ? ' (' +
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
                <q-badge color="deep-purple" text-color="white" class="q-ml-sm">{{ bibliografiasProgramaAnalitico.length
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
                <q-btn v-if="puedeEditarPlanificacion" unelevated color="primary" icon="add" label="Nueva Unidad" no-caps @click="abrirDialogoUnidad()" />
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
                    <q-btn v-if="puedeEditarPlanificacion" flat round dense icon="edit" color="primary" @click.stop="abrirDialogoUnidad(unidad)">
                      <q-tooltip>Editar Unidad</q-tooltip>
                    </q-btn>
                    <q-btn v-if="puedeEditarPlanificacion" flat round dense icon="delete" color="red" @click.stop="confirmarEliminarUnidad(unidad)">
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
                    @blur="guardarElementoCompetencia(unidad)"
                    :readonly="!puedeEditarPlanificacion" />
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
                      {{ tema.horas }}h •
                      {{ tema.logros_esperados?.length || 0 }} logros •
                      {{ tema.indicadores_logro?.length || 0 }} indicadores
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

                        <q-btn flat round dense icon="edit" color="primary" size="sm" @click.stop="abrirDialogoTema(unidad, tema)">
                          <q-tooltip>Editar Título</q-tooltip>
                        </q-btn>
                        <q-btn flat round dense icon="delete" color="red" size="sm" @click.stop="confirmarEliminarTema(tema)">
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
                <q-select v-model="formBiblio.tipo" label="Tipo"
                  :options="[{ label: 'Principal', value: 'principal' }, { label: 'Complementario', value: 'complementario' }]"
                  emit-value map-options outlined dense />
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
              Esta función requiere estrictamente el <strong>Documento Word Oficial de Programa de Asignatura</strong> proporcionado por Sede Central.
              <br />
              <br />
              <strong>Nota:</strong> Otros formatos o documentos modificados estructuralmente no serán procesados correctamente.
            </div>
          </q-banner>

          <q-file v-model="archivoImportar" label="Seleccionar Plantilla Oficial Word (.docx)" outlined dense accept=".docx, .doc"
            counter>
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <div class="q-mt-md q-gutter-sm bg-grey-1 q-pa-sm rounded-borders">
            <div class="text-subtitle2 text-weight-bold q-mb-xs">¿Qué desea importar?</div>
            <div class="row">
               <q-checkbox class="col-12" v-model="importOpciones.datos" label="Plan de Clases (Justificación, Objetivos, Metodología)" dense color="teal" />
               <q-checkbox class="col-12" v-model="importOpciones.unidades" label="Plan Analítico (Unidades, Temas y Contenidos)" dense color="teal" />
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
                    <q-input v-model.number="formUnidad.numero" label="Número" type="number" outlined dense :readonly="editandoUnidad" />
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
                    <div class="row q-col-gutter-sm">
                         <div class="col-6">
                            <q-input v-model.number="formTema.horas_teoricas" label="Horas Teóricas" type="number" outlined dense />
                         </div>
                         <div class="col-6">
                            <q-input v-model.number="formTema.horas_practicas" label="Horas Prácticas" type="number" outlined dense />
                         </div>
                    </div>

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
import { useAuthStore } from 'src/stores/auth'
import { generarPlanDeClase, generarProgramaAsignatura } from 'src/services/pdfService'
import { generarCarpetaDocente } from 'src/services/carpetaDocenteService'

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
  const rol = authStore.usuarioActual?.rol
  // Lista blanca de roles con permisos de edición TOTAL (siempre pueden editar)
  const rolesPermitidos = [
    'SUPER ADMIN', 'SUPER_ADMIN', // ID 1
    'ADMIN', // ID 2
    'DIRECTOR_CARRERA', 'DIRECTOR CARRERA', // ID 5
    'VICERRECTOR_SEDE', 'VICERRECTOR SEDE', // ID 4
    'VICERRECTOR_NACIONAL', 'VICERRECTOR NACIONAL' // ID 3
  ]
  return rolesPermitidos.includes(rol)
})

const puedeAprobarCarpeta = computed(() => {
    // Solo Directores y Admins pueden aprobar/reabrir
    return esDirectorOAdmin.value
})

const puedeEditarPlanificacion = computed(() => {
  const usuario = authStore.usuarioActual
  const rol = usuario?.rol
  const esCocha = usuario?.sede_id === 1

  // 1. Si está APROBADO, nadie edita (salvo que sea admin y quiera desbloquear primero, pero la UI de edición se bloquea)
  // OJO: Si queremos que el Director pueda editar AUNQUE este aprobado, habría que cambiar esto.
  // Pero el usuario dijo "editar hasta que... lo de por aprobado". Implica BLOQUEO.
  if (asignatura.value?.estado === 'APROBADO') return false

  // 2. Global Admins
  if (['SUPER ADMIN', 'SUPER_ADMIN', 'ADMIN', 'VICERRECTOR_NACIONAL', 'VICERRECTOR NACIONAL'].includes(rol)) {
      return true
  }
  // 3. Cocha Roles (Director/Docente/VicerrectorSede)
  if (esCocha) {
      if (['DIRECTOR_CARRERA', 'DIRECTOR CARRERA', 'VICERRECTOR_SEDE', 'VICERRECTOR SEDE', 'DOCENTE'].includes(rol)) {
          return true
      }
  }
  return false
})

function puedeEditarCampo() {
  // 1. Si está APROBADO, bloqueo total (salvo que se reabra)
  if (asignatura.value?.estado === 'APROBADO') return false

  const usuario = authStore.usuarioActual
  const rol = usuario?.rol
  const esCocha = usuario?.sede_id === 1

  // 2. Super Admins / Vicerrectores Nacionales: SIEMPRE pueden editar (Globales)
  if (['SUPER ADMIN', 'SUPER_ADMIN', 'ADMIN', 'VICERRECTOR_NACIONAL', 'VICERRECTOR NACIONAL'].includes(rol)) {
      return true
  }

  // 3. Directores de Carrera / Vicerrectores de Sede
  if (['DIRECTOR_CARRERA', 'DIRECTOR CARRERA', 'VICERRECTOR_SEDE', 'VICERRECTOR SEDE'].includes(rol)) {
      // Solo si son de Cochabamba
      return esCocha
  }

  // 4. Docentes: Solo si son de Cochabamba
  if (esCocha) return true

  return false
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
const formPrograma = ref({
  competencia_global: '',
  competencia_asignatura: '',
  elementos_competencia: '',
  reglamento_normativa: [],
  organizacion_calendario: ''
})
const formBiblio = ref({})
const dialogBibliografia = ref(false)
const editandoBiblio = ref(false)
const biblioSeleccionada = ref(null)

// Estados de edición para campos formateados
const editandoCompetencia = ref(false)
const editandoElementos = ref(false)

// Funciones de formateo de texto
function formatearTextoMultilinea(texto) {
  if (!texto) return ''
  // Dividir por saltos de línea y crear párrafos
  const lineas = texto.split('\n').filter(l => l.trim())
  if (lineas.length <= 1) {
    return `<p class="formatted-paragraph">${escapeHtml(texto)}</p>`
  }
  return lineas.map(l => `<p class="formatted-paragraph">${escapeHtml(l.trim())}</p>`).join('')
}

function formatearElementosCompetencia(texto) {
  if (!texto) return ''

  // Detectar patrones como "E.C. 1", "E.C.1", "EC 1", "EC1", etc.
  const patronEC = /(?:E\.?C\.?\s*\d+|ELEMENTO\s*(?:DE\s*)?COMPETENCIA\s*\d+)/gi

  // Dividir el texto por estos patrones
  let items = texto.split(patronEC).filter(item => item.trim())

  // También buscar por saltos de línea si no hay patrones EC
  if (items.length <= 1) {
    items = texto.split('\n').filter(l => l.trim())
  }

  if (items.length <= 1) {
    return `<div class="ec-item"><span class="ec-content">${escapeHtml(texto)}</span></div>`
  }

  // Generar lista formateada
  let html = '<div class="ec-list">'
  items.forEach((item, index) => {
    const cleanItem = item.trim()
    if (cleanItem) {
      html += `
        <div class="ec-item">
          <span class="ec-number">E.C. ${index + 1}</span>
          <span class="ec-content">${escapeHtml(cleanItem)}</span>
        </div>`
    }
  })
  html += '</div>'
  return html
}

function escapeHtml(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

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

// Lifecycle
onMounted(() => {
  const id = parseInt(route.params.id)
  store.setAsignaturaActual(id)
  if (asignatura.value) {
    cargarFormDatos()
  }

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

  formPrograma.value = {
    competencia_global: asignatura.value.competencia_global_especifica || '', // CGE del backend
    competencia_asignatura: asignatura.value.competencia_asignatura || '',
    elementos_competencia: asignatura.value.elementos_competencia || '',
    reglamento_normativa: reglamentoArray,
    organizacion_calendario: asignatura.value.organizacion_calendario || ''
  }
}

function agregarRegla() {
  formPrograma.value.reglamento_normativa.push('')
}

function quitarRegla(index) {
  formPrograma.value.reglamento_normativa.splice(index, 1)
}

function guardarCambios() {
  // Combinar datos de ambos formularios
  const datosCompletos = {
    ...formDatos.value,
    ...formPrograma.value
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
  background: var(--bg-tertiary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 0;
  overflow: hidden;
  border-left: 4px solid var(--primary);
  transition: all 0.2s ease;
}

.field-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
