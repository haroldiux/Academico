<template>
  <q-page class="q-pa-lg">
    <!-- Breadcrumb & Header -->
    <div class="row items-center q-mb-lg animate-in">
      <div class="col">
        <q-breadcrumbs class="q-mb-sm">
          <q-breadcrumbs-el icon="home" to="/" />
          <q-breadcrumbs-el label="Documentación" to="/documentacion" />
          <q-breadcrumbs-el :label="datosGenerales?.codigo || 'Asignatura'" />
          <q-breadcrumbs-el label="Programa de Asignatura" />
        </q-breadcrumbs>
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="description" size="36px" color="indigo" class="q-mr-sm" />
          <span class="text-gradient">Programa de Asignatura</span>
        </h4>
        <p class="q-ma-none q-mt-xs" style="color: var(--text-secondary);">
          {{ datosGenerales?.asignatura || 'Cargando...' }} • {{ datosGenerales?.carrera }}
        </p>
      </div>
      <div class="col-auto row q-gutter-sm">
        <!-- Indicador de solo lectura -->
        <q-chip v-if="esSoloLectura" color="orange" text-color="white" icon="visibility">
          Solo Lectura
        </q-chip>
        <q-btn outline color="green" icon="picture_as_pdf" label="Exportar PDF" no-caps @click="exportarPDF" />
        <q-btn
          unelevated
          color="primary"
          icon="save"
          label="Guardar"
          no-caps
          :loading="guardando"
          :disable="esSoloLectura"
          @click="guardarCambios"
        />
      </div>
    </div>

    <!-- Datos Generales (API Externa) -->
    <q-card class="q-mb-lg">
      <q-card-section class="bg-indigo-1">
        <div class="row items-center">
          <q-icon name="info" color="indigo" size="24px" class="q-mr-sm" />
          <span class="text-subtitle1 text-weight-bold text-indigo-9">1. Datos Generales de la Asignatura</span>
          <q-chip size="xs" color="blue-2" text-color="blue-9" dense class="q-ml-sm">API Externa</q-chip>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input v-model="datosGenerales.carrera" label="Carrera" outlined dense readonly />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model="datosGenerales.asignatura" label="Asignatura" outlined dense readonly />
          </div>
          <div class="col-12 col-md-2">
            <q-input v-model="datosGenerales.codigo" label="Código" outlined dense readonly />
          </div>
          <div class="col-12 col-md-2">
            <q-input v-model="datosGenerales.semestre" label="Semestre" outlined dense readonly />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Horarios (API Externa) -->
    <q-card class="q-mb-lg" v-if="horariosMateria.length">
      <q-card-section class="bg-teal-1">
        <div class="row items-center">
          <q-icon name="schedule" color="teal" size="24px" class="q-mr-sm" />
          <span class="text-subtitle1 text-weight-bold text-teal-9">Horario de Clases</span>
          <q-chip size="xs" color="blue-2" text-color="blue-9" dense class="q-ml-sm">API Externa</q-chip>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div v-for="(horario, idx) in horariosMateria" :key="idx" class="col-auto">
            <q-chip color="teal-2" text-color="teal-9">
              <q-icon name="event" class="q-mr-xs" />
              {{ horario.dia }} {{ horario.horaInicio }}-{{ horario.horaFin }}
              <span v-if="horario.aula" class="q-ml-xs">({{ horario.aula }})</span>
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabs de Contenido -->
    <q-card class="card-main">
      <q-tabs v-model="tabActual" dense class="text-grey" active-color="indigo" indicator-color="indigo" align="left">
        <q-tab name="justificacion" icon="article" label="Justificación" no-caps />
        <q-tab name="competencias" icon="emoji_events" label="Competencias" no-caps />
        <q-tab name="metodologia" icon="psychology" label="Metodología" no-caps />
        <q-tab name="evaluacion" icon="grading" label="Evaluación" no-caps />
        <q-tab name="bibliografia" icon="menu_book" label="Bibliografía" no-caps />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tabActual" animated class="bg-transparent">
        <!-- Tab: Justificación y Propósito -->
        <q-tab-panel name="justificacion" class="q-pa-lg">
          <q-banner class="bg-purple-1 text-purple-9 q-mb-md rounded-borders" dense>
            <template v-slot:avatar>
              <q-icon name="groups" color="purple" />
            </template>
            <span class="text-weight-medium">Campo Compartido (Materia)</span>
            <template v-slot:action v-if="esSoloLectura">
              <q-chip color="orange" text-color="white" size="sm" icon="visibility">Solo lectura</q-chip>
            </template>
          </q-banner>

          <!-- Sección 3: Justificación -->
          <div class="q-mb-xl">
            <div class="row items-center q-mb-md">
              <q-icon name="article" color="indigo" size="28px" class="q-mr-sm" />
              <span class="text-h6 text-weight-bold">3. Justificación de la Asignatura</span>
            </div>
            <q-input
              v-model="programa.justificacion"
              outlined
              type="textarea"
              rows="5"
              :readonly="esSoloLectura"
              placeholder="Describe la importancia y justificación de la asignatura en el plan de estudios..."
              hint="Explica por qué esta asignatura es fundamental para la formación del estudiante"
            />
          </div>

          <!-- Sección 4: Propósito General -->
          <div>
            <div class="row items-center q-mb-md">
              <q-icon name="flag" color="green" size="28px" class="q-mr-sm" />
              <span class="text-h6 text-weight-bold">4. Propósito General de la Unidad de Formación</span>
            </div>
            <q-input
              v-model="programa.proposito_general"
              outlined
              type="textarea"
              rows="5"
              :readonly="esSoloLectura"
              placeholder="Describe el propósito general que el estudiante alcanzará..."
              hint="El estudiante será capaz de..."
            />
          </div>
        </q-tab-panel>

        <!-- Tab: Competencias -->
        <q-tab-panel name="competencias" class="q-pa-lg">
          <q-banner class="bg-purple-1 text-purple-9 q-mb-md rounded-borders" dense>
            <template v-slot:avatar>
              <q-icon name="groups" color="purple" />
            </template>
            <span class="text-weight-medium">Campo Compartido (Materia)</span>
          </q-banner>

          <!-- Sección 5: Competencias -->
          <div class="q-mb-xl">
            <div class="row items-center q-mb-md">
              <q-icon name="emoji_events" color="amber" size="28px" class="q-mr-sm" />
              <span class="text-h6 text-weight-bold">5. Competencias</span>
            </div>

            <div class="row q-col-gutter-lg">
              <div class="col-12">
                <q-input
                  v-model="programa.competencias.global_especifica"
                  outlined
                  type="textarea"
                  rows="3"
                  :readonly="esSoloLectura"
                  label="Competencia Global/Específica"
                  placeholder="Proporciona atención médica integral, basada en evidencia científica..."
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="programa.competencias.competencia_asignatura"
                  outlined
                  type="textarea"
                  rows="3"
                  :readonly="esSoloLectura"
                  label="Competencia de la Asignatura"
                  placeholder="Identifica la organización general del cuerpo humano..."
                />
              </div>
            </div>
          </div>

          <!-- Sección 6: Elementos de Competencia -->
          <div>
            <div class="row items-center justify-between q-mb-md">
              <div class="row items-center">
                <q-icon name="checklist" color="blue" size="28px" class="q-mr-sm" />
                <span class="text-h6 text-weight-bold">6. Elementos de Competencia</span>
              </div>
              <q-btn
                v-if="!esSoloLectura"
                unelevated
                color="blue"
                icon="add"
                label="Agregar E.C."
                size="sm"
                no-caps
                @click="agregarElementoCompetencia"
              />
            </div>

            <div v-if="!programa.elementos_competencia.length" class="text-center q-pa-lg text-grey-6">
              <q-icon name="playlist_add" size="48px" />
              <p>No hay elementos de competencia. Agrega el primero.</p>
            </div>

            <q-list separator v-else>
              <q-item v-for="(ec, idx) in programa.elementos_competencia" :key="idx" class="q-pa-md">
                <q-item-section avatar>
                  <q-chip color="blue" text-color="white" dense>{{ ec.codigo }}</q-chip>
                </q-item-section>
                <q-item-section>
                  <q-input
                    v-model="ec.descripcion"
                    outlined
                    dense
                    :readonly="esSoloLectura"
                    placeholder="Describe el elemento de competencia..."
                  />
                </q-item-section>
                <q-item-section side v-if="!esSoloLectura">
                  <q-btn flat round dense icon="delete" color="red" @click="eliminarElementoCompetencia(idx)" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-tab-panel>

        <!-- Tab: Metodología -->
        <q-tab-panel name="metodologia" class="q-pa-lg">
          <q-banner class="bg-purple-1 text-purple-9 q-mb-md rounded-borders" dense>
            <template v-slot:avatar>
              <q-icon name="groups" color="purple" />
            </template>
            <span class="text-weight-medium">Campo Compartido (Materia)</span>
          </q-banner>

          <!-- Sección 9: Metodología General -->
          <div class="q-mb-xl">
            <div class="row items-center q-mb-md">
              <q-icon name="psychology" color="purple" size="28px" class="q-mr-sm" />
              <span class="text-h6 text-weight-bold">9. Metodología General de la Asignatura</span>
            </div>
            <q-input
              v-model="programa.metodologia_general"
              outlined
              type="textarea"
              rows="5"
              :readonly="esSoloLectura"
              placeholder="La metodología pedagógica será variada, basada en competencias..."
              hint="Describe las técnicas y métodos de enseñanza-aprendizaje"
            />
          </div>

          <!-- Sección 12: Organización y Calendario -->
          <div>
            <div class="row items-center q-mb-md">
              <q-icon name="calendar_month" color="teal" size="28px" class="q-mr-sm" />
              <span class="text-h6 text-weight-bold">12. Organización y Calendario</span>
            </div>
            <q-input
              v-model="programa.organizacion_calendario"
              outlined
              type="textarea"
              rows="4"
              :readonly="esSoloLectura"
              placeholder="Cronograma de actividades, fechas importantes..."
            />
          </div>
        </q-tab-panel>

        <!-- Tab: Evaluación -->
        <q-tab-panel name="evaluacion" class="q-pa-lg">
          <q-banner class="bg-purple-1 text-purple-9 q-mb-md rounded-borders" dense>
            <template v-slot:avatar>
              <q-icon name="groups" color="purple" />
            </template>
            <span class="text-weight-medium">Campo Compartido (Materia)</span>
          </q-banner>

          <!-- Sección 10: Sistema de Evaluación -->
          <div class="row items-center q-mb-md">
            <q-icon name="grading" color="orange" size="28px" class="q-mr-sm" />
            <span class="text-h6 text-weight-bold">10. Sistema de Evaluación</span>
          </div>

          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section class="bg-blue-1">
                  <span class="text-subtitle1 text-weight-bold text-blue-9">Evaluación Diagnóstica</span>
                </q-card-section>
                <q-card-section>
                  <q-input
                    v-model="programa.sistema_evaluacion.diagnostica"
                    outlined
                    type="textarea"
                    rows="4"
                    :readonly="esSoloLectura"
                    placeholder="Recuperación de conocimientos previos..."
                  />
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section class="bg-green-1">
                  <span class="text-subtitle1 text-weight-bold text-green-9">Evaluación Formativa</span>
                </q-card-section>
                <q-card-section>
                  <q-input
                    v-model="programa.sistema_evaluacion.formativa"
                    outlined
                    type="textarea"
                    rows="4"
                    :readonly="esSoloLectura"
                    placeholder="Logro de objetivos de enseñanza..."
                  />
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section class="bg-orange-1">
                  <span class="text-subtitle1 text-weight-bold text-orange-9">Evaluación Sumativa</span>
                </q-card-section>
                <q-card-section>
                  <q-input
                    v-model="programa.sistema_evaluacion.sumativa"
                    outlined
                    type="textarea"
                    rows="4"
                    :readonly="esSoloLectura"
                    placeholder="Mide el desarrollo de competencias..."
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>

        <!-- Tab: Bibliografía -->
        <q-tab-panel name="bibliografia" class="q-pa-lg">
          <q-banner class="bg-purple-1 text-purple-9 q-mb-md rounded-borders" dense>
            <template v-slot:avatar>
              <q-icon name="groups" color="purple" />
            </template>
            <span class="text-weight-medium">Campo Compartido (Materia)</span>
          </q-banner>

          <!-- Sección 15: Bibliografía Complementaria -->
          <div class="row items-center justify-between q-mb-md">
            <div class="row items-center">
              <q-icon name="menu_book" color="indigo" size="28px" class="q-mr-sm" />
              <span class="text-h6 text-weight-bold">15. Bibliografía Complementaria</span>
            </div>
            <q-btn
              v-if="!esSoloLectura"
              unelevated
              color="indigo"
              icon="add"
              label="Agregar Referencia"
              size="sm"
              no-caps
              @click="agregarBibliografiaComplementaria"
            />
          </div>

          <div v-if="!programa.bibliografia_complementaria.length" class="text-center q-pa-lg text-grey-6">
            <q-icon name="library_books" size="48px" />
            <p>No hay bibliografía complementaria. Agrega la primera referencia.</p>
          </div>

          <div v-else class="row q-col-gutter-md">
            <div v-for="(bib, idx) in programa.bibliografia_complementaria" :key="idx" class="col-12">
              <q-card flat bordered>
                <q-card-section>
                  <div class="row q-col-gutter-sm items-center">
                    <div class="col-12 col-md-3">
                      <q-input v-model="bib.autor" outlined dense label="Autor" :readonly="esSoloLectura" />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input v-model="bib.titulo" outlined dense label="Título" :readonly="esSoloLectura" />
                    </div>
                    <div class="col-12 col-md-2">
                      <q-input v-model="bib.editorial" outlined dense label="Editorial" :readonly="esSoloLectura" />
                    </div>
                    <div class="col-6 col-md-1">
                      <q-input v-model="bib.anio" outlined dense label="Año" :readonly="esSoloLectura" />
                    </div>
                    <div class="col-6 col-md-1">
                      <q-input v-model="bib.edicion" outlined dense label="Edición" :readonly="esSoloLectura" />
                    </div>
                    <div class="col-auto" v-if="!esSoloLectura">
                      <q-btn flat round dense icon="delete" color="red" @click="eliminarBibliografiaComplementaria(idx)" />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useProgramaAsignaturaStore } from 'src/stores/programaAsignatura'
