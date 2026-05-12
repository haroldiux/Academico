<template>
  <q-page class="sync-page q-pa-lg">
    <!-- Header -->
    <div class="page-header q-mb-lg">
      <div class="row items-center q-gutter-sm">
        <q-icon name="sync" size="32px" color="indigo" />
        <div>
          <h1 class="page-title q-ma-none">Sincronización Académica</h1>
          <p class="text-caption text-grey-6 q-ma-none">
            Sincroniza datos desde la API de Planning por carrera, sede o materia. Solo visible para
            Super Admin.
          </p>
        </div>
      </div>
    </div>

    <!-- Gestión -->
    <div class="row q-mb-lg items-center q-gutter-md">
      <q-input
        v-model="gestion"
        outlined
        dense
        label="Gestión Académica"
        style="width: 160px"
        hint="Ej: 1-2026"
      />
      <q-chip color="blue-1" text-color="blue-9" icon="info" size="md">
        API: {{ PLANNING_API }}
      </q-chip>
    </div>

    <!-- Tabs de modo -->
    <q-tabs
      v-model="tab"
      dense
      class="text-grey q-mb-md"
      active-color="indigo"
      indicator-color="indigo"
      align="left"
    >
      <q-tab name="carrera" icon="school" label="Por Carrera" no-caps />
      <q-tab name="multiple" icon="checklist" label="Múltiples Carreras" no-caps />
      <q-tab name="sede" icon="location_city" label="Por Sede" no-caps />
      <q-tab name="materia" icon="menu_book" label="Por Materia" no-caps />
      <q-tab name="asignatura" icon="subject" label="Por Asignatura" no-caps />
    </q-tabs>
    <q-separator class="q-mb-lg" />

    <q-tab-panels v-model="tab" animated>
      <!-- ═══════════════════════════════════════════════
           TAB 1: POR CARRERA (sede + carrera individual)
           ═══════════════════════════════════════════════ -->
      <q-tab-panel name="carrera" class="q-pa-none">
        <div class="row q-gutter-lg">
          <!-- Formulario -->
          <q-card flat bordered class="col-12 col-md-4">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">
                <q-icon name="tune" class="q-mr-xs" color="indigo" />
                Configuración
              </div>
              <q-select
                v-model="selSede"
                :options="opcionesSedes"
                option-label="nombre"
                option-value="id"
                emit-value
                map-options
                outlined
                dense
                label="Sede"
                class="q-mb-md"
              />
              <q-select
                v-model="selCarrera"
                :options="opcionesCarreras"
                outlined
                dense
                label="Carrera"
                use-input
                fill-input
                hide-selected
                input-debounce="0"
                @filter="filtrarCarreras"
                class="q-mb-lg"
              >
                <template #no-option>
                  <q-item><q-item-section class="text-grey">Sin resultados</q-item-section></q-item>
                </template>
              </q-select>
              <q-btn
                unelevated
                color="indigo"
                icon="sync"
                label="Sincronizar"
                no-caps
                class="full-width"
                :loading="loadingCarrera"
                :disable="!selSede || !selCarrera"
                @click="syncCarrera"
              />
            </q-card-section>
          </q-card>

          <!-- Resultado -->
          <q-card flat bordered class="col-12 col-md-7" v-if="resultadoCarrera">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">
                <q-icon
                  :name="resultadoCarrera.ok ? 'check_circle' : 'error'"
                  :color="resultadoCarrera.ok ? 'positive' : 'negative'"
                  class="q-mr-xs"
                />
                Resultado — {{ resultadoCarrera.carrera }} / {{ resultadoCarrera.sede }}
              </div>
              <template v-if="resultadoCarrera.ok">
                <div class="row q-col-gutter-md">
                  <div class="col-6 col-sm-3" v-for="(val, key) in statsCarrera" :key="key">
                    <div class="stat-box">
                      <div class="stat-val">{{ val.valor }}</div>
                      <div class="stat-label">{{ val.label }}</div>
                    </div>
                  </div>
                </div>
                <q-chip color="green-1" text-color="green-9" icon="timer" class="q-mt-md">
                  Duración: {{ resultadoCarrera.duracion }}s
                </q-chip>
              </template>
              <q-banner v-else rounded class="bg-red-1 text-red-9">
                <template #avatar><q-icon name="error" color="negative" /></template>
                {{ resultadoCarrera.error }}
              </q-banner>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- ═══════════════════════════════════════════════
           TAB 2: POR SEDE (sincroniza todas las carreras)
           ═══════════════════════════════════════════════ -->
      <q-tab-panel name="sede" class="q-pa-none">
        <div class="row q-gutter-lg">
          <!-- Formulario -->
          <q-card flat bordered class="col-12 col-md-4">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">
                <q-icon name="tune" class="q-mr-xs" color="indigo" />
                Configuración
              </div>
              <q-select
                v-model="selSedeMasivo"
                :options="opcionesSedes"
                option-label="nombre"
                option-value="id"
                emit-value
                map-options
                outlined
                dense
                label="Sede"
                class="q-mb-lg"
              />
              <q-banner rounded class="bg-orange-1 text-orange-9 q-mb-md" dense>
                <template #avatar><q-icon name="warning" color="orange" /></template>
                Sincronizará las {{ CARRERAS.length }} carreras. Puede tardar varios minutos.
              </q-banner>
              <q-btn
                unelevated
                color="indigo"
                icon="sync"
                label="Sincronizar Sede"
                no-caps
                class="full-width"
                :loading="loadingSede"
                :disable="!selSedeMasivo"
                @click="syncSede"
              />
            </q-card-section>
          </q-card>

          <!-- Progreso por carrera -->
          <q-card flat bordered class="col-12 col-md-7" v-if="resultadoSede">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-sm">
                Resultados — {{ nombreSedeMasivo }}
              </div>
              <div class="row items-center q-gutter-sm q-mb-md">
                <q-chip color="green-1" text-color="green-9" icon="check_circle">
                  OK: {{ resultadoSede.resumen.ok }}
                </q-chip>
                <q-chip
                  color="red-1"
                  text-color="red-9"
                  icon="error"
                  v-if="resultadoSede.resumen.error > 0"
                >
                  Error: {{ resultadoSede.resumen.error }}
                </q-chip>
                <q-chip color="blue-1" text-color="blue-9" icon="timer">
                  {{ resultadoSede.duracion }}s total
                </q-chip>
              </div>
              <div class="carreras-grid">
                <div
                  v-for="(res, carrera) in resultadoSede.results"
                  :key="carrera"
                  class="carrera-chip"
                  :class="res.ok ? 'carrera-ok' : 'carrera-err'"
                >
                  <q-icon :name="res.ok ? 'check' : 'close'" size="14px" class="q-mr-xs" />
                  <span class="carrera-sigla">{{ carrera }}</span>
                  <span v-if="res.ok" class="carrera-count">{{ res.stats.total }}</span>
                  <q-tooltip v-if="!res.ok">{{ res.error }}</q-tooltip>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- ═══════════════════════════════════════════════
           TAB 2B: MÚLTIPLES CARRERAS (checkboxes)
           ═══════════════════════════════════════════════ -->
      <q-tab-panel name="multiple" class="q-pa-none">
        <div class="row q-gutter-lg">
          <!-- Config + checkboxes -->
          <q-card flat bordered class="col-12 col-md-5">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">
                <q-icon name="tune" class="q-mr-xs" color="indigo" />
                Configuración
              </div>
              <q-select
                v-model="selSedeMult"
                :options="opcionesSedes"
                option-label="nombre"
                option-value="id"
                emit-value
                map-options
                outlined
                dense
                label="Sede"
                class="q-mb-md"
              />

              <!-- Acciones rápidas -->
              <div class="row q-gutter-xs q-mb-sm">
                <q-btn
                  flat
                  dense
                  size="sm"
                  no-caps
                  label="Seleccionar todas"
                  color="indigo"
                  @click="carrerasMult = [...CARRERAS]"
                />
                <q-btn
                  flat
                  dense
                  size="sm"
                  no-caps
                  label="Limpiar"
                  color="grey"
                  @click="carrerasMult = []"
                />
                <q-chip size="sm" color="indigo-1" text-color="indigo-9">
                  {{ carrerasMult.length }} / {{ CARRERAS.length }}
                </q-chip>
              </div>

              <!-- Grid de checkboxes -->
              <div class="carreras-check-grid q-mb-md">
                <q-checkbox
                  v-for="c in CARRERAS"
                  :key="c"
                  v-model="carrerasMult"
                  :val="c"
                  :label="c"
                  dense
                  color="indigo"
                  class="carrera-check-item"
                />
              </div>

              <q-btn
                unelevated
                color="indigo"
                icon="sync"
                :label="`Sincronizar ${carrerasMult.length} carrera${carrerasMult.length !== 1 ? 's' : ''}`"
                no-caps
                class="full-width"
                :loading="loadingMult"
                :disable="!selSedeMult || carrerasMult.length === 0"
                @click="syncMultiple"
              />
            </q-card-section>
          </q-card>

          <!-- Resultados -->
          <q-card flat bordered class="col-12 col-md-6" v-if="resultadoMult">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-sm">
                Resultados — {{ nombreSedeMult }}
              </div>

              <!-- Progreso mientras corre -->
              <div v-if="loadingMult" class="q-mb-md">
                <div class="text-caption text-grey-6 q-mb-xs">
                  Procesando {{ progMult.actual }} de {{ progMult.total }}...
                </div>
                <q-linear-progress
                  :value="progMult.total > 0 ? progMult.actual / progMult.total : 0"
                  color="indigo"
                  rounded
                  size="8px"
                />
              </div>

              <!-- Resumen final -->
              <div v-if="!loadingMult" class="row items-center q-gutter-sm q-mb-md">
                <q-chip color="green-1" text-color="green-9" icon="check_circle">
                  OK: {{ resultadoMult.resumen.ok }}
                </q-chip>
                <q-chip
                  v-if="resultadoMult.resumen.error > 0"
                  color="red-1"
                  text-color="red-9"
                  icon="error"
                >
                  Error: {{ resultadoMult.resumen.error }}
                </q-chip>
                <q-chip color="blue-1" text-color="blue-9" icon="timer">
                  {{ resultadoMult.duracion }}s total
                </q-chip>
              </div>

              <!-- Chips por carrera -->
              <div class="carreras-grid">
                <div
                  v-for="(res, carrera) in resultadoMult.results"
                  :key="carrera"
                  class="carrera-chip"
                  :class="
                    res.estado === 'ok'
                      ? 'carrera-ok'
                      : res.estado === 'pending'
                        ? 'carrera-pending'
                        : 'carrera-err'
                  "
                >
                  <q-spinner v-if="res.estado === 'pending'" size="12px" class="q-mr-xs" />
                  <q-icon
                    v-else
                    :name="res.estado === 'ok' ? 'check' : 'close'"
                    size="14px"
                    class="q-mr-xs"
                  />
                  <span class="carrera-sigla">{{ carrera }}</span>
                  <span v-if="res.estado === 'ok'" class="carrera-count">{{
                    res.stats?.total ?? 0
                  }}</span>
                  <q-tooltip v-if="res.estado === 'error'">{{ res.error }}</q-tooltip>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- ═══════════════════════════════════════════════
           TAB 3: POR MATERIA (una carrera en todas las sedes)
           ═══════════════════════════════════════════════ -->
      <q-tab-panel name="materia" class="q-pa-none">
        <div class="row q-gutter-lg">
          <!-- Formulario -->
          <q-card flat bordered class="col-12 col-md-4">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">
                <q-icon name="tune" class="q-mr-xs" color="indigo" />
                Configuración
              </div>
              <q-select
                v-model="selCarreraMateria"
                :options="opcionesCarrerasMateria"
                outlined
                dense
                label="Carrera / Materia"
                use-input
                fill-input
                hide-selected
                input-debounce="0"
                @filter="filtrarCarrerasMateria"
                class="q-mb-lg"
              >
                <template #no-option>
                  <q-item><q-item-section class="text-grey">Sin resultados</q-item-section></q-item>
                </template>
              </q-select>
              <q-banner rounded class="bg-blue-1 text-blue-9 q-mb-md" dense>
                <template #avatar><q-icon name="info" color="blue" /></template>
                Sincronizará esta carrera en las {{ SEDES.length }} sedes activas.
              </q-banner>
              <q-btn
                unelevated
                color="indigo"
                icon="sync"
                label="Sincronizar en todas las sedes"
                no-caps
                class="full-width"
                :loading="loadingMateria"
                :disable="!selCarreraMateria"
                @click="syncMateria"
              />
            </q-card-section>
          </q-card>

          <!-- Progreso por sede -->
          <q-card flat bordered class="col-12 col-md-7" v-if="resultadoMateria">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-sm">
                Resultados — {{ resultadoMateria.carrera }}
              </div>
              <div class="row items-center q-gutter-sm q-mb-md">
                <q-chip color="green-1" text-color="green-9" icon="check_circle">
                  OK: {{ resultadoMateria.resumen.ok }}
                </q-chip>
                <q-chip
                  color="red-1"
                  text-color="red-9"
                  icon="error"
                  v-if="resultadoMateria.resumen.error > 0"
                >
                  Error: {{ resultadoMateria.resumen.error }}
                </q-chip>
                <q-chip color="blue-1" text-color="blue-9" icon="timer">
                  {{ resultadoMateria.duracion }}s total
                </q-chip>
              </div>
              <q-list bordered separator dense>
                <q-item v-for="(res, sedeName) in resultadoMateria.results" :key="sedeName" dense>
                  <q-item-section avatar>
                    <q-icon
                      :name="res.ok ? 'check_circle' : 'error'"
                      :color="res.ok ? 'positive' : 'negative'"
                      size="20px"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ sedeName }}</q-item-label>
                    <q-item-label caption v-if="res.ok">
                      {{ res.stats.total }} registros · {{ res.stats.grupos }} grupos ·
                      {{ res.duracion }}s
                    </q-item-label>
                    <q-item-label caption class="text-negative" v-else>{{
                      res.error
                    }}</q-item-label>
                  </q-item-section>
                  <q-item-section side v-if="res.ok">
                    <q-chip dense size="sm" color="blue-1" text-color="blue-9">
                      {{ res.stats.total }} reg.
                    </q-chip>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- ═══════════════════════════════════════════════
           TAB 5: POR ASIGNATURA (sede + carrera + asignatura específica)
           ═══════════════════════════════════════════════ -->
      <q-tab-panel name="asignatura" class="q-pa-none">
        <div class="row q-gutter-lg">
          <!-- Formulario -->
          <q-card flat bordered class="col-12 col-md-4">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">
                <q-icon name="tune" class="q-mr-xs" color="indigo" />
                Configuración
              </div>
              <q-select
                v-model="selSedeAsignatura"
                :options="opcionesSedes"
                option-label="nombre"
                option-value="id"
                emit-value
                map-options
                outlined
                dense
                label="Sede"
                class="q-mb-md"
              />
              <q-select
                v-model="selCarreraAsignatura"
                :options="opcionesCarrerasAsignatura"
                outlined
                dense
                label="Carrera"
                use-input
                fill-input
                hide-selected
                input-debounce="0"
                @filter="filtrarCarrerasAsignatura"
                class="q-mb-md"
              >
                <template #no-option>
                  <q-item><q-item-section class="text-grey">Sin resultados</q-item-section></q-item>
                </template>
              </q-select>
              <q-select
                v-model="selPlanAsignatura"
                :options="[
                  { label: 'Malla Nueva (N)', value: 'N' },
                  { label: 'Malla Antigua (A)', value: 'A' },
                ]"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                outlined
                dense
                label="Plan de Malla"
                class="q-mb-md"
                :disable="!selSedeAsignatura || !selCarreraAsignatura"
              />
              <q-select
                v-model="selAsignatura"
                :options="opcionesAsignaturas"
                option-label="nombre"
                option-value="codigo"
                emit-value
                map-options
                outlined
                dense
                label="Asignatura"
                clearable
                input-debounce="200"
                class="q-mb-lg"
                :disable="!selSedeAsignatura || !selCarreraAsignatura || loadingAsignaturas"
              >
                <template #no-option>
                  <q-item><q-item-section class="text-grey">Sin resultados</q-item-section></q-item>
                </template>
                <template #loading>
                  <q-item
                    ><q-item-section class="text-grey"
                      >Cargando asignaturas...</q-item-section
                    ></q-item
                  >
                </template>
              </q-select>
              <q-btn
                unelevated
                color="indigo"
                icon="sync"
                label="Sincronizar Asignatura"
                no-caps
                class="full-width"
                :loading="loadingAsignatura"
                :disable="!selSedeAsignatura || !selCarreraAsignatura || !selAsignatura"
                @click="syncAsignatura"
              />
            </q-card-section>
          </q-card>

          <!-- Resultado -->
          <q-card flat bordered class="col-12 col-md-7" v-if="resultadoAsignatura">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">
                <q-icon
                  :name="resultadoAsignatura.ok ? 'check_circle' : 'error'"
                  :color="resultadoAsignatura.ok ? 'positive' : 'negative'"
                  class="q-mr-xs"
                />
                Resultado — {{ resultadoAsignatura.codigo_asignatura }} /
                {{ resultadoAsignatura.carrera }} / {{ resultadoAsignatura.sede }}
              </div>
              <template v-if="resultadoAsignatura.ok">
                <div class="row q-col-gutter-md">
                  <div class="col-6 col-sm-3" v-for="(val, key) in statsAsignatura" :key="key">
                    <div class="stat-box">
                      <div class="stat-val">{{ val.valor }}</div>
                      <div class="stat-label">{{ val.label }}</div>
                    </div>
                  </div>
                </div>
                <q-chip color="green-1" text-color="green-9" icon="timer" class="q-mt-md">
                  Duración: {{ resultadoAsignatura.duracion }}s
                </q-chip>
              </template>
              <q-banner v-else rounded class="bg-red-1 text-red-9">
                <template #avatar><q-icon name="error" color="negative" /></template>
                {{ resultadoAsignatura.error }}
              </q-banner>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- ═══════════════════════════════════════════════
         HISTORIAL DE SINCRONIZACIONES
         ═══════════════════════════════════════════════ -->
    <q-card flat bordered class="q-mt-xl">
      <q-card-section class="row items-center justify-between q-pb-none">
        <div class="text-subtitle1 text-weight-bold">
          <q-icon name="history" color="indigo" class="q-mr-xs" />
          Historial de Sincronizaciones
        </div>
        <q-btn
          flat
          dense
          icon="refresh"
          color="indigo"
          label="Actualizar"
          no-caps
          @click="cargarLogs"
        />
      </q-card-section>

      <q-card-section class="q-pt-sm">
        <!-- Filtros -->
        <div class="row q-gutter-sm q-mb-md">
          <q-select
            v-model="filtroSede"
            :options="[{ id: null, nombre: 'Todas' }, ...opcionesSedes]"
            option-label="nombre"
            option-value="id"
            emit-value
            map-options
            outlined
            dense
            label="Filtrar sede"
            style="width: 160px"
            clearable
          />
          <q-select
            v-model="filtroCarrera"
            :options="['Todas', ...CARRERAS]"
            outlined
            dense
            label="Filtrar carrera"
            style="width: 160px"
            clearable
          />
          <q-select
            v-model="filtroModo"
            :options="[
              { label: 'Todos', value: null },
              { label: 'Por Carrera', value: 'carrera' },
              { label: 'Por Sede', value: 'sede' },
              { label: 'Por Materia', value: 'materia' },
              { label: 'Por Asignatura', value: 'asignatura' },
            ]"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            outlined
            dense
            label="Modo"
            style="width: 160px"
            clearable
          />
        </div>

        <!-- Tabla -->
        <q-table
          :rows="logs"
          :columns="columnas"
          row-key="id"
          dense
          flat
          :loading="loadingLogs"
          :rows-per-page-options="[20, 50, 100]"
          rows-per-page-label="Filas"
          no-data-label="Sin registros de sincronización"
        >
          <template #body-cell-estado="props">
            <q-td :props="props">
              <q-chip
                dense
                size="sm"
                :color="
                  props.value === 'ok'
                    ? 'green-1'
                    : props.value === 'parcial'
                      ? 'orange-1'
                      : 'red-1'
                "
                :text-color="
                  props.value === 'ok'
                    ? 'green-9'
                    : props.value === 'parcial'
                      ? 'orange-9'
                      : 'red-9'
                "
                :icon="
                  props.value === 'ok'
                    ? 'check_circle'
                    : props.value === 'parcial'
                      ? 'warning'
                      : 'error'
                "
              >
                {{ props.value === 'ok' ? 'OK' : props.value === 'parcial' ? 'Parcial' : 'Error' }}
              </q-chip>
            </q-td>
          </template>
          <template #body-cell-modo="props">
            <q-td :props="props">
              <q-chip
                dense
                size="sm"
                color="blue-1"
                text-color="blue-9"
                :icon="modoIcon(props.value)"
              >
                {{ props.value }}
              </q-chip>
            </q-td>
          </template>
          <template #body-cell-error_mensaje="props">
            <q-td :props="props">
              <span v-if="props.value" class="text-negative text-caption">
                {{ props.value.substring(0, 60) }}...
                <q-tooltip>{{ props.value }}</q-tooltip>
              </span>
              <span v-else class="text-grey">—</span>
            </q-td>
          </template>

          <!-- Columna acciones: botón Ver Cambios -->
          <template #body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                v-if="props.row.has_diff"
                flat
                dense
                size="sm"
                no-caps
                :color="props.row.total_cambios > 0 ? 'indigo' : 'grey'"
                :icon="props.row.total_cambios > 0 ? 'difference' : 'check_circle'"
                :label="
                  props.row.total_cambios > 0 ? `${props.row.total_cambios} cambios` : 'Sin cambios'
                "
                @click="verDiff(props.row.id)"
              />
              <span v-else class="text-grey text-caption">—</span>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>

  <!-- ═══════════════════════════════════════════════════════════════════════
       DIALOG: DIFF DE SINCRONIZACIÓN
       ═══════════════════════════════════════════════════════════════════════ -->
  <q-dialog v-model="showDiff" maximized>
    <q-card>
      <q-card-section class="row items-center q-pb-none bg-indigo text-white">
        <q-icon name="difference" size="24px" class="q-mr-sm" />
        <div>
          <div class="text-subtitle1 text-weight-bold">Cambios de Sincronización</div>
          <div class="text-caption" v-if="diffData">
            {{ diffData.carrera }} — {{ diffData.sede }} — {{ diffData.fecha }}
          </div>
        </div>
        <q-space />
        <q-btn flat round icon="close" color="white" v-close-popup />
      </q-card-section>

      <q-card-section v-if="loadingDiff" class="text-center q-pa-xl">
        <q-spinner color="indigo" size="40px" />
        <div class="q-mt-sm text-grey">Cargando cambios...</div>
      </q-card-section>

      <q-card-section v-else-if="diffData" class="q-pa-md">
        <!-- Resumen de cambios -->
        <div class="row q-gutter-sm q-mb-lg">
          <q-chip
            v-for="(val, key) in resumenChips"
            :key="key"
            :color="val.color + '-1'"
            :text-color="val.color + '-9'"
            :icon="val.icon"
            dense
          >
            {{ val.label }}: {{ val.valor }}
          </q-chip>
          <q-chip
            v-if="diffData.diff?.resumen?.total_cambios === 0"
            color="green-1"
            text-color="green-9"
            icon="check_circle"
          >
            Sin cambios detectados
          </q-chip>
        </div>

        <!-- Tabs de categorías del diff -->
        <q-tabs
          v-model="tabDiff"
          dense
          active-color="indigo"
          indicator-color="indigo"
          align="left"
          class="q-mb-md"
        >
          <q-tab
            name="grupos_nuevos"
            v-if="diffData.diff?.grupos_nuevos?.length"
            :label="`Grupos nuevos (${diffData.diff.grupos_nuevos.length})`"
            icon="add_circle"
            no-caps
          />
          <q-tab
            name="docente_cambio"
            v-if="diffData.diff?.grupos_docente_cambio?.length"
            :label="`Cambios docente (${diffData.diff.grupos_docente_cambio.length})`"
            icon="swap_horiz"
            no-caps
          />
          <q-tab
            name="horario_cambio"
            v-if="diffData.diff?.grupos_horario_cambio?.length"
            :label="`Cambios horario (${diffData.diff.grupos_horario_cambio.length})`"
            icon="schedule"
            no-caps
          />
          <q-tab
            name="horarios_eliminados"
            v-if="diffData.diff?.horarios_eliminados?.length"
            :label="`Horarios eliminados (${diffData.diff.horarios_eliminados.length})`"
            icon="delete"
            no-caps
          />
          <q-tab
            name="grupos_eliminados"
            v-if="diffData.diff?.grupos_eliminados?.length"
            :label="`Grupos eliminados (${diffData.diff.grupos_eliminados.length})`"
            icon="remove_circle"
            no-caps
          />
          <q-tab
            name="docentes_nuevos"
            v-if="diffData.diff?.docentes_nuevos?.length"
            :label="`Docentes nuevos (${diffData.diff.docentes_nuevos.length})`"
            icon="person_add"
            no-caps
          />
          <q-tab
            name="asignaturas_nuevas"
            v-if="diffData.diff?.asignaturas_nuevas?.length"
            :label="`Asignaturas nuevas (${diffData.diff.asignaturas_nuevas.length})`"
            icon="library_add"
            no-caps
          />
          <q-tab
            name="grupos_inactivados"
            v-if="diffData.diff?.grupos_inactivados?.length"
            :label="`Inactivados (${diffData.diff.grupos_inactivados.length})`"
            icon="pause_circle"
            no-caps
          />
          <q-tab
            name="duplicados_fusionados"
            v-if="diffData.diff?.duplicados_fusionados?.length"
            :label="`Fusionados (${diffData.diff.duplicados_fusionados.length})`"
            icon="merge"
            no-caps
          />
          <q-tab
            name="asignaturas_desvinculadas"
            v-if="diffData.diff?.asignaturas_desvinculadas?.length"
            :label="`Desvinculadas (${diffData.diff.asignaturas_desvinculadas.length})`"
            icon="link_off"
            no-caps
          />
          <q-tab
            name="conflictos_locales"
            v-if="diffData.diff?.conflictos_locales?.length"
            :label="`Conflictos (${diffData.diff.conflictos_locales.length})`"
            icon="warning"
            no-caps
          />
        </q-tabs>

        <q-tab-panels v-model="tabDiff" animated>
          <!-- Grupos nuevos -->
          <q-tab-panel name="grupos_nuevos" class="q-pa-none">
            <q-table
              :rows="diffData.diff?.grupos_nuevos ?? []"
              :columns="colsGruposNuevos"
              row-key="grupo"
              dense
              flat
              :rows-per-page-options="[0]"
              hide-pagination
            >
              <template #body-cell-docente="props">
                <q-td :props="props">
                  <q-chip dense size="sm" color="green-1" text-color="green-9" icon="person">
                    {{ props.value }}
                  </q-chip>
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <!-- Cambios de docente -->
          <q-tab-panel name="docente_cambio" class="q-pa-none">
            <q-table
              :rows="diffData.diff?.grupos_docente_cambio ?? []"
              :columns="colsDocenteCambio"
              row-key="grupo"
              dense
              flat
              :rows-per-page-options="[0]"
              hide-pagination
            >
              <template #body-cell-docente_antes="props">
                <q-td :props="props">
                  <q-chip dense size="sm" color="red-1" text-color="red-9" icon="person_off">
                    {{ props.value || 'Sin asignar' }}
                  </q-chip>
                </q-td>
              </template>
              <template #body-cell-docente_despues="props">
                <q-td :props="props">
                  <q-chip dense size="sm" color="green-1" text-color="green-9" icon="person">
                    {{ props.value || 'Sin asignar' }}
                  </q-chip>
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <!-- Cambios de horario -->
          <q-tab-panel name="horario_cambio" class="q-pa-none">
            <q-table
              :rows="diffData.diff?.grupos_horario_cambio ?? []"
              :columns="colsHorarioCambio"
              row-key="grupo"
              dense
              flat
              :rows-per-page-options="[0]"
              hide-pagination
            >
              <template #body-cell-tipo="props">
                <q-td :props="props">
                  <q-chip
                    dense
                    size="sm"
                    :color="props.value === 'nuevo' ? 'blue-1' : 'orange-1'"
                    :text-color="props.value === 'nuevo' ? 'blue-9' : 'orange-9'"
                    :icon="props.value === 'nuevo' ? 'add' : 'edit'"
                  >
                    {{ props.value === 'nuevo' ? 'Nuevo' : 'Modificado' }}
                  </q-chip>
                </q-td>
              </template>
              <template #body-cell-antes="props">
                <q-td :props="props">
                  <span v-if="props.value" class="text-red-8">{{ props.value }}</span>
                  <span v-else class="text-grey">—</span>
                </q-td>
              </template>
              <template #body-cell-despues="props">
                <q-td :props="props">
                  <span class="text-green-8 text-weight-medium">{{ props.value }}</span>
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <!-- Horarios eliminados -->
          <q-tab-panel name="horarios_eliminados" class="q-pa-none">
            <q-table
              :rows="diffData.diff?.horarios_eliminados ?? []"
              :columns="colsHorariosEliminados"
              row-key="grupo"
              dense
              flat
              :rows-per-page-options="[0]"
              hide-pagination
            />
          </q-tab-panel>

          <!-- Grupos eliminados -->
          <q-tab-panel name="grupos_eliminados" class="q-pa-none">
            <q-table
              :rows="diffData.diff?.grupos_eliminados ?? []"
              :columns="colsGruposNuevos"
              row-key="grupo"
              dense
              flat
              :rows-per-page-options="[0]"
              hide-pagination
            >
              <template #body-cell-docente="props">
                <q-td :props="props">
                  <q-chip dense size="sm" color="red-1" text-color="red-9" icon="person_off">
                    {{ props.value }}
                  </q-chip>
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <!-- Docentes nuevos -->
          <q-tab-panel name="docentes_nuevos" class="q-pa-none">
            <q-list bordered separator>
              <q-item v-for="d in diffData.diff?.docentes_nuevos ?? []" :key="d" dense>
                <q-item-section avatar>
                  <q-icon name="person_add" color="green" />
                </q-item-section>
                <q-item-section>{{ d }}</q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <!-- Asignaturas nuevas -->
          <q-tab-panel name="asignaturas_nuevas" class="q-pa-none">
            <q-list bordered separator>
              <q-item v-for="a in diffData.diff?.asignaturas_nuevas ?? []" :key="a" dense>
                <q-item-section avatar>
                  <q-icon name="library_add" color="blue" />
                </q-item-section>
                <q-item-section>{{ a }}</q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <!-- Grupos inactivados -->
          <q-tab-panel name="grupos_inactivados" class="q-pa-none">
            <q-banner class="bg-grey-2 q-mb-sm" dense>
              <template #avatar><q-icon name="info" color="grey-7" /></template>
              Estos grupos ya no están en la API. Se marcaron como INACTIVOS y no aparecerán en el
              sistema.
            </q-banner>
            <q-table
              :rows="diffData.diff?.grupos_inactivados ?? []"
              :columns="colsGruposInactivados"
              row-key="id"
              dense
              flat
              :rows-per-page-options="[0]"
              hide-pagination
            />
          </q-tab-panel>

          <!-- Duplicados fusionados -->
          <q-tab-panel name="duplicados_fusionados" class="q-pa-none">
            <q-banner class="bg-purple-1 q-mb-sm" dense>
              <template #avatar><q-icon name="merge" color="purple" /></template>
              Se detectaron asignaturas duplicadas. El banco de preguntas fue migrado al registro
              correcto.
            </q-banner>
            <q-table
              :rows="diffData.diff?.duplicados_fusionados ?? []"
              :columns="colsDuplicadosFusionados"
              row-key="correcta_id"
              dense
              flat
              :rows-per-page-options="[0]"
              hide-pagination
            >
              <template #body-cell-preguntas_migradas="props">
                <q-td :props="props">
                  <q-chip dense size="sm" color="purple-1" text-color="purple-9" icon="quiz">
                    {{ props.value }} preguntas
                  </q-chip>
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <!-- Asignaturas desvinculadas -->
          <q-tab-panel name="asignaturas_desvinculadas" class="q-pa-none">
            <q-banner class="bg-brown-1 q-mb-sm" dense>
              <template #avatar><q-icon name="link_off" color="brown" /></template>
              Estas asignaturas no tienen grupos activos en esta carrera/sede. Se desvincularon del
              plan pero su contenido (banco de preguntas, documentación) se conserva.
            </q-banner>
            <q-list bordered separator>
              <q-item v-for="a in diffData.diff?.asignaturas_desvinculadas ?? []" :key="a.id" dense>
                <q-item-section avatar>
                  <q-icon name="link_off" color="brown" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ a.nombre }}</q-item-label>
                  <q-item-label caption>{{ a.codigo }} · Plan {{ a.plan ?? 'N' }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <!-- Conflictos locales -->
          <q-tab-panel name="conflictos_locales" class="q-pa-none">
            <q-banner class="bg-deep-orange-1 q-mb-sm" dense>
              <template #avatar><q-icon name="warning" color="deep-orange" /></template>
              Estos grupos fueron modificados localmente pero la API tiene datos diferentes. Decide
              qué versión conservar.
            </q-banner>
            <q-table
              :rows="diffData.diff?.conflictos_locales ?? []"
              :columns="colsConflictos"
              row-key="grupo_id"
              dense
              flat
              :rows-per-page-options="[0]"
              hide-pagination
            >
              <template #body-cell-valor_local="props">
                <q-td :props="props">
                  <q-chip dense size="sm" color="blue-1" text-color="blue-9" icon="edit">
                    {{ props.value }}
                  </q-chip>
                </q-td>
              </template>
              <template #body-cell-valor_api="props">
                <q-td :props="props">
                  <q-chip dense size="sm" color="green-1" text-color="green-9" icon="cloud">
                    {{ props.value }}
                  </q-chip>
                </q-td>
              </template>
              <template #body-cell-acciones="props">
                <q-td :props="props">
                  <div class="row q-gutter-xs no-wrap">
                    <q-btn
                      dense
                      size="xs"
                      unelevated
                      color="green"
                      label="Aceptar API"
                      @click="resolverConflicto(props.row, 'aceptar_api')"
                    />
                    <q-btn
                      dense
                      size="xs"
                      unelevated
                      color="blue-grey"
                      label="Mantener local"
                      @click="resolverConflicto(props.row, 'mantener_local')"
                    />
                  </div>
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()

// ─── Constantes ─────────────────────────────────────────────────────────────

const PLANNING_API = 'http://181.188.185.211:9098/api/Grupos/listar/'

const CARRERAS = [
  'CARADM',
  'CARAYE',
  'CARBYF',
  'CARCAD',
  'CARCCP',
  'CARCIC',
  'CARCNE',
  'CARCPU',
  'CARCSO',
  'CARDER',
  'CARECO',
  'CARELE',
  'CARENL',
  'CARFIS',
  'CARFON',
  'CARIBI',
  'CARICO',
  'CARMED',
  'CARNYD',
  'CARODO',
  'CARPRO',
  'CARSIS',
  'CARSON',
  'CARVET',
]

const SEDES = [
  { id: 1, nombre: 'Cochabamba' },
  { id: 2, nombre: 'Caranavi' },
  { id: 3, nombre: 'Cobija' },
  { id: 4, nombre: 'El Alto' },
  { id: 5, nombre: 'Ivirgarzama' },
  { id: 6, nombre: 'La Paz' },
  { id: 8, nombre: 'Puerto Quijarro' },
  { id: 9, nombre: 'Santa Cruz' },
  { id: 12, nombre: 'Guayaramerin' },
]

// ─── Estado global ───────────────────────────────────────────────────────────

const tab = ref('carrera')
const gestion = ref('1-2026')

// ─── Tab: Por Carrera ────────────────────────────────────────────────────────

const selSede = ref(1)
const selCarrera = ref('CARSIS')
const loadingCarrera = ref(false)
const resultadoCarrera = ref(null)

const opcionesSedes = ref([...SEDES])
const opcionesCarreras = ref([...CARRERAS])

function filtrarCarreras(val, update) {
  update(() => {
    const needle = val.toLowerCase()
    opcionesCarreras.value = needle
      ? CARRERAS.filter((c) => c.toLowerCase().includes(needle))
      : [...CARRERAS]
  })
}

const statsCarrera = computed(() => {
  if (!resultadoCarrera.value?.stats) return {}
  const s = resultadoCarrera.value.stats
  return {
    total: { label: 'Registros', valor: s.total ?? 0 },
    docentes: { label: 'Docentes', valor: s.docentes ?? 0 },
    grupos: { label: 'Grupos', valor: s.grupos ?? 0 },
    horarios: { label: 'Horarios', valor: s.horarios ?? 0 },
  }
})

async function syncCarrera() {
  loadingCarrera.value = true
  resultadoCarrera.value = null
  try {
    const res = await api.post('/sync/carrera', {
      gestion: gestion.value,
      sede_id: selSede.value,
      carrera: selCarrera.value,
    })
    resultadoCarrera.value = res.data
    $q.notify({
      type: res.data.ok ? 'positive' : 'negative',
      message: res.data.ok ? 'Sincronización exitosa' : 'Error en sincronización',
    })
    cargarLogs()
  } catch (e) {
    resultadoCarrera.value = {
      ok: false,
      error: e.response?.data?.message || e.message,
      carrera: selCarrera.value,
      sede: '',
    }
    $q.notify({ type: 'negative', message: 'Error: ' + (e.response?.data?.message || e.message) })
  } finally {
    loadingCarrera.value = false
  }
}

// ─── Tab: Múltiples Carreras ─────────────────────────────────────────────────

const selSedeMult = ref(1)
const carrerasMult = ref([])
const loadingMult = ref(false)
const resultadoMult = ref(null)
const progMult = ref({ actual: 0, total: 0 })

const nombreSedeMult = computed(() => SEDES.find((s) => s.id === selSedeMult.value)?.nombre ?? '—')

async function syncMultiple() {
  if (!carrerasMult.value.length) return
  loadingMult.value = true
  progMult.value = { actual: 0, total: carrerasMult.value.length }

  // Inicializar resultado con estado "pending" para cada carrera seleccionada
  resultadoMult.value = {
    resumen: { ok: 0, error: 0 },
    duracion: 0,
    results: Object.fromEntries(carrerasMult.value.map((c) => [c, { estado: 'pending' }])),
  }

  const inicio = Date.now()
  let ok = 0,
    err = 0

  for (const carrera of carrerasMult.value) {
    try {
      const res = await api.post('/sync/carrera', {
        gestion: gestion.value,
        sede_id: selSedeMult.value,
        carrera,
      })
      resultadoMult.value.results[carrera] = {
        estado: res.data.ok ? 'ok' : 'error',
        stats: res.data.stats,
        error: res.data.error,
      }
      if (res.data.ok) ok++
      else err++
    } catch (e) {
      resultadoMult.value.results[carrera] = {
        estado: 'error',
        error: e.response?.data?.message || e.message,
      }
      err++
    }
    progMult.value.actual++
  }

  resultadoMult.value.resumen = { ok, error: err }
  resultadoMult.value.duracion = ((Date.now() - inicio) / 1000).toFixed(1)
  loadingMult.value = false

  $q.notify({
    type: err === 0 ? 'positive' : ok > 0 ? 'warning' : 'negative',
    message: `Sync completado: ${ok} OK / ${err} errores`,
  })
  cargarLogs()
}

// ─── Tab: Por Sede ───────────────────────────────────────────────────────────

const selSedeMasivo = ref(1)
const loadingSede = ref(false)
const resultadoSede = ref(null)

const nombreSedeMasivo = computed(
  () => SEDES.find((s) => s.id === selSedeMasivo.value)?.nombre ?? '—',
)

async function syncSede() {
  loadingSede.value = true
  resultadoSede.value = null
  try {
    const res = await api.post('/sync/sede', {
      gestion: gestion.value,
      sede_id: selSedeMasivo.value,
    })
    resultadoSede.value = res.data
    $q.notify({
      type: res.data.ok ? 'positive' : 'warning',
      message: `Sede sincronizada: ${res.data.resumen.ok} OK / ${res.data.resumen.error} errores`,
    })
    cargarLogs()
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error: ' + (e.response?.data?.message || e.message) })
  } finally {
    loadingSede.value = false
  }
}

// ─── Tab: Por Materia ────────────────────────────────────────────────────────

const selCarreraMateria = ref('CARSIS')
const opcionesCarrerasMateria = ref([...CARRERAS])
const loadingMateria = ref(false)
const resultadoMateria = ref(null)

function filtrarCarrerasMateria(val, update) {
  update(() => {
    const needle = val.toLowerCase()
    opcionesCarrerasMateria.value = needle
      ? CARRERAS.filter((c) => c.toLowerCase().includes(needle))
      : [...CARRERAS]
  })
}

async function syncMateria() {
  loadingMateria.value = true
  resultadoMateria.value = null
  try {
    const res = await api.post('/sync/materia', {
      gestion: gestion.value,
      carrera: selCarreraMateria.value,
    })
    resultadoMateria.value = res.data
    $q.notify({
      type: res.data.ok ? 'positive' : 'warning',
      message: `Materia sincronizada: ${res.data.resumen.ok} OK / ${res.data.resumen.error} errores`,
    })
    cargarLogs()
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error: ' + (e.response?.data?.message || e.message) })
  } finally {
    loadingMateria.value = false
  }
}

// ─── Tab: Por Asignatura ──────────────────────────────────────────────────────

const selSedeAsignatura = ref(1)
const selCarreraAsignatura = ref('CARMED')
const carrerasAsignaturaMap = ref(new Map()) // sigla → {id, sigla, nombre}
const carrerasAsignaturaBase = ref([...CARRERAS]) // fuente de verdad para la sede actual
const opcionesCarrerasAsignatura = ref([...CARRERAS])
const selPlanAsignatura = ref('N')
const selAsignatura = ref(null)
const opcionesAsignaturas = ref([])
const todasAsignaturas = ref([]) // Fuente de verdad (sin filtrar)
const loadingAsignaturas = ref(false)
const loadingAsignatura = ref(false)
const resultadoAsignatura = ref(null)

function filtrarCarrerasAsignatura(val, update) {
  update(() => {
    const needle = val.toLowerCase()
    opcionesCarrerasAsignatura.value = needle
      ? carrerasAsignaturaBase.value.filter((c) => c.toLowerCase().includes(needle))
      : [...carrerasAsignaturaBase.value]
  })
}

async function cargarCarrerasAsignaturaPorSede() {
  if (!selSedeAsignatura.value) {
    carrerasAsignaturaBase.value = []
    carrerasAsignaturaMap.value = new Map()
    opcionesCarrerasAsignatura.value = []
    selCarreraAsignatura.value = null
    return
  }

  try {
    const res = await api.get('/carreras', {
      params: { sede_id: selSedeAsignatura.value },
    })
    const carreras = Array.isArray(res.data) ? res.data : (res.data.data || [])

    if (carreras.length > 0) {
      const map = new Map()
      const siglas = carreras
        .filter((c) => c.sigla)
        .map((c) => {
          map.set(c.sigla.toUpperCase(), c)
          return c.sigla.toUpperCase()
        })
        .sort()
      carrerasAsignaturaMap.value = map
      carrerasAsignaturaBase.value = siglas
      opcionesCarrerasAsignatura.value = [...siglas]
    } else {
      // Fallback: si no hay carreras para esta sede, usar lista estática
      carrerasAsignaturaMap.value = new Map()
      carrerasAsignaturaBase.value = [...CARRERAS]
      opcionesCarrerasAsignatura.value = [...CARRERAS]
    }
  } catch (e) {
    console.warn('[Sync] Error cargando carreras por sede:', e.message)
    carrerasAsignaturaMap.value = new Map()
    carrerasAsignaturaBase.value = [...CARRERAS]
    opcionesCarrerasAsignatura.value = [...CARRERAS]
  }
}

async function cargarAsignaturas() {
  if (!selSedeAsignatura.value || !selCarreraAsignatura.value) {
    opcionesAsignaturas.value = []
    todasAsignaturas.value = []
    selAsignatura.value = null
    return
  }

  loadingAsignaturas.value = true
  try {
    // Endpoint externo: obtiene las materias del plan seleccionado
    const params = {
      gestion: gestion.value,
      carrera: selCarreraAsignatura.value.toLowerCase(),
      sede: selSedeAsignatura.value,
      plan_estudios: selPlanAsignatura.value || 'N',
    }
    console.log('[Sync] Cargando asignaturas con params:', params)

    const res = await api.get('/grupos-externo/plan-n', { params })
    console.log('[Sync] Respuesta plan-n:', res.data)

    const data = res.data?.data || res.data || []
    console.log('[Sync] Datos recibidos:', data.length, 'items')

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[Sync] No se recibieron asignaturas del endpoint externo')
      // Fallback: intentar cargar asignaturas locales de esta carrera/sede
      try {
        const carreraObj = carrerasAsignaturaMap.value.get(selCarreraAsignatura.value)
        const carreraId = carreraObj?.id || selCarreraAsignatura.value
        const localRes = await api.get('/asignaturas', {
          params: {
            carrera_id: carreraId,
            sede_id: selSedeAsignatura.value,
          },
        })
        const localData = localRes.data?.data || localRes.data || []
        console.log('[Sync] Fallback locales:', localData.length, 'items')
        const lista = localData.map((m) => ({
          codigo: m.codigo,
          nombre: `${m.codigo} — ${m.nombre}`,
          semestre: m.semestre,
          plan_estudios: m.plan_estudios || 'N',
        }))
        todasAsignaturas.value = lista
        opcionesAsignaturas.value = [...lista]
      } catch (fallbackErr) {
        console.error('[Sync] Fallback también falló:', fallbackErr)
        opcionesAsignaturas.value = []
        todasAsignaturas.value = []
      }
      return
    }

    const lista = data.map((m) => ({
      codigo: m.codigo,
      nombre: `${m.codigo} — ${m.nombre}`,
      semestre: m.semestre,
      plan_estudios: m.plan_estudios || 'N',
    }))

    todasAsignaturas.value = lista
    opcionesAsignaturas.value = [...lista]
    console.log('[Sync] Asignaturas cargadas:', lista.length)
  } catch (e) {
    console.error('[Sync] Error cargando asignaturas:', e)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar asignaturas: ' + (e.response?.data?.message || e.message),
    })
    opcionesAsignaturas.value = []
    todasAsignaturas.value = []
  } finally {
    loadingAsignaturas.value = false
  }
}

