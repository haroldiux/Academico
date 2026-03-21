<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="school" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Administración de Carreras</span>
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
          label="Nueva Carrera"
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
            <q-input v-model="filter" outlined dense clearable placeholder="Buscar carrera...">
              <template #prepend><q-icon name="search" size="18px" /></template>
            </q-input>
          </div>
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
            >
              <template #prepend><q-icon name="location_city" size="18px" /></template>
            </q-select>
          </div>
          <div class="col-12 col-md-2">
            <q-select
              v-model="filterPlan"
              :options="planesOptions"
              label="Plan Malla"
              outlined
              dense
              clearable
              emit-value
              map-options
            >
              <template #prepend><q-icon name="account_tree" size="18px" /></template>
            </q-select>
          </div>
          <div class="col-12 col-md-2">
            <q-btn
              v-if="hasActiveFilters"
              flat
              color="negative"
              label="Limpiar"
              icon="clear_all"
              @click="clearFilters"
              class="full-width"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla -->
    <q-table
      :rows="carrerasFiltradas"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :filter="filter"
      :pagination="pagination"
      class="shadow-1 carreras-table"
      flat
      bordered
    >
      <template #body-cell-sede_id="props">
        <q-td :props="props">
          <q-chip size="sm" dense color="blue-1" text-color="blue-9">
            {{ sedesMap[props.value] || props.value || '—' }}
          </q-chip>
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

      <template #body-cell-activo="props">
        <q-td :props="props">
          <q-chip
            size="sm"
            dense
            :color="props.value ? 'green-2' : 'grey-3'"
            :text-color="props.value ? 'green-9' : 'grey-7'"
          >
            {{ props.value ? 'Activo' : 'Inactivo' }}
          </q-chip>
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

    <!-- DIÁLOGO CREAR / EDITAR -->
    <q-dialog v-model="showDialog" persistent>
      <q-card
        style="
          width: 820px;
          max-width: 97vw;
          max-height: 94vh;
          display: flex;
          flex-direction: column;
        "
      >
        <q-card-section class="bg-primary text-white q-py-md row items-center">
          <q-icon :name="editing ? 'edit' : 'add'" size="22px" class="q-mr-sm" />
          <span class="text-h6">{{ editing ? 'Editar Carrera' : 'Nueva Carrera' }}</span>
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
        </q-card-section>

        <q-scroll-area style="flex: 1; min-height: 0">
          <q-card-section class="q-pt-md q-px-lg">
            <q-form @submit.prevent="saveCarrera">
              <!-- ─── Identificación ─── -->
              <div class="form-section q-mb-lg">
                <div class="form-section-title row items-center q-mb-md">
                  <q-icon name="badge" color="primary" size="18px" class="q-mr-xs" />
                  <span>Identificación</span>
                </div>
                <div class="row q-col-gutter-md">
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
                  <div class="col-12 col-md-3">
                    <q-input v-model="form.sigla" label="Sigla" outlined dense clearable />
                  </div>
                </div>
              </div>

              <!-- ─── Malla curricular ─── -->
              <div class="form-section q-mb-lg">
                <div class="form-section-title row items-center q-mb-md">
                  <q-icon name="account_tree" color="orange-8" size="18px" class="q-mr-xs" />
                  <span>Malla Curricular</span>
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
                      label="Plan de Malla"
                      outlined
                      dense
                      clearable
                      emit-value
                      map-options
                    >
                      <template #prepend>
                        <q-icon
                          :name="form.plan_estudios === 'A' ? 'history' : 'new_releases'"
                          :color="form.plan_estudios === 'A' ? 'blue-7' : 'orange-7'"
                          size="20px"
                        />
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="form.sede_id"
                      :options="sedesFormOptions"
                      label="Sede"
                      outlined
                      dense
                      clearable
                      map-options
                      emit-value
                      option-value="id"
                      option-label="nombre"
                    >
                      <template #prepend><q-icon name="location_city" size="18px" /></template>
                    </q-select>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-toggle v-model="form.activo" label="Carrera activa" />
                  </div>
                </div>
              </div>

              <!-- ─── Clasificación ─── -->
              <div class="form-section q-mb-lg">
                <div class="form-section-title row items-center q-mb-md">
                  <q-icon name="category" color="purple" size="18px" class="q-mr-xs" />
                  <span>Clasificación y Contexto</span>
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input v-model="form.facultad" label="Facultad" outlined dense clearable />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input v-model="form.area" label="Área" outlined dense clearable />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.codigo_api"
                      label="Código API externo"
                      outlined
                      dense
                      clearable
                      hint="Código usado para sincronización con sistema universitario"
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
            :label="editing ? 'Guardar cambios' : 'Crear Carrera'"
            :loading="saving"
            :disable="!form.nombre || !form.codigo"
            @click="saveCarrera"
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
          <div v-if="carreraToDelete" class="q-pa-sm bg-grey-2 rounded-borders q-mb-sm">
            <div><strong>Código:</strong> {{ carreraToDelete.codigo }}</div>
            <div><strong>Nombre:</strong> {{ carreraToDelete.nombre }}</div>
            <div>
              <strong>Malla:</strong>
              {{
                carreraToDelete.plan_estudios === 'A'
                  ? 'Antigua'
                  : carreraToDelete.plan_estudios === 'N'
                    ? 'Nueva'
                    : 'Sin definir'
              }}
            </div>
          </div>
          ¿Estás seguro de eliminar esta carrera?<br />
          <small class="text-grey">Esta acción no se puede deshacer.</small>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn label="Eliminar" color="negative" @click="deleteCarrera" :loading="deleting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCarrerasStore } from 'src/stores/carreras'
