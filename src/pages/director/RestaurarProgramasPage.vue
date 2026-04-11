<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-primary text-weight-bold">Restauración de Programas Analíticos (API)</div>
      <q-space />
    </div>

    <!-- Panel de Configuración -->
    <q-card class="bg-white q-mb-lg rounded-borders shadow-2">
      <q-card-section>
        <div class="text-h6 q-mb-sm text-grey-8">1. Origen de Datos</div>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-4">
             <q-select
                v-model="carreraSeleccionada"
                :options="carrerasOpciones"
                option-value="id"
                option-label="nombre"
                label="Seleccionar Carrera"
                outlined
                dense
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="school" />
                </template>
             </q-select>
          </div>
          <div class="col-12 col-md-4">
             <q-input v-model="apiUrl" label="URL Base API Externa" outlined dense>
               <template v-slot:prepend>
                 <q-icon name="language" />
               </template>
               <template v-slot:hint>Ej: http://localhost:8500</template>
             </q-input>
          </div>
          <div class="col-12 col-md-4">
             <q-input v-model="apiToken" label="Token de Autenticación" outlined dense>
               <template v-slot:prepend>
                 <q-icon name="key" />
               </template>
             </q-input>
          </div>
        </div>
        <div class="row justify-end q-mt-md">
          <q-btn
            color="primary"
            icon="cloud_download"
            label="Extraer Asignaturas"
            @click="fetchDesdeApi"
            :loading="loadingFetch"
            :disable="!carreraSeleccionada || !apiUrl"
            unelevated
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Resultados -->
    <q-card v-if="asignaturas.length > 0" class="shadow-2 rounded-borders">
      <q-card-section class="bg-grey-1">
         <div class="text-subtitle1 text-weight-bold text-primary">
           2. Asignaturas Obtenidas ({{ asignaturas.length }})
         </div>
      </q-card-section>

      <q-table
        :rows="asignaturas"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :pagination="{ rowsPerPage: 15 }"
        class="bg-white"
      >
        <template v-slot:body-cell-unidades_count="props">
          <q-td :props="props" class="text-center">
             <q-chip color="blue-1" text-color="blue-8" size="sm" class="text-weight-bold">
                {{ props.row.unidades ? props.row.unidades.length : 0 }} Unidades
             </q-chip>
          </q-td>
        </template>
        
        <template v-slot:body-cell-docentes_count="props">
          <q-td :props="props" class="text-center">
             <q-chip v-if="props.row.docentes && props.row.docentes.length" color="teal-1" text-color="teal-8" size="sm">
                {{ props.row.docentes.length }} Docentes
             </q-chip>
             <span v-else class="text-grey text-caption">Sin docentes</span>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-center">
             <q-btn flat round color="secondary" icon="visibility" @click="verDetalles(props.row)" size="sm">
               <q-tooltip>Ver Detalles del JSON</q-tooltip>
             </q-btn>
             <q-btn flat round color="negative" icon="system_update_alt" @click="confirmarRestauracion(props.row)" size="sm">
               <q-tooltip>Restaurar a Base de Datos Local</q-tooltip>
             </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Ver Detalles -->
    <q-dialog v-model="modalDetalles">
      <q-card style="width: 800px; max-width: 90vw;">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">{{ asignaturaVisualizada?.nombre }} ({{ asignaturaVisualizada?.codigo }})</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="scroll" style="max-height: 65vh;">
          <div v-if="asignaturaVisualizada">
            <q-list bordered separator class="rounded-borders">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Justificación</q-item-label>
                  <q-item-label class="text-body2" style="white-space: pre-wrap;">{{ asignaturaVisualizada.justificacion || 'No disponible' }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

            <div class="text-h6 q-mt-md q-mb-sm text-primary">Unidades ({{ asignaturaVisualizada.unidades?.length || 0 }})</div>
            
            <q-expansion-item
              v-for="(unidad, i) in asignaturaVisualizada.unidades"
              :key="i"
              :label="`Unidad ${unidad.numero}: ${unidad.titulo || 'Sin título'}`"
              header-class="bg-grey-2"
              class="q-mb-sm shadow-1"
            >
              <q-card>
                <q-card-section>
                  <div class="text-subtitle2 q-mb-sm">Temas de esta unidad:</div>
                  <q-list dense bordered separator>
                    <q-item v-for="(tema, j) in unidad.temas" :key="j">
                      <q-item-section>
                        <q-item-label class="text-weight-medium">• {{ tema.titulo }}</q-item-label>
                        <q-item-label caption v-if="tema.planificaciones_personales?.length">
                          Incluye {{ tema.planificaciones_personales.length }} planificación(es) personal(es).
                        </q-item-label>
                        <q-item-label caption v-if="tema.logros_esperados?.length">
                          Incluye {{ tema.logros_esperados.length }} logro(s) esperado(s).
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-1">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
          <q-btn color="negative" icon="system_update_alt" label="Restaurar Asignatura" @click="confirmarRestauracion(asignaturaVisualizada)" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useCarrerasStore } from 'src/stores/carreras'

