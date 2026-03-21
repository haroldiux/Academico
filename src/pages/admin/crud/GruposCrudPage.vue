<template>
  <q-page class="q-pa-lg">

    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="groups" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Administración de Grupos</span>
        </h4>
        <p class="q-ma-none q-mt-xs text-grey-6">
          Edita directamente los datos locales — los cambios no se sincronizan con la API universitaria
        </p>
      </div>
      <div class="col-auto q-gutter-sm">
        <q-btn outline color="primary" icon="refresh" label="Actualizar" @click="loadData(currentPage)" :loading="loading" />
        <q-btn color="primary" icon="add" label="Nuevo Grupo" @click="openDialog(null)" :disable="loading" />
      </div>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-lg filter-card">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-3">
            <q-select v-model="filterSede" :options="sedesOptions" label="Sede"
              outlined dense clearable emit-value map-options @update:model-value="onSedeChange">
              <template #prepend><q-icon name="location_city" size="18px" /></template>
            </q-select>
          </div>
          <div class="col-12 col-md-3">
            <q-select v-model="filterCarrera" :options="carrerasFilterOptions" label="Carrera"
              outlined dense clearable emit-value map-options :disable="!filterSede"
              @update:model-value="() => loadData(1)">
              <template #prepend><q-icon name="school" size="18px" /></template>
            </q-select>
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="filterTexto" outlined dense clearable
              placeholder="Asignatura, docente, grupo..."
              @update:model-value="onSearchChange">
              <template #prepend><q-icon name="search" size="18px" /></template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select v-model="filterPlan" :options="planesOptions" label="Plan de Malla"
              outlined dense clearable emit-value map-options
              @update:model-value="() => loadData(1)">
              <template #prepend><q-icon name="account_tree" size="18px" /></template>
            </q-select>
          </div>
        </div>
        <div class="row q-mt-sm">
          <q-btn v-if="hasActiveFilters" flat color="negative" label="Limpiar filtros"
            icon="clear_all" @click="clearFilters" size="sm" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla -->
    <q-table
      :rows="grupos" :columns="columns" row-key="id"
      :loading="loading" :pagination="pagination"
      @request="onTableRequest"
      class="shadow-1 grupos-table" flat bordered
    >
      <template #body-cell-asignatura="props">
        <q-td :props="props">
          <div class="col">
            <span class="text-weight-medium" style="color:var(--primary)">{{ props.row.asignatura_nombre }}</span>
            <div class="row q-gutter-xs q-mt-xs">
              <q-chip v-if="props.row.asignatura_codigo" size="xs" dense outline color="grey-6">
                {{ props.row.asignatura_codigo }}
              </q-chip>
              <!-- Plan de la asignatura (referencia) -->
              <q-chip v-if="props.row.asignatura_plan" size="xs" dense
                :color="props.row.asignatura_plan === 'A' ? 'blue-2' : 'orange-2'"
                :text-color="props.row.asignatura_plan === 'A' ? 'blue-9' : 'orange-9'">
                Malla {{ props.row.asignatura_plan === 'A' ? 'Antigua' : 'Nueva' }}
              </q-chip>
            </div>
          </div>
        </q-td>
      </template>

      <template #body-cell-nombre="props">
        <q-td :props="props">
          <q-chip dense outline color="teal" size="sm">{{ props.row.nombre }}</q-chip>
        </q-td>
      </template>

      <template #body-cell-tipo="props">
        <q-td :props="props">
          <q-chip size="sm" dense
            :color="tipoColor(props.value).bg"
            :text-color="tipoColor(props.value).text">
            {{ props.value || '—' }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-plan_estudios="props">
        <q-td :props="props">
          <q-chip v-if="props.value" size="sm" dense
            :color="props.value === 'A' ? 'blue-3' : 'orange-3'"
            :text-color="props.value === 'A' ? 'blue-9' : 'orange-9'">
            {{ props.value === 'A' ? 'Antigua' : 'Nueva' }}
          </q-chip>
          <q-chip v-else size="sm" dense color="grey-3" text-color="grey-7">
            Sin definir
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-estado="props">
        <q-td :props="props">
          <q-chip size="sm" dense
            :color="props.value === 'ACTIVO' ? 'green-2' : props.value === 'INACTIVO' ? 'red-2' : 'grey-3'"
            :text-color="props.value === 'ACTIVO' ? 'green-9' : props.value === 'INACTIVO' ? 'red-9' : 'grey-7'">
            {{ props.value || '—' }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-docente="props">
        <q-td :props="props">
          <div v-if="props.row.docente_nombre" class="row items-center no-wrap">
            <q-icon name="person" size="15px" color="grey-6" class="q-mr-xs" />
            <span>{{ props.row.docente_nombre }}</span>
          </div>
          <span v-else class="text-grey-5 text-caption">Sin docente</span>
        </q-td>
      </template>

      <template #body-cell-sede="props">
        <q-td :props="props">
          <q-chip size="sm" dense color="blue-1" text-color="blue-9">
            {{ props.row.sede_nombre || '—' }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-modificado_localmente="props">
        <q-td :props="props">
          <q-icon :name="props.value ? 'edit_note' : 'cloud_done'"
            :color="props.value ? 'orange-8' : 'green-6'" size="20px">
            <q-tooltip>{{ props.value ? 'Modificado localmente' : 'Sincronizado con API' }}</q-tooltip>
          </q-icon>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="row no-wrap q-gutter-xs">
            <q-btn flat dense round icon="edit" color="primary" size="sm" @click="openDialog(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat dense round icon="delete" color="negative" size="sm" @click="confirmDelete(props.row)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template #no-data>
        <div class="full-width column items-center q-pa-xl">
          <q-icon name="groups" size="48px" color="grey-5" />
          <span class="q-mt-sm text-grey-6">No se encontraron grupos</span>
        </div>
      </template>
    </q-table>


    <!-- ══════════════════════════════════════════════
         DIÁLOGO CREAR / EDITAR
    ══════════════════════════════════════════════ -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="width:860px; max-width:97vw; max-height:94vh; display:flex; flex-direction:column;">

        <q-card-section class="bg-primary text-white q-py-md row items-center">
          <q-icon :name="editing ? 'edit' : 'add'" size="22px" class="q-mr-sm" />
          <span class="text-h6">{{ editing ? 'Editar Grupo' : 'Nuevo Grupo' }}</span>
          <q-space />
          <q-chip v-if="editing && form.modificado_localmente" color="orange-2" text-color="orange-9" dense size="sm">
            <q-icon name="edit_note" size="14px" class="q-mr-xs" />Modificado localmente
          </q-chip>
          <q-chip v-else-if="editing" color="green-2" text-color="green-9" dense size="sm">
            <q-icon name="cloud_done" size="14px" class="q-mr-xs" />Sincronizado API
          </q-chip>
        </q-card-section>

        <q-scroll-area style="flex:1; min-height:0;">
          <q-card-section class="q-pt-md q-px-lg">
            <q-form @submit.prevent="saveGrupo">

              <!-- ─── BLOQUE 1: Asignatura ─── -->
              <div class="form-section q-mb-lg">
                <div class="form-section-title row items-center q-mb-sm">
                  <q-icon name="book" color="primary" size="18px" class="q-mr-xs" />
                  <span>Asignatura</span>
                  <q-space />
                  <q-btn v-if="asigActual" flat dense size="xs" color="primary"
                    icon="swap_horiz" label="Cambiar asignatura" @click="cambiarAsignatura" />
                </div>

                <q-card v-if="asigActual" flat bordered class="bg-blue-1 q-pa-sm">
                  <div class="row items-center q-gutter-sm no-wrap">
                    <q-icon name="book" color="primary" size="20px" />
                    <div class="col">
                      <div class="text-weight-bold">{{ asigActual.nombre }}</div>
                      <div class="row q-gutter-xs q-mt-xs">
                        <q-chip size="xs" dense outline color="grey-7">{{ asigActual.codigo }}</q-chip>
                        <q-chip v-if="asigActual.plan_estudios" size="xs" dense
                          :color="asigActual.plan_estudios === 'A' ? 'blue-2' : 'orange-2'"
                          :text-color="asigActual.plan_estudios === 'A' ? 'blue-9' : 'orange-9'">
                          Malla {{ asigActual.plan_estudios === 'A' ? 'Antigua' : 'Nueva' }}
                        </q-chip>
                      </div>
                    </div>
                  </div>
                </q-card>

                <div v-else>
                  <q-input v-model="busqAsig" outlined dense clearable
                    label="Buscar asignatura por nombre o código *"
                    placeholder="Ej: Cálculo, MATH-101..."
                    :loading="loadingAsig"
                    @update:model-value="onBusqAsig">
                    <template #prepend><q-icon name="search" /></template>
                  </q-input>
                  <q-card v-if="resAsig.length" flat bordered class="res-list q-mt-xs">
                    <q-list separator>
                      <q-item v-for="a in resAsig" :key="a.id" clickable v-ripple @click="elegirAsig(a)">
                        <q-item-section>
                          <q-item-label class="text-weight-bold">{{ a.nombre }}</q-item-label>
                          <q-item-label caption>
                            Código: {{ a.codigo }}
                            <q-chip v-if="a.plan_estudios" size="xs" dense class="q-ml-xs"
                              :color="a.plan_estudios === 'A' ? 'blue-2' : 'orange-2'"
                              :text-color="a.plan_estudios === 'A' ? 'blue-9' : 'orange-9'">
                              Malla {{ a.plan_estudios === 'A' ? 'Antigua' : 'Nueva' }}
                            </q-chip>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card>
                  <div v-else-if="busqAsig && busqAsig.length >= 2 && !loadingAsig"
                    class="text-grey-6 text-caption q-mt-xs q-ml-sm">
                    Sin resultados para "{{ busqAsig }}"
                  </div>
                  <div v-else class="text-grey-5 text-caption q-mt-xs q-ml-sm">
                    Escribe al menos 2 caracteres para buscar
                  </div>
                </div>
              </div>

              <!-- ─── BLOQUE 2: Identificación del grupo ─── -->
              <div class="form-section q-mb-lg" :class="{'section-disabled': !asigActual}">
                <div class="form-section-title row items-center q-mb-md">
                  <q-icon name="label" color="teal" size="18px" class="q-mr-xs" />
                  <span>Identificación del Grupo</span>
                </div>

                <!-- Grupos existentes (solo al crear) -->
                <div v-if="!editing && asigActual && gruposExistentes.length > 0" class="q-mb-md">
                  <div class="text-caption text-grey-6 q-mb-xs">
                    <q-icon name="info" size="14px" class="q-mr-xs" />
                    Grupos ya registrados para esta asignatura:
                  </div>
                  <div class="grupos-existentes-wrap">
                    <q-chip
                      v-for="g in gruposExistentes" :key="g.id"
                      dense size="sm" class="q-mr-xs q-mb-xs"
                      :color="g.tipo === 'TEORICO' ? 'blue-2' : g.tipo === 'PRACTICO' ? 'green-2' : 'orange-2'"
                      :text-color="g.tipo === 'TEORICO' ? 'blue-9' : g.tipo === 'PRACTICO' ? 'green-9' : 'orange-9'"
                    >
                      <q-avatar size="20px" :color="g.tipo === 'TEORICO' ? 'blue-6' : g.tipo === 'PRACTICO' ? 'green-6' : 'orange-6'" text-color="white">
                        {{ g.nombre }}
                      </q-avatar>
                      &nbsp;{{ g.tipo }}&nbsp;·&nbsp;{{ g.docente_nombre || 'Sin docente' }}&nbsp;·&nbsp;{{ g.sede_nombre }}
                    </q-chip>
                  </div>
                  <q-separator class="q-my-sm" />
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-3">
                    <q-input v-model="form.nombre" label="Nombre del grupo *"
                      outlined dense placeholder="A, B, C, 1, 2..."
                      hint="Letras o números"
                      :rules="[v => !!v || 'Obligatorio']" />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-select v-model="form.tipo" :options="tiposGrupo"
                      label="Tipo *" outlined dense emit-value map-options
                      :rules="[v => !!v || 'Obligatorio']" />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-select v-model="form.turno" :options="turnosOptions"
                      label="Turno" outlined dense clearable emit-value map-options />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-select v-model="form.estado" :options="estadosGrupo"
                      label="Estado" outlined dense emit-value map-options />
                  </div>
                </div>
              </div>

              <!-- ─── BLOQUE 3: Malla y Gestión ─── -->
              <div class="form-section q-mb-lg" :class="{'section-disabled': !asigActual}">
                <div class="form-section-title row items-center q-mb-md">
                  <q-icon name="account_tree" color="orange-8" size="18px" class="q-mr-xs" />
                  <span>Malla Curricular y Gestión</span>
                  <q-space />
                  <q-chip dense size="sm" color="orange-1" text-color="orange-9" icon="info">
                    Campo clave — corrige si la API trajo un valor incorrecto
                  </q-chip>
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="form.plan_estudios"
                      :options="[
                        { label: 'Nueva (N) — Plan vigente',  value: 'N' },
                        { label: 'Antigua (A) — Plan anterior', value: 'A' },
                      ]"
                      label="Plan de Malla *"
                      outlined dense emit-value map-options clearable
                    >
                      <template #prepend>
                        <q-icon :name="form.plan_estudios === 'A' ? 'history' : 'new_releases'"
                          :color="form.plan_estudios === 'A' ? 'blue-7' : 'orange-7'" size="20px" />
                      </template>
                      <template #option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section avatar>
                            <q-icon :name="scope.opt.value === 'A' ? 'history' : 'new_releases'"
                              :color="scope.opt.value === 'A' ? 'blue-7' : 'orange-7'" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ scope.opt.label }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input v-model="form.gestion" label="Gestión Académica *"
                      outlined dense placeholder="1-2026"
                      hint="Ej: 1-2026 o 2-2025"
                      :rules="[v => !!v || 'Obligatorio']" />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input v-model.number="form.id_horario_api" label="ID Horario API"
                      type="number" outlined dense clearable
                      hint="ID externo del sistema universitario" />
                  </div>
                </div>
              </div>

              <!-- ─── BLOQUE 4: Docente, Carrera y Sede ─── -->
              <div class="form-section q-mb-lg" :class="{'section-disabled': !asigActual}">
                <div class="form-section-title row items-center q-mb-md">
                  <q-icon name="person" color="purple" size="18px" class="q-mr-xs" />
                  <span>Docente, Carrera y Sede</span>
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="form.docente_id"
                      :options="docentesOptions"
                      label="Docente"
                      outlined dense clearable
                      map-options emit-value option-value="id" option-label="nombre_completo"
                      use-input input-debounce="200"
                      @filter="filterDocentes"
                      hint="Opcional"
                    >
                      <template #prepend><q-icon name="person" size="18px" /></template>
                      <template #option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.nombre_completo }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                      <template #no-option>
                        <q-item><q-item-section class="text-grey">Sin resultados</q-item-section></q-item>
                      </template>
                    </q-select>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="form.carrera_id"
                      :options="carrerasFormOptions"
                      label="Carrera"
                      outlined dense clearable
                      map-options emit-value option-value="id" option-label="nombre"
                      use-input input-debounce="200"
                      @filter="filterCarrerasForm"
                    >
                      <template #prepend><q-icon name="school" size="18px" /></template>
                      <template #no-option>
                        <q-item><q-item-section class="text-grey">Sin resultados</q-item-section></q-item>
                      </template>
                    </q-select>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="form.sede_id"
                      :options="sedesFormOptions"
                      label="Sede"
                      outlined dense clearable
                      map-options emit-value option-value="id" option-label="nombre"
                    >
                      <template #prepend><q-icon name="location_city" size="18px" /></template>
                    </q-select>
                  </div>
                </div>
              </div>

            </q-form>
          </q-card-section>
        </q-scroll-area>

        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            :color="editing ? 'primary' : 'positive'"
            :icon="editing ? 'save' : 'add'"
            :label="editing ? 'Guardar cambios' : 'Crear Grupo'"
            :loading="saving"
            :disable="!asigActual || !form.nombre || !form.tipo || !form.gestion"
            @click="saveGrupo"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>


    <!-- DIÁLOGO ELIMINAR -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card style="min-width:380px">
        <q-card-section class="bg-negative text-white">
          <div class="text-h6"><q-icon name="warning" class="q-mr-sm" />Confirmar Eliminación</div>
        </q-card-section>
        <q-card-section class="q-pt-lg">
          <div v-if="grupoToDelete" class="q-pa-sm bg-grey-2 rounded-borders q-mb-sm">
            <div><strong>Asignatura:</strong> {{ grupoToDelete.asignatura_nombre }}</div>
            <div><strong>Grupo:</strong> {{ grupoToDelete.nombre }} — {{ grupoToDelete.tipo }}</div>
            <div><strong>Malla:</strong> {{ grupoToDelete.plan_estudios === 'A' ? 'Antigua' : grupoToDelete.plan_estudios === 'N' ? 'Nueva' : 'Sin definir' }}</div>
            <div><strong>Docente:</strong> {{ grupoToDelete.docente_nombre || 'Sin docente' }}</div>
            <div><strong>Sede:</strong> {{ grupoToDelete.sede_nombre || '—' }}</div>
          </div>
          ¿Estás seguro de eliminar este grupo?<br>
          <small class="text-grey">Esta acción no se puede deshacer.</small>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn label="Eliminar" color="negative" @click="deleteGrupo" :loading="deleting" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSedesStore }    from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'
