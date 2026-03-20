<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="schedule" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Administración de Horarios</span>
        </h4>
        <p class="q-ma-none q-mt-xs" style="color: var(--text-secondary)">
          Crear, editar y eliminar horarios (solo SUPER_ADMIN)
        </p>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo Horario"
          @click="openDialog(null)"
          :disable="loading"
        />
      </div>
    </div>

    <!-- Tabla de horarios -->
    <q-table
      :rows="horarios"
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

      <template #body-cell-dia="props">
        <q-td :props="props">
          <q-chip
            :color="diaColor(props.value)"
            :text-color="diaTextColor(props.value)"
            size="sm"
            dense
          >
            {{ props.value }}
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
            {{ editing ? 'Editar Horario' : 'Nuevo Horario' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-form @submit="saveHorario" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.grupo_id"
                  :options="gruposOptions"
                  label="Grupo *"
                  outlined
                  dense
                  map-options
                  emit-value
                  option-value="id"
                  option-label="nombre"
                  :rules="[val => !!val || 'Selecciona un grupo']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.aula_id"
                  label="Aula ID"
                  type="number"
                  min="0"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.dia"
                  :options="diasOptions"
                  label="Día *"
                  outlined
                  dense
                  emit-value
                  map-options
                  :rules="[val => !!val || 'Selecciona un día']"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.hora_inicio"
                  label="Hora Inicio *"
                  type="time"
                  outlined
                  dense
                  :rules="[val => !!val || 'Campo obligatorio']"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.hora_fin"
                  label="Hora Fin *"
                  type="time"
                  outlined
                  dense
                  :rules="[val => !!val || 'Campo obligatorio']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.id_horario_api"
                  label="ID Horario API"
                  type="number"
                  min="0"
                  outlined
                  dense
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
          ¿Estás seguro de eliminar este horario?
          <br>
          <small class="text-grey">Esta acción no se puede deshacer.</small>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            label="Eliminar"
            color="negative"
            @click="deleteHorario"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useHorariosStore } from 'src/stores/horarios'
import { useGruposStore } from 'src/stores/grupos'

import { Notify } from 'quasar'

const horariosStore = useHorariosStore()
const gruposStore = useGruposStore()

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editing = ref(false)
const filter = ref('')
const form = ref({
  grupo_id: null,
  aula_id: null,
  dia: '',
  hora_inicio: '',
  hora_fin: '',
  id_horario_api: null,
  modificado_localmente: true
})
const horarioToDelete = ref(null)

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'grupo_id', label: 'Grupo ID', field: 'grupo_id', align: 'center' },
  { name: 'aula_id', label: 'Aula ID', field: 'aula_id', align: 'center' },
  { name: 'dia', label: 'Día', field: 'dia', align: 'center' },
  { name: 'hora_inicio', label: 'Inicio', field: 'hora_inicio', align: 'center' },
  { name: 'hora_fin', label: 'Fin', field: 'hora_fin', align: 'center' },
  { name: 'id_horario_api', label: 'ID API', field: 'id_horario_api', align: 'center' },
  { name: 'modificado_localmente', label: 'Modificado', field: 'modificado_localmente', align: 'center' },
  { name: 'actions', label: 'Acciones', align: 'center' }
]

const pagination = ref({
  sortBy: 'dia',
  descending: false,
  page: 1,
  rowsPerPage: 10
})

const horarios = computed(() => horariosStore.horarios)
const gruposOptions = computed(() => gruposStore.materias.map(g => ({ id: g.id, nombre: g.nombre })))
const diasOptions = [
  { label: 'Lunes', value: 'LUNES' },
  { label: 'Martes', value: 'MARTES' },
  { label: 'Miércoles', value: 'MIERCOLES' },
  { label: 'Jueves', value: 'JUEVES' },
  { label: 'Viernes', value: 'VIERNES' },
  { label: 'Sábado', value: 'SABADO' },
  { label: 'Domingo', value: 'DOMINGO' }
]

function diaColor(dia) {
  const colors = {
    'LUNES': 'blue-2',
    'MARTES': 'green-2',
    'MIERCOLES': 'yellow-2',
    'JUEVES': 'orange-2',
    'VIERNES': 'red-2',
    'SABADO': 'purple-2',
    'DOMINGO': 'grey-2'
  }
  return colors[dia] || 'grey-2'
}

function diaTextColor(dia) {
  const colors = {
    'LUNES': 'blue-9',
    'MARTES': 'green-9',
    'MIERCOLES': 'yellow-9',
    'JUEVES': 'orange-9',
    'VIERNES': 'red-9',
    'SABADO': 'purple-9',
    'DOMINGO': 'grey-9'
  }
  return colors[dia] || 'grey-9'
}

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    await horariosStore.fetchHorarios()
    await gruposStore.fetchGrupos()
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Error cargando datos: ' + error.message
    })
  } finally {
    loading.value = false
  }
}

function openDialog(horario) {
  if (horario) {
    editing.value = true
    form.value = { ...horario }
    // Asegurar que IDs sean números
    form.value.grupo_id = horario.grupo_id ? Number(horario.grupo_id) : null
    form.value.aula_id = horario.aula_id ? Number(horario.aula_id) : null
    form.value.id_horario_api = horario.id_horario_api ? Number(horario.id_horario_api) : null
  } else {
    editing.value = false
    form.value = {
      grupo_id: null,
      aula_id: null,
      dia: '',
      hora_inicio: '',
      hora_fin: '',
      id_horario_api: null,
      modificado_localmente: true
    }
  }
  showDialog.value = true
}

async function saveHorario() {
  saving.value = true
  try {
    if (editing.value) {
      await horariosStore.updateHorario(form.value.id, form.value)
      Notify.create({
        type: 'positive',
        message: 'Horario actualizado correctamente'
      })
    } else {
      await horariosStore.createHorario(form.value)
      Notify.create({
        type: 'positive',
        message: 'Horario creado correctamente'
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

function confirmDelete(horario) {
  horarioToDelete.value = horario
  showDeleteDialog.value = true
}

async function deleteHorario() {
  deleting.value = true
  try {
    await horariosStore.deleteHorario(horarioToDelete.value.id)
    Notify.create({
      type: 'positive',
      message: 'Horario eliminado correctamente'
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