import { useSedesStore } from 'src/stores/sedes'
import { Notify } from 'quasar'

const carrerasStore = useCarrerasStore()
const sedesStore = useSedesStore()

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editing = ref(false)
const filter = ref('')
const filterSede = ref(null)
const filterPlan = ref(null)

const form = ref({
  id: null,
  nombre: '',
  codigo: '',
  sigla: '',
  codigo_api: '',
  plan_estudios: null,
  sede_id: null,
  activo: true,
  facultad: '',
  area: '',
  modificado_localmente: false,
})
const carreraToDelete = ref(null)

const planesOptions = [
  { label: 'Nueva (N)', value: 'N' },
  { label: 'Antigua (A)', value: 'A' },
]

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'sigla', label: 'Sigla', field: 'sigla', align: 'left' },
  { name: 'sede_id', label: 'Sede', field: 'sede_id', align: 'center' },
  { name: 'plan_estudios', label: 'Malla', field: 'plan_estudios', align: 'center' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  {
    name: 'modificado_localmente',
    label: 'Origen',
    field: 'modificado_localmente',
    align: 'center',
  },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

const pagination = ref({ sortBy: 'nombre', descending: false, page: 1, rowsPerPage: 15 })

const sedesOptions = computed(() => sedesStore.sedes.map((s) => ({ label: s.nombre, value: s.id })))
const sedesFormOptions = computed(() =>
  sedesStore.sedes.map((s) => ({ id: s.id, nombre: s.nombre })),
)
const sedesMap = computed(() => {
  const m = {}
  sedesStore.sedes.forEach((s) => {
    m[s.id] = s.nombre
  })
  return m
})
const hasActiveFilters = computed(() => !!filterSede.value || !!filterPlan.value || !!filter.value)

const carrerasFiltradas = computed(() => {
  let list = carrerasStore.carreras
  if (filterSede.value) list = list.filter((c) => c.sede_id == filterSede.value)
  if (filterPlan.value) list = list.filter((c) => c.plan_estudios === filterPlan.value)
  return list
})

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([carrerasStore.fetchCarreras(), sedesStore.fetchSedes()])
  } catch (err) {
    Notify.create({ type: 'negative', message: 'Error: ' + err.message })
  } finally {
    loading.value = false
  }
})

async function loadData() {
  loading.value = true
  try {
    await carrerasStore.fetchCarreras()
  } catch (err) {
    Notify.create({ type: 'negative', message: 'Error: ' + err.message })
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  filterSede.value = null
  filterPlan.value = null
  filter.value = ''
}

function openDialog(carrera) {
  if (carrera) {
    editing.value = true
    form.value = {
      id: carrera.id,
      nombre: carrera.nombre || '',
      codigo: carrera.codigo || '',
      sigla: carrera.sigla || '',
      codigo_api: carrera.codigo_api || '',
      plan_estudios: carrera.plan_estudios || null,
      sede_id: carrera.sede_id ? Number(carrera.sede_id) : null,
      activo: carrera.activo !== false,
      facultad: carrera.facultad || '',
      area: carrera.area || '',
      modificado_localmente: carrera.modificado_localmente,
    }
  } else {
    editing.value = false
    form.value = {
      id: null,
      nombre: '',
      codigo: '',
      sigla: '',
      codigo_api: '',
      plan_estudios: null,
      sede_id: filterSede.value || null,
      activo: true,
      facultad: '',
      area: '',
      modificado_localmente: false,
    }
  }
  showDialog.value = true
}

async function saveCarrera() {
  if (!form.value.nombre?.trim()) {
    Notify.create({ type: 'warning', message: 'Ingresa el nombre' })
    return
  }
  if (!form.value.codigo?.trim()) {
    Notify.create({ type: 'warning', message: 'Ingresa el código' })
    return
  }
  saving.value = true
  try {
    const payload = {
      nombre: form.value.nombre.trim(),
      codigo: form.value.codigo.trim(),
      sigla: form.value.sigla?.trim() || null,
      codigo_api: form.value.codigo_api?.trim() || null,
      plan_estudios: form.value.plan_estudios || null,
      sede_id: form.value.sede_id || null,
      activo: form.value.activo,
      facultad: form.value.facultad?.trim() || null,
      area: form.value.area?.trim() || null,
      modificado_localmente: true,
    }
    if (editing.value) {
      await carrerasStore.updateCarrera(form.value.id, payload)
      Notify.create({ type: 'positive', message: 'Carrera actualizada correctamente' })
    } else {
      await carrerasStore.createCarrera(payload)
      Notify.create({ type: 'positive', message: 'Carrera creada correctamente' })
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

function confirmDelete(c) {
  carreraToDelete.value = c
  showDeleteDialog.value = true
}

async function deleteCarrera() {
  deleting.value = true
  try {
    await carrerasStore.deleteCarrera(carreraToDelete.value.id)
    Notify.create({ type: 'positive', message: 'Carrera eliminada correctamente' })
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
.carreras-table {
  border-radius: 12px;
  overflow: hidden;
}
.carreras-table :deep(th) {
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