import { useDocentesStore } from 'src/stores/docentes'
import { api }              from 'boot/axios'
import { Notify }           from 'quasar'

const sedesStore    = useSedesStore()
const carrerasStore = useCarrerasStore()
const docentesStore = useDocentesStore()

// ── Estado ──
const loading          = ref(false)
const saving           = ref(false)
const deleting         = ref(false)
const showDialog       = ref(false)
const showDeleteDialog = ref(false)
const editing          = ref(false)

// ── Filtros tabla ──
const filterSede    = ref(null)
const filterCarrera = ref(null)
const filterTexto   = ref('')
const filterPlan    = ref(null)

// ── Datos tabla ──
const grupos      = ref([])
const currentPage = ref(1)

// ── Formulario ──
const form = ref({
  id: null, nombre: '', asignatura_id: null,
  docente_id: null, carrera_id: null, sede_id: null,
  gestion: '1-2026', tipo: 'TEORICO', turno: null,
  estado: 'ACTIVO', plan_estudios: null, id_horario_api: null,
  modificado_localmente: false,
})

// ── Asignatura en el diálogo ──
const asigActual   = ref(null)
const busqAsig     = ref('')
const resAsig      = ref([])
const loadingAsig  = ref(false)
let   timerAsig    = null

// ── Grupos existentes de la asignatura (informativo al crear) ──
const gruposExistentes    = ref([])
const loadingGruposExist  = ref(false)

