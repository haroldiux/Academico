<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="book" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Administración de Asignaturas</span>
        </h4>
        <p class="q-ma-none q-mt-xs text-grey-6">
          Edita directamente los datos locales — corrige errores de la API sin necesidad de
          sincronizar
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
          label="Nueva Asignatura"
          @click="openDialog(null)"
          :disable="loading"
        />
      </div>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-lg filter-card">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-3">
            <q-input
              v-model="filter"
              outlined
              dense
              clearable
              placeholder="Buscar por nombre o código..."
            >
              <template #prepend><q-icon name="search" size="18px" /></template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filterPlan"
              :options="planesOptions"
              label="Plan de Malla"
              outlined
              dense
              clearable
              emit-value
              map-options
            >
              <template #prepend><q-icon name="account_tree" size="18px" /></template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla -->
    <q-table
      :rows="asignaturas"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :filter="filter"
      :pagination="pagination"
      class="shadow-1 asig-table"
      flat
      bordered
    >
      <template #body-cell-codigo="props">
        <q-td :props="props">
          <code class="text-weight-bold">{{ props.value }}</code>
        </q-td>
      </template>

      <template #body-cell-plan_estudios="props">
        <q-td :props="props">
          <q-chip
            v-if="props.value"
            size="sm"
            dense
            :color="props.value === 'A' ? 'blue-3' : 'orange-3'"
            :text-color="props.value === 'A' ? 'blue-9' : 'orange-9'"
          >
            <q-icon
              :name="props.value === 'A' ? 'history' : 'new_releases'"
              size="14px"
              class="q-mr-xs"
            />
            {{ props.value === 'A' ? 'Antigua' : 'Nueva' }}
          </q-chip>
          <q-chip v-else size="sm" dense color="grey-3" text-color="red-7">
            <q-icon name="warning" size="14px" class="q-mr-xs" />Sin definir
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-estado="props">
        <q-td :props="props">
          <q-chip
            size="sm"
            dense
            :color="
              props.value === 'ACTIVO'
                ? 'green-2'
                : props.value === 'EN_PROCESO'
                  ? 'blue-2'
                  : 'grey-3'
            "
            :text-color="
              props.value === 'ACTIVO'
                ? 'green-9'
                : props.value === 'EN_PROCESO'
                  ? 'blue-9'
                  : 'grey-7'
            "
          >
            {{ props.value || '—' }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-horas="props">
        <q-td :props="props">
          <span class="text-caption"
            >T:{{ props.row.horas_teoricas || 0 }} P:{{ props.row.horas_practicas || 0 }}</span
          >
        </q-td>
      </template>

      <template #body-cell-modificado_localmente="props">
        <q-td :props="props">
          <q-icon
            :name="props.value ? 'edit_note' : 'cloud_done'"
            :color="props.value ? 'orange-8' : 'green-6'"
            size="20px"
          >
            <q-tooltip>{{
              props.value ? 'Modificado localmente' : 'Sincronizado con API'
            }}</q-tooltip>
          </q-icon>
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
    </q-table>

    <!-- ══════════════════════════════════════
         DIÁLOGO CREAR / EDITAR
    ══════════════════════════════════════ -->
    <q-dialog v-model="showDialog" persistent>
      <q-card
        style="
          width: 860px;
          max-width: 97vw;
          max-height: 94vh;
          display: flex;
          flex-direction: column;
        "
      >
        <q-card-section class="bg-primary text-white q-py-md row items-center">
          <q-icon :name="editing ? 'edit' : 'add'" size="22px" class="q-mr-sm" />
          <span class="text-h6">{{ editing ? 'Editar Asignatura' : 'Nueva Asignatura' }}</span>
          <q-space />
          <q-chip
            v-if="editing && form.modificado_localmente"
            color="orange-2"
            text-color="orange-9"
            dense
            size="sm"
          >
            <q-icon name="edit_note" size="14px" class="q-mr-xs" />Modificado localmente
          </q-chip>
          <q-chip v-else-if="editing" color="green-2" text-color="green-9" dense size="sm">
            <q-icon name="cloud_done" size="14px" class="q-mr-xs" />Sincronizado API
          </q-chip>
        </q-card-section>

        <q-scroll-area style="flex: 1; min-height: 0">
          <q-card-section class="q-pt-md q-px-lg">
            <q-form @submit.prevent="saveAsignatura">
              <!-- ─── BLOQUE 1: Identificación ─── -->
              <div class="form-section q-mb-lg">
                <div class="form-section-title row items-center q-mb-md">
                  <q-icon name="badge" color="primary" size="18px" class="q-mr-xs" />
                  <span>Identificación</span>
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-3">
                    <q-input
                      v-model="form.codigo"
                      label="Código *"
                      outlined
                      dense
                      :disable="editing"
                      hint="No editable una vez creado"
                      :rules="[(v) => !!v || 'Obligatorio']"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.nombre"
                      label="Nombre *"
                      outlined
                      dense
                      :rules="[(v) => !!v || 'Obligatorio']"
                    />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input v-model="form.sigla" label="Sigla" outlined dense clearable />
                  </div>
                </div>
              </div>

              <!-- ─── BLOQUE 2: Malla curricular ─── -->
              <div class="form-section q-mb-lg">
                <div class="form-section-title row items-center q-mb-md">
                  <q-icon name="account_tree" color="orange-8" size="18px" class="q-mr-xs" />
                  <span>Malla Curricular y Estado</span>
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
                        { label: 'Nueva (N) — Plan vigente', value: 'N' },
                        { label: 'Antigua (A) — Plan anterior', value: 'A' },
                      ]"
                      label="Plan de Malla *"
                      outlined
                      dense
                      emit-value
                      map-options
                      clearable
                    >
                      <template #prepend>
                        <q-icon
                          :name="form.plan_estudios === 'A' ? 'history' : 'new_releases'"
                          :color="form.plan_estudios === 'A' ? 'blue-7' : 'orange-7'"
                          size="20px"
                        />
                      </template>
                      <template #option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section avatar>
                            <q-icon
                              :name="scope.opt.value === 'A' ? 'history' : 'new_releases'"
                              :color="scope.opt.value === 'A' ? 'blue-7' : 'orange-7'"
                            />
                          </q-item-section>
                          <q-item-section
                            ><q-item-label>{{ scope.opt.label }}</q-item-label></q-item-section
                          >
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="form.estado"
                      :options="[
                        { label: 'Activo', value: 'ACTIVO' },
                        { label: 'En Proceso', value: 'EN_PROCESO' },
                        { label: 'Inactivo', value: 'INACTIVO' },
                        { label: 'Pendiente', value: 'PENDIENTE' },
                      ]"
                      label="Estado"
                      outlined
                      dense
                      emit-value
                      map-options
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="form.modalidad"
                      :options="[
                        { label: 'Presencial', value: 'PRESENCIAL' },
                        { label: 'Semi-presencial', value: 'SEMI_PRESENCIAL' },
                        { label: 'Virtual', value: 'VIRTUAL' },
                      ]"
                      label="Modalidad"
                      outlined
                      dense
                      clearable
                      emit-value
                      map-options
                    />
                  </div>
                </div>
              </div>

              <!-- ─── BLOQUE 3: Carga horaria ─── -->
              <div class="form-section q-mb-lg">
                <div class="form-section-title row items-center q-mb-md">
                  <q-icon name="schedule" color="teal" size="18px" class="q-mr-xs" />
                  <span>Carga Horaria y Créditos</span>
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-6 col-md-2">
                    <q-input
                      v-model.number="form.creditos"
                      label="Créditos"
                      type="number"
                      min="0"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-6 col-md-2">
                    <q-input
                      v-model.number="form.carga_horaria_total"
                      label="Horas Total"
                      type="number"
                      min="0"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-6 col-md-2">
                    <q-input
                      v-model.number="form.horas_teoricas"
                      label="Horas Teóricas"
                      type="number"
                      min="0"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-6 col-md-2">
                    <q-input
                      v-model.number="form.horas_practicas"
                      label="Horas Prácticas"
                      type="number"
                      min="0"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-6 col-md-2">
                    <q-input
                      v-model.number="form.horas_laboratorio"
                      label="Horas Lab."
                      type="number"
                      min="0"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-6 col-md-2">
                    <q-input
                      v-model.number="form.sesiones_semanales"
                      label="Sesiones/Semana"
                      type="number"
                      min="0"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-6 col-md-2">
                    <q-input
                      v-model.number="form.sesiones_semanales_teoricas"
                      label="Ses. Teóricas"
                      type="number"
                      min="0"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-6 col-md-2">
                    <q-input
                      v-model.number="form.sesiones_semanales_practicas"
                      label="Ses. Prácticas"
                      type="number"
                      min="0"
                      outlined
                      dense
                    />
                  </div>
                </div>
              </div>

              <!-- ─── BLOQUE 4: Clasificación ─── -->
              <div class="form-section q-mb-lg">
                <div class="form-section-title row items-center q-mb-md">
                  <q-icon name="category" color="purple" size="18px" class="q-mr-xs" />
                  <span>Clasificación</span>
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="form.area_desempenio"
                      label="Área de Desempeño"
                      outlined
                      dense
                      clearable
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="form.tipo_curso"
                      label="Tipo de Curso"
                      outlined
                      dense
                      clearable
                      placeholder="Ej: Obligatorio, Electivo..."
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="form.requisitos"
                      label="Requisitos (prerrequisitos)"
                      outlined
                      dense
                      clearable
                      placeholder="Ej: MAT-101, QUIM-101..."
                    />
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
            :label="editing ? 'Guardar cambios' : 'Crear Asignatura'"
            :loading="saving"
            :disable="!form.nombre || !form.codigo"
            @click="saveAsignatura"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIÁLOGO ELIMINAR -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card style="min-width: 360px">
        <q-card-section class="bg-negative text-white">
          <div class="text-h6"><q-icon name="warning" class="q-mr-sm" />Confirmar Eliminación</div>
        </q-card-section>
        <q-card-section class="q-pt-lg">
          <div v-if="asignaturaToDelete" class="q-pa-sm bg-grey-2 rounded-borders q-mb-sm">
            <div><strong>Código:</strong> {{ asignaturaToDelete.codigo }}</div>
            <div><strong>Nombre:</strong> {{ asignaturaToDelete.nombre }}</div>
            <div>
              <strong>Malla:</strong>
              {{
                asignaturaToDelete.plan_estudios === 'A'
                  ? 'Antigua'
                  : asignaturaToDelete.plan_estudios === 'N'
                    ? 'Nueva'
                    : 'Sin definir'
              }}
            </div>
          </div>
          ¿Estás seguro? Esta acción eliminará también los grupos y cronogramas asociados.<br />
          <small class="text-grey">Esta acción no se puede deshacer.</small>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn label="Eliminar" color="negative" @click="deleteAsignatura" :loading="deleting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAsignaturasStore } from 'src/stores/asignaturas'
