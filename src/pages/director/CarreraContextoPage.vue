<template>
  <q-page class="contexto-page">
    <!-- Header Sticky -->
    <q-header elevated class="bg-white text-primary border-bottom">
      <q-toolbar class="q-py-md">
        <q-btn flat round dense icon="arrow_back" color="grey-8" to="/dashboard" class="q-mr-sm" />

        <div class="column">
          <div class="text-h6 text-weight-bold flex items-center">
            <q-icon name="business" class="q-mr-sm" />
            Información de Carrera
          </div>
          <div class="text-caption text-grey-8">Define la identidad institucional</div>
        </div>

        <q-space />

        <!-- Selector de Carrera (Solo si tiene múltiples) -->
        <div class="carrera-selector" v-if="carrerasDisponibles.length > 1">
          <q-select
            dense
            outlined
            v-model="carreraSeleccionada"
            :options="carrerasDisponibles"
            option-label="nombre"
            option-value="id"
            label="Seleccionar Carrera"
            bg-color="grey-1"
            style="min-width: 250px"
            @update:model-value="cambiarCarrera"
          >
            <template v-slot:prepend>
              <q-icon name="school" color="primary" />
            </template>
          </q-select>
        </div>
        <div
          v-else-if="carreraSeleccionada"
          class="text-subtitle1 text-primary text-weight-medium q-px-md bg-blue-1 rounded-borders"
        >
          {{ carreraSeleccionada.nombre }}
        </div>
      </q-toolbar>
    </q-header>

    <!-- Loading State -->
    <div v-if="loading" class="row justify-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- Form -->
    <div v-else class="content-container q-pt-xl">
      <div class="row q-col-gutter-lg">
        <!-- Área de Desempeño -->
        <div class="col-12">
          <q-card class="section-card">
            <q-card-section>
              <div class="section-header">
                <q-icon name="category" color="indigo" size="24px" />
                <h2 class="section-title">Área de Desempeño</h2>
              </div>
              <p class="section-desc">Campo o sector donde se desenvuelve la carrera</p>
              <q-input
                v-model="form.area"
                outlined
                dense
                placeholder="Ej: Tecnología, Salud, Ciencias Sociales"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Misión -->
        <div class="col-12">
          <q-card class="section-card">
            <q-card-section>
              <div class="section-header">
                <q-icon name="flag" color="orange" size="24px" />
                <h2 class="section-title">Misión</h2>
              </div>
              <p class="section-desc">¿Cuál es la razón de ser de la carrera?</p>
              <q-editor
                v-model="form.mision"
                min-height="150px"
                :toolbar="[
                  ['bold', 'italic', 'underline'],
                  ['unordered', 'ordered'],
                  ['undo', 'redo'],
                ]"
                placeholder="Escribe la misión aquí..."
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Visión -->
        <div class="col-12">
          <q-card class="section-card">
            <q-card-section>
              <div class="section-header">
                <q-icon name="visibility" color="blue" size="24px" />
                <h2 class="section-title">Visión</h2>
              </div>
              <p class="section-desc">¿A dónde quiere llegar la carrera en el futuro?</p>
              <q-editor
                v-model="form.vision"
                min-height="150px"
                :toolbar="[
                  ['bold', 'italic', 'underline'],
                  ['unordered', 'ordered'],
                  ['undo', 'redo'],
                ]"
                placeholder="Escribe la visión aquí..."
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Perfil Profesional -->
        <div class="col-12">
          <q-card class="section-card">
            <q-card-section>
              <div class="section-header">
                <q-icon name="school" color="green" size="24px" />
                <h2 class="section-title">Perfil Profesional</h2>
              </div>
              <p class="section-desc">Competencias y habilidades del egresado</p>
              <q-editor
                v-model="form.perfil_profesional"
                min-height="300px"
                :toolbar="[
                  ['bold', 'italic', 'underline'],
                  ['unordered', 'ordered'],
                  ['undo', 'redo'],
                  ['viewsource'],
                ]"
                placeholder="Describe el perfil profesional..."
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Espacio final para no tapar contenido con el botón -->
      <div class="q-pb-xl" style="height: 80px"></div>
    </div>

    <!-- Sticky Floating Action Button -->
    <q-page-sticky position="bottom-right" :offset="[24, 24]">
      <q-btn
        fab
        icon="save"
        label="Guardar Cambios"
        color="primary"
        :loading="saving"
        @click="guardarContexto"
        class="shadow-4"
      />
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

const loading = ref(true)
const saving = ref(false)
const carreraSeleccionada = ref(null)

const form = ref({
  area: '',
  mision: '',
  vision: '',
  perfil_profesional: '',
})

// Computar carreras disponibles desde el usuario autenticado
const carrerasDisponibles = computed(() => {
  const directorData = authStore.usuarioActual?.director
  if (!directorData) return []

  // Si tiene múltiples carreras asignadas
  if (directorData.carreras && directorData.carreras.length > 0) {
    return directorData.carreras
  }

  // Si tiene una sola carrera asignada
  if (directorData.carrera) {
    return [directorData.carrera]
  }

  return []
})

onMounted(async () => {
  if (carrerasDisponibles.value.length > 0) {
    // Seleccionar la primera por defecto
    carreraSeleccionada.value = carrerasDisponibles.value[0]
    await cargarDatos(carreraSeleccionada.value.id)
  } else {
    loading.value = false
    $q.notify({ type: 'warning', message: 'No se encontraron carreras asignadas.' })
  }
})

async function cambiarCarrera(nuevaCarrera) {
  if (nuevaCarrera?.id) {
    loading.value = true
    await cargarDatos(nuevaCarrera.id)
  }
}

async function cargarDatos(id) {
  try {
    const { data } = await api.get(`/carreras/${id}`)
    form.value.area = data.area || ''
    form.value.mision = data.mision || ''
    form.value.vision = data.vision || ''
    form.value.perfil_profesional = data.perfil_profesional || ''
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error cargando información de la carrera.' })
  } finally {
    loading.value = false
  }
}

async function guardarContexto() {
  if (!carreraSeleccionada.value?.id) return

  saving.value = true
  try {
    await api.put(`/carreras/${carreraSeleccionada.value.id}/contexto`, form.value)
    $q.notify({
      type: 'positive',
      message: 'Información actualizada correctamente',
      icon: 'check_circle',
    })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al guardar cambios.' })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.contexto-page {
  background: var(--bg-primary);
  min-height: 100vh;
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.content-container {
  padding: 24px 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f6;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.section-desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 16px;
}
</style>