// ── Docentes options ──
const allDocentes = computed(() =>
  docentesStore.docentes.map(d => ({
    id:              d.id,
    nombre_completo: d.nombre_completo || `${d.nombre||''} ${d.apellido_paterno||''}`.trim(),
  }))
)
const docentesOptions = ref([])
function filterDocentes(val, update) {
  update(() => {
    docentesOptions.value = !val ? allDocentes.value
      : allDocentes.value.filter(d => d.nombre_completo.toLowerCase().includes(val.toLowerCase()))
  })
}

// ── Carreras options (con filtro) ──
const allCarreras = computed(() =>
  carrerasStore.carreras.map(c => ({ id: c.id, nombre: c.nombre }))
)
const carrerasFormOptions = ref([])
function filterCarrerasForm(val, update) {
  update(() => {
    carrerasFormOptions.value = !val ? allCarreras.value
      : allCarreras.value.filter(c => c.nombre.toLowerCase().includes(val.toLowerCase()))
  })
}

const grupoToDelete = ref(null)

// ── Constantes ──
const tiposGrupo   = [ { label: 'Teórico',     value: 'TEORICO' }, { label: 'Práctico',    value: 'PRACTICO' }, { label: 'Laboratorio', value: 'LABORATORIO' } ]
const turnosOptions = [ { label: 'Mañana',  value: 'MANANA' }, { label: 'Tarde',   value: 'TARDE' }, { label: 'Noche',   value: 'NOCHE' } ]
const estadosGrupo  = [ { label: 'Activo',   value: 'ACTIVO' }, { label: 'Inactivo', value: 'INACTIVO' }, { label: 'Suspendido', value: 'SUSPENDIDO' } ]
const planesOptions = [ { label: 'Nueva (N)',   value: 'N' }, { label: 'Antigua (A)', value: 'A' } ]