import { useCarrerasStore } from 'src/stores/carreras'
import { Notify } from 'quasar'

const asignaturasStore = useAsignaturasStore()
const carrerasStore = useCarrerasStore()

// ── Estado ──
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editing = ref(false)
const filter = ref('')
const filterPlan = ref(null)

// ── Formulario ──
const form = ref({
  id: null,
  codigo: '',
  sigla: '',
  nombre: '',
  plan_estudios: null,
  estado: 'EN_PROCESO',
  modalidad: null,
  creditos: 0,
  carga_horaria_total: 0,
  horas_teoricas: 0,
  horas_practicas: 0,
  horas_laboratorio: 0,
  sesiones_semanales: 0,
  sesiones_semanales_teoricas: 0,
  sesiones_semanales_practicas: 0,
  area_desempenio: '',
  tipo_curso: '',
  requisitos: '',
  modificado_localmente: false,
})

const asignaturaToDelete = ref(null)

const planesOptions = [
  { label: 'Nueva (N)', value: 'N' },
  { label: 'Antigua (A)', value: 'A' },
]

// ── Columnas ──
const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'plan_estudios', label: 'Malla', field: 'plan_estudios', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'creditos', label: 'Créd.', field: 'creditos', align: 'center' },
  { name: 'horas', label: 'Horas (T/P)', field: 'horas_teoricas', align: 'center' },
  {
    name: 'modificado_localmente',
    label: 'Origen',
    field: 'modificado_localmente',
    align: 'center',
  },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