import { generarProgramaAsignatura } from 'src/services/pdfService'

const route = useRoute()
const $q = useQuasar()
const store = useProgramaAsignaturaStore()

const tabActual = ref('justificacion')

// Computed del store
const programa = computed(() => store.programa)
const datosGenerales = computed(() => store.datosGenerales || {
  carrera: '',
  asignatura: '',
  codigo: '',
  semestre: ''
})
const horariosMateria = computed(() => store.horariosMateria)
const esSoloLectura = computed(() => store.esSoloLectura)
const guardando = computed(() => store.guardando)

// Actions
function agregarElementoCompetencia() {
  store.agregarElementoCompetencia()
}

function eliminarElementoCompetencia(idx) {
  store.eliminarElementoCompetencia(idx)
}

function agregarBibliografiaComplementaria() {
  store.agregarBibliografiaComplementaria()
}

function eliminarBibliografiaComplementaria(idx) {
  store.eliminarBibliografiaComplementaria(idx)
}

async function guardarCambios() {
  try {
    await store.guardarPrograma()
    $q.notify({
      type: 'positive',
      message: 'Programa guardado correctamente',
      icon: 'check_circle'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar: ' + error.message,
      icon: 'error'
    })
  }
}

function exportarPDF() {
  try {
    generarProgramaAsignatura({
      ...datosGenerales.value,
      programa: programa.value,
      horarios: horariosMateria.value
    })
    $q.notify({
      type: 'positive',
      message: 'PDF generado correctamente',
      icon: 'picture_as_pdf'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al generar PDF: ' + error.message,
      icon: 'error'
    })
  }
}

onMounted(async () => {
  const asignaturaId = route.params.id
  if (asignaturaId) {
    try {
      await store.cargarPrograma(asignaturaId)
    } catch (error) {
      console.error('Error cargando programa:', error)
    }
  }
})
</script>

<style lang="scss" scoped>
.animate-in {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.text-gradient {
  background: linear-gradient(135deg, #3f51b5, #5a67d8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-main {
  border-radius: 12px;
  overflow: hidden;
}
</style>