// ── Columnas tabla ──
const columns = [
  { name: 'id',                    label: 'ID',          field: 'id',               align: 'left',   sortable: true },
  { name: 'asignatura',            label: 'Asignatura',  field: 'asignatura_nombre', align: 'left',   sortable: true },
  { name: 'nombre',                label: 'Grupo',       field: 'nombre',           align: 'center', sortable: true },
  { name: 'tipo',                  label: 'Tipo',        field: 'tipo',             align: 'center' },
  { name: 'plan_estudios',         label: 'Malla',       field: 'plan_estudios',    align: 'center' },
  { name: 'estado',                label: 'Estado',      field: 'estado',           align: 'center' },
  { name: 'docente',               label: 'Docente',     field: 'docente_nombre',   align: 'left' },
  { name: 'sede',                  label: 'Sede',        field: 'sede_nombre',      align: 'center' },
  { name: 'gestion',               label: 'Gestión',     field: 'gestion',          align: 'center' },
  { name: 'modificado_localmente', label: 'Origen',      field: 'modificado_localmente', align: 'center' },
  { name: 'actions',               label: 'Acciones',                               align: 'center' },
]

const pagination = ref({ sortBy: 'id', descending: true, page: 1, rowsPerPage: 15, rowsNumber: 0 })

// ── Computed options ──
const sedesOptions = computed(() => sedesStore.sedes.map(s => ({ label: s.nombre, value: s.id })))
const sedesFormOptions = computed(() => sedesStore.sedes.map(s => ({ id: s.id, nombre: s.nombre })))
const carrerasFilterOptions = computed(() => {
  if (!filterSede.value) return []
  return carrerasStore.carreras
    .filter(c => c.sede_id == filterSede.value || (c.sedes_ids && c.sedes_ids.includes(Number(filterSede.value))))
    .map(c => ({ label: c.nombre, value: c.id }))
})
const hasActiveFilters = computed(() => !!filterSede.value || !!filterCarrera.value || !!filterTexto.value || !!filterPlan.value)