const pagination = ref({ sortBy: 'nombre', descending: false, page: 1, rowsPerPage: 15 })

// ── Asignaturas filtradas por plan ──
const asignaturas = computed(() => {
  let list = asignaturasStore.asignaturas
  if (filterPlan.value) list = list.filter((a) => a.plan_estudios === filterPlan.value)
  return list
})

// ── Carga inicial ──
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([asignaturasStore.fetchAsignaturas(), carrerasStore.fetchCarreras()])
  } catch (err) {
    Notify.create({ type: 'negative', message: 'Error cargando datos: ' + err.message })
  } finally {
    loading.value = false
  }
})

async function loadData() {
  loading.value = true
  try {
    await asignaturasStore.fetchAsignaturas()
  } catch (err) {
    Notify.create({ type: 'negative', message: 'Error: ' + err.message })
  } finally {
    loading.value = false
  }
}

// ── Abrir diálogo ──
function openDialog(asig) {
  if (asig) {
    editing.value = true
    form.value = {
      id: asig.id,
      codigo: asig.codigo || '',
      sigla: asig.sigla || '',
      nombre: asig.nombre || '',
      plan_estudios: asig.plan_estudios || null,
      estado: asig.estado || 'EN_PROCESO',
      modalidad: asig.modalidad || null,
      creditos: asig.creditos ?? 0,
      carga_horaria_total: asig.carga_horaria_total ?? 0,
      horas_teoricas: asig.horas_teoricas ?? 0,
      horas_practicas: asig.horas_practicas ?? 0,
      horas_laboratorio: asig.horas_laboratorio ?? 0,
      sesiones_semanales: asig.sesiones_semanales ?? 0,
      sesiones_semanales_teoricas: asig.sesiones_semanales_teoricas ?? 0,
      sesiones_semanales_practicas: asig.sesiones_semanales_practicas ?? 0,
      area_desempenio: asig.area_desempenio || '',
      tipo_curso: asig.tipo_curso || '',
      requisitos: asig.requisitos || '',
      modificado_localmente: asig.modificado_localmente,
    }
  } else {
    editing.value = false
    form.value = {
      id: null,
      codigo: '',
      sigla: '',
      nombre: '',
      plan_estudios: null,
      estado: 'EN_PROCESO',
      modalidad: null,
      creditos: 0,
      carga_horaria_total: 0,
      horas_teoricas: 0,
      horas_practicas: 0,
      horas_laboratorio: 0,
      sesiones_semanales: 0,
      sesiones_semanales_teoricas: 0,
      sesiones_semanales_practicas: 0,
      area_desempenio: '',
      tipo_curso: '',
      requisitos: '',
      modificado_localmente: false,
    }
  }
  showDialog.value = true
}