const statsAsignatura = computed(() => {
  if (!resultadoAsignatura.value?.stats) return {}
  const s = resultadoAsignatura.value.stats
  return {
    total: { label: 'Registros', valor: s.total ?? 0 },
    docentes: { label: 'Docentes', valor: s.docentes ?? 0 },
    grupos: { label: 'Grupos', valor: s.grupos ?? 0 },
    horarios: { label: 'Horarios', valor: s.horarios ?? 0 },
  }
})

async function syncAsignatura() {
  loadingAsignatura.value = true
  resultadoAsignatura.value = null
  try {
    const res = await api.post('/sync/asignatura', {
      gestion: gestion.value,
      sede_id: selSedeAsignatura.value,
      carrera: selCarreraAsignatura.value,
      codigo_asignatura: selAsignatura.value,
      plan_estudios: selPlanAsignatura.value || 'N',
    })
    resultadoAsignatura.value = res.data
    $q.notify({
      type: res.data.ok ? 'positive' : 'negative',
      message: res.data.ok ? 'Asignatura sincronizada exitosamente' : 'Error en sincronización',
    })
    cargarLogs()
  } catch (e) {
    resultadoAsignatura.value = {
      ok: false,
      error: e.response?.data?.message || e.message,
      codigo_asignatura: selAsignatura.value,
      carrera: selCarreraAsignatura.value,
      sede: '',
    }
    $q.notify({ type: 'negative', message: 'Error: ' + (e.response?.data?.message || e.message) })
  } finally {
    loadingAsignatura.value = false
  }
}