function tipoColor(tipo) {
  if (tipo === 'TEORICO')     return { bg: 'blue-2',   text: 'blue-9' }
  if (tipo === 'PRACTICO')    return { bg: 'green-2',  text: 'green-9' }
  if (tipo === 'LABORATORIO') return { bg: 'orange-2', text: 'orange-9' }
  return { bg: 'grey-3', text: 'grey-7' }
}

// ── Carga inicial ──
onMounted(async () => {
  await Promise.all([
    sedesStore.fetchSedes(),
    carrerasStore.fetchCarreras(),
    docentesStore.fetchDocentes(),
  ])
  docentesOptions.value     = allDocentes.value
  carrerasFormOptions.value = allCarreras.value
  await loadData()
})

async function loadData(page = 1) {
  loading.value = true
  try {
    const params = { page, per_page: pagination.value.rowsPerPage }
    if (filterSede.value)    params.sede_id      = filterSede.value
    if (filterCarrera.value) params.carrera_id   = filterCarrera.value
    if (filterTexto.value)   params.search       = filterTexto.value
    if (filterPlan.value)    params.plan_estudios = filterPlan.value
    const resp = await api.get('/grupos-flat', { params })
    grupos.value     = resp.data.data || []
    currentPage.value = resp.data.meta?.current_page || 1
    pagination.value  = { ...pagination.value, page: currentPage.value, rowsNumber: resp.data.meta?.total || 0 }
  } catch (err) {
    Notify.create({ type: 'negative', message: 'Error cargando grupos: ' + err.message })
  } finally {
    loading.value = false
  }
}

