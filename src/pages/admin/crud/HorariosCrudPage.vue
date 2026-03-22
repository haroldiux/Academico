<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="schedule" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Administración de Horarios</span>
        </h4>
        <p class="q-ma-none q-mt-xs" style="color: var(--text-secondary)">
          Gestión completa de horarios académicos
        </p>
      </div>
      <div class="col-auto q-gutter-sm">
        <q-btn
          outline
          color="primary"
          icon="refresh"
          label="Actualizar"
          @click="loadData"
          :loading="loading"
        />
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo Horario"
          @click="openDialog(null)"
          :disable="loading"
        />
      </div>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-lg filter-card">
      <q-card-section>
        <div class="row items-center q-mb-sm">
          <q-icon name="filter_list" size="20px" color="primary" class="q-mr-sm" />
          <span class="text-weight-medium">Filtros</span>
          <q-space />
          <q-btn
            v-if="hasActiveFilters"
            flat
            dense
            size="sm"
            color="negative"
            label="Limpiar filtros"
            icon="clear_all"
            @click="clearFilters"
          />
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-select
              v-model="filterSede"
              :options="sedesOptions"
              label="Sede"
              outlined
              dense
              clearable
              emit-value
              map-options
              @update:model-value="onSedeChange"
            >
              <template #prepend><q-icon name="location_city" size="20px" /></template>
            </q-select>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filterCarrera"
              :options="carrerasFilterOptions"
              label="Carrera"
              outlined
              dense
              clearable
              emit-value
              map-options
              :disable="!filterSede"
              :hint="!filterSede ? 'Selecciona una sede primero' : ''"
            >
              <template #prepend><q-icon name="school" size="20px" /></template>
            </q-select>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filterDia"
              :options="diasOptions"
              label="Día"
              outlined
              dense
              clearable
              emit-value
              map-options
            >
              <template #prepend><q-icon name="today" size="20px" /></template>
            </q-select>
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="filterTexto"
              outlined
              dense
              placeholder="Buscar asignatura, docente, grupo..."
              clearable
            >
              <template #prepend><q-icon name="search" size="20px" /></template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Stats -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="row items-center no-wrap">
            <q-icon name="schedule" size="28px" color="primary" class="q-mr-md" />
            <div>
              <div class="text-h6 text-weight-bold">{{ filteredHorarios.length }}</div>
              <div class="text-caption text-grey-6">Horarios</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="row items-center no-wrap">
            <q-icon name="groups" size="28px" color="teal" class="q-mr-md" />
            <div>
              <div class="text-h6 text-weight-bold">{{ uniqueGrupos }}</div>
              <div class="text-caption text-grey-6">Grupos</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="row items-center no-wrap">
            <q-icon name="menu_book" size="28px" color="orange" class="q-mr-md" />
            <div>
              <div class="text-h6 text-weight-bold">{{ uniqueAsignaturas }}</div>
              <div class="text-caption text-grey-6">Asignaturas</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="row items-center no-wrap">
            <q-icon name="edit" size="28px" color="orange-8" class="q-mr-md" />
            <div>
              <div class="text-h6 text-weight-bold">{{ modifiedCount }}</div>
              <div class="text-caption text-grey-6">Modif. Local</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabla -->
    <q-table
      :rows="filteredHorarios"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      class="shadow-1 horarios-table"
      flat
      bordered
    >
      <template #body-cell-sede="props">
        <q-td :props="props">
          <q-chip size="sm" dense color="blue-1" text-color="blue-9" icon="location_city">
            {{ props.row.grupo?.sede?.nombre || props.row.grupo?.sede_nombre || '—' }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-carrera="props">
        <q-td :props="props">
          <span class="text-weight-medium">
            {{ props.row.grupo?.carrera?.nombre || props.row.grupo?.carrera_nombre || '—' }}
          </span>
        </q-td>
      </template>

      <template #body-cell-asignatura="props">
        <q-td :props="props">
          <span class="text-weight-medium" style="color: var(--primary)">
            {{ props.row.grupo?.asignatura?.nombre || props.row.grupo?.asignatura_nombre || '—' }}
          </span>
        </q-td>
      </template>

      <template #body-cell-grupo="props">
        <q-td :props="props">
          <q-chip size="sm" dense outline color="teal">
            {{ props.row.grupo?.nombre || '—' }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-aula="props">
        <q-td :props="props">
          <div v-if="props.row.aula" class="row items-center no-wrap q-gutter-xs">
            <q-icon name="door_front" size="16px" color="grey-7" />
            <span>{{ props.row.aula.nombre }}</span>
            <q-badge
              v-if="props.row.aula.bloque"
              color="grey-4"
              text-color="grey-8"
              outline
              class="q-ml-xs"
            >
              {{ props.row.aula.bloque.nombre }}
            </q-badge>
          </div>
          <span v-else class="text-grey-5">—</span>
        </q-td>
      </template>

      <template #body-cell-docente="props">
        <q-td :props="props">
          <div v-if="docenteNombreHorario(props.row)" class="row items-center no-wrap">
            <q-icon name="person" size="16px" color="grey-7" class="q-mr-xs" />
            <span>{{ docenteNombreHorario(props.row) }}</span>
          </div>
          <span v-else class="text-grey-5">Sin docente</span>
        </q-td>
      </template>

      <template #body-cell-dia="props">
        <q-td :props="props">
          <q-chip
            :color="diaColor(props.value)"
            :text-color="diaTextColor(props.value)"
            size="sm"
            dense
          >
            {{ formatDia(props.value) }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-horario="props">
        <q-td :props="props">
          <div class="row items-center no-wrap q-gutter-xs">
            <q-icon name="access_time" size="16px" color="grey-7" />
            <span>{{ props.row.hora_inicio }} — {{ props.row.hora_fin }}</span>
          </div>
        </q-td>
      </template>

      <template #body-cell-modificado_localmente="props">
        <q-td :props="props">
          <q-chip
            :color="props.value ? 'orange-1' : 'green-1'"
            :text-color="props.value ? 'orange-9' : 'green-9'"
            :icon="props.value ? 'edit' : 'cloud_done'"
            size="sm"
            dense
          >
            {{ props.value ? 'Local' : 'API' }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="row no-wrap q-gutter-xs">
            <q-btn
              flat
              dense
              round
              icon="edit"
              color="primary"
              size="sm"
              @click="openDialog(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="delete"
              color="negative"
              size="sm"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template #no-data>
        <div class="full-width column items-center q-pa-xl">
          <q-icon name="event_busy" size="48px" color="grey-5" />
          <span class="q-mt-sm text-grey-6">No se encontraron horarios</span>
        </div>
      </template>
    </q-table>

    <!-- ══════════════════════════════════════════════════
         DIÁLOGO CREAR / EDITAR
    ══════════════════════════════════════════════════ -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="width: 780px; max-width: 96vw">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon :name="editing ? 'edit' : 'add'" class="q-mr-sm" />
            {{ editing ? 'Editar Horario' : 'Nuevo Horario' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md q-pb-none">
          <q-form ref="formRef" @submit.prevent="saveHorario">
            <!-- ────────────────────────────────────────
                 PASO 1 — Asignatura
            ──────────────────────────────────────── -->
            <div class="step-block q-mb-md">
              <div class="step-header row items-center q-mb-sm">
                <q-chip color="primary" text-color="white" size="sm" class="q-mr-sm">1</q-chip>
                <span class="text-weight-bold">Asignatura</span>
                <q-space />
                <!-- Botón "Cambiar" cuando ya hay asignatura seleccionada -->
                <q-btn
                  v-if="asignaturaActual"
                  flat
                  dense
                  size="sm"
                  color="primary"
                  icon="swap_horiz"
                  label="Cambiar"
                  @click="cambiarAsignatura"
                />
              </div>

              <!-- Asignatura elegida — preview -->
              <q-card v-if="asignaturaActual" flat bordered class="bg-blue-1 q-pa-sm">
                <div class="row items-center no-wrap q-gutter-sm">
                  <q-icon name="book" color="primary" size="20px" />
                  <div>
                    <div class="text-weight-bold">{{ asignaturaActual.nombre }}</div>
                    <div class="text-caption text-grey-7">
                      Código: {{ asignaturaActual.codigo }}
                    </div>
                  </div>
                </div>
              </q-card>

              <!-- Buscador de asignatura -->
              <div v-else>
                <q-input
                  v-model="busqAsig"
                  outlined
                  dense
                  clearable
                  label="Buscar asignatura por nombre o código *"
                  placeholder="Ej: Cálculo, MATH-101..."
                  :loading="loadingAsig"
                  @update:model-value="onBusqAsig"
                >
                  <template #prepend><q-icon name="search" /></template>
                </q-input>

                <q-card v-if="resAsig.length" flat bordered class="q-mt-xs resultado-list">
                  <q-list separator>
                    <q-item
                      v-for="a in resAsig"
                      :key="a.id"
                      clickable
                      v-ripple
                      @click="elegirAsignatura(a)"
                    >
                      <q-item-section>
                        <q-item-label class="text-weight-bold">{{ a.nombre }}</q-item-label>
                        <q-item-label caption>Código: {{ a.codigo }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-icon name="chevron_right" color="grey-5" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card>
                <div
                  v-else-if="busqAsig && busqAsig.length >= 2 && !loadingAsig"
                  class="text-grey-6 text-caption q-mt-xs q-ml-sm"
                >
                  Sin resultados para "{{ busqAsig }}"
                </div>
                <div v-else class="text-grey-5 text-caption q-mt-xs q-ml-sm">
                  Escribe al menos 2 caracteres para buscar
                </div>
              </div>
            </div>

            <!-- ────────────────────────────────────────
                 PASO 2 — Grupo (depende de la asignatura)
            ──────────────────────────────────────── -->
            <div class="step-block q-mb-md" :class="{ 'step-disabled': !asignaturaActual }">
              <div class="step-header row items-center q-mb-sm">
                <q-chip
                  :color="asignaturaActual ? 'teal' : 'grey-4'"
                  :text-color="asignaturaActual ? 'white' : 'grey-6'"
                  size="sm"
                  class="q-mr-sm"
                  >2</q-chip
                >
                <span class="text-weight-bold" :class="{ 'text-grey-5': !asignaturaActual }">
                  Grupo
                </span>
                <q-space />
                <!-- Botón "Cambiar" cuando ya hay grupo seleccionado -->
                <q-btn
                  v-if="grupoActual && asignaturaActual"
                  flat
                  dense
                  size="sm"
                  color="teal"
                  icon="swap_horiz"
                  label="Cambiar"
                  @click="cambiarGrupo"
                />
              </div>

              <template v-if="asignaturaActual">
                <!-- Grupo elegido — preview -->
                <q-card v-if="grupoActual" flat bordered class="bg-teal-1 q-pa-sm">
                  <div class="row items-center no-wrap q-gutter-sm">
                    <q-icon name="groups" color="teal" size="20px" />
                    <div>
                      <div class="text-weight-bold">Grupo {{ grupoActual.nombre }}</div>
                      <div class="text-caption text-grey-7">
                        <q-icon name="person" size="13px" />
                        {{ grupoActual.docente_nombre || 'Sin docente' }}
                        &nbsp;·&nbsp;
                        <q-icon name="school" size="13px" />
                        {{ grupoActual.carrera_nombre || '—' }}
                        &nbsp;·&nbsp;
                        <q-icon name="location_city" size="13px" />
                        {{ grupoActual.sede_nombre || '—' }}
                      </div>
                    </div>
                    <q-space />
                    <q-chip
                      size="xs"
                      dense
                      :color="grupoActual.tipo === 'TEORICO' ? 'blue-2' : 'green-2'"
                      :text-color="grupoActual.tipo === 'TEORICO' ? 'blue-9' : 'green-9'"
                    >
                      {{ grupoActual.tipo }}
                    </q-chip>
                  </div>
                </q-card>

                <!-- Lista de grupos de esta asignatura -->
                <div v-else>
                  <div v-if="loadingGrupos" class="row justify-center q-py-md">
                    <q-spinner color="teal" size="30px" />
                    <span class="q-ml-sm text-grey-6">Cargando grupos...</span>
                  </div>
                  <template v-else>
                    <q-card v-if="gruposAsignatura.length" flat bordered class="resultado-list">
                      <q-list separator>
                        <q-item
                          v-for="g in gruposAsignatura"
                          :key="g.id"
                          clickable
                          v-ripple
                          @click="elegirGrupo(g)"
                        >
                          <q-item-section avatar>
                            <q-avatar
                              :color="g.tipo === 'TEORICO' ? 'blue-2' : 'green-2'"
                              size="36px"
                            >
                              <span
                                :class="g.tipo === 'TEORICO' ? 'text-blue-9' : 'text-green-9'"
                                class="text-weight-bold text-caption"
                                >{{ g.nombre }}</span
                              >
                            </q-avatar>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>
                              <span class="text-weight-bold">Grupo {{ g.nombre }}</span>
                              <q-chip
                                size="xs"
                                dense
                                outline
                                :color="g.tipo === 'TEORICO' ? 'blue' : 'green'"
                                class="q-ml-xs"
                              >
                                {{ g.tipo }}
                              </q-chip>
                            </q-item-label>
                            <q-item-label caption>
                              <q-icon name="person" size="13px" />
                              {{ g.docente_nombre || 'Sin docente' }}
                              &nbsp;·&nbsp;
                              <q-icon name="school" size="13px" />
                              {{ g.carrera_nombre || '—' }}
                            </q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-icon name="chevron_right" color="grey-5" />
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card>
                    <div v-else class="text-grey-6 text-caption q-mt-xs q-ml-sm">
                      No hay grupos registrados para esta asignatura en la gestión actual
                    </div>
                  </template>
                </div>
              </template>

              <div v-else class="text-grey-5 text-caption q-ml-sm">
                Primero selecciona una asignatura
              </div>
            </div>

            <!-- ────────────────────────────────────────
                 PASO 3 — Horario y Aula
            ──────────────────────────────────────── -->
            <div class="step-block q-mb-md" :class="{ 'step-disabled': !grupoActual }">
              <div class="step-header row items-center q-mb-sm">
                <q-chip
                  :color="grupoActual ? 'orange-8' : 'grey-4'"
                  :text-color="grupoActual ? 'white' : 'grey-6'"
                  size="sm"
                  class="q-mr-sm"
                  >3</q-chip
                >
                <span class="text-weight-bold" :class="{ 'text-grey-5': !grupoActual }">
                  Horario y Aula
                </span>
              </div>

              <template v-if="grupoActual">
                <div class="row q-col-gutter-md">
                  <!-- Día -->
                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="form.dia"
                      :options="diasOptions"
                      label="Día *"
                      outlined
                      dense
                      emit-value
                      map-options
                      :rules="[(v) => !!v || 'Selecciona un día']"
                    />
                  </div>
                  <!-- Hora inicio -->
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="form.hora_inicio"
                      label="Hora Inicio *"
                      type="time"
                      outlined
                      dense
                      :rules="[(v) => !!v || 'Campo obligatorio']"
                    />
                  </div>
                  <!-- Hora fin -->
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="form.hora_fin"
                      label="Hora Fin *"
                      type="time"
                      outlined
                      dense
                      :rules="[(v) => !!v || 'Campo obligatorio']"
                    />
                  </div>
                  <!-- Aula -->
                  <div class="col-12 col-md-8">
                    <q-select
                      v-model="form.aula_id"
                      :options="aulasOptions"
                      label="Aula"
                      outlined
                      dense
                      clearable
                      map-options
                      emit-value
                      option-value="id"
                      option-label="label"
                      use-input
                      input-debounce="200"
                      @filter="filterAulas"
                    >
                      <template #prepend><q-icon name="door_front" size="20px" /></template>
                      <template #option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.label }}</q-item-label>
                            <q-item-label caption>{{ scope.opt.detail }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                      <template #no-option>
                        <q-item
                          ><q-item-section class="text-grey">Sin resultados</q-item-section></q-item
                        >
                      </template>
                    </q-select>
                  </div>
                  <!-- ID API -->
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="form.id_horario_api"
                      label="ID API"
                      type="number"
                      outlined
                      dense
                    />
                  </div>
                </div>
              </template>

              <div v-else class="text-grey-5 text-caption q-ml-sm">
                Primero selecciona la asignatura y el grupo
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            :color="editing ? 'primary' : 'positive'"
            :label="editing ? 'Actualizar' : 'Crear Horario'"
            :loading="saving"
            :disable="!grupoActual || !form.dia || !form.hora_inicio || !form.hora_fin"
            @click="saveHorario"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIÁLOGO ELIMINAR -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="bg-negative text-white">
          <div class="text-h6"><q-icon name="warning" class="q-mr-sm" />Confirmar Eliminación</div>
        </q-card-section>
        <q-card-section class="q-pt-lg">
          <p>¿Estás seguro de eliminar este horario?</p>
          <div v-if="horarioToDelete" class="q-pa-sm bg-grey-2 rounded-borders">
            <div>
              <strong>Asignatura:</strong>
              {{
                horarioToDelete.grupo?.asignatura?.nombre ||
                horarioToDelete.grupo?.asignatura_nombre ||
                '—'
              }}
            </div>
            <div>
              <strong>Grupo:</strong>
              {{ horarioToDelete.grupo?.nombre || horarioToDelete.grupo_id }}
            </div>
            <div>
              <strong>Día / Hora:</strong> {{ formatDia(horarioToDelete.dia) }}
              {{ horarioToDelete.hora_inicio }} - {{ horarioToDelete.hora_fin }}
            </div>
          </div>
          <br /><small class="text-grey">Esta acción no se puede deshacer.</small>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn label="Eliminar" color="negative" @click="deleteHorario" :loading="deleting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHorariosStore } from 'src/stores/horarios'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'
import { useAulasStore } from 'src/stores/aulas'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

const horariosStore = useHorariosStore()
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()
const aulasStore = useAulasStore()

// ── Estado general ──
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editing = ref(false)
const horarioToDelete = ref(null)

// ── Filtros de tabla ──
const filterSede = ref(null)
const filterCarrera = ref(null)
const filterDia = ref(null)
const filterTexto = ref('')

// ── Formulario de horario ──
const form = ref({
  id: null,
  grupo_id: null,
  aula_id: null,
  dia: '',
  hora_inicio: '',
  hora_fin: '',
  id_horario_api: null,
})

// ── Estado del selector en 3 pasos ──

// Paso 1 — Asignatura
const asignaturaActual = ref(null) // { id, nombre, codigo }
const busqAsig = ref('')
const resAsig = ref([])
const loadingAsig = ref(false)
let timerAsig = null

// Paso 2 — Grupo
const grupoActual = ref(null) // objeto completo de /grupos-flat
const gruposAsignatura = ref([]) // lista de grupos de la asignatura elegida
const loadingGrupos = ref(false)

// ── Columnas tabla ──
const columns = [
  {
    name: 'sede',
    label: 'Sede',
    field: (r) => r.grupo?.sede?.nombre || r.grupo?.sede_nombre || '',
    align: 'left',
    sortable: true,
  },
  {
    name: 'carrera',
    label: 'Carrera',
    field: (r) => r.grupo?.carrera?.nombre || r.grupo?.carrera_nombre || '',
    align: 'left',
    sortable: true,
  },
  {
    name: 'asignatura',
    label: 'Asignatura',
    field: (r) => r.grupo?.asignatura?.nombre || r.grupo?.asignatura_nombre || '',
    align: 'left',
    sortable: true,
  },
  {
    name: 'grupo',
    label: 'Grupo',
    field: (r) => r.grupo?.nombre || '',
    align: 'center',
    sortable: true,
  },
  {
    name: 'aula',
    label: 'Aula',
    field: (r) => r.aula?.nombre || '',
    align: 'left',
    sortable: true,
  },
  {
    name: 'docente',
    label: 'Docente',
    field: (r) => docenteNombreHorario(r) || '',
    align: 'left',
    sortable: true,
  },
  { name: 'dia', label: 'Día', field: 'dia', align: 'center', sortable: true },
  {
    name: 'horario',
    label: 'Horario',
    field: (r) => `${r.hora_inicio} - ${r.hora_fin}`,
    align: 'center',
    sortable: true,
  },
  {
    name: 'modificado_localmente',
    label: 'Origen',
    field: 'modificado_localmente',
    align: 'center',
  },
  { name: 'actions', label: 'Acciones', align: 'center' },
]
const pagination = ref({ sortBy: 'sede', descending: false, page: 1, rowsPerPage: 15 })

// ── Opciones filtros ──
const sedesOptions = computed(() => sedesStore.sedes.map((s) => ({ label: s.nombre, value: s.id })))
const carrerasFilterOptions = computed(() => {
  if (!filterSede.value) return []
  return carrerasStore.carreras
    .filter(
      (c) =>
        c.sede_id == filterSede.value ||
        (c.sedes_ids && c.sedes_ids.includes(Number(filterSede.value))),
    )
    .map((c) => ({ label: c.nombre, value: c.id }))
})
const hasActiveFilters = computed(
  () => !!filterSede.value || !!filterCarrera.value || !!filterDia.value || !!filterTexto.value,
)

// ── Horarios filtrados ──
const filteredHorarios = computed(() => {
  let data = horariosStore.horarios || []
  if (filterSede.value) {
    data = data.filter((h) => (h.grupo?.sede?.id ?? h.grupo?.sede_id) == filterSede.value)
  }
  if (filterCarrera.value) {
    data = data.filter((h) => (h.grupo?.carrera?.id ?? h.grupo?.carrera_id) == filterCarrera.value)
  }
  if (filterDia.value) {
    data = data.filter((h) => h.dia === filterDia.value)
  }
  if (filterTexto.value) {
    const n = filterTexto.value.toLowerCase()
    data = data.filter((h) => {
      const asig = (h.grupo?.asignatura?.nombre || h.grupo?.asignatura_nombre || '').toLowerCase()
      const doc = (docenteNombreHorario(h) || '').toLowerCase()
      const grupo = (h.grupo?.nombre || '').toLowerCase()
      return asig.includes(n) || doc.includes(n) || grupo.includes(n)
    })
  }
  return data
})

const uniqueGrupos = computed(() => new Set(filteredHorarios.value.map((h) => h.grupo_id)).size)
const uniqueAsignaturas = computed(
  () =>
    new Set(
      filteredHorarios.value
        .map((h) => h.grupo?.asignatura_id ?? h.grupo?.asignatura?.id)
        .filter(Boolean),
    ).size,
)
const modifiedCount = computed(
  () => filteredHorarios.value.filter((h) => h.modificado_localmente).length,
)

// ── Opciones de aulas (filtradas por sede del grupo elegido) ──
const allAulasOptions = computed(() => {
  const sedeId = grupoActual.value?.sede_id ?? filterSede.value
  const lista = sedeId
    ? aulasStore.aulas.filter((a) => (a.bloque?.sede_id ?? a.bloque?.sede?.id) == sedeId)
    : aulasStore.aulas
  return lista.map((a) => ({
    id: a.id,
    label: a.nombre,
    detail: a.bloque
      ? `Bloque: ${a.bloque.nombre}${a.capacidad ? ' · Cap. ' + a.capacidad : ''}`
      : a.capacidad
        ? `Cap. ${a.capacidad}`
        : '',
  }))
})
const aulasOptions = ref([])
function filterAulas(val, update) {
  update(() => {
    aulasOptions.value = !val
      ? allAulasOptions.value
      : allAulasOptions.value.filter((a) => {
          const n = val.toLowerCase()
          return a.label.toLowerCase().includes(n) || a.detail.toLowerCase().includes(n)
        })
  })
}

// ── Helpers ──
function docenteNombreHorario(h) {
  const d = h?.grupo?.docente
  if (!d) return h?.grupo?.docente_nombre || ''
  return (
    d.nombre_completo ||
    [d.nombre, d.apellido_paterno, d.apellido_materno].filter(Boolean).join(' ')
  )
}

const diasOptions = [
  { label: 'Lunes', value: 'LUNES' },
  { label: 'Martes', value: 'MARTES' },
  { label: 'Miércoles', value: 'MIERCOLES' },
  { label: 'Jueves', value: 'JUEVES' },
  { label: 'Viernes', value: 'VIERNES' },
  { label: 'Sábado', value: 'SABADO' },
  { label: 'Domingo', value: 'DOMINGO' },
]
function formatDia(dia) {
  const m = {
    LUNES: 'Lunes',
    MARTES: 'Martes',
    MIERCOLES: 'Miércoles',
    JUEVES: 'Jueves',
    VIERNES: 'Viernes',
    SABADO: 'Sábado',
    DOMINGO: 'Domingo',
  }
  return m[dia] || dia
}
function diaColor(dia) {
  const c = {
    LUNES: 'blue-2',
    MARTES: 'green-2',
    MIERCOLES: 'amber-2',
    JUEVES: 'orange-2',
    VIERNES: 'red-2',
    SABADO: 'purple-2',
    DOMINGO: 'grey-3',
  }
  return c[dia] || 'grey-2'
}
function diaTextColor(dia) {
  const c = {
    LUNES: 'blue-9',
    MARTES: 'green-9',
    MIERCOLES: 'amber-10',
    JUEVES: 'orange-9',
    VIERNES: 'red-9',
    SABADO: 'purple-9',
    DOMINGO: 'grey-8',
  }
  return c[dia] || 'grey-9'
}

// ──────────────────────────────────────────────
// Paso 1 — Buscar asignatura
// ──────────────────────────────────────────────
function onBusqAsig(val) {
  clearTimeout(timerAsig)
  resAsig.value = []
  if (!val || val.length < 2) return
  loadingAsig.value = true
  timerAsig = setTimeout(async () => {
    try {
      const r = await api.get('/asignaturas', { params: { search: val, per_page: 20 } })
      resAsig.value = Array.isArray(r.data) ? r.data : r.data.data || []
    } catch {
      resAsig.value = []
    } finally {
      loadingAsig.value = false
    }
  }, 300)
}

async function elegirAsignatura(a) {
  asignaturaActual.value = { id: a.id, nombre: a.nombre, codigo: a.codigo }
  busqAsig.value = ''
  resAsig.value = []
  grupoActual.value = null
  gruposAsignatura.value = []
  // Cargar grupos de esta asignatura automáticamente
  await cargarGruposDeAsignatura(a.id)
}

function cambiarAsignatura() {
  asignaturaActual.value = null
  grupoActual.value = null
  gruposAsignatura.value = []
  busqAsig.value = ''
  resAsig.value = []
}

// ──────────────────────────────────────────────
// Paso 2 — Cargar y elegir grupo
// ──────────────────────────────────────────────
async function cargarGruposDeAsignatura(asignaturaId) {
  loadingGrupos.value = true
  gruposAsignatura.value = []
  try {
    const r = await api.get('/grupos-flat', {
      params: { asignatura_id: asignaturaId, per_page: 100 },
    })
    gruposAsignatura.value = r.data.data || []
  } catch {
    gruposAsignatura.value = []
  } finally {
    loadingGrupos.value = false
  }
}

function elegirGrupo(g) {
  grupoActual.value = g
  form.value.grupo_id = g.id
  aulasOptions.value = allAulasOptions.value
}

function cambiarGrupo() {
  grupoActual.value = null
  form.value.grupo_id = null
  // Mantener la asignatura para poder elegir otro grupo de la misma
}

// ──────────────────────────────────────────────
// Carga de datos inicial
// ──────────────────────────────────────────────
onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    await Promise.all([
      horariosStore.fetchHorarios(),
      sedesStore.fetchSedes(),
      carrerasStore.fetchCarreras(),
      aulasStore.fetchAulas(),
    ])
    if (!filterSede.value) {
      const cbba = sedesStore.sedes.find((s) => s.nombre?.toLowerCase().includes('cochabamba'))
      if (cbba) filterSede.value = cbba.id
    }
  } catch (err) {
    Notify.create({ type: 'negative', message: 'Error cargando datos: ' + err.message })
  } finally {
    loading.value = false
  }
}

function onSedeChange() {
  filterCarrera.value = null
}
function clearFilters() {
  filterSede.value = null
  filterCarrera.value = null
  filterDia.value = null
  filterTexto.value = ''
}

// ──────────────────────────────────────────────
// Abrir diálogo
// ──────────────────────────────────────────────
async function openDialog(horario) {
  aulasOptions.value = allAulasOptions.value

  if (horario) {
    editing.value = true

    // Pre-cargar asignatura desde el grupo anidado del horario
    const g = horario.grupo
    if (g) {
      const asig = g.asignatura || {}
      asignaturaActual.value = {
        id: g.asignatura_id || asig.id,
        nombre: asig.nombre || g.asignatura_nombre || '—',
        codigo: asig.codigo || g.asignatura_codigo || '',
      }
      grupoActual.value = {
        id: g.id || horario.grupo_id,
        nombre: g.nombre,
        asignatura_id: g.asignatura_id,
        asignatura_nombre: asig.nombre || g.asignatura_nombre || '—',
        carrera_id: g.carrera_id,
        carrera_nombre: g.carrera?.nombre || g.carrera_nombre || '—',
        docente_id: g.docente_id,
        docente_nombre: docenteNombreHorario(horario) || g.docente_nombre || '—',
        sede_id: g.sede_id,
        sede_nombre: g.sede?.nombre || g.sede_nombre || '—',
        tipo: g.tipo,
      }
      // También cargar los demás grupos de esa asignatura (para poder cambiar)
      if (asignaturaActual.value.id) {
        cargarGruposDeAsignatura(asignaturaActual.value.id)
      }
    } else {
      asignaturaActual.value = null
      grupoActual.value = null
    }

    form.value = {
      id: horario.id,
      grupo_id: horario.grupo_id ? Number(horario.grupo_id) : null,
      aula_id: horario.aula_id ? Number(horario.aula_id) : null,
      dia: horario.dia,
      hora_inicio: horario.hora_inicio ? horario.hora_inicio.substring(0, 5) : '',
      hora_fin: horario.hora_fin ? horario.hora_fin.substring(0, 5) : '',
      id_horario_api: horario.id_horario_api ? Number(horario.id_horario_api) : null,
    }
  } else {
    editing.value = false
    asignaturaActual.value = null
    grupoActual.value = null
    gruposAsignatura.value = []
    busqAsig.value = ''
    resAsig.value = []
    form.value = {
      id: null,
      grupo_id: null,
      aula_id: null,
      dia: '',
      hora_inicio: '',
      hora_fin: '',
      id_horario_api: null,
    }
  }

  showDialog.value = true
}

// ──────────────────────────────────────────────
// Guardar
// ──────────────────────────────────────────────
async function saveHorario() {
  if (!grupoActual.value) {
    Notify.create({ type: 'warning', message: 'Debes seleccionar un grupo' })
    return
  }
  saving.value = true
  try {
    const payload = {
      grupo_id: grupoActual.value.id,
      aula_id: form.value.aula_id || null,
      dia: form.value.dia,
      hora_inicio: form.value.hora_inicio,
      hora_fin: form.value.hora_fin,
      id_horario_api: form.value.id_horario_api || null,
      modificado_localmente: true,
    }
    if (editing.value) {
      await horariosStore.updateHorario(form.value.id, payload)
      Notify.create({ type: 'positive', message: 'Horario actualizado correctamente' })
    } else {
      await horariosStore.createHorario(payload)
      Notify.create({ type: 'positive', message: 'Horario creado correctamente' })
    }
    showDialog.value = false
    await horariosStore.fetchHorarios()
  } catch (err) {
    Notify.create({
      type: 'negative',
      message: 'Error: ' + (err.response?.data?.message || err.message),
    })
  } finally {
    saving.value = false
  }
}

// ──────────────────────────────────────────────
// Eliminar
// ──────────────────────────────────────────────
function confirmDelete(horario) {
  horarioToDelete.value = horario
  showDeleteDialog.value = true
}

async function deleteHorario() {
  deleting.value = true
  try {
    await horariosStore.deleteHorario(horarioToDelete.value.id)
    Notify.create({ type: 'positive', message: 'Horario eliminado correctamente' })
    showDeleteDialog.value = false
  } catch (err) {
    Notify.create({
      type: 'negative',
      message: 'Error: ' + (err.response?.data?.message || err.message),
    })
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.filter-card {
  background: var(--bg-secondary);
  border-color: var(--border-color);
  border-radius: 12px;
}
.stat-card {
  background: var(--bg-secondary);
  border-color: var(--border-color);
  border-radius: 10px;
  transition: transform 0.15s;
}
.stat-card:hover {
  transform: translateY(-2px);
}
.horarios-table {
  border-radius: 12px;
  overflow: hidden;
}
.horarios-table :deep(th) {
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}
.horarios-table :deep(td) {
  font-size: 0.875rem;
}

/* Pasos del diálogo */
.step-block {
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 10px;
  padding: 14px 16px;
  background: #fafafa;
}
.step-block.step-disabled {
  opacity: 0.55;
  pointer-events: none;
}
.step-header {
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 8px;
  margin-bottom: 12px !important;
}
.resultado-list {
  max-height: 220px;
  overflow-y: auto;
}
</style>