// ─── Historial ───────────────────────────────────────────────────────────────

const logs = ref([])
const loadingLogs = ref(false)
const filtroSede = ref(null)
const filtroCarrera = ref(null)
const filtroModo = ref(null)

const columnas = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'sede', label: 'Sede', field: 'sede', align: 'left', sortable: true },
  { name: 'carrera', label: 'Carrera', field: 'carrera', align: 'left', sortable: true },
  { name: 'gestion', label: 'Gestión', field: 'gestion', align: 'center', sortable: true },
  { name: 'modo', label: 'Modo', field: 'modo', align: 'center', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  {
    name: 'total_registros',
    label: 'Registros',
    field: 'total_registros',
    align: 'center',
    sortable: true,
  },
  {
    name: 'grupos_creados',
    label: 'Grupos',
    field: 'grupos_creados',
    align: 'center',
    sortable: true,
  },
  {
    name: 'duracion_segundos',
    label: 'Dur. (s)',
    field: 'duracion_segundos',
    align: 'center',
    sortable: true,
  },
  { name: 'usuario', label: 'Usuario', field: 'usuario', align: 'left', sortable: false },
  { name: 'error_mensaje', label: 'Error', field: 'error_mensaje', align: 'left', sortable: false },
  { name: 'acciones', label: 'Cambios', field: 'acciones', align: 'center', sortable: false },
]