function onTableRequest(props) { pagination.value = props.pagination; loadData(props.pagination.page) }

let searchTimer = null
function onSearchChange() { clearTimeout(searchTimer); searchTimer = setTimeout(() => loadData(1), 400) }
function onSedeChange()   { filterCarrera.value = null; loadData(1) }
function clearFilters()   { filterSede.value = null; filterCarrera.value = null; filterTexto.value = ''; filterPlan.value = null; loadData(1) }

// ──────────────────────────────────────────────
// Búsqueda de asignatura
// ──────────────────────────────────────────────
function onBusqAsig(val) {
  clearTimeout(timerAsig); resAsig.value = []
  if (!val || val.length < 2) return
  loadingAsig.value = true
  timerAsig = setTimeout(async () => {
    try {
      const r = await api.get('/asignaturas', { params: { search: val, per_page: 25 } })
      resAsig.value = Array.isArray(r.data) ? r.data : (r.data.data || [])
    } catch { resAsig.value = [] }
    finally  { loadingAsig.value = false }
  }, 300)
}

async function elegirAsig(a) {
  asigActual.value         = { id: a.id, nombre: a.nombre, codigo: a.codigo, plan_estudios: a.plan_estudios }
  form.value.asignatura_id = a.id
  // Heredar plan de la asignatura como sugerencia para el grupo
  if (!editing.value && a.plan_estudios) form.value.plan_estudios = a.plan_estudios
  busqAsig.value = ''; resAsig.value = []
  if (!editing.value) await cargarGruposExistentes(a.id)
}

