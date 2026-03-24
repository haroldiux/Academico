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
                <q-chip
                  color="primary"
                  text-color="white"
                  size="sm"
                  dense
                  icon="location_city"
                  class="text-weight-bold"
                >
                  {{ props.row.campus }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-carreras="props">
              <q-td :props="props">
                <div class="flex wrap gap-2">
                  <q-chip
                    v-for="c in props.row.carreras"
                    :key="c.id"
                    color="indigo-1"
                    text-color="indigo-10"
                    size="sm"
                    class="q-ma-xs row items-center text-weight-bolder shadow-1"
                    style="padding-right: 4px"
                  >
                    <span class="q-mr-xs">{{ c.nombre }}</span>
                    <q-btn
                      flat
                      round
                      dense
                      icon="edit"
                      size="xs"
                      color="amber-10"
                      class="q-ml-xs hover-bg-amber-1"
                      @click="
                        abrirDialogCarreraCampus({
                          campus_id: props.row.id,
                          id: c.id,
                          carrera: c.nombre,
                          campus: props.row.campus,
                        })
                      "
                    >
                      <q-tooltip>Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      icon="close"
                      size="xs"
                      color="negative"
                      @click="
                        eliminarCarreraCampus({
                          campus_id: props.row.id,
                          id: c.id,
                          carrera: c.nombre,
                          campus: props.row.campus,
                        })
                      "
                    >
                      <q-tooltip>Quitar</q-tooltip>
                    </q-btn>
                  </q-chip>
                </div>
              </q-td>
            </template>
            <!-- Eliminamos body-cell-acciones ya que las acciones están en los chips -->
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
                <div class="carreras-chip-container">
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
                </div>
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
                  option-value="value"
                  option-label="label"
                  outlined
                  dense
                  label="Seleccionar Sede"
                  emit-value
                  map-options
                  style="max-width: 300px"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey"> Sedes no disponibles. </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div v-if="nivelConfig === 'carrera'" class="q-mt-md row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="configSede"
                    :options="sedesOptions"
                    option-value="value"
                    option-label="label"
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
              <q-banner
                v-if="!esConfigPropia && nivelConfig !== 'nacional'"
                class="bg-info text-white q-mb-md rounded-borders"
                dense
              >
                <template v-slot:avatar>
                  <q-icon name="info" size="sm" />
                </template>
                Mostrando configuración heredada de:
                <strong class="text-uppercase">{{ nivelOrigen }}</strong> <br />
                <span class="text-caption"
                  >Si guardas cambios aquí, se creará una configuración independiente para que
                  {{ nivelConfig === 'sede' ? 'esta sede' : 'esta carrera' }} sobresalga del
                  resto.</span
                >
              </q-banner>

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
                        :name="
                          sumaDistribucion(parcial) === parcial.totalPreguntas ? 'check' : 'warning'
                        "
                        class="q-mr-xs"
                      />
                      Total distribución: {{ sumaDistribucion(parcial) }}
                      <span
                        v-if="sumaDistribucion(parcial) !== parcial.totalPreguntas"
                        class="text-caption"
                      >
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
                  <div class="section-label q-mb-md flex justify-between items-center">
                    <div>
                      <q-icon name="timer" color="blue" class="q-mr-sm" />
                      Configuración de Tiempos
                    </div>
                    <!-- Selector de Gestión -->
                    <q-select
                      v-model="gestionConfig"
                      :options="['1/2026', '2/2026', '3/2026', '4/2026']"
                      outlined
                      dense
                      label="Gestión"
                      emit-value
                      map-options
                      style="width: 130px"
                    />
                  </div>

                  <div class="q-gutter-md">
                    <q-input
                      v-model.number="tiemposConfig.minutos_antes_entrega"
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
                      v-model.number="tiemposConfig.horas_antes_generacion"
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
                      v-model.number="tiemposConfig.horas_post_patron"
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
                      v-model.number="tiemposConfig.alerta_horas_antes"
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

                  <div class="q-mt-md flex justify-end">
                    <q-btn
                      unelevated
                      color="blue-8"
                      label="Guardar Tiempos"
                      icon="save"
                      @click="guardarTiempos"
                    />
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
          {{ carreraCampusForm.original ? 'Editar Asignación' : 'Asignar Carrera a Campus' }}
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
          <div class="row items-center q-mb-md">
            <div class="text-subtitle2 q-mr-md text-grey-8">Tipo de Usuario:</div>
            <q-btn-toggle
              v-model="usuarioForm.rol_id"
              toggle-color="deep-purple"
              flat
              dense
              :options="[
                { label: 'Evaluador (Estándar)', value: 7 },
                { label: 'Responsable (Nacional)', value: 9 },
              ]"
            />
          </div>

          <q-toggle
            v-model="usuarioForm.crear_nuevo"
            label="Registrar nuevo usuario Evaluador"
            color="deep-purple"
          />

          <!-- MODO SELECCIÓN -->
          <template v-if="!usuarioForm.crear_nuevo">
            <q-select
              v-model="usuarioForm.usuario_id"
              :options="usuariosDisponibles"
              outlined
              label="Seleccionar Usuario Existente *"
              emit-value
              map-options
              use-input
              input-debounce="300"
              placeholder="Buscar usuario..."
            />
          </template>

          <!-- MODO CREACIÓN -->
          <template v-else>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-input v-model="usuarioForm.nombre" outlined dense label="Nombre (s) *" />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="usuarioForm.apellido" outlined dense label="Apellidos *" />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="usuarioForm.ci" outlined dense label="Cédula de Identidad *" />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="usuarioForm.telefono" outlined dense label="Teléfono" />
              </div>
              <div class="col-12">
                <q-input
                  v-model="usuarioForm.email"
                  outlined
                  dense
                  type="email"
                  label="Correo Electrónico *"
                />
              </div>
            </div>
          </template>

          <q-select
            v-if="usuarioForm.rol_id !== 9"
            v-model="usuarioForm.campus_id"
            :options="campusOptions"
            outlined
            label="Campus Asignado *"
            emit-value
            map-options
            class="q-mt-md"
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