// ─── Diff dialog ─────────────────────────────────────────────────────────────
const showDiff = ref(false)
const loadingDiff = ref(false)
const diffData = ref(null)
const tabDiff = ref('grupos_nuevos')

const resumenChips = computed(() => {
  const r = diffData.value?.diff?.resumen
  if (!r) return {}
  const chips = {}
  if (r.grupos_nuevos)
    chips.grupos_nuevos = {
      label: 'Grupos nuevos',
      valor: r.grupos_nuevos,
      color: 'green',
      icon: 'add_circle',
    }
  if (r.grupos_eliminados)
    chips.grupos_eliminados = {
      label: 'Grupos eliminados',
      valor: r.grupos_eliminados,
      color: 'red',
      icon: 'remove_circle',
    }
  if (r.cambios_docente)
    chips.cambios_docente = {
      label: 'Cambios docente',
      valor: r.cambios_docente,
      color: 'orange',
      icon: 'swap_horiz',
    }
  if (r.cambios_horario)
    chips.cambios_horario = {
      label: 'Cambios horario',
      valor: r.cambios_horario,
      color: 'blue',
      icon: 'schedule',
    }
  if (r.horarios_eliminados)
    chips.horarios_eliminados = {
      label: 'Horarios eliminados',
      valor: r.horarios_eliminados,
      color: 'red',
      icon: 'delete',
    }
  if (r.docentes_nuevos)
    chips.docentes_nuevos = {
      label: 'Docentes nuevos',
      valor: r.docentes_nuevos,
      color: 'teal',
      icon: 'person_add',
    }
  if (r.asignaturas_nuevas)
    chips.asignaturas_nuevas = {
      label: 'Asignaturas nuevas',
      valor: r.asignaturas_nuevas,
      color: 'indigo',
      icon: 'library_add',
    }
  if (r.grupos_inactivados)
    chips.grupos_inactivados = {
      label: 'Grupos inactivados',
      valor: r.grupos_inactivados,
      color: 'grey',
      icon: 'pause_circle',
    }
  if (r.duplicados_fusionados)
    chips.duplicados_fusionados = {
      label: 'Duplicados fusionados',
      valor: r.duplicados_fusionados,
      color: 'purple',
      icon: 'merge',
    }
  if (r.asignaturas_desvinculadas)
    chips.asignaturas_desvinculadas = {
      label: 'Asignaturas desvinculadas',
      valor: r.asignaturas_desvinculadas,
      color: 'brown',
      icon: 'link_off',
    }
  if (r.conflictos_locales)
    chips.conflictos_locales = {
      label: 'Conflictos locales',
      valor: r.conflictos_locales,
      color: 'deep-orange',
      icon: 'warning',
    }
  return chips
})

