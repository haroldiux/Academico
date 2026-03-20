<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="book" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Administración de Asignaturas</span>
        </h4>
        <p class="q-ma-none q-mt-xs" style="color: var(--text-secondary)">
          Crear, editar y eliminar asignaturas (solo SUPER_ADMIN)
        </p>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="Nueva Asignatura"
          @click="openDialog(null)"
          :disable="loading"
        />
      </div>
    </div>

    <!-- Tabla de asignaturas -->
    <q-table
      :rows="asignaturas"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :filter="filter"
      :pagination="pagination"
      class="shadow-1"
    >
      <template #top-right>
        <q-input
          v-model="filter"
          outlined
          dense
          placeholder="Buscar..."
          class="q-mr-sm"
          style="width: 250px"
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template #body-cell-plan_estudios="props">
        <q-td :props="props">
          <q-chip
            :color="props.value === 'A' ? 'blue-2' : 'orange-2'"
            :text-color="props.value === 'A' ? 'blue-9' : 'orange-9'"
            size="sm"
            dense
          >
            {{ props.value === 'A' ? 'Antiguo' : 'Nuevo' }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-modificado_localmente="props">
        <q-td :props="props">
          <q-icon
            :name="props.value ? 'edit' : 'sync'"
            :color="props.value ? 'orange' : 'green'"
            size="sm"
          >
            <q-tooltip>
              {{ props.value ? 'Modificado localmente' : 'Sincronizado con API' }}
            </q-tooltip>
          </q-icon>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="row no-wrap q-gutter-xs">
            <q-btn
              flat
              dense
              icon="edit"
              color="primary"
              @click="openDialog(props.row)"
              size="sm"
            />
            <q-btn
              flat
              dense
              icon="delete"
              color="negative"
              @click="confirmDelete(props.row)"
              size="sm"
            />
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo de creación/edición -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="width: 700px; max-width: 90vw;">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon :name="editing ? 'edit' : 'add'" class="q-mr-sm" />
            {{ editing ? 'Editar Asignatura' : 'Nueva Asignatura' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-form @submit="saveAsignatura" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.codigo"
                  label="Código *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Campo obligatorio']"
                  :disable="editing"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nombre"
                  label="Nombre *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Campo obligatorio']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.carrera_id"
                  :options="carrerasOptions"
                  label="Carrera *"
                  outlined
                  dense
                  map-options
                  emit-value
                  option-value="id"
                  option-label="nombre"
                  :rules="[val => !!val || 'Selecciona una carrera']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.semestre"
                  label="Semestre *"
                  type="number"
                  min="1"
                  max="10"
                  outlined
                  dense
                  :rules="[val => !!val || 'Campo obligatorio']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.creditos"
                  label="Créditos"
                  type="number"
                  min="0"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.horas_teoricas"
                  label="Horas Teóricas"
                  type="number"
                  min="0"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.horas_practicas"
                  label="Horas Prácticas"
                  type="number"
                  min="0"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.plan_estudios"
                  :options="[{ label: 'Nuevo', value: 'N' }, { label: 'Antiguo', value: 'A' }]"
                  label="Plan de Estudios"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="form.activa"
                  label="Activa"
                />
              </div>
            </div>

            <q-card-actions align="right" class="q-mt-lg">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn
                type="submit"
                :color="editing ? 'primary' : 'positive'"
                :label="editing ? 'Actualizar' : 'Crear'"
                :loading="saving"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Diálogo de confirmación de eliminación -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="bg-negative text-white">
          <div class="text-h6">
            <q-icon name="warning" class="q-mr-sm" />
            Confirmar Eliminación
          </div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          ¿Estás seguro de eliminar la asignatura "{{ asignaturaToDelete?.nombre }}"?
          <br>
          <small class="text-grey">Esta acción no se puede deshacer.</small>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            label="Eliminar"
            color="negative"
            @click="deleteAsignatura"
            :loading="deleting"
          />
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

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editing = ref(false)
const filter = ref('')
const form = ref({
  codigo: '',
  nombre: '',
  carrera_id: null,
  semestre: '',
  creditos: 0,
  horas_teoricas: 0,
  horas_practicas: 0,
  plan_estudios: 'N',
  activa: true,
  modificado_localmente: true
})
const asignaturaToDelete = ref(null)

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'carrera_id', label: 'Carrera ID', field: 'carrera_id', align: 'center' },
  { name: 'semestre', label: 'Semestre', field: 'semestre', align: 'center' },
  { name: 'plan_estudios', label: 'Plan', field: 'plan_estudios', align: 'center' },
  { name: 'modificado_localmente', label: 'Modificado', field: 'modificado_localmente', align: 'center' },
  { name: 'activa', label: 'Estado', field: 'activa', align: 'center' },
  { name: 'actions', label: 'Acciones', align: 'center' }
]

const pagination = ref({
  sortBy: 'nombre',
  descending: false,
  page: 1,
  rowsPerPage: 10
})

const asignaturas = computed(() => asignaturasStore.asignaturas)
const carrerasOptions = computed(() => carrerasStore.carrerasActivas.map(c => ({ id: c.id, nombre: c.nombre })))

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    await asignaturasStore.fetchAsignaturas()
    await carrerasStore.fetchCarreras()
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Error cargando datos: ' + error.message
    })
  } finally {
    loading.value = false
  }
}

function openDialog(asignatura) {
  if (asignatura) {
    editing.value = true
    form.value = { ...asignatura }
    // Asegurar que carrera_id sea número
    form.value.carrera_id = asignatura.carrera_id ? Number(asignatura.carrera_id) : null
  } else {
    editing.value = false
    form.value = {
      codigo: '',
      nombre: '',
      carrera_id: null,
      semestre: '',
      creditos: 0,
      horas_teoricas: 0,
      horas_practicas: 0,
      plan_estudios: 'N',
      activa: true,
      modificado_localmente: true
    }
  }
  showDialog.value = true
}

async function saveAsignatura() {
  saving.value = true
  try {
    if (editing.value) {
      await asignaturasStore.updateAsignatura(form.value.id, form.value)
      Notify.create({
        type: 'positive',
        message: 'Asignatura actualizada correctamente'
      })
    } else {
      await asignaturasStore.createAsignatura(form.value)
      Notify.create({
        type: 'positive',
        message: 'Asignatura creada correctamente'
      })
    }
    showDialog.value = false
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Error: ' + (error.response?.data?.message || error.message)
    })
  } finally {
    saving.value = false
  }
}

function confirmDelete(asignatura) {
  asignaturaToDelete.value = asignatura
  showDeleteDialog.value = true
}

async function deleteAsignatura() {
  deleting.value = true
  try {
    await asignaturasStore.deleteAsignatura(asignaturaToDelete.value.id)
    Notify.create({
      type: 'positive',
      message: 'Asignatura eliminada correctamente'
    })
    showDeleteDialog.value = false
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Error: ' + (error.response?.data?.message || error.message)
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
</style>