const esConfigPropia = ref(true)
const nivelOrigen = ref('nacional')

// Dialogs
const showDialogCampus = ref(false)
const showDialogCarreraCampus = ref(false)
const showDialogUsuario = ref(false)

// Forms
const campusForm = ref({ id: null, nombre: '', sede_id: null, direccion: '', activo: true })
const carreraCampusForm = ref({ campus_id: null, carrera_id: null, original: null })
const usuarioForm = ref({
  id: null,
  usuario_id: null,
  campus_id: null,
  crear_nuevo: false,
  rol_id: 7,
  nombre: '',
  apellido: '',
  ci: '',
  telefono: '',
  email: '',
})

const config = ref({
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

const gestionConfig = ref('1/2026')
const tiemposConfig = ref({
  minutos_antes_entrega: 15,
  horas_antes_generacion: 48,
  horas_post_patron: 0,
  alerta_horas_antes: 24,
})

// Data real local
const sedesOptions = ref([])
const campus = ref([])
const campusOptions = ref([])

const carrerasOptions = ref([])

const usuariosDisponibles = ref([])
const usuarios = ref([])

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
  { name: 'campus', label: 'Campus', field: 'campus', align: 'left', sortable: true },
  { name: 'carreras', label: 'Carreras Asignadas', field: 'carreras', align: 'left' },
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
  let listado = []

  // Procesar todos los campus o el filtrado
  const campusAProcesar = filtroCampusCarreras.value
    ? campus.value.filter((c) => c.id === filtroCampusCarreras.value)
    : campus.value

  listado = campusAProcesar
    .map((camp) => ({
      id: camp.id,
      campus: camp.nombre,
      carreras: camp.lista_carreras || [],
    }))
    .filter((c) => c.carreras.length > 0)

  // Ordenar alfabéticamente por campus
  return listado.sort((a, b) => a.campus.localeCompare(b.campus))
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

async function cargarSedes() {
  try {
    const { data } = await api.get('/sedes')
    const list = data.data || data
    sedesOptions.value = list.map((s) => ({ label: s.nombre, value: s.id }))
  } catch (error) {
    console.error('Error cargando sedes', error)
  }
}

async function cargarCarreras() {
  try {
    // El controller devuelve info en json
    const { data } = await api.get('/carreras')
    const list = data.data || data
    carrerasOptions.value = list.map((c) => ({ label: `${c.sigla} - ${c.nombre}`, value: c.id }))
  } catch (error) {
    console.error('Error cargando carreras globales', error)
  }
}

async function cargarCampus() {
  try {
    const { data } = await api.get('/campus')
    campus.value = data.data || data
    campusOptions.value = campus.value.map((c) => ({
      label: `${c.nombre} - ${c.sede}`,
      value: c.id,
    }))
  } catch (error) {
    console.error('Error cargando campus', error)
  }
}

async function guardarCampus() {
  try {
    if (campusForm.value.id) {
      await api.put(`/campus/${campusForm.value.id}`, campusForm.value)
      $q.notify({ type: 'positive', message: 'Campus actualizado correctamente' })
    } else {
      await api.post('/campus', campusForm.value)
      $q.notify({ type: 'positive', message: 'Campus creado correctamente' })
    }
    showDialogCampus.value = false
    cargarCampus()
  } catch (error) {
    console.error('Error guardando campus', error)
    $q.notify({ type: 'negative', message: 'Error al intentar guardar el campus' })
  }
}

async function toggleCampus(campus_) {
  try {
    campus_.activo = !campus_.activo
    await api.put(`/campus/${campus_.id}`, { activo: campus_.activo })
    $q.notify({ type: 'info', message: `Campus ${campus_.activo ? 'activado' : 'desactivado'}` })
  } catch (error) {
    console.error('Error toggling estado del campus', error)
    campus_.activo = !campus_.activo
    $q.notify({ type: 'negative', message: 'No se pudo cambiar el estado' })
  }
}

function abrirDialogCarreraCampus(row = null) {
  if (row) {
    carreraCampusForm.value = {
      campus_id: row.campus_id,
      carrera_id: row.id, // En la tabla, row.id es carrera_id según el computed
      original: { campus_id: row.campus_id, carrera_id: row.id },
    }
  } else {
    carreraCampusForm.value = { campus_id: null, carrera_id: null, original: null }
  }
  showDialogCarreraCampus.value = true
}

async function guardarCarreraCampus() {
  if (!carreraCampusForm.value.campus_id || !carreraCampusForm.value.carrera_id) {
    $q.notify({ type: 'warning', message: 'Debe seleccionar un campus y una carrera' })
    return
  }

  try {
    // Si es edición, quitar la anterior primero
    if (carreraCampusForm.value.original) {
      const { campus_id, carrera_id } = carreraCampusForm.value.original
      // Solo si cambió algo
      if (
        campus_id !== carreraCampusForm.value.campus_id ||
        carrera_id !== carreraCampusForm.value.carrera_id
      ) {
        await api.delete(`/campus/${campus_id}/carreras/${carrera_id}`)
      } else {
        // No cambió nada, cerrar
        showDialogCarreraCampus.value = false
        return
      }
    }

    const payload = { carreras: [Number(carreraCampusForm.value.carrera_id)] }
    await api.post(`/campus/${carreraCampusForm.value.campus_id}/carreras`, payload)
    $q.notify({
      type: 'positive',
      message: carreraCampusForm.value.original
        ? 'Asignación actualizada'
        : 'Carrera asignada correctamente',
    })
    showDialogCarreraCampus.value = false

    // Recargar la data general del campus para refrescar la lista
    cargarCampus()
  } catch (error) {
    console.error('Error al guardar asignación de carrera', error)
    $q.notify({ type: 'negative', message: 'Error al procesar la asignación' })
  }
}

function eliminarCarreraCampus(row) {
  $q.dialog({
    title: 'Quitar asignación',
    message: `¿Quitar la carrera "${row.carrera}" del campus "${row.campus}"?`,
    ok: { label: 'Quitar', color: 'red', unelevated: true },
    cancel: { label: 'Cancelar', flat: true },
  }).onOk(async () => {
    try {
      await api.delete(`/campus/${row.campus_id}/carreras/${row.id}`)
      $q.notify({ type: 'warning', message: 'Asignación eliminada correctamente' })
      cargarCampus() // Recargar datos
    } catch (err) {
      console.error('Error al quitar asignación de carrera', err)
      $q.notify({ type: 'negative', message: 'Error al desenlazar carrera' })
    }
  })
}

function abrirDialogUsuario(usuario = null) {
  if (usuario) {
    usuarioForm.value = {
      ...usuario,
      usuario_id: usuario.id,
      campus_id: usuario.campus_id,
      crear_nuevo: false,
      rol_id: usuario.rol_id || 7, // Por defecto para edición si no viene el rol
    }
  } else {
    usuarioForm.value = {
      id: null,
      usuario_id: null,
      campus_id: null,
      crear_nuevo: true, // Por defecto true para facilitar el flujo
      rol_id: 7,
      nombre: '',
      apellido: '',
      ci: '',
      telefono: '',
      email: '',
    }
  }
  showDialogUsuario.value = true
}

async function cargarUsuarios() {
  try {
    const { data } = await api.get('/evaluadores')
    usuarios.value = data.data || data
  } catch (err) {
    console.error('Error cargando los usuarios evaluadores', err)
  }
}

async function cargarUsuariosDisponibles() {
  try {
    const { data } = await api.get('/evaluadores/disponibles')
    const list = data.data || data
    usuariosDisponibles.value = list.map((u) => ({
      label: `${u.nombre} (${u.email})`,
      value: u.id,
    }))
  } catch (err) {
    console.error('Error cargando evaluadores disponibles', err)
  }
}

async function guardarUsuario() {
  // Si es responsable nacional, no necesita campus_id
  if (usuarioForm.value.rol_id !== 9 && !usuarioForm.value.campus_id) {
    $q.notify({ type: 'warning', message: 'Debe seleccionar un campus asignado' })
    return
  }

  if (!usuarioForm.value.crear_nuevo && !usuarioForm.value.usuario_id) {
    $q.notify({ type: 'warning', message: 'Debe seleccionar un usuario existente' })
    return
  }

  try {
    const payload = { ...usuarioForm.value }
    // Si es responsable nacional, usamos un campus_id ficticio en la URL (será ignorado por el backend)
    const campusIdUrl = usuarioForm.value.rol_id === 9 ? 1 : usuarioForm.value.campus_id
    await api.post(`/campus/${campusIdUrl}/evaluadores`, payload)

    $q.notify({ type: 'positive', message: 'Evaluador asignado correctamente' })
    showDialogUsuario.value = false

    cargarUsuarios()
    cargarUsuariosDisponibles()
  } catch (error) {
    console.error('Error asignando evaluador a campus', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al asignar usuario',
    })
  }
}

function eliminarUsuario(row) {
  if (!row.campus_id || !row.id) return

  $q.dialog({
    title: 'Quitar Evaluador',
    message: `¿Quitar a "${row.nombre}" del campus "${row.campus}"?`,
    ok: { label: 'Quitar', color: 'red', unelevated: true },
    cancel: { label: 'Cancelar', flat: true },
  }).onOk(async () => {
    try {
      await api.delete(`/campus/${row.campus_id}/evaluadores/${row.id}`)
      $q.notify({ type: 'warning', message: 'Evaluador removido' })
      cargarUsuarios()
      cargarUsuariosDisponibles()
    } catch (error) {
      console.error('Error removiendo evaluador', error)
      $q.notify({ type: 'negative', message: 'No se pudo quitar la asignación de este usuario' })
    }
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

      esConfigPropia.value = data.es_propia
      nivelOrigen.value = data.nivel_hallado

      // Ya no mostramos la alerta flash, lo manejamos con el q-banner fijo
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
      configuracion: config.value,
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

async function cargarTiempos() {
  try {
    const { data } = await api.get('/evaluaciones/tiempos', {
      params: { gestion: gestionConfig.value },
    })
    if (data.success && data.configuracion) {
      tiemposConfig.value = { ...data.configuracion }
    }
  } catch (err) {
    console.error('Error cargando tiempos:', err)
  }
}

async function guardarTiempos() {
  try {
    const payload = {
      gestion: gestionConfig.value,
      ...tiemposConfig.value,
    }
    const { data } = await api.post('/evaluaciones/tiempos', payload)
    if (data.success) {
      $q.notify({ type: 'positive', message: 'Tiempos guardados correctamente', icon: 'timer' })
    }
  } catch (err) {
    console.error('Error al guardar tiempos:', err)
    $q.notify({ type: 'negative', message: 'Error al guardar configuración de tiempos' })
  }
}

watch([nivelConfig, configSede, configCarrera], () => {
  cargarConfiguracion()
})

watch(gestionConfig, () => {
  cargarTiempos()
})

onMounted(() => {
  cargarConfiguracion()
  cargarTiempos()
  cargarSedes()
  cargarCampus()
  cargarCarreras()
  cargarUsuarios()
  cargarUsuariosDisponibles()
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
.carreras-chip-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  max-width: 350px;
  overflow-x: auto;
  padding-bottom: 4px;
}

/* Scrollbar sutil para el container de chips */
.carreras-chip-container::-webkit-scrollbar {
  height: 4px;
}
.carreras-chip-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}
</style>