// Columnas para tablas del diff
const colsGruposNuevos = [
  { name: 'asignatura', label: 'Asignatura', field: 'asignatura', align: 'left' },
  { name: 'grupo', label: 'Grupo', field: 'grupo', align: 'center' },
  { name: 'docente', label: 'Docente', field: 'docente', align: 'left' },
]
const colsDocenteCambio = [
  { name: 'asignatura', label: 'Asignatura', field: 'asignatura', align: 'left' },
  { name: 'grupo', label: 'Grupo', field: 'grupo', align: 'center' },
  { name: 'docente_antes', label: 'Antes', field: 'docente_antes', align: 'left' },
  { name: 'docente_despues', label: 'Después', field: 'docente_despues', align: 'left' },
]
const colsHorarioCambio = [
  { name: 'asignatura', label: 'Asignatura', field: 'asignatura', align: 'left' },
  { name: 'grupo', label: 'Grupo', field: 'grupo', align: 'center' },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center' },
  { name: 'antes', label: 'Antes', field: 'antes', align: 'left' },
  { name: 'despues', label: 'Después', field: 'despues', align: 'left' },
]
const colsHorariosEliminados = [
  { name: 'asignatura', label: 'Asignatura', field: 'asignatura', align: 'left' },
  { name: 'grupo', label: 'Grupo', field: 'grupo', align: 'center' },
  { name: 'horario', label: 'Horario', field: 'horario', align: 'left' },
]
const colsGruposInactivados = [
  { name: 'asignatura', label: 'Asignatura', field: 'asignatura', align: 'left' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'center' },
  { name: 'grupo', label: 'Grupo', field: 'grupo', align: 'center' },
]
const colsDuplicadosFusionados = [
  {
    name: 'correcta_nombre',
    label: 'Asignatura correcta',
    field: 'correcta_nombre',
    align: 'left',
  },
  {
    name: 'duplicada_nombre',
    label: 'Duplicado eliminado',
    field: 'duplicada_nombre',
    align: 'left',
  },
  {
    name: 'preguntas_migradas',
    label: 'Preguntas migradas',
    field: (row) => row.preguntas?.migradas ?? 0,
    align: 'center',
  },
]
const colsConflictos = [
  { name: 'asignatura', label: 'Asignatura', field: 'asignatura', align: 'left' },
  { name: 'grupo', label: 'Grupo', field: 'grupo', align: 'center' },
  { name: 'campo', label: 'Campo', field: 'campo', align: 'center' },
  { name: 'valor_local', label: 'Valor local', field: 'valor_local', align: 'left' },
  { name: 'valor_api', label: 'Valor API', field: 'valor_api', align: 'left' },
  { name: 'acciones', label: 'Acción', field: 'acciones', align: 'center' },
]

