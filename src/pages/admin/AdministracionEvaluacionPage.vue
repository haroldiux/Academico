<template>
  <q-page class="adm-eval-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">
          <q-icon name="manage_accounts" color="deep-purple" class="q-mr-sm" />
          Administración de Evaluaciones
        </h1>
        <p class="page-subtitle">
          Gestión de campus, carreras, usuarios y configuración de exámenes a nivel nacional
        </p>
      </div>
    </div>

    <q-card class="main-card">
      <q-tabs
        v-model="tabActual"
        dense
        class="text-grey"
        active-color="deep-purple"
        indicator-color="deep-purple"
        align="left"
      >
        <q-tab name="campus" icon="location_city" label="Campus por Sede" no-caps />
        <q-tab name="carreras" icon="school" label="Carreras por Campus" no-caps />
        <q-tab name="usuarios" icon="manage_accounts" label="Usuarios Evaluadores" no-caps />
        <q-tab name="configuracion" icon="tune" label="Configuración" no-caps />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tabActual" animated>
        <!-- ============================================================ -->
        <!-- TAB 1: CAMPUS POR SEDE -->
        <!-- ============================================================ -->
        <q-tab-panel name="campus" class="q-pa-lg">
          <div class="tab-header">
            <div>
              <div class="tab-title">Campus por Sede</div>
              <div class="tab-subtitle">
                Administra los campus asociados a cada sede universitaria
              </div>
            </div>
            <q-btn
              unelevated
              color="deep-purple"
              icon="add"
              label="Nuevo Campus"
              no-caps
              @click="abrirDialogCampus()"
            />
          </div>

          <!-- Filtro por sede -->
          <div class="q-mb-md q-mt-md">
            <q-select
              v-model="filtroSede"
              :options="sedesOptions"
              outlined
              dense
              label="Filtrar por Sede"
              emit-value
              map-options
              clearable
              style="max-width: 300px"
            />
          </div>

          <q-table
            :rows="campusFiltrados"
            :columns="columnasCampus"
            row-key="id"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:body-cell-sede="props">
              <q-td :props="props">
                <q-chip color="indigo" text-color="white" size="sm" dense icon="apartment">
                  {{ props.row.sede }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-chip
                  :color="props.row.activo ? 'green' : 'grey'"
                  text-color="white"
                  size="sm"
                  dense
                >
                  {{ props.row.activo ? 'Activo' : 'Inactivo' }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  size="sm"
                  color="orange"
                  @click="abrirDialogCampus(props.row)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="toggle_on"
                  size="sm"
                  color="teal"
                  @click="toggleCampus(props.row)"
                >
                  <q-tooltip>{{ props.row.activo ? 'Desactivar' : 'Activar' }}</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- ============================================================ -->
        <!-- TAB 2: CARRERAS POR CAMPUS -->
        <!-- ============================================================ -->
        <q-tab-panel name="carreras" class="q-pa-lg">
          <div class="tab-header">
            <div>
              <div class="tab-title">Carreras por Campus</div>
              <div class="tab-subtitle">Asigna las carreras que se gestionan en cada campus</div>
            </div>
            <q-btn
              unelevated
              color="deep-purple"
              icon="add"
              label="Asignar Carrera"
              no-caps
              @click="abrirDialogCarreraCampus()"
            />
          </div>

          <div class="row q-col-gutter-md q-mt-md q-mb-md">
            <div class="col-12 col-md-4">
              <q-select
                v-model="filtroCampusCarreras"
                :options="campusOptions"
                outlined
                dense
                label="Filtrar por Campus"
                emit-value
                map-options
                clearable
              />
            </div>
          </div>

          <q-table
            :rows="carrerasCampusFiltradas"
            :columns="columnasCarrerasCampus"
            row-key="id"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:body-cell-campus="props">
              <q-td :props="props">
                <q-chip color="deep-purple" text-color="white" size="sm" dense icon="location_city">
                  {{ props.row.campus }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-carrera="props">
              <q-td :props="props">
                <div class="flex items-center gap-2">
                  <q-icon name="school" color="blue" size="18px" class="q-mr-xs" />
                  <span class="text-weight-medium">{{ props.row.carrera }}</span>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  size="sm"
                  color="red"
                  @click="eliminarCarreraCampus(props.row)"
                >
                  <q-tooltip>Quitar asignación</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- ============================================================ -->
        <!-- TAB 3: USUARIOS EVALUADORES -->
        <!-- ============================================================ -->
        <q-tab-panel name="usuarios" class="q-pa-lg">
          <div class="tab-header">
            <div>
              <div class="tab-title">Usuarios de Evaluaciones</div>
              <div class="tab-subtitle">
                Asigna usuarios con el rol Evaluaciones a un campus específico
              </div>
            </div>
            <q-btn
              unelevated
              color="deep-purple"
              icon="person_add"
              label="Agregar Evaluador"
              no-caps
              @click="abrirDialogUsuario()"
            />
          </div>

          <div class="row q-col-gutter-md q-mt-md q-mb-md">
            <div class="col-12 col-md-4">
              <q-select
                v-model="filtroCampusUsuarios"
                :options="campusOptions"
                outlined
                dense
                label="Filtrar por Campus"
                emit-value
                map-options
                clearable
              />
            </div>
          </div>

          <q-table
            :rows="usuariosFiltrados"
            :columns="columnasUsuarios"
            row-key="id"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:body-cell-usuario="props">
              <q-td :props="props">
                <div class="flex items-center">
                  <q-avatar size="32px" color="deep-purple" text-color="white" class="q-mr-sm">
                    {{ props.row.nombre.charAt(0) }}
                  </q-avatar>
                  <div>
                    <div class="text-weight-medium">{{ props.row.nombre }}</div>
                    <div class="text-caption text-grey-6">{{ props.row.email }}</div>
                  </div>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-campus="props">
              <q-td :props="props">
                <q-chip color="deep-purple" text-color="white" size="sm" dense>
                  {{ props.row.campus }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-carreras="props">
              <q-td :props="props">
                <q-chip
                  v-for="c in props.row.carreras"
                  :key="c"
                  color="blue-1"
                  text-color="blue-9"
                  size="sm"
                  dense
                  class="q-mr-xs"
                  >{{ c }}</q-chip
                >
              </q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  size="sm"
                  color="orange"
                  @click="abrirDialogUsuario(props.row)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="person_remove"
                  size="sm"
                  color="red"
                  @click="eliminarUsuario(props.row)"
                >
                  <q-tooltip>Quitar rol</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- ============================================================ -->
        <!-- TAB 4: CONFIGURACIÓN -->
        <!-- ============================================================ -->
        <q-tab-panel name="configuracion" class="q-pa-lg">
          <div class="tab-header q-mb-lg">
            <div>
              <div class="tab-title">Configuración de Exámenes</div>
              <div class="tab-subtitle">Define los parámetros globales, por sede y por carrera</div>
            </div>
            <q-btn
              unelevated
              color="deep-purple"
              icon="save"
              label="Guardar Configuración"
              no-caps
              @click="guardarConfiguracion"
            />
          </div>

          <!-- Selector de nivel -->
          <q-card class="config-section-card q-mb-lg">
            <q-card-section>
              <div class="section-label q-mb-md">
                <q-icon name="tune" color="deep-purple" class="q-mr-sm" />
                Nivel de Configuración
              </div>
              <q-btn-toggle
                v-model="nivelConfig"
                toggle-color="deep-purple"
                unelevated
                :options="[
                  { label: 'Nacional', value: 'nacional', icon: 'public' },
                  { label: 'Por Sede', value: 'sede', icon: 'apartment' },
                  { label: 'Por Carrera', value: 'carrera', icon: 'school' },
                ]"
                no-caps
              />

              <div v-if="nivelConfig === 'sede'" class="q-mt-md">
                <q-select
                  v-model="configSede"
                  :options="sedesOptions"
                  outlined
                  dense
                  label="Seleccionar Sede"
                  emit-value
                  map-options
                  style="max-width: 300px"
                />
              </div>
              <div v-if="nivelConfig === 'carrera'" class="q-mt-md row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="configSede"
                    :options="sedesOptions"
                    outlined
                    dense
                    label="Sede"
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="configCarrera"
                    :options="carrerasOptions"
                    outlined
                    dense
                    label="Carrera"
                    emit-value
                    map-options
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <div class="row q-col-gutter-lg">
            <!-- Columna izquierda: Estructura del Examen -->
            <div :class="['col-12', nivelConfig === 'nacional' ? 'col-md-6' : 'col-md-12']">
              <q-card class="config-section-card">
                <q-card-section>
                  <div class="section-label q-mb-md">
                    <q-icon name="quiz" color="orange" class="q-mr-sm" />
                    Estructura por Parcial
                  </div>

                  <div
                    v-for="(parcial, idx) in config.parciales"
                    :key="idx"
                    class="parcial-config q-mb-md"
                  >
                    <div class="parcial-titulo q-mb-sm">{{ parcial.nombre }}</div>

                    <!-- Total preguntas -->
                    <div class="q-mb-sm">
                      <q-input
                        v-model.number="parcial.totalPreguntas"
                        outlined
                        dense
                        label="Total de Preguntas"
                        type="number"
                        min="5"
                        max="200"
                      >
                        <template v-slot:append>
                          <span class="text-grey-6 text-caption">preguntas</span>
                        </template>
                      </q-input>
                    </div>

                    <!-- Distribución por dificultad -->
                    <div class="dificultad-row">
                      <div class="dificultad-item">
                        <q-chip
                          color="green"
                          text-color="white"
                          size="sm"
                          icon="sentiment_satisfied"
                          >Fácil</q-chip
                        >
                        <q-input
                          v-model.number="parcial.distribucion.facil"
                          outlined
                          dense
                          type="number"
                          min="0"
                          :max="parcial.totalPreguntas"
                          style="width: 90px"
                        />
                      </div>
                      <div class="dificultad-item">
                        <q-chip color="orange" text-color="white" size="sm" icon="sentiment_neutral"
                          >Medio</q-chip
                        >
                        <q-input
                          v-model.number="parcial.distribucion.medio"
                          outlined
                          dense
                          type="number"
                          min="0"
                          :max="parcial.totalPreguntas"
                          style="width: 90px"
                        />
                      </div>
                      <div class="dificultad-item">
                        <q-chip
                          color="red"
                          text-color="white"
                          size="sm"
                          icon="sentiment_dissatisfied"
                          >Difícil</q-chip
                        >
                        <q-input
                          v-model.number="parcial.distribucion.dificil"
                          outlined
                          dense
                          type="number"
                          min="0"
                          :max="parcial.totalPreguntas"
                          style="width: 90px"
                        />
                      </div>
                    </div>

                    <q-banner
                      :class="
                        sumaDistribucion(parcial) === parcial.totalPreguntas
                          ? 'bg-green-1 text-green-9'
                          : 'bg-orange-1 text-orange-9'
                      "
                      dense
                      rounded
                      class="q-mt-sm"
                    >
                      <q-icon
                        :name="sumaDistribucion(parcial) === parcial.totalPreguntas ? 'check' : 'warning'"
                        class="q-mr-xs"
                      />
                      Total distribución: {{ sumaDistribucion(parcial) }}
                      <span v-if="sumaDistribucion(parcial) !== parcial.totalPreguntas" class="text-caption">
                        (debe sumar {{ parcial.totalPreguntas }})</span
                      >
                    </q-banner>

                    <q-separator class="q-mt-md" />
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Columna derecha: Tiempos y opciones -->
            <div class="col-12 col-md-6" v-if="nivelConfig === 'nacional'">
              <q-card class="config-section-card q-mb-md">
                <q-card-section>
                  <div class="section-label q-mb-md">
                    <q-icon name="timer" color="blue" class="q-mr-sm" />
                    Configuración de Tiempos
                  </div>

                  <div class="q-gutter-md">
                    <q-input
                      v-model.number="config.minutosAntesEntrega"
                      outlined
                      dense
                      type="number"
                      label="Minutos antes del examen para entregar"
                      min="1"
                      max="120"
                    >
                      <template v-slot:prepend><q-icon name="upload" color="green" /></template>
                      <template v-slot:append><span class="text-grey-6">min</span></template>
                    </q-input>

                    <q-input
                      v-model.number="config.horasAntesGeneracion"
                      outlined
                      dense
                      type="number"
                      label="Horas antes para mostrar opción Generar Examen"
                      min="1"
                      max="72"
                    >
                      <template v-slot:prepend><q-icon name="description" color="blue" /></template>
                      <template v-slot:append><span class="text-grey-6">horas</span></template>
                    </q-input>

                    <q-input
                      v-model.number="config.horasPatron"
                      outlined
                      dense
                      type="number"
                      label="Horas post-entrega para mostrar patrón"
                      min="0"
                      max="48"
                    >
                      <template v-slot:prepend
                        ><q-icon name="fact_check" color="purple"
                      /></template>
                      <template v-slot:append><span class="text-grey-6">horas</span></template>
                    </q-input>

                    <q-input
                      v-model.number="config.alertaHorasAntes"
                      outlined
                      dense
                      type="number"
                      label="Horas antes para alerta en lista de exámenes"
                      min="1"
                      max="72"
                    >
                      <template v-slot:prepend
                        ><q-icon name="notifications" color="orange"
                      /></template>
                      <template v-slot:append><span class="text-grey-6">horas</span></template>
                    </q-input>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- DIALOG: Campus -->
    <q-dialog v-model="showDialogCampus" persistent>
      <q-card style="min-width: 500px; max-width: 600px">
        <div class="dialog-header">
          <q-icon :name="campusForm.id ? 'edit' : 'add_location'" class="q-mr-sm" />
          {{ campusForm.id ? 'Editar Campus' : 'Nuevo Campus' }}
        </div>
        <q-card-section class="q-gutter-md">
          <q-input
            v-model="campusForm.nombre"
            outlined
            label="Nombre del Campus *"
            placeholder="Ej: Campus Central, Campus Norte..."
          />
          <q-select
            v-model="campusForm.sede_id"
            :options="sedesOptions"
            outlined
            label="Sede *"
            emit-value
            map-options
          />
          <q-input v-model="campusForm.direccion" outlined label="Dirección" />
          <q-toggle v-model="campusForm.activo" label="Campus activo" color="deep-purple" />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="showDialogCampus = false" />
          <q-btn
            unelevated
            color="deep-purple"
            label="Guardar"
            icon="save"
            @click="guardarCampus"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOG: Asignar Carrera a Campus -->
    <q-dialog v-model="showDialogCarreraCampus" persistent>
      <q-card style="min-width: 500px">
        <div class="dialog-header">
          <q-icon name="school" class="q-mr-sm" />
          Asignar Carrera a Campus
        </div>
        <q-card-section class="q-gutter-md">
          <q-select
            v-model="carreraCampusForm.campus_id"
            :options="campusOptions"
            outlined
            label="Campus *"
            emit-value
            map-options
          />
          <q-select
            v-model="carreraCampusForm.carrera_id"
            :options="carrerasOptions"
            outlined
            label="Carrera *"
            emit-value
            map-options
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="showDialogCarreraCampus = false" />
          <q-btn
            unelevated
            color="deep-purple"
            label="Asignar"
            icon="link"
            @click="guardarCarreraCampus"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOG: Usuario Evaluador -->
    <q-dialog v-model="showDialogUsuario" persistent>
      <q-card style="min-width: 500px">
        <div class="dialog-header">
          <q-icon name="manage_accounts" class="q-mr-sm" />
          {{ usuarioForm.id ? 'Editar Evaluador' : 'Agregar Evaluador' }}
        </div>
        <q-card-section class="q-gutter-md">
          <q-select
            v-model="usuarioForm.usuario_id"
            :options="usuariosDisponibles"
            outlined
            label="Usuario *"
            emit-value
            map-options
            use-input
            input-debounce="300"
            placeholder="Buscar usuario..."
          />
          <q-select
            v-model="usuarioForm.campus_id"
            :options="campusOptions"
            outlined
            label="Campus *"
            emit-value
            map-options
          />
          <q-select
            v-model="usuarioForm.carreras"
            :options="carrerasOptions"
            outlined
            label="Carreras asignadas"
            emit-value
            map-options
            multiple
            use-chips
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="showDialogUsuario = false" />
          <q-btn
            unelevated
            color="deep-purple"
            label="Guardar"
            icon="save"
            @click="guardarUsuario"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()

const tabActual = ref('campus')
const filtroSede = ref(null)
const filtroCampusCarreras = ref(null)
const filtroCampusUsuarios = ref(null)
const nivelConfig = ref('nacional')
const configSede = ref(null)
const configCarrera = ref(null)

// Dialogs
const showDialogCampus = ref(false)
const showDialogCarreraCampus = ref(false)
const showDialogUsuario = ref(false)

// Forms
const campusForm = ref({ id: null, nombre: '', sede_id: null, direccion: '', activo: true })
const carreraCampusForm = ref({ campus_id: null, carrera_id: null })
const usuarioForm = ref({ id: null, usuario_id: null, campus_id: null, carreras: [] })

const config = ref({
  minutosAntesEntrega: 15,
  horasAntesGeneracion: 48,
  horasPatron: 0,
  alertaHorasAntes: 24,
  parciales: [
    {
      nombre: '1° Parcial',
      totalPreguntas: 30,
      distribucion: { facil: 7, medio: 16, dificil: 7 },
    },
    {
      nombre: '2° Parcial',
      totalPreguntas: 30,
      distribucion: { facil: 7, medio: 16, dificil: 7 },
    },
    {
      nombre: 'Examen Final',
      totalPreguntas: 40,
      distribucion: { facil: 10, medio: 20, dificil: 10 },
    },
    {
      nombre: '2da Instancia',
      totalPreguntas: 40,
      distribucion: { facil: 10, medio: 20, dificil: 10 },
    },
  ],
})

// Options (mock - se reemplazarán con datos del store/API)
const sedesOptions = ref([
  { label: 'Sede Central', value: 1 },
  { label: 'Sede Cochabamba', value: 2 },
  { label: 'Sede Santa Cruz', value: 3 },
])

const campusOptions = ref([
  { label: 'Campus Central - Sede Central', value: 1 },
  { label: 'Campus Norte - Sede Cochabamba', value: 2 },
  { label: 'Campus Sur - Sede Santa Cruz', value: 3 },
])

const carrerasOptions = ref([
  { label: 'Medicina', value: 1 },
  { label: 'Enfermería', value: 2 },
  { label: 'Odontología', value: 3 },
  { label: 'Fisioterapia', value: 4 },
])

const usuariosDisponibles = ref([
  { label: 'Juan Pérez (evaluaciones@unitepc.edu.bo)', value: 10 },
  { label: 'María García (mgarcia@unitepc.edu.bo)', value: 11 },
])

// Mock Data
const campus = ref([
  {
    id: 1,
    nombre: 'Campus Central',
    sede: 'Sede Central',
    sede_id: 1,
    direccion: 'Av. Principal 100',
    activo: true,
    carreras: 3,
  },
  {
    id: 2,
    nombre: 'Campus Norte',
    sede: 'Sede Cochabamba',
    sede_id: 2,
    direccion: 'Calle Norte 200',
    activo: true,
    carreras: 2,
  },
  {
    id: 3,
    nombre: 'Campus Sur',
    sede: 'Sede Santa Cruz',
    sede_id: 3,
    direccion: 'Av. Sur 300',
    activo: false,
    carreras: 1,
  },
])

const carrerasCampus = ref([
  { id: 1, campus: 'Campus Central', campus_id: 1, carrera: 'Medicina', grupos: 4 },
  { id: 2, campus: 'Campus Central', campus_id: 1, carrera: 'Enfermería', grupos: 3 },
  { id: 3, campus: 'Campus Norte', campus_id: 2, carrera: 'Odontología', grupos: 2 },
])

const usuarios = ref([
  {
    id: 1,
    nombre: 'Juan Pérez',
    email: 'jperez@unitepc.edu.bo',
    campus: 'Campus Central',
    campus_id: 1,
    carreras: ['Medicina', 'Enfermería'],
  },
  {
    id: 2,
    nombre: 'María García',
    email: 'mgarcia@unitepc.edu.bo',
    campus: 'Campus Norte',
    campus_id: 2,
    carreras: ['Odontología'],
  },
])

// Columnas tablas
const columnasCampus = [
  { name: 'nombre', label: 'Campus', field: 'nombre', align: 'left', sortable: true },
  { name: 'sede', label: 'Sede', field: 'sede', align: 'left', sortable: true },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' },
  { name: 'carreras', label: 'Carreras', field: 'carreras', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

const columnasCarrerasCampus = [
  { name: 'campus', label: 'Campus', field: 'campus', align: 'left' },
  { name: 'carrera', label: 'Carrera', field: 'carrera', align: 'left' },
  { name: 'grupos', label: 'Grupos', field: 'grupos', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

const columnasUsuarios = [
  { name: 'usuario', label: 'Usuario', field: 'nombre', align: 'left' },
  { name: 'campus', label: 'Campus', field: 'campus', align: 'left' },
  { name: 'carreras', label: 'Carreras Asignadas', field: 'carreras', align: 'left' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

// Computeds filtrados
const campusFiltrados = computed(() => {
  if (!filtroSede.value) return campus.value
  return campus.value.filter((c) => c.sede_id === filtroSede.value)
})

const carrerasCampusFiltradas = computed(() => {
  if (!filtroCampusCarreras.value) return carrerasCampus.value
  return carrerasCampus.value.filter((c) => c.campus_id === filtroCampusCarreras.value)
})

const usuariosFiltrados = computed(() => {
  if (!filtroCampusUsuarios.value) return usuarios.value
  return usuarios.value.filter((u) => u.campus_id === filtroCampusUsuarios.value)
})

function sumaDistribucion(parcial) {
  return (
    (parcial.distribucion.facil || 0) +
    (parcial.distribucion.medio || 0) +
    (parcial.distribucion.dificil || 0)
  )
}

function abrirDialogCampus(campus_ = null) {
  if (campus_) {
    campusForm.value = { ...campus_ }
  } else {
    campusForm.value = { id: null, nombre: '', sede_id: null, direccion: '', activo: true }
  }
  showDialogCampus.value = true
}

function guardarCampus() {
  $q.notify({
    type: 'positive',
    message: `Campus "${campusForm.value.nombre}" guardado correctamente`,
  })
  showDialogCampus.value = false
}

function toggleCampus(campus_) {
  campus_.activo = !campus_.activo
  $q.notify({ type: 'info', message: `Campus ${campus_.activo ? 'activado' : 'desactivado'}` })
}

function abrirDialogCarreraCampus() {
  carreraCampusForm.value = { campus_id: null, carrera_id: null }
  showDialogCarreraCampus.value = true
}

function guardarCarreraCampus() {
  $q.notify({ type: 'positive', message: 'Carrera asignada al campus correctamente' })
  showDialogCarreraCampus.value = false
}

function eliminarCarreraCampus(row) {
  $q.dialog({
    title: 'Quitar asignación',
    message: `¿Quitar la carrera "${row.carrera}" del campus "${row.campus}"?`,
    ok: { label: 'Quitar', color: 'red', unelevated: true },
    cancel: { label: 'Cancelar', flat: true },
  }).onOk(() => {
    $q.notify({ type: 'warning', message: 'Asignación eliminada' })
  })
}

function abrirDialogUsuario(usuario = null) {
  if (usuario) {
    usuarioForm.value = { ...usuario }
  } else {
    usuarioForm.value = { id: null, usuario_id: null, campus_id: null, carreras: [] }
  }
  showDialogUsuario.value = true
}

function guardarUsuario() {
  $q.notify({ type: 'positive', message: 'Evaluador guardado correctamente' })
  showDialogUsuario.value = false
}

function eliminarUsuario(usuario) {
  $q.dialog({
    title: 'Quitar Evaluador',
    message: `¿Quitar a "${usuario.nombre}" del campus?`,
    ok: { label: 'Quitar', color: 'red', unelevated: true },
    cancel: { label: 'Cancelar', flat: true },
  }).onOk(() => {
    $q.notify({ type: 'warning', message: 'Evaluador removido' })
  })
}

async function cargarConfiguracion() {
  try {
    const params = { nivel: nivelConfig.value }
    if (nivelConfig.value === 'sede' || nivelConfig.value === 'carrera') {
      if (configSede.value) params.sede_id = configSede.value
      else return
    }
    if (nivelConfig.value === 'carrera') {
      if (configCarrera.value) params.carrera_id = configCarrera.value
      else return
    }

    const { data } = await api.get('/evaluaciones/config', { params })
    if (data.success && data.configuracion) {
      // Deep merge avoiding reactivity loss on nested structure could be tricky, 
      // simple reassignment of known structure is best
      config.value = JSON.parse(JSON.stringify(data.configuracion))
      
      if (data.nivel_hallado !== nivelConfig.value) {
        $q.notify({
          type: 'info',
          message: `Cargando configuración heredada de nivel ${data.nivel_hallado}`,
          position: 'top-right',
          timeout: 2000
        })
      }
    }
  } catch (err) {
    console.error('Error cargando configuración:', err)
  }
}

async function guardarConfiguracion() {
  try {
    const payload = {
      nivel: nivelConfig.value,
      sede_id: configSede.value,
      carrera_id: configCarrera.value,
      configuracion: config.value
    }
    const { data } = await api.post('/evaluaciones/config', payload)
    if (data.success) {
      $q.notify({ type: 'positive', message: 'Configuración guardada correctamente', icon: 'save' })
    }
  } catch (err) {
    console.error('Error al guardar configuración:', err)
    $q.notify({ type: 'negative', message: 'Error al guardar la configuración' })
  }
}

watch([nivelConfig, configSede, configCarrera], () => {
  cargarConfiguracion()
})

onMounted(() => {
  cargarConfiguracion()
})
</script>

<style scoped>
.adm-eval-page {
  padding: 24px;
  background: var(--bg-primary);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
}

.page-subtitle {
  color: var(--text-secondary);
  margin: 4px 0 0 0;
}

.main-card {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.tab-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.tab-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.dialog-header {
  background: linear-gradient(135deg, #6a0dad, #9c27b0);
  color: white;
  padding: 16px 20px;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  border-radius: 4px 4px 0 0;
}

.config-section-card {
  background: var(--bg-tertiary) !important;
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.section-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.parcial-config {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px;
}

.parcial-titulo {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.dificultad-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-top: 8px;
}

.dificultad-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
