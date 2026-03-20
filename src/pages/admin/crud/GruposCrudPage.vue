<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="groups" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Administración de Grupos</span>
        </h4>
        <p class="q-ma-none q-mt-xs" style="color: var(--text-secondary)">
          Crear, editar y eliminar grupos (solo SUPER_ADMIN)
        </p>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo Grupo"
          @click="openDialog(null)"
          :disable="loading"
        />
      </div>
    </div>

    <!-- Tabla de grupos -->
    <q-table
      :rows="grupos"
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

      <template #body-cell-activo="props">
        <q-td :props="props">
          <q-chip
            :color="props.value ? 'green-2' : 'grey-2'"
            :text-color="props.value ? 'green-9' : 'grey-9'"
            size="sm"
            dense
          >
            {{ props.value ? 'Activo' : 'Inactivo' }}
          </q-chip>
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
            {{ editing ? 'Editar Grupo' : 'Nuevo Grupo' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-form @submit="saveGrupo" class="q-gutter-md">
            <div class="row q-col-gutter-md">
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
                  v-model="form.asignatura_id"
                  :options="asignaturasOptions"
                  label="Asignatura *"
                  outlined
                  dense
                  map-options
                  emit-value
                  option-value="id"
                  option-label="nombre"
                  :rules="[val => !!val || 'Selecciona una asignatura']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.docente_id"
                  :options="docentesOptions"
                  label="Docente"
                  outlined
                  dense
                  map-options
                  emit-value
                  option-value="id"
                  option-label="nombre_completo"
                  clearable
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.carrera_id"
                  :options="carrerasOptions"
                  label="Carrera"
                  outlined
                  dense
                  map-options
                  emit-value
                  option-value="id"
                  option-label="nombre"
                  clearable
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.gestion"
                  label="Gestión *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Campo obligatorio']"
                  placeholder="Ej: 1-2026"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.tipo"
                  :options="[{ label: 'Teórico', value: 'TEORICO' }, { label: 'Práctico', value: 'PRACTICO' }, { label: 'Laboratorio', value: 'LABORATORIO' }]"
                  label="Tipo"
                  outlined
                  dense
                  emit-value
                  map-options
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
                  v-model="form.activo"
                  label="Activo"
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
          ¿Estás seguro de eliminar el grupo "{{ grupoToDelete?.nombre }}"?
          <br>
          <small class="text-grey">Esta acción no se puede deshacer.</small>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            label="Eliminar"
            color="negative"
            @click="deleteGrupo"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useGruposStore } from 'src/stores/grupos'
import { useAsignaturasStore } from 'src/stores/asignaturas'
import { useDocentesStore } from 'src/stores/docentes'
import { useCarrerasStore } from 'src/stores/carreras'

import { Notify } from 'quasar'

const gruposStore = useGruposStore()
const asignaturasStore = useAsignaturasStore()
const docentesStore = useDocentesStore()
const carrerasStore = useCarrerasStore()

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editing = ref(false)
const filter = ref('')
const form = ref({
  nombre: '',
  asignatura_id: null,
  docente_id: null,
  carrera_id: null,
  gestion: '',
  tipo: 'TEORICO',
  plan_estudios: 'N',
  activo: true,
  modificado_localmente: true
})
const grupoToDelete = ref(null)

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'asignatura_id', label: 'Asignatura ID', field: 'asignatura_id', align: 'center' },
  { name: 'docente_id', label: 'Docente ID', field: 'docente_id', align: 'center' },
  { name: 'carrera_id', label: 'Carrera ID', field: 'carrera_id', align: 'center' },
  { name: 'gestion', label: 'Gestión', field: 'gestion', align: 'center' },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center' },
  { name: 'plan_estudios', label: 'Plan', field: 'plan_estudios', align: 'center' },
  { name: 'modificado_localmente', label: 'Modificado', field: 'modificado_localmente', align: 'center' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'actions', label: 'Acciones', align: 'center' }
]

const pagination = ref({
  sortBy: 'nombre',
  descending: false,
  page: 1,
  rowsPerPage: 10
})

const grupos = computed(() => gruposStore.materias)
const asignaturasOptions = computed(() => asignaturasStore.asignaturas.map(a => ({ id: a.id, nombre: a.nombre })))
const docentesOptions = computed(() => docentesStore.docentes.map(d => ({ id: d.id, nombre_completo: d.nombre_completo })))
const carrerasOptions = computed(() => carrerasStore.carrerasActivas.map(c => ({ id: c.id, nombre: c.nombre })))

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    await gruposStore.fetchGrupos()
    await asignaturasStore.fetchAsignaturas()
    await docentesStore.fetchDocentes()
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

function openDialog(grupo) {
  if (grupo) {
    editing.value = true
    form.value = { ...grupo }
    // Asegurar que IDs sean números
    form.value.asignatura_id = grupo.asignatura_id ? Number(grupo.asignatura_id) : null
    form.value.docente_id = grupo.docente_id ? Number(grupo.docente_id) : null
    form.value.carrera_id = grupo.carrera_id ? Number(grupo.carrera_id) : null
  } else {
    editing.value = false
    form.value = {
      nombre: '',
      asignatura_id: null,
      docente_id: null,
      carrera_id: null,
      gestion: '',
      tipo: 'TEORICO',
      plan_estudios: 'N',
      activo: true,
      modificado_localmente: true
    }
  }
  showDialog.value = true
}

async function saveGrupo() {
  saving.value = true
  try {
    if (editing.value) {
      await gruposStore.updateGrupo(form.value.id, form.value)
      Notify.create({
        type: 'positive',
        message: 'Grupo actualizado correctamente'
      })
    } else {
      await gruposStore.createGrupo(form.value)
      Notify.create({
        type: 'positive',
        message: 'Grupo creado correctamente'
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

function confirmDelete(grupo) {
  grupoToDelete.value = grupo
  showDeleteDialog.value = true
}

async function deleteGrupo() {
  deleting.value = true
  try {
    await gruposStore.deleteGrupo(grupoToDelete.value.id)
    Notify.create({
      type: 'positive',
      message: 'Grupo eliminado correctamente'
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