async function verDiff(logId) {
  showDiff.value = true
  loadingDiff.value = true
  diffData.value = null
  tabDiff.value = 'grupos_nuevos'
  try {
    const res = await api.get(`/sync/logs/${logId}/diff`)
    diffData.value = res.data
    // Auto-seleccionar primer tab con datos
    const d = res.data.diff
    if (d?.conflictos_locales?.length) tabDiff.value = 'conflictos_locales'
    else if (d?.grupos_inactivados?.length) tabDiff.value = 'grupos_inactivados'
    else if (d?.duplicados_fusionados?.length) tabDiff.value = 'duplicados_fusionados'
    else if (d?.grupos_nuevos?.length) tabDiff.value = 'grupos_nuevos'
    else if (d?.grupos_docente_cambio?.length) tabDiff.value = 'docente_cambio'
    else if (d?.grupos_horario_cambio?.length) tabDiff.value = 'horario_cambio'
    else if (d?.horarios_eliminados?.length) tabDiff.value = 'horarios_eliminados'
    else if (d?.grupos_eliminados?.length) tabDiff.value = 'grupos_eliminados'
    else if (d?.docentes_nuevos?.length) tabDiff.value = 'docentes_nuevos'
    else if (d?.asignaturas_nuevas?.length) tabDiff.value = 'asignaturas_nuevas'
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar el diff' })
    showDiff.value = false
  } finally {
    loadingDiff.value = false
  }
}

