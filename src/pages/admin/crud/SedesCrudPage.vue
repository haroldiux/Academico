<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="apartment" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Administración de Sedes</span>
        </h4>
        <p class="q-ma-none q-mt-xs" style="color: var(--text-secondary)">
          Crear, editar y eliminar sedes (solo SUPER_ADMIN)
        </p>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="Nueva Sede"
          @click="openDialog(null)"
          :disable="loading"
        />
      </div>
    </div>

    <!-- Tabla de sedes -->
    <q-table
      :rows="sedes"
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
      <q-card style="width: 600px; max-width: 90vw;">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon :name="editing ? 'edit' : 'add'" class="q-mr-sm" />
            {{ editing ? 'Editar Sede' : 'Nueva Sede' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-form @submit="saveSede" class="q-gutter-md">
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
                  v-model="form.ciudad"
                  label="Ciudad *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Campo obligatorio']"
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
          ¿Estás seguro de eliminar la sede "{{ sedeToDelete?.nombre }}"?
          <br>
          <small class="text-grey">Esta acción no se puede deshacer.</small>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            label="Eliminar"
            color="negative"
            @click="deleteSede"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSedesStore } from 'src/stores/sedes'
import { Notify } from 'quasar'

const sedesStore = useSedesStore()

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editing = ref(false)
const filter = ref('')
const form = ref({
  nombre: '',
  codigo: '',
  ciudad: '',
  activo: true,
  modificado_localmente: true
})
const sedeToDelete = ref(null)

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'ciudad', label: 'Ciudad', field: 'ciudad', align: 'left' },
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

const sedes = computed(() => sedesStore.sedes)

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    await sedesStore.fetchSedes()
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Error cargando datos: ' + error.message
    })
  } finally {
    loading.value = false
  }
}

function openDialog(sede) {
  if (sede) {
    editing.value = true
    form.value = { ...sede }
  } else {
    editing.value = false
    form.value = {
      nombre: '',
      codigo: '',
      ciudad: '',
      activo: true,
      modificado_localmente: true
    }
  }
  showDialog.value = true
}

async function saveSede() {
  saving.value = true
  try {
    if (editing.value) {
      await sedesStore.updateSede(form.value.id, form.value)
      Notify.create({
        type: 'positive',
        message: 'Sede actualizada correctamente'
      })
    } else {
      await sedesStore.createSede(form.value)
      Notify.create({
        type: 'positive',
        message: 'Sede creada correctamente'
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

function confirmDelete(sede) {
  sedeToDelete.value = sede
  showDeleteDialog.value = true
}

async function deleteSede() {
  deleting.value = true
  try {
    await sedesStore.deleteSede(sedeToDelete.value.id)
    Notify.create({
      type: 'positive',
      message: 'Sede eliminada correctamente'
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