// ── Guardar ──
async function saveAsignatura() {
  if (!form.value.codigo?.trim()) {
    Notify.create({ type: 'warning', message: 'Ingresa el código' })
    return
  }
  if (!form.value.nombre?.trim()) {
    Notify.create({ type: 'warning', message: 'Ingresa el nombre' })
    return
  }

  saving.value = true
  try {
    const payload = {
      codigo: form.value.codigo.trim(),
      sigla: form.value.sigla?.trim() || null,
      nombre: form.value.nombre.trim(),
      plan_estudios: form.value.plan_estudios || null,
      estado: form.value.estado || 'EN_PROCESO',
      modalidad: form.value.modalidad || null,
      creditos: form.value.creditos ?? 0,
      carga_horaria_total: form.value.carga_horaria_total ?? 0,
      horas_teoricas: form.value.horas_teoricas ?? 0,
      horas_practicas: form.value.horas_practicas ?? 0,
      horas_laboratorio: form.value.horas_laboratorio ?? 0,
      sesiones_semanales: form.value.sesiones_semanales ?? 0,
      sesiones_semanales_teoricas: form.value.sesiones_semanales_teoricas ?? 0,
      sesiones_semanales_practicas: form.value.sesiones_semanales_practicas ?? 0,
      area_desempenio: form.value.area_desempenio?.trim() || null,
      tipo_curso: form.value.tipo_curso?.trim() || null,
      requisitos: form.value.requisitos?.trim() || null,
      modificado_localmente: true,
    }

    if (editing.value) {
      await asignaturasStore.updateAsignatura(form.value.id, payload)
      Notify.create({ type: 'positive', message: 'Asignatura actualizada correctamente' })
    } else {
      await asignaturasStore.createAsignatura(payload)
      Notify.create({ type: 'positive', message: 'Asignatura creada correctamente' })
    }
    showDialog.value = false
  } catch (err) {
    const errData = err.response?.data
    const msg =
      errData?.message ||
      (errData?.errors ? Object.values(errData.errors).flat().join(' | ') : err.message)
    Notify.create({ type: 'negative', message: 'Error: ' + msg })
  } finally {
    saving.value = false
  }
}

// ── Eliminar ──
function confirmDelete(asig) {
  asignaturaToDelete.value = asig
  showDeleteDialog.value = true
}

async function deleteAsignatura() {
  deleting.value = true
  try {
    await asignaturasStore.deleteAsignatura(asignaturaToDelete.value.id)
    Notify.create({ type: 'positive', message: 'Asignatura eliminada correctamente' })
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
.asig-table {
  border-radius: 12px;
  overflow: hidden;
}
.asig-table :deep(th) {
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}
.form-section {
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 10px;
  padding: 14px 16px;
  background: #fafafa;
}
.form-section-title {
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
  margin-bottom: 12px;
}
</style>