async function resolverConflicto(conflicto, accion) {
  try {
    await api.post('/sync/resolver-conflictos', {
      grupo_id: conflicto.grupo_id,
      accion,
      docente_ci_api: accion === 'aceptar_api' ? conflicto.docente_ci_api : undefined,
    })
    // Quitar el conflicto de la lista local
    if (diffData.value?.diff?.conflictos_locales) {
      diffData.value.diff.conflictos_locales = diffData.value.diff.conflictos_locales.filter(
        (c) => c.grupo_id !== conflicto.grupo_id,
      )
    }
    $q.notify({
      type: 'positive',
      message:
        accion === 'aceptar_api' ? 'Actualizado con datos de la API' : 'Mantenidos datos locales',
    })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al resolver el conflicto' })
  }
}

async function cargarLogs() {
  loadingLogs.value = true
  try {
    const params = { limit: 100 }
    if (filtroSede.value) params.sede_id = filtroSede.value
    if (filtroCarrera.value && filtroCarrera.value !== 'Todas') params.carrera = filtroCarrera.value
    if (filtroModo.value) params.modo = filtroModo.value
    const res = await api.get('/sync/logs', { params })
    logs.value = res.data.logs ?? []
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar historial' })
  } finally {
    loadingLogs.value = false
  }
}