function cambiarAsignatura() {
  asigActual.value = null; form.value.asignatura_id = null
  gruposExistentes.value = []; busqAsig.value = ''; resAsig.value = []
}

async function cargarGruposExistentes(asignaturaId) {
  loadingGruposExist.value = true; gruposExistentes.value = []
  try {
    const r = await api.get('/grupos-flat', { params: { asignatura_id: asignaturaId, per_page: 100 } })
    gruposExistentes.value = r.data.data || []
  } catch { gruposExistentes.value = [] }
  finally  { loadingGruposExist.value = false }
}

// ──────────────────────────────────────────────
// Abrir diálogo
// ──────────────────────────────────────────────
function openDialog(grupo) {
  docentesOptions.value     = allDocentes.value
  carrerasFormOptions.value = allCarreras.value

  if (grupo) {
    editing.value = true
    asigActual.value = {
      id:            grupo.asignatura_id,
      nombre:        grupo.asignatura_nombre || '—',
      codigo:        grupo.asignatura_codigo || '',
      plan_estudios: grupo.asignatura_plan   || null,
    }
    form.value = {
      id:                    grupo.id,
      nombre:                grupo.nombre          || '',
      asignatura_id:         grupo.asignatura_id,
      docente_id:            grupo.docente_id       ? Number(grupo.docente_id)  : null,
      carrera_id:            grupo.carrera_id       ? Number(grupo.carrera_id)  : null,
      sede_id:               grupo.sede_id          ? Number(grupo.sede_id)     : null,
      gestion:               grupo.gestion          || '1-2026',
      tipo:                  grupo.tipo             || 'TEORICO',
      turno:                 grupo.turno            || null,
      estado:                grupo.estado           || 'ACTIVO',
      plan_estudios:         grupo.plan_estudios    || null,
      id_horario_api:        grupo.id_horario_api   ? Number(grupo.id_horario_api) : null,
      modificado_localmente: grupo.modificado_localmente,
    }
    gruposExistentes.value = []; busqAsig.value = ''; resAsig.value = []
  } else {
    editing.value    = false
    asigActual.value = null
    form.value = {
      id: null, nombre: '', asignatura_id: null,
      docente_id: null,
      carrera_id: filterCarrera.value || null,
      sede_id:    filterSede.value    || null,
      gestion: '1-2026', tipo: 'TEORICO', turno: null,
      estado: 'ACTIVO', plan_estudios: null, id_horario_api: null,
      modificado_localmente: false,
    }
    gruposExistentes.value = []; busqAsig.value = ''; resAsig.value = []
  }
  showDialog.value = true
}