const $q = useQuasar()
const authStore = useAuthStore()
const carrerasStore = useCarrerasStore()

onMounted(async () => {
  if (carrerasStore.carreras.length === 0) {
    await carrerasStore.fetchCarreras()
  }
})

// Estado
const carreraSeleccionada = ref(null)
const apiUrl = ref('http://localhost:8500')
const apiToken = ref('unitepc-programas-2026')
const asignaturas = ref([])
const loadingFetch = ref(false)

const modalDetalles = ref(false)
const asignaturaVisualizada = ref(null)

// Opciones
const carrerasOpciones = computed(() => {
  // Si es director, usar sus carreras asignadas directas
  const director = authStore.usuarioActual?.director
  if (director) {
    if (director.carreras && director.carreras.length > 0) {
      return director.carreras
    }
    if (director.carrera) {
      return [director.carrera]
    }
  }
  // Fallback: todas las carreras activas
  return carrerasStore.carreras
})

// Auto-seleccionar la primera carrera o la que tiene activa el director
watch(carrerasOpciones, (newOptions) => {
  if (newOptions && newOptions.length > 0 && !carreraSeleccionada.value) {
    carreraSeleccionada.value = newOptions[0].id
  }
}, { immediate: true })

const columns = [
  { name: 'codigo', label: 'Sigla', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Asignatura', field: 'nombre', align: 'left', sortable: true },
  { name: 'plan_estudios', label: 'Plan', field: 'plan_estudios', align: 'left', sortable: true },
  { name: 'unidades_count', label: 'Estructura', align: 'center' },
  { name: 'docentes_count', label: 'Cuerpo Docente', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

const fetchDesdeApi = async () => {
  if (!apiUrl.value) return;
  
  loadingFetch.value = true;
  asignaturas.value = [];
  
  try {
    const urlRequest = `${apiUrl.value.replace(/\/$/, '')}/api/export/documentacion-carrera?carrera_id=${carreraSeleccionada.value}&token=${apiToken.value}`
    const res = await fetch(urlRequest)
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data = await res.json()
    console.log('Datos recibidos de API externa:', data)
    
    let asignaturasExtraidas = [];

    // Variante 1: { status: 'success', data: { asignaturas: [...] } }
    if (data.status === 'success' && data.data && Array.isArray(data.data.asignaturas)) {
       asignaturasExtraidas = data.data.asignaturas;
    } 
    // Variante 2: { data: [...] } (donde data es el arreglo de asignaturas directamente)
    else if (data.data && Array.isArray(data.data)) {
       asignaturasExtraidas = data.data;
    }
    // Variante 3: [...] (array directo)
    else if (Array.isArray(data)) {
       asignaturasExtraidas = data;
    }
    
    if (asignaturasExtraidas.length > 0) {
      asignaturas.value = asignaturasExtraidas;
      $q.notify({ type: 'positive', message: `Se extrajeron ${asignaturas.value.length} asignaturas de la carrera.` })
    } else {
      $q.notify({ type: 'warning', message: 'La respuesta de la API no contiene asignaturas en el formato esperado.' })
    }
  } catch(err) {
    console.error('Error fetching API:', err)
    $q.notify({ type: 'negative', message: 'No se pudo conectar a la API Externa. Verifica la URL o tu red.' })
  } finally {
    loadingFetch.value = false
  }
}

const verDetalles = (asignatura) => {
  asignaturaVisualizada.value = asignatura
  modalDetalles.value = true
}

const confirmarRestauracion = (asignatura) => {
  $q.dialog({
    title: 'Confirmar Sobrescritura Local',
    message: `<p class="text-weight-bold text-negative">¡Atención!</p> Esta acción reemplazará completamente la estructura local de <b>${asignatura.nombre}</b>. Se borrarán temas e indicadores actuales y se crearán los provenientes del JSON.<br><br>¿Deseas proceder?`,
    html: true,
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey-8'
    },
    ok: {
      label: 'Sí, Restaurar',
      color: 'negative',
      unelevated: true
    },
    persistent: true
  }).onOk(() => {
    restaurarAsignaturaLocal(asignatura)
  })
}

const restaurarAsignaturaLocal = async (asignatura) => {
  $q.loading.show({
      message: `Inyectando Programa Analítico de: ${asignatura.nombre}...`
  })
  try {
    // Post to our local laravel backend route
    const response = await api.post('/restauracion/asignatura', asignatura)
    
    if (response.data.status === 'success') {
      $q.notify({ type: 'positive', message: response.data.message || 'Restauración completada con éxito.' })
    } else {
      $q.notify({ type: 'warning', message: response.data.message || 'Problema parcial reportado por el servidor.' })
    }
  } catch (err) {
    console.error('RESTORE ERROR:', err)
    const msg = err.response?.data?.message || err.message
    $q.notify({ type: 'negative', message: `Falló la restauración: ${msg}` })
  } finally {
    $q.loading.hide()
  }
}
</script>

<style scoped>
/* Agrega estilos si son necesarios */
</style>