function modoIcon(modo) {
  return (
    { carrera: 'school', sede: 'location_city', materia: 'menu_book', asignatura: 'subject' }[
      modo
    ] ?? 'sync'
  )
}

// Recargar logs al cambiar filtros
watch([filtroSede, filtroCarrera, filtroModo], () => cargarLogs())

// Cargar carreras y asignaturas automaticamente al entrar a la pestaña "Por Asignatura"
watch(tab, async (nuevoTab) => {
  if (nuevoTab === 'asignatura') {
    await cargarCarrerasAsignaturaPorSede()
    await cargarAsignaturas()
  }
})

// Recargar carreras disponibles cuando cambia la sede (en tab asignatura)
watch(selSedeAsignatura, async () => {
  if (tab.value === 'asignatura') {
    selCarreraAsignatura.value = null
    selAsignatura.value = null
    await cargarCarrerasAsignaturaPorSede()
  }
})

// Recargar asignaturas cuando cambia la carrera (en tab asignatura)
watch(selCarreraAsignatura, async () => {
  if (tab.value === 'asignatura') {
    selAsignatura.value = null
    await cargarAsignaturas()
  }
})

// Recargar asignaturas cuando cambia el plan de malla (en tab asignatura)
watch(selPlanAsignatura, async () => {
  if (tab.value === 'asignatura' && selCarreraAsignatura.value) {
    selAsignatura.value = null
    await cargarAsignaturas()
  }
})

onMounted(async () => {
  cargarLogs()
  // Si entramos directamente a la pestaña asignatura, cargar carreras y asignaturas
  if (tab.value === 'asignatura') {
    await cargarCarrerasAsignaturaPorSede()
    await cargarAsignaturas()
  }
})
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3949ab;
}

.stat-box {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px 8px;
  text-align: center;
}
.stat-val {
  font-size: 1.6rem;
  font-weight: 700;
  color: #3949ab;
}
.stat-label {
  font-size: 0.75rem;
  color: #777;
  margin-top: 2px;
}

.carreras-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.carrera-chip {
  display: flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: default;
}
.carrera-ok {
  background: #e8f5e9;
  color: #2e7d32;
}
.carrera-err {
  background: #ffebee;
  color: #c62828;
}
.carrera-sigla {
  margin-right: 4px;
}
.carrera-count {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 0 5px;
  font-size: 0.7rem;
}

/* Tab múltiples carreras */
.carreras-check-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px;
  max-height: 320px;
  overflow-y: auto;
}
.carrera-check-item {
  font-size: 0.78rem;
}
.carrera-pending {
  background: #f5f5f5;
  color: #888;
}
</style>