// ──────────────────────────────────────────────
// Guardar
// ──────────────────────────────────────────────
async function saveGrupo() {
  if (!form.value.asignatura_id) { Notify.create({ type: 'warning', message: 'Selecciona una asignatura' }); return }
  if (!form.value.nombre?.trim()) { Notify.create({ type: 'warning', message: 'Ingresa el nombre del grupo (A, B, 1, 2...)' }); return }
  if (!form.value.gestion?.trim()) { Notify.create({ type: 'warning', message: 'Ingresa la gestión (ej: 1-2026)' }); return }

  saving.value = true
  try {
    const payload = {
      nombre:                form.value.nombre.trim(),
      asignatura_id:         form.value.asignatura_id,
      docente_id:            form.value.docente_id    || null,
      carrera_id:            form.value.carrera_id    || null,
      sede_id:               form.value.sede_id       || null,
      gestion:               form.value.gestion.trim(),
      tipo:                  form.value.tipo,
      turno:                 form.value.turno         || null,
      estado:                form.value.estado        || 'ACTIVO',
      plan_estudios:         form.value.plan_estudios || null,
      id_horario_api:        form.value.id_horario_api || null,
      modificado_localmente: true,
    }

    if (editing.value) {
      await api.put(`/grupos/${form.value.id}`, payload)
      Notify.create({ type: 'positive', message: `Grupo "${payload.nombre}" actualizado` })
    } else {
      await api.post('/grupos', payload)
      Notify.create({ type: 'positive', message: `Grupo "${payload.nombre}" creado correctamente` })
    }
    showDialog.value = false
    await loadData(currentPage.value)
  } catch (err) {
    const errData = err.response?.data
    const msg = errData?.message || (errData?.errors ? Object.values(errData.errors).flat().join(' | ') : err.message)
    Notify.create({ type: 'negative', message: 'Error: ' + msg })
  } finally {
    saving.value = false
  }
}

// ──────────────────────────────────────────────
// Eliminar
// ──────────────────────────────────────────────
function confirmDelete(grupo)  { grupoToDelete.value = grupo; showDeleteDialog.value = true }

async function deleteGrupo() {
  deleting.value = true
  try {
    await api.delete(`/grupos/${grupoToDelete.value.id}`)
    Notify.create({ type: 'positive', message: 'Grupo eliminado correctamente' })
    showDeleteDialog.value = false
    await loadData(currentPage.value)
  } catch (err) {
    Notify.create({ type: 'negative', message: 'Error: ' + (err.response?.data?.message || err.message) })
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
.filter-card  { background: var(--bg-secondary); border-color: var(--border-color); border-radius: 12px; }
.grupos-table { border-radius: 12px; overflow: hidden; }
.grupos-table :deep(th) {
  font-weight: 600; font-size: .8rem; text-transform: uppercase; letter-spacing: .5px; color: var(--text-secondary);
}

/* Secciones del formulario */
.form-section {
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 10px;
  padding: 14px 16px;
  background: #fafafa;
}
.form-section.section-disabled { opacity: .5; pointer-events: none; }
.form-section-title {
  font-weight: 600;
  font-size: .9rem;
  color: var(--text-primary, #333);
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

/* Grupos existentes */
.grupos-existentes-wrap { display: flex; flex-wrap: wrap; gap: 4px; }

.res-list { max-height: 200px; overflow-y: auto; }
